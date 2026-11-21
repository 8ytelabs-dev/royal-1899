import { useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import {
  Anchor,
  Check,
  Compass,
  Crosshair,
  Crown,
  Home,
  Map as MapIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trees,
} from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { useSiteContent } from '../../context/SiteContentContext';
import { MAP_REGIONS_BY_REALM } from '../../data/mapLocations';
import { computeGameCoordsFromMapPos } from '../../lib/cmsLogic';
import { extractSavedGallery, resolveGalleryImages } from '../../lib/mediaGallery';
import { formatGelPrice } from '../../lib/storeLogic';
import type { MapLocation, MapRealm } from '../../types';
import { MapSafeZonesOverlay } from '../MapSafeZonesOverlay';
import { MultiImageUploadField } from './MultiImageUploadField';

const CATEGORY_META: Record<MapLocation['category'], string> = {
  house: 'სახლები',
  ranch: 'რანჩოები',
  special_ranch: 'სპეციალ რანჩოები',
  landmark: 'ლოკაციები',
};

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 hover:border-[#ece2cc]/25 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none transition-colors';
const labelClass = 'block text-xs font-medium text-[#dcb975] mb-1.5';

function buildEmptyLocation(realm: MapRealm): MapLocation {
  const defaultRegion =
    realm === 'cuba' ? 'Aguasdulces' : 'New Hanover';
  const defaultPos = { x: 48, y: 46 };
  return {
    id: '',
    realm,
    name: '',
    category: 'house',
    categoryLabel: 'სახლები',
    region: defaultRegion,
    status: 'available',
    priceGel: 180,
    coords: computeGameCoordsFromMapPos(defaultPos, realm),
    mapPos: defaultPos,
    summary: '',
    features: ['პირადი საწყობი და გარდერობი', 'გასაღების გაზიარება 4 მოთამაშემდე'],
    imageUrl: '',
    galleryImages: [],
    imageAlt: 'ROYAL 1899 რუკის ლოკაცია',
  };
}

export function AdminMapPanel() {
  const { content, saveMapLocation, removeMapLocation } = useSiteContent();
  const [realm, setRealm] = useState<MapRealm>('mainland');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MapLocation['status']>('all');
  const [editing, setEditing] = useState<MapLocation>(() =>
    buildEmptyLocation('mainland'),
  );
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [featuresText, setFeaturesText] = useState(editing.features.join('\n'));
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const realmLocations = useMemo(
    () => content.mapLocations.filter((l) => l.realm === realm),
    [content.mapLocations, realm],
  );

  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return realmLocations.filter((loc) => {
      if (statusFilter !== 'all' && loc.status !== statusFilter) return false;
      if (!q) return true;
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.region.toLowerCase().includes(q) ||
        (loc.regionLabel?.toLowerCase().includes(q) ?? false) ||
        loc.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [realmLocations, searchQuery, statusFilter]);

  const regionOptions = MAP_REGIONS_BY_REALM[realm].filter((r) => r.id !== 'all');
  const mapImageUrl =
    realm === 'cuba' ? SITE_CONFIG.cubaMapImageUrl : SITE_CONFIG.mapImageUrl;

  const switchRealm = (nextRealm: MapRealm) => {
    setRealm(nextRealm);
    const fresh = buildEmptyLocation(nextRealm);
    setEditing(fresh);
    setFeaturesText(fresh.features.join('\n'));
    setIsEditingExisting(false);
    setError(null);
  };

  const resetToNew = () => {
    const fresh = buildEmptyLocation(realm);
    setEditing(fresh);
    setFeaturesText(fresh.features.join('\n'));
    setIsEditingExisting(false);
    setError(null);
  };

  const selectForEdit = (loc: MapLocation) => {
    const gallery = resolveGalleryImages(loc.imageUrl, loc.galleryImages);
    setRealm(loc.realm);
    setEditing({
      ...loc,
      imageUrl: gallery[0] ?? '',
      galleryImages: gallery,
      coords: { ...loc.coords },
      mapPos: { ...loc.mapPos },
      features: [...loc.features],
    });
    setFeaturesText(loc.features.join('\n'));
    setIsEditingExisting(true);
    setError(null);
    setNotice(null);
  };

  const handleMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Number(
      Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100)).toFixed(1),
    );
    const yPct = Number(
      Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100)).toFixed(1),
    );
    const nextPos = { x: xPct, y: yPct };
    setEditing((prev) => ({
      ...prev,
      realm,
      mapPos: nextPos,
      coords: computeGameCoordsFromMapPos(nextPos, realm),
    }));
  };

  const toggleAvailabilityQuick = (loc: MapLocation) => {
    if (loc.status === 'public') return;
    const nextStatus = loc.status === 'available' ? 'occupied' : 'available';
    saveMapLocation({ ...loc, status: nextStatus });
    setNotice(
      `„${loc.name}“ მონიშნულია როგორც ${
        nextStatus === 'available' ? 'თავისუფალი' : 'დაკავებული'
      }.`,
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing.name.trim()) {
      setError('შეიყვანეთ სახლის, რანჩოს ან ლოკაციის სახელი.');
      return;
    }

    const id = editing.id || `loc-${Date.now().toString(36)}`;
    const parsedFeatures = featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const { imageUrl, galleryImages } = extractSavedGallery(
      editing.galleryImages ?? (editing.imageUrl ? [editing.imageUrl] : []),
    );

    const payload: MapLocation = {
      ...editing,
      id,
      realm,
      name: editing.name.trim(),
      categoryLabel: CATEGORY_META[editing.category],
      regionLabel: editing.region === 'Mexico' ? 'მექსიკა' : undefined,
      priceGel:
        editing.status === 'public'
          ? undefined
          : Math.max(1, Number(editing.priceGel) || 150),
      summary:
        editing.summary.trim() ||
        `${editing.name.trim()} — ${editing.region} რეგიონში განთავსებული ქონება.`,
      features:
        parsedFeatures.length > 0 ? parsedFeatures : ['რეგისტრაცია Discord-ით'],
      imageUrl,
      galleryImages,
      imageAlt: editing.imageAlt.trim() || editing.name.trim(),
    };

    saveMapLocation(payload);
    setError(null);
    setNotice(
      isEditingExisting
        ? `ლოკაცია „${payload.name}“ განახლდა რუკაზე.`
        : `ახალი ლოკაცია „${payload.name}“ მოინიშნა რუკაზე!`,
    );
    resetToNew();
  };

  return (
    <div className="space-y-6 lg:space-y-7">
      {/* Full-Width Visual Click-to-Pin RDR 2 Map Studio */}
      <section className="bg-[#22150d] border border-[#ece2cc]/10 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ece2cc]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-[#ece2cc]">
              რუკაზე მონიშვნა — დააკლიკეთ სასურველ წერტილზე
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#c2b398]">
              <span>დააკლიკეთ რუკას ახალი პინის დასასმელად ან აირჩიეთ არსებული პინი</span>
              <span className="font-mono text-[#dcb975] tabular-nums">
                X {editing.mapPos.x}% · Y {editing.mapPos.y}% ({editing.coords.x}, {editing.coords.y})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Compact Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#c2b398]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dcb975]" aria-hidden="true" />
                <span>თავისუფალი</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8c2f23]" aria-hidden="true" />
                <span>დაკავებული</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#f3cf7a]">
                <span className="w-4 h-4 rounded-xs bg-[#251509] border border-[#f3cf7a] inline-flex items-center justify-center" aria-hidden="true">
                  <Crown className="w-2.5 h-2.5 text-[#f3cf7a]" />
                </span>
                <span>სპეციალ რანჩო</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#86efac]">
                <span className="w-3 h-3 rounded-full bg-[#22c55e]/30 border border-dashed border-[#4ade80]" aria-hidden="true" />
                <span>მწვანე ზონა</span>
              </span>
            </div>

            <div
              role="tablist"
              aria-label="რუკის არჩევა"
              className="inline-flex items-center gap-1 p-1 bg-[#140c07] border border-[#dcb975]/30 rounded-lg w-fit shrink-0"
            >
              <button
                type="button"
                role="tab"
                aria-selected={realm === 'mainland'}
                onClick={() => switchRealm('mainland')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  realm === 'mainland'
                    ? 'bg-[#dcb975] text-[#1a1009]'
                    : 'text-[#c2b398] hover:text-[#ece2cc]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>ამერიკა & მექსიკა</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={realm === 'cuba'}
                onClick={() => switchRealm('cuba')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  realm === 'cuba'
                    ? 'bg-[#dcb975] text-[#1a1009]'
                    : 'text-[#c2b398] hover:text-[#ece2cc]'
                }`}
              >
                <Anchor className="w-3.5 h-3.5" aria-hidden="true" />
                <span>კუბა</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Interactive Pin Placement Canvas (exact native aspect ratio for 1:1 coordinate fidelity) */}
        <div className="p-4 sm:p-5 bg-[#160d07] flex justify-center">
          <div
            data-testid="admin-map-picker"
            onClick={handleMapClick}
            style={{
              aspectRatio: realm === 'mainland' ? '1300 / 929' : '16 / 9',
            }}
            className={`relative w-full max-w-[960px] rounded-md overflow-hidden border border-[#dcb975]/25 cursor-crosshair select-none ${
              realm === 'mainland' ? 'bg-[#dec79d]' : 'bg-[#19100a]'
            }`}
          >
            <img
              src={mapImageUrl}
              alt="ROYAL 1899 რუკა მონიშვნისთვის"
              draggable={false}
              className="w-full h-full block object-fill"
            />

            <MapSafeZonesOverlay realm={realm} compact />

            {/* Existing Pins */}
            {realmLocations.map((loc) => {
              const isActiveEdit = isEditingExisting && editing.id === loc.id;
              const isSpecialRanch = loc.category === 'special_ranch';
              const pinColor = isSpecialRanch
                ? loc.status === 'occupied'
                  ? 'w-7 h-7 rounded-md bg-[#5c1b16] text-[#f3cf7a] border border-[#e3967d]'
                  : 'w-7 h-7 rounded-md bg-[#251509] text-[#f3cf7a] border-2 border-[#f3cf7a]'
                : loc.status === 'available'
                  ? 'w-6 h-6 rounded-full bg-[#dcb975] text-[#1a1009]'
                  : loc.status === 'occupied'
                    ? 'w-6 h-6 rounded-full bg-[#8c2f23] text-[#ece2cc]'
                    : 'w-6 h-6 rounded-full bg-[#22150d] text-[#dcb975] border border-[#dcb975]/70';
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectForEdit(loc);
                  }}
                  title={`${loc.name} (${loc.region})`}
                  style={{ left: `${loc.mapPos.x}%`, top: `${loc.mapPos.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-md transition-transform cursor-pointer ${pinColor} ${
                    isActiveEdit
                      ? 'ring-2 ring-white scale-125 z-20'
                      : isSpecialRanch
                        ? 'hover:scale-115 z-15'
                        : 'hover:scale-115 z-10'
                  }`}
                >
                  {loc.category === 'house' ? (
                    <Home className="w-3 h-3" aria-hidden="true" />
                  ) : loc.category === 'ranch' ? (
                    <Trees className="w-3 h-3" aria-hidden="true" />
                  ) : loc.category === 'special_ranch' ? (
                    <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Compass className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            {/* Active Draft Pin Preview */}
            <div
              data-testid="admin-map-draft-pin"
              style={{ left: `${editing.mapPos.x}%`, top: `${editing.mapPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#dcb975] text-[#1a1009] border-2 border-[#ece2cc] shadow-xl flex items-center justify-center">
                <Crosshair className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-[#140c07]/95 border border-[#dcb975]/50 text-[10px] font-mono tabular-nums text-[#ece2cc] whitespace-nowrap">
                {editing.name.trim() || 'არჩეული წერტილი'} ({editing.mapPos.x}%, {editing.mapPos.y}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Split: Existing Locations Directory + Spacious Add/Edit Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-7 items-start">
        {/* Left: Realm Locations Directory */}
        <div className="xl:col-span-5 bg-[#22150d] border border-[#ece2cc]/10 rounded-lg overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#ece2cc]/10 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold text-[#ece2cc]">
                მონიშნული ლოკაციები
              </h3>
              <p className="text-xs text-[#c2b398] tabular-nums mt-0.5">
                ნაჩვენებია {filteredLocations.length} / {realmLocations.length} წერტილი
              </p>
            </div>
            <button
              type="button"
              onClick={resetToNew}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] rounded-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ახალი პინი</span>
            </button>
          </div>

          {/* Search + Status Filter */}
          <div className="px-4 py-3 border-b border-[#ece2cc]/8 bg-[#1b100a]/60 space-y-2.5">
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#c2b398]/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="admin-map-search" className="sr-only">
                ლოკაციის ძიება
              </label>
              <input
                id="admin-map-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ძიება სახელით ან რეგიონით..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#140c07] border border-[#ece2cc]/12 focus:border-[#dcb975] rounded-md text-[#ece2cc] placeholder:text-[#c2b398]/45 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'ყველა' },
                  { id: 'available', label: 'თავისუფალი' },
                  { id: 'occupied', label: 'დაკავებული' },
                  { id: 'public', label: 'საჯარო' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                    statusFilter === st.id
                      ? 'bg-[#dcb975] text-[#1a1009] font-semibold'
                      : 'bg-[#140c07] border border-[#ece2cc]/10 text-[#c2b398] hover:text-[#ece2cc]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#ece2cc]/8 max-h-[560px] overflow-y-auto royal-scroll">
            {filteredLocations.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-[#c2b398]">
                მოთხოვნით ლოკაცია ვერ მოიძებნა.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const selected = isEditingExisting && editing.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    className={`px-4 py-3 flex items-center justify-between gap-2.5 transition-colors ${
                      selected ? 'bg-[#2e1d13]' : 'hover:bg-[#281910]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0 ${
                          loc.category === 'special_ranch'
                            ? 'bg-[#251509] text-[#f3cf7a] border border-[#f3cf7a]/70'
                            : 'bg-[#140c07] text-[#dcb975]/85 border border-[#ece2cc]/10'
                        }`}
                      >
                        {loc.category === 'house' ? (
                          <Home className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : loc.category === 'ranch' ? (
                          <Trees className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : loc.category === 'special_ranch' ? (
                          <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#ece2cc] truncate">
                          {loc.name}
                        </p>
                        <p className="text-xs text-[#c2b398] tabular-nums truncate">
                          {loc.regionLabel ?? loc.region} · {loc.categoryLabel}{' '}
                          {loc.priceGel ? `· ${formatGelPrice(loc.priceGel)}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {loc.status !== 'public' && (
                        <button
                          type="button"
                          onClick={() => toggleAvailabilityQuick(loc)}
                          className={`px-2 py-1 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                            loc.status === 'available'
                              ? 'bg-[#dcb975]/15 text-[#dcb975] border border-[#dcb975]/40 hover:bg-[#dcb975]/25'
                              : 'bg-[#8c2f23]/25 text-[#e68a73] border border-[#e68a73]/35 hover:bg-[#8c2f23]/40'
                          }`}
                        >
                          {loc.status === 'available' ? 'თავისუფალია' : 'დაკავებულია'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => selectForEdit(loc)}
                        aria-label={`რედაქტირება: ${loc.name}`}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          selected
                            ? 'bg-[#dcb975]/15 text-[#dcb975]'
                            : 'text-[#c2b398] hover:text-[#dcb975] hover:bg-[#140c07]'
                        }`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeMapLocation(loc.id);
                          if (editing.id === loc.id) resetToNew();
                          setNotice(`„${loc.name}“ წაიშალა რუკიდან.`);
                        }}
                        aria-label={`წაშლა: ${loc.name}`}
                        className="p-1.5 text-[#c2b398] hover:text-[#e68a73] rounded-md hover:bg-[#140c07] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Spacious Location Editor Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-7 bg-[#22150d] border border-[#ece2cc]/10 rounded-lg p-6 lg:p-7 space-y-5"
        >
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#ece2cc]/10">
            <div>
              <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
                {isEditingExisting
                  ? `რედაქტირება: ${editing.name}`
                  : 'ახალი სახლის / რანჩოს დამატება'}
              </h3>
              <p className="text-xs text-[#c2b398] mt-0.5">
                დასვით პინი ზედა რუკაზე, შეავსეთ მონაცემები და შეინახეთ.
              </p>
            </div>
            {isEditingExisting && (
              <button
                type="button"
                onClick={resetToNew}
                className="px-3 py-1.5 text-xs font-medium text-[#c2b398] hover:text-[#ece2cc] bg-[#140c07] border border-[#ece2cc]/12 rounded-md cursor-pointer"
              >
                გაუქმება
              </button>
            )}
          </div>

          {notice && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[#140c07] border border-[#dcb975]/40 text-xs text-[#dcb975]">
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div className="px-3.5 py-2.5 rounded-md bg-[#3c1b15] border border-[#e68a73]/40 text-xs text-[#f2b5a4]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loc-name" className={labelClass}>
                სახელი / ლოკაციის დასახელება *
              </label>
              <input
                id="loc-name"
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="მაგ. Emerald Creek Ranch"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="loc-category" className={labelClass}>
                კატეგორია
              </label>
              <select
                id="loc-category"
                value={editing.category}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value as MapLocation['category'],
                  })
                }
                className={inputClass}
              >
                <option value="house">სახლი</option>
                <option value="ranch">რანჩო</option>
                <option value="special_ranch">სპეციალ რანჩო</option>
                <option value="landmark">საჯარო ლოკაცია / ქალაქი</option>
              </select>
            </div>

            <div>
              <label htmlFor="loc-region" className={labelClass}>
                რეგიონი
              </label>
              <select
                id="loc-region"
                value={editing.region}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    region: e.target.value as MapLocation['region'],
                  })
                }
                className={inputClass}
              >
                {regionOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="loc-status" className={labelClass}>
                სტატუსი
              </label>
              <select
                id="loc-status"
                value={editing.status}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as MapLocation['status'],
                  })
                }
                className={inputClass}
              >
                <option value="available">თავისუფალია</option>
                <option value="occupied">დაკავებულია</option>
                <option value="public">საჯარო ლოკაცია</option>
              </select>
            </div>

            <div>
              <label htmlFor="loc-price" className={labelClass}>
                ფასი (₾)
              </label>
              <input
                id="loc-price"
                type="number"
                min={0}
                disabled={editing.status === 'public'}
                value={editing.priceGel ?? 0}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    priceGel: Number(e.target.value) || 0,
                  })
                }
                className={`${inputClass} font-mono tabular-nums disabled:opacity-50`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="loc-pos-x" className={labelClass}>
                  რუკა X (%)
                </label>
                <input
                  id="loc-pos-x"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={editing.mapPos.x}
                  onChange={(e) => {
                    const x = Number(e.target.value) || 0;
                    const nextPos = { ...editing.mapPos, x };
                    setEditing({
                      ...editing,
                      mapPos: nextPos,
                      coords: computeGameCoordsFromMapPos(nextPos, realm),
                    });
                  }}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label htmlFor="loc-pos-y" className={labelClass}>
                  რუკა Y (%)
                </label>
                <input
                  id="loc-pos-y"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={editing.mapPos.y}
                  onChange={(e) => {
                    const y = Number(e.target.value) || 0;
                    const nextPos = { ...editing.mapPos, y };
                    setEditing({
                      ...editing,
                      mapPos: nextPos,
                      coords: computeGameCoordsFromMapPos(nextPos, realm),
                    });
                  }}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
            </div>
          </div>

          {/* 4-Slot Photo Upload Studio (Upload Only — No URL Input) */}
          <MultiImageUploadField
            idPrefix="map-gallery"
            label="სახლის / რანჩოს ფოტოები (მაქს. 4 ფოტო)"
            images={resolveGalleryImages(editing.imageUrl, editing.galleryImages)}
            fallbackTitle={editing.name || 'ლოკაცია'}
            onChange={(nextGallery) =>
              setEditing((prev) => ({
                ...prev,
                imageUrl: nextGallery[0] ?? '',
                galleryImages: nextGallery,
              }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="loc-summary" className={labelClass}>
                აღწერა
              </label>
              <textarea
                id="loc-summary"
                rows={3}
                value={editing.summary}
                onChange={(e) =>
                  setEditing({ ...editing, summary: e.target.value })
                }
                placeholder="მოკლე აღწერა სახლის ან რანჩოს შესახებ..."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="loc-features" className={labelClass}>
                მახასიათებლები (თითო ხაზზე თითო)
              </label>
              <textarea
                id="loc-features"
                rows={3}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#ece2cc]/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono tabular-nums text-[#c2b398]">
              თამაშის კოორდინატები: X {editing.coords.x} · Y {editing.coords.y}
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#1a1009] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md cursor-pointer"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>
                {isEditingExisting ? 'ცვლილებების შენახვა' : 'რუკაზე დამატება'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
