import { Injectable } from '@nestjs/common';
import { OrderListItem } from '@app/shared';
import { toOrderListItem } from '../order-response.mapper';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class ListMyOrdersUseCase {
  constructor(private readonly orders: OrdersRepository) {}

  async execute(userId: string): Promise<OrderListItem[]> {
    const orders = await this.orders.findByUserId(userId);
    return orders.map(toOrderListItem);
  }
}
