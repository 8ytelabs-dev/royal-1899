import { sql } from 'drizzle-orm';
import { Router } from 'express';
import type { StoreCategory } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { storeCategoryDomainToRow, storeCategoryRowToDomain } from '../mappers';
import { storeCategories } from '../schema';

/**
 * მაღაზიის კატეგორიები.
 *
 * ენდპოინტები:
 *   GET  /api/store-categories  → კატეგორიები (position-ის მიხედვით)
 *   PUT  /api/store-categories  → კატეგორიების სიის ჩანაცვლება (დამატება/რედაქტირება/გადალაგება)
 */

export const storeCategoriesRouter = Router();

storeCategoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(storeCategories)
      .orderBy(storeCategories.position);
    res.json(rows.map(storeCategoryRowToDomain));
  }),
);

storeCategoriesRouter.put(
  '/',
  adminGuard,
  asyncHandler(async (req, res) => {
    const categories = req.body as StoreCategory[];
    if (
      !Array.isArray(categories) ||
      categories.some((c) => !c?.id || !c?.label)
    ) {
      res.status(400).json({
        error: 'საჭიროა კატეგორიების მასივი id და label ველებით',
      });
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(storeCategories);
      if (categories.length > 0) {
        await tx
          .insert(storeCategories)
          .values(
            categories.map((category, index) =>
              storeCategoryDomainToRow(category, index),
            ),
          );
      }
    });
    res.json({ ok: true });
  }),
);
