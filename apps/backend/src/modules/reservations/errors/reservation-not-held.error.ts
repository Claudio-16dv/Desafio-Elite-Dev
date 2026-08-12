import { DomainException } from '../../../common/exceptions/domain.exception';

export class ReservationNotHeldError extends DomainException {
  constructor() {
    super('A reserva não está aguardando pagamento', 'RESERVATION_NOT_HELD', 409);
  }
}
