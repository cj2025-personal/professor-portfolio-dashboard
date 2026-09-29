import React from 'react';

/**
 * Animated scenes for the Proj Arch page that are drawn in CSS and SVG: the
 * mission arch and the three workflow scenes. The feature cards use Lottie
 * spot illustrations instead (see scripts/generate-feature-lotties.cjs).
 *
 * Everything here is CSS: no timers, no canvas, no animation library.
 */

// Initials for someone with no photograph. Credentials after a comma are
// dropped first, so "Craig L. Johnson, Ph.D." gives CJ rather than CL.
// Lives here rather than in the page so both the roster and the hero panel
// share one implementation; the page imports it back.
const HONORIFICS = /^(ph|d|dr|prof|mr|ms|mrs|jr|sr|md|phd)$/i;
export function initials(name) {
  const parts = String(name).replace(/,.*$/, '').split(/\s+/)
    .map(word => word.replace(/[^A-Za-z]/g, ''))
    .filter(word => word.length > 1 && !HONORIFICS.test(word));
  if (!parts.length) return String(name).trim().slice(0, 2).toUpperCase();
  const picked = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return picked.map(word => word[0].toUpperCase()).join('');
}

/* ============================================================
   The mission arch.

   Archivyn's mark is an arch and the promise is "from archives to
   you", so the mission section builds one: records stack into the
   pillars, research closes the span, a gold keystone locks it, and the
   passage a learner can actually read appears in the opening the arch
   just made. Concept over decoration — nothing here is a generic
   flourish.
   ============================================================ */
const ARCH = { cx: 170, cy: 176, rOuter: 124, rInner: 64, ground: 254 };
const STONES = 7;
const KEYSTONE = 3;
/* Stones settle from the springing inward, so the keystone lands last. */
const ORDER = [0, 6, 1, 5, 2, 4, 3];

/* The two pillars name what goes in and what comes out. Bottom row first. */
const ARCHIVE = ['Scholars', 'Institutions', 'Publications', 'Citations', 'Research'];
const LEARNER = ['Reading', 'Evidence', 'Explanations', 'Communities', 'Progress'];
const READER_LINES = [104, 86, 68];

/** One voussoir: the annular sector between two angles. */
function voussoir(index) {
  const { cx, cy, rOuter, rInner } = ARCH;
  const step = Math.PI / STONES;
  const a0 = Math.PI - index * step;
  const a1 = a0 - step;
  const at = (angle, r) => [cx + r * Math.cos(angle), cy - r * Math.sin(angle)];
  const [x0, y0] = at(a0, rOuter);
  const [x1, y1] = at(a1, rOuter);
  const [x2, y2] = at(a1, rInner);
  const [x3, y3] = at(a0, rInner);
  const f = n => Math.round(n * 100) / 100;
  return `M${f(x0)} ${f(y0)} A${rOuter} ${rOuter} 0 0 1 ${f(x1)} ${f(y1)} `
    + `L${f(x2)} ${f(y2)} A${rInner} ${rInner} 0 0 0 ${f(x3)} ${f(y3)} Z`;
}

/** A record in a pillar: the block and the word it stands for. */
const Record = ({ x, row, label, side }) => <g className="pa-arch__record" style={{ '--t': row }}>
  <rect x={x} y={ARCH.ground - 14 - row * 16} width="60" height="12" rx="3" />
  <text x={x + 30} y={ARCH.ground - 5.4 - row * 16} className={`pa-arch__word pa-arch__word--${side}`}>{label}</text>
</g>;

