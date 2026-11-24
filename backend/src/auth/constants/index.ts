import { argon2id, HashOptions } from 'argon2';
import { type CookieOptions } from 'express';

export const minPasswordLength = 8;
export const passwordUppercasePattern = /\p{Lu}/u;
export const passwordDigitPattern = /\p{Nd}/u;
export const passwordSpecialCharacterPattern = /[\p{P}\p{S}]/u;

export const authHashOptions: HashOptions = {
  type: argon2id,
  memoryCost: 20 * 1024,
  timeCost: 2,
  parallelism: 1,
};

export const sessionTtlMs = 24 * 60 * 60 * 1000;

export const sessionCookieKey = 'session';

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};
