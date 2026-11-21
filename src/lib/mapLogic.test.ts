import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_LOCATIONS } from '../data/mapLocations';
import {
  buildLocationDiscordMessage,
  clampMapZoom,
  computeScaledPan,
  countMapLocationsByStatus,
  filterMapLocations,
  formatGameCoords,
  getRealmLocations,
  getStatusLabel,
} from './mapLogic';

test('mainland realm includes both America and Mexico, while cuba realm is isolated', () => {
  const mainland = getRealmLocations(MAP_LOCATIONS, 'mainland');
  const cuba = getRealmLocations(MAP_LOCATIONS, 'cuba');

  assert.ok(mainland.some((l) => l.region === 'West Elizabeth'));
  assert.ok(mainland.some((l) => l.region === 'Mexico'));
  assert.ok(mainland.every((l) => l.realm === 'mainland'));

  assert.ok(cuba.length >= 6);
  assert.ok(cuba.every((l) => l.realm === 'cuba'));
  assert.equal(mainland.length + cuba.length, MAP_LOCATIONS.length);
});

test('filterMapLocations filters by realm, category, availability, region, and search query', () => {
  const availableMainlandRanches = filterMapLocations(MAP_LOCATIONS, {
    realm: 'mainland',
    category: 'ranch',
    availability: 'available',
    region: 'all',
    query: '',
  });
  assert.ok(availableMainlandRanches.length > 0);
  assert.ok(
    availableMainlandRanches.every(
      (l) => l.realm === 'mainland' && l.category === 'ranch' && l.status === 'available',
    ),
  );

  const mexicoOnly = filterMapLocations(MAP_LOCATIONS, {
    realm: 'mainland',
    category: 'all',
    availability: 'all',
    region: 'Mexico',
    query: '',
  });
  assert.ok(mexicoOnly.length >= 5);
  assert.ok(mexicoOnly.every((l) => l.region === 'Mexico' && l.realm === 'mainland'));

  const cubaAvailable = filterMapLocations(MAP_LOCATIONS, {
    realm: 'cuba',
    category: 'all',
    availability: 'available',
    region: 'all',
    query: '',
  });
  assert.ok(cubaAvailable.length >= 3);
  assert.ok(cubaAvailable.every((l) => l.realm === 'cuba' && l.status === 'available'));

  const searchBlackwater = filterMapLocations(MAP_LOCATIONS, {
    realm: 'mainland',
    category: 'all',
    availability: 'all',
    region: 'West Elizabeth',
    query: 'blackwater',
  });
  assert.ok(searchBlackwater.length >= 2);

  const mainlandSpecialRanches = filterMapLocations(MAP_LOCATIONS, {
    realm: 'mainland',
    category: 'special_ranch',
    availability: 'all',
    region: 'all',
    query: '',
  });
  assert.ok(mainlandSpecialRanches.length >= 2);
  assert.ok(mainlandSpecialRanches.every((l) => l.category === 'special_ranch'));

  const cubaSpecialRanches = filterMapLocations(MAP_LOCATIONS, {
    realm: 'cuba',
    category: 'special_ranch',
    availability: 'all',
    region: 'all',
    query: '',
  });
  assert.ok(cubaSpecialRanches.length >= 1);
  assert.ok(cubaSpecialRanches.every((l) => l.category === 'special_ranch' && l.realm === 'cuba'));
});

test('countMapLocationsByStatus sums to total locations per realm', () => {
  const mainland = getRealmLocations(MAP_LOCATIONS, 'mainland');
  const counts = countMapLocationsByStatus(mainland);
  assert.equal(counts.available + counts.occupied + counts.landmarks, counts.total);
  assert.equal(counts.total, mainland.length);

  const cuba = getRealmLocations(MAP_LOCATIONS, 'cuba');
  const cubaCounts = countMapLocationsByStatus(cuba);
  assert.equal(cubaCounts.available + cubaCounts.occupied + cubaCounts.landmarks, cubaCounts.total);
  assert.equal(cubaCounts.total, cuba.length);
});

test('clampMapZoom, formatGameCoords, and Discord message builder behave deterministically', () => {
  assert.equal(clampMapZoom(0.2), 1);
  assert.equal(clampMapZoom(5), 3);
  assert.equal(clampMapZoom(1.75), 1.75);

  const scaled = computeScaledPan({ x: 100, y: -50 }, 1, 2, 600, 400);
  assert.deepEqual(scaled, { x: 200, y: -100 });
  const clamped = computeScaledPan({ x: 500, y: -400 }, 1, 2, 600, 400);
  assert.deepEqual(clamped, { x: 600, y: -400 });

  assert.equal(formatGameCoords({ x: -2324, y: -2405 }), 'X -2324 · Y -2405');
  assert.equal(getStatusLabel('available'), 'თავისუფალი');
  assert.equal(getStatusLabel('occupied'), 'დაკავებულია');
  assert.equal(getStatusLabel('public'), 'საჯარო ლოკაცია');

  const msg = buildLocationDiscordMessage(MAP_LOCATIONS[0]);
  assert.match(msg, /ROYAL 1899/);
  assert.match(msg, /Blackwater Ranch/);
  assert.match(msg, /200 ₾/);
});
