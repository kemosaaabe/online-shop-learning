import { z } from 'zod';
import { maxPostgresBigint } from '../../common/constants/index.js';
import { createProductSchema } from './create-product.schema.js';
import { getProductsSchema } from './get-products.schema.js';

export const getProductsCursorSchema = z
  .strictObject({
    limit: getProductsSchema.shape.limit,
    afterPrice: createProductSchema.shape.price.optional(),
    categoryId: z.coerce.number().int().positive().max(2147483647).optional(),
    afterId: z
      .string()
      .regex(/^[0-9]+$/, 'ID должен содержать только цифры')
      .pipe(
        z.string().refine((value) => {
          const id = BigInt(value);

          return id > 0n && id <= maxPostgresBigint;
        }, 'ID вне допустимого диапазона'),
      )
      .optional(),
  })
  .refine(
    (query) =>
      (query.afterPrice === undefined) === (query.afterId === undefined),
    'Передай afterPrice и afterId вместе',
  );

export type GetProductsCursorDto = z.infer<typeof getProductsCursorSchema>;
