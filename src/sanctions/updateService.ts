/**
 * Download official sanctions XML lists, extract names, replace stored data,
 * and delete temporary XML (and previous name lists) after a successful update.
 *
 * Large lists (e.g. OFAC SDN_ENHANCED ~100MB) are downloaded to disk and
 * processed in chunks so the whole XML is never held in memory at once.
 */

import RNFS from 'react-native-fs';
import {
  EXTRACTORS,
  CSV_EXTRACTORS,
  extractNamesFromChunk,
  type ExtractorFn,
} from './extractors';
import {
  SANCTIONS_SOURCES,
  type SanctionsSource,
  type SanctionsSourceId,
} from './sources';
import {
  loadMeta,
  replaceSourceNames,
  saveMeta,
  type SanctionsMeta,
  type SourceMeta,
} from './store';

export type UpdatePhase =
  | 'idle'
  | 'starting'
  | 'downloading'
  | 'extracting'
  | 'saving'
  | 'cleaning'
  | 'done'
  | 'error';

/** Stable keys for UI translation of progress lines. */
export type ProgressMessageKey =
  | 'progressStarting'
  | 'progressDownloading'
  | 'progressDownloadingPct'
  | 'progressExtracting'
  | 'progressSaving'
  | 'progressCleaning'
  | 'progressDoneAll'
  | 'progressDonePartial'
  | 'progressErrorAll';

export interface SourceUpdateResult {
  id: SanctionsSourceId;
  label: string;
  ok: boolean;
  nameCount: number;
  error?: string;
  /** Previous names kept because this download failed. */
  keptPrevious: boolean;
}

export interface UpdateProgress {
  phase: UpdatePhase;
  currentSource: SanctionsSourceId | null;
  currentLabel: string | null;
  sourceIndex: number;
  totalSources: number;
  messageKey: ProgressMessageKey;
  messageParams?: Record<string, string | number>;
  /** English fallback message */
  message: string;
  results: SourceUpdateResult[];
}

export type ProgressCallback = (progress: UpdateProgress) => void;

const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes per list
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB read chunks
/** Lists larger than this use chunked disk processing. */
const LARGE_FILE_THRESHOLD = 8 * 1024 * 1024;

function tempPath(source: SanctionsSource): string {
  return `${RNFS.CachesDirectoryPath}/${source.tempFileName}`;
}

async function safeUnlink(path: string): Promise<void> {
  try {
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path);
    }
  } catch {
    // best-effort cleanup
  }
}

/**
 * Download XML to a cache file. Returns local path.
 * Always deletes any previous temp file for this source first.
 */
async function downloadXmlToFile(
  source: SanctionsSource,
  onBytes?: (received: number, total: number) => void,
): Promise<string> {
  const path = tempPath(source);
  await safeUnlink(path);

  const result = await RNFS.downloadFile({
    fromUrl: source.url,
    toFile: path,
    background: false,
    discretionary: false,
    cacheable: false,
    connectionTimeout: 60_000,
    readTimeout: DOWNLOAD_TIMEOUT_MS,
    progressDivider: 5,
    begin: res => {
      onBytes?.(0, res.contentLength || 0);
    },
    progress: res => {
      onBytes?.(res.bytesWritten, res.contentLength || 0);
    },
  }).promise;

  if (result.statusCode < 200 || result.statusCode >= 300) {
    await safeUnlink(path);
    throw new Error(`HTTP ${result.statusCode}`);
  }

  const stat = await RNFS.stat(path);
  if (!stat.size || Number(stat.size) < 100) {
    await safeUnlink(path);
    throw new Error('Downloaded file is empty or too small');
  }

  return path;
}

/**
 * Extract names from a local file (CSV or XML), using chunked reads for large XML files.
 * CSV files are typically small enough to read in full.
 */
async function extractNamesFromFile(
  source: SanctionsSource,
  path: string,
): Promise<string[]> {
  const stat = await RNFS.stat(path);
  const size = Number(stat.size);
  const isCSV = source.tempFileName.toLowerCase().endsWith('.csv');

  if (size <= LARGE_FILE_THRESHOLD) {
    const content = await RNFS.readFile(path, 'utf8');

    // Detect format and get appropriate extractor
    let extractor: ExtractorFn | undefined;
    let formatName = '';

    if (isCSV) {
      extractor = CSV_EXTRACTORS[source.id];
      formatName = 'CSV';
    } else {
      extractor = EXTRACTORS[source.id];
      formatName = 'XML';
    }

    if (!extractor) {
      throw new Error(`No ${formatName} extractor for source ${source.id}`);
    }

    const names = extractor(content);
    if (names.length === 0) {
      throw new Error(
        `No names extracted from ${formatName} (parse failed or empty list)`,
      );
    }
    return names;
  }

  // Large file — use chunked processing (XML only; CSV is always small)
  if (isCSV) {
    throw new Error('CSV file unexpectedly large (> 8MB)');
  }

  const all = new Set<string>();
  let offset = 0;
  let carry = '';

  while (offset < size) {
    const length = Math.min(CHUNK_SIZE, size - offset);
    const chunk = await RNFS.read(path, length, offset, 'utf8');
    const {names, carry: nextCarry} = extractNamesFromChunk(
      source.id,
      chunk,
      carry,
    );
    for (const n of names) {
      all.add(n);
    }
    carry = nextCarry;
    offset += length;
  }

  if (carry.length) {
    const {names} = extractNamesFromChunk(source.id, '', carry);
    const extractor = EXTRACTORS[source.id];
    if (extractor) {
      for (const n of extractor(carry)) {
        all.add(n);
      }
    }
    for (const n of names) {
      all.add(n);
    }
  }

  if (all.size === 0) {
    throw new Error(
      'No names extracted from large XML (parse failed or empty list)',
    );
  }
  return Array.from(all);
}

