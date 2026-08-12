import { DomainException } from '../../../common/exceptions/domain.exception';

export class ReservationNotFoundError extends DomainException {
  constructor() {
    super('Reserva não encontrada', 'RESERVATION_NOT_FOUND', 404);
  }
}
