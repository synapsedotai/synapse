import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const profileRouter = Router();

const schema = z.object({ employeeId: z.string().uuid() });

profileRouter.get('/api/profile', async (req, res) => {
  const parsed = schema.safeParse({ employeeId: req.query.employeeId });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { employeeId } = parsed.data;
  const emp = await prisma.employees.findUnique({ where: { id: employeeId }, select: { id: true, name: true, email: true, team: true, role: true, org_role: true, profile_summary: true } });
  if (!emp) return res.status(404).json({ error: 'not_found' });
  const topics = await prisma.$queryRaw<Array<{ name: string; score: number; freshness_days: number }>>`
    select t.name, e.score, e.freshness_days
    from expertise_scores e join topics t on t.id = e.topic_id
    where e.employee_id = ${employeeId}
    order by e.score desc
    limit 20`;
  res.json({ ...emp, topics });
});


