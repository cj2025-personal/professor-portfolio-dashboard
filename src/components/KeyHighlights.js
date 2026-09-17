import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ReliabilityChip from './ReliabilityChip';
import EvidencePanel from './EvidencePanel';
import { NOT_ENOUGH_EVIDENCE } from '../lib/evidence';

const API = process.env.REACT_APP_BACKEND_URI;

/**
 * The hero highlights bar — same {label, value} contract HeroSectionV2 renders
 * in the profile app, so the component ports across.
 *
 * Every field comes from /api/scholar/highlights, which scores each claim
 * against its evidence records server-side. Nothing here is typed in: the
 * figure, the confidence, the coverage and the claimed value are all facts the
 * evidence layer computed.
 */

export default function KeyHighlights() {
  const [highlights, setHighlights] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await axios.get(`${API}/api/scholar/highlights`);
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        if (!cancelled) {
          // A claim the evidence layer could not measure renders as unmeasured
          // rather than as a zero it would have to walk back.
          setHighlights(
            data.map((h) => ({
              ...h,
              value: h.evidenceCount ? String(h.value) : NOT_ENOUGH_EVIDENCE,
              claimedValue: h.claimedValue ? String(h.claimedValue) : null,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) setHighlights([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openEvidence = useCallback(async (highlight) => {
    setActive(highlight);
    setRecords([]);
    setRecordsError(null);
    if (!highlight.evidenceRef || !highlight.evidenceCount) return;

    setRecordsLoading(true);
    try {
      const res = await axios.get(`${API}${highlight.evidenceRef}`);
      setRecords(res.data?.data?.records || []);
    } catch (err) {
      setRecordsError('The catalogue did not respond.');
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  // Nothing rendered until the counts resolve — an empty bar is better than
  // one that flashes zeros it will immediately contradict.
  if (!loaded || highlights.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200 mb-16 shadow-sm"
      >
        {highlights.map((h) => {
          const unmeasured = h.value === NOT_ENOUGH_EVIDENCE;
          return (
            <button
              key={h.key}
              type="button"
              onClick={() => openEvidence(h)}
              aria-label={`${h.label}: see the records behind this figure`}
              className="group bg-white px-5 py-5 text-left transition-colors hover:bg-gray-50"
            >
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.09em] text-gray-500">
                {h.label}
              </p>
              <p className="mt-1.5 flex items-baseline gap-2">
                <span
                  className={`text-xl font-extrabold tabular-nums ${
                    unmeasured ? 'text-gray-400' : 'text-brand-600'
                  }`}
                >
                  {unmeasured ? '—' : h.value}
                </span>
                {h.claimedValue && !unmeasured && (
                  <span className="text-xs font-medium text-gray-500">
                    of {h.claimedValue} claimed
                  </span>
                )}
              </p>
              <span className="mt-2.5 flex items-center gap-2">
                <ReliabilityChip reliability={h.reliability} />
                <span className="text-[0.6rem] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View evidence →
                </span>
              </span>
            </button>
          );
        })}
      </motion.div>

      <EvidencePanel
        highlight={active}
        records={records}
        loading={recordsLoading}
        error={recordsError}
        onClose={() => setActive(null)}
      />
    </>
  );
}
