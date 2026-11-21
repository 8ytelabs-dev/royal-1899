import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { mediaAssets } from '../schema';

/**
 * ატვირთული მედიის (ფოტო/ვიდეო) URL-ების რეესტრი.
 *
 * ენდპოინტები:
 *   GET    /api/media       → ყველა ჩანაწერი (ბოლოები პირველები)
 *   POST   /api/media       → ახალი მედია-ჩანაწერის რეგისტრაცია { url, type?, alt?, context? }
 *   DELETE /api/media/:id   → ჩანაწერის წაშლა
 */

export const mediaRouter = Router();

mediaRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(mediaAssets)
      .orderBy(mediaAssets.createdAt);
    res.json(rows.reverse());
  }),
);

mediaRouter.post(
  '/',
  adminGuard,
  asyncHandler(async (req, res) => {
    const { url, type, alt, context } = (req.body ?? {}) as {
      url?: string;
      type?: string;
      alt?: string;
      context?: string;
    };
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'საჭიროა მედიის url' });
      return;
    }
    if (type && type !== 'image' && type !== 'video') {
      res.status(400).json({ error: "type უნდა იყოს 'image' ან 'video'" });
      return;
    }
    const [row] = await db
      .insert(mediaAssets)
      .values({
        url,
        type: type ?? 'image',
        alt: alt ?? null,
        context: context ?? null,
      })
      .returning();
    res.status(201).json(row);
  }),
);

mediaRouter.delete(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, req.params.id));
    res.json({ ok: true });
  }),
);
