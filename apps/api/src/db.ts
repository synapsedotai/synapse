import { Pool, type PoolClient } from 'pg';
import { env, getDatabaseUrl } from './env.js';
import { PrismaClient } from '@prisma/client';

const connectionString = getDatabaseUrl();
const useSSL = /supabase\.co/.test(connectionString) || process.env.SUPABASE_SSL === '1' || process.env.PGSSLMODE === 'require';
export const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

export const prisma = new PrismaClient();

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  const start = Date.now();
  try {
    const res = await pool.query(text as string, params as any[] | undefined);
    return res as unknown as { rows: T[] };
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

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client: PoolClient = await pool.connect();
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

