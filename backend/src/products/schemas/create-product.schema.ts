import { z } from 'zod';
import { productPricePattern } from '../constants/index.js';

export const createProductSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .regex(productPricePattern, 'Укажи цену до 10 цифр и двух знаков после точки')
    .refine((price) => Number(price) > 0, 'Цена должна быть больше нуля'),
  stock: z.int32().nonnegative().default(0),
  categoryId: z.int32().positive(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
