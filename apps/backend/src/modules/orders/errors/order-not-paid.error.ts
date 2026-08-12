import { DomainException } from '../../../common/exceptions/domain.exception';

export class OrderNotPaidError extends DomainException {
  constructor() {
    super('Apenas pedidos pagos podem ser cancelados', 'ORDER_NOT_PAID', 409);
  }
}
