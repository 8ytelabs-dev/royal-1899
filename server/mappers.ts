import type {
  GuideFaqItem,
  GuideStep,
  KeybindItem,
  MapLocation,
  RuleCategoryMeta,
  ServerRule,
  ServerStatusSnapshot,
  StoreProduct,
  WantedSuspect,
} from '../src/types';
import type {
  guideFaqs,
  guideSteps,
  keybinds,
  mapLocations,
  products,
  ruleCategories,
  rules,
  serverStatus,
  wantedSuspects,
} from './schema';

type ProductRow = typeof products.$inferSelect;
type RuleRow = typeof rules.$inferSelect;
type MapLocationRow = typeof mapLocations.$inferSelect;
type ServerStatusRow = typeof serverStatus.$inferSelect;
type GuideStepRow = typeof guideSteps.$inferSelect;
type KeybindRow = typeof keybinds.$inferSelect;
type GuideFaqRow = typeof guideFaqs.$inferSelect;
type WantedRow = typeof wantedSuspects.$inferSelect;

/* ---------------------------- Products ---------------------------- */

export function productRowToDomain(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as StoreProduct['category'],
    categoryLabel: row.categoryLabel,
    priceGel: row.priceGel,
    billingCycle: row.billingCycle,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    imageUrl: row.imageUrl,
    galleryImages: row.galleryImages ?? undefined,
    imageAlt: row.imageAlt,
    featured: row.featured,
    deliveryNote: row.deliveryNote,
    perks: row.perks ?? [],
  };
}

export function productDomainToRow(
  product: StoreProduct,
  position: number,
): typeof products.$inferInsert {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: product.categoryLabel,
    priceGel: product.priceGel,
    billingCycle: product.billingCycle,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    imageUrl: product.imageUrl,
    galleryImages: product.galleryImages ?? null,
    imageAlt: product.imageAlt,
    featured: product.featured,
    deliveryNote: product.deliveryNote,
    perks: product.perks,
    position,
    updatedAt: new Date(),
  };
}

/* ------------------------------ Rules ----------------------------- */

type RuleCategoryRow = typeof ruleCategories.$inferSelect;

export function ruleCategoryRowToDomain(row: RuleCategoryRow): RuleCategoryMeta {
  return {
    id: row.id,
    label: row.label,
    chapterNumber: row.chapterNumber ?? undefined,
  };
}

export function ruleCategoryDomainToRow(
  category: RuleCategoryMeta,
  position: number,
): typeof ruleCategories.$inferInsert {
  return {
    id: category.id,
    label: category.label,
    chapterNumber: category.chapterNumber ?? null,
    position,
  };
}

export function ruleRowToDomain(row: RuleRow): ServerRule {
  return {
    id: row.id,
    code: row.code,
    category: row.category as ServerRule['category'],
    categoryLabel: row.categoryLabel,
    title: row.title,
    summary: row.summary,
    details: row.details,
    example: row.example ?? undefined,
    penalty: row.penalty,
  };
}

export function ruleDomainToRow(
  rule: ServerRule,
  position: number,
): typeof rules.$inferInsert {
  return {
    id: rule.id,
    code: rule.code,
    category: rule.category,
    categoryLabel: rule.categoryLabel,
    title: rule.title,
    summary: rule.summary,
    details: rule.details,
    example: rule.example ?? null,
    penalty: rule.penalty,
    position,
    updatedAt: new Date(),
  };
}

/* -------------------------- Map locations ------------------------- */

export function mapLocationRowToDomain(row: MapLocationRow): MapLocation {
  return {
    id: row.id,
    realm: row.realm as MapLocation['realm'],
    name: row.name,
    category: row.category as MapLocation['category'],
    categoryLabel: row.categoryLabel,
    region: row.region as MapLocation['region'],
    regionLabel: row.regionLabel ?? undefined,
    status: row.status as MapLocation['status'],
    priceGel: row.priceGel ?? undefined,
    coords: { x: row.coordX, y: row.coordY },
    mapPos: { x: row.mapPosX, y: row.mapPosY },
    summary: row.summary,
    features: row.features ?? [],
    imageUrl: row.imageUrl,
    galleryImages: row.galleryImages ?? undefined,
    imageAlt: row.imageAlt,
  };
}

