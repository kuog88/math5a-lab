'use strict';
/* 畫圖工具：除法直式、時鐘、方格圖形、秤面、表格 */

/* 除法直式（只畫題目框，商的位置用 ? 表示） */
function longDivHTML(a, b, q = '') {
  return `<div class="longdiv"><div class="q">${q || '&nbsp;'}</div><div>${b}<span class="ldbar">${a}</span></div></div>`;
}

/* 時鐘：h 可以是 0~23 */
function clockSVG(h, m, size = 220) {
  const c = 110, ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  let t = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 92 : 84;
    t += `<line x1="${c + Math.sin(a) * r1}" y1="${c - Math.cos(a) * r1}" x2="${c + Math.sin(a) * 98}" y2="${c - Math.cos(a) * 98}" stroke="#12324f" stroke-width="${i % 5 ? 1.5 : 3.5}"/>`;
  }
  for (let n = 1; n <= 12; n++) {
    const a = n * 30 * Math.PI / 180;
    t += `<text x="${c + Math.sin(a) * 70}" y="${c - Math.cos(a) * 70 + 8}" font-size="22" font-weight="900" text-anchor="middle" fill="#12324f">${n}</text>`;
  }
  const hand = (deg, len, w, col) => { const a = deg * Math.PI / 180; return `<line x1="${c}" y1="${c}" x2="${c + Math.sin(a) * len}" y2="${c - Math.cos(a) * len}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
  return `<svg viewBox="0 0 220 220" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="104" fill="#fffdf4" stroke="#b07a3c" stroke-width="8"/>${t}${hand(ha, 48, 8, '#ff7a59')}${hand(ma, 80, 5, '#0b3d6b')}<circle cx="${c}" cy="${c}" r="7" fill="#12324f"/></svg>`;
}
const pad2 = n => String(n).padStart(2, '0');
const t24 = (h, m) => `${h} 時 ${pad2(m)} 分`;
/* 12 時制說法：上午／中午／下午／晚上／半夜 */
function t12(h, m) {
  const hh = h % 12 === 0 ? 12 : h % 12;
  const w = h === 0 ? '半夜' : h < 12 ? '上午' : h === 12 ? '中午' : h < 18 ? '下午' : '晚上';
  return `${w} ${hh} 時 ${pad2(m)} 分`;
}

/* 方格圖形：rows 是字串陣列，'#' 整格，q/p/b/d 半格三角形（左上、右上、左下、右下的半格），'.' 空白 */
function shapeArea(rows) {
  let a = 0;
  rows.forEach(r => [...r].forEach(ch => { if (ch === '#') a += 1; else if ('qpbd'.includes(ch)) a += 0.5; }));
  return a;
}
function shapeSVG(rows, col = '#58c26b', u = 34) {
  const H = rows.length, W = Math.max(...rows.map(r => r.length));
  let g = '';
  for (let y = 0; y <= H; y++) g += `<line x1="0" y1="${y * u}" x2="${W * u}" y2="${y * u}" stroke="#9cc3d6" stroke-width="1"/>`;
  for (let x = 0; x <= W; x++) g += `<line x1="${x * u}" y1="0" x2="${x * u}" y2="${H * u}" stroke="#9cc3d6" stroke-width="1"/>`;
  let s = '';
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    const X = x * u, Y = y * u, X2 = X + u, Y2 = Y + u;
    const tri = { q: [[X, Y], [X2, Y], [X, Y2]], p: [[X, Y], [X2, Y], [X2, Y2]], b: [[X, Y], [X, Y2], [X2, Y2]], d: [[X2, Y], [X2, Y2], [X, Y2]] }[ch];
    if (ch === '#') s += `<rect x="${X}" y="${Y}" width="${u}" height="${u}" fill="${col}" stroke="#2b7a3a" stroke-width="1.5"/>`;
    else if (tri) s += `<polygon points="${tri.map(p => p.join(',')).join(' ')}" fill="${col}" stroke="#2b7a3a" stroke-width="1.5"/>`;
  }));
  return `<svg class="grid-svg" viewBox="-2 -2 ${W * u + 4} ${H * u + 4}" width="${Math.min(W * u + 4, 460)}">${g}${s}</svg>`;
}

/* 秤面：max 公克，step 一小格幾公克，lab 每隔幾公克寫數字，v 指針位置 */
function dialSVG(v, max, step, lab, size = 250) {
  const c = 125, R = 100, ang = g => (g / max) * 300 - 150;
  let t = '';
  for (let g = 0; g <= max; g += step) {
    const a = ang(g) * Math.PI / 180, big = g % lab === 0, r1 = big ? 82 : (g % (step * 5) === 0 ? 88 : 92);
    t += `<line x1="${c + Math.sin(a) * r1}" y1="${c - Math.cos(a) * r1}" x2="${c + Math.sin(a) * R}" y2="${c - Math.cos(a) * R}" stroke="#12324f" stroke-width="${big ? 3 : 1.2}"/>`;
    if (big) {
      const txt = g === 0 ? '0' : g % 1000 === 0 ? `${g / 1000}公斤` : `${g}`;
      t += `<text x="${c + Math.sin(a) * 64}" y="${c - Math.cos(a) * 64 + 5}" font-size="${g % 1000 === 0 && g ? 13 : 12}" font-weight="900" text-anchor="middle" fill="#12324f">${txt}</text>`;
    }
  }
  const a = ang(v) * Math.PI / 180;
  return `<svg viewBox="0 0 250 250" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="116" fill="#fff" stroke="#8b7bff" stroke-width="10"/>${t}
    <text x="${c}" y="${c - 30}" font-size="13" text-anchor="middle" fill="#5b7690">單位：公克</text>
    <line x1="${c}" y1="${c}" x2="${c + Math.sin(a) * 96}" y2="${c - Math.cos(a) * 96}" stroke="#ff5a6a" stroke-width="4" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="8" fill="#ff5a6a"/></svg>`;
}
const kgg = g => g >= 1000 ? `${Math.floor(g / 1000)} 公斤${g % 1000 ? ` ${g % 1000} 公克` : ''}` : `${g} 公克`;

/* 表格：head 第一列，rows 其餘各列（第一格當標題） */
function tableHTML(head, rows, title) {
  return `${title ? `<div class="note" style="font-weight:900;color:#12324f">${title}</div>` : ''}<table class="vtable"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((v, i) => i === 0 ? `<th>${v}</th>` : `<td${v === '?' ? ' class="q"' : ''}>${v}</td>`).join('')}</tr>`).join('')}</table>`;
}

/* 分數條或小數條（只看，不能點） */
function barHTML(n, on, cls = '') { return `<div class="bar small ${cls}">${Array.from({ length: n }, (_, k) => `<div class="seg${k < on ? ' on' : ''}"></div>`).join('')}</div>`; }
