export const paymentsStatusesMap = {
  waiting: 'waiting',
  succeeded: 'succeeded',
  failed: 'failed',
  cancelled: 'cancelled',
} as const;

export type PaymentStatus =
  (typeof paymentsStatusesMap)[keyof typeof paymentsStatusesMap];

export interface Payment {
  id: string;
  paymentSum: string;
  status: PaymentStatus;
  paymentProviderId: string;
  orderId: string;
}
