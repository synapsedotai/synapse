import { query } from '../db.js';

export type TraceInput = {
  tool: string;
  ok: boolean;
  ms: number;
  detailsRedacted?: Record<string, unknown> | null;
  actor?: string | null;
  action?: string | null;
  subject?: string | null;
};

export async function trace(input: TraceInput) {
  const { tool, ok, ms, detailsRedacted, actor, action, subject } = input;
  await query(
    `insert into audit_log(ts, actor, action, subject, details)
     values (now(), $1, $2, $3, $4)`,
    [actor ?? null, action ?? tool, subject ?? null, detailsRedacted ? JSON.stringify({ ok, ms, ...detailsRedacted }) : JSON.stringify({ ok, ms })]
  );
}

export function redact<T>(obj: T): T {
  if (obj == null) return obj as T;
  if (typeof obj === 'string') {
    // redact emails and api keys
    let s = obj.replace(/([\w.-]+)@([\w.-]+)/g, '***@***');
    s = s.replace(/sk-[A-Za-z0-9_-]{10,}/g, 'sk-***');
    return s as unknown as T;
  }
  if (Array.isArray(obj)) return obj.map(redact) as unknown as T;
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (/api|key|secret|token|email|embedding/i.test(k)) {
        out[k] = '***';
      } else {
        out[k] = redact(v);
      }
    }
    return out as unknown as T;
  }
  return obj as T;
}

