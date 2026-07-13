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
 * Load names for one source: downloaded copy if present, else bundled seed.
 */
export async function loadSourceNames(
  id: SanctionsSourceId,
): Promise<string[]> {
  const arr = await readJsonFile<string[]>(namesPath(id));
  if (Array.isArray(arr) && arr.length > 0) {
    return arr;
  }
  return BUNDLED_NAMES[id] ?? [];
}

/**
 * Atomically replace stored names for a source.
 * Previous downloaded names file is deleted before the new file is written.
 */
export async function replaceSourceNames(
  id: SanctionsSourceId,
  names: string[],
): Promise<void> {
  const path = namesPath(id);
  await ensureDataDir();
  // Delete old list first (requirement: old lists deleted after update)
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  } catch {
    // continue
  }
  await writeJsonFile(path, names);
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
