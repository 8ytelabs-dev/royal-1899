import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeGameCoordsFromMapPos,
  createDefaultSiteContent,
  deleteMapLocation,
  deleteServerRule,
  deleteStoreProduct,
  mergeSiteContent,
  parseCmsImportJson,
  upsertMapLocation,
  upsertServerRule,
  upsertStoreProduct,
} from './cmsLogic';

test('upsertStoreProduct adds new product, updates existing, and enforces single featured item', () => {
  const defaults = createDefaultSiteContent();
  const created = {
    ...defaults.products[0],
    id: 'custom-ranch-pack',
    slug: 'custom-ranch-pack',
    name: 'საცდელი რანჩოს პაკეტი',
    priceGel: 120,
    featured: true,
  };

  const withAdded = upsertStoreProduct(defaults.products, created);
  assert.equal(withAdded.length, defaults.products.length + 1);
  assert.equal(withAdded[0].id, 'custom-ranch-pack');
  assert.equal(
    withAdded.filter((p) => p.featured).length,
    1,
    'Only the newly featured product should remain featured',
  );

  const updated = upsertStoreProduct(withAdded, { ...created, priceGel: 145 });
  assert.equal(updated.length, withAdded.length);
  assert.equal(updated.find((p) => p.id === 'custom-ranch-pack')?.priceGel, 145);

  const afterDelete = deleteStoreProduct(updated, 'custom-ranch-pack');
  assert.equal(afterDelete.length, defaults.products.length);
});

test('upsertServerRule and deleteServerRule maintain rules list cleanly', () => {
  const defaults = createDefaultSiteContent();
  const nextRule = {
    id: 'rule-custom-1',
    code: '§6.1',
    category: 'roleplay' as const,
    categoryLabel: 'როლფლეი',
    title: 'ახალი როლფლეი წესი',
    summary: 'მოკლე აღწერა',
    details: 'სრული ტექსტი',
    penalty: 'გაფრთხილება',
  };

  const added = upsertServerRule(defaults.rules, nextRule);
  assert.equal(added.length, defaults.rules.length + 1);

  const edited = upsertServerRule(added, { ...nextRule, title: 'განახლებული წესი' });
  assert.equal(edited.length, added.length);
  assert.equal(edited.find((r) => r.id === 'rule-custom-1')?.title, 'განახლებული წესი');

  const removed = deleteServerRule(edited, 'rule-custom-1');
  assert.equal(removed.length, defaults.rules.length);
});

test('upsertMapLocation, deleteMapLocation, and computeGameCoordsFromMapPos work deterministically', () => {
  const defaults = createDefaultSiteContent();
  const coordsMainland = computeGameCoordsFromMapPos({ x: 50, y: 50 }, 'mainland');
  assert.equal(typeof coordsMainland.x, 'number');
  assert.equal(typeof coordsMainland.y, 'number');

  const coordsCuba = computeGameCoordsFromMapPos({ x: 40, y: 60 }, 'cuba');
  assert.ok(coordsCuba.y < -6000);

  const newPin = {
    ...defaults.mapLocations[0],
    id: 'custom-house-1',
    name: 'ახალი სახლი Valentine-ში',
    mapPos: { x: 45, y: 38 },
    coords: coordsMainland,
  };

  const added = upsertMapLocation(defaults.mapLocations, newPin);
  assert.equal(added.length, defaults.mapLocations.length + 1);
  assert.equal(added[0].id, 'custom-house-1');

  const removed = deleteMapLocation(added, 'custom-house-1');
  assert.equal(removed.length, defaults.mapLocations.length);
});

test('mergeSiteContent and parseCmsImportJson handle partial and invalid inputs safely', () => {
  const defaults = createDefaultSiteContent();
  const merged = mergeSiteContent(defaults, {
    copy: {
      ...defaults.copy,
      hero: {
        ...defaults.copy.hero,
        title: 'განახლებული სათაური',
      },
    },
  });
  assert.equal(merged.copy.hero.title, 'განახლებული სათაური');
  assert.equal(merged.products.length, defaults.products.length);

  const invalid = parseCmsImportJson('not valid json', defaults);
  assert.equal(invalid.ok, false);

  const valid = parseCmsImportJson(JSON.stringify({ serverStatus: { ...defaults.serverStatus, playersOnline: 99 } }), defaults);
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.state.serverStatus.playersOnline, 99);
  }
});
