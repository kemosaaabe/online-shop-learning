export const ordersStatusesMap = {
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
  returned: 'returned',
} as const;

export type OrderStatus =
  (typeof ordersStatusesMap)[keyof typeof ordersStatusesMap];

export interface Order {
  id: string;
  status: OrderStatus;
  created_at: Date;
  total_sum: string;
  address: string;
  user_id: string;
}

export type GetUserOrdersResponse = Pick<Order, 'id' | 'status'> & {
  totalSum: Order['total_sum'];
  createdAt: Order['created_at'];
};

export interface UserOrderItems {
  productId: string;
  name: string;
  unitPrice: string;
  quantity: number;
}

export interface UserOrder extends GetUserOrdersResponse {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  totalSum: string;
  address: string;
  items: UserOrderItems[];
}

export interface UserCartItems {
  productId: string;
  quantity: number;
}

export interface UserCartProductItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}
