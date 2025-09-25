import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';

export const meetingsRouter = Router();

const meetingSchema = z.object({
  topic: z.string().min(1),
  summary: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  createdBy: z.string().uuid().optional(),
});

meetingsRouter.post('/api/meetings', async (req, res) => {
  const parsed = meetingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { topic, summary, startedAt, durationMinutes, createdBy } = parsed.data;
  const ins = await query<{ id: string; topic: string; summary: string | null; started_at: string }>(
    `insert into meetings(topic, summary, started_at, duration_minutes, created_by)
     values ($1, $2, coalesce($3::timestamptz, now()), $4, $5)
     returning *`,
    [topic, summary ?? null, startedAt ?? null, durationMinutes ?? null, createdBy ?? null]
  );
  res.json(ins.rows[0]);
});

meetingsRouter.get('/api/meetings', async (req, res) => {
  const employeeId = req.query.employeeId as string | undefined;
  if (employeeId) {
    const rows = await query<any>(
      `select m.* from meetings m
       join meeting_participants p on p.meeting_id = m.id
       where p.employee_id = $1
       order by m.started_at desc
       limit 100`,
      [employeeId]
    );
    return res.json(rows.rows);
  }
  const rows = await query<any>(`select * from meetings order by started_at desc limit 100`);
  res.json(rows.rows);
});

meetingsRouter.patch('/api/meetings/:id', async (req, res) => {
  const id = req.params.id;
  const parsed = meetingSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { topic, summary, startedAt, durationMinutes, createdBy } = parsed.data;
  const upd = await query<any>(
    `update meetings set
       topic = coalesce($2, topic),
       summary = coalesce($3, summary),
       started_at = coalesce($4::timestamptz, started_at),
       duration_minutes = coalesce($5, duration_minutes),
       created_by = coalesce($6, created_by),
       updated_at = now()
     where id = $1
     returning *`,
    [id, topic ?? null, summary ?? null, startedAt ?? null, durationMinutes ?? null, createdBy ?? null]
  );
  res.json(upd.rows[0]);
});

meetingsRouter.delete('/api/meetings/:id', async (req, res) => {
  const id = req.params.id;
  await query(`delete from meetings where id = $1`, [id]);
  res.json({ ok: true });
});

const participantSchema = z.object({ employeeId: z.string().uuid(), role: z.string().optional() });
meetingsRouter.post('/api/meetings/:id/participants', async (req, res) => {
  const id = req.params.id;
  const parsed = participantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { employeeId, role } = parsed.data;
  const row = await query(
    `insert into meeting_participants(meeting_id, employee_id, role)
     values ($1, $2, $3)
     on conflict (meeting_id, employee_id) do update set role = excluded.role
     returning *`,
    [id, employeeId, role ?? 'participant']
  );
  res.json(row.rows[0]);
});

const meetingTopicSchema = z.object({ topic: z.string().min(1), confidence: z.number().min(0).max(1).optional() });
meetingsRouter.post('/api/meetings/:id/topics', async (req, res) => {
  const id = req.params.id;
  const parsed = meetingTopicSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { topic, confidence } = parsed.data;
  const t = await query<{ id: number }>(
    `insert into topics(name) values ($1) on conflict(name) do update set name = excluded.name returning id`,
    [topic]
  );
  const mt = await query<{ meeting_id: string; topic_id: number; confidence: number | null }>(
    `insert into meeting_topics(meeting_id, topic_id, confidence) values ($1, $2, $3)
     on conflict (meeting_id, topic_id) do update set confidence = excluded.confidence
     returning meeting_id, topic_id, confidence`,
    [id, t.rows[0].id, confidence ?? null]
  );
  res.json({ meetingId: id, topicId: mt.rows[0].topic_id, confidence: mt.rows[0].confidence ?? null });
});


