'use strict';
/* 畫圖工具：扇形、等角立體積木、立體圖形、量筒、百格圖 */

/* 扇形：從向右的半徑開始，逆時針轉 deg 度 */
function sectorPath(cx, cy, r, deg) {
  if (deg >= 360) return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
  const a = deg * Math.PI / 180, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  return `M${cx},${cy}L${cx + r},${cy}A${r},${r} 0 ${deg > 180 ? 1 : 0},0 ${x.toFixed(2)},${y.toFixed(2)}Z`;
}
function sectorSVG(deg, opt = {}) {
  const S = opt.size || 220, c = S / 2, r = c - 14, col = opt.color || '#e9a21b';
  const arcMark = deg > 0 && deg < 360 ? `<path d="M${c + 26},${c}A26,26 0 ${deg > 180 ? 1 : 0},0 ${(c + 26 * Math.cos(deg * Math.PI / 180)).toFixed(2)},${(c - 26 * Math.sin(deg * Math.PI / 180)).toFixed(2)}" fill="none" stroke="#c8553d" stroke-width="3"/>` : '';
  return `<svg class="svgbox" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
    ${opt.full ? `<circle cx="${c}" cy="${c}" r="${r}" fill="#fff" stroke="#c9a86a" stroke-width="2" stroke-dasharray="5 5"/>` : ''}
    <path d="${sectorPath(c, c, r, deg)}" fill="${col}" fill-opacity=".85" stroke="#3d2410" stroke-width="3" stroke-linejoin="round"/>
    ${arcMark}<circle cx="${c}" cy="${c}" r="5" fill="#3d2410"/>
    ${opt.label ? `<text x="${c + 34}" y="${c - 10}" font-size="18" font-weight="900" fill="#c8553d">${opt.label}</text>` : ''}</svg>`;
}

/* 等角立體積木：cubes 是 [x,y,z] 陣列（單位立方體）。labels: {l,w,h} 標在長方體的邊上 */
function isoSVG(cubes, opt = {}) {
  const u = opt.u || 26, c = Math.cos(Math.PI / 6) * u, s = Math.sin(Math.PI / 6) * u;
  const P = (x, y, z) => [(x - y) * c, (x + y) * s - z * u];
  const all = [];
  cubes.forEach(([x, y, z]) => { for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) all.push(P(x + dx, y + dy, z + dz)); });
  if (opt.dims) { const { l, w, h } = opt.dims; all.push(P(l + 1.4, 0, 0), P(0, w + 1.4, 0), P(l + 1.2, w + 1, h)); }
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const minX = Math.min(...xs) - 30, minY = Math.min(...ys) - 18, W = Math.max(...xs) - minX + 30, H = Math.max(...ys) - minY + 18;
  const poly = (pts, f) => `<polygon points="${pts.map(p => P(...p)).map(([a, b]) => `${(a - minX).toFixed(1)},${(b - minY).toFixed(1)}`).join(' ')}" fill="${f}" stroke="#5a3412" stroke-width="1.4" stroke-linejoin="round"/>`;
  const set = new Set(cubes.map(k => k.join(',')));
  const has = (x, y, z) => set.has([x, y, z].join(','));
  const col = opt.color || ['#f3c56b', '#d99a3c', '#b8782a'];
  let g = '';
  cubes.slice().sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]) || a[2] - b[2]).forEach(([x, y, z]) => {
    if (!has(x, y, z + 1)) g += poly([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], col[0]);
    if (!has(x + 1, y, z)) g += poly([[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]], col[1]);
    if (!has(x, y + 1, z)) g += poly([[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], col[2]);
  });
  let t = '';
  const txt = (p, str) => { const [a, b] = P(...p); return `<text x="${(a - minX).toFixed(1)}" y="${(b - minY).toFixed(1)}" font-size="16" font-weight="900" fill="#c8553d" text-anchor="middle" stroke="#fff8ea" stroke-width="4" paint-order="stroke">${str}</text>`; };
  if (opt.dims) {
    const { l, w, h, lt, wt, ht } = opt.dims;
    t += txt([l / 2, w + 0.9, -0.2], lt || `${l} 公分`);
    t += txt([l + 1.2, w / 2, -0.2], wt || `${w} 公分`);
    t += txt([l + 0.4, w + 0.4, h / 2], ht || `${h} 公分`);
  }
  return `<svg class="svgbox" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${Math.min(W, opt.max || 420).toFixed(0)}">${g}${t}</svg>`;
}
/* 長方體的積木 */
function boxCubes(l, w, h, ox = 0, oy = 0, oz = 0) { const a = []; for (let x = 0; x < l; x++) for (let y = 0; y < w; y++) for (let z = 0; z < h; z++) a.push([x + ox, y + oy, z + oz]); return a; }

