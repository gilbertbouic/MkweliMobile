/**
 * Binary-safe file I/O helpers for sanctions list download + parse.
 *
 * Why this exists:
 * - RNFS.read(..., 'utf8') decodes each byte slice independently. When a multi-byte
 *   UTF-8 character (Arabic, accented Latin, etc.) straddles a chunk boundary,
 *   the `utf8` package throws "Invalid byte index".
 * - RNFS.downloadFile only follows a single HTTP redirect and uses short timeouts
 *   on the redirected connection — OFAC SDN.CSV redirects to AWS S3 and can fail.
 *
 * Strategy:
 * - Download with fetch() (follows redirects) and write base64 chunks to disk.
 * - Read as base64 bytes, reassemble incomplete UTF-8 sequences across chunks,
 *   then decode with TextDecoder.
 */

import RNFS from 'react-native-fs';

const WRITE_CHUNK = 256 * 1024; // 256 KB base64 write slices
const READ_CHUNK = 256 * 1024; // 256 KB binary read slices
/** Abort a hanging host if headers / first byte never arrive. */
const DEFAULT_FIRST_BYTE_MS = 25_000;

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: '*/*',
  'Accept-Encoding': 'identity',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 MkweliMobile/1.0.8',
};

/** Convert bytes → base64 without giant intermediate strings where possible. */
export function uint8ToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(slice) as number[]);
  }
  // btoa is available in React Native / Hermes
  return global.btoa(binary);
}

export function base64ToUint8(b64: string): Uint8Array {
  const binary = global.atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/**
 * Split a byte buffer so we never decode a partial UTF-8 code unit.
 * Incomplete trailing bytes are returned as `remainder` for the next chunk.
 */
export function splitCompleteUtf8(bytes: Uint8Array): {
  complete: Uint8Array;
  remainder: Uint8Array;
} {
  if (bytes.length === 0) {
    return {complete: bytes, remainder: bytes};
  }

  // Fast path: last byte is ASCII → whole buffer is complete
  if (bytes[bytes.length - 1] < 0x80) {
    return {complete: bytes, remainder: new Uint8Array(0)};
  }

  // Walk back over continuation bytes (10xxxxxx)
  let start = bytes.length - 1;
  while (start > 0 && (bytes[start] & 0xc0) === 0x80) {
    start--;
  }

  const lead = bytes[start];
  let need = 1;
  if ((lead & 0x80) === 0) {
    need = 1;
  } else if ((lead & 0xe0) === 0xc0) {
    need = 2;
  } else if ((lead & 0xf0) === 0xe0) {
    need = 3;
  } else if ((lead & 0xf8) === 0xf0) {
    need = 4;
  } else {
    // Invalid lead / orphan continuation — keep everything so TextDecoder can replace
    return {complete: bytes, remainder: new Uint8Array(0)};
  }

  const have = bytes.length - start;
  if (have < need) {
    return {
      complete: bytes.subarray(0, start),
      remainder: bytes.subarray(start),
    };
  }
  return {complete: bytes, remainder: new Uint8Array(0)};
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length === 0) {
    return b;
  }
  if (b.length === 0) {
    return a;
  }
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

const textDecoder =
  typeof TextDecoder !== 'undefined'
    ? new TextDecoder('utf-8', {fatal: false})
    : null;

function decodeUtf8(bytes: Uint8Array): string {
  if (bytes.length === 0) {
    return '';
  }
  if (textDecoder) {
    return textDecoder.decode(bytes);
  }
  // Fallback (should not hit on Hermes/modern RN)
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  try {
    return decodeURIComponent(escape(s));
  } catch {
    return s;
  }
}

export async function safeUnlink(path: string): Promise<void> {
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  } catch {
    // best-effort
  }
}

async function writeBytesToFile(
  destPath: string,
  bytes: Uint8Array,
  onBytes?: (received: number, total: number) => void,
): Promise<void> {
  if (bytes.length < 100) {
    throw new Error('Downloaded file is empty or too small');
  }
  const total = bytes.length;
  onBytes?.(0, total);
  for (let offset = 0; offset < bytes.length; offset += WRITE_CHUNK) {
    const slice = bytes.subarray(
      offset,
      Math.min(offset + WRITE_CHUNK, bytes.length),
    );
    const b64 = uint8ToBase64(slice);
    if (offset === 0) {
      await RNFS.writeFile(destPath, b64, 'base64');
    } else {
      await RNFS.appendFile(destPath, b64, 'base64');
    }
    onBytes?.(Math.min(offset + slice.length, bytes.length), total);
  }
}

