const fs = require('fs');
const path = require('path');

// Shared helpers for the hand-built Lottie generators in this folder.
// See generate-mission-lottie.cjs for the conventions (bezier paths, rigs,
// easing) they support. createDocument() returns a fresh layer list plus the
// builders bound to it, so one script can write several animations.


// ─── Colour ────────────────────────────────────────────────────────────────
const rgb = hex => {
  const value = hex.replace('#', '');
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255).concat(1);
};

// ─── Easing ────────────────────────────────────────────────────────────────
// A CSS cubic-bezier(x1, y1, x2, y2) is o:{x1,y1} on the outgoing keyframe and
// i:{x2,y2} on the same keyframe (Lottie stores both on the start frame).
const bez = (x1, y1, x2, y2) => ({ o: { x: [x1], y: [y1] }, i: { x: [x2], y: [y2] } });
const E = {
  out: bez(0.22, 1, 0.36, 1),       // ease-out quint: quick start, long settle
  inOut: bez(0.65, 0, 0.35, 1),     // ease-in-out cubic
  in: bez(0.5, 0, 0.75, 0.2),       // ease-in for departures
  soft: bez(0.45, 0, 0.55, 1),      // gentle sine-like, for idle loops
  linear: bez(0.33, 0.33, 0.67, 0.67),
};

// Keyframes: [time, value, easingOrHold, spatialTangents?]
//   easing: one of E.*; 'hold' freezes until the next key.
//   spatial: { to: [dx, dy], ti: [dx, dy] } bends a position move into an arc.
const animated = frames => ({
  a: 1,
  k: frames.map(([t, value, easing = E.inOut, spatial], index) => {
    const frame = { t, s: Array.isArray(value) ? value : [value] };
    if (index < frames.length - 1) {
      if (easing === 'hold') frame.h = 1;
      else Object.assign(frame, easing);
      if (spatial) {
        frame.to = spatial.to.concat(0);
        frame.ti = spatial.ti.concat(0);
      }
    }
    return frame;
  }),
});
const isKeyed = value => Array.isArray(value) && Array.isArray(value[0]);
const prop = (value, dims) => (isKeyed(value) ? animated(value) : { a: 0, k: value });
const fixed = value => ({ a: 0, k: value });

// ─── Geometry ──────────────────────────────────────────────────────────────
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = a => Math.hypot(a[0], a[1]);
const unit = a => mul(a, 1 / (len(a) || 1));
const perp = a => [-a[1], a[0]];
const KAPPA = 0.5523;

// Explicit bezier path: vertices [{ v, i, o }], tangents relative to vertex.
const bezierPath = (vertices, closed = true) => ({
  ty: 'sh', d: 1, nm: 'path', ks: fixed({
    c: closed,
    v: vertices.map(p => p.v),
    i: vertices.map(p => p.i || [0, 0]),
    o: vertices.map(p => p.o || [0, 0]),
  }),
});

// Catmull-Rom smoothing: a list of [x, y] (optionally [x, y, smoothness]
// where 0 is a sharp corner and 1 is fully smooth) becomes a flowing curve.
const smooth = (points, closed = true, tension = 1) => {
  const n = points.length;
  const vertices = points.map((point, k) => {
    const [x, y, s = 1] = point;
    const prev = closed ? points[(k - 1 + n) % n] : points[Math.max(0, k - 1)];
    const next = closed ? points[(k + 1) % n] : points[Math.min(n - 1, k + 1)];
    const d = mul(sub([next[0], next[1]], [prev[0], prev[1]]), (tension * s) / 6);
    return { v: [x, y], o: d, i: mul(d, -1) };
  });
  return bezierPath(vertices, closed);
};

// A tapered limb from A to B with round caps: width wA at A and wB at B.
const limb = (A, B, wA, wB) => {
  const dir = unit(sub(B, A));
  const n = perp(dir);
  const rA = wA / 2;
  const rB = wB / 2;
  const kA = KAPPA * rA;
  const kB = KAPPA * rB;
  return bezierPath([
    { v: add(A, mul(n, rA)), i: mul(dir, -kA), o: [0, 0] },
    { v: add(B, mul(n, rB)), i: [0, 0], o: mul(dir, kB) },
    { v: add(B, mul(dir, rB)), i: mul(n, kB), o: mul(n, -kB) },
    { v: sub(B, mul(n, rB)), i: mul(dir, kB), o: [0, 0] },
    { v: sub(A, mul(n, rA)), i: [0, 0], o: mul(dir, -kA) },
    { v: sub(A, mul(dir, rA)), i: mul(n, -kA), o: mul(n, kA) },
  ], true);
};

// An open stroke through points with bezier smoothing (for smiles, brows).
const curve = (points, tension = 1) => smooth(points, false, tension);

const rect = (x, y, w, h, radius = 0) => ({ ty: 'rc', d: 1, p: fixed([x, y]), s: fixed([w, h]), r: fixed(radius) });
const ellipse = (x, y, w, h = w) => ({ ty: 'el', d: 1, p: fixed([x, y]), s: fixed([w, h]) });
const polygon = (points, closed = true) => bezierPath(points.map(v => ({ v })), closed);

