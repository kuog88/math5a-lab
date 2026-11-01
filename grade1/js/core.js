'use strict';
/* 一年級數學樂園：共用工具（音效、朗讀、題目、拖曳、畫圖） */
const KEY = 'math-g1-stars';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LEVELS = {};

/* ---------- 進度 ---------- */
let P = {};
function loadP() { try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { P = {}; } }
function saveP() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
loadP();

/* ---------- 聲音 ---------- */
let muted = false, AC = null;
function sfx(type) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [660, 880], bad: [260, 190], tap: [560], win: [523, 659, 784, 1046], pop: [900, 1200] }[type] || [440];
    seq.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type === 'bad' ? 'square' : 'triangle';
      o.frequency.value = f;
      const s = AC.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(type === 'bad' ? 0.08 : 0.2, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.18);
      o.connect(g).connect(AC.destination);
      o.start(s); o.stop(s + 0.2);
    });
  } catch (e) {}
}
let zhVoice = null;
function pickVoice() {
  try {
    const v = speechSynthesis.getVoices();
    zhVoice = v.find(x => /zh[-_]TW/i.test(x.lang)) || v.find(x => /zh/i.test(x.lang)) || null;
  } catch (e) {}
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text) {
  if (muted || !('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, '').replace(/[□？]/g, m => m === '□' ? '幾' : '？').replace(/−/g, '減').replace(/\+/g, '加').replace(/=/g, '等於'));
    u.lang = 'zh-TW'; if (zhVoice) u.voice = zhVoice; u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- 畫面小工具 ---------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200); }
function confetti() {
  const box = $('#confetti'), cs = ['#ff7eb3', '#5bb4ff', '#3fcf9c', '#ffc93c', '#a98bff', '#ff9a4d'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(cs);
    c.style.animationDelay = Math.random() * 0.6 + 's';
    box.appendChild(c); setTimeout(() => c.remove(), 2600);
  }
}
let cleanups = [];
function later(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; }
function runCleanup() { cleanups.forEach(f => { try { f(); } catch (e) {} }); cleanups = []; try { speechSynthesis.cancel(); } catch (e) {} }

/* ---------- 關卡 API ---------- */
let cur = null, lastSay = '', lastQ = '';
/* 家長報表：curQ 是目前的題目和正確答案（quiz、xquiz、eqBuild 會設定；其他關卡用貓頭鷹說的話當題目） */
let curQ = null;
function rep(ok, a, c) { window.KGReport && KGReport.answer(ok, { q: curQ ? curQ.q : lastQ, a, c: c !== undefined ? c : curQ ? curQ.c : '' }); }
/* 選項的文字（圖形選項用 o.t 說明） */
const optText = o => o ? o.t || (/<svg/i.test(o.h) ? '（圖）' : o.h) : '';
function setQ(r) { const okOpt = (r.opts || []).find(o => o.ok); curQ = { q: r.q, c: r.eq ? eqAns(r) : optText(okOpt) }; }
const api = {
  say(html, sp) {
    const b = $('#bubble'); b.innerHTML = html;
    const w = $('#bubbleWrap'); w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse');
    lastSay = sp || html; lastQ = html; speak(lastSay);
  },
  ok(msg) { sfx('ok'); if (msg) toast(msg); rep(true); },
  bad(msg, a, c) { if (cur) cur.miss++; sfx('bad'); toast(msg || '再想想看！'); rep(false, a, c); },
  finish() { if (cur && !cur.done) { cur.done = true; window.onLevelDone && window.onLevelDone(cur); } }
};

function dots(i, n) { let h = '<div class="prog">'; for (let k = 0; k < n; k++) h += `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`; return h + '</div>'; }
function pics(e, n, sm) { if (!n) return ''; return `<span class="pics${sm ? ' sm' : ''}" style="grid-template-columns:repeat(${Math.min(5, n)},1fr)">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span>`; }
const N = v => `<span class="num">${v}</span>`;

/* 選項按鈕：答對呼叫 onRight，答錯扣分並提示 */
function optBtn(o, onRight, hint) {
  const b = document.createElement('button');
  b.className = 'opt'; b.innerHTML = o.h; b.type = 'button'; b._o = o;
  b.onclick = () => {
    if (b.disabled) return;
    if (o.ok) {
      b.classList.add('right');
      $$('.opt', b.parentNode).forEach(x => x.disabled = true);
      api.ok(); onRight();
    } else {
      b.classList.add('wrong'); b.disabled = true;
      const right = $$('.opt', b.parentNode).map(x => x._o).find(x => x && x.ok);
      api.bad(o.hint || hint || '再想想看！', optText(o), right ? optText(right) : undefined);
      if (o.hint || hint) speak(o.hint || hint);
    }
  };
  return b;
}
/* 數字選項 */
function numOpts(ans, lo = 0, hi = 10, k = 3) {
  const s = new Set([ans]); let g = 0;
  while (s.size < k && g++ < 200) { const v = ans + rand(-3, 3); if (v >= lo && v <= hi) s.add(v); }
  for (let v = lo; s.size < k && v <= hi; v++) s.add(v);
  return shuffle([...s]).map(v => ({ h: N(v), ok: v === ans }));
}
function numpadOpts(ans, lo = 0, hi = 10) { const a = []; for (let v = lo; v <= hi; v++) a.push({ h: N(v), ok: v === ans }); return a; }

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}], keep, pad, hint, after} */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    setQ(r);
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${r.eq ? 'eqwrap' : r.pad ? 'numpad' : 'opts'}"></div>`;
    api.say(r.q, r.eq ? eqSay(r) : r.sp);
    const next = () => {
      if (r.after) $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`);
      if (r.after) speak(r.after);
      i++; later(show, r.after ? 1900 : 1000);
    };
    if (r.eq) return eqBuild($('.eqwrap', st), r, next);
    const ops = $(r.pad ? '.numpad' : '.opts', st);
    (r.keep || r.pad ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* ---------- 列式小幫手（2026-11，一年級版） ----------
   應用題只要把「算式」列對就過關，答案由電腦算，小朋友不用拿紙筆。
   r.eq：一步題寫 [a, op, b]；兩步題寫 [[a, op, b], ['R', op, c]]，'R' 是上一步的答案。
   r.alt：其他也算對的列法（格式同 eq，可放好幾個）。＋ 前後交換也算對。
   r.ic：{數字: 圖示}，數字按鈕下面畫出那麼多個圖示；r.e：答案的圖示。
   r.nums：題目文字以外才看得到的數字；r.numHint：符號對、數字選錯時的提示；r.ops：符號鍵，預設 ＋ −（第 6 單元還沒教減法，只放 ＋）。 */
const EQ_WHY = {
  '+': '「又來了」、「放進」、「一共」，用 ＋ ！',
  '−': '「走了」、「吃掉」、「還剩」、「多幾個」，用 − ！'
};
const eqSay = r => (r.sp || String(r.q).replace(/<[^>]+>/g, '')) + '列出算式！';
function eqCalc(a, op, b) { return op === '+' ? a + b : a - b; }
function eqPaths(r) {
  const norm = e => Array.isArray(e[0]) ? e : [e];
  return [norm(r.eq)].concat((r.alt || []).map(norm));
}
/* 家長報表用的正確算式，例如「8 − 3 = 5，5 + 2 = 7」 */
function eqAns(r) {
  let v;
  return eqPaths(r)[0].map(e => { const [a, op, b] = e.map(x => x === 'R' ? v : x); v = eqCalc(a, op, b); return `${a} ${op} ${b} = ${v}`; }).join('，') + (r.unit ? ' ' + r.unit : '');
}
/* 三個數連加的所有列法 */
function sumPaths(list) {
  const out = [], seen = new Set();
  const perms = a => a.length < 2 ? [a] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x, ...p]));
  perms(list).forEach(p => { const e = [[p[0], '+', p[1]], ...p.slice(2).map(x => ['R', '+', x])], k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); out.push(e); } });
  return out;
}
function eqBuild(box, r, onRight) {
  let paths = eqPaths(r), rows = [], results = [], act = null, finished = false;
  curQ = { q: r.q, c: eqAns(r) };
  const plain = String(r.q || '').replace(/<[^>]+>/g, '');
  const nums = [...new Set((plain.match(/\d+/g) || []).map(Number).concat(r.nums || []))];
  const ops = r.ops || ['+', '−'], ic = r.ic || {};
  const chip = (n, cls = '', label = '') => `<button type="button" class="eq-chip${cls}" data-n="${n}">${label}<b>${n}</b>${ic[n] && n <= 10 ? `<span class="eq-ic">${ic[n].repeat(n)}</span>` : ''}</button>`;
  box.innerHTML = `<div class="eq-tip">✏️ 列算式</div>
    <div class="eq-chips">${nums.map(n => chip(n)).join('')}</div>
    <div class="eq-rows"></div>
    <div class="eq-ops">${ops.map(k => `<button type="button" class="eq-key op" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="eq-pad">${['1', '2', '3', '4', '5', '⌫', '6', '7', '8', '9', '0', '🧹'].map(k => `<button type="button" class="eq-key${/\d/.test(k) ? '' : ' tool'}" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn mint eq-go">✔ 對嗎？</button></div>`;
  const rowsBox = $('.eq-rows', box), msg = $('.eq-msg', box);
  function addRow() {
    const i = rows.length, multi = i > 0 || Math.min(...paths.map(p => p.length)) > 1;
    const el = document.createElement('div'); el.className = 'eq-row';
    el.innerHTML = `${multi ? `<div class="eq-step">第 ${i + 1} 步${i ? chip(results[i - 1], ' sm', '用上一步的 ') : ''}</div>` : ''}
      <button type="button" class="eq-slot" data-s="a"></button><button type="button" class="eq-slot op" data-s="op"></button><button type="button" class="eq-slot" data-s="b"></button>
      <span class="eq-sign">=</span><span class="eq-slot res">?</span>`;
    rowsBox.appendChild(el);
    const row = { el, a: '', op: '', b: '' }; rows.push(row);
    $$('.eq-slot[data-s]', el).forEach(s => s.onclick = () => { if (row.done || finished) return; act = { r: i, k: s.dataset.s }; sfx('tap'); draw(); });
    $$('.eq-chip', el).forEach(c => c.onclick = () => putNum(c.dataset.n));
    act = { r: i, k: 'a' }; draw();
  }
  function draw() {
    rows.forEach((row, i) => $$('.eq-slot[data-s]', row.el).forEach(s => {
      const k = s.dataset.s, v = row[k];
      s.textContent = v === '' ? (k === 'op' ? '○' : '□') : v;
      s.classList.toggle('filled', v !== '');
      s.classList.toggle('act', !row.done && !!act && act.r === i && act.k === k);
    }));
  }
  const row = () => rows[act.r];
  const advance = () => { const nx = ['a', 'op', 'b'].find(k => row()[k] === ''); if (nx) act.k = nx; };
  function putNum(n) {
    if (finished || !act || row().done) return;
    if (act.k === 'op') act.k = row().a === '' ? 'a' : 'b';
    row()[act.k] = String(n); sfx('pop'); speak(String(n)); advance(); draw();
  }
  $$('.eq-chips .eq-chip', box).forEach(c => c.onclick = () => putNum(c.dataset.n));
  $$('.eq-key', box).forEach(b => b.onclick = () => {
    if (finished || !act || row().done) return;
    const k = b.dataset.k, w = row(); sfx('tap');
    if (ops.includes(k)) { w.op = k; act.k = 'op'; speak(k); advance(); }
    else if (k === '⌫') { if (act.k === 'op') w.op = ''; else w[act.k] = w[act.k].slice(0, -1); }
    else if (k === '🧹') { w.a = w.op = w.b = ''; act.k = 'a'; }
    else { if (act.k === 'op') act.k = w.a === '' ? 'a' : 'b'; if (w[act.k].length < 2) w[act.k] = (w[act.k] === '0' ? '' : w[act.k]) + k; }
    draw();
  });
  const val = v => v === 'R' ? results[results.length - 1] : v;
  const expect = (p, i) => p[i] ? p[i].map(val) : null;
  function same(w, e) {
    const a = +w.a, b = +w.b;
    return w.op === e[1] && ((a === e[0] && b === e[2]) || (e[1] === '+' && a === e[2] && b === e[0]));
  }
  function bad(text) {
    const w = rows[rows.length - 1];
    const said = `${w.a || '□'} ${w.op || '○'} ${w.b || '□'}`;
    w.el.classList.remove('shake'); void w.el.offsetWidth; w.el.classList.add('shake');
    msg.innerHTML = '💡 ' + text; api.bad(text.replace(/<[^>]+>/g, ''), said); speak(text);
  }
  $('.eq-go', box).onclick = () => {
    if (finished) return;
    const i = rows.length - 1, w = rows[i];
    if (w.a === '' || w.op === '' || w.b === '') return bad('還有空格喔！');
    const cand = paths.map(p => expect(p, i)).filter(Boolean);
    const ok = paths.filter(p => p[i] && same(w, expect(p, i)));
    if (!ok.length) {
      const a = +w.a, b = +w.b;
      if (!cand.some(e => e[1] === w.op)) return bad(r.hint || EQ_WHY[cand[0][1]]);
      if (w.op === '−' && cand.some(e => e[1] === '−' && a === e[2] && b === e[0])) return bad('<b>大的數</b>放前面！');
      if (![a, b].every(v => nums.concat(results).includes(v))) return bad('這個數字，題目裡沒有喔！');
      return bad('符號對了！' + (r.numHint || '再看看是哪兩個數。'));
    }
    // 這一步列對了：電腦幫忙算
    paths = ok; w.done = true; w.el.classList.add('done'); act = null; draw();
    const v = eqCalc(+w.a, w.op, +w.b);
    results.push(v);
    const res = $('.res', w.el); res.textContent = v; res.classList.add('pop');
    sfx('ok');
    if (!ok.some(p => p.length === rows.length)) {
      msg.innerHTML = `✅ 是 <b>${v}</b>！再列下一步。`;
      speak(`對了，是 ${v}。再列下一步`); addRow(); return;
    }
    finished = true; $('.eq-go', box).disabled = true;
    msg.innerHTML = `✅ 答對了！是 <b class="eq-ans">${v}${r.unit ? ' ' + r.unit : ''}</b>${r.e && v > 0 && v <= 10 ? `<div class="eq-ic big">${r.e.repeat(v)}</div>` : ''}`;
    speak(`答對了！是 ${v}${r.unit || ''}`);
    api.ok(); later(onRight, 1600);
  };
  addRow();
}

/* 散開的位置（百分比） */
function scatter(n, cols = 5, rows = 4) {
  const cells = shuffle(Array.from({ length: cols * rows }, (_, k) => k)).slice(0, n);
  return cells.map(k => {
    const c = k % cols, r = Math.floor(k / cols);
    return [((c + 0.5) / cols) * 100 + rand(-3, 3), ((r + 0.5) / rows) * 100 + rand(-4, 4)];
  });
}

/* 拖曳（滑鼠、觸控都可）。沒移動就當成「點一下」，onDrop 收到 'tap'；
   放在 targets 其中一個上面，收到該元素；其他情況收到 null */
function draggable(el, targets, onDrop) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    if (el.dataset.lock) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY; let moved = false;
    try { el.setPointerCapture(e.pointerId); } catch (er) {}
    el.classList.add('dragging');
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 8) moved = true;
      el.style.transform = `translate(${dx}px,${dy}px) scale(1.12)`;
    };
    const up = ev => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.classList.remove('dragging'); el.style.transform = '';
      let hit = null;
      if (!moved) hit = 'tap';
      else for (const t of (typeof targets === 'function' ? targets() : targets)) {
        const r = t.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) { hit = t; break; }
      }
      onDrop(hit);
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}

