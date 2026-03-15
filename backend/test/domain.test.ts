import { describe, expect, it } from 'bun:test';
import { normalizeDomain } from '../src/domain/normalize.js';
import { isValidRegexPattern, matchesPath } from '../src/domain/path-match.js';
import { computeRepositoryScore } from '../src/domain/ranking.js';

describe('domain utils', () => {
  it('normalizes site domains', () => {
    expect(normalizeDomain('https://Example.com/')).toBe('example.com');
  });

  it('validates regex patterns and path matching', () => {
    expect(isValidRegexPattern('^/products/.+$')).toBe(true);
    expect(isValidRegexPattern('[')).toBe(false);
    expect(matchesPath('^/products/.+$', '/products/123')).toBe(true);
    expect(matchesPath('[', '/products/123')).toBe(false);
  });

  it('computes repository score deterministically', () => {
    const now = new Date('2026-03-07T00:00:00.000Z');
    const score = computeRepositoryScore({
      starsCount: 10,
      usageCount: 20,
      lastActiveAt: '2026-03-06T00:00:00.000Z',
      now,
    });

    expect(score).toBe(22.8);
  });
});
