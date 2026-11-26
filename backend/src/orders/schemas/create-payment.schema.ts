import { z } from 'zod';
import { paymentProviderOperationsMap } from '../../payments/interfaces/payment-provider.interface.js';

export const createPaymentSchema = z.strictObject({
  operationType: z.enum(paymentProviderOperationsMap),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
