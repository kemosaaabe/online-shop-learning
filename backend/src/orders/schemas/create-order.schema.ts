import { z } from 'zod';

export const createOrderSchema = z.strictObject({
  address: z.string().trim().min(1, 'Укажи адрес доставки'),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
