export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  password_hash: string;
  delivery_address: string;
}

export type UserCreate = Pick<User, 'email' | 'password_hash'>;

export type UserCreateResponse = Pick<User, 'id' | 'email'>;
