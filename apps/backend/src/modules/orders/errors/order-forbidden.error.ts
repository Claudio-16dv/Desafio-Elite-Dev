import { DomainException } from '../../../common/exceptions/domain.exception';

export class OrderForbiddenError extends DomainException {
  constructor() {
    super('Você não pode acessar este pedido', 'FORBIDDEN_ACTION', 403);
  }
}
