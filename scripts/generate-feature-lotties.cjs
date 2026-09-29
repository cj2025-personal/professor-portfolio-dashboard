// Builds the seven spot illustrations on the Proj Arch feature cards,
// public/media/feature-<name>.json, one per entry in page.features.
//
//   node scripts/generate-feature-lotties.cjs
//
// Each is a 240x160 vignette (shown at 174x116) in the same idiom as the
// mission animation: flat fills, one shade tone per colour for depth, no
// outlines, ease-out travel with small overshoots, and a seamless 6 s loop.
// Nothing here is text, so the artwork needs no fonts and reads at any size.
//
// The scenes reduce the product surface each card describes:
//   directory  a scholar's profile card assembling itself
//   veri       one question answered at three rising reading levels
//   readers    a magnifier finds the sentence that proves the answer
//   hubs       a scholar's hub with podcast, video and materials in orbit
//   community  learners gathering around a shared question
//   discovery  a search fanning out into scholars, courses, labs, podcasts
//   schools    grade, language and depth dials reflowing a passage

const path = require('path');
const {
  E, bez, smooth, limb, curve, rect, ellipse, star, group, createDocument,
} = require('./lib/lottie.cjs');

const W = 240;
const H = 160;
const END = 180;
const REST = 150;

const C = {
  ink: '#183e48', teal: '#326776', tealSoft: '#5b8a95', tealTint: '#dfe9e6', sage: '#edf2ee',
  cream: '#f6f5f1', paper: '#ffffff', line: '#c7d2cd', lineSoft: '#e2e7e3',
  gold: '#aa8051', goldLight: '#d9b47b', yellow: '#efc66c', coral: '#e77757', coralShade: '#c95d40',
  skinA: '#c68a63', skinAShade: '#a9704c', skinB: '#7b4b33', skinBShade: '#5f3826',
  skinC: '#e8b894', skinCShade: '#cf9a74', skinD: '#9a6444', hair: '#1d2a30', hairBrown: '#5a3a2a',
  hairGold: '#c9a25a', hairGrey: '#8f9aa0', shirtA: '#326776', shirtB: '#e77757', shirtC: '#efc66c', shirtD: '#7ba0a8',
};

const overshoot = bez(0.34, 1.56, 0.64, 1);

// Pop-in with overshoot at t, optional exit (scale to zero) at `out`.
const pop = (t, { out, from = 0 } = {}) => {
  const frames = [[0, [from, from], 'hold'], [t, [from, from], overshoot], [t + 14, [100, 100], 'hold']];
  if (out !== undefined) frames.push([out, [100, 100], E.in], [out + 10, [from, from], 'hold']);
  frames.push([END, [from, from]]);
  return frames;
};
const popXYZ = (t, opts) => pop(t, opts).map(([f, v, e]) => [f, [v[0], v[1], 100], e]);
const fadeIn = (t, { out, dur = 10 } = {}) => {
  const frames = [[0, 0, 'hold'], [t, 0, E.out], [t + dur, 100, 'hold']];
  if (out !== undefined) frames.push([out, 100, E.in], [out + 10, 0, 'hold']);
  frames.push([END, 0]);
  return frames;
};
// A bar anchored at its left edge that grows to full width.
const grow = (t, { out, dur = 14 } = {}) => {
  const frames = [[0, [0, 100], 'hold'], [t, [0, 100], E.out], [t + dur, [100, 100], 'hold']];
  if (out !== undefined) frames.push([out, [100, 100], E.in], [out + 8, [0, 100], 'hold']);
  frames.push([END, [0, 100]]);
  return frames;
};
const leftAnchored = (x, y, w, h, r, style, s) => group('bar', rect(x + w / 2, y, w, h, r), { ...style, transform: { a: [x, y], p: [x, y], s } });
const rise = (t, y, dy = 10, { out } = {}) => {
  const frames = [[0, [0, y + dy, 0], 'hold'], [t, [0, y + dy, 0], E.out], [t + 16, [0, y, 0], 'hold']];
  if (out !== undefined) frames.push([out, [0, y, 0], E.in], [out + 10, [0, y + dy, 0], 'hold']);
  frames.push([END, [0, y + dy, 0]]);
  return frames;
};

