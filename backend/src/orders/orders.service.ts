import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { DatabaseService } from '../database/database.service.js';
import {
  GetUserOrdersResponse,
  UserOrder,
} from './interfaces/orders.interface.js';

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
}
