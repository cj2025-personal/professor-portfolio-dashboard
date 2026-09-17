import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReliabilityChip, { StatusChip } from './ReliabilityChip';
import {
  NOT_ENOUGH_EVIDENCE,
  REASON_COPY,
  formatVerifiedAt,
} from '../lib/evidence';

/**
 * Drill-down for a single highlight: the PARIS per-competency evidence trail,
 * reframed as "click a figure, see the records behind it".
 */
export default function EvidencePanel({ highlight, records, loading, error, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // Focus the close control on open, restore nothing on unmount — the trigger
  // button remains in the DOM and browsers return focus to it naturally.
  useEffect(() => {
    if (highlight && closeRef.current) closeRef.current.focus();
  }, [highlight]);

  useEffect(() => {
    if (!highlight) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      // Trap focus inside the dialog.
      const focusable = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [highlight, onClose]);

  const verifiedAt = highlight ? formatVerifiedAt(highlight.lastVerifiedAt) : null;

  return (
    <AnimatePresence>
      {highlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1400] flex items-center justify-center p-4"
          style={{ background: 'rgba(23,32,51,0.55)' }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-panel-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="ark-stripe relative w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col bg-white shadow-lg"
            style={{ borderRadius: 'var(--ark-radius-modal)' }}
          >
            <div className="px-6 pt-7 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.09em] text-gray-500">
                    {highlight.label}
                  </p>
                  <h2
                    id="evidence-panel-title"
                    className="mt-1 text-xl font-extrabold text-gray-900 leading-tight"
                  >
                    {highlight.value === NOT_ENOUGH_EVIDENCE
                      ? 'Not enough evidence'
                      : highlight.value}
                    {highlight.claimedValue && (
                      <span className="ml-2 text-base font-semibold text-gray-500">
                        of {highlight.claimedValue} claimed
                      </span>
                    )}
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close evidence panel"
                  className="flex-none w-8 h-8 grid place-items-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusChip status={highlight.status} />
                <ReliabilityChip reliability={highlight.reliability} />
              </div>

              {highlight.coverage !== null && highlight.coverage !== undefined && (
                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-xs text-gray-500 mb-1.5">
                    <span>Catalogue coverage</span>
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {Math.round(highlight.coverage * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(highlight.coverage * 100)}%`,
                        background: 'var(--ark-navy)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-5 overflow-y-auto">
              {highlight.reliability?.reasons?.length > 0 && (
                <ul className="mb-5 space-y-1.5">
                  {highlight.reliability.reasons.map((reason) => (
                    <li key={reason} className="flex gap-2 text-sm text-gray-600">
                      <span aria-hidden className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-none" />
                      {REASON_COPY[reason] || reason}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[0.6rem] font-bold uppercase tracking-[0.09em] text-gray-500 mb-3">
                Records behind this figure
              </p>

              {loading && <p className="text-sm text-gray-500">Loading records…</p>}

              {error && !loading && (
                <p className="text-sm text-red-700">
                  Could not load the records. {error}
                </p>
              )}

              {!loading && !error && records.length === 0 && (
                <p className="text-sm text-gray-500">
                  No records are catalogued for this figure yet. Until they are, the
                  number above stays unmeasured rather than being asserted.
                </p>
              )}

              {!loading && !error && records.length > 0 && (
                <ol className="space-y-2.5">
                  {records.map((record, i) => (
                    <li
                      key={record.id || `${record.title}-${i}`}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2.5"
                    >
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {record.title}
                      </p>
                      {(record.venue || record.year) && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {[record.venue, record.year].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {verifiedAt && (
                <p className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  Last verified against the catalogue on {verifiedAt}.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
