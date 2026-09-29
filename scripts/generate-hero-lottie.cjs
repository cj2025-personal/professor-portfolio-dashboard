// Builds public/media/proj-arch-hero-light.json, the animation beside the
// Proj Arch page's title: "from Archives to You, accelerated by AI".
//
//   node scripts/generate-hero-lottie.cjs
//
// The scene has no people, so it reads differently from the mission scene
// below it. An archive wall of shelves and drawers fills the left. A drawer
// slides open, a record lifts out and flies through Veri AI, which sends it
// on as a clear reading card that lands on a phone held at the right. The
// card writes itself in, the reading-level meter fills, and a small spark
// marks the arrival.
//
// No text layers: every label is a shape, so nothing depends on a font. The
// "rest" marker is the finished card on the phone, which is the still that
// reduced-motion visitors see.

const path = require('path');
const {
  E, bez, smooth, limb, curve, rect, ellipse, star, group, createDocument, at,
} = require('./lib/lottie.cjs');

const END = 300;
const { layer, oscillate, write } = createDocument({
  w: 640, h: 520, end: END, name: 'Proj Arch header — from the archive to a phone',
  markers: [
    { tm: 0, cm: 'archive', dr: 0 },
    { tm: 128, cm: 'adapt', dr: 0 },
    { tm: 210, cm: 'deliver', dr: 0 },
    { tm: 270, cm: 'rest', dr: 0 },
  ],
});

const C = {
  ink: '#183e48', teal: '#326776', tealSoft: '#5b8a95', tealTint: '#dfe9e6', sage: '#edf2ee',
  cream: '#f6f5f1', paper: '#ffffff', line: '#c7d2cd', lineSoft: '#e2e7e3',
  gold: '#aa8051', goldLight: '#d9b47b', yellow: '#efc66c', coral: '#e77757', coralShade: '#c95d40',
  wood: '#d9c7a7', woodShade: '#bfa985', woodDark: '#a8906c', skin: '#c68a63', skinShade: '#a9704c',
  phone: '#1b2f37', phoneEdge: '#2f4a53',
};
const overshoot = bez(0.34, 1.56, 0.64, 1);

const T = { open: 24, lift: 52, launch: 76, arrive: 128, emit: 166, land: 210, write: 214, spark: 236, rest: 270, reset: 286 };

const pop = (t, { out, from = 0 } = {}) => {
  const frames = [[0, [from, from], 'hold'], [t, [from, from], overshoot], [t + 14, [100, 100], 'hold']];
  if (out !== undefined) frames.push([out, [100, 100], E.in], [out + 10, [from, from], 'hold']);
  frames.push([END, [from, from]]);
  return frames;
};
const grow = (t, { out, dur = 14 } = {}) => {
  const frames = [[0, [0, 100], 'hold'], [t, [0, 100], E.out], [t + dur, [100, 100], 'hold']];
  if (out !== undefined) frames.push([out, [100, 100], E.in], [out + 8, [0, 100], 'hold']);
  frames.push([END, [0, 100]]);
  return frames;
};
const leftAnchored = (x, y, w, h, r, style, s) => group('bar', rect(x + w / 2, y, w, h, r), { ...style, transform: { a: [x, y], p: [x, y], s } });

// ═══════════════════════════════════════════════════════════════════════════
const ORB = [352, 128];
const PHONE = [500, 318];   // phone centre, 150 x 292, tilted -6°
const DRAWER = [156, 322];  // the drawer that opens

// ─── Background ────────────────────────────────────────────────────────────
layer('backdrop', [
  group('left field', smooth([[16, 110], [130, 26], [286, 50], [318, 190], [280, 380], [160, 466], [40, 430], [4, 260]]), { fill: C.sage }),
  group('right field', smooth([[380, 150], [500, 90], [626, 130], [636, 300], [600, 452], [470, 494], [392, 430], [356, 300]]), { fill: C.yellow, opacity: 20 }),
  group('centre glow', ellipse(ORB[0], ORB[1], 200, 200), { fill: C.cream, opacity: 90 }),
]);
layer('floor', [
  group('floor line', rect(320, 458, 600, 2, 1), { fill: C.lineSoft }),
  group('archive shadow', ellipse(150, 458, 260, 18), { fill: C.ink, opacity: 8 }),
  group('phone shadow', ellipse(PHONE[0] + 10, 458, 170, 16), { fill: C.ink, opacity: 8 }),
]);

