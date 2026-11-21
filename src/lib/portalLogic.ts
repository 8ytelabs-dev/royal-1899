import type {
  KeybindCategory,
  KeybindItem,
  WantedStatus,
  WantedSuspect,
} from '../types';

export function calculateServerOccupancyPct(online: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((online / max) * 100)));
}

export function getServerStatusLabel(online: boolean): string {
  return online ? 'სერვერი აქტიურია' : 'სერვერი დროებით გამორთულია';
}

export function filterKeybinds(
  items: KeybindItem[],
  category: KeybindCategory,
  query: string,
): KeybindItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [
      ...item.keys,
      item.action,
      item.description,
      item.categoryLabel,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function filterWantedSuspects(
  suspects: WantedSuspect[],
  status: WantedStatus,
  query: string,
): WantedSuspect[] {
  const normalized = query.trim().toLowerCase();
  return suspects.filter((suspect) => {
    if (status !== 'all' && suspect.status !== status) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [
      suspect.name,
      suspect.alias,
      suspect.lastSeenRegion,
      suspect.issuedBy,
      ...suspect.charges,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function formatUsdReward(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}
