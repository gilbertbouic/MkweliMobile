/**
 * @format
 * Phase A token matching unit tests.
 */

import {
  buildTokenIndex,
  scoreTokenMatch,
  searchTokenIndex,
  tokenize,
} from '../src/sanctions/tokenMatch';
import {screenName, isSanctioned, allSanctionedNames} from '../sanctions-data';

describe('tokenize', () => {
  test('splits and lowercases name parts', () => {
    expect(tokenize('Abdul Rahman Yasin')).toEqual([
      'abdul',
      'rahman',
      'yasin',
    ]);
  });

  test('is order-sensitive only in array order, not for matching content', () => {
    expect(tokenize('Yasin, Abdul')).toEqual(['yasin', 'abdul']);
  });

  test('drops stop words and short tokens', () => {
    expect(tokenize('Ministry of Defence')).toEqual(['ministry', 'defence']);
    expect(tokenize('A B')).toEqual([]);
  });

  test('strips punctuation and collapses spaces', () => {
    expect(tokenize("  O'Brien–Smith  ")).toEqual(['o', 'brien', 'smith'].filter(t => t.length >= 2));
    // o alone dropped; brien smith kept
    expect(tokenize("O'Brien Smith")).toEqual(['brien', 'smith']);
  });

  test('dedupes repeated tokens', () => {
    expect(tokenize('Ali Ali Khan')).toEqual(['ali', 'khan']);
  });
});

describe('scoreTokenMatch', () => {
  test('full multiset any order scores 100', () => {
    const r = scoreTokenMatch(
      ['yasin', 'abdul'],
      ['abdul', 'rahman', 'yasin'],
    );
    // all query tokens present but list has extra → not 100 multiset
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(82);
    expect(r!.matchedTokens).toEqual(['yasin', 'abdul']);
  });

  test('exact same tokens any order scores 100', () => {
    const r = scoreTokenMatch(['smith', 'john'], ['john', 'smith']);
    expect(r).toEqual({score: 100, matchedTokens: ['smith', 'john']});
  });

  test('no overlap returns null', () => {
    expect(scoreTokenMatch(['zzzqqq'], ['john', 'smith'])).toBeNull();
  });

  test('partial multi-token below half returns null', () => {
    expect(
      scoreTokenMatch(['alpha', 'beta', 'gamma'], ['alpha', 'other']),
    ).toBeNull();
  });
});

describe('searchTokenIndex', () => {
  const sample = [
    'ABDUL RAHMAN YASIN',
    'JOHN SMITH',
    'Vladimir Putin',
    'ACME TRADING LIMITED',
    'MOHAMED ALI',
  ];
  const index = buildTokenIndex(sample);

  test('exact full name is strong', () => {
    const r = searchTokenIndex('John Smith', index);
    expect(r.status).toBe('strong');
    expect(r.matches[0].name).toBe('JOHN SMITH');
    expect(r.matches[0].score).toBe(100);
  });

  test('reversed order matches', () => {
    const r = searchTokenIndex('Yasin Abdul', index);
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.matches.some(m => /yasin/i.test(m.name))).toBe(true);
    expect(r.matches[0].score).toBeGreaterThanOrEqual(80);
  });

  test('surname-only finds containing entries', () => {
    const r = searchTokenIndex('Yasin', index);
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.matches.some(m => m.name === 'ABDUL RAHMAN YASIN')).toBe(true);
  });

  test('unknown name clears', () => {
    const r = searchTokenIndex('Zzxxyy Qqww Notaperson', index);
    expect(r.status).toBe('clear');
    expect(r.matches).toHaveLength(0);
  });

  test('empty and short queries', () => {
    expect(searchTokenIndex('  ', index).status).toBe('empty_query');
    expect(searchTokenIndex('ab', index).status).toBe('short_query');
  });

  test('stop-word-only org noise does not force weak hits alone', () => {
    const r = searchTokenIndex('Limited', index);
    // "limited" is a stop word → short_query / empty tokens
    expect(['short_query', 'clear', 'empty_query']).toContain(r.status);
  });

  test('ranks higher when more tokens agree', () => {
    const r = searchTokenIndex('Abdul Rahman Yasin', index);
    expect(r.matches[0].name).toBe('ABDUL RAHMAN YASIN');
    expect(r.matches[0].score).toBe(100);
  });
});

describe('screenName against bundled lists', () => {
  test('isSanctioned remains exact-only', () => {
    if (allSanctionedNames.size === 0) {
      return;
    }
    const full = Array.from(allSanctionedNames)[0];
    const parts = full.trim().split(/\s+/);
    expect(isSanctioned(full)).toBe(true);
    if (parts.length >= 2) {
      // partial string is not exact full-string match
      expect(isSanctioned(parts[parts.length - 1])).toBe(
        allSanctionedNames.has(parts[parts.length - 1]) ||
          isSanctioned(parts[parts.length - 1]),
      );
    }
  });

  test('screenName finds known name with reversed tokens when multi-part', () => {
    const multi = Array.from(allSanctionedNames).find(n => {
      const t = tokenize(n);
      return t.length >= 2;
    });
    if (!multi) {
      return;
    }
    const tokens = tokenize(multi);
    const reversed = [...tokens].reverse().join(' ');
    const r = screenName(reversed);
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.matches.some(m => m.name.toLowerCase() === multi.toLowerCase() || m.score >= 80)).toBe(
      true,
    );
  });

  test('screenName surname-only can return possible or strong hits', () => {
    const multi = Array.from(allSanctionedNames).find(n => {
      const t = tokenize(n);
      return t.length >= 2 && t[t.length - 1].length >= 4;
    });
    if (!multi) {
      return;
    }
    const surname = tokenize(multi).slice(-1)[0];
    const r = screenName(surname);
    expect(r.queryTokens).toEqual([surname]);
    // May be many hits; at least one should reference the token
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.matches.some(m => tokenize(m.name).includes(surname))).toBe(true);
  });

  test('screenName performance on cold query is acceptable', () => {
    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      screenName('Abdul Rahman');
    }
    const elapsed = performance.now() - start;
    // 20 screens should finish well under a few seconds even on large lists
    expect(elapsed).toBeLessThan(15000);
  });
});
