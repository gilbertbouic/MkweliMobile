/**
 * Official sanctions list download sources.
 * URLs provided by product requirements.
 *
 * USA has alternate URLs: some networks / OEM TLS stacks fail against the
 * OFAC list service host while still reaching treasury.gov (Akamai) or the
 * same file via a different path. Download tries each URL in order.
 */

export type SanctionsSourceId = 'un' | 'eu' | 'uk' | 'usa';

export interface SanctionsSource {
  id: SanctionsSourceId;
  label: string;
  /** Primary download URL. */
  url: string;
  /**
   * Optional fallbacks tried when the primary URL fails with a network/HTTP error.
   * Order matters — first success wins.
   */
  alternateUrls?: string[];
  /** File name used for temporary download artifacts (deleted after parse). */
  tempFileName: string;
}

export const SANCTIONS_SOURCES: SanctionsSource[] = [
  {
    id: 'usa',
    label: 'USA (OFAC SDN)',
    // Official OFAC first. Many networks (and some OEM TLS stacks) cannot reach
    // sanctionslistservice.ofac.treas.gov at all — treasury.gov redirects there too.
    // Fallbacks use OpenSanctions' daily OFAC SDN mirror on a global CDN (Bunny),
    // which is reachable when the Treasury host is blocked. Same designations;
    // open-data redistribution for offline/sideload screening apps.
    url: 'https://www.treasury.gov/ofac/downloads/sdn.csv',
    alternateUrls: [
      // CDN mirrors first after official failure — OFAC list-service is often
      // unreachable from non-US / non-GMS devices (hard Network request failed).
      'https://data.opensanctions.org/datasets/latest/us_ofac_sdn/names.txt',
      'https://data.opensanctions.org/datasets/latest/us_ofac_sdn/targets.simple.csv',
      'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV',
      'https://sanctionslistservice.ofac.treas.gov/api/publicationpreview/exports/sdn.csv',
    ],
    tempFileName: 'usa-sdn.csv',
  },
  {
    id: 'un',
    label: 'UN',
    url: 'https://scsanctions.un.org/resources/xml/en/name/consolidated.xml',
    tempFileName: 'un-consolidated.xml',
  },
  {
    id: 'eu',
    label: 'EU',
    url: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/csvFullSanctionsList/content?token=dG9rZW4tMjAxNw',
    tempFileName: 'eu-full-sanctions.csv',
  },
  {
    id: 'uk',
    label: 'UK',
    url: 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.csv',
    tempFileName: 'uk-sanctions-list.csv',
  },
];

/**
 * Automatic refresh interval. On each app open, if lists are older than this
 * (or still bundled seed), the app downloads and parses the latest official
 * lists. Manual "Update lists" remains available at any time.
 */
export const LIST_STALE_AFTER_DAYS = 30;
