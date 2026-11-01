'use strict';
/* 三年級下學期・海底探險隊：共用工具（進度、音效、朗讀、題目、拖曳） */
const KEY = 'math-g3-2-stars';
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

/* ---------- 聲音（水泡泡音色） ---------- */
let muted = false, AC = null;
function sfx(type) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [523, 784], bad: [220, 165], tap: [700], win: [392, 523, 659, 784, 1046], pop: [1100, 1500] }[type] || [440];
    seq.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type === 'bad' ? 'sawtooth' : 'sine';
      const s = AC.currentTime + i * 0.1;
      o.frequency.setValueAtTime(f * 0.8, s);
      o.frequency.exponentialRampToValueAtTime(f, s + 0.06);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(type === 'bad' ? 0.06 : 0.22, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.2);
      o.connect(g).connect(AC.destination);
      o.start(s); o.stop(s + 0.22);
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
function speakText(t) {
  return String(t).replace(/<span class="frac"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$2分之$1').replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$2分之$1')
    .replace(/□/g, '幾').replace(/−/g, '減').replace(/\+/g, '加').replace(/×/g, '乘以').replace(/÷/g, '除以')
    .replace(/=/g, '等於').replace(/[＞>]/g, '大於').replace(/[＜<]/g, '小於').replace(/○/g, '圈圈').replace(/…/g, '餘');
}
function speak(text) {
  if (muted || !('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speakText(text));
    u.lang = 'zh-TW'; if (zhVoice) u.voice = zhVoice; u.rate = 0.92; u.pitch = 1;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- 畫面小工具 ---------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200); }
function bubbles() {
  const box = $('#confetti');
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    const s = rand(10, 34);
    c.style.left = Math.random() * 100 + 'vw'; c.style.width = c.style.height = s + 'px';
    c.style.animationDelay = Math.random() * 0.8 + 's';
    box.appendChild(c); setTimeout(() => c.remove(), 3200);
  }
}
let cleanups = [];
function later(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; }
function runCleanup() { cleanups.forEach(f => { try { f(); } catch (e) {} }); cleanups = []; try { speechSynthesis.cancel(); } catch (e) {} }

/* ---------- 關卡 API ---------- */
let cur = null, lastSay = '';
const api = {
  say(html, sp) {
    const b = $('#bubble'); b.innerHTML = html;
    const w = $('#bubbleWrap'); w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse');
    lastSay = sp || html; speak(lastSay);
  },
  ok(msg) { sfx('ok'); if (msg) toast(msg); },
  bad(msg) { if (cur) cur.miss++; sfx('bad'); toast(msg || '再想想看！'); },
  finish() { if (cur && !cur.done) { cur.done = true; window.onLevelDone && window.onLevelDone(cur); } }
};

function dots(i, n) { let h = '<div class="prog">'; for (let k = 0; k < n; k++) h += `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`; return h + '</div>'; }
function pics(e, n, cols) { if (!n) return ''; return `<span class="pics" style="grid-template-columns:repeat(${Math.min(cols || 5, n)},1fr)">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span>`; }
const N = v => `<span class="num">${v}</span>`;
/* 分數的直式寫法 */
const F = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
/* 小數去掉浮點誤差 */
const r1 = v => Math.round(v * 10) / 10;

/* 選項按鈕：答對呼叫 onRight，答錯扣分並提示 */
function optBtn(o, onRight, hint) {
  const b = document.createElement('button');
  b.className = 'opt'; b.innerHTML = o.h; b.type = 'button';
  b.onclick = () => {
    if (b.disabled) return;
    if (o.ok) {
      b.classList.add('right');
      $$('.opt', b.parentNode).forEach(x => x.disabled = true);
      api.ok(); onRight();
    } else {
      b.classList.add('wrong'); b.disabled = true;
      api.bad(o.hint || hint || '再想想看！');
      if (o.hint || hint) speak(o.hint || hint);
    }
  };
  return b;
}
/* 數字選項（不重複，k 個） */
function numOpts(ans, wrongs, k = 3) {
  const s = [ans];
  for (const w of shuffle(wrongs)) { if (s.length >= k) break; if (!s.includes(w) && w >= 0) s.push(w); }
  let d = 1; while (s.length < k) { if (!s.includes(ans + d)) s.push(ans + d); d = d > 0 ? -d : -d + 1; if (ans + d < 0) d = -d + 1; }
  return s.map(v => ({ h: N(v), ok: v === ans }));
}

