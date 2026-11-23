import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { UserCreateResponse, UserCreate } from './interfaces/index.js';

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
}
