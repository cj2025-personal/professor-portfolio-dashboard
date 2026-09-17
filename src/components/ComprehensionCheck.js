import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getLearnerId, getReadingLevel } from '../lib/learner';

/**
 * The loop that turns a reader into a measured learner.
 *
 * Reading an answer demonstrates nothing, so nothing is scored for it.
 * Answering questions about that answer is productive work, and that is what
 * PARIS counts. Marking happens server-side against a key the client never
 * receives.
 */

const API = process.env.REACT_APP_BACKEND_URI;

/* Mirrors config/scoring.js check.CERTAINTY_LEVELS. The server validates and
   falls back to fairly_sure, so a stale label here cannot corrupt a score. */
const CERTAINTY = [
  { key: 'unsure', label: 'Guessing' },
  { key: 'fairly_sure', label: 'Fairly sure' },
  { key: 'certain', label: 'Certain' },
];

export default function ComprehensionCheck({ question, answer }) {
  const [state, setState] = useState('idle'); // idle | loading | ready | grading | done | unavailable
  const [check, setCheck] = useState(null);
  const [choices, setChoices] = useState({});
  /* How sure the reader is. This is not decoration: it separates a lucky
     guess from secure knowledge and an honest "not sure" from a confidently
     held misconception, and it drives how far the resulting evidence is
     trusted. */
  const [certainty, setCertainty] = useState({});
  const [result, setResult] = useState(null);

  const begin = async () => {
    setState('loading');
    try {
      const res = await axios.post(`${API}/api/rag/check`, {
        learnerId: getLearnerId(),
        readingLevel: getReadingLevel(),
        question,
        answer,
      });
      setCheck(res.data.data);
      setState('ready');
    } catch (err) {
      // 422 means the answer could not be grounded into fair questions. That
      // is a legitimate outcome, not a failure to hide.
      setState('unavailable');
    }
  };

  const submit = async () => {
    if (!check) return;
    setState('grading');
    try {
      const responses = check.questions.map((_, i) =>
        Number.isInteger(choices[i]) ? choices[i] : -1
      );
      const certainties = check.questions.map((_, i) => certainty[i] || 'fairly_sure');
      const res = await axios.post(`${API}/api/rag/check/${check.checkId}/submit`, {
        responses,
        certainties,
      });
      setResult(res.data.data);
      setState('done');
    } catch (err) {
      setState('ready');
    }
  };

  const allAnswered =
    check && check.questions.every((_, i) => Number.isInteger(choices[i]) && certainty[i]);

  if (state === 'idle') {
    return (
      <button type="button" onClick={begin} className="cc-start">
        Check what you got
      </button>
    );
  }

  if (state === 'loading') {
    return <p className="cc-note">Building a few questions from the sources…</p>;
  }

  if (state === 'unavailable') {
    return (
      <p className="cc-note">
        Not enough grounded material to build a fair check on this answer.
      </p>
    );
  }

  if (state === 'done' && result) {
    const scored = result.afterScore !== null;
    return (
      <div className="cc-result">
        <p className="cc-result__score">
          {result.correctCount} of {result.total} correct
        </p>

        <ul className="cc-result__list">
          {result.results.map((r) => (
            <li key={r.index} className={r.correct ? 'cc-ok' : 'cc-no'}>
              <span aria-hidden>{r.correct ? '✓' : '✕'}</span>
              <span>
                {r.prompt}
                <em className="cc-why">
                  {r.correct ? 'Correct' : 'Not right'} · you were{' '}
                  {r.certainty.replace('_', ' ')}
                  {!r.correct && r.explanation ? ` — ${r.explanation}` : ''}
                </em>
              </span>
            </li>
          ))}
        </ul>

        {result.movedCompetencies.length > 0 && (
          <div className="cc-moved">
            <p className="cc-moved__label">What moved</p>
            {result.movedCompetencies.map((c) => (
              <p key={c.code} className="cc-moved__row">
                <span>{c.name}</span>
                <strong>
                  {c.mastery} · {c.band}
                </strong>
              </p>
            ))}
          </div>
        )}

        <p className="cc-note">
          {scored ? (
            <>
              Your overall level is now <strong>{Math.round(result.afterScore)} / 1000</strong>{' '}
              ({result.scoreBand}).{' '}
            </>
          ) : (
            <>
              {/* The floor is real: a composite from one or two records would
                  be noise. Saying how far off it is beats a fake number. */}
              {result.evidenceUntilScored} more answer
              {result.evidenceUntilScored === 1 ? '' : 's'} before your overall level can be
              scored.{' '}
            </>
          )}
          <Link to="/standards">See your standards profile</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="cc-quiz">
      <p className="cc-quiz__label">Quick check</p>
      {check.questions.map((q, i) => (
        <fieldset key={i} className="cc-q">
          <legend>{q.prompt}</legend>
          {q.options.map((opt, j) => (
            <label key={j} className={`cc-opt ${choices[i] === j ? 'cc-opt--on' : ''}`}>
              <input
                type="radio"
                name={`cc-${check.checkId}-${i}`}
                checked={choices[i] === j}
                onChange={() => setChoices((prev) => ({ ...prev, [i]: j }))}
                disabled={state === 'grading'}
              />
              <span>{opt}</span>
            </label>
          ))}
          <div className="cc-cert" role="group" aria-label="How sure are you?">
            <span className="cc-cert__label">How sure?</span>
            {CERTAINTY.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={certainty[i] === c.key}
                onClick={() => setCertainty((prev) => ({ ...prev, [i]: c.key }))}
                className={`cc-cert__btn ${certainty[i] === c.key ? 'cc-cert__btn--on' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={submit}
        disabled={!allAnswered || state === 'grading'}
        className="cc-submit"
      >
        {state === 'grading' ? 'Marking…' : 'Submit answers'}
      </button>
    </div>
  );
}
