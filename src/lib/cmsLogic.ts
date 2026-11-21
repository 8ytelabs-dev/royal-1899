import { SITE_CONFIG } from '../config/siteConfig';
import { MAP_LOCATIONS } from '../data/mapLocations';
import { PRODUCT_CATEGORIES, STORE_PRODUCTS } from '../data/products';
import { RULE_CATEGORIES, SERVER_RULES } from '../data/rules';
import {
  GUIDE_FAQS,
  GUIDE_STEPS,
  INITIAL_SERVER_STATUS,
  SERVER_KEYBINDS,
  WANTED_SUSPECTS,
} from '../data/serverPortal';
import type {
  MapLocation,
  MapRealm,
  ServerRule,
  SiteContentState,
  SiteCopyState,
  StoreProduct,
} from '../types';

export const DEFAULT_SITE_COPY: SiteCopyState = {
  general: {
    brandName: SITE_CONFIG.brandName,
    eraLabel: SITE_CONFIG.eraLabel,
    discordInvite: SITE_CONFIG.discordInvite,
    discordDisplay: SITE_CONFIG.discordDisplay,
    supportEmail: SITE_CONFIG.supportEmail,
    footerDescription:
      '1899 წლის ავთენტური Red Dead Redemption 2 Roleplay სამყარო. შექმნილია ხარისხიანი ისტორიების, ცოცხალი ეკონომიკისა და პასუხისმგებლიანი საზოგადოებისთვის.',
    footerDisclaimer: 'Made by DevraStudio',
  },
  hero: {
    title: 'სამყარო, სადაც თითოეულ არჩევანს თავისი ფასი აქვს',
    subtitle:
      'შემოაბიჯე 1899 წლის ავთენტურ ფრონტიერზე. შექმენი საკუთარი პერსონაჟის ისტორია ROYAL 1899-ის მიწებზე — როგორც პატიოსანმა მეურნემ, კანონის დამცველმა ან თავისუფალმა მოხეტიალემ.',
    primaryCtaLabel: 'სერვერზე შეერთება',
    secondaryCtaLabel: 'წესების გაცნობა',
    scrollHintLabel: 'გაეცანი სერვერს',
    media: SITE_CONFIG.heroMedia,
  },
  home: {
    overviewEyebrow: 'სერვერის შესახებ',
    overviewHeading: 'ფრონტიერი, სადაც ისტორიებს თავად მოთამაშეები წერენ',
    overviewBody:
      'ROYAL 1899 არის ქართული Red Dead Redemption 2 Roleplay სერვერი, რომელიც აგებულია ხარისხიან სიუჟეტზე, გააზრებულ დიალოგებსა და სამართლიან გარემოზე. აქ არ არსებობს დაწერილი სცენარი — ქალაქის პოლიტიკას, ვაჭრობას და წესრიგს თქვენი გადაწყვეტილებები ქმნის.',
    pillars: [
      {
        index: '01',
        title: 'ცოცხალი ეკონომიკა',
        description:
          'მოთამაშეების მიერ მართული სალუნები, რანჩოები, სამჭედლოები და საქალაქო ვაჭრობა, სადაც თითოეულ დოლარს წონა აქვს.',
      },
      {
        index: '02',
        title: 'კანონისა და უკანონობის ბალანსი',
        description:
          'შერიფთა ოფისი, სასამართლო პროცესები და რეგისტრირებული ბანდები — თითოეულ დაპირისპირებას წინ უძღვის ისტორია.',
      },
      {
        index: '03',
        title: 'ავთენტური 1899 ატმოსფერო',
        description:
          'სერიოზული ხმოვანი როლფლეი, ეპოქის შესაბამისი დიალოგები და ყურადღება დეტალებზე ყოველგვარი არაეპოქალური ქაოსის გარეშე.',
      },
    ],
    quickRulesEyebrow: 'სწრაფი გზამკვლევი · წესები',
    quickRulesHeading: 'ROYAL 1899-ის კოდექსი',
    quickRulesBody:
      'სერვერზე პირველი ნაბიჯის გადადგმამდე გაეცანი ძირითად წესებს, რომლებიც იცავს ყველა მოთამაშის როლფლეის ხარისხს.',
    quickRulesHighlights: [
      'RDM და VDM მკაცრად აკრძალულია — ძალადობას სჭირდება RP საფუძველი',
      'Metagaming და Powergaming იწვევს მკაცრ სანქციებს',
      'პერსონაჟის სიცოცხლის ღირებულება და 1899 წლის ეპოქის დაცვა',
    ],
    quickRulesCta: 'წესების სრული კოდექსი',
    featuredEyebrow: 'სერვერის მაღაზია · რჩეული',
    featuredHeading: 'გამორჩეული შეთავაზება',
    featuredAllLink: 'ყველა პროდუქტის ნახვა',
    archiveEyebrow: 'შერიფის არქივი',
    archiveHeading: 'ძებნილთა დაფა',
  },
  store: {
    eyebrow: 'ROYAL 1899 · მხარდაჭერის მაღაზია',
    heading: 'სერვერის მაღაზია',
    subtitle:
      'ყველა პაკეტის შეძენა და გააქტიურება ხორციელდება ოფიციალურ Discord სერვერზე ტიკეტის მეშვეობით. მაღაზიის ნივთები არ იძლევა საბრძოლო უპირატესობას და იცავს როლფლეის ბალანსს.',
    discordTicketLabel: 'Discord ტიკეტის გახსნა',
  },
  rules: {
    eyebrow: 'ROYAL 1899 · წესების კოდექსი · განახლებულია 2026',
    heading: 'სერვერის წესები',
    subtitle:
      'წესების არცოდნა არ ათავისუფლებს მოთამაშეს პასუხისმგებლობისგან. თითოეული პუნქტი შექმნილია იმისთვის, რომ სერვერზე შენარჩუნდეს 1899 წლის ავთენტური როლფლეის დონე.',
  },
  map: {
    sidebarTitle: 'სახლები, რანჩოები და ლოკაციები',
  },
  guide: {
    eyebrow: 'ROYAL 1899 · დაწყების გზამკვლევი',
    heading: 'როგორ დავიწყოთ თამაში',
    subtitle:
      'ოთხი მარტივი ნაბიჯი ფრონტიერზე მოსახვედრად, სერვერის ძირითადი კლავიშები და პასუხები ახალი მოთამაშეების ყველაზე ხშირ კითხვებზე.',
    stepsEyebrow: 'ნაბიჯ-ნაბიჯ ინსტრუქცია',
    stepsHeading: 'შეერთება 5 წუთში',
    keybindsEyebrow: 'მართვა და კლავიშები',
    keybindsHeading: 'სერვერის ძირითადი კლავიშები',
    faqEyebrow: 'ხშირად დასმული კითხვები',
    faqHeading: 'ყველაფერი პირველი შესვლის წინ',
  },
  bounties: {
    eyebrow: 'ROYAL 1899 · შერიფის არქივი',
    heading: 'ძებნილთა დაფა',
    subtitle:
      'ოფიციალური ჯილდოები ფრონტიერის ყველაზე საშიშ დამნაშავეებზე და შერიფის ოფისის მიმდინარე საქმეები.',
  },
  cabinet: {
    eyebrow: 'ROYAL 1899 · მოთამაშის კაბინეტი',
    heading: 'შენი პერსონაჟი, ქონება და ისტორია ერთ სივრცეში',
    subtitle:
      'გაიარე ავტორიზაცია Discord ანგარიშით, რათა იხილო პერსონაჟის პასპორტი, რუკაზე გაფორმებული სახლები და რანჩოები, განაცხადების სტატუსი და საბანკო-საჯარიმო ჩანაწერები.',
  },
};

