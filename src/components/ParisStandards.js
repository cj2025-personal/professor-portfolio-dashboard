import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/paris.css';
import ClaimsProvenance from './ClaimsProvenance';
import StandardsIntro from './StandardsIntro';
import { getLearnerId } from '../lib/learner';

/**
 * PARIS standards layer — a reader's progress.
 *
 * Structure follows user-dashboard's ParisGrowthHeader and skill compass:
 * level and score, recent movement, strongest and focus competency, pillar
 * breakdown, then the evidence trail.
 *
 * Confidence appears ONCE, as a subtitle under recent movement, exactly as
 * the reference does it. It is a caveat on the number, not the number.
 */

const API = process.env.REACT_APP_BACKEND_URI;

/** user-dashboard/utils/masteryBands.ts */
const BAND_CLASS = {
  'Not Enough Evidence': 'paris-band--none',
  Building: 'paris-band--building',
  Emerging: 'paris-band--emerging',
  Steady: 'paris-band--steady',
  Strong: 'paris-band--strong',
  Exceptional: 'paris-band--exceptional',
};

/** ParisGrowthHeader.tsx: formatGrowth */
function formatGrowth(value) {
  if (!value) return 'No scored movement yet';
  return `${value > 0 ? '+' : ''}${Math.round(value)} this month`;
}

/** ParisGrowthHeader.tsx: confidenceLabel */
function confidenceLabel(value) {
  if (value >= 0.8) return 'High confidence';
  if (value >= 0.55) return 'Building confidence';
  if (value > 0) return 'Low confidence';
  return 'Profile warming up';
}

const COMPONENT_LABELS = {
  reading_comprehension: 'Reading comprehension',
  vocabulary: 'Vocabulary',
  evidence_based_reasoning: 'Evidence-based reasoning',
  knowledge_connections: 'Knowledge connections',
  writing_communication: 'Writing & communication',
  ai_source_literacy: 'AI & source literacy',
};

