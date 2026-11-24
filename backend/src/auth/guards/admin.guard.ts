import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { parseCookie } from 'cookie';
import { type Request } from 'express';
import { sessionCookieKey } from '../constants/index.js';
import { UsersService } from '../../users/users.service.js';
import { userRolesMap } from '../../users/interfaces/index.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const cookies = parseCookie(request.headers.cookie || '');

    const sessionToken = cookies[sessionCookieKey];

    const currentUser = await this.usersService.getCurrentUser(sessionToken);

    if (currentUser.role === userRolesMap.admin) {
      return true;
    }

    return false;
  }
}
