/**
 * Extract person/entity names from official sanctions XML and CSV formats.
 * Uses targeted regex for XML; simple line-based parsing for CSV.
 */

/**
 * Parse a CSV line respecting quoted fields and escaped quotes.
 * Handles: "Smith, John" as a single field, "" as escaped quote.
 */
function parseCSVLine(line: string): string[] {
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
    } else if (char === ',' && !inQuotes) {
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

function normalizeName(raw: string, minLength = 1): string | null {
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
function addName(names: Set<string>, raw: string | undefined | null) {
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
 * EU OFSI sanctions list CSV — "name" or "wholename" column.
 */
export function extractEuCsvNames(csv: string): string[] {
  const names = new Set<string>();
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  // Find header row and name column index
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase());
  let nameColumnIndex = headers.indexOf('name');
  if (nameColumnIndex === -1) {
    nameColumnIndex = headers.indexOf('wholename');
  }
  if (nameColumnIndex === -1) return [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseCSVLine(line);
    if (nameColumnIndex >= fields.length) continue;
    const name = parseCSVField(fields[nameColumnIndex]);
    addName(names, name);
  }

  return Array.from(names);
}

/**
 * UK FCDO sanctions list CSV — "name" or "entity name" column.
 */
export function extractUkCsvNames(csv: string): string[] {
  const names = new Set<string>();
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase());
  let nameColumnIndex = headers.indexOf('name');
  if (nameColumnIndex === -1) {
    nameColumnIndex = headers.indexOf('entity name');
  }
  if (nameColumnIndex === -1) return [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseCSVLine(line);
    if (nameColumnIndex >= fields.length) continue;
    const name = parseCSVField(fields[nameColumnIndex]);
    addName(names, name);
  }

  return Array.from(names);
}

/**
 * USA OFAC SDN CSV — "name" or "entity_name" column.
 */
export function extractUsaCsvNames(csv: string): string[] {
  const names = new Set<string>();
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase());
  let nameColumnIndex = headers.indexOf('name');
  if (nameColumnIndex === -1) {
    nameColumnIndex = headers.indexOf('entity_name');
  }
  if (nameColumnIndex === -1) return [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = parseCSVLine(line);
    if (nameColumnIndex >= fields.length) continue;
    const name = parseCSVField(fields[nameColumnIndex]);
    addName(names, name);
  }

  return Array.from(names);
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


