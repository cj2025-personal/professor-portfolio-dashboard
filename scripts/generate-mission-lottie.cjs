const fs = require('fs');
const path = require('path');

const FPS = 30;
const END = 300;
let nextIndex = 1;

const rgb = hex => {
  const value = hex.replace('#', '');
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255).concat(1);
};
const ease = { o: { x: [0.33], y: [0] }, i: { x: [0.67], y: [1] } };
const animated = frames => ({
  a: 1,
  k: frames.map(([t, value, hold], index) => {
    const frame = { t, s: Array.isArray(value) ? value : [value] };
    if (index < frames.length - 1) {
      if (hold) frame.h = 1;
      else Object.assign(frame, ease);
    }
    return frame;
  }),
});
const fixed = value => ({ a: 0, k: value });
const layerTransform = ({ p = [0, 0, 0], a = [0, 0, 0], s = [100, 100, 100], r = 0, o = 100 } = {}) => ({
  o: Array.isArray(o[0]) ? animated(o) : fixed(o),
  r: Array.isArray(r) ? animated(r) : fixed(r),
  p: Array.isArray(p[0]) ? animated(p) : fixed(p),
  a: fixed(a),
  s: Array.isArray(s[0]) ? animated(s) : fixed(s),
});
const shapeTransform = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({
  ty: 'tr', p: fixed(p), a: fixed(a), s: fixed(s), r: fixed(r), o: fixed(o), sk: fixed(0), sa: fixed(0),
});
const rect = (x, y, w, h, radius = 0) => ({ ty: 'rc', d: 1, p: fixed([x, y]), s: fixed([w, h]), r: fixed(radius) });
const ellipse = (x, y, w, h) => ({ ty: 'el', d: 1, p: fixed([x, y]), s: fixed([w, h]) });
const linePath = (points, closed = false) => ({
  ty: 'sh', d: 1, ks: fixed({
    v: points, i: points.map(() => [0, 0]), o: points.map(() => [0, 0]), c: closed,
  }),
});
const group = (name, geometry, { fill, stroke, width = 2, opacity = 100, transform } = {}) => {
  const items = [geometry];
  if (fill) items.push({ ty: 'fl', c: fixed(rgb(fill)), o: fixed(opacity), r: 1 });
  if (stroke) items.push({ ty: 'st', c: fixed(rgb(stroke)), o: fixed(opacity), w: fixed(width), lc: 2, lj: 2, ml: 4 });
  items.push(shapeTransform(transform));
  return { ty: 'gr', nm: name, it: items };
};
const shapeLayer = (name, shapes, transform = {}) => ({
  ddd: 0, ind: nextIndex++, ty: 4, nm: name, sr: 1, ao: 0, bm: 0,
  ks: layerTransform(transform), shapes: [...shapes].reverse(), ip: 0, op: END, st: 0,
});

const C = {
  ink: '#183e48', teal: '#326776', blue: '#72a4aa', pale: '#d9e4df',
  cream: '#f7f4ed', gold: '#aa8051', coral: '#e77757', yellow: '#efc66c',
  paper: '#ffffff', line: '#b6c5c2', darkSkin: '#74422f', mediumSkin: '#b96f4d',
  hair: '#172b32', trouser: '#264d57', white: '#ffffff', green: '#8fa99d',
};

const layers = [];

// Foreground accents and the final comprehension spark.
layers.push(shapeLayer('final comprehension spark', [
  group('star', linePath([[0, -16], [5, -5], [16, 0], [5, 5], [0, 16], [-5, 5], [-16, 0], [-5, -5]], true), { fill: C.yellow }),
  group('center', ellipse(0, 0, 7, 7), { fill: C.white }),
], {
  p: [[0, [538, 148, 0], true], [205, [538, 148, 0], true], [222, [538, 148, 0]], [260, [538, 148, 0], true], [285, [538, 148, 0]], [300, [538, 148, 0]]],
  s: [[0, [0, 0, 100], true], [205, [0, 0, 100]], [222, [115, 115, 100]], [252, [100, 100, 100]], [285, [100, 100, 100]], [300, [0, 0, 100]]],
  r: [[0, [0], true], [205, [0]], [252, [18]], [285, [18]], [300, [0]]],
}));

