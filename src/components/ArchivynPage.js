import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, ArrowDownRightIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon, UsersIcon } from '@heroicons/react/24/outline';
import useArchivynContent from '../lib/useArchivynContent';
import { useScholar } from '../lib/useScholar';
import { DemoVideo } from './PortfolioPlatform';
import ArchivynDemo, { MissionArch, WorkflowScene, initials } from './ArchivynDemos';
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

// Each card is keyed to one demo in ArchivynDemos by `demo` in the content
// file, falling back to the plain icon when a feature has no miniature yet.
function Feature({ feature, index, variant, delay }) {
  return <article className={`pa-feature${variant ? ` pa-feature--${variant}` : ''}`}
    data-reveal style={delay ? { '--pa-delay': delay } : undefined}>
    <p className="pa-feature__num">{pad(index)}</p>
    {feature.demo
      ? <ArchivynDemo name={feature.demo} />
      : <span className="pa-feature__icon"><ProjectIcon name={feature.icon} /></span>}
    <h3 className="pa-card-title">{feature.title}</h3>
    <p className="pa-feature__copy">{feature.description}</p>
    <p className="pa-feature__label">{feature.label}</p>
  </article>;
}

export default function ArchivynPage() {
  const { content, loading } = useArchivynContent();
  const { scholar } = useScholar();
  const page = content?.page;
  const root = useReveal(Boolean(page));
  if (!page) return <div className="resource-page"><div className="ark-container"><p role="status">{loading ? 'Loading…' : 'This page is currently unavailable.'}</p><Link to="/">Back to portfolio</Link></div></div>;

  const [lead, second, ...rest] = page.features;
  const video = content.summary?.video;
  const hasMedia = key => Boolean(page[key]?.media?.src);
  const media = key => <SectionMedia media={page[key]?.media} />;
  // Only a section with an asset splits into two columns; the rest run full
  // width rather than reserving an empty half.
  const split = (key, reverse) => 'ark-container'
    + (hasMedia(key) ? ` pa-split${reverse ? ' pa-split--reverse' : ''}` : '');

  return <article id="project-top" ref={root} className="proj-arch-page pa-motion">
    <header className="pa-band pa-band--ink pa-hero">
      <span className="pa-glow" aria-hidden="true" />
      <div className={`ark-container pa-hero__inner${video?.src ? '' : ' pa-hero__inner--solo'}`}>
        <div className="pa-hero__copy" data-reveal>
          <h1 className="pa-hero__title">{content.brand}</h1>
          <p className="pa-subheading pa-hero__tagline">{page.tagline}</p>
          <p className="pa-hero__lead">{page.description}</p>
          <div className="pa-hero__actions">
            <a href="#project-product" className="pa-btn pa-btn--gold">{page.product.eyebrow}<ArrowDownRightIcon aria-hidden="true" /></a>
            <Link to="/#contact" className="pa-btn pa-btn--ghost">{page.closing.contactLabel}</Link>
          </div>
        </div>
        {/* Keyed on src so a new source clears DemoVideo's failed state. */}
        {video?.src && <div className="pa-hero__media" data-reveal style={{ '--pa-delay': '140ms' }}>
          <DemoVideo key={video.src} video={video} className="pa-demo" />
        </div>}
      </div>
    </header>

    {/* From here each band is a two-column split that flips side by side:
        copy left, then copy right, then left again. `--reverse` reorders the
        columns visually and the DOM keeps copy first, so a narrow screen and
        a screen reader both get the text before its image. */}
    <section className="pa-band pa-band--paper" aria-labelledby="pa-mission-title">
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
        <MissionArch />
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
        {/* Eight cards need the full container, so the grid runs beneath the
            split instead of inside one of its columns. */}
        <div className="pa-features pa-split__below">
          <Feature feature={lead} index={0} variant="lead" />
          <Feature feature={second} index={1} variant="wide" delay="80ms" />
          {rest.map((feature, index) => <Feature key={feature.label} feature={feature}
            index={index + 2} delay={`${index * 60}ms`} />)}
        </div>
      </div>
    </section>

    <section className="pa-band pa-band--ink pa-flow" aria-labelledby="pa-flow-title">
      <div className={split('workflow')}>
        <div className="pa-split__text" data-reveal>
          <p className="pa-kicker pa-kicker--light">{page.workflow.eyebrow}</p>
          <h2 id="pa-flow-title" className="pa-display">{page.workflow.title}</h2>
          <ol className="pa-flow__steps" data-reveal>
            {page.workflow.steps.map((step, index) => <li key={step.title} style={{ '--pa-cue': `${index * 3}s` }}>
              <span className="pa-flow__node" aria-hidden="true">{pad(index)}</span>
              <h3 className="pa-card-title">{step.title}</h3>
              <p className="pa-body">{step.description}</p>
              <WorkflowScene index={index} />
            </li>)}
          </ol>
        </div>
        {media('workflow')}
      </div>
    </section>

    <section className="pa-band pa-band--paper" aria-labelledby="pa-audience-title">
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

    {page.rollout && <section className="pa-band pa-band--tint" aria-labelledby="pa-rollout-title">
      <div className={split('rollout')}>
        <div className="pa-split__text" data-reveal>
          <p className="pa-kicker">{page.rollout.eyebrow}</p>
          <h2 id="pa-rollout-title" className="pa-display">{page.rollout.title}</h2>
          <p className="pa-lead">{page.rollout.description}</p>
          <ol className="pa-rollout">
            {page.rollout.phases.map(phase => <li key={phase.title} className="pa-rollout__phase">
              <p className="pa-rollout__chip">{phase.label}</p>
              <h3 className="pa-card-title">{phase.title}</h3>
              <p className="pa-body pa-rollout__copy">{phase.description}</p>
            </li>)}
          </ol>
        </div>
        {media('rollout')}
      </div>
    </section>}

    {/* A roster, not a split: the lead sits on top with their photograph and
        the rest of the team follows beneath. */}
    <section className="pa-band pa-band--paper pa-team" aria-labelledby="pa-team-title">
      <div className="ark-container">
        <div data-reveal>
          <p className="pa-kicker">{page.team.eyebrow}</p>
          <h2 id="pa-team-title" className="pa-display">{page.team.title}</h2>
        </div>
        {/* An org chart rather than a row of cards: the lead on top, a
            connector branching down to the developers. No card grounds, which
            is what left the band mostly empty. */}
        <div className="pa-org" data-reveal style={{ '--pa-delay': '80ms' }}>
          {scholar.name && <div className="pa-org__lead pa-org__node">
            {scholar.photoUrl
              ? <div className="pa-org__portrait"><img src={scholar.photoUrl} alt={scholar.name} loading="lazy" /></div>
              : <span className="pa-org__monogram pa-org__monogram--lead" aria-hidden="true">{initials(scholar.name)}</span>}
            <p className="pa-card-title">{scholar.name}</p>
            <p className="pa-meta pa-org__role">{page.team.leadRole}</p>
          </div>}
          {page.team.members?.length > 0 && <ul className="pa-org__row">
            {page.team.members.map(member => <li key={member.name} className="pa-org__node">
              <span className="pa-org__monogram" aria-hidden="true">{initials(member.name)}</span>
              <p className="pa-card-title">{member.name}</p>
              <p className="pa-meta pa-org__role">{member.role}</p>
            </li>)}
          </ul>}
        </div>
      </div>
    </section>

    <section className="pa-band pa-band--ink pa-closing" aria-labelledby="pa-closing-title">
      <span className="pa-glow" aria-hidden="true" />
      <div className="ark-container pa-closing__inner" data-reveal>
        <h2 id="pa-closing-title" className="pa-display">{page.closing.title}</h2>
        {page.closing.description && <p className="pa-lead">{page.closing.description}</p>}
        <div className="pa-hero__actions pa-hero__actions--center">
          <Link to="/" className="pa-btn pa-btn--gold">{page.closing.portfolioLabel}<ArrowUpRightIcon aria-hidden="true" /></Link>
          <Link to="/#contact" className="pa-btn pa-btn--ghost">{page.closing.contactLabel}</Link>
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
