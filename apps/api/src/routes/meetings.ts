import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

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
  const meeting = await prisma.meetings.create({
    data: {
      topic,
      summary,
      started_at: startedAt ? new Date(startedAt) : undefined,
      duration_minutes: durationMinutes,
      created_by: createdBy,
    },
  });
  res.json(meeting);
});

meetingsRouter.get('/api/meetings', async (req, res) => {
  const employeeId = req.query.employeeId as string | undefined;
  if (employeeId) {
    const rows = await prisma.$queryRaw<any[]>`
      select m.* from meetings m
      join meeting_participants p on p.meeting_id = m.id
      where p.employee_id = ${employeeId}
      order by m.started_at desc
      limit 100`;
    return res.json(rows);
  }
  const rows = await prisma.meetings.findMany({ orderBy: { started_at: 'desc' }, take: 100 });
  res.json(rows);
});

meetingsRouter.patch('/api/meetings/:id', async (req, res) => {
  const id = req.params.id;
  const parsed = meetingSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { topic, summary, startedAt, durationMinutes, createdBy } = parsed.data;
  const meeting = await prisma.meetings.update({
    where: { id },
    data: {
      topic,
      summary,
      started_at: startedAt ? new Date(startedAt) : undefined,
      duration_minutes: durationMinutes,
      created_by: createdBy,
      updated_at: new Date(),
    },
  });
  res.json(meeting);
});

meetingsRouter.delete('/api/meetings/:id', async (req, res) => {
  const id = req.params.id;
  await prisma.meetings.delete({ where: { id } });
  res.json({ ok: true });
});

const participantSchema = z.object({ employeeId: z.string().uuid(), role: z.string().optional() });
meetingsRouter.post('/api/meetings/:id/participants', async (req, res) => {
  const id = req.params.id;
  const parsed = participantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { employeeId, role } = parsed.data;
  const row = await prisma.meeting_participants.upsert({
    where: { meeting_id_employee_id: { meeting_id: id, employee_id: employeeId } },
    update: { role: role ?? 'participant' },
    create: { meeting_id: id, employee_id: employeeId, role: role ?? 'participant' },
  } as any);
  res.json(row);
});

const meetingTopicSchema = z.object({ topic: z.string().min(1), confidence: z.number().min(0).max(1).optional() });
meetingsRouter.post('/api/meetings/:id/topics', async (req, res) => {
  const id = req.params.id;
  const parsed = meetingTopicSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const { topic, confidence } = parsed.data;
  const t = await prisma.topics.upsert({ where: { name: topic }, update: {}, create: { name: topic } });
  const row = await prisma.meeting_topics.upsert({
    where: { meeting_id_topic_id: { meeting_id: id, topic_id: t.id } },
    update: { confidence: confidence ?? null },
    create: { meeting_id: id, topic_id: t.id, confidence: confidence ?? null },
  } as any);
  // Avoid BigInt JSON issues by returning primitives only
  res.json({ meetingId: id, topicId: Number(t.id), confidence: row.confidence ?? null });
});


