import { argon2id, HashOptions } from 'argon2';

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
