'use strict';
/* 六年級數學樂園：共用工具（音效、朗讀、題目、小鍵盤、拖曳、分數） */
const KEY = 'math-g6-stars';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LEVELS = {};

/* ---------- 數學小工具 ---------- */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => a / gcd(a, b) * b;
const red = (a, b) => { const g = gcd(a, b); return [a / g, b / g]; };
const rnd = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d; // 消掉浮點誤差
const fmt = x => String(rnd(x, 4));
/* 分數 HTML；b 為 1 時只寫整數 */
const fr = (a, b) => b === 1 ? `${a}` : `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
/* 化成帶分數顯示 */
const frm = (a, b) => { [a, b] = red(a, b); if (b === 1) return `${a}`; if (a > b) return `${Math.floor(a / b)}${fr(a % b, b)}`; return fr(a, b); };
const frSp = (a, b) => { [a, b] = red(a, b); if (b === 1) return `${a}`; if (a > b) return `${Math.floor(a / b)}又${b}分之${a % b}`; return `${b}分之${a}`; };
function primeFactors(n) { const f = []; for (let p = 2; n > 1; p++) while (n % p === 0) { f.push(p); n /= p; } return f; }
const isPrime = n => n > 1 && primeFactors(n).length === 1;

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
/* 把題目文字轉成好唸的句子：分數、÷、比、π…… */
function spText(text) {
  return String(text)
    .replace(/(\d+)<span class="fr"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g, '$1又$3分之$2')
    .replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$2分之$1')
    .replace(/<[^>]+>/g, '').replace(/(\d+)\/(\d+)/g, '$2分之$1')
    .replace(/□/g, '多少').replace(/−/g, '減').replace(/\+/g, '加').replace(/×/g, '乘以').replace(/÷/g, '除以')
    .replace(/=/g, '等於').replace(/&gt;|＞|>/g, '大於').replace(/&lt;|＜|</g, '小於').replace(/(\d)\s*[:：]\s*(\d)/g, '$1比$2')
    .replace(/π/g, '圓周率').replace(/°/g, '度').replace(/km/g, '公里').replace(/(\d)\s*m(?![a-z])/g, '$1公尺').replace(/cm/g, '公分');
}
function speak(text) {
  if (muted || !('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(spText(text));
    u.lang = 'zh-TW'; if (zhVoice) u.voice = zhVoice; u.rate = 0.95; u.pitch = 1.05;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- 畫面小工具 ---------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600); }
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
function later(fn, ms) { const id = setTimeout(() => { okLock = 0; fn(); }, ms); cleanups.push(() => clearTimeout(id)); return id; }
/* 答對後鎖住舞台：api.ok() 之後到下一個 later() 執行（或 api.say() 出下一題）之前，
   答對那一刻已經在舞台上的東西點了都不算，避免「好了／確定」連點兩下一次跳兩題（最多鎖 4 秒）。
   答對後才出現的按鈕（詳解的「下一題」、接著填的小鍵盤）不受影響。 */
let okLock = 0, okOld = new WeakSet();
function lockStage() { okLock = Date.now(); okOld = new WeakSet(); const s = document.getElementById('stage'); if (s) s.querySelectorAll('*').forEach(el => okOld.add(el)); }
['click', 'pointerdown'].forEach(t => document.addEventListener(t, e => {
  if (!okLock || !okOld.has(e.target)) return;
  if (Date.now() - okLock > 4000) { okLock = 0; return; }
  e.stopPropagation(); e.preventDefault();
}, true));
function runCleanup() { okLock = 0; cleanups.forEach(f => { try { f(); } catch (e) {} }); cleanups = []; try { speechSynthesis.cancel(); } catch (e) {} }

/* ---------- 關卡 API ---------- */
let cur = null, lastSay = '', lastQ = '';
/* 家長報表：curQ 是目前的題目和正確答案（quiz、eqBuild 會設定；其他關卡用貓頭鷹說的話當題目）。
   分數 fr() 和鍵盤的帶分數 1_2/3 轉成「1又2/3」 */
let curQ = null;
const repTxt = s => s === undefined ? s : String(s)
  .replace(/(\d+)<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, ' $1又$2/$3 ')
  .replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, ' $1/$2 ')
  .replace(/(\d+)_(\d*)\/(\d*)/g, '$1又$2/$3');
function rep(ok, a, c) { window.KGReport && KGReport.answer(ok, { q: repTxt(curQ ? curQ.q : lastQ), a: repTxt(a), c: repTxt(c !== undefined ? c : curQ ? curQ.c : '') }); }
/* 選項的文字（圖形選項用 o.t 說明） */
const optText = o => o ? o.t || (/<svg/i.test(o.h) ? '（圖）' : o.h) : '';
const api = {
  say(html, sp) {
    okLock = 0;
    const b = $('#bubble'); b.innerHTML = html;
    const w = $('#bubbleWrap'); w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse');
    lastSay = sp || html; lastQ = html; speak(lastSay);
  },
  ok(msg) { lockStage(); sfx('ok'); if (msg) toast(msg); rep(true); },
  bad(msg, a, c) { if (cur) cur.miss++; sfx('bad'); toast(msg || '再想想看！'); rep(false, a, c); },
  finish() { if (cur && !cur.done) { cur.done = true; window.onLevelDone && window.onLevelDone(cur); } }
};

function dots(i, n) { let h = '<div class="prog">'; for (let k = 0; k < n; k++) h += `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`; return h + '</div>'; }
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
      const h = o.hint || hint || '再想想看！';
      const right = $$('.opt', b.parentNode).map(x => x._o).find(x => x && x.ok);
      api.bad(h, optText(o), right ? optText(right) : undefined); speak(h);
    }
  };
  return b;
}
/* 數字選項 */
function numOpts(ans, wrongs, unit = '') {
  const s = [...new Set([fmt(ans), ...wrongs.map(fmt)])].slice(0, 4);
  // 錯的答案和正確答案一樣（或互相重複）時，補附近的數，保證不重複、至少 2 個
  const want = Math.max(2, Math.min(4, wrongs.length + 1)), step = Number.isInteger(ans) ? 1 : 0.1;
  for (let d = 1; s.length < want && d < 100; d++) [ans + d * step, ans - d * step].forEach(v => { if (v >= 0 && s.length < want && !s.includes(fmt(v))) s.push(fmt(v)); });
  return s.map(v => ({ h: `${N(v)}${unit ? `<small>${unit}</small>` : ''}`, ok: v === fmt(ans) }));
}

/* 解析鍵盤輸入：整數、小數、分數 a/b、帶分數 a_b/c、比 a:b */
function parseIn(s) {
  if (/^\d+:\d+$/.test(s)) return { ratio: s.split(':').map(Number) };
  let m = s.match(/^(\d+)_(\d+)\/(\d+)$/);
  if (m) { const w = +m[1], a = +m[2], b = +m[3]; return b ? { v: w + a / b, frac: [w * b + a, b], mixed: a > 0 && a < b } : null; }
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[2] ? { v: +m[1] / +m[2], frac: [+m[1], +m[2]] } : null;
  if (/^\d*\.?\d+$|^\d+\.$/.test(s)) return { v: parseFloat(s) };
  return null;
}
/* 檢查答案：ans 可以是數字、'a/b'（要最簡分數）、'a:b'（要最簡整數比） */
function checkAns(s, ans) {
  const p = parseIn(s);
  if (!p) return '寫法不對喔，再檢查一下！';
  if (typeof ans === 'string' && ans.includes(':')) {
    if (!p.ratio) return '要寫成「○:○」的比喔！';
    const [a, b] = ans.split(':').map(Number), [x, y] = p.ratio;
    if (a * y !== b * x) return false;
    return gcd(x, y) === 1 ? true : '比對了，但還可以再化簡成最簡整數比！';
  }
  if (p.ratio) return false;
  if (p.mixed === false) return '帶分數的分數部分要是真分數喔！';
  const want = typeof ans === 'string' ? (([a, b]) => +a / +b)(ans.split('/')) : ans;
  if (Math.abs(p.v - want) > 1e-9) return false;
  if (p.frac && p.frac[1] !== 1 && gcd(p.frac[0], p.frac[1]) !== 1) return '答案對了，但要約成最簡分數喔！';
  return true;
}
/* 顯示鍵盤輸入的樣子（分數畫成直的） */
function showIn(s) {
  // 帶分數和分數用同一個 replace，免得第二次把 fr() 產生的 </span> 當成分數線
  return s.replace(/(\d+)_(\d*)\/(\d*)|(\d*)\/(\d*)/, (m, w, a, b, c, d) => w !== undefined ? `${w}${fr(a || '□', b || '□')}` : fr(c || '□', d || '□'))
    .replace(/_(\d*)$/, (m, a) => ` ${a || '□'}`).replace(/:/, ' : ');
}

/* 輸入答案的小鍵盤。keys 可加 '.'、'/'、':'、'_'（帶分數的整數部分） */
function keypad(box, ans, onRight, hint, unit = '', keys) {
  if (!keys) keys = typeof ans === 'string' ? (ans.includes(':') ? [':'] : ['/']) : (String(ans).includes('.') ? ['.'] : []);
  const extra = keys.length ? keys : [''];
  const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, ...extra, 0, '⌫'];
  const name = { '.': 1, '/': 1, ':': 1, '_': 1 };
  box.innerHTML = `<div class="kp-show"><span class="kp-val"></span>${unit ? `<span class="kp-unit">${unit}</span>` : ''}</div><div class="kpad">${all.map(k => k === '' ? '<span></span>' : `<button type="button" class="kbtn${k === '⌫' ? ' del' : typeof k === 'string' ? ' sym' : ''}" data-k="${k}">${k === '/' ? '<small>分數</small>／' : k === '_' ? '<small>帶分數</small>又' : k === ':' ? '<small>比</small>:' : k}</button>`).join('')}<button type="button" class="kbtn go" data-k="✔">✔ 確定</button></div>`;
  const show = $('.kp-val', box); let v = '', done = false;
  const draw = () => { show.innerHTML = showIn(v); };
  $$('.kbtn', box).forEach(b => b.onclick = () => {
    if (done) return;
    const k = b.dataset.k; sfx('tap');
    if (k === '⌫') v = v.slice(0, -1);
    else if (k === '✔') {
      if (v === '') return;
      const r = checkAns(v, ans);
      if (r === true) { done = true; show.parentNode.classList.add('right'); api.ok(); onRight(); return; }
      show.parentNode.classList.remove('wrong'); void show.offsetWidth; show.parentNode.classList.add('wrong');
      const h = typeof r === 'string' ? r : (hint || '再算算看！');
      api.bad(h, v + (unit ? ' ' + unit : ''), (typeof ans === 'number' ? fmt(ans) : ans) + (unit ? ' ' + unit : '')); speak(h); if (typeof r !== 'string') v = '';
    } else if (v.length < 9) {
      if (k in name && (v === '' || /_$/.test(v) || (k === '/' ? /[./:]/ : /[./:_]/).test(v))) return;
      v += k;
    }
    draw();
  });
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}], keep, hint, after}；
   有 ans 時改用小鍵盤輸入，unit 是單位、keys 是額外按鍵；有 eq 時改用列式小幫手 */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    const eqm = !!r.eq, typed = !eqm && r.ans !== undefined;
    const okOpt = (r.opts || []).find(o => o.ok);
    curQ = { q: r.q, c: eqm ? '' : typed ? (typeof r.ans === 'number' ? fmt(r.ans) : r.ans) + (r.unit ? ' ' + r.unit : '') : optText(okOpt) };
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${eqm ? 'eqwrap' : typed ? 'kwrap' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2600 : 1000);
    };
    if (eqm) return eqBuild($('.eqwrap', st), r, next);
    if (typed) return keypad($('.kwrap', st), r.ans, next, r.hint, r.unit, r.keys);
    const ops = $('.opts', st);
    (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* ---------- 列式小幫手（2026-11，由五下 eqBuild 搬來，六年級版） ----------
   應用題只要把「算式」列對就過關，答案由電腦用精確分數算，小朋友不用拿紙筆。
   r.eq：算式字串，例如 '24 × 3/5'、'(20 − 2) × (12 − 2) × (8 − 1)'、'600 − 600 × 30%'。
     數字可寫整數、小數、分數 a/b（a/b 是「一個數」）、百分率 p%；運算用 ＋ − × ÷ 和括號。
     也相容三上的陣列寫法 [[a, op, b], [x, op, 'R']]。
   r.alt：其他也算對的列法（字串陣列），可以讓「一步一步列」走別的路。
   r.nums：題目數字不在文字裡（例如在圖上）時，直接給數字按鈕。
   可以一行列完（用括號），也可以一步一步列：列對其中一步，電腦算出答案，下一行用「第 N 步的答案」。
   ＋、× 的順序可以交換；0.48、48%、12/25 都當成同一個數；值對、而且只用到題目數字或標準換算數的列法也算對。
   r.eqRound：列對後，再用小鍵盤填 r.ans（例如四捨五入的概數）。r.frac 有給時，答案用分數顯示。
   r.extra：題目沒寫、但列式要用的數（例如 3.14、360、1000），另外給按鈕。
   r.rem：除法只算到整數商，答案顯示成「商 … 餘數」（例如最多裝滿幾瓶）。 */
const EQ_WHY = {
  '+': '「一共、合起來、再加上」用加法 ＋',
  '−': '「還剩、用掉、扣掉、少了」用減法 −',
  '×': '「每份一樣多，有好幾份」「幾分之幾倍、百分之幾、打幾折」「長 × 寬 × 高」用乘法 ×',
  '÷': '「平分、每份是多少」「比率 ＝ 部分 ÷ 全部」「已知一部分，求全部」用除法 ÷'
};
/* 精確分數 [分子, 分母]，避免 0.1 ＋ 0.2 這種浮點誤差 */
const qN = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const qAdd = (a, b) => qN(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const qMul = (a, b) => qN(a[0] * b[0], a[1] * b[1]);
const qInv = a => a[0] ? qN(a[1], a[0]) : null;
const qKey = a => a[0] + '/' + a[1];
function qLit(s) {
  const m = /^(\d+)(?:\.(\d+))?(?:\/(\d+))?(%)?$/.exec(s); if (!m) return null;
  let v = qN(+(m[1] + (m[2] || '')), 10 ** (m[2] || '').length);
  if (m[3]) { if (+m[3] === 0) return null; v = qMul(v, [1, +m[3]]); }
  if (m[4]) v = qMul(v, [1, 100]);
  return v;
}
/* 精確值轉成文字：能除盡用小數，不然用分數（frac 為 true 一律用分數） */
function qFmt(v, frac) {
  const [n, d] = v; if (d === 1) return String(n);
  let x = d; while (x % 2 === 0) x /= 2; while (x % 5 === 0) x /= 5;
  if (!frac && x === 1) { let k = 0; while ((10 ** k) % d) k++; const s = String(Math.abs(n) * (10 ** k / d)).padStart(k + 1, '0'); return (n < 0 ? '−' : '') + s.slice(0, -k) + '.' + s.slice(-k); }
  const w = Math.floor(n / d), f = fr(n, d);
  if (!frac) return `${f} ≈ ${(Math.floor(n / d * 10000) / 10000).toFixed(4)}…`;
  return w >= 1 ? `${f} ＝ ${w}${fr(n - w * d, d)}` : f;
}
const qTok = v => v[1] === 1 ? String(v[0]) : /<|≈/.test(qFmt(v)) ? qKey(v) : qFmt(v);
const eqTok = s => String(s).replace(/＋/g, '+').replace(/[-－]/g, '−').replace(/[*＊]/g, '×').replace(/（/g, '(').replace(/）/g, ')').match(/\d+(?:\.\d+)?(?:\/\d+)?%?|[+−×÷()]|\S/g) || [];
/* 三上的陣列寫法轉成字串 */
function eqStr(e) {
  if (!Array.isArray(e)) return e;
  const steps = Array.isArray(e[0]) ? e : [e];
  return steps.reduce((s, [a, op, b]) => `(${[a, b].map(x => x === 'R' ? s : x).join(` ${op} `)})`, '');
}
/* 算式樹：葉子 {v, s}；節點 {op:'+'|'×', kids:[{neg, n}]}（neg 在加法是 −、在乘法是 ÷），同種運算攤平 */
function eqNode(op, kids) {
  const out = [];
  kids.forEach(k => { if (k.n.op === op) k.n.kids.forEach(c => out.push({ neg: c.neg !== k.neg, n: c.n })); else out.push(k); });
  return out.length === 1 && !out[0].neg ? out[0].n : { op, kids: out };
}
function eqParse(toks) {
  let i = 0;
  function factor() {
    const t = toks[i++];
    if (t === '(') { const e = expr(); if (toks[i++] !== ')') throw 0; return e; }
    const v = t && qLit(t); if (!v) throw 0;
    return { v, s: t };
  }
  function chain(sub, a, b, op) {
    const kids = [{ neg: false, n: sub() }];
    while (toks[i] === a || toks[i] === b) { const o = toks[i++]; kids.push({ neg: o === b, n: sub() }); }
    return eqNode(op, kids);
  }
  const term = () => chain(factor, '×', '÷', '×'), expr = () => chain(term, '+', '−', '+');
  try { const t = expr(); return i === toks.length ? t : null; } catch (e) { return null; }
}
function eqVal(t) {
  if (t.v) return t.v;
  let acc = t.op === '+' ? [0, 1] : [1, 1];
  for (const k of t.kids) {
    let v = eqVal(k.n); if (!v) return null;
    if (k.neg) { v = t.op === '+' ? [-v[0], v[1]] : qInv(v); if (!v) return null; }
    acc = t.op === '+' ? qAdd(acc, v) : qMul(acc, v);
  }
  return acc;
}
const eqLeaves = t => t.v ? [qKey(t.v)] : t.kids.flatMap(k => eqLeaves(k.n));
const eqSig = t => eqLeaves(t).sort().join(',');
function eqOpList(t, s = []) {
  if (t.v) return s;
  let first = true;
  t.kids.forEach(k => { if (k.neg) s.push(t.op === '+' ? '−' : '÷'); else if (first) first = false; else s.push(t.op === '+' ? '+' : '×'); eqOpList(k.n, s); });
  return s;
}
const eqOpsOf = t => new Set(eqOpList(t)), eqOpSig = t => eqOpList(t).sort().join('');
/* 列出所有「可以先算的一部分」：make(R) 把那一部分換成第 N 步的答案 */
function eqSubs(t) {
  if (t.v) return [];
  const out = [], n = t.kids.length;
  for (let m = 1; m < (1 << n); m++) {
    const pk = t.kids.filter((_, j) => m >> j & 1), rest = t.kids.filter((_, j) => !(m >> j & 1));
    if (pk.length < 2) continue;
    /* 全部是 ÷（或 −）的一組，例如 ÷ (50 × 40) 攤平成 ÷ 50 ÷ 40：先算 50 × 40，再 ÷ 答案 */
    if (pk.every(k => k.neg)) { out.push({ t: { op: t.op, kids: pk.map(k => ({ neg: false, n: k.n })) }, make: R => eqNode(t.op, [...rest, { neg: true, n: R }]) }); continue; }
    out.push({ t: { op: t.op, kids: pk }, make: R => rest.length ? eqNode(t.op, [...rest, { neg: false, n: R }]) : R });
  }
  t.kids.forEach((k, j) => eqSubs(k.n).forEach(s => out.push({ t: s.t, make: R => eqNode(t.op, t.kids.map((c, x) => x === j ? { neg: c.neg, n: s.make(R) } : c)) })));
  return out;
}
/* 題目裡的數字（分數、小數、百分率都算） */
function eqNums(r) {
  if (r.nums) return r.nums.map(String);
  const plain = String(r.q || '').replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/(\d),(?=\d{3})/g, '$1');
  return [...new Set(plain.match(/\d+(?:\.\d+)?(?:\/\d+)?%?/g) || [])];
}
/* 判斷一行算式。S = {paths, allowed}；回傳 {final} / {step, next} / {bad} */
function eqJudge(S, toks) {
  if (!toks.length) return { bad: 'empty' };
  const t = eqParse(toks); if (!t) return { bad: 'syntax' };
  const v = eqVal(t); if (!v) return { bad: 'zero' };
  if (t.v) return { bad: 'noop' };
  const key = qKey(v), sig = eqSig(t), leaves = eqLeaves(t), target = qKey(eqVal(S.paths[0]));
  const ops = eqOpSig(t);
  const match = x => eqSig(x) === sig && qKey(eqVal(x)) === key && eqOpSig(x) === ops;
  if (S.paths.some(match)) return { final: v };
  const pathLeaves = new Set(S.paths.flatMap(eqLeaves));
  if (key === target && leaves.every(l => S.allowed.has(l) && (l !== target || pathLeaves.has(l)))) return { final: v };
  const next = [];
  S.paths.forEach(p => eqSubs(p).forEach(s => { if (match(s.t)) next.push(s.make); }));
  if (next.length) return { step: v, next };
  if (!leaves.every(l => S.allowed.has(l))) return { bad: 'num' };
  const kOps = eqOpsOf(t);
  const same = S.paths.flatMap(p => [p, ...eqSubs(p).map(s => s.t)]).filter(x => eqSig(x) === sig);
  if (same.length) {
    const exact = same.find(x => eqOpSig(x) === eqOpSig(t));
    if (!exact) { const xo = eqOpList(same[0]), ko = eqOpList(t), cnt = (a, o) => a.filter(y => y === o).length; return { bad: 'op', op: xo.find(o => cnt(xo, o) > cnt(ko, o)) || xo[0] }; }
    return { bad: kOps.has('−') || kOps.has('÷') ? 'order' : 'paren' };
  }
  const pOps = eqOpsOf(S.paths[0]);
  if (![...kOps].some(o => pOps.has(o))) return { bad: 'op', op: [...pOps][0] };
  return { bad: 'nums' };
}
const eqIsNum = s => /^\d/.test(s);
const eqTokHTML = s => {
  const m = /^(\d+(?:\.\d*)?)\/(\d*)(%?)$/.exec(s);
  return m ? fr(m[1], m[2] || '□') + m[3] : eqIsNum(s) ? s : `<i class="eq-o">${s}</i>`;
};
function eqBuild(box, r, onRight) {
  const paths = [r.eq, ...(r.alt || [])].map(e => eqParse(eqTok(eqStr(e))));
  if (paths.some(p => !p)) console.error('列式小幫手：算式寫錯了', r.eq, r.alt);
  const nums = eqNums(r), extra = (r.extra || []).map(String).filter(n => !nums.includes(n)), frac = !!r.frac;
  if (paths[0]) { // 家長報表：正確算式和答案
    const v0 = eqVal(paths[0]), q0 = Math.floor(v0[0] / v0[1]);
    const ans = r.rem ? `${q0} … ${qFmt(qMul(qAdd(v0, [-q0, 1]), qLit(String(r.rem))))}` : qFmt(v0, frac);
    curQ = { q: r.q, c: `${Array.isArray(r.eq) ? eqStr(r.eq).slice(1, -1) : r.eq} = ${ans}${r.eqRound ? `，答案 ${r.ans}` : ''}${r.unit && (!r.rem || r.eqRound) ? ' ' + r.unit : ''}` };
  }
  const S = { paths: paths.filter(Boolean), allowed: new Set([...nums.concat(extra).map(qLit).filter(Boolean).map(qKey), ...paths.filter(Boolean).flatMap(eqLeaves)]) };
  const rows = [];
  let finished = false;
  box.innerHTML = `<div class="eq-tip">✏️ 不用自己算！把<b>算式</b>列出來，答案電腦幫你算。<br><small>可以一次列完（先算的加括號），也可以一步一步列。分數用「／」鍵，例如 3／4。</small></div>
    <div class="eq-chips">${nums.length ? '<span class="eq-lbl">題目裡的數字：</span>' : '<span class="eq-lbl">數字在圖上，用下面的鍵盤輸入：</span>'}${nums.map(n => `<button type="button" class="eq-chip" data-n="${n}">${eqTokHTML(n)}</button>`).join('')}${extra.length ? `<span class="eq-lbl">可能用到：</span>${extra.map(n => `<button type="button" class="eq-chip ext" data-n="${n}">${eqTokHTML(n)}</button>`).join('')}` : ''}</div>
    <div class="eq-rows"></div>
    <div class="eq-pad">${['7', '8', '9', '+', '−', '4', '5', '6', '×', '÷', '1', '2', '3', '(', ')', '0', '.', '/', '%', '⌫'].map(k => `<button type="button" class="eq-key${'+−×÷'.includes(k) ? ' op' : '()/%'.includes(k) ? ' fn' : k === '⌫' ? ' del' : ''}" data-k="${k}">${k === '/' ? '分數／' : k}</button>`).join('')}</div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn teal eq-go">✔ 檢查算式</button></div>
    <div class="kwrap eq-round"></div>`;
  const rowsBox = $('.eq-rows', box), msg = $('.eq-msg', box), chips = $('.eq-chips', box);
  const row = () => rows[rows.length - 1];
  function addRow() {
    const el = document.createElement('div'); el.className = 'eq-row';
    el.innerHTML = `${rows.length ? `<div class="eq-step">第 ${rows.length + 1} 步</div>` : ''}<div class="eq-line"><div class="eq-expr"></div><span class="eq-sign">=</span><span class="eq-res">?</span><button type="button" class="eq-clr" title="清除這一行">🧹</button></div>`;
    rowsBox.appendChild(el);
    const w = { el, T: [] }; rows.push(w);
    $('.eq-clr', el).onclick = () => { if (w.done || finished) return; w.T = []; sfx('tap'); draw(); };
    draw();
  }
  function draw() {
    rows.forEach(w => { $('.eq-expr', w.el).innerHTML = w.T.map(t => `<span class="eq-t${t.lock ? ' lock' : ''}">${eqTokHTML(t.s)}</span>`).join('') + (w.done ? '' : '<span class="eq-caret"></span>'); });
  }
  const hint = s => { toast(s); speak(s); };
  function put(s) {
    if (finished) return;
    const T = row().T, last = T[T.length - 1];
    if (last && (eqIsNum(last.s) || last.s === ')')) return hint('數字後面要先放符號喔！');
    T.push({ s, lock: true }); sfx('pop'); draw();
  }
  chips.addEventListener('click', e => { const c = e.target.closest('.eq-chip'); if (c) put(c.dataset.n); });
  $$('.eq-key', box).forEach(b => b.onclick = () => {
    if (finished) return;
    const k = b.dataset.k, T = row().T, last = T[T.length - 1], ls = last ? last.s : '';
    const open = last && eqIsNum(ls) && !last.lock && !ls.endsWith('%');
    sfx('tap');
    if (/\d/.test(k)) {
      if (open) { if (ls.length < 9) last.s = ls === '0' ? k : ls + k; }
      else if (last && (eqIsNum(ls) || ls === ')')) return hint('數字後面要先放符號喔！');
      else T.push({ s: k });
    } else if (k === '.') {
      if (open && !/[./]/.test(ls)) last.s += '.';
      else if (!last || !(eqIsNum(ls) || ls === ')')) T.push({ s: '0.' });
    } else if (k === '/') {
      if (open && !ls.includes('/') && !ls.endsWith('.')) last.s += '/';
      else hint('先打分子，再按「分數／」，再打分母。');
    } else if (k === '%') {
      if (open && !ls.endsWith('/') && !ls.endsWith('.')) last.s += '%';
      else hint('先打數字，再按 %。');
    } else if ('+−×÷'.includes(k)) {
      if (last && (eqIsNum(ls) || ls === ')')) T.push({ s: k });
      else if (last && '+−×÷'.includes(ls)) last.s = k;
      else return hint('先放數字，再放符號喔！');
    } else if (k === '(') {
      if (!last || '+−×÷('.includes(ls)) T.push({ s: '(' });
      else return hint('括號前面要先放符號喔！');
    } else if (k === ')') {
      const depth = T.filter(t => t.s === '(').length - T.filter(t => t.s === ')').length;
      if (depth > 0 && last && (eqIsNum(ls) || ls === ')')) T.push({ s: ')' });
    } else if (k === '⌫') {
      if (open && ls.length > 1) last.s = ls.slice(0, -1); else T.pop();
    }
    draw();
  });
  const MSG = {
    empty: () => '還沒有列算式喔！點題目裡的數字和符號來列式。',
    syntax: () => '算式還沒列完整：數字和符號要一個接一個，分數要有分母，括號也要成對喔！',
    zero: () => '不能除以 0 喔！',
    noop: () => '要列出「算式」（數字和符號），不是只寫一個數喔！',
    num: () => `${r.hint ? r.hint + '　' : ''}有一個數字題目裡沒有直接寫，先想想要怎麼換算喔！`,
    op: j => `${r.hint ? r.hint + '　' : ''}${EQ_WHY[j.op]}`,
    order: () => '數字和符號都找對了！減法要把原本的量放前面，除法要把被分的量放前面；先算的部分記得加括號。',
    paren: () => '數字和符號都找對了！想想看哪一部分要先算，要不要加括號？',
    nums: () => `符號對了！數字再檢查一下。${r.hint || '再讀一次題目，找出要算的是哪些數。'}`
  };
  $('.eq-go', box).onclick = () => {
    if (finished) return;
    const w = row(), j = eqJudge(S, w.T.map(t => t.s));
    if (j.bad) {
      const text = MSG[j.bad](j);
      w.el.classList.remove('shake'); void w.el.offsetWidth; w.el.classList.add('shake');
      msg.innerHTML = '💡 ' + text; api.bad(text.replace(/<[^>]+>/g, ''), w.T.map(t => t.s).join(' ') || '（還沒列）'); speak(text);
      return;
    }
    const v = j.final || j.step, res = $('.eq-res', w.el);
    w.done = true; w.el.classList.add('done'); res.innerHTML = qFmt(v, frac); res.classList.add('pop'); draw();
    if (j.step) {
      const k = rows.length, R = { v, s: qTok(v) };
      S.paths = j.next.map(mk => mk(R));
      S.allowed.add(qKey(v));
      if (k === 1) w.el.insertAdjacentHTML('afterbegin', '<div class="eq-step">第 1 步</div>');
      chips.insertAdjacentHTML('beforeend', `<button type="button" class="eq-chip res" data-n="${R.s}">第 ${k} 步答案 ${eqTokHTML(R.s)}</button>`);
      msg.innerHTML = `✅ 第 ${k} 步列對了！電腦算出 <b>${qFmt(v, frac)}</b>，接著列下一步（可以點「第 ${k} 步答案」）。`;
      sfx('ok'); speak(`列對了，答案是 ${qFmt(v, frac)}。接著列下一步`);
      if (rows.length < 6) addRow();
      return;
    }
    finished = true; $('.eq-go', box).disabled = true;
    if (r.rem) { /* 商只算到整數：餘數 = (商 − 整數商) × 除數 */
      const q = Math.floor(v[0] / v[1]), left = qMul(qAdd(v, [-q, 1]), qLit(String(r.rem)));
      res.innerHTML = `${q} … ${qFmt(left)}`;
      msg.innerHTML = `✅ 算式列對了！商是 <b class="eq-ans">${q}</b>，餘數是 <b>${qFmt(left)}</b>`;
    } else msg.innerHTML = `✅ 算式列對了！答案是 <b class="eq-ans">${qFmt(v, frac)}${r.unit ? ' ' + r.unit : ''}</b>`;
    api.ok();
    if (r.eqRound) {
      msg.insertAdjacentHTML('beforeend', `<br>${r.roundQ || '再用四捨五入取概數：'}`); speak(r.roundQ || '再用四捨五入取概數');
      return keypad($('.eq-round', box), r.ans, onRight, r.hint, r.unit, r.keys);
    }
    later(onRight, 700);
  };
  addRow();
}

/* 拖曳（滑鼠、觸控都可）：回傳指標在元素內的位置給 onMove，放開時呼叫 onEnd */
function dragOn(el, onMove, onEnd) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (er) {}
    const at = ev => { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top, r]; };
    onMove(...at(e));
    const mv = ev => onMove(...at(ev));
    const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); onEnd && onEnd(); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}
