import { ValidationOutcome } from '../enums/validation-outcome';

export interface ValidateTicketRequest {
  eventId: string;
  token?: string;
  code?: string;
}

export interface ValidationResultResponse {
  outcome: ValidationOutcome;
  ticketId?: string;
  seatLabel?: string;
}
