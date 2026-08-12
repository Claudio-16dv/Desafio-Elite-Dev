import { DomainException } from '../../../common/exceptions/domain.exception';

export class TicketForbiddenError extends DomainException {
  constructor() {
    super('Você não pode acessar este ingresso', 'FORBIDDEN_ACTION', 403);
  }
}