/* 輸入數字的小鍵盤。ans 是小數時多一個「.」鍵 */
function keypad(box, ans, onRight, hint, unit = '') {
  const dec = !Number.isInteger(ans);
  const keys = dec ? [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '⌫', '✔'] : [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'];
  box.innerHTML = `<div class="kp-show"><span class="kp-val"></span>${unit ? `<span class="kp-unit">${unit}</span>` : ''}</div><div class="kpad">${keys.map(k => `<button type="button" class="kbtn${k === '✔' ? ' go' : k === '⌫' ? ' del' : ''}${k === '✔' && dec ? ' wide' : ''}" data-k="${k}">${k}</button>`).join('')}</div>`;
  const show = $('.kp-val', box); let v = '', done = false;
  $$('.kbtn', box).forEach(b => b.onclick = () => {
    if (done) return;
    const k = b.dataset.k; sfx('tap');
    if (k === '⌫') v = v.slice(0, -1);
    else if (k === '✔') {
      if (v === '' || v === '.') return;
      if (Math.abs(parseFloat(v) - ans) < 1e-9) { done = true; show.parentNode.classList.add('right'); api.ok(); onRight(); return; }
      show.parentNode.classList.remove('wrong'); void show.offsetWidth; show.parentNode.classList.add('wrong');
      api.bad(hint || '再算算看！'); if (hint) speak(hint); v = '';
    } else if (k === '.') { if (!v.includes('.') && v.length < 6) v = (v || '0') + '.'; }
    else if (v.length < 6) v = (v === '0' ? '' : v) + k;
    show.textContent = v;
  });
}

/* 兩格輸入（例如「商」和「餘數」、「幾時幾分」）：labels 兩個名稱，ans 兩個答案 */
function keypad2(box, labels, ans, onRight, hint) {
  const vals = ['', ''];
  let at = 0, done = false;
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'];
  box.innerHTML = `<div class="kp2">${labels.map((l, i) => `<button type="button" class="kp-show slot" data-i="${i}"><span class="kp-val"></span><span class="kp-unit">${l}</span></button>`).join('')}</div>
    <div class="kpad">${keys.map(k => `<button type="button" class="kbtn${k === '✔' ? ' go' : k === '⌫' ? ' del' : ''}" data-k="${k}">${k}</button>`).join('')}</div>`;
  const slots = $$('.slot', box);
  const draw = () => slots.forEach((s, i) => { $('.kp-val', s).textContent = vals[i]; s.classList.toggle('on', i === at); });
  slots.forEach(s => s.onclick = () => { at = +s.dataset.i; draw(); });
  $$('.kbtn', box).forEach(b => b.onclick = () => {
    if (done) return;
    const k = b.dataset.k; sfx('tap');
    if (k === '⌫') { if (vals[at] === '' && at > 0) at--; vals[at] = vals[at].slice(0, -1); }
    else if (k === '✔') {
      if (vals[at] === '') return;
      if (at === 0 && vals[1] === '') { at = 1; draw(); return; }
      if (vals.some(v => v === '')) return;
      if (+vals[0] === ans[0] && +vals[1] === ans[1]) { done = true; slots.forEach(s => s.classList.add('right')); api.ok(); onRight(); return; }
      slots.forEach((s, i) => { if (+vals[i] !== ans[i]) { s.classList.remove('wrong'); void s.offsetWidth; s.classList.add('wrong'); vals[i] = ''; } });
      at = +vals[0] === ans[0] ? 1 : 0;
      api.bad(hint || '再算算看！'); if (hint) speak(hint);
    } else if (vals[at].length < 5) vals[at] = (vals[at] === '0' ? '' : vals[at]) + k;
    draw();
  });
  draw();
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   {q, sp, vis, opts:[{h,ok,hint}], keep, hint, after}；有 ans 用小鍵盤；有 ans2:[a,b], labels 用兩格輸入；
   有 eq 用「列式小幫手」（優先） */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    const eqm = !!r.eq, typed = !eqm && (r.ans !== undefined || r.ans2 !== undefined);
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${eqm ? 'eqwrap' : typed ? 'kwrap' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2200 : 1000);
    };
    if (eqm) return eqBuild($('.eqwrap', st), r, next);
    if (r.ans2) return keypad2($('.kwrap', st), r.labels, r.ans2, next, r.hint);
    if (typed) return keypad($('.kwrap', st), r.ans, next, r.hint, r.unit);
    const ops = $('.opts', st);
    (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* ---------- 列式小幫手（2026-11，照上學期 grade3 的做法改寫） ----------
   應用題只要把「算式」列對就過關，答案由電腦算，小朋友不用拿紙筆。
   r.eq：一步題 [a, op, b]；多步題 [[a, op, b], [x, op, 'R'], …]，'R' 代表上一步的答案。
   r.alt：其他也算對的列法（格式同 eq，可放好幾個）。＋ 和 × 前後交換也算對。
   數字可以寫 3、1.2 或 '3/8'（電腦用分數精確計算，不會有 0.1 ＋ 0.2 的誤差）。
   r.chips：[[值, '顯示文字'], …] 自訂可點的數字，例如「1 時 25 分」記成 85（分），這時鍵盤只留符號。
   r.fmt：把算出來的值（分鐘、公克……）換成要顯示的文字。
   r.extra：題目沒直接寫、但可以用的數（例如「商 ＋ 1」的 1）。 */
const EQ_OPS = ['+', '−', '×', '÷'];
const EQ_WHY = {
  '+': '「一共、合起來、又多了、比……多（要找多的那個）」通常用加法 ＋',
  '−': '「還剩、用掉、賣掉、比……多幾、少幾」通常用減法 −',
  '×': '「每一份一樣多，有好幾份」或「是……的幾倍」用乘法 ×',
  '÷': '「平分、每份幾個、可以分成幾份、□ 是多少倍的反推」用除法 ÷'
};
/* 分數 {n, d}：不約分（三年級只學同分母）；小數 1.2 記成 12/10 */
function toQ(v) {
  if (v && typeof v === 'object') return v;
  const s = String(v).trim();
  let m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[2] ? { n: +m[1], d: +m[2] } : null;
  m = s.match(/^(\d+)(?:\.(\d+))?$/);
  return m ? { n: +(m[1] + (m[2] || '')), d: 10 ** (m[2] || '').length } : null;
}
const qEq = (x, y) => x.n * y.d === y.n * x.d;
function eqCalc(a, op, b) {
  if (op === '×') return { n: a.n * b.n, d: a.d * b.d };
  if (op === '÷') return a.d === 1 && b.d === 1 ? { n: Math.floor(a.n / b.n), d: 1 } : { n: a.n * b.d, d: a.d * b.n };
  const d = a.d === b.d || b.d === 1 ? a.d : a.d === 1 ? b.d : a.d * b.d, x = a.n * d / a.d, y = b.n * d / b.d;
  return { n: op === '+' ? x + y : x - y, d };
}
function eqPaths(r) {
  const norm = e => Array.isArray(e[0]) ? e : [e];
  return [norm(r.eq)].concat((r.alt || []).map(norm));
}
function eqBuild(box, r, onRight) {
  let paths = eqPaths(r), rows = [], results = [], act = null, finished = false;
  let chips;
  if (r.chips) chips = r.chips.map(([v, t]) => ({ q: toQ(v), t: String(t) }));
  else {
    const plain = String(r.q || '').replace(/<span class="frac"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g, ' $1/$2 ').replace(/<[^>]+>/g, '');
    chips = [...new Set(plain.match(/\d+(?:\.\d+|\/\d+)?/g) || [])].map(s => ({ q: toQ(s), t: s.includes('/') ? F(...s.split('/')) : s }));
  }
  const dec = !r.chips && chips.some(c => c.t.includes('.')), frac = !r.chips && chips.some(c => c.q.d > 1 && !c.t.includes('.'));
  const show = v => r.fmt ? r.fmt(v.n / v.d) : v.n % v.d === 0 ? String(v.n / v.d) : dec ? String(+(v.n / v.d).toFixed(String(v.d).length)) : F(v.n, v.d);
  const xk = dec ? '.' : frac ? '/' : '';
  const keys = r.chips ? ['+', '−', '×', '÷', '⌫', '🧹'] : ['7', '8', '9', '+', '4', '5', '6', '−', '1', '2', '3', '×', '⌫', '0', xk || '🧹', '÷'].concat(xk ? ['🧹'] : []);
  box.innerHTML = `<div class="eq-tip">✏️ 不用自己算！把<b>算式</b>排出來，答案電腦幫你算。</div>
    <div class="eq-chips"><span class="eq-lbl">${r.chips ? '點題目裡的數量：' : '題目裡的數字：'}</span>${chips.map((c, k) => `<button type="button" class="eq-chip" data-c="${k}">${c.t}</button>`).join('')}</div>
    <div class="eq-rows"></div>
    <div class="eq-pad${r.chips ? ' ops' : ''}">${keys.map(k => `<button type="button" class="eq-key${EQ_OPS.includes(k) ? ' op' : ''}${k === '🧹' && (xk || r.chips) ? ' wide' : ''}" data-k="${k}">${k === '🧹' && (xk || r.chips) ? '🧹 清空' : k}</button>`).join('')}</div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn coral eq-go">✔ 檢查算式</button></div>`;
  const rowsBox = $('.eq-rows', box), msg = $('.eq-msg', box);
  function addRow() {
    const i = rows.length, multi = i > 0 || Math.min(...paths.map(p => p.length)) > 1;
    const el = document.createElement('div'); el.className = 'eq-row';
    el.innerHTML = `${multi ? `<div class="eq-step">第 ${i + 1} 步${i ? `　<button type="button" class="eq-chip sm">用上一步的答案 ${show(results[i - 1])}</button>` : ''}</div>` : ''}
      <button type="button" class="eq-slot" data-s="a"></button><button type="button" class="eq-slot op" data-s="op"></button><button type="button" class="eq-slot" data-s="b"></button>
      <span class="eq-sign">=</span><span class="eq-slot res">?</span>`;
    rowsBox.appendChild(el);
    const row = { el, a: null, op: '', b: null }; rows.push(row);
    $$('.eq-slot[data-s]', el).forEach(s => s.onclick = () => { if (row.done || finished) return; act = { r: i, k: s.dataset.s }; sfx('tap'); draw(); });
    if (i) $('.eq-step .eq-chip', el).onclick = () => putChip({ q: results[i - 1], t: show(results[i - 1]) });
    act = { r: i, k: 'a' }; draw();
  }
  function draw() {
    rows.forEach((row, i) => $$('.eq-slot[data-s]', row.el).forEach(s => {
      const k = s.dataset.s, v = row[k], empty = k === 'op' ? v === '' : !v;
      s.innerHTML = empty ? (k === 'op' ? '○' : '□') : k === 'op' ? v : v.t;
      s.classList.toggle('filled', !empty);
      s.classList.toggle('act', !row.done && !!act && act.r === i && act.k === k);
    }));
  }
  const row = () => rows[act.r];
  const advance = () => { const w = row(), nx = ['a', 'op', 'b'].find(k => k === 'op' ? w.op === '' : !w[k]); if (nx) act.k = nx; };
  const numSlot = () => { if (act.k === 'op') act.k = row().a ? 'b' : 'a'; return act.k; };
  function putChip(c) {
    if (finished || !act || row().done) return;
    row()[numSlot()] = { t: c.t, q: c.q }; sfx('pop'); advance(); draw();
  }
  $$('.eq-chips .eq-chip', box).forEach(c => c.onclick = () => putChip(chips[+c.dataset.c]));
  $$('.eq-key', box).forEach(b => b.onclick = () => {
    if (finished || !act || row().done) return;
    const k = b.dataset.k, w = row(); sfx('tap');
    if (EQ_OPS.includes(k)) { w.op = k; act.k = 'op'; advance(); }
    else if (k === '⌫') { if (act.k === 'op') w.op = ''; else { const s = w[act.k]; w[act.k] = s && s.typed && s.t.length > 1 ? typedVal(s.t.slice(0, -1)) : null; } }
    else if (k === '🧹') { w.a = w.b = null; w.op = ''; act.k = 'a'; }
    else {
      const s = numSlot(), old = w[s] && w[s].typed ? w[s].t : '';
      let t = old;
      if (k === '.') { if (!/[./]/.test(old)) t = (old || '0') + '.'; }
      else if (k === '/') { if (old && !/[./]/.test(old)) t = old + '/'; }
      else if (old.length < 6) t = (old === '0' ? '' : old) + k;
      w[s] = typedVal(t);
    }
    draw();
  });
  function typedVal(t) { return { t, q: toQ(t), typed: true }; }
  const expect = (p, i) => p[i] ? p[i].map((v, j) => j === 1 ? v : v === 'R' ? results[i - 1] : toQ(v)) : null;
  function same(w, e) {
    const sw = e[1] === '+' || e[1] === '×';
    return w.op === e[1] && ((qEq(w.a.q, e[0]) && qEq(w.b.q, e[2])) || (sw && qEq(w.a.q, e[2]) && qEq(w.b.q, e[0])));
  }
  function bad(text) {
    const w = rows[rows.length - 1];
    w.el.classList.remove('shake'); void w.el.offsetWidth; w.el.classList.add('shake');
    msg.innerHTML = '💡 ' + text; api.bad(text.replace(/<[^>]+>/g, '')); speak(text);
  }
  $('.eq-go', box).onclick = () => {
    if (finished) return;
    const i = rows.length - 1, w = rows[i];
    if (!w.a || w.op === '' || !w.b) return bad('還有格子是空的喔！兩個數字和中間的符號都要放進去。');
    if (!w.a.q || !w.b.q) return bad(`數字還沒打完喔！${frac ? '分數要打成「分子 / 分母」，例如 3/8。' : ''}`);
    const cand = paths.map(p => expect(p, i)).filter(Boolean);
    const ok = paths.filter(p => p[i] && same(w, expect(p, i)));
    if (!ok.length) {
      const a = w.a.q, b = w.b.q;
      if (!cand.some(e => e[1] === w.op)) return bad(`${r.hint ? r.hint + '　' : ''}${EQ_WHY[cand[0][1]]}`);
      if (cand.some(e => e[1] === w.op && qEq(a, e[2]) && qEq(b, e[0]))) return bad(w.op === '−' ? '減法要把<b>比較大的數</b>（原本全部的）放在前面喔！' : '除法要把<b>全部的數量</b>放前面，分成幾份（或每份幾個）放後面喔！');
      if (b.n === 0 && w.op === '÷') return bad('不能除以 0 喔！');
      const known = chips.map(c => c.q).concat(results, (r.extra || []).map(toQ));
      if (![a, b].every(v => known.some(x => qEq(x, v)))) return bad(`${r.hint ? r.hint + '　' : ''}有一個數字題目裡沒有直接寫，先想想要怎麼換算喔！`);
      return bad(`符號對了！數字再檢查一下。${r.hint || '再讀一次題目，找出要算的是哪兩個數。'}`);
    }
    // 這一步列對了：電腦幫忙算
    paths = ok; w.done = true; w.el.classList.add('done'); act = null; draw();
    const a = w.a.q, b = w.b.q, v = eqCalc(a, w.op, b), m = w.op === '÷' && a.d === 1 && b.d === 1 ? a.n % b.n : 0;
    results.push(v);
    const txt = m ? `${show(v)} … ${m}` : show(v);
    const res = $('.res', w.el); res.innerHTML = txt; res.classList.add('pop');
    sfx('ok');
    if (paths.some(p => p.length > rows.length)) {
      msg.innerHTML = `✅ 第 ${rows.length} 步列對了！電腦算出 <b>${txt}</b>，接著列下一步。`;
      speak(`列對了，答案是 ${txt}。接著列下一步`); addRow(); return;
    }
    finished = true; $('.eq-go', box).disabled = true;
    msg.innerHTML = `✅ 算式列對了！答案是 <b class="eq-ans">${txt}${r.unit ? ' ' + r.unit : ''}</b>`;
    api.ok(); later(onRight, 700);
  };
  addRow();
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
