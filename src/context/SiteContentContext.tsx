import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as cmsApi from '../services/cmsApi';
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

function logApiError(error: unknown) {
  console.warn('[cms] ცვლილების ბაზაში შენახვა ვერ მოხერხდა:', error);
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentState>(loadInitialContent);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // კონტენტის ჩატვირთვა PostgreSQL ბაზიდან — სერვერი ჭეშმარიტების წყაროა.
  // თუ ბაზა ჯერ ცარიელია, შეივსება მიმდინარე ლოკალური კონტენტით.
  useEffect(() => {
    let cancelled = false;
    cmsApi
      .fetchFullContent()
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (result.initialized) {
          setContent(
            mergeSiteContent(createDefaultSiteContent(), result.content),
          );
        } else {
          void cmsApi.importContent(contentRef.current).catch(logApiError);
        }
      })
      .catch(() => {
        console.warn('[cms] API მიუწვდომელია — გამოიყენება ლოკალური ასლი');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ლაივ სერვერის სტატუსის განახლება ყოველ 30 წამში (მხოლოდ ლოკალური state —
  // ბაზაში არ იწერება). playersOnline/maxPlayers მოდის RedM სერვერიდან.
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      cmsApi
        .fetchServerStatus()
        .then((status) => {
          if (!cancelled) {
            setContent((prev) => ({
              ...prev,
              serverStatus: { ...prev.serverStatus, ...status },
            }));
          }
        })
        .catch(() => undefined);
    };
    const intervalId = window.setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

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
      const nextSection = {
        ...contentRef.current.copy[section],
        ...patch,
      } as SiteCopyState[K];
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
      void cmsApi.saveCopySection(section, nextSection).catch(logApiError);
      // ატვირთული hero მედიის URL-ის რეგისტრაცია მედია-რეესტრში
      if (section === 'hero' && 'media' in patch) {
        const media = (nextSection as SiteCopyState['hero']).media;
        if (media?.src && !media.src.startsWith('data:')) {
          void cmsApi
            .registerMediaAsset({
              url: media.src,
              type: media.type,
              alt: media.alt,
              context: 'hero',
            })
            .catch(logApiError);
        }
      }
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
      void cmsApi.saveServerStatus(patch).catch(logApiError);
    },
    [],
  );

  const saveProduct = useCallback((product: StoreProduct) => {
    setContent((prev) => ({
      ...prev,
      products: upsertStoreProduct(prev.products, product),
    }));
    void cmsApi.saveProduct(product).catch(logApiError);
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setContent((prev) => ({
      ...prev,
      products: deleteStoreProduct(prev.products, productId),
    }));
    void cmsApi.deleteProduct(productId).catch(logApiError);
  }, []);

  const saveRule = useCallback((rule: ServerRule) => {
    setContent((prev) => ({
      ...prev,
      rules: upsertServerRule(prev.rules, rule),
    }));
    void cmsApi.saveRule(rule).catch(logApiError);
  }, []);

  const removeRule = useCallback((ruleId: string) => {
    setContent((prev) => ({
      ...prev,
      rules: deleteServerRule(prev.rules, ruleId),
    }));
    void cmsApi.deleteRule(ruleId).catch(logApiError);
  }, []);

  const saveMapLocation = useCallback((location: MapLocation) => {
    setContent((prev) => ({
      ...prev,
      mapLocations: upsertMapLocation(prev.mapLocations, location),
    }));
    void cmsApi.saveMapLocation(location).catch(logApiError);
  }, []);

  const removeMapLocation = useCallback((locationId: string) => {
    setContent((prev) => ({
      ...prev,
      mapLocations: deleteMapLocation(prev.mapLocations, locationId),
    }));
    void cmsApi.deleteMapLocation(locationId).catch(logApiError);
  }, []);

  const updateGuideSteps = useCallback((steps: GuideStep[]) => {
    setContent((prev) => ({ ...prev, guideSteps: steps }));
    void cmsApi.replaceGuideSteps(steps).catch(logApiError);
  }, []);

  const updateKeybinds = useCallback((items: KeybindItem[]) => {
    setContent((prev) => ({ ...prev, keybinds: items }));
    void cmsApi.replaceKeybinds(items).catch(logApiError);
  }, []);

  const updateGuideFaqs = useCallback((faqs: GuideFaqItem[]) => {
    setContent((prev) => ({ ...prev, guideFaqs: faqs }));
    void cmsApi.replaceGuideFaqs(faqs).catch(logApiError);
  }, []);

  const updateWantedSuspects = useCallback((suspects: WantedSuspect[]) => {
    setContent((prev) => ({ ...prev, wantedSuspects: suspects }));
    void cmsApi.replaceWantedSuspects(suspects).catch(logApiError);
  }, []);

  const importJson = useCallback((raw: string) => {
    const defaults = createDefaultSiteContent();
    const res = parseCmsImportJson(raw, defaults);
    if (!res.ok) {
      return { ok: false as const, error: res.error };
    }
    setContent(res.state);
    void cmsApi.importContent(res.state).catch(logApiError);
    return { ok: true as const };
  }, []);

  const resetAll = useCallback(() => {
    const defaults = createDefaultSiteContent();
    setContent(defaults);
    void cmsApi.resetContent().catch(logApiError);
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
