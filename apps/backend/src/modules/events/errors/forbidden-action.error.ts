import { DomainException } from '../../../common/exceptions/domain.exception';

export class ForbiddenActionError extends DomainException {
  constructor() {
    super('Você não pode executar esta ação', 'FORBIDDEN_ACTION', 403);
  }
}
