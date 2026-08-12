import { DomainException } from '../../../common/exceptions/domain.exception';

export class EventInvalidStateError extends DomainException {
  constructor(message: string = 'Evento não pode ser alterado neste estado') {
    super(message, 'EVENT_INVALID_STATE', 409);
  }
}
