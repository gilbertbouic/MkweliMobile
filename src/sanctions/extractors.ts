/**
 * Extract person/entity names from official sanctions XML and CSV formats.
 * Uses targeted regex for XML; stateful chunk-based streaming for CSV.
 *
 * Live CSV formats (verified 2026-07):
 *   EU  FSD  — semicolon-delimited + BOM; name column `Naal_wholename`
 *              (OpenSanctions names.txt / targets.simple.csv also accepted)
 *   UK  OFSI / FCDO — comma-delimited; optional "Report Date:" preamble;
 *              names in `Name 1`…`Name 6` plus `Name non-latin script`
 *              (OpenSanctions names.txt / targets.simple.csv also accepted)
 *   USA OFAC — comma-delimited SDN.CSV with NO header; EntNum at 0, name at 1
 */

/**
 * Auto-detect the field delimiter for a CSV line.
 * Returns ';' if the line has more semicolons than commas, else ','.
 */
export function detectDelimiter(line: string): string {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

/**
 * Parse a CSV line respecting quoted fields and escaped quotes.
 * Handles: "Smith, John" as a single field, "" as escaped quote.
 * Supports custom field delimiter (default ','; use ';' for EU FSD CSV).
 */
export function parseCSVLine(line: string, delimiter = ','): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote: "" → "
        current += '"';
        i += 2;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      fields.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add last field
  fields.push(current.trim());
  return fields;
}

/**
 * Parse CSV field — remove outer quotes if present.
 */
function parseCSVField(field: string): string {
  if (!field) return '';
  const trimmed = field.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    // Already parsed by parseCSVLine, but handle it here too
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function normalizeName(raw: string, minLength = 1): string | null {
  const name = raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < minLength) {
    return null;
  }
  if (/^na$/i.test(name)) {
    return null;
  }
  return name;
}

/**
 * Add name and common order variants (e.g. "LAST, First" → "First LAST").
 */
export function addName(names: Set<string>, raw: string | undefined | null) {
  if (!raw) {
    return;
  }
  // Full names must be at least 2 chars; single-letter parts handled at join sites
  const name = normalizeName(raw, 2);
  if (!name) {
    return;
  }
  names.add(name);

  // OFAC-style "SURNAME, Given Names"
  const comma = name.match(/^([^,]+),\s*(.+)$/);
  if (comma) {
    const flipped = normalizeName(`${comma[2]} ${comma[1]}`);
    if (flipped) {
      names.add(flipped);
    }
  }
}

/** UN Security Council consolidated list. */
export function extractUnNames(xml: string): string[] {
  const names = new Set<string>();

  const processBlocks = (blocks: string[], isEntity: boolean) => {
    for (const block of blocks) {
      if (!block.includes('<FIRST_NAME') && !block.includes('<ALIAS_NAME')) {
        continue;
      }
      if (isEntity) {
        const first = block.match(/<FIRST_NAME>([^<]*)<\/FIRST_NAME>/i)?.[1];
        addName(names, first);
      } else {
        const parts: string[] = [];
        for (const tag of [
          'FIRST_NAME',
          'SECOND_NAME',
          'THIRD_NAME',
          'FOURTH_NAME',
        ]) {
          const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i'));
          if (m) {
            const v = normalizeName(m[1]);
            if (v) {
              parts.push(v);
            }
          }
        }
        if (parts.length) {
          names.add(parts.join(' '));
        }
      }
      for (const m of block.matchAll(/<ALIAS_NAME>([^<]*)<\/ALIAS_NAME>/gi)) {
        addName(names, m[1]);
      }
    }
  };

  processBlocks(xml.split(/<\/INDIVIDUAL>/i), false);
  processBlocks(xml.split(/<\/ENTITY>/i), true);

  return Array.from(names);
}

/** EU financial sanctions (FSD) full list — wholeName attributes. */
export function extractEuNames(xml: string): string[] {
  const names = new Set<string>();
  for (const m of xml.matchAll(/\bwholeName="([^"]*)"/g)) {
    addName(names, m[1]);
  }
  return Array.from(names);
}

