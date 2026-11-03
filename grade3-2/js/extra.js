'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林三下有，南一三下沒有的內容（每單元 3 關：動手做／想一想／挑戰）
   xcircle 圓（康軒第 6 單元、翰林第 4 單元；南一在三上第 9 單元，從 grade3 的 9-A～9-C 改寫）
   xliter  公升和毫升（翰林第 2 單元「公升與毫升」；南一、康軒在三上，從 grade3 的 7-A～7-C 改寫）
   畫圖工具（尺、圓、量杯）從 grade3 draw.js 搬來，名字前面加 x，免得和本遊戲衝突。 */

const xrad = a => a * Math.PI / 180;
const XCM = 40;
const xcmText = mm => mm % 10 === 0 ? `${mm / 10} 公分` : mm < 10 ? `${mm} 毫米` : `${Math.floor(mm / 10)} 公分 ${mm % 10} 毫米`;
const xlText = ml => ml % 1000 === 0 ? `${ml / 1000} 公升` : ml < 1000 ? `${ml} 毫升` : `${Math.floor(ml / 1000)} 公升 ${ml % 1000} 毫升`;

function xRulerSVG(len, o = {}) {
  const W = len * XCM + 40;
  let s = `<svg class="xruler" viewBox="0 0 ${W} 150" style="width:min(${W * 1.1}px,94vw)">`;
  s += `<rect x="6" y="70" width="${W - 12}" height="74" rx="8" fill="#fff6c9" stroke="#d9b54a" stroke-width="3"/>`;
  for (let k = 0; k <= len * 10; k++) {
    const x = 20 + k * XCM / 10, big = k % 10 === 0, mid = k % 5 === 0;
    s += `<line x1="${x}" y1="70" x2="${x}" y2="${70 + (big ? 30 : mid ? 21 : 13)}" stroke="#12324f" stroke-width="${big ? 2.4 : 1}"/>`;
    if (big) s += `<text x="${x}" y="128" text-anchor="middle" font-size="22" font-weight="900" fill="#12324f" font-family="Arial">${k / 10}</text>`;
  }
  const x = 20 + (o.pen || 0) * XCM;
  s += `<line class="pen" x1="20" y1="52" x2="${x}" y2="52" stroke="#ff7a59" stroke-width="7" stroke-linecap="round"/>`;
  s += `<circle class="handle" cx="${x}" cy="52" r="15" fill="#ff7a59" stroke="#fff" stroke-width="4"/>`;
  return s + '</svg>';
}
/* 拖曳筆尖（或按 ◀ ▶ 1 毫米）量出長度，按「好了」呼叫 onDone(毫米) */
function xRulerDraw(box, len, onDone) {
  let mm = 0;
  box.innerHTML = `<div class="xrwrap">${xRulerSVG(len)}</div>
    <div class="readout" id="rd"></div>
    <div class="center"><button type="button" class="btn ghost" id="mmL">◀ 1 毫米</button> <button type="button" class="btn ghost" id="mmR">1 毫米 ▶</button> <button type="button" class="btn teal" id="okb">好了！</button></div>`;
  const svg = $('.xruler', box), pen = $('.pen', svg), h = $('.handle', svg);
  const set = v => { mm = Math.max(0, Math.min(len * 10, v)); const x = 20 + mm / 10 * XCM; pen.setAttribute('x2', x); h.setAttribute('cx', x); $('#rd', box).innerHTML = `圓規張開：<b>${mm ? xcmText(mm) : '0'}</b>`; };
  const toMM = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return Math.round((q.x - 20) / XCM * 10); };
  let drag = false;
  svg.addEventListener('pointerdown', e => { e.preventDefault(); drag = true; try { svg.setPointerCapture(e.pointerId); } catch (er) {} set(toMM(e)); });
  svg.addEventListener('pointermove', e => { if (drag) set(toMM(e)); });
  const end = () => { if (drag) sfx('tap'); drag = false; };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  $('#mmL', box).onclick = () => { sfx('tap'); set(mm - 1); };
  $('#mmR', box).onclick = () => { sfx('tap'); set(mm + 1); };
  $('#okb', box).onclick = () => onDone(mm);
  set(0);
}
function xCircleSVG(segs = [], o = {}) {
  const c = 110, r = 86, P = a => [c + r * Math.cos(xrad(a)), c - r * Math.sin(xrad(a))];
  let s = `<svg class="xcirc" viewBox="0 0 220 220"><circle cx="${c}" cy="${c}" r="${r}" fill="#f3fbff" stroke="#2ad1c9" stroke-width="4"/>`;
  segs.forEach(g => {
    let a, b;
    if (g.k === 'r') { a = [c, c]; b = P(g.a); }
    else if (g.k === 'd') { a = P(g.a); b = P(g.a + 180); }
    else if (g.k === 'chord') { a = P(g.a); b = P(g.a + (g.span || 110)); }
    else { a = P(g.a); b = [c + 30 * Math.cos(xrad(g.a + 70)), c - 30 * Math.sin(xrad(g.a + 70))]; }
    s += `<g class="seg" data-id="${g.id || ''}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="22" stroke-linecap="round"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${g.c || '#3aa3ff'}" stroke-width="5" stroke-linecap="round"/>${g.t ? `<text x="${(a[0] + b[0]) / 2 + 8}" y="${(a[1] + b[1]) / 2 - 8}" font-size="18" font-weight="900" fill="#12324f" font-family="Arial">${g.t}</text>` : ''}</g>`;
  });
  (o.pts || []).forEach(p => {
    const [x, y] = p.center ? [c, c] : p.on ? P(p.a) : [c + (p.d || 40) * Math.cos(xrad(p.a)), c - (p.d || 40) * Math.sin(xrad(p.a))];
    s += `<g class="seg" data-id="${p.id}"><circle cx="${x}" cy="${y}" r="16" fill="transparent"/><circle cx="${x}" cy="${y}" r="7" fill="${p.c || '#12324f'}"/></g>`;
  });
  if (!o.noCenter) s += `<circle cx="${c}" cy="${c}" r="4" fill="#12324f"/>`;
  return s + '</svg>';
}
function xCupSVG(cap, ml, step, o = {}) {
  const top = 20, bot = 230, H = bot - top, y = v => bot - v / cap * H;
  let s = `<svg class="xcup" viewBox="0 0 170 250"><rect x="40" y="${y(ml)}" width="90" height="${bot - y(ml)}" fill="#7cc8ff"/>`;
  s += `<path d="M36 ${top - 8} V${bot + 4} Q36 ${bot + 12} 44 ${bot + 12} H126 Q134 ${bot + 12} 134 ${bot + 4} V${top - 8}" fill="none" stroke="#12324f" stroke-width="4"/>`;
  for (let v = step; v <= cap; v += step) {
    const big = v % (o.label || step * 2) === 0 || v === cap;
    s += `<line x1="134" y1="${y(v)}" x2="${big ? 112 : 120}" y2="${y(v)}" stroke="#12324f" stroke-width="${big ? 2.5 : 1.4}"/>`;
    if (big) s += `<text x="140" y="${y(v) + 5}" font-size="14" font-weight="900" fill="#12324f" font-family="Arial">${v}</text>`;
  }
  if (o.handle) s += `<rect class="handle" x="52" y="${y(ml) - 8}" width="66" height="16" rx="8" fill="#11638f" stroke="#fff" stroke-width="3"/>`;
  return s + `<text x="85" y="${bot + 4}" font-size="12" text-anchor="middle" fill="#12324f" font-family="Arial">mL</text></svg>`;
}