// ─── The archive wall ──────────────────────────────────────────────────────
{
  const L = 44;      // unit left
  const R = 262;     // unit right
  const top = 70;
  const items = [
    group('unit back', rect((L + R) / 2, 262, R - L, 392, 14), { fill: C.wood }),
    group('unit inner', rect((L + R) / 2, 262, R - L - 20, 372, 8), { fill: C.cream }),
  ];
  // Four shelves, with books and boxes on the top three and drawers below.
  const shelfYs = [top + 96, top + 190, top + 284, top + 378];
  shelfYs.forEach((y, k) => items.push(group(`shelf ${k + 1}`, rect((L + R) / 2, y, R - L - 12, 10, 3), { fill: C.woodShade })));
  const bookTones = [C.teal, C.ink, C.gold, C.coral, C.tealSoft, C.goldLight, C.teal, C.coralShade];
  // Shelf 1: a row of books of varying height, one leaning.
  let x = L + 22;
  [[14, 62], [12, 70], [16, 56], [12, 66], [18, 74], [12, 60], [14, 68], [16, 58], [12, 64], [14, 72]].forEach(([w, h], k) => {
    items.push(group(`book 1.${k}`, rect(x + w / 2, shelfYs[0] - 5 - h / 2, w, h, 2), { fill: bookTones[k % bookTones.length] }));
    items.push(group(`book 1.${k} band`, rect(x + w / 2, shelfYs[0] - 5 - h + 12, w, 3, 1), { fill: C.paper, opacity: 55 }));
    x += w + 3;
  });
  // Shelf 2: archive boxes with labels.
  [[L + 20, 52], [L + 80, 52], [L + 140, 52]].forEach(([bx, w], k) => {
    items.push(group(`box ${k + 1}`, rect(bx + w / 2, shelfYs[1] - 5 - 28, w, 56, 4), { fill: [C.tealTint, C.goldLight, C.tealTint][k] }));
    items.push(group(`box ${k + 1} lid`, rect(bx + w / 2, shelfYs[1] - 5 - 52, w + 4, 10, 3), { fill: [C.tealSoft, C.gold, C.tealSoft][k] }));
    items.push(group(`box ${k + 1} label`, rect(bx + w / 2, shelfYs[1] - 5 - 24, 26, 12, 2), { fill: C.paper }));
    items.push(group(`box ${k + 1} text`, rect(bx + w / 2, shelfYs[1] - 5 - 24, 16, 3, 1.5), { fill: C.line }));
  });
  // Shelf 3: books, a leaning one, a small plant.
  x = L + 20;
  [[16, 66], [12, 58], [14, 72], [12, 62], [18, 70], [14, 60]].forEach(([w, h], k) => {
    items.push(group(`book 3.${k}`, rect(x + w / 2, shelfYs[2] - 5 - h / 2, w, h, 2), { fill: bookTones[(k + 3) % bookTones.length] }));
    x += w + 3;
  });
  items.push(group('leaning book', rect(x + 24, shelfYs[2] - 5 - 33, 14, 66, 2), { fill: C.gold, transform: { a: [x + 24, shelfYs[2] - 5], p: [x + 24, shelfYs[2] - 5], r: -14 } }));
  items.push(group('pot', smooth([[R - 60, shelfYs[2] - 5, 0], [R - 62, shelfYs[2] - 33, 0], [R - 34, shelfYs[2] - 33, 0], [R - 36, shelfYs[2] - 5, 0]]), { fill: C.coral }));
  items.push(group('leaf 1', smooth([[R - 48, shelfYs[2] - 34], [R - 62, shelfYs[2] - 56], [R - 52, shelfYs[2] - 74], [R - 42, shelfYs[2] - 54]]), { fill: C.teal }));
  items.push(group('leaf 2', smooth([[R - 46, shelfYs[2] - 34], [R - 34, shelfYs[2] - 60], [R - 40, shelfYs[2] - 78], [R - 52, shelfYs[2] - 56]]), { fill: C.tealSoft }));
  // Bottom: a block of card-catalogue drawers. The middle one animates.
  const drawerRows = [[L + 18, shelfYs[3] - 62], [L + 18, shelfYs[3] - 24]];
  drawerRows.forEach(([dx, dy], row) => {
    [0, 1, 2].forEach(col => {
      if (row === 0 && col === 1) return; // the moving drawer is its own layer
      const cx = dx + col * 66 + 30;
      items.push(group(`drawer ${row}.${col}`, rect(cx, dy, 60, 30, 4), { fill: C.woodShade }));
      items.push(group(`drawer ${row}.${col} label`, rect(cx, dy - 5, 22, 8, 2), { fill: C.paper }));
      items.push(group(`drawer ${row}.${col} pull`, rect(cx, dy + 8, 14, 3, 1.5), { fill: C.woodDark }));
    });
  });
  layer('archive', items);
  // The moving drawer: slides out, the record lifts from it, it slides back.
  layer('drawer cavity', [group('cavity', rect(DRAWER[0], DRAWER[1], 60, 30, 4), { fill: C.woodDark })]);
  layer('open drawer', [
    group('side', rect(-14, 0, 40, 26, 3), { fill: C.woodDark }),
    group('front', rect(0, 0, 60, 30, 4), { fill: C.woodShade }),
    group('label', rect(0, -5, 22, 8, 2), { fill: C.paper }),
    group('pull', rect(0, 8, 14, 3, 1.5), { fill: C.woodDark }),
  ], {
    p: [[0, [DRAWER[0], DRAWER[1], 0], 'hold'], [T.open, [DRAWER[0], DRAWER[1], 0], E.out], [T.open + 16, [DRAWER[0] + 34, DRAWER[1], 0], 'hold'], [T.launch + 20, [DRAWER[0] + 34, DRAWER[1], 0], E.inOut], [T.launch + 40, [DRAWER[0], DRAWER[1], 0], 'hold'], [END, [DRAWER[0], DRAWER[1], 0]]],
  });
  // Dust motes drifting up from the shelves.
  [[96, 150, 0], [210, 120, 40], [140, 240, 80]].forEach(([mx, my, phase], k) => {
    layer(`mote ${k + 1}`, [group('mote', ellipse(0, 0, 5, 5), { fill: C.gold, opacity: 45 })], {
      p: [[0, [mx, my + 30, 0], E.soft], [150, [mx + 8, my - 20, 0], E.soft], [END, [mx, my + 30, 0]]],
      o: [[0, 0, E.soft], [phase + 40, 100, E.soft], [phase + 120, 0, 'hold'], [END, 0]],
    });
  });
}

