import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type { ProductResponse } from './interfaces/product.interface.js';

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
}
