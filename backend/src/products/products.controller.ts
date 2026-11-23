import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe.js';
import { ProductsService } from './products.service.js';
import {
  type CreateProductDto,
  createProductSchema,
} from './schemas/create-product.schema.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id', PositiveIntPipe) productId: number) {
    return this.productsService.getProduct(productId);
  }

  @Post()
  createProduct(
    @Body({ schema: createProductSchema }) productDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(productDto);
  }
}
