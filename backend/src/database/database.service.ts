import { Injectable } from '@nestjs/common';
import { Pool, PoolClient, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly pool = new Pool();

  async onModuleInit() {
    const result = await this.pool.query(
      'SELECT current_database() as database',
    );

    console.log(result.rows[0].database);
  }

  async onModuleDestroy() {
    await this.pool.end();

    console.log('Module destroyed');
  }

  async makeQuery<T extends QueryResultRow>(
    query: string,
    params: unknown[] = [],
  ) {
    const result = await this.pool.query<T>(query, params);

    return result;
  }

  async withTransaction<T>(
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await work(client);

      await client.query('COMMIT');

      return result;
    } catch (error: unknown) {
      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }
}
