import { neon } from '@neondatabase/serverless';

let sql = null;

export function getNeon() {
  if (!sql) {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) {
      throw new Error('NEON_DATABASE_URL must be set');
    }
    sql = neon(url);
  }
  return sql;
}
