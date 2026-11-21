import { useEffect, useState } from 'react';

export const IDB_MEDIA_PREFIX = 'idb-media://';
const DB_NAME = 'royal_1899_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

const objectUrlCache = new Map<string, string>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

export function isStoredMediaRef(src?: string): boolean {
  return typeof src === 'string' && src.startsWith(IDB_MEDIA_PREFIX);
}

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

async function saveBlobToIdb(key: string, blob: Blob): Promise<boolean> {
  const db = await openMediaDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function loadBlobFromIdb(key: string): Promise<Blob | null> {
  const db = await openMediaDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        const val = req.result;
        resolve(val instanceof Blob ? val : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('ფაილის წაკითხვა ვერ მოხერხდა.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Downscales large uploaded photos cleanly on an offscreen canvas so uploads
 * remain crisp (up to 1600px) while keeping browser storage lightweight.
 */
async function compressImageToBlob(file: File, maxDimension = 1280): Promise<Blob> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(
          1,
          maxDimension / Math.max(img.naturalWidth || 1, img.naturalHeight || 1),
        );
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(tempUrl);
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(tempUrl);
            resolve(blob && blob.size > 0 ? blob : file);
          },
          'image/jpeg',
          0.85,
        );
      } catch {
        URL.revokeObjectURL(tempUrl);
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(file);
    };
    img.src = tempUrl;
  });
}

function createMediaRef(kind: 'img' | 'vid'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${IDB_MEDIA_PREFIX}${kind}-${Date.now().toString(36)}-${rand}`;
}

/**
 * Uploads an image file locally (compresses + stores in IndexedDB) and returns
 * a persistent `idb-media://...` reference (or data URL fallback).
 */
export async function uploadImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('გთხოვთ აირჩიოთ სურათის ფაილი (JPG, PNG, WebP).');
  }
  const optimizedBlob = await compressImageToBlob(file, 1600);
  const ref = createMediaRef('img');
  const saved = await saveBlobToIdb(ref, optimizedBlob);
  if (saved) {
    const objectUrl = URL.createObjectURL(optimizedBlob);
    objectUrlCache.set(ref, objectUrl);
    return ref;
  }
  return readBlobAsDataUrl(optimizedBlob);
}

/**
 * Uploads a Hero video file (MP4 / WebM) locally into IndexedDB and returns
 * a persistent `idb-media://...` reference without filling localStorage.
 */
export async function uploadVideoFile(file: File): Promise<string> {
  if (!file.type.startsWith('video/')) {
    throw new Error('გთხოვთ აირჩიოთ ვიდეო ფაილი (MP4 ან WebM).');
  }
  const ref = createMediaRef('vid');
  const saved = await saveBlobToIdb(ref, file);
  const objectUrl = URL.createObjectURL(file);
  objectUrlCache.set(ref, objectUrl);
  if (saved) {
    return ref;
  }
  return objectUrl;
}

/**
 * Resolves `idb-media://...` references to browser-renderable object URLs.
 * Standard static paths and data URLs are returned immediately as-is.
 */
export async function resolveStoredMediaUrl(src?: string): Promise<string> {
  if (!src) return '';
  if (!isStoredMediaRef(src)) return src;
  const cached = objectUrlCache.get(src);
  if (cached) return cached;

  const blob = await loadBlobFromIdb(src);
  if (!blob) return '';
  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(src, objectUrl);
  return objectUrl;
}

/**
 * React hook that synchronously returns normal URLs or cached IndexedDB URLs,
 * and asynchronously hydrates IndexedDB blobs after page reload.
 */
export function useResolvedMediaUrl(src?: string): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!src) return '';
    if (!isStoredMediaRef(src)) return src;
    return objectUrlCache.get(src) ?? '';
  });

  useEffect(() => {
    if (!src) {
      setResolved('');
      return;
    }
    if (!isStoredMediaRef(src)) {
      setResolved(src);
      return;
    }
    const cached = objectUrlCache.get(src);
    if (cached) {
      setResolved(cached);
      return;
    }

    let cancelled = false;
    resolveStoredMediaUrl(src).then((url) => {
      if (!cancelled) {
        setResolved(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}
