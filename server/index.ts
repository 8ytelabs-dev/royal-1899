import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import { authRouter } from './actions/auth';
import { contentRouter, ensureSeeded } from './actions/content';
import { guideRouter } from './actions/guide';
import { mapLocationsRouter } from './actions/mapLocations';
import { mediaRouter } from './actions/media';
import { productsRouter } from './actions/products';
import { ruleCategoriesRouter, rulesRouter } from './actions/rules';
import { storeCategoriesRouter } from './actions/storeCategories';
import { serverStatusRouter } from './actions/serverStatus';
import { siteCopyRouter } from './actions/siteCopy';
import { STORAGE_DIR, uploadsRouter } from './actions/uploads';
import { wantedRouter } from './actions/wanted';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

/* ატვირთული მედია — Railway volume (/storage) */
app.use(
  '/storage',
  express.static(STORAGE_DIR, { maxAge: '30d', immutable: true }),
);

/* API — თითო დომენი ცალკე action მოდულში */
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/copy', siteCopyRouter);
app.use('/api/media', mediaRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/products', productsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/rule-categories', ruleCategoriesRouter);
app.use('/api/map-locations', mapLocationsRouter);
app.use('/api/server-status', serverStatusRouter);
app.use('/api/store-categories', storeCategoriesRouter);
app.use('/api/guide', guideRouter);
app.use('/api/wanted', wantedRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/* Production: ფრონტის build-ის სერვინგი (Railway-ზე ერთი სერვისი ემსახურება ორივეს) */
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/storage')
    ) {
      res.sendFile(path.join(distDir, 'index.html'));
      return;
    }
    next();
  });
}

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
