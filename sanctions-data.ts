// sanctions-data.ts

// Import extracted name lists
import fullXsdNames from './assets/sanctions/full-xsd-names.json';
import ukSanctionsNames from './assets/sanctions/uk-sanctions-names.json';
import sdnNames from './assets/sanctions/sdn-names.json';

// Combine all names into a Set for fast lookup
export const allSanctionedNames: Set<string> = new Set([
  ...fullXsdNames,
  ...ukSanctionsNames,
  ...sdnNames,
]);

/**
 * Checks if a name is present in the sanctions lists.
 * @param name Name to check (case-insensitive, trimmed)
 * @returns true if sanctioned, false otherwise
 */
export function isSanctioned(name: string): boolean {
  if (!name) return false;
  // Normalize input for comparison
  const normalized = name.trim().toLowerCase();
  for (const sanctioned of allSanctionedNames) {
    if (sanctioned.trim().toLowerCase() === normalized) {
      return true;
    }
  }
  return false;
}
