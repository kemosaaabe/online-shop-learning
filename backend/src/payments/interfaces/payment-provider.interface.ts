import { PaymentStatus } from './payments.interface.js';

export const paymentProviderOperationsMap = {
  decline: 'decline',
  success: 'success',
} as const;

export type PaymentProviderOperationType =
  (typeof paymentProviderOperationsMap)[keyof typeof paymentProviderOperationsMap];

export interface PaymentProviderMock {
  paymentProviderId: string;
  status: PaymentStatus;
}
