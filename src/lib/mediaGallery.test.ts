import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_GALLERY_IMAGES,
  appendGalleryUploads,
  extractSavedGallery,
  promoteGallerySlot,
  removeGallerySlot,
  resolveGalleryImages,
  setGallerySlot,
  toGallerySlots,
} from './mediaGallery';

test('resolveGalleryImages returns only uploaded images and falls back to primaryUrl', () => {
  assert.deepEqual(resolveGalleryImages('/a.jpg'), ['/a.jpg']);
  assert.deepEqual(resolveGalleryImages('/a.jpg', ['/b.jpg', '', '  ']), ['/b.jpg']);
  assert.deepEqual(
    resolveGalleryImages('/a.jpg', ['/1.jpg', '/2.jpg', '', '']),
    ['/1.jpg', '/2.jpg'],
  );
  assert.deepEqual(
    resolveGalleryImages('/a.jpg', ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg']),
    ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg'],
  );
  assert.equal(MAX_GALLERY_IMAGES, 4);
});

test('setGallerySlot, appendGalleryUploads, removeGallerySlot, and promoteGallerySlot manage up to 4 slots cleanly', () => {
  const empty = toGallerySlots(undefined, []);
  assert.deepEqual(empty, ['', '', '', '']);

  const withOne = setGallerySlot(empty, 2, 'idb-media://img-1');
  assert.deepEqual(withOne, ['idb-media://img-1', '', '', '']);

  const withThree = appendGalleryUploads(withOne, [
    'idb-media://img-2',
    'idb-media://img-3',
  ]);
  assert.deepEqual(withThree, [
    'idb-media://img-1',
    'idb-media://img-2',
    'idb-media://img-3',
    '',
  ]);

  const promoted = promoteGallerySlot(withThree, 2);
  assert.deepEqual(promoted, [
    'idb-media://img-3',
    'idb-media://img-1',
    'idb-media://img-2',
    '',
  ]);

  const removed = removeGallerySlot(promoted, 1);
  assert.deepEqual(removed, ['idb-media://img-3', 'idb-media://img-2', '', '']);

  const saved = extractSavedGallery(removed);
  assert.equal(saved.imageUrl, 'idb-media://img-3');
  assert.deepEqual(saved.galleryImages, ['idb-media://img-3', 'idb-media://img-2']);
});
