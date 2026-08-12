import { Injectable } from '@nestjs/common';
import { OrderResponse } from '@app/shared';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { OrderEntity } from '../entities/order.entity';
import { OrderForbiddenError } from '../errors/order-forbidden.error';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { toOrderResponse } from '../order-response.mapper';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    private readonly orders: OrdersRepository,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(id: string, userId: string): Promise<OrderResponse> {
    const order = await this.orders.findById(id);
    if (!order) {
      throw new OrderNotFoundError();
    }
    if (order.userId !== userId) {
      throw new OrderForbiddenError();
    }

    const entity = new OrderEntity(order.id, order.status);
    entity.cancel();

    const cancelled = await this.orders.cancel(id);
    return toOrderResponse(cancelled, this.qrSigner);
  }
}
