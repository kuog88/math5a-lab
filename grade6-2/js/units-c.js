'use strict';
/* 速率／柱體的體積與表面積／圓面積與扇形面積 */

/* ===== 速率 ===== */
function speedA(st) {
  const mk = mixU => {
    const names = ['紅色火箭', '藍色火箭', '金色火箭'];
    for (;;) {
      const v = [rand(4, 12) * 5, rand(4, 12) * 5, rand(4, 12) * 5]; if (new Set(v).size < 3) continue;
      const t = v.map(() => pick([2, 3, 4, 5, 6])), d = v.map((x, i) => x * t[i]);
      const m = v.indexOf(Math.max(...v));
      return { q: `三艘火箭試飛：${names.map((n, i) => `${n} ${t[i]} 分鐘飛了 ${d[i]} 公里`).join('；')}。哪一艘<b>最快</b>？`, opts: names.map((n, i) => ({ h: n, ok: i === m })), hint: '比較每分鐘飛幾公里：距離 ÷ 時間。', after: names.map((n, i) => `${n} 分速 ${v[i]} 公里`).join('、') };
    }
  };
  const mk2 = () => { const kmh = pick([36, 54, 72, 90, 108]), mpm = kmh * 1000 / 60 + pick([-100, 100, 200, -200]); const fast = mpm * 60 / 1000 > kmh ? '探測車乙' : '探測車甲'; return { q: `探測車甲時速 ${kmh} 公里，探測車乙分速 ${mpm} 公尺。哪一台比較快？`, opts: [{ h: '探測車甲', ok: fast === '探測車甲' }, { h: '探測車乙', ok: fast === '探測車乙' }, { h: '一樣快', ok: false }], hint: `把時速 ${kmh} 公里換成分速：${kmh} × 1000 ÷ 60。`, after: `時速 ${kmh} 公里 ＝ 分速 ${kmh * 1000 / 60} 公尺` }; };
  quiz(st, [mk, mk, mk2, () => { const v = rand(6, 15) * 5, t = rand(3, 8); return { q: `一艘火箭 ${t} 分鐘飛了 ${v * t} 公里，牠的分速是幾公里？`, eq: `${v * t} ÷ ${t}`, ans: v, unit: '公里', hint: '速率 ＝ 距離 ÷ 時間。' }; }, mk2]);
}
function speedB(st) {
  quiz(st, shuffle([
    () => { const v = rand(40, 90), t = rand(2, 6); return { q: `月球車時速 ${v} 公里，行駛 ${t} 小時，走了幾公里？`, eq: `${v} × ${t}`, ans: v * t, unit: '公里', hint: '距離 ＝ 速率 × 時間。' }; },
    () => { const v = rand(4, 9) * 10, t = rand(3, 8); return { q: `太空人慢跑 ${v * t} 公尺用了 ${t} 分鐘，分速是幾公尺？`, eq: `${v * t} ÷ ${t}`, ans: v, unit: '公尺', hint: '速率 ＝ 距離 ÷ 時間。' }; },
    () => { const v = rand(5, 12) * 10, t = rand(2, 7); return { q: `飛船時速 ${v} 公里，要飛 ${v * t} 公里，需要幾小時？`, eq: `${v * t} ÷ ${v}`, ans: t, unit: '小時', hint: '時間 ＝ 距離 ÷ 速率。' }; },
    () => { const v = rand(60, 80), t = pick([1.5, 2.5, 0.5]); return { q: `月球車時速 ${v} 公里，行駛 ${t} 小時，走了幾公里？`, eq: `${v} × ${t}`, ans: v * t, unit: '公里', hint: '距離 ＝ 速率 × 時間，時間可以是小數。' }; },
    () => { const v = pick([60, 80, 90]), m = pick([30, 45, 20, 15]); return { q: `時速 ${v} 公里的車，${m} 分鐘可以走幾公里？`, eq: `${v} × ${m}/60`, alt: [`${v} ÷ 60 × ${m}`, `${v} × ${m} ÷ 60`], ans: v * m / 60, unit: '公里', hint: `${m} 分鐘 ＝ ${m}/60 小時。` }; }
  ]));
}
function speedC(st) {
  quiz(st, shuffle([
    () => { const k = pick([36, 54, 72, 90, 108]); return { q: `時速 ${k} 公里 ＝ 分速 ? 公尺`, ans: k * 1000 / 60, unit: '公尺', hint: `${k} 公里 ＝ ${k * 1000} 公尺，1 小時 ＝ 60 分。`, after: `${k * 1000} ÷ 60 ＝ ${k * 1000 / 60}` }; },
    () => { const m = pick([300, 600, 900, 1200]); return { q: `分速 ${m} 公尺 ＝ 秒速 ? 公尺`, ans: m / 60, unit: '公尺', hint: '1 分 ＝ 60 秒。', after: `${m} ÷ 60 ＝ ${m / 60}` }; },
    () => { const s = pick([5, 10, 15, 20]); return { q: `秒速 ${s} 公尺 ＝ 時速 ? 公里`, ans: s * 3600 / 1000, unit: '公里', hint: '1 小時 ＝ 3600 秒，1000 公尺 ＝ 1 公里。', after: `${s} × 3600 ÷ 1000 ＝ ${s * 3.6}` }; },
    () => { const d = pick([60, 90, 120]), t1 = pick([2, 3]), t2 = pick([3, 4, 5].filter(x => x !== t1)); const v = 2 * d / (t1 + t2); return Number.isInteger(v) ? { q: `探測車從基地到礦坑 ${d} 公里，去程 ${t1} 小時，回程 ${t2} 小時，來回的平均時速是幾公里？`, eq: `${d} × 2 ÷ (${t1} + ${t2})`, alt: [`(${d} + ${d}) ÷ (${t1} + ${t2})`], ans: v, unit: '公里', hint: '平均速率 ＝ 總距離 ÷ 總時間。' } : null; },
    () => { const m = pick([1.2, 1.5, 0.9]), k = m * 60; return { q: `分速 ${m} 公里 ＝ 時速 ? 公里`, ans: rd(k), unit: '公里', hint: '1 小時 ＝ 60 分，乘以 60。', after: `${m} × 60 ＝ ${rd(k)}` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function speedD(st) {
  adv(st, [
    { q: '時速 72 公里 ＝ 秒速幾公尺？', ans: 20, unit: '公尺', ex: '72 公里 ＝ 72000 公尺，1 小時 ＝ 3600 秒，72000 ÷ 3600 ＝ 20 公尺。', trap: '要同時換距離單位和時間單位。' },
    { q: '去程時速 60 公里，回程時速 40 公里，路程都是 120 公里，來回的平均時速是幾公里？', eq: '120 × 2 ÷ (120 ÷ 60 + 120 ÷ 40)', alt: ['240 ÷ (2 + 3)', '(120 + 120) ÷ (120 ÷ 60 + 120 ÷ 40)'], ans: 48, unit: '公里', ex: '去程 2 小時、回程 3 小時，總距離 240 公里 ÷ 5 小時 ＝ 48 公里。', trap: '平均速率不是 (60 ＋ 40) ÷ 2 ＝ 50，要用總距離 ÷ 總時間。' },
    { q: '一列長 200 公尺的火車，秒速 25 公尺，完全通過一座長 800 公尺的橋要幾秒？', eq: '(800 + 200) ÷ 25', alt: ['(200 + 800) ÷ 25'], ans: 40, unit: '秒', ex: '火車頭上橋到車尾離橋，共走了 800 ＋ 200 ＝ 1000 公尺，1000 ÷ 25 ＝ 40 秒。', trap: '要加上火車本身的長度。' },
    { q: '下面哪一個最快？', opts: [{ h: '秒速 15 公尺', ok: true }, { h: '分速 800 公尺', ok: false }, { h: '時速 50 公里', ok: false }, { h: '分速 0.85 公里', ok: false }], ex: '都換成分速：秒速 15 公尺 ＝ 分速 900 公尺；時速 50 公里 ≈ 分速 833 公尺；分速 0.85 公里 ＝ 850 公尺。最快是秒速 15 公尺。', trap: '單位不同不能直接比數字大小。' },
    { q: '小星騎車分速 250 公尺，騎了 1 小時 12 分，騎了幾公里？', eq: '250 × 72 ÷ 1000', alt: ['250 × (60 + 12) ÷ 1000', '0.25 × 72'], ans: 18, unit: '公里', ex: '1 小時 12 分 ＝ 72 分，250 × 72 ＝ 18000 公尺 ＝ 18 公里。', trap: '1 小時 12 分不是 1.12 小時，也不是 112 分。' }
  ]);
}

/* ===== 柱體的體積與表面積 ===== */
const PI = 3.14;
function baseSVG(kind, a, b) {
  if (kind === 'circle') return `<svg class="svgbox" viewBox="0 0 160 120" width="160"><ellipse cx="80" cy="40" rx="60" ry="20" fill="#bfe9ef" stroke="#1b2340" stroke-width="2.5"/><path d="M20,40V90A60,20 0 0,0 140,90V40" fill="#9fdbe4" stroke="#1b2340" stroke-width="2.5"/><line x1="80" y1="40" x2="140" y2="40" stroke="#e5484d" stroke-width="2.5"/><text x="110" y="34" font-size="14" font-weight="900" fill="#e5484d" text-anchor="middle">${a} cm</text></svg>`;
  if (kind === 'tri') return `<svg class="svgbox" viewBox="0 0 170 130" width="170"><polygon points="20,100 120,100 20,40" fill="#d8ccff" stroke="#1b2340" stroke-width="2.5"/><polygon points="20,40 60,20 160,80 120,100" fill="#c2b2ff" stroke="#1b2340" stroke-width="2.5"/><line x1="20" y1="40" x2="20" y2="100" stroke="#1b2340" stroke-width="2.5"/><text x="70" y="120" font-size="14" font-weight="900" text-anchor="middle">${a} cm</text><text x="14" y="74" font-size="14" font-weight="900" text-anchor="end">${b}</text><path d="M20,90h10v10" fill="none" stroke="#1b2340"/></svg>`;
  return `<svg class="svgbox" viewBox="0 0 170 130" width="170"><polygon points="20,100 110,100 110,60 20,60" fill="#d6e4ff" stroke="#1b2340" stroke-width="2.5"/><polygon points="20,60 60,30 150,30 110,60" fill="#c3d5ff" stroke="#1b2340" stroke-width="2.5"/><polygon points="110,60 150,30 150,70 110,100" fill="#aac4ff" stroke="#1b2340" stroke-width="2.5"/><text x="65" y="120" font-size="14" font-weight="900" text-anchor="middle">${a} cm</text><text x="140" y="100" font-size="14" font-weight="900">${b} cm</text></svg>`;
}
function prismA(st) {
  const tasks = [{ kind: 'rect', a: 6, b: 4 }, { kind: 'tri', a: 8, b: 5 }, { kind: 'circle', a: 2 }];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r], area = T.kind === 'rect' ? T.a * T.b : T.kind === 'tri' ? T.a * T.b / 2 : rd(T.a * T.a * PI), H = rand(3, 9), V = rd(area * H);
    const nm = { rect: '長方體', tri: '直角三角柱', circle: '圓柱' }[T.kind];
    let h = 1;
    api.say(`貨艙是${nm}，底面積是 <b>${area}</b> 平方公分（${T.kind === 'rect' ? `${T.a} × ${T.b}` : T.kind === 'tri' ? `${T.a} × ${T.b} ÷ 2` : `${T.a} × ${T.a} × 3.14`}）。調整高度，讓體積剛好是 <b>${V}</b> 立方公分！`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center">${baseSVG(T.kind, T.a, T.b)}</div><div class="ctl"><div class="grp">高 <button type="button" data-d="-1">−</button><span class="v" id="vh">1</span><button type="button" data-d="1">＋</button> 公分</div></div>
      <div class="readout">體積 ＝ 底面積 × 高 ＝ ${area} × <span id="hh">1</span> ＝ <span id="vv"></span> 立方公分</div><div class="center"><button type="button" class="btn gold" id="okb">剛好！</button></div>`;
    const draw = () => { $('#vh', st).textContent = h; $('#hh', st).textContent = h; $('#vv', st).textContent = rd(area * h); };
    $$('.ctl button', st).forEach(b => b.onclick = () => { h = Math.max(1, Math.min(12, h + +b.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (h === H) { $('#okb', st).disabled = true; api.ok('剛好！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">高 ＝ 體積 ÷ 底面積 ＝ ${V} ÷ ${area} ＝ ${H} 公分</span></div>`); speak('剛好'); r++; later(round, 2400); return; }
      api.bad(rd(area * h) < V ? '體積還不夠，再高一點。' : '體積太多了，矮一點。', `高 ${h} 公分`, `高 ${H} 公分`);
    };
    draw();
  }
  round();
}
function prismB(st) {
  quiz(st, shuffle([
    () => { const a = rand(3, 9), b = rand(3, 9), h = rand(4, 12); return { q: `直角三角柱的底面是兩股 ${a} 公分、${b} 公分的直角三角形，高 ${h} 公分，體積是幾立方公分？`, eq: `${a} × ${b} ÷ 2 × ${h}`, alt: [`${a} × ${b} × ${h} ÷ 2`, `(${a} × ${b} ÷ 2) × ${h}`], ans: a * b * h / 2, unit: '立方公分', hint: '柱體體積 ＝ 底面積 × 高。' }; },
    () => { const r = rand(2, 6), h = rand(3, 10); return { q: `圓柱的底面半徑 ${r} 公分，高 ${h} 公分，體積是幾立方公分？（圓周率 3.14）`, eq: `${r} × ${r} × 3.14 × ${h}`, ans: rd(r * r * PI * h), unit: '立方公分', hint: '底面積 ＝ 半徑 × 半徑 × 3.14。' }; },
    () => { const d = pick([4, 6, 8, 10]), h = rand(3, 10); return { q: `圓柱的底面<b>直徑</b> ${d} 公分，高 ${h} 公分，體積是幾立方公分？（圓周率 3.14）`, eq: `(${d} ÷ 2) × (${d} ÷ 2) × 3.14 × ${h}`, alt: [`${d / 2} × ${d / 2} × 3.14 × ${h}`], ans: rd(d * d / 4 * PI * h), unit: '立方公分', hint: `直徑 ${d}，半徑是 ${d / 2}。` }; },
    () => { const A = rand(12, 40), h = rand(5, 12); return { q: `一個五角柱的底面積是 ${A} 平方公分，高 ${h} 公分，體積是幾立方公分？`, eq: `${A} × ${h}`, ans: A * h, unit: '立方公分', hint: '任何柱體：體積 ＝ 底面積 × 高。' }; },
    () => { const L = rand(8, 12), W = rand(6, 8), H = rand(4, 6), l = rand(2, 4), w = rand(2, 3); return { q: `長 ${L}、寬 ${W}、高 ${H} 公分的長方體，從上到下挖穿一個長 ${l}、寬 ${w} 公分的長方形洞，剩下的體積是幾立方公分？`, eq: `${L} × ${W} × ${H} − ${l} × ${w} × ${H}`, alt: [`(${L} × ${W} − ${l} × ${w}) × ${H}`], ans: (L * W - l * w) * H, unit: '立方公分', hint: '底面積變成大長方形減掉洞，高不變。' }; }
  ]));
}
function prismC(st) {
  quiz(st, shuffle([
    () => { const a = rand(3, 9), b = rand(3, 9), c = rand(3, 9); return { q: `長 ${a}、寬 ${b}、高 ${c} 公分的長方體，表面積是幾平方公分？`, eq: `(${a} × ${b} + ${b} × ${c} + ${a} × ${c}) × 2`, alt: [`${a} × ${b} × 2 + ${b} × ${c} × 2 + ${a} × ${c} × 2`, `${a} × ${b} × 2 + (${a} + ${b}) × 2 × ${c}`], ans: (a * b + b * c + a * c) * 2, unit: '平方公分', hint: '6 個面，3 組一樣大的長方形。' }; },
    () => { const s = rand(3, 9); return { q: `邊長 ${s} 公分的正方體，表面積是幾平方公分？`, eq: `${s} × ${s} × 6`, ans: s * s * 6, unit: '平方公分', hint: '6 個一樣的正方形。' }; },
    () => { const r = rand(2, 5), h = rand(4, 10); return { q: `圓柱底面半徑 ${r} 公分、高 ${h} 公分，<b>側面積</b>是幾平方公分？（圓周率 3.14）`, eq: `${r} × 2 × 3.14 × ${h}`, alt: [`${r * 2} × 3.14 × ${h}`, `2 × ${r} × 3.14 × ${h}`], ans: rd(2 * r * PI * h), unit: '平方公分', hint: '側面展開是長方形：長 ＝ 底面圓周長，寬 ＝ 高。' }; },
    () => { const r = rand(2, 5), h = rand(4, 10); return { q: `圓柱底面半徑 ${r} 公分、高 ${h} 公分，表面積是幾平方公分？（圓周率 3.14）`, eq: `${r} × ${r} × 3.14 × 2 + ${r} × 2 × 3.14 × ${h}`, alt: [`2 × ${r} × ${r} × 3.14 + 2 × ${r} × 3.14 × ${h}`, `${r * r * 2} × 3.14 + ${r * 2 * h} × 3.14`], ans: rd(2 * r * r * PI + 2 * r * PI * h), unit: '平方公分', hint: '表面積 ＝ 2 個底面 ＋ 側面。' }; },
    () => { const [a, b, c] = pick([[3, 4, 5], [6, 8, 10]]), h = rand(5, 10); return { q: `直角三角柱的底面三邊是 ${a}、${b}、${c} 公分（${a}、${b} 是兩股），高 ${h} 公分，表面積是幾平方公分？`, eq: `${a} × ${b} ÷ 2 × 2 + (${a} + ${b} + ${c}) × ${h}`, alt: [`${a} × ${b} + (${a} + ${b} + ${c}) × ${h}`, `${a} × ${b} ÷ 2 × 2 + ${a} × ${h} + ${b} × ${h} + ${c} × ${h}`], ans: a * b + (a + b + c) * h, unit: '平方公分', hint: '2 個三角形底面 ＋ 側面（底面周長 × 高）。' }; }
  ]));
}
function prismD(st) {
  adv(st, [
    { q: '一個圓柱水桶底面直徑 20 公分，裝了 15 公分高的水，水的體積是幾立方公分？（圓周率 3.14）', eq: '10 × 10 × 3.14 × 15', alt: ['(20 ÷ 2) × (20 ÷ 2) × 3.14 × 15'], ans: 4710, unit: '立方公分', ex: '半徑 10 公分，底面積 10 × 10 × 3.14 ＝ 314，314 × 15 ＝ 4710 立方公分。', trap: '直徑 20 要先除以 2 變半徑。' },
    { q: '把一個長方體的長、寬、高都變成 2 倍，體積變成幾倍？', ans: 8, unit: '倍', ex: '2 × 2 × 2 ＝ 8 倍。', trap: '不是 2 倍，三個邊都變 2 倍，要乘三次。' },
    { q: '兩個邊長 5 公分的正方體黏成一個長方體，表面積是幾平方公分？', eq: '5 × 5 × 10', alt: ['5 × 5 × 6 × 2 − 5 × 5 × 2', '(5 × 10 + 5 × 10 + 5 × 5) × 2'], ans: 250, unit: '平方公分', ex: '兩個正方體共 12 個面，黏起來少了 2 個面，剩 10 個面：25 × 10 ＝ 250。', trap: '黏在一起的兩個面看不到了，要扣掉，不是 150 × 2 ＝ 300。' },
    { q: '底面積 50 平方公分的柱體，體積 400 立方公分，高是幾公分？', eq: '400 ÷ 50', ans: 8, unit: '公分', ex: '高 ＝ 體積 ÷ 底面積 ＝ 400 ÷ 50 ＝ 8 公分。', trap: '已知體積求高，用除法。' },
    { q: '一個無蓋的長方體水箱，長 10、寬 8、高 6 公分，外面要貼貼紙（底面也要貼），共要貼幾平方公分？', eq: '10 × 8 + (10 × 6 + 8 × 6) × 2', alt: ['10 × 8 + 10 × 6 × 2 + 8 × 6 × 2', '(10 + 8) × 2 × 6 + 10 × 8'], ans: 296, unit: '平方公分', ex: '無蓋只有 5 個面：底 80 ＋ 前後 120 ＋ 左右 96 ＝ 296 平方公分。', trap: '沒有蓋子，上面那一面不算。' }
  ]);
}

/* ===== 圓面積與扇形面積 ===== */
/* 扇形的半徑和圓心角：面積算得出有限小數的組合 */
const SECT = [[3, 120], [6, 120], [9, 120], [6, 60], [12, 60], [4, 45], [8, 45], [4, 90], [6, 90], [10, 90], [8, 180], [10, 180], [12, 30]];
function circSVG(r, deg = 360, lab = '') {
  const S = 180, c = S / 2, R = 70, a = deg * Math.PI / 180, x = c + R * Math.sin(a), y = c - R * Math.cos(a);
  const path = deg >= 360 ? `<circle cx="${c}" cy="${c}" r="${R}" fill="#e6ebff" stroke="#1b2340" stroke-width="2.5"/>` : `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#9fb0e8" stroke-dasharray="4 4"/><path d="M${c},${c}L${c},${c - R}A${R},${R} 0 ${deg > 180 ? 1 : 0},1 ${x.toFixed(1)},${y.toFixed(1)}Z" fill="#c2b2ff" stroke="#1b2340" stroke-width="2.5"/>`;
  return `<svg class="svgbox" viewBox="0 0 ${S} ${S}" width="${S}">${path}<line x1="${c}" y1="${c}" x2="${c}" y2="${c - R}" stroke="#e5484d" stroke-width="2.5"/><text x="${c + 6}" y="${c - R / 2}" font-size="14" font-weight="900" fill="#e5484d">${r} cm</text>${lab ? `<text x="${c + 8}" y="${c + 18}" font-size="14" font-weight="900">${lab}</text>` : ''}<circle cx="${c}" cy="${c}" r="3" fill="#1b2340"/></svg>`;
}
function circA(st) {
  const tasks = shuffle([3, 4, 5, 6, 10]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const R = tasks[r];
    api.say(`月球基地的圓形停機坪半徑 <b>${R}</b> 公尺。把圓切成很多片，拼成一個近似長方形：長是圓周長的一半，寬是半徑。長方形的長是幾公尺？`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center">${circSVG(R)}<svg class="svgbox" viewBox="0 0 220 80" width="220">${Array.from({ length: 8 }, (_, i) => `<path d="M${20 + i * 22},${i % 2 ? 10 : 70} L${42 + i * 22},${i % 2 ? 10 : 70} L${31 + i * 22},${i % 2 ? 70 : 10}Z" fill="${i % 2 ? '#c2b2ff' : '#9fdbe4'}" stroke="#1b2340"/>`).join('')}</svg></div><div class="kwrap" id="kw"></div>`;
    keypad($('#kw', st), rd(R * PI), () => {
      api.say(`長 ${rd(R * PI)} 公尺、寬 ${R} 公尺。圓面積 ＝ 長 × 寬 ＝ ? 平方公尺`);
      keypad($('#kw', st), rd(R * R * PI), () => { $('#kw', st).innerHTML = `<div class="center"><span class="after">圓面積 ＝ 半徑 × 半徑 × 3.14 ＝ ${R} × ${R} × 3.14 ＝ ${rd(R * R * PI)} 平方公尺</span></div>`; speak('圓面積等於半徑乘以半徑乘以三點一四'); r++; later(round, 2600); }, `${rd(R * PI)} × ${R}`, '平方公尺', true);
    }, `圓周長的一半 ＝ 半徑 × 3.14 ＝ ${R} × 3.14。`, '公尺', true);
  }
  round();
}
function circB(st) {
  quiz(st, shuffle([
    () => { const R = rand(2, 10); return { q: `半徑 ${R} 公分的圓，面積是幾平方公分？（圓周率 3.14）`, vis: circSVG(R), eq: `${R} × ${R} × 3.14`, ans: rd(R * R * PI), unit: '平方公分', hint: '圓面積 ＝ 半徑 × 半徑 × 3.14。' }; },
    () => { const d = pick([4, 6, 8, 10, 12]); return { q: `<b>直徑</b> ${d} 公分的圓，面積是幾平方公分？（圓周率 3.14）`, eq: `(${d} ÷ 2) × (${d} ÷ 2) × 3.14`, alt: [`${d / 2} × ${d / 2} × 3.14`], ans: rd(d * d / 4 * PI), unit: '平方公分', hint: `先把直徑 ${d} 除以 2 變成半徑。` }; },
    () => { const [R, deg] = pick(SECT); return { q: `半徑 ${R} 公分、圓心角 ${deg} 度的扇形，面積是幾平方公分？（圓周率 3.14）`, vis: circSVG(R, deg, `${deg}°`), eq: `${R} × ${R} × 3.14 × ${deg}/360`, alt: [`${R} × ${R} × 3.14 ÷ 360 × ${deg}`, `${R} × ${R} × 3.14 × ${deg} ÷ 360`, `${R} × ${R} × 3.14 ÷ ${360 / deg}`], ans: rd(R * R * PI * deg / 360), unit: '平方公分', hint: `扇形面積 ＝ 圓面積 × ${deg}/360。` }; },
    () => { const R = rand(2, 8); return { q: `半徑 ${R} 公分的半圓，面積是幾平方公分？（圓周率 3.14）`, eq: `${R} × ${R} × 3.14 ÷ 2`, alt: [`${R} × ${R} × 3.14 × 1/2`], ans: rd(R * R * PI / 2), unit: '平方公分', hint: '半圓是圓面積的一半。' }; },
    { q: '半徑變成 2 倍，圓面積變成幾倍？（圓周率 3.14）', opts: [{ h: '4 倍', ok: true }, { h: '2 倍', ok: false }, { h: '3.14 倍', ok: false }], hint: '半徑 × 半徑，兩個都變 2 倍。' }
  ]));
}
function circC(st) {
  quiz(st, shuffle([
    () => { const s = pick([4, 6, 8, 10]); return { q: `邊長 ${s} 公分的正方形裡，畫一個最大的圓，正方形剩下的面積是幾平方公分？（圓周率 3.14）`, vis: `<svg class="svgbox" viewBox="0 0 130 130" width="130"><rect x="5" y="5" width="120" height="120" fill="#c2b2ff" stroke="#1b2340" stroke-width="2.5"/><circle cx="65" cy="65" r="60" fill="#eef2ff" stroke="#1b2340" stroke-width="2.5"/></svg>`, eq: `${s} × ${s} − (${s} ÷ 2) × (${s} ÷ 2) × 3.14`, alt: [`${s} × ${s} − ${s / 2} × ${s / 2} × 3.14`], ans: rd(s * s - s * s / 4 * PI), unit: '平方公分', hint: `最大的圓直徑 ${s}，半徑 ${s / 2}。` }; },
    () => { const R = rand(5, 9), r = rand(2, R - 2); return { q: `圓環的外圓半徑 ${R} 公分、內圓半徑 ${r} 公分，圓環面積是幾平方公分？（圓周率 3.14）`, eq: `${R} × ${R} × 3.14 − ${r} × ${r} × 3.14`, alt: [`(${R} × ${R} − ${r} × ${r}) × 3.14`], ans: rd((R * R - r * r) * PI), unit: '平方公分', hint: '大圓面積 − 小圓面積。' }; },
    () => { const w = pick([4, 6, 8]), L = rand(8, 14); return { q: `一個圖形由長 ${L}、寬 ${w} 公分的長方形，和以寬為直徑的半圓組成，面積是幾平方公分？（圓周率 3.14）`, eq: `${L} × ${w} + (${w} ÷ 2) × (${w} ÷ 2) × 3.14 ÷ 2`, alt: [`${L} × ${w} + ${w / 2} × ${w / 2} × 3.14 ÷ 2`], ans: rd(L * w + w * w / 8 * PI), unit: '平方公分', hint: `半圓的半徑是 ${w / 2}。` }; },
    () => { const R = pick([2, 4, 6, 10]); return { q: `四分之一圓的半徑 ${R} 公分，面積是幾平方公分？（圓周率 3.14）`, eq: `${R} × ${R} × 3.14 ÷ 4`, alt: [`${R} × ${R} × 3.14 × 1/4`, `${R} × ${R} × 3.14 × 90/360`], ans: rd(R * R * PI / 4), unit: '平方公分', hint: '四分之一圓 ＝ 圓面積 ÷ 4。' }; }
  ]));
}
function circD(st) {
  adv(st, [
    { q: '圓周長是 31.4 公分，面積是幾平方公分？（圓周率 3.14）', eq: '(31.4 ÷ 3.14 ÷ 2) × (31.4 ÷ 3.14 ÷ 2) × 3.14', alt: ['5 × 5 × 3.14'], ans: 78.5, unit: '平方公分', ex: '直徑 ＝ 31.4 ÷ 3.14 ＝ 10，半徑 5，面積 5 × 5 × 3.14 ＝ 78.5。', trap: '要先由周長求半徑，不能直接 31.4 × 3.14。' },
    { q: '半徑 6 公分、圓心角 120 度的扇形，面積是幾平方公分？（圓周率 3.14）', eq: '6 × 6 × 3.14 × 120/360', alt: ['6 × 6 × 3.14 ÷ 3', '6 × 6 × 3.14 × 1/3'], ans: 37.68, unit: '平方公分', ex: '120/360 ＝ 1/3，6 × 6 × 3.14 ÷ 3 ＝ 37.68。', trap: '扇形是圓的 120/360，不是 120/100。' },
    { q: '半徑 10 公分的圓，切掉一個圓心角 90 度的扇形，剩下的面積是幾平方公分？（圓周率 3.14）', eq: '10 × 10 × 3.14 × 270/360', alt: ['10 × 10 × 3.14 × 3/4', '10 × 10 × 3.14 − 10 × 10 × 3.14 ÷ 4'], ans: 235.5, unit: '平方公分', ex: '剩下 270 度，是圓的 3/4：314 × 3/4 ＝ 235.5。', trap: '題目問剩下的，不是切掉的 78.5。' },
    { q: '兩個圓的半徑比是 1：3，大圓面積是小圓的幾倍？（圓周率 3.14）', ans: 9, unit: '倍', ex: '面積 ＝ 半徑 × 半徑 × 3.14，3 × 3 ＝ 9 倍。', trap: '不是 3 倍，半徑要乘兩次。' },
    { q: '邊長 10 公分的正方形中，以四個頂點為圓心、半徑 5 公分各畫四分之一圓，四個四分之一圓以外的面積是幾平方公分？（圓周率 3.14）', eq: '10 × 10 − 5 × 5 × 3.14', alt: ['10 × 10 − 5 × 5 × 3.14 ÷ 4 × 4'], ans: 21.5, unit: '平方公分', ex: '四個四分之一圓合起來剛好是一個半徑 5 的圓：100 − 78.5 ＝ 21.5。', trap: '四個四分之一圓 ＝ 1 個整圓。' }
  ]);
}

Object.assign(LEVELS, {
  speed: [speedA, speedB, speedC, speedD],
  prism: [prismA, prismB, prismC, prismD],
  circ: [circA, circB, circC, circD]
});
