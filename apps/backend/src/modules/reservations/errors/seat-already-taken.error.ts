import { DomainException } from '../../../common/exceptions/domain.exception';

export class SeatAlreadyTakenError extends DomainException {
  constructor() {
    super('Um ou mais assentos já estão ocupados', 'SEAT_ALREADY_TAKEN', 409);
  }
}
