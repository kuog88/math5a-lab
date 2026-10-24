'use strict';
/* 三年級數學樂園：畫圖工具（國字讀法、位值積木、直式、尺、量杯、角、分數、數線、圓） */

/* ---------- 10000 以內的數 ---------- */
const CN_D = '零一二三四五六七八九';
/* 0~10000 的國字讀法，例如 3050 → 三千零五十、1008 → 一千零八 */
function numCN(n) {
  if (n === 0) return '零';
  if (n === 10000) return '一萬';
  const u = ['千', '百', '十', ''], d = String(n).padStart(4, '0');
  let s = '', zero = false;
  for (let i = 0; i < 4; i++) {
    const c = +d[i];
    if (c === 0) { if (s) zero = true; continue; }
    if (zero) { s += '零'; zero = false; }
    s += CN_D[c] + u[i];
  }
  return s.replace(/^一十/, '十');
}
const PL = ['千', '百', '十', '一'];
const PLV = [1000, 100, 10, 1];
const digitsOf = n => String(n).padStart(4, '0').split('').map(Number);

/* 位值積木：千＝千方塊、百＝百格板、十＝十條、一＝小方塊 */
function blockSVG(kind) {
  let s = '';
  if (kind === 1000) {
    return `<svg class="blk b1000" viewBox="0 0 80 80"><path d="M4 22 L22 4 H76 V58 L58 76 H4 Z" fill="#a98bff" stroke="#6a4fc4" stroke-width="2"/><path d="M4 22 H58 V76 M58 22 L76 4" fill="none" stroke="#6a4fc4" stroke-width="2"/>${[1, 2, 3, 4].map(k => `<line x1="4" y1="${22 + k * 10.8}" x2="58" y2="${22 + k * 10.8}" stroke="#c9b8ff" stroke-width="1.2"/><line x1="${4 + k * 10.8}" y1="22" x2="${4 + k * 10.8}" y2="76" stroke="#c9b8ff" stroke-width="1.2"/>`).join('')}</svg>`;
  }
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
function blocksHTML(th, h, t, o) {
  return `<div class="blocks2">${Array(th).fill(blockSVG(1000)).join('')}${Array(h).fill(blockSVG(100)).join('')}${Array(t).fill(blockSVG(10)).join('')}<span class="ones">${Array(o).fill(blockSVG(1)).join('')}</span></div>`;
}

/* ---------- 直式（加、減、乘）----------
   top、bot：上下兩個數；res：答案列每一格（由左到右，長度 w），'' 空白、'?' 正在填、'_' 還沒填
   marks：上面一列的小字（進位或借位後的數），由左到右長度 w */
function vertHTML(top, bot, op, res, w, marks) {
  const pad = n => String(n).padStart(w, ' ').split('').map(c => c === ' ' ? '' : c);
  const cell = c => c === '?' ? '<i class="vbox now"></i>' : c === '_' ? '<i class="vbox"></i>' : c;
  const row = (list, pre = '') => `<div class="vrow"><b class="vop">${pre}</b>${list.map(c => `<span>${c}</span>`).join('')}</div>`;
  return `<div class="vert">${marks ? row(marks.map(m => m === '' ? '' : `<em class="cy">${m}</em>`)) : ''}${row(pad(top))}${row(pad(bot), op)}<div class="vline"></div>${row(res.map(cell))}</div>`;
}

/* ---------- 尺：每公分 CM 個 SVG 單位，有毫米小刻度 ---------- */
const CM = 40;
function rulerSVG(len, o = {}) {
  const W = len * CM + 40;
  let s = `<svg class="ruler" viewBox="0 0 ${W} 150" style="width:min(${W * 1.1}px,94vw)">`;
  (o.items || []).forEach(it => {
    s += `<rect x="${20 + it.from * CM}" y="${it.y || 34}" width="${it.len * CM}" height="${it.h || 24}" rx="6" fill="${it.c || '#ff9a4d'}" stroke="#4a3b5c" stroke-width="2"/>`;
  });
  s += `<rect x="6" y="70" width="${W - 12}" height="74" rx="8" fill="#fff6c9" stroke="#d9b54a" stroke-width="3"/>`;
  for (let k = 0; k <= len * 10; k++) {
    const x = 20 + k * CM / 10, big = k % 10 === 0, mid = k % 5 === 0;
    s += `<line x1="${x}" y1="70" x2="${x}" y2="${70 + (big ? 30 : mid ? 21 : 13)}" stroke="#4a3b5c" stroke-width="${big ? 2.4 : 1}"/>`;
    if (big) s += `<text x="${x}" y="128" text-anchor="middle" font-size="22" font-weight="900" fill="#4a3b5c" font-family="Arial">${k / 10}</text>`;
  }
  if (o.pen !== undefined) {
    const x = 20 + o.pen * CM;
    s += `<line class="pen" x1="20" y1="52" x2="${x}" y2="52" stroke="#ff7eb3" stroke-width="7" stroke-linecap="round"/>`;
    s += `<circle class="handle" cx="${x}" cy="52" r="15" fill="#ff7eb3" stroke="#fff" stroke-width="4"/>`;
  }
  return s + '</svg>';
}

/* ---------- 量杯：cap 是總容量（毫升），ml 是水量，step 是刻度間隔 ---------- */
function cupSVG(cap, ml, step, o = {}) {
  const top = 20, bot = 230, H = bot - top, y = v => bot - v / cap * H;
  let s = `<svg class="mcup" viewBox="0 0 170 250"><rect x="40" y="${y(ml)}" width="90" height="${bot - y(ml)}" fill="${o.color || '#7cc8ff'}"/>`;
  s += `<path d="M36 ${top - 8} V${bot + 4} Q36 ${bot + 12} 44 ${bot + 12} H126 Q134 ${bot + 12} 134 ${bot + 4} V${top - 8}" fill="none" stroke="#4a3b5c" stroke-width="4"/>`;
  for (let v = step; v <= cap; v += step) {
    const big = v % (o.label || step * 2) === 0 || v === cap;
    s += `<line x1="134" y1="${y(v)}" x2="${big ? 112 : 120}" y2="${y(v)}" stroke="#4a3b5c" stroke-width="${big ? 2.5 : 1.4}"/>`;
    if (big) s += `<text x="140" y="${y(v) + 5}" font-size="14" font-weight="900" fill="#4a3b5c" font-family="Arial">${v}</text>`;
  }
  if (o.handle) s += `<rect class="handle" x="52" y="${y(ml) - 8}" width="66" height="16" rx="8" fill="#2f7fc4" stroke="#fff" stroke-width="3"/>`;
  return s + `<text x="85" y="${bot + 4}" font-size="12" text-anchor="middle" fill="#4a3b5c" font-family="Arial">mL</text></svg>`;
}
/* 容器（給比較用）：level 0~100 */
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

/* ---------- 角 ---------- */
const rad = a => a * Math.PI / 180;
/* deg：角的大小；rot：整個角轉的角度；len：邊長（不影響角的大小） */
function angleSVG(deg, rot = 0, size = 150, len = 62) {
  const cx = 75, cy = deg + rot > 150 ? 90 : 110, L = len;
  const p = a => `${cx + L * Math.cos(rad(a))} ${cy - L * Math.sin(rad(a))}`;
  const arcR = 20;
  const arc = deg === 90 ? `<path d="M${cx + 14 * Math.cos(rad(rot))} ${cy - 14 * Math.sin(rad(rot))} L${cx + 14 * Math.SQRT2 * Math.cos(rad(rot + 45))} ${cy - 14 * Math.SQRT2 * Math.sin(rad(rot + 45))} L${cx + 14 * Math.cos(rad(rot + 90))} ${cy - 14 * Math.sin(rad(rot + 90))}" fill="none" stroke="#ff9a4d" stroke-width="3"/>`
    : `<path d="M${cx + arcR * Math.cos(rad(rot))} ${cy - arcR * Math.sin(rad(rot))} A${arcR} ${arcR} 0 0 0 ${cx + arcR * Math.cos(rad(rot + deg))} ${cy - arcR * Math.sin(rad(rot + deg))}" fill="none" stroke="#ff9a4d" stroke-width="3"/>`;
  return `<svg class="ang" viewBox="0 0 150 150" style="width:${size}px;height:${size}px"><line x1="${cx}" y1="${cy}" x2="${p(rot).replace(' ', '" y2="')}" stroke="#4a3b5c" stroke-width="4" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${p(rot + deg).replace(' ', '" y2="')}" stroke="#ff7eb3" stroke-width="4" stroke-linecap="round"/>${arc}<circle cx="${cx}" cy="${cy}" r="4" fill="#4a3b5c"/></svg>`;
}

/* ---------- 方格紙上的四邊形：w、h 格；skew 讓它變成平行四邊形 ---------- */
function quadSVG(w, h, skew = 0, size = 120) {
  const g = 14, W = (w + Math.abs(skew)) * g + 8, H = h * g + 8;
  const x0 = 4 + (skew < 0 ? -skew * g : 0);
  const pts = [[x0, 4 + h * g], [x0 + w * g, 4 + h * g], [x0 + w * g + skew * g, 4], [x0 + skew * g, 4]];
  let s = `<svg class="quad" viewBox="0 0 ${W} ${H}" style="width:${size}px;height:${size * H / W}px;max-height:110px">`;
  for (let x = 4; x <= W; x += g) s += `<line x1="${x}" y1="4" x2="${x}" y2="${H - 4}" stroke="#e8e0f0" stroke-width="1"/>`;
  for (let y = 4; y <= H; y += g) s += `<line x1="4" y1="${y}" x2="${W - 4}" y2="${y}" stroke="#e8e0f0" stroke-width="1"/>`;
  return s + `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="#e2f3ff" stroke="#2f7fc4" stroke-width="3" stroke-linejoin="round"/></svg>`;
}

/* ---------- 分數 ---------- */
function fracBar(d, f, cls = '') { return `<div class="fbar ${cls}">${Array.from({ length: d }, (_, k) => `<i class="${k < f ? 'on' : ''}" data-k="${k}"></i>`).join('')}</div>`; }
/* 圓形披薩：分成 d 等分、塗 f 份 */
function pizzaSVG(d, f, size = 150, cls = '') {
  const c = 75, r = 66;
  let s = `<svg class="pizza ${cls}" viewBox="0 0 150 150" style="width:${size}px;height:${size}px">`;
  if (d === 1) return s + `<circle cx="${c}" cy="${c}" r="${r}" fill="${f ? '#ffc93c' : '#fff'}" stroke="#ff9a4d" stroke-width="4" data-k="0"/></svg>`;
  for (let k = 0; k < d; k++) {
    const a1 = rad(-90 + k * 360 / d), a2 = rad(-90 + (k + 1) * 360 / d), big = 360 / d > 180 ? 1 : 0;
    s += `<path data-k="${k}" d="M${c} ${c} L${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} A${r} ${r} 0 ${big} 1 ${c + r * Math.cos(a2)} ${c + r * Math.sin(a2)} Z" fill="${k < f ? '#ffc93c' : '#fff'}" stroke="#ff9a4d" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return s + '</svg>';
}
const F = (n, d) => `<span class="frac"><span class="fnd"><span>${n}</span><span>${d}</span></span></span>`;
const fracText = (n, d) => `${d}分之${n}`;

/* ---------- 數線：lo~hi，每 step 一個刻度，每 lab 寫一個數；marks: [{v, t, c}] ---------- */
function numberLineSVG(lo, hi, step, lab, marks = []) {
  const W = 560, x0 = 34, x1 = W - 34, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
  let s = `<svg class="nlsvg" viewBox="0 0 ${W} 110"><line x1="${x0 - 12}" y1="60" x2="${x1 + 12}" y2="60" stroke="#4a3b5c" stroke-width="3"/><path d="M${x1 + 12} 54 L${x1 + 22} 60 L${x1 + 12} 66 Z" fill="#4a3b5c"/>`;
  for (let v = lo; v <= hi + 1e-9; v += step) {
    const big = Math.round(v - lo) % lab === 0, x = X(v);
    s += `<line x1="${x}" y1="${big ? 46 : 52}" x2="${x}" y2="${big ? 74 : 68}" stroke="#4a3b5c" stroke-width="${big ? 3 : 1.6}"/>`;
    if (big) s += `<text x="${x}" y="98" font-size="18" font-weight="900" text-anchor="middle" fill="#4a3b5c" font-family="Arial">${v}</text>`;
  }
  marks.forEach(m => {
    const x = X(m.v);
    s += `<path d="M${x} 44 L${x - 8} 28 L${x + 8} 28 Z" fill="${m.c || '#ff7eb3'}"/>`;
    if (m.t) s += `<text x="${x}" y="22" font-size="18" font-weight="900" text-anchor="middle" fill="${m.c || '#e5508f'}" font-family="Arial,Microsoft JhengHei">${m.t}</text>`;
  });
  return s + '</svg>';
}

/* ---------- 圓：segs 是要畫的線段 [{k:'r'|'d'|'chord'|'out', a:角度, id}]，可以點 ---------- */
function circleSVG(segs = [], o = {}) {
  const c = 110, r = 86, P = a => [c + r * Math.cos(rad(a)), c - r * Math.sin(rad(a))];
  let s = `<svg class="circ" viewBox="0 0 220 220"><circle cx="${c}" cy="${c}" r="${r}" fill="#fff8dd" stroke="${o.hiRim ? '#e5508f' : '#ff9a4d'}" stroke-width="${o.hiRim ? 7 : 4}"/>`;
  segs.forEach(g => {
    let a, b;
    if (g.k === 'r') { a = [c, c]; b = P(g.a); }
    else if (g.k === 'd') { a = P(g.a); b = P(g.a + 180); }
    else if (g.k === 'chord') { a = P(g.a); b = P(g.a + (g.span || 110)); }
    else { a = P(g.a); b = [c + 30 * Math.cos(rad(g.a + 70)), c - 30 * Math.sin(rad(g.a + 70))]; } // 一端在圓周、一端不在圓心
    s += `<g class="seg" data-id="${g.id || ''}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="22" stroke-linecap="round"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${g.c || '#5bb4ff'}" stroke-width="5" stroke-linecap="round"/>${g.t ? `<text x="${(a[0] + b[0]) / 2 + 8}" y="${(a[1] + b[1]) / 2 - 8}" font-size="18" font-weight="900" fill="#4a3b5c" font-family="Arial">${g.t}</text>` : ''}</g>`;
  });
  (o.pts || []).forEach(p => {
    const [x, y] = p.center ? [c, c] : p.on ? P(p.a) : [c + (p.d || 40) * Math.cos(rad(p.a)), c - (p.d || 40) * Math.sin(rad(p.a))];
    s += `<g class="seg" data-id="${p.id}"><circle cx="${x}" cy="${y}" r="16" fill="transparent"/><circle cx="${x}" cy="${y}" r="7" fill="${p.c || '#4a3b5c'}"/>${p.t ? `<text x="${x + 10}" y="${y - 10}" font-size="18" font-weight="900" fill="#4a3b5c" font-family="Arial">${p.t}</text>` : ''}</g>`;
  });
  if (!o.noCenter) s += `<circle cx="${c}" cy="${c}" r="4" fill="#4a3b5c"/>`;
  return s + '</svg>';
}
