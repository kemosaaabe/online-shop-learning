import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [DatabaseModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