/** UK FCDO / OFSI designations list. */
export function extractUkNames(xml: string): string[] {
  const names = new Set<string>();

  for (const block of xml.split(/<\/Name>/i)) {
    if (
      !/<Name[\s>]/i.test(block) &&
      !block.includes('<Name1') &&
      !block.includes('<Name6')
    ) {
      continue;
    }
    const parts: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const m = block.match(new RegExp(`<Name${i}>([^<]*)</Name${i}>`, 'i'));
      if (m) {
        const v = normalizeName(m[1]);
        if (v) {
          parts.push(v);
        }
      }
    }
    if (parts.length) {
      names.add(parts.join(' '));
    }
  }

  for (const m of xml.matchAll(
    /<NameNonLatinScript>([^<]*)<\/NameNonLatinScript>/gi,
  )) {
    addName(names, m[1]);
  }

  return Array.from(names);
}

/**
 * USA OFAC SDN — supports both SDN_ENHANCED and classic sdnList formats.
 */
export function extractUsaNames(xml: string): string[] {
  const names = new Set<string>();

  // Enhanced format: <formattedFullName>
  for (const m of xml.matchAll(
    /<formattedFullName>([^<]*)<\/formattedFullName>/gi,
  )) {
    addName(names, m[1]);
  }

  // Enhanced name parts when full name missing
  for (const block of xml.split(/<\/translation>/i)) {
    if (!block.includes('formatted')) {
      continue;
    }
    const full = block.match(
      /<formattedFullName>([^<]*)<\/formattedFullName>/i,
    )?.[1];
    if (full && normalizeName(full)) {
      continue;
    }
    const first = block.match(
      /<formattedFirstName>([^<]*)<\/formattedFirstName>/i,
    )?.[1];
    const last = block.match(
      /<formattedLastName>([^<]*)<\/formattedLastName>/i,
    )?.[1];
    const parts = [first, last]
      .map(p => (p ? normalizeName(p) : null))
      .filter((p): p is string => !!p);
    if (parts.length) {
      names.add(parts.join(' '));
    }
  }

  // Classic sdnList / sdnEntry format
  for (const entry of xml.split(/<\/sdnEntry>/i)) {
    if (!entry.includes('<lastName') && !entry.includes('<sdnEntry')) {
      continue;
    }
    // Primary name: first lastName/firstName before akaList
    const primarySection = entry.split(/<akaList/i)[0] ?? entry;
    const last = primarySection.match(/<lastName>([^<]*)<\/lastName>/i)?.[1];
    const first = primarySection.match(/<firstName>([^<]*)<\/firstName>/i)?.[1];
    const primaryParts = [first, last]
      .map(p => (p ? normalizeName(p) : null))
      .filter((p): p is string => !!p);
    if (primaryParts.length) {
      names.add(primaryParts.join(' '));
    }

    for (const m of entry.matchAll(/<aka\b[\s\S]*?<\/aka>/gi)) {
      const aka = m[0];
      const aLast = aka.match(/<lastName>([^<]*)<\/lastName>/i)?.[1];
      const aFirst = aka.match(/<firstName>([^<]*)<\/firstName>/i)?.[1];
      const akaParts = [aFirst, aLast]
        .map(p => (p ? normalizeName(p) : null))
        .filter((p): p is string => !!p);
      if (akaParts.length) {
        names.add(akaParts.join(' '));
      }
    }
  }

  return Array.from(names);
}

/**
 * Run the streaming CSV parser over a complete in-memory string.
 * Used by whole-file extractors and unit tests.
 */
function extractCsvNamesWhole(sourceId: CsvSourceId, csv: string): string[] {
  let state = createCsvStreamState();
  const result = extractCsvNamesFromChunk(sourceId, csv, state);
  const flushed = flushCsvStreamState(sourceId, result.state);
  return Array.from(new Set([...result.names, ...flushed]));
}

/** EU FSD full sanctions CSV (`Naal_wholename`, semicolon-delimited). */
export function extractEuCsvNames(csv: string): string[] {
  return extractCsvNamesWhole('eu', csv);
}

/** UK FCDO/OFSI list CSV (`Name 1`…`Name 6`, optional Report Date preamble). */
export function extractUkCsvNames(csv: string): string[] {
  return extractCsvNamesWhole('uk', csv);
}

