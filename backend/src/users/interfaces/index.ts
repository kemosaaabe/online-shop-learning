export const userRolesMap = {
  customer: 'customer',
  admin: 'admin',
} as const;

export type UserRole = (typeof userRolesMap)[keyof typeof userRolesMap];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password_hash: string;
  delivery_address: string;
}

export type UserCreate = Pick<User, 'email' | 'password_hash'>;

export type UserCreateResponse = Pick<User, 'id' | 'email'>;

export type UserLoginAuthResponse = Pick<
  User,
  'id' | 'email' | 'password_hash'
>;

export type UserGetMeResponse = Pick<User, 'id' | 'email' | 'role'> & {
  expires_at: Date;
};
