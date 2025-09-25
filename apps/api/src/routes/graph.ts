import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const graphRouter = Router();

const schema = z.object({ topic: z.string().min(1).optional(), mode: z.string().optional() });

graphRouter.get('/api/graph', async (req, res) => {
  const parsed = schema.safeParse({ topic: req.query.topic, mode: req.query.mode });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { topic, mode } = parsed.data;
  if (mode === 'knowledge') {
    try {
      const nodesBase = await prisma.$queryRaw<Array<{ id: string; name: string; total: number }>>`
        with selected as (
          select e.id, e.name, coalesce(sum(es.score)::float, 0) as total
          from employees e left join expertise_scores es on es.employee_id = e.id
          group by e.id, e.name
          order by total desc
          limit 50
        )
        select id, name, total from selected`;
      const edges = await prisma.$queryRaw<Array<{ a: string; b: string; weight: number }>>`
        with selected as (
          select e.id, e.name, coalesce(sum(es.score)::float, 0) as total
          from employees e left join expertise_scores es on es.employee_id = e.id
          group by e.id, e.name
          order by total desc
          limit 50
        ),
        tcounts as (
          select topic_id, count(distinct employee_id)::float as c from expertise_scores group by topic_id
        ),
        totals as (
          select count(*)::float as n from employees
        ),
        pairs as (
          select e1.employee_id as a, e2.employee_id as b,
                 least(e1.score, e2.score)::float * ln((select n from totals) / nullif((select c from tcounts where topic_id = e1.topic_id),0) + 1) as contrib
          from expertise_scores e1
          join expertise_scores e2 on e1.topic_id = e2.topic_id and e1.employee_id < e2.employee_id
          where e1.employee_id in (select id from selected) and e2.employee_id in (select id from selected)
        )
        select a, b, sum(contrib) as weight
        from pairs
        group by a, b
        having sum(contrib) >= 0.3
        order by weight desc
        limit 300`;
      const nodes = nodesBase.map(n => ({ id: n.id, label: n.name, score: Number(n.total) }));
      const edgeObjs = edges.map(e => ({ source: e.a, target: e.b, weight: Number(e.weight), sharedTopics: [] as any[] }));
      return res.json({ nodes, edges: edgeObjs, insights: { type: 'knowledge' } });
    } catch (e) {
      console.error('knowledge graph error', e);
      return res.json({ nodes: [], edges: [], insights: { type: 'knowledge' } });
    }
  }
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
  // Co-participation meeting edges on same topic (lightweight weight 0.3)
  const meetingEdges = await prisma.$queryRaw<Array<{ a: string; b: string; weight: number }>>`
    with t as (select id from topics where name = ${topic}),
    mt as (
      select mt.meeting_id from meeting_topics mt where mt.topic_id = (select id from t)
    ),
    pairs as (
      select p1.employee_id as a, p2.employee_id as b
      from meeting_participants p1
      join meeting_participants p2 on p1.meeting_id = p2.meeting_id and p1.employee_id < p2.employee_id
      where p1.meeting_id = any (select meeting_id from mt)
    )
    select a, b, 0.3::float as weight from pairs
  `;
  const meetingEdgeObjs = meetingEdges.map(me => ({ source: me.a, target: me.b, weight: Number(me.weight), sharedTopics: [{ name: topic }] }));
  const allEdges = [...edges, ...meetingEdgeObjs];
  const busFactor = nodes.length >= 3 ? nodes.slice(0,3).reduce((s,n)=>s+n.score,0) / (nodes.reduce((s,n)=>s+n.score,0)+1e-6) : 1;
  res.json({ nodes, edges: allEdges, insights: { busFactor } });
});


