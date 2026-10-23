'use strict';
/* 四年級數學樂園：畫圖工具（大數讀法、位值表、量角器、三角形、分數條、數線、百格板） */

/* ---------- 大數 ---------- */
const CN_D = '零一二三四五六七八九';
/* 0~9999 的國字讀法（不含前面的零） */
function cn4(n) {
  const u = ['千', '百', '十', ''], d = String(n).padStart(4, '0');
  let s = '', zero = false;
  for (let i = 0; i < 4; i++) {
    const c = +d[i];
    if (c === 0) { if (s) zero = true; continue; }
    if (zero) { s += '零'; zero = false; }
    s += CN_D[c] + u[i];
  }
  return s;
}
/* 一億以內的數讀法，例如 30051200 → 三千零五萬一千二百 */
function numCN(n) {
  if (n === 0) return '零';
  if (n >= 100000000) return '一億';
  const w = Math.floor(n / 10000), r = n % 10000;
  let s = w ? cn4(w) + '萬' : '';
  if (r) s += (w && r < 1000 ? '零' : '') + cn4(r);
  return s.replace(/^一十/, '十');
}
/* 30萬1200 這種寫法 */
const wanFmt = n => { const w = Math.floor(n / 10000), r = n % 10000; return w ? `${w}萬${r ? (r < 1000 ? '0' : '') + r : ''}` : String(r); };
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const PLACES = ['千萬', '百萬', '十萬', '萬', '千', '百', '十', '個'];
const placeName = k => PLACES[7 - k] + '位'; // k = 從個位數起第幾位（0 = 個位）

/* 位值表：digits 長度 8（千萬位到個位） */
function placeChartHTML(n, hi = -1) {
  const d = String(n).padStart(8, ' ').split('');
  return `<table class="pchart"><tr>${PLACES.map((p, i) => `<th class="${i < 4 ? 'w' : ''}${7 - i === hi ? ' hi' : ''}">${p}</th>`).join('')}</tr><tr>${d.map((c, i) => `<td class="${7 - i === hi ? 'hi' : ''}">${c.trim()}</td>`).join('')}</tr></table>`;
}

/* ---------- 角 ---------- */
const rad = a => a * Math.PI / 180;
/* 量角器：圓心 (200,210)，半徑 170。ray 為第二條邊的角度（第一條邊在 0° 向右）
   opt.flip：第一條邊在左邊（要看內圈另一邊的刻度）；opt.handle：畫可拖的圓點 */
