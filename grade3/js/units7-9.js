'use strict';
/* 第 7 單元 公升和毫升 ／ 第 8 單元 分數 ／ 第 9 單元 圓 */

const lText = ml => ml % 1000 === 0 ? `${ml / 1000} 公升` : ml < 1000 ? `${ml} 毫升` : `${Math.floor(ml / 1000)} 公升 ${ml % 1000} 毫升`;

/* ===== 7-A 量杯倒水 ===== */
function u7A(st) {
  const nz50 = () => { let v; do { v = rand(11, 49) * 10; } while (v % 50 === 0); return v; };
  const rounds = [
    { cap: 500, step: 50, label: 100, t: rand(2, 9) * 50 },
    { cap: 1000, step: 50, label: 100, t: rand(11, 19) * 50 },
    { cap: 1000, step: 100, label: 200, t: 1000, say: '1 公升' },
    { cap: 500, step: 10, label: 50, t: nz50() }
  ];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r]; let ml = 0;
    const ask = R.say || `${R.t} 毫升`;
    api.say(`拖曳藍色的水面（或按按鈕），倒出 <b class="big">${ask}</b> 的水。`, `倒出 ${ask} 的水`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="center" id="cw"></div><div class="readout" id="rd"></div>
      <div class="center"><button type="button" class="btn ghost" id="dn">▼ ${R.step} 毫升</button> <button type="button" class="btn ghost" id="up">▲ ${R.step} 毫升</button> <button type="button" class="btn mint" id="okb">好了！</button></div>`;
    const draw = () => { $('#cw', st).innerHTML = cupSVG(R.cap, ml, R.step, { label: R.label, handle: true }); $('#rd', st).innerHTML = `水量：<b>${ml}</b> 毫升`; bind(); };
    const set = v => { ml = Math.max(0, Math.min(R.cap, Math.round(v / R.step) * R.step)); draw(); };
    let drag = false;
    function bind() {
      const svg = $('.mcup', st);
      const toML = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return (230 - q.y) / 210 * R.cap; };
      svg.style.touchAction = 'none';
      svg.onpointerdown = e => { e.preventDefault(); drag = true; upd(toML(e)); };
      svg.onpointermove = e => { if (drag) upd(toML(e)); };
      const upd = v => {
        ml = Math.max(0, Math.min(R.cap, Math.round(v / R.step) * R.step));
        const y = 230 - ml / R.cap * 210, rect = $('rect', svg), h = $('.handle', svg);
        rect.setAttribute('y', y); rect.setAttribute('height', 230 - y); h.setAttribute('y', y - 8);
        $('#rd', st).innerHTML = `水量：<b>${ml}</b> 毫升`;
      };
    }
    const stop = () => { if (drag) sfx('tap'); drag = false; };
    st.addEventListener('pointerup', stop); st.addEventListener('pointercancel', stop);
    $('#up', st).onclick = () => { sfx('tap'); set(ml + R.step); };
    $('#dn', st).onclick = () => { sfx('tap'); set(ml - R.step); };
    $('#okb', st).onclick = () => {
      if (ml === R.t) { api.ok(`對！${R.t} 毫升${R.t === 1000 ? ' = 1 公升' : ''}`); speak(`答對了，${ask}`); r++; later(round, 1700); }
      else api.bad(`${ml > R.t ? '太多了' : '太少了'}！看清楚一小格是 ${R.step} 毫升${R.t === 1000 ? '，1 公升 = 1000 毫升' : ''}。`);
    };
    draw();
  }
  round();
}

/* ===== 7-B 公升和毫升的換算與比較 ===== */
function u7B(st) {
  const rounds = [
    { q: '1 公升是幾毫升？', ans: 1000, unit: '毫升', hint: '1 公升 = 1000 毫升', after: '1 公升 = 1000 毫升' },
    () => { const L = rand(1, 5), m = rand(1, 9) * 100; return { q: `${L} 公升 ${m} 毫升是幾毫升？`, ans: L * 1000 + m, unit: '毫升', hint: `${L} 公升是 ${L * 1000} 毫升，再加 ${m}`, after: `${L * 1000} + ${m} = ${L * 1000 + m}（毫升）` }; },
    () => { const L = rand(2, 6), m = pick([50, 80, 250, 400, 650, 900]), v = L * 1000 + m; return { q: `${v} 毫升是 ${L} 公升又幾毫升？`, ans: m, unit: '毫升', hint: `${L * 1000} 毫升是 ${L} 公升，剩下的呢？`, after: `${v} 毫升 = ${lText(v)}` }; },
    () => { const L = rand(1, 3), b = L * 1000 + pick([-50, -10, 20, 100]); return { q: `${L} 公升 ○ ${b} 毫升`, vis: `<span class="eq sm">${L} 公升 <span class="box">?</span> ${b} 毫升</span>`, keep: true, opts: [{ h: '＞', ok: L * 1000 > b }, { h: '＝', ok: false }, { h: '＜', ok: L * 1000 < b }], hint: `${L} 公升 = ${L * 1000} 毫升，再比！`, after: `${L * 1000} 毫升 ${L * 1000 > b ? '＞' : '＜'} ${b} 毫升` }; },
    () => { const v = rand(3, 9) * 50 + 300; return { q: '量杯裡有幾毫升的水？', vis: cupSVG(1000, v, 50, { label: 100 }), ans: v, unit: '毫升', hint: '一小格是 50 毫升，先找最近的整百！', after: `${v} 毫升` }; },
    () => pick([
      { q: '一瓶養樂多大約裝多少？', keep: true, opts: [{ h: '100 毫升', ok: true }, { h: '100 公升', ok: false }], hint: '養樂多瓶子很小喔！' },
      { q: '家裡的浴缸大約可以裝多少水？', keep: true, opts: [{ h: '200 毫升', ok: false }, { h: '200 公升', ok: true }], hint: '浴缸很大，可以裝很多很多水。' },
      { q: '一小匙藥水大約多少？', keep: true, opts: [{ h: '5 毫升', ok: true }, { h: '5 公升', ok: false }], hint: '一小匙很少！' }
    ])
  ];
  quiz(st, rounds);
}

/* ===== 7-C 容量計算挑戰 ===== */
function u7C(st) {
  const rounds = [
    () => { const m = rand(1, 9) * 50 + 100; return { q: `1 公升的果汁，倒出 ${m} 毫升，還剩幾毫升？`, vis: '<span style="font-size:56px">🧃</span>', ans: 1000 - m, unit: '毫升', hint: '1 公升 = 1000 毫升', after: `1000 − ${m} = ${1000 - m}（毫升）` }; },
    () => { const a = rand(1, 3) * 1000 + rand(1, 9) * 100, b = rand(1, 2) * 1000 + rand(1, 9) * 100; return { q: `${lText(a)} 加 ${lText(b)} 是幾毫升？`, ans: a + b, unit: '毫升', hint: '都換成毫升再加！', after: `${a} + ${b} = ${a + b}（毫升）= ${lText(a + b)}` }; },
    () => { const v = rand(3, 9) * 100 + 50 * rand(0, 1), n = rand(2, 4); return { q: `一瓶水 ${v} 毫升，${n} 瓶一共幾毫升？`, vis: pics('🍼', n, true), ans: v * n, unit: '毫升', hint: `${v} × ${n}`, after: `${v} × ${n} = ${v * n}（毫升）= ${lText(v * n)}` }; },
    () => { const big = rand(2, 4) * 1000, small = rand(3, 9) * 100 + 50; return { q: `大桶有 ${big / 1000} 公升水，小桶有 ${small} 毫升，大桶比小桶多幾毫升？`, vis: '<span style="font-size:56px">🪣</span>', ans: big - small, unit: '毫升', hint: `${big / 1000} 公升 = ${big} 毫升`, after: `${big} − ${small} = ${big - small}（毫升）` }; },
    () => { const c = pick([200, 250]), n = 1000 / c; return { q: `1 公升的牛奶，每杯倒 ${c} 毫升，可以剛好倒滿幾杯？`, vis: '<span style="font-size:56px">🥛</span>', ans: n, unit: '杯', hint: `${c} 毫升加幾次會是 1000 毫升？`, after: `${c} × ${n} = 1000，可以倒 ${n} 杯` }; }
  ];
  quiz(st, rounds);
}

/* ===== 8-A 分數塗一塗 ===== */
function u8A(st) {
  const rounds = [
    { t: 'pizza', d: pick([4, 6]) }, { t: 'bar', d: pick([5, 7]) }, { t: 'pizza', d: 8 }, { t: 'bar', d: pick([9, 10, 12]) }
  ].map(o => ({ ...o, n: rand(1, o.d - 1) }));
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r], on = new Set();
    api.say(`點一點，塗出 <b class="big">${F(R.n, R.d)}</b> ${R.t === 'pizza' ? '個披薩' : '條'}。`, `塗出 ${fracText(R.n, R.d)}`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="qvis" id="fv">${R.t === 'pizza' ? pizzaSVG(R.d, 0, 220, 'play') : `<div class="fbars"><div class="fline">${fracBar(R.d, 0, 'play')}</div></div>`}</div>
      <div class="readout" id="rd"></div><div class="center"><button type="button" class="btn mint" id="okb">好了！</button></div>`;
    const show = () => { $('#rd', st).innerHTML = `塗了 <b>${on.size}</b> 份，一共 ${R.d} 份`; };
    $$('[data-k]', $('#fv', st)).forEach(el => el.addEventListener('click', () => {
      const k = el.dataset.k; sfx('tap');
      if (on.has(k)) on.delete(k); else on.add(k);
      if (R.t === 'pizza') el.setAttribute('fill', on.has(k) ? '#ffc93c' : '#fff'); else el.classList.toggle('on', on.has(k));
      show();
    }));
    $('#okb', st).onclick = () => {
      if (on.size === R.n) { api.ok(`對！${R.d} 等分中的 ${R.n} 份`); speak(`答對了，${fracText(R.n, R.d)}`); r++; later(round, 1700); }
      else api.bad(`${fracText(R.n, R.d)}：分母 ${R.d} 是分成 ${R.d} 等分，分子 ${R.n} 是要塗 ${R.n} 份！`);
    };
    show();
  }
  round();
}

