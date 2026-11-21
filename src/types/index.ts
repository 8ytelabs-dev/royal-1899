export type AppRoute =
  | '/'
  | '/store'
  | '/rules'
  | '/map'
  | '/guide'
  | '/bounties'
  | '/login'
  | '/admin';

export type HeroMediaConfig =
  | {
      type: 'image';
      src: string;
      alt: string;
    }
  | {
      type: 'video';
      src: string;
      poster: string;
      alt: string;
    };

export type ProductCategory =
  | 'all'
  | 'property'
  | 'priority'
  | 'horses'
  | 'business'
  | 'apparel';

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: Exclude<ProductCategory, 'all'>;
  categoryLabel: string;
  priceGel: number;
  billingCycle: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  galleryImages?: string[];
  imageAlt: string;
  featured: boolean;
  deliveryNote: string;
  perks: string[];
}

export type RuleCategoryId =
  | 'all'
  | 'general'
  | 'roleplay'
  | 'crime'
  | 'law'
  | 'economy';

export interface ServerRule {
  id: string;
  code: string;
  category: Exclude<RuleCategoryId, 'all'>;
  categoryLabel: string;
  title: string;
  summary: string;
  details: string;
  example?: string;
  penalty: string;
}

export interface RuleCategoryMeta {
  id: RuleCategoryId;
  label: string;
  chapterNumber?: string;
}

export type MapRealm = 'mainland' | 'cuba';

export type MapLocationCategory =
  | 'all'
  | 'house'
  | 'ranch'
  | 'special_ranch'
  | 'landmark';

export type MapRegion =
  | 'all'
  | 'New Hanover'
  | 'West Elizabeth'
  | 'Lemoyne'
  | 'Ambarino'
  | 'New Austin'
  | 'Mexico'
  | 'Aguasdulces'
  | 'Cinco Torres'
  | 'La Capilla'
  | 'Arroyo de la Vibora'
  | 'Manicato';

export type MapAvailabilityFilter = 'all' | 'available' | 'occupied';

export type MapLocationStatus = 'available' | 'occupied' | 'public';

export interface MapLocation {
  id: string;
  realm: MapRealm;
  name: string;
  category: Exclude<MapLocationCategory, 'all'>;
  categoryLabel: string;
  region: Exclude<MapRegion, 'all'>;
  regionLabel?: string;
  status: MapLocationStatus;
  priceGel?: number;
  coords: {
    x: number;
    y: number;
  };
  mapPos: {
    x: number;
    y: number;
  };
  summary: string;
  features: string[];
  imageUrl: string;
  galleryImages?: string[];
  imageAlt: string;
}

export interface MapSafeZone {
  id: string;
  realm: MapRealm;
  name: string;
  /** Center position in percentage of map width/height (0..100) */
  cx: number;
  cy: number;
  /** Horizontal & vertical radii in percentage of map width/height */
  rx: number;
  ry: number;
}

/* Feature #2: Live Server Status */
export interface ServerStatusSnapshot {
  online: boolean;
  playersOnline: number;
  maxPlayers: number;
  queueCount: number;
  inGameTime: string;
  nextRestart: string;
  redmLaunchUrl: string;
}

/* How to Play Guide & Keybinds */
export interface GuideStep {
  stepNumber: string;
  title: string;
  summary: string;
  details: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: 'external' | 'copy-connect' | 'route';
  actionRoute?: AppRoute;
}

export type KeybindCategory =
  | 'all'
  | 'communication'
  | 'inventory'
  | 'horse'
  | 'roleplay';

export interface KeybindItem {
  id: string;
  keys: string[];
  action: string;
  description: string;
  category: Exclude<KeybindCategory, 'all'>;
  categoryLabel: string;
}

export interface GuideFaqItem {
  id: string;
  question: string;
  answer: string;
}

/* Feature #6: Wanted Bounty Board & RP Gallery */
export type WantedStatus = 'all' | 'active' | 'captured';

export interface WantedSuspect {
  id: string;
  name: string;
  alias: string;
  rewardUsd: number;
  status: Exclude<WantedStatus, 'all'>;
  dangerLevel: string;
  lastSeenRegion: string;
  linkedMapId: string;
  linkedMapRealm: MapRealm;
  charges: string[];
  dossier: string;
  issuedBy: string;
  portraitUrl: string;
  portraitAlt: string;
}

export interface GalleryShot {
  id: string;
  title: string;
  caption: string;
  photographer: string;
  location: string;
  dateLabel: string;
  imageUrl: string;
  imageAlt: string;
}

/* Feature #7: Player Cabinet */
export interface PlayerPropertyRef {
  id: string;
  mapLocationId: string;
  mapRealm: MapRealm;
  name: string;
  regionLabel: string;
  typeLabel: string;
  storageUsedKg: number;
  storageCapacityKg: number;
  paidUntil: string;
  imageUrl: string;
}

export interface PlayerApplicationRecord {
  id: string;
  title: string;
  submittedAt: string;
  status: 'approved' | 'pending' | 'rejected';
  statusLabel: string;
  reviewerNote: string;
}

export interface PlayerLedgerEntry {
  id: string;
  dateLabel: string;
  typeLabel: string;
  description: string;
  amountLabel: string;
  isPositive: boolean;
}

export interface PlayerCabinetProfile {
  discordTag: string;
  discordId: string;
  characterName: string;
  citizenId: string;
  occupation: string;
  honorLabel: string;
  playtimeHours: number;
  cashUsd: number;
  bankUsd: number;
  activeHorse: string;
  homeRegion: string;
  portraitUrl: string;
  properties: PlayerPropertyRef[];
  applications: PlayerApplicationRecord[];
  ledger: PlayerLedgerEntry[];
}

/* Frontend-Only Admin CMS Types */
export interface HomePillarCopy {
  index: string;
  title: string;
  description: string;
}

export interface SiteCopyState {
  general: {
    brandName: string;
    eraLabel: string;
    discordInvite: string;
    discordDisplay: string;
    supportEmail: string;
    footerDescription: string;
    footerDisclaimer: string;
  };
  hero: {
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    scrollHintLabel: string;
    media: HeroMediaConfig;
  };
  home: {
    overviewEyebrow: string;
    overviewHeading: string;
    overviewBody: string;
    pillars: HomePillarCopy[];
    quickRulesEyebrow: string;
    quickRulesHeading: string;
    quickRulesBody: string;
    quickRulesHighlights: string[];
    quickRulesCta: string;
    featuredEyebrow: string;
    featuredHeading: string;
    featuredAllLink: string;
    archiveEyebrow: string;
    archiveHeading: string;
  };
  store: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    discordTicketLabel: string;
  };
  rules: {
    eyebrow: string;
    heading: string;
    subtitle: string;
  };
  map: {
    sidebarTitle: string;
  };
  guide: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    stepsEyebrow: string;
    stepsHeading: string;
    keybindsEyebrow: string;
    keybindsHeading: string;
    faqEyebrow: string;
    faqHeading: string;
  };
  bounties: {
    eyebrow: string;
    heading: string;
    subtitle: string;
  };
  cabinet: {
    eyebrow: string;
    heading: string;
    subtitle: string;
  };
}

export interface SiteContentState {
  copy: SiteCopyState;
  serverStatus: ServerStatusSnapshot;
  products: StoreProduct[];
  rules: ServerRule[];
  mapLocations: MapLocation[];
  guideSteps: GuideStep[];
  keybinds: KeybindItem[];
  guideFaqs: GuideFaqItem[];
  wantedSuspects: WantedSuspect[];
}
