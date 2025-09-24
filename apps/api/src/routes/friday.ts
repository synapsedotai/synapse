import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db.js';
import { trace } from '../util/trace.js';
import { CandidateTopic } from '../types.js';
import { search as kbSearch } from '../adapters/kb.js';

const schema = z.object({
  employeeId: z.string().uuid(),
  answers: z.array(z.object({ q: z.string(), a: z.string() })).min(1)
});

export const fridayRouter = Router();

async function extractTopicsFromText(text: string, max = 12): Promise<CandidateTopic[]> {
  // reuse kb.extract via kbSearch heuristic by passing as query only
  const { candidateTopics } = await kbSearch(text, max);
  return candidateTopics.slice(0, max);
}

fridayRouter.post('/api/friday', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { employeeId, answers } = parsed.data;
  try {
    const text = answers.map(x => `${x.q}: ${x.a}`).join('\n');
    const topics = await extractTopicsFromText(text, 12);
    const updated: { name: string; score: number }[] = [];
    await withTransaction(async (client) => {
      for (const t of topics) {
        const topicRow = await client.query(`insert into topics(name) values ($1) on conflict (name) do update set name = excluded.name returning id`, [t.name]);
        const topicId = topicRow.rows[0].id as number;
        // decay and upsert score
        await client.query(
          `insert into expertise_scores(employee_id, topic_id, score, freshness_days)
           values ($1, $2, $3, 0)
           on conflict (employee_id, topic_id) do update set
             score = greatest(expertise_scores.score * 0.9, excluded.score),
             freshness_days = 0`,
          [employeeId, topicId, t.confidence]
        );
        updated.push({ name: t.name, score: t.confidence });
      }
    });
    await trace({ tool: 'friday', ok: true, ms: 0, detailsRedacted: { employeeId: '***', count: updated.length } });
    res.json({ topicsUpdated: updated });
  } catch (e: any) {
    await trace({ tool: 'friday', ok: false, ms: 0, detailsRedacted: { error: String(e?.message ?? e) } });
    res.status(500).json({ error: 'friday_failed' });
  }
});