export default function ParisStandards() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPillar, setOpenPillar] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        /* Your own profile first. The seeded example is only a fallback for a
           visitor who has not answered anything yet - without this the page
           could never show a real reader their own progress. */
        let data = null;
        try {
          const mine = await axios.get(`${API}/api/learner/${getLearnerId()}/dashboard`);
          if (mine.data?.data?.profile?.evidenceCount > 0) data = mine.data.data;
        } catch (_) {
          // No profile yet; fall through to the illustrative one.
        }

        if (!data) {
          const demo = await axios.get(`${API}/api/learner/demo/dashboard`);
          data = demo.data?.data || null;
        }

        if (cancelled) return;
        setDashboard(data);
        const first = data?.pillars?.find((p) => p.mastery !== null);
        if (first) setOpenPillar(first.code);
      } catch (err) {
        if (!cancelled) setError('The standards layer did not respond.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const profile = dashboard?.profile;
  const strongest = useMemo(
    () => dashboard?.competencyMastery?.find((c) => c.code === profile?.strongestCompetencyCode) || null,
    [dashboard, profile]
  );
  const focus = useMemo(
    () => dashboard?.competencyMastery?.find((c) => c.code === profile?.focusCompetencyCode) || null,
    [dashboard, profile]
  );

  return (
    <div className="paris-page pt-20 pb-16">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to the portfolio
        </Link>

        {dashboard && !dashboard.isDemo && (
          <div className="paris-demo-banner paris-demo-banner--live ark-fade-up" role="note">
            <span className="paris-demo-banner__tag">Your profile</span>
            <p>
              Built from questions you answered in the assistant. Stored per browser, not tied
              to an account &mdash; clearing site data starts a new profile.
            </p>
          </div>
        )}

        <StandardsIntro />

        {/* Illustrative data must announce itself before anything else is read. */}
        {dashboard?.isDemo && (
          <div className="paris-demo-banner ark-fade-up" role="note">
            <span className="paris-demo-banner__tag">Sample data</span>
            <p>
              This is a seeded example reader, not a real person&rsquo;s progress. Every figure
              below is illustrative and exists to show the shape of the standards layer.
            </p>
          </div>
        )}

        {loading && <p className="text-sm text-gray-500">Loading…</p>}

        {error && !loading && (
          <div className="paris-empty">
            <strong>The standards layer is unreachable.</strong>
            <p>{error} Check the API is running, then reload.</p>
          </div>
        )}

        {!loading && !error && !dashboard && (
          <div className="paris-empty">
            <strong>No reader has been measured yet.</strong>
            <p>
              Seed the illustrative example with <code>npm run seed:demo-learner</code> in the API,
              or complete an activity to start building a real profile.
            </p>
          </div>
        )}

        {!loading && dashboard && profile && (
          <>
            {/* ---- Growth header ---- */}
            <section className="paris-growth-header ark-fade-up">
              <div>
                <p className="paris-growth-header__eyebrow">PARIS Standards Layer</p>
                <h1 className="paris-growth-header__title">
                  {dashboard.learner.displayName}&rsquo;s growth, explained with evidence.
                </h1>
                <p className="paris-growth-header__subtitle">
                  Mastery is inferred from what this reader produced, never from what they read.
                  Untouched competencies are shown as unmeasured rather than scored as weak.
                </p>

                <div className="paris-growth-header__facts">
                  <div className="paris-growth-header__score">
                    <span className="paris-growth-header__score-label">PARIS level</span>
                    <strong className="paris-growth-header__score-value">
                      {profile.parisLevel !== null ? profile.parisLevel.toFixed(1) : 'Warming up'}
                    </strong>
                    <span className="paris-growth-header__score-detail">
                      {profile.parisScore !== null
                        ? `${Math.round(profile.parisScore)} / 1000 · ${profile.levelName}`
                        : 'Not enough evidence yet'}
                    </span>
                  </div>

                  <div className="paris-growth-header__score">
                    <span className="paris-growth-header__score-label">Recent movement</span>
                    <strong className="paris-growth-header__score-value">
                      {formatGrowth(profile.growth30d)}
                    </strong>
                    {/* The single place confidence appears. */}
                    <span className="paris-growth-header__score-detail">
                      {confidenceLabel(profile.confidenceScore)}
                    </span>
                  </div>
                </div>

                <div className="paris-growth-header__badges">
                  <span className="paris-growth-header__badge">{profile.scoreBand}</span>
                  <span className="paris-growth-header__badge">{profile.evidenceCount} evidence points</span>
                  <span className="paris-growth-header__badge">
                    7d {profile.growth7d >= 0 ? '+' : ''}{profile.growth7d} · 90d {profile.growth90d >= 0 ? '+' : ''}{profile.growth90d}
                  </span>
                </div>
              </div>

              <div className="paris-growth-header__rail">
                <div className="paris-growth-header__rail-card">
                  <span className="paris-growth-header__rail-label">Strongest</span>
                  <strong className="paris-growth-header__rail-value">
                    {strongest?.name || 'Still emerging'}
                  </strong>
                  {strongest && (
                    <span className="paris-growth-header__rail-detail">
                      {strongest.masteryBand} · {strongest.evidenceCount} record
                      {strongest.evidenceCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <div className="paris-growth-header__rail-card">
                  <span className="paris-growth-header__rail-label">Focus next</span>
                  <strong className="paris-growth-header__rail-value">
                    {focus?.name || 'Build a first evidence trail'}
                  </strong>
                  <span className="paris-growth-header__rail-detail">
                    {focus ? focus.description : 'Complete an activity to start measuring.'}
                  </span>
                </div>
              </div>
            </section>

            {/* ---- Components ---- */}
            <section className="paris-card ark-fade-up ark-fade-up-d1" style={{ marginTop: '1.25rem' }}>
              <div className="paris-card__header">
                <div>
                  <p className="paris-card__eyebrow">Score components</p>
                  <h2 className="paris-card__title">Where the score comes from</h2>
                </div>
              </div>
              <div className="paris-components">
                {Object.entries(profile.componentScores).map(([key, value]) => (
                  <div key={key} className="paris-component">
                    <div className="paris-meter__head">
                      <span>{COMPONENT_LABELS[key] || key}</span>
                      <span className="paris-meter__value">
                        {value === null ? 'unmeasured' : value}
                      </span>
                    </div>
                    <div className="paris-meter__track">
                      <div
                        className={`paris-meter__fill ${value === null ? 'paris-meter__fill--none' : ''}`}
                        style={{ width: `${value === null ? 0 : Math.min(100, value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ---- Pillars & competencies ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ marginTop: '1.25rem' }}>
              <section className="paris-card ark-fade-up ark-fade-up-d2">
                <div className="paris-card__header">
                  <div>
                    <p className="paris-card__eyebrow">Competency compass</p>
                    <h2 className="paris-card__title">Five pillars, fifteen competencies</h2>
                  </div>
                </div>

                <div className="paris-claim-list">
                  {dashboard.pillars.map((pillar) => {
                    const open = openPillar === pillar.code;
                    const items = dashboard.competencyMastery.filter((c) => c.pillarCode === pillar.code);
                    return (
                      <div key={pillar.code}>
                        <button
                          type="button"
                          onClick={() => setOpenPillar(open ? null : pillar.code)}
                          aria-expanded={open}
                          className={`paris-claim ${open ? 'paris-claim--active' : ''}`}
                        >
                          <div className="paris-claim__top">
                            <div className="min-w-0">
                              <p className="paris-claim__name">{pillar.name}</p>
                              <p className="paris-evidence-card__meta">
                                {pillar.measuredCount} of {pillar.competencyCount} measured
                              </p>
                            </div>
                            <span className={`paris-band ${BAND_CLASS[pillar.masteryBand]}`}>
                              {pillar.masteryBand}
                            </span>
                          </div>
                          <div className="paris-meter">
                            <div className="paris-meter__track">
                              <div
                                className={`paris-meter__fill ${pillar.mastery === null ? 'paris-meter__fill--none' : ''}`}
                                style={{ width: `${pillar.mastery === null ? 0 : Math.min(100, pillar.mastery)}%` }}
                              />
                            </div>
                          </div>
                        </button>

                        {open && (
                          <div className="paris-competency-list">
                            {items.map((c) => (
                              <div key={c.code} className="paris-competency">
                                <div className="paris-competency__top">
                                  <div className="min-w-0">
                                    <p className="paris-competency__name">{c.name}</p>
                                    <p className="paris-evidence-card__meta">{c.description}</p>
                                  </div>
                                  <span className={`paris-band ${BAND_CLASS[c.masteryBand]}`}>
                                    {c.mastery === null ? '—' : c.mastery}
                                  </span>
                                </div>
                                <div className="paris-meter__track" style={{ marginTop: '0.5rem' }}>
                                  <div
                                    className={`paris-meter__fill ${c.mastery === null ? 'paris-meter__fill--none' : ''}`}
                                    style={{ width: `${c.mastery === null ? 0 : Math.min(100, c.mastery)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ---- Evidence trail ---- */}
              <section className="paris-card ark-fade-up ark-fade-up-d3">
                <div className="paris-card__header">
                  <div>
                    <p className="paris-card__eyebrow">Evidence trail</p>
                    <h2 className="paris-card__title">Proof behind the score</h2>
                  </div>
                  <span className="paris-card__hint">{dashboard.evidenceTrail.length} pieces</span>
                </div>

                {dashboard.evidenceTrail.length === 0 ? (
                  <div className="paris-empty">
                    <strong>Not enough evidence yet.</strong>
                    <p>Complete an activity to start the trail.</p>
                  </div>
                ) : (
                  <div className="paris-evidence-list">
                    {dashboard.evidenceTrail.map((e) => (
                      <article key={e.id} className="paris-evidence-card">
                        <div className="paris-evidence-card__top">
                          <div className="min-w-0">
                            <p className="paris-evidence-card__title">{e.title}</p>
                            <p className="paris-evidence-card__meta">{e.summary}</p>
                          </div>
                          {typeof e.score === 'number' && (
                            <span className="paris-evidence-card__score">{e.score}</span>
                          )}
                        </div>
                        <div className="paris-evidence-card__footer">
                          {e.competencies.map((name) => (
                            <span key={name} className="paris-evidence-card__tag">{name}</span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

          </>
        )}

        {/* Sourcing sits below the progress view. Different subject, so it
            keeps its own heading rather than blending into the section above. */}
        <ClaimsProvenance />
      </div>
    </div>
  );
}