// Learner's oversized, simplified reading card: three strong lines replace the dense paper.
layers.push(shapeLayer('grade five reading card', [
  group('card', rect(0, 0, 144, 116, 16), { fill: C.paper, stroke: C.pale, width: 2 }),
  group('level pill', rect(-38, -36, 48, 15, 7.5), { fill: C.teal }),
  group('level dot 1', ellipse(-48, -36, 4, 4), { fill: C.white }),
  group('level dot 2', ellipse(-40, -36, 4, 4), { fill: C.white }),
  group('level dot 3', ellipse(-32, -36, 4, 4), { fill: C.white }),
  group('line 1', rect(-4, -10, 92, 9, 4.5), { fill: C.ink }),
  group('line 2', rect(-14, 9, 72, 9, 4.5), { fill: C.teal }),
  group('highlight', rect(-24, 29, 52, 13, 6.5), { fill: C.yellow }),
], {
  p: [[0, [350, 218, 0], true], [142, [350, 218, 0], true], [202, [475, 294, 0]], [260, [475, 294, 0], true], [285, [475, 294, 0]], [300, [350, 218, 0]]],
  s: [[0, [28, 28, 100], true], [142, [28, 28, 100]], [176, [100, 100, 100]], [260, [100, 100, 100], true], [285, [100, 100, 100]], [300, [28, 28, 100]]],
  r: [[0, [-8], true], [142, [-8]], [202, [5]], [285, [5]], [300, [-8]]],
  o: [[0, [0], true], [136, [0]], [150, [100]], [280, [100]], [298, [0]], [300, [0]]],
}));

// Learner character, deliberately large and expressive rather than a UI diagram.
layers.push(shapeLayer('learner front hand', [
  group('arm', linePath([[0, 0], [-34, -24]]), { stroke: C.darkSkin, width: 15 }),
  group('hand', ellipse(-38, -27, 18, 18), { fill: C.darkSkin }),
], { p: [526, 316, 0], a: [0, 0, 0], r: [[0, [5]], [150, [5]], [205, [-12]], [260, [-9]], [300, [5]]] }));

layers.push(shapeLayer('learner character', [
  group('back leg', linePath([[-26, 116], [-12, 150], [18, 154]]), { stroke: C.trouser, width: 24 }),
  group('shoe', ellipse(24, 154, 42, 18), { fill: C.ink }),
  group('body', rect(0, 62, 104, 120, 44), { fill: C.coral }),
  group('collar', linePath([[-20, 8], [0, 26], [20, 8]], true), { fill: C.cream }),
  group('neck', rect(0, 10, 24, 30, 10), { fill: C.darkSkin }),
  group('ear left', ellipse(-39, -24, 16, 21), { fill: C.darkSkin }),
  group('ear right', ellipse(39, -24, 16, 21), { fill: C.darkSkin }),
  group('head', ellipse(0, -30, 78, 88), { fill: C.darkSkin }),
  group('hair crown', ellipse(0, -65, 84, 45), { fill: C.hair }),
  group('curl 1', ellipse(-32, -55, 24, 25), { fill: C.hair }),
  group('curl 2', ellipse(-13, -69, 26, 27), { fill: C.hair }),
  group('curl 3', ellipse(10, -70, 28, 28), { fill: C.hair }),
  group('curl 4', ellipse(32, -55, 24, 25), { fill: C.hair }),
  group('eye left', ellipse(-15, -29, 5, 7), { fill: C.ink }),
  group('eye right', ellipse(15, -29, 5, 7), { fill: C.ink }),
  group('smile', linePath([[-11, -8], [0, -3], [12, -9]]), { stroke: C.white, width: 2.5 }),
], { p: [[0, [520, 260, 0]], [145, [520, 260, 0]], [210, [520, 252, 0]], [260, [520, 256, 0]], [300, [520, 260, 0]]] }));