/** Transport 1: fetch (OkHttp / RN networking stack). */
async function downloadWithFetch(
  url: string,
  destPath: string,
  timeoutMs: number,
  headers: Record<string, string>,
  onBytes?: (received: number, total: number) => void,
  firstByteTimeoutMs: number = DEFAULT_FIRST_BYTE_MS,
): Promise<{bytesWritten: number; statusCode: number}> {
  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : null;
  let gotHeaders = false;
  const firstByteTimer = controller
    ? setTimeout(() => {
        if (!gotHeaders) {
          controller.abort();
        }
      }, firstByteTimeoutMs)
    : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller?.signal,
    });
    gotHeaders = true;
    if (firstByteTimer) {
      clearTimeout(firstByteTimer);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    await writeBytesToFile(destPath, bytes, onBytes);
    return {bytesWritten: bytes.length, statusCode: response.status};
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      if (!gotHeaders) {
        throw new Error(`No response after ${firstByteTimeoutMs}ms`);
      }
      throw new Error(`Download timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    if (firstByteTimer) {
      clearTimeout(firstByteTimer);
    }
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/** Transport 2: XMLHttpRequest (often more reliable on OEM WebView stacks). */
function downloadWithXhr(
  url: string,
  destPath: string,
  timeoutMs: number,
  headers: Record<string, string>,
  onBytes?: (received: number, total: number) => void,
  firstByteTimeoutMs: number = DEFAULT_FIRST_BYTE_MS,
): Promise<{bytesWritten: number; statusCode: number}> {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.timeout = timeoutMs;
      let gotHeaders = false;
      let settled = false;
      const fail = (err: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(firstByteTimer);
        reject(err);
      };
      const firstByteTimer = setTimeout(() => {
        if (!gotHeaders) {
          try {
            xhr.abort();
          } catch {
            // ignore
          }
          fail(new Error(`No response after ${firstByteTimeoutMs}ms (XHR)`));
        }
      }, firstByteTimeoutMs);
      const clearFirstByte = () => {
        gotHeaders = true;
        clearTimeout(firstByteTimer);
      };
      for (const [k, v] of Object.entries(headers)) {
        try {
          xhr.setRequestHeader(k, v);
        } catch {
          // some headers are forbidden on XHR
        }
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState >= 2) {
          clearFirstByte();
        }
      };
      xhr.onprogress = event => {
        clearFirstByte();
        if (event.lengthComputable) {
          onBytes?.(event.loaded, event.total);
        }
      };
      xhr.onload = () => {
        clearFirstByte();
        void (async () => {
          try {
            if (xhr.status < 200 || xhr.status >= 300) {
              fail(new Error(`HTTP ${xhr.status}`));
              return;
            }
            const bytes = new Uint8Array(xhr.response as ArrayBuffer);
            await writeBytesToFile(destPath, bytes, onBytes);
            if (settled) {
              return;
            }
            settled = true;
            resolve({bytesWritten: bytes.length, statusCode: xhr.status || 200});
          } catch (e) {
            fail(e instanceof Error ? e : new Error(String(e)));
          }
        })();
      };
      xhr.onerror = () => {
        fail(new Error('Network request failed (XHR)'));
      };
      xhr.onabort = () => {
        if (!gotHeaders) {
          // first-byte timer already rejected
          return;
        }
        fail(new Error('Download aborted (XHR)'));
      };
      xhr.ontimeout = () => {
        fail(new Error(`Download timed out after ${timeoutMs}ms (XHR)`));
      };
      xhr.send();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Transport 3: RNFS native HttpURLConnection downloader.
 * Streams to disk (better for large files) and uses the platform TLS stack,
 * which on some Huawei / non-GMS devices works when fetch() does not.
 */
async function downloadWithRnfs(
  url: string,
  destPath: string,
  timeoutMs: number,
  headers: Record<string, string>,
  onBytes?: (received: number, total: number) => void,
  firstByteTimeoutMs: number = DEFAULT_FIRST_BYTE_MS,
): Promise<{bytesWritten: number; statusCode: number}> {
  let beginFired = false;
  const {jobId, promise} = RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    background: false,
    discretionary: false,
    cacheable: false,
    connectionTimeout: Math.min(firstByteTimeoutMs, timeoutMs),
    readTimeout: timeoutMs,
    progressDivider: 5,
    headers,
    begin: res => {
      beginFired = true;
      onBytes?.(0, res.contentLength || 0);
    },
    progress: res => {
      beginFired = true;
      onBytes?.(res.bytesWritten, res.contentLength || 0);
    },
  });

  const result = await new Promise<{bytesWritten: number; statusCode: number}>(
    (resolve, reject) => {
      const watchdog = setTimeout(() => {
        if (!beginFired) {
          try {
            if (typeof jobId === 'number') {
              RNFS.stopDownload(jobId);
            }
          } catch {
            // ignore
          }
          reject(
            new Error(`No response after ${firstByteTimeoutMs}ms (RNFS)`),
          );
        }
      }, firstByteTimeoutMs);
      promise.then(
        value => {
          clearTimeout(watchdog);
          resolve(value);
        },
        err => {
          clearTimeout(watchdog);
          reject(
            beginFired
              ? err
              : new Error(`No response after ${firstByteTimeoutMs}ms (RNFS)`),
          );
        },
      );
    },
  );

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`HTTP ${result.statusCode}`);
  }
  const stat = await RNFS.stat(destPath);
  const size = Number(stat.size);
  if (!size || size < 100) {
    throw new Error('Downloaded file is empty or too small');
  }
  return {bytesWritten: size, statusCode: result.statusCode};
}

function errMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message || err.name;
  }
  return String(err ?? 'unknown error');
}

/**
 * Download a URL to a local file.
 *
 * Tries multiple transports in order (fetch → XHR → RNFS) because OEM phones
 * (especially without Google Play Services) often break one stack but not all.
 * Optionally tries alternate URLs when the primary fails.
 */
export async function downloadUrlToFile(
  url: string,
  destPath: string,
  options?: {
    timeoutMs?: number;
    onBytes?: (received: number, total: number) => void;
    headers?: Record<string, string>;
    /** Extra URLs to try if `url` fails (same file, different host/path). */
    alternateUrls?: string[];
    /** Abort a URL if no first byte arrives within this many ms. */
    firstByteTimeoutMs?: number;
  },
): Promise<{bytesWritten: number; statusCode: number}> {
  const timeoutMs = options?.timeoutMs ?? 10 * 60 * 1000;
  const firstByteTimeoutMs =
    options?.firstByteTimeoutMs ?? DEFAULT_FIRST_BYTE_MS;
  const headers = {...DEFAULT_HEADERS, ...options?.headers};
  const urls = [url, ...(options?.alternateUrls ?? [])].filter(Boolean);
  const errors: string[] = [];

  type Transport = (
    u: string,
  ) => Promise<{bytesWritten: number; statusCode: number}>;

  const transports: {name: string; run: Transport}[] = [
    {
      name: 'fetch',
      run: u =>
        downloadWithFetch(
          u,
          destPath,
          timeoutMs,
          headers,
          options?.onBytes,
          firstByteTimeoutMs,
        ),
    },
    {
      name: 'xhr',
      run: u =>
        downloadWithXhr(
          u,
          destPath,
          timeoutMs,
          headers,
          options?.onBytes,
          firstByteTimeoutMs,
        ),
    },
    {
      name: 'rnfs',
      run: u =>
        downloadWithRnfs(
          u,
          destPath,
          timeoutMs,
          headers,
          options?.onBytes,
          firstByteTimeoutMs,
        ),
    },
  ];

  for (const candidate of urls) {
    for (const t of transports) {
      await safeUnlink(destPath);
      try {
        const result = await t.run(candidate);
        return result;
      } catch (err) {
        await safeUnlink(destPath);
        const msg = errMessage(err);
        errors.push(`${t.name}@${candidate}: ${msg}`);
        // Host never answered — other transports to the same URL will hang too.
        if (/^No response after/i.test(msg)) {
          break;
        }
      }
    }
  }

  throw new Error(
    `Download failed for all URLs/transports. ${errors.slice(-6).join(' | ')}`,
  );
}

/**
 * Stream a local file as UTF-8 text chunks, never splitting multi-byte chars.
 * Calls `onTextChunk` for each decoded slice (not necessarily whole lines).
 */
export async function streamFileUtf8(
  path: string,
  onTextChunk: (text: string) => void | Promise<void>,
  chunkBytes: number = READ_CHUNK,
): Promise<void> {
  const stat = await RNFS.stat(path);
  const size = Number(stat.size);
  let offset = 0;
  let pending = new Uint8Array(0);

  while (offset < size) {
    const length = Math.min(chunkBytes, size - offset);
    // Read raw bytes as base64 — never use encoding 'utf8' for partial reads
    const b64 = await RNFS.read(path, length, offset, 'base64');
    const piece = base64ToUint8(b64);
    const combined = concatBytes(pending, piece);
    const {complete, remainder} = splitCompleteUtf8(combined);
    if (complete.length > 0) {
      await onTextChunk(decodeUtf8(complete));
    }
    pending = remainder;
    offset += length;
  }

  if (pending.length > 0) {
    await onTextChunk(decodeUtf8(pending));
  }
}
