'use server';

import type { CheckoutResponse, OrderResponse, ReservationResponse } from '@app/shared';
import { api } from '@/shared/api';
import { getOrderStatus } from './queries';
import {
  checkoutSchema,
  holdSeatsSchema,
  orderStatusSchema,
  releaseReservationSchema,
} from './schema';

export async function holdSeats(input: unknown): Promise<ReservationResponse> {
  const data = holdSeatsSchema.parse(input);
  return api.post<ReservationResponse>('/reservations', data);
}

export async function checkoutOrder(input: unknown): Promise<CheckoutResponse> {
  const data = checkoutSchema.parse(input);
  return api.post<CheckoutResponse>('/orders/checkout', data);
}

export async function checkOrderStatus(input: unknown): Promise<OrderResponse> {
  const { orderId } = orderStatusSchema.parse(input);
  return getOrderStatus(orderId);
}

export async function releaseReservation(input: unknown): Promise<ReservationResponse> {
  const { reservationId } = releaseReservationSchema.parse(input);
  return api.post<ReservationResponse>(`/reservations/${reservationId}/release`);
}