// ─── The record: lifts from the drawer, arcs into the orb ──────────────────
{
  const shapes = [
    group('shadow', rect(2, 4, 62, 78, 6), { fill: C.ink, opacity: 8 }),
    group('sheet', rect(0, 0, 62, 78, 6), { fill: C.paper }),
    group('edge', rect(0, 0, 62, 78, 6), { stroke: C.lineSoft, width: 1.5 }),
    group('tab', rect(-14, -36, 26, 8, 3), { fill: C.gold }),
    group('title', rect(-8, -22, 36, 5, 2.5), { fill: C.ink }),
    ...[-12, -5, 2, 9, 16].map((y, k) => group(`line ${k + 1}`, rect(k % 2 ? -2 : 0, y, k % 2 ? 44 : 48, 3, 1.5), { fill: C.line })),
    group('stamp', ellipse(16, 26, 16, 16), { stroke: C.coral, width: 2 }),
    group('stamp bar', rect(16, 26, 8, 2.5, 1.2), { fill: C.coral }),
  ];
  const start = [DRAWER[0] + 34, DRAWER[1] - 4];
  const lifted = [DRAWER[0] + 44, DRAWER[1] - 70];
  layer('record', shapes, {
    p: [
      [0, [start[0], start[1], 0], 'hold'], [T.lift, [start[0], start[1], 0], E.out], [T.lift + 20, [lifted[0], lifted[1], 0], E.soft],
      [T.launch, [lifted[0], lifted[1] - 4, 0], E.inOut, { to: [40, -140], ti: [-50, 20] }], [T.arrive, [ORB[0], ORB[1], 0], 'hold'],
      [T.reset, [ORB[0], ORB[1], 0], 'hold'], [T.reset + 1, [start[0], start[1], 0], 'hold'], [END, [start[0], start[1], 0]],
    ],
    r: [[0, -4, 'hold'], [T.lift, -4, E.out], [T.lift + 20, 4, E.soft], [T.launch, 2, E.inOut], [T.arrive, 30, 'hold'], [T.reset, 30, 'hold'], [T.reset + 1, -4, 'hold'], [END, -4]],
    s: [
      [0, [100, 26, 100], 'hold'], [T.lift, [100, 26, 100], E.out], [T.lift + 20, [100, 100, 100], 'hold'],
      [T.launch, [100, 100, 100], E.in], [T.arrive, [16, 16, 100], 'hold'], [T.reset, [16, 16, 100], 'hold'], [T.reset + 1, [100, 26, 100], 'hold'], [END, [100, 26, 100]],
    ],
    o: [[0, 0, 'hold'], [T.lift, 0, 'hold'], [T.lift + 1, 100, 'hold'], [T.arrive - 10, 100, E.in], [T.arrive, 0, 'hold'], [END, 0]],
  });
}

