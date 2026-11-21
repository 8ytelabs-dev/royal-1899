import test from 'node:test';
import assert from 'node:assert/strict';
import { STORE_PRODUCTS } from '../data/products';
import {
  buildDiscordPurchaseMessage,
  filterStoreProducts,
  formatGelPrice,
} from './storeLogic';

test('filterStoreProducts filters by category and Georgian query', () => {
  const propertyOnly = filterStoreProducts(STORE_PRODUCTS, 'property', '');
  assert.equal(propertyOnly.length, 1);
  assert.equal(propertyOnly[0].id, 'homestead-ranch-deed');

  const queryMatch = filterStoreProducts(STORE_PRODUCTS, 'all', 'სალუნი');
  assert.equal(queryMatch.length, 1);
  assert.equal(queryMatch[0].id, 'saloon-enterprise-charter');

  const noMatch = filterStoreProducts(STORE_PRODUCTS, 'horses', 'სალუნი');
  assert.equal(noMatch.length, 0);
});

test('formatGelPrice formats GEL currency cleanly', () => {
  assert.equal(formatGelPrice(85), '85 ₾');
  assert.equal(formatGelPrice(120), '120 ₾');
});

test('buildDiscordPurchaseMessage produces ROYAL 1899 ticket message with package details', () => {
  const ranch = STORE_PRODUCTS[0];
  const message = buildDiscordPurchaseMessage(ranch);
  assert.match(message, /ROYAL 1899/);
  assert.match(message, new RegExp(ranch.name));
  assert.match(message, /85 ₾/);
});