// Scholar's paper enters dense and visibly research-heavy.
layers.push(shapeLayer('research paper', [
  group('sheet', rect(0, 0, 128, 154, 13), { fill: C.paper, stroke: C.pale, width: 2 }),
  group('heading', rect(-15, -55, 70, 10, 5), { fill: C.ink }),
  ...[-34, -21, -8, 5, 18, 31, 44].map((y, index) =>
    group(`dense line ${index + 1}`, rect(index % 3 === 0 ? -7 : -1, y, index % 3 === 0 ? 84 : 96, 5, 2.5), { fill: C.line })),
  group('chart base', rect(-20, 59, 64, 18, 5), { fill: C.pale }),
  group('chart 1', rect(-41, 60, 8, 12, 2), { fill: C.teal }),
  group('chart 2', rect(-27, 57, 8, 18, 2), { fill: C.gold }),
  group('chart 3', rect(-13, 54, 8, 24, 2), { fill: C.ink }),
], {
  p: [[0, [206, 276, 0]], [26, [206, 276, 0]], [100, [316, 218, 0]], [125, [316, 218, 0], true], [142, [316, 218, 0]], [300, [206, 276, 0]]],
  s: [[0, [100, 100, 100]], [70, [92, 92, 100]], [110, [48, 48, 100]], [125, [28, 28, 100]], [142, [0, 0, 100]], [300, [0, 0, 100]]],
  r: [[0, [-6]], [70, [3]], [125, [0]], [300, [-6]]],
  o: [[0, [100]], [110, [100]], [140, [0]], [300, [0]]],
}));

layers.push(shapeLayer('scholar presenting arm', [
  group('sleeve', linePath([[0, 0], [48, -14]]), { stroke: C.cream, width: 24 }),
  group('forearm', linePath([[43, -14], [69, -35]]), { stroke: C.mediumSkin, width: 15 }),
  group('hand', ellipse(72, -38, 18, 18), { fill: C.mediumSkin }),
], { p: [154, 286, 0], r: [[0, [18]], [28, [18]], [62, [-7]], [112, [-3]], [145, [18]], [300, [18]]] }));

layers.push(shapeLayer('scholar character', [
  group('leg left', rect(-27, 125, 27, 82, 12), { fill: C.trouser }),
  group('leg right', rect(27, 125, 27, 82, 12), { fill: C.trouser }),
  group('shoe left', ellipse(-31, 168, 46, 18), { fill: C.ink }),
  group('shoe right', ellipse(32, 168, 46, 18), { fill: C.ink }),
  group('coat', linePath([[-55, 18], [-38, 122], [38, 122], [55, 18], [23, 4], [-23, 4]], true), { fill: C.cream }),
  group('shirt', linePath([[-22, 8], [0, 57], [23, 8]], true), { fill: C.teal }),
  group('neck', rect(0, 4, 23, 31, 9), { fill: C.mediumSkin }),
  group('ear left', ellipse(-36, -33, 15, 21), { fill: C.mediumSkin }),
  group('ear right', ellipse(36, -33, 15, 21), { fill: C.mediumSkin }),
  group('head', ellipse(0, -40, 73, 87), { fill: C.mediumSkin }),
  group('hair', linePath([[-35, -46], [-29, -76], [-6, -88], [24, -80], [37, -53], [24, -63], [3, -57], [-12, -66], [-27, -56]], true), { fill: C.hair }),
  group('glasses left', rect(-18, -40, 28, 18, 8), { stroke: C.ink, width: 3 }),
  group('glasses right', rect(18, -40, 28, 18, 8), { stroke: C.ink, width: 3 }),
  group('bridge', linePath([[-4, -40], [4, -40]]), { stroke: C.ink, width: 3 }),
  group('eye left', ellipse(-18, -40, 4, 5), { fill: C.ink }),
  group('eye right', ellipse(18, -40, 4, 5), { fill: C.ink }),
  group('smile', linePath([[-10, -17], [0, -12], [11, -18]]), { stroke: C.white, width: 2.5 }),
], { p: [[0, [126, 250, 0]], [120, [126, 246, 0]], [210, [126, 250, 0]], [300, [126, 250, 0]]] }));

