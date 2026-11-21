import { eq } from 'drizzle-orm';
import { Router } from 'express';
import type { ServerStatusSnapshot } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { serverStatusRowToDomain } from '../mappers';
import { serverStatus } from '../schema';

/**
 * ლაივ სერვერის სტატუსი (singleton ჩანაწერი id=1).
 *
 * ენდპოინტები:
 *   GET /api/server-status  → მიმდინარე სტატუსი
 *   PUT /api/server-status  → სტატუსის განახლება (ნაწილობრივი patch)
 */

export const serverStatusRouter = Router();

serverStatusRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(serverStatus)
      .where(eq(serverStatus.id, 1))
      .limit(1);
    if (!rows[0]) {
      res.status(404).json({ error: 'სტატუსი ჯერ არ არის ინიციალიზებული' });
      return;
    }
    res.json(serverStatusRowToDomain(rows[0]));
  }),
);

serverStatusRouter.put(
  '/',
  adminGuard,
  asyncHandler(async (req, res) => {
    const patch = (req.body ?? {}) as Partial<ServerStatusSnapshot>;
    await db
      .insert(serverStatus)
      .values({ id: 1, ...patch, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: serverStatus.id,
        set: { ...patch, updatedAt: new Date() },
      });
    res.json({ ok: true });
  }),
);