// An n-point star: outer radius R, inner radius r, with softly curved sides.
const star = (points, R, r) => {
  const verts = [];
  for (let k = 0; k < points * 2; k += 1) {
    const angle = -Math.PI / 2 + (k * Math.PI) / points;
    const radius = k % 2 === 0 ? R : r;
    verts.push({ v: [Math.cos(angle) * radius, Math.sin(angle) * radius] });
  }
  return bezierPath(verts, true);
};

// A crescent of shadow along the back edge of a smooth shape: takes the
// points between index a and b of the outline plus an inner arc moved toward
// the centre by `depth`, so the shade hugs the silhouette exactly.
const crescent = (points, a, b, centre, depth) => {
  const edge = [];
  for (let k = a; k <= b; k += 1) edge.push(points[k % points.length]);
  const inner = edge.slice().reverse().map(([x, y]) => {
    const toCentre = unit(sub(centre, [x, y]));
    return add([x, y], mul(toCentre, depth));
  });
  // The two end points meet the outline sharply so the crescent tapers.
  const outline = edge.map(([x, y], k) => (k === 0 || k === edge.length - 1 ? [x, y, 0.35] : [x, y]));
  const innerSoft = inner.map(([x, y], k) => (k === 0 || k === inner.length - 1 ? [x, y, 0.35] : [x, y]));
  return smooth(outline.concat(innerSoft), true);
};

// ─── Lottie plumbing ───────────────────────────────────────────────────────
const transform = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({
  ty: 'tr', p: prop(p), a: fixed(a), s: prop(s), r: prop(r), o: prop(o), sk: fixed(0), sa: fixed(0),
});
const layerTransform = ({ p = [0, 0, 0], a = [0, 0, 0], s = [100, 100, 100], r = 0, o = 100 } = {}) => ({
  o: prop(o), r: prop(r), p: prop(p), a: fixed(a), s: prop(s),
});

// group(name, geometry | [geometries], style): one fill/stroke applied to
// all the geometry. Shapes listed later paint on top, as in a drawing.
// `trim` = { s, e } (0–100, fixed or keyframed) draws only part of the path,
// which is how a line is made to draw itself on.
const group = (name, geometry, { fill, stroke, width = 2, opacity = 100, dash, cap = 2, trim, transform: tr } = {}) => {
  const items = (Array.isArray(geometry) ? geometry : [geometry]).slice();
  if (trim) items.push({ ty: 'tm', s: prop(trim.s), e: prop(trim.e), o: fixed(0), m: 1 });
  if (fill) items.push({ ty: 'fl', c: fixed(rgb(fill)), o: prop(opacity), r: 1 });
  if (stroke) {
    const st = { ty: 'st', c: fixed(rgb(stroke)), o: prop(opacity), w: fixed(width), lc: cap, lj: 2, ml: 4 };
    if (dash) st.d = [{ n: 'd', nm: 'dash', v: fixed(dash[0]) }, { n: 'g', nm: 'gap', v: fixed(dash[1]) }];
    items.push(st);
  }
  items.push(transform(tr));
  return { ty: 'gr', nm: name, it: items };
};

// createDocument({ w, h, fps, end, name, markers }) → { layer, oscillate, blink, write }
//   layer(name, shapes drawn back to front, transform, { parent })
const createDocument = ({ w, h, fps = 30, end, name, markers = [] }) => {
  const layers = [];
  let nextIndex = 1;
  const layer = (nm, shapes, tr = {}, { parent } = {}) => {
    const item = {
      ddd: 0, ind: nextIndex++, ty: 4, nm, sr: 1, ao: 0, bm: 0,
      ks: layerTransform(tr), shapes: shapes.slice().reverse(), ip: 0, op: end, st: 0,
    };
    if (parent) item.parent = parent.ind;
    layers.push(item);
    return item;
  };
  // A steady idle oscillation, e.g. breathing. `period` must divide `end` so
  // the value at the last frame equals the first and the loop stays seamless.
  const oscillate = (from, to, period, phase = 0) => {
    const half = period / 2;
    const frames = [];
    for (let k = 0; k * half <= end + 0.001; k += 1) {
      frames.push([Math.round(k * half * 100) / 100, (k + phase) % 2 === 0 ? from : to, E.soft]);
    }
    return frames;
  };
  // Eye blink: scale-y collapses briefly at each listed frame.
  const blink = times => {
    const frames = [[0, [100, 100], 'hold']];
    times.forEach(t => frames.push([t, [100, 100], E.in], [t + 3, [100, 8], E.out], [t + 6, [100, 100], 'hold']));
    frames.push([end, [100, 100]]);
    return frames;
  };
  const write = destination => {
    const animation = {
      v: '5.12.2', fr: fps, ip: 0, op: end, w, h, nm: name, ddd: 0,
      assets: [], layers: layers.slice().reverse(), markers,
    };
    fs.writeFileSync(destination, JSON.stringify(animation));
    return `${path.basename(destination)} (${layers.length} layers, ${(fs.statSync(destination).size / 1024).toFixed(1)} kB)`;
  };
  return { layer, oscillate, blink, write, layers };
};

// Every character part is expressed relative to the character's floor point.
const at = (origin, [x, y]) => [origin[0] + x, origin[1] + y];


module.exports = {
  rgb, bez, E, animated, prop, fixed, add, sub, mul, len, unit, perp, KAPPA,
  bezierPath, smooth, limb, curve, rect, ellipse, polygon, star, crescent,
  transform, layerTransform, group, createDocument, at,
};
