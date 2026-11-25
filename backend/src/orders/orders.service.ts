import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { DatabaseService } from '../database/database.service.js';
import { GetUserOrdersResponse } from './interfaces/orders.interface.js';

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
}
