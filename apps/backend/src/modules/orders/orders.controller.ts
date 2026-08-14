import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrderListItem, OrderResponse, Role } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CheckoutDto } from './dto/checkout.dto';
import { CancelOrderUseCase } from './use-cases/cancel-order.use-case';
import { CheckoutUseCase } from './use-cases/checkout.use-case';
import { GetOrderUseCase } from './use-cases/get-order.use-case';
import { ListMyOrdersUseCase } from './use-cases/list-my-orders.use-case';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class OrdersController {
  constructor(
    private readonly checkout: CheckoutUseCase,
    private readonly getOrder: GetOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
    private readonly listMyOrders: ListMyOrdersUseCase,
  ) {}

  @Post('checkout')
  checkoutOrder(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrderResponse> {
    return this.checkout.execute(user.id, dto);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthenticatedUser): Promise<OrderListItem[]> {
    return this.listMyOrders.execute(user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<OrderResponse> {
    return this.getOrder.execute(id, user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<OrderResponse> {
    return this.cancelOrder.execute(id, user.id);
  }
}
