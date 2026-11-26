import { describe, expect, it } from 'vitest';
import { paymentProviderOperationsMap } from './interfaces/payment-provider.interface.js';
import { MockPaymentService } from './mock-payment.service.js';

describe('MockPaymentService', () => {
  it('returns failed status when payment is declined', () => {
    const service = new MockPaymentService();

    const payment = service.createMockPayment(
      paymentProviderOperationsMap.decline,
    );

    expect(payment.status).toBe('failed');
  });
});
