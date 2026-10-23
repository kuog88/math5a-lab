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
function pics(e, n, sm) { if (!n) return ''; return `<span class="pics${sm ? ' sm' : ''}" style="grid-template-columns:repeat(${Math.min(5, n)},1fr)">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span>`; }
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
      api.bad(o.hint || hint || '再想想看！');
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
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${r.pad ? 'numpad' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const ops = $(r.pad ? '.numpad' : '.opts', st);
    (r.keep || r.pad ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, () => {
      if (r.after) $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`);
      if (r.after) speak(r.after);
      i++; later(show, r.after ? 1900 : 1000);
    }, r.hint)));
  }
  show();
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