export function createDefaultSiteContent(): SiteContentState {
  return {
    copy: structuredClone(DEFAULT_SITE_COPY),
    serverStatus: { ...INITIAL_SERVER_STATUS },
    products: STORE_PRODUCTS.map((p) => ({ ...p, perks: [...p.perks] })),
    storeCategories: PRODUCT_CATEGORIES
      .filter((c) => c.id !== 'all')
      .map((c) => ({ ...c })),
    rules: SERVER_RULES.map((r) => ({ ...r })),
    ruleCategories: RULE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
      ...c,
    })),
    mapLocations: MAP_LOCATIONS.map((l) => ({
      ...l,
      coords: { ...l.coords },
      mapPos: { ...l.mapPos },
      features: [...l.features],
    })),
    guideSteps: GUIDE_STEPS.map((s) => ({ ...s })),
    keybinds: SERVER_KEYBINDS.map((k) => ({ ...k, keys: [...k.keys] })),
    guideFaqs: GUIDE_FAQS.map((f) => ({ ...f })),
    wantedSuspects: WANTED_SUSPECTS.map((w) => ({
      ...w,
      charges: [...w.charges],
    })),
  };
}

export function mergeSiteContent(
  defaults: SiteContentState,
  incoming: Partial<SiteContentState> | null | undefined,
): SiteContentState {
  if (!incoming || typeof incoming !== 'object') {
    return defaults;
  }

  const incomingCopy = incoming.copy;
  return {
    copy: {
      general: { ...defaults.copy.general, ...(incomingCopy?.general ?? {}) },
      hero: {
        ...defaults.copy.hero,
        ...(incomingCopy?.hero ?? {}),
        media: incomingCopy?.hero?.media ?? defaults.copy.hero.media,
      },
      home: {
        ...defaults.copy.home,
        ...(incomingCopy?.home ?? {}),
        archiveHeading:
          incomingCopy?.home?.archiveHeading === 'ძებნილთა დაფა და RP გალერეა'
            ? defaults.copy.home.archiveHeading
            : (incomingCopy?.home?.archiveHeading ?? defaults.copy.home.archiveHeading),
        pillars:
          Array.isArray(incomingCopy?.home?.pillars) &&
          incomingCopy.home.pillars.length > 0
            ? incomingCopy.home.pillars
            : defaults.copy.home.pillars,
        quickRulesHighlights:
          Array.isArray(incomingCopy?.home?.quickRulesHighlights) &&
          incomingCopy.home.quickRulesHighlights.length > 0
            ? incomingCopy.home.quickRulesHighlights
            : defaults.copy.home.quickRulesHighlights,
      },
      store: { ...defaults.copy.store, ...(incomingCopy?.store ?? {}) },
      rules: { ...defaults.copy.rules, ...(incomingCopy?.rules ?? {}) },
      map: { ...defaults.copy.map, ...(incomingCopy?.map ?? {}) },
      guide: { ...defaults.copy.guide, ...(incomingCopy?.guide ?? {}) },
      bounties: {
        ...defaults.copy.bounties,
        ...(incomingCopy?.bounties ?? {}),
        heading:
          incomingCopy?.bounties?.heading === 'ძებნილთა დაფა და RP გალერეა'
            ? defaults.copy.bounties.heading
            : (incomingCopy?.bounties?.heading ?? defaults.copy.bounties.heading),
        subtitle:
          incomingCopy?.bounties?.subtitle?.includes('როლფლეი კადრები')
            ? defaults.copy.bounties.subtitle
            : (incomingCopy?.bounties?.subtitle ?? defaults.copy.bounties.subtitle),
      },
      cabinet: { ...defaults.copy.cabinet, ...(incomingCopy?.cabinet ?? {}) },
    },
    serverStatus: {
      ...defaults.serverStatus,
      ...(incoming.serverStatus ?? {}),
    },
    products: Array.isArray(incoming.products)
      ? incoming.products
      : defaults.products,
    storeCategories: Array.isArray(incoming.storeCategories)
      ? incoming.storeCategories
      : defaults.storeCategories,
    rules: Array.isArray(incoming.rules) ? incoming.rules : defaults.rules,
    ruleCategories:
      Array.isArray(incoming.ruleCategories) && incoming.ruleCategories.length > 0
        ? incoming.ruleCategories
        : defaults.ruleCategories,
    mapLocations: Array.isArray(incoming.mapLocations)
      ? incoming.mapLocations
      : defaults.mapLocations,
    guideSteps: Array.isArray(incoming.guideSteps)
      ? incoming.guideSteps
      : defaults.guideSteps,
    keybinds: Array.isArray(incoming.keybinds)
      ? incoming.keybinds
      : defaults.keybinds,
    guideFaqs: Array.isArray(incoming.guideFaqs)
      ? incoming.guideFaqs
      : defaults.guideFaqs,
    wantedSuspects: Array.isArray(incoming.wantedSuspects)
      ? incoming.wantedSuspects
      : defaults.wantedSuspects,
  };
}

