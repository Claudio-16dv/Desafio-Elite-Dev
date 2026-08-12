import { DomainException } from '../../../common/exceptions/domain.exception';

export class ReservationForbiddenError extends DomainException {
  constructor() {
    super('Você não pode acessar esta reserva', 'FORBIDDEN_ACTION', 403);
  }
}
