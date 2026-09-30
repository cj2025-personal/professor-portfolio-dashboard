import React, { useEffect, useRef } from 'react';

// A reusable Lottie illustration. lottie-web's light build (SVG only, no
// expression engine) is loaded on demand, so it stays out of the main bundle.
// It plays while on screen and pauses off it. Visitors who asked for less
// motion get one still frame: the one the animation marks "rest". The same
// still is shown while `still` is true, which lets a row of scenes keep only
// one of them moving.
export default function HeroAnimation({ src, label, className = 'pa-hero__art', still = false }) {
  const box = useRef(null);
  const player = useRef(null);
  const stillRef = useRef(still);
  stillRef.current = still;

  useEffect(() => {
    let animation;
    let observer;
    let cancelled = false;
    let visible = false;
    let restFrame = 0;
    const settle = () => {
      if (!animation) return;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduced || stillRef.current) animation.goToAndStop(restFrame, true);
      else if (visible) animation.play();
      else animation.pause();
    };
    Promise.all([
      import('lottie-web/build/player/lottie_light'),
      fetch(src).then(response => {
        if (!response.ok) throw new Error('Animation unavailable');
        return response.json();
      }),
    ]).then(([{ default: lottie }, data]) => {
      if (cancelled) return;
      animation = lottie.loadAnimation({
        container: box.current,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        animationData: data,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
      });
      restFrame = data.markers?.find(marker => marker.cm === 'rest')?.tm ?? 0;
      player.current = { settle };
      if (!('IntersectionObserver' in window)) {
        visible = true;
        settle();
        return;
      }
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        settle();
      });
      observer.observe(box.current);
    }).catch(() => {});
    return () => {
      cancelled = true;
      observer?.disconnect();
      animation?.destroy();
      player.current = null;
    };
  }, [src]);

  useEffect(() => {
    player.current?.settle();
  }, [still]);

  return <div ref={box} className={className} role={label ? 'img' : 'presentation'} aria-label={label || undefined} aria-hidden={label ? undefined : true} />;
}
