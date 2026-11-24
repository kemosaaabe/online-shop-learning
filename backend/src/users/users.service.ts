import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { createHash } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import type {
  UserCreateResponse,
  UserCreate,
  UserLoginAuthResponse,
  UserGetMeResponse,
} from './interfaces/index.js';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(user: UserCreate) {
    try {
      const { rows: createdUser } =
        await this.databaseService.makeQuery<UserCreateResponse>(
          `
            INSERT INTO shop.users (email, password_hash)
                VALUES
                    ($1, $2)
            RETURNING id, email
        `,
          [user.email, user.password_hash],
        );

      return createdUser[0];
    } catch (error: unknown) {
      if (
        error instanceof DatabaseError &&
        error.code === '23505' &&
        error.constraint === 'user_active_email_idx'
      ) {
        throw new ConflictException('Данный email уже занят');
      }

      throw error;
    }
  }

  async findActiveByEmail(email: string) {
    const { rows: currentUser } =
      await this.databaseService.makeQuery<UserLoginAuthResponse>(
        `
            SELECT id, email, password_hash
            FROM shop.users
            WHERE email = $1
                AND is_active = TRUE
        `,
        [email],
      );

    if (currentUser.length === 0) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return currentUser[0];
  }

  async getCurrentUser(sessionToken?: string) {
    if (!sessionToken) {
      throw new UnauthorizedException('');
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    const { rows: currentUser } =
      await this.databaseService.makeQuery<UserGetMeResponse>(
        `
        SELECT
            u.id,
            u.email,
            s.expires_at
        FROM shop.users as u
        JOIN shop.sessions as s
            ON u.id = s.user_id
        WHERE s.token_hash = $1
            AND u.is_active = TRUE
            AND s.expires_at > now()
        `,
        [tokenHash],
      );

    if (currentUser.length === 0) {
      throw new UnauthorizedException('');
    }

    return { id: currentUser[0].id, email: currentUser[0].email };
  }
}
