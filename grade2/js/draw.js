'use strict';
/* 二年級數學樂園：畫圖工具（時鐘、錢幣、位值積木、直式、尺、容器、方格） */

/* ---------- 時鐘：h 1~12，m 0~59 ---------- */
function clockSVG(h, m, cls = 'clock') {
  let s = `<svg class="${cls}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#5bb4ff" stroke-width="8"/>`;
  for (let k = 0; k < 60; k++) {
    const a = k * 6 * Math.PI / 180, big = k % 5 === 0, r1 = big ? 76 : 82;
    s += `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 86 * Math.sin(a)}" y2="${100 - 86 * Math.cos(a)}" stroke="#b9a9c9" stroke-width="${big ? 3 : 1.4}"/>`;
  }
  for (let k = 1; k <= 12; k++) {
    const a = k * 30 * Math.PI / 180;
    s += `<text x="${100 + 63 * Math.sin(a)}" y="${100 - 63 * Math.cos(a) + 8}" text-anchor="middle" font-size="22" font-weight="900" fill="#4a3b5c" font-family="Arial">${k}</text>`;
  }
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  s += `<g class="hand-h" transform="rotate(${ha} 100 100)"><line x1="100" y1="108" x2="100" y2="52" stroke="#ff7eb3" stroke-width="10" stroke-linecap="round"/></g>`;
  s += `<g class="hand-m" transform="rotate(${ma} 100 100)"><line x1="100" y1="110" x2="100" y2="24" stroke="#4a3b5c" stroke-width="6" stroke-linecap="round"/></g>`;
  s += `<circle cx="100" cy="100" r="8" fill="#ffc93c"/></svg>`;
  return s;
}
const timeText = (h, m) => m === 0 ? `${h} 點整` : `${h} 點 ${m} 分`;
const digital = (h, m) => `<span class="dclock">${h}:${String(m).padStart(2, '0')}</span>`;

/* ---------- 錢幣（100 元是紙鈔） ---------- */
function coinSVG(v) {
  if (v >= 100) return `<svg class="coin bill" viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="6" fill="#ffd9d9" stroke="#d65a5a" stroke-width="3"/><circle cx="30" cy="30" r="16" fill="#ffb3b3"/><text x="78" y="40" text-anchor="middle" font-size="28" font-weight="900" fill="#b03a3a" font-family="Arial">${v}</text></svg>`;
  const c = { 1: ['#e9b07a', '#a8683a', 44], 5: ['#dfe3ea', '#8a93a3', 50], 10: ['#e6e9ef', '#7d8798', 56], 50: ['#ffd76a', '#c49a17', 62] }[v];
  return `<svg class="coin" viewBox="0 0 100 100" style="width:${c[2]}px;height:${c[2]}px"><circle cx="50" cy="50" r="46" fill="${c[0]}" stroke="${c[1]}" stroke-width="5"/><circle cx="50" cy="50" r="36" fill="none" stroke="${c[1]}" stroke-width="2" stroke-dasharray="4 4"/><text x="50" y="62" text-anchor="middle" font-size="34" font-weight="900" fill="#4a3b5c" font-family="Arial">${v}</text></svg>`;
}
const coinsHTML = list => `<div class="coins">${list.map(coinSVG).join('')}</div>`;

/* ---------- 位值積木：百＝百格板、十＝十條、一＝小方塊 ---------- */
function blockSVG(kind) {
  let s = '';
  if (kind === 100) {
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) s += `<rect x="${2 + c * 6}" y="${2 + r * 6}" width="6" height="6" fill="#ffc93c" stroke="#d99a00" stroke-width=".8"/>`;
    return `<svg class="blk b100" viewBox="0 0 64 64">${s}</svg>`;
  }
  if (kind === 10) {
    for (let r = 0; r < 10; r++) s += `<rect x="2" y="${2 + r * 6}" width="6" height="6" fill="#5bb4ff" stroke="#2f7fc4" stroke-width=".8"/>`;
    return `<svg class="blk b10" viewBox="0 0 10 64">${s}</svg>`;
  }
  return `<svg class="blk b1" viewBox="0 0 10 10"><rect x="2" y="2" width="6" height="6" fill="#ff7eb3" stroke="#c94f84" stroke-width=".8"/></svg>`;
}
function blocksHTML(h, t, o) {
  return `<div class="blocks2">${Array(h).fill(blockSVG(100)).join('')}${Array(t).fill(blockSVG(10)).join('')}<span class="ones">${Array(o).fill(blockSVG(1)).join('')}</span></div>`;
}

/* ---------- 直式 ----------
   ans：答案列每一格的內容（由左到右，長度 = 位數），'' 空白、'?' 正在填的格子、'_' 還沒填的格子
   opt.carry：十位上面寫小小的進位 1；opt.borrow：十位劃掉減 1、個位前面加 1 */
