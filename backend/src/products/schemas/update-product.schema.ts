import { z } from 'zod';
import { createProductSchema } from './create-product.schema.js';

export const updateProductSchema = z
  .strictObject({
    name: createProductSchema.shape.name,
    description: createProductSchema.shape.description.unwrap().nullable(),
    price: createProductSchema.shape.price,
    stock: createProductSchema.shape.stock.unwrap(),
    categoryId: createProductSchema.shape.categoryId,
  })
  .partial()
  .refine(
    (product) => Object.values(product).some((value) => value !== undefined),
    'Передай хотя бы одно поле для обновления',
  );

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
