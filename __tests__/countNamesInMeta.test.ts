/**
 * @format
 */

import {countNamesInMeta, formatNameCount, type SanctionsMeta} from '../src/sanctions/store';

function source(
  id: SanctionsMeta['sources'][keyof SanctionsMeta['sources']]['id'],
  label: string,
  nameCount: number,
): SanctionsMeta['sources'][keyof SanctionsMeta['sources']] {
  return {
    id,
    label,
    nameCount,
    updatedAt: '2026-09-01T00:00:00.000Z',
    lastError: null,
    source: 'downloaded',
  };
}

describe('countNamesInMeta', () => {
  test('sums per-source name counts (the figure shown as Names loaded and total names)', () => {
    const meta: SanctionsMeta = {
      lastFullUpdateAt: '2026-09-01T00:00:00.000Z',
      sources: {
        usa: source('usa', 'USA (OFAC SDN)', 50214),
        un: source('un', 'UN', 3868),
        eu: source('eu', 'EU', 30674),
        uk: source('uk', 'UK', 20405),
      },
    };
    expect(countNamesInMeta(meta)).toBe(105161);
  });

  test('returns 0 for missing meta so header and update toast stay aligned', () => {
    expect(countNamesInMeta(null)).toBe(0);
    expect(countNamesInMeta(undefined)).toBe(0);
  });

  test('treats missing nameCount as 0', () => {
    const meta = {
      lastFullUpdateAt: null,
      sources: {
        usa: source('usa', 'USA (OFAC SDN)', 10),
        un: {...source('un', 'UN', 0), nameCount: undefined as unknown as number},
        eu: source('eu', 'EU', 5),
        uk: source('uk', 'UK', 1),
      },
    } as SanctionsMeta;
    expect(countNamesInMeta(meta)).toBe(16);
  });
});

describe('formatNameCount', () => {
  test('formats the headline total the same way for both UI lines', () => {
    expect(formatNameCount(105654, 'en-US')).toBe((105654).toLocaleString('en-US'));
    expect(formatNameCount(105654, 'en-US')).toBe(formatNameCount(105654, 'en-US'));
  });

  test('truncates and rejects non-finite values so the two lines cannot diverge', () => {
    expect(formatNameCount(10.9, 'en-US')).toBe('10');
    expect(formatNameCount(Number.NaN, 'en-US')).toBe('0');
  });
});
