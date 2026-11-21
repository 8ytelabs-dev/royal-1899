import { Router } from 'express';
import { createDefaultSiteContent, DEFAULT_SITE_COPY } from '../../src/lib/cmsLogic';
import type { SiteContentState, SiteCopyState } from '../../src/types';
import { db } from '../db';
import { adminGuard, asyncHandler } from '../http';
import {
  guideFaqDomainToRow,
  guideFaqRowToDomain,
  guideStepDomainToRow,
  guideStepRowToDomain,
  keybindDomainToRow,
  keybindRowToDomain,
  mapLocationDomainToRow,
  mapLocationRowToDomain,
  productDomainToRow,
  productRowToDomain,
  ruleDomainToRow,
  ruleRowToDomain,
  serverStatusRowToDomain,
  wantedDomainToRow,
  wantedRowToDomain,
} from '../mappers';
import {
  guideFaqs,
  guideSteps,
  keybinds,
  mapLocations,
  products,
  rules,
  serverStatus,
  siteCopy,
  wantedSuspects,
} from '../schema';
import { fetchLiveStatus } from './serverStatus';

/**
 * მთლიანი საიტის კონტენტის აგრეგატი.
 *
 * ენდპოინტები:
 *   GET  /api/content        → { initialized, content: SiteContentState }
 *   PUT  /api/content        → მთლიანი კონტენტის ჩანაცვლება (import)
 *   POST /api/content/reset  → default კონტენტზე დაბრუნება
 */

export async function readFullContent(): Promise<{
  initialized: boolean;
  content: SiteContentState;
}> {
  const [
    copyRows,
    statusRows,
    productRows,
    ruleRows,
    locationRows,
    stepRows,
    keybindRows,
    faqRows,
    wantedRows,
    liveStatus,
  ] = await Promise.all([
    db.select().from(siteCopy),
    db.select().from(serverStatus),
    db.select().from(products).orderBy(products.position),
    db.select().from(rules).orderBy(rules.position),
    db.select().from(mapLocations).orderBy(mapLocations.position),
    db.select().from(guideSteps).orderBy(guideSteps.position),
    db.select().from(keybinds).orderBy(keybinds.position),
    db.select().from(guideFaqs).orderBy(guideFaqs.position),
    db.select().from(wantedSuspects).orderBy(wantedSuspects.position),
    fetchLiveStatus(),
  ]);

  const defaults = createDefaultSiteContent();
  const copy: SiteCopyState = { ...DEFAULT_SITE_COPY };
  for (const row of copyRows) {
    const section = row.section as keyof SiteCopyState;
    if (section in copy) {
      (copy as unknown as Record<string, unknown>)[section] = row.data;
    }
  }

  return {
    initialized: copyRows.length > 0,
    content: {
      copy,
      serverStatus: {
        ...(statusRows[0]
          ? serverStatusRowToDomain(statusRows[0])
          : defaults.serverStatus),
        ...(liveStatus ?? {}),
      },
      products: productRows.map(productRowToDomain),
      rules: ruleRows.map(ruleRowToDomain),
      mapLocations: locationRows.map(mapLocationRowToDomain),
      guideSteps: stepRows.map(guideStepRowToDomain),
      keybinds: keybindRows.map(keybindRowToDomain),
      guideFaqs: faqRows.map(guideFaqRowToDomain),
      wantedSuspects: wantedRows.map(wantedRowToDomain),
    },
  };
}

export async function replaceFullContent(state: SiteContentState): Promise<void> {
  await db.transaction(async (tx) => {
    const now = new Date();

    for (const [section, data] of Object.entries(state.copy)) {
      await tx
        .insert(siteCopy)
        .values({ section, data, updatedAt: now })
        .onConflictDoUpdate({
          target: siteCopy.section,
          set: { data, updatedAt: now },
        });
    }

    await tx
      .insert(serverStatus)
      .values({ id: 1, ...state.serverStatus, updatedAt: now })
      .onConflictDoUpdate({
        target: serverStatus.id,
        set: { ...state.serverStatus, updatedAt: now },
      });

    await tx.delete(products);
    if (state.products.length > 0) {
      await tx
        .insert(products)
        .values(state.products.map((p, i) => productDomainToRow(p, i)));
    }

    await tx.delete(rules);
    if (state.rules.length > 0) {
      await tx
        .insert(rules)
        .values(state.rules.map((r, i) => ruleDomainToRow(r, i)));
    }

    await tx.delete(mapLocations);
    if (state.mapLocations.length > 0) {
      await tx
        .insert(mapLocations)
        .values(state.mapLocations.map((l, i) => mapLocationDomainToRow(l, i)));
    }

    await tx.delete(guideSteps);
    if (state.guideSteps.length > 0) {
      await tx
        .insert(guideSteps)
        .values(state.guideSteps.map((s, i) => guideStepDomainToRow(s, i)));
    }

    await tx.delete(keybinds);
    if (state.keybinds.length > 0) {
      await tx
        .insert(keybinds)
        .values(state.keybinds.map((k, i) => keybindDomainToRow(k, i)));
    }

    await tx.delete(guideFaqs);
    if (state.guideFaqs.length > 0) {
      await tx
        .insert(guideFaqs)
        .values(state.guideFaqs.map((f, i) => guideFaqDomainToRow(f, i)));
    }

    await tx.delete(wantedSuspects);
    if (state.wantedSuspects.length > 0) {
      await tx
        .insert(wantedSuspects)
        .values(state.wantedSuspects.map((w, i) => wantedDomainToRow(w, i)));
    }
  });
}

/** ბაზის პირველადი შევსება default კონტენტით, თუ ცარიელია. */
export async function ensureSeeded(): Promise<void> {
  const { initialized } = await readFullContent();
  if (!initialized) {
    await replaceFullContent(createDefaultSiteContent());
    console.log('[db] ბაზა შეივსო default კონტენტით');
  }
}

export const contentRouter = Router();

contentRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await readFullContent());
  }),
);

contentRouter.put(
  '/',
  adminGuard,
  asyncHandler(async (req, res) => {
    const state = req.body as SiteContentState;
    if (!state || typeof state !== 'object' || !state.copy) {
      res.status(400).json({ error: 'არასწორი კონტენტის ფორმატი' });
      return;
    }
    await replaceFullContent(state);
    res.json({ ok: true });
  }),
);

contentRouter.post(
  '/reset',
  adminGuard,
  asyncHandler(async (_req, res) => {
    await replaceFullContent(createDefaultSiteContent());
    res.json({ ok: true });
  }),
);