function protractorSVG(ray, opt = {}) {
  const cx = 200, cy = 210, R = 170;
  let s = `<svg class="prot" viewBox="0 0 400 240"><path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z" fill="rgba(91,180,255,.13)" stroke="#5bb4ff" stroke-width="3"/>`;
  for (let k = 0; k <= 180; k++) {
    const a = rad(k), big = k % 10 === 0, mid = k % 5 === 0, r1 = big ? R - 18 : mid ? R - 12 : R - 7;
    s += `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy - r1 * Math.sin(a)}" x2="${cx + R * Math.cos(a)}" y2="${cy - R * Math.sin(a)}" stroke="#2f7fc4" stroke-width="${big ? 2 : 1}"/>`;
    if (big) {
      s += `<text x="${cx + (R - 30) * Math.cos(a)}" y="${cy - (R - 30) * Math.sin(a) + 5}" font-size="13" text-anchor="middle" fill="#2f7fc4" font-family="Arial">${180 - k}</text>`;
      s += `<text x="${cx + (R - 50) * Math.cos(a)}" y="${cy - (R - 50) * Math.sin(a) + 5}" font-size="12" text-anchor="middle" fill="#e5508f" font-family="Arial">${k}</text>`;
    }
  }
  s += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#2f7fc4" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="5" fill="#2f7fc4"/>`;
  const base = opt.flip ? 180 : 0, a2 = opt.flip ? 180 - ray : ray;
  if (ray !== null && ray !== undefined) {
    const L = R + 18;
    s += `<line x1="${cx}" y1="${cy}" x2="${cx + L * Math.cos(rad(base))}" y2="${cy - L * Math.sin(rad(base))}" stroke="#4a3b5c" stroke-width="5" stroke-linecap="round"/>`;
    s += `<line class="ray" x1="${cx}" y1="${cy}" x2="${cx + L * Math.cos(rad(a2))}" y2="${cy - L * Math.sin(rad(a2))}" stroke="#ff7eb3" stroke-width="5" stroke-linecap="round"/>`;
    const lo = Math.min(base, a2), hi = Math.max(base, a2);
    s += `<path d="M${cx + 36 * Math.cos(rad(lo))} ${cy - 36 * Math.sin(rad(lo))} A36 36 0 0 0 ${cx + 36 * Math.cos(rad(hi))} ${cy - 36 * Math.sin(rad(hi))}" fill="none" stroke="#ffc93c" stroke-width="5"/>`;
    if (opt.handle) s += `<circle class="handle" cx="${cx + L * Math.cos(rad(a2))}" cy="${cy - L * Math.sin(rad(a2))}" r="14" fill="#ff7eb3" stroke="#fff" stroke-width="4"/>`;
  }
  return s + '</svg>';
}
/* 一般的角（不用量角器），rot 是整個角轉的角度 */
function angleSVG(deg, rot = 0, size = 150) {
  const cx = 75, cy = 110, L = 62;
  const p = a => `${cx + L * Math.cos(rad(a))} ${cy - L * Math.sin(rad(a))}`;
  const arcR = 20, big = deg > 180 ? 1 : 0;
  const arc = deg === 90 ? `<path d="M${cx + 14 * Math.cos(rad(rot))} ${cy - 14 * Math.sin(rad(rot))} L${cx + 14 * Math.SQRT2 * Math.cos(rad(rot + 45))} ${cy - 14 * Math.SQRT2 * Math.sin(rad(rot + 45))} L${cx + 14 * Math.cos(rad(rot + 90))} ${cy - 14 * Math.sin(rad(rot + 90))}" fill="none" stroke="#ff9a4d" stroke-width="3"/>`
    : `<path d="M${cx + arcR * Math.cos(rad(rot))} ${cy - arcR * Math.sin(rad(rot))} A${arcR} ${arcR} 0 ${big} 0 ${cx + arcR * Math.cos(rad(rot + deg))} ${cy - arcR * Math.sin(rad(rot + deg))}" fill="none" stroke="#ff9a4d" stroke-width="3"/>`;
  return `<svg class="ang" viewBox="0 0 150 150" style="width:${size}px;height:${size}px"><line x1="${cx}" y1="${cy}" x2="${p(rot).replace(' ', '" y2="')}" stroke="#4a3b5c" stroke-width="4" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${p(rot + deg).replace(' ', '" y2="')}" stroke="#ff7eb3" stroke-width="4" stroke-linecap="round"/>${arc}<circle cx="${cx}" cy="${cy}" r="4" fill="#4a3b5c"/></svg>`;
}

/* ---------- 三角形 ---------- */
/* 依三邊長 a(底) b c 算出三點 */
function triPts(a, b, c) {
  const x = (a * a + b * b - c * c) / (2 * a), y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [a, 0], [x, y]].map(([px, py]) => [px, -py]); // 左下、右下、頂點（y 往上）
}
/* pts: 三點；labels: 邊上的字（底、右、左）；angs: 角上的字 */
function triSVG(pts, o = {}) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const W = maxx - minx || 1, H = maxy - miny || 1, sc = Math.min(110 / W, 90 / H);
  const P = pts.map(([x, y]) => [20 + (x - minx) * sc + (110 - W * sc) / 2, 18 + (y - miny) * sc + (90 - H * sc) / 2]);
  const sz = o.size || 140;
  let s = `<svg class="tri" viewBox="0 0 150 126" style="width:${sz}px;height:${sz * 0.84}px"><polygon points="${P.map(p => p.join(',')).join(' ')}" fill="${o.fill || '#fff3c4'}" stroke="${o.stroke || '#ff9a4d'}" stroke-width="3" stroke-linejoin="round"/>`;
  const cxm = (P[0][0] + P[1][0] + P[2][0]) / 3, cym = (P[0][1] + P[1][1] + P[2][1]) / 3;
  (o.sides || []).forEach((t, i) => {
    if (t === '' || t == null) return;
    const A = P[i], B = P[(i + 1) % 3], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    const dx = mx - cxm, dy = my - cym, d = Math.hypot(dx, dy) || 1;
    s += `<text x="${mx + dx / d * 13}" y="${my + dy / d * 13 + 5}" font-size="17" font-weight="900" text-anchor="middle" fill="#4a3b5c" font-family="Arial,Microsoft JhengHei">${t}</text>`;
  });
  (o.verts || []).forEach((t, i) => {
    if (!t) return;
    const A = P[i], dx = A[0] - cxm, dy = A[1] - cym, d = Math.hypot(dx, dy) || 1;
    s += `<text x="${A[0] + dx / d * 12}" y="${A[1] + dy / d * 12 + 5}" font-size="17" font-weight="900" text-anchor="middle" fill="#2f7fc4" font-family="Arial,Microsoft JhengHei">${t}</text>`;
  });
  (o.angs || []).forEach((t, i) => {
    if (!t) return;
    const A = P[i], dx = cxm - A[0], dy = cym - A[1], d = Math.hypot(dx, dy) || 1;
    s += `<text x="${A[0] + dx / d * 22}" y="${A[1] + dy / d * 22 + 4}" font-size="14" font-weight="900" text-anchor="middle" fill="#e5508f" font-family="Arial">${t}</text>`;
  });
  if (o.right !== undefined) {
    const i = o.right, A = P[i], B = P[(i + 1) % 3], C = P[(i + 2) % 3];
    const u = [(B[0] - A[0]), (B[1] - A[1])], v = [(C[0] - A[0]), (C[1] - A[1])], lu = Math.hypot(...u), lv = Math.hypot(...v), k = 10;
    const p1 = [A[0] + u[0] / lu * k, A[1] + u[1] / lu * k], p3 = [A[0] + v[0] / lv * k, A[1] + v[1] / lv * k], p2 = [p1[0] + v[0] / lv * k, p1[1] + v[1] / lv * k];
    s += `<polyline points="${[p1, p2, p3].map(p => p.join(',')).join(' ')}" fill="none" stroke="#2f7fc4" stroke-width="2"/>`;
  }
  return s + '</svg>';
}
/* 各種三角形的樣本（點座標，y 往上為負） */
const TRI = {
  eq: () => triPts(6, 6, 6),
  iso: () => { const a = pick([4, 5, 7]), b = pick([6, 7, 8].filter(x => x !== a)); return triPts(a, b, b); },
  isoR: () => [[0, 0], [5, 0], [0, -5]],
  scaR: () => [[0, 0], [6, 0], [0, -4]],
  sca: () => triPts(7, pick([5, 6]), 4),
  obt: () => [[0, 0], [8, 0], [-2, -3]],
  isoO: () => [[0, 0], [8, 0], [4, -1.8]],
  acute: () => triPts(6, 5, 5.6)
};

