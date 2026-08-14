'use server';

import type { OrderResponse, ReservationResponse } from '@app/shared';
import { api } from '@/shared/api';
import { checkoutSchema, holdSeatsSchema, releaseReservationSchema } from './schema';

export async function holdSeats(input: unknown): Promise<ReservationResponse> {
  const data = holdSeatsSchema.parse(input);
  return api.post<ReservationResponse>('/reservations', data);
}

export async function checkoutOrder(input: unknown): Promise<OrderResponse> {
  const data = checkoutSchema.parse(input);
  return api.post<OrderResponse>('/orders/checkout', data);
}

export async function releaseReservation(input: unknown): Promise<ReservationResponse> {
  const { reservationId } = releaseReservationSchema.parse(input);
  return api.post<ReservationResponse>(`/reservations/${reservationId}/release`);
}
