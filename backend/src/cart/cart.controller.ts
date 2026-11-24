import { Controller, Cookies, Get } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { sessionCookieKey } from '../auth/constants/index.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCartItems(@Cookies(sessionCookieKey) sessionToken?: string) {
    return this.cartService.getCartItems(sessionToken);
  }
}