/* 時鐘 SVG：h 1~12，m 0 或 30 */
function clockSVG(h, m, cls = 'clock') {
  let s = `<svg class="${cls}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#5bb4ff" stroke-width="8"/>`;
  for (let k = 0; k < 60; k++) {
    const a = k * 6 * Math.PI / 180, big = k % 5 === 0, r1 = big ? 76 : 82;
    s += `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 86 * Math.sin(a)}" y2="${100 - 86 * Math.cos(a)}" stroke="#b9a9c9" stroke-width="${big ? 3 : 1.4}"/>`;
  }
  for (let k = 1; k <= 12; k++) {
    const a = k * 30 * Math.PI / 180;
    s += `<text x="${100 + 63 * Math.sin(a)}" y="${100 - 63 * Math.cos(a) + 8}" text-anchor="middle" font-size="22" font-weight="900" fill="#4a3b5c" font-family="Arial">${k}</text>`;
  }
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  s += `<g class="hand-h" transform="rotate(${ha} 100 100)"><line x1="100" y1="108" x2="100" y2="52" stroke="#ff7eb3" stroke-width="10" stroke-linecap="round"/></g>`;
  s += `<g class="hand-m" transform="rotate(${ma} 100 100)"><line x1="100" y1="110" x2="100" y2="24" stroke="#4a3b5c" stroke-width="6" stroke-linecap="round"/></g>`;
  s += `<circle cx="100" cy="100" r="8" fill="#ffc93c"/></svg>`;
  return s;
}
const timeText = (h, m) => `${h} 點${m === 30 ? '半' : ''}`;

