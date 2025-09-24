import { query } from '../db.js';
import { getEmbedder } from './embedder.js';
import { CandidateTopic, Snippet } from '../types.js';
import { trace } from '../util/trace.js';
import { vectorLiteral } from '../util/vector.js';

export async function extractTopics(text: string, max = 8): Promise<CandidateTopic[]> {
  // Lightweight heuristic for demo; replace with Claude JSON tool in future
  const words = (text.toLowerCase().match(/[a-z][a-z0-9\-]{3,}/g) ?? [])
    .filter(w => !['that','this','with','from','into','http','https','www','team','org','your','have','been','when','what','will','about','also','like','just','repo','branch','master','main','staging','deploy','deploys','update'].includes(w))
    .slice(0, 100);
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  const top = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, max);
  return top.map(([name, c]) => ({ name: name[0].toUpperCase() + name.slice(1), confidence: Math.min(0.95, 0.5 + c / (words.length + 1)) }));
}

export async function search(queryText: string, topK: number): Promise<{ snippets: Snippet[]; candidateTopics: CandidateTopic[] }> {
  const embedder = getEmbedder();
  const start = Date.now();
  const qv = await embedder.embed(queryText);
  const msEmbed = Date.now() - start;
  await trace({ tool: 'kb.embed', ok: true, ms: msEmbed, detailsRedacted: { model: embedder.model(), dim: qv.length } });

  const rows = await query<{ doc_id: string; title: string; text_snippet: string }>(
    `select c.doc_id, d.title, c.text_snippet
     from chunks c
     join docs d on d.id = c.doc_id
     order by (c.embedding <#> (($1::text)::vector)) asc
     limit $2`,
    [vectorLiteral(qv), topK]
  );
  const snippets: Snippet[] = rows.rows.map(r => ({ text: r.text_snippet.slice(0, 200), source: r.title, docId: r.doc_id }));
  const candidateTopics = await extractTopics(queryText + ' ' + snippets.map(s => s.text).join(' '), 8);
  return { snippets, candidateTopics };
}