/* ===== 8-B 幾分之幾 ===== */
function u8B(st) {
  const fopt = (n, d, alts) => [{ h: F(n, d), ok: true }, ...alts.filter(([a, b]) => !(a === n && b === d) && a > 0 && a < b).slice(0, 2).map(([a, b]) => ({ h: F(a, b), ok: false }))];
  const rounds = [
    () => { const d = pick([3, 4, 6, 8]), n = rand(1, d - 1); return { q: '塗色的部分是幾分之幾個披薩？', vis: pizzaSVG(d, n, 150), opts: fopt(n, d, [[d - n, d], [n, d + 1], [n + 1, d], [n - 1, d]]), hint: `分成 ${d} 等分，塗了 ${n} 份。`, after: `${fracText(n, d)}` }; },
    () => { const d = rand(5, 12), n = rand(1, d - 1); return { q: '塗色的部分是幾分之幾條？', vis: `<div class="fbars"><div class="fline">${fracBar(d, n)}</div></div>`, opts: fopt(n, d, [[d - n, d], [n, d - 1], [n + 1, d], [n, d + 1], [n - 1, d]]), hint: `數一數一共幾格、塗了幾格。`, after: fracText(n, d) }; },
    () => { const d = rand(5, 12), n = rand(1, d - 1); return { q: `「${fracText(n, d)}」怎麼寫？`, opts: fopt(n, d, [[n, d + 2], [d - n, d], [n + 1, d], [n - 1, d]]), hint: `分母 ${d} 寫在下面，分子 ${n} 寫在上面。` }; },
    () => { const d = rand(5, 9), n = rand(2, d - 1); return { q: `${F(n, d)} 的分母是多少？`, sp: `${fracText(n, d)}的分母是多少？`, pad: true, opts: numpadOpts(d, 0, 12).slice(1), hint: '分母在分數線的下面，表示分成幾等分。', after: `分母是 ${d}，分子是 ${n}` }; },
    { q: '哪一個圖的塗色部分是 1/3？', sp: '哪一個圖的塗色部分是三分之一？', opts: [{ h: pizzaSVG(3, 1, 90), ok: true }, { h: pizzaSVG(4, 1, 90), ok: false }, { h: `<svg viewBox="0 0 150 150" style="width:90px;height:90px"><circle cx="75" cy="75" r="66" fill="#fff" stroke="#ff9a4d" stroke-width="3"/><path d="M75 75 L75 9 A66 66 0 0 1 141 75 Z" fill="#ffc93c" stroke="#ff9a4d" stroke-width="3"/><line x1="75" y1="75" x2="17" y2="108" stroke="#ff9a4d" stroke-width="3"/></svg>`, ok: false }], hint: '要分成 3 份而且每份一樣大（等分）才是三分之一！' },
    () => { const d = pick([4, 5, 6, 8]); return { q: `一個蛋糕平分成 ${d} 塊，吃掉 1 塊，吃掉幾分之幾個？`, vis: pizzaSVG(d, 1, 130), opts: fopt(1, d, [[d - 1, d], [1, d + 1], [1, d - 1]]), hint: `${d} 等分中的 1 份。`, after: `吃掉 ${fracText(1, d)} 個` }; }
  ];
  quiz(st, rounds);
}

