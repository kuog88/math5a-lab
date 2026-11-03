'use strict';
/* 長條圖與折線圖／小數乘以整數／周長與面積／等值分數 */

/* ---------- 統計圖 ---------- */
const DINO = ['暴龍', '三角龍', '劍龍', '翼龍', '長頸龍'];
const MONTH = ['1月', '2月', '3月', '4月', '5月', '6月'];
/* 長條圖：vals 數值，step 每一格代表多少，max 縱軸最大值。opt.v2 第二組（複雜長條圖），opt.base 縱軸從 base 開始（有省略符號） */
function barSVG(labels, vals, step, max, opt = {}) {
  const W = 360, H = 230, L = 46, B = 196, T = 20, base = opt.base || 0, y = v => B - (v - base) / (max - base) * (B - T);
  const n = labels.length, bw = (W - L - 10) / n;
  let g = '';
  for (let v = base; v <= max; v += step) g += `<line x1="${L}" y1="${y(v)}" x2="${W - 6}" y2="${y(v)}" stroke="#d8d2a8" stroke-width="1"/><text x="${L - 6}" y="${y(v) + 5}" font-size="13" text-anchor="end">${v}</text>`;
  labels.forEach((lb, i) => {
    const x = L + i * bw;
    if (opt.v2) {
      g += `<rect x="${x + bw * .14}" y="${y(vals[i])}" width="${bw * .34}" height="${B - y(vals[i])}" fill="#3a6ea5"/><rect x="${x + bw * .52}" y="${y(opt.v2[i])}" width="${bw * .34}" height="${B - y(opt.v2[i])}" fill="#f08a24"/>`;
    } else g += `<rect class="bar" data-i="${i}" x="${x + bw * .2}" y="${y(vals[i])}" width="${bw * .6}" height="${Math.max(0, B - y(vals[i]))}" fill="${opt.color || '#3b8f4e'}" rx="3"/>`;
    g += `<text x="${x + bw / 2}" y="${B + 20}" font-size="14" font-weight="900" text-anchor="middle">${lb}</text>`;
  });
  const brk = base ? `<path d="M${L - 8},${B - 4} l8,-6 l8,6 M${L - 8},${B - 12} l8,-6 l8,6" fill="none" stroke="#2c2a1a" stroke-width="2"/>` : '';
  const leg = opt.v2 ? `<rect x="${W - 140}" y="2" width="12" height="12" fill="#3a6ea5"/><text x="${W - 124}" y="13" font-size="12">${opt.n1}</text><rect x="${W - 70}" y="2" width="12" height="12" fill="#f08a24"/><text x="${W - 54}" y="13" font-size="12">${opt.n2}</text>` : '';
  return `<svg class="svgbox" viewBox="0 0 ${W} ${H}" width="${W}">${g}<line x1="${L}" y1="${T - 8}" x2="${L}" y2="${B}" stroke="#2c2a1a" stroke-width="2"/><line x1="${L}" y1="${B}" x2="${W - 6}" y2="${B}" stroke="#2c2a1a" stroke-width="2"/>${brk}${leg}
    <text x="6" y="12" font-size="12" fill="#6f6a4c">（${opt.unit || '隻'}）</text></svg>`;
}
function lineChartSVG(labels, vals, step, max, opt = {}) {
  const W = 360, H = 230, L = 46, B = 196, T = 20, base = opt.base || 0, y = v => B - (v - base) / (max - base) * (B - T);
  const n = labels.length, dx = (W - L - 30) / (n - 1), X = i => L + 14 + i * dx;
  let g = '';
  for (let v = base; v <= max; v += step) g += `<line x1="${L}" y1="${y(v)}" x2="${W - 6}" y2="${y(v)}" stroke="#d8d2a8"/><text x="${L - 6}" y="${y(v) + 5}" font-size="13" text-anchor="end">${v}</text>`;
  g += `<polyline points="${vals.map((v, i) => `${X(i)},${y(v)}`).join(' ')}" fill="none" stroke="#d0482a" stroke-width="3"/>`;
  vals.forEach((v, i) => { g += `<circle cx="${X(i)}" cy="${y(v)}" r="5" fill="#d0482a"/><text x="${X(i)}" y="${B + 20}" font-size="13" font-weight="900" text-anchor="middle">${labels[i]}</text>`; });
  const brk = base ? `<path d="M${L - 8},${B - 4} l8,-6 l8,6 M${L - 8},${B - 12} l8,-6 l8,6" fill="none" stroke="#2c2a1a" stroke-width="2"/>` : '';
  return `<svg class="svgbox" viewBox="0 0 ${W} ${H}" width="${W}">${g}<line x1="${L}" y1="${T - 8}" x2="${L}" y2="${B}" stroke="#2c2a1a" stroke-width="2"/><line x1="${L}" y1="${B}" x2="${W - 6}" y2="${B}" stroke="#2c2a1a" stroke-width="2"/>${brk}
    <text x="6" y="12" font-size="12" fill="#6f6a4c">（${opt.unit || '公分'}）</text></svg>`;
}
/* 不重複的隨機值（step 的倍數） */
const distinctVals = (n, lo, hi, step) => { const s = new Set(); while (s.size < n) s.add(rand(lo / step, hi / step) * step); return [...s]; };

