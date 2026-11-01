'use strict';
/* 五年級數學樂園：共用工具（音效、朗讀、題目、小鍵盤、拖曳、分數） */
const KEY = 'math-g5-stars';
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
const N = v => `<span class="num">${v}</span>`;

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
      const h = o.hint || hint || '再想想看！';
      api.bad(h); speak(h);
    }
  };
  return b;
}
/* 數字選項 */
function numOpts(ans, wrongs, unit = '') {
  const s = [...new Set([fmt(ans), ...wrongs.map(fmt)])].slice(0, 4);
  return s.map(v => ({ h: `${N(v)}${unit ? `<small>${unit}</small>` : ''}`, ok: v === fmt(ans) }));
}

/* 解析鍵盤輸入：整數、小數、分數 a/b、帶分數 a_b/c、比 a:b */
function parseIn(s) {
  if (/^\d+:\d+$/.test(s)) return { ratio: s.split(':').map(Number) };
  let m = s.match(/^(\d+)_(\d+)\/(\d+)$/);
  if (m) { const w = +m[1], a = +m[2], b = +m[3]; return b ? { v: w + a / b, frac: [w * b + a, b], mixed: a < b } : null; }
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
      api.bad(h); speak(h); if (typeof r !== 'string') v = '';
    } else if (v.length < 9) {
      if (k in name && (v === '' || /_$/.test(v) || (k === '/' ? /[./:]/ : /[./:_]/).test(v))) return;
      v += k;
    }
    draw();
  });
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}], keep, hint, after}；
   有 ans 時改用小鍵盤輸入，unit 是單位、keys 是額外按鍵 */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    const eqm = !!r.eq, typed = !eqm && r.ans !== undefined;
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

/* ---------- 列式小幫手（2026-11，三年級做法移植） ----------
   應用題只要把「算式」列對就過關，答案由電腦用精確分數算，小朋友不用拿紙筆。
   r.eq：算式字串，例如 `(${t} + ${b}) × ${h} ÷ 2`；分數寫 3/4、帶分數寫 1_2/3、小數直接寫 2.5。
         也接受三年級的寫法 [a, op, b]、[[a, op, b], [x, op, 'R']]（'R' 是上一步、'R1' 是第 1 步的答案）。
   r.alt：其他也算對的列法（陣列，每個格式同 eq）。
   一列算一次「□ ○ □」。＋、× 前後交換，連加減、連乘除裡先算哪兩個數都算對（只要是同一個算式）。
   r.known：題目沒直接寫、列式會用到的數（180、60、2…），只用來給提示；r.chips：多放的數字按鈕（題目寫「七邊形」時放 7）。
   r.rem：整數除法顯示「商 … 餘」。 */
