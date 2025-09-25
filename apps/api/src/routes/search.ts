import { Router } from 'express';
import { z } from 'zod';
import { search as kbSearch } from '../adapters/kb.js';
import { prisma } from '../db.js';
import { trace } from '../util/trace.js';

const schema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(5)
});

export const searchRouter = Router();

searchRouter.post('/api/search', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { query: q, topK } = parsed.data;
  try {
    const plan = ['kb.search', 'experts.rank'];
    const { snippets, candidateTopics } = await kbSearch(q, topK);
    const topicNames = candidateTopics.map(t => t.name);
    let experts: any[] = [];
    if (topicNames.length) {
      const topicIds = await prisma.topics.findMany({
        where: { name: { in: topicNames } },
        select: { id: true },
      });
      const ids = topicIds.map(t => Number(t.id)).filter(n => Number.isFinite(n));
      if (ids.length) {
        const sql = `
          select e.employee_id, emp.name,
                 max(e.score) as score,
                 min(e.freshness_days) as freshness_days
          from expertise_scores e
          join employees emp on emp.id = e.employee_id
          where e.topic_id = any(array[${ids.join(',')}])
          group by e.employee_id, emp.name
          order by (max(e.score) * (1.0 / (1 + min(e.freshness_days)/30.0))) desc
          limit 10`;
        type ExpertRow = { employee_id: string; name: string; score: number; freshness_days: number };
        const rows = await prisma.$queryRawUnsafe(sql);
        const data = rows as unknown as ExpertRow[];
        experts = data.map(r => ({ employeeId: r.employee_id, name: r.name, score: Number(r.score), freshnessDays: Number(r.freshness_days) }));
      }
    }
    await trace({ tool: 'search', ok: true, ms: 0, detailsRedacted: { q: q.slice(0, 60), topK } });
    res.json({ plan, snippets, candidateTopics, experts });
  } catch (e) {
    await trace({ tool: 'search', ok: false, ms: 0, detailsRedacted: { error: e instanceof Error ? e.message : String(e) } });
    res.status(500).json({ error: 'search_failed' });
  }
});