function chartA(st) {
  const tasks = [{ step: 5, max: 40 }, { step: 10, max: 80 }];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { step, max } = tasks[r], labels = shuffle(DINO).slice(0, 4), vals = distinctVals(4, step, max, step), cur2 = [0, 0, 0, 0];
    api.say(`恐龍調查員數到的恐龍：${labels.map((l, i) => `${l} <b>${vals[i]}</b> 隻`).join('、')}。用 ▲▼ 把長條圖畫出來（每一格代表 ${step} 隻）。`);
    st.innerHTML = `${dots(r, tasks.length)}<table class="mtable"><tr>${labels.map(l => `<th>${l}</th>`).join('')}</tr><tr>${vals.map(v => `<td>${v} 隻</td>`).join('')}</tr></table>
      <div class="center" id="ch"></div><div class="chart-ctl">${labels.map((l, i) => `<div class="grp"><b>${l}</b><button type="button" data-i="${i}" data-d="1">▲</button><span id="cv${i}">0</span><button type="button" data-i="${i}" data-d="-1">▼</button></div>`).join('')}</div>
      <div class="center"><button type="button" class="btn gold" id="okb">畫好了！</button></div>`;
    const draw = () => { $('#ch', st).innerHTML = barSVG(labels, cur2, step, max); cur2.forEach((v, i) => $('#cv' + i, st).textContent = v); };
    $$('.chart-ctl button', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; cur2[i] = Math.min(max, Math.max(0, cur2[i] + step * +b.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const wrong = vals.findIndex((v, i) => v !== cur2[i]);
      if (wrong >= 0) return api.bad(`${labels[wrong]}有 ${vals[wrong]} 隻，每格 ${step} 隻，要畫 ${vals[wrong] / step} 格高。`, `${labels[wrong]} 畫了 ${cur2[wrong]} 隻`, `${vals[wrong]} 隻`);
      $('#okb', st).disabled = true; api.ok('畫對了！'); speak('長條圖畫好了'); r++; later(round, 1800);
    };
    draw();
  }
  round();
}
function chartB(st) {
  const mk = () => { const labels = shuffle(DINO).slice(0, 5), vals = distinctVals(5, 4, 36, 2); return { labels, vals, vis: barSVG(labels, vals, 4, 40) }; };
  quiz(st, [
    () => { const c = mk(), m = Math.max(...c.vals), lb = c.labels[c.vals.indexOf(m)]; return { q: '看長條圖，哪一種恐龍<b>最多</b>？', vis: c.vis, opts: c.labels.map(l => ({ h: l, ok: l === lb })), hint: '長條最高的最多。', after: `${lb}最多，有 ${m} 隻` }; },
    () => { const c = mk(), i = rand(0, 4); return { q: `看長條圖，<b>${c.labels[i]}</b>有幾隻？（每一格是 4 隻，半格是 2 隻）`, vis: c.vis, ans: c.vals[i], unit: '隻', hint: '找到長條的頂端，往左對到縱軸看數字。' }; },
    () => { const c = mk(), [i, j] = shuffle([0, 1, 2, 3, 4]); return { q: `${c.labels[i]}和${c.labels[j]}相差幾隻？`, vis: c.vis, eq: `${Math.max(c.vals[i], c.vals[j])} − ${Math.min(c.vals[i], c.vals[j])}`, nums: [c.vals[i], c.vals[j]], ans: Math.abs(c.vals[i] - c.vals[j]), unit: '隻', hint: '相差多少，用大的減小的。' }; },
    () => { const c = mk(), mn = Math.min(...c.vals), lb = c.labels[c.vals.indexOf(mn)]; return { q: '看長條圖，哪一種恐龍<b>最少</b>？', vis: c.vis, opts: c.labels.map(l => ({ h: l, ok: l === lb })), hint: '長條最矮的最少。' }; },
    () => { const c = mk(); return { q: '這 5 種恐龍一共有幾隻？', vis: c.vis, eq: c.vals.join(' + '), nums: c.vals, ans: c.vals.reduce((a, b) => a + b, 0), unit: '隻', hint: '把 5 種恐龍的數量加起來。' }; }
  ]);
}
function chartC(st) {
  const mkLine = () => { let v = rand(4, 8) * 5, vals = []; for (let i = 0; i < 6; i++) { vals.push(v); v += pick([-10, -5, 5, 10, 15]); v = Math.max(10, Math.min(70, v)); } return vals; };
  quiz(st, shuffle([
    () => { const vals = mkLine(), d = vals.slice(1).map((v, i) => v - vals[i]), m = Math.max(...d); if (d.filter(x => x === m).length > 1 || m <= 0) return null; const k = d.indexOf(m); return { q: '小恐龍每個月量一次身高（折線圖）。哪兩個月之間<b>長高最多</b>？', vis: lineChartSVG(MONTH, vals, 10, 80), opts: d.map((x, i) => ({ h: `${MONTH[i]}～${MONTH[i + 1]}`, ok: i === k })), hint: '線往上爬得最陡的那一段。', after: `${MONTH[k]}～${MONTH[k + 1]} 長高 ${m} 公分` }; },
    () => { const vals = mkLine(), i = rand(0, 5); return { q: `看折線圖，小恐龍 <b>${MONTH[i]}</b> 的身高是幾公分？`, vis: lineChartSVG(MONTH, vals, 10, 80), ans: vals[i], unit: '公分', hint: '每一格是 10 公分，點在格子中間就是多 5 公分。', after: `${MONTH[i]}是 ${vals[i]} 公分` }; },
    () => { const vals = mkLine(), d = vals[5] - vals[0]; return d <= 0 ? null : { q: '從 1 月到 6 月，小恐龍一共長高幾公分？', vis: lineChartSVG(MONTH, vals, 10, 80), eq: `${vals[5]} − ${vals[0]}`, nums: [vals[0], vals[5]], ans: d, unit: '公分', hint: '用 6 月的身高減 1 月的身高。' }; },
    { q: '要表示「一個東西隨時間<b>變化的情形</b>」（例如每天的氣溫），用哪一種統計圖比較好？', opts: [{ h: '折線圖', ok: true }, { h: '長條圖', ok: false }, { h: '表格就好', ok: false }], hint: '折線圖看得出上升或下降的變化。' },
    () => { const v1 = distinctVals(4, 10, 40, 5), v2 = distinctVals(4, 10, 40, 5), lb = ['一班', '二班', '三班', '四班'], d = v1.map((x, i) => Math.abs(x - v2[i])), m = Math.max(...d); if (d.filter(x => x === m).length > 1) return null; const k = d.indexOf(m); return { q: '複雜長條圖：各班喜歡恐龍的男生（藍）和女生（橘）人數。哪一班男女人數<b>相差最多</b>？', vis: barSVG(lb, v1, 5, 40, { v2, n1: '男生', n2: '女生', unit: '人' }), opts: lb.map((l, i) => ({ h: l, ok: i === k })), hint: '每一班看藍色和橘色長條高度差多少。', after: `${lb[k]}：男生 ${v1[k]} 人、女生 ${v2[k]} 人，相差 ${m} 人` }; },
    () => { const v1 = distinctVals(4, 10, 40, 5), v2 = distinctVals(4, 10, 40, 5), lb = ['一班', '二班', '三班', '四班'], i = rand(0, 3); return { q: `複雜長條圖：<b>${lb[i]}</b>喜歡恐龍的一共有幾人？`, vis: barSVG(lb, v1, 5, 40, { v2, n1: '男生', n2: '女生', unit: '人' }), eq: `${v1[i]} + ${v2[i]}`, nums: [v1[i], v2[i]], ans: v1[i] + v2[i], unit: '人', hint: '男生和女生合起來。' }; }
  ].map(f => typeof f !== 'function' ? f : () => { let q; do { q = f(); } while (!q); return q; })).slice(0, 6));
}
function chartD(st) {
  adv(st, [
    { q: '這張長條圖的縱軸從 100 開始（有省略符號）。看起來劍龍的長條是三角龍的 3 倍高，實際上劍龍比三角龍多幾隻？', vis: barSVG(['三角龍', '劍龍'], [110, 130], 10, 140, { base: 100 }), ans: 20, unit: '隻', ex: '三角龍 110 隻、劍龍 130 隻，130 − 110 ＝ 20 隻；劍龍並不是三角龍的 3 倍。', trap: '縱軸有省略符號時，長條的高度不能直接拿來比倍數。' },
    { q: '下面的長條圖每一格代表 20 人。翼龍館有幾人參觀？', vis: barSVG(['暴龍館', '翼龍館', '化石館'], [140, 90, 60], 20, 160, { unit: '人' }), ans: 90, unit: '人', ex: '每格 20 人，翼龍館到 80 再多半格（10 人），是 90 人。', trap: '每一格不是 1 人，也不是 10 人，要先看縱軸的刻度。' },
    { q: '小恐龍的體重（折線圖）：1 月 20、2 月 28、3 月 32、4 月 30、5 月 38、6 月 40 公斤。哪兩個月之間體重<b>減少</b>了？', vis: lineChartSVG(MONTH, [20, 28, 32, 30, 38, 40], 10, 50, { unit: '公斤' }), opts: [{ h: '3月～4月', ok: true }, { h: '4月～5月', ok: false }, { h: '5月～6月', ok: false }, { h: '1月～2月', ok: false }], ex: '3 月 32 公斤、4 月 30 公斤，線往下，減少 2 公斤。', trap: '題目問「減少」，要找線往下的那一段。' },
    { q: '某班喜歡恐龍的有男生 26 人、女生 18 人（見長條圖），其中 30 人最喜歡暴龍，最喜歡其他恐龍的有幾人？', vis: barSVG(['男生', '女生'], [26, 18], 10, 30, { unit: '人', color: '#3a6ea5' }), eq: '26 + 18 − 30', alt: ['(26 + 18) − 30'], ans: 14, unit: '人', ex: '喜歡恐龍的共 26 ＋ 18 ＝ 44 人，其中 30 人喜歡暴龍，44 − 30 ＝ 14 人。', trap: '要先把男生和女生合起來，再扣掉喜歡暴龍的。' },
    { q: '要比較「5 種恐龍的數量多少」，用哪一種統計圖最適合？', opts: [{ h: '長條圖', ok: true }, { h: '折線圖', ok: false }, { h: '圓形圖', ok: false }], ex: '比較不同種類的數量多少，用長條圖；看隨時間變化才用折線圖。', trap: '5 種恐龍是不同的種類，沒有先後時間的順序，不適合用折線圖。' }
  ]);
}

/* ---------- 小數乘以整數 ---------- */
const dfmt = v => String(rd(v, 4));
/* 一位小數、二位小數（最後一位不是 0） */
const dec1 = (lo = 1, hi = 8) => (rand(lo, hi) * 10 + rand(1, 9)) / 10, dec2 = (lo = 1, hi = 4) => (rand(lo * 10, hi * 10 + 9) * 10 + rand(1, 9)) / 100;
function dmulA(st) {
  const mk = () => { const n = rand(3, 7), a = rand(5, Math.floor(100 / n)); return [a, n]; };
  const tasks = [mk(), mk(), mk()];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [a, n] = tasks[r], A = a / 100;
    api.say(`一根小骨頭長 <b>${dfmt(A)}</b> 公尺。按「塗一組」把 <b>${n}</b> 根骨頭的長度塗在百格圖上（一整張是 1 公尺）。`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center">${grid100SVG(26)}</div><div class="readout">已塗 <span id="cnt">0</span> 組，共 <span id="cel">0</span> 格</div>
      <div class="center"><button type="button" class="btn gold" id="add">➕ 塗一組 ${dfmt(A)}</button> <button type="button" class="btn ghost" id="clr">🧹 重塗</button></div><div class="kwrap" id="kw"></div>`;
    let g = 0;
    const cells = $$('rect.c', st);
    const draw = () => { cells.forEach((c, i) => { c.classList.toggle('on', i < g * a); c.classList.toggle('x', i < g * a && Math.floor(i / a) % 2 === 1); }); $('#cnt', st).textContent = g; $('#cel', st).textContent = g * a; };
    $('#clr', st).onclick = () => { if ($('#add', st).disabled) return; g = 0; draw(); };
    $('#add', st).onclick = () => {
      if (g * a + a > 100) return toast('格子不夠了！');
      g++; sfx('tap'); draw();
      if (g === n) {
        $('#add', st).disabled = true; api.ok(`塗好 ${n} 組了！`);
        api.say(`${n} 組共 ${n * a} 格，就是 ${n * a} 個 0.01。${dfmt(A)} × ${n} ＝ ? 公尺`);
        keypad($('#kw', st), rd(A * n, 4), () => { $('#kw', st).innerHTML = `<div class="center"><span class="after">${dfmt(A)} × ${n} ＝ ${dfmt(A * n)} 公尺</span></div>`; speak(`${dfmt(A)}乘以${n}等於${dfmt(A * n)}`); r++; later(round, 2200); }, `${n * a} 個 0.01 是 ${dfmt(A * n)}。`, '公尺', true);
      }
    };
    draw();
  }
  round();
}
function dmulB(st) {
  quiz(st, shuffle([
    () => { const a = dec2(), n = rand(3, 9); return { q: `${a} × ${n} ＝ ?`, ans: rd(a * n), dec: true, hint: `先算 ${Math.round(a * 100)} × ${n}，再點上 2 位小數。`, after: `${a} × ${n} ＝ ${dfmt(a * n)}` }; },
    () => { const a = pick([0.5, 0.2, 0.4, 0.6, 0.8]), n = pick([5, 10, 15, 20, 25]); return { q: `${a} × ${n} ＝ ?`, ans: rd(a * n), dec: true, hint: `${Math.round(a * 10)} 個 0.1 乘以 ${n}。`, after: `${a} × ${n} ＝ ${dfmt(a * n)}（小數點後面的 0 可以不寫）` }; },
    () => { const a = dec1(), n = rand(12, 36); return { q: `${a} × ${n} ＝ ?`, ans: rd(a * n), dec: true, hint: `先算 ${Math.round(a * 10)} × ${n}，再點上 1 位小數。`, after: `${a} × ${n} ＝ ${dfmt(a * n)}` }; },
    () => { const a = dec2(1, 9), n = rand(12, 49); return { q: `用直式算 ${a} × ${n}，積要先點上幾位小數？`, opts: [1, 2, 3].map(k => ({ h: `${k} 位小數`, ok: k === 2 })), hint: '被乘數是幾位小數，積就先點幾位小數。', after: `${a} × ${n} ＝ ${(a * n).toFixed(2)}` }; },
    () => { const a = pick([0.07, 0.04, 0.06, 0.08, 0.03]), n = pick([30, 40, 50, 60]); return { q: `${a} × ${n} ＝ ?`, ans: rd(a * n), dec: true, hint: `${Math.round(a * 100)} 個 0.01 乘以 ${n}。`, after: `${a} × ${n} ＝ ${dfmt(a * n)}` }; },
    () => { const a = pick([1.25, 2.25, 0.25, 3.75]), n = 4; return { q: `${a} × ${n} ＝ ?`, ans: rd(a * n), dec: true, hint: '0.25 × 4 ＝ 1。', after: `${a} × 4 ＝ ${dfmt(a * 4)}` }; }
  ]));
}
function dmulC(st) {
  quiz(st, shuffle([
    () => { const a = pick([1.25, 1.5, 0.75, 2.4, 0.6]), n = rand(4, 12); return { q: `每瓶恐龍果汁 ${a} 公升，${n} 瓶共幾公升？`, eq: `${a} × ${n}`, ans: rd(a * n), unit: '公升', hint: '每瓶一樣多，用乘法。' }; },
    () => { const a = dec1(2, 8), n = rand(12, 25); return { q: `一節恐龍骨頭長 ${a} 公尺，${n} 節排成一列，共長幾公尺？`, eq: `${a} × ${n}`, ans: rd(a * n), unit: '公尺', hint: '一樣長的有好幾節，用乘法。' }; },
    () => { const a = dec2(1, 3), n = rand(12, 30); return { q: `每包蕨類種子重 ${a} 公斤，${n} 包重幾公斤？`, eq: `${a} × ${n}`, ans: rd(a * n), unit: '公斤', hint: '每包一樣重，用乘法。' }; },
    () => { const a = dec1(1, 3), n = rand(3, 6), b = dec1(1, 2); return { q: `一包飼料 ${a} 公斤，買 ${n} 包，再加上一袋 ${b} 公斤的果子，共重幾公斤？`, eq: `${a} × ${n} + ${b}`, alt: [`(${a} × ${n}) + ${b}`], ans: rd(a * n + b), unit: '公斤', hint: '先算飼料一共多重，再加上果子。' }; },
    () => { const a = dec1(1, 4), n = rand(3, 8), L = Math.ceil(a * n) + rand(1, 5); return { q: `一捲繩子長 ${L} 公尺，剪下 ${n} 段，每段 ${a} 公尺，還剩幾公尺？`, eq: `${L} − ${a} × ${n}`, alt: [`${L} − (${a} × ${n})`], ans: rd(L - a * n), unit: '公尺', hint: `先算剪下的 ${n} 段共幾公尺。` }; }
  ]));
}
function dmulD(st) {
  adv(st, [
    { q: '0.25 × 36 ＝ ?', ans: 9, dec: true, ex: '25 × 36 ＝ 900，點上 2 位小數得 9.00 ＝ 9。', trap: '積是 9.00，最後的 0 可以去掉，答案就是 9。' },
    { q: '小恐龍每天走 1.08 公里，7 天走幾公里？', eq: '1.08 × 7', ans: 7.56, unit: '公里', ex: '108 × 7 ＝ 756，點 2 位小數：7.56 公里。', trap: '1.08 的十分位是 0，不要寫成 1.8 × 7 ＝ 12.6。' },
    { q: '下面哪一個算式的積<b>最大</b>？', opts: [{ h: '0.9 × 12', ok: true }, { h: '0.09 × 100', ok: false }, { h: '1.2 × 8', ok: false }, { h: '0.25 × 40', ok: false }], ex: '0.9 × 12 ＝ 10.8；0.09 × 100 ＝ 9；1.2 × 8 ＝ 9.6；0.25 × 40 ＝ 10。最大是 10.8。', trap: '不要只看乘數大小，要真的算出積來比。' },
    { q: '一瓶水 0.6 公升，買 15 瓶，倒掉 2.5 公升，還剩幾公升？', eq: '0.6 × 15 − 2.5', alt: ['(0.6 × 15) − 2.5'], ans: 6.5, unit: '公升', ex: '0.6 × 15 ＝ 9 公升，9 − 2.5 ＝ 6.5 公升。', trap: '要先算 15 瓶共幾公升，再扣掉倒掉的。' },
    { q: '□ × 6 ＝ 4.2，□ 是多少？', opts: [{ h: '0.7', ok: true }, { h: '7', ok: false }, { h: '0.07', ok: false }, { h: '1.2', ok: false }], ex: '0.7 × 6 ＝ 4.2，所以 □ ＝ 0.7。', trap: '7 × 6 ＝ 42，不是 4.2；要注意小數點的位置。' }
  ]);
}

/* ---------- 周長與面積 ---------- */
function rectSVG(l, w, u = 24, lab = true) {
  return `<svg class="svgbox" viewBox="0 0 ${l * u + 70} ${w * u + 50}" width="${Math.min(l * u + 70, 360)}"><rect x="40" y="10" width="${l * u}" height="${w * u}" fill="#cfe8b0" stroke="#2c2a1a" stroke-width="3"/>
    ${lab ? `<text x="${40 + l * u / 2}" y="${w * u + 34}" font-size="16" font-weight="900" text-anchor="middle">${l} 公分</text><text x="34" y="${10 + w * u / 2 + 5}" font-size="16" font-weight="900" text-anchor="end">${w}</text>` : ''}</svg>`;
}
function periA(st) {
  const pool = shuffle([[6, 4], [8, 3], [9, 2], [7, 4], [6, 5], [8, 6], [10, 3], [7, 3]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= pool.length) return api.finish();
    const [L, Wd] = pool[r], A = L * Wd, Pm = (L + Wd) * 2;
    let l = 1, w = 1;
    api.say(`在蕨類植物園圍一塊<b>面積 ${A} 平方公分、周長 ${Pm} 公分</b>的長方形花圃（每一格是 1 平方公分）。`);
    st.innerHTML = `${dots(r, pool.length)}<div class="center" id="pic"></div><div class="ctl"><div class="grp">長 <button type="button" data-k="l" data-d="-1">−</button><span class="v" id="vl">1</span><button type="button" data-k="l" data-d="1">＋</button> 公分</div><div class="grp">寬 <button type="button" data-k="w" data-d="-1">−</button><span class="v" id="vw">1</span><button type="button" data-k="w" data-d="1">＋</button> 公分</div></div>
      <div class="readout">面積 <span id="va">1</span> 平方公分、周長 <span id="vp">4</span> 公分</div><div class="center"><button type="button" class="btn gold" id="okb">圍好了！</button></div>`;
    const draw = () => {
      const u = 24;
      let g = ''; for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) g += `<rect x="${i * u + 2}" y="${j * u + 2}" width="${u}" height="${u}" fill="${i < l && j < w ? '#9fd08a' : '#fff'}" stroke="#d8d2a8"/>`;
      $('#pic', st).innerHTML = `<svg class="svgbox" viewBox="0 0 ${12 * u + 4} ${8 * u + 4}" width="${12 * u + 4}">${g}<rect x="2" y="2" width="${l * u}" height="${w * u}" fill="none" stroke="#d0482a" stroke-width="4"/></svg>`;
      $('#vl', st).textContent = l; $('#vw', st).textContent = w; $('#va', st).textContent = l * w; $('#vp', st).textContent = (l + w) * 2;
    };
    $$('.ctl button', st).forEach(b => b.onclick = () => { const d = +b.dataset.d; if (b.dataset.k === 'l') l = Math.min(12, Math.max(1, l + d)); else w = Math.min(8, Math.max(1, w + d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (l * w === A && (l + w) * 2 === Pm) { $('#okb', st).disabled = true; api.ok('圍對了！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">長 ${l} × 寬 ${w} ＝ ${A}，(${l} ＋ ${w}) × 2 ＝ ${Pm}</span></div>`); speak('圍對了'); r++; later(round, 2400); return; }
      api.bad(l * w !== A ? `面積要 ${A} 平方公分：長 × 寬 ＝ ${A}。` : `面積對了！周長要 ${Pm}：(長 ＋ 寬) × 2。`, `長 ${l}、寬 ${w}`, `長 ${Math.max(L, Wd)}、寬 ${Math.min(L, Wd)}`);
    };
    draw();
  }
  round();
}
function periB(st) {
  quiz(st, shuffle([
    () => { const l = rand(5, 12), w = rand(2, l - 1); return { q: `長方形長 ${l} 公分、寬 ${w} 公分，<b>面積</b>是幾平方公分？`, vis: rectSVG(l, w), eq: `${l} × ${w}`, ans: l * w, unit: '平方公分', hint: '長方形面積 ＝ 長 × 寬。' }; },
    () => { const l = rand(5, 12), w = rand(2, l - 1); return { q: `長方形長 ${l} 公分、寬 ${w} 公分，<b>周長</b>是幾公分？`, vis: rectSVG(l, w), eq: `(${l} + ${w}) × 2`, alt: [`${l} × 2 + ${w} × 2`, `${l} + ${w} + ${l} + ${w}`], ans: (l + w) * 2, unit: '公分', hint: '長方形周長 ＝（長 ＋ 寬）× 2。' }; },
    () => { const s = rand(4, 13); return { q: `正方形的邊長 ${s} 公分，面積是幾平方公分？`, eq: `${s} × ${s}`, ans: s * s, unit: '平方公分', hint: '正方形面積 ＝ 邊長 × 邊長。' }; },
    { q: '1 平方公尺 ＝ ? 平方公分', ans: 10000, unit: '平方公分', hint: '1 公尺 ＝ 100 公分，100 × 100。', after: '1 平方公尺 ＝ 100 × 100 ＝ 10000 平方公分' },
    () => { const k = rand(2, 9); return { q: `${k} 平方公尺 ＝ ? 平方公分`, ans: k * 10000, unit: '平方公分', hint: '1 平方公尺 ＝ 10000 平方公分。', after: `${k} × 10000 ＝ ${comma(k * 10000)} 平方公分` }; },
    { q: '教室地板的面積，用哪一個單位比較適合？', opts: [{ h: '平方公尺', ok: true }, { h: '平方公分', ok: false }, { h: '公尺', ok: false }], hint: '面積要用「平方」的單位；教室很大，用平方公尺。' }
  ]));
}
/* L 形：外框 W×H，右上角缺一塊 w×h */
function lShapeSVG(W, H, w, h, u = 20) {
  const X = 50, Y = 20, pts = [[0, 0], [W - w, 0], [W - w, h], [W, h], [W, H], [0, H]].map(([a, b]) => `${X + a * u},${Y + b * u}`).join(' ');
  const t = (x, y, s, a = 'middle') => `<text x="${x}" y="${y}" font-size="15" font-weight="900" text-anchor="${a}" fill="#2c2a1a">${s}</text>`;
  return `<svg class="svgbox" viewBox="0 0 ${W * u + 110} ${H * u + 56}" width="${Math.min(W * u + 110, 360)}"><polygon points="${pts}" fill="#cfe8b0" stroke="#2c2a1a" stroke-width="3"/>
    ${t(X + W * u / 2, Y + H * u + 22, W + ' 公分')}${t(X - 6, Y + H * u / 2, H, 'end')}${t(X + (W - w) * u / 2, Y - 4, W - w)}${t(X + W * u + 6, Y + (h + H) * u / 2, H - h, 'start')}${t(X + (W - w / 2) * u, Y + h * u - 6, w)}${t(X + (W - w) * u + 6, Y + h * u / 2 + 5, h, 'start')}</svg>`;
}
function periC(st) {
  quiz(st, shuffle([
    () => { const W = rand(8, 12), H = rand(6, 9), w = rand(2, W - 4), h = rand(2, H - 3); return { q: '這個植物園的平面圖（單位：公分），面積是幾平方公分？', vis: lShapeSVG(W, H, w, h), nums: [...new Set([W, H, W - w, H - h, w, h])], eq: `${W} × ${H} − ${w} × ${h}`, alt: [`${W - w} × ${H} + ${w} × ${H - h}`, `${W} × ${H - h} + ${W - w} × ${h}`, `${W - w} × ${h} + ${W} × ${H - h}`, `${w} × ${H - h} + ${W - w} × ${H}`], ans: W * H - w * h, unit: '平方公分', hint: '可以切成兩個長方形相加，或用大長方形減掉缺的一塊。' }; },
    () => { const w = rand(3, 9), l = rand(w + 1, 15); return { q: `長方形花圃面積 ${l * w} 平方公尺，寬 ${w} 公尺，長是幾公尺？`, eq: `${l * w} ÷ ${w}`, ans: l, unit: '公尺', hint: '面積 ＝ 長 × 寬，長 ＝ 面積 ÷ 寬。' }; },
    () => { const w = rand(3, 9), l = rand(w + 1, 15), P = (l + w) * 2; return { q: `長方形周長 ${P} 公分，長 ${l} 公分，寬是幾公分？`, eq: `${P} ÷ 2 − ${l}`, alt: [`(${P} − ${l} × 2) ÷ 2`, `(${P} − ${l} − ${l}) ÷ 2`], ans: w, unit: '公分', hint: '周長的一半 ＝ 長 ＋ 寬。' }; },
    () => { const s = rand(5, 12); return { q: `正方形周長 ${s * 4} 公分，面積是幾平方公分？`, eq: `(${s * 4} ÷ 4) × (${s * 4} ÷ 4)`, alt: [`${s * 4} ÷ 4 × ${s}`], ans: s * s, unit: '平方公分', hint: `先用周長 ÷ 4 求邊長，再算 邊長 × 邊長。` }; },
    () => { const k = rand(3, 8); return { q: `${k * 10000} 平方公分 ＝ ? 平方公尺`, ans: k, unit: '平方公尺', hint: '10000 平方公分 ＝ 1 平方公尺。', after: `${comma(k * 10000)} ÷ 10000 ＝ ${k} 平方公尺` }; }
  ]));
}
function periD(st) {
  adv(st, [
    { q: '長方形的面積是 48 平方公分，周長是 28 公分，它的長是幾公分？', ans: 8, unit: '公分', ex: '長 ＋ 寬 ＝ 28 ÷ 2 ＝ 14，長 × 寬 ＝ 48，8 ＋ 6 ＝ 14、8 × 6 ＝ 48，所以長 8 公分、寬 6 公分。', trap: '要同時符合面積和周長兩個條件；12 × 4 ＝ 48，但 12 ＋ 4 ＝ 16 不合。' },
    { q: '3 平方公尺 ＝ ? 平方公分', ans: 30000, unit: '平方公分', ex: '1 平方公尺 ＝ 100 公分 × 100 公分 ＝ 10000 平方公分，3 平方公尺 ＝ 30000 平方公分。', trap: '不是 300，平方公尺換平方公分要乘 10000。' },
    { q: '這個圖形（單位：公分）的周長是幾公分？', vis: lShapeSVG(10, 7, 4, 3), ans: 34, unit: '公分', ex: '缺角的圖形，周長和外面的大長方形一樣：(10 ＋ 7) × 2 ＝ 34 公分（6＋3＋4＋4＋10＋7 ＝ 34）。', trap: '缺一角後面積變小，但周長並沒有變少。' },
    { q: '周長都是 20 公分的長方形，哪一個面積最大？', opts: [{ h: '長 5、寬 5（正方形）', ok: true }, { h: '長 6、寬 4', ok: false }, { h: '長 8、寬 2', ok: false }, { h: '長 9、寬 1', ok: false }], ex: '面積依序是 25、24、16、9 平方公分，長和寬越接近面積越大。', trap: '周長一樣，面積不一定一樣。' },
    { q: '一塊長 8 公尺、寬 5 公尺的草地，中間有一條和長邊平行、寬 1 公尺的小路，剩下的草地面積是幾平方公尺？', vis: `<svg class="svgbox" viewBox="0 0 300 180" width="300"><rect x="30" y="20" width="240" height="150" fill="#9fd08a" stroke="#2c2a1a" stroke-width="3"/><rect x="30" y="80" width="240" height="30" fill="#e6d3a8" stroke="#2c2a1a" stroke-width="2"/><text x="150" y="100" font-size="14" text-anchor="middle" font-weight="900">小路寬 1 公尺</text><text x="150" y="16" font-size="15" text-anchor="middle" font-weight="900">8 公尺</text><text x="24" y="100" font-size="15" text-anchor="end" font-weight="900">5</text></svg>`, eq: '8 × 5 − 8 × 1', alt: ['8 × (5 − 1)', '(5 − 1) × 8'], ans: 32, unit: '平方公尺', ex: '草地 8 × 5 ＝ 40，小路 8 × 1 ＝ 8，40 − 8 ＝ 32 平方公尺；也可以把剩下的草地拼成 8 × 4 ＝ 32。', trap: '小路是長 8 公尺、寬 1 公尺，不是 5 × 1。' }
  ]);
}