export function upsertStoreProduct(
  products: StoreProduct[],
  nextProduct: StoreProduct,
): StoreProduct[] {
  const normalizedBase = nextProduct.featured
    ? products.map((p) => (p.id === nextProduct.id ? p : { ...p, featured: false }))
    : products;

  const exists = normalizedBase.some((p) => p.id === nextProduct.id);
  if (exists) {
    return normalizedBase.map((p) => (p.id === nextProduct.id ? nextProduct : p));
  }
  return [nextProduct, ...normalizedBase];
}

export function deleteStoreProduct(
  products: StoreProduct[],
  productId: string,
): StoreProduct[] {
  return products.filter((p) => p.id !== productId);
}

export function upsertServerRule(
  rules: ServerRule[],
  nextRule: ServerRule,
): ServerRule[] {
  const exists = rules.some((r) => r.id === nextRule.id);
  if (exists) {
    return rules.map((r) => (r.id === nextRule.id ? nextRule : r));
  }
  return [...rules, nextRule];
}

export function deleteServerRule(
  rules: ServerRule[],
  ruleId: string,
): ServerRule[] {
  return rules.filter((r) => r.id !== ruleId);
}

export function upsertMapLocation(
  locations: MapLocation[],
  nextLocation: MapLocation,
): MapLocation[] {
  const exists = locations.some((l) => l.id === nextLocation.id);
  if (exists) {
    return locations.map((l) => (l.id === nextLocation.id ? nextLocation : l));
  }
  return [nextLocation, ...locations];
}

