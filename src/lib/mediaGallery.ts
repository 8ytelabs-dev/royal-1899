export const MAX_GALLERY_IMAGES = 4;

/**
 * Returns ONLY the uploaded/non-empty images (1..4 max, deduplicated).
 * If galleryImages was explicitly provided (e.g. from the 4-slot uploader),
 * only its non-empty entries are returned; otherwise falls back to primaryUrl.
 */
export function resolveGalleryImages(
  primaryUrl?: string,
  galleryImages?: string[],
): string[] {
  const source =
    Array.isArray(galleryImages) && galleryImages.length > 0
      ? galleryImages
      : primaryUrl
        ? [primaryUrl]
        : [];

  const seen = new Set<string>();
  const clean: string[] = [];

  for (const raw of source) {
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    clean.push(trimmed);
    if (clean.length >= MAX_GALLERY_IMAGES) break;
  }

  return clean;
}

/**
 * Normalizes an item's gallery into exactly 4 slots ('' for empty slots)
 * for the Admin 4-photo upload grid.
 */
export function toGallerySlots(
  primaryUrl?: string,
  galleryImages?: string[],
): string[] {
  const resolved = resolveGalleryImages(primaryUrl, galleryImages);
  return Array.from({ length: MAX_GALLERY_IMAGES }, (_, idx) => resolved[idx] ?? '');
}

/**
 * Sets a specific slot (0..3) and compacts uploaded photos to the front
 * so there are never empty gaps before uploaded photos.
 */
export function setGallerySlot(
  slots: string[],
  slotIndex: number,
  mediaUrl: string,
): string[] {
  const next = Array.from(
    { length: MAX_GALLERY_IMAGES },
    (_, i) => slots[i] ?? '',
  );
  if (slotIndex < 0 || slotIndex >= MAX_GALLERY_IMAGES) return next;
  next[slotIndex] = mediaUrl.trim();
  const compacted = resolveGalleryImages(undefined, next);
  return Array.from({ length: MAX_GALLERY_IMAGES }, (_, i) => compacted[i] ?? '');
}

/**
 * Appends one or more newly uploaded photo URLs into the next available empty slots,
 * capped at MAX_GALLERY_IMAGES (4).
 */
export function appendGalleryUploads(
  slots: string[],
  uploadedUrls: string[],
): string[] {
  const existing = resolveGalleryImages(undefined, slots);
  const merged = resolveGalleryImages(undefined, [...existing, ...uploadedUrls]);
  return Array.from({ length: MAX_GALLERY_IMAGES }, (_, i) => merged[i] ?? '');
}

/**
 * Removes the photo at slotIndex and shifts remaining photos forward.
 */
export function removeGallerySlot(slots: string[], slotIndex: number): string[] {
  const next = Array.from(
    { length: MAX_GALLERY_IMAGES },
    (_, i) => slots[i] ?? '',
  );
  if (slotIndex < 0 || slotIndex >= MAX_GALLERY_IMAGES) return next;
  next.splice(slotIndex, 1);
  const compacted = resolveGalleryImages(undefined, next);
  return Array.from({ length: MAX_GALLERY_IMAGES }, (_, i) => compacted[i] ?? '');
}

/**
 * Promotes an uploaded photo at slotIndex to slot 0 (primary cover photo).
 */
export function promoteGallerySlot(slots: string[], slotIndex: number): string[] {
  const existing = resolveGalleryImages(undefined, slots);
  if (slotIndex <= 0 || slotIndex >= existing.length) {
    return Array.from({ length: MAX_GALLERY_IMAGES }, (_, i) => existing[i] ?? '');
  }
  const [chosen] = existing.splice(slotIndex, 1);
  const reordered = [chosen, ...existing];
  return Array.from({ length: MAX_GALLERY_IMAGES }, (_, i) => reordered[i] ?? '');
}

/**
 * Extracts the final saved fields (`imageUrl` + `galleryImages`) from the 4 slots.
 * Only uploaded images are kept; un-uploaded slots are omitted completely.
 */
export function extractSavedGallery(slots: string[]): {
  imageUrl: string;
  galleryImages: string[];
} {
  const galleryImages = resolveGalleryImages(undefined, slots);
  return {
    imageUrl: galleryImages[0] ?? '',
    galleryImages,
  };
}
