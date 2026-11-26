import {
  BadRequestException,
  Body,
  Controller,
  Cookies,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { sessionCookieKey } from '../auth/constants/index.js';
import { PositiveBigintPipe } from '../common/pipes/positive-bigint.pipe.js';
import { PaymentsService } from '../payments/payments.service.js';
import { OrdersService } from './orders.service.js';
import {
  type CreateOrderDto,
  createOrderSchema,
} from './schemas/create-order.schema.js';
import {
  type CreatePaymentDto,
  createPaymentSchema,
} from './schemas/create-payment.schema.js';

@Controller('orders')
export class OrdersController {
  constructor(
    public readonly ordersService: OrdersService,
    public readonly paymentsService: PaymentsService,
  ) {}

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

  @Post(':id/payments')
  @HttpCode(HttpStatus.OK)
  createOrderPayment(
    @Param('id', PositiveBigintPipe) orderId: string,
    @Body({ schema: createPaymentSchema }) crearePaymentDto: CreatePaymentDto,
    @Cookies(sessionCookieKey) sessionToken?: string,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const key = z.uuid().safeParse(idempotencyKey);

    if (!key.success) {
      throw new BadRequestException('Idempotency-Key должен быть UUID');
    }

    return this.paymentsService.createPayment(
      orderId,
      crearePaymentDto.operationType,
      key.data,
      sessionToken,
    );
  }
}
