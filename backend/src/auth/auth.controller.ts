import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service.js';
import { type RegisterDto, registerSchema } from './schemas/register.schema.js';
import { type LoginDto, loginSchema } from './schemas/login.schema.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body({ schema: registerSchema }) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body({ schema: loginSchema }) loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, sessionToken, expiresAt } =
      await this.authService.login(loginDto);

    response.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return user;
  }
}
