// sanctions-data.ts
// Runtime sanctions name set: starts with bundled seed data, then switches
// to downloaded lists after a successful in-app update.

import fullXsdNames from './assets/sanctions/full-xsd-names.json';
import ukSanctionsNames from './assets/sanctions/uk-sanctions-names.json';
import sdnNames from './assets/sanctions/sdn-names.json';
import unSanctionsNames from './assets/sanctions/un-sanctions-names.json';
import {loadAllNamesSet, loadMeta, type SanctionsMeta} from './src/sanctions/store';
import {LIST_STALE_AFTER_DAYS} from './src/sanctions/sources';
import {
  updateAllSanctionsLists,
  type ProgressCallback,
  type SourceUpdateResult,
  type UpdateProgress,
} from './src/sanctions/updateService';

function buildNormalizedLookup(names: Set<string>): Set<string> {
  const normalized = new Set<string>();
  for (const name of names) {
    if (name) {
      normalized.add(name.trim().toLowerCase());
    }
  }
  return normalized;
}

const seedNames: Set<string> = new Set([
  ...(fullXsdNames as string[]),
  ...(ukSanctionsNames as string[]),
  ...(sdnNames as string[]),
  ...(unSanctionsNames as string[]),
]);

/** Mutable set used for screening — reloaded after updates. */
export let allSanctionedNames: Set<string> = seedNames;

/** Lowercased lookup set for O(1) matching. */
let normalizedLookup: Set<string> = buildNormalizedLookup(seedNames);

let ready = false;
let initPromise: Promise<void> | null = null;

function applyNames(names: Set<string>) {
  allSanctionedNames = names;
  normalizedLookup = buildNormalizedLookup(names);
}

/**
 * Load names from device storage (downloaded) with bundled fallback.
 * Safe to call multiple times; concurrent callers share one load.
 */
export async function initSanctionsData(): Promise<void> {
  if (ready) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async () => {
    try {
      applyNames(await loadAllNamesSet());
    } catch {
      // Keep bundled seed set on load failure
    } finally {
      ready = true;
    }
  })();
  return initPromise;
}

/**
 * Reload names from storage into memory (call after a successful update).
 */
export async function reloadSanctionsData(): Promise<number> {
  applyNames(await loadAllNamesSet());
  ready = true;
  return allSanctionedNames.size;
}

/**
 * Checks if a name is present in the sanctions lists.
 * @param name Name to check (case-insensitive, trimmed)
 * @returns true if sanctioned, false otherwise
 */
export function isSanctioned(name: string): boolean {
  if (!name) {
    return false;
  }
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return normalizedLookup.has(normalized);
}

export async function getSanctionsMeta(): Promise<SanctionsMeta> {
  return loadMeta();
}

export function isListsStale(meta: SanctionsMeta): boolean {
  if (!meta.lastFullUpdateAt) {
    // Bundled only — treat as stale to encourage first update
    return true;
  }
  const updated = new Date(meta.lastFullUpdateAt).getTime();
  if (Number.isNaN(updated)) {
    return true;
  }
  const ageMs = Date.now() - updated;
  return ageMs > LIST_STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Download all official lists, extract names, replace stored lists, discard XML.
 * Keeps previous good lists for any source that fails.
 */
export async function updateSanctionsLists(
  onProgress?: ProgressCallback,
): Promise<{
  meta: SanctionsMeta;
  results: SourceUpdateResult[];
  totalNames: number;
}> {
  const {meta, results} = await updateAllSanctionsLists(onProgress);
  const totalNames = await reloadSanctionsData();
  return {meta, results, totalNames};
}

export type {
  SanctionsMeta,
  UpdateProgress,
  SourceUpdateResult,
  ProgressCallback,
};
export {LIST_STALE_AFTER_DAYS};
