import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { ProductsService } from './products.service.js';
import {
  type CreateProductDto,
  createProductSchema,
} from './schemas/create-product.schema.js';
import {
  updateProductSchema,
  type UpdateProductDto,
} from './schemas/update-product.schema.js';

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

  @UseGuards(AdminGuard)
  @Post()
  createProduct(
    @Body({ schema: createProductSchema }) productDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(productDto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  updateProduct(
    @Param('id', PositiveIntPipe) productId: number,
    @Body({ schema: updateProductSchema }) productDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(productId, productDto);
  }
}
