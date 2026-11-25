import { Controller, Cookies, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { sessionCookieKey } from '../auth/constants/index.js';
import { PositiveBigintPipe } from '../common/pipes/positive-bigint.pipe.js';

@Controller('orders')
export class OrdersController {
  constructor(public readonly ordersService: OrdersService) {}

  @Get()
  getUserOrders(@Cookies(sessionCookieKey) sessionToken?: string) {
    return this.ordersService.getUserOrders(sessionToken);
  }

  @Get(':id')
  getUserOrder(
    @Param('id', PositiveBigintPipe) orderId: string,
    @Cookies(sessionCookieKey) sessionToken?: string,
  ) {
    return this.ordersService.getUserOrder(orderId, sessionToken);
  }
}
