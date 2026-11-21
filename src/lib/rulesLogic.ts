import type { HeroMediaConfig, RuleCategoryId, ServerRule } from '../types';

export function filterServerRules(
  rules: ServerRule[],
  category: RuleCategoryId,
  query: string,
): ServerRule[] {
  const normalized = query.trim().toLowerCase();
  return rules.filter((rule) => {
    const matchesCategory = category === 'all' || rule.category === category;
    if (!matchesCategory) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [
      rule.code,
      rule.title,
      rule.categoryLabel,
      rule.summary,
      rule.details,
      rule.example ?? '',
      rule.penalty,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function countRulesByCategory(rules: ServerRule[]): Record<RuleCategoryId, number> {
  const counts: Record<RuleCategoryId, number> = {
    all: rules.length,
    general: 0,
    roleplay: 0,
    crime: 0,
    law: 0,
    economy: 0,
  };
  for (const rule of rules) {
    counts[rule.category] += 1;
  }
  return counts;
}

export interface ResolvedHeroMedia {
  renderKind: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
}

export function resolveHeroMedia(
  config: HeroMediaConfig,
  videoLoadFailed = false,
): ResolvedHeroMedia {
  if (config.type === 'video' && !videoLoadFailed && config.src.trim().length > 0) {
    return {
      renderKind: 'video',
      src: config.src,
      poster: config.poster,
      alt: config.alt,
    };
  }
  if (config.type === 'video') {
    return {
      renderKind: 'image',
      src: config.poster,
      alt: config.alt,
    };
  }
  return {
    renderKind: 'image',
    src: config.src,
    alt: config.alt,
  };
}