// ─── Veri AI orb ───────────────────────────────────────────────────────────
{
  const pulse = [[0, [100, 100, 100], E.soft], [T.arrive - 6, [100, 100, 100], E.out], [T.arrive + 6, [90, 90, 100], E.out], [T.arrive + 20, [112, 112, 100], E.soft], [T.arrive + 34, [100, 100, 100], 'hold'], [T.emit - 6, [104, 104, 100], E.out], [T.emit + 8, [96, 96, 100], E.soft], [T.emit + 22, [100, 100, 100], 'hold'], [END, [100, 100, 100]]];
  layer('orbit', [
    group('ring', ellipse(0, 0, 140, 140), { stroke: C.gold, width: 2, opacity: 45, dash: [3, 8] }),
    group('dot', ellipse(70, 0, 8, 8), { fill: C.gold }),
    group('dot 2', ellipse(-70, 0, 5, 5), { fill: C.goldLight }),
  ], { p: [ORB[0], ORB[1], 0], r: [[0, 0, E.linear], [T.arrive, 100, E.inOut], [T.emit, 360, E.linear], [END, 720]] });
  layer('flare', [group('flare', ellipse(0, 0, 130, 130), { stroke: C.goldLight, width: 3 })], {
    p: [ORB[0], ORB[1], 0],
    s: [[0, [60, 60, 100], 'hold'], [T.arrive, [60, 60, 100], E.out], [T.arrive + 30, [150, 150, 100], 'hold'], [T.emit, [60, 60, 100], E.out], [T.emit + 30, [140, 140, 100], 'hold'], [END, [60, 60, 100]]],
    o: [[0, 0, 'hold'], [T.arrive, 90, E.out], [T.arrive + 30, 0, 'hold'], [T.emit, 70, E.out], [T.emit + 30, 0, 'hold'], [END, 0]],
  });
  layer('orb', [
    group('outer', ellipse(0, 0, 104, 104), { fill: C.tealTint }),
    group('mid', ellipse(0, 0, 84, 84), { fill: C.teal }),
    group('inner', ellipse(0, 0, 66, 66), { fill: C.ink }),
    group('shine', smooth([[-19, -19], [-3, -28], [13, -23, 0.5], [-7, -10, 0.5], [-23, -3]]), { fill: C.teal, opacity: 55 }),
    group('spark', star(4, 20, 6), { fill: C.paper }),
    group('core', ellipse(0, 0, 7, 7), { fill: C.gold }),
  ], { p: [ORB[0], ORB[1], 0], s: pulse, r: [[0, 0, E.soft], [T.arrive - 6, 0, E.out], [T.arrive + 34, 90, 'hold'], [T.emit + 22, 90, 'hold'], [T.reset, 90, E.inOut], [END, 0]] });
}