function vertHTML(a, b, op, ans, opt = {}) {
  const w = Math.max(String(a).length, String(b).length, ans ? ans.length : 0);
  const pad = n => String(n).padStart(w, ' ').split('').map(c => c === ' ' ? '' : c);
  let top = pad(a);
  if (opt.borrow) top = top.map((c, k) => k === w - 2 ? `<s>${c}</s><sup class="bw">${+c - 1}</sup>` : k === w - 1 ? `<sup class="bw">1</sup>${c}` : c);
  const cells = (ans || Array(w).fill('')).map(c => c === '?' ? '<i class="vbox now"></i>' : c === '_' ? '<i class="vbox"></i>' : c);
  const row = (list, pre = '') => `<div class="vrow"><b class="vop">${pre}</b>${list.map(c => `<span>${c}</span>`).join('')}</div>`;
  const carry = opt.carry ? Array.from({ length: w }, (_, k) => k === w - 2 ? '<em class="cy">1</em>' : '') : null;
  return `<div class="vert">${carry ? row(carry) : ''}${row(top)}${row(pad(b), op)}<div class="vline"></div>${row(cells)}</div>`;
}

/* ---------- 尺（每公分 CM 個 SVG 單位） ---------- */
const CM = 34;
function rulerSVG(len, items = []) {
  const W = len * CM + 40;
  let s = `<svg class="ruler" viewBox="0 0 ${W} 150" style="width:min(${W * 1.1}px,94vw)">`;
  items.forEach(it => {
    const y = it.y || 34;
    s += `<rect x="${20 + it.from * CM}" y="${y}" width="${it.len * CM}" height="26" rx="6" fill="${it.c || '#ff9a4d'}" stroke="#4a3b5c" stroke-width="2"/>`;
  });
  s += `<rect x="6" y="70" width="${W - 12}" height="74" rx="8" fill="#fff6c9" stroke="#d9b54a" stroke-width="3"/>`;
  for (let k = 0; k <= len * 10; k++) {
    const x = 20 + k * CM / 10, big = k % 10 === 0, mid = k % 5 === 0;
    s += `<line x1="${x}" y1="70" x2="${x}" y2="${70 + (big ? 30 : mid ? 21 : 13)}" stroke="#4a3b5c" stroke-width="${big ? 2.4 : 1}"/>`;
    if (big) s += `<text x="${x}" y="128" text-anchor="middle" font-size="22" font-weight="900" fill="#4a3b5c" font-family="Arial">${k / 10}</text>`;
  }
  return s + '</svg>';
}

/* ---------- 容器：level 0~100（水位高度百分比） ---------- */
let clipSeq = 0;
function bottleSVG(kind, level, color = '#7cc8ff') {
  const shapes = {
    tall: 'M36 10 h28 v20 q14 8 14 24 v120 q0 8 -8 8 h-40 q-8 0 -8 -8 v-120 q0 -16 14 -24z',
    wide: 'M10 70 h80 v104 q0 8 -8 8 h-64 q-8 0 -8 -8z',
    cup: 'M22 80 h56 l-7 94 q-1 8 -9 8 h-24 q-8 0 -9 -8z',
    jar: 'M28 40 h44 v10 q16 6 16 24 v100 q0 8 -8 8 h-60 q-8 0 -8 -8 v-100 q0 -18 16 -24z'
  };
  const p = shapes[kind] || shapes.tall, id = 'clp' + (++clipSeq);
  const y = 182 - level * 1.72;
  return `<svg class="bottle" viewBox="0 0 100 190"><defs><clipPath id="${id}"><path d="${p}"/></clipPath></defs>
    <rect x="0" y="${y}" width="100" height="${190 - y}" fill="${color}" clip-path="url(#${id})"/>
    <path d="${p}" fill="none" stroke="#4a3b5c" stroke-width="4" stroke-linejoin="round"/></svg>`;
}

/* ---------- 方格圖形：cells = [[列, 行], ...] ---------- */
function gridShape(cells, color, size = 38) {
  const rows = Math.max(...cells.map(c => c[0])) + 1, cols = Math.max(...cells.map(c => c[1])) + 1;
  let s = `<svg class="gshape" viewBox="0 0 ${cols * size + 4} ${rows * size + 4}" style="width:${cols * size + 4}px;max-width:44vw">`;
  cells.forEach(([r, c]) => s += `<rect x="${2 + c * size}" y="${2 + r * size}" width="${size}" height="${size}" fill="${color}" stroke="#4a3b5c" stroke-width="2"/>`);
  return s + '</svg>';
}
/* 隨機長出 n 格連在一起的形狀（在 rows×cols 範圍內） */
function blob(n, rows = 4, cols = 5) {
  const set = new Set(['0,0']), list = [[0, 0]];
  let g = 0;
  while (list.length < n && g++ < 500) {
    const [r, c] = pick(list), [dr, dc] = pick([[0, 1], [1, 0], [0, -1], [-1, 0]]);
    const nr = r + dr, nc = c + dc, k = nr + ',' + nc;
    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || set.has(k)) continue;
    set.add(k); list.push([nr, nc]);
  }
  return list;
}
