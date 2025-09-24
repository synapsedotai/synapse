import { Router } from 'express';
import { getEmbedder } from '../adapters/embedder.js';

export const healthRouter = Router();

healthRouter.get('/healthz', async (_req, res) => {
  const embedder = getEmbedder();
  const dim = await embedder.getDim().catch(() => 0);
  res.json({ ok: true, embedModel: embedder.model(), dim });
});

