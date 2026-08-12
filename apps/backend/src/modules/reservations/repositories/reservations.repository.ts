import { ReservationStatus } from '@app/shared';

export interface ReservationSeatRecord {
  id: string;
  label: string;
}

export interface ReservationEventRecord {
  id: string;
  title: string;
  priceCents: number;
  startsAt: Date;
  venue: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
}

export interface ReservationRecord {
  id: string;
  eventId: string;
  userId: string;
  status: ReservationStatus;
  expiresAt: Date;
  seats: ReservationSeatRecord[];
  event: ReservationEventRecord;
}

export interface HoldSeatsInput {
  eventId: string;
  userId: string;
  seatIds: string[];
  ttlMinutes: number;
}

export abstract class ReservationsRepository {
  abstract holdSeats(input: HoldSeatsInput): Promise<ReservationRecord>;
  abstract findById(id: string): Promise<ReservationRecord | null>;
  abstract release(id: string): Promise<ReservationRecord>;
}
