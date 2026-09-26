import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { ArrowsPointingOutIcon, PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/20/solid';
import useArchivynContent from '../lib/useArchivynContent';

// Browsers only autoplay muted video. Visitors who asked for less motion or
// less data get the poster and a play button instead.
function mayAutoplay() {
  if (typeof window === 'undefined') return false;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return !reducedMotion && !navigator.connection?.saveData;
}

// Plays while it is on screen rather than from page load: on the home page
// the player sits below the fold, and would be half over before anyone
// scrolled to it. A visitor who pauses it stays paused.
function DemoPlayer({ video, onError }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const wantsPlay = useRef(mayAutoplay());
  const pausedOffscreen = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    el.muted = true;
    const play = () => { if (wantsPlay.current && el.paused) el.play().catch(() => {}); };
    if (!('IntersectionObserver' in window)) { play(); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
      else if (!el.paused) { pausedOffscreen.current = true; el.pause(); }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Inline, the player shows its own three buttons. Full screen hands over to
  // the browser's controls, which can also seek.
  useEffect(() => {
    const el = videoRef.current;
    const sync = () => { el.controls = document.fullscreenElement === el; };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  // Written straight to the element each frame: timeupdate fires about four
  // times a second, which makes a visibly stepping bar.
  useEffect(() => {
    if (!playing) return undefined;
    let frame;
    const tick = () => {
      const el = videoRef.current;
      if (el.duration) progressRef.current.style.transform = `scaleX(${el.currentTime / el.duration})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  const toggleSound = () => {
    const el = videoRef.current;
    el.muted = !el.muted;
    if (!el.muted && el.paused) el.play().catch(() => {});
  };
  const enterFullscreen = () => {
    const el = videoRef.current;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
  };

  // The buttons are a sibling of the frame, not inside it: over the picture
  // on wide screens, beneath it on phones, where they would cover the film.
  return (
    <>
      <div className="portfolio-platform__video">
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster || undefined}
          loop
          playsInline
          preload="metadata"
          aria-label={video.title}
          onClick={togglePlay}
          onPlay={() => { wantsPlay.current = true; setPlaying(true); }}
          onPause={() => {
            setPlaying(false);
            if (pausedOffscreen.current) pausedOffscreen.current = false;
            else wantsPlay.current = false;
          }}
          onVolumeChange={event => setMuted(event.currentTarget.muted)}
          onError={onError}
        />
        <span className="portfolio-platform__progress" aria-hidden="true"><span ref={progressRef} /></span>
      </div>
      <div className="portfolio-platform__controls">
        <button type="button" className={playing ? '' : 'is-primary'} onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
        </button>
        <button type="button" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
          {muted ? <SpeakerXMarkIcon aria-hidden="true" /> : <SpeakerWaveIcon aria-hidden="true" />}
        </button>
        <button type="button" onClick={enterFullscreen} aria-label="Watch full screen">
          <ArrowsPointingOutIcon aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

// `className` lets a caller scope its own skin onto this markup. The states a
// demo video can be in (no source yet, embed, file, failed) are fiddly enough
// that the Proj Arch hero should share this one implementation rather than
// grow a second copy of them.
export function DemoVideo({ video, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!video) return null;

  return (
    <figure className={`portfolio-platform__demo ${className}`.trim()}>
      {video.src && !failed && video.type !== 'embed'
        ? <DemoPlayer video={video} onError={() => setFailed(true)} />
        : <div className="portfolio-platform__video">
          {!video.src || failed ? <div className="portfolio-platform__video-placeholder">
            <VideoCameraIcon aria-hidden="true" />
            <p>{failed ? video.unavailableLabel : video.pendingLabel}</p>
          </div> : <iframe
            src={video.src}
            title={video.title}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />}
        </div>}
    </figure>
  );
}

export default function PortfolioPlatform() {
  const { content } = useArchivynContent();
  if (!content?.summary) return null;

  return (
    <section id="portfolio-platform" className="portfolio-platform" aria-labelledby="portfolio-platform-title">
      <div className="ark-container">
        <div className="portfolio-platform__inner">
          <div className="portfolio-platform__copy">
            {content.summary.eyebrow && <p className="sec-eyebrow">{content.summary.eyebrow}</p>}
            <h2 id="portfolio-platform-title">{content.summary.title}</h2>
            <p>{content.summary.description}</p>
            <Link to="/proj-arch" className="portfolio-platform__link">
              {content.summary.linkLabel}<ArrowUpRightIcon aria-hidden="true" />
            </Link>
          </div>
          <DemoVideo key={content.summary.video?.src} video={content.summary.video} />
        </div>
      </div>
    </section>
  );
}
