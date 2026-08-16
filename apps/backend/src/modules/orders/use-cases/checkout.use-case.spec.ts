import { CheckoutRequest, OrderStatus, ReservationStatus, TicketStatus } from '@app/shared';
import { OrderForbiddenError } from '../errors/order-forbidden.error';
import { PaymentGateway } from '../providers/payment.gateway';
import { CheckoutUseCase } from './checkout.use-case';
import { OrderRecord, OrdersRepository } from '../repositories/orders.repository';
import {
  ReservationRecord,
  ReservationsRepository,
} from '../../reservations/repositories/reservations.repository';

const USER_ID = 'user-id';
const OTHER_USER_ID = 'other-user-id';
const RESERVATION_ID = 'reservation-id';
const ORDER_ID = 'order-id';
const EVENT_ID = 'event-id';

function makeReservation(userId: string = USER_ID): ReservationRecord {
  return {
    id: RESERVATION_ID,
    eventId: EVENT_ID,
    userId,
    status: ReservationStatus.HELD,
    expiresAt: new Date('2026-08-11T12:10:00.000Z'),
    seats: [
      { id: 'seat-a1', label: 'A1' },
      { id: 'seat-a2', label: 'A2' },
    ],
    event: {
      id: EVENT_ID,
      title: 'Show de Exemplo',
      priceCents: 2500,
      startsAt: new Date('2026-08-20T20:00:00.000Z'),
      venue: 'Arena Central',
      status: 'PUBLISHED',
    },
  };
}

function makeOrder(): OrderRecord {
  return {
    id: ORDER_ID,
    eventId: EVENT_ID,
    eventTitle: 'Show de Exemplo',
    userId: USER_ID,
    reservationId: RESERVATION_ID,
    status: OrderStatus.PENDING,
    totalCents: 5000,
    createdAt: new Date('2026-08-11T12:00:00.000Z'),
    seatLabels: ['A1', 'A2'],
    tickets: [
      {
        id: 'ticket-id',
        eventId: EVENT_ID,
        eventTitle: 'Show de Exemplo',
        seatLabel: 'A1',
        status: TicketStatus.VALID,
        code: 'CODE-A1',
        startsAt: new Date('2026-08-20T20:00:00.000Z'),
        venue: 'Arena Central',
      },
    ],
  };
}

describe('CheckoutUseCase', () => {
  const reservations = {
    findById: jest.fn(),
  };
  const orders = {
    createPendingOrder: jest.fn(),
    attachPaymentIntent: jest.fn(),
    deletePendingOrder: jest.fn(),
    releasePendingByReservation: jest.fn(),
  };
  const payments = {
    createPayment: jest.fn(),
  };
  const useCase = new CheckoutUseCase(
    reservations as unknown as ReservationsRepository,
    orders as unknown as OrdersRepository,
    payments as unknown as PaymentGateway,
  );
  const input: CheckoutRequest = { reservationId: RESERVATION_ID };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('cria o pedido pendente, cria o pagamento e retorna o client secret', async () => {
    const reservation = makeReservation();
    const order = makeOrder();
    reservations.findById.mockResolvedValue(reservation);
    orders.createPendingOrder.mockResolvedValue(order);
    payments.createPayment.mockResolvedValue({
      paymentIntentId: 'pi_test_123',
      clientSecret: 'secret_test_123',
    });
    orders.attachPaymentIntent.mockResolvedValue(order);

    await expect(useCase.execute(USER_ID, input)).resolves.toEqual({
      orderId: ORDER_ID,
      clientSecret: 'secret_test_123',
    });

    expect(orders.createPendingOrder).toHaveBeenCalledWith({
      reservationId: RESERVATION_ID,
      eventId: EVENT_ID,
      userId: USER_ID,
      totalCents: 5000,
      now: expect.any(Date),
    });
    expect(payments.createPayment).toHaveBeenCalledWith({
      amountCents: 5000,
      orderId: ORDER_ID,
    });
    expect(orders.attachPaymentIntent).toHaveBeenCalledWith(ORDER_ID, 'pi_test_123');
  });

  it('rejeita a reserva de outro usuário antes de criar pagamento', async () => {
    reservations.findById.mockResolvedValue(makeReservation(OTHER_USER_ID));

    await expect(useCase.execute(USER_ID, input)).rejects.toBeInstanceOf(OrderForbiddenError);

    expect(orders.createPendingOrder).not.toHaveBeenCalled();
    expect(payments.createPayment).not.toHaveBeenCalled();
  });

  it('remove o pedido pendente, libera a reserva e relança a falha do pagamento', async () => {
    const reservation = makeReservation();
    const order = makeOrder();
    const paymentError = new Error('falha do gateway');
    reservations.findById.mockResolvedValue(reservation);
    orders.createPendingOrder.mockResolvedValue(order);
    payments.createPayment.mockRejectedValue(paymentError);

    await expect(useCase.execute(USER_ID, input)).rejects.toBe(paymentError);

    expect(orders.deletePendingOrder).toHaveBeenCalledWith(ORDER_ID);
    expect(orders.releasePendingByReservation).toHaveBeenCalledWith(RESERVATION_ID);
    expect(orders.attachPaymentIntent).not.toHaveBeenCalled();
  });
});
