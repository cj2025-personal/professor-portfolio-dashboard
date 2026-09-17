import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router does not perform native hash scrolling on client-side
 * navigation, so every `/#section` link — the navbar items when you are off the
 * home route, and the "Back to Teaching" links on the course pages — was
 * landing at the top of the page instead of at its section.
 *
 * A plain route change with no hash resets the scroll position, which the
 * router also does not do on its own.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    const id = decodeURIComponent(hash.slice(1));

    let frame;
    let stopped = false;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth';

    // API responses and images can change the height of sections above the
    // destination after it mounts. Follow those layout changes until the
    // visitor takes control, rather than using an early, stale scroll offset.
    const alignTarget = () => {
      if (stopped) return;
      const el = document.getElementById(id);
      if (el) {
        // Use the section's CSS scroll margin; no content positions are fixed.
        el.scrollIntoView({ behavior, block: 'start' });
      }
    };

    const queueAlignment = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(alignTarget);
    };
    const observer = new ResizeObserver(queueAlignment);
    observer.observe(document.getElementById('main-content') || document.body);

    const stopFollowing = () => {
      stopped = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    const onKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        stopFollowing();
      }
    };
    const inputEvents = ['wheel', 'touchstart', 'pointerdown'];
    inputEvents.forEach((event) => window.addEventListener(event, stopFollowing, { passive: true }));
    window.addEventListener('keydown', onKeyDown);
    queueAlignment();

    return () => {
      stopFollowing();
      inputEvents.forEach((event) => window.removeEventListener(event, stopFollowing));
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pathname, hash]);

  return null;
}
