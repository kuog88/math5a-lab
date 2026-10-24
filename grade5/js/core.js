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
  return s.replace(/(\d+)_(\d*)\/(\d*)/, (m, w, a, b) => `${w}${fr(a || '□', b || '□')}`)
    .replace(/(\d*)\/(\d*)/, (m, a, b) => fr(a || '□', b || '□')).replace(/_(\d*)$/, (m, a) => ` ${a || '□'}`).replace(/:/, ' : ');
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
    const typed = r.ans !== undefined;
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${typed ? 'kwrap' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2600 : 1000);
    };
    if (typed) return keypad($('.kwrap', st), r.ans, next, r.hint, r.unit, r.keys);
    const ops = $('.opts', st);
    (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
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
