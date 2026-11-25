import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { UsersModule } from '../users/users.module.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [UsersModule, DatabaseModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
