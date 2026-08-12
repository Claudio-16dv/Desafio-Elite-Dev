import { DomainException } from '../../../common/exceptions/domain.exception';

export class TicketNotFoundError extends DomainException {
  constructor() {
    super('Ingresso não encontrado', 'TICKET_NOT_FOUND', 404);
  }
}
