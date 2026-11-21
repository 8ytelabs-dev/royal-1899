import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import type { StoreProduct } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { productDomainToRow, productRowToDomain } from '../mappers';
import { products } from '../schema';

/**
 * მაღაზიის პროდუქტები.
 *
 * ენდპოინტები:
 *   GET    /api/products      → ყველა პროდუქტი (position-ის მიხედვით)
 *   PUT    /api/products/:id  → პროდუქტის შექმნა/განახლება (upsert)
 *   DELETE /api/products/:id  → პროდუქტის წაშლა
 */

export const productsRouter = Router();

productsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(products).orderBy(products.position);
    res.json(rows.map(productRowToDomain));
  }),
);

productsRouter.put(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    const product = req.body as StoreProduct;
    if (!product || product.id !== req.params.id || !product.name) {
      res.status(400).json({ error: 'არასწორი პროდუქტის მონაცემები' });
      return;
    }
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${products.position}), -1) + 1` })
      .from(products);
    const row = productDomainToRow(product, next);
    await db
      .insert(products)
      .values(row)
      .onConflictDoUpdate({
        target: products.id,
        set: { ...row, position: undefined, createdAt: undefined },
      });
    res.json({ ok: true });
  }),
);

productsRouter.delete(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ ok: true });
  }),
);
