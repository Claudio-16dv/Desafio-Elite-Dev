import { DomainException } from '../../../common/exceptions/domain.exception';

export class OrderNotPendingError extends DomainException {
  constructor() {
    super('Apenas pedidos pendentes podem mudar para pagos ou expirados', 'ORDER_NOT_PENDING', 409);
  }
}
