import { Injectable } from '@nestjs/common';
import { CheckoutRequest, CheckoutResponse } from '@app/shared';
import { ReservationNotFoundError } from '../../reservations/errors/reservation-not-found.error';
import { ReservationsRepository } from '../../reservations/repositories/reservations.repository';
import { OrderForbiddenError } from '../errors/order-forbidden.error';
import { PaymentGateway } from '../providers/payment.gateway';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class CheckoutUseCase {
  constructor(
    private readonly reservations: ReservationsRepository,
    private readonly orders: OrdersRepository,
    private readonly payments: PaymentGateway,
  ) {}

  async execute(userId: string, input: CheckoutRequest): Promise<CheckoutResponse> {
    const reservation = await this.reservations.findById(input.reservationId);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }
    if (reservation.userId !== userId) {
      throw new OrderForbiddenError();
    }

    const order = await this.orders.createPendingOrder({
      reservationId: reservation.id,
      eventId: reservation.eventId,
      userId,
      totalCents: reservation.event.priceCents * reservation.seats.length,
      now: new Date(),
    });

    try {
      const payment = await this.payments.createPayment({
        amountCents: order.totalCents,
        orderId: order.id,
      });
      await this.orders.attachPaymentIntent(order.id, payment.paymentIntentId);
      return {
        orderId: order.id,
        clientSecret: payment.clientSecret,
      };
    } catch (error) {
      try {
        await this.orders.deletePendingOrder(order.id);
        await this.orders.releasePendingByReservation(order.reservationId);
      } catch {
        // Preserve the original payment error without logging secrets or payloads.
      }
      throw error;
    }
  }
}
