// Builds public/media/proj-arch-mission-characters.json, the Lottie shown
// beside the mission copy on the Proj Arch page.
//
//   node scripts/generate-mission-lottie.cjs
//
// The scene: a scholar hands a dense research paper to Veri AI, which turns
// it into a clear Grade 5 reading card that lands on a learner's tablet.
//
// Everything is drawn from bezier paths rather than primitive circles and
// boxes, in the flat "editorial character" idiom (no outlines, one shade
// tone per fill for depth, oversized rounded hands, tapered limbs). Motion
// uses ease-out-quint for travel, small overshoots for pops, curved spatial
// paths for the flights, and idle breathing/blinks so nothing ever freezes.
//
// Coordinates: the canvas is 640x520 with the floor at y=440. Each character
// is a small rig (parented layers) drawn in its own local space with the
// origin on the floor under the character, x to the right, y upward being
// negative, as in After Effects.

const path = require('path');
const {
  E, add, smooth, limb, curve, rect, ellipse, star, crescent, group, createDocument, at,
} = require('./lib/lottie.cjs');

const END = 300;
const FLOOR = 440;
const { layer, oscillate, blink, write } = createDocument({
  w: 640, h: 520, end: END, name: 'Proj Arch mission — scholar to learner character story',
  markers: [
    { tm: 0, cm: 'research', dr: 0 },
    { tm: 118, cm: 'adapt', dr: 0 },
    { tm: 205, cm: 'understand', dr: 0 },
    { tm: 250, cm: 'rest', dr: 0 },
  ],
});

// ─── Colour ────────────────────────────────────────────────────────────────
const C = {
  ink: '#183e48', teal: '#326776', tealSoft: '#5b8a95', tealTint: '#dfe9e6', sage: '#edf2ee',
  cream: '#f6f5f1', paper: '#ffffff', line: '#c7d2cd', lineSoft: '#e2e7e3',
  gold: '#aa8051', goldLight: '#d9b47b', yellow: '#efc66c', coral: '#e77757', coralShade: '#c95d40',
  coat: '#f2ede3', coatShade: '#dcd4c4', trouser: '#2a4f5a', trouserShade: '#1f3d47',
  skinA: '#c68a63', skinAShade: '#a9704c', skinB: '#7b4b33', skinBShade: '#5f3826',
  hair: '#1d2a30', hairShine: '#2f3f47', sneaker: '#f7f5f0', stool: '#d3ddd7', stoolShade: '#b8c6bf',
};

// ═══════════════════════════════════════════════════════════════════════════
// Scene constants
// ═══════════════════════════════════════════════════════════════════════════
const SCHOLAR = [140, FLOOR];
const LEARNER = [498, FLOOR];
const ORB = [332, 200];

// Frame plan (30fps, 10s loop)
//   0–40    both idle; scholar looks at the paper
//   40–70   scholar raises the paper toward Veri
//   70–118  paper flies an arc into the orb, shrinking
//   118–150 orb absorbs it: pulse, ring flare, orbit speeds up
//   150–205 reading card emerges and arcs down to the learner's tablet
//   205–240 learner lifts the tablet, spark of understanding, smile
//   240–300 settle, card fades, paper returns to the scholar's hand for the loop
const T = {
  raise: 40, launch: 70, arrive: 118, emit: 150, land: 205, lift: 208, spark: 214, rest: 250, reset: 284,
};

// ═══════════════════════════════════════════════════════════════════════════
// Background
// ═══════════════════════════════════════════════════════════════════════════
layer('backdrop', [
  group('scholar field', smooth([[30, 150], [120, 62], [230, 90], [262, 200], [236, 330], [150, 420], [50, 400], [6, 300]]), { fill: C.sage }),
  group('learner field', smooth([[400, 120], [500, 58], [606, 96], [634, 210], [610, 330], [520, 410], [420, 392], [386, 280]]), { fill: C.yellow, opacity: 22 }),
  group('centre glow', ellipse(ORB[0], ORB[1], 232, 232), { fill: C.cream, opacity: 92 }),
  group('centre halo', ellipse(ORB[0], ORB[1], 168, 168), { fill: C.tealTint, opacity: 55 }),
]);

