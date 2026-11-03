'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林六上有，南一六上沒有（或順序、範圍不同）的內容（每單元 3 關：動手做／想一想／挑戰）
   xcirc  圓周長與扇形周長（康軒第 6 單元、翰林第 6 單元）：只有周長、弧長，不含面積（翰林的圓面積在六下；
          南一第 4、6 單元把周長和面積放在一起，康軒第 7 單元「圓面積與扇形面積」就用原本的 u4、u6）
   xscale 放大圖、縮圖與比例尺（康軒第 9 單元、翰林第 7 單元；南一在六下第 4 單元）
   xbase  基準量與比較量（翰林第 5 單元「兩量關係」；南一在六下第 3 單元、康軒在六下第 4 單元） */

const xsm6 = s => `<span class="small-opt">${s}</span>`;
const PI = 3.14;

/* ---------- 補 xcirc 圓周長與扇形周長 ---------- */
function wheelSVG(d, dist) {
  const W = 320, r = 34, x0 = 30 + r, x1 = x0 + Math.min(220, dist);
  return `<svg class="pic" viewBox="0 0 ${W} 110" width="${W}"><line x1="10" y1="96" x2="${W - 10}" y2="96" stroke="#4a3b5c" stroke-width="3"/>
    <circle cx="${x0}" cy="${96 - r}" r="${r}" fill="#e2f3ff" stroke="#5bb4ff" stroke-width="4" stroke-dasharray="6 4"/><circle cx="${x1}" cy="${96 - r}" r="${r}" fill="#e2f3ff" stroke="#5bb4ff" stroke-width="4"/>
    <line x1="${x1 - r}" y1="${96 - r}" x2="${x1 + r}" y2="${96 - r}" stroke="#e5508f" stroke-width="3"/><text x="${x1}" y="${90 - r}" text-anchor="middle" font-size="14" font-weight="900" fill="#e5508f">${d}</text>
    <path d="M${x0} 104 H${x1}" stroke="#ff9a4d" stroke-width="3" marker-end="url(#xar)"/><defs><marker id="xar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ff9a4d"/></marker></defs>
    <text x="${(x0 + x1) / 2}" y="22" text-anchor="middle" font-size="14" font-weight="900" fill="#4a3b5c">滾一圈 → ？</text></svg>`;
}
function xcircA(st) {
  const K = ['.'];
  quiz(st, [
    () => { const d = pick([20, 30, 40, 50, 60]), L = rnd(d * PI); return { q: `直徑 ${d} 公分的輪子滾一圈，前進多少公分？`, vis: wheelSVG(`${d} 公分`, 200), eq: `${d} × 3.14`, extra: [3.14], ans: L, keys: K, unit: '公分', hint: '滾一圈前進的長度就是圓周長 ＝ 直徑 × 3.14', after: `${d} × 3.14 ＝ ${fmt(L)} 公分` }; },
    () => { const r = pick([5, 10, 15, 25]), L = rnd(r * 2 * PI); return { q: `半徑 ${r} 公分的呼拉圈滾一圈，前進多少公分？`, vis: wheelSVG(`半徑 ${r}`, 200), eq: `${r} × 2 × 3.14`, alt: [`${r * 2} × 3.14`], extra: [3.14, 2], ans: L, keys: K, unit: '公分', hint: '半徑 × 2 是直徑，再乘 3.14。', after: `${r} × 2 × 3.14 ＝ ${fmt(L)} 公分` }; },
    () => { const d = pick([40, 50, 60]), n = pick([5, 10, 100]), L = rnd(d * PI * n); return { q: `直徑 ${d} 公分的腳踏車輪子滾了 ${n} 圈，前進多少公分？`, vis: '<span style="font-size:52px">🚲</span>', eq: `${d} × 3.14 × ${n}`, extra: [3.14], ans: L, keys: K, unit: '公分', hint: '先算一圈多長，再乘圈數。', after: `${d} × 3.14 × ${n} ＝ ${fmt(L)} 公分` }; },
    () => { const d = pick([10, 20, 30, 50]), L = rnd(d * PI); return { q: `一個圓的圓周長是 ${fmt(L)} 公分，直徑是多少公分？`, vis: circleSVG(0, '?', 'd'), eq: `${fmt(L)} ÷ 3.14`, extra: [3.14], ans: d, unit: '公分', hint: '圓周長 ÷ 3.14 ＝ 直徑', after: `${fmt(L)} ÷ 3.14 ＝ ${d} 公分` }; }
  ]);
}
function xcircB(st) {
  quiz(st, [
    { q: '圓周率是圓周長和什麼的倍數關係？', opts: [{ h: '直徑', ok: true }, { h: '半徑', ok: false, hint: '圓周長大約是「直徑」的 3.14 倍。' }, { h: '面積', ok: false }], hint: '圓周長 ÷ 直徑 ＝ 圓周率。' },
    { q: '圓的直徑變成原來的 3 倍，圓周長變成原來的幾倍？', opts: numOpts(3, [9, 6, 3.14], '倍'), hint: '圓周長 ＝ 直徑 × 3.14，直徑乘 3，圓周長也乘 3。' },
    { q: '<b>扇形的周長</b>要怎麼算？', sp: '扇形的周長要怎麼算？', opts: [{ h: xsm6('弧長 ＋ 半徑 × 2'), ok: true, t: '弧長 ＋ 半徑 × 2' }, { h: xsm6('弧長'), ok: false, t: '弧長', hint: '別忘了兩條半徑！' }, { h: xsm6('弧長 ＋ 半徑'), ok: false, t: '弧長 ＋ 半徑', hint: '扇形有兩條半徑喔！' }], hint: '扇形的周長是一段圓弧加上兩條半徑。' },
    { q: '<b>1/4 圓</b>的弧長是整個圓周長的幾分之幾？', sp: '4分之1圓的弧長是整個圓周長的幾分之幾？', opts: [{ h: fr(1, 4), ok: true, t: '1/4' }, { h: fr(1, 2), ok: false, t: '1/2' }, { h: fr(1, 90), ok: false, t: '1/90' }], hint: '1/4 圓就是一整圈的 1/4。' },
    { q: '<b>半圓形</b>的周長要怎麼算？', sp: '半圓形的周長要怎麼算？', vis: halfSVG('半徑'), opts: [{ h: xsm6('圓周長 ÷ 2 ＋ 直徑'), ok: true, t: '圓周長 ÷ 2 ＋ 直徑' }, { h: xsm6('圓周長 ÷ 2'), ok: false, t: '圓周長 ÷ 2', hint: '別忘了下面那條直線（直徑）！' }, { h: xsm6('圓周長 ÷ 2 ＋ 半徑'), ok: false, t: '圓周長 ÷ 2 ＋ 半徑', hint: '下面那條直線是直徑，不是半徑！' }] }
  ]);
}
function xcircC(st) {
  const K = ['.'];
  quiz(st, [
    () => { const [r, d] = pick([[10, 90], [6, 120], [12, 60], [8, 90], [9, 120]]); const L = rnd(r * 2 * PI * d / 360); return { q: `半徑 ${r} 公分、圓心角 ${d}° 的扇形，<b>弧長</b>是多少公分？`, sp: `半徑${r}公分、圓心角${d}度的扇形，弧長是多少公分？`, vis: sectorSVG(d, `${r} 公分`), eq: `${r} × 2 × 3.14 × ${d} ÷ 360`, alt: [`${r} × 2 × 3.14 × ${d}/360`, `${r * 2} × 3.14 × ${d} ÷ 360`], extra: [3.14, 2, 360], ans: L, keys: K, unit: '公分', hint: '弧長 ＝ 半徑 × 2 × 3.14 × 圓心角 ÷ 360', after: `弧長 ＝ ${fmt(L)} 公分` }; },
    () => { const [r, d] = pick([[10, 90], [6, 60], [12, 90], [9, 120]]); const P = rnd(r * 2 * PI * d / 360 + 2 * r); return { q: `半徑 ${r} 公分、圓心角 ${d}° 的扇形，<b>周長</b>是多少公分？`, sp: `半徑${r}公分、圓心角${d}度的扇形，周長是多少公分？`, vis: sectorSVG(d, `${r} 公分`), eq: `${r} × 2 × 3.14 × ${d} ÷ 360 + ${r} × 2`, alt: [`${r} × 2 × 3.14 × ${d}/360 + ${r} × 2`, `${r * 2} × 3.14 × ${d} ÷ 360 + ${r * 2}`, `${r} × 2 × 3.14 × ${d} ÷ 360 + ${r} + ${r}`], extra: [3.14, 2, 360], ans: P, keys: K, unit: '公分', hint: '扇形周長 ＝ 弧長 ＋ 兩條半徑', after: `周長 ＝ ${fmt(P)} 公分` }; },
    () => { const d = pick([10, 20, 30]), P = rnd(d * PI / 2 + d); return { q: `直徑 ${d} 公分的半圓形，周長是多少公分？`, vis: halfSVG(`${d / 2} 公分`), eq: `${d} × 3.14 ÷ 2 + ${d}`, alt: [`${d / 2} × 2 × 3.14 ÷ 2 + ${d}`], extra: [3.14, 2], ans: P, keys: K, unit: '公分', hint: '半圓周長 ＝ 圓周長 ÷ 2 ＋ 直徑', after: `${d} × 3.14 ÷ 2 ＋ ${d} ＝ ${fmt(P)} 公分` }; },
    () => { const r = pick([4, 8, 10, 20]), P = rnd(r * 2 * PI / 4 + 2 * r); return { q: `半徑 ${r} 公分的 1/4 圓，周長是多少公分？`, vis: sectorSVG(90, `${r} 公分`), eq: `${r} × 2 × 3.14 ÷ 4 + ${r} × 2`, alt: [`${r} × 2 × 3.14 × 1/4 + ${r} × 2`, `${r * 2} × 3.14 ÷ 4 + ${r * 2}`, `${r} × 2 × 3.14 ÷ 4 + ${r} + ${r}`], extra: [3.14, 2, 4], ans: P, keys: K, unit: '公分', hint: '弧長是圓周長的 1/4，再加兩條半徑。', after: `周長 ＝ ${fmt(P)} 公分` }; },
    () => { const d = pick([20, 30, 50]), m = pick([100, 50]), L = rnd(d * PI * m); return { q: `操場旁的滾筒直徑 ${d} 公分，推著它滾了 ${m} 圈，共前進多少公尺？`, vis: '<span style="font-size:52px">🛞</span>', eq: `${d} × 3.14 × ${m} ÷ 100`, extra: [3.14, 100], ans: rnd(L / 100), keys: K, unit: '公尺', hint: '先算出公分，再換成公尺（÷ 100）。', after: `${d} × 3.14 × ${m} ＝ ${fmt(L)} 公分 ＝ ${fmt(rnd(L / 100))} 公尺` }; }
  ]);
}

