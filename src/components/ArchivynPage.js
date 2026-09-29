import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, ArrowDownRightIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon, UsersIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import useArchivynContent from '../lib/useArchivynContent';
import { useScholar } from '../lib/useScholar';
import { DemoVideo } from './PortfolioPlatform';
import HeroAnimation from './HeroAnimation';
import Rail from './Rail';
import { initials } from './ArchivynDemos';
import UNIVERSITIES from '../lib/universities';
import '../styles/proj-arch.css';
import '../styles/proj-arch-demos.css';

const icons = { scholar: AcademicCapIcon, explanation: SparklesIcon, reading: BookOpenIcon, community: UsersIcon };
const ProjectIcon = ({ name }) => {
  const Icon = icons[name] || BookOpenIcon;
  return <Icon aria-hidden="true" />;
};

// The audience list is copy-only; the icons are presentation, matched to the
// order the four groups are written in.
const AUDIENCE_ICONS = ['reading', 'scholar', 'community', 'explanation'];
const pad = index => String(index + 1).padStart(2, '0');

// The initial Big Ten rollout visual. A university's official logo appears
// only once its brand office has given written permission and supplied the
// file, which is then hosted here; until then the card shows the typographic
// monogram and the name. The manifest in lib/universities.js records each
// school's state, and docs/university-marks.md describes the request. Marks
// are used nominatively, never to suggest affiliation; the note under the
// rail says so. The B1G wordmark in public/images/big-ten.svg is the
// text-only conference logo (below the threshold of originality for
// copyright, trademark rights untouched), in its official colours, unaltered.
function UniversityMark({ university }) {
  return <li className="pa-university" title={university.fullName}>
    <span className="pa-university__mark" aria-hidden="true">
      <span>{university.mark}</span>
      {university.permission === 'granted' && university.logo && <img src={university.logo}
        alt="" width="64" height="64" decoding="async" loading="lazy"
        onError={event => event.currentTarget.classList.add('is-unavailable')} />}
    </span>
    <span className="pa-university__name">{university.name}</span>
  </li>;
}

function UniversityRail() {
  return <div className="pa-universities">
    {/* The conference wordmark stands in for the words "Big Ten". It is used
        nominatively, to name the conference, and unaltered: the SVG is the
        text-only mark (below the threshold of originality, so public domain
        as artwork) and the trademark note beneath the rail disclaims any
        affiliation. Alt text keeps the heading readable as "Big Ten". */}
    <h2 className="pa-display pa-universities__title">
      Starting with <img className="pa-universities__logo" src="/images/big-ten.svg" alt="Big Ten" width="444" height="169" decoding="async" /> universities
      {/* The trademark notice lives in a tooltip on this icon. It is a button
          so keyboards and touch can open it, and aria-describedby hands the
          text to screen readers whether or not the tooltip is visible. */}
      <span className="pa-universities__info">
        <button type="button" className="pa-universities__info-btn" aria-label="Trademark notice" aria-describedby="pa-universities-note">
          <InformationCircleIcon aria-hidden="true" />
        </button>
        <span role="tooltip" id="pa-universities-note" className="pa-universities__tooltip">
          {UNIVERSITY_NOTE}
        </span>
      </span>
    </h2>
    {/* A slow marquee with real controls: arrows, drag, swipe, keyboard. */}
    <Rail auto label="Big Ten member universities in the initial rollout" className="pa-universities__rail">
      {UNIVERSITIES.map(university => <UniversityMark key={university.name} university={university} />)}
    </Rail>
  </div>;
}
const UNIVERSITY_NOTE = 'Big Ten and the B1G logo are trademarks of the Big Ten Conference, Inc. University names and '
  + 'marks belong to their respective institutions and identify the planned rollout only. Proj Arch is not affiliated '
  + 'with, sponsored by, or endorsed by the Big Ten Conference or these universities.';

