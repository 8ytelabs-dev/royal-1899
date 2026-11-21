import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import type { RuleCategoryMeta, ServerRule } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import {
  ruleCategoryDomainToRow,
  ruleCategoryRowToDomain,
  ruleDomainToRow,
  ruleRowToDomain,
} from '../mappers';
import { ruleCategories, rules } from '../schema';

/**
 * სერვერის წესები და წესების თავები (კატეგორიები).
 *
 * ენდპოინტები:
 *   GET    /api/rules            → ყველა წესი (position-ის მიხედვით)
 *   PUT    /api/rules/:id        → წესის შექმნა/განახლება (upsert)
 *   DELETE /api/rules/:id        → წესის წაშლა
 *   GET    /api/rule-categories  → თავები (position-ის მიხედვით)
 *   PUT    /api/rule-categories  → თავების სიის ჩანაცვლება (დამატება/რედაქტირება/გადალაგება)
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

export const ruleCategoriesRouter = Router();

ruleCategoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(ruleCategories)
      .orderBy(ruleCategories.position);
    res.json(rows.map(ruleCategoryRowToDomain));
  }),
);

ruleCategoriesRouter.put(
  '/',
  adminGuard,
  asyncHandler(async (req, res) => {
    const categories = req.body as RuleCategoryMeta[];
    if (
      !Array.isArray(categories) ||
      categories.some((c) => !c?.id || !c?.label)
    ) {
      res.status(400).json({ error: 'საჭიროა თავების მასივი id და label ველებით' });
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(ruleCategories);
      if (categories.length > 0) {
        await tx
          .insert(ruleCategories)
          .values(
            categories.map((category, index) =>
              ruleCategoryDomainToRow(category, index),
            ),
          );
      }
    });
    res.json({ ok: true });
  }),
);
