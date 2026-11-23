import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import type { ProductResponse } from './interfaces/product.interface.js';
import { CreateProductDto } from './schemas/create-product.schema.js';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProducts() {
    const { rows: productsList } =
      await this.databaseService.makeQuery<ProductResponse>(
        `SELECT
          id,
          name,
          price,
          stock
        FROM shop.products
        WHERE is_active = TRUE
        `,
      );

    return productsList;
  }

  async getProduct(productId: number) {
    const { rows: product } =
      await this.databaseService.makeQuery<ProductResponse>(
        `SELECT
          id,
          name,
          price,
          stock
        FROM shop.products
        WHERE is_active = TRUE
          AND id = $1
        `,
        [productId],
      );

    if (product.length === 0) {
      throw new NotFoundException();
    }

    return product[0];
  }

  async createProduct(productDto: CreateProductDto) {
    try {
      const { rows: createdProduct } =
        await this.databaseService.makeQuery<ProductResponse>(
          `
        INSERT INTO shop.products (name, description, price, stock, category_id)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING id, name, price, stock
        `,
          [
            productDto.name,
            productDto.description,
            productDto.price,
            productDto.stock,
            productDto.categoryId,
          ],
        );

      return createdProduct[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23503') {
        throw new BadRequestException('Указанная категория не существует');
      }

      throw error;
    }
  }
}