// Bands fade up as they enter the viewport. The hidden state lives behind the
// `pa-motion` class, which this hook strips when it cannot animate, so a
// missing IntersectionObserver or a reduced-motion preference leaves every
// band rendered at full opacity instead of blank.
function useReveal(ready) {
  const root = useRef(null);
  useEffect(() => {
    const node = root.current;
    if (!node || !ready) return undefined;
    const targets = node.querySelectorAll('[data-reveal]');
    const canAnimate = 'IntersectionObserver' in window
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!targets.length || !canAnimate) {
      node.classList.remove('pa-motion');
      targets.forEach(target => target.classList.add('is-revealed'));
      return undefined;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [ready]);
  return root;
}

/**
 * The image or demo video that pairs with a section's copy.
 *
 * Driven entirely by `media` in archivyn.json: set `src` and `type`
 * ("image", "video" or "embed") and the slot appears, which also puts that
 * section into its two-column split. With no source it renders nothing, so
 * the page never shows a stand-in for an asset that does not exist yet.
 */
function SectionMedia({ media }) {
  const [failed, setFailed] = useState(false);
  const src = media?.src;
  const type = media?.type || 'image';
  if (!src || failed) return null;

  return <figure className="pa-media pa-split__media" data-reveal style={{ '--pa-delay': '120ms' }}>
    <div className="pa-media__frame">
      {type === 'embed'
        ? <iframe src={src} title={media.caption || media.alt || ''} loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        : type === 'video'
          ? <video src={src} poster={media.poster || undefined} controls playsInline
            preload="metadata" aria-label={media.caption || media.alt || ''}
            onError={() => setFailed(true)} />
          : <img src={src} alt={media.alt || ''} loading="lazy" onError={() => setFailed(true)} />}
    </div>
    {media?.caption && <figcaption>{media.caption}</figcaption>}
  </figure>;
}

// Each card carries the spot illustration named by `animation` in the content
// file, falling back to the plain icon when a feature has no miniature yet.
function Feature({ feature, index }) {
  return <li className="pa-feature">
    <p className="pa-feature__num">{pad(index)}</p>
    {feature.animation?.src
      ? <HeroAnimation src={feature.animation.src} label={feature.animation.label} className="pa-feature__art" />
      : <span className="pa-feature__icon"><ProjectIcon name={feature.icon} /></span>}
    <h3 className="pa-card-title">{feature.title}</h3>
    <p className="pa-feature__copy">{feature.description}</p>
    <p className="pa-feature__label">{feature.label}</p>
  </li>;
}

export default function ArchivynPage() {
  const { content, loading } = useArchivynContent();
  const { scholar } = useScholar();
  const page = content?.page;
  const root = useReveal(Boolean(page));
  if (!page) return <div className="resource-page"><div className="ark-container"><p role="status">{loading ? 'Loading…' : 'This page is currently unavailable.'}</p><Link to="/">Back to portfolio</Link></div></div>;

  // The header has its own animation; the home page's demo stands in without one.
  const art = page.heroAnimation?.src ? page.heroAnimation : null;
  const video = art ? null : content.summary?.video;
  const hasMedia = key => Boolean(page[key]?.media?.src);
  const media = key => <SectionMedia media={page[key]?.media} />;
  const projectSections = [
    ['project-mission', 'Purpose'],
    ['project-product', 'Platform'],
    ['project-audience', 'Audience'],
    ['project-rollout', 'Rollout'],
    ['project-team', 'Team'],
  ];
  // Only a section with an asset splits into two columns; the rest run full
  // width rather than reserving an empty half.
  const split = (key, reverse) => 'ark-container'
    + (hasMedia(key) ? ` pa-split${reverse ? ' pa-split--reverse' : ''}` : '');

  return <article id="project-top" ref={root} className="proj-arch-page pa-motion">
    <header className="pa-band pa-band--tint pa-hero">
      <div className={`ark-container pa-hero__inner${art || video?.src ? '' : ' pa-hero__inner--solo'}`}>
        <div className="pa-hero__copy" data-reveal>
          <h1 className="pa-hero__title">{content.brand}</h1>
          <p className="pa-subheading pa-hero__tagline">{page.tagline}</p>
          <p className="pa-hero__lead">{page.description}</p>
          {/* One action here. The header already offers "Get in touch" and the
              closing band repeats the contact call, so the hero only points
              the reader into the page. */}
          <div className="pa-hero__actions">
            <a href="#project-product" className="pa-btn pa-btn--primary">{page.product.eyebrow}<ArrowDownRightIcon aria-hidden="true" /></a>
          </div>
        </div>
        {art && <div className="pa-hero__media" data-reveal style={{ '--pa-delay': '140ms' }}>
          <HeroAnimation src={art.src} label={art.label} />
        </div>}
        {/* Keyed on src so a new source clears DemoVideo's failed state. */}
        {video?.src && <div className="pa-hero__media" data-reveal style={{ '--pa-delay': '140ms' }}>
          <DemoVideo key={video.src} video={video} className="pa-demo" />
        </div>}
      </div>
    </header>

    <nav className="pa-project-nav" aria-label="Proj Arch sections">
      <div className="ark-container pa-project-nav__inner">
        <p><span aria-hidden="true">01</span> Project index</p>
        <div>
          {projectSections.map(([href, label]) => <a key={href} href={`#${href}`}>{label}</a>)}
        </div>
      </div>
    </nav>

    {/* From here each band is a two-column split that flips side by side:
        copy left, then copy right, then left again. `--reverse` reorders the
        columns visually and the DOM keeps copy first, so a narrow screen and
        a screen reader both get the text before its image. */}
    <section id="project-mission" className="pa-band pa-band--paper" aria-labelledby="pa-mission-title">
      <div className="ark-container pa-split">
        <div className="pa-split__text" data-reveal>
          <p className="pa-kicker">{page.mission.eyebrow}</p>
          <h2 id="pa-mission-title" className="pa-display">{page.mission.title}</h2>
          <p className="pa-lead">{page.mission.description}</p>
          <figure className="pa-goal">
            <figcaption className="pa-goal__label">{page.mission.goalLabel}</figcaption>
            <blockquote>{page.mission.goal}</blockquote>
          </figure>
        </div>
        {page.mission.animation && <div className="pa-mission-art" data-reveal style={{ '--pa-delay': '80ms' }}>
          <HeroAnimation src={page.mission.animation.src} label={page.mission.animation.label}
            className="pa-mission-animation" />
        </div>}
      </div>
    </section>

    <section id="project-product" className="pa-band pa-band--tint" aria-labelledby="pa-product-title">
      <div className="ark-container">
        <div className={hasMedia('product') ? 'pa-split pa-split--reverse' : ''}>
          <div className="pa-split__text" data-reveal>
            <p className="pa-kicker">{page.product.eyebrow}</p>
            <h2 id="pa-product-title" className="pa-display">{page.product.title}</h2>
            {page.product.description && <p className="pa-lead">{page.product.description}</p>}
          </div>
          {media('product')}
        </div>
        {/* The cards sit still on a rail beneath the split until the reader
            moves them: arrows step one card, the mouse drags, touch swipes,
            and the cards snap into place. */}
        <div className="pa-features pa-split__below" data-reveal style={{ '--pa-delay': '80ms' }}>
          <Rail label="Connected product experiences" className="pa-features__rail">
            {page.features.map((feature, index) => <Feature key={feature.label} feature={feature} index={index} />)}
          </Rail>
        </div>
      </div>
    </section>

    <section id="project-audience" className="pa-band pa-band--tint" aria-labelledby="pa-audience-title">
      <div className={split('audience', true)}>
        <div className="pa-split__text" data-reveal>
          <p className="pa-kicker">{page.audience.eyebrow}</p>
          <h2 id="pa-audience-title" className="pa-display">{page.audience.title}</h2>
          <div className="pa-audience">
            {page.audience.items.map((item, index) => <article key={item.title}>
              <span className="pa-audience__icon"><ProjectIcon name={AUDIENCE_ICONS[index]} /></span>
              <h3 className="pa-card-title">{item.title}</h3>
              <p className="pa-body">{item.description}</p>
            </article>)}
          </div>
        </div>
        {media('audience')}
      </div>
    </section>

    {page.rollout && <section id="project-rollout" className="pa-band pa-band--paper" aria-label="Big Ten universities">
      <div className="ark-container" data-reveal>
        <UniversityRail />
      </div>
    </section>}

    {/* A roster, not a split: the lead sits on top with their photograph and
        the rest of the team follows beneath. */}
    <section id="project-team" className="pa-band pa-band--tint pa-team" aria-labelledby="pa-team-title">
      <div className="ark-container">
        <div data-reveal>
          <p className="pa-kicker">{page.team.eyebrow}</p>
          <h2 id="pa-team-title" className="pa-display">{page.team.title}</h2>
        </div>
        {/* An org chart rather than a row of cards: the lead on top, a
            connector branching down to the developers. No card grounds, which
            is what left the band mostly empty. */}
        <div className="pa-org" data-reveal style={{ '--pa-delay': '80ms' }}>
          {(page.team.leadName || scholar.name) && <div className="pa-org__lead pa-org__node">
            {page.team.leadPhoto || scholar.photoUrl
              ? <div className="pa-org__portrait pa-org__portrait--lead"><img src={page.team.leadPhoto || scholar.photoUrl} alt={page.team.leadName || scholar.name} loading="lazy" /></div>
              : <span className="pa-org__monogram pa-org__monogram--lead" aria-hidden="true">{initials({ name: page.team.leadName || scholar.name })}</span>}
            <p className="pa-card-title">{page.team.leadName || scholar.name}</p>
            <p className="pa-meta pa-org__role">{page.team.leadRole}</p>
          </div>}
          {page.team.members?.length > 0 && <ul className="pa-org__row">
            {page.team.members.map(member => <li key={member.name} className="pa-org__node">
              {member.photo
                ? <div className="pa-org__portrait pa-org__portrait--member"><img src={member.photo} alt={member.name} width="360" height="360" loading="lazy" /></div>
                : <span className="pa-org__monogram" aria-hidden="true">{initials(member.name)}</span>}
              <p className="pa-card-title">{member.name}</p>
              <p className="pa-meta pa-org__role">{member.role}</p>
            </li>)}
          </ul>}
        </div>
      </div>
    </section>

    <section className="pa-band pa-band--paper pa-closing" aria-labelledby="pa-closing-title">
      <div className="ark-container pa-closing__inner" data-reveal>
        <h2 id="pa-closing-title" className="pa-display">{page.closing.title}</h2>
        {page.closing.description && <p className="pa-lead">{page.closing.description}</p>}
        <div className="pa-hero__actions pa-hero__actions--center">
          <Link to="/" className="pa-btn pa-btn--primary">{page.closing.portfolioLabel}<ArrowUpRightIcon aria-hidden="true" /></Link>
          <Link to="/#contact" className="pa-btn pa-btn--secondary">{page.closing.contactLabel}</Link>
        </div>
      </div>
    </section>

    <footer className="pa-footer">
      <div className="ark-container pa-footer__inner">
        <p className="pa-footer__brand"><strong>{content.brand}</strong><span>{page.tagline}</span></p>
        <a href="#project-top">{page.topLabel}<ArrowUpRightIcon aria-hidden="true" /></a>
      </div>
    </footer>
  </article>;
}