/* 形狀 SVG */
const SHAPE_NAME = { circle: '圓形', tri: '三角形', square: '正方形', rect: '長方形' };
function shapeSVG(type, color, opt = {}) {
  const rot = opt.rot || 0, sc = opt.scale || 1;
  let body = '';
  const st = `fill="${color}" stroke="#4a3b5c" stroke-width="3" stroke-linejoin="round"`;
  if (type === 'circle') body = `<circle cx="50" cy="50" r="${36 * sc}" ${st}/>`;
  else if (type === 'ellipse') body = `<ellipse cx="50" cy="50" rx="42" ry="24" ${st}/>`;
  else if (type === 'tri') {
    const v = opt.v || 0;
    const pts = [['50,12 88,84 12,84'], ['18,14 18,86 84,86'], ['10,80 90,80 64,22']][v % 3][0];
    body = `<polygon points="${pts}" ${st} transform="scale(${sc}) translate(${(1 - sc) * 50 / sc} ${(1 - sc) * 50 / sc})"/>`;
  } else if (type === 'openTri') body = `<polyline points="40,22 12,84 88,84 60,22" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if (type === 'square') { const w = 64 * sc; body = `<rect x="${50 - w / 2}" y="${50 - w / 2}" width="${w}" height="${w}" ${st}/>`; }
  else if (type === 'rect') { const w = 84 * sc, hh = 44 * sc; body = `<rect x="${50 - w / 2}" y="${50 - hh / 2}" width="${w}" height="${hh}" ${st}/>`; }
  else if (type === 'hex') body = `<polygon points="30,14 70,14 90,50 70,86 30,86 10,50" ${st}/>`;
  else if (type === 'rhombus') body = `<polygon points="50,8 86,50 50,92 14,50" ${st} transform="scale(1 .9) translate(0 5)"/>`;
  return `<svg viewBox="0 0 100 100"><g transform="rotate(${rot} 50 50)">${body}</g></svg>`;
}
