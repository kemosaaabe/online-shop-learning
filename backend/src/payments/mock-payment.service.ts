import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { paymentsStatusesMap } from './interfaces/payments.interface.js';
import {
  PaymentProviderMock,
  paymentProviderOperationsMap,
  PaymentProviderOperationType,
} from './interfaces/payment-provider.interface.js';

@Injectable()
export class MockPaymentService {
  createMockPayment(operationType: PaymentProviderOperationType) {
    const paymentProviderId = randomUUID();

    const paymentProviderMock: PaymentProviderMock = {
      paymentProviderId,
      status: paymentsStatusesMap.succeeded,
    };

    if (operationType === paymentProviderOperationsMap.decline) {
      paymentProviderMock.status = paymentsStatusesMap.failed;
    }

    return paymentProviderMock;
  }
}
