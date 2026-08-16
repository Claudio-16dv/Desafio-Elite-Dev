import { EventLifecycleStatus, TicketStatus } from '@app/shared';

export interface TicketEventRecord {
  title: string;
  startsAt: Date;
  venue: string;
  status: EventLifecycleStatus;
  organizerId: string;
}

export interface TicketSeatRecord {
  label: string;
}

export interface TicketRecord {
  id: string;
  orderId: string;
  eventId: string;
  userId: string;
  seatId: string;
  status: TicketStatus;
  code: string;
  shareToken: string | null;
  usedAt: Date | null;
  event: TicketEventRecord;
  seat: TicketSeatRecord;
}

export abstract class TicketsRepository {
  abstract findByUserId(userId: string): Promise<TicketRecord[]>;
  abstract findById(id: string): Promise<TicketRecord | null>;
  abstract findByShareToken(shareToken: string): Promise<TicketRecord | null>;
  abstract findByCode(code: string): Promise<TicketRecord | null>;
  abstract setShareToken(id: string, shareToken: string): Promise<TicketRecord>;
  abstract markUsedIfValid(id: string, now: Date): Promise<number>;
}