layer('floor', [
  group('floor line', rect(320, FLOOR + 2, 560, 2, 1), { fill: C.lineSoft }),
  group('scholar shadow', ellipse(SCHOLAR[0] + 6, FLOOR + 2, 150, 20), { fill: C.ink, opacity: 9 }),
  group('learner shadow', ellipse(LEARNER[0] - 10, FLOOR + 2, 190, 22), { fill: C.ink, opacity: 9 }),
  group('plant pot', smooth([[596, 442, 0], [600, 402, 0], [630, 402, 0], [634, 442, 0]]), { fill: C.tealTint }),
  group('plant pot rim', rect(615, 402, 40, 8, 4), { fill: C.line }),
  group('leaf 1', smooth([[615, 400], [598, 372], [604, 342], [622, 360], [626, 392]]), { fill: C.tealSoft }),
  group('leaf 2', smooth([[617, 400], [640, 378], [646, 350], [628, 356], [620, 382]]), { fill: C.teal }),
  group('leaf 3', smooth([[615, 398], [610, 366], [618, 336], [630, 366], [622, 392]]), { fill: C.teal }),
], { p: [0, 0, 0] });

// ═══════════════════════════════════════════════════════════════════════════
// Veri AI orb at the centre of the exchange
// ═══════════════════════════════════════════════════════════════════════════
{
  const pulse = [[0, [100, 100, 100], E.soft], [T.arrive - 6, [100, 100, 100], E.out], [T.arrive + 6, [90, 90, 100], E.out], [T.arrive + 20, [112, 112, 100], E.soft], [T.arrive + 34, [100, 100, 100], E.soft], [T.emit - 6, [104, 104, 100], E.out], [T.emit + 8, [96, 96, 100], E.soft], [T.emit + 22, [100, 100, 100], E.soft], [END, [100, 100, 100]]];
  layer('veri orbit', [
    group('orbit ring', ellipse(0, 0, 148, 148), { stroke: C.gold, width: 2, opacity: 45, dash: [3, 9] }),
    group('orbit dot', ellipse(74, 0, 9, 9), { fill: C.gold }),
    group('orbit dot 2', ellipse(-74, 0, 6, 6), { fill: C.goldLight }),
  ], {
    p: [ORB[0], ORB[1], 0],
    r: [[0, 0, E.linear], [T.arrive, 120, E.inOut], [T.emit, 400, E.linear], [END, 720]],
    s: [[0, [100, 100, 100], E.soft], [T.arrive, [100, 100, 100], E.out], [T.arrive + 14, [110, 110, 100], E.soft], [T.emit, [100, 100, 100], E.soft], [END, [100, 100, 100]]],
  });
  layer('veri flare', [
    group('flare', ellipse(0, 0, 140, 140), { stroke: C.goldLight, width: 3, opacity: 80 }),
  ], {
    p: [ORB[0], ORB[1], 0],
    s: [[0, [60, 60, 100], 'hold'], [T.arrive, [60, 60, 100], E.out], [T.arrive + 30, [150, 150, 100], 'hold'], [T.emit, [60, 60, 100], E.out], [T.emit + 30, [140, 140, 100], 'hold'], [END, [60, 60, 100]]],
    o: [[0, 0, 'hold'], [T.arrive, 90, E.out], [T.arrive + 30, 0, 'hold'], [T.emit, 70, E.out], [T.emit + 30, 0, 'hold'], [END, 0]],
  });
  layer('veri core', [
    group('outer', ellipse(0, 0, 112, 112), { fill: C.tealTint }),
    group('mid', ellipse(0, 0, 92, 92), { fill: C.teal }),
    group('inner', ellipse(0, 0, 74, 74), { fill: C.ink }),
    group('inner shine', smooth([[-22, -22], [-4, -32], [14, -26, 0.5], [-8, -12, 0.5], [-26, -4]]), { fill: C.teal, opacity: 55 }),
    group('spark', star(4, 22, 7), { fill: C.paper }),
    group('spark core', ellipse(0, 0, 8, 8), { fill: C.gold }),
  ], {
    p: [ORB[0], ORB[1], 0],
    s: pulse,
    r: [[0, 0, E.soft], [T.arrive - 6, 0, E.out], [T.arrive + 34, 90, E.soft], [T.emit + 22, 90, 'hold'], [T.reset, 90, E.inOut], [END, 0]],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Scholar (left, facing right)
// ═══════════════════════════════════════════════════════════════════════════
{
  const O = SCHOLAR;
  const bob = oscillate([O[0], O[1], 0], [O[0], O[1] - 3, 0], 100);
  const root = layer('scholar', [
    // legs and shoes
    group('back leg', limb([-18, -112], [-14, -22], 30, 24), { fill: C.trouserShade }),
    group('back shoe', smooth([[-30, -22, 0.4], [-20, -34], [4, -30], [16, -20], [16, -4, 0], [-30, -4, 0]]), { fill: C.trouserShade }),
    group('front leg', limb([16, -112], [18, -22], 30, 24), { fill: C.trouser }),
    group('front shoe', smooth([[2, -22, 0.4], [12, -34], [38, -30], [54, -18], [52, -4, 0], [2, -4, 0]]), { fill: C.ink }),
    group('front shoe sole', rect(28, -6, 52, 6, 3), { fill: C.hair }),
    // back arm, mostly hidden behind the coat
    group('back sleeve', limb([-44, -212], [-52, -140], 26, 20), { fill: C.coatShade }),
    group('back hand', ellipse(-54, -128, 20, 20), { fill: C.skinAShade }),
    // coat body
    group('coat', smooth([[-52, -222], [-56, -170], [-50, -104, 0.6], [50, -102, 0.6], [56, -172], [50, -224], [18, -238, 0.4], [-16, -238, 0.4]]), { fill: C.coat }),
    group('coat shade', crescent([[-52, -222], [-56, -170], [-50, -104], [50, -102], [56, -172], [50, -224], [18, -238], [-16, -238]], 0, 2, [0, -170], 12), { fill: C.coatShade }),
    group('coat hem', rect(0, -108, 100, 4, 2), { fill: C.coatShade, opacity: 60 }),
    // shirt and lapels
    group('shirt', smooth([[-18, -238, 0], [-6, -184], [6, -184], [18, -238, 0]]), { fill: C.teal }),
    group('lapel left', smooth([[-20, -238, 0], [-8, -190, 0], [-22, -200, 0], [-30, -226, 0]]), { fill: C.coatShade }),
    group('lapel right', smooth([[20, -238, 0], [8, -190, 0], [24, -198, 0], [32, -226, 0]]), { fill: C.coatShade }),
    group('button', ellipse(4, -164, 5, 5), { fill: C.coatShade }),
    group('pocket', rect(-26, -136, 26, 3, 1.5), { fill: C.coatShade }),
    // neck
    group('neck', rect(4, -240, 22, 26, 8), { fill: C.skinA }),
    group('neck shade', ellipse(4, -232, 24, 12), { fill: C.skinAShade }),
  ], { p: bob });

  // Head, parented so a nod moves everything on it.
  const headPoints = [[0, -318], [24, -312], [37, -292], [36, -268], [26, -246], [8, -236], [-14, -240], [-30, -256], [-36, -282], [-30, -306]];
  const head = layer('scholar head', [
    group('ear', ellipse(-34, -272, 14, 18), { fill: C.skinA }),
    group('ear inner', ellipse(-33, -272, 7, 9), { fill: C.skinAShade }),
    group('face', smooth(headPoints), { fill: C.skinA }),
    group('face shade', crescent(headPoints, 6, 9, [0, -278], 9), { fill: C.skinAShade }),
    group('blush', ellipse(28, -262, 14, 8), { fill: C.coral, opacity: 22 }),
    group('brow left', curve([[-14, -290], [-6, -294], [2, -292]]), { stroke: C.hair, width: 2.6 }),
    group('brow right', curve([[14, -292], [22, -295], [30, -291]]), { stroke: C.hair, width: 2.6 }),
    group('eye left', ellipse(-6, -280, 4.6, 6), { fill: C.ink, transform: { a: [-6, -280], p: [-6, -280], s: blink([80, 214]) } }),
    group('eye right', ellipse(22, -280, 4.6, 6), { fill: C.ink, transform: { a: [22, -280], p: [22, -280], s: blink([80, 214]) } }),
    group('glasses', [ellipse(-6, -279, 24, 22), ellipse(22, -279, 24, 22)], { stroke: C.ink, width: 2.4 }),
    group('bridge', curve([[6, -281], [8, -284], [10, -281]]), { stroke: C.ink, width: 2.2 }),
    group('temple', curve([[-18, -281], [-26, -278], [-32, -274]]), { stroke: C.ink, width: 2.2 }),
    group('nose', curve([[16, -270], [20, -262], [14, -258]]), { stroke: C.skinAShade, width: 2.2 }),
    group('smile', curve([[2, -250], [12, -246], [22, -250]]), { stroke: C.skinAShade, width: 2.4 }),
    group('hair', smooth([[-36, -268], [-38, -296], [-24, -318], [2, -328], [28, -320], [40, -300], [38, -292, 0.4], [26, -300], [10, -297], [-6, -304], [-20, -296], [-30, -280]]), { fill: C.hair }),
    group('hair shine', curve([[-14, -312], [4, -318], [22, -312]]), { stroke: C.hairShine, width: 3 }),
  ], {
    a: [4, -236, 0], p: [4, -236, 0],
    r: [[0, -2, E.soft], [T.raise, -2, E.out], [T.raise + 22, 4, E.soft], [T.arrive, 4, E.inOut], [T.arrive + 30, 1, E.soft], [T.land, 3, E.inOut], [T.rest, -1, E.soft], [END, -2]],
  }, { parent: root });
  void head;

  // Front arm: pivots at the shoulder, presents and raises the paper.
  const pivot = [40, -214];
  const armRest = 18;
  const armRaised = -36;
  const arm = layer('scholar front arm', [
    // A shade rim behind the sleeve separates it from the identical coat.
    group('sleeve rim', limb([-2, 2], [12, 60], 36, 30), { fill: C.coatShade }),
    group('forearm rim', limb([12, 60], [60, 38], 30, 26), { fill: C.coatShade }),
    group('sleeve', limb([2, -2], [14, 56], 30, 24), { fill: C.coat }),
    group('forearm', limb([14, 56], [60, 34], 24, 20), { fill: C.coat }),
    group('sleeve fold', curve([[6, 34], [12, 40], [20, 40]]), { stroke: C.coatShade, width: 2.4 }),
    group('cuff', limb([52, 38], [60, 34], 22, 20), { fill: C.coatShade }),
    group('hand', smooth([[60, 18], [76, 16], [88, 28], [82, 48], [66, 52], [54, 40]]), { fill: C.skinA }),
    group('hand shade', ellipse(66, 44, 14, 8), { fill: C.skinAShade, opacity: 60 }),
  ], {
    a: [0, 0, 0], p: [pivot[0], pivot[1], 0],
    r: [[0, armRest, E.soft], [T.raise, armRest, E.out], [T.launch, armRaised, E.out], [T.launch + 12, armRaised + 4, E.soft], [T.arrive + 12, armRaised + 4, E.inOut], [T.arrive + 46, armRest, E.soft], [END, armRest]],
  }, { parent: root });

  // The paper in hand (a child of the arm) and its world-space twin that flies.
  const paperShapes = [
    group('sheet shadow', rect(2, 4, 92, 118, 8), { fill: C.ink, opacity: 8 }),
    group('sheet', rect(0, 0, 92, 118, 8), { fill: C.paper }),
    group('sheet edge', rect(0, 0, 92, 118, 8), { stroke: C.lineSoft, width: 1.5 }),
    group('title', rect(-16, -44, 50, 7, 3.5), { fill: C.ink }),
    group('byline', rect(-24, -32, 34, 4, 2), { fill: C.line }),
    ...[-20, -12, -4, 4, 12, 20].map((y, k) => group(`dense line ${k + 1}`, rect(k % 2 ? -4 : -2, y, k % 2 ? 68 : 72, 3.6, 1.8), { fill: C.line })),
    group('chart axis', rect(-4, 43, 72, 1.5, 0.75), { fill: C.line }),
    group('bar 1', rect(-26, 36, 8, 12, 2), { fill: C.teal }),
    group('bar 2', rect(-12, 32, 8, 20, 2), { fill: C.gold }),
    group('bar 3', rect(2, 28, 8, 28, 2), { fill: C.ink }),
    group('bar 4', rect(16, 34, 8, 16, 2), { fill: C.tealSoft }),
  ];
  const handLocal = [76, 22];  // where the paper sits in the arm's local space
  const heldOpacity = [[0, 100, 'hold'], [T.launch - 1, 100, 'hold'], [T.launch, 0, 'hold'], [T.reset, 0, E.out], [T.reset + 12, 100, 'hold'], [END, 100]];
  // The hand grips the paper's lower-left corner; the thumb lies over it.
  const paperAnchor = [0, 44];
  layer('scholar paper in hand', paperShapes, {
    a: [paperAnchor[0], paperAnchor[1], 0], p: [handLocal[0], handLocal[1], 0], r: -8, s: [88, 88, 100], o: heldOpacity,
  }, { parent: arm });
  layer('scholar thumb', [
    group('thumb', smooth([[70, 30], [74, 18], [82, 18], [84, 30], [76, 38]]), { fill: C.skinA }),
    group('thumb crease', curve([[74, 36], [80, 32]]), { stroke: C.skinAShade, width: 1.8 }),
  ], { o: heldOpacity }, { parent: arm });

  // Where the hand is in world space once the arm has rotated to armRaised.
  const rotate = ([x, y], deg) => {
    const rad = (deg * Math.PI) / 180;
    return [x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad)];
  };
  const launchAt = at(add(at(O, pivot), [0, -2]), rotate(handLocal, armRaised));
  layer('flying paper', paperShapes, {
    a: [paperAnchor[0], paperAnchor[1], 0],
    p: [
      [0, [launchAt[0], launchAt[1], 0], 'hold'],
      [T.launch, [launchAt[0], launchAt[1], 0], E.inOut, { to: [30, -90], ti: [-40, -6] }],
      [T.arrive, [ORB[0], ORB[1], 0], 'hold'],
      [END, [ORB[0], ORB[1], 0]],
    ],
    r: [[0, armRaised - 8, 'hold'], [T.launch, armRaised - 8, E.inOut], [T.arrive, 12, 'hold'], [END, 12]],
    s: [[0, [88, 88, 100], 'hold'], [T.launch, [88, 88, 100], E.in], [T.arrive, [18, 18, 100], 'hold'], [END, [18, 18, 100]]],
    o: [[0, 0, 'hold'], [T.launch, 100, 'hold'], [T.arrive - 10, 100, E.in], [T.arrive, 0, 'hold'], [END, 0]],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Learner (right, seated on a stool, facing left)
// ═══════════════════════════════════════════════════════════════════════════
{
  const O = LEARNER;
  const bob = oscillate([O[0], O[1], 0], [O[0], O[1] - 2, 0], 75, 1);
  const root = layer('learner', [
    // stool
    group('stool leg back', rect(30, -32, 10, 62, 4), { fill: C.stoolShade }),
    group('stool leg front', rect(-30, -32, 10, 62, 4), { fill: C.stoolShade }),
    group('stool seat', rect(0, -70, 112, 24, 12), { fill: C.stool }),
    group('stool seat shade', rect(0, -62, 112, 8, 4), { fill: C.stoolShade }),
    // back leg (farther from viewer)
    group('back thigh', limb([14, -92], [-38, -86], 30, 26), { fill: C.trouserShade }),
    group('back shin', limb([-38, -86], [-40, -20], 26, 22), { fill: C.trouserShade }),
    group('back sneaker', smooth([[-28, -22, 0.4], [-40, -34], [-66, -30], [-80, -16], [-78, -4, 0], [-28, -4, 0]]), { fill: C.line }),
    // hoodie body
    group('hoodie', smooth([[-44, -176], [-50, -130], [-48, -84, 0.5], [50, -82, 0.5], [54, -130], [46, -178], [16, -190, 0.4], [-14, -190, 0.4]]), { fill: C.coral }),
    group('hoodie shade', crescent([[-44, -176], [-50, -130], [-48, -84], [50, -82], [54, -130], [46, -178], [16, -190], [-14, -190]], 3, 5, [0, -130], 12), { fill: C.coralShade }),
    group('pocket', smooth([[-32, -112, 0], [30, -110, 0], [26, -88, 0], [-28, -90, 0]]), { fill: C.coralShade, opacity: 60 }),
    group('hood', smooth([[-22, -196], [0, -206], [24, -196], [30, -180], [4, -174], [-26, -180]]), { fill: C.coralShade }),
    group('drawstring left', curve([[-8, -184], [-10, -170], [-8, -158]]), { stroke: C.cream, width: 2 }),
    group('drawstring right', curve([[8, -184], [10, -172], [12, -160]]), { stroke: C.cream, width: 2 }),
    // front leg
    group('front thigh', limb([10, -96], [-46, -90], 32, 28), { fill: C.trouser }),
    group('front shin', limb([-46, -90], [-52, -20], 28, 24), { fill: C.trouser }),
    group('front sneaker', smooth([[-40, -22, 0.4], [-50, -36], [-78, -32], [-94, -16], [-92, -4, 0], [-40, -4, 0]]), { fill: C.sneaker }),
    group('front sneaker sole', smooth([[-94, -12, 0], [-40, -10, 0], [-40, -4, 0], [-92, -4, 0]]), { fill: C.line }),
    group('sneaker stripe', curve([[-84, -22], [-70, -24], [-56, -20]]), { stroke: C.coral, width: 3 }),
    // neck
    group('neck', rect(-2, -192, 22, 26, 8), { fill: C.skinB }),
    group('neck shade', ellipse(-2, -184, 24, 12), { fill: C.skinBShade }),
    // back arm (far side) reaching to the tablet
    group('back sleeve', limb([36, -166], [4, -122], 28, 22), { fill: C.coralShade }),
    group('back hand', ellipse(-6, -118, 22, 22), { fill: C.skinBShade }),
  ], { p: bob });

  // Head: tilted toward the centre while waiting, nods on understanding.
  const headPoints = [[-4, -270], [-30, -262], [-40, -240], [-38, -216], [-26, -196], [-6, -188], [16, -192], [32, -208], [36, -232], [30, -256]];
  // Curly crown: a base cap plus a ring of overlapping curls of varying size.
  const crownCentre = [-2, -240];
  const cap = smooth([[-44, -226], [-42, -262], [-24, -282], [-2, -288], [22, -282], [40, -262], [46, -226, 0.4], [30, -246], [-2, -256], [-36, -246, 0.4]]);
  const curls = [];
  [[186, 48, 24], [206, 50, 28], [228, 51, 32], [250, 52, 34], [272, 52, 36], [294, 51, 34], [316, 50, 32], [338, 48, 28], [356, 46, 24]].forEach(([deg, radius, size], k) => {
    const rad = (deg * Math.PI) / 180;
    curls.push(group(`curl ${k + 1}`, ellipse(crownCentre[0] + Math.cos(rad) * radius, crownCentre[1] + Math.sin(rad) * radius, size, size), { fill: C.hair }));
  });
  curls.push(group('curl side', ellipse(42, -230, 24, 26), { fill: C.hair }));
  curls.push(group('curl nape', ellipse(36, -208, 16, 18), { fill: C.hair }));
  layer('learner head', [
    group('ear', ellipse(36, -228, 14, 18), { fill: C.skinB }),
    group('ear inner', ellipse(35, -228, 7, 9), { fill: C.skinBShade }),
    group('face', smooth(headPoints), { fill: C.skinB }),
    group('face shade', crescent(headPoints, 6, 9, [-2, -230], 9), { fill: C.skinBShade }),
    group('blush', ellipse(-28, -220, 14, 8), { fill: C.coral, opacity: 30 }),
    group('brow left', curve([[-30, -240], [-22, -244], [-14, -241]]), { stroke: C.hair, width: 2.6 }),
    group('brow right', curve([[-2, -242], [6, -246], [14, -242]]), { stroke: C.hair, width: 2.6 }),
    group('eye left', ellipse(-22, -228, 5.2, 7), { fill: C.ink, transform: { a: [-22, -228], p: [-22, -228], s: blink([124, 232]) } }),
    group('eye right', ellipse(6, -228, 5.2, 7), { fill: C.ink, transform: { a: [6, -228], p: [6, -228], s: blink([124, 232]) } }),
    group('eye light left', ellipse(-20.5, -230, 1.8, 1.8), { fill: C.paper }),
    group('eye light right', ellipse(7.5, -230, 1.8, 1.8), { fill: C.paper }),
    group('nose', curve([[-16, -218], [-20, -210], [-14, -207]]), { stroke: C.skinBShade, width: 2.2 }),
    group('smile', curve([[-22, -200], [-10, -196], [2, -200]]), {
      stroke: C.skinBShade, width: 2.4,
      transform: { o: [[0, 100, 'hold'], [T.spark, 100, 'hold'], [T.spark + 1, 0, 'hold'], [T.reset, 0, 'hold'], [T.reset + 1, 100, 'hold'], [END, 100]] },
    }),
    group('grin', smooth([[-24, -202, 0.5], [-10, -204], [4, -202, 0.5], [-4, -192], [-16, -192]]), {
      fill: C.paper,
      transform: { o: [[0, 0, 'hold'], [T.spark, 0, 'hold'], [T.spark + 1, 100, 'hold'], [T.reset, 100, 'hold'], [T.reset + 1, 0, 'hold'], [END, 0]] },
    }),
    group('grin lip', curve([[-24, -202], [-10, -204], [4, -202]]), {
      stroke: C.skinBShade, width: 2,
      transform: { o: [[0, 0, 'hold'], [T.spark, 0, 'hold'], [T.spark + 1, 100, 'hold'], [T.reset, 100, 'hold'], [T.reset + 1, 0, 'hold'], [END, 0]] },
    }),
    group('hair cap', cap, { fill: C.hair }),
    ...curls,
    group('hair shine 1', ellipse(-18, -286, 9, 9), { fill: C.hairShine }),
    group('hair shine 2', ellipse(10, -292, 7, 7), { fill: C.hairShine }),
    group('hair shine 3', ellipse(34, -270, 6, 6), { fill: C.hairShine }),
  ], {
    a: [-2, -190, 0], p: [-2, -190, 0],
    r: [[0, 3, E.soft], [T.arrive, 3, E.inOut], [T.arrive + 24, -5, E.soft], [T.land, -5, E.out], [T.land + 8, 4, E.out], [T.spark + 20, -2, E.soft], [T.rest + 20, 2, E.soft], [END, 3]],
  }, { parent: root });

  // Front arm and tablet share one layer so the lift moves both together.
  const lift = [[0, [0, 0, 0], E.soft], [T.land, [0, 0, 0], E.out], [T.lift + 10, [4, -16, 0], E.out], [T.lift + 20, [3, -12, 0], E.soft], [T.rest + 20, [3, -12, 0], E.inOut], [T.reset, [0, 0, 0], 'hold'], [END, [0, 0, 0]]];
  const tablet = layer('learner tablet arm', [
    group('tablet shadow', rect(-40, -116, 94, 66, 8), { fill: C.ink, opacity: 10 }),
    group('tablet', rect(-42, -120, 94, 66, 8), { fill: C.ink }),
    group('screen', rect(-42, -120, 82, 54, 4), { fill: C.paper }),
    group('screen tint', rect(-42, -120, 82, 54, 4), { fill: C.tealTint, opacity: 45 }),
    group('front sleeve', limb([-40, -166], [-62, -126], 28, 22), { fill: C.coral }),
    group('front sleeve fold', curve([[-58, -142], [-54, -136], [-48, -136]]), { stroke: C.coralShade, width: 2.2 }),
    group('front hand', smooth([[-70, -128], [-58, -134], [-46, -126], [-48, -112], [-62, -108], [-72, -116]]), { fill: C.skinB }),
    group('front thumb', ellipse(-52, -130, 9, 11), { fill: C.skinBShade }),
  ], { p: lift }, { parent: root });

  // The reading card lands on the screen; it lives in world space so its
  // flight can be one clean arc from the orb. After landing it follows the
  // tablet lift via matching keyframes.
  const landAt = at(O, [-44, -124]);
  const cardShapes = [
    group('card shadow', rect(2, 3, 78, 50, 6), { fill: C.ink, opacity: 10 }),
    group('card', rect(0, 0, 78, 50, 6), { fill: C.paper }),
    group('level pill', rect(-18, -16, 34, 10, 5), { fill: C.teal }),
    group('level dot 1', ellipse(-27, -16, 3, 3), { fill: C.paper }),
    group('level dot 2', ellipse(-21, -16, 3, 3), { fill: C.paper }),
    group('level dot 3', ellipse(-15, -16, 3, 3), { fill: C.paper }),
    group('line 1', rect(-2, -2, 62, 6, 3), { fill: C.ink }),
    group('line 2', rect(-8, 9, 50, 6, 3), { fill: C.teal }),
    group('highlight', rect(-16, 19, 34, 7, 3.5), { fill: C.yellow }),
    group('check', curve([[18, 16], [23, 21], [32, 11]]), { stroke: C.teal, width: 2.6 }),
  ];
  layer('reading card', cardShapes, {
    p: [
      [0, [ORB[0], ORB[1], 0], 'hold'],
      [T.emit, [ORB[0], ORB[1], 0], E.inOut, { to: [70, -80], ti: [-30, -30] }],
      [T.land, [landAt[0], landAt[1], 0], E.out],
      [T.lift + 10, [landAt[0] + 4, landAt[1] - 16, 0], E.out],
      [T.lift + 20, [landAt[0] + 3, landAt[1] - 12, 0], E.soft],
      [T.rest + 20, [landAt[0] + 3, landAt[1] - 12, 0], E.inOut],
      [T.reset, [landAt[0], landAt[1], 0], 'hold'],
      [END, [ORB[0], ORB[1], 0]],
    ],
    r: [[0, 24, 'hold'], [T.emit, 24, E.out], [T.land, -4, E.out], [T.lift + 10, -7, E.soft], [T.rest, -6, 'hold'], [END, -6]],
    s: [[0, [16, 16, 100], 'hold'], [T.emit, [16, 16, 100], E.out], [T.land, [104, 104, 100], E.out], [T.land + 10, [100, 100, 100], 'hold'], [END, [100, 100, 100]]],
    o: [[0, 0, 'hold'], [T.emit, 0, E.out], [T.emit + 10, 100, 'hold'], [T.rest + 24, 100, E.inOut], [T.reset, 0, 'hold'], [END, 0]],
  });

  // Spark of understanding above the learner.
  const sparkAt = at(O, [-52, -300]);
  layer('understanding spark', [
    group('glow', ellipse(0, 0, 44, 44), { fill: C.yellow, opacity: 28 }),
    group('star', star(4, 17, 6), { fill: C.yellow }),
    group('star core', ellipse(0, 0, 6, 6), { fill: C.paper }),
    group('dot 1', ellipse(22, -12, 5, 5), { fill: C.gold }),
    group('dot 2', ellipse(-20, 12, 4, 4), { fill: C.goldLight }),
  ], {
    p: [[0, [sparkAt[0], sparkAt[1], 0], 'hold'], [T.spark, [sparkAt[0], sparkAt[1], 0], E.out], [T.spark + 20, [sparkAt[0], sparkAt[1] - 10, 0], E.soft], [T.rest + 10, [sparkAt[0], sparkAt[1] - 12, 0], E.inOut], [END, [sparkAt[0], sparkAt[1], 0]]],
    s: [[0, [0, 0, 100], 'hold'], [T.spark, [0, 0, 100], E.out], [T.spark + 10, [118, 118, 100], E.out], [T.spark + 20, [100, 100, 100], E.soft], [T.rest + 10, [100, 100, 100], E.in], [T.rest + 26, [0, 0, 100], 'hold'], [END, [0, 0, 100]]],
    r: [[0, 0, 'hold'], [T.spark, -30, E.out], [T.spark + 20, 12, E.soft], [T.rest + 26, 40, 'hold'], [END, 40]],
  });
}


// ─── Write ─────────────────────────────────────────────────────────────────
console.log('Wrote ' + write(path.join(__dirname, '..', 'public', 'media', 'proj-arch-mission-characters.json')));
