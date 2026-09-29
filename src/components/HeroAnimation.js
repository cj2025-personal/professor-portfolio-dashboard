import React, { useEffect, useRef } from 'react';

// A Lottie that floats in a page header. lottie-web's light build (SVG only,
// no expression engine) is loaded on demand, so it stays out of the main
// bundle. It plays while on screen and pauses off it. Visitors who asked for
// less motion get one still frame: the one the animation marks "rest".
export default function HeroAnimation({ src, label }) {
  const box = useRef(null);

  useEffect(() => {
    let animation;
    let observer;
    let cancelled = false;
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
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        const rest = data.markers?.find(marker => marker.cm === 'rest');
        animation.goToAndStop(rest ? rest.tm : 0, true);
        return;
      }
      if (!('IntersectionObserver' in window)) {
        animation.play();
        return;
      }
      observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? animation.play() : animation.pause()));
      observer.observe(box.current);
    }).catch(() => {});
    return () => {
      cancelled = true;
      observer?.disconnect();
      animation?.destroy();
    };
  }, [src]);

  return <div ref={box} className="pa-hero__art" role="img" aria-label={label} />;
}
