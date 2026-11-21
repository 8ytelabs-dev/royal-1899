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
 * ლაივ მონაცემები: თუ გარემოში მითითებულია REDM_SERVER_URL (მაგ. http://1.2.3.4:30120)
 * ან REDM_CFX_CODE (cfx.re join კოდი), playersOnline/maxPlayers/online ავტომატურად
 * იკითხება RedM სერვერიდან და გადაფარავს ბაზაში შენახულ მნიშვნელობებს.
 *
 * ენდპოინტები:
 *   GET /api/server-status  → მიმდინარე სტატუსი (ლაივ მონაცემებით, თუ კონფიგურირებულია)
 *   PUT /api/server-status  → სტატუსის განახლება (ნაწილობრივი patch)
 */

const LIVE_CACHE_MS = 15_000;
let liveCache: {
  at: number;
  data: Partial<ServerStatusSnapshot> | null;
} = { at: 0, data: null };

async function fetchLiveStatus(): Promise<Partial<ServerStatusSnapshot> | null> {
  const directUrl = process.env.REDM_SERVER_URL;
  const cfxCode = process.env.REDM_CFX_CODE;
  if (!directUrl && !cfxCode) {
    return null;
  }
  if (Date.now() - liveCache.at < LIVE_CACHE_MS) {
    return liveCache.data;
  }

  let data: Partial<ServerStatusSnapshot>;
  try {
    if (directUrl) {
      // RedM/FiveM სერვერის ჩაშენებული ენდპოინტი
      const response = await fetch(
        `${directUrl.replace(/\/+$/, '')}/dynamic.json`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!response.ok) {
        throw new Error(`dynamic.json → ${response.status}`);
      }
      const json = (await response.json()) as {
        clients?: number;
        sv_maxclients?: number | string;
      };
      data = {
        online: true,
        playersOnline: Number(json.clients ?? 0),
        maxPlayers: Number(json.sv_maxclients ?? 0),
      };
    } else {
      // FiveM master list API — cfx.re join კოდით
      const response = await fetch(
        `https://servers-frontend.fivem.net/api/servers/single/${cfxCode}`,
        {
          headers: { 'User-Agent': 'royal-1899-status/1.0' },
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok) {
        throw new Error(`cfx api → ${response.status}`);
      }
      const json = (await response.json()) as {
        Data?: { clients?: number; sv_maxclients?: number };
      };
      data = {
        online: true,
        playersOnline: Number(json.Data?.clients ?? 0),
        maxPlayers: Number(json.Data?.sv_maxclients ?? 0),
      };
    }
  } catch {
    // სერვერი გამორთულია ან მიუწვდომელია
    data = { online: false, playersOnline: 0 };
  }

  liveCache = { at: Date.now(), data };
  return data;
}

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
    const stored = serverStatusRowToDomain(rows[0]);
    const live = await fetchLiveStatus();
    res.json({ ...stored, ...(live ?? {}) });
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
