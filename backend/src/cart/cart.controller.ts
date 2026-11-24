import {
  Controller,
  Cookies,
  Get,
  Param,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Patch,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { sessionCookieKey } from '../auth/constants/index.js';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe.js';
import {
  type AddProductDto,
  addProductSchema,
} from './schemas/add-product.schema.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCartItems(@Cookies(sessionCookieKey) sessionToken?: string) {
    return this.cartService.getCartItems(sessionToken);
  }

  @Post('items/:productId')
  @HttpCode(HttpStatus.OK)
  addProductItem(
    @Param('productId', PositiveIntPipe) productId: number,
    @Body({ schema: addProductSchema }) addProductDto: AddProductDto,
    @Cookies(sessionCookieKey) sessionToken?: string,
  ) {
    return this.cartService.addProductToCart(
      productId,
      addProductDto,
      sessionToken,
    );
  }

  @Patch('items/:productId')
  @HttpCode(HttpStatus.OK)
  updateProductItems(
    @Param('productId', PositiveIntPipe) productId: number,
    @Body({ schema: addProductSchema }) updateProductDto: AddProductDto,
    @Cookies(sessionCookieKey) sessionToken?: string,
  ) {
    return this.cartService.updateProductItems(
      productId,
      updateProductDto,
      sessionToken,
    );
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProductItems(
    @Param('productId', PositiveIntPipe) productId: number,
    @Cookies(sessionCookieKey) sessionToken?: string,
  ) {
    return this.cartService.deleteProductItems(productId, sessionToken);
  }
}
