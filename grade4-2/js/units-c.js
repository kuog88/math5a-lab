'use strict';
/* 時間的計算／體積與立方公分／數量規律／四則運算與簡化計算 */

/* ---------- 時間的計算 ---------- */
const pad2 = n => String(n).padStart(2, '0');
/* 分鐘數（0～1439）→「下午 2 時 05 分（14:05）」 */
const tmTxt = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h < 12 ? '上午' : '下午'} ${h % 12 === 0 ? 12 : h % 12} 時 ${pad2(mm)} 分（${pad2(h)}:${pad2(mm)}）`; };
const durTxt = m => `${Math.floor(m / 60) ? Math.floor(m / 60) + ' 時 ' : ''}${m % 60 ? m % 60 + ' 分' : ''}`.trim() || '0 分';
function clockSVG(m) {
  const h = (m / 60) % 12, mm = m % 60, A = (deg, len, w, c) => { const a = (deg - 90) * Math.PI / 180; return `<line x1="70" y1="70" x2="${(70 + len * Math.cos(a)).toFixed(1)}" y2="${(70 + len * Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
  let t = ''; for (let i = 1; i <= 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; t += `<text x="${(70 + 52 * Math.cos(a)).toFixed(1)}" y="${(75 + 52 * Math.sin(a)).toFixed(1)}" font-size="13" font-weight="900" text-anchor="middle">${i}</text>`; }
  return `<svg class="svgbox" viewBox="0 0 140 140" width="140"><circle cx="70" cy="70" r="64" fill="#fffaf0" stroke="#8b5e34" stroke-width="5"/>${t}${A(h * 30, 32, 6, '#2c2a1a')}${A(mm * 6, 48, 3.5, '#d0482a')}<circle cx="70" cy="70" r="4" fill="#2c2a1a"/></svg>`;
}
function timeA(st) {
  const mk = k => { const s = k === 2 ? rand(10, 11) * 60 + rand(1, 5) * 10 + rand(0, 9) : rand(8, 15) * 60 + rand(0, 11) * 5, d = rand(1, 3) * 60 + rand(1, 11) * 5; return [s, d]; };
  const tasks = [mk(0), mk(1), mk(2)];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [s, d] = tasks[r]; let now = s;
    api.say(`化石展從 <b>${tmTxt(s)}</b> 開始，展出 <b>${durTxt(d)}</b>。把時鐘往後撥，撥到結束的時刻！`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="clk"></div><div class="readout" id="now"></div>
      <div class="ctl"><div class="grp"><button type="button" data-d="60">＋1 時</button><button type="button" data-d="10">＋10 分</button><button type="button" data-d="1">＋1 分</button></div>
      <div class="grp"><button type="button" data-d="-60">−1 時</button><button type="button" data-d="-10">−10 分</button><button type="button" data-d="-1">−1 分</button></div></div>
      <div class="readout">已經撥了 <span id="pass"></span></div><div class="center"><button type="button" class="btn gold" id="okb">撥好了！</button></div>`;
    const draw = () => { $('#clk', st).innerHTML = clockSVG(now); $('#now', st).textContent = tmTxt(now); $('#pass', st).textContent = durTxt(now - s); };
    $$('.ctl button', st).forEach(b => b.onclick = () => { now = Math.max(s, Math.min(s + 600, now + +b.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (now === s + d) { $('#okb', st).disabled = true; api.ok('撥對了！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">結束是 ${tmTxt(s + d)}</span></div>`); speak('結束是' + tmTxt(s + d).replace(/（.*）/, '')); r++; later(round, 2400); return; }
      api.bad(`要撥 ${durTxt(d)}，現在撥了 ${durTxt(now - s)}。`, tmTxt(now), tmTxt(s + d));
    };
    draw();
  }
  round();
}
function timeB(st) {
  quiz(st, shuffle([
    () => { const x = rand(1, 4), y = rand(1, 23); return { q: `${x} 日 ${y} 時 ＝ ? 時`, ans: x * 24 + y, unit: '時', hint: '1 日 ＝ 24 時。', after: `${x} × 24 ＋ ${y} ＝ ${x * 24 + y} 時` }; },
    () => { const m = rand(2, 5) * 60 + rand(1, 59); return { q: `${m} 分 ＝ ? 時 ? 分`, ans2: [Math.floor(m / 60), m % 60], labels: ['時', '分'], hint: '60 分 ＝ 1 時，看看裡面有幾個 60。', after: `${m} ÷ 60 ＝ ${Math.floor(m / 60)} … ${m % 60}` }; },
    () => { const sec = rand(2, 9) * 60 + rand(1, 59); return { q: `${sec} 秒 ＝ ? 分 ? 秒`, ans2: [Math.floor(sec / 60), sec % 60], labels: ['分', '秒'], hint: '60 秒 ＝ 1 分。', after: `${sec} ÷ 60 ＝ ${Math.floor(sec / 60)} … ${sec % 60}` }; },
    () => { const h = rand(25, 95); if (h % 24 === 0) return null; return { q: `${h} 時 ＝ ? 日 ? 時`, ans2: [Math.floor(h / 24), h % 24], labels: ['日', '時'], hint: '24 時 ＝ 1 日。', after: `${h} ÷ 24 ＝ ${Math.floor(h / 24)} … ${h % 24}` }; },
    () => { const h = rand(2, 5), m = rand(5, 55); return { q: `${h} 時 ${m} 分 ＝ ? 分`, ans: h * 60 + m, unit: '分', hint: '1 時 ＝ 60 分。', after: `${h} × 60 ＋ ${m} ＝ ${h * 60 + m} 分` }; },
    () => { const m = rand(2, 9); return { q: `${m} 分 ＝ ? 秒`, ans: m * 60, unit: '秒', hint: '1 分 ＝ 60 秒。', after: `${m} × 60 ＝ ${m * 60} 秒` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function timeC(st) {
  quiz(st, shuffle([
    () => { const a = rand(1, 4) * 60 + rand(20, 55), b = rand(1, 3) * 60 + rand(30, 55); return { q: `${durTxt(a)} ＋ ${durTxt(b)} ＝ ? 時 ? 分`, ans2: [Math.floor((a + b) / 60), (a + b) % 60], labels: ['時', '分'], hint: '分加分、時加時；滿 60 分要進位成 1 時。', after: `＝ ${durTxt(a + b)}` }; },
    () => { const a = rand(4, 6) * 60 + rand(5, 25), b = rand(1, 3) * 60 + rand(30, 55); return { q: `${durTxt(a)} − ${durTxt(b)} ＝ ? 時 ? 分`, ans2: [Math.floor((a - b) / 60), (a - b) % 60], labels: ['時', '分'], hint: '分不夠減，從時借 1 時 ＝ 60 分。', after: `＝ ${durTxt(a - b)}` }; },
    () => { const s = rand(8, 10) * 60 + rand(1, 11) * 5, e = rand(13, 16) * 60 + rand(0, 11) * 5, d = e - s; return { q: `恐龍博物館從 ${tmTxt(s)} 開到 ${tmTxt(e)}，一共開了多久？`, ans2: [Math.floor(d / 60), d % 60], labels: ['時', '分'], hint: '用 24 時制把結束的時刻減掉開始的時刻。', after: `${pad2(Math.floor(e / 60))}:${pad2(e % 60)} − ${pad2(Math.floor(s / 60))}:${pad2(s % 60)} ＝ ${durTxt(d)}` }; },
    () => { const s = rand(21, 23) * 60 + rand(1, 11) * 5, e = rand(5, 7) * 60 + rand(0, 11) * 5, d = 1440 - s + e; return { q: `探險隊從晚上 ${tmTxt(s)} 出發，到隔天早上 ${tmTxt(e)} 到達，走了多久？`, ans2: [Math.floor(d / 60), d % 60], labels: ['時', '分'], hint: '先算到半夜 12 時（24:00），再加上隔天的時間。', after: `到 24:00 是 ${durTxt(1440 - s)}，再加 ${durTxt(e)}，共 ${durTxt(d)}` }; },
    () => { const e = rand(14, 17) * 60 + rand(0, 11) * 5, d = rand(1, 2) * 60 + rand(1, 11) * 5, s = e - d; return { q: `恐龍電影在 ${tmTxt(e)} 播完，片長 ${durTxt(d)}。電影是幾時幾分開始的？（用 24 時制回答）`, ans2: [Math.floor(s / 60), s % 60], labels: ['時', '分'], hint: '一段時間「之前」，用減法往回算。', after: `開始時刻是 ${tmTxt(s)}` }; },
    () => { const a = [rand(1, 3), rand(10, 20)], b = [rand(1, 2), rand(10, 20)], t = (a[0] + b[0]) * 24 + a[1] + b[1]; return { q: `${a[0]} 日 ${a[1]} 時 ＋ ${b[0]} 日 ${b[1]} 時 ＝ ? 日 ? 時`, ans2: [Math.floor(t / 24), t % 24], labels: ['日', '時'], hint: '時加時，滿 24 時要進位成 1 日。', after: `＝ ${Math.floor(t / 24)} 日 ${t % 24} 時` }; }
  ]));
}
function timeD(st) {
  adv(st, [
    { q: '3 時 15 分 − 1 時 40 分 ＝ ? 時 ? 分', ans2: [1, 35], labels: ['時', '分'], ex: '15 分不夠減 40 分，從 3 時借 1 時 ＝ 60 分：2 時 75 分 − 1 時 40 分 ＝ 1 時 35 分。', trap: '借 1 時是借 60 分，不是借 100 分。' },
    { q: '從上午 10 時 50 分到下午 1 時 20 分，經過了多久？', ans2: [2, 30], labels: ['時', '分'], ex: '下午 1 時 20 分 ＝ 13:20，13:20 − 10:50 ＝ 2 時 30 分。', trap: '要先把下午的時刻換成 24 時制（13 時），不能直接算 1 − 10。' },
    { q: '200 分 ＝ ? 時 ? 分', ans2: [3, 20], labels: ['時', '分'], ex: '200 ÷ 60 ＝ 3 … 20，所以是 3 時 20 分。', trap: '時和分是 60 進位，不是 100 進位，200 分不是 2 時。' },
    { q: '晚上 11 時 30 分出發，經過 7 時 45 分後到達，到達時是隔天幾時幾分？（用 24 時制回答）', ans2: [7, 15], labels: ['時', '分'], ex: '23:30 ＋ 7 時 45 分 ＝ 31:15，超過 24 時要減掉 24，是隔天 7:15。', trap: '超過半夜 12 時就是隔天，要減 24 時。' },
    { q: '一部影片長 1 時 25 分，連續播放 3 次，一共要多久？', ans2: [4, 15], labels: ['時', '分'], ex: '1 時 25 分 × 3 ＝ 3 時 75 分 ＝ 4 時 15 分。', trap: '75 分超過 60 分，要再進位 1 時。' }
  ]);
}

/* ---------- 體積與立方公分 ---------- */
const AMB = ['#ffd27a', '#f0a640', '#c7781e'];
function volA(st) {
  const pool = shuffle([[4, 3, 2], [3, 2, 4], [5, 2, 2], [3, 3, 3], [4, 2, 3], [2, 2, 5]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= pool.length) return api.finish();
    const [L, W, H] = pool[r], V = L * W * H, hide = ['l', 'w', 'h'][r % 3];
    const known = { l: `長 ${L} 公分`, w: `寬 ${W} 公分`, h: `高 ${H} 公分` };
    let d = { l: 1, w: 1, h: 1 };
    api.say(`用 1 立方公分的琥珀方塊，堆出<b>體積 ${V} 立方公分</b>的長方體，${Object.keys(known).filter(k => k !== hide).map(k => known[k]).join('、')}。`);
    st.innerHTML = `${dots(r, pool.length)}<div class="center" id="pic"></div><div class="ctl">${[['l', '長'], ['w', '寬'], ['h', '高']].map(([k, n]) => `<div class="grp">${n} <button type="button" data-k="${k}" data-d="-1">−</button><span class="v" id="v${k}">1</span><button type="button" data-k="${k}" data-d="1">＋</button></div>`).join('')}</div>
      <div class="readout">一層 <span id="lay"></span> 個 × <span id="hh"></span> 層 ＝ <span id="tot"></span> 立方公分</div><div class="center"><button type="button" class="btn gold" id="okb">堆好了！</button></div>`;
    const draw = () => { $('#pic', st).innerHTML = isoSVG(boxCubes(d.l, d.w, d.h), { u: 22, max: 340, color: AMB }); ['l', 'w', 'h'].forEach(k => $('#v' + k, st).textContent = d[k]); $('#lay', st).textContent = d.l * d.w; $('#hh', st).textContent = d.h; $('#tot', st).textContent = d.l * d.w * d.h; };
    $$('.ctl button', st).forEach(b => b.onclick = () => { const k = b.dataset.k; d[k] = Math.max(1, Math.min(6, d[k] + +b.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const ok = d.l === L && d.w === W && d.h === H;
      if (ok) { $('#okb', st).disabled = true; api.ok('堆對了！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">一層 ${L * W} 個，${H} 層，共 ${V} 立方公分</span></div>`); speak(`體積是${V}立方公分`); r++; later(round, 2400); return; }
      api.bad(d.l * d.w * d.h !== V ? `體積要 ${V} 立方公分，現在是 ${d.l * d.w * d.h}。` : '體積對了，再看看題目給的長、寬、高。', `長${d.l}寬${d.w}高${d.h}`, `長${L}寬${W}高${H}`);
    };
    draw();
  }
  round();
}
function volB(st) {
  quiz(st, shuffle([
    () => { const l = rand(2, 5), w = rand(2, 4), h = rand(2, 4); return { q: '這個長方體是用 1 立方公分的積木排滿的（看不見的地方也排滿），體積是幾立方公分？', vis: isoSVG(boxCubes(l, w, h), { u: 22, color: AMB }), ans: l * w * h, unit: '立方公分', hint: `一層有 ${l} × ${w} 個，有 ${h} 層。`, after: `${l} × ${w} × ${h} ＝ ${l * w * h} 立方公分` }; },
    () => { const l = rand(3, 5), w = rand(2, 3); return { q: '一層排了幾個 1 立方公分的積木？', vis: isoSVG(boxCubes(l, w, 1), { u: 24, color: AMB }), ans: l * w, unit: '個', hint: `一排 ${l} 個，有 ${w} 排。` }; },
    () => { const a = rand(3, 4), b = rand(2, 3), c = rand(1, 2), top = boxCubes(a - 1, b, c, 0, 0, 2); return { q: '這個形體由兩個長方體疊起來（看不見的地方也排滿），體積是幾立方公分？', vis: isoSVG([...boxCubes(a, b, 2), ...top], { u: 22, color: AMB }), ans: a * b * 2 + (a - 1) * b * c, unit: '立方公分', hint: '下面一塊、上面一塊，分開數再加起來。', after: `${a * b * 2} ＋ ${(a - 1) * b * c} ＝ ${a * b * 2 + (a - 1) * b * c} 立方公分` }; },
    { q: '1 立方公分是多大？', opts: [{ h: '邊長 1 公分的正方體', ok: true }, { h: '邊長 1 公分的正方形', ok: false }, { h: '長 1 公分的線段', ok: false }], hint: '體積是立體的大小，要用正方體來量。' },
    () => { const n = rand(12, 30); return { q: `把 ${n} 個 1 立方公分的積木重新排成另一個形狀，體積是幾立方公分？`, ans: n, unit: '立方公分', hint: '積木個數沒變，體積就不變。' }; },
    () => { const l = rand(3, 5), w = rand(2, 3), h = rand(2, 3), take = rand(1, l - 1); const cubes = boxCubes(l, w, h).filter(([x, y, z]) => !(z === h - 1 && y === w - 1 && x >= l - take)); return { q: '這個長方體上層前面拿走了幾個積木（看不見的地方都排滿），現在的體積是幾立方公分？', vis: isoSVG(cubes, { u: 22, color: AMB }), ans: l * w * h - take, unit: '立方公分', hint: '先算完整的長方體，再減掉拿走的。', after: `${l * w * h} − ${take} ＝ ${l * w * h - take} 立方公分` }; }
  ]));
}
function volC(st) {
  quiz(st, shuffle([
    () => { const A = [rand(2, 4), rand(2, 3), rand(2, 3)], B = [rand(2, 5), rand(2, 3), rand(1, 3)], va = A[0] * A[1] * A[2], vb = B[0] * B[1] * B[2]; return { q: '甲和乙都是用 1 立方公分的積木排滿的，哪一個體積比較大？', vis: `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap"><div>甲<br>${isoSVG(boxCubes(...A), { u: 18, color: AMB, max: 200 })}</div><div>乙<br>${isoSVG(boxCubes(...B), { u: 18, color: ['#b9e0a0', '#7fbf5a', '#4f8f35'], max: 200 })}</div></div>`, opts: [{ h: '甲', ok: va > vb }, { h: '乙', ok: vb > va }, { h: '一樣大', ok: va === vb }], hint: '分別數出兩個的積木個數再比。', after: `甲 ${va} 立方公分、乙 ${vb} 立方公分` }; },
    () => { const l = rand(3, 6), w = rand(2, 4), h = rand(2, 5); return { q: `長方體一層排 ${l} × ${w} 個 1 立方公分的積木，排了 ${h} 層，體積是幾立方公分？`, eq: `${l} × ${w} × ${h}`, ans: l * w * h, unit: '立方公分', hint: '一層的個數 × 層數。' }; },
    () => { const v = rand(4, 9) * 6, lay = pick([6, 12, 8].filter(x => v % x === 0)) || 6; return v % lay ? null : { q: `一個長方體的體積是 ${v} 立方公分，一層有 ${lay} 個 1 立方公分的積木，有幾層？`, eq: `${v} ÷ ${lay}`, ans: v / lay, unit: '層', hint: '體積 ÷ 一層的個數 ＝ 層數。' }; },
    { q: '體積一樣的兩個形體，形狀一定一樣。', opts: [{ h: '不對', ok: true }, { h: '對', ok: false }], hint: '同樣 12 個積木可以排成很多種不同的形狀。' },
    () => { const s = rand(2, 4); return { q: `邊長 ${s} 公分的正方體，可以排滿幾個 1 立方公分的積木？`, ans: s * s * s, unit: '個', hint: `一層 ${s} × ${s} 個，有 ${s} 層。`, after: `${s} × ${s} × ${s} ＝ ${s ** 3} 個` }; }
  ].map(f => typeof f !== 'function' ? f : () => { let q; do { q = f(); } while (!q); return q; })));
}
function volD(st) {
  adv(st, [
    { q: '一個長方體一層有 4 × 3 個 1 立方公分的積木，共有 5 層。如果拿走最上面一層，剩下的體積是幾立方公分？', eq: '4 × 3 × 4', alt: ['4 × 3 × 5 − 4 × 3', '4 × 3 × (5 − 1)'], ans: 48, unit: '立方公分', ex: '拿走一層剩 4 層：4 × 3 × 4 ＝ 48 立方公分（或 60 − 12 ＝ 48）。', trap: '拿走的是一整層 12 個，不是 1 個。' },
    { q: '這個形體（看不見的地方都排滿）的體積是幾立方公分？', vis: isoSVG([...boxCubes(3, 2, 1), ...boxCubes(1, 2, 2, 0, 0, 1)], { u: 26, color: AMB }), ans: 10, unit: '立方公分', ex: '下層 3 × 2 ＝ 6 個，左邊再疊 2 層、每層 1 × 2 ＝ 2 個，共 6 ＋ 4 ＝ 10 立方公分。', trap: '後面被擋住的積木也要算。' },
    { q: '下面哪一個的體積<b>最大</b>？', opts: [{ h: '一層 6 個，排 4 層', ok: true }, { h: '一層 5 個，排 4 層', ok: false }, { h: '一層 7 個，排 3 層', ok: false }, { h: '一層 11 個，排 2 層', ok: false }], ex: '分別是 24、20、21、22 立方公分，最大是一層 6 個排 4 層。', trap: '不能只看一層的個數或只看層數，要相乘才知道。' },
    { q: '邊長 3 公分的正方體，最多可以排幾個 1 立方公分的積木？', ans: 27, unit: '個', ex: '一層 3 × 3 ＝ 9 個，排 3 層，9 × 3 ＝ 27 個。', trap: '不是 3 × 3 ＝ 9，正方體有 3 層。' },
    { q: '小龍用 24 個 1 立方公分的積木排成長方體，高 2 公分、長 4 公分，寬是幾公分？', eq: '24 ÷ 2 ÷ 4', alt: ['24 ÷ (2 × 4)', '24 ÷ (4 × 2)', '24 ÷ 4 ÷ 2'], ans: 3, unit: '公分', ex: '每層 24 ÷ 2 ＝ 12 個，一排 4 個，12 ÷ 4 ＝ 3 排，寬 3 公分。', trap: '要先算一層幾個，再算有幾排。' }
  ]);
}

/* ---------- 數量規律 ---------- */
/* 火柴棒正方形一排：第 n 個圖用 3n＋1 根；三角形一排：2n＋1 根 */
function stickSVG(kind, n) {
  const u = 26, W = (kind === 'sq' ? n : n / 2 + 0.5) * u + 12, L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c0620c" stroke-width="4" stroke-linecap="round"/>`;
  let g = '';
  if (kind === 'sq') { for (let i = 0; i <= n; i++) g += L(6 + i * u, 6, 6 + i * u, 6 + u); for (let i = 0; i < n; i++) g += L(6 + i * u, 6, 6 + (i + 1) * u, 6) + L(6 + i * u, 6 + u, 6 + (i + 1) * u, 6 + u); }
  else { const h = u * 0.87; for (let i = 0; i < n; i++) { const k = Math.floor(i / 2), xb = 6 + k * u; if (i % 2 === 0) g += (i ? '' : L(xb, 6 + h, xb + u / 2, 6)) + L(xb + u / 2, 6, xb + u, 6 + h) + L(xb, 6 + h, xb + u, 6 + h); else g += L(xb + u / 2, 6, xb + 3 * u / 2, 6) + L(xb + 3 * u / 2, 6, xb + u, 6 + h); } }
  return `<svg viewBox="0 0 ${W} ${u + 12}" width="${W}" height="${u + 12}">${g}</svg>`;
}
function ruleA(st) {
  const K = [{ k: 'sq', f: n => 3 * n + 1, name: '正方形', add: 3, first: 4 }, { k: 'tri', f: n => 2 * n + 1, name: '三角形', add: 2, first: 3 }];
  const rounds = [];
  K.forEach(p => {
    const vis = `<div class="seqrow">${[1, 2, 3].map(n => `<div class="fig">${stickSVG(p.k, n)}<br>第 ${n} 個：${p.f(n)} 根</div>`).join('')}</div>`;
    rounds.push({ q: `用火柴棒排${p.name}。第 4 個圖形要用幾根？`, vis, ans: p.f(4), unit: '根', hint: `每多一個${p.name}，多 ${p.add} 根。`, after: `${p.f(3)} ＋ ${p.add} ＝ ${p.f(4)} 根` });
    const n = rand(8, 15);
    rounds.push({ q: `照這個規律，第 ${n} 個圖形要用幾根火柴棒？（第 1 個 ${p.first} 根，之後每個多 ${p.add} 根）`, vis, eq: `${p.first} + ${p.add} × ${n - 1}`, alt: [`1 + ${p.add} × ${n}`, `${p.add} × ${n} + 1`, `${p.first} + (${n} − 1) × ${p.add}`, `${p.first} + ${p.add} × (${n} − 1)`], ans: p.f(n), unit: '根', hint: `第 1 個 ${p.first} 根，後面還有 ${n - 1} 個，每個多 ${p.add} 根。` });
  });
  rounds.push(() => { const n = rand(5, 8); return { q: `用小石頭排正方形：第 1 個 1 顆、第 2 個 4 顆、第 3 個 9 顆……第 ${n} 個要幾顆？`, vis: `<div class="seqrow">${[1, 2, 3].map(k => `<div class="fig">${'⚪'.repeat(k).concat('<br>').repeat(k)}第 ${k} 個</div>`).join('')}</div>`, ans: n * n, unit: '顆', hint: `第 ${n} 個是 ${n} 排、每排 ${n} 顆。`, after: `${n} × ${n} ＝ ${n * n} 顆` }; });
  quiz(st, rounds);
}
function ruleB(st) {
  const seq = () => {
    const t = rand(0, 3);
    if (t === 0) { const a = rand(3, 30), d = rand(3, 12); return { s: [0, 1, 2, 3, 4, 5].map(i => a + d * i), why: `每次多 ${d}` }; }
    if (t === 1) { const d = rand(4, 15), a = d * 6 + rand(5, 40); return { s: [0, 1, 2, 3, 4, 5].map(i => a - d * i), why: `每次少 ${d}` }; }
    if (t === 2) { const a = rand(1, 5); return { s: [0, 1, 2, 3, 4, 5].map(i => a * 2 ** i), why: '每次乘以 2' }; }
    const a = rand(1, 10); let v = a; const s = [v]; for (let i = 1; i < 6; i++) { v += i; s.push(v); } return { s, why: '多 1、多 2、多 3……每次多的數也一直變大' };
  };
  quiz(st, Array.from({ length: 6 }, (_, k) => () => {
    const { s, why } = seq(), hole = k % 2 ? rand(2, 4) : 5;
    return { q: `恐龍腳印上的數有規律：${s.map((v, i) => i === hole ? '□' : v).join('、')}，□ 是多少？`, ans: s[hole], hint: '看看相鄰兩個數差多少，或是幾倍。', after: `規律：${why}，□ ＝ ${s[hole]}` };
  }));
}
function ruleC(st) {
  quiz(st, shuffle([
    { q: '奇數 ＋ 奇數 ＝ ?', opts: [{ h: '偶數', ok: true }, { h: '奇數', ok: false }, { h: '不一定', ok: false }], hint: '試試看：3 ＋ 5 ＝ 8、7 ＋ 9 ＝ 16。' },
    { q: '奇數 × 偶數 ＝ ?', opts: [{ h: '偶數', ok: true }, { h: '奇數', ok: false }, { h: '不一定', ok: false }], hint: '試試看：3 × 4 ＝ 12、5 × 2 ＝ 10。' },
    () => { const n = rand(6, 15); return { q: `一張方桌可以坐 4 人，把 ${n} 張方桌排成一長排（像圖），可以坐幾人？`, vis: `<div class="seqrow">${[1, 2, 3].map(k => `<div class="fig">${'🟫'.repeat(k)}<br>${k} 張坐 ${2 * k + 2} 人</div>`).join('')}</div>`, eq: `${n} × 2 + 2`, alt: [`2 × ${n} + 2`, `4 + 2 × ${n - 1}`, `4 + (${n} − 1) × 2`], ans: 2 * n + 2, unit: '人', hint: '每張桌子上下各坐 1 人，最左邊和最右邊再各坐 1 人。' }; },
    () => { const n = rand(12, 30); return { q: `1、3、5、7、9……第 ${n} 個奇數是多少？`, eq: `${n} × 2 − 1`, alt: [`2 × ${n} − 1`, `1 + 2 × ${n - 1}`, `1 + (${n} − 1) × 2`], ans: 2 * n - 1, unit: '', hint: `第 ${n} 個奇數比 ${n} 的 2 倍少 1。` }; },
    () => { const pat = ['🦖', '🥚', '🌿'], n = rand(20, 40), k = (n - 1) % 3; return { q: `${pat.join('')}${pat.join('')}${pat.join('')}…… 照這樣排下去，第 ${n} 個是什麼？`, opts: pat.map((p, i) => ({ h: p, ok: i === k })), hint: `3 個一組，${n} ÷ 3 ＝ ${Math.floor(n / 3)} … ${n % 3}，看餘數。`, after: `${n} ÷ 3 ＝ ${Math.floor(n / 3)} … ${n % 3}，是${n % 3 === 0 ? '一組的最後一個' : `一組的第 ${n % 3} 個`} ${pat[k]}` }; },
    () => { const a = rand(13, 49) * 2 + 1, b = rand(11, 40) * 2; return { q: `${a} ＋ ${b} 的和是奇數還是偶數？`, opts: [{ h: '奇數', ok: true }, { h: '偶數', ok: false }], hint: '奇數 ＋ 偶數 ＝ 奇數。', after: `${a} ＋ ${b} ＝ ${a + b}，是奇數` }; }
  ]));
}
function ruleD(st) {
  adv(st, [
    { q: '1、4、7、10、13……照這個規律，第 20 個數是多少？', eq: '1 + 3 × 19', alt: ['1 + 19 × 3', '3 × 20 − 2', '20 × 3 − 2'], ans: 58, ex: '每次多 3，第 20 個比第 1 個多了 19 次 3：1 ＋ 3 × 19 ＝ 58。', trap: '從第 1 個到第 20 個只多了 19 次，不是 20 次。' },
    { q: '用火柴棒排一排正方形，第 1 個 4 根、第 2 個 7 根、第 3 個 10 根。用 31 根火柴棒可以排出第幾個圖形？', ans: 10, ex: '第 n 個要 3 × n ＋ 1 根，3 × n ＋ 1 ＝ 31，3 × n ＝ 30，n ＝ 10。', trap: '31 ÷ 3 不能整除，要先扣掉第一根再除以 3。' },
    { q: '★☆☆★☆☆★☆☆…… 前 20 個圖形裡有幾個 ★？', ans: 7, unit: '個', ex: '3 個一組，每組 1 個 ★。20 ÷ 3 ＝ 6 … 2，6 組有 6 個，剩下 2 個是「★☆」又有 1 個，共 7 個。', trap: '餘數的 2 個裡面也有 1 個 ★，不能只算 6 個。' },
    { q: '三個連續的偶數加起來是 54，最大的偶數是多少？', ans: 20, ex: '三個連續偶數相差 2：中間的數是 54 ÷ 3 ＝ 18，三個數是 16、18、20，最大是 20。', trap: '連續偶數每次差 2，不是差 1。' },
    { q: '7 張方桌排成一長排，每張桌子上下各坐 1 人，左右兩端再各坐 1 人。如果改成每張桌子上下各坐 2 人（兩端還是各 1 人），可以多坐幾人？', ans: 14, unit: '人', ex: '原本 7 × 2 ＋ 2 ＝ 16 人，改成 7 × 4 ＋ 2 ＝ 30 人，多 30 − 16 ＝ 14 人。', trap: '兩端的人數沒變，多出來的只是上下多坐的 7 × 2 ＝ 14 人。' }
  ]);
}

/* ---------- 四則運算與簡化計算 ---------- */
/* 點運算符號，依「括號 → 先乘除 → 後加減、由左到右」一步一步算 */
function nextOp(T) {
  let lo = 0, hi = T.length;
  const o = T.lastIndexOf('(');
  if (o >= 0) { lo = o + 1; hi = T.indexOf(')', o); }
  for (const set of ['×÷', '+−']) for (let i = lo; i < hi; i++) if (set.includes(T[i])) return i;
  return -1;
}
function calc(a, op, b) { return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b; }
function simpA(st) {
  const T = [
    () => { const a = rand(20, 80), b = rand(3, 9), c = rand(3, 9); return [a, '+', b, '×', c]; },
    () => { const c = rand(3, 9), k = rand(4, 12), a = k + rand(10, 60); return [a, '−', c * k, '÷', c]; },
    () => { const a = rand(12, 40), b = rand(5, 30), c = rand(2, 6); return ['(', a, '+', b, ')', '×', c]; },
    () => { const a = rand(6, 12), b = rand(6, 12), c = rand(2, 5), d = rand(2, 5); return [a, '×', b, '−', c, '×', d]; },
    () => { const c = rand(2, 6), d = rand(2, 5), b = c * rand(3, 9), a = rand(10, 50); return [a, '+', b, '÷', c, '×', d]; },
    () => { const k = rand(3, 9), c = rand(2, 9), b = c + k, a = k * rand(4, 15); return [a, '÷', '(', b, '−', c, ')']; }
  ];
  const tasks = shuffle(T).slice(0, 4).map(f => f().map(String));
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    let E = tasks[r].slice();
    const orig = E.join(' ');
    api.say(`翼龍算盤塔的密碼：<b>${orig}</b>。依照計算的順序，<b>點先算的那個符號</b>！`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="ops-line" id="ex"></div><div class="readout" id="log"></div><div class="kwrap" id="kw"></div>`;
    const steps = [];
    function draw() {
      $('#ex', st).innerHTML = E.map((t, i) => '+−×÷'.includes(t) ? `<button type="button" class="opk" data-i="${i}">${t}</button>` : `<span>${t}</span>`).join('');
      $('#log', st).innerHTML = steps.map(s => `<div>${s}</div>`).join('');
      $$('.opk', st).forEach(b => b.onclick = () => {
        const i = +b.dataset.i, want = nextOp(E);
        if (i !== want) return api.bad(E.includes('(') ? '括號裡面的要先算！' : '先乘除、後加減；同一級的由左到右。', `先點了「${E[i]}」`, `先算 ${E[want - 1]} ${E[want]} ${E[want + 1]}`);
        const v = calc(+E[i - 1], E[i], +E[i + 1]);
        steps.push(`${E[i - 1]} ${E[i]} ${E[i + 1]} ＝ ${v}`); sfx('pop');
        E.splice(i - 1, 3, String(v));
        const o = E.indexOf('('); if (o >= 0 && E[o + 2] === ')') E.splice(o, 3, E[o + 1]);
        if (E.length === 1) {
          $('#ex', st).innerHTML = `<span>${orig} ＝ ?</span>`; $('#log', st).innerHTML = steps.map(s => `<div>${s}</div>`).join('');
          api.ok('順序都對了！'); api.say(`照順序算好了，${orig} ＝ ?`);
          keypad($('#kw', st), +E[0], () => { $('#kw', st).innerHTML = `<div class="center"><span class="after">${orig} ＝ ${E[0]}</span></div>`; speak(`答案是${E[0]}`); r++; later(round, 2200); }, '看最後一步算出來的數。');
          return;
        }
        draw();
      });
    }
    draw();
  }
  round();
}
function simpB(st) {
  quiz(st, shuffle([
    () => { const a = rand(120, 480), b = rand(130, 490); return { q: `${a} ＋ ${b} ＝ ${b} ＋ □，□ ＝ ?`, ans: a, hint: '加法交換律：兩個數交換位置，和不變。' }; },
    () => { const a = rand(120, 480), b = rand(30, 90), c = 100 - b; return { q: `(${a} ＋ ${b}) ＋ ${c} ＝ ${a} ＋ (${b} ＋ □)，□ ＝ ?`, ans: c, hint: '加法結合律：先加後面兩個也一樣。' }; },
    () => { const a = rand(500, 900), b = rand(120, 280), c = 300 - b; return { q: `${a} − ${b} − ${c} ＝ ${a} − (${b} ＋ □)，□ ＝ ?`, ans: c, hint: '連續減兩個數，等於減掉這兩個數的和。' }; },
    () => { const a = rand(12, 48), [bb, c] = pick([[25, 4], [125, 8]]); return { q: `${a} × ${bb} × ${c} ＝ ${a} × (${bb} × □)，□ ＝ ?`, ans: c, hint: '乘法結合律：先乘後面兩個也一樣。' }; },
    () => { const c = pick([4, 5, 25]), b = pick([2, 4, 5].filter(x => x !== c)), a = b * c * rand(3, 12); return { q: `${a} ÷ ${b} ÷ ${c} ＝ ${a} ÷ (${b} × □)，□ ＝ ?`, ans: c, hint: '連續除以兩個數，等於除以這兩個數的積。' }; },
    { q: '500 − (200 − 50) ＝ 500 − 200 − 50', opts: yesNo(false), hint: '減掉 (200 − 50)＝150，和先減 200 再減 50（共減 250）不一樣。' },
    { q: '下面哪一個算式和 36 × 25 × 4 的答案一樣？', opts: [{ h: '36 × (25 × 4)', ok: true }, { h: '36 × 25 ＋ 4', ok: false }, { h: '(36 ＋ 25) × 4', ok: false }], hint: '連乘可以先算 25 × 4 ＝ 100。' }
  ]).slice(0, 6));
}
function simpC(st) {
  quiz(st, shuffle([
    () => { const a = rand(13, 89); return { q: `${a} × 25 × 4 ＝ ?（想一想怎麼算最快）`, ans: a * 100, hint: '先算 25 × 4 ＝ 100。', after: `${a} × (25 × 4) ＝ ${a} × 100 ＝ ${a * 100}` }; },
    () => { const a = rand(400, 900), b = rand(110, 190), c = 200 - b; return { q: `${a} − ${b} − ${c} ＝ ?`, ans: a - 200, hint: `${b} ＋ ${c} ＝ 200，一次減掉 200。`, after: `${a} − (${b} ＋ ${c}) ＝ ${a} − 200 ＝ ${a - 200}` }; },
    () => { const a = rand(201, 799); return { q: `${a} ＋ 999 ＝ ?`, ans: a + 999, hint: '999 ＝ 1000 − 1，先加 1000 再減 1。', after: `${a} ＋ 1000 − 1 ＝ ${a + 999}` }; },
    () => { const k = rand(12, 60); return { q: `${k * 100} ÷ 25 ÷ 4 ＝ ?`, ans: k, hint: '連續除以 25 和 4，等於除以 100。', after: `${k * 100} ÷ (25 × 4) ＝ ${k * 100} ÷ 100 ＝ ${k}` }; },
    () => { const p = rand(15, 30), n = rand(2, 4), q2 = rand(30, 60), pay = 200; return { q: `買 ${n} 枝 ${p} 元的恐龍筆和 1 本 ${q2} 元的筆記本，付 ${pay} 元，找回幾元？（用一個算式列出來）`, eq: `${pay} − (${p} × ${n} + ${q2})`, alt: [`${pay} − ${p} × ${n} − ${q2}`, `${pay} − ${q2} − ${p} × ${n}`, `${pay} − (${q2} + ${p} × ${n})`], ans: pay - p * n - q2, unit: '元', hint: '先算一共花多少錢，再用 200 減掉。' }; },
    () => { const k = rand(3, 9), n = 4, per = 12; return { q: `每盒有 ${per} 顆恐龍糖，買 ${k * 2} 盒，平分給 ${n} 人，每人幾顆？`, eq: `${per} × ${k * 2} ÷ ${n}`, alt: [`(${per} × ${k * 2}) ÷ ${n}`, `${per} ÷ ${n} × ${k * 2}`, `${k * 2} ÷ ${n} × ${per}`], ans: per * k * 2 / n, unit: '顆', hint: '先算一共幾顆，再平分。' }; }
  ]));
}
function simpD(st) {
  adv(st, [
    { q: '48 ＋ 52 × 5 ＝ ?', ans: 308, ex: '先乘後加：52 × 5 ＝ 260，48 ＋ 260 ＝ 308。', trap: '不能先算 48 ＋ 52 ＝ 100 再乘 5（那是 500）。' },
    { q: '(125 × 8) × 37 和 125 × 8 × 37 一樣，答案是多少？', ans: 37000, ex: '125 × 8 ＝ 1000，1000 × 37 ＝ 37000。', trap: '1000 × 37 要補 3 個 0。' },
    { q: '720 − 720 ÷ 8 ＝ ?', ans: 630, ex: '先除後減：720 ÷ 8 ＝ 90，720 − 90 ＝ 630。', trap: '不是 (720 − 720) ÷ 8 ＝ 0，要先算除法。' },
    { q: '下面哪一個算式的答案<b>和其他三個不一樣</b>？', opts: [{ h: '600 − 150 − 50', ok: false }, { h: '600 − (150 ＋ 50)', ok: false }, { h: '600 − (150 − 50)', ok: true }, { h: '600 − 50 − 150', ok: false }], ex: '前三個以外的都是 400；600 − (150 − 50) ＝ 600 − 100 ＝ 500。', trap: '括號裡是減法時，去掉括號後的符號會改變。' },
    { q: '一本書 85 元，買 4 本，老闆每本便宜 5 元，一共要付幾元？（用一個算式列出來）', eq: '(85 − 5) × 4', alt: ['85 × 4 − 5 × 4', '4 × (85 − 5)'], ans: 320, unit: '元', ex: '每本 85 − 5 ＝ 80 元，80 × 4 ＝ 320 元。', trap: '要每本都便宜 5 元，不是總共只便宜 5 元（85 × 4 − 5 ＝ 335 是錯的）。' }
  ]);
}

Object.assign(LEVELS, {
  time: [timeA, timeB, timeC, timeD],
  vol: [volA, volB, volC, volD],
  rule: [ruleA, ruleB, ruleC, ruleD],
  simp: [simpA, simpB, simpC, simpD]
});
