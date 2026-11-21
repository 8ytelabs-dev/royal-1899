import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import { mediaAssets } from '../schema';

/**
 * ფაილების ატვირთვა persistent საცავში (Railway volume → /storage).
 *
 * ენდპოინტები:
 *   POST /api/uploads?name=<fileName>&kind=<image|video>&context=<ctx>
 *     body: ფაილის raw ბინარული შიგთავსი (Content-Type: image/* ან video/*)
 *     პასუხი: { url: "/storage/<file>" } — URL ასევე რეგისტრირდება media_assets-ში
 */

export const STORAGE_DIR =
  process.env.STORAGE_DIR ??
  (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'storage'));

fs.mkdirSync(STORAGE_DIR, { recursive: true });

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

function resolveExtension(contentType: string, originalName: string): string {
  const fromMime = EXTENSION_BY_MIME[contentType.split(';')[0].trim()];
  if (fromMime) {
    return fromMime;
  }
  const fromName = path.extname(originalName).replace('.', '').toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(fromName) ? fromName : 'bin';
}

export const uploadsRouter = Router();

uploadsRouter.post(
  '/',
  adminGuard,
  express.raw({ type: () => true, limit: '300mb' }),
  asyncHandler(async (req, res) => {
    const body = req.body as Buffer;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(400).json({ error: 'ფაილის შიგთავსი ცარიელია' });
      return;
    }
    const contentType = req.headers['content-type'] ?? 'application/octet-stream';
    const kind = req.query.kind === 'video' ? 'video' : 'image';
    const originalName = typeof req.query.name === 'string' ? req.query.name : '';
    const context =
      typeof req.query.context === 'string' ? req.query.context : null;

    const extension = resolveExtension(String(contentType), originalName);
    const fileName = `${Date.now().toString(36)}-${crypto
      .randomBytes(6)
      .toString('hex')}.${extension}`;

    await fs.promises.writeFile(path.join(STORAGE_DIR, fileName), body);

    const url = `/storage/${fileName}`;
    await db.insert(mediaAssets).values({
      url,
      type: kind,
      alt: originalName || null,
      context,
    });

    res.status(201).json({ url });
  }),
);
