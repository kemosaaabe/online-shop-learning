import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { DatabaseService } from '../database/database.service.js';
import { CartItemsGetResponse } from './interfaces/cart.interface.js';
import { AddProductDto } from './schemas/add-product.schema.js';

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

  async addProductToCard(
    productId: number,
    addProductDto: AddProductDto,
    sessionToken?: string,
  ) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const { rows: currentProduct } = await this.databaseService.makeQuery<{
      stock: number;
    }>(
      `
        SELECT stock
        FROM shop.products
        WHERE id = $1
          AND is_active = TRUE
    `,
      [productId],
    );

    if (currentProduct.length === 0) {
      throw new NotFoundException('Товар не найден');
    }

    const { rows: cartItems } = await this.databaseService.makeQuery(
      `
        INSERT INTO shop.cart_items AS item (cart_id, product_id, products_count)
        SELECT $1::bigint, $2::bigint, $3::integer
        WHERE $3::integer <= $4::integer
        ON CONFLICT (cart_id, product_id) DO UPDATE
        SET products_count = item.products_count + EXCLUDED.products_count
        WHERE EXCLUDED.products_count <= $4::integer - item.products_count
        RETURNING product_id as "productId", products_count as quantity
    `,
      [user.id, productId, addProductDto.quantity, currentProduct[0].stock],
    );

    if (cartItems.length === 0) {
      throw new ConflictException('Недостаточно товара на складе');
    }

    return cartItems[0];
  }
}
