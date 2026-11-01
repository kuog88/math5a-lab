'use strict';
/* 三年級數學樂園：共用工具（音效、朗讀、題目、拖曳） */
const KEY = 'math-g3-stars';
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
    const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, '').replace(/[□？]/g, m => m === '□' ? '幾' : '？').replace(/−/g, '減').replace(/\+/g, '加').replace(/×/g, '乘以').replace(/÷/g, '除以').replace(/°/g, '度').replace(/=/g, '等於').replace(/&gt;|＞|>/g, '大於').replace(/&lt;|＜|</g, '小於').replace(/○/g, '圈圈'));
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
/* 家長報表：curQ 是目前的題目和正確答案（quiz 會設定；其他關卡用貓頭鷹說的話當題目） */
let curQ = null;
function rep(ok, a) { window.KGReport && KGReport.answer(ok, { q: curQ ? curQ.q : lastSay, a, c: curQ ? curQ.c : '' }); }
const api = {
  say(html, sp) {
    const b = $('#bubble'); b.innerHTML = html;
    const w = $('#bubbleWrap'); w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse');
    lastSay = sp || html; speak(lastSay);
  },
  ok(msg) { sfx('ok'); if (msg) toast(msg); rep(true); },
  bad(msg, a) { if (cur) cur.miss++; sfx('bad'); toast(msg || '再想想看！'); rep(false, a); },
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
      api.bad(o.hint || hint || '再想想看！', o.h);
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

/* 輸入數字的小鍵盤：按數字、⌫、✔。答對呼叫 onRight。
   ans 是小數時多一個「.」鍵；四年級最多 9 格 */
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
      api.bad(hint || '再算算看！', v + (unit ? ' ' + unit : '')); if (hint) speak(hint); v = '';
    } else if (k === '.') { if (!v.includes('.') && v.length < 8) v = (v || '0') + '.'; }
    else if (v.length < 9) v = (v === '0' ? '' : v) + k;
    show.textContent = v;
  });
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}], keep, pad, hint, after}；
   有 ans（數字）時改用小鍵盤輸入，unit 是單位 */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    const eqm = !!r.eq, typed = !eqm && r.ans !== undefined;
    const okOpt = (r.opts || []).find(o => o.ok);
    curQ = { q: r.q, c: eqm ? eqText(eqPaths(r)[0]) + ' = ' + r.ans + (r.unit ? ' ' + r.unit : '') : typed ? r.ans + (r.unit ? ' ' + r.unit : '') : okOpt ? okOpt.h : '' };
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${eqm ? 'eqwrap' : typed ? 'kwrap' : r.pad ? 'numpad' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const next = () => {
      if (r.after) $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`);
      if (r.after) speak(r.after);
      i++; later(show, r.after ? 2100 : 1000);
    };
    if (eqm) return eqBuild($('.eqwrap', st), r, next);
    if (typed) return keypad($('.kwrap', st), r.ans, next, r.hint, r.unit);
    const ops = $(r.pad ? '.numpad' : '.opts', st);
    (r.keep || r.pad ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* ---------- 列式小幫手（2026-11） ----------
   應用題只要把「算式」列對就過關，答案由電腦算，小朋友不用拿紙筆。
   r.eq：一步題寫 [a, op, b]；兩步題寫 [[a, op, b], [x, op, 'R']]，'R' 代表第 1 步的答案。
   r.alt：其他也算對的列法（格式同 eq，可放好幾個）。＋ 和 × 前後交換也算對。 */
const EQ_OPS = ['+', '−', '×', '÷'];
const EQ_WHY = {
  '+': '「一共、合起來、比……多（要找多的那個）」通常用加法 ＋',
  '−': '「還剩、用掉、比……多幾、找回」通常用減法 −',
  '×': '「每一份一樣多，有好幾份」用乘法 ×',
  '÷': '「平分、每份幾個、可以分成幾份」用除法 ÷'
};
function eqText(p) { return p.map((e, i) => e.map(v => v === 'R' ? `(第${i}步)` : v).join(' ')).join('，'); }
function eqCalc(a, op, b) { return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : Math.floor(a / b); }
function eqPaths(r) {
  const norm = e => Array.isArray(e[0]) ? e : [e];
  return [norm(r.eq)].concat((r.alt || []).map(norm));
}
function eqBuild(box, r, onRight) {
  let paths = eqPaths(r), rows = [], results = [], act = null, finished = false;
  const plain = String(r.q || '').replace(/<[^>]+>/g, '');
  const nums = [...new Set((plain.match(/\d+/g) || []).map(Number))];
  box.innerHTML = `<div class="eq-tip">✏️ 不用自己算！把<b>算式</b>排出來，答案電腦幫你算。</div>
    <div class="eq-chips">${nums.length ? '<span class="eq-lbl">題目裡的數字：</span>' : ''}${nums.map(n => `<button type="button" class="eq-chip" data-n="${n}">${n}</button>`).join('')}</div>
    <div class="eq-rows"></div>
    <div class="eq-pad">${['7', '8', '9', '+', '4', '5', '6', '−', '1', '2', '3', '×', '⌫', '0', '🧹', '÷'].map(k => `<button type="button" class="eq-key${EQ_OPS.includes(k) ? ' op' : ''}" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn mint eq-go">✔ 檢查算式</button></div>`;
  const rowsBox = $('.eq-rows', box), msg = $('.eq-msg', box);
  function addRow() {
    const i = rows.length, multi = i > 0 || Math.min(...paths.map(p => p.length)) > 1;
    const el = document.createElement('div'); el.className = 'eq-row';
    el.innerHTML = `${multi ? `<div class="eq-step">第 ${i + 1} 步${i ? `　<button type="button" class="eq-chip sm" data-n="${results[0]}">用第 1 步的答案 ${results[0]}</button>` : ''}</div>` : ''}
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
    row()[act.k] = String(n); sfx('pop'); advance(); draw();
  }
  $$('.eq-chips .eq-chip', box).forEach(c => c.onclick = () => putNum(c.dataset.n));
  $$('.eq-key', box).forEach(b => b.onclick = () => {
    if (finished || !act || row().done) return;
    const k = b.dataset.k, w = row(); sfx('tap');
    if (EQ_OPS.includes(k)) { w.op = k; act.k = 'op'; advance(); }
    else if (k === '⌫') { if (act.k === 'op') w.op = ''; else w[act.k] = w[act.k].slice(0, -1); }
    else if (k === '🧹') { w.a = w.op = w.b = ''; act.k = 'a'; }
    else { if (act.k === 'op') act.k = w.a === '' ? 'a' : 'b'; if (w[act.k].length < 6) w[act.k] = (w[act.k] === '0' ? '' : w[act.k]) + k; }
    draw();
  });
  const expect = (p, i) => p[i] ? p[i].map(v => v === 'R' ? results[0] : v) : null;
  function same(w, e) {
    const a = +w.a, b = +w.b, sw = e[1] === '+' || e[1] === '×';
    return w.op === e[1] && ((a === e[0] && b === e[2]) || (sw && a === e[2] && b === e[0]));
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
    if (w.a === '' || w.op === '' || w.b === '') return bad('還有格子是空的喔！兩個數字和中間的符號都要放進去。');
    const cand = paths.map(p => expect(p, i)).filter(Boolean);
    const ok = paths.filter(p => p[i] && same(w, expect(p, i)));
    if (!ok.length) {
      const a = +w.a, b = +w.b;
      if (!cand.some(e => e[1] === w.op)) return bad(`${r.hint ? r.hint + '　' : ''}${EQ_WHY[cand[0][1]]}`);
      if (cand.some(e => e[1] === w.op && a === e[2] && b === e[0])) return bad(w.op === '−' ? '減法要把<b>比較大的數</b>（原本全部的）放在前面喔！' : '除法要把<b>全部的數量</b>放前面，分成幾份放後面喔！');
      if (b === 0 && w.op === '÷') return bad('不能除以 0 喔！');
      const known = nums.concat(results);
      if (![a, b].every(v => known.includes(v))) return bad(`${r.hint ? r.hint + '　' : ''}有一個數字題目裡沒有直接寫，先想想要怎麼換算喔！`);
      return bad(`符號對了！數字再檢查一下。${r.hint || '再讀一次題目，找出要算的是哪兩個數。'}`);
    }
    // 這一步列對了：電腦幫忙算
    paths = ok; w.done = true; w.el.classList.add('done'); act = null; draw();
    const a = +w.a, b = +w.b, v = eqCalc(a, w.op, b), m = w.op === '÷' ? a % b : 0;
    results.push(v);
    const res = $('.res', w.el); res.textContent = m ? `${v} … ${m}` : v; res.classList.add('pop');
    sfx('ok');
    if (paths.some(p => p.length > rows.length)) {
      msg.innerHTML = `✅ 第 ${rows.length} 步列對了！電腦算出 <b>${v}</b>，接著列下一步。`;
      speak(`列對了，答案是 ${v}。接著列下一步`); addRow(); return;
    }
    finished = true; $('.eq-go', box).disabled = true;
    msg.innerHTML = `✅ 算式列對了！答案是 <b class="eq-ans">${m ? `${v} … ${m}` : v}${r.unit ? ' ' + r.unit : ''}</b>`;
    api.ok(); later(onRight, 700);
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

