/**
 * Persist extracted name lists and metadata on device (DocumentDirectory).
 * Bundled assets act as seed data until a successful download replaces them.
 * Old downloaded name files are deleted when replaced.
 */

import RNFS from 'react-native-fs';
import type {SanctionsSourceId} from './sources';
import {SANCTIONS_SOURCES} from './sources';

// Bundled seed name lists (shipped with the APK)
import fullXsdNames from '../../assets/sanctions/full-xsd-names.json';
import ukSanctionsNames from '../../assets/sanctions/uk-sanctions-names.json';
import sdnNames from '../../assets/sanctions/sdn-names.json';
import unSanctionsNames from '../../assets/sanctions/un-sanctions-names.json';

const DATA_DIR = `${RNFS.DocumentDirectoryPath}/sanctions`;
const META_PATH = `${DATA_DIR}/meta-v1.json`;
const namesPath = (id: SanctionsSourceId) => `${DATA_DIR}/names-v1-${id}.json`;

export interface SourceMeta {
  id: SanctionsSourceId;
  label: string;
  nameCount: number;
  updatedAt: string | null; // ISO
  lastError: string | null;
  source: 'bundled' | 'downloaded';
}

export interface SanctionsMeta {
  lastFullUpdateAt: string | null;
  sources: Record<SanctionsSourceId, SourceMeta>;
}

const BUNDLED_NAMES: Record<SanctionsSourceId, string[]> = {
  un: unSanctionsNames as string[],
  eu: fullXsdNames as string[],
  uk: ukSanctionsNames as string[],
  usa: sdnNames as string[],
};

function defaultMeta(): SanctionsMeta {
  const sources = {} as Record<SanctionsSourceId, SourceMeta>;
  for (const s of SANCTIONS_SOURCES) {
    sources[s.id] = {
      id: s.id,
      label: s.label,
      nameCount: BUNDLED_NAMES[s.id]?.length ?? 0,
      updatedAt: null,
      lastError: null,
      source: 'bundled',
    };
  }
  return {lastFullUpdateAt: null, sources};
}

async function ensureDataDir(): Promise<void> {
  const exists = await RNFS.exists(DATA_DIR);
  if (!exists) {
    await RNFS.mkdir(DATA_DIR);
  }
}

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const exists = await RNFS.exists(path);
    if (!exists) {
      return null;
    }
    const raw = await RNFS.readFile(path, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(path: string, data: unknown): Promise<void> {
  await ensureDataDir();
  // Atomic-ish replace: write temp then move
  const tmp = `${path}.tmp`;
  await RNFS.writeFile(tmp, JSON.stringify(data), 'utf8');
  const destExists = await RNFS.exists(path);
  if (destExists) {
    await RNFS.unlink(path);
  }
  await RNFS.moveFile(tmp, path);
}

/**
 * Write a string array to a file in NDJSON format (one JSON-encoded value per
 * line) using appendFile in batches of WRITE_BATCH_SIZE.  This avoids
 * serialising the entire array into one giant string, keeping peak heap usage
 * proportional to one batch rather than the whole list.
 */
const WRITE_BATCH_SIZE = 500;

async function writeNdjsonFile(path: string, items: string[]): Promise<void> {
  await ensureDataDir();
  const tmp = `${path}.tmp`;

  // Clean up any stale temp file from a previous failed run
  try {
    if (await RNFS.exists(tmp)) {
      await RNFS.unlink(tmp);
    }
  } catch {
    /* ignore */
  }

  if (items.length === 0) {
    await RNFS.writeFile(tmp, '', 'utf8');
  } else {
    for (let i = 0; i < items.length; i += WRITE_BATCH_SIZE) {
      const batch = items.slice(i, i + WRITE_BATCH_SIZE);
      // Each batch is a block of lines; trailing newline separates batches
      const chunk = batch.map(n => JSON.stringify(n)).join('\n') + '\n';
      if (i === 0) {
        await RNFS.writeFile(tmp, chunk, 'utf8');
      } else {
        await RNFS.appendFile(tmp, chunk, 'utf8');
      }
    }
  }

  // Atomic swap
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  } catch {
    /* ignore */
  }
  await RNFS.moveFile(tmp, path);
}

/**
 * Read a names file that may be in either:
 *   • Legacy format: a JSON array  [  "name1", "name2", … ]
 *   • Current format: NDJSON       "name1"\n"name2"\n…
 */
async function readNamesFile(path: string): Promise<string[] | null> {
  try {
    const exists = await RNFS.exists(path);
    if (!exists) return null;
    const raw = await RNFS.readFile(path, 'utf8');
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('[')) {
      // Legacy JSON array format written by older builds
      return JSON.parse(trimmed) as string[];
    }
    // NDJSON: one JSON-encoded string per line
    return trimmed
      .split('\n')
      .filter(l => l.trim())
      .map(l => JSON.parse(l) as string);
  } catch {
    return null;
  }
}

export async function loadMeta(): Promise<SanctionsMeta> {
  const parsed = await readJsonFile<SanctionsMeta>(META_PATH);
  if (!parsed) {
    return defaultMeta();
  }
  const base = defaultMeta();
  return {
    lastFullUpdateAt: parsed.lastFullUpdateAt ?? null,
    sources: {...base.sources, ...parsed.sources},
  };
}

export async function saveMeta(meta: SanctionsMeta): Promise<void> {
  await writeJsonFile(META_PATH, meta);
}

/**
 * Headline total for the UI: sum of each source's nameCount.
 *
 * Screening still dedupes names across lists in memory, but every displayed
 * total (Names loaded + "total names" after update) uses this sum so the two
 * figures never disagree. Chips add up to the same number.
 */
export function countNamesInMeta(
  meta: SanctionsMeta | null | undefined,
): number {
  if (!meta?.sources) {
    return 0;
  }
  return Object.values(meta.sources).reduce((n, s) => n + (s.nameCount || 0), 0);
}

/**
 * Load names for one source: downloaded copy if present, else bundled seed.
 * Handles both legacy JSON-array format and current NDJSON format.
 */
export async function loadSourceNames(
  id: SanctionsSourceId,
): Promise<string[]> {
  const arr = await readNamesFile(namesPath(id));
  if (Array.isArray(arr) && arr.length > 0) {
    return arr;
  }
  return BUNDLED_NAMES[id] ?? [];
}

/**
 * Atomically replace stored names for a source using batched NDJSON writes.
 * Names are written in batches of 500 via appendFile so the device heap never
 * needs to hold the full serialised list as a single string.
 * Previous downloaded names file is deleted before the new file is written.
 */
export async function replaceSourceNames(
  id: SanctionsSourceId,
  names: string[],
): Promise<void> {
  const path = namesPath(id);
  // Delete old list first (requirement: old lists deleted after update)
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  } catch {
    // continue
  }
  await writeNdjsonFile(path, names);
}

/** Remove downloaded names for a source (reverts to bundled seed on next load). */
export async function deleteDownloadedSourceNames(
  id: SanctionsSourceId,
): Promise<void> {
  const path = namesPath(id);
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  } catch {
    // ignore
  }
}

/**
 * Load and merge all source names into a Set for screening.
 */
export async function loadAllNamesSet(): Promise<Set<string>> {
  const sets = await Promise.all(
    SANCTIONS_SOURCES.map(s => loadSourceNames(s.id)),
  );
  const combined = new Set<string>();
  for (const list of sets) {
    for (const name of list) {
      if (name) {
        combined.add(name);
      }
    }
  }
  return combined;
}

export function getBundledNameCount(id: SanctionsSourceId): number {
  return BUNDLED_NAMES[id]?.length ?? 0;
}
