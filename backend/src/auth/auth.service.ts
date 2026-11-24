import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { hash, verify } from 'argon2';
import { RegisterDto } from './schemas/register.schema.js';
import { authHashOptions, sessionTtlMs } from './constants/index.js';
import { LoginDto } from './schemas/login.schema.js';
import { UsersService } from '../users/users.service.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly databaseService: DatabaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    const passwordHash = await hash(registerDto.password, authHashOptions);

    const user = await this.usersService.createUser({
      email: registerDto.email,
      password_hash: passwordHash,
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findActiveByEmail(loginDto.email);

    const isPasswordCorrect = await verify(
      user.password_hash,
      loginDto.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const sessionToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    const expiresAt = new Date(Date.now() + sessionTtlMs);

    await this.databaseService.makeQuery(
      `
        INSERT INTO shop.sessions (token_hash, user_id, expires_at)
        VALUES
            ($1, $2, $3)  
    `,
      [tokenHash, user.id, expiresAt],
    );

    return {
      user: { id: user.id, email: user.email },
      sessionToken,
      expiresAt: expiresAt,
    };
  }

  async logout(sessionToken?: string) {
    if (!sessionToken) {
      return;
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    await this.databaseService.makeQuery(
      `
        DELETE FROM shop.sessions
        WHERE token_hash = $1
    `,
      [tokenHash],
    );
  }

  async getMe(sessionToken?: string) {
    return this.usersService.getCurrentUser(sessionToken);
  }
}
