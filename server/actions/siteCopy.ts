import { Router } from 'express';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { siteCopy } from '../schema';

/**
 * საიტის ტექსტები (copy) — SiteCopyState-ის სექციები ინახება jsonb-ად.
 *
 * ენდპოინტები:
 *   GET /api/copy           → ყველა სექცია ერთ ობიექტად
 *   PUT /api/copy/:section  → ერთი სექციის ჩანაცვლება/განახლება
 */

const VALID_SECTIONS = new Set([
  'general',
  'hero',
  'home',
  'store',
  'rules',
  'map',
  'guide',
  'bounties',
  'cabinet',
]);

export const siteCopyRouter = Router();

siteCopyRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(siteCopy);
    const copy: Record<string, unknown> = {};
    for (const row of rows) {
      copy[row.section] = row.data;
    }
    res.json(copy);
  }),
);

siteCopyRouter.put(
  '/:section',
  adminGuard,
  asyncHandler(async (req, res) => {
    const { section } = req.params;
    if (!VALID_SECTIONS.has(section)) {
      res.status(400).json({ error: `უცნობი სექცია: ${section}` });
      return;
    }
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'სექციის data უნდა იყოს ობიექტი' });
      return;
    }
    await db
      .insert(siteCopy)
      .values({ section, data: req.body, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteCopy.section,
        set: { data: req.body, updatedAt: new Date() },
      });
    res.json({ ok: true });
  }),
);
