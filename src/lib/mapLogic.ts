import type {
  MapAvailabilityFilter,
  MapLocation,
  MapLocationCategory,
  MapRealm,
  MapRegion,
} from '../types';
import { formatGelPrice } from './storeLogic';

export interface MapFilterCriteria {
  realm: MapRealm;
  category: MapLocationCategory;
  availability: MapAvailabilityFilter;
  region: MapRegion;
  query: string;
}

export function getRealmLocations(locations: MapLocation[], realm: MapRealm): MapLocation[] {
  return locations.filter((loc) => loc.realm === realm);
}

export function filterMapLocations(
  locations: MapLocation[],
  criteria: MapFilterCriteria,
): MapLocation[] {
  const normalized = criteria.query.trim().toLowerCase();

  return locations.filter((loc) => {
    if (loc.realm !== criteria.realm) {
      return false;
    }

    if (criteria.category !== 'all' && loc.category !== criteria.category) {
      return false;
    }

    if (criteria.availability === 'available' && loc.status !== 'available') {
      return false;
    }

    if (criteria.availability === 'occupied' && loc.status !== 'occupied') {
      return false;
    }

    if (criteria.region !== 'all' && loc.region !== criteria.region) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      loc.name,
      loc.region,
      loc.regionLabel ?? '',
      loc.categoryLabel,
      loc.summary,
      ...loc.features,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function countMapLocationsByStatus(locations: MapLocation[]) {
  let available = 0;
  let occupied = 0;
  let landmarks = 0;

  for (const loc of locations) {
    if (loc.status === 'available') available += 1;
    else if (loc.status === 'occupied') occupied += 1;
    else landmarks += 1;
  }

  return {
    total: locations.length,
    available,
    occupied,
    landmarks,
  };
}

export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 3;

export function clampMapZoom(zoom: number): number {
  return Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, Number(zoom.toFixed(2))));
}

export function computeScaledPan(
  pan: { x: number; y: number },
  prevZoom: number,
  nextZoom: number,
  maxOffsetX: number,
  maxOffsetY: number,
): { x: number; y: number } {
  if (prevZoom <= 0) return pan;
  const ratio = nextZoom / prevZoom;
  return {
    x: Math.round(Math.max(-maxOffsetX, Math.min(maxOffsetX, pan.x * ratio))),
    y: Math.round(Math.max(-maxOffsetY, Math.min(maxOffsetY, pan.y * ratio))),
  };
}

export function formatGameCoords(coords: { x: number; y: number }): string {
  return `X ${coords.x} · Y ${coords.y}`;
}

export function getStatusLabel(status: MapLocation['status']): string {
  if (status === 'available') return 'თავისუფალი';
  if (status === 'occupied') return 'დაკავებულია';
  return 'საჯარო ლოკაცია';
}

export function buildLocationDiscordMessage(location: MapLocation): string {
  const pricePart = location.priceGel ? ` | ფასი: ${formatGelPrice(location.priceGel)}` : '';
  const regionName = location.regionLabel ?? location.region;
  return `ROYAL 1899 — რუკის ლოკაცია | ${location.name} (${regionName}) | ${formatGameCoords(location.coords)}${pricePart}`;
}
