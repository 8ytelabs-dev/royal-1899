import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createDefaultSiteContent,
  deleteMapLocation,
  deleteServerRule,
  deleteStoreProduct,
  mergeSiteContent,
  parseCmsImportJson,
  upsertMapLocation,
  upsertServerRule,
  upsertStoreProduct,
} from '../lib/cmsLogic';
import type {
  GuideFaqItem,
  GuideStep,
  KeybindItem,
  MapLocation,
  ServerRule,
  ServerStatusSnapshot,
  SiteContentState,
  SiteCopyState,
  StoreProduct,
  WantedSuspect,
} from '../types';

const STORAGE_KEY = 'royal_1899_cms_state_v2';
const LEGACY_STORAGE_KEY = 'royal_1899_cms_state_v1';
const LEGACY_FOOTER_DISCLAIMER =
  'ROYAL 1899 არ არის აფილირებული Rockstar Games-თან ან Take-Two Interactive-თან.';

function migrateStoredContent(
  parsed: Partial<SiteContentState>,
  defaults: SiteContentState,
): Partial<SiteContentState> {
  if (parsed.copy?.general?.footerDisclaimer === LEGACY_FOOTER_DISCLAIMER) {
    parsed.copy.general.footerDisclaimer =
      defaults.copy.general.footerDisclaimer;
  }
  return parsed;
}

interface SiteContentContextValue {
  content: SiteContentState;
  updateCopy: <K extends keyof SiteCopyState>(
    section: K,
    patch: Partial<SiteCopyState[K]>,
  ) => void;
  updateServerStatus: (patch: Partial<ServerStatusSnapshot>) => void;
  saveProduct: (product: StoreProduct) => void;
  removeProduct: (productId: string) => void;
  saveRule: (rule: ServerRule) => void;
  removeRule: (ruleId: string) => void;
  saveMapLocation: (location: MapLocation) => void;
  removeMapLocation: (locationId: string) => void;
  updateGuideSteps: (steps: GuideStep[]) => void;
  updateKeybinds: (items: KeybindItem[]) => void;
  updateGuideFaqs: (faqs: GuideFaqItem[]) => void;
  updateWantedSuspects: (suspects: WantedSuspect[]) => void;
  importJson: (raw: string) => { ok: true } | { ok: false; error: string };
  resetAll: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function loadInitialContent(): SiteContentState {
  const defaults = createDefaultSiteContent();
  if (typeof window === 'undefined') {
    return defaults;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteContentState>;
      return mergeSiteContent(defaults, migrateStoredContent(parsed, defaults));
    }
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw) as Partial<SiteContentState>;
      return mergeSiteContent(defaults, {
        ...migrateStoredContent(parsedLegacy, defaults),
        mapLocations: defaults.mapLocations,
      });
    }
    return defaults;
  } catch {
    return defaults;
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentState>(loadInitialContent);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // Ignore storage quota or private browsing limitations
    }
  }, [content]);

  const updateCopy = useCallback(
    <K extends keyof SiteCopyState>(
      section: K,
      patch: Partial<SiteCopyState[K]>,
    ) => {
      setContent((prev) => ({
        ...prev,
        copy: {
          ...prev.copy,
          [section]: {
            ...prev.copy[section],
            ...patch,
          },
        },
      }));
    },
    [],
  );

  const updateServerStatus = useCallback(
    (patch: Partial<ServerStatusSnapshot>) => {
      setContent((prev) => ({
        ...prev,
        serverStatus: {
          ...prev.serverStatus,
          ...patch,
        },
      }));
    },
    [],
  );

  const saveProduct = useCallback((product: StoreProduct) => {
    setContent((prev) => ({
      ...prev,
      products: upsertStoreProduct(prev.products, product),
    }));
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setContent((prev) => ({
      ...prev,
      products: deleteStoreProduct(prev.products, productId),
    }));
  }, []);

  const saveRule = useCallback((rule: ServerRule) => {
    setContent((prev) => ({
      ...prev,
      rules: upsertServerRule(prev.rules, rule),
    }));
  }, []);

  const removeRule = useCallback((ruleId: string) => {
    setContent((prev) => ({
      ...prev,
      rules: deleteServerRule(prev.rules, ruleId),
    }));
  }, []);

  const saveMapLocation = useCallback((location: MapLocation) => {
    setContent((prev) => ({
      ...prev,
      mapLocations: upsertMapLocation(prev.mapLocations, location),
    }));
  }, []);

  const removeMapLocation = useCallback((locationId: string) => {
    setContent((prev) => ({
      ...prev,
      mapLocations: deleteMapLocation(prev.mapLocations, locationId),
    }));
  }, []);

  const updateGuideSteps = useCallback((steps: GuideStep[]) => {
    setContent((prev) => ({ ...prev, guideSteps: steps }));
  }, []);

  const updateKeybinds = useCallback((items: KeybindItem[]) => {
    setContent((prev) => ({ ...prev, keybinds: items }));
  }, []);

  const updateGuideFaqs = useCallback((faqs: GuideFaqItem[]) => {
    setContent((prev) => ({ ...prev, guideFaqs: faqs }));
  }, []);

  const updateWantedSuspects = useCallback((suspects: WantedSuspect[]) => {
    setContent((prev) => ({ ...prev, wantedSuspects: suspects }));
  }, []);

  const importJson = useCallback((raw: string) => {
    const defaults = createDefaultSiteContent();
    const res = parseCmsImportJson(raw, defaults);
    if (!res.ok) {
      return { ok: false as const, error: res.error };
    }
    setContent(res.state);
    return { ok: true as const };
  }, []);

  const resetAll = useCallback(() => {
    const defaults = createDefaultSiteContent();
    setContent(defaults);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo<SiteContentContextValue>(
    () => ({
      content,
      updateCopy,
      updateServerStatus,
      saveProduct,
      removeProduct,
      saveRule,
      removeRule,
      saveMapLocation,
      removeMapLocation,
      updateGuideSteps,
      updateKeybinds,
      updateGuideFaqs,
      updateWantedSuspects,
      importJson,
      resetAll,
    }),
    [
      content,
      updateCopy,
      updateServerStatus,
      saveProduct,
      removeProduct,
      saveRule,
      removeRule,
      saveMapLocation,
      removeMapLocation,
      updateGuideSteps,
      updateKeybinds,
      updateGuideFaqs,
      updateWantedSuspects,
      importJson,
      resetAll,
    ],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used inside SiteContentProvider');
  }
  return ctx;
}
