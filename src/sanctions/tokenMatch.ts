/**
 * Phase A token matching for sanctions name screening.
 *
 * - Split names into tokens (order-independent)
 * - Partial / single-token queries against list entries
 * - Ranked scores (strong / possible), no fuzzy edit distance yet
 */

export type MatchStrength = 'strong' | 'possible';

export type ScreenStatus =
  | 'strong'
  | 'possible'
  | 'clear'
  | 'empty_query'
  | 'short_query';

export interface NameMatch {
  /** Name as stored on the list (display form). */
  name: string;
  /** 0–100 match score. */
  score: number;
  strength: MatchStrength;
  matchedTokens: string[];
  totalQueryTokens: number;
  totalListTokens: number;
}

export interface ScreenResult {
  query: string;
  queryTokens: string[];
  matches: NameMatch[];
  status: ScreenStatus;
  strongCount: number;
  possibleCount: number;
}

export interface TokenIndex {
  /** Display names (original casing when available). */
  names: string[];
  /** Lowercased full strings for exact match. */
  normalized: string[];
  /** normalized full string → name index (exact match). */
  exactIndex: Map<string, number>;
  /** Tokens per name index. */
  tokens: string[][];
  /** token → name indices containing that token. */
  inverted: Map<string, number[]>;
}

export interface SearchOptions {
  /** Max ranked hits to return (default 25). */
  maxResults?: number;
  /** Minimum score to include (default 50). */
  minScore?: number;
  /** Strong match threshold (default 90). */
  strongThreshold?: number;
  /** Minimum token length for a single-token query (default 3). */
  minSingleTokenLength?: number;
}

/** Tokens ignored for matching (noise in org/address-like strings). */
export const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'co',
  'company',
  'corp',
  'corporation',
  'de',
  'del',
  'des',
  'do',
  'du',
  'el',
  'for',
  'from',
  'gmbh',
  'in',
  'inc',
  'incorporated',
  'la',
  'le',
  'liability',
  'limited',
  'llc',
  'ltd',
  'no',
  'of',
  'on',
  'or',
  'plc',
  'sa',
  'sarl',
  'street',
  'the',
  'to',
  'ul',
  'with',
]);

/**
 * Very common given-name tokens: demote single-token hits so they do not
 * look like strong sanctions matches on their own.
 */
export const COMMON_SINGLE_TOKENS = new Set([
  'abdul',
  'abdullah',
  'ahmad',
  'ahmed',
  'ali',
  'david',
  'hassan',
  'hussein',
  'ibrahim',
  'john',
  'jose',
  'joseph',
  'khan',
  'mohamad',
  'mohamed',
  'mohammad',
  'mohammed',
  'muhammad',
  'omar',
  'said',
  'saleh',
  'smith',
  'thomas',
  'william',
]);

const DEFAULT_MAX_RESULTS = 25;
const DEFAULT_MIN_SCORE = 50;
const DEFAULT_STRONG = 90;
const DEFAULT_MIN_SINGLE_LEN = 3;

/**
 * Normalize and split a name into match tokens.
 */
export function tokenize(input: string): string[] {
  if (!input) {
    return [];
  }

  let s = input.trim().toLowerCase();
  // Strip combining marks when available (José → jose)
  try {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch {
    // ignore if normalize unsupported
  }

  // Punctuation / symbols → spaces (keep letters & digits)
  s = s.replace(/[^a-z0-9\u00c0-\u024f]+/gi, ' ');

  const parts = s.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const p of parts) {
    if (p.length < 2) {
      continue;
    }
    if (STOP_WORDS.has(p)) {
      continue;
    }
    if (seen.has(p)) {
      continue;
    }
    seen.add(p);
    out.push(p);
  }

  return out;
}

/**
 * Build an inverted token index from a set/list of sanctioned names.
 */
export function buildTokenIndex(names: Iterable<string>): TokenIndex {
  const nameList: string[] = [];
  const normalized: string[] = [];
  const exactIndex = new Map<string, number>();
  const tokens: string[][] = [];
  const inverted = new Map<string, number[]>();
  const seenNorm = new Set<string>();

  for (const raw of names) {
    if (!raw) {
      continue;
    }
    const display = raw.trim();
    if (!display) {
      continue;
    }
    const norm = display.toLowerCase();
    if (seenNorm.has(norm)) {
      continue;
    }
    seenNorm.add(norm);

    const idx = nameList.length;
    nameList.push(display);
    normalized.push(norm);
    exactIndex.set(norm, idx);
    const toks = tokenize(norm);
    tokens.push(toks);

    for (const t of toks) {
      let posting = inverted.get(t);
      if (!posting) {
        posting = [];
        inverted.set(t, posting);
      }
      posting.push(idx);
    }
  }

  return {names: nameList, normalized, exactIndex, tokens, inverted};
}

/**
 * Score how well query tokens match a list entry's tokens (0–100).
 * Returns null when there is no usable token overlap.
 */