// A head-and-shoulders portrait inside a circle of `size`, at (x, y).
const bust = (x, y, size, { skin, skinShade, hair, shirt, glasses = false, ring = C.tealTint }) => {
  const r = size / 2;
  const k = size / 60; // drawn at a 60px reference
  const items = [
    group('ring', ellipse(x, y, size + 6 * k, size + 6 * k), { fill: ring }),
    group('disc', ellipse(x, y, size, size), { fill: C.sage }),
    group('shoulders', smooth([[x - 22 * k, y + r], [x - 18 * k, y + 8 * k], [x, y + 2 * k], [x + 18 * k, y + 8 * k], [x + 22 * k, y + r]], false), { fill: shirt }),
    group('neck', rect(x, y + 4 * k, 9 * k, 10 * k, 3 * k), { fill: skinShade }),
    group('head', smooth([[x, y - 22 * k], [x + 12 * k, y - 18 * k], [x + 14 * k, y - 4 * k], [x + 8 * k, y + 8 * k], [x - 8 * k, y + 8 * k], [x - 14 * k, y - 4 * k], [x - 12 * k, y - 18 * k]]), { fill: skin }),
    group('hair', smooth([[x - 15 * k, y - 6 * k], [x - 14 * k, y - 20 * k], [x, y - 27 * k], [x + 14 * k, y - 20 * k], [x + 15 * k, y - 6 * k, 0.4], [x + 9 * k, y - 12 * k], [x - 2 * k, y - 14 * k], [x - 10 * k, y - 10 * k]]), { fill: hair }),
    group('eye left', ellipse(x - 5 * k, y - 4 * k, 2.2 * k, 3 * k), { fill: C.ink }),
    group('eye right', ellipse(x + 5 * k, y - 4 * k, 2.2 * k, 3 * k), { fill: C.ink }),
    group('smile', curve([[x - 4 * k, y + 2 * k], [x, y + 4 * k], [x + 4 * k, y + 2 * k]]), { stroke: skinShade, width: 1.4 * k }),
  ];
  if (glasses) items.push(group('glasses', [ellipse(x - 5 * k, y - 4 * k, 9 * k, 8 * k), ellipse(x + 5 * k, y - 4 * k, 9 * k, 8 * k)], { stroke: C.ink, width: 1.2 * k }));
  return items;
};

// Placeholder text lines inside a card: [x, y, width] rows.
const textLines = (rows, { color = C.line, h = 4, r = 2 } = {}) => rows.map(([x, y, w, tone], k) => group(`line ${k + 1}`, rect(x + w / 2, y, w, h, r), { fill: tone || color }));

const backdrop = (points, fill, opacity = 100) => group('backdrop', smooth(points), { fill, opacity });

const files = [];
const scene = (name, markersExtra, build) => {
  const doc = createDocument({
    w: W, h: H, end: END, name: `Proj Arch feature — ${name}`,
    markers: [{ tm: 0, cm: 'start', dr: 0 }, ...markersExtra, { tm: REST, cm: 'rest', dr: 0 }],
  });
  build(doc);
  files.push(doc.write(path.join(__dirname, '..', 'public', 'media', `feature-${name}.json`)));
};

// ═══════════════════════════════════════════════════════════════════════════
// 01 Scholar directory: a profile card assembles itself.
// ═══════════════════════════════════════════════════════════════════════════
scene('directory', [], ({ layer }) => {
  const OUT = 158;
  layer('backdrop', [backdrop([[26, 40], [120, 14], [214, 34], [232, 96], [196, 150], [90, 154], [22, 120]], C.sage)]);
  layer('card', [
    group('shadow', rect(122, 88, 168, 116, 14), { fill: C.ink, opacity: 7 }),
    group('card', rect(120, 84, 168, 116, 14), { fill: C.paper }),
  ], { p: rise(4, 0, 14, { out: OUT }), o: fadeIn(4, { out: OUT }) });
  layer('portrait', bust(70, 64, 46, { skin: C.skinA, skinShade: C.skinAShade, hair: C.hair, shirt: C.shirtA, glasses: true }),
    { a: [70, 64, 0], p: [70, 64, 0], s: popXYZ(16, { out: OUT + 2 }) });
  layer('verified', [
    group('badge', ellipse(0, 0, 18, 18), { fill: C.gold }),
    group('badge ring', ellipse(0, 0, 22, 22), { stroke: C.paper, width: 2.5 }),
    group('tick', curve([[-4.5, 0.5], [-1.5, 3.5], [5, -3.5]]), { stroke: C.paper, width: 2.4 }),
  ], { p: [90, 84, 0], s: popXYZ(96, { out: OUT }) });
  layer('name', [
    leftAnchored(102, 52, 78, 7, 3.5, { fill: C.ink }, grow(30, { out: OUT })),
    leftAnchored(102, 66, 52, 5, 2.5, { fill: C.line }, grow(38, { out: OUT })),
  ]);
  layer('stats', [
    group('stat tile 1', rect(72, 110, 40, 30, 8), { fill: C.sage, transform: { a: [72, 110], p: [72, 110], s: pop(48, { out: OUT }) } }),
    group('stat tile 2', rect(120, 110, 40, 30, 8), { fill: C.sage, transform: { a: [120, 110], p: [120, 110], s: pop(56, { out: OUT }) } }),
    leftAnchored(60, 104, 16, 3, 1.5, { fill: C.line }, grow(58, { out: OUT })),
    leftAnchored(108, 104, 16, 3, 1.5, { fill: C.line }, grow(66, { out: OUT })),
    leftAnchored(60, 117, 26, 8, 3, { fill: C.teal }, grow(62, { out: OUT })),
    leftAnchored(108, 117, 18, 8, 3, { fill: C.teal }, grow(70, { out: OUT })),
  ]);
  layer('topics', [
    group('chip 1', rect(184, 100, 32, 12, 6), { fill: C.tealTint, transform: { a: [168, 100], p: [168, 100], s: pop(74, { out: OUT }) } }),
    group('chip 2', rect(184, 118, 40, 12, 6), { fill: C.tealTint, transform: { a: [164, 118], p: [164, 118], s: pop(82, { out: OUT }) } }),
    group('chip 3', rect(180, 136, 24, 12, 6), { fill: C.tealTint, transform: { a: [168, 136], p: [168, 136], s: pop(90, { out: OUT }) } }),
    leftAnchored(174, 100, 20, 4, 2, { fill: C.teal }, grow(80, { out: OUT })),
    leftAnchored(170, 118, 28, 4, 2, { fill: C.teal }, grow(88, { out: OUT })),
    leftAnchored(174, 136, 12, 4, 2, { fill: C.teal }, grow(96, { out: OUT })),
  ]);
});

