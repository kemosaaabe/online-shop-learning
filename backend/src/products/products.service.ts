import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import type {
  ProductCursorResponse,
  ProductResponse,
} from './interfaces/product.interface.js';
import type { CreateProductDto } from './schemas/create-product.schema.js';
import type { UpdateProductDto } from './schemas/update-product.schema.js';
import type { GetProductsDto } from './schemas/get-products.schema.js';
import {
  productSortColumns,
  productSortDirections,
} from './constants/index.js';
import type { GetProductsCursorDto } from './schemas/get-products-cursor.schema.js';
import { getProductsCursorItems } from './libs/index.js';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProducts(query: GetProductsDto) {
    const offset = (query.page - 1) * query.limit;

    const sortCol = productSortColumns[query.sortBy];
    const sortDirection = productSortDirections[query.sortOrder];

    const sortQuery =
      sortCol === productSortColumns.id
        ? `${sortCol} ${sortDirection}`
        : `${sortCol} ${sortDirection}, id ASC`;

    const { rows: productsList } =
      await this.databaseService.makeQuery<ProductResponse>(
        `SELECT
          id,
          name,
          price,
          stock
        FROM shop.products
        WHERE is_active = TRUE
        ORDER BY ${sortQuery}
        LIMIT $1
        OFFSET $2
        `,
        [query.limit, offset],
      );

    return productsList;
  }

  async getProductsCursor(
    query: GetProductsCursorDto,
  ): Promise<ProductCursorResponse> {
    if (query.afterPrice && query.afterId) {
      const { rows: productsList } =
        await this.databaseService.makeQuery<ProductResponse>(
          `SELECT
            id,
            name,
            price,
            stock
            FROM shop.products
          WHERE is_active = TRUE
            AND (price, id) > ($1, $2)
          ORDER BY price, id
          LIMIT $3
        `,
          [query.afterPrice, query.afterId, query.limit + 1],
        );

      return getProductsCursorItems(productsList, query.limit);
    }

    const { rows: productsList } =
      await this.databaseService.makeQuery<ProductResponse>(
        `SELECT
          id,
          name,
          price,
          stock
        FROM shop.products
        WHERE is_active = TRUE
        ORDER BY price, id
        LIMIT $1
        `,
        [query.limit + 1],
      );

    return getProductsCursorItems(productsList, query.limit);
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

  async updateProduct(productId: number, productDto: UpdateProductDto) {
    const params: unknown[] = [productId];
    const assignments: string[] = [];

    const fieldValues = {
      name: productDto.name,
      description: productDto.description,
      price: productDto.price,
      stock: productDto.stock,
      category_id: productDto.categoryId,
    };

    for (const [col, value] of Object.entries(fieldValues)) {
      if (value === undefined) {
        continue;
      }

      const paramIndex = params.push(value);
      assignments.push(`${col} = $${paramIndex}`);
    }

    try {
      const { rows: updatedProduct } =
        await this.databaseService.makeQuery<ProductResponse>(
          `
          UPDATE shop.products
          SET ${assignments.join(',')}
          WHERE id = $1
            AND is_active = TRUE
          RETURNING id, name, price, stock
          `,
          params,
        );

      if (updatedProduct.length === 0) {
        throw new NotFoundException();
      }

      return updatedProduct[0];
    } catch (error: unknown) {
      if (error instanceof DatabaseError && error.code === '23503') {
        throw new BadRequestException('Указанная категория не существует');
      }

      throw error;
    }
  }
}
