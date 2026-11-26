import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { PaymentsService } from './payments.service.js';
import { MockPaymentService } from './mock-payment.service.js';

@Module({
  providers: [PaymentsService, MockPaymentService],
  exports: [PaymentsService],
  imports: [DatabaseModule],
})
export class PaymentsModule {}
