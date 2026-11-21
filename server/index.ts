import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import { authRouter } from './actions/auth';
import { contentRouter, ensureSeeded } from './actions/content';
import { guideRouter } from './actions/guide';
import { mapLocationsRouter } from './actions/mapLocations';
import { mediaRouter } from './actions/media';
import { productsRouter } from './actions/products';
import { rulesRouter } from './actions/rules';
import { serverStatusRouter } from './actions/serverStatus';
import { siteCopyRouter } from './actions/siteCopy';
import { wantedRouter } from './actions/wanted';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

/* API — თითო დომენი ცალკე action მოდულში */
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/copy', siteCopyRouter);
app.use('/api/media', mediaRouter);
app.use('/api/products', productsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/map-locations', mapLocationsRouter);
app.use('/api/server-status', serverStatusRouter);
app.use('/api/guide', guideRouter);
app.use('/api/wanted', wantedRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/* ცენტრალიზებული შეცდომების დამუშავება */
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[api] error:', err);
    res.status(500).json({ error: 'სერვერის შიდა შეცდომა' });
  },
);

const PORT = Number(process.env.PORT ?? 3001);

async function main() {
  await ensureSeeded();
  app.listen(PORT, () => {
    console.log(`[api] გაშვებულია http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error('[api] გაშვება ვერ მოხერხდა:', error);
  process.exit(1);
});