/* ---------- 補 xscale 放大圖、縮圖與比例尺 ---------- */
function gridShape(w, h, cell, color, tri) {
  const W = w * cell + 2, H = h * cell + 2;
  let g = '';
  for (let x = 0; x <= w; x++) g += `<line x1="${1 + x * cell}" y1="1" x2="${1 + x * cell}" y2="${H - 1}" stroke="#e3d9f0"/>`;
  for (let y = 0; y <= h; y++) g += `<line x1="1" y1="${1 + y * cell}" x2="${W - 1}" y2="${1 + y * cell}" stroke="#e3d9f0"/>`;
  const shape = tri ? `<polygon points="1,${H - 1} ${W - 1},${H - 1} 1,1" fill="${color}" stroke="#4a3b5c" stroke-width="2.5"/>` : `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="${color}" stroke="#4a3b5c" stroke-width="2.5"/>`;
  return `<svg class="pic" viewBox="0 0 ${W} ${H}" width="${Math.min(W, 300)}">${g}${shape}</svg>`;
}
function xscaleA(st) {
  const tasks = shuffle([[3, 2, 2, false], [2, 4, 2, true], [4, 2, 3, false], [6, 4, 0.5, false], [3, 1, 3, false], [4, 6, 0.5, true]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [w, h, k, tri] = tasks[r], W = w * k, H = h * k; let a = w, b = h;
    const kt = k < 1 ? '縮小成 1/2' : `放大 ${k} 倍`;
    curQ = { q: `把 ${w}×${h} 格的${tri ? '直角三角形' : '長方形'}${kt}`, c: `底 ${W} 格、高 ${H} 格` };
    api.say(`把左邊的${tri ? '直角三角形' : '長方形'}<b>${kt}</b>，調整新圖形的底和高（幾格）。`, `把圖形${kt}，調整新圖形的底和高`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="xsc"><div><div class="xcap">原來的圖（底 ${w} 格、高 ${h} 格）</div>${gridShape(w, h, 22, '#d6ecff', tri)}</div><div><div class="xcap">新的圖</div><div id="nw"></div></div></div>
      <div class="xctl6"><span class="g">底 <button type="button" data-k="a" data-d="-1">−</button><b id="va"></b><button type="button" data-k="a" data-d="1">＋</button></span>
      <span class="g">高 <button type="button" data-k="b" data-d="-1">−</button><b id="vb"></b><button type="button" data-k="b" data-d="1">＋</button></span></div>
      <div class="center"><button class="btn mint" id="okb" type="button">畫好了！</button></div>`;
    const draw = () => { $('#va', st).textContent = a; $('#vb', st).textContent = b; $('#nw', st).innerHTML = gridShape(a, b, a > 9 || b > 9 ? 14 : 22, '#ffd9a8', tri); };
    $$('.xctl6 button', st).forEach(x => x.onclick = () => { const v = (x.dataset.k === 'a' ? a : b) + +x.dataset.d; if (v < 1 || v > 18) return; if (x.dataset.k === 'a') a = v; else b = v; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (a === W && b === H) { $('#okb', st).disabled = true; api.ok(`對！底 ${W} 格、高 ${H} 格`); speak(`對應邊都${k < 1 ? '縮小成二分之一' : `放大${k}倍`}`); r++; later(round, 1900); }
      else api.bad(`每一條邊都要${k < 1 ? '變成原來的 1/2' : `乘 ${k}`}：底 ${w} → ?、高 ${h} → ?`, `底 ${a}、高 ${b}`, `底 ${W}、高 ${H}`);
    };
    draw();
  }
  round();
}
function xscaleB(st) {
  quiz(st, [
    { q: '把一個圖形放大 2 倍，<b>對應角</b>的大小會怎樣？', sp: '把一個圖形放大2倍，對應角的大小會怎樣？', opts: [{ h: xsm6('不變'), ok: true, t: '不變' }, { h: xsm6('變成 2 倍'), ok: false, t: '變成 2 倍', hint: '放大縮小只改變邊長，角的大小不變。' }, { h: xsm6('變成一半'), ok: false, t: '變成一半' }], hint: '放大圖和原圖形狀一樣，角度相同。' },
    () => { const k = pick([2, 3, 4]), s = rand(3, 9); return { q: `一個三角形放大 ${k} 倍，原來 ${s} 公分的邊，放大後是幾公分？`, ans: s * k, unit: '公分', hint: `對應邊都乘 ${k}。`, after: `${s} × ${k} ＝ ${s * k} 公分` }; },
    { q: '比例尺 <b>1：1000</b> 的意思是？', sp: '比例尺1比1000的意思是？', opts: [{ h: xsm6('圖上 1 公分代表實際 1000 公分'), ok: true, t: '圖上 1 公分代表實際 1000 公分' }, { h: xsm6('圖上 1000 公分代表實際 1 公分'), ok: false, t: '圖上 1000 公分代表實際 1 公分' }, { h: xsm6('圖上 1 公分代表實際 1000 公尺'), ok: false, t: '圖上 1 公分代表實際 1000 公尺', hint: '比例尺的兩個數單位要一樣。' }], hint: '前面是圖上距離，後面是實際距離，單位相同。' },
    () => { const k = pick([2, 3]), s = rand(2, 6) * k; return { q: `一個長方形縮小成原來的 1/${k}，原來長 ${s} 公分，縮小後長幾公分？`, ans: s / k, unit: '公分', hint: `對應邊都變成原來的 1/${k}，就是 ÷ ${k}。`, after: `${s} ÷ ${k} ＝ ${s / k} 公分` }; },
    { q: '下面哪一個是「比例尺 1：100000」的另一種寫法？', opts: [{ h: xsm6('圖上 1 公分代表實際 1 公里'), ok: true, t: '圖上 1 公分代表實際 1 公里' }, { h: xsm6('圖上 1 公分代表實際 100 公尺'), ok: false, t: '圖上 1 公分代表實際 100 公尺' }, { h: xsm6('圖上 1 公分代表實際 10 公里'), ok: false, t: '圖上 1 公分代表實際 10 公里' }], hint: '100000 公分 ＝ 1000 公尺 ＝ 1 公里。' }
  ]);
}
function xscaleC(st) {
  quiz(st, [
    () => { const s = pick([1000, 2000, 5000]), m = rand(2, 9); return { q: `比例尺 1：${s} 的地圖上，學校到公園量得 ${m} 公分，實際距離是幾公尺？`, vis: '<span style="font-size:52px">🗺️</span>', eq: `${m} × ${s} ÷ 100`, alt: [`${m} × ${s / 100}`], extra: [100], ans: m * s / 100, unit: '公尺', hint: '圖上距離 × 比例尺的後項 ＝ 實際距離（公分），再換成公尺。', after: `${m} × ${s} ＝ ${m * s} 公分 ＝ ${m * s / 100} 公尺` }; },
    () => { const s = pick([100000, 50000, 200000]), m = rand(2, 8); return { q: `比例尺 1：${s} 的地圖上量得 ${m} 公分，實際距離是幾公里？`, vis: '<span style="font-size:52px">🧭</span>', eq: `${m} × ${s} ÷ 100000`, extra: [100000], ans: m * s / 100000, keys: ['.'], unit: '公里', hint: '1 公里 ＝ 100000 公分。', after: `${m} × ${s} ＝ ${m * s} 公分 ＝ ${fmt(m * s / 100000)} 公里` }; },
    () => { const s = pick([1000, 2000, 500]), real = rand(2, 9) * s / 100; return { q: `比例尺 1：${s}，實際 ${real} 公尺的距離，畫在圖上是幾公分？`, vis: '<span style="font-size:52px">📐</span>', eq: `${real} × 100 ÷ ${s}`, alt: [`${real * 100} ÷ ${s}`], extra: [100], ans: real * 100 / s, unit: '公分', hint: '先把公尺換成公分（× 100），再 ÷ 比例尺的後項。', after: `${real * 100} ÷ ${s} ＝ ${real * 100 / s} 公分` }; },
    () => { const k = pick([2, 3]), w = rand(2, 6), h = rand(2, 6); return { q: `長 ${w} 公分、寬 ${h} 公分的長方形放大 ${k} 倍，放大後的周長是幾公分？`, eq: `(${w} × ${k} + ${h} × ${k}) × 2`, alt: [`(${w} + ${h}) × 2 × ${k}`, `${w} × ${k} × 2 + ${h} × ${k} × 2`], extra: [2], ans: (w + h) * 2 * k, unit: '公分', hint: '先把長和寬都放大，再算周長。', after: `(${w * k} ＋ ${h * k}) × 2 ＝ ${(w + h) * 2 * k} 公分` }; },
    () => { const s = pick([10, 20, 50]), m = rand(3, 9); return { q: `一張模型圖，比例尺 1：${s}，模型圖上的車長 ${m} 公分，真的車長幾公分？`, vis: '<span style="font-size:52px">🚗</span>', eq: `${m} × ${s}`, ans: m * s, unit: '公分', hint: '圖上 1 公分代表實際 ' + s + ' 公分。', after: `${m} × ${s} ＝ ${m * s} 公分` }; }
  ]);
}

/* ---------- 補 xbase 基準量與比較量 ---------- */
function xbaseA(st) {
  const tasks = shuffle([[60, 2, 3, '哥哥', '弟弟', '元'], [40, 3, 4, '一盒', '吃掉', '顆'], [50, 3, 5, '全班', '戴眼鏡', '人'], [36, 5, 6, '原有', '用掉', '張'], [30, 2, 5, '全部', '紅色', '個']]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [base, n, d, A, Bn, u] = tasks[r], ans = base / d * n;
    curQ = { q: `基準量 ${base}${u}，比較量是基準量的 ${n}/${d}，塗出比較量`, c: `塗 ${n} 格` };
    api.say(`${A}有 <b>${base}${u}</b>（基準量），${Bn}是它的 ${fr(n, d)}。在線段圖上塗出<b>比較量</b>！`, `${A}有${base}${u}，${Bn}是它的${d}分之${n}，塗出比較量`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="xcap">基準量：${base} ${u}（分成 ${d} 份）</div><div class="fbar xbb">${'<i></i>'.repeat(d)}</div>
      <div class="readout">比較量：<span id="cnt">0</span> 份</div><div class="center"><button class="btn mint" id="okb" type="button">塗好了！</button></div><div class="kwrap" id="kw"></div>`;
    let k = 0;
    $$('.xbb i', st).forEach(s => s.onclick = () => { if ($('#okb', st).disabled) return; s.classList.toggle('on'); sfx('tap'); k = $$('.xbb i.on', st).length; $('#cnt', st).textContent = k; });
    $('#okb', st).onclick = () => {
      if (k !== n) return api.bad(`${fr(n, d)} 就是 ${d} 份中的 ${n} 份喔！`, `塗 ${k} 份`, `塗 ${n} 份`);
      $('#okb', st).disabled = true; api.ok('塗對了！');
      curQ = { q: `${base} × ${n}/${d} ＝ ?`, c: `${ans} ${u}` };
      api.say(`一份是 ${base} ÷ ${d} ＝ ${base / d}${u}，比較量是多少${u}？`, `一份是${base / d}${u}，比較量是多少${u}？`);
      keypad($('#kw', st), ans, () => { $('#kw', st).insertAdjacentHTML('afterend', `<div class="center"><span class="after">${base} × ${fr(n, d)} ＝ ${ans} ${u}</span></div>`); speak(`比較量是${ans}${u}`); r++; later(round, 2300); }, `${base / d} × ${n}`, u);
    };
  }
  round();
}
function xbaseB(st) {
  quiz(st, [
    { q: '「弟弟的錢是哥哥的 2/3」，<b>基準量</b>是誰？', sp: '弟弟的錢是哥哥的3分之2，基準量是誰？', opts: [{ h: '哥哥的錢', ok: true }, { h: '弟弟的錢', ok: false, hint: '「是誰的幾分之幾」，那個「誰」就是基準量。' }], keep: true, hint: '「的」前面那個是基準量。' },
    { q: '「紅球是藍球的 1.5 倍」，<b>比較量</b>是誰？', sp: '紅球是藍球的1.5倍，比較量是誰？', opts: [{ h: '紅球', ok: true }, { h: '藍球', ok: false, hint: '藍球是拿來比的標準（基準量）。' }], keep: true, hint: '拿來和基準量比的那一個是比較量。' },
    { q: '比較量 ÷ 基準量 ＝ ？', opts: [{ h: '比值', ok: true }, { h: '比較量', ok: false }, { h: '基準量', ok: false }], hint: '比較量是基準量的幾倍（幾分之幾），就是比值。' },
    () => { const b = pick([20, 40, 50, 80]), p = pick([25, 75, 60, 40]); return { q: `基準量是 ${b}，比值是 ${p}%，比較量是多少？`, ans: b * p / 100, hint: '比較量 ＝ 基準量 × 比值', after: `${b} × ${p}% ＝ ${b * p / 100}` }; },
    () => { const v = pick([[3, 4], [2, 5], [5, 6]]), c = v[0] * rand(3, 9); const b = c / v[0] * v[1]; return { q: `比較量是 ${c}，比值是 ${fr(v[0], v[1])}，基準量是多少？`, ans: b, hint: '基準量 ＝ 比較量 ÷ 比值', after: `${c} ÷ ${fr(v[0], v[1])} ＝ ${b}` }; }
  ]);
}
function xbaseC(st) {
  quiz(st, [
    () => { const g = pick([2, 3, 4, 5]) * 12, [n, d] = pick([[1, 2], [2, 3], [3, 4]]); const b = g * n / d; return { q: `哥哥有 ${g} 張卡片，弟弟的卡片是哥哥的 ${fr(n, d)}，弟弟有幾張？`, vis: '<span style="font-size:52px">🃏</span>', eq: `${g} × ${n}/${d}`, ans: b, unit: '張', hint: '比較量 ＝ 基準量 × 幾分之幾', after: `${g} × ${fr(n, d)} ＝ ${b} 張` }; },
    () => { const [n, d] = pick([[3, 4], [2, 5], [3, 5]]), b = d * rand(4, 9), c = b / d * n; return { q: `妹妹存了 ${c} 元，是姊姊的 ${fr(n, d)}，姊姊存了幾元？`, vis: '<span style="font-size:52px">🐷</span>', eq: `${c} ÷ ${n}/${d}`, ans: b * 1, unit: '元', hint: '已知比較量和幾分之幾，求基準量用除法。', after: `${c} ÷ ${fr(n, d)} ＝ ${b} 元` }; },
    () => { const [n, d] = pick([[1, 2], [1, 3], [2, 3], [3, 4]]), big = d * rand(4, 9) * 2, total = big + big * n / d; return { q: `哥哥和弟弟共有 ${total} 元，弟弟的錢是哥哥的 ${fr(n, d)}，哥哥有幾元？`, vis: '<span style="font-size:52px">💰</span>', eq: `${total} ÷ (1 + ${n}/${d})`, alt: [`${total} ÷ ${n + d}/${d}`, `${total} ÷ ${n + d} × ${d}`], extra: [1], ans: big, unit: '元', hint: '哥哥是 1 份（基準量），兩人合起來是 1 ＋ 幾分之幾。', after: `${total} ÷ ${fr(n + d, d)} ＝ ${big} 元` }; },
    () => { const [n, d] = pick([[1, 3], [1, 4], [2, 5]]), big = d * rand(3, 8) * 3, diff = big - big * n / d; return { q: `一條繩子，剪掉的比剩下的多 ${diff} 公分，剩下的是剪掉的 ${fr(n, d)}，剪掉幾公分？`, vis: '<span style="font-size:52px">🧵</span>', eq: `${diff} ÷ (1 − ${n}/${d})`, alt: [`${diff} ÷ ${d - n}/${d}`, `${diff} ÷ ${d - n} × ${d}`], extra: [1], ans: big, unit: '公分', hint: '剪掉的是 1 份（基準量），相差的是 1 − 幾分之幾。', after: `${diff} ÷ ${fr(d - n, d)} ＝ ${big} 公分` }; },
    () => { const p = pick([800, 1200, 600]), off = pick([80, 75, 90]), zh = { 80: '八', 75: '七五', 90: '九' }[off]; return { q: `一件外套原價 ${p} 元，打${zh}折，特價幾元？`, vis: '<span style="font-size:52px">🧥</span>', eq: `${p} × ${off}%`, alt: [`${p} × ${off / 100}`], ans: p * off / 100, unit: '元', hint: `打${zh}折就是原價的 ${off}%。`, after: `${p} × ${off}% ＝ ${p * off / 100} 元` }; }
  ]);
}

document.head.insertAdjacentHTML('beforeend', `<style>
.small-opt{font-size:20px;line-height:1.35}
.xsc{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-end}
.xcap{text-align:center;font-weight:900;margin:4px 0}
.xctl6 .g{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.xctl6{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;align-items:center;margin:10px 0;font-weight:900;font-size:20px}
.xctl6 button{width:42px;height:42px;border-radius:10px;border:2px solid var(--line);background:#fff;font-size:22px;font-weight:900;cursor:pointer}
.xctl6 b{min-width:34px;text-align:center;color:#e5508f;font-size:24px}
.xbb{display:flex;width:min(560px,100%);height:52px;border:4px solid var(--ink);border-radius:10px;overflow:hidden;background:#fff;margin:6px auto}
.xbb i{flex:1;border-right:2px solid #b9aecb;cursor:pointer}.xbb i:last-child{border-right:none}.xbb i.on{background:#ffb3d1}
</style>`);

Object.assign(LEVELS, {
  xcirc: [xcircA, xcircB, xcircC],
  xscale: [xscaleA, xscaleB, xscaleC],
  xbase: [xbaseA, xbaseB, xbaseC]
});
