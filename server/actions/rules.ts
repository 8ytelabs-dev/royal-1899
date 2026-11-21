import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import type { ServerRule } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { ruleDomainToRow, ruleRowToDomain } from '../mappers';
import { rules } from '../schema';

/**
 * სერვერის წესები.
 *
 * ენდპოინტები:
 *   GET    /api/rules      → ყველა წესი (position-ის მიხედვით)
 *   PUT    /api/rules/:id  → წესის შექმნა/განახლება (upsert)
 *   DELETE /api/rules/:id  → წესის წაშლა
 */

export const rulesRouter = Router();

rulesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(rules).orderBy(rules.position);
    res.json(rows.map(ruleRowToDomain));
  }),
);

rulesRouter.put(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    const rule = req.body as ServerRule;
    if (!rule || rule.id !== req.params.id || !rule.title) {
      res.status(400).json({ error: 'არასწორი წესის მონაცემები' });
      return;
    }
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${rules.position}), -1) + 1` })
      .from(rules);
    const row = ruleDomainToRow(rule, next);
    await db
      .insert(rules)
      .values(row)
      .onConflictDoUpdate({
        target: rules.id,
        set: { ...row, position: undefined, createdAt: undefined },
      });
    res.json({ ok: true });
  }),
);

rulesRouter.delete(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    await db.delete(rules).where(eq(rules.id, req.params.id));
    res.json({ ok: true });
  }),
);
