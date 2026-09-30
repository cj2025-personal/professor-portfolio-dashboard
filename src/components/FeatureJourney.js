import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import HeroAnimation from './HeroAnimation';

/**
 * The features as a journey: seven stops on one path, from the first
 * question to a deeper understanding.
 *
 * Each stop is a button with the feature's small illustration, its number,
 * the product name and its one-line benefit. The path is drawn beneath the
 * illustrations, and the gold part of it runs up to the active stop. Under
 * the path, one panel carries the active stop's copy, with previous and
 * next controls so the journey can be walked in order.
 *
 * Only the active stop's animation plays; the others hold their rest frame,
 * so a row of seven scenes stays calm. Nothing auto-advances.
 *
 * Below the `narrow` breakpoint the path turns vertical: the stops stack
 * down the left with the active one's copy opening beneath it.
 */
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

const pad = index => String(index + 1).padStart(2, '0');

export default function FeatureJourney({ features }) {
  const [active, setActive] = useState(0);
  const narrow = useMediaQuery(NARROW);
  const tabs = useRef([]);
  const count = features.length;

  const choose = useCallback(index => setActive((index + count) % count), [count]);

  const onKeyDown = event => {
    const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -active, End: count - 1 - active };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (active + moves[event.key] + count) % count;
    choose(next);
    tabs.current[next]?.focus();
  };

  const stop = (item, index) => {
    const selected = index === active;
    return <button type="button" role="tab" key={item.label} id={`pa-journey-tab-${index}`}
      ref={node => { tabs.current[index] = node; }}
      className={`pa-journey__stop${selected ? ' is-active' : ''}${index < active ? ' is-passed' : ''}`}
      style={{ '--i': index }}
      aria-selected={selected} aria-controls={`pa-journey-panel-${index}`} tabIndex={selected ? 0 : -1}
      onClick={() => choose(index)}>
      <span className="pa-journey__scene">
        {item.animation?.src && <HeroAnimation src={item.animation.src} label="" className="pa-journey__art" still={!selected} />}
      </span>
      <span className="pa-journey__node" aria-hidden="true" />
      <span className="pa-journey__num" aria-hidden="true">{pad(index)}</span>
      <span className="pa-journey__name">{item.label}</span>
      <span className="pa-journey__benefit">{item.title}</span>
    </button>;
  };

  const panel = index => {
    const item = features[index];
    return <div key={index} className="pa-journey__panel" role="tabpanel" id={`pa-journey-panel-${index}`}
      aria-labelledby={`pa-journey-tab-${index}`}>
      <p className="pa-journey__copy">{item.description}</p>
      <div className="pa-journey__nav">
        <span className="pa-journey__count">Step {index + 1} of {count}</span>
        <button type="button" className="pa-journey__arrow" aria-label="Previous step" disabled={index === 0}
          onClick={() => { choose(index - 1); tabs.current[index - 1]?.focus(); }}>
          <ChevronLeftIcon aria-hidden="true" />
        </button>
        <button type="button" className="pa-journey__arrow" aria-label="Next step" disabled={index === count - 1}
          onClick={() => { choose(index + 1); tabs.current[index + 1]?.focus(); }}>
          <ChevronRightIcon aria-hidden="true" />
        </button>
      </div>
    </div>;
  };

  if (narrow) {
    return <div className="pa-journey pa-journey--vertical">
      <div className="pa-journey__stops" role="tablist" aria-orientation="vertical" aria-label="The learning journey" onKeyDown={onKeyDown}>
        {features.map((item, index) => <React.Fragment key={item.label}>
          {stop(item, index)}
          {index === active && panel(index)}
        </React.Fragment>)}
      </div>
    </div>;
  }

  // The path is drawn by each stop's node (see the stylesheet): the segments
  // up to the active stop are gold, the rest hairline.
  return <div className="pa-journey" style={{ '--count': count }}>
    <div className="pa-journey__stops" role="tablist" aria-label="The learning journey" onKeyDown={onKeyDown}>
      {features.map(stop)}
    </div>
    <div className="pa-journey__detail">
      <span className="pa-journey__caret" aria-hidden="true" style={{ gridColumn: active + 1 }} />
      {panel(active)}
    </div>
  </div>;
}
