import { DomainException } from '../../../common/exceptions/domain.exception';

export class TicketEventCancelledError extends DomainException {
  constructor() {
    super('Ingresso indisponível porque o evento foi cancelado', 'TICKET_EVENT_CANCELLED', 409);
  }
}
