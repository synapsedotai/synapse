import { Router } from 'express';
import { z } from 'zod';
import { exportForEmployee, deleteForEmployee } from '../adapters/privacy.js';
import { trace } from '../util/trace.js';

export const privacyRouter = Router();

const schema = z.object({ employeeId: z.string().uuid() });

privacyRouter.get('/api/privacy/export', async (req, res) => {
  const parsed = schema.safeParse({ employeeId: req.query.employeeId });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  const data = await exportForEmployee(parsed.data.employeeId);
  await trace({ tool: 'privacy.export', ok: true, ms: 0, detailsRedacted: { employeeId: '***' } });
  res.json(data);
});

privacyRouter.delete('/api/privacy/delete', async (req, res) => {
  const parsed = schema.safeParse({ employeeId: req.query.employeeId });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  await deleteForEmployee(parsed.data.employeeId);
  await trace({ tool: 'privacy.delete', ok: true, ms: 0, detailsRedacted: { employeeId: '***' } });
  res.json({ ok: true });
});


