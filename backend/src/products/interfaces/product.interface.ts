export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  is_active: boolean;
  category_id: number;
}

export type ProductResponse = Omit<Product, 'is_active' | 'category_id'>;

export interface ProductCursor {
  afterPrice: string;
  afterId: string;
}

export interface ProductCursorResponse {
  items: ProductResponse[];
  hasMore: boolean;
  nextCursor: ProductCursor | null;
}