/** USA OFAC SDN.CSV (no header; name at column index 1). */
export function extractUsaCsvNames(csv: string): string[] {
  return extractCsvNamesWhole('usa', csv);
}

/**
 * Stream-friendly extraction from a growing buffer for large files.
 * Returns { names found in complete tags, remainder to keep for next chunk }.
 */
export function extractNamesFromChunk(
  sourceId: string,
  chunk: string,
  carry: string,
): {names: string[]; carry: string} {
  const data = carry + chunk;
  // Keep a tail large enough for a long name tag that straddles chunks
  const TAIL = 8192;
  let processable = data;
  let nextCarry = '';
  if (data.length > TAIL) {
    processable = data.slice(0, data.length - TAIL);
    nextCarry = data.slice(data.length - TAIL);
  }

  let names: string[] = [];
  switch (sourceId) {
    case 'un':
      names = extractUnNames(processable);
      // Incomplete blocks may miss some names at boundaries; final flush handles rest
      break;
    case 'eu':
      names = extractEuNames(processable);
      break;
    case 'uk':
      names = extractUkNames(processable);
      break;
    case 'usa':
      names = extractUsaNames(processable);
      break;
    default:
      names = [];
  }

  return {names, carry: nextCarry};
}

export type ExtractorFn = (data: string) => string[];

export const EXTRACTORS: Record<string, ExtractorFn> = {
  un: extractUnNames,
  eu: extractEuNames,
  uk: extractUkNames,
  usa: extractUsaNames,
};

export const CSV_EXTRACTORS: Record<string, ExtractorFn> = {
  eu: extractEuCsvNames,
  uk: extractUkCsvNames,
  usa: extractUsaCsvNames,
};

export type CsvSourceId = 'eu' | 'uk' | 'usa';

export interface CsvStreamState {
  /**
   * Column indexes used to build a display name.
   * - Single-element: EU / USA / simple UK
   * - Multi-element: UK OFSI Name 1…Name 6 (joined in order)
   */
  nameIndexes: number[] | null;
  /**
   * Optional aliases column (OpenSanctions targets.simple.csv).
   * Values are semicolon-separated alternate names.
   */
  aliasIndex: number | null;
  sawHeader: boolean;
  carry: string;
  /** Auto-detected: ',' (UK/USA) or ';' (EU FSD). */
  delimiter: string;
  /** True when the first row was data (OFAC no-header CSV or plain names list). */
  headerless: boolean;
  /**
   * One name per full line (OpenSanctions names.txt). Do not split on commas —
   * names often contain "LAST, First".
   */
  plainLines: boolean;
}

function normalizeHeaderCell(h: string): string {
  return h.replace(/^\uFEFF/, '').trim().toLowerCase();
}

/**
 * Collect a name from one CSV row using resolved column indexes.
 */
function addNamesFromFields(
  names: Set<string>,
  fields: string[],
  nameIndexes: number[],
): void {
  if (nameIndexes.length === 1) {
    const idx = nameIndexes[0];
    if (idx < fields.length) {
      addName(names, parseCSVField(fields[idx]));
    }
    return;
  }

  // Multi-part (UK OFSI): join Name 1…Name 6, skipping empties
  const parts: string[] = [];
  for (const idx of nameIndexes) {
    if (idx >= fields.length) {
      continue;
    }
    const part = parseCSVField(fields[idx]).trim();
    if (part && !/^na$/i.test(part)) {
      parts.push(part);
    }
  }
  if (parts.length > 0) {
    addName(names, parts.join(' '));
  }
}

/**
 * Resolve name column indexes from a candidate header (or first data) row.
 * Returns null when the line is not a usable header for this source
 * (e.g. UK "Report Date:" preamble) so the stream keeps looking.
 */
