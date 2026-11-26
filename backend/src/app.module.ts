import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [ProductsModule, AuthModule, CartModule, OrdersModule],
})
export class AppModule {}