// Veri AI is the center of the exchange, with one purposeful processing pulse.
layers.push(shapeLayer('veri ai core', [
  group('outer', ellipse(0, 0, 104, 104), { fill: C.pale }),
  group('inner', ellipse(0, 0, 76, 76), { fill: C.ink }),
  group('spark', linePath([[0, -23], [7, -7], [23, 0], [7, 7], [0, 23], [-7, 7], [-23, 0], [-7, -7]], true), { fill: C.white }),
  group('gold center', ellipse(0, 0, 9, 9), { fill: C.gold }),
], {
  p: [320, 214, 0],
  s: [[0, [100, 100, 100]], [92, [100, 100, 100]], [112, [114, 114, 100]], [132, [100, 100, 100]], [150, [108, 108, 100]], [170, [100, 100, 100]], [300, [100, 100, 100]]],
  r: [[0, [0]], [90, [0]], [170, [90]], [260, [90]], [300, [0]]],
}));

layers.push(shapeLayer('veri processing ring', [
  group('ring', ellipse(0, 0, 142, 142), { stroke: C.gold, width: 3, opacity: 65 }),
], {
  p: [320, 214, 0],
  s: [[0, [70, 70, 100]], [88, [70, 70, 100]], [126, [112, 112, 100]], [160, [128, 128, 100]], [185, [70, 70, 100]], [300, [70, 70, 100]]],
  o: [[0, [0], true], [88, [0]], [106, [100]], [160, [30]], [185, [0]], [300, [0]]],
}));

// A single directional path replaces ambient floating decoration.
layers.push(shapeLayer('directional path', [
  group('left path', linePath([[0, 0], [70, -44], [128, -34]]), { stroke: C.teal, width: 3, opacity: 35 }),
  group('right path', linePath([[176, -34], [235, -12], [298, 38]]), { stroke: C.gold, width: 3, opacity: 45 }),
  group('arrow', linePath([[287, 25], [298, 38], [281, 39]]), { stroke: C.gold, width: 3, opacity: 55 }),
], { p: [168, 252, 0] }));

// Soft scene ground and asymmetrical color blocks evoke editorial character illustration.
layers.push(shapeLayer('ground shadows', [
  group('scholar shadow', ellipse(126, 430, 166, 24), { fill: C.ink, opacity: 10 }),
  group('learner shadow', ellipse(520, 430, 168, 24), { fill: C.ink, opacity: 10 }),
  group('ground line', rect(320, 431, 520, 2, 1), { fill: C.pale }),
]));

layers.push(shapeLayer('background shapes', [
  group('left blob', ellipse(104, 250, 260, 310), { fill: C.pale, opacity: 52 }),
  group('right blob', ellipse(544, 262, 250, 292), { fill: C.yellow, opacity: 20 }),
  group('center glow', ellipse(320, 214, 238, 238), { fill: C.cream, opacity: 86 }),
]));

const animation = {
  v: '5.12.2', fr: FPS, ip: 0, op: END, w: 640, h: 520,
  nm: 'Proj Arch mission — scholar to learner character story', ddd: 0,
  assets: [], layers,
  markers: [
    { tm: 0, cm: 'research', dr: 0 },
    { tm: 105, cm: 'adapt', dr: 0 },
    { tm: 220, cm: 'understand', dr: 0 },
    { tm: 260, cm: 'rest', dr: 0 },
  ],
};

const destination = path.join(__dirname, '..', 'public', 'media', 'proj-arch-mission-characters.json');
fs.writeFileSync(destination, JSON.stringify(animation));
console.log(`Wrote ${destination} (${layers.length} layers)`);
