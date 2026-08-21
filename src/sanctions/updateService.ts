/**
 * Download official sanctions lists, extract names, replace stored data,
 * and delete temporary files (and previous name lists) after a successful update.
 *
 * Downloads use fetch() (full redirect follow — required for OFAC→S3).
 * Extraction streams UTF-8-safe byte chunks so multi-byte names (EU/UK) never
 * throw "Invalid byte index" at chunk boundaries.
 */

import RNFS from 'react-native-fs';
import {
  EXTRACTORS,
  createCsvStreamState,
  extractCsvNamesFromChunk,
  flushCsvStreamState,
  extractNamesFromChunk,
} from './extractors';
import {downloadUrlToFile, safeUnlink, streamFileUtf8} from './fileIo';
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
/** Text-stream chunk size for CSV/XML parsers (bytes read from disk). */
const STREAM_CHUNK_BYTES = 256 * 1024;

function tempPath(source: SanctionsSource): string {
  return `${RNFS.CachesDirectoryPath}/${source.tempFileName}`;
}

/**
 * Download a sanctions list to a cache file. Returns local path.
 * Uses fetch so OFAC (and similar) multi-hop redirects work on all OEMs.
 */
async function downloadXmlToFile(
  source: SanctionsSource,
  onBytes?: (received: number, total: number) => void,
): Promise<string> {
  const path = tempPath(source);
  try {
    await downloadUrlToFile(source.url, path, {
      timeoutMs: DOWNLOAD_TIMEOUT_MS,
      onBytes,
      alternateUrls: source.alternateUrls,
      firstByteTimeoutMs: source.firstByteTimeoutMs,
      maxBytes: source.maxBytes,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? 'download failed');
    // Keep message readable in the UI (trim huge multi-transport dump)
    const short =
      message.length > 280 ? `${message.slice(0, 280)}…` : message;
    throw new Error(`Download failed for ${source.label}: ${short}`);
  }
  return path;
}

/**
 * Extract names from a local file (CSV or XML) with UTF-8-safe streaming.
 */
async function extractNamesFromFile(
  source: SanctionsSource,
  path: string,
): Promise<string[]> {
  const isCSV = source.tempFileName.toLowerCase().endsWith('.csv');

  // ── CSV: stateful line stream (UTF-8 safe chunks) ────────────────────────
  if (isCSV) {
    const all = new Set<string>();
    let state = createCsvStreamState();

    await streamFileUtf8(
      path,
      text => {
        const result = extractCsvNamesFromChunk(
          source.id as 'eu' | 'uk' | 'usa',
          text,
          state,
        );
        for (const n of result.names) {
          all.add(n);
        }
        state = result.state;
      },
      STREAM_CHUNK_BYTES,
    );

    for (const n of flushCsvStreamState(
      source.id as 'eu' | 'uk' | 'usa',
      state,
    )) {
      all.add(n);
    }

    if (all.size === 0) {
      throw new Error('No names extracted from CSV (parse failed or empty list)');
    }
    return Array.from(all);
  }

  // ── XML: chunked regex extraction (UTF-8 safe chunks) ────────────────────
  const all = new Set<string>();
  let carry = '';

  await streamFileUtf8(
    path,
    text => {
      const {names, carry: nextCarry} = extractNamesFromChunk(
        source.id,
        text,
        carry,
      );
      for (const n of names) {
        all.add(n);
      }
      carry = nextCarry;
    },
    STREAM_CHUNK_BYTES,
  );

  if (carry.length) {
    const {names: tailNames} = extractNamesFromChunk(source.id, '', carry);
    const extractor = EXTRACTORS[source.id];
    if (extractor) {
      for (const n of extractor(carry)) {
        all.add(n);
      }
    }
    for (const n of tailNames) {
      all.add(n);
    }
  }

  if (all.size === 0) {
    throw new Error('No names extracted from XML (parse failed or empty list)');
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