export function scoreTokenMatch(
  queryTokens: string[],
  listTokens: string[],
): {score: number; matchedTokens: string[]} | null {
  if (queryTokens.length === 0 || listTokens.length === 0) {
    return null;
  }

  const listSet = new Set(listTokens);
  const matchedTokens = queryTokens.filter(t => listSet.has(t));
  if (matchedTokens.length === 0) {
    return null;
  }

  const qCov = matchedTokens.length / queryTokens.length;
  const lCov = matchedTokens.length / listTokens.length;

  // Same multiset (order-independent full match)
  if (
    queryTokens.length === listTokens.length &&
    matchedTokens.length === queryTokens.length
  ) {
    const qKey = [...queryTokens].sort().join('\0');
    const lKey = [...listTokens].sort().join('\0');
    if (qKey === lKey) {
      return {score: 100, matchedTokens};
    }
  }

  // All query tokens present on the list entry (any order; list may have extras)
  if (matchedTokens.length === queryTokens.length) {
    const score = Math.min(100, Math.round(82 + 18 * lCov));
    return {score, matchedTokens};
  }

  // Partial multi-token: require at least half of query tokens
  if (queryTokens.length >= 2 && qCov < 0.5) {
    return null;
  }

  const score = Math.round(qCov * 70 + lCov * 25);
  if (score <= 0) {
    return null;
  }
  return {score, matchedTokens};
}

function strengthFor(
  score: number,
  strongThreshold: number,
): MatchStrength {
  return score >= strongThreshold ? 'strong' : 'possible';
}

/**
 * Screen a query against a token index; returns ranked matches.
 */
export function searchTokenIndex(
  query: string,
  index: TokenIndex,
  options: SearchOptions = {},
): ScreenResult {
  const maxResults = options.maxResults ?? DEFAULT_MAX_RESULTS;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const strongThreshold = options.strongThreshold ?? DEFAULT_STRONG;
  const minSingleLen =
    options.minSingleTokenLength ?? DEFAULT_MIN_SINGLE_LEN;

  const trimmed = (query ?? '').trim();
  const empty: ScreenResult = {
    query: trimmed,
    queryTokens: [],
    matches: [],
    status: 'empty_query',
    strongCount: 0,
    possibleCount: 0,
  };

  if (!trimmed) {
    return empty;
  }

  const queryTokens = tokenize(trimmed);
  if (queryTokens.length === 0) {
    return {
      ...empty,
      status: 'short_query',
    };
  }

  if (queryTokens.length === 1 && queryTokens[0].length < minSingleLen) {
    return {
      query: trimmed,
      queryTokens,
      matches: [],
      status: 'short_query',
      strongCount: 0,
      possibleCount: 0,
    };
  }

  const normQuery = trimmed.toLowerCase();

  // Count token hits per name id
  const hitCount = new Map<number, number>();
  for (const token of queryTokens) {
    const posting = index.inverted.get(token);
    if (!posting) {
      continue;
    }
    for (const id of posting) {
      hitCount.set(id, (hitCount.get(id) ?? 0) + 1);
    }
  }

  // Exact full-string hit even if tokenization diverged (e.g. stop words only)
  const exactId = index.exactIndex.get(normQuery);
  const exactIds = new Set<number>();
  if (exactId !== undefined) {
    exactIds.add(exactId);
    if (!hitCount.has(exactId)) {
      hitCount.set(exactId, queryTokens.length || 1);
    }
  }

  const minHits =
    queryTokens.length === 1 ? 1 : Math.ceil(queryTokens.length * 0.5);

  const matches: NameMatch[] = [];

  for (const [id, hits] of hitCount) {
    if (hits < minHits && !exactIds.has(id)) {
      continue;
    }

    const listTokens = index.tokens[id];
    const isExact = exactIds.has(id);

    let score: number;
    let matchedTokens: string[];

    if (isExact) {
      score = 100;
      matchedTokens = queryTokens.length
        ? queryTokens.filter(t => listTokens.includes(t))
        : [];
      if (matchedTokens.length === 0 && listTokens.length) {
        matchedTokens = [...listTokens];
      }
    } else {
      const scored = scoreTokenMatch(queryTokens, listTokens);
      if (!scored) {
        continue;
      }
      score = scored.score;
      matchedTokens = scored.matchedTokens;
    }

    // Demote very common single-token queries
    if (
      queryTokens.length === 1 &&
      COMMON_SINGLE_TOKENS.has(queryTokens[0]) &&
      !isExact
    ) {
      score = Math.min(score, 68);
      score = Math.round(score * 0.85);
    }

    if (score < minScore) {
      continue;
    }

    matches.push({
      name: index.names[id],
      score,
      strength: strengthFor(score, strongThreshold),
      matchedTokens,
      totalQueryTokens: queryTokens.length,
      totalListTokens: listTokens.length,
    });
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });

  const top = matches.slice(0, maxResults);
  const strongCount = top.filter(m => m.strength === 'strong').length;
  const possibleCount = top.length - strongCount;

  let status: ScreenStatus = 'clear';
  if (strongCount > 0) {
    status = 'strong';
  } else if (possibleCount > 0) {
    status = 'possible';
  }

  return {
    query: trimmed,
    queryTokens,
    matches: top,
    status,
    strongCount,
    possibleCount,
  };
}
