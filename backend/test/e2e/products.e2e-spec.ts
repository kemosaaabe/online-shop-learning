import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { AppModule } from '../../src/app.module.js';
import { DatabaseService } from '../../src/database/database.service.js';
import type { ProductResponse } from '../../src/products/interfaces/product.interface.js';

describe('Products API (e2e)', async () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 when the product ID is zero', async () => {
    await request(app.getHttpServer()).get('/products/0').expect(400);
  });

  it('returns an active product from PostgreSQL', async () => {
    const database = app.get(DatabaseService);

    const { rows } = await database.makeQuery<ProductResponse>(`
        SELECT id, name, price, stock
        FROM shop.products
        WHERE is_active = TRUE
        ORDER BY id
        LIMIT 1
    `);

    const [product] = rows;

    if (!product) {
      throw new Error('Expected at least one active product in PostgreSQL');
    }

    const response = await request(app.getHttpServer())
      .get(`/products/${product.id}`)
      .expect(200);

    expect(response.body).toEqual(product);
  });
});
