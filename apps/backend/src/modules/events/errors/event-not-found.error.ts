import { DomainException } from '../../../common/exceptions/domain.exception';

export class EventNotFoundError extends DomainException {
  constructor() {
    super('Evento não encontrado', 'EVENT_NOT_FOUND', 404);
  }
}
