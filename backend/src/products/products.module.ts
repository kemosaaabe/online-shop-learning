import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
