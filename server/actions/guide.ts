import { Router } from 'express';
import type { GuideFaqItem, GuideStep, KeybindItem } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import {
  guideFaqDomainToRow,
  guideFaqRowToDomain,
  guideStepDomainToRow,
  guideStepRowToDomain,
  keybindDomainToRow,
  keybindRowToDomain,
} from '../mappers';
import { guideFaqs, guideSteps, keybinds } from '../schema';

/**
 * დაწყების გზამკვლევი — ნაბიჯები, კლავიშები და FAQ.
 * ადმინ პანელი ამ სიებს მთლიანად ანაცვლებს, ამიტომ PUT = replace-all.
 *
 * ენდპოინტები:
 *   GET /api/guide/steps     | PUT /api/guide/steps
 *   GET /api/guide/keybinds  | PUT /api/guide/keybinds
 *   GET /api/guide/faqs      | PUT /api/guide/faqs
 */

export const guideRouter = Router();

guideRouter.get(
  '/steps',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(guideSteps).orderBy(guideSteps.position);
    res.json(rows.map(guideStepRowToDomain));
  }),
);

guideRouter.put(
  '/steps',
  adminGuard,
  asyncHandler(async (req, res) => {
    const steps = req.body as GuideStep[];
    if (!Array.isArray(steps)) {
      res.status(400).json({ error: 'საჭიროა ნაბიჯების მასივი' });
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(guideSteps);
      if (steps.length > 0) {
        await tx
          .insert(guideSteps)
          .values(steps.map((step, index) => guideStepDomainToRow(step, index)));
      }
    });
    res.json({ ok: true });
  }),
);

guideRouter.get(
  '/keybinds',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(keybinds).orderBy(keybinds.position);
    res.json(rows.map(keybindRowToDomain));
  }),
);

guideRouter.put(
  '/keybinds',
  adminGuard,
  asyncHandler(async (req, res) => {
    const items = req.body as KeybindItem[];
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'საჭიროა კლავიშების მასივი' });
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(keybinds);
      if (items.length > 0) {
        await tx
          .insert(keybinds)
          .values(items.map((item, index) => keybindDomainToRow(item, index)));
      }
    });
    res.json({ ok: true });
  }),
);

guideRouter.get(
  '/faqs',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(guideFaqs).orderBy(guideFaqs.position);
    res.json(rows.map(guideFaqRowToDomain));
  }),
);

guideRouter.put(
  '/faqs',
  adminGuard,
  asyncHandler(async (req, res) => {
    const faqs = req.body as GuideFaqItem[];
    if (!Array.isArray(faqs)) {
      res.status(400).json({ error: 'საჭიროა FAQ-ების მასივი' });
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(guideFaqs);
      if (faqs.length > 0) {
        await tx
          .insert(guideFaqs)
          .values(faqs.map((faq, index) => guideFaqDomainToRow(faq, index)));
      }
    });
    res.json({ ok: true });
  }),
);