export function mapLocationDomainToRow(
  location: MapLocation,
  position: number,
): typeof mapLocations.$inferInsert {
  return {
    id: location.id,
    realm: location.realm,
    name: location.name,
    category: location.category,
    categoryLabel: location.categoryLabel,
    region: location.region,
    regionLabel: location.regionLabel ?? null,
    status: location.status,
    priceGel: location.priceGel ?? null,
    coordX: location.coords.x,
    coordY: location.coords.y,
    mapPosX: location.mapPos.x,
    mapPosY: location.mapPos.y,
    summary: location.summary,
    features: location.features,
    imageUrl: location.imageUrl,
    galleryImages: location.galleryImages ?? null,
    imageAlt: location.imageAlt,
    position,
    updatedAt: new Date(),
  };
}

/* -------------------------- Server status ------------------------- */

export function serverStatusRowToDomain(
  row: ServerStatusRow,
): ServerStatusSnapshot {
  return {
    online: row.online,
    playersOnline: row.playersOnline,
    maxPlayers: row.maxPlayers,
    queueCount: row.queueCount,
    inGameTime: row.inGameTime,
    nextRestart: row.nextRestart,
    redmLaunchUrl: row.redmLaunchUrl,
  };
}

/* ------------------------------ Guide ----------------------------- */

export function guideStepRowToDomain(row: GuideStepRow): GuideStep {
  return {
    stepNumber: row.stepNumber,
    title: row.title,
    summary: row.summary,
    details: row.details,
    actionLabel: row.actionLabel ?? undefined,
    actionHref: row.actionHref ?? undefined,
    actionType: (row.actionType as GuideStep['actionType']) ?? undefined,
    actionRoute: (row.actionRoute as GuideStep['actionRoute']) ?? undefined,
  };
}

export function guideStepDomainToRow(
  step: GuideStep,
  position: number,
): typeof guideSteps.$inferInsert {
  return {
    stepNumber: step.stepNumber,
    title: step.title,
    summary: step.summary,
    details: step.details,
    actionLabel: step.actionLabel ?? null,
    actionHref: step.actionHref ?? null,
    actionType: step.actionType ?? null,
    actionRoute: step.actionRoute ?? null,
    position,
  };
}

export function keybindRowToDomain(row: KeybindRow): KeybindItem {
  return {
    id: row.id,
    keys: row.keys ?? [],
    action: row.action,
    description: row.description,
    category: row.category as KeybindItem['category'],
    categoryLabel: row.categoryLabel,
  };
}

export function keybindDomainToRow(
  item: KeybindItem,
  position: number,
): typeof keybinds.$inferInsert {
  return {
    id: item.id,
    keys: item.keys,
    action: item.action,
    description: item.description,
    category: item.category,
    categoryLabel: item.categoryLabel,
    position,
  };
}

export function guideFaqRowToDomain(row: GuideFaqRow): GuideFaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
  };
}

export function guideFaqDomainToRow(
  faq: GuideFaqItem,
  position: number,
): typeof guideFaqs.$inferInsert {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    position,
  };
}

/* ------------------------------ Wanted ----------------------------- */

export function wantedRowToDomain(row: WantedRow): WantedSuspect {
  return {
    id: row.id,
    name: row.name,
    alias: row.alias,
    rewardUsd: row.rewardUsd,
    status: row.status as WantedSuspect['status'],
    dangerLevel: row.dangerLevel,
    lastSeenRegion: row.lastSeenRegion,
    linkedMapId: row.linkedMapId,
    linkedMapRealm: row.linkedMapRealm as WantedSuspect['linkedMapRealm'],
    charges: row.charges ?? [],
    dossier: row.dossier,
    issuedBy: row.issuedBy,
    portraitUrl: row.portraitUrl,
    portraitAlt: row.portraitAlt,
  };
}

export function wantedDomainToRow(
  suspect: WantedSuspect,
  position: number,
): typeof wantedSuspects.$inferInsert {
  return {
    id: suspect.id,
    name: suspect.name,
    alias: suspect.alias,
    rewardUsd: suspect.rewardUsd,
    status: suspect.status,
    dangerLevel: suspect.dangerLevel,
    lastSeenRegion: suspect.lastSeenRegion,
    linkedMapId: suspect.linkedMapId,
    linkedMapRealm: suspect.linkedMapRealm,
    charges: suspect.charges,
    dossier: suspect.dossier,
    issuedBy: suspect.issuedBy,
    portraitUrl: suspect.portraitUrl,
    portraitAlt: suspect.portraitAlt,
    position,
    updatedAt: new Date(),
  };
}
