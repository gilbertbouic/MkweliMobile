/**
 * @format
 */

import {countNamesInMeta, type SanctionsMeta} from '../src/sanctions/store';

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
