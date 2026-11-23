export type CreateProductPayload = {
  name: string;
  price: string;
  categoryId: number;
  description?: string;
  stock?: number;
};

export type CreateProductResult = {
  message: string;
  status?: number;
  body?: string;
};
