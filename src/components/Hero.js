import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useScholar, affiliationLine } from '../lib/useScholar';

export default function Hero() {
  const { scholar } = useScholar();
  const reducedMotion = useReducedMotion();
  const [name, ...credentials] = (scholar.name || '').split(',');
  return (
    <section id="home" className="portfolio-hero">
      <div className="ark-container">
        <div className="portfolio-hero__grid">
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <h1 className="hero__name">{name}{credentials.length > 0 && <span className="hero-credentials">{' '}{credentials.join(',').trim()}</span>}</h1>
            {affiliationLine(scholar) && <p className="hero__affil">{affiliationLine(scholar)}</p>}
            <div className="hero-actions"><a href="#blogs" className="btn-primary btn-lg">Read my Substack <ArrowUpRightIcon className="h-4 w-4" /></a><a href="#contact" className="btn-secondary btn-lg">Get in touch</a></div>
            {scholar.researchFocus?.length > 0 && <ul className="hero-topics">{scholar.researchFocus.map(area => <li key={area}>{area}</li>)}</ul>}
          </motion.div>
          <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="portrait-composition">
            <div className="portrait-corner" aria-hidden />
            <div className="portrait-image">{scholar.photoUrl && <img src={scholar.photoUrl} alt={scholar.name} fetchPriority="high" />}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
