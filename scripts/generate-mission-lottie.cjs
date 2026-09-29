// Builds public/media/proj-arch-mission-characters.json, the Lottie shown
// beside the mission copy on the Proj Arch page: "Make academic knowledge
// part of everyday learning."
//
//   node scripts/generate-mission-lottie.cjs
//
// The scene is a living room, not a classroom. A learner sits cross-legged
// on a floor cushion with a phone. Above them a thought bubble holds a dense
// idea, which becomes, in turn, things they already care about: a football,
// a guitar, a plant. On the last one a lightbulb lights, the learner grins,
// and the cat on the rug looks up. The header animation above shows the
// archive and the platform; this one shows the person.
//
// Drawn from bezier paths in the flat editorial idiom, with one shade tone
// per fill for depth, no outlines, ease-out travel, breathing and blinks,
// and a seamless 10 s loop. Coordinates: 640x520, floor at y=440.

const path = require('path');
const {
  E, bez, smooth, limb, curve, rect, ellipse, star, crescent, group, createDocument,
} = require('./lib/lottie.cjs');

const END = 300;
const FLOOR = 440;
const { layer, oscillate, blink, write } = createDocument({
  w: 640, h: 520, end: END, name: 'Proj Arch mission — everyday learning at home',
  markers: [
    { tm: 0, cm: 'idea', dr: 0 },
    { tm: 70, cm: 'football', dr: 0 },
    { tm: 130, cm: 'guitar', dr: 0 },
    { tm: 190, cm: 'plant', dr: 0 },
    { tm: 240, cm: 'lightbulb', dr: 0 },
    { tm: 262, cm: 'rest', dr: 0 },
  ],
});

const C = {
  ink: '#183e48', teal: '#326776', tealSoft: '#5b8a95', tealTint: '#dfe9e6', sage: '#edf2ee',
  cream: '#f6f5f1', paper: '#ffffff', line: '#c7d2cd', lineSoft: '#e2e7e3',
  gold: '#aa8051', goldLight: '#d9b47b', yellow: '#efc66c', coral: '#e77757', coralShade: '#c95d40',
  wood: '#d9c7a7', woodShade: '#bfa985', rug: '#e3d9c8', rugShade: '#d3c6b0', cushion: '#5b8a95', cushionShade: '#4a7580',
  skin: '#c68a63', skinShade: '#a9704c', hair: '#3a2418', hairShine: '#523425',
  sweater: '#efc66c', sweaterShade: '#d9ac4f', jeans: '#2a4f5a', jeansShade: '#1f3d47', sock: '#f7f5f0',
  cat: '#8f9aa0', catShade: '#727d83', catEar: '#e8b894', phone: '#1b2f37',
};
const overshoot = bez(0.34, 1.56, 0.64, 1);

// Frame plan: each thought holds for 60 frames, the bulb for the rest.
const T = { idea: 0, football: 70, guitar: 130, plant: 190, bulb: 240, rest: 262, reset: 288 };

const pop = (t, { out, from = 0 } = {}) => {
  const frames = [[0, [from, from], 'hold'], [t, [from, from], overshoot], [t + 14, [100, 100], 'hold']];
  if (out !== undefined) frames.push([out, [100, 100], E.in], [out + 8, [from, from], 'hold']);
  frames.push([END, [from, from]]);
  return frames;
};
const popXYZ = (t, opts) => pop(t, opts).map(([f, v, e]) => [f, [v[0], v[1], 100], e]);

const LEARNER = [330, FLOOR - 8];  // sitting on the cushion
const BUBBLE = [438, 118];

