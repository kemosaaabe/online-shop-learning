import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import {
  UserCreateResponse,
  UserCreate,
  UserLoginAuthResponse,
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
}
