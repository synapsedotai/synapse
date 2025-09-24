import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';

export const expertiseRouter = Router();

const schema = z.object({ employeeId: z.string().uuid() });

expertiseRouter.get('/api/expertise', async (req, res) => {
  const parsed = schema.safeParse({ employeeId: req.query.employeeId });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { employeeId } = parsed.data;
  const rows = await query(
    `select t.name, e.score, e.freshness_days
     from expertise_scores e join topics t on t.id = e.topic_id
     where e.employee_id = $1
     order by score desc`,
    [employeeId]
  );
  res.json(rows.rows);
});


