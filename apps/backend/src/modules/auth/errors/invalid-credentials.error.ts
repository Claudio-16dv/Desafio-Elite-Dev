import { DomainException } from '../../../common/exceptions/domain.exception';

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super('Credenciais inválidas', 'INVALID_CREDENTIALS', 401);
  }
}
