import React, { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from '@heroicons/react/20/solid';

// A Lottie that floats in a page header. lottie-web's light build (SVG only,
// no expression engine) is loaded on demand, so it stays out of the main
// bundle. It plays while on screen and pauses off it. Visitors who asked for
// less motion get one still frame: the one the animation marks "rest".
export default function HeroAnimation({ src, label }) {
  const box = useRef(null);
  const animationRef = useRef(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

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
      animationRef.current = animation;
      setReady(true);
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        const rest = data.markers?.find(marker => marker.cm === 'rest');
        animation.goToAndStop(rest ? rest.tm : 0, true);
        userPaused.current = true;
        return;
      }
      if (!('IntersectionObserver' in window)) {
        animation.play();
        setPlaying(true);
        return;
      }
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          animation.play();
          setPlaying(true);
        } else {
          animation.pause();
          setPlaying(false);
        }
      });
      observer.observe(box.current);
    }).catch(() => {});
    return () => {
      cancelled = true;
      observer?.disconnect();
      animation?.destroy();
      animationRef.current = null;
    };
  }, [src]);

  const togglePlayback = () => {
    const animation = animationRef.current;
    if (!animation) return;
    if (playing) {
      userPaused.current = true;
      animation.pause();
      setPlaying(false);
    } else {
      userPaused.current = false;
      animation.play();
      setPlaying(true);
    }
  };

  return <div className="pa-hero__animation">
    <div ref={box} className="pa-hero__art" role="img" aria-label={label} />
    <button
      type="button"
      className="pa-hero__animation-control"
      onClick={togglePlayback}
      disabled={!ready}
      aria-label={playing ? 'Pause animation' : 'Play animation'}
      title={playing ? 'Pause animation' : 'Play animation'}
    >
      {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
    </button>
  </div>;
}
