import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * A horizontal rail of cards with real controls.
 *
 * The viewport is a native scroll container, so touch swipes, trackpads and
 * keyboard arrows (the viewport is focusable) all work without script. On top
 * of that: arrow buttons step one card at a time, a mouse can drag the track,
 * and both edges fade.
 *
 * `auto` turns on a slow continuous drift, for a marquee such as the
 * university rail. The children are rendered twice and the scroll position
 * wraps at the seam, so the drift never ends. It pauses while the pointer is
 * over the rail, while anything inside has focus, and for the few seconds
 * after an arrow press, and it never runs for visitors who prefer reduced
 * motion. Without `auto` the rail sits still until the visitor moves it, and
 * the cards snap into place.
 */
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const gapOf = track => parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
// In auto mode the content is doubled, so one "lap" is half the track.
const lapOf = track => (track.scrollWidth + gapOf(track)) / 2;

export default function Rail({ label, auto = false, speed = 36, className = '', children }) {
  const viewport = useRef(null);
  const track = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const paused = useRef(false);
  const holdUntil = useRef(0);
  const drag = useRef(null);

  const updateEdges = useCallback(() => {
    const el = viewport.current;
    if (!el || auto) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, [auto]);

  useEffect(() => {
    updateEdges();
    const el = viewport.current;
    const onResize = () => updateEdges();
    window.addEventListener('resize', onResize);
    el.addEventListener('scroll', updateEdges, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      el.removeEventListener('scroll', updateEdges);
    };
  }, [updateEdges]);

  // The drift.
  useEffect(() => {
    if (!auto || reducedMotion()) return undefined;
    const el = viewport.current;
    let frame;
    let last = performance.now();
    const tick = now => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (!paused.current && now > holdUntil.current && !drag.current) {
        el.scrollLeft += speed * dt;
      }
      const seam = lapOf(track.current);
      if (el.scrollLeft >= seam) el.scrollLeft -= seam;
      else if (el.scrollLeft < 0) el.scrollLeft += seam;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [auto, speed]);

  const step = direction => {
    const el = viewport.current;
    const card = track.current.querySelector(':scope > li, :scope > * > li');
    const amount = (card ? card.offsetWidth : el.clientWidth * 0.8) + gapOf(track.current);
    holdUntil.current = performance.now() + 4000;
    el.scrollBy({ left: direction * amount, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  // Mouse drag. Touch and pen keep the browser's own panning.
  const onPointerDown = event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const el = viewport.current;
    drag.current = { x: event.clientX, left: el.scrollLeft, moved: false };
    el.setPointerCapture(event.pointerId);
  };
  const onPointerMove = event => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    if (drag.current.moved) {
      viewport.current.classList.add('is-dragging');
      viewport.current.scrollLeft = drag.current.left - dx;
    }
  };
  const endDrag = event => {
    if (!drag.current) return;
    const el = viewport.current;
    if (el.hasPointerCapture?.(event.pointerId)) el.releasePointerCapture(event.pointerId);
    if (drag.current.moved) holdUntil.current = performance.now() + 4000;
    drag.current = null;
    // Leave the class for a tick so the click that ends a drag is swallowed.
    setTimeout(() => el.classList.remove('is-dragging'), 0);
  };
  const onClickCapture = event => {
    if (viewport.current.classList.contains('is-dragging')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return <div className={`pa-rail${auto ? ' pa-rail--auto' : ''} ${className}`.trim()}
    onPointerEnter={() => { paused.current = true; }}
    onPointerLeave={() => { paused.current = false; }}
    onFocus={() => { paused.current = true; }}
    onBlur={() => { paused.current = false; }}>
    <button type="button" className="pa-rail__arrow pa-rail__arrow--prev" aria-label="Previous"
      onClick={() => step(-1)} disabled={!auto && atStart}>
      <ChevronLeftIcon aria-hidden="true" />
    </button>
    <div ref={viewport} className="pa-rail__viewport" role="region" aria-label={label} tabIndex={0}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag}
      onPointerCancel={endDrag} onClickCapture={onClickCapture}>
      <div ref={track} className="pa-rail__track">
        <ul className="pa-rail__group">{children}</ul>
        {auto && <ul className="pa-rail__group" aria-hidden="true">{children}</ul>}
      </div>
    </div>
    <button type="button" className="pa-rail__arrow pa-rail__arrow--next" aria-label="Next"
      onClick={() => step(1)} disabled={!auto && atEnd}>
      <ChevronRightIcon aria-hidden="true" />
    </button>
  </div>;
}