const EQ_OPS = ['+', '−', '×', '÷'];
const EQ_WHY = {
  '+': '「一共、合起來、比……多（要找多的那個）」通常用加法 ＋',
  '−': '「還剩、用掉、比……多幾、找回」通常用減法 −',
  '×': '「每一份一樣多，有好幾份」用乘法 ×',
  '÷': '「平分、每份幾個、可以分成幾份」用除法 ÷'
};
/* 精確分數 {n, d}，不用小數計算，避免 0.1 + 0.2 的誤差 */
const Qn = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
function Qp(s) {
  s = String(s).trim();
  let m = s.match(/^(\d+)_(\d+)\/(\d+)$/); if (m) return +m[3] ? Qn(+m[1] * +m[3] + +m[2], +m[3]) : null;
  m = s.match(/^(\d+)\/(\d+)$/); if (m) return +m[2] ? Qn(+m[1], +m[2]) : null;
  m = s.match(/^(\d+)(?:\.(\d+))?$/); if (m) return Qn(+(m[1] + (m[2] || '')), 10 ** (m[2] || '').length);
  return null;
}
const Qeq = (a, b) => !!a && !!b && a.n === b.n && a.d === b.d;
function Qop(a, op, b) {
  if (op === '+') return Qn(a.n * b.d + b.n * a.d, a.d * b.d);
  if (op === '−') return Qn(a.n * b.d - b.n * a.d, a.d * b.d);
  if (op === '×') return Qn(a.n * b.n, a.d * b.d);
  return b.n ? Qn(a.n * b.d, a.d * b.n) : null;
}
const Qdec = q => { let d = q.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
/* 給按鈕、格子用的寫法：整數、a/b、帶分數 w_a/b；dec 時能化成小數就寫小數 */
const Qs = (q, dec) => q.d === 1 ? String(q.n) : dec && Qdec(q) ? fmt(q.n / q.d) : q.n > q.d ? `${Math.floor(q.n / q.d)}_${q.n % q.d}/${q.d}` : `${q.n}/${q.d}`;
/* 算式字串 → 運算樹。連加減、連乘除攤平成同一層：{k:'s'|'p', it:[{s:±1, n}]}，數字是 {v} */
function eqParse(src) {
  const t = String(src).match(/\d+_\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[-+−×*÷()]/g) || [];
  let i = 0;
  const atom = () => { const k = t[i++]; if (k === '(') { const e = expr(); i++; return e; } return { v: Qp(k) }; };
  const term = () => { let e = atom(); while (t[i] && '×÷*'.includes(t[i])) { const o = t[i++] === '÷' ? '÷' : '×'; e = { o, a: e, b: atom() }; } return e; };
  const expr = () => { let e = term(); while (t[i] && '+−-'.includes(t[i])) { const o = t[i++] === '+' ? '+' : '−'; e = { o, a: e, b: term() }; } return e; };
  const flat = e => {
    if (e.v) return { v: e.v };
    const k = e.o === '+' || e.o === '−' ? 's' : 'p', it = [];
    const add = (x, s) => { const n = flat(x); if (n.k === k) n.it.forEach(y => it.push({ s: y.s * s, n: y.n })); else it.push({ s, n }); };
    add(e.a, 1); add(e.b, e.o === '−' || e.o === '÷' ? -1 : 1);
    return { k, it };
  };
  return flat(expr());
}
/* 三年級的陣列寫法 → 算式字串 */
function eqSrc(e) {
  if (!Array.isArray(e)) return String(e);
  const steps = Array.isArray(e[0]) ? e : [e], out = [];
  steps.forEach(([a, op, b], k) => { const f = x => x === 'R' ? out[k - 1] : /^R\d$/.test(x) ? out[+x[1] - 1] : String(x); out.push(`(${f(a)} ${op} ${f(b)})`); });
  return out[out.length - 1];
}
/* 在樹裡找「a op b」能算的地方，回傳算完之後的所有可能樹 */
function eqStep(nd, a, op, b) {
  if (nd.v) return [];
  const out = [], sum = nd.k === 's';
  const re = (it) => it.length === 1 && it[0].s === 1 ? it[0].n : { k: nd.k, it };
  nd.it.forEach((y, i) => eqStep(y.n, a, op, b).forEach(c => { const it = nd.it.slice(); it[i] = { s: y.s, n: c }; out.push(re(it)); }));
  if ((sum ? ['+', '−'] : ['×', '÷']).includes(op)) {
    const plus = op === '+' || op === '×', v = Qop(a, op, b);
    if (v && v.n >= 0) nd.it.forEach((x, i) => nd.it.forEach((y, j) => {
      if (i === j || !x.n.v || !y.n.v || !Qeq(x.n.v, a) || !Qeq(y.n.v, b)) return;
      if (plus ? x.s !== y.s : !(x.s === 1 && y.s === -1)) return;
      const it = nd.it.filter((_, k) => k !== i && k !== j);
      it.splice(Math.min(i, j), 0, { s: plus ? x.s : 1, n: { v } });
      out.push(re(it));
    }));
  }
  return out;
}
/* 現在可以算的每一步（給提示用） */
function eqReady(nd, out = []) {
  if (nd.v) return out;
  nd.it.forEach(y => eqReady(y.n, out));
  const sum = nd.k === 's';
  nd.it.forEach((x, i) => nd.it.forEach((y, j) => {
    if (i === j || !x.n.v || !y.n.v) return;
    if (x.s === y.s) out.push({ a: x.n.v, op: sum ? '+' : '×', b: y.n.v });
    else if (x.s === 1) out.push({ a: x.n.v, op: sum ? '−' : '÷', b: y.n.v });
  }));
  return out;
}
/* 題目文字裡的數字（分數、帶分數也抓） */
function eqNums(q) {
  const s = String(q || '').replace(/(\d+)<span class="fr"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g, ' $1_$2/$3 ')
    .replace(/<span class="fr"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g, ' $1/$2 ').replace(/<[^>]+>/g, ' ');
  return s.match(/\d+_\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?/g) || [];
}
function eqBuild(box, r, onRight) {
  const srcs = [r.eq].concat(r.alt || []).map(eqSrc);
  let states = srcs.map(eqParse), rows = [], results = [], act = null, finished = false;
  const dec = srcs.some(s => /\d\.\d/.test(s)), frac = srcs.some(s => /\d\/\d/.test(s)) || (r.keys || []).includes('/');
  const nums = [];
  eqNums(r.q).concat((r.chips || []).map(String)).forEach(s => { if (Qp(s) && !nums.some(x => Qeq(Qp(x), Qp(s)))) nums.push(s); });
  const chip = (s, cls = '') => `<button type="button" class="eq-chip${cls}" data-n="${s}">${showIn(s)}</button>`;
  const keys = ['7', '8', '9', '+', '4', '5', '6', '−', '1', '2', '3', '×', '⌫', '0', '🧹', '÷'].concat(frac ? ['/', '_', ...(dec ? ['.'] : [''])] : dec ? ['.'] : []);
  const kl = { '/': '<small>分數</small>／', '_': '<small>帶分數</small>又', '.': '<small>小數點</small>.' };
  box.innerHTML = `<div class="eq-tip">✏️ 不用自己算！把<b>算式</b>排出來，答案電腦幫你算。</div>
    <div class="eq-chips">${nums.length ? '<span class="eq-lbl">題目裡的數字：</span>' : ''}${nums.map(s => chip(s)).join('')}</div>
    <div class="eq-rows"></div>
    <div class="eq-pad">${keys.map(k => k === '' ? '<span></span>' : `<button type="button" class="eq-key${EQ_OPS.includes(k) ? ' op' : kl[k] ? ' sym' : ''}" data-k="${k}">${kl[k] || k}</button>`).join('')}</div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn mint eq-go">✔ 檢查算式</button></div>`;
  const rowsBox = $('.eq-rows', box), msg = $('.eq-msg', box);
  const nOps = nd => nd.v ? 0 : nd.it.length - 1 + nd.it.reduce((t, y) => t + nOps(y.n), 0);
  const multi = Math.min(...states.map(nOps)) > 1;
  function addRow() {
    const i = rows.length;
    const el = document.createElement('div'); el.className = 'eq-row';
    el.innerHTML = `${multi ? `<div class="eq-step">第 ${i + 1} 步${results.length ? `　<span class="eq-lbl">用前面的答案：</span>${results.map(s => chip(s, ' sm')).join('')}` : ''}</div>` : ''}
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
      s.innerHTML = v === '' ? (k === 'op' ? '○' : '□') : k === 'op' ? v : showIn(v);
      s.classList.toggle('filled', v !== '');
      s.classList.toggle('act', !row.done && !!act && act.r === i && act.k === k);
    }));
  }
  const row = () => rows[act.r];
  const advance = () => { const nx = ['a', 'op', 'b'].find(k => row()[k] === ''); if (nx) act.k = nx; };
  function putNum(n) {
    if (finished || !act || row().done) return;
    if (act.k === 'op') act.k = row().a === '' ? 'a' : 'b';
    row()[act.k] = String(n); sfx('pop'); advance(); draw();
  }
  $$('.eq-chips .eq-chip', box).forEach(c => c.onclick = () => putNum(c.dataset.n));
  $$('.eq-key', box).forEach(b => b.onclick = () => {
    if (finished || !act || row().done) return;
    const k = b.dataset.k, w = row(); sfx('tap');
    if (EQ_OPS.includes(k)) { w.op = k; act.k = 'op'; advance(); }
    else if (k === '⌫') { if (act.k === 'op') w.op = ''; else w[act.k] = w[act.k].slice(0, -1); }
    else if (k === '🧹') { w.a = w.op = w.b = ''; act.k = 'a'; }
    else {
      if (act.k === 'op') act.k = w.a === '' ? 'a' : 'b';
      const v = w[act.k];
      if (kl[k] && (v === '' || /_$/.test(v) || (k === '/' ? /[./]/ : /[./_]/).test(v))) return;
      if (v.length < 9) w[act.k] = (v === '0' && !kl[k] ? '' : v) + k;
    }
    draw();
  });
  function bad(text) {
    const w = rows[rows.length - 1];
    w.el.classList.remove('shake'); void w.el.offsetWidth; w.el.classList.add('shake');
    msg.innerHTML = '💡 ' + text; api.bad(text.replace(/<[^>]+>/g, '')); speak(text);
  }
  const pre = r.hint ? r.hint + '　' : '';
  $('.eq-go', box).onclick = () => {
    if (finished) return;
    const w = rows[rows.length - 1];
    if (w.a === '' || w.op === '' || w.b === '') return bad('還有格子是空的喔！兩個數字和中間的符號都要放進去。');
    const a = Qp(w.a), b = Qp(w.b);
    if (!a || !b) return bad('有一個數字還沒打完整，分數要有分子和分母喔！');
    if (w.op === '÷' && b.n === 0) return bad('不能除以 0 喔！');
    const next = [], seen = new Set();
    states.forEach(s => eqStep(s, a, w.op, b).forEach(t => { const k = JSON.stringify(t); if (!seen.has(k)) { seen.add(k); next.push(t); } }));
    if (!next.length) {
      const moves = states.flatMap(s => eqReady(s));
      const pair = moves.filter(m => (Qeq(m.a, a) && Qeq(m.b, b)) || (Qeq(m.a, b) && Qeq(m.b, a)));
      if (pair.some(m => m.op === w.op)) return bad(w.op === '−' ? '減法要把<b>比較大的數</b>（原本全部的）放在前面喔！' : '除法要把<b>全部的數量</b>放前面，分成幾份（每份幾個）放後面喔！');
      if (pair.length) return bad(`${pre}${EQ_WHY[pair[0].op]}`);
      if (!moves.some(m => m.op === w.op)) return bad(`${pre}${EQ_WHY[moves[0].op]}`);
      const known = nums.concat(results, (r.known || []).map(String), (r.chips || []).map(String)).map(Qp);
      if (![a, b].every(v => known.some(k => Qeq(k, v)))) return bad(`${pre}有一個數字題目裡沒有直接寫，先想想要怎麼換算喔！`);
      return bad(`符號對了！數字再檢查一下。${r.hint || '再讀一次題目，找出要算的是哪兩個數。'}`);
    }
    // 這一步列對了：電腦幫忙算
    states = next; w.done = true; w.el.classList.add('done'); act = null; draw();
    const v = Qop(a, w.op, b), rem = r.rem && w.op === '÷' && a.d === 1 && b.d === 1 && a.n % b.n;
    const shown = rem ? `${Math.floor(a.n / b.n)} … ${a.n % b.n}` : showIn(Qs(v, dec));
    results.push(Qs(v, dec));
    const res = $('.res', w.el); res.innerHTML = shown; res.classList.add('pop');
    sfx('ok');
    if (!states.some(s => s.v)) {
      msg.innerHTML = `✅ 第 ${rows.length} 步列對了！電腦算出 <b>${shown}</b>，接著列下一步。`;
      speak(`列對了，答案是 ${spText(shown)}。接著列下一步`); addRow(); return;
    }
    finished = true; $('.eq-go', box).disabled = true;
    msg.innerHTML = `✅ 算式列對了！答案是 <b class="eq-ans">${shown}${r.unit && !rem ? ' ' + r.unit : ''}</b>`;
    api.ok(); later(onRight, 700);
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
