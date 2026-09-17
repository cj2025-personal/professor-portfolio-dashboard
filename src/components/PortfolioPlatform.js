import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import useArchivynContent from '../lib/useArchivynContent';

// `className` lets a caller scope its own skin onto this markup. The states a
// demo video can be in (no source yet, embed, file, failed) are fiddly enough
// that the Proj Arch hero should share this one implementation rather than
// grow a second copy of them.
export function DemoVideo({ video, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!video) return null;

  return (
    <figure className={`portfolio-platform__demo ${className}`.trim()}>
      <div className="portfolio-platform__video">
        {!video.src || failed ? <div className="portfolio-platform__video-placeholder">
          <VideoCameraIcon aria-hidden="true" />
          <p>{failed ? video.unavailableLabel : video.pendingLabel}</p>
        </div> : video.type === 'embed' ? <iframe
          src={video.src}
          title={video.title}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        /> : <video
          src={video.src}
          poster={video.poster || undefined}
          controls
          playsInline
          preload="metadata"
          aria-label={video.title}
          onError={() => setFailed(true)}
        />}
      </div>
      {video.title && <figcaption>{video.title}</figcaption>}
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
