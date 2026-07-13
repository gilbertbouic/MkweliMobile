/**
 * Official sanctions list download sources.
 * URLs provided by product requirements.
 */

export type SanctionsSourceId = 'un' | 'eu' | 'uk' | 'usa';

export interface SanctionsSource {
  id: SanctionsSourceId;
  label: string;
  url: string;
  /** File name used for temporary download artifacts (deleted after parse). */
  tempFileName: string;
}

export const SANCTIONS_SOURCES: SanctionsSource[] = [
  {
    id: 'un',
    label: 'UN',
    url: 'https://scsanctions.un.org/resources/xml/en/name/consolidated.xml',
    tempFileName: 'un-consolidated.xml',
  },
  {
    id: 'eu',
    label: 'EU',
    url: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList/content?token=dG9rZW4tMjAxNw',
    tempFileName: 'eu-full-sanctions.xml',
  },
  {
    id: 'uk',
    label: 'UK',
    url: 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.xml',
    tempFileName: 'uk-sanctions-list.xml',
  },
  {
    id: 'usa',
    label: 'USA (OFAC SDN)',
    url: 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN_ENHANCED.XML',
    tempFileName: 'usa-sdn-enhanced.xml',
  },
];

/** Recommend refresh after this many days (manual update only). */
export const LIST_STALE_AFTER_DAYS = 30;