// ─── The phone, held at the right ──────────────────────────────────────────
{
  const [px, py] = PHONE;
  const W = 150;
  const H = 292;
  // The hand comes up from the bottom right and wraps the phone's lower edge.
  layer('hand back', [
    group('wrist', limb([px + 60, 470], [px + 40, py + 110], 62, 54), { fill: C.skin }),
    group('palm', smooth([[px - 40, py + 150], [px - 60, py + 110], [px - 44, py + 70], [px + 10, py + 60], [px + 70, py + 80], [px + 74, py + 140], [px + 30, py + 166]]), { fill: C.skin }),
    group('palm shade', smooth([[px - 40, py + 150], [px - 20, py + 120], [px + 30, py + 128], [px + 30, py + 166]]), { fill: C.skinShade, opacity: 60 }),
  ]);
  layer('phone', [
    group('shadow', rect(4, 8, W, H, 24), { fill: C.ink, opacity: 10 }),
    group('body', rect(0, 0, W, H, 24), { fill: C.phone }),
    group('body edge', rect(0, 0, W, H, 24), { stroke: C.phoneEdge, width: 2 }),
    group('screen', rect(0, 0, W - 16, H - 16, 18), { fill: C.paper }),
    group('notch', rect(0, -H / 2 + 16, 44, 8, 4), { fill: C.phone }),
    group('status', rect(-46, -H / 2 + 18, 20, 3, 1.5), { fill: C.line }),
    group('status 2', rect(48, -H / 2 + 18, 16, 3, 1.5), { fill: C.line }),
    // search field and a couple of quiet rows, so the screen is not blank
    group('search', rect(0, -H / 2 + 44, W - 40, 22, 11), { fill: C.sage }),
    group('search lens', ellipse(-44, -H / 2 + 44, 8, 8), { stroke: C.teal, width: 1.8 }),
    group('search text', rect(-8, -H / 2 + 44, 40, 4, 2), { fill: C.line }),
    group('row 1', rect(0, H / 2 - 48, W - 40, 5, 2.5), { fill: C.lineSoft }),
    group('row 2', rect(-12, H / 2 - 36, W - 64, 5, 2.5), { fill: C.lineSoft }),
    group('home bar', rect(0, H / 2 - 16, 44, 4, 2), { fill: C.line }),
  ], { p: [px, py, 0], r: -6, s: oscillate([100, 100, 100], [101, 101, 100], 100, 1) });
  // Fingers over the phone's lower edge.
  layer('fingers', [
    group('finger 1', limb([px - 62, py + 96], [px - 30, py + 104], 22, 20), { fill: C.skin }),
    group('finger 2', limb([px - 64, py + 118], [px - 30, py + 126], 22, 20), { fill: C.skin }),
    group('thumb', limb([px + 78, py + 60], [px + 56, py + 12], 26, 22), { fill: C.skin }),
    group('thumb tip', ellipse(px + 54, py + 8, 22, 22), { fill: C.skin }),
  ]);

  // The reading card: emitted by the orb, arcs onto the screen, then writes.
  const cardW = W - 40;
  const cardH = 150;
  const landAt = [px + 2, py - 14];
  layer('reading card', [
    group('card shadow', rect(2, 3, cardW, cardH, 12), { fill: C.ink, opacity: 8 }),
    group('card', rect(0, 0, cardW, cardH, 12), { fill: C.paper }),
    group('card edge', rect(0, 0, cardW, cardH, 12), { stroke: C.lineSoft, width: 1.5 }),
    group('level pill', rect(-cardW / 2 + 26, -cardH / 2 + 18, 36, 14, 7), { fill: C.teal }),
    group('level dots', [ellipse(-cardW / 2 + 18, -cardH / 2 + 18, 4, 4), ellipse(-cardW / 2 + 26, -cardH / 2 + 18, 4, 4), ellipse(-cardW / 2 + 34, -cardH / 2 + 18, 4, 4)], { fill: C.paper }),
    leftAnchored(-cardW / 2 + 12, -cardH / 2 + 42, 82, 6, 3, { fill: C.ink }, grow(T.write, { out: T.reset })),
    leftAnchored(-cardW / 2 + 12, -cardH / 2 + 58, 86, 5, 2.5, { fill: C.line }, grow(T.write + 4, { out: T.reset })),
    leftAnchored(-cardW / 2 + 10, -cardH / 2 + 74, 90, 11, 5.5, { fill: C.yellow, opacity: 80 }, grow(T.write + 20, { out: T.reset, dur: 12 })),
    leftAnchored(-cardW / 2 + 12, -cardH / 2 + 74, 76, 5, 2.5, { fill: C.ink }, grow(T.write + 8, { out: T.reset })),
    leftAnchored(-cardW / 2 + 12, -cardH / 2 + 90, 60, 5, 2.5, { fill: C.line }, grow(T.write + 12, { out: T.reset })),
    group('meter label', rect(-cardW / 2 + 28, cardH / 2 - 30, 32, 3, 1.5), { fill: C.line }),
    group('meter track', rect(0, cardH / 2 - 18, cardW - 24, 6, 3), { fill: C.lineSoft }),
    leftAnchored(-cardW / 2 + 12, cardH / 2 - 18, cardW - 24, 6, 3, { fill: C.teal }, [[0, [0, 100], 'hold'], [T.write + 14, [0, 100], E.out], [T.write + 34, [58, 100], 'hold'], [T.reset, [58, 100], E.in], [T.reset + 8, [0, 100], 'hold'], [END, [0, 100]]]),
    group('tick', ellipse(cardW / 2 - 18, cardH / 2 - 30, 20, 20), { fill: C.teal, transform: { a: [cardW / 2 - 18, cardH / 2 - 30], p: [cardW / 2 - 18, cardH / 2 - 30], s: pop(T.write + 30, { out: T.reset }) } }),
    group('tick mark', curve([[cardW / 2 - 23, cardH / 2 - 30], [cardW / 2 - 20, cardH / 2 - 27], [cardW / 2 - 13, cardH / 2 - 34]]), { stroke: C.paper, width: 2.4, transform: { a: [cardW / 2 - 18, cardH / 2 - 30], p: [cardW / 2 - 18, cardH / 2 - 30], s: pop(T.write + 30, { out: T.reset }) } }),
  ], {
    p: [
      [0, [ORB[0], ORB[1], 0], 'hold'], [T.emit, [ORB[0], ORB[1], 0], E.inOut, { to: [90, -60], ti: [-10, -70] }],
      [T.land, [landAt[0], landAt[1], 0], E.out], [T.land + 8, [landAt[0], landAt[1] + 3, 0], E.soft], [T.land + 16, [landAt[0], landAt[1], 0], 'hold'],
      [T.reset, [landAt[0], landAt[1], 0], 'hold'], [T.reset + 1, [ORB[0], ORB[1], 0], 'hold'], [END, [ORB[0], ORB[1], 0]],
    ],
    r: [[0, 20, 'hold'], [T.emit, 20, E.out], [T.land, -6, 'hold'], [T.reset, -6, 'hold'], [T.reset + 1, 20, 'hold'], [END, 20]],
    s: [[0, [14, 14, 100], 'hold'], [T.emit, [14, 14, 100], E.out], [T.land, [104, 104, 100], E.out], [T.land + 10, [100, 100, 100], 'hold'], [T.reset, [100, 100, 100], E.in], [T.reset + 10, [14, 14, 100], 'hold'], [END, [14, 14, 100]]],
    o: [[0, 0, 'hold'], [T.emit, 0, E.out], [T.emit + 8, 100, 'hold'], [T.reset, 100, E.in], [T.reset + 8, 0, 'hold'], [END, 0]],
  });
  // Arrival spark above the phone.
  const sparkAt = [px + 60, py - 150];
  layer('spark', [
    group('glow', ellipse(0, 0, 40, 40), { fill: C.yellow, opacity: 28 }),
    group('star', star(4, 15, 5), { fill: C.yellow }),
    group('core', ellipse(0, 0, 5, 5), { fill: C.paper }),
    group('dot 1', ellipse(20, -10, 5, 5), { fill: C.gold }),
    group('dot 2', ellipse(-18, 12, 4, 4), { fill: C.goldLight }),
  ], {
    p: [[0, [sparkAt[0], sparkAt[1], 0], 'hold'], [T.spark, [sparkAt[0], sparkAt[1], 0], E.out], [T.spark + 20, [sparkAt[0], sparkAt[1] - 10, 0], 'hold'], [END, [sparkAt[0], sparkAt[1], 0]]],
    s: [[0, [0, 0, 100], 'hold'], [T.spark, [0, 0, 100], E.out], [T.spark + 10, [118, 118, 100], E.out], [T.spark + 20, [100, 100, 100], 'hold'], [T.reset, [100, 100, 100], E.in], [T.reset + 10, [0, 0, 100], 'hold'], [END, [0, 0, 100]]],
    r: [[0, 0, 'hold'], [T.spark, -30, E.out], [T.spark + 20, 12, 'hold'], [END, 12]],
  });
}

console.log('Wrote ' + write(path.join(__dirname, '..', 'public', 'media', 'proj-arch-hero-light.json')));
