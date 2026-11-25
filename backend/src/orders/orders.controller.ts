import { Body, Controller, Cookies, Get, Param, Post } from '@nestjs/common';
import { sessionCookieKey } from '../auth/constants/index.js';
import { PositiveBigintPipe } from '../common/pipes/positive-bigint.pipe.js';
import { OrdersService } from './orders.service.js';
import {
  type CreateOrderDto,
  createOrderSchema,
} from './schemas/create-order.schema.js';

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

  @Post()
  createUserOrder(
    @Body({ schema: createOrderSchema }) createOrderDto: CreateOrderDto,
    @Cookies(sessionCookieKey) sessionToken?: string,
  ) {
    return this.ordersService.createUserOrder(createOrderDto, sessionToken);
  }
}