/* ---------- 等值分數 ---------- */
function equivA(st) {
  const tasks = shuffle([[1, 2, 2], [1, 3, 2], [2, 3, 2], [3, 4, 2], [1, 2, 3], [2, 5, 2]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [a, b, k] = tasks[r], n2 = b * k;
    api.say(`上面的葉子塗了 ${F(a, b)}。下面一樣大的葉子分成 ${n2} 份，塗出<b>一樣多</b>！`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="fbars"><div class="fbar">${Array.from({ length: b }, (_, i) => `<div class="seg${i < a ? ' on' : ''}" style="cursor:default"></div>`).join('')}</div>
      <div class="fbar" id="low">${Array.from({ length: n2 }, () => '<div class="seg"></div>').join('')}</div></div>
      <div class="readout">下面塗了 <span id="cnt">0</span> 份（每份 ${F(1, n2)}）</div><div class="center"><button class="btn gold" id="okb" type="button">一樣多了！</button></div>`;
    const segs = $$('#low .seg', st);
    segs.forEach(s => s.onclick = () => { if ($('#okb', st).disabled) return; s.classList.toggle('on'); sfx('tap'); $('#cnt', st).textContent = segs.filter(x => x.classList.contains('on')).length; });
    $('#okb', st).onclick = () => {
      const n = segs.filter(x => x.classList.contains('on')).length;
      if (n !== a * k) return api.bad(`上面每 1 份，等於下面的 ${k} 份。`, `塗了 ${n}/${n2}`, `${a * k}/${n2}`);
      $('#okb', st).disabled = true; api.ok('一樣多！');
      $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">${F(a, b)} ＝ ${F(a * k, n2)}（分子、分母都乘以 ${k}）</span></div>`);
      speak(`${b}分之${a}等於${n2}分之${a * k}`); r++; later(round, 2400);
    };
  }
  round();
}
function equivB(st) {
  quiz(st, shuffle([
    () => { const b = pick([2, 3, 4, 5]), a = rand(1, b - 1), k = rand(2, 5); return { q: `${F(a, b)} ＝ ${F('□', b * k)}，□ ＝ ?`, ans: a * k, hint: `分母 ${b} 乘以 ${k} 變成 ${b * k}，分子也要乘以 ${k}。`, after: `${F(a, b)} ＝ ${F(a * k, b * k)}` }; },
    () => { const b = pick([2, 3, 4, 5]), a = rand(1, b - 1), k = rand(2, 4); return { q: `${F(a, b)} ＝ ${F(a * k, '□')}，□ ＝ ?`, ans: b * k, hint: `分子乘以 ${k}，分母也要乘以 ${k}。`, after: `${F(a, b)} ＝ ${F(a * k, b * k)}` }; },
    () => { const b = pick([2, 3, 4]), a = rand(1, b - 1), k = rand(2, 4); return { q: `${F(a * k, b * k)} ＝ ${F(a, '□')}，□ ＝ ?`, ans: b, hint: `分子 ${a * k} 除以 ${k} 變成 ${a}，分母也除以 ${k}。`, after: `${F(a * k, b * k)} ＝ ${F(a, b)}` }; },
    () => { const b = pick([2, 3, 4, 5]), k = pick([2, 3]), a = rand(1, b - 1), c = rand(1, b * k - 1); if (a * k === c) return null; return { q: `${F(a, b)} ○ ${F(c, b * k)}`, keep: true, opts: cmpOpts(a * k, c), hint: `把 ${a}/${b} 化成分母是 ${b * k} 的分數再比。`, after: `${F(a, b)} ＝ ${F(a * k, b * k)}，${sign(a * k, c)} ${F(c, b * k)}` }; },
    { q: `下面哪一個分數和 ${F(1, 2)} <b>不相等</b>？`, opts: [{ h: F(3, 5), ok: true }, { h: F(2, 4), ok: false }, { h: F(5, 10), ok: false }, { h: F(4, 8), ok: false }], hint: '分子是分母的一半，才等於 1/2。' },
    () => { const k = rand(2, 5); return { q: `${F(2, 3)} 和 ${F(2 * k, 3 * k)} 的大小？`, keep: true, opts: cmpOpts(1, 1), hint: '分子、分母同時乘以同一個數，分數的大小不變。' }; }
  ].map(f => typeof f !== 'function' ? f : () => { let q; do { q = f(); } while (!q); return q; })));
}
function equivC(st) {
  quiz(st, shuffle([
    () => { const a = rand(1, 9); return { q: `${F(a, 10)} 寫成小數是多少？`, ans: a / 10, dec: true, hint: `${a} 個 0.1。`, after: `${F(a, 10)} ＝ ${a / 10}` }; },
    () => { const a = rand(11, 99); if (a % 10 === 0) return null; return { q: `0.${a} ＝ ${F('□', 100)}，□ ＝ ?`, ans: a, hint: `0.${a} 是 ${a} 個 0.01。`, after: `0.${a} ＝ ${F(a, 100)}` }; },
    () => { const a = rand(1, 9); return { q: `${F(a, 100)} 寫成小數是多少？`, ans: a / 100, dec: true, hint: `${a} 個 0.01，十分位是 0。`, after: `${F(a, 100)} ＝ ${rd(a / 100)}` }; },
    () => { const [n, d, k] = pick([[1, 2, 5], [1, 5, 2], [2, 5, 2], [3, 5, 2], [4, 5, 2]]); return { q: `${F(n, d)} ＝ ${F('□', 10)} ＝ 0.□，寫成小數是多少？`, ans: n * k / 10, dec: true, hint: `${F(n, d)} 的分子、分母都乘以 ${k}，變成分母是 10。`, after: `${F(n, d)} ＝ ${F(n * k, 10)} ＝ ${n * k / 10}` }; },
    () => { const [n, d] = pick([[1, 4], [3, 4]]); return { q: `${F(n, d)} 寫成小數是多少？`, ans: n * 25 / 100, dec: true, hint: `${F(n, d)} ＝ ${F(n * 25, 100)}。`, after: `${F(n, d)} ＝ ${F(n * 25, 100)} ＝ ${n * 25 / 100}` }; },
    () => { const [a, b, c, d] = pick([[1, 2, 1, 4], [1, 3, 1, 6], [1, 4, 3, 8], [2, 5, 1, 10]]), k = d / b; return { q: `${F(a, b)} ＋ ${F(c, d)} ＝ ?`, frac: [a * k + c, d], hint: `先把 ${a}/${b} 化成分母是 ${d} 的分數。`, after: `${F(a * k, d)} ＋ ${F(c, d)} ＝ ${F(a * k + c, d)}` }; },
    () => { const [a, b, c, d] = pick([[5, 6, 1, 3], [3, 4, 1, 2], [7, 10, 2, 5], [5, 8, 1, 4]]), k = b / d; return { q: `${F(a, b)} − ${F(c, d)} ＝ ?`, frac: [a - c * k, b], hint: `先把 ${c}/${d} 化成分母是 ${b} 的分數。`, after: `${F(a, b)} − ${F(c * k, b)} ＝ ${F(a - c * k, b)}` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })).slice(0, 6));
}
function equivD(st) {
  adv(st, [
    { q: `${F(3, 4)} ＝ ${F(15, '□')}，□ ＝ ?`, ans: 20, ex: '分子 3 × 5 ＝ 15，分母也要 4 × 5 ＝ 20。', trap: '不是分母加 12（4 ＋ 12），等值分數是同時乘以同一個數。' },
    { q: `${F(5, 8)} 和 ${F(3, 4)} 哪一個比較大？`, opts: [{ h: F(3, 4), ok: true }, { h: F(5, 8), ok: false }, { h: '一樣大', ok: false }], ex: `${F(3, 4)} ＝ ${F(6, 8)}，${F(6, 8)} ＞ ${F(5, 8)}。`, trap: '不能看分子 5 比 3 大就說 5/8 比較大，分母不同要先化成同分母。' },
    { q: '0.07 ＝ ?', opts: [{ h: F(7, 100), ok: true }, { h: F(7, 10), ok: false }, { h: F(70, 100), ok: false }, { h: F(1, 7), ok: false }], ex: '0.07 的 7 在百分位，是 7 個 0.01 ＝ 7/100。', trap: '0.7 才是 7/10；0.07 的十分位是 0。' },
    { q: `${F(1, 2)} ＋ ${F(3, 8)} ＝ ?`, frac: [7, 8], ex: `${F(1, 2)} ＝ ${F(4, 8)}，${F(4, 8)} ＋ ${F(3, 8)} ＝ ${F(7, 8)}。`, trap: '分母不同不能直接相加成 4/10，要先化成同分母。' },
    { q: `${F(2, 5)} 寫成小數是多少？`, ans: 0.4, dec: true, ex: `${F(2, 5)} ＝ ${F(4, 10)} ＝ 0.4。`, trap: '不是 2.5，也不是 0.25；要先化成分母是 10 的分數。' }
  ]);
}

Object.assign(LEVELS, {
  chart: [chartA, chartB, chartC, chartD],
  dmul: [dmulA, dmulB, dmulC, dmulD],
  peri: [periA, periB, periC, periD],
  equiv: [equivA, equivB, equivC, equivD]
});
