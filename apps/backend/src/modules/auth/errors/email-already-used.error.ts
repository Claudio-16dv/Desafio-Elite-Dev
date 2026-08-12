import { DomainException } from '../../../common/exceptions/domain.exception';

export class EmailAlreadyUsedError extends DomainException {
  constructor() {
    super('E-mail já está em uso', 'EMAIL_ALREADY_USED', 409);
  }
}