function resolveCsvNameIndexes(
  sourceId: CsvSourceId,
  headers: string[],
): {
  indexes: number[];
  headerless: boolean;
  aliasIndex: number | null;
  plainLines: boolean;
} | null {
  const normalized = headers.map(normalizeHeaderCell);
  const firstRaw = (headers[0] ?? '').replace(/^\uFEFF/, '').trim();

  switch (sourceId) {
    case 'eu': {
      // Live EU FSD CSV uses Naal_wholename; keep older aliases + simple "name".
      const exact = [
        'naal_wholename',
        'namealias-wholename',
        'name_alias_wholename',
        'wholename',
        'name',
      ];
      for (const c of exact) {
        const idx = normalized.indexOf(c);
        if (idx !== -1) {
          const aliasIdx = normalized.indexOf('aliases');
          return {
            indexes: [idx],
            headerless: false,
            aliasIndex: aliasIdx >= 0 ? aliasIdx : null,
            plainLines: false,
          };
        }
      }
      // Fuzzy: any header ending in wholename
      const fuzzy = normalized.findIndex(
        h => h.endsWith('wholename') || h.endsWith('_wholename'),
      );
      if (fuzzy !== -1) {
        return {
          indexes: [fuzzy],
          headerless: false,
          aliasIndex: null,
          plainLines: false,
        };
      }
      // OpenSanctions names.txt — one name per line, no header.
      if (firstRaw.length >= 2) {
        return {
          indexes: [0],
          headerless: true,
          aliasIndex: null,
          plainLines: true,
        };
      }
      return null;
    }
    case 'uk': {
      // Live FCDO/OFSI CSV: Name 1 … Name 6 (not a single "Names" column).
      const partIndexes: number[] = [];
      for (let n = 1; n <= 6; n++) {
        const idx = normalized.indexOf(`name ${n}`);
        if (idx !== -1) {
          partIndexes.push(idx);
        }
      }
      if (partIndexes.length > 0) {
        const nonLatin = normalized.indexOf('name non-latin script');
        return {
          indexes: partIndexes,
          headerless: false,
          aliasIndex: nonLatin >= 0 ? nonLatin : null,
          plainLines: false,
        };
      }
      // Simpler single-column formats (tests / OpenSanctions / older exports)
      for (const c of ['names', 'name', 'entity name', 'full name', 'fullname']) {
        const idx = normalized.indexOf(c);
        if (idx !== -1) {
          const aliasIdx = normalized.indexOf('aliases');
          return {
            indexes: [idx],
            headerless: false,
            aliasIndex: aliasIdx >= 0 ? aliasIdx : null,
            plainLines: false,
          };
        }
      }
      // OpenSanctions names.txt — one name per line, no header.
      // Preamble lines like "Report Date: …" are skipped above (no match).
      if (firstRaw.length >= 2 && !/^report date:/i.test(firstRaw)) {
        return {
          indexes: [0],
          headerless: true,
          aliasIndex: null,
          plainLines: true,
        };
      }
      return null;
    }
    case 'usa': {
      // Live SDN.CSV has no header — first field is numeric EntNum.
      if (/^\d+$/.test(firstRaw)) {
        return {
          indexes: [1],
          headerless: true,
          aliasIndex: null,
          plainLines: false,
        };
      }
      // OpenSanctions targets.simple.csv (name + semicolon-separated aliases)
      const nameIdx = normalized.indexOf('name');
      const aliasIdx = normalized.indexOf('aliases');
      if (
        nameIdx !== -1 &&
        (aliasIdx !== -1 ||
          normalized.includes('dataset') ||
          normalized.includes('schema') ||
          normalized.includes('first_seen'))
      ) {
        return {
          indexes: [nameIdx],
          headerless: false,
          aliasIndex: aliasIdx >= 0 ? aliasIdx : null,
          plainLines: false,
        };
      }
      if (normalized.includes('num') || normalized.includes('ent_num')) {
        return {
          indexes: [1],
          headerless: false,
          aliasIndex: null,
          plainLines: false,
        };
      }
      for (const c of ['name', 'sdn_name', 'entity_name', 'name_1']) {
        const idx = normalized.indexOf(c);
        if (idx !== -1) {
          return {
            indexes: [idx],
            headerless: false,
            aliasIndex: null,
            plainLines: false,
          };
        }
      }
      // Plain names list (OpenSanctions names.txt) — whole line is the name.
      // Must not treat "LAST, First" as two CSV columns (that would drop the surname).
      // Official OFAC rows always start with a numeric EntNum and are handled above.
      if (firstRaw.length >= 2 && !/^id$/i.test(firstRaw)) {
        return {
          indexes: [0],
          headerless: true,
          aliasIndex: null,
          plainLines: true,
        };
      }
      return null;
    }
  }
}

