import React from 'react';
import { RELIABILITY, CLAIM_STATUS } from '../lib/evidence';

/**
 * A weak number should look weak. PARIS surfaces reliability as a label rather
 * than a bare score precisely so the reader does not have to interpret 0.32.
 */
const RELIABILITY_STYLE = {
  [RELIABILITY.HIGH]: 'bg-green-50 text-green-800 border-green-200',
  [RELIABILITY.MODERATE]: 'bg-brand-50 text-brand-800 border-brand-200',
  [RELIABILITY.LOW]: 'bg-red-50 text-red-800 border-red-200',
};

const STATUS_COPY = {
  [CLAIM_STATUS.UNMEASURED]: 'Unmeasured',
  [CLAIM_STATUS.PROVISIONAL]: 'Provisional',
  [CLAIM_STATUS.MEASURED]: 'Measured',
  [CLAIM_STATUS.STABLE]: 'Stable',
};

export function StatusChip({ status }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.09em] bg-gray-100 text-gray-600">
      {STATUS_COPY[status] || status}
    </span>
  );
}

export default function ReliabilityChip({ reliability, className = '' }) {
  if (!reliability) return null;
  const style = RELIABILITY_STYLE[reliability.label] || RELIABILITY_STYLE[RELIABILITY.LOW];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.09em] ${style} ${className}`}
      title={`Confidence ${Math.round((reliability.value || 0) * 100)}%`}
    >
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current" />
      {reliability.label} confidence
    </span>
  );
}