/* ===== 8-C 單位分數的累加 ===== */
function u8C(st) {
  const rounds = [
    () => { const d = rand(5, 12), n = rand(2, d - 1); return { q: `${n} 個 ${F(1, d)} 是多少？`, sp: `${n} 個${fracText(1, d)}是多少？`, vis: `<div class="fbars"><div class="fline">${fracBar(d, n)}</div></div>`, opts: [{ h: F(n, d), ok: true }, { h: F(1, d * n > 12 ? d + 1 : d * n), ok: false }, { h: F(n, d + n), ok: false }], hint: `一份一份累加：${n} 個 ${fracText(1, d)} 是${fracText(n, d)}。`, after: fracText(n, d) }; },
    () => { const d = rand(5, 12), n = rand(2, d - 1); return { q: `${F(n, d)} 是幾個 ${F(1, d)}？`, sp: `${fracText(n, d)}是幾個${fracText(1, d)}？`, pad: true, opts: numpadOpts(n, 0, 12), hint: '看分子！', after: `${n} 個 ${fracText(1, d)}` }; },
    () => { const d = rand(3, 10); return { q: `幾個 ${F(1, d)} 合起來是 1 個？`, sp: `幾個${fracText(1, d)}合起來是 1 個？`, vis: pizzaSVG(d, d, 120), pad: true, opts: numpadOpts(d, 0, 12), hint: `分成 ${d} 等分，${d} 份就是全部。`, after: `${d} 個 ${fracText(1, d)} = ${fracText(d, d)} = 1` }; },
    () => { const d = rand(5, 9), a = rand(1, 3), b = rand(1, d - a - 1); return { q: `${F(a, d)} 再加上 ${b} 個 ${F(1, d)} 是多少？`, sp: `${fracText(a, d)}再加上 ${b} 個${fracText(1, d)}是多少？`, opts: [{ h: F(a + b, d), ok: true }, { h: F(a + b, d + d), ok: false }, { h: F(a + b + 1, d), ok: false }], hint: `${a} 個加 ${b} 個 ${fracText(1, d)}，一共 ${a + b} 個。`, after: fracText(a + b, d) }; },
    () => { const d = rand(6, 12), a = rand(1, d - 1); let b; do { b = rand(1, d - 1); } while (b === a); return { q: `${F(a, d)} ○ ${F(b, d)}`, sp: `${fracText(a, d)}和${fracText(b, d)}，哪個比較大？`, vis: `<div class="fbars"><div class="fline">${fracBar(d, a)}</div><div class="fline">${fracBar(d, b)}</div></div>`, keep: true, opts: [{ h: '＞', ok: a > b }, { h: '＜', ok: a < b }], hint: '分母一樣，看有幾個單位分數（分子）！' }; },
    () => { const d = rand(4, 8); return { q: `${F(d, d)} 和 1 一樣大嗎？`, sp: `${fracText(d, d)}和 1 一樣大嗎？`, vis: pizzaSVG(d, d, 120), keep: true, opts: [{ h: '一樣大', ok: true }, { h: '比 1 大', ok: false }, { h: '比 1 小', ok: false }], hint: `${d} 等分全部塗滿，就是一整個！`, after: `${fracText(d, d)} = 1` }; }
  ];
  quiz(st, rounds);
}

