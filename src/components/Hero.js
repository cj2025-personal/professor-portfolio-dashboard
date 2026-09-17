import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useScholar, affiliationLine } from '../lib/useScholar';

/**
 * The hero renders from the scholar record, which arrives over the network.
 *
 * `useScholar` has always exposed `loaded`; this component used to ignore it
 * and render the skeleton's empty strings instead, so until the request came
 * back the banner showed a bare pair of buttons on an empty field and read as
 * broken rather than as loading. The placeholders below hold the same space
 * the real content will occupy, so nothing shifts when it arrives.
 */
export default function Hero() {
  const { scholar, loaded } = useScholar();
  const reducedMotion = useReducedMotion();
  const [name, ...credentials] = (scholar.name || '').split(',');
  const affiliation = affiliationLine(scholar);

  return (
    <section id="home" className="portfolio-hero" aria-busy={!loaded}>
      <div className="ark-container">
        <div className="portfolio-hero__grid">
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            {loaded ? (
              <h1 className="hero__name">{name}{credentials.length > 0 && <span className="hero-credentials">{' '}{credentials.join(',').trim()}</span>}</h1>
            ) : (
              <div className="hero__name hero-skel hero-skel--name" aria-hidden />
            )}

            {loaded ? (
              affiliation && <p className="hero__affil">{affiliation}</p>
            ) : (
              <p className="hero__affil hero-skel hero-skel--affil" aria-hidden />
            )}

            <div className="hero-actions"><a href="#blogs" className="btn-primary btn-lg">Read my Substack <ArrowUpRightIcon className="h-4 w-4" /></a><a href="#contact" className="btn-secondary btn-lg">Get in touch</a></div>

            {loaded ? (
              scholar.researchFocus?.length > 0 && <ul className="hero-topics">{scholar.researchFocus.map(area => <li key={area}>{area}</li>)}</ul>
            ) : (
              <ul className="hero-topics" aria-hidden>
                {[92, 116, 140, 104].map((w, i) => <li key={i} className="hero-skel" style={{ width: w }} />)}
              </ul>
            )}
          </motion.div>

          <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="portrait-composition">
            <div className="portrait-corner" aria-hidden />
            {/* width/height give the box an intrinsic ratio so the image cannot
                reflow the hero when it decodes. */}
            <div className={`portrait-image${loaded && scholar.photoUrl ? '' : ' hero-skel'}`}>
              {scholar.photoUrl && (
                <img src={scholar.photoUrl} alt={scholar.name} width="1920" height="1440" fetchPriority="high" decoding="async" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
      {!loaded && <span className="sr-only" role="status">Loading profile</span>}
    </section>
  );
}
