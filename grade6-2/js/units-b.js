'use strict';
/* 放大圖、縮圖與比例尺／怎樣解題（年齡、和差、雞兔、平均）／相遇、追趕與流水 */

/* ===== 放大圖、縮圖與比例尺 ===== */
/* 方格上的直角三角形或長方形：kind 'rect' | 'tri' */
function shapeGrid(kind, w, h, ox, oy, col, u = 20) {
  const X = x => (ox + x) * u + 2, Y = y => (oy + y) * u + 2;
  return kind === 'rect' ? `<rect x="${X(0)}" y="${Y(0)}" width="${w * u}" height="${h * u}" fill="${col}" fill-opacity=".55" stroke="#1b2340" stroke-width="3"/>`
    : `<polygon points="${X(0)},${Y(h)} ${X(w)},${Y(h)} ${X(0)},${Y(0)}" fill="${col}" fill-opacity=".55" stroke="#1b2340" stroke-width="3"/>`;
}
function gridBG(cols, rows, u = 20) { let g = ''; for (let i = 0; i <= cols; i++) g += `<line x1="${i * u + 2}" y1="2" x2="${i * u + 2}" y2="${rows * u + 2}" stroke="#d4dbf5"/>`; for (let j = 0; j <= rows; j++) g += `<line x1="2" y1="${j * u + 2}" x2="${cols * u + 2}" y2="${j * u + 2}" stroke="#d4dbf5"/>`; return g; }
function scaleA(st) {
  const tasks = [{ kind: 'rect', w: 3, h: 2, k: 2 }, { kind: 'tri', w: 2, h: 3, k: 3 }, { kind: 'rect', w: 6, h: 4, k: 0.5 }];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { kind, w, h, k } = tasks[r], tw = w * k, th = h * k, nm = kind === 'rect' ? '長方形' : '直角三角形';
    let a = 1, b = 1;
    api.say(`左邊的${nm}底 ${w} 格、高 ${h} 格。在右邊畫出它的<b>${k > 1 ? k + ' 倍放大圖' : '1/2 縮圖'}</b>：調整底和高！`, `畫出${k > 1 ? k + '倍放大圖' : '二分之一縮圖'}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="pic"></div><div class="ctl"><div class="grp">底 <button type="button" data-k="a" data-d="-1">−</button><span class="v" id="va">1</span><button type="button" data-k="a" data-d="1">＋</button> 格</div><div class="grp">高 <button type="button" data-k="b" data-d="-1">−</button><span class="v" id="vb">1</span><button type="button" data-k="b" data-d="1">＋</button> 格</div></div>
      <div class="center"><button type="button" class="btn gold" id="okb">畫好了！</button></div>`;
    const draw = () => { $('#pic', st).innerHTML = `<svg class="svgbox" viewBox="0 0 344 204" width="344">${gridBG(17, 10)}${shapeGrid(kind, w, h, 1, 10 - h - 1, '#8b5cf6')}${shapeGrid(kind, a, b, 8, 10 - b - 1, '#14b8c8')}</svg>`; $('#va', st).textContent = a; $('#vb', st).textContent = b; };
    $$('.ctl button', st).forEach(btn => btn.onclick = () => { const d = +btn.dataset.d; if (btn.dataset.k === 'a') a = Math.max(1, Math.min(9, a + d)); else b = Math.max(1, Math.min(9, b + d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (a === tw && b === th) { $('#okb', st).disabled = true; api.ok('畫對了！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">每一邊都${k > 1 ? '放大' : '縮小'}成 ${k > 1 ? k + ' 倍' : '1/2'}：底 ${tw}、高 ${th}，角度不變</span></div>`); speak('畫對了，角度不變'); r++; later(round, 2400); return; }
      api.bad(`每一條邊都要變成原來的 ${k > 1 ? k + ' 倍' : '1/2'}：底 ${w} × ${k} 、高 ${h} × ${k}。`, `底 ${a}、高 ${b}`, `底 ${tw}、高 ${th}`);
    };
    draw();
  }
  round();
}
function scaleB(st) {
  quiz(st, shuffle([
    () => { const ang = pick([35, 50, 65, 120]), k = pick([2, 3, 4]); return { q: `把一個三角形放大成 ${k} 倍，原來 ${ang} 度的角，放大圖上的對應角是幾度？`, ans: ang, unit: '度', hint: '放大或縮小，對應角的大小都不變。', after: `還是 ${ang} 度` }; },
    () => { const s = rand(3, 9), k = pick([2, 3, 4]); return { q: `四邊形的一邊長 ${s} 公分，畫成 ${k} 倍放大圖，這條邊的對應邊長幾公分？`, eq: `${s} × ${k}`, ans: s * k, unit: '公分', hint: '對應邊都變成原來的幾倍。' }; },
    () => { const s = pick([12, 16, 20, 24]); return { q: `長方形的長是 ${s} 公分，畫成 1/4 縮圖，長變成幾公分？`, eq: `${s} × 1/4`, alt: [`${s} ÷ 4`], ans: s / 4, unit: '公分', hint: '1/4 縮圖，每條邊都變成原來的 1/4。' }; },
    () => { const P = rand(10, 30), k = pick([2, 3]); return { q: `三角形周長 ${P} 公分，放大成 ${k} 倍後，周長是幾公分？`, eq: `${P} × ${k}`, ans: P * k, unit: '公分', hint: '每條邊都變成 k 倍，周長也變成 k 倍。' }; },
    () => { const w = pick([2, 3, 4]), h = w + pick([1, 2]); const ok = [w * 2, h * 2], bad1 = [w * 2, h + 2], bad2 = [w + 2, h * 3]; return { q: `長方形長 ${h} 公分、寬 ${w} 公分，哪一個是它的放大圖？`, opts: shuffle([{ h: `長 ${ok[1]}、寬 ${ok[0]}`, ok: true }, { h: `長 ${bad1[1]}、寬 ${bad1[0]}`, ok: false }, { h: `長 ${bad2[1]}、寬 ${bad2[0]}`, ok: false }]), hint: '長和寬都要放大成同樣的倍數。' }; },
    { q: '放大圖和原圖的形狀一樣，對應角相等，對應邊成同樣的倍數。', opts: yesNo(true), hint: '這就是放大圖的意思。' }
  ]));
}
function scaleC(st) {
  quiz(st, shuffle([
    () => { const S = pick([10000, 25000, 50000, 100000]), d = rand(2, 9); return { q: `星圖的比例尺是 1：${comma(S)}，圖上 ${d} 公分，實際距離是幾公尺？`, ans: d * S / 100, unit: '公尺', hint: `實際距離 ＝ 圖上距離 × ${comma(S)}（公分），再換成公尺（÷ 100）。`, after: `${d} × ${comma(S)} ＝ ${comma(d * S)} 公分 ＝ ${comma(d * S / 100)} 公尺` }; },
    () => { const S = pick([20000, 25000, 50000]), km = pick([1, 2, 3, 4, 5]); const cm = km * 100000 / S; return Number.isInteger(cm) ? { q: `實際距離 ${km} 公里，畫在比例尺 1：${comma(S)} 的地圖上是幾公分？`, ans: cm, unit: '公分', hint: `${km} 公里 ＝ ${comma(km * 100000)} 公分，再除以 ${comma(S)}。`, after: `${comma(km * 100000)} ÷ ${comma(S)} ＝ ${cm} 公分` } : null; },
    () => { const km = pick([2, 3, 5, 10]); return { q: `地圖上 1 公分代表實際 ${km} 公里，比例尺寫成 1：□，□ 是多少？`, ans: km * 100000, hint: `${km} 公里 ＝ ${comma(km * 100000)} 公分。`, after: `比例尺 1：${comma(km * 100000)}` }; },
    () => { const per = pick([2, 5, 10]), d = rand(3, 8); return { q: `線段比例尺：每 1 公分代表 ${per} 公里。圖上兩個太空站相距 ${d} 公分，實際相距幾公里？`, vis: `<svg class="svgbox" viewBox="0 0 260 50" width="260"><line x1="10" y1="30" x2="250" y2="30" stroke="#1b2340" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => `<line x1="${10 + i * 60}" y1="22" x2="${10 + i * 60}" y2="38" stroke="#1b2340" stroke-width="2"/><text x="${10 + i * 60}" y="16" font-size="13" text-anchor="middle">${i * per}</text>`).join('')}<text x="250" y="48" font-size="12" text-anchor="end">公里</text></svg>`, eq: `${per} × ${d}`, ans: per * d, unit: '公里', hint: '每 1 公分代表的距離 × 公分數。' }; },
    () => { const S = pick([200, 500]), l = rand(4, 9), w = rand(2, l - 1); return { q: `比例尺 1：${S} 的平面圖上，長方形花園長 ${l} 公分、寬 ${w} 公分。實際的長是幾公尺？`, ans: l * S / 100, unit: '公尺', hint: `${l} × ${S} 公分，再換成公尺。`, after: `${l} × ${S} ＝ ${l * S} 公分 ＝ ${l * S / 100} 公尺` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function scaleD(st) {
  adv(st, [
    { q: '比例尺 1：50000 的地圖上，兩地相距 6 公分，實際相距幾公里？', ans: 3, unit: '公里', ex: '6 × 50000 ＝ 300000 公分 ＝ 3000 公尺 ＝ 3 公里。', trap: '1 公里 ＝ 100000 公分，單位要換對，不是 300 公里。' },
    { q: '把一個角是 60 度的三角形畫成 2 倍放大圖，這個角變成幾度？', ans: 60, unit: '度', ex: '放大圖的對應角相等，還是 60 度。', trap: '放大的是邊長，角度不會變成 120 度。' },
    { q: '甲地圖的比例尺 1：20000，乙地圖 1：50000。同樣是 1 公里的路，畫在哪一張地圖上比較長？', opts: [{ h: '甲地圖', ok: true }, { h: '乙地圖', ok: false }, { h: '一樣長', ok: false }], ex: '1 公里在甲圖是 5 公分，在乙圖是 2 公分，甲圖比較長（比例尺比較大，畫得比較詳細）。', trap: '冒號後面的數越大，圖上畫得越小。' },
    { q: '長方形長 8 公分、寬 6 公分，畫成 1/2 縮圖後，周長是幾公分？', eq: '(8 + 6) × 2 × 1/2', alt: ['(8 ÷ 2 + 6 ÷ 2) × 2', '(8 + 6) × 2 ÷ 2', '(4 + 3) × 2', '8 + 6'], ans: 14, unit: '公分', ex: '縮圖長 4、寬 3，周長 (4 ＋ 3) × 2 ＝ 14 公分；也就是原來周長 28 的 1/2。', trap: '每條邊都要縮小，不是只縮長或只縮寬。' },
    { q: '實際 750 公尺的跑道，畫在比例尺 1：5000 的圖上是幾公分？', ans: 15, unit: '公分', ex: '750 公尺 ＝ 75000 公分，75000 ÷ 5000 ＝ 15 公分。', trap: '要先把公尺換成公分再除。' }
  ]);
}

/* ===== 怎樣解題 ===== */
function solveA(st) {
  const mk = (a, b, an, bn) => { const H = rand(8, 16), x = rand(2, H - 2); return { a, b, an, bn, H, x, L: x * a + (H - x) * b }; };
  const tasks = [mk(2, 4, '外星雞', '外星兔'), mk(2, 4, '外星雞', '外星兔'), mk(3, 5, '三腳機器人', '五腳機器人')];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { a, b, an, bn, H, L } = tasks[r];
    let x = H;
    api.say(`${an}（${a} 隻腳）和${bn}（${b} 隻腳）一共 <b>${H}</b> 隻，腳一共 <b>${L}</b> 隻。調整${an}的隻數，讓腳數剛好！`);
    st.innerHTML = `${dots(r, tasks.length)}<table class="mtable cr-table"><tr><th>${an}</th><th>${bn}</th><th>腳數</th></tr><tr><td id="ca"></td><td id="cb"></td><td id="cl"></td></tr></table>
      <div class="ctl"><div class="grp">${an} <button type="button" data-d="-1">−</button><span class="v" id="vx"></span><button type="button" data-d="1">＋</button> 隻</div></div><div class="readout" id="tip"></div>
      <div class="center"><button type="button" class="btn gold" id="okb">調好了！</button></div>`;
    const draw = () => { $('#ca', st).textContent = x; $('#cb', st).textContent = H - x; $('#cl', st).textContent = x * a + (H - x) * b; $('#vx', st).textContent = x; $('#tip', st).textContent = `每把 1 隻${an}換成${bn}，腳多 ${b - a} 隻`; };
    $$('.ctl button', st).forEach(btn => btn.onclick = () => { x = Math.max(0, Math.min(H, x + +btn.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (x * a + (H - x) * b === L) { $('#okb', st).disabled = true; api.ok('剛好！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">假設全是${an}：${H} × ${a} ＝ ${H * a} 隻腳，少了 ${L - H * a} 隻，${bn} ＝ ${L - H * a} ÷ ${b - a} ＝ ${H - x} 隻</span></div>`); speak('剛好'); r++; later(round, 2800); return; }
      api.bad(x * a + (H - x) * b > L ? `腳太多了，${an}要再多一點。` : `腳太少了，${an}要再少一點。`, `${an} ${x} 隻`, `${an} ${tasks[r].x} 隻`);
    };
    draw();
  }
  round();
}
function solveB(st) {
  quiz(st, shuffle([
    () => { const s = rand(40, 120), d = rand(4, 30); if ((s + d) % 2) return null; return { q: `兩個數的和是 ${s}，差是 ${d}，<b>大</b>的數是多少？`, eq: `(${s} + ${d}) ÷ 2`, alt: [`(${s} − ${d}) ÷ 2 + ${d}`], ans: (s + d) / 2, hint: '大數 ＝（和 ＋ 差）÷ 2。' }; },
    () => { const s = rand(40, 120), d = rand(4, 30); if ((s + d) % 2) return null; return { q: `兩個數的和是 ${s}，差是 ${d}，<b>小</b>的數是多少？`, eq: `(${s} − ${d}) ÷ 2`, alt: [`(${s} + ${d}) ÷ 2 − ${d}`], ans: (s - d) / 2, hint: '小數 ＝（和 − 差）÷ 2。' }; },
    () => { const k = pick([2, 3, 4]), son = rand(8, 14), d = son * (k - 1), y = rand(2, 6), now = son - y, F0 = now + d; return now < 4 ? null : { q: `太空站站長今年 ${F0} 歲，小隊員今年 ${now} 歲。幾年後站長的年齡是隊員的 ${k} 倍？`, eq: `(${F0} − ${now}) ÷ (${k} − 1) − ${now}`, alt: [`(${F0} − ${now}) ÷ ${k - 1} − ${now}`], ans: y, unit: '年', hint: `年齡差 ${d} 歲永遠不變；那時隊員的年齡 ＝ 年齡差 ÷ (${k} − 1)。` }; },
    () => { const g = rand(8, 15), d = rand(20, 32), s = 2 * g + d; return { q: `媽媽和女兒的年齡和是 ${s} 歲，媽媽比女兒大 ${d} 歲，女兒幾歲？`, eq: `(${s} − ${d}) ÷ 2`, ans: g, unit: '歲', hint: '這是和差問題：小的 ＝（和 − 差）÷ 2。' }; },
    { q: '兩個人的年齡差，過了 10 年以後會怎樣？', opts: [{ h: '不變', ok: true }, { h: '多 10 歲', ok: false }, { h: '多 20 歲', ok: false }], hint: '兩個人都長大 10 歲，差距不變。' },
    () => { const H = rand(10, 20), x = rand(2, H - 2), L = 2 * x + 4 * (H - x); return { q: `雞和兔共 ${H} 隻，腳共 ${L} 隻，兔有幾隻？`, eq: `(${L} − ${H} × 2) ÷ 2`, alt: [`(${L} − 2 × ${H}) ÷ (4 − 2)`, `(${L} − ${H} × 2) ÷ (4 − 2)`, `(${L} ÷ 2 − ${H})`], ans: H - x, unit: '隻', hint: '假設全是雞，少掉的腳數 ÷ 2 就是兔的隻數。' }; }
  ].map(f => typeof f !== 'function' ? f : () => { let q; do { q = f(); } while (!q); return q; })));
}
function solveC(st) {
  quiz(st, shuffle([
    () => { const a = rand(80, 90), n = 4, x = a + pick([5, 10, -5, 5]); const t = a * n + x; return t % (n + 1) ? null : { q: `前 ${n} 次測驗平均 ${a} 分，第 ${n + 1} 次考 ${x} 分，${n + 1} 次的平均是幾分？`, eq: `(${a} × ${n} + ${x}) ÷ ${n + 1}`, ans: t / (n + 1), unit: '分', hint: '先求總分，再除以次數。' }; },
    () => { const a = rand(80, 88), n = 5, b = a + 2, x = b * (n + 1) - a * n; return x > 100 ? null : { q: `前 ${n} 次平均 ${a} 分，第 ${n + 1} 次要考幾分，${n + 1} 次的平均才會是 ${b} 分？`, eq: `${b} × ${n + 1} − ${a} × ${n}`, ans: x, unit: '分', hint: `${n + 1} 次的總分 − 前 ${n} 次的總分。` }; },
    () => { const s = rand(3, 5), p = rand(2, 4); return { q: `太空衣有 ${s} 種上衣、${p} 種褲子，一件上衣配一件褲子，有幾種穿法？`, eq: `${s} × ${p}`, ans: s * p, unit: '種', hint: '每件上衣都可以配每一件褲子。' }; },
    () => { const n = rand(4, 7); return { q: `${n} 位太空人，每兩人都要握手一次，一共握手幾次？`, ans: n * (n - 1) / 2, unit: '次', hint: `第 1 人和其他 ${n - 1} 人握手，第 2 人再和剩下的 ${n - 2} 人……`, after: `${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' ＋ ')} ＝ ${n * (n - 1) / 2} 次` }; },
    () => { const n = rand(5, 9); return { q: `把能量罐疊成三角形：最上層 1 罐，每往下一層多 1 罐，共 ${n} 層，一共幾罐？`, ans: n * (n + 1) / 2, unit: '罐', hint: `1 ＋ 2 ＋ 3 ＋ …… ＋ ${n}。`, after: `1 ＋ 2 ＋ …… ＋ ${n} ＝ ${n * (n + 1) / 2} 罐` }; },
    () => { const v = [rand(30, 50), rand(30, 50), rand(30, 50)], t = v.reduce((a, b) => a + b, 0); return t % 3 ? null : { q: `三艘補給船分別載了 ${v.join('、')} 箱，平均每艘載幾箱？`, eq: `(${v.join(' + ')}) ÷ 3`, ans: t / 3, unit: '箱', hint: '平均 ＝ 總數 ÷ 個數。' }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function solveD(st) {
  adv(st, [
    { q: '雞兔同籠，共 20 隻，腳共 56 隻，雞有幾隻？', ans: 12, unit: '隻', ex: '假設全是兔：20 × 4 ＝ 80 隻腳，多了 80 − 56 ＝ 24 隻；每隻雞少 2 隻腳，雞 ＝ 24 ÷ 2 ＝ 12 隻（兔 8 隻）。', trap: '題目問的是雞，不是兔；算完要確認問的是哪一個。' },
    { q: '爸爸今年 42 歲，女兒 10 歲。幾年前爸爸的年齡是女兒的 5 倍？', eq: '10 − (42 − 10) ÷ (5 − 1)', alt: ['10 − (42 − 10) ÷ 4', '10 − 32 ÷ 4'], ans: 2, unit: '年', ex: '年齡差 32 歲不變，那時女兒 32 ÷ (5 − 1) ＝ 8 歲，10 − 8 ＝ 2 年前。', trap: '「幾年前」要用現在的年齡減，不是加。' },
    { q: '5 次測驗平均 84 分，去掉最低的一次後，4 次平均 88 分。最低的一次是幾分？', eq: '84 × 5 − 88 × 4', ans: 68, unit: '分', ex: '5 次總分 420，4 次總分 352，最低 420 − 352 ＝ 68 分。', trap: '要用總分相減，不是平均相減（88 − 84 ＝ 4 是錯的）。' },
    { q: '甲、乙兩數的和是 100，甲比乙多 18，甲是多少？', eq: '(100 + 18) ÷ 2', alt: ['(100 − 18) ÷ 2 + 18'], ans: 59, ex: '甲 ＝ (100 ＋ 18) ÷ 2 ＝ 59，乙 ＝ 41。', trap: '大數是 (和 ＋ 差) ÷ 2，不是 (和 − 差) ÷ 2。' },
    { q: '從 5 位太空人中選 2 位出任務（不分先後），有幾種選法？', ans: 10, unit: '種', ex: '甲可以配乙丙丁戊 4 種，乙再配丙丁戊 3 種……4 ＋ 3 ＋ 2 ＋ 1 ＝ 10 種。', trap: '甲乙和乙甲是同一組，不能算成 5 × 4 ＝ 20。' }
  ]);
}

/* ===== 相遇、追趕與流水 ===== */
function trackSVG(D, p1, p2, s1 = '🚀', s2 = '🛸') {
  const W = 340, x = d => 20 + d / D * (W - 40);
  return `<svg class="svgbox track" viewBox="0 0 ${W} 90" width="${W}"><line x1="20" y1="60" x2="${W - 20}" y2="60" stroke="#9fb0e8" stroke-width="6" stroke-linecap="round"/>
    <text x="20" y="84" font-size="12" text-anchor="middle">A 站</text><text x="${W - 20}" y="84" font-size="12" text-anchor="middle">B 站</text>
    <text x="${x(p1)}" y="48" font-size="26" text-anchor="middle">${s1}</text><text x="${x(p2)}" y="${Math.abs(p1 - p2) < D * 0.06 ? 30 : 48}" font-size="26" text-anchor="middle">${s2}</text></svg>`;
}
function chaseA(st) {
  const mk = kind => { if (kind === 'meet') { const v1 = rand(3, 8) * 10, v2 = rand(3, 8) * 10, t = rand(4, 12); return { kind, v1, v2, t, D: (v1 + v2) * t }; } const v2 = rand(4, 7) * 10, v1 = v2 + rand(2, 4) * 10, t = rand(5, 12); return { kind, v1, v2, t, D: (v1 - v2) * t }; };
  const tasks = [mk('meet'), mk('meet'), mk('chase')];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { kind, v1, v2, t, D } = tasks[r]; let m = 0;
    const meet = kind === 'meet', L = meet ? D : D + v1 * t + 40;
    api.say(meet ? `兩艘飛船相距 <b>${D}</b> 公里，同時相向飛行，🚀 分速 <b>${v1}</b> 公里、🛸 分速 <b>${v2}</b> 公里。按時間鍵，看看幾分鐘後相遇！` : `🛸 在 🚀 前面 <b>${D}</b> 公里，同時同方向飛，🚀 分速 <b>${v1}</b> 公里、🛸 分速 <b>${v2}</b> 公里。幾分鐘後 🚀 追上？`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="trk"></div><div class="readout" id="info"></div>
      <div class="ctl"><div class="grp"><button type="button" data-d="-1">−1 分</button><span class="v" id="vm">0</span> 分<button type="button" data-d="1">＋1 分</button></div></div>
      <div class="center"><button type="button" class="btn gold" id="okb">碰到了！</button></div>`;
    const pos = () => meet ? [v1 * m, D - v2 * m] : [v1 * m, D + v2 * m];
    const draw = () => { const [a, b] = pos(); $('#trk', st).innerHTML = trackSVG(L, Math.min(a, L), Math.min(b, L)); $('#vm', st).textContent = m; $('#info', st).textContent = meet ? `已經飛了 ${v1 + v2} × ${m} ＝ ${(v1 + v2) * m} 公里，還差 ${Math.max(0, D - (v1 + v2) * m)} 公里` : `每分鐘拉近 ${v1 - v2} 公里，還差 ${Math.max(0, D - (v1 - v2) * m)} 公里`; };
    $$('.ctl button', st).forEach(btn => btn.onclick = () => { m = Math.max(0, Math.min(30, m + +btn.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (m === t) { $('#okb', st).disabled = true; api.ok(meet ? '相遇了！' : '追上了！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">${meet ? `相遇時間 ＝ 距離 ÷ 速率和 ＝ ${D} ÷ (${v1} ＋ ${v2}) ＝ ${t} 分` : `追上時間 ＝ 距離差 ÷ 速率差 ＝ ${D} ÷ (${v1} − ${v2}) ＝ ${t} 分`}</span></div>`); speak(`${t}分鐘`); r++; later(round, 2800); return; }
      api.bad(m < t ? '還沒碰到，再多飛幾分鐘。' : '已經超過了，往回調一點。', `${m} 分`, `${t} 分`);
    };
    draw();
  }
  round();
}
function chaseB(st) {
  quiz(st, shuffle([
    () => { const v1 = rand(4, 9) * 10, v2 = rand(4, 9) * 10, t = rand(2, 8); return { q: `甲、乙兩艘飛船從相距 ${(v1 + v2) * t} 公里的兩站同時相向出發，甲時速 ${v1} 公里、乙時速 ${v2} 公里，幾小時後相遇？`, eq: `${(v1 + v2) * t} ÷ (${v1} + ${v2})`, ans: t, unit: '小時', hint: '相遇時間 ＝ 距離 ÷ 兩船速率和。' }; },
    () => { const v1 = rand(50, 90), v2 = rand(40, 80), t = rand(2, 5); return { q: `兩艘飛船從同一站同時往相反方向飛，時速分別是 ${v1} 公里和 ${v2} 公里，${t} 小時後相距幾公里？`, eq: `(${v1} + ${v2}) × ${t}`, alt: [`${v1} × ${t} + ${v2} × ${t}`], ans: (v1 + v2) * t, unit: '公里', hint: '相離：每小時拉開兩船速率的和。' }; },
    () => { const v1 = rand(60, 80), v2 = rand(50, 70), t = rand(3, 6), D = (v1 + v2) * t + rand(1, 9) * 10; return { q: `兩站相距 ${D} 公尺，甲、乙同時相向走，甲分速 ${v1} 公尺、乙分速 ${v2} 公尺，${t} 分鐘後兩人還相距幾公尺？`, eq: `${D} − (${v1} + ${v2}) × ${t}`, alt: [`${D} − ${v1} × ${t} − ${v2} × ${t}`], ans: D - (v1 + v2) * t, unit: '公尺', hint: `先算 ${t} 分鐘兩人一共走了多少。` }; },
    () => { const v1 = rand(5, 9) * 10, t = rand(3, 6), v2 = rand(4, 8) * 10, D = (v1 + v2) * t; return { q: `甲、乙兩人從相距 ${D} 公尺的兩地相向而行，${t} 分鐘相遇。甲分速 ${v1} 公尺，乙分速多少公尺？`, eq: `${D} ÷ ${t} − ${v1}`, alt: [`(${D} − ${v1} × ${t}) ÷ ${t}`], ans: v2, unit: '公尺', hint: '先求速率和 ＝ 距離 ÷ 時間，再減掉甲。' }; },
    { q: '兩人相向而行時，每一分鐘兩人的距離會減少多少？', opts: [{ h: '兩人分速的和', ok: true }, { h: '兩人分速的差', ok: false }, { h: '比較快那個人的分速', ok: false }], hint: '兩人都在往對方靠近。' }
  ]));
}
function chaseC(st) {
  quiz(st, shuffle([
    () => { const v2 = rand(5, 8) * 10, v1 = v2 + rand(2, 4) * 10, t = rand(4, 12); return { q: `${(v1 - v2) * t} 公尺前方有一艘補給艇（分速 ${v2} 公尺），巡邏艇分速 ${v1} 公尺同方向追，幾分鐘追上？`, eq: `${(v1 - v2) * t} ÷ (${v1} − ${v2})`, ans: t, unit: '分', hint: '追上時間 ＝ 距離差 ÷ 速率差。' }; },
    () => { const a = pick([50, 60, 70]), b = a + pick([20, 30, 40]), m = pick([6, 8, 10, 12]); const t = a * m / (b - a); return Number.isInteger(t) ? { q: `弟弟先出發 ${m} 分鐘（分速 ${a} 公尺），哥哥再從同一地點出發（分速 ${b} 公尺）同方向追，哥哥幾分鐘追上弟弟？`, eq: `${a} × ${m} ÷ (${b} − ${a})`, ans: t, unit: '分', hint: `先算弟弟先走了多遠：${a} × ${m}。` } : null; },
    () => { const s = rand(15, 30), w = rand(2, 5), t = rand(2, 5); return { q: `船在靜水中時速 ${s} 公里，水流時速 ${w} 公里，<b>順水</b>航行 ${t} 小時，走幾公里？`, eq: `(${s} + ${w}) × ${t}`, alt: [`${s} × ${t} + ${w} × ${t}`], ans: (s + w) * t, unit: '公里', hint: '順水速率 ＝ 船速 ＋ 水速。' }; },
    () => { const s = rand(15, 30), w = rand(2, 5), t = rand(2, 6); return { q: `船在靜水中時速 ${s} 公里，水流時速 ${w} 公里，<b>逆水</b>航行 ${(s - w) * t} 公里，要幾小時？`, eq: `${(s - w) * t} ÷ (${s} − ${w})`, ans: t, unit: '小時', hint: '逆水速率 ＝ 船速 − 水速。' }; },
    () => { const s = rand(12, 25), w = rand(2, 5); return { q: `一艘船順水時速 ${s + w} 公里，逆水時速 ${s - w} 公里，船在靜水中的時速是幾公里？`, eq: `(${s + w} + ${s - w}) ÷ 2`, alt: [`(${s + w} − ${s - w}) ÷ 2 + ${s - w}`], ans: s, unit: '公里', hint: '船速 ＝（順水速率 ＋ 逆水速率）÷ 2。' }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function chaseD(st) {
  adv(st, [
    { q: '甲、乙相距 1800 公尺相向而行，甲分速 70 公尺、乙分速 50 公尺。乙先走 6 分鐘後甲才出發，甲出發幾分鐘後相遇？', eq: '(1800 − 50 × 6) ÷ (70 + 50)', alt: ['(1800 − 300) ÷ 120'], ans: 12.5, unit: '分', ex: '乙先走 50 × 6 ＝ 300 公尺，剩 1500 公尺，1500 ÷ (70 ＋ 50) ＝ 12.5 分鐘。', trap: '要先扣掉乙先走的距離，剩下的才是兩人一起走。' },
    { q: '哥哥分速 80 公尺，弟弟分速 60 公尺，弟弟先走 300 公尺，哥哥同方向追，追上時哥哥走了幾公尺？', eq: '300 ÷ (80 − 60) × 80', alt: ['80 × (300 ÷ (80 − 60))', '80 × 15'], ans: 1200, unit: '公尺', ex: '追上時間 300 ÷ 20 ＝ 15 分，哥哥走 80 × 15 ＝ 1200 公尺。', trap: '題目問的是哥哥走的距離，不是追上的時間。' },
    { q: '船速時速 20 公里，水速時速 4 公里，從 A 順流到 B 要 3 小時，從 B 逆流回 A 要幾小時？', eq: '(20 + 4) × 3 ÷ (20 − 4)', ans: 4.5, unit: '小時', ex: '距離 ＝ (20 ＋ 4) × 3 ＝ 72 公里，逆流 72 ÷ (20 − 4) ＝ 4.5 小時。', trap: '回程是逆流，速率要用船速減水速。' },
    { q: '兩人在 400 公尺的環形跑道同一地點、同時同方向跑，甲分速 250 公尺、乙分速 210 公尺，甲第一次追上乙要幾分鐘？', eq: '400 ÷ (250 − 210)', ans: 10, unit: '分', ex: '甲要比乙多跑一圈 400 公尺：400 ÷ (250 − 210) ＝ 10 分鐘。', trap: '同地點同時出發，要多跑一整圈才算追上。' },
    { q: '相遇問題和追趕問題，分別用速率的什麼來算？', opts: [{ h: '相遇用速率和，追趕用速率差', ok: true }, { h: '相遇用速率差，追趕用速率和', ok: false }, { h: '都用速率和', ok: false }, { h: '都用速率差', ok: false }], ex: '相向而行，距離每分鐘縮短兩人速率的和；同向追趕，每分鐘拉近兩人速率的差。', trap: '方向不同，用的不一樣。' }
  ]);
}

Object.assign(LEVELS, {
  scale: [scaleA, scaleB, scaleC, scaleD],
  solve: [solveA, solveB, solveC, solveD],
  chase: [chaseA, chaseB, chaseC, chaseD]
});