/* 立體圖形：kind = prism / pyramid / cylinder / cone / sphere，n = 底面邊數 */
function solidSVG(kind, n = 4, size = 100) {
  const cx = 50, by = 78, R = 34, k = 0.34, h = 50, st = 'stroke="#3d2410" stroke-width="2.4" stroke-linejoin="round"';
  const base = Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI + Math.PI / 2 + (n % 2 ? 0 : Math.PI / n) + (n === 4 ? 0.45 : 0); return [cx + R * Math.cos(a), by + R * k * Math.sin(a)]; });
  const pts = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  /* 底面前半圈的邊畫實線（後面的邊已用虛線） */
  const frontEdges = () => base.map((p, i) => { const q = base[(i + 1) % n]; return (p[1] + q[1]) / 2 > by - 0.5 ? `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${st}/>` : ''; }).join('');
  let g = '';
  if (kind === 'prism') {
    const top = base.map(([x, y]) => [x, y - h]);
    g += `<polygon points="${pts(base)}" fill="#f3c56b" ${st} stroke-dasharray="4 3"/>`;
    base.forEach(([x, y], i) => { g += `<line x1="${x}" y1="${y}" x2="${top[i][0]}" y2="${top[i][1]}" ${st}/>`; });
    g += frontEdges();
    g += `<polygon points="${pts(top)}" fill="#ffe2a0" ${st}/>`;
  } else if (kind === 'pyramid') {
    const ap = [cx, by - h - 8];
    g += `<polygon points="${pts(base)}" fill="#f3c56b" ${st} stroke-dasharray="4 3"/>`;
    base.forEach(([x, y]) => { g += `<line x1="${x}" y1="${y}" x2="${ap[0]}" y2="${ap[1]}" ${st}/>`; });
    g += frontEdges();
  } else if (kind === 'cylinder') {
    g += `<path d="M${cx - R},${by - h}V${by}A${R},${R * k} 0 0,0 ${cx + R},${by}V${by - h}" fill="#f3c56b" ${st}/><ellipse cx="${cx}" cy="${by - h}" rx="${R}" ry="${R * k}" fill="#ffe2a0" ${st}/>`;
  } else if (kind === 'cone') {
    g += `<path d="M${cx - R},${by}L${cx},${by - h - 8}L${cx + R},${by}A${R},${R * k} 0 0,1 ${cx - R},${by}Z" fill="#f3c56b" ${st}/><path d="M${cx - R},${by}A${R},${R * k} 0 0,1 ${cx + R},${by}" fill="none" ${st} stroke-dasharray="4 3"/>`;
  } else {
    g += `<circle cx="${cx}" cy="${by - 26}" r="${R + 4}" fill="#f3c56b" ${st}/><ellipse cx="${cx}" cy="${by - 26}" rx="${R + 4}" ry="${(R + 4) * k}" fill="none" ${st} stroke-dasharray="4 3"/>`;
  }
  return `<svg class="svgbox" viewBox="0 0 100 100" width="${size}" height="${size}">${g}</svg>`;
}

/* 量筒：容量 max 毫升，水位 v 毫升；obj 是放進去的東西（emoji） */
function cylSVG(v, max, step, obj = '') {
  const top = 30, bot = 250, x0 = 70, x1 = 170, y = val => bot - (val / max) * (bot - top);
  let t = '';
  for (let m = 0; m <= max; m += step) {
    const yy = y(m), major = m % (step * 5) === 0;
    t += `<line x1="${x1}" y1="${yy}" x2="${x1 - (major ? 22 : 12)}" y2="${yy}" stroke="#3d2410" stroke-width="${major ? 2.4 : 1.2}"/>`;
    if (major) t += `<text x="${x1 + 8}" y="${yy + 6}" font-size="15" font-weight="900" fill="#3d2410">${m}</text>`;
  }
  return `<svg class="svgbox" viewBox="0 0 240 270" width="230" height="258">
    <rect x="${x0}" y="${y(v)}" width="${x1 - x0}" height="${bot - y(v)}" fill="#7cc8e8" fill-opacity=".75"/>
    <line x1="${x0}" y1="${y(v)}" x2="${x1}" y2="${y(v)}" stroke="#2f5aa8" stroke-width="3"/>
    ${obj ? `<text x="${(x0 + x1) / 2 - 12}" y="${bot - 8}" font-size="40" text-anchor="middle">${obj}</text>` : ''}
    <path d="M${x0},${top - 10}V${bot}H${x1}V${top - 10}" fill="none" stroke="#3d2410" stroke-width="4"/>${t}
    <text x="${x0 + 4}" y="${top - 14}" font-size="14" font-weight="900" fill="#8a6a48">毫升</text></svg>`;
}

/* 10×10 方格（每格 u px），回傳 svg 字串，格子有 data-i */
function grid100SVG(u = 30) {
  let g = '';
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) g += `<rect class="c" data-i="${r * 10 + c}" data-r="${r}" data-c="${c}" x="${c * u + 2}" y="${r * u + 2}" width="${u}" height="${u}"/>`;
  return `<svg class="svgbox grid-svg" viewBox="0 0 ${u * 10 + 4} ${u * 10 + 4}" width="${u * 10 + 4}">${g}<rect x="2" y="2" width="${u * 10}" height="${u * 10}" fill="none" stroke="#3d2410" stroke-width="3"/></svg>`;
}
