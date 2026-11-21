import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Anchor,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  Crown,
  ExternalLink,
  Home,
  Map as MapIcon,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Share2,
  Trees,
  X,
} from 'lucide-react';
import { DiscordIcon } from '../components/DiscordIcon';
import { MapSafeZonesOverlay } from '../components/MapSafeZonesOverlay';
import { MediaGalleryViewer } from '../components/MediaGalleryViewer';
import { SITE_CONFIG } from '../config/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';
import {
  MAP_AVAILABILITY_FILTERS,
  MAP_CATEGORIES,
  MAP_REALMS,
  MAP_REGIONS_BY_REALM,
} from '../data/mapLocations';
import { resolveGalleryImages } from '../lib/mediaGallery';
import {
  buildLocationDiscordMessage,
  clampMapZoom,
  computeScaledPan,
  countMapLocationsByStatus,
  filterMapLocations,
  formatGameCoords,
  getRealmLocations,
  getStatusLabel,
} from '../lib/mapLogic';
import { formatGelPrice } from '../lib/storeLogic';
import type {
  MapAvailabilityFilter,
  MapLocation,
  MapLocationCategory,
  MapRealm,
  MapRegion,
} from '../types';

function LocationCategoryIcon({
  category,
  className = 'w-3.5 h-3.5',
}: {
  category: MapLocation['category'];
  className?: string;
}) {
  if (category === 'house') {
    return <Home className={className} aria-hidden="true" />;
  }
  if (category === 'ranch') {
    return <Trees className={className} aria-hidden="true" />;
  }
  if (category === 'special_ranch') {
    return <Crown className={className} aria-hidden="true" />;
  }
  return <Compass className={className} aria-hidden="true" />;
}

function resolveInitialMapState(
  locations: MapLocation[],
): { realm: MapRealm; selectedId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const idFromUrl = params.get('id');
  const mapFromUrl = params.get('map');

  if (idFromUrl) {
    const matched = locations.find((l) => l.id === idFromUrl);
    if (matched) {
      return { realm: matched.realm, selectedId: matched.id };
    }
  }

  const initialRealm: MapRealm = mapFromUrl === 'cuba' ? 'cuba' : 'mainland';
  const firstInRealm = locations.find((l) => l.realm === initialRealm) ?? null;
  return {
    realm: initialRealm,
    selectedId: firstInRealm ? firstInRealm.id : null,
  };
}