export function MissionArch() {
  const { cx, cy, rOuter, rInner, ground } = ARCH;
  const mid = (rOuter + rInner) / 2;
  // The inscription arcs over the extrados rather than through the stones,
  // which is where it used to collide with the keystone label.
  const inscribe = rOuter + 13;
  const span = (deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
  const [sx, sy] = span(172, inscribe);
  const [ex, ey] = span(8, inscribe);

  return <figure className="pa-arch" aria-hidden="true" data-reveal style={{ '--pa-delay': '80ms' }}>
    <svg viewBox="14 12 312 282" role="presentation">
      <defs>
        {/* The mission triad runs along the span itself. */}
        <path id="pa-arch-span" d={`M${sx.toFixed(2)} ${sy.toFixed(2)} A${inscribe} ${inscribe} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`} />
      </defs>

      <line className="pa-arch__ground" x1="30" y1={ground} x2="310" y2={ground} />

      {ARCHIVE.map((label, row) => <Record key={label} x={cx - rOuter} row={row} label={label} side="archive" />)}
      {LEARNER.map((label, row) => <Record key={label} x={cx + rInner} row={row} label={label} side="learner" />)}

      {Array.from({ length: STONES }, (_, i) => <path key={i}
        className={`pa-arch__stone${i === KEYSTONE ? ' pa-arch__stone--key' : ''}`}
        d={voussoir(i)} style={{ '--t': ORDER.indexOf(i) }} />)}

      <text className="pa-arch__span-label">
        <textPath href="#pa-arch-span" startOffset="50%" textAnchor="middle">
          Discovery · Explanation · Participation
        </textPath>
      </text>

      <text className="pa-arch__key-label" x={cx} y={cy - mid + 2}>Veri AI</text>

      {/* What the learner can read, in the opening the arch just made. */}
      {READER_LINES.map((width, index) => <rect key={width} className="pa-arch__read"
        x={cx - width / 2} y={198 + index * 15} width={width} height="7" rx="3.5"
        style={{ '--t': index }} />)}
      <text className="pa-arch__read-label" x={cx} y={ground - 8}>At your reading level</text>

      <text className="pa-arch__foot" x={cx - rOuter + 30} y={ground + 18}>The archive</text>
      <text className="pa-arch__foot" x={cx + rInner + 30} y={ground + 18}>The learner</text>
    </svg>
  </figure>;
}

/* ============================================================
   Workflow scenes.

   Not three separate loops: one nine-second journey shared across the
   three steps. Each scene plays inside its own three-second window,
   the rail between the nodes fills gold at the hand-off, and the node
   lights as its step becomes active — so the section animates the
   sentence "Follow your curiosity. Build your understanding." rather
   than decorating it.

   Scenes map to the copy exactly:
     01 Discover a starting point → search, then a scholar record
     02 Ask and adapt            → a question, reading level, an answer
     03 Practice and participate → mark the evidence, join the discussion
   ============================================================ */
function SceneDiscover() {
  return <div className="pa-sfx__stage">
    <span className="pa-sfx__search"><i className="pa-sfx__caret" /><b className="pa-sfx__query" /></span>
    <span className="pa-sfx__card">
      <i className="pa-sfx__dot" />
      <b><em style={{ '--w': '68%' }} /><em style={{ '--w': '44%' }} /></b>
    </span>
  </div>;
}

function SceneAsk() {
  return <div className="pa-sfx__stage">
    <span className="pa-sfx__ask"><i /><i /><i /></span>
    <span className="pa-sfx__levels"><i className="pa-sfx__thumb" /><b /><b /><b /></span>
    <span className="pa-sfx__reply">
      <em style={{ '--w': '86%', '--t': 0 }} />
      <em style={{ '--w': '62%', '--t': 1 }} />
    </span>
  </div>;
}

function ScenePractice() {
  return <div className="pa-sfx__stage">
    <span className="pa-sfx__text">
      <em style={{ '--w': '92%' }} />
      <em className="pa-sfx__mark" style={{ '--w': '74%' }} />
      <em style={{ '--w': '84%' }} />
    </span>
    <span className="pa-sfx__people">
      {[0, 1, 2].map(i => <i key={i} style={{ '--t': i }} />)}
    </span>
  </div>;
}

const SCENES = [SceneDiscover, SceneAsk, ScenePractice];

export function WorkflowScene({ index }) {
  const Scene = SCENES[index];
  if (!Scene) return null;
  return <div className="pa-sfx" aria-hidden="true" style={{ '--pa-cue': `${index * 3}s` }}>
    <Scene />
  </div>;
}
