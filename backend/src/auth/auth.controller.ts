import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Res,
  Cookies,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from './auth.service.js';
import { type RegisterDto, registerSchema } from './schemas/register.schema.js';
import { type LoginDto, loginSchema } from './schemas/login.schema.js';
import { sessionCookieKey, sessionCookieOptions } from './constants/index.js';

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

    response.cookie(sessionCookieKey, sessionToken, {
      ...sessionCookieOptions,
      expires: expiresAt,
    });

    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Cookies(sessionCookieKey) sessionToken?: string,
  ) {
    await this.authService.logout(sessionToken);

    response.clearCookie(sessionCookieKey, sessionCookieOptions);
  }

  @Get('me')
  async getMe(@Cookies(sessionCookieKey) sessionToken?: string) {
    return this.authService.getMe(sessionToken);
  }
}
