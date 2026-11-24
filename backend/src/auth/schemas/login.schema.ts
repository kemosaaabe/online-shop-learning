import { z } from 'zod';

export const loginSchema = z.strictObject({
  email: z.email('Укажи корректный email'),
  password: z.string().min(1, 'Введи пароль'),
});

export type LoginDto = z.infer<typeof loginSchema>;
