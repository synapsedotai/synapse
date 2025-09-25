import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const graphRouter = Router();

const schema = z.object({ topic: z.string().min(1).optional() });

graphRouter.get('/api/graph', async (req, res) => {
  const parsed = schema.safeParse({ topic: req.query.topic });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { topic } = parsed.data;
  if (!topic) {
    // Org hierarchy tree: nodes are employees; edges are manager -> report
    const employees = await prisma.employees.findMany({ select: { id: true, name: true, role: true, manager_id: true } });
    const nodes = employees.map(e => ({ id: e.id, label: e.name, role: e.role ?? null }));
    const edges = employees.filter(e => e.manager_id).map(e => ({ source: e.manager_id as string, target: e.id }));
    return res.json({ nodes, edges, insights: { type: 'org' } });
  }
  const rows = await prisma.$queryRaw<Array<{ employee_id: string; name: string; score: number; freshness_days: number }>>`
    with t as (select id from topics where name = ${topic})
    select e.employee_id, emp.name, e.score, e.freshness_days
    from expertise_scores e
    join employees emp on emp.id = e.employee_id
    where e.topic_id = (select id from t)
    order by e.score desc
    limit 20
  `;
  const nodes = rows.map(r => ({ id: r.employee_id, label: r.name, score: Number(r.score) }));
  // Topic-scoped edges: pairwise overlap with freshness weighting and thresholds
  const edgeRows = await prisma.$queryRaw<Array<{ a: string; b: string; weight: number; score_a: number; score_b: number }>>`
    with k as (
      select e.employee_id, e.score, e.freshness_days
      from expertise_scores e
      join topics t on t.id = e.topic_id
      where t.name = ${topic}
    ),
    pairs as (
      select a.employee_id as a,
             b.employee_id as b,
             a.score as score_a,
             b.score as score_b,
             least(a.score, b.score) as min_score,
             greatest(a.freshness_days, b.freshness_days) as max_fresh
      from k a
      join k b on a.employee_id < b.employee_id
    )
    select a, b,
           (min_score * (1.0 / (1 + (max_fresh::float / 30.0)))) as weight,
           score_a, score_b
    from pairs
    where min_score >= 0.4 and max_fresh <= 60
      and (min_score * (1.0 / (1 + (max_fresh::float / 30.0)))) >= 0.25
    order by weight desc
    limit 200
  `;
  const edges = edgeRows.map(er => ({
    source: er.a,
    target: er.b,
    weight: Number(er.weight),
    sharedTopics: [{ name: topic, scoreA: Number(er.score_a), scoreB: Number(er.score_b) }]
  }));
  const busFactor = nodes.length >= 3 ? nodes.slice(0,3).reduce((s,n)=>s+n.score,0) / (nodes.reduce((s,n)=>s+n.score,0)+1e-6) : 1;
  res.json({ nodes, edges, insights: { busFactor } });
});


