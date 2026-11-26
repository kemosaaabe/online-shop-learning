import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { UsersService } from '../users/users.service.js';
import { PaymentProviderOperationType } from './interfaces/payment-provider.interface.js';
import { MockPaymentService } from './mock-payment.service.js';
import {
  Payment,
  paymentsStatusesMap,
} from './interfaces/payments.interface.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
    private readonly paymentProviderService: MockPaymentService,
  ) {}

  async createPayment(
    orderId: string,
    operationType: PaymentProviderOperationType,
    sessionToken?: string,
  ) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const createdPayment = await this.databaseService.withTransaction<Payment>(
      async (client) => {
        const { rows: order } = await client.query<{ totalSum: string }>(
          `
                SELECT 
                    total_sum as "totalSum"
                FROM shop.orders
                WHERE id = $1
                    AND status = 'pending'
                    AND user_id = $2
                FOR UPDATE
            `,
          [orderId, user.id],
        );

        if (order.length === 0) {
          throw new NotFoundException('Заказ не найден');
        }

        const paymentProviderMock =
          this.paymentProviderService.createMockPayment(operationType);

        const { rows: createdPayment } = await client.query<Payment>(
          `
                INSERT INTO shop.payments (payment_sum, status, payment_provider_id, order_id)
                SELECT $1, $2, $3, $4
                RETURNING 
                    id, 
                    payment_sum as "paymentSum", 
                    status, 
                    payment_provider_id as "paymentProviderId", 
                    order_id as "orderId"
            `,
          [
            order[0].totalSum,
            paymentProviderMock.status,
            paymentProviderMock.paymentProviderId,
            orderId,
          ],
        );

        if (paymentProviderMock.status === paymentsStatusesMap.succeeded) {
          await client.query(
            `
                UPDATE shop.orders
                SET status = 'completed'
                WHERE id = $1
            `,
            [orderId],
          );
        }

        return createdPayment[0];
      },
    );

    return createdPayment;
  }
}