/* ===== 9-A 圓規畫圓：在尺上把圓規張開 ===== */
function u9A(st) {
  const rounds = [
    { r: rand(2, 4) * 10, ask: v => `半徑 ${v / 10} 公分` },
    { r: rand(3, 5) * 10, ask: v => `直徑 ${v / 5} 公分`, dia: true },
    { r: rand(2, 4) * 10 + 5, ask: v => `半徑 ${cmText(v)}` },
    { r: rand(2, 4) * 10, ask: v => `直徑 ${v / 5} 公分`, dia: true }
  ];
  let i = 0;
  function round() {
    if (i >= rounds.length) return api.finish();
    const R = rounds[i], ask = R.ask(R.r);
    api.say(`要畫一個 <b class="big">${ask}</b> 的圓，圓規要張開多長？拖曳粉紅色的筆腳。`, `要畫一個${ask}的圓，圓規要張開多長？`);
    st.innerHTML = `${dots(i, rounds.length)}<div class="center" style="font-size:48px">🧭</div><div id="rb"></div><div id="cv" class="center"></div>`;
    rulerDraw($('#rb', st), 8, mm => {
      if (mm === R.r) {
        api.ok(`對！張開 ${cmText(R.r)}`); speak(`答對了，圓規張開 ${cmText(R.r)}`);
        const px = R.r * 1.6;
        $('#cv', st).innerHTML = `<svg class="circ" viewBox="0 0 220 220" style="width:200px"><circle cx="110" cy="110" r="${px}" fill="#fff8dd" stroke="#ff7eb3" stroke-width="4" stroke-dasharray="${2 * Math.PI * px}" stroke-dashoffset="${2 * Math.PI * px}" style="animation:drawc 1.2s forwards"/><line x1="110" y1="110" x2="${110 + px}" y2="110" stroke="#5bb4ff" stroke-width="3"/><circle cx="110" cy="110" r="4" fill="#4a3b5c"/></svg>`;
        i++; later(round, 2200);
      } else api.bad(R.dia ? `圓規張開的長度是半徑，直徑是半徑的 2 倍喔！` : `圓規兩腳張開的長度就是半徑，再看清楚刻度！`);
    });
  }
  round();
}

