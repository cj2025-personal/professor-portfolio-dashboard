import React from 'react';
import useArchivynContent from '../lib/useArchivynContent';

/**
 * What a cold viewer needs before the numbers mean anything.
 *
 * Someone landing on a scholar's portfolio has no reason to expect a standards
 * page attached to it. Without this the connective tissue lives only in the
 * head of whoever is presenting, and the page reads as a dashboard bolted onto
 * a CV.
 *
 * Deliberately states what is real and what is illustrative. A demo that
 * oversells is worse than one that explains itself.
 */
export default function StandardsIntro() {
  const { content } = useArchivynContent();
  return (
    <section className="paris-intro ark-fade-up" aria-labelledby="standards-intro-title">
      <p className="paris-card__eyebrow">What you are looking at</p>
      <h2 id="standards-intro-title" className="paris-intro__title">
        A scholar&rsquo;s work, and a record of what a reader actually took from it.
      </h2>

      <p className="paris-intro__lead">
        This portfolio is a working model of the {content?.brand || 'project'} idea. The pages before this one are an
        ordinary academic site. This page is the part that is not ordinary: it treats
        <strong> understanding as something to be evidenced rather than assumed</strong>, on both
        sides of the page.
      </p>

      <ol className="paris-intro__steps">
        <li>
          <span className="paris-intro__num">1</span>
          <div>
            <strong>Ask the assistant something</strong>
            <p>
              It answers from this scholar&rsquo;s catalogued work, and renders that answer at the
              grade band you choose — K through 14. Same sources, same facts, different explanation.
            </p>
          </div>
        </li>
        <li>
          <span className="paris-intro__num">2</span>
          <div>
            <strong>Answer a few questions about it</strong>
            <p>
              Reading a good answer demonstrates nothing, so nothing is scored for it. Answering
              questions about it is work that can be judged — and that is what gets measured.
            </p>
          </div>
        </li>
        <li>
          <span className="paris-intro__num">3</span>
          <div>
            <strong>Watch this page change</strong>
            <p>
              Your answers become evidence against fifteen competencies. Below a floor of five
              records nothing is scored at all — &ldquo;not enough evidence&rdquo; is a real state
              here, not a blank.
            </p>
          </div>
        </li>
      </ol>

      <p className="paris-intro__foot">
        The lower half of this page turns the same discipline on the site itself: every figure the
        portfolio publishes, and the records behind it. That is where the publications count reads{' '}
        <strong>55 of 170 claimed</strong> — a real gap, surfaced rather than hidden.
      </p>
    </section>
  );
}
