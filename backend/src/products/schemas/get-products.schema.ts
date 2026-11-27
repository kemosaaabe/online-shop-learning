import { z } from 'zod';
import {
  defaultPage,
  defaultPageSize,
  defaultSortCol,
  defaultSortDirection,
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
  sortBy: z.enum(['id', 'price', 'name']).default(defaultSortCol),
  sortOrder: z.enum(['asc', 'desc']).default(defaultSortDirection),
});

export type GetProductsDto = z.infer<typeof getProductsSchema>;
