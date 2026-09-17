/**
 * Client-side vocabulary for the scholar evidence layer.
 *
 * The scoring itself — reliability, coverage, claim status — is computed by
 * the API (professor-portfolio-API/services/scoring.service.js), which is the
 * port of PARIS's mastery model. Only the labels the UI needs to render those
 * results live here; deriving them a second time in the browser would let the
 * two drift.
 */

export const CLAIM_STATUS = {
  UNMEASURED: 'unmeasured',
  PROVISIONAL: 'provisional',
  MEASURED: 'measured',
  STABLE: 'stable',
};

/** Mirrors PARIS's not_enough_evidence — a real rendered state, not a blank. */
export const NOT_ENOUGH_EVIDENCE = 'not_enough_evidence';

export const RELIABILITY = {
  HIGH: 'high',
  MODERATE: 'moderate',
  LOW: 'low',
};

/** Human copy for each reliability reason the API can emit. */
export const REASON_COPY = {
  aggregate_count: 'Counted directly from catalogued records',
  no_records_found: 'No records found in the catalogue',
  partial_catalogue: 'The catalogue holds fewer records than the figure claimed',
  unverified_external_claim: 'Figure asserted externally, not yet verified here',
  thin_evidence_base: 'Too few records for the count to be settled',
  incomplete_record_metadata: 'Some records are missing a date or venue',
};

export function formatVerifiedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
