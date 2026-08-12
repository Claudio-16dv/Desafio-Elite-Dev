import { DomainException } from '../../../common/exceptions/domain.exception';

export class EventNotPublishedError extends DomainException {
  constructor() {
    super('Evento não está publicado', 'EVENT_NOT_PUBLISHED', 409);
  }
}