// ═══════════════════════════════════════════════════════════════════════════
// The room
// ═══════════════════════════════════════════════════════════════════════════
layer('backdrop', [
  group('wall wash', smooth([[30, 90], [170, 30], [470, 40], [610, 100], [630, 300], [560, 420], [200, 430], [30, 330]]), { fill: C.cream }),
  group('window', rect(150, 150, 150, 130, 14), { fill: C.tealTint }),
  group('window pane', rect(150, 150, 130, 110, 8), { fill: C.sage }),
  group('window bar v', rect(150, 150, 4, 110, 2), { fill: C.tealTint }),
  group('window bar h', rect(150, 150, 130, 4, 2), { fill: C.tealTint }),
  group('sky hill', smooth([[85, 205], [120, 170], [170, 186], [215, 168], [215, 205, 0]]), { fill: C.tealSoft, opacity: 40 }),
  group('sun', ellipse(190, 122, 24, 24), { fill: C.yellow, opacity: 80 }),
  group('sill', rect(150, 218, 170, 10, 4), { fill: C.wood }),
  group('sill pot', smooth([[112, 216, 0], [114, 194, 0], [138, 194, 0], [140, 216, 0]]), { fill: C.coral }),
  group('sill leaf 1', smooth([[126, 194], [112, 172], [122, 152], [132, 174]]), { fill: C.teal }),
  group('sill leaf 2', smooth([[126, 194], [140, 176], [146, 156], [130, 172]]), { fill: C.tealSoft }),
  group('picture', rect(540, 130, 70, 56, 6), { fill: C.paper }),
  group('picture inner', rect(540, 130, 56, 42, 3), { fill: C.tealTint }),
  group('picture hill', smooth([[514, 148], [530, 128], [548, 140], [566, 122], [568, 148, 0]]), { fill: C.teal, opacity: 60 }),
]);
layer('floor', [
  group('floor line', rect(320, FLOOR + 2, 620, 2, 1), { fill: C.lineSoft }),
  group('rug', ellipse(330, FLOOR - 6, 420, 60), { fill: C.rug }),
  group('rug ring', ellipse(330, FLOOR - 6, 380, 46), { stroke: C.rugShade, width: 3 }),
  // side table with a mug and books
  group('table top', rect(556, 330, 92, 10, 4), { fill: C.wood }),
  group('table leg l', rect(524, 386, 8, 104, 3), { fill: C.woodShade }),
  group('table leg r', rect(588, 386, 8, 104, 3), { fill: C.woodShade }),
  group('book stack 1', rect(546, 318, 44, 8, 2), { fill: C.teal }),
  group('book stack 2', rect(548, 310, 40, 8, 2), { fill: C.gold }),
  group('book stack 3', rect(544, 302, 46, 8, 2), { fill: C.coral }),
  group('mug', smooth([[576, 325, 0], [600, 325, 0], [597, 300, 0], [579, 300, 0]]), { fill: C.paper }),
  group('mug handle', curve([[600, 305], [610, 308], [609, 318], [600, 320]]), { stroke: C.paper, width: 4 }),
  group('mug band', rect(588, 318, 21, 4, 2), { fill: C.teal }),
  // floor lamp on the left
  group('lamp base', ellipse(70, FLOOR - 2, 56, 10), { fill: C.woodShade }),
  group('lamp pole', rect(70, 300, 6, 280, 3), { fill: C.woodShade }),
  group('lamp glow', ellipse(70, 150, 150, 110), { fill: C.yellow, opacity: 16 }),
  group('lamp shade', smooth([[36, 176, 0], [104, 176, 0], [92, 130, 0], [48, 130, 0]]), { fill: C.gold }),
  group('lamp shade rim', rect(70, 176, 70, 4, 2), { fill: C.goldLight }),
  // floor cushion
  group('cushion shade', ellipse(LEARNER[0], FLOOR - 2, 210, 30), { fill: C.cushionShade }),
  group('cushion', ellipse(LEARNER[0], FLOOR - 14, 210, 42), { fill: C.cushion }),
  group('cushion top', ellipse(LEARNER[0], FLOOR - 20, 180, 26), { fill: C.tealSoft, opacity: 60 }),
]);

