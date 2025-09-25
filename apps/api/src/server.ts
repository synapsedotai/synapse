import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { initExtensions } from './db.js';
import { healthRouter } from './routes/health.js';
import { ingestRouter } from './routes/ingest.js';
import { searchRouter } from './routes/search.js';
import { fridayRouter } from './routes/friday.js';
import { expertiseRouter } from './routes/expertise.js';
import { graphRouter } from './routes/graph.js';
import { privacyRouter } from './routes/privacy.js';
import { meetingsRouter } from './routes/meetings.js';
import { profileRouter } from './routes/profile.js';

async function main() {
  try {
    await initExtensions();
  } catch (e) {
    console.warn('[api] DB init failed, continuing to start server for /healthz. Error:', (e as any)?.message ?? e);
  }
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  app.use(healthRouter);
  app.use(ingestRouter);
  app.use(searchRouter);
  app.use(fridayRouter);
  app.use(expertiseRouter);
  app.use(graphRouter);
  app.use(privacyRouter);
  app.use(meetingsRouter);
  app.use(profileRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error('error', message);
    res.status(500).json({ error: 'internal_error' });
  });

  app.listen(env.PORT, () => {
    console.log(`[api] listening on ${env.PORT}`);
  });
}

main().catch((e) => {
  console.error('fatal', e);
  process.exit(1);
});


