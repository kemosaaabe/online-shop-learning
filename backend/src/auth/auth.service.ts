import { Injectable } from '@nestjs/common';
import { RegisterDto } from './schemas/register.schema.js';
import { authHashOptions } from './constants/index.js';
import { hash } from 'argon2';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto) {
    const passwordHash = await hash(registerDto.password, authHashOptions);

    const user = await this.usersService.createUser({
      email: registerDto.email,
      password_hash: passwordHash,
    });

    return user;
  }
}
