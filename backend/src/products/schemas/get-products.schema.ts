import { z } from 'zod';
import {
  defaultPage,
  defaultPageSize,
  maxPageSize,
} from '../constants/index.js';

export const getProductsSchema = z.strictObject({
  page: z.coerce.number().int().positive().default(defaultPage),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(maxPageSize)
    .default(defaultPageSize),
});

export type GetProductsDto = z.infer<typeof getProductsSchema>;
