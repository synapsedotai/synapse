import { Router } from 'express';
import { getEmbedder } from '../adapters/embedder.js';

export const healthRouter = Router();

healthRouter.get('/healthz', async (_req, res) => {
  const embedder = getEmbedder();
  const dim = await embedder.getDim().catch(() => 0);
  res.json({ ok: true, embedModel: embedder.model(), dim });
});

healthRouter.get('/openapi.json', (_req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'Synapse API', version: '0.1.0' },
    paths: {
      '/api/ingest': { post: { summary: 'Ingest a document' } },
      '/api/search': { post: { summary: 'Search knowledge base and experts' } },
      '/api/friday': { post: { summary: 'Weekly check-in updates' } },
      '/api/expertise': { get: { summary: 'Get expertise for employee' } },
      '/api/graph': { get: { summary: 'Topic graph' } },
      '/api/privacy/export': { get: { summary: 'Export my data' } },
      '/api/privacy/delete': { delete: { summary: 'Delete my data' } },
      '/healthz': { get: { summary: 'Health' } }
    }
  });
});

