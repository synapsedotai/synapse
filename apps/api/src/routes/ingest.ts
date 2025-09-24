import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db.js';
import { chunk } from '../adapters/chunker.js';
import { getEmbedder } from '../adapters/embedder.js';
import { trace, redact } from '../util/trace.js';

const bodySchema = z.object({
  employeeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  text: z.string().max(20000).optional(),
  url: z.string().url().optional(),
  visibility: z.enum(['private', 'team', 'org']).default('private')
}).refine(b => !!b.text || !!b.url, { message: 'Provide text or url' });

export const ingestRouter = Router();

async function fetchPublicUrl(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch url: ${resp.status}`);
  const html = await resp.text();
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return text.trim().slice(0, 20000);
}

ingestRouter.post('/api/ingest', async (req, res) => {
  const parse = bodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { employeeId, title, url, visibility } = parse.data;
  let text = parse.data.text;
  try {
    if (!text && url) text = await fetchPublicUrl(url);
    if (!text) return res.status(400).json({ error: [{ field: 'text', message: 'No text available' }] });
    const pieces = chunk(text, { size: 550, overlap: 70 });
    const embedder = getEmbedder();

    const out = await withTransaction(async (client) => {
      const doc = await client.query(
        `insert into docs(id, employee_id, title, source_url, visibility, created_at)
         values (gen_random_uuid(), $1, $2, $3, $4, now()) returning id`,
        [employeeId, title, url ?? null, visibility]
      );
      const docId = doc.rows[0].id as string;
      let count = 0;
      for (const p of pieces) {
        const v = await embedder.embed(p);
        await client.query(
          `insert into chunks(id, doc_id, text_snippet, embedding)
           values (gen_random_uuid(), $1, $2, $3)`,
          [docId, p.slice(0, 400), v]
        );
        count++;
      }
      return { docId, chunkCount: count };
    });

    await trace({ tool: 'ingest', ok: true, ms: 0, detailsRedacted: redact({ employeeId, title, url, visibility, chunks: out.chunkCount }) });
    res.json(out);
  } catch (e: any) {
    await trace({ tool: 'ingest', ok: false, ms: 0, detailsRedacted: { error: String(e?.message ?? e) } });
    res.status(500).json({ error: 'ingest_failed' });
  }
});


