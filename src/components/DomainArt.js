import React from 'react';

/**
 * Line art for the three research-domain tiles, drawn in the site palette in
 * place of stock finance illustration (coins and dollar signs). Each shows
 * the domain's own object of study rather than money in general:
 *
 *   budget → a budget over seven years: revenue against spending, with the
 *            fund balance traced in gold across them
 *   yield  → a municipal yield curve across maturities, today's in gold
 *            over an earlier one
 *   tif    → tax increment financing: assessed value rising away from the
 *            base frozen when the district was created, with the increment
 *            between them shaded gold
 *
 * No text: the tile's title names the domain, and a label this small could
 * not be read. The bottom-left corner stays quiet for the tile's number.
 */
const INK = '#112d35';
const GRID = 'rgba(255,255,255,.07)';
const TEAL = '#4f8795';
const TEAL_SOFT = '#2e5d69';
const SAGE = '#b4c9cd';
const GOLD = '#c89b4a';
const GOLD_SOFT = '#d9bd8d';

const Grid = () => <g stroke={GRID} strokeWidth="1">
  {[24, 48, 72, 96].map(y => <line key={y} x1="0" x2="400" y1={y} y2={y} />)}
  {[80, 160, 240, 320].map(x => <line key={x} y1="0" y2="128" x1={x} x2={x} />)}
</g>;

const Budget = () => {
  const years = [[58, 52], [62, 57], [60, 61], [66, 60], [70, 64], [68, 66], [76, 68]];
  const x0 = 104, step = 40, base = 108;
  const balance = years.map(([rev, spend], i) => [x0 + i * step + 9, base - rev - 10 - (rev - spend) * 1.6]);
  return <>
    {years.map(([rev, spend], i) => <g key={i}>
      <rect x={x0 + i * step} y={base - rev} width="9" height={rev} rx="2" fill={TEAL} />
      <rect x={x0 + i * step + 11} y={base - spend} width="9" height={spend} rx="2" fill={TEAL_SOFT} />
    </g>)}
    <line x1="92" x2="388" y1={base} y2={base} stroke={SAGE} strokeOpacity=".35" />
    <polyline points={balance.map(p => p.join(',')).join(' ')} fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    {balance.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={INK} stroke={GOLD_SOFT} strokeWidth="1.5" />)}
  </>;
};

const Yield = () => {
  const maturities = [1, 2, 3, 5, 7, 10, 15, 20, 30];
  const x = m => 96 + (Math.log(m) / Math.log(30)) * 288;
  const curve = (level, slope) => maturities.map(m => [x(m), level - slope * (1 - Math.exp(-m / 7))]);
  const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const now = curve(92, 62), before = curve(100, 46);
  return <>
    <line x1="92" x2="388" y1="108" y2="108" stroke={SAGE} strokeOpacity=".35" />
    {maturities.map(m => <line key={m} x1={x(m)} x2={x(m)} y1="108" y2="113" stroke={SAGE} strokeOpacity=".45" />)}
    <path d={path(before)} fill="none" stroke={SAGE} strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="4 5" />
    <path d={path(now)} fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
    {now.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" fill={INK} stroke={GOLD_SOFT} strokeWidth="1.5" />)}
  </>;
};

const Tif = () => {
  const base = 88, start = 150;
  const value = [];
  for (let px = 96; px <= 388; px += 8) {
    const t = Math.max(0, (px - start) / (388 - start));
    const wobble = Math.sin(px / 23) * 1.6;
    value.push([px, base - 3 - t * t * 50 - t * 8 + wobble]);
  }
  const line = value.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1].toFixed(1)}`).join(' ');
  const increment = value.filter(p => p[0] >= start);
  const area = `M${start},${base} ` + increment.map(p => `L${p[0]},${p[1].toFixed(1)}`).join(' ') + ` L388,${base} Z`;
  return <>
    <path d={area} fill={GOLD} fillOpacity=".22" />
    <line x1="96" x2="388" y1={base} y2={base} stroke={SAGE} strokeOpacity=".6" strokeWidth="1.5" strokeDasharray="5 5" />
    <line x1={start} x2={start} y1="20" y2="108" stroke={GOLD_SOFT} strokeOpacity=".55" strokeDasharray="2 4" />
    <path d={line} fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx={start} cy={base} r="3.5" fill={INK} stroke={GOLD_SOFT} strokeWidth="1.5" />
    <line x1="92" x2="388" y1="108" y2="108" stroke={SAGE} strokeOpacity=".35" />
  </>;
};

const ART = { budget: Budget, yield: Yield, tif: Tif };

export default function DomainArt({ kind }) {
  const Art = ART[kind];
  return (
    <svg className="domain-art" viewBox="0 0 400 128" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`domain-glow-${kind}`} cx="78%" cy="18%" r="75%">
          <stop offset="0" stopColor="#1f5563" />
          <stop offset="1" stopColor={INK} />
        </radialGradient>
      </defs>
      <rect width="400" height="128" fill={`url(#domain-glow-${kind})`} />
      <Grid />
      <Art />
    </svg>
  );
}
