import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVER_KEYBINDS, WANTED_SUSPECTS } from '../data/serverPortal';
import {
  calculateServerOccupancyPct,
  filterKeybinds,
  filterWantedSuspects,
  formatUsdReward,
  getServerStatusLabel,
} from './portalLogic';

test('calculateServerOccupancyPct clamps percentage cleanly', () => {
  assert.equal(calculateServerOccupancyPct(64, 128), 50);
  assert.equal(calculateServerOccupancyPct(150, 128), 100);
  assert.equal(calculateServerOccupancyPct(0, 0), 0);
});

test('getServerStatusLabel reflects online and offline states accurately', () => {
  assert.equal(getServerStatusLabel(true), 'სერვერი აქტიურია');
  assert.equal(getServerStatusLabel(false), 'სერვერი დროებით გამორთულია');
});

test('filterKeybinds filters by category and search query', () => {
  const horseKeys = filterKeybinds(SERVER_KEYBINDS, 'horse', '');
  assert.ok(horseKeys.length >= 2);
  assert.ok(horseKeys.every((k) => k.category === 'horse'));

  const searchVoice = filterKeybinds(SERVER_KEYBINDS, 'all', 'ჩატი');
  assert.ok(searchVoice.length >= 2);
});

test('filterWantedSuspects and formatUsdReward work deterministically', () => {
  const active = filterWantedSuspects(WANTED_SUSPECTS, 'active', '');
  assert.ok(active.length >= 3);
  assert.ok(active.every((s) => s.status === 'active'));

  const captured = filterWantedSuspects(WANTED_SUSPECTS, 'captured', '');
  assert.ok(captured.length >= 1);
  assert.ok(captured.every((s) => s.status === 'captured'));

  assert.equal(formatUsdReward(1250), '$1,250');
});