export function deleteMapLocation(
  locations: MapLocation[],
  locationId: string,
): MapLocation[] {
  return locations.filter((l) => l.id !== locationId);
}

/**
 * Converts a click coordinate percentage (0..100, 0..100) on the map image
 * into realistic RDR 2 / Guarma world coordinates.
 */
export function computeGameCoordsFromMapPos(
  mapPos: { x: number; y: number },
  realm: MapRealm,
): { x: number; y: number } {
  const clampedX = Math.max(0, Math.min(100, mapPos.x));
  const clampedY = Math.max(0, Math.min(100, mapPos.y));

  if (realm === 'cuba') {
    const worldX = Math.round(800 + (clampedX / 100) * 1400);
    const worldY = Math.round(-6200 - (clampedY / 100) * 1600);
    return { x: worldX, y: worldY };
  }

  // America + Mexico combined mainland projection
  const worldX = Math.round(-5200 + (clampedX / 100) * 8600);
  const worldY = Math.round(2800 - (clampedY / 100) * 8200);
  return { x: worldX, y: worldY };
}

export function parseCmsImportJson(
  rawJson: string,
  defaults: SiteContentState,
): { ok: true; state: SiteContentState } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'არასწორი JSON სტრუქტურა.' };
    }
    return {
      ok: true,
      state: mergeSiteContent(defaults, parsed as Partial<SiteContentState>),
    };
  } catch {
    return { ok: false, error: 'JSON ფაილის წაკითხვა ვერ მოხერხდა.' };
  }
}
