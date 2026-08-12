import { DomainException } from '../../../common/exceptions/domain.exception';

export class OrderNotFoundError extends DomainException {
  constructor() {
    super('Pedido não encontrado', 'ORDER_NOT_FOUND', 404);
  }
}