/* ===== 補 圓 A 圓規張開多長 ===== */
function xcircleA(st) {
  const rounds = [
    { r: rand(2, 4) * 10, ask: v => `半徑 ${v / 10} 公分` },
    { r: rand(3, 5) * 10, ask: v => `直徑 ${v / 5} 公分`, dia: true },
    { r: rand(2, 4) * 10 + 5, ask: v => `半徑 ${xcmText(v)}` },
    { r: rand(2, 4) * 10, ask: v => `直徑 ${v / 5} 公分`, dia: true }
  ];
  let i = 0;
  function round() {
    if (i >= rounds.length) return api.finish();
    const R = rounds[i], ask = R.ask(R.r);
    curQ = { q: `要畫一個${ask}的圓，圓規要張開多長？`, c: xcmText(R.r) };
    api.say(`要畫一個 <b class="big">${ask}</b> 的圓，圓規要張開多長？拖曳紅色的筆腳。`, `要畫一個${ask}的圓，圓規要張開多長？`);
    st.innerHTML = `${dots(i, rounds.length)}<div class="center" style="font-size:44px">🧭</div><div id="rb"></div><div id="cv" class="center"></div>`;
    xRulerDraw($('#rb', st), 8, mm => {
      if (mm === R.r) {
        api.ok(`對！張開 ${xcmText(R.r)}`); speak(`答對了，圓規張開 ${xcmText(R.r)}`);
        const px = R.r * 1.6;
        $('#cv', st).innerHTML = `<svg class="xcirc" viewBox="0 0 220 220" style="width:200px"><circle cx="110" cy="110" r="${px}" fill="#fff8dd" stroke="#ff7a59" stroke-width="4" stroke-dasharray="${2 * Math.PI * px}" stroke-dashoffset="${2 * Math.PI * px}" style="animation:xdrawc 1.2s forwards"/><line x1="110" y1="110" x2="${110 + px}" y2="110" stroke="#3aa3ff" stroke-width="3"/><circle cx="110" cy="110" r="4" fill="#12324f"/></svg>`;
        i++; later(round, 2200);
      } else api.bad(R.dia ? '圓規張開的長度是半徑，直徑是半徑的 2 倍喔！' : '圓規兩腳張開的長度就是半徑，再看清楚刻度！', xcmText(mm), xcmText(R.r));
    });
  }
  round();
}
/* ===== 補 圓 B 圓心、半徑和直徑：點一點 ===== */
function xcircleB(st) {
  const tasks = shuffle([
    { ask: '半徑', sp: '點出半徑', segs: [{ k: 'r', a: rand(20, 70), id: 'ok' }, { k: 'chord', a: 200, id: 'no1', c: '#8b7bff' }, { k: 'out', a: 300, id: 'no2', c: '#58c26b' }], hint: '半徑：從圓心到圓周上的線段。' },
    { ask: '直徑', sp: '點出直徑', segs: [{ k: 'd', a: rand(10, 60), id: 'ok' }, { k: 'chord', a: 230, span: 120, id: 'no1', c: '#8b7bff' }, { k: 'r', a: 140, id: 'no2', c: '#58c26b' }], hint: '直徑：通過圓心，兩端都在圓周上的線段。' },
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
      curQ = { q: `點出圓的${T.ask}`, c: T.ask };
      api.say(`點出圓的<b class="big">${T.ask}</b>。`, T.sp);
      st.innerHTML = `${dots(i, total)}<div class="center">${xCircleSVG(T.segs, { pts: (T.pts || []).map(p => ({ ...p, c: '#ff7a59' })), noCenter: !!T.pts })}</div>`;
      let done = false;
      $$('.seg', st).forEach(g => g.addEventListener('click', () => {
        if (done) return;
        if (g.dataset.id === 'ok') { done = true; api.ok(`對！這是${T.ask}`); speak(`答對了，這是${T.ask}`); g.classList.add('hit'); i++; later(next, 1500); }
        else api.bad(T.hint, '別的線段', T.ask);
      }));
      return;
    }
    const k = i - tasks.length;
    if (k >= quizPart.length) return api.finish();
    const R = quizPart[k]();
    curQ = { q: R.q, c: `${R.ans} ${R.unit}` };
    st.innerHTML = `${dots(i, total)}<div class="qvis">${xCircleSVG([{ k: 'r', a: 30, t: '半徑' }, { k: 'd', a: 200 }])}</div><div class="kwrap"></div>`;
    api.say(R.q);
    keypad($('.kwrap', st), R.ans, () => { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${R.after}</div>`); speak(R.after); i++; later(next, 2000); }, R.hint, R.unit);
  }
  next();
}
/* ===== 補 圓 C 圓的挑戰 ===== */
function xcircleC(st) {
  quiz(st, [
    { q: '圓裡面<b>最長</b>的線段是什麼？', sp: '圓裡面最長的線段是什麼？', keep: true, opts: [{ h: '直徑', ok: true }, { h: '半徑', ok: false }, { h: '不一定', ok: false }], hint: '通過圓心、兩端在圓周上的線段最長。' },
    { q: '同一個圓，可以畫出幾條半徑？', keep: true, opts: [{ h: '1 條', ok: false }, { h: '2 條', ok: false }, { h: '很多很多條（畫不完）', ok: true }], hint: '從圓心往四面八方都可以畫到圓周！', after: '同一個圓的半徑都一樣長，可以畫無數條' },
    () => { const r = rand(2, 5), n = 3; return { q: `${n} 個半徑 ${r} 公分的圓排成一排，剛好放進長方形盒子裡，盒子長幾公分？`, vis: `<svg viewBox="0 0 300 110" style="width:min(300px,90vw)"><rect x="5" y="5" width="290" height="100" rx="6" fill="#fff" stroke="#12324f" stroke-width="3"/>${[0, 1, 2].map(k => `<circle cx="${55 + k * 95}" cy="55" r="47" fill="#e6fbfa" stroke="#2ad1c9" stroke-width="3"/>`).join('')}</svg>`, ans: r * 2 * n, unit: '公分', hint: `一個圓的直徑是 ${r * 2} 公分，有 ${n} 個。`, after: `${r * 2} × ${n} = ${r * 2 * n}（公分）` }; },
    () => { const r = rand(3, 8); return { q: `圓規兩腳張開 ${r} 公分畫一個圓，這個圓的直徑是幾公分？`, vis: '<span style="font-size:52px">🧭</span>', ans: r * 2, unit: '公分', hint: '張開的長度是半徑！', after: `直徑 = ${r} × 2 = ${r * 2}（公分）` }; },
    () => { const r = rand(2, 6); return { q: `一個圓的半徑是 ${r} 公分，兩條半徑合起來和什麼一樣長？`, keep: true, opts: [{ h: '直徑', ok: true }, { h: '圓周', ok: false }, { h: '圓心', ok: false }], hint: '直徑是半徑的 2 倍。', after: `${r} + ${r} = ${r * 2}（公分），就是直徑` }; },
    { q: '下面哪一個東西的形狀是圓形？', keep: true, opts: [{ h: '<span style="font-size:44px">🪙</span>', ok: true, t: '硬幣' }, { h: '<span style="font-size:44px">📘</span>', ok: false, t: '書' }, { h: '<span style="font-size:44px">🔺</span>', ok: false, t: '三角形' }], hint: '硬幣的面是圓形的！' }
  ]);
}

/* ===== 補 公升 A 量杯倒水 ===== */
function xliterA(st) {
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
    curQ = { q: `倒出 ${ask} 的水`, c: `${R.t} 毫升` };
    api.say(`拖曳藍色的水面（或按按鈕），倒出 <b class="big">${ask}</b> 的水。`, `倒出 ${ask} 的水`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="center" id="cw"></div><div class="readout" id="rd"></div>
      <div class="center"><button type="button" class="btn ghost" id="dn">▼ ${R.step} 毫升</button> <button type="button" class="btn ghost" id="up">▲ ${R.step} 毫升</button> <button type="button" class="btn teal" id="okb">好了！</button></div>`;
    const draw = () => { $('#cw', st).innerHTML = xCupSVG(R.cap, ml, R.step, { label: R.label, handle: true }); $('#rd', st).innerHTML = `水量：<b>${ml}</b> 毫升`; bind(); };
    const set = v => { ml = Math.max(0, Math.min(R.cap, Math.round(v / R.step) * R.step)); draw(); };
    let drag = false;
    function bind() {
      const svg = $('.xcup', st);
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
      else api.bad(`${ml > R.t ? '太多了' : '太少了'}！看清楚一小格是 ${R.step} 毫升${R.t === 1000 ? '，1 公升 = 1000 毫升' : ''}。`, `${ml} 毫升`, `${R.t} 毫升`);
    };
    draw();
  }
  round();
}
/* ===== 補 公升 B 公升和毫升的換算與比較 ===== */
function xliterB(st) {
  quiz(st, [
    { q: '1 公升是幾毫升？', ans: 1000, unit: '毫升', hint: '1 公升 = 1000 毫升', after: '1 公升 = 1000 毫升' },
    () => { const L = rand(1, 5), m = rand(1, 9) * 100; return { q: `${L} 公升 ${m} 毫升是幾毫升？`, ans: L * 1000 + m, unit: '毫升', hint: `${L} 公升是 ${L * 1000} 毫升，再加 ${m}`, after: `${L * 1000} + ${m} = ${L * 1000 + m}（毫升）` }; },
    () => { const L = rand(2, 6), m = pick([50, 80, 250, 400, 650, 900]), v = L * 1000 + m; return { q: `${v} 毫升是 ${L} 公升又幾毫升？`, ans: m, unit: '毫升', hint: `${L * 1000} 毫升是 ${L} 公升，剩下的呢？`, after: `${v} 毫升 = ${xlText(v)}` }; },
    () => { const L = rand(1, 3), b = L * 1000 + pick([-50, -10, 20, 100]); return { q: `${L} 公升 ○ ${b} 毫升`, keep: true, opts: [{ h: '＞', ok: L * 1000 > b }, { h: '＝', ok: false }, { h: '＜', ok: L * 1000 < b }], hint: `${L} 公升 = ${L * 1000} 毫升，再比！`, after: `${L * 1000} 毫升 ${L * 1000 > b ? '＞' : '＜'} ${b} 毫升` }; },
    () => { const v = rand(3, 9) * 50 + 300; return { q: '量杯裡有幾毫升的水？', vis: xCupSVG(1000, v, 50, { label: 100 }), ans: v, unit: '毫升', hint: '一小格是 50 毫升，先找最近的整百！', after: `${v} 毫升` }; },
    () => pick([
      { q: '一瓶養樂多大約裝多少？', keep: true, opts: [{ h: '100 毫升', ok: true }, { h: '100 公升', ok: false }], hint: '養樂多瓶子很小喔！' },
      { q: '家裡的浴缸大約可以裝多少水？', keep: true, opts: [{ h: '200 毫升', ok: false }, { h: '200 公升', ok: true }], hint: '浴缸很大，可以裝很多很多水。' },
      { q: '一小匙藥水大約多少？', keep: true, opts: [{ h: '5 毫升', ok: true }, { h: '5 公升', ok: false }], hint: '一小匙很少！' }
    ])
  ]);
}
/* ===== 補 公升 C 容量計算挑戰（列式小幫手；公升先換成毫升） ===== */
function xliterC(st) {
  quiz(st, [
    () => { const m = rand(1, 9) * 50 + 100; return { q: `1 公升的果汁，倒出 ${m} 毫升，還剩幾毫升？`, vis: '<span style="font-size:52px">🧃</span>', eq: [1000, '−', m], extra: [1000], unit: '毫升', hint: '1 公升 = 1000 毫升', after: `1000 − ${m} = ${1000 - m}（毫升）` }; },
    () => { const a = rand(1, 3) * 1000 + rand(1, 9) * 100, b = rand(1, 2) * 1000 + rand(1, 9) * 100; return { q: `${xlText(a)} 加 ${xlText(b)} 是幾毫升？`, eq: [a, '+', b], chips: [[a, `${a}`], [b, `${b}`]], unit: '毫升', hint: `都換成毫升再加：${xlText(a)} = ${a} 毫升，${xlText(b)} = ${b} 毫升`, after: `${a} + ${b} = ${a + b}（毫升）= ${xlText(a + b)}` }; },
    () => { const v = rand(3, 9) * 100 + 50 * rand(0, 1), n = rand(2, 4); return { q: `一瓶水 ${v} 毫升，${n} 瓶一共幾毫升？`, vis: pics('🍼', n, n), eq: [v, '×', n], unit: '毫升', hint: '每瓶一樣多，有好幾瓶。', after: `${v} × ${n} = ${v * n}（毫升）= ${xlText(v * n)}` }; },
    () => { const big = rand(2, 4) * 1000, small = rand(3, 9) * 100 + 50; return { q: `大桶有 ${big / 1000} 公升水，小桶有 ${small} 毫升，大桶比小桶多幾毫升？`, vis: '<span style="font-size:52px">🪣</span>', eq: [big, '−', small], extra: [big], unit: '毫升', hint: `${big / 1000} 公升 = ${big} 毫升`, after: `${big} − ${small} = ${big - small}（毫升）` }; },
    () => { const c = pick([200, 250]), n = 1000 / c; return { q: `1 公升的牛奶，每杯倒 ${c} 毫升，可以剛好倒滿幾杯？`, vis: '<span style="font-size:52px">🥛</span>', eq: [1000, '÷', c], extra: [1000], unit: '杯', hint: '1 公升 = 1000 毫升，每杯一樣多，可以分成幾杯？', after: `${c} × ${n} = 1000，可以倒 ${n} 杯` }; }
  ]);
}

document.head.insertAdjacentHTML('beforeend', `<style>
.xruler{height:auto;touch-action:none;max-width:100%}.xrwrap{overflow-x:auto}
.xcup{width:min(190px,50vw);height:auto;touch-action:none;cursor:ns-resize}
.xcirc{width:min(240px,70vw);height:auto}.xcirc .seg{cursor:pointer}
.xcirc .seg.hit line:last-of-type{stroke:#58c26b}.xcirc .seg.hit circle:last-of-type{fill:#58c26b}
@keyframes xdrawc{to{stroke-dashoffset:0}}
</style>`);

Object.assign(LEVELS, { xcircle: [xcircleA, xcircleB, xcircleC], xliter: [xliterA, xliterB, xliterC] });