// ═══════════════════════════════════════════════════════════════════════════
// The learner, cross-legged, phone in both hands
// ═══════════════════════════════════════════════════════════════════════════
{
  const O = LEARNER;
  const bob = oscillate([O[0], O[1], 0], [O[0], O[1] - 3, 0], 100);
  const root = layer('learner', [
    // crossed legs: back shin, both thighs, front shin, feet
    group('back shin', limb([-60, -50], [26, -30], 28, 24), { fill: C.jeansShade }),
    group('back sock', smooth([[16, -44, 0.4], [30, -50], [50, -42], [56, -28], [46, -16, 0], [18, -18, 0]]), { fill: C.sock }),
    group('left thigh', limb([-16, -100], [-78, -56], 36, 30), { fill: C.jeans }),
    group('right thigh', limb([18, -100], [80, -56], 36, 30), { fill: C.jeans }),
    group('front shin', limb([80, -56], [-20, -28], 28, 24), { fill: C.jeans }),
    group('front sock', smooth([[-10, -42, 0.4], [-26, -50], [-48, -42], [-56, -28], [-46, -16, 0], [-14, -18, 0]]), { fill: C.sock }),
    group('front sock stripe', curve([[-46, -36], [-36, -40], [-24, -36]]), { stroke: C.coral, width: 3 }),
    // torso: a chunky sweater
    group('sweater', smooth([[-52, -216], [-58, -160], [-50, -96, 0.6], [50, -94, 0.6], [58, -162], [52, -218], [18, -232, 0.4], [-18, -232, 0.4]]), { fill: C.sweater }),
    group('sweater shade', crescent([[-52, -216], [-58, -160], [-50, -96], [50, -94], [58, -162], [52, -218], [18, -232], [-18, -232]], 3, 5, [0, -160], 12), { fill: C.sweaterShade }),
    group('sweater hem', rect(0, -100, 100, 6, 3), { fill: C.sweaterShade, opacity: 70 }),
    group('collar', smooth([[-20, -232, 0.3], [0, -220], [20, -232, 0.3], [0, -238]]), { fill: C.sweaterShade }),
    group('neck', rect(0, -236, 22, 24, 8), { fill: C.skin }),
    group('neck shade', ellipse(0, -228, 24, 12), { fill: C.skinShade }),
  ], { p: bob });

  const headPoints = [[0, -318], [26, -310], [38, -290], [36, -264], [26, -242], [6, -234], [-16, -238], [-32, -256], [-38, -282], [-30, -306]];
  layer('learner head', [
    group('ear left', ellipse(-36, -274, 14, 18), { fill: C.skin }),
    group('ear right', ellipse(36, -274, 14, 18), { fill: C.skin }),
    group('face', smooth(headPoints), { fill: C.skin }),
    group('face shade', crescent(headPoints, 6, 9, [0, -278], 9), { fill: C.skinShade }),
    group('blush l', ellipse(-22, -262, 12, 7), { fill: C.coral, opacity: 26 }),
    group('blush r', ellipse(24, -262, 12, 7), { fill: C.coral, opacity: 26 }),
    group('brow left', curve([[-22, -292], [-14, -296], [-6, -293]]), { stroke: C.hair, width: 2.6 }),
    group('brow right', curve([[8, -293], [16, -296], [24, -292]]), { stroke: C.hair, width: 2.6 }),
    group('eye left', ellipse(-14, -280, 5, 7), { fill: C.ink, transform: { a: [-14, -280], p: [-14, -280], s: blink([90, 200]) } }),
    group('eye right', ellipse(16, -280, 5, 7), { fill: C.ink, transform: { a: [16, -280], p: [16, -280], s: blink([90, 200]) } }),
    group('eye light l', ellipse(-12.5, -282, 1.8, 1.8), { fill: C.paper }),
    group('eye light r', ellipse(17.5, -282, 1.8, 1.8), { fill: C.paper }),
    group('nose', curve([[2, -272], [4, -264], [-2, -261]]), { stroke: C.skinShade, width: 2.2 }),
    group('smile', curve([[-10, -250], [1, -246], [12, -250]]), { stroke: C.skinShade, width: 2.4, transform: { o: [[0, 100, 'hold'], [T.bulb + 8, 100, 'hold'], [T.bulb + 9, 0, 'hold'], [T.reset, 0, 'hold'], [T.reset + 1, 100, 'hold'], [END, 100]] } }),
    group('grin', smooth([[-13, -252, 0.5], [1, -254], [14, -252, 0.5], [7, -242], [-5, -242]]), { fill: C.paper, transform: { o: [[0, 0, 'hold'], [T.bulb + 8, 0, 'hold'], [T.bulb + 9, 100, 'hold'], [T.reset, 100, 'hold'], [T.reset + 1, 0, 'hold'], [END, 0]] } }),
    group('grin lip', curve([[-13, -252], [1, -254], [14, -252]]), { stroke: C.skinShade, width: 2, transform: { o: [[0, 0, 'hold'], [T.bulb + 8, 0, 'hold'], [T.bulb + 9, 100, 'hold'], [T.reset, 100, 'hold'], [T.reset + 1, 0, 'hold'], [END, 0]] } }),
    // hair: a soft cap with a bun on top
    group('hair', smooth([[-38, -276], [-40, -302], [-26, -322], [0, -330], [26, -322], [40, -302], [38, -278, 0.4], [28, -294], [12, -302], [-6, -300], [-22, -294], [-32, -284]]), { fill: C.hair }),
    group('bun', ellipse(6, -336, 40, 34), { fill: C.hair }),
    group('bun shine', ellipse(-2, -344, 12, 8), { fill: C.hairShine }),
    group('hair tie', rect(6, -322, 22, 5, 2.5), { fill: C.coral }),
  ], {
    a: [0, -234, 0], p: [0, -234, 0],
    r: [[0, -3, E.soft], [T.football, -3, E.inOut], [T.football + 20, 3, E.soft], [T.guitar, 3, E.inOut], [T.guitar + 20, -4, E.soft], [T.plant, -4, E.inOut], [T.plant + 20, 2, E.soft], [T.bulb, 2, E.out], [T.bulb + 10, -8, E.out], [T.bulb + 22, -2, E.soft], [END, -3]],
  }, { parent: root });

  // Arms and the phone, one layer so they move together.
  layer('learner arms', [
    group('left sleeve', limb([-44, -206], [-30, -150], 30, 24), { fill: C.sweater }),
    group('right sleeve', limb([44, -206], [30, -150], 30, 24), { fill: C.sweater }),
    group('left fold', curve([[-42, -186], [-36, -180], [-30, -182]]), { stroke: C.sweaterShade, width: 2.2 }),
    group('right fold', curve([[42, -186], [36, -180], [30, -182]]), { stroke: C.sweaterShade, width: 2.2 }),
    group('phone', rect(0, -150, 62, 96, 10), { fill: C.phone }),
    group('screen', rect(0, -150, 52, 84, 6), { fill: C.paper }),
    group('screen bar', rect(0, -184, 40, 6, 3), { fill: C.sage }),
    group('screen line 1', rect(-4, -166, 36, 4, 2), { fill: C.ink }),
    group('screen line 2', rect(-6, -156, 32, 4, 2), { fill: C.line }),
    group('screen line 3', rect(-2, -146, 40, 4, 2), { fill: C.line }),
    group('screen mark', rect(-8, -134, 28, 6, 3), { fill: C.yellow }),
    group('left hand', smooth([[-40, -160], [-26, -168], [-16, -160], [-18, -142], [-32, -138], [-42, -148]]), { fill: C.skin }),
    group('right hand', smooth([[40, -160], [26, -168], [16, -160], [18, -142], [32, -138], [42, -148]]), { fill: C.skin }),
    group('left thumb', ellipse(-20, -152, 9, 12), { fill: C.skinShade }),
    group('right thumb', ellipse(20, -152, 9, 12), { fill: C.skinShade }),
  ], { p: [[0, [0, 0, 0], E.soft], [T.bulb, [0, 0, 0], E.out], [T.bulb + 10, [0, -8, 0], E.out], [T.bulb + 20, [0, -5, 0], 'hold'], [T.reset, [0, -5, 0], E.inOut], [END, [0, 0, 0]]] }, { parent: root });
}

