// Builds public/media/proj-arch-hero-light.json, the animation beside the
// Proj Arch page's title.
//
//   node scripts/generate-hero-lottie.cjs
//
// The scene, in the same character idiom as the mission and feature
// animations: a verified scholar's paper flies into Veri AI, which writes a
// reading card that a learner holds up. The card is rewritten for grade 3,
// then grade 5, then grade 9, the sentence that proves the answer is
// highlighted, and a thread draws back from the card to the scholar.
//
// No text layers: every label is a shape, so the artwork never depends on a
// font. The "rest" marker sits on the fully written grade 9 card with the
// thread drawn, which is the still that reduced-motion visitors see.

const path = require('path');
const {
  E, bez, add, smooth, limb, curve, rect, ellipse, star, crescent, group, createDocument, at,
} = require('./lib/lottie.cjs');

const END = 300;
const FLOOR = 468;
const { layer, oscillate, blink, write } = createDocument({
  w: 640, h: 520, end: END, name: 'Proj Arch header — scholar paper to learner reading card',
  markers: [
    { tm: 0, cm: 'paper', dr: 0 },
    { tm: 96, cm: 'adapt', dr: 0 },
    { tm: 132, cm: 'grade 3', dr: 0 },
    { tm: 176, cm: 'grade 5', dr: 0 },
    { tm: 220, cm: 'grade 9', dr: 0 },
    { tm: 262, cm: 'rest', dr: 0 },
  ],
});

const C = {
  ink: '#183e48', teal: '#326776', tealSoft: '#5b8a95', tealTint: '#dfe9e6', sage: '#edf2ee',
  cream: '#f6f5f1', paper: '#ffffff', line: '#c7d2cd', lineSoft: '#e2e7e3',
  gold: '#aa8051', goldLight: '#d9b47b', yellow: '#efc66c', coral: '#e77757', coralShade: '#c95d40',
  trouser: '#2a4f5a', trouserShade: '#1f3d47', sneaker: '#f7f5f0',
  skinA: '#c68a63', skinAShade: '#a9704c', skinB: '#7b4b33', skinBShade: '#5f3826',
  hair: '#1d2a30', hairShine: '#2f3f47', coat: '#f2ede3',
};
const overshoot = bez(0.34, 1.56, 0.64, 1);
let learnerRoot;

// Frame plan
const T = { launch: 40, arrive: 96, write3: 132, write5: 176, write9: 220, thread: 228, rest: 262, reset: 284 };

// Keyframe helpers shared with the feature generator's vocabulary.
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
const window = (from, to, { fadeIn = 8, fadeOut = 6 } = {}) => [
  [0, 0, 'hold'], [from, 0, E.out], [from + fadeIn, 100, 'hold'], [to, 100, E.in], [to + fadeOut, 0, 'hold'], [END, 0],
];

// ═══════════════════════════════════════════════════════════════════════════
// Scene constants
// ═══════════════════════════════════════════════════════════════════════════
const SCHOLAR = [112, 118];
const ORB = [306, 108];
const CARD = [400, 302];        // card centre; the card is 224 x 250
const LEARNER = [566, FLOOR];

// ═══════════════════════════════════════════════════════════════════════════
// Background and floor
// ═══════════════════════════════════════════════════════════════════════════
layer('backdrop', [
  group('left field', smooth([[24, 120], [120, 30], [250, 56], [286, 170], [246, 300], [140, 372], [40, 340], [8, 226]]), { fill: C.sage }),
  group('right field', smooth([[360, 150], [470, 80], [600, 110], [634, 250], [606, 400], [500, 470], [392, 440], [340, 300]]), { fill: C.yellow, opacity: 20 }),
  group('centre glow', ellipse(ORB[0], ORB[1], 190, 190), { fill: C.cream, opacity: 90 }),
]);
layer('floor', [
  group('floor line', rect(430, FLOOR + 2, 380, 2, 1), { fill: C.lineSoft }),
  group('learner shadow', ellipse(LEARNER[0] - 4, FLOOR + 2, 150, 20), { fill: C.ink, opacity: 9 }),
  group('card shadow', ellipse(CARD[0], FLOOR + 2, 150, 14), { fill: C.ink, opacity: 6 }),
]);

