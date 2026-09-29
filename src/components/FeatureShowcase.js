import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeroAnimation from './HeroAnimation';

/**
 * A product tour: a list of features on the left, one stage on the right.
 *
 * The list is a tablist; each row names the product surface and its
 * one-line benefit. The stage shows the active feature's animation large,
 * with its description beneath, so only one paragraph is on screen at a
 * time. Left alone, the tour advances every few seconds with a progress
 * line on the active row; it pauses while the pointer or focus is on it and
 * stops for good once the visitor picks a row. It never auto-advances for
 * visitors who prefer reduced motion.
 *
 * Below the `narrow` breakpoint the same list becomes an accordion: the
 * active row opens with its animation and copy beneath it.
 */
const INTERVAL = 6000;
const NARROW = '(max-width: 860px)';

const useMediaQuery = query => {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const onChange = event => setMatches(event.matches);
    list.addEventListener ? list.addEventListener('change', onChange) : list.addListener(onChange);
    setMatches(list.matches);
    return () => (list.removeEventListener ? list.removeEventListener('change', onChange) : list.removeListener(onChange));
  }, [query]);
  return matches;
};

export default function FeatureShowcase({ features }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(() => !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress line
  const narrow = useMediaQuery(NARROW);
  const tabs = useRef([]);
  const count = features.length;

  // Advance on a timer while running and not paused.
  useEffect(() => {
    if (!auto || paused || narrow) return undefined;
    const timer = setTimeout(() => {
      setActive(index => (index + 1) % count);
      setCycle(c => c + 1);
    }, INTERVAL);
    return () => clearTimeout(timer);
  }, [auto, paused, narrow, active, count]);

  const choose = useCallback(index => {
    setAuto(false);
    setActive(index);
  }, []);

  const onKeyDown = event => {
    const moves = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: -active, End: count - 1 - active };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (active + moves[event.key] + count) % count;
    choose(next);
    tabs.current[next]?.focus();
  };

  const running = auto && !paused && !narrow;
  const feature = features[active];
  const stage = index => {
    const item = features[index];
    return <div key={`${index}-${item.animation?.src}`} className="pa-showcase__panel" role="tabpanel"
      id={`pa-showcase-panel-${index}`} aria-labelledby={`pa-showcase-tab-${index}`}>
      <div className="pa-showcase__scene">
        {item.animation?.src && <HeroAnimation src={item.animation.src} label={item.animation.label} className="pa-showcase__art" />}
      </div>
      {/* No heading here: the active row already carries the name and the
          benefit line, and the panel is labelled by that row. */}
      <p className="pa-showcase__copy">{item.description}</p>
    </div>;
  };

  return <div className={`pa-showcase${narrow ? ' pa-showcase--accordion' : ''}`}
    onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className="pa-showcase__list" role="tablist" aria-orientation="vertical" aria-label="Product experiences" onKeyDown={onKeyDown}>
      {features.map((item, index) => {
        const selected = index === active;
        return <React.Fragment key={item.label}>
          <button type="button" role="tab" id={`pa-showcase-tab-${index}`} ref={node => { tabs.current[index] = node; }}
            className={`pa-showcase__tab${selected ? ' is-active' : ''}${selected && running ? ' is-running' : ''}`}
            aria-selected={selected} aria-controls={`pa-showcase-panel-${index}`} tabIndex={selected ? 0 : -1}
            onClick={() => choose(index)}>
            <span className="pa-showcase__name">{item.label}</span>
            <span className="pa-showcase__benefit">{item.title}</span>
            {selected && running && <span key={cycle} className="pa-showcase__progress" aria-hidden="true" />}
          </button>
          {narrow && selected && stage(index)}
        </React.Fragment>;
      })}
    </div>
    {!narrow && <div className="pa-showcase__stage">{stage(active)}</div>}
    {/* The stage is keyed on the feature so it remounts, which restarts the
        animation from its first frame and re-runs the entrance fade. */}
    <span className="pa-showcase__status" aria-live="polite">{feature.label}: {feature.title}</span>
  </div>;
}
