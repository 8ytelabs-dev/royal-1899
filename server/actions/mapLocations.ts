import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import type { MapLocation } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { mapLocationDomainToRow, mapLocationRowToDomain } from '../mappers';
import { mapLocations } from '../schema';

/**
 * რუკის ლოკაციები — სახლები, რანჩოები, ლენდმარკები (mainland + cuba).
 *
 * ენდპოინტები:
 *   GET    /api/map-locations      → ყველა ლოკაცია (position-ის მიხედვით)
 *   PUT    /api/map-locations/:id  → ლოკაციის შექმნა/განახლება (upsert)
 *   DELETE /api/map-locations/:id  → ლოკაციის წაშლა
 */

export const mapLocationsRouter = Router();

mapLocationsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(mapLocations)
      .orderBy(mapLocations.position);
    res.json(rows.map(mapLocationRowToDomain));
  }),
);

mapLocationsRouter.put(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    const location = req.body as MapLocation;
    if (!location || location.id !== req.params.id || !location.name) {
      res.status(400).json({ error: 'არასწორი ლოკაციის მონაცემები' });
      return;
    }
    const [{ next }] = await db
      .select({
        next: sql<number>`coalesce(max(${mapLocations.position}), -1) + 1`,
      })
      .from(mapLocations);
    const row = mapLocationDomainToRow(location, next);
    await db
      .insert(mapLocations)
      .values(row)
      .onConflictDoUpdate({
        target: mapLocations.id,
        set: { ...row, position: undefined, createdAt: undefined },
      });
    res.json({ ok: true });
  }),
);

mapLocationsRouter.delete(
  '/:id',
  adminGuard,
  asyncHandler(async (req, res) => {
    await db.delete(mapLocations).where(eq(mapLocations.id, req.params.id));
    res.json({ ok: true });
  }),
);
