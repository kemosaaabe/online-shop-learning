import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProducts() {
    const productsList = await this.databaseService.makeQuery(
      `SELECT
        id,
        name,
        price,
        stock
       FROM shop.products
       WHERE is_active = TRUE
        `,
    );

    return productsList.rows;
  }
}
