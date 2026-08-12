import { Injectable } from '@nestjs/common';
import { CheckoutRequest, OrderResponse } from '@app/shared';
import { ReservationEntity } from '../../reservations/entities/reservation.entity';
import { ReservationNotFoundError } from '../../reservations/errors/reservation-not-found.error';
import { ReservationsRepository } from '../../reservations/repositories/reservations.repository';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { OrderForbiddenError } from '../errors/order-forbidden.error';
import { toOrderResponse } from '../order-response.mapper';
import { PaymentGateway } from '../providers/payment.gateway';
import { OrdersRepository } from '../repositories/orders.repository';
import { generateTicketCode } from '../ticket-code';

@Injectable()
export class CheckoutUseCase {
  constructor(
    private readonly reservations: ReservationsRepository,
    private readonly orders: OrdersRepository,
    private readonly payments: PaymentGateway,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(userId: string, input: CheckoutRequest): Promise<OrderResponse> {
    const reservation = await this.reservations.findById(input.reservationId);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }
    if (reservation.userId !== userId) {
      throw new OrderForbiddenError();
    }

    const now = new Date();
    const reservationEntity = new ReservationEntity(
      reservation.id,
      reservation.userId,
      reservation.status,
      reservation.expiresAt,
    );
    reservationEntity.confirm(now);

    const totalCents = reservation.event.priceCents * reservation.seats.length;
    const payment = await this.payments.charge({
      amountCents: totalCents,
      outcome: input.simulateOutcome ?? 'approve',
    });

    if (!payment.approved) {
      const refused = await this.orders.createRefusedOrderAndRelease({
        reservationId: reservation.id,
        eventId: reservation.eventId,
        userId,
        totalCents,
        now,
      });
      return toOrderResponse(refused, this.qrSigner);
    }

    const paid = await this.orders.createPaidOrderWithTickets({
      reservationId: reservation.id,
      eventId: reservation.eventId,
      userId,
      totalCents,
      now,
      tickets: reservation.seats.map((seat) => ({
        seatId: seat.id,
        code: generateTicketCode(),
      })),
    });
    return toOrderResponse(paid, this.qrSigner);
  }
}
