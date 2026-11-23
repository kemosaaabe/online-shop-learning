import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

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
}
