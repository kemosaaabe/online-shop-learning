import type {
  ProductCursorResponse,
  ProductResponse,
} from '../interfaces/product.interface.js';

export const getProductsCursorItems = (
  productItems: ProductResponse[],
  limit: number,
): ProductCursorResponse => {
  const hasMore = productItems.length === limit + 1;

  return {
    items: productItems.slice(0, limit),
    hasMore,
    nextCursor: hasMore
      ? {
          afterId: productItems[limit - 1].id,
          afterPrice: productItems[limit - 1].price,
        }
      : null,
  };
};
