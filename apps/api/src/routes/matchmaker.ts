import { Router } from 'express';
import { z } from 'zod';
import { extractTopics } from '../adapters/kb.js';
import { prisma, query } from '../db.js';

export const matchmakerRouter = Router();

const schema = z.object({
  problem: z.string().min(1),
  topK: z.number().int().min(1).max(10).default(5),
  autoSchedule: z.boolean().optional().default(false),
  autoScheduleCount: z.number().int().min(1).max(5).optional().default(1),
  requesterId: z.string().uuid().optional(),
  orgRoles: z.array(z.string()).optional(),
  minScore: z.number().min(0).max(1).optional(),
  maxFreshnessDays: z.number().int().min(0).optional(),
});

matchmakerRouter.post('/api/agent/match', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { problem, topK, autoSchedule, autoScheduleCount, requesterId, orgRoles, minScore, maxFreshnessDays } = parsed.data;

  // 1) Extract and normalize topics from the problem text
  const topics = await extractTopics(problem, 6);
  const topicNames = topics.map(t => t.name);

  // 2) Find experts by topic scores and freshness
  let experts: Array<{ employeeId: string; name: string; score: number; freshnessDays: number; orgRole: string | null; profileSummary: string | null }> = [];
  if (topicNames.length) {
    const topicIds = await prisma.topics.findMany({ where: { name: { in: topicNames } }, select: { id: true } });
    const ids = topicIds.map(t => Number(t.id)).filter(n => Number.isFinite(n));
    if (ids.length) {
      const sql = `
        select e.employee_id, emp.name, emp.org_role, emp.profile_summary,
               max(e.score) as score,
               min(e.freshness_days) as freshness_days
        from expertise_scores e
        join employees emp on emp.id = e.employee_id
        where e.topic_id = any(array[${ids.join(',')}])
        group by e.employee_id, emp.name, emp.org_role, emp.profile_summary
        order by (max(e.score) * (1.0 / (1 + min(e.freshness_days)/30.0))) desc
        limit 30`;
      type Row = { employee_id: string; name: string; score: number; freshness_days: number; org_role: string | null; profile_summary: string | null };
      const rows = await prisma.$queryRawUnsafe(sql);
      const data = rows as unknown as Row[];
      experts = data
        .map(r => ({ employeeId: r.employee_id, name: r.name, score: Number(r.score), freshnessDays: Number(r.freshness_days), orgRole: r.org_role ?? null, profileSummary: r.profile_summary ?? null }))
        .filter(e => (minScore === undefined || e.score >= minScore))
        .filter(e => (maxFreshnessDays === undefined || e.freshnessDays <= maxFreshnessDays))
        .filter(e => (!orgRoles || orgRoles.length === 0 || (e.orgRole ? orgRoles.includes(e.orgRole) : false)))
        .slice(0, topK);
    }
  }

  // 3) Optionally auto-schedule a meeting with the top N experts
  let meeting: { id: string; topic: string } | null = null;
  if (autoSchedule && requesterId && experts[0]) {
    const topic = topicNames[0] ?? 'Expert consultation';
    const ins = await query<{ id: string; topic: string }>(
      `insert into meetings(topic, summary, started_at, duration_minutes, created_by)
       values ($1, $2, now(), $3, $4)
       returning id, topic`,
      [topic, `${problem.slice(0, 400)}\n\nTopics: ${topicNames.slice(0,3).join(', ')}`, 30, requesterId]
    );
    const mid = ins.rows[0].id;
    await query(
      `insert into meeting_participants(meeting_id, employee_id, role) values ($1, $2, $3)
       on conflict (meeting_id, employee_id) do update set role = excluded.role`,
      [mid, requesterId, 'requester']
    );
    const count = Math.min(Math.max(autoScheduleCount ?? 1, 1), 5);
    for (const expert of experts.slice(0, count)) {
      await query(
        `insert into meeting_participants(meeting_id, employee_id, role) values ($1, $2, $3)
         on conflict (meeting_id, employee_id) do update set role = excluded.role`,
        [mid, expert.employeeId, 'expert']
      );
    }
    // tag main topic if exists
    if (topicNames[0]) {
      const t = await query<{ id: number }>(
        `insert into topics(name) values ($1) on conflict(name) do update set name = excluded.name returning id`,
        [topicNames[0]]
      );
      await query(
        `insert into meeting_topics(meeting_id, topic_id, confidence)
         values ($1, $2, $3)
         on conflict (meeting_id, topic_id) do update set confidence = excluded.confidence`,
        [mid, t.rows[0].id, topics[0]?.confidence ?? null]
      );
    }
    meeting = { id: mid, topic };
  }

  res.json({ topics, experts, meeting });
});