/* ---------- 分數 ---------- */
/* 一條分成 d 格、塗 f 格的分數條 */
function fracBar(d, f, cls = '') { return `<div class="fbar ${cls}">${Array.from({ length: d }, (_, k) => `<i class="${k < f ? 'on' : ''}" data-k="${k}"></i>`).join('')}</div>`; }
/* 分數的直式寫法（帶分數 w 不為 0 時前面加整數） */
const F = (n, d, w = 0) => `<span class="frac">${w ? `<b class="fw">${w}</b>` : ''}<span class="fnd"><span>${n}</span><span>${d}</span></span></span>`;
const fracText = (n, d, w = 0) => `${w ? w + '又' : ''}${d}分之${n}`;

/* 數線：從 lo 到 hi，每 1 分成 div 小格；marks: [{v, t, c}] 在數線上方標記；q: 問號的位置 */
function numberLineSVG(lo, hi, div, marks = [], o = {}) {
  const W = 560, x0 = 30, x1 = W - 30, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
  let s = `<svg class="nlsvg" viewBox="0 0 ${W} 110"><line x1="${x0 - 10}" y1="60" x2="${x1 + 12}" y2="60" stroke="#4a3b5c" stroke-width="3"/><path d="M${x1 + 12} 54 L${x1 + 22} 60 L${x1 + 12} 66 Z" fill="#4a3b5c"/>`;
  const steps = Math.round((hi - lo) * div);
  for (let k = 0; k <= steps; k++) {
    const v = lo + k / div, whole = k % div === 0, x = X(v);
    s += `<line x1="${x}" y1="${whole ? 46 : 52}" x2="${x}" y2="${whole ? 74 : 68}" stroke="#4a3b5c" stroke-width="${whole ? 3 : 1.6}"/>`;
    if (whole) s += `<text x="${x}" y="98" font-size="20" font-weight="900" text-anchor="middle" fill="#4a3b5c" font-family="Arial">${o.label ? o.label(v) : +v.toFixed(2)}</text>`;
  }
  marks.forEach(m => {
    const x = X(m.v);
    s += `<path d="M${x} 44 L${x - 8} 28 L${x + 8} 28 Z" fill="${m.c || '#ff7eb3'}"/>`;
    if (m.t) s += `<text x="${x}" y="22" font-size="18" font-weight="900" text-anchor="middle" fill="${m.c || '#e5508f'}" font-family="Arial,Microsoft JhengHei">${m.t}</text>`;
  });
  return s + '</svg>';
}

/* ---------- 小數：百格板 ---------- */
function grid100(n, cls = 'g100') {
  return `<div class="${cls}">${Array.from({ length: 100 }, (_, k) => { const col = k % 10, row = Math.floor(k / 10), idx = col * 10 + row; return `<i class="${idx < n ? 'on' : ''}" data-i="${idx}"></i>`; }).join('')}</div>`;
}
const dec2 = v => +v.toFixed(2);