export function MapPage() {
  const { content } = useSiteContent();
  const allLocations = content.mapLocations;
  const initial = useMemo(
    () => resolveInitialMapState(allLocations),
    // Resolve once on initial mount using current stored locations
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [realm, setRealm] = useState<MapRealm>(initial.realm);
  const [selectedId, setSelectedId] = useState<string | null>(initial.selectedId);
  const [category, setCategory] = useState<MapLocationCategory>('all');
  const [availability, setAvailability] = useState<MapAvailabilityFilter>('all');
  const [region, setRegion] = useState<MapRegion>('all');
  const [query, setQuery] = useState('');

  // Desktop collapsible sidebar (controlled by arrow handle) + mobile drawer
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [zoom, setZoom] = useState(1.06);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const realmLocations = useMemo(
    () => getRealmLocations(allLocations, realm),
    [allLocations, realm],
  );
  const statusTotals = useMemo(
    () => countMapLocationsByStatus(realmLocations),
    [realmLocations],
  );
  const regionOptions = MAP_REGIONS_BY_REALM[realm];

  const filteredLocations = useMemo(
    () =>
      filterMapLocations(allLocations, {
        realm,
        category,
        availability,
        region,
        query,
      }),
    [allLocations, realm, category, availability, region, query],
  );

  const selectedLocation = useMemo(
    () => allLocations.find((l) => l.id === selectedId && l.realm === realm) ?? null,
    [allLocations, selectedId, realm],
  );

  const activeRealmMeta = MAP_REALMS.find((r) => r.id === realm) ?? MAP_REALMS[0];
  const mapImageUrl =
    realm === 'cuba' ? SITE_CONFIG.cubaMapImageUrl : SITE_CONFIG.mapImageUrl;

  // Sync URL query params `?map=` and `?id=` for shareable deep-links
  useEffect(() => {
    const url = new URL(window.location.href);
    if (realm === 'cuba') {
      url.searchParams.set('map', 'cuba');
    } else {
      url.searchParams.delete('map');
    }
    if (selectedId) {
      url.searchParams.set('id', selectedId);
    } else {
      url.searchParams.delete('id');
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [realm, selectedId]);

  const handleRealmChange = (nextRealm: MapRealm) => {
    if (nextRealm === realm) return;
    setRealm(nextRealm);
    setRegion('all');
    setCategory('all');
    setAvailability('all');
    setQuery('');
    setZoom(1.06);
    setPan({ x: 0, y: 0 });
    setCopiedCoords(false);
    setCopiedShare(false);

    const firstNext = allLocations.find((l) => l.realm === nextRealm) ?? null;
    setSelectedId(firstNext ? firstNext.id : null);
  };

  // Native map dimensions for razor-sharp layout-dimension scaling (eliminates CSS scale() GPU blur)
  const baseMapWidth = realm === 'mainland' ? 1240 : 1200;
  const mapAspectRatio = realm === 'mainland' ? 1300 / 929 : 16 / 9;
  const renderedMapWidth = Math.round(baseMapWidth * zoom);
  const renderedMapHeight = Math.round(renderedMapWidth / mapAspectRatio);
  const maxPanX = Math.max(420, Math.round(renderedMapWidth * 0.44));
  const maxPanY = Math.max(320, Math.round(renderedMapHeight * 0.44));

  const applyZoom = (nextZoomRaw: number) => {
    const nextZoom = clampMapZoom(nextZoomRaw);
    if (nextZoom === zoom) return;
    const nextW = Math.round(baseMapWidth * nextZoom);
    const nextH = Math.round(nextW / mapAspectRatio);
    setPan((prevPan) =>
      computeScaledPan(
        prevPan,
        zoom,
        nextZoom,
        Math.max(420, Math.round(nextW * 0.44)),
        Math.max(320, Math.round(nextH * 0.44)),
      ),
    );
    setZoom(nextZoom);
  };

  const focusLocation = (location: MapLocation) => {
    setSelectedId(location.id);
    setCopiedCoords(false);
    setCopiedShare(false);
    setMobileSidebarOpen(false);

    const targetZoom = Math.max(zoom, 1.5);
    setZoom(targetZoom);

    const nextW = Math.round(baseMapWidth * targetZoom);
    const nextH = Math.round(nextW / mapAspectRatio);
    const offsetX = Math.round(((50 - location.mapPos.x) / 100) * nextW);
    const offsetY = Math.round(((50 - location.mapPos.y) / 100) * nextH);
    const limX = Math.max(420, Math.round(nextW * 0.44));
    const limY = Math.max(320, Math.round(nextH * 0.44));
    setPan({
      x: Math.max(-limX, Math.min(limX, offsetX)),
      y: Math.max(-limY, Math.min(limY, offsetY)),
    });
  };

  const handleResetView = () => {
    setZoom(1.06);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomStep = (delta: number) => {
    applyZoom(zoom + delta);
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY < 0 ? 0.18 : -0.18;
    applyZoom(zoom + delta);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, Math.round(dragStartRef.current.panX + dx))),
      y: Math.max(-maxPanY, Math.min(maxPanY, Math.round(dragStartRef.current.panY + dy))),
    });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleCopyCoords = async (location: MapLocation) => {
    try {
      await navigator.clipboard.writeText(formatGameCoords(location.coords));
      setCopiedCoords(true);
      window.setTimeout(() => setCopiedCoords(false), 2000);
    } catch {
      setCopiedCoords(false);
    }
  };

  const handleShareLocation = async (location: MapLocation) => {
    const mapQuery = location.realm === 'cuba' ? 'map=cuba&' : '';
    const shareUrl = `${window.location.origin}/map?${mapQuery}id=${location.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2200);
    } catch {
      setCopiedShare(false);
    }
  };

  const resetFilters = () => {
    setCategory('all');
    setAvailability('all');
    setRegion('all');
    setQuery('');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-[#ece2cc]/10 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-[#dcb975] truncate">
              {content.copy.general.brandName} · {activeRealmMeta.label}
            </p>
            <h1 className="font-display text-xl font-semibold text-[#ece2cc] leading-snug">
              {content.copy.map.sidebarTitle}
            </h1>
          </div>

          {/* Desktop quick-collapse arrow inside header */}
          <button
            type="button"
            onClick={() => setDesktopSidebarOpen(false)}
            aria-label="პანელის ჩაკეცვა"
            title="პანელის ჩაკეცვა"
            className="hidden lg:inline-flex w-8 h-8 items-center justify-center rounded-md text-[#c2b398] hover:text-[#dcb975] hover:bg-[#2c1c12] transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Mobile close arrow */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="სიის დახურვა"
            className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-md text-[#c2b398] hover:text-[#ece2cc] hover:bg-[#2c1c12] shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Clean Unboxed Status Summary */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#c2b398] font-mono tabular-nums">
          <span className="text-[#dcb975]">{statusTotals.available} თავისუფალი</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#e3967d]">{statusTotals.occupied} დაკავებული</span>
          <span aria-hidden="true">·</span>
          <span>{statusTotals.landmarks} ლოკაცია</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#c2b398] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="map-location-search" className="sr-only">
            ლოკაციის ძიება
          </label>
          <input
            id="map-location-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ლოკაციის ძიება..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-[#2c1c12] border border-[#ece2cc]/15 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="ძიების გასუფთავება"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#c2b398] hover:text-[#ece2cc] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs — clean wrapped layout supports all 5 types including Special Ranches */}
        <div
          role="tablist"
          aria-label="ლოკაციის ტიპები"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#180e08] rounded-md"
        >
          {MAP_CATEGORIES.map((item) => {
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item.id)}
                className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#dcb975] text-[#22150d] font-semibold'
                    : 'text-[#c2b398] hover:text-[#ece2cc] hover:bg-[#22150d]/80'
                }`}
              >
                {item.id === 'special_ranch' && (
                  <Crown className="w-3 h-3 shrink-0" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Availability + Region Filters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="map-availability-select" className="sr-only">
              ხელმისაწვდომობა
            </label>
            <select
              id="map-availability-select"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as MapAvailabilityFilter)}
              className="w-full px-2.5 py-2 text-xs bg-[#2c1c12] border border-[#ece2cc]/15 focus:border-[#dcb975] rounded-md text-[#ece2cc] focus:outline-none cursor-pointer"
            >
              {MAP_AVAILABILITY_FILTERS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#22150d]">
                  სტატუსი: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="map-region-select" className="sr-only">
              რეგიონი
            </label>
            <select
              id="map-region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value as MapRegion)}
              className="w-full px-2.5 py-2 text-xs bg-[#2c1c12] border border-[#ece2cc]/15 focus:border-[#dcb975] rounded-md text-[#ece2cc] focus:outline-none cursor-pointer"
            >
              {regionOptions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-[#22150d]">
                  {reg.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Locations List */}
      <div
        className="flex-1 overflow-y-auto royal-scroll divide-y divide-[#ece2cc]/8"
        data-testid="map-locations-list"
      >
        {filteredLocations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="font-display text-base text-[#ece2cc]">
              ლოკაცია ვერ მოიძებნა
            </p>
            <p className="text-xs text-[#c2b398]">
              სცადეთ ფილტრის შეცვლა ან სხვა რეგიონის არჩევა.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md transition-colors cursor-pointer"
            >
              ყველა შედეგის ჩვენება
            </button>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const isSelected = loc.id === selectedId;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => focusLocation(loc)}
                aria-pressed={isSelected}
                className={`w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2c1c12] text-[#ece2cc]'
                    : 'hover:bg-[#2c1c12]/60 text-[#ece2cc]/90'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-md inline-flex items-center justify-center shrink-0 ${
                      loc.category === 'special_ranch'
                        ? loc.status === 'occupied'
                          ? 'bg-[#5c1b16] text-[#f3cf7a] border border-[#e3967d]/60'
                          : 'bg-[#2a180b] text-[#f3cf7a] border border-[#dcb975]/75'
                        : loc.status === 'available'
                          ? 'bg-[#dcb975]/15 text-[#dcb975]'
                          : loc.status === 'occupied'
                            ? 'bg-[#7c2d23]/40 text-[#e3967d]'
                            : 'bg-[#ece2cc]/10 text-[#ece2cc]/80'
                    }`}
                  >
                    <LocationCategoryIcon category={loc.category} className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-[#dcb975]' : 'text-[#ece2cc]'
                      }`}
                    >
                      {loc.name}
                    </p>
                    <p className="text-xs text-[#c2b398] truncate">
                      {loc.regionLabel ?? loc.region} · {loc.categoryLabel}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {loc.status === 'available' && loc.priceGel ? (
                    <span className="font-mono text-xs font-semibold text-[#dcb975] tabular-nums whitespace-nowrap">
                      {formatGelPrice(loc.priceGel)}
                    </span>
                  ) : loc.status === 'occupied' ? (
                    <span className="text-xs text-[#e3967d] whitespace-nowrap">
                      დაკავებულია
                    </span>
                  ) : (
                    <span className="text-xs text-[#c2b398] whitespace-nowrap">
                      საჯარო
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Counter */}
      <div className="px-5 py-3 border-t border-[#ece2cc]/10 bg-[#180e08] flex items-center justify-between text-xs text-[#c2b398]">
        <span data-testid="map-visible-count">
          ნაჩვენებია {filteredLocations.length} ლოკაცია
        </span>
        {(category !== 'all' || availability !== 'all' || region !== 'all' || query) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[#dcb975] hover:text-[#e7c98b] transition-colors cursor-pointer"
          >
            გასუფთავება
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="pt-16 md:pt-20 h-screen w-full overflow-hidden bg-[#180e08] relative">
      {/* Desktop Collapsible Sidebar + Attached Arrow Handle */}
      <div
        data-testid="desktop-map-sidebar-wrapper"
        data-open={desktopSidebarOpen ? 'true' : 'false'}
        style={{
          transform: desktopSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="hidden lg:block fixed top-20 bottom-0 left-0 z-30 w-[388px] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <aside
          aria-label="რუკის ლოკაციების ფილტრი"
          aria-hidden={!desktopSidebarOpen}
          className="w-full h-full bg-[#22150d]/98 backdrop-blur-md border-r border-[#ece2cc]/12 shadow-2xl"
        >
          {sidebarContent}
        </aside>

        {/* Tactile Edge Arrow Handle — slides smoothly with the sidebar */}
        <button
          type="button"
          onClick={() => setDesktopSidebarOpen((prev) => !prev)}
          aria-expanded={desktopSidebarOpen}
          aria-label={desktopSidebarOpen ? 'პანელის დამალვა' : 'პანელის გამოჩენა'}
          title={desktopSidebarOpen ? 'პანელის დამალვა' : 'პანელის გამოჩენა'}
          data-testid="sidebar-arrow-toggle"
          className="absolute top-1/2 -translate-y-1/2 -right-9 w-9 h-16 bg-[#22150d]/95 hover:bg-[#2c1c12] border border-l-0 border-[#dcb975]/45 hover:border-[#dcb975] text-[#dcb975] rounded-r-lg shadow-xl inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#dcb975]"
        >
          {desktopSidebarOpen ? (
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex pt-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-[#120a06]/70"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-[88%] max-w-sm h-full bg-[#22150d] border-r border-[#ece2cc]/15 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive RDR 2 Cartographic Map Viewport */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        data-testid="map-viewport"
        data-realm={realm}
        className={`w-full h-full relative overflow-hidden select-none flex items-center justify-center transition-colors duration-300 ${
          realm === 'mainland' ? 'bg-[#dec79d]' : 'bg-[#19100a]'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Top Controls Bar: Mobile Sidebar Arrow + Map Realm Switcher (America & Mexico | Cuba) */}
        <div
          className={`absolute top-4 z-20 flex items-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] left-3 right-3 sm:right-auto ${
            desktopSidebarOpen ? 'lg:left-[404px]' : 'lg:left-14'
          }`}
        >
          {/* Mobile Edge Arrow Drawer Opener */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="ლოკაციების პანელის გახსნა"
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#22150d]/95 border border-[#dcb975]/45 text-[#ece2cc] rounded-lg shadow-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-[#dcb975]" aria-hidden="true" />
            <span>სია ({filteredLocations.length})</span>
          </button>

          {/* Map Realm Switcher: America & Mexico vs Cuba */}
          <div
            role="tablist"
            aria-label="რუკის არჩევა"
            data-testid="map-realm-switcher"
            className="inline-flex items-center gap-1 p-1 bg-[#22150d]/95 backdrop-blur-md border border-[#dcb975]/35 rounded-lg shadow-xl"
          >
            {MAP_REALMS.map((item) => {
              const active = realm === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleRealmChange(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#dcb975] text-[#22150d] shadow-xs'
                      : 'text-[#ece2cc]/85 hover:text-[#dcb975] hover:bg-[#2c1c12]'
                  }`}
                >
                  {item.id === 'cuba' ? (
                    <Anchor className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <MapIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* High-Sharpness Layout-Sized Map Canvas (Zero CSS scale() blur!) */}
        <div
          data-testid="map-canvas"
          style={{
            width: `${renderedMapWidth}px`,
            height: `${renderedMapHeight}px`,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
          }}
          className={`relative max-w-none shrink-0 ${
            isDragging
              ? ''
              : 'transition-[transform,width,height] duration-200 ease-out'
          }`}
        >
          <img
            key={realm}
            src={mapImageUrl}
            alt={
              realm === 'cuba'
                ? 'ROYAL 1899 — კუბის (Guarma) კუნძულის ინტერაქტიული რუკა'
                : 'ROYAL 1899 — ამერიკისა და მექსიკის (Nuevo Paraíso) ინტერაქტიული რუკა'
            }
            loading="eager"
            decoding="sync"
            draggable={false}
            className="w-full h-full block object-fill pointer-events-none select-none"
          />

          {/* Crisp Vector SVG Green Safe Zones Around All Major Cities */}
          <MapSafeZonesOverlay realm={realm} />

          {/* Subtle Ink Labels (Mainland already has authentic printed typography; only add subtle Mexico ink label) */}
          {realm === 'mainland' ? (
            <div aria-hidden="true" className="pointer-events-none select-none">
              <span className="absolute left-[49%] top-[81.5%] -translate-x-1/2 font-display text-[11px] tracking-[0.22em] text-[#5b3b24]/85 font-semibold uppercase whitespace-nowrap">
                Nuevo Paraíso · მექსიკა
              </span>
            </div>
          ) : (
            <div aria-hidden="true" className="pointer-events-none select-none">
              {/* Crisp label seated inside the Cuba map's vintage top-left cartouche */}
              <span className="absolute left-[13%] top-[14.5%] -translate-x-1/2 -translate-y-1/2 font-display text-xs tracking-[0.16em] text-[#22150d] font-bold uppercase text-center leading-tight">
                კუბა · GUARMA
              </span>
              <span className="absolute left-[21%] top-[31%] font-display text-[11px] tracking-[0.16em] text-[#22150d]/85 font-semibold uppercase bg-[#ece2cc]/75 px-2 py-0.5 rounded-xs">
                La Capilla
              </span>
              <span className="absolute left-[54%] top-[41%] font-display text-[11px] tracking-[0.16em] text-[#22150d]/85 font-semibold uppercase bg-[#ece2cc]/75 px-2 py-0.5 rounded-xs">
                Aguasdulces
              </span>
              <span className="absolute left-[69%] top-[28%] font-display text-[11px] tracking-[0.16em] text-[#22150d]/85 font-semibold uppercase bg-[#ece2cc]/75 px-2 py-0.5 rounded-xs">
                Manicato
              </span>
              <span className="absolute left-[31%] top-[81%] font-display text-[11px] tracking-[0.16em] text-[#22150d]/85 font-semibold uppercase bg-[#ece2cc]/75 px-2 py-0.5 rounded-xs">
                Cinco Torres
              </span>
            </div>
          )}

          {/* Crisp 1:1 Native-Resolution Interactive Map Pins */}
          {filteredLocations.map((loc) => {
            const isSelected = loc.id === selectedId;
            const isSpecialRanch = loc.category === 'special_ranch';
            const pinColorClasses = isSpecialRanch
              ? loc.status === 'occupied'
                ? 'w-9 h-9 rounded-lg bg-[#5c1b16] text-[#f3cf7a] border-2 border-[#e3967d] shadow-[0_0_0_2px_rgba(34,21,13,0.92),0_6px_16px_rgba(0,0,0,0.55)]'
                : 'w-9 h-9 rounded-lg bg-[#251509] text-[#f3cf7a] border-2 border-[#f3cf7a] shadow-[0_0_0_2px_rgba(34,21,13,0.92),0_6px_16px_rgba(0,0,0,0.55)]'
              : loc.status === 'available'
                ? 'w-8 h-8 rounded-full bg-[#dcb975] text-[#22150d] border-2 border-[#22150d]'
                : loc.status === 'occupied'
                  ? 'w-8 h-8 rounded-full bg-[#8c2f24] text-[#ece2cc] border-2 border-[#ece2cc]/85'
                  : 'w-8 h-8 rounded-full bg-[#14532d] text-[#dcfce7] border-2 border-[#4ade80]';

            return (
              <button
                key={loc.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  focusLocation(loc);
                }}
                aria-label={`${loc.name} — ${loc.regionLabel ?? loc.region} · ${loc.categoryLabel} · ${getStatusLabel(loc.status)}`}
                style={{
                  left: `${loc.mapPos.x}%`,
                  top: `${loc.mapPos.y}%`,
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center shadow-lg transition-transform duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcb975] ${pinColorClasses} ${
                  isSelected
                    ? 'z-30 scale-120 ring-4 ring-[#dcb975]/65'
                    : isSpecialRanch
                      ? 'z-20 hover:z-30 hover:scale-110'
                      : 'z-10 hover:z-20 hover:scale-110'
                }`}
              >
                <LocationCategoryIcon
                  category={loc.category}
                  className={isSpecialRanch ? 'w-4 h-4' : 'w-3.5 h-3.5'}
                />

                {/* Hover Label Tooltip */}
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#22150d] border border-[#dcb975]/40 text-[#ece2cc] text-[11px] font-sans whitespace-nowrap shadow-xl">
                  {loc.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom-Left Compact Map Legend (shifts smoothly with sidebar) */}
        <div
          className={`absolute bottom-4 z-20 hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 bg-[#22150d]/94 backdrop-blur-sm border border-[#ece2cc]/15 rounded-lg text-xs text-[#ece2cc] shadow-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] left-4 ${
            desktopSidebarOpen ? 'lg:left-[404px]' : 'lg:left-14'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#dcb975] border border-[#22150d]" aria-hidden="true" />
            <span>თავისუფალი</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8c2f24] border border-[#ece2cc]/70" aria-hidden="true" />
            <span>დაკავებული</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#f3cf7a]">
            <span className="w-4 h-4 rounded-xs bg-[#251509] border border-[#f3cf7a] inline-flex items-center justify-center" aria-hidden="true">
              <Crown className="w-2.5 h-2.5 text-[#f3cf7a]" />
            </span>
            <span>სპეციალ რანჩო</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[#86efac]">
            <span className="w-3.5 h-3.5 rounded-full bg-[#22c55e]/30 border border-dashed border-[#4ade80]" aria-hidden="true" />
            <span>მწვანე ზონა (ქალაქი)</span>
          </span>
        </div>

        {/* Bottom-Right Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-[#22150d]/92 backdrop-blur-sm border border-[#ece2cc]/15 rounded-lg">
          <button
            type="button"
            onClick={() => handleZoomStep(-0.22)}
            aria-label="რუკის დაპატარავება"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#ece2cc] hover:text-[#dcb975] hover:bg-[#2c1c12] transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="px-2 font-mono text-xs text-[#c2b398] tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoomStep(0.22)}
            aria-label="რუკის გადიდება"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#ece2cc] hover:text-[#dcb975] hover:bg-[#2c1c12] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="რუკის ცენტრირება"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#ece2cc] hover:text-[#dcb975] hover:bg-[#2c1c12] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Right Floating Location Detail Card */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.aside
              key={selectedLocation.id}
              aria-label="არჩეული ლოკაციის დეტალები"
              data-testid="map-detail-card"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-16 sm:top-4 right-3 sm:right-4 z-30 w-[calc(100%-1.5rem)] sm:w-[350px] max-h-[calc(100%-8.5rem)] sm:max-h-[calc(100%-5.5rem)] overflow-y-auto royal-scroll bg-[#22150d]/96 backdrop-blur-md border border-[#dcb975]/30 rounded-xl shadow-2xl text-[#ece2cc]"
            >
              {/* Photo Header (shows ONLY uploaded photos: 1..4) */}
              <div className="relative">
                <MediaGalleryViewer
                  variant="card"
                  testId="map-detail-gallery"
                  images={resolveGalleryImages(
                    selectedLocation.imageUrl,
                    selectedLocation.galleryImages,
                  )}
                  alt={selectedLocation.imageAlt}
                  fallbackTitle={selectedLocation.name}
                />
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="დეტალების დახურვა"
                  className="absolute top-3 right-3 z-10 w-9 h-9 inline-flex items-center justify-center rounded-md bg-[#22150d]/85 text-[#ece2cc] hover:text-[#dcb975] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Detail Body */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#dcb975]">{selectedLocation.categoryLabel}</span>
                    <span aria-hidden="true" className="text-[#c2b398]">·</span>
                    <span
                      className={
                        selectedLocation.status === 'available'
                          ? 'text-[#dcb975] font-medium'
                          : selectedLocation.status === 'occupied'
                            ? 'text-[#e3967d] font-medium'
                            : 'text-[#c2b398]'
                      }
                    >
                      {getStatusLabel(selectedLocation.status)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold text-[#ece2cc]">
                      {selectedLocation.name}
                    </h2>
                    {selectedLocation.priceGel && (
                      <span className="font-mono text-base font-semibold text-[#dcb975] tabular-nums whitespace-nowrap shrink-0">
                        {formatGelPrice(selectedLocation.priceGel)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-[#c2b398]">
                    <span>{selectedLocation.regionLabel ?? selectedLocation.region}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCoords(selectedLocation)}
                      aria-label={`კოორდინატების კოპირება: ${formatGameCoords(selectedLocation.coords)}`}
                      className="inline-flex items-center gap-1.5 font-mono text-[#ece2cc]/85 hover:text-[#dcb975] transition-colors cursor-pointer"
                    >
                      <span>{formatGameCoords(selectedLocation.coords)}</span>
                      {copiedCoords ? (
                        <Check className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-75" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[#c2b398]">
                  {selectedLocation.summary}
                </p>

                <ul className="space-y-1.5 text-xs text-[#ece2cc]/85 pt-2 border-t border-[#ece2cc]/10">
                  {selectedLocation.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check
                        className="w-3.5 h-3.5 text-[#dcb975] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Discord Ticket & Share Actions */}
                <div className="pt-3 border-t border-[#ece2cc]/10 flex items-center gap-2.5">
                  <a
                    href={content.copy.general.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={buildLocationDiscordMessage(selectedLocation)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md whitespace-nowrap"
                  >
                    <DiscordIcon className="w-4 h-4 shrink-0" />
                    <span>
                      {selectedLocation.status === 'available'
                        ? 'შეძენა Discord-ში'
                        : 'დისქორდი'}
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-75" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleShareLocation(selectedLocation)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium bg-[#2c1c12] border border-[#ece2cc]/15 hover:border-[#dcb975] text-[#ece2cc] rounded-md whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
                        <span>დაკოპირდა</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#c2b398]" aria-hidden="true" />
                        <span>გაზიარება</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