// ═══════════════════════════════════════════════════════════════════════════
// 02 Veri AI: one question, three reading levels.
// ═══════════════════════════════════════════════════════════════════════════
scene('veri', [{ tm: 60, cm: 'level 2', dr: 0 }, { tm: 120, cm: 'level 3', dr: 0 }], ({ layer }) => {
  const orb = [54, 78];
  layer('backdrop', [backdrop([[14, 44], [96, 12], [222, 26], [236, 100], [200, 152], [70, 156], [10, 118]], C.cream)]);
  // The orb pulses each time the level changes.
  const pulse = [[0, [100, 100, 100], E.soft], [56, [100, 100, 100], E.out], [64, [88, 88, 100], E.out], [76, [110, 110, 100], E.soft], [90, [100, 100, 100], 'hold'], [116, [100, 100, 100], E.out], [124, [88, 88, 100], E.out], [136, [110, 110, 100], E.soft], [150, [100, 100, 100], 'hold'], [END, [100, 100, 100]]];
  layer('orbit', [
    group('ring', ellipse(0, 0, 76, 76), { stroke: C.gold, width: 1.6, opacity: 50, dash: [2, 6] }),
    group('dot', ellipse(38, 0, 6, 6), { fill: C.gold }),
  ], { p: [orb[0], orb[1], 0], r: [[0, 0, E.linear], [END, 360]] });
  layer('orb', [
    group('outer', ellipse(0, 0, 58, 58), { fill: C.tealTint }),
    group('mid', ellipse(0, 0, 46, 46), { fill: C.teal }),
    group('inner', ellipse(0, 0, 36, 36), { fill: C.ink }),
    group('shine', smooth([[-11, -11], [-2, -16], [7, -13, 0.5], [-4, -6, 0.5], [-13, -2]]), { fill: C.teal, opacity: 55 }),
    group('spark', star(4, 12, 4), { fill: C.paper }),
    group('core', ellipse(0, 0, 4.5, 4.5), { fill: C.gold }),
  ], { p: [orb[0], orb[1], 0], s: pulse, r: [[0, 0, 'hold'], [56, 0, E.inOut], [90, 90, 'hold'], [116, 90, E.inOut], [150, 180, 'hold'], [END, 180]] });
  // Speech bubble; its tail points back at the orb.
  layer('bubble', [
    group('shadow', rect(158, 76, 132, 96, 14), { fill: C.ink, opacity: 7 }),
    group('bubble', rect(156, 72, 132, 96, 14), { fill: C.paper }),
    group('tail', smooth([[92, 78, 0], [82, 86, 0], [92, 94, 0]]), { fill: C.paper }),
  ]);
  // Three answers: each fades in while the previous fades out.
  const answers = [
    [[104, 48, 88], [104, 60, 64]],
    [[104, 44, 96], [104, 56, 80], [104, 68, 90], [104, 80, 52]],
    [[104, 40, 100], [104, 52, 92], [104, 64, 100], [104, 76, 84], [104, 88, 96], [104, 100, 60]],
  ];
  answers.forEach((rows, level) => {
    const start = level * 60;
    const opacity = level === 0
      ? [[0, 100, 'hold'], [54, 100, E.in], [60, 0, 'hold'], [174, 0, E.out], [END, 100]]
      : [[0, 0, 'hold'], [start, 0, E.out], [start + 8, 100, 'hold'], [start + 54, 100, E.in], [start + 60, 0, 'hold'], [END, 0]];
    const items = rows.map(([x, y, w], k) => leftAnchored(x, y, w, 5, 2.5, { fill: k === 0 ? C.ink : C.line },
      [[0, [level === 0 ? 100 : 0, 100], 'hold'], [start + 2 + k * 4, [level === 0 ? 100 : 0, 100], E.out], [start + 14 + k * 4, [100, 100], 'hold'], [END, [100, 100]]]));
    if (level === 2) items.push(group('citation', rect(110, 112, 12, 12, 3), { fill: C.gold }), leftAnchored(126, 112, 40, 4, 2, { fill: C.goldLight }, grow(start + 30)));
    layer(`answer ${level + 1}`, items, { o: opacity });
  });
  // Level pills: one, two, three dots; the active pill is teal.
  [0, 1, 2].forEach(level => {
    const x = 116 + level * 40;
    const active = [[0, level === 0 ? 100 : 0, 'hold'], [level * 60 - 4 < 0 ? 0 : level * 60 - 4, level === 0 ? 100 : 0, E.out], [level * 60 + 4, 100, 'hold'], [level * 60 + 56, 100, E.in], [level * 60 + 62, 0, 'hold'], [END, level === 0 ? 100 : 0]];
    const dots = [];
    for (let d = 0; d <= level; d += 1) dots.push(ellipse(x - level * 4 + d * 8, 136, 4, 4));
    layer(`level ${level + 1}`, [
      group('pill', rect(x, 136, 32, 16, 8), { fill: C.sage }),
      group('pill active', rect(x, 136, 32, 16, 8), { fill: C.teal, opacity: active }),
      group('dots', dots, { fill: C.paper }),
      group('dots idle', dots, { fill: C.line, opacity: active.map(([t, v, e]) => [t, 100 - v, e]) }),
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 03 Young readers: the magnifier finds the proof, and a badge is earned.
// ═══════════════════════════════════════════════════════════════════════════
scene('readers', [{ tm: 84, cm: 'found', dr: 0 }], ({ layer }) => {
  layer('backdrop', [backdrop([[20, 52], [110, 18], [218, 30], [234, 104], [186, 152], [72, 150], [12, 112]], C.sage)]);
  // Open book: two pages with a gutter, a soft underside.
  layer('book', [
    group('shadow', ellipse(120, 138, 190, 14), { fill: C.ink, opacity: 8 }),
    group('cover', smooth([[26, 50, 0], [120, 62, 0], [214, 50, 0], [218, 132, 0], [120, 142, 0], [22, 132, 0]]), { fill: C.teal }),
    group('page left', smooth([[32, 46, 0], [118, 58, 0], [118, 134, 0], [30, 124, 0]]), { fill: C.paper }),
    group('page right', smooth([[122, 58, 0], [208, 46, 0], [210, 124, 0], [122, 134, 0]]), { fill: C.cream }),
    group('gutter', rect(120, 96, 3, 78, 1.5), { fill: C.lineSoft }),
    ...textLines([[42, 66, 62], [42, 78, 66], [42, 90, 56], [42, 102, 64], [42, 114, 40], [134, 62, 62], [134, 74, 60], [134, 98, 66], [134, 110, 48]]),
  ]);
  // The proof line lights up under the magnifier.
  layer('proof', [
    leftAnchored(132, 86, 64, 9, 4.5, { fill: C.yellow }, grow(70, { dur: 12 })),
    group('proof text', rect(166, 86, 66, 4, 2), { fill: C.ink }),
  ]);
  // Magnifier: sweeps the left page, hops to the right, settles on the proof.
  const sweep = [
    [0, [66, 78, 0], E.inOut], [22, [96, 90, 0], E.inOut], [44, [70, 104, 0], E.inOut], [66, [150, 74, 0], E.out],
    [82, [168, 88, 0], E.soft], [96, [166, 86, 0], 'hold'], [150, [166, 86, 0], E.inOut], [END, [66, 78, 0]],
  ];
  layer('magnifier', [
    group('handle', limb([18, 18], [40, 40], 10, 8), { fill: C.ink }),
    group('glass', ellipse(0, 0, 44, 44), { fill: C.paper, opacity: 55 }),
    group('rim', ellipse(0, 0, 44, 44), { stroke: C.ink, width: 4 }),
    group('glint', curve([[-12, -6], [-8, -12], [-2, -14]]), { stroke: C.paper, width: 2.5 }),
  ], { p: sweep, r: [[0, -6, E.soft], [66, 6, E.soft], [96, 0, 'hold'], [END, -6]] });
  // Badge with a small streak of stars.
  layer('badge', [
    group('glow', ellipse(0, 0, 40, 40), { fill: C.yellow, opacity: 30 }),
    group('badge', ellipse(0, 0, 30, 30), { fill: C.yellow }),
    group('badge ring', ellipse(0, 0, 24, 24), { stroke: C.paper, width: 2 }),
    group('star', star(5, 9, 4), { fill: C.paper }),
  ], { p: [196, 44, 0], s: popXYZ(94, { out: 156 }), r: [[0, -20, 'hold'], [94, -20, E.out], [110, 0, 'hold'], [END, 0]] });
  [[172, 24, 100], [222, 30, 104], [216, 66, 108]].forEach(([x, y, t], k) => {
    layer(`sparkle ${k + 1}`, [group('sparkle', star(4, 5, 1.6), { fill: C.gold })], { p: [x, y, 0], s: popXYZ(t, { out: 150 }), r: [[0, 0, E.linear], [END, 90]] });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 04 Scholar knowledge hubs: media in orbit around the scholar.
// ═══════════════════════════════════════════════════════════════════════════
scene('hubs', [], ({ layer, oscillate }) => {
  const hub = [122, 82];
  layer('backdrop', [backdrop([[18, 46], [112, 10], [220, 28], [236, 98], [200, 154], [84, 156], [8, 116]], C.cream)]);
  const spokes = [[50, 42], [196, 48], [194, 126], [52, 128]];
  layer('spokes', spokes.map(([x, y], k) => group(`spoke ${k + 1}`, curve([[hub[0], hub[1]], [x, y]]), {
    stroke: C.line, width: 2, dash: [4, 5], trim: { s: 0, e: [[0, 0, 'hold'], [10 + k * 12, 0, E.out], [30 + k * 12, 100, 'hold'], [END, 100]] },
  })));
  layer('scholar', bust(hub[0], hub[1], 58, { skin: C.skinB, skinShade: C.skinBShade, hair: C.hair, shirt: C.shirtC, ring: C.tealTint }),
    { a: [hub[0], hub[1], 0], p: [hub[0], hub[1], 0], s: popXYZ(2) });
  // Podcast tile with a live waveform.
  const bars = [8, 16, 11, 20, 14, 9, 17];
  layer('podcast', [
    group('shadow', rect(2, 3, 62, 44, 10), { fill: C.ink, opacity: 8 }),
    group('tile', rect(0, 0, 62, 44, 10), { fill: C.paper }),
    group('mic', ellipse(-20, -2, 10, 14), { fill: C.coral }),
    group('mic base', rect(-20, 9, 12, 3, 1.5), { fill: C.coralShade }),
    ...bars.map((h, k) => group(`bar ${k + 1}`, rect(-4 + k * 6, 0, 3, h, 1.5), {
      fill: C.teal, transform: { a: [-4 + k * 6, 0], p: [-4 + k * 6, 0], s: oscillate([100, 100], [100, 45], 30, k % 2) },
    })),
  ], { p: [50, 42, 0], s: popXYZ(22), r: -4 });
  // Course video tile with a pulsing play button.
  layer('video', [
    group('shadow', rect(2, 3, 62, 44, 10), { fill: C.ink, opacity: 8 }),
    group('tile', rect(0, 0, 62, 44, 10), { fill: C.paper }),
    group('screen', rect(0, -2, 48, 26, 5), { fill: C.ink }),
    group('screen sky', smooth([[-24, -8, 0], [24, -8, 0], [24, -15, 0], [-24, -15, 0]]), { fill: C.teal }),
    group('play', smooth([[-5, -8, 0], [7, -2, 0], [-5, 4, 0]]), { fill: C.paper, transform: { a: [0, -2], p: [0, -2], s: oscillate([100, 100], [118, 118], 60) } }),
    group('progress', rect(-6, 15, 36, 3, 1.5), { fill: C.lineSoft }),
    leftAnchored(-24, 15, 36, 3, 1.5, { fill: C.coral }, [[0, [10, 100], E.linear], [END, [100, 100]]]),
  ], { p: [196, 48, 0], s: popXYZ(34), r: 3 });
  // Course materials: a folder with a sheet sliding up out of it.
  layer('materials sheet', [
    group('sheet', rect(0, -8, 30, 26, 4), { fill: C.paper }),
    ...textLines([[-10, -14, 20], [-10, -8, 14], [-10, -2, 18]], { h: 3, r: 1.5 }),
  ], { p: [[0, [194, 124, 0], E.soft], [90, [194, 116, 0], E.soft], [END, [194, 124, 0]]], s: popXYZ(46) });
  layer('materials', [
    group('shadow', rect(2, 3, 54, 30, 8), { fill: C.ink, opacity: 8 }),
    group('folder back', rect(0, 0, 54, 30, 8), { fill: C.gold }),
    group('folder tab', rect(-16, -14, 20, 8, 3), { fill: C.gold }),
    group('folder front', smooth([[-27, -6, 0], [27, -6, 0], [25, 15, 0], [-25, 15, 0]]), { fill: C.goldLight }),
  ], { p: [194, 130, 0], s: popXYZ(46) });
  // A study group: three small heads in a tile.
  layer('group', [
    group('shadow', rect(2, 3, 58, 40, 10), { fill: C.ink, opacity: 8 }),
    group('tile', rect(0, 0, 58, 40, 10), { fill: C.paper }),
    ...[[-16, C.skinC, C.hairGold], [0, C.skinA, C.hairBrown], [16, C.skinB, C.hair]].flatMap(([x, skin, hair], k) => [
      group(`body ${k}`, smooth([[x - 9, 16], [x - 7, 6], [x, 3], [x + 7, 6], [x + 9, 16]], false), { fill: [C.teal, C.coral, C.gold][k] }),
      group(`head ${k}`, ellipse(x, -4, 12, 13), { fill: skin }),
      group(`hair ${k}`, smooth([[x - 6, -6], [x - 5, -11], [x, -13], [x + 5, -11], [x + 6, -6, 0.4], [x, -8]]), { fill: hair }),
    ]),
  ], { p: [52, 128, 0], s: popXYZ(58), r: -3 });
});

// ═══════════════════════════════════════════════════════════════════════════
// 05 Learning communities: learners gather around a shared question.
// ═══════════════════════════════════════════════════════════════════════════
scene('community', [], ({ layer }) => {
  const centre = [120, 86];
  layer('backdrop', [backdrop([[16, 40], [104, 8], [226, 22], [238, 92], [206, 154], [78, 156], [6, 112]], C.sage)]);
  const people = [
    { p: [44, 46], skin: C.skinC, skinShade: C.skinCShade, hair: C.hairGold, shirt: C.shirtA },
    { p: [198, 40], skin: C.skinB, skinShade: C.skinBShade, hair: C.hair, shirt: C.shirtB },
    { p: [206, 124], skin: C.skinA, skinShade: C.skinAShade, hair: C.hairBrown, shirt: C.shirtD },
    { p: [116, 144], skin: C.skinD, skinShade: C.skinBShade, hair: C.hair, shirt: C.shirtC },
    { p: [34, 126], skin: C.skinC, skinShade: C.skinCShade, hair: C.hairGrey, shirt: C.shirtB },
  ];
  layer('threads', people.map(({ p }, k) => group(`thread ${k + 1}`, curve([[p[0], p[1]], [centre[0], centre[1]]]), {
    stroke: C.line, width: 2, trim: { s: 0, e: [[0, 0, 'hold'], [16 + k * 10, 0, E.out], [34 + k * 10, 100, 'hold'], [END, 100]] },
  })));
  people.forEach((person, k) => {
    layer(`learner ${k + 1}`, bust(person.p[0], person.p[1], 40, person), {
      a: [person.p[0], person.p[1], 0], p: [person.p[0], person.p[1], 0], s: popXYZ(6 + k * 10),
    });
  });
  // The shared question: a bubble with three dots that type, and a reply
  // bubble that answers it.
  layer('question', [
    group('shadow', rect(2, 3, 74, 46, 12), { fill: C.ink, opacity: 8 }),
    group('bubble', rect(0, 0, 74, 46, 12), { fill: C.paper }),
    group('tail', smooth([[-12, 20, 0], [-18, 32, 0], [-2, 22, 0]]), { fill: C.paper }),
    group('question mark', curve([[-8, -10], [0, -16], [8, -10], [4, -2], [0, 2]]), { stroke: C.teal, width: 3.5 }),
    group('question dot', ellipse(0, 10, 4, 4), { fill: C.teal }),
    group('heart', smooth([[20, -6], [26, -12], [32, -6], [26, 4]]), { fill: C.coral, transform: { a: [26, -4], p: [26, -4], s: pop(70) } }),
  ], { p: [centre[0], centre[1], 0], s: popXYZ(56) });
  [[152, 60, 96], [92, 116, 106], [150, 112, 116]].forEach(([x, y, t], k) => {
    layer(`reply ${k + 1}`, [
      group('bubble', rect(0, 0, 30, 18, 9), { fill: C.tealTint }),
      group('dot 1', ellipse(-7, 0, 3, 3), { fill: C.teal }),
      group('dot 2', ellipse(0, 0, 3, 3), { fill: C.teal }),
      group('dot 3', ellipse(7, 0, 3, 3), { fill: C.teal }),
    ], { p: [x, y, 0], s: popXYZ(t) });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 06 AI-assisted discovery: a question fans out across the catalog.
// ═══════════════════════════════════════════════════════════════════════════
scene('discovery', [{ tm: 44, cm: 'results', dr: 0 }], ({ layer }) => {
  const OUT = 160;
  layer('backdrop', [backdrop([[20, 44], [114, 12], [222, 28], [236, 100], [198, 152], [68, 154], [8, 112]], C.sage)]);
  layer('search', [
    group('shadow', rect(120, 40, 184, 30, 15), { fill: C.ink, opacity: 7 }),
    group('bar', rect(120, 36, 184, 30, 15), { fill: C.paper }),
    group('lens', ellipse(46, 36, 12, 12), { stroke: C.teal, width: 2.6 }),
    group('lens handle', curve([[50, 40], [56, 46]]), { stroke: C.teal, width: 2.6 }),
    leftAnchored(64, 36, 96, 6, 3, { fill: C.ink }, grow(8, { out: OUT, dur: 30 })),
    group('caret', rect(64, 36, 2, 12, 1), { fill: C.teal, transform: { p: [[0, [0, 0], 'hold'], [8, [0, 0], E.linear], [38, [96, 0], 'hold'], [END, [96, 0]]], o: [[0, 100, 'hold'], [44, 100, 'hold'], [48, 0, 'hold'], [56, 100, 'hold'], [60, 0, 'hold'], [END, 0]] } }),
    group('spark', star(4, 8, 3), { fill: C.gold, transform: { a: [0, 0], p: [196, 36], s: pop(40, { out: OUT }), r: [[0, 0, E.linear], [END, 180]] } }),
  ], { p: rise(2, 0, 10) });
  // Four result cards fan out: scholar, course, lab, podcast.
  const cards = [
    { x: 42, t: 46, icon: [group('avatar', ellipse(0, -8, 16, 16), { fill: C.skinA }), group('hair', smooth([[-8, -12], [0, -18], [8, -12], [6, -8], [-6, -8]]), { fill: C.hair }), group('shirt', smooth([[-10, 4], [0, -2], [10, 4]], false), { fill: C.teal })] },
    { x: 94, t: 56, icon: [group('screen', rect(0, -7, 24, 16, 3), { fill: C.ink }), group('play', smooth([[-3, -11, 0], [4, -7, 0], [-3, -3, 0]]), { fill: C.paper })] },
    { x: 146, t: 66, icon: [group('flask', smooth([[-4, -18, 0], [4, -18, 0], [4, -8, 0], [12, 6, 0.3], [-12, 6, 0.3], [-4, -8, 0]]), { fill: C.tealTint }), group('liquid', smooth([[-8, 0, 0], [8, 0, 0], [12, 6, 0.3], [-12, 6, 0.3]]), { fill: C.coral }), group('flask rim', rect(0, -18, 12, 3, 1.5), { fill: C.teal })] },
    { x: 198, t: 76, icon: [group('mic', ellipse(0, -10, 10, 16), { fill: C.gold }), group('mic arc', curve([[-9, -8], [-8, 2], [0, 6], [8, 2], [9, -8]]), { stroke: C.ink, width: 2 }), group('mic stand', rect(0, 8, 2.5, 6, 1), { fill: C.ink })] },
  ];
  cards.forEach(({ x, t, icon }, k) => {
    layer(`thread ${k + 1}`, [group('thread', curve([[120, 52], [x, 74]]), { stroke: C.line, width: 2, dash: [3, 4], trim: { s: 0, e: [[0, 0, 'hold'], [t - 8, 0, E.out], [t + 6, 100, 'hold'], [OUT, 100, E.in], [OUT + 8, 0, 'hold'], [END, 0]] } })]);
    layer(`result ${k + 1}`, [
      group('shadow', rect(2, 3, 44, 56, 10), { fill: C.ink, opacity: 8 }),
      group('card', rect(0, 0, 44, 56, 10), { fill: C.paper }),
      ...icon,
      group('label', rect(0, 14, 26, 4, 2), { fill: C.line }),
      group('label 2', rect(0, 21, 18, 4, 2), { fill: C.lineSoft }),
    ], { p: [x, 108, 0], s: popXYZ(t, { out: OUT + 2 }), r: (k - 1.5) * 3 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 07 Schools: grade, language and depth dials reflow a passage.
// ═══════════════════════════════════════════════════════════════════════════
scene('schools', [], ({ layer }) => {
  layer('backdrop', [backdrop([[18, 46], [110, 12], [224, 30], [236, 102], [196, 154], [66, 152], [8, 112]], C.cream)]);
  // Control panel on the left with three dials.
  layer('panel', [
    group('shadow', rect(64, 88, 92, 104, 14), { fill: C.ink, opacity: 7 }),
    group('panel', rect(62, 84, 92, 104, 14), { fill: C.paper }),
  ]);
  const dials = [
    { y: 54, icon: 'cap', from: 0.25, to: 0.7, t: 20, tone: C.teal },
    { y: 84, icon: 'globe', from: 0.6, to: 0.3, t: 60, tone: C.gold },
    { y: 114, icon: 'depth', from: 0.35, to: 0.85, t: 100, tone: C.coral },
  ];
  const trackX = 46;
  const trackW = 56;
  dials.forEach(({ y, icon, from, to, t, tone }, k) => {
    const knobKeys = [[0, [trackX + trackW * from, y, 0], 'hold'], [t, [trackX + trackW * from, y, 0], E.out], [t + 18, [trackX + trackW * to, y, 0], 'hold'], [150, [trackX + trackW * to, y, 0], E.inOut], [172, [trackX + trackW * from, y, 0], 'hold'], [END, [trackX + trackW * from, y, 0]]];
    const fillKeys = [[0, [from * 100, 100], 'hold'], [t, [from * 100, 100], E.out], [t + 18, [to * 100, 100], 'hold'], [150, [to * 100, 100], E.inOut], [172, [from * 100, 100], 'hold'], [END, [from * 100, 100]]];
    const iconItems = icon === 'cap'
      ? [group('cap', smooth([[-8, -2, 0], [0, -6, 0], [8, -2, 0], [0, 2, 0]]), { fill: tone }), group('cap band', smooth([[-5, -1, 0], [5, -1, 0], [5, 3, 0], [-5, 3, 0]]), { fill: tone })]
      : icon === 'globe'
        ? [group('globe', ellipse(0, 0, 14, 14), { stroke: tone, width: 1.8 }), group('meridian', ellipse(0, 0, 6, 14), { stroke: tone, width: 1.4 }), group('equator', curve([[-7, 0], [7, 0]]), { stroke: tone, width: 1.4 })]
        : [group('depth 1', rect(0, -5, 12, 2.5, 1.2), { fill: tone }), group('depth 2', rect(0, 0, 12, 2.5, 1.2), { fill: tone }), group('depth 3', rect(0, 5, 12, 2.5, 1.2), { fill: tone })];
    layer(`dial ${k + 1}`, [
      group('track', rect(trackX + trackW / 2, y, trackW, 6, 3), { fill: C.lineSoft }),
      leftAnchored(trackX, y, trackW, 6, 3, { fill: tone }, fillKeys),
    ], { p: [0, 0, 0] });
    // The dial's icon sits left of the track.
    layer(`dial ${k + 1} icon`, iconItems, { p: [28, y, 0] });
    layer(`knob ${k + 1}`, [
      group('knob shadow', ellipse(0, 2, 16, 16), { fill: C.ink, opacity: 10 }),
      group('knob', ellipse(0, 0, 16, 16), { fill: C.paper }),
      group('knob dot', ellipse(0, 0, 6, 6), { fill: tone }),
    ], { p: knobKeys });
  });
  // The passage on the right reflows each time a dial moves: three line
  // sets swap, each written for the level the dials now describe.
  const passages = [
    [[136, 66, 80], [136, 78, 68], [136, 90, 76], [136, 102, 40]],
    [[136, 62, 58], [136, 73, 62], [136, 84, 54], [136, 95, 64], [136, 106, 46]],
    [[136, 58, 80], [136, 68, 80], [136, 78, 80], [136, 88, 80], [136, 98, 80], [136, 108, 52]],
  ];
  layer('passage card', [
    group('shadow', rect(180, 88, 100, 104, 14), { fill: C.ink, opacity: 7 }),
    group('card', rect(178, 84, 100, 104, 14), { fill: C.paper }),
    group('heading', rect(158, 46, 40, 6, 3), { fill: C.ink }),
    group('level chip', rect(210, 46, 18, 10, 5), { fill: C.tealTint }),
  ]);
  passages.forEach((rows, k) => {
    const t = [0, 38, 118][k];
    const outAt = [38, 118, 172][k];
    const opacity = k === 0
      ? [[0, 100, 'hold'], [outAt, 100, E.in], [outAt + 6, 0, 'hold'], [172, 0, E.out], [END, 100]]
      : [[0, 0, 'hold'], [t, 0, E.out], [t + 8, 100, 'hold'], [outAt, 100, E.in], [outAt + 6, 0, 'hold'], [END, 0]];
    layer(`passage ${k + 1}`, rows.map(([x, y, w], i) => leftAnchored(x, y, w, 5, 2.5, { fill: i === 0 ? C.ink : C.line },
      [[0, [k === 0 ? 100 : 0, 100], 'hold'], [t + 2 + i * 3, [k === 0 ? 100 : 0, 100], E.out], [t + 14 + i * 3, [100, 100], 'hold'], [END, [100, 100]]])),
    { o: opacity });
  });
});

files.forEach(line => console.log('Wrote ' + line));