/**
 * Update all sanctions lists from official sources.
 * On per-source failure: keep the previous good list for that source.
 * After success: old downloaded names for that source are deleted/replaced;
 * temporary XML files are always deleted.
 */
export async function updateAllSanctionsLists(
  onProgress?: ProgressCallback,
): Promise<{meta: SanctionsMeta; results: SourceUpdateResult[]}> {
  const total = SANCTIONS_SOURCES.length;
  const results: SourceUpdateResult[] = [];
  let meta = await loadMeta();

  const emit = (
    phase: UpdatePhase,
    source: SanctionsSource | null,
    index: number,
    messageKey: ProgressMessageKey,
    messageParams: Record<string, string | number> | undefined,
    message: string,
  ) => {
    onProgress?.({
      phase,
      currentSource: source?.id ?? null,
      currentLabel: source?.label ?? null,
      sourceIndex: index,
      totalSources: total,
      messageKey,
      messageParams,
      message,
      results: [...results],
    });
  };

  emit(
    'starting',
    null,
    0,
    'progressStarting',
    undefined,
    'Starting sanctions list update…',
  );

  for (let i = 0; i < SANCTIONS_SOURCES.length; i++) {
    const source = SANCTIONS_SOURCES[i];
    const path = tempPath(source);

    emit(
      'downloading',
      source,
      i + 1,
      'progressDownloading',
      {label: source.label},
      `Downloading ${source.label} list…`,
    );

    try {
      await downloadXmlToFile(source, (received, totalBytes) => {
        if (totalBytes > 0) {
          const pct = Math.min(100, Math.round((received / totalBytes) * 100));
          emit(
            'downloading',
            source,
            i + 1,
            'progressDownloadingPct',
            {label: source.label, pct},
            `Downloading ${source.label}… ${pct}%`,
          );
        }
      });

      emit(
        'extracting',
        source,
        i + 1,
        'progressExtracting',
        {label: source.label},
        `Extracting names from ${source.label}…`,
      );
      const names = await extractNamesFromFile(source, path);

      emit(
        'saving',
        source,
        i + 1,
        'progressSaving',
        {label: source.label, count: names.length.toLocaleString()},
        `Saving ${names.length.toLocaleString()} ${source.label} names…`,
      );

      await replaceSourceNames(source.id, names);

      const sourceMeta: SourceMeta = {
        id: source.id,
        label: source.label,
        nameCount: names.length,
        updatedAt: new Date().toISOString(),
        lastError: null,
        source: 'downloaded',
      };
      meta = {
        ...meta,
        sources: {
          ...meta.sources,
          [source.id]: sourceMeta,
        },
      };
      await saveMeta(meta);

      results.push({
        id: source.id,
        label: source.label,
        ok: true,
        nameCount: names.length,
        keptPrevious: false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err ?? 'Unknown error');

      const prev = meta.sources[source.id];
      const sourceMeta: SourceMeta = {
        id: source.id,
        label: source.label,
        nameCount: prev?.nameCount ?? 0,
        updatedAt: prev?.updatedAt ?? null,
        lastError: message,
        source: prev?.source ?? 'bundled',
      };
      meta = {
        ...meta,
        sources: {
          ...meta.sources,
          [source.id]: sourceMeta,
        },
      };
      await saveMeta(meta);

      results.push({
        id: source.id,
        label: source.label,
        ok: false,
        nameCount: prev?.nameCount ?? 0,
        error: message,
        keptPrevious: true,
      });
    } finally {
      emit(
        'cleaning',
        source,
        i + 1,
        'progressCleaning',
        {label: source.label},
        `Deleting temporary ${source.label} XML…`,
      );
      await safeUnlink(path);
    }
  }

  const anyOk = results.some(r => r.ok);
  if (anyOk) {
    meta = {
      ...meta,
      lastFullUpdateAt: new Date().toISOString(),
    };
    await saveMeta(meta);
  }

  const failed = results.filter(r => !r.ok).length;
  const okCount = results.length - failed;
  if (failed === 0) {
    emit(
      'done',
      null,
      total,
      'progressDoneAll',
      undefined,
      'All sanctions lists updated. Old lists replaced; temp XML deleted.',
    );
  } else if (failed === results.length) {
    emit(
      'error',
      null,
      total,
      'progressErrorAll',
      undefined,
      'Update failed for all sources. Previous lists kept.',
    );
  } else {
    emit(
      'done',
      null,
      total,
      'progressDonePartial',
      {ok: okCount, total: results.length},
      `Updated ${okCount}/${results.length} sources. Failed sources kept previous lists.`,
    );
  }

  return {meta, results};
}
