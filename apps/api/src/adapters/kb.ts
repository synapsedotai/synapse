import { prisma } from '../db.js';
import { getEmbedder } from './embedder.js';
import { CandidateTopic, Snippet } from '../types.js';
import { trace } from '../util/trace.js';
import { vectorLiteral } from '../util/vector.js';
import { env } from '../env.js';
import Anthropic from '@anthropic-ai/sdk';

export async function extractTopics(text: string, max = 8): Promise<CandidateTopic[]> {
  if (!env.EMBED_MOCK && env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const prompt = `Extract up to ${max} topics from the text. Respond ONLY as a JSON array of objects {"name":string,"confidence":number in [0,1]}. Text: ${text.slice(0, 4000)}`;
    const msg = await client.messages.create({
      model: env.ANTHROPIC_TOPIC_MODEL!,
      max_tokens: 256,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    });
    const raw = (msg as unknown as { content?: Array<{ text?: string }> })?.content?.[0]?.text ?? '';
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, max).map((t: { name: string; confidence?: number }) => ({ name: String(t.name), confidence: Math.max(0, Math.min(1, Number(t.confidence) || 0.5)) }));
      }
    } catch {}
  }
  // fallback heuristic
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

  const rows = await prisma.$queryRaw<Array<{ doc_id: string; title: string; text_snippet: string }>>`
    select c.doc_id, d.title, c.text_snippet
    from chunks c
    join docs d on d.id = c.doc_id
    order by (c.embedding <#> ( ${vectorLiteral(qv)}::vector )) asc
    limit ${topK}
  `;
  const snippets: Snippet[] = rows.map(r => ({ text: r.text_snippet.slice(0, 200), source: r.title, docId: r.doc_id }));
  const candidateTopics = await extractTopics(queryText + ' ' + snippets.map(s => s.text).join(' '), 8);
  return { snippets, candidateTopics };
}

