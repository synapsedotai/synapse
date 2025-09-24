import dotenv from 'dotenv';

dotenv.config();

export type Env = {
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_DB_URL?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_EMBED_MODEL: string;
  EMBED_MOCK: boolean;
  RETENTION_DAYS: number;
};

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === '1' || value.toLowerCase() === 'true';
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

export const env: Env = {
  PORT: Number(process.env.PORT ?? 4000),
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_EMBED_MODEL: process.env.ANTHROPIC_EMBED_MODEL ?? 'claude-embed',
  EMBED_MOCK: parseBoolean(process.env.EMBED_MOCK, false),
  RETENTION_DAYS: Number(process.env.RETENTION_DAYS ?? 90),
};

export function getDatabaseUrl(): string {
  if (env.SUPABASE_DB_URL) return env.SUPABASE_DB_URL;
  // Try to derive DB URL from SUPABASE_URL + service role key
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Database URL not configured. Set SUPABASE_DB_URL or both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  const host = env.SUPABASE_URL.replace(/^https:\/\//, '').replace(/\/?$/, '');
  const dbHost = host.startsWith('db.') ? host : `db.${host}`;
  return `postgresql://postgres:${encodeURIComponent(env.SUPABASE_SERVICE_ROLE_KEY)}@${dbHost}:5432/postgres`;
}

export const paths = {
  embedDimFile: new URL('../../.embed_dim', import.meta.url).pathname,
};

