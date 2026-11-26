import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { UsersModule } from '../users/users.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PaymentsModule } from '../payments/payments.module.js';

@Module({
  imports: [UsersModule, DatabaseModule, PaymentsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