// ═══════════════════════════════════════════════════════════════════════════
// Verified scholar badge (top-left) and the thread back to it
// ═══════════════════════════════════════════════════════════════════════════
{
  const [x, y] = SCHOLAR;
  const k = 1.7; // portrait drawn at a 60px reference, scaled up
  layer('scholar badge', [
    group('ring', ellipse(x, y, 118, 118), { fill: C.tealTint }),
    group('disc', ellipse(x, y, 104, 104), { fill: C.paper }),
    group('shoulders', smooth([[x - 22 * k, y + 30 * k], [x - 18 * k, y + 8 * k], [x, y + 2 * k], [x + 18 * k, y + 8 * k], [x + 22 * k, y + 30 * k]], false), { fill: C.coat }),
    group('shirt', smooth([[x - 7 * k, y + 6 * k, 0], [x, y + 18 * k, 0], [x + 7 * k, y + 6 * k, 0]]), { fill: C.teal }),
    group('neck', rect(x, y + 4 * k, 9 * k, 10 * k, 3 * k), { fill: C.skinAShade }),
    group('head', smooth([[x, y - 22 * k], [x + 12 * k, y - 18 * k], [x + 14 * k, y - 4 * k], [x + 8 * k, y + 8 * k], [x - 8 * k, y + 8 * k], [x - 14 * k, y - 4 * k], [x - 12 * k, y - 18 * k]]), { fill: C.skinA }),
    group('hair', smooth([[x - 15 * k, y - 6 * k], [x - 14 * k, y - 20 * k], [x, y - 27 * k], [x + 14 * k, y - 20 * k], [x + 15 * k, y - 6 * k, 0.4], [x + 9 * k, y - 12 * k], [x - 2 * k, y - 14 * k], [x - 10 * k, y - 10 * k]]), { fill: C.hair }),
    group('eye left', ellipse(x - 5 * k, y - 4 * k, 2.2 * k, 3 * k), { fill: C.ink, transform: { a: [x - 5 * k, y - 4 * k], p: [x - 5 * k, y - 4 * k], s: blink([70, 190]) } }),
    group('eye right', ellipse(x + 5 * k, y - 4 * k, 2.2 * k, 3 * k), { fill: C.ink, transform: { a: [x + 5 * k, y - 4 * k], p: [x + 5 * k, y - 4 * k], s: blink([70, 190]) } }),
    group('glasses', [ellipse(x - 5 * k, y - 4 * k, 9 * k, 8 * k), ellipse(x + 5 * k, y - 4 * k, 9 * k, 8 * k)], { stroke: C.ink, width: 1.2 * k }),
    group('smile', curve([[x - 4 * k, y + 2 * k], [x, y + 4 * k], [x + 4 * k, y + 2 * k]]), { stroke: C.skinAShade, width: 1.4 * k }),
    // The disc clips nothing, so the shoulders are trimmed by drawing the
    // ring's outside back over them.
    group('mask ring', ellipse(x, y, 140, 140), { stroke: C.sage, width: 22 }),
    group('ring edge', ellipse(x, y, 118, 118), { stroke: C.tealTint, width: 8 }),
  ], { a: [x, y, 0], p: [x, y, 0], s: oscillate([100, 100, 100], [102, 102, 100], 100) });
  layer('scholar name', [
    group('name', rect(x, y + 80, 76, 7, 3.5), { fill: C.ink }),
    group('role', rect(x, y + 94, 50, 5, 2.5), { fill: C.line }),
  ]);
  const tickAt = [x + 40, y + 42];
  layer('verified tick', [
    group('badge', ellipse(0, 0, 30, 30), { fill: C.gold }),
    group('badge ring', ellipse(0, 0, 36, 36), { stroke: C.paper, width: 3 }),
    group('tick', curve([[-7, 1], [-2, 6], [8, -5]]), { stroke: C.paper, width: 3.4 }),
  ], {
    p: [tickAt[0], tickAt[1], 0],
    s: [[0, [100, 100, 100], E.soft], [T.thread + 20, [100, 100, 100], E.out], [T.thread + 30, [118, 118, 100], E.out], [T.thread + 44, [100, 100, 100], 'hold'], [END, [100, 100, 100]]],
  });
  // The thread: from the card's tick back to the scholar's badge.
  layer('thread', [
    group('thread', curve([[at(CARD, [-112, -60])[0], at(CARD, [-112, -60])[1]], [250, 250], [190, 190], [tickAt[0] + 14, tickAt[1] + 10]]), {
      stroke: C.gold, width: 2.5, dash: [5, 6],
      trim: { s: 0, e: [[0, 0, 'hold'], [T.thread, 0, E.out], [T.thread + 26, 100, 'hold'], [T.reset, 100, E.in], [T.reset + 10, 0, 'hold'], [END, 0]] },
    }),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// Veri AI orb
// ═══════════════════════════════════════════════════════════════════════════
{
  const pulse = [[0, [100, 100, 100], E.soft], [T.arrive - 6, [100, 100, 100], E.out], [T.arrive + 6, [90, 90, 100], E.out], [T.arrive + 20, [112, 112, 100], E.soft], [T.arrive + 34, [100, 100, 100], 'hold'], [END, [100, 100, 100]]];
  layer('orbit', [
    group('ring', ellipse(0, 0, 124, 124), { stroke: C.gold, width: 2, opacity: 45, dash: [3, 8] }),
    group('dot', ellipse(62, 0, 8, 8), { fill: C.gold }),
    group('dot 2', ellipse(-62, 0, 5, 5), { fill: C.goldLight }),
  ], { p: [ORB[0], ORB[1], 0], r: [[0, 0, E.linear], [T.arrive, 100, E.inOut], [T.write3, 300, E.linear], [END, 720]] });
  layer('flare', [group('flare', ellipse(0, 0, 120, 120), { stroke: C.goldLight, width: 3 })], {
    p: [ORB[0], ORB[1], 0],
    s: [[0, [60, 60, 100], 'hold'], [T.arrive, [60, 60, 100], E.out], [T.arrive + 30, [150, 150, 100], 'hold'], [END, [60, 60, 100]]],
    o: [[0, 0, 'hold'], [T.arrive, 90, E.out], [T.arrive + 30, 0, 'hold'], [END, 0]],
  });
  layer('orb', [
    group('outer', ellipse(0, 0, 96, 96), { fill: C.tealTint }),
    group('mid', ellipse(0, 0, 78, 78), { fill: C.teal }),
    group('inner', ellipse(0, 0, 62, 62), { fill: C.ink }),
    group('shine', smooth([[-18, -18], [-3, -27], [12, -22, 0.5], [-7, -10, 0.5], [-22, -3]]), { fill: C.teal, opacity: 55 }),
    group('spark', star(4, 19, 6), { fill: C.paper }),
    group('core', ellipse(0, 0, 7, 7), { fill: C.gold }),
  ], { p: [ORB[0], ORB[1], 0], s: pulse, r: [[0, 0, E.soft], [T.arrive - 6, 0, E.out], [T.arrive + 34, 90, 'hold'], [T.reset, 90, E.inOut], [END, 0]] });
  // Three beams from the orb to the card as it writes, one per level.
  [T.write3, T.write5, T.write9].forEach((t, k) => {
    layer(`beam ${k + 1}`, [group('beam', curve([[ORB[0] + 30, ORB[1] + 30], [ORB[0] + 60, CARD[1] - 160], [CARD[0] - 70, CARD[1] - 128]]), {
      stroke: C.tealSoft, width: 3, opacity: 70,
      trim: { s: [[0, 0, 'hold'], [t - 6, 0, E.inOut], [t + 14, 100, 'hold'], [END, 100]], e: [[0, 0, 'hold'], [t - 12, 0, E.out], [t + 6, 100, 'hold'], [END, 100]] },
    })]);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// The research paper: beside the scholar, then an arc into the orb
// ═══════════════════════════════════════════════════════════════════════════
{
  const paperAt = at(SCHOLAR, [96, 40]);
  const shapes = [
    group('shadow', rect(2, 4, 84, 108, 8), { fill: C.ink, opacity: 8 }),
    group('sheet', rect(0, 0, 84, 108, 8), { fill: C.paper }),
    group('edge', rect(0, 0, 84, 108, 8), { stroke: C.lineSoft, width: 1.5 }),
    group('title', rect(-14, -40, 46, 6, 3), { fill: C.ink }),
    group('byline', rect(-22, -30, 30, 4, 2), { fill: C.line }),
    ...[-18, -10, -2, 6, 14, 22].map((y, k) => group(`line ${k + 1}`, rect(k % 2 ? -3 : -1, y, k % 2 ? 62 : 66, 3.4, 1.7), { fill: C.line })),
    group('axis', rect(-2, 44, 66, 1.5, 0.75), { fill: C.line }),
    group('bar 1', rect(-22, 38, 7, 10, 2), { fill: C.teal }),
    group('bar 2', rect(-10, 34, 7, 18, 2), { fill: C.gold }),
    group('bar 3', rect(2, 30, 7, 26, 2), { fill: C.ink }),
    group('bar 4', rect(14, 36, 7, 14, 2), { fill: C.tealSoft }),
  ];
  layer('paper', shapes, {
    p: [
      [0, [paperAt[0], paperAt[1], 0], E.soft], [T.launch, [paperAt[0], paperAt[1] - 6, 0], E.inOut, { to: [60, -90], ti: [-40, 10] }],
      [T.arrive, [ORB[0], ORB[1], 0], 'hold'], [T.reset, [ORB[0], ORB[1], 0], 'hold'], [T.reset + 1, [paperAt[0], paperAt[1] + 10, 0], E.out], [END, [paperAt[0], paperAt[1], 0]],
    ],
    r: [[0, -8, E.soft], [T.launch, -4, E.inOut], [T.arrive, 20, 'hold'], [T.reset, 20, 'hold'], [T.reset + 1, -8, 'hold'], [END, -8]],
    s: [[0, [100, 100, 100], 'hold'], [T.launch, [100, 100, 100], E.in], [T.arrive, [16, 16, 100], 'hold'], [T.reset, [16, 16, 100], 'hold'], [T.reset + 1, [100, 100, 100], 'hold'], [END, [100, 100, 100]]],
    o: [[0, 100, 'hold'], [T.arrive - 10, 100, E.in], [T.arrive, 0, 'hold'], [T.reset, 0, E.out], [T.reset + 12, 100, 'hold'], [END, 100]],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Learner: standing at the right, holding the card's edge
// ═══════════════════════════════════════════════════════════════════════════
{
  const O = LEARNER;
  const bob = oscillate([O[0], O[1], 0], [O[0], O[1] - 3, 0], 100, 1);
  const root = layer('learner', [
    group('back leg', limb([16, -112], [20, -22], 30, 24), { fill: C.trouserShade }),
    group('back sneaker', smooth([[8, -22, 0.4], [18, -34], [42, -30], [54, -18], [52, -4, 0], [6, -4, 0]]), { fill: C.line }),
    group('front leg', limb([-14, -112], [-18, -22], 30, 24), { fill: C.trouser }),
    group('front sneaker', smooth([[-30, -22, 0.4], [-20, -36], [-46, -32], [-62, -16], [-60, -4, 0], [-30, -4, 0]]), { fill: C.sneaker }),
    group('front sneaker sole', smooth([[-62, -12, 0], [-30, -10, 0], [-30, -4, 0], [-60, -4, 0]]), { fill: C.line }),
    group('sneaker stripe', curve([[-52, -22], [-40, -24], [-30, -20]]), { stroke: C.coral, width: 3 }),
    group('back sleeve', limb([40, -212], [56, -150], 26, 20), { fill: C.coralShade }),
    group('back hand', ellipse(58, -140, 22, 22), { fill: C.skinBShade }),
    group('hoodie', smooth([[-48, -224], [-54, -170], [-48, -102, 0.6], [48, -100, 0.6], [54, -172], [48, -226], [16, -240, 0.4], [-16, -240, 0.4]]), { fill: C.coral }),
    group('hoodie shade', crescent([[-48, -224], [-54, -170], [-48, -102], [48, -100], [54, -172], [48, -226], [16, -240], [-16, -240]], 3, 5, [0, -170], 12), { fill: C.coralShade }),
    group('pocket', smooth([[-32, -134, 0], [30, -132, 0], [26, -108, 0], [-28, -110, 0]]), { fill: C.coralShade, opacity: 60 }),
    group('hood', smooth([[-24, -246], [0, -256], [26, -246], [32, -230], [4, -224], [-28, -230]]), { fill: C.coralShade }),
    group('drawstring left', curve([[-8, -234], [-10, -218], [-8, -206]]), { stroke: C.cream, width: 2 }),
    group('drawstring right', curve([[8, -234], [10, -220], [12, -208]]), { stroke: C.cream, width: 2 }),
    group('neck', rect(-2, -242, 22, 26, 8), { fill: C.skinB }),
    group('neck shade', ellipse(-2, -234, 24, 12), { fill: C.skinBShade }),
  ], { p: bob });

  const headPoints = [[-4, -320], [-30, -312], [-40, -290], [-38, -266], [-26, -246], [-6, -238], [16, -242], [32, -258], [36, -282], [30, -306]];
  const crownCentre = [-2, -290];
  const cap = smooth([[-44, -276], [-42, -312], [-24, -332], [-2, -338], [22, -332], [40, -312], [46, -276, 0.4], [30, -296], [-2, -306], [-36, -296, 0.4]]);
  const curls = [];
  [[186, 48, 24], [206, 50, 28], [228, 51, 32], [250, 52, 34], [272, 52, 36], [294, 51, 34], [316, 50, 32], [338, 48, 28], [356, 46, 24]].forEach(([deg, radius, size], k) => {
    const rad = (deg * Math.PI) / 180;
    curls.push(group(`curl ${k + 1}`, ellipse(crownCentre[0] + Math.cos(rad) * radius, crownCentre[1] + Math.sin(rad) * radius, size, size), { fill: C.hair }));
  });
  curls.push(group('curl side', ellipse(42, -280, 24, 26), { fill: C.hair }), group('curl nape', ellipse(36, -258, 16, 18), { fill: C.hair }));
  layer('learner head', [
    group('ear', ellipse(36, -278, 14, 18), { fill: C.skinB }),
    group('ear inner', ellipse(35, -278, 7, 9), { fill: C.skinBShade }),
    group('face', smooth(headPoints), { fill: C.skinB }),
    group('face shade', crescent(headPoints, 6, 9, [-2, -280], 9), { fill: C.skinBShade }),
    group('blush', ellipse(-28, -270, 14, 8), { fill: C.coral, opacity: 30 }),
    group('brow left', curve([[-30, -290], [-22, -294], [-14, -291]]), { stroke: C.hair, width: 2.6 }),
    group('brow right', curve([[-2, -292], [6, -296], [14, -292]]), { stroke: C.hair, width: 2.6 }),
    group('eye left', ellipse(-22, -278, 5.2, 7), { fill: C.ink, transform: { a: [-22, -278], p: [-22, -278], s: blink([110, 240]) } }),
    group('eye right', ellipse(6, -278, 5.2, 7), { fill: C.ink, transform: { a: [6, -278], p: [6, -278], s: blink([110, 240]) } }),
    group('eye light left', ellipse(-20.5, -280, 1.8, 1.8), { fill: C.paper }),
    group('eye light right', ellipse(7.5, -280, 1.8, 1.8), { fill: C.paper }),
    group('nose', curve([[-16, -268], [-20, -260], [-14, -257]]), { stroke: C.skinBShade, width: 2.2 }),
    group('smile', curve([[-22, -250], [-10, -246], [2, -250]]), { stroke: C.skinBShade, width: 2.4, transform: { o: [[0, 100, 'hold'], [T.write5 + 16, 100, 'hold'], [T.write5 + 17, 0, 'hold'], [T.reset, 0, 'hold'], [T.reset + 1, 100, 'hold'], [END, 100]] } }),
    group('grin', smooth([[-24, -252, 0.5], [-10, -254], [4, -252, 0.5], [-4, -242], [-16, -242]]), { fill: C.paper, transform: { o: [[0, 0, 'hold'], [T.write5 + 16, 0, 'hold'], [T.write5 + 17, 100, 'hold'], [T.reset, 100, 'hold'], [T.reset + 1, 0, 'hold'], [END, 0]] } }),
    group('grin lip', curve([[-24, -252], [-10, -254], [4, -252]]), { stroke: C.skinBShade, width: 2, transform: { o: [[0, 0, 'hold'], [T.write5 + 16, 0, 'hold'], [T.write5 + 17, 100, 'hold'], [T.reset, 100, 'hold'], [T.reset + 1, 0, 'hold'], [END, 0]] } }),
    group('hair cap', cap, { fill: C.hair }),
    ...curls,
    group('hair shine 1', ellipse(-18, -336, 9, 9), { fill: C.hairShine }),
    group('hair shine 2', ellipse(10, -342, 7, 7), { fill: C.hairShine }),
  ], {
    a: [-2, -240, 0], p: [-2, -240, 0],
    r: [[0, 4, E.soft], [T.arrive, 4, E.inOut], [T.write3, 8, E.soft], [T.write5 + 10, 4, E.out], [T.write5 + 18, 10, E.out], [T.write9 + 20, 6, E.soft], [T.rest + 20, 8, E.soft], [END, 4]],
  }, { parent: root });
  learnerRoot = root;
}

// ═══════════════════════════════════════════════════════════════════════════
// The reading card, held up beside the learner
// ═══════════════════════════════════════════════════════════════════════════
{
  const W = 224;
  const H = 250;
  layer('card', [
    group('shadow', rect(4, 8, W, H, 18), { fill: C.ink, opacity: 8 }),
    group('card', rect(0, 0, W, H, 18), { fill: C.paper }),
    group('card edge', rect(0, 0, W, H, 18), { stroke: C.lineSoft, width: 1.5 }),
    group('header band', rect(0, -H / 2 + 22, W, 44, 0), { fill: C.sage, opacity: 60 }),
    group('header top', rect(0, -H / 2 + 9, W, 18, 18), { fill: C.sage, opacity: 60 }),
    group('title', rect(-38, -H / 2 + 22, 96, 7, 3.5), { fill: C.ink }),
    // Faint ruled lines: the card reads as a blank worksheet before Veri writes.
    ...[-66, -46, -26, -6, 14].map((y, k) => group(`rule ${k + 1}`, rect(0, y, 184, 1.5, 0.75), { fill: C.lineSoft })),
    // reading level meter
    group('meter label', rect(-70, H / 2 - 30, 44, 4, 2), { fill: C.line }),
    group('meter track', rect(0, H / 2 - 18, 176, 8, 4), { fill: C.lineSoft }),
    leftAnchored(-88, H / 2 - 18, 176, 8, 4, { fill: C.teal }, [
      [0, [0, 100], 'hold'], [T.write3, [0, 100], E.out], [T.write3 + 16, [30, 100], 'hold'], [T.write5, [30, 100], E.out], [T.write5 + 16, [58, 100], 'hold'],
      [T.write9, [58, 100], E.out], [T.write9 + 16, [88, 100], 'hold'], [T.reset, [88, 100], E.in], [T.reset + 10, [0, 100], 'hold'], [END, [0, 100]],
    ]),
  ], { a: [0, 0, 0], p: [CARD[0], CARD[1], 0], r: -3, s: oscillate([100, 100, 100], [101, 101, 100], 100, 1) });

  // Level pill with one, two or three dots.
  [0, 1, 2].forEach(level => {
    const start = [T.write3, T.write5, T.write9][level];
    const end = level < 2 ? [T.write5, T.write9][level] : T.reset;
    const dots = [];
    for (let d = 0; d <= level; d += 1) dots.push(ellipse(-level * 6 + d * 12, 0, 6, 6));
    layer(`level ${level + 1}`, [
      group('pill', rect(0, 0, 54, 20, 10), { fill: C.teal }),
      group('dots', dots, { fill: C.paper }),
    ], { p: [CARD[0] + 70, CARD[1] - H / 2 + 22, 0], r: -3, s: pop(start, { out: end }).map(([t, v, e]) => [t, [v[0], v[1], 100], e]) });
  });

  // Three rewrites of the same passage: line count and weight grow with level.
  const passages = [
    { rows: [[-92, -62, 176, 9], [-92, -40, 150, 9], [-92, -18, 164, 9], [-92, 4, 96, 9]], proof: null },
    { rows: [[-92, -66, 184, 7], [-92, -48, 170, 7], [-92, -30, 178, 7], [-92, -12, 160, 7], [-92, 6, 120, 7]], proof: 2 },
    { rows: [[-92, -70, 184, 5.5], [-92, -56, 180, 5.5], [-92, -42, 184, 5.5], [-92, -28, 176, 5.5], [-92, -14, 184, 5.5], [-92, 0, 170, 5.5], [-92, 14, 110, 5.5]], proof: 4 },
  ];
  passages.forEach(({ rows, proof }, level) => {
    const start = [T.write3, T.write5, T.write9][level];
    const end = level < 2 ? [T.write5, T.write9][level] : T.reset;
    const items = [];
    if (proof !== null) {
      const [x, y, w, h] = rows[proof];
      items.push(leftAnchored(x - 4, y, w + 8, h + 8, (h + 8) / 2, { fill: C.yellow, opacity: 80 }, grow(start + 22 + proof * 3, { dur: 12 })));
    }
    rows.forEach(([x, y, w, h], k) => items.push(leftAnchored(x, y, w, h, h / 2, { fill: k === 0 ? C.ink : C.line }, grow(start + 4 + k * 4, { dur: 12 }))));
    layer(`passage grade ${[3, 5, 9][level]}`, items, {
      p: [CARD[0], CARD[1], 0], r: -3,
      o: window(start, end, { fadeIn: 4, fadeOut: 6 }),
    });
  });

  // Proof tick: appears with the grade 5 rewrite and stays.
  layer('proof tick', [
    group('badge', ellipse(0, 0, 32, 32), { fill: C.teal }),
    group('badge ring', ellipse(0, 0, 38, 38), { stroke: C.paper, width: 3 }),
    group('tick', curve([[-8, 1], [-3, 6], [9, -6]]), { stroke: C.paper, width: 3.4 }),
  ], { p: [CARD[0] - 112 + 6, CARD[1] - 60, 0], s: pop(T.write5 + 30, { out: T.reset }).map(([t, v, e]) => [t, [v[0], v[1], 100], e]) });

  // Spark of understanding above the learner when the grade 9 card lands.
  const sparkAt = at(LEARNER, [-40, -372]);
  layer('spark', [
    group('glow', ellipse(0, 0, 44, 44), { fill: C.yellow, opacity: 28 }),
    group('star', star(4, 17, 6), { fill: C.yellow }),
    group('core', ellipse(0, 0, 6, 6), { fill: C.paper }),
    group('dot 1', ellipse(22, -12, 5, 5), { fill: C.gold }),
    group('dot 2', ellipse(-20, 12, 4, 4), { fill: C.goldLight }),
  ], {
    p: [[0, [sparkAt[0], sparkAt[1], 0], 'hold'], [T.write9 + 14, [sparkAt[0], sparkAt[1], 0], E.out], [T.write9 + 34, [sparkAt[0], sparkAt[1] - 10, 0], E.soft], [T.rest + 10, [sparkAt[0], sparkAt[1] - 12, 0], 'hold'], [END, [sparkAt[0], sparkAt[1], 0]]],
    s: [[0, [0, 0, 100], 'hold'], [T.write9 + 14, [0, 0, 100], E.out], [T.write9 + 24, [118, 118, 100], E.out], [T.write9 + 34, [100, 100, 100], E.soft], [T.reset, [100, 100, 100], E.in], [T.reset + 10, [0, 0, 100], 'hold'], [END, [0, 0, 100]]],
    r: [[0, 0, 'hold'], [T.write9 + 14, -30, E.out], [T.write9 + 34, 12, 'hold'], [END, 12]],
  });
}

// The learner's front arm is drawn last so the hand grips the card's edge.
layer('learner front arm', [
  group('sleeve', limb([-40, -216], [-54, -198], 28, 22), { fill: C.coral }),
  group('sleeve fold', curve([[-50, -212], [-46, -204], [-40, -202]]), { stroke: C.coralShade, width: 2.2 }),
  group('hand', smooth([[-72, -206], [-58, -212], [-46, -204], [-48, -188], [-62, -184], [-74, -192]]), { fill: C.skinB }),
  group('thumb', ellipse(-66, -208, 9, 12), { fill: C.skinBShade }),
], { p: [0, 0, 0] }, { parent: learnerRoot });

console.log('Wrote ' + write(path.join(__dirname, '..', 'public', 'media', 'proj-arch-hero-light.json')));
