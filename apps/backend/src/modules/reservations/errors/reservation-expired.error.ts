import { DomainException } from '../../../common/exceptions/domain.exception';

export class ReservationExpiredError extends DomainException {
  constructor() {
    super('A reserva expirou', 'RESERVATION_EXPIRED', 409);
  }
}
