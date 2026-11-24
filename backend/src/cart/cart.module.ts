import { Module } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { UsersModule } from '../users/users.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { CartController } from './cart.controller.js';

@Module({
  providers: [CartService],
  controllers: [CartController],
  imports: [UsersModule, DatabaseModule],
})
export class CartModule {}
