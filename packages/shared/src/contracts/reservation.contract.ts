import { ReservationStatus } from '../enums/reservation-status';

export interface CreateReservationRequest {
  eventId: string;
  seatIds: string[];
}

export interface ReservationResponse {
  id: string;
  eventId: string;
  status: ReservationStatus;
  expiresAt: string;
  seatLabels: string[];
}
