import { z } from 'zod';
import {
  minPasswordLength,
  passwordDigitPattern,
  passwordSpecialCharacterPattern,
  passwordUppercasePattern,
} from '../constants/index.js';

export const registerSchema = z
  .strictObject({
    email: z.email('Укажи корректный email'),
    password: z
      .string()
      .min(
        minPasswordLength,
        `Пароль должен содержать минимум ${minPasswordLength} символов`,
      )
      .regex(passwordUppercasePattern, 'Добавь хотя бы одну заглавную букву')
      .regex(passwordDigitPattern, 'Добавь хотя бы одну цифру')
      .regex(passwordSpecialCharacterPattern, 'Добавь хотя бы один спецсимвол'),
    repeatedPassword: z.string(),
  })
  .refine(({ password, repeatedPassword }) => password === repeatedPassword, {
    path: ['repeatedPassword'],
    message: 'Пароли должны совпадать',
  });

export type RegisterDto = z.infer<typeof registerSchema>;
