import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../styles/paris.css';
import { REASON_COPY, formatVerifiedAt } from '../lib/evidence';

/**
 * Provenance for the figures this site publishes.
 *
 * Rendered as the lower half of /standards. It answers a different question to
 * the progress view above it — "how well-evidenced is this claim?" rather than
 * "how is this reader doing?" — so the two keep separate headings even though
 * they share a page.
 */

const API = process.env.REACT_APP_BACKEND_URI;

function coverageBand(coverage) {
  if (coverage === null || coverage === undefined) return 'Uncounted';
  if (coverage <= 0) return 'Not Enough Evidence';
  if (coverage < 0.35) return 'Foundational';
  if (coverage < 0.5) return 'Developing';
  if (coverage < 0.65) return 'Advancing';
  if (coverage < 0.82) return 'Proficient';
  return 'Distinguished';
}

export default function ClaimsProvenance() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/api/scholar/highlights`);
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        if (cancelled) return;
        setClaims(data);
        if (data.length) setActiveKey(data[0].key);
      } catch (err) {
        if (!cancelled) setError('The evidence layer did not respond.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadEvidence = useCallback(async (claimKey) => {
    setEvidenceLoading(true);
    setSourceFilter('All');
    try {
      const res = await axios.get(`${API}/api/scholar/claims/${claimKey}/evidence`);
      setEvidence(res.data?.data || null);
    } catch (err) {
      setEvidence(null);
    } finally {
      setEvidenceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeKey) loadEvidence(activeKey);
  }, [activeKey, loadEvidence]);

  const totals = useMemo(() => {
    if (!claims.length) return null;
    const evidenceCount = claims.reduce((n, c) => n + (c.evidenceCount || 0), 0);
    const withCoverage = claims.filter((c) => typeof c.coverage === 'number');
    const meanCoverage = withCoverage.length
      ? withCoverage.reduce((n, c) => n + c.coverage, 0) / withCoverage.length
      : null;
    const lastVerified = claims.map((c) => c.lastVerifiedAt).filter(Boolean).sort().pop();
    return { evidenceCount, meanCoverage, lastVerified };
  }, [claims]);

  const activeClaim = claims.find((c) => c.key === activeKey) || null;

  const sourceFilters = useMemo(() => {
    if (!evidence?.records?.length) return ['All'];
    return ['All', ...Array.from(new Set(evidence.records.map((r) => r.sourceModel)))];
  }, [evidence]);

  const visibleRecords = useMemo(() => {
    if (!evidence?.records) return [];
    if (sourceFilter === 'All') return evidence.records;
    return evidence.records.filter((r) => r.sourceModel === sourceFilter);
  }, [evidence, sourceFilter]);

  return (
    <section aria-labelledby="provenance-title">
      <div className="paris-section-divider">
        <p className="paris-card__eyebrow">Sourcing</p>
        <h2 id="provenance-title" className="paris-card__title">
          How this site&rsquo;s own figures are backed
        </h2>
        <p className="paris-growth-header__subtitle">
          Separate from the progress above: this is about the claims the portfolio makes, not
          about a reader. Each carries the count held in the catalogue, the figure asserted
          elsewhere, and the gap between them.
        </p>

        {totals && (
          <div className="paris-growth-header__facts">
            <div className="paris-growth-header__score">
              <span className="paris-growth-header__score-label">Catalogue coverage</span>
              <strong className="paris-growth-header__score-value">
                {totals.meanCoverage === null ? '—' : `${Math.round(totals.meanCoverage * 100)}%`}
              </strong>
              <span className="paris-growth-header__score-detail">{coverageBand(totals.meanCoverage)}</span>
            </div>
            <div className="paris-growth-header__score">
              <span className="paris-growth-header__score-label">Records</span>
              <strong className="paris-growth-header__score-value">{totals.evidenceCount}</strong>
              <span className="paris-growth-header__score-detail">
                across {claims.length} {claims.length === 1 ? 'claim' : 'claims'}
                {totals.lastVerified ? ` · verified ${formatVerifiedAt(totals.lastVerified)}` : ''}
              </span>
            </div>
          </div>
        )}
      </div>

        {loading && <p className="text-sm text-gray-500">Loading…</p>}

        {error && !loading && (
          <div className="paris-empty">
            <strong>The evidence layer is unreachable.</strong>
            <p>{error} Figures are never estimated client-side, so nothing is shown rather than something unverified.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="paris-card ark-fade-up ark-fade-up-d1">
              <div className="paris-card__header">
                <div>
                  <p className="paris-card__eyebrow">Claims</p>
                  <h2 className="paris-card__title">What the site asserts</h2>
                </div>
                <span className="paris-card__hint">{claims.length} tracked</span>
              </div>

              {claims.length === 0 ? (
                <div className="paris-empty">
                  <strong>No claims are registered yet.</strong>
                  <p>Run <code>npm run seed:claims</code> then <code>npm run refresh:evidence</code> in the API.</p>
                </div>
              ) : (
                <div className="paris-claim-list">
                  {claims.map((claim) => {
                    const unmeasured = !claim.evidenceCount;
                    return (
                      <button
                        key={claim.key}
                        type="button"
                        onClick={() => setActiveKey(claim.key)}
                        aria-pressed={activeKey === claim.key}
                        className={`paris-claim ${activeKey === claim.key ? 'paris-claim--active' : ''}`}
                      >
                        <div className="paris-claim__top">
                          <div className="min-w-0">
                            <p className="paris-claim__name">{claim.label}</p>
                            <div className="paris-claim__figure">
                              <span className={`paris-claim__value ${unmeasured ? 'paris-claim__value--none' : ''}`}>
                                {unmeasured ? '—' : claim.value}
                              </span>
                              {claim.claimedValue && (
                                <span className="paris-claim__claimed">of {claim.claimedValue} claimed</span>
                              )}
                            </div>
                          </div>
                          <span className={`paris-status paris-status--${claim.status}`}>{claim.status}</span>
                        </div>

                        {typeof claim.coverage === 'number' && (
                          <div className="paris-meter">
                            <div className="paris-meter__head">
                              <span>{coverageBand(claim.coverage)}</span>
                              <span className="paris-meter__value">{Math.round(claim.coverage * 100)}%</span>
                            </div>
                            <div className="paris-meter__track">
                              <div className="paris-meter__fill" style={{ width: `${Math.round(claim.coverage * 100)}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="paris-claim__meta">
                          <span className="paris-evidence-card__score">
                            {claim.evidenceCount} record{claim.evidenceCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="paris-card ark-fade-up ark-fade-up-d2">
              <div className="paris-card__header">
                <div>
                  <p className="paris-card__eyebrow">Records</p>
                  <h2 className="paris-card__title">
                    {activeClaim ? `Behind ${activeClaim.label.toLowerCase()}` : 'Behind the figure'}
                  </h2>
                </div>
                {evidence?.records && (
                  <span className="paris-card__hint">
                    {evidence.records.length} record{evidence.records.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {activeClaim?.reliability?.reasons?.length > 0 && (
                <ul className="paris-reasons" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                  {activeClaim.reliability.reasons.map((reason) => (
                    <li key={reason}>{REASON_COPY[reason] || reason}</li>
                  ))}
                </ul>
              )}

              {sourceFilters.length > 2 && (
                <div className="paris-filter-row" style={{ marginTop: '1rem' }}>
                  {sourceFilters.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSourceFilter(f)}
                      className={`paris-filter-chip ${sourceFilter === f ? 'paris-filter-chip--active' : ''}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {evidenceLoading && <p className="text-sm text-gray-500 mt-4">Loading records…</p>}

              {!evidenceLoading && visibleRecords.length === 0 && (
                <div className="paris-empty" style={{ marginTop: '1rem' }}>
                  <strong>Not enough evidence yet.</strong>
                  <p>No catalogued records back this claim, so the figure stays unmeasured rather than being asserted.</p>
                </div>
              )}

              {!evidenceLoading && visibleRecords.length > 0 && (
                <div className="paris-evidence-list" style={{ marginTop: '1rem' }}>
                  {visibleRecords.map((record) => (
                    <article key={record.id} className="paris-evidence-card">
                      <div className="paris-evidence-card__top">
                        <div className="min-w-0">
                          <p className="paris-evidence-card__title">{record.title}</p>
                          <p className="paris-evidence-card__meta">
                            {[record.venue, record.year].filter(Boolean).join(' · ') || 'No venue recorded'}
                          </p>
                        </div>
                      </div>
                      <div className="paris-evidence-card__footer">
                        <span className="paris-evidence-card__tag">{record.sourceModel}</span>
                        {record.link && (
                          <a href={record.link} target="_blank" rel="noreferrer noopener" className="paris-evidence-card__link">
                            Open
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
    </section>
  );
}
