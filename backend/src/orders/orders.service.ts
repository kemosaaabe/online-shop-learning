import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PoolClient } from 'pg';
import { UsersService } from '../users/users.service.js';
import { DatabaseService } from '../database/database.service.js';
import type {
  GetUserOrdersResponse,
  UserOrder,
  UserCartItems,
  UserCartProductItem,
} from './interfaces/orders.interface.js';
import { type CreateOrderDto } from './schemas/create-order.schema.js';

@Injectable()
export class OrdersService {
  constructor(
    public readonly usersService: UsersService,
    public readonly databaseService: DatabaseService,
  ) {}

  async getUserOrders(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const { rows: userOrders } =
      await this.databaseService.makeQuery<GetUserOrdersResponse>(
        `
            SELECT
                id,
                status,
                total_sum as "totalSum",
                created_at as "createdAt"
            FROM shop.orders
            WHERE user_id = $1
            ORDER BY created_at DESC, id DESC
        `,
        [user.id],
      );

    return userOrders;
  }

  async getUserOrder(orderId: string, sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const { rows: userOrder } = await this.databaseService.makeQuery<UserOrder>(
      `
        SELECT
            o.id,
            o.status,
            o.total_sum AS "totalSum",
            o.created_at AS "createdAt",
            o.address,
            COALESCE(	
                    jsonb_agg(
                        jsonb_build_object(
                            'productId', oi.product_id::text,
                            'name', oi.product_name ,
                            'unitPrice', oi.product_cost::text,
                            'quantity', oi.product_count
                        )
                        ORDER BY oi.id
                )	FILTER (WHERE oi.id IS NOT NULL), 
                '[]'::jsonb
            ) AS items
        FROM shop.orders o
        LEFT JOIN shop.order_items oi
            ON o.id = oi.order_id
        WHERE o.id = $1
            AND o.user_id = $2
        GROUP BY o.id
        `,
      [orderId, user.id],
    );

    if (userOrder.length === 0) {
      throw new NotFoundException('Заказ не найден');
    }

    return userOrder[0];
  }

  async createUserOrder(createOrderDto: CreateOrderDto, sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const createdUserOrder =
      await this.databaseService.withTransaction<UserOrder>(
        async (client: PoolClient) => {
          await client.query(
            `
            SELECT user_id
            FROM shop.users_carts
            WHERE user_id = $1
            FOR UPDATE
          `,
            [user.id],
          );

          const { rows: cartItems } = await client.query<UserCartItems>(
            `
            SELECT
              product_id as "productId",
              products_count as quantity
            FROM shop.cart_items
            WHERE cart_id = $1
            ORDER BY product_id
            FOR UPDATE
          `,
            [user.id],
          );

          if (cartItems.length === 0) {
            throw new ConflictException('Корзина пуста');
          }

          const productItems: UserCartProductItem[] = [];

          for (const cartItem of cartItems) {
            const { rows: productItem } =
              await client.query<UserCartProductItem>(
                `
                UPDATE shop.products
                SET stock = stock - $1
                WHERE id = $2
                  AND stock >= $1 
                  AND is_active = TRUE
                RETURNING id, name, price, $1 as quantity
              `,
                [cartItem.quantity, cartItem.productId],
              );

            if (productItem.length === 0) {
              throw new ConflictException('Товар не найден');
            }

            productItems.push(productItem[0]);
          }

          const { rows: createdOrder } = await client.query<{ id: string }>(
            `
              INSERT INTO shop.orders (total_sum, address, user_id)
              SELECT
                sum(p.price * ci.products_count),
                $2,
                $1
              FROM shop.cart_items ci
              JOIN shop.products p
                ON p.id = ci.product_id
              GROUP BY ci.cart_id
              HAVING cart_id = $1
              RETURNING id
            `,
            [user.id, createOrderDto.address],
          );

          for (const productItem of productItems) {
            await client.query(
              `
              INSERT INTO shop.order_items (product_id, order_id, product_count, product_name, product_cost)
              SELECT $1, $2, $3, $4, $5
            `,
              [
                productItem.id,
                createdOrder[0].id,
                productItem.quantity,
                productItem.name,
                productItem.price,
              ],
            );
          }

          await client.query(
            `
          DELETE FROM shop.cart_items
          WHERE cart_id = $1
        `,
            [user.id],
          );

          const { rows: userCreatedOrder } = await client.query<UserOrder>(
            `
            SELECT
                o.id,
                o.status,
                o.total_sum AS "totalSum",
                o.created_at AS "createdAt",
                o.address,
                COALESCE(	
                        jsonb_agg(
                            jsonb_build_object(
                                'productId', oi.product_id::text,
                                'name', oi.product_name ,
                                'unitPrice', oi.product_cost::text,
                                'quantity', oi.product_count
                            )
                            ORDER BY oi.id
                    )	FILTER (WHERE oi.id IS NOT NULL), 
                    '[]'::jsonb
                ) AS items
            FROM shop.orders o
            LEFT JOIN shop.order_items oi
                ON o.id = oi.order_id
            WHERE o.id = $1
                AND o.user_id = $2
            GROUP BY o.id
            `,
            [createdOrder[0].id, user.id],
          );

          return userCreatedOrder[0];
        },
      );

    return createdUserOrder;
  }
}
