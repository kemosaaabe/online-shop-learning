import { z } from 'zod';

export const addProductSchema = z.strictObject({
  quantity: z.int32().positive(),
});

export type AddProductDto = z.infer<typeof addProductSchema>;
