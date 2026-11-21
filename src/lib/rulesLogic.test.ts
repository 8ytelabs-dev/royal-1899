import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVER_RULES } from '../data/rules';
import { countRulesByCategory, filterServerRules, resolveHeroMedia } from './rulesLogic';

test('filterServerRules filters by chapter category and search keywords', () => {
  const crimeRules = filterServerRules(SERVER_RULES, 'crime', '');
  assert.equal(crimeRules.length, 2);

  const rdmSearch = filterServerRules(SERVER_RULES, 'all', 'RDM');
  assert.equal(rdmSearch.length, 1);
  assert.equal(rdmSearch[0].code, '2.1');

  const georgianSearch = filterServerRules(SERVER_RULES, 'all', 'შერიფი');
  assert.ok(georgianSearch.length >= 1);
});

test('countRulesByCategory totals all chapters accurately', () => {
  const counts = countRulesByCategory(SERVER_RULES);
  assert.equal(counts.all, SERVER_RULES.length);
  assert.equal(
    counts.general + counts.roleplay + counts.crime + counts.law + counts.economy,
    counts.all,
  );
});

test('resolveHeroMedia supports image mode, video mode, and fallback to poster', () => {
  const imageResolved = resolveHeroMedia({
    type: 'image',
    src: '/img/hero.jpg',
    alt: 'Hero photo',
  });
  assert.equal(imageResolved.renderKind, 'image');
  assert.equal(imageResolved.src, '/img/hero.jpg');

  const videoResolved = resolveHeroMedia({
    type: 'video',
    src: '/videos/hero.mp4',
    poster: '/img/poster.jpg',
    alt: 'Hero video',
  });
  assert.equal(videoResolved.renderKind, 'video');
  assert.equal(videoResolved.src, '/videos/hero.mp4');
  assert.equal(videoResolved.poster, '/img/poster.jpg');

  const videoFallback = resolveHeroMedia(
    {
      type: 'video',
      src: '/videos/hero.mp4',
      poster: '/img/poster.jpg',
      alt: 'Hero video',
    },
    true,
  );
  assert.equal(videoFallback.renderKind, 'image');
  assert.equal(videoFallback.src, '/img/poster.jpg');
});
