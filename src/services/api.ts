import { SITE_CONFIG } from '../config/siteConfig';
import { MAP_LOCATIONS } from '../data/mapLocations';
import { STORE_PRODUCTS } from '../data/products';
import { SERVER_RULES } from '../data/rules';
import {
  DEMO_PLAYER_CABINET,
  INITIAL_SERVER_STATUS,
  WANTED_SUSPECTS,
} from '../data/serverPortal';
import type {
  MapLocation,
  PlayerCabinetProfile,
  ServerRule,
  ServerStatusSnapshot,
  StoreProduct,
  WantedSuspect,
} from '../types';

/**
 * Backend-ready API adapter for ROYAL 1899.
 * ბექენდის დამატებისას ჩაანაცვლეთ ქვემოთ მოცემული ფუნქციები რეალური fetch() მოთხოვნებით
 * (მაგ. GET /api/status, GET /api/products, GET /api/map-locations, GET /api/cabinet/me).
 */
export async function fetchServerStatus(): Promise<ServerStatusSnapshot> {
  return INITIAL_SERVER_STATUS;
}

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  return STORE_PRODUCTS;
}

export async function fetchServerRules(): Promise<ServerRule[]> {
  return SERVER_RULES;
}

export async function fetchMapLocations(): Promise<MapLocation[]> {
  return MAP_LOCATIONS;
}

export async function fetchWantedSuspects(): Promise<WantedSuspect[]> {
  return WANTED_SUSPECTS;
}

export async function fetchPlayerCabinet(): Promise<PlayerCabinetProfile> {
  return DEMO_PLAYER_CABINET;
}

export function getDiscordPurchaseUrl(): string {
  return SITE_CONFIG.discordStoreUrl;
}