/* ===== 9-B 圓心、半徑和直徑：點一點 ===== */
function u9B(st) {
  const tasks = shuffle([
    { ask: '半徑', sp: '點出半徑', segs: [{ k: 'r', a: rand(20, 70), id: 'ok' }, { k: 'chord', a: 200, id: 'no1', c: '#a98bff' }, { k: 'out', a: 300, id: 'no2', c: '#3fcf9c' }], hint: '半徑：從圓心到圓周上的線段。' },
    { ask: '直徑', sp: '點出直徑', segs: [{ k: 'd', a: rand(10, 60), id: 'ok' }, { k: 'chord', a: 230, span: 120, id: 'no1', c: '#a98bff' }, { k: 'r', a: 140, id: 'no2', c: '#3fcf9c' }], hint: '直徑：通過圓心，兩端都在圓周上的線段。' },
    { ask: '圓心', sp: '點出圓心', segs: [], pts: [{ center: true, id: 'ok' }, { a: 40, d: 45, id: 'no1' }, { on: true, a: 200, id: 'no2' }], hint: '圓心在圓的正中間，用圓規畫圓時針腳插的地方。' }
  ]);
  const quizPart = [
    () => { const r = rand(2, 9); return { q: `圓的半徑是 ${r} 公分，直徑是幾公分？`, ans: r * 2, unit: '公分', hint: '直徑是半徑的 2 倍！', after: `${r} × 2 = ${r * 2}（公分）` }; },
    () => { const r = rand(2, 9); return { q: `圓的直徑是 ${r * 2} 公分，半徑是幾公分？`, ans: r, unit: '公分', hint: '半徑是直徑的一半！', after: `${r * 2} 的一半是 ${r}（公分）` }; }
  ];
  let i = 0;
  const total = tasks.length + quizPart.length;
  function next() {
    if (i < tasks.length) {
      const T = tasks[i];
      api.say(`點出圓的<b class="big">${T.ask}</b>。`, T.sp);
      st.innerHTML = `${dots(i, total)}<div class="center">${circleSVG(T.segs, { pts: (T.pts || []).map(p => ({ ...p, c: '#e5508f' })), noCenter: !!T.pts })}</div>`;
      let done = false;
      $$('.seg', st).forEach(g => g.addEventListener('click', () => {
        if (done) return;
        if (g.dataset.id === 'ok') { done = true; api.ok(`對！這是${T.ask}`); speak(`答對了，這是${T.ask}`); g.classList.add('hit'); i++; later(next, 1500); }
        else api.bad(T.hint);
      }));
      return;
    }
    const k = i - tasks.length;
    if (k >= quizPart.length) return api.finish();
    const R = quizPart[k]();
    st.innerHTML = `${dots(i, total)}<div class="qvis">${circleSVG([{ k: 'r', a: 30, t: '半徑' }, { k: 'd', a: 200 }])}</div><div class="kwrap"></div>`;
    api.say(R.q);
    keypad($('.kwrap', st), R.ans, () => { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${R.after}</div>`); speak(R.after); i++; later(next, 2000); }, R.hint, R.unit);
  }
  next();
}

/* ===== 9-C 圓的挑戰 ===== */
function u9C(st) {
  const rounds = [
    { q: '圓裡面<b>最長</b>的線段是什麼？', sp: '圓裡面最長的線段是什麼？', keep: true, opts: [{ h: '直徑', ok: true }, { h: '半徑', ok: false }, { h: '不一定', ok: false }], hint: '通過圓心、兩端在圓周上的線段最長。' },
    { q: '同一個圓，可以畫出幾條半徑？', keep: true, opts: [{ h: '1 條', ok: false }, { h: '2 條', ok: false }, { h: '很多很多條（畫不完）', ok: true }], hint: '從圓心往四面八方都可以畫到圓周！', after: '同一個圓的半徑都一樣長，可以畫無數條' },
    () => { const r = rand(2, 5), n = 3; return { q: `${n} 個半徑 ${r} 公分的圓排成一排，剛好放進長方形盒子裡，盒子長幾公分？`, vis: `<svg viewBox="0 0 300 110" style="width:min(300px,90vw)"><rect x="5" y="5" width="290" height="100" rx="6" fill="#fff" stroke="#4a3b5c" stroke-width="3"/>${[0, 1, 2].map(k => `<circle cx="${55 + k * 95}" cy="55" r="47" fill="#ffe8f2" stroke="#ff7eb3" stroke-width="3"/>`).join('')}</svg>`, ans: r * 2 * n, unit: '公分', hint: `一個圓的直徑是 ${r * 2} 公分，有 ${n} 個。`, after: `${r * 2} × ${n} = ${r * 2 * n}（公分）` }; },
    () => { const r = rand(3, 8); return { q: `圓規兩腳張開 ${r} 公分畫一個圓，這個圓的直徑是幾公分？`, vis: '<span style="font-size:56px">🧭</span>', ans: r * 2, unit: '公分', hint: '張開的長度是半徑！', after: `直徑 = ${r} × 2 = ${r * 2}（公分）` }; },
    () => { const r = rand(2, 6); return { q: `一個圓的半徑是 ${r} 公分，兩條半徑合起來和什麼一樣長？`, keep: true, opts: [{ h: '直徑', ok: true }, { h: '圓周', ok: false }, { h: '圓心', ok: false }], hint: '直徑是半徑的 2 倍。', after: `${r} + ${r} = ${r * 2}（公分），就是直徑` }; },
    { q: '下面哪一個東西的形狀是圓形？', keep: true, opts: [{ h: '<span style="font-size:44px">🪙</span>', ok: true }, { h: '<span style="font-size:44px">📘</span>', ok: false }, { h: '<span style="font-size:44px">🔺</span>', ok: false }], hint: '硬幣的面是圓形的！' }
  ];
  quiz(st, rounds);
}

LEVELS.u7 = [u7A, u7B, u7C];
LEVELS.u8 = [u8A, u8B, u8C];
LEVELS.u9 = [u9A, u9B, u9C];
