import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { UsersService } from '../users/users.service.js';
import {
  ordersStatusesMap,
  OrderStatus,
} from '../orders/interfaces/orders.interface.js';
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
    idempotencyKey: string,
    sessionToken?: string,
  ) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    const createdPayment = await this.databaseService.withTransaction<Payment>(
      async (client) => {
        const { rows: order } = await client.query<{
          totalSum: string;
          status: OrderStatus;
        }>(
          `
                SELECT 
                    total_sum as "totalSum",
                    status
                FROM shop.orders
                WHERE id = $1
                    AND user_id = $2
                FOR UPDATE
            `,
          [orderId, user.id],
        );

        if (order.length === 0) {
          throw new NotFoundException('Заказ не найден');
        }

        const { rows: existingPayment } = await client.query<Payment>(
          `
                SELECT
                    id, 
                    payment_sum as "paymentSum", 
                    status, 
                    payment_provider_id as "paymentProviderId", 
                    order_id as "orderId"
                FROM shop.payments
                WHERE order_id = $1
                    AND idempotency_key = $2
            `,
          [orderId, idempotencyKey],
        );

        if (existingPayment.length !== 0) {
          return existingPayment[0];
        }

        if (order[0].status !== ordersStatusesMap.pending) {
          throw new ConflictException('Заказ нельзя оплатить');
        }

        const paymentProviderMock =
          this.paymentProviderService.createMockPayment(operationType);

        const { rows: createdPayment } = await client.query<Payment>(
          `
                INSERT INTO shop.payments (payment_sum, status, payment_provider_id, order_id, idempotency_key)
                SELECT $1, $2, $3, $4, $5
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
            idempotencyKey,
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
