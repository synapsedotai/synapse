import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';

export const graphRouter = Router();

const schema = z.object({ topic: z.string().min(1) });

graphRouter.get('/api/graph', async (req, res) => {
  const parsed = schema.safeParse({ topic: req.query.topic });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { topic } = parsed.data;
  const rows = await query(
    `with t as (select id from topics where name = $1)
     select e.employee_id, emp.name, e.score, e.freshness_days
     from expertise_scores e
     join employees emp on emp.id = e.employee_id
     where e.topic_id = (select id from t)
     order by e.score desc
     limit 20`,
    [topic]
  );
  const nodes = rows.rows.map(r => ({ id: r.employee_id, label: r.name, score: Number(r.score) }));
  const edges: any[] = []; // simplistic; teammate may compute co-topic edges
  const busFactor = nodes.length >= 3 ? nodes.slice(0,3).reduce((s,n)=>s+n.score,0) / (nodes.reduce((s,n)=>s+n.score,0)+1e-6) : 1;
  res.json({ nodes, edges, insights: { busFactor } });
});


