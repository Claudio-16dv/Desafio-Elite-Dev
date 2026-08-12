import { TicketStatus } from '../enums/ticket-status';

export interface TicketResponse {
  id: string;
  eventId: string;
  eventTitle: string;
  seatLabel: string;
  status: TicketStatus;
  code: string;
  qrToken: string;
  startsAt: string;
  venue: string;
}

export interface SharedTicketResponse extends TicketResponse {}

export interface ShareLinkResponse {
  shareToken: string;
  url: string;
}
