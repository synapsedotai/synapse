import { Pool } from 'pg';
import { env, getDatabaseUrl } from './env.js';

export const pool = new Pool({ connectionString: getDatabaseUrl() });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res as any;
  } finally {
    const ms = Date.now() - start;
    if (ms > 200) {
      console.log(`[db] slow query ${ms}ms`);
    }
  }
}

export async function initExtensions() {
  await query('create extension if not exists vector');
  await query('create extension if not exists pgcrypto');
  // retention for audit_log
  await query(`delete from audit_log where ts < now() - interval '${env.RETENTION_DAYS} days'`);
}

export async function getCurrentVectorDim(): Promise<number | null> {
  const r = await query<{ attndims: number }>(
    `select atttypmod - 4 as attndims
     from pg_attribute
     where attrelid = 'public.chunks'::regclass and attname = 'embedding'`
  );
  if (r.rows.length && r.rows[0].attndims > 0) return r.rows[0].attndims;
  return null;
}

export async function setVectorDimIfEmpty(targetDim: number) {
  const exists = await query(
    `select to_regclass('public.chunks') as exists`
  );
  const tableExists = (exists.rows[0] as any).exists !== null;
  if (!tableExists) return;
  const cnt = await query<{ count: string }>(`select count(*) from chunks`);
  const count = Number(cnt.rows[0].count);
  if (count > 0) return; // only when empty
  const dim = await getCurrentVectorDim();
  if (dim && dim !== targetDim) {
    await query(`alter table chunks alter column embedding type vector(${targetDim}) using embedding`);
  }
}

export async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

