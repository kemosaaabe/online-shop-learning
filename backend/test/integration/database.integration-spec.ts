import { afterAll, describe, expect, it } from 'vitest';
import { DatabaseService } from '../../src/database/database.service.js';

describe('DatabaseService integration', () => {
  const database = new DatabaseService();

  afterAll(async () => {
    await database.onModuleDestroy();
  });

  it('passes query parameters to PostgreSQL and return rows', async () => {
    const result = await database.makeQuery(
      `
        SELECT $1::integer + $2::integer as total
      `,
      [20, 22],
    );

    expect(result.rows).toEqual([{ total: 42 }]);
  });

  it('with transaction use a single connection and make queries within a single transaction', async () => {
    const result = await database.withTransaction(async (client) => {
      await client.query(
        `
            CREATE TEMP TABLE test_items 
                (quantity integer)
            ON COMMIT DROP
        `,
      );

      await client.query(
        `
            INSERT INTO test_items (quantity)
            VALUES ($1)
        `,
        [3],
      );

      const { rows: result } = await client.query(
        `
            SELECT quantity
            FROM test_items
        `,
      );

      return result;
    });

    expect(result).toEqual([{ quantity: 3 }]);
  });

  it('rolls back the transaction when an error occurs after an insert', async () => {
    const forcedError = new Error('force rollback');
    let transactionId = '';

    const transaction = database.withTransaction(async (client) => {
      await client.query(
        `
            CREATE TEMP TABLE test_rollback_items 
                (quantity integer) 
            ON COMMIT DROP
        `,
      );

      await client.query(
        `
            INSERT INTO test_rollback_items (quantity)
            VALUES ($1)
        `,
        [3],
      );

      const { rows } = await client.query(
        `
            SELECT pg_current_xact_id()::text as id
        `,
      );
      transactionId = rows[0].id;

      throw forcedError;
    });

    await expect(transaction).rejects.toBe(forcedError);

    const { rows } = await database.makeQuery(
      `
            SELECT pg_xact_status($1::xid8) as status
        `,
      [transactionId],
    );

    expect(rows).toEqual([{ status: 'aborted' }]);
  });

  it('should successfully commit transaction', async () => {
    let transcationId = '';

    await database.withTransaction(async (client) => {
      await client.query(
        `
            CREATE TEMP TABLE test_commit_items 
                (quantity integer)
            ON COMMIT DROP
        `,
      );

      await client.query(
        `
            INSERT INTO test_commit_items (quantity)
            VALUES ($1)
        `,
        [3],
      );

      const { rows } = await client.query(`
            SELECT pg_current_xact_id()::text as id
        `);
      transcationId = rows[0].id;
    });

    const { rows } = await database.makeQuery(
      `
            SELECT pg_xact_status($1::xid8) as status
        `,
      [transcationId],
    );

    expect(rows[0].status).toBe('committed');
  });
});
