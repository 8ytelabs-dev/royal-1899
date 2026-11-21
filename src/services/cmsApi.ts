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

/**
 * ადმინ CMS-ის API კლიენტი — PostgreSQL (Drizzle) ბექენდთან კომუნიკაცია.
 * ყველა mutation ბაზაში ინახება /api ენდპოინტებით.
 */

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API ${path} → ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchFullContent(): Promise<{
  initialized: boolean;
  content: SiteContentState;
}> {
  return request('/content');
}

export async function importContent(state: SiteContentState): Promise<void> {
  await request('/content', { method: 'PUT', body: JSON.stringify(state) });
}

export async function resetContent(): Promise<void> {
  await request('/content/reset', { method: 'POST' });
}

export async function saveCopySection<K extends keyof SiteCopyState>(
  section: K,
  data: SiteCopyState[K],
): Promise<void> {
  await request(`/copy/${section}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function saveServerStatus(
  patch: Partial<ServerStatusSnapshot>,
): Promise<void> {
  await request('/server-status', {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
}

export async function saveProduct(product: StoreProduct): Promise<void> {
  await request(`/products/${encodeURIComponent(product.id)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await request(`/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export async function saveRule(rule: ServerRule): Promise<void> {
  await request(`/rules/${encodeURIComponent(rule.id)}`, {
    method: 'PUT',
    body: JSON.stringify(rule),
  });
}

export async function deleteRule(ruleId: string): Promise<void> {
  await request(`/rules/${encodeURIComponent(ruleId)}`, { method: 'DELETE' });
}

export async function saveMapLocation(location: MapLocation): Promise<void> {
  await request(`/map-locations/${encodeURIComponent(location.id)}`, {
    method: 'PUT',
    body: JSON.stringify(location),
  });
}

export async function deleteMapLocation(locationId: string): Promise<void> {
  await request(`/map-locations/${encodeURIComponent(locationId)}`, {
    method: 'DELETE',
  });
}

export async function replaceGuideSteps(steps: GuideStep[]): Promise<void> {
  await request('/guide/steps', { method: 'PUT', body: JSON.stringify(steps) });
}

export async function replaceKeybinds(items: KeybindItem[]): Promise<void> {
  await request('/guide/keybinds', {
    method: 'PUT',
    body: JSON.stringify(items),
  });
}

export async function replaceGuideFaqs(faqs: GuideFaqItem[]): Promise<void> {
  await request('/guide/faqs', { method: 'PUT', body: JSON.stringify(faqs) });
}

export async function replaceWantedSuspects(
  suspects: WantedSuspect[],
): Promise<void> {
  await request('/wanted', { method: 'PUT', body: JSON.stringify(suspects) });
}

export async function registerMediaAsset(asset: {
  url: string;
  type?: 'image' | 'video';
  alt?: string;
  context?: string;
}): Promise<void> {
  await request('/media', { method: 'POST', body: JSON.stringify(asset) });
}
