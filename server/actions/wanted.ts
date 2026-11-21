import { Router } from 'express';
import type { WantedSuspect } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { wantedDomainToRow, wantedRowToDomain } from '../mappers';
import { wantedSuspects } from '../schema';

/**
 * ძებნილთა დაფა.
 * ადმინ პანელი სიას მთლიანად ანაცვლებს, ამიტომ PUT = replace-all.
 *
 * ენდპოინტები:
 *   GET /api/wanted  → ყველა ძებნილი
 *   PUT /api/wanted  → სიის ჩანაცვლება
 */

export const wantedRouter = Router();

wantedRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(wantedSuspects)
      .orderBy(wantedSuspects.position);
    res.json(rows.map(wantedRowToDomain));
  }),
);

wantedRouter.put(
  '/',
  adminGuard,
  asyncHandler(async (req, res) => {
    const suspects = req.body as WantedSuspect[];
    if (!Array.isArray(suspects)) {
      res.status(400).json({ error: 'საჭიროა ძებნილების მასივი' });
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(wantedSuspects);
      if (suspects.length > 0) {
        await tx
          .insert(wantedSuspects)
          .values(
            suspects.map((suspect, index) => wantedDomainToRow(suspect, index)),
          );
      }
    });
    res.json({ ok: true });
  }),
);