/** Extract primary name fields plus optional semicolon-separated aliases. */
function addNamesFromRow(
  names: Set<string>,
  fields: string[],
  nameIndexes: number[],
  aliasIndex: number | null,
): void {
  addNamesFromFields(names, fields, nameIndexes);
  if (aliasIndex == null || aliasIndex < 0 || aliasIndex >= fields.length) {
    return;
  }
  const raw = parseCSVField(fields[aliasIndex]);
  if (!raw) {
    return;
  }
  for (const part of raw.split(';')) {
    addName(names, part);
  }
}

export function createCsvStreamState(): CsvStreamState {
  return {
    nameIndexes: null,
    aliasIndex: null,
    sawHeader: false,
    carry: '',
    delimiter: ',',
    headerless: false,
    plainLines: false,
  };
}

export function extractCsvNamesFromChunk(
  sourceId: CsvSourceId,
  chunk: string,
  state: CsvStreamState,
): {names: string[]; state: CsvStreamState} {
  const data = state.carry + chunk;
  const lines = data.split(/\r?\n/);
  const nextCarry = lines.pop() ?? '';
  const names = new Set<string>();
  let nameIndexes = state.nameIndexes;
  let aliasIndex = state.aliasIndex;
  let sawHeader = state.sawHeader;
  let delimiter = state.delimiter;
  let headerless = state.headerless;
  let plainLines = state.plainLines;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    if (!sawHeader) {
      delimiter = detectDelimiter(rawLine);
      const fields = parseCSVLine(rawLine, delimiter);
      // USA: resolve on CSV fields first (OFAC EntNum / OpenSanctions header).
      // If that yields plainLines, names may contain commas — use full line text.
      let resolved = resolveCsvNameIndexes(sourceId, fields);
      if (
        resolved?.plainLines &&
        fields.length > 1 &&
        !/^\d+$/.test((fields[0] ?? '').trim())
      ) {
        // Re-resolve as a single-field plain line so "LAST, First" stays intact
        resolved = resolveCsvNameIndexes(sourceId, [
          trimmed.replace(/^\uFEFF/, ''),
        ]);
      }
      if (!resolved) {
        // Skip preamble / unrecognised lines until a real header (or USA data) appears
        continue;
      }
      nameIndexes = resolved.indexes;
      aliasIndex = resolved.aliasIndex;
      headerless = resolved.headerless;
      plainLines = resolved.plainLines;
      sawHeader = true;

      // OFAC no-header / plain names: first line is already a data row
      if (headerless) {
        if (plainLines) {
          addName(names, trimmed.replace(/^\uFEFF/, ''));
        } else {
          addNamesFromRow(names, fields, nameIndexes, aliasIndex);
        }
      }
      continue;
    }

    if (plainLines) {
      addName(names, trimmed.replace(/^\uFEFF/, ''));
      continue;
    }

    if (!nameIndexes || nameIndexes.length === 0) {
      continue;
    }
    const fields = parseCSVLine(rawLine, delimiter);
    addNamesFromRow(names, fields, nameIndexes, aliasIndex);
  }

  return {
    names: Array.from(names),
    state: {
      nameIndexes,
      aliasIndex,
      sawHeader,
      carry: nextCarry,
      delimiter,
      headerless,
      plainLines,
    },
  };
}

export function flushCsvStreamState(
  _sourceId: CsvSourceId,
  state: CsvStreamState,
): string[] {
  const names = new Set<string>();
  const carry = state.carry.trim();
  if (!carry || !state.sawHeader) {
    return [];
  }
  if (state.plainLines) {
    addName(names, carry.replace(/^\uFEFF/, ''));
    return Array.from(names);
  }
  if (!state.nameIndexes?.length) {
    return [];
  }
  const fields = parseCSVLine(carry, state.delimiter);
  addNamesFromRow(names, fields, state.nameIndexes, state.aliasIndex);
  return Array.from(names);
}
