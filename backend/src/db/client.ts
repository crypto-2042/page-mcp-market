import { Pool } from 'pg';
import { getConfig } from '../config.js';
import type { Queryable } from './types.js';

let pool: Pool | null = null;

export function getDbClient(): Queryable {
  if (!pool) {
    const config = getConfig();
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }
    pool = new Pool({ connectionString: config.databaseUrl });
  }

  return {
    query: async <T>(sql: string, params?: unknown[]) => {
      const result = await pool!.query(sql, params);
      return { rows: result.rows as T[] };
    },
  };
}
