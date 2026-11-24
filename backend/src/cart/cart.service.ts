import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { DatabaseService } from '../database/database.service.js';
import { CartItemsGetResponse } from './interfaces/cart.interface.js';

@Injectable()
export class CartService {
  constructor(
    private readonly usersService: UsersService,
    private readonly databaseService: DatabaseService,
  ) {}

  async getCartItems(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const { rows: cartItems } =
      await this.databaseService.makeQuery<CartItemsGetResponse>(
        `
        SELECT
            p.id as "productId",
            p.name,
            p.price,
            cp.products_count as quantity,
            p.stock,
            p.is_active as "isActive"
        FROM shop.products AS p
        JOIN shop.cart_items AS cp
            ON p.id = cp.product_id 
        WHERE cart_id = $1
        `,
        [user.id],
      );

    return cartItems;
  }
}