// ═══════════════════════════════════════════════════════════════════════════
// The cat on the rug, who looks up at the end
// ═══════════════════════════════════════════════════════════════════════════
{
  const cx = 168;
  const cy = FLOOR - 4;
  layer('cat', [
    group('tail', curve([[cx + 40, cy - 10], [cx + 70, cy - 20], [cx + 76, cy - 46]]), { stroke: C.cat, width: 10, transform: { a: [cx + 40, cy - 10], p: [cx + 40, cy - 10], r: [[0, 0, E.soft], [50, -8, E.soft], [100, 0, E.soft], [150, -8, E.soft], [200, 0, E.soft], [250, -8, E.soft], [END, 0]] } }),
    group('body', smooth([[cx - 44, cy - 6], [cx - 40, cy - 34], [cx - 10, cy - 46], [cx + 30, cy - 40], [cx + 46, cy - 14], [cx + 36, cy, 0.3], [cx - 34, cy, 0.3]]), { fill: C.cat }),
    group('body shade', smooth([[cx - 44, cy - 6], [cx - 20, cy - 14], [cx + 20, cy - 12], [cx + 46, cy - 14], [cx + 36, cy, 0.3], [cx - 34, cy, 0.3]]), { fill: C.catShade }),
  ]);
  layer('cat head', [
    group('ear l', smooth([[-16, -16, 0], [-12, -34, 0], [-2, -20, 0]]), { fill: C.cat }),
    group('ear r', smooth([[16, -16, 0], [12, -34, 0], [2, -20, 0]]), { fill: C.cat }),
    group('ear l inner', smooth([[-13, -19, 0], [-11, -29, 0], [-5, -20, 0]]), { fill: C.catEar }),
    group('ear r inner', smooth([[13, -19, 0], [11, -29, 0], [5, -20, 0]]), { fill: C.catEar }),
    group('head', ellipse(0, -8, 38, 34), { fill: C.cat }),
    group('eye l', ellipse(-8, -10, 4, 5), { fill: C.ink, transform: { a: [-8, -10], p: [-8, -10], s: [[0, [100, 12], 'hold'], [T.bulb + 6, [100, 12], E.out], [T.bulb + 14, [100, 100], 'hold'], [T.reset, [100, 100], E.in], [T.reset + 6, [100, 12], 'hold'], [END, [100, 12]]] } }),
    group('eye r', ellipse(8, -10, 4, 5), { fill: C.ink, transform: { a: [8, -10], p: [8, -10], s: [[0, [100, 12], 'hold'], [T.bulb + 6, [100, 12], E.out], [T.bulb + 14, [100, 100], 'hold'], [T.reset, [100, 100], E.in], [T.reset + 6, [100, 12], 'hold'], [END, [100, 12]]] } }),
    group('nose', smooth([[-3, -2, 0], [3, -2, 0], [0, 1, 0]]), { fill: C.catEar }),
    group('whisker l', curve([[-12, -1], [-26, -3]]), { stroke: C.catShade, width: 1.4 }),
    group('whisker r', curve([[12, -1], [26, -3]]), { stroke: C.catShade, width: 1.4 }),
  ], {
    a: [0, 0, 0],
    p: [[0, [cx - 26, cy - 28, 0], E.soft], [T.bulb, [cx - 26, cy - 28, 0], E.out], [T.bulb + 12, [cx - 22, cy - 44, 0], 'hold'], [T.reset, [cx - 22, cy - 44, 0], E.inOut], [END, [cx - 26, cy - 28, 0]]],
    r: [[0, 14, E.soft], [T.bulb, 14, E.out], [T.bulb + 12, -6, 'hold'], [T.reset, -6, E.inOut], [END, 14]],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// The thought bubble and what fills it
// ═══════════════════════════════════════════════════════════════════════════
{
  const [bx, by] = BUBBLE;
  layer('bubble', [
    group('trail 1', ellipse(bx - 74, by + 96, 12, 12), { fill: C.paper, transform: { a: [bx - 74, by + 96], p: [bx - 74, by + 96], s: oscillate([100, 100], [80, 80], 60) } }),
    group('trail 2', ellipse(bx - 58, by + 74, 20, 20), { fill: C.paper, transform: { a: [bx - 58, by + 74], p: [bx - 58, by + 74], s: oscillate([100, 100], [86, 86], 60, 1) } }),
    group('shadow', smooth([[bx - 70, by + 2], [bx - 50, by - 60], [bx + 10, by - 76], [bx + 74, by - 54], [bx + 84, by + 12], [bx + 46, by + 62], [bx - 30, by + 60]]), { fill: C.ink, opacity: 6, transform: { p: [3, 5] } }),
    group('cloud', smooth([[bx - 70, by + 2], [bx - 50, by - 60], [bx + 10, by - 76], [bx + 74, by - 54], [bx + 84, by + 12], [bx + 46, by + 62], [bx - 30, by + 60]]), { fill: C.paper }),
  ], { a: [bx, by, 0], p: [bx, by, 0], s: oscillate([100, 100, 100], [103, 103, 100], 100, 1) });

  // 1. The dense idea: a tangle of lines, a formula-like row, question mark.
  layer('thought idea', [
    group('tangle', curve([[-40, -6], [-26, -30], [-4, 4], [14, -28], [34, -2], [20, 26], [-10, 12], [-34, 24]]), { stroke: C.line, width: 3 }),
    group('row 1', rect(-6, -40, 60, 5, 2.5), { fill: C.ink }),
    group('row 2', rect(-2, 38, 44, 5, 2.5), { fill: C.line }),
    group('question', curve([[36, -34], [44, -42], [52, -34], [46, -26], [44, -20]]), { stroke: C.teal, width: 3.2 }),
    group('question dot', ellipse(44, -12, 4, 4), { fill: C.teal }),
  ], { p: [bx + 4, by - 6, 0], s: [[0, [100, 100, 100], 'hold'], [T.football - 8, [100, 100, 100], E.in], [T.football, [0, 0, 100], 'hold'], [T.reset, [0, 0, 100], E.out], [T.reset + 10, [100, 100, 100], 'hold'], [END, [100, 100, 100]]] });

  // 2. A football.
  layer('thought football', [
    group('ball', ellipse(0, 0, 76, 76), { fill: C.paper }),
    group('ball edge', ellipse(0, 0, 76, 76), { stroke: C.ink, width: 3 }),
    group('pent', smooth([[0, -16, 0], [15, -5, 0], [9, 13, 0], [-9, 13, 0], [-15, -5, 0]]), { fill: C.ink }),
    group('seam 1', curve([[0, -16], [0, -36]]), { stroke: C.ink, width: 2.5 }),
    group('seam 2', curve([[15, -5], [34, -12]]), { stroke: C.ink, width: 2.5 }),
    group('seam 3', curve([[9, 13], [22, 30]]), { stroke: C.ink, width: 2.5 }),
    group('seam 4', curve([[-9, 13], [-22, 30]]), { stroke: C.ink, width: 2.5 }),
    group('seam 5', curve([[-15, -5], [-34, -12]]), { stroke: C.ink, width: 2.5 }),
  ], { p: [bx + 4, by - 6, 0], s: popXYZ(T.football, { out: T.guitar - 8 }), r: [[0, -20, 'hold'], [T.football, -20, E.out], [T.guitar, 12, 'hold'], [END, 12]] });

  // 3. A guitar.
  layer('thought guitar', [
    group('neck', rect(24, -30, 12, 70, 3), { fill: C.gold, transform: { r: 30, a: [24, -30], p: [24, -30] } }),
    group('head', rect(46, -68, 16, 20, 4), { fill: C.ink, transform: { r: 30, a: [46, -68], p: [46, -68] } }),
    group('body', smooth([[-12, -4], [8, -16], [22, -2], [24, 18], [10, 34], [-14, 36], [-30, 22], [-30, 4]]), { fill: C.coral }),
    group('body shade', smooth([[-14, 36], [-30, 22], [-30, 4], [-12, -4], [-8, 14]]), { fill: C.coralShade }),
    group('hole', ellipse(0, 12, 16, 16), { fill: C.ink }),
    group('string 1', curve([[-24, 24], [46, -66]]), { stroke: C.cream, width: 1.4 }),
    group('string 2', curve([[-18, 30], [52, -60]]), { stroke: C.cream, width: 1.4 }),
  ], { p: [bx + 2, by - 4, 0], s: popXYZ(T.guitar, { out: T.plant - 8 }), r: [[0, 0, 'hold'], [T.guitar, -10, E.out], [T.plant, 4, 'hold'], [END, 4]] });

  // 4. A plant.
  layer('thought plant', [
    group('pot', smooth([[-22, 36, 0], [22, 36, 0], [17, 8, 0], [-17, 8, 0]]), { fill: C.coral }),
    group('pot rim', rect(0, 8, 46, 8, 4), { fill: C.coralShade }),
    group('stem', curve([[0, 8], [0, -30]]), { stroke: C.teal, width: 3 }),
    group('leaf 1', smooth([[0, -8], [-22, -20], [-30, -44], [-8, -34]]), { fill: C.teal }),
    group('leaf 2', smooth([[0, -16], [22, -28], [30, -52], [8, -40]]), { fill: C.tealSoft }),
    group('leaf 3', smooth([[0, -30], [-10, -48], [0, -62], [10, -48]]), { fill: C.teal }),
  ], { p: [bx + 4, by, 0], s: popXYZ(T.plant, { out: T.bulb - 8 }), r: [[0, 0, 'hold'], [T.plant, 8, E.out], [T.bulb, -4, 'hold'], [END, -4]] });

  // 5. The lightbulb.
  layer('thought bulb', [
    group('glow', ellipse(0, -8, 110, 110), { fill: C.yellow, opacity: 30 }),
    group('bulb', smooth([[0, -46], [26, -34], [30, -6], [16, 12], [-16, 12], [-30, -6], [-26, -34]]), { fill: C.yellow }),
    group('bulb shine', smooth([[-14, -30], [-6, -40], [2, -36, 0.5], [-8, -22, 0.5], [-18, -18]]), { fill: C.paper, opacity: 70 }),
    group('base', rect(0, 20, 26, 12, 4), { fill: C.ink }),
    group('base 2', rect(0, 30, 18, 6, 3), { fill: C.teal }),
    group('filament', curve([[-8, 8], [-4, -4], [0, 4], [4, -4], [8, 8]]), { stroke: C.gold, width: 2 }),
    group('ray 1', curve([[-44, -40], [-56, -50]]), { stroke: C.gold, width: 3 }),
    group('ray 2', curve([[44, -40], [56, -50]]), { stroke: C.gold, width: 3 }),
    group('ray 3', curve([[0, -60], [0, -74]]), { stroke: C.gold, width: 3 }),
    group('spark', star(4, 9, 3), { fill: C.gold, transform: { p: [50, -12], r: [[0, 0, E.linear], [END, 180]] } }),
  ], { p: [bx + 4, by - 2, 0], s: popXYZ(T.bulb, { out: T.reset - 4 }) });
}

console.log('Wrote ' + write(path.join(__dirname, '..', 'public', 'media', 'proj-arch-mission-characters.json')));
