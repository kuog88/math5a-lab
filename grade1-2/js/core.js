'use strict';
/* 一年級下學期・森林小火車：共用工具（音效、朗讀、題目、拖曳、畫圖） */
const KEY = 'math-g1-2-stars';
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
  const box = $('#confetti'), cs = ['#2f8f5b', '#e2574c', '#f6c443', '#8b5a2b', '#4fa3d9', '#f28c38'];
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
/* 家長報表：curQ 是目前的題目和正確答案（quiz、eqBuild 會設定；其他關卡用松鼠站長說的話當題目） */
let curQ = null;
function rep(ok, a, c) { window.KGReport && KGReport.answer(ok, { q: curQ ? curQ.q : lastQ, a, c: c !== undefined ? c : curQ ? curQ.c : '' }); }
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
  for (let v = hi + 1; s.size < 2; v++) s.add(v); // 範圍太小也至少 2 個
  return shuffle([...s]).map(v => ({ h: N(v), ok: v === ans }));
}
function numpadOpts(ans, lo = 0, hi = 10) { const a = []; for (let v = lo; v <= hi; v++) a.push({ h: N(v), ok: v === ans }); return a; }

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}], keep, pad, hint, after}；有 eq 時改用列式小幫手 */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    const eqm = !!r.eq;
    curQ = { q: r.q, c: eqm ? eqAns(r) : optText((r.opts || []).find(o => o.ok)) };
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${eqm ? 'eqwrap' : r.pad ? 'numpad' : 'opts'}"></div>`;
    api.say(r.q, eqm ? `${r.sp || r.q}。點數字和符號，列出算式！` : r.sp);
    const next = () => {
      if (r.after) $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`);
      if (r.after) speak(r.after);
      i++; later(show, r.after ? 1900 : 1000);
    };
    if (eqm) return eqBuild($('.eqwrap', st), r, next);
    const ops = $(r.pad ? '.numpad' : '.opts', st);
    (r.keep || r.pad ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* ---------- 列式小幫手（2026-11，一年級版） ----------
   應用題只要把「算式」列對就過關，答案由電腦算，小朋友不用拿紙筆。
   一年級只有一步：r.eq 寫 [a, op, b]（op 是 '+' 或 '−'）；r.alt 放其他也算對的列法。＋ 前後交換也算對。
   題目裡的數字變成大按鈕（r.nums 可補上圖表裡才看得到的數字），r.icon 是按鈕上的小圖示，r.unit 是答案的單位。
   一年級版只用點的：沒有數字鍵，符號只有 ＋ −。每個提示都會朗讀。 */
const EQ_WHY = { '+': '合起來、又多了，用加法 ＋', '−': '拿走、用掉、還剩幾個、多幾個，用減法 −' };
const eqAns = r => { const [a, op, b] = r.eq; return `${a} ${op} ${b} = ${op === '+' ? a + b : a - b}${r.unit ? ' ' + r.unit : ''}`; };
function eqBuild(box, r, onRight) {
  curQ = { q: r.q, c: eqAns(r) };
  const paths = [r.eq].concat(r.alt || []);
  const plain = String(r.q || '').replace(/<[^>]+>/g, '');
  const nums = [...new Set((plain.match(/\d+/g) || []).map(Number).concat(r.nums || [], paths.flatMap(p => [p[0], p[2]])))];
  const ic = r.icon ? `<span class="eq-ic">${r.icon}</span>` : '';
  const w = { a: '', op: '', b: '' };
  let act = 'a', finished = false;
  box.innerHTML = `<div class="eq-tip">✏️ 列出算式，電腦幫你算！</div>
    <div class="eq-row"><button type="button" class="eq-slot" data-s="a"></button><button type="button" class="eq-slot op" data-s="op"></button><button type="button" class="eq-slot" data-s="b"></button>
      <span class="eq-sign">=</span><span class="eq-slot res">?</span></div>
    <div class="eq-chips">${nums.map(n => `<button type="button" class="eq-chip" data-n="${n}">${ic}${n}</button>`).join('')}</div>
    <div class="eq-ops">${['+', '−'].map(k => `<button type="button" class="eq-key op" data-k="${k}">${k === '+' ? '＋' : '−'}</button>`).join('')}<button type="button" class="eq-key clr" data-k="clr" aria-label="清掉">🧹</button></div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn green eq-go">✔ 對嗎？</button></div>`;
  const rowEl = $('.eq-row', box), msg = $('.eq-msg', box);
  function draw() {
    $$('.eq-slot[data-s]', box).forEach(s => {
      const k = s.dataset.s, v = w[k];
      s.textContent = v === '' ? (k === 'op' ? '○' : '□') : k === 'op' ? (v === '+' ? '＋' : '−') : v;
      s.classList.toggle('filled', v !== '');
      s.classList.toggle('act', !finished && act === k);
    });
  }
  const advance = () => { act = ['a', 'op', 'b'].find(k => w[k] === '') || act; };
  $$('.eq-slot[data-s]', box).forEach(s => s.onclick = () => { if (finished) return; act = s.dataset.s; sfx('tap'); draw(); });
  $$('.eq-chip', box).forEach(c => c.onclick = () => {
    if (finished) return;
    if (act === 'op') act = w.a === '' ? 'a' : 'b';
    w[act] = c.dataset.n; sfx('pop'); speak(c.dataset.n); advance(); draw();
  });
  $$('.eq-key', box).forEach(b => b.onclick = () => {
    if (finished) return;
    const k = b.dataset.k; sfx('tap');
    if (k === 'clr') { w.a = w.op = w.b = ''; act = 'a'; msg.innerHTML = ''; }
    else { w.op = k; speak(k === '+' ? '加' : '減'); act = 'op'; advance(); }
    draw();
  });
  const same = (e) => {
    const a = +w.a, b = +w.b;
    return w.op === e[1] && ((a === e[0] && b === e[2]) || (e[1] === '+' && a === e[2] && b === e[0]));
  };
  function bad(text) {
    rowEl.classList.remove('shake'); void rowEl.offsetWidth; rowEl.classList.add('shake');
    msg.innerHTML = '💡 ' + text;
    api.bad(text.replace(/<[^>]+>/g, ''), [w.a || '□', w.op || '○', w.b || '□'].join(' ')); speak(text);
  }
  $('.eq-go', box).onclick = () => {
    if (finished) return;
    if (w.a === '' || w.op === '' || w.b === '') return bad('還有空格喔！要放兩個數字和一個符號。');
    if (!paths.some(same)) {
      const a = +w.a, b = +w.b;
      if (!paths.some(e => e[1] === w.op)) return bad(r.hint || EQ_WHY[paths[0][1]]);
      if (paths.some(e => e[1] === w.op && a === e[2] && b === e[0])) return bad('減法要把<b>大的數</b>放前面喔！');
      return bad('符號對了！再看看是哪兩個數。');
    }
    // 列對了：電腦幫忙算
    finished = true; act = null; draw();
    const v = w.op === '+' ? +w.a + +w.b : +w.a - +w.b;
    rowEl.classList.add('done');
    const res = $('.res', box); res.textContent = v; res.classList.add('pop');
    $('.eq-go', box).disabled = true;
    msg.innerHTML = `✅ 列對了！答案是 <b class="eq-ans">${v}${r.unit ? ' ' + r.unit : ''}</b>`;
    speak(`列對了！答案是 ${v} ${r.unit || ''}`);
    api.ok(); later(onRight, 2300);
  };
  draw();
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

/* 形狀 SVG */
const SHAPE_NAME = { circle: '圓形', tri: '三角形', square: '正方形', rect: '長方形' };
function shapeSVG(type, color, opt = {}) {
  const rot = opt.rot || 0, sc = opt.scale || 1;
  let body = '';
  const st = `fill="${color}" stroke="#3b2a1a" stroke-width="3" stroke-linejoin="round"`;
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

/* 用正確答案和幾個錯誤答案做選項（數字會用大字顯示；文字直接放） */
function mkOpts(ans, wrongs, fmt = v => typeof v === 'number' ? N(v) : v) {
  const vals = [ans]; wrongs.forEach(w => { if (!vals.includes(w)) vals.push(w); });
  // 錯的答案重複（或太少）時，數字題補附近的數，保證選項不重複、至少 2 個
  const want = Math.max(2, Math.min(4, wrongs.length + 1));
  if (typeof ans === 'number') for (let d = 1; vals.length < want && d < 100; d++) [ans + d, ans - d].forEach(v => { if (v >= 0 && vals.length < want && !vals.includes(v)) vals.push(v); });
  return vals.map(v => ({ h: fmt(v), ok: v === ans }));
}
/* 數字選項：在 ans 附近找幾個合理的錯誤答案 */
function nearOpts(ans, lo, hi, k = 4, extra = []) {
  const w = extra.filter(v => v !== ans && v >= lo && v <= hi);
  let g = 0;
  while (w.length < k - 1 && g++ < 200) { const v = ans + pick([-10, -2, -1, 1, 2, 10, rand(-5, 5)]); if (v >= lo && v <= hi && v !== ans && !w.includes(v)) w.push(v); }
  return mkOpts(ans, w.slice(0, k - 1));
}
