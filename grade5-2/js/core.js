'use strict';
/* 五年級下學期・沙漠金字塔尋寶隊：共用工具（進度、音效、朗讀、題目、拖曳） */
const KEY = 'math-g5-2-stars';
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

/* ---------- 聲音（金幣叮噹音色） ---------- */
let muted = false, AC = null;
function sfx(type) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [523, 784], bad: [220, 165], tap: [700], win: [392, 523, 659, 784, 1046], pop: [1100, 1500] }[type] || [440];
    seq.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type === 'bad' ? 'sawtooth' : 'triangle';
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
    .replace(/(\d+(?:\.\d+)?)\s*%/g, '百分之$1').replace(/cm³/g, '立方公分').replace(/m³/g, '立方公尺').replace(/km²/g, '平方公里').replace(/m²/g, '平方公尺').replace(/°/g, '度').replace(/=/g, '等於').replace(/[＞>]/g, '大於').replace(/[＜<]/g, '小於').replace(/○/g, '圈圈').replace(/…/g, '餘');
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
function coins() {
  const box = $('#confetti');
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    const s = rand(10, 34);
    c.style.left = Math.random() * 100 + 'vw'; c.style.width = c.style.height = s + 'px'; c.textContent = pick(['🪙', '✨', '💎']); c.style.fontSize = s + 'px';
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
const rd = (v, k = 6) => Math.round(v * 10 ** k) / 10 ** k;
const gcd = (a, b) => b ? gcd(b, a % b) : a;
/* 最簡分數 */
const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const FS = (n, d) => { const [a, b] = simp(n, d); return b === 1 ? `${a}` : F(a, b); };

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
function keypad(box, ans, onRight, hint, unit = '', forceDec = false) {
  const dec = forceDec || !Number.isInteger(ans);
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
    } else if (k === '.') { if (!v.includes('.') && v.length < 8) v = (v || '0') + '.'; }
    else if (v.length < 9) v = (v === '0' ? '' : v) + k;
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


/* 分數輸入：上面分子、下面分母。等值分數也算對；simplest 為 true 時要最簡分數 */
function fracpad(box, ans, onRight, hint, simplest = false) {
  const vals = ['', ''];
  let at = 0, done = false;
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'];
  box.innerHTML = `<div class="fp"><button type="button" class="kp-show slot" data-i="0"><span class="kp-val"></span><span class="kp-unit">分子</span></button><div class="fp-line"></div><button type="button" class="kp-show slot" data-i="1"><span class="kp-val"></span><span class="kp-unit">分母</span></button></div>
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
      const n = +vals[0], d = +vals[1];
      const eq = d > 0 && n * ans[1] === d * ans[0];
      if (eq && (!simplest || gcd(n, d) === 1)) { done = true; slots.forEach(s => s.classList.add('right')); api.ok(); onRight(); return; }
      slots.forEach(s => { s.classList.remove('wrong'); void s.offsetWidth; s.classList.add('wrong'); });
      vals[0] = vals[1] = ''; at = 0;
      const h = eq ? '答案對了，但還可以再約分成最簡分數喔！' : (hint || '再算算看！');
      api.bad(h); speak(h);
    } else if (vals[at].length < 4) vals[at] = (vals[at] === '0' ? '' : vals[at]) + k;
    draw();
  });
  draw();
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   {q, sp, vis, opts:[{h,ok,hint}], keep, hint, after}；有 ans 用小鍵盤（dec 一定有小數點鍵）；
   有 ans2:[a,b], labels 用兩格輸入；有 frac:[分子,分母] 用分數輸入（simplest 要最簡） */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    const typed = r.ans !== undefined || r.ans2 !== undefined || r.frac !== undefined;
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${typed ? 'kwrap' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2200 : 1000);
    };
    if (r.frac) return fracpad($('.kwrap', st), r.frac, next, r.hint, r.simplest);
    if (r.ans2) return keypad2($('.kwrap', st), r.labels, r.ans2, next, r.hint);
    if (typed) return keypad($('.kwrap', st), r.ans, next, r.hint, r.unit, r.dec);
    const ops = $('.opts', st);
    (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
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
