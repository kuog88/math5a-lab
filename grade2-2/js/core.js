'use strict';
/* 二年級下學期・小小工程師蓋大樓：共用工具（音效、朗讀、題目、小鍵盤、進階挑戰、畫圖） */
const KEY = 'math-g2-2-stars';
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
    const seq = { ok: [620, 930], bad: [240, 180], tap: [520], win: [392, 523, 659, 784, 1046], pop: [900, 1200] }[type] || [440];
    seq.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type === 'bad' ? 'sawtooth' : 'square';
      o.frequency.value = f;
      const s = AC.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(type === 'bad' ? 0.05 : 0.08, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16);
      o.connect(g).connect(AC.destination);
      o.start(s); o.stop(s + 0.18);
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
/* 把畫面文字轉成好唸的句子：分數、符號 */
function toSpeech(t) {
  return String(t)
    .replace(/<span class="frac"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$2分之$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/(\d+)\/(\d+)/g, '$2分之$1')
    .replace(/□/g, '幾').replace(/[−-](?=\s*\d)/g, '減').replace(/\+/g, '加').replace(/×/g, '乘').replace(/=/g, '等於')
    .replace(/[＞>]/g, '大於').replace(/[＜<]/g, '小於').replace(/＝/g, '等於').replace(/&nbsp;/g, ' ');
}
function speak(text) {
  if (muted || !('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(toSpeech(text));
    u.lang = 'zh-TW'; if (zhVoice) u.voice = zhVoice; u.rate = 0.9; u.pitch = 1.05;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- 畫面小工具 ---------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }
function confetti() {
  const box = $('#confetti'), cs = ['#ffc400', '#ff7a1a', '#3f7cac', '#c8553d', '#4caf6a', '#2e3438'];
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
/* 家長報表：curQ 是目前的題目和正確答案（quiz、adv、eqBuild 會設定；其他關卡用海狸工頭說的話當題目） */
let curQ = null;
const repTxt = s => String(s === undefined || s === null ? '' : s).replace(/<span class="frac"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, ' $1/$2 ');
function rep(ok, a, c) { window.KGReport && KGReport.answer(ok, { q: repTxt(curQ ? curQ.q : lastQ), a: a === undefined ? a : repTxt(a), c: repTxt(c !== undefined ? c : curQ ? curQ.c : '') }); }
/* 選項的文字（圖形選項用 o.t 說明） */
const optText = o => o ? o.t || (/<svg/i.test(o.h) ? '（圖）' : o.h) : '';
/* 題目物件的正確答案文字 */
const ansText = r => r.eq ? eqAns(r) : r.ans !== undefined ? `${r.ans}${r.unit ? ' ' + r.unit : ''}` : optText((r.opts || []).find(o => o.ok));
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
const N = v => `<span class="num">${v}</span>`;
const F = (a, b) => `<span class="frac"><i>${a}</i><i>${b}</i></span>`;

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
/* 用正確答案和幾個錯誤答案做選項 */
function mkOpts(ans, wrongs, fmt = v => typeof v === 'number' ? N(v) : v) {
  const vals = [ans]; wrongs.forEach(w => { if (!vals.includes(w)) vals.push(w); });
  return vals.map(v => ({ h: fmt(v), ok: v === ans }));
}
function nearOpts(ans, lo, hi, k = 4, extra = []) {
  const w = extra.filter(v => v !== ans && v >= lo && v <= hi);
  let g = 0;
  while (w.length < k - 1 && g++ < 300) { const v = ans + pick([-100, -10, -2, -1, 1, 2, 10, 100]); if (v >= lo && v <= hi && v !== ans && !w.includes(v)) w.push(v); }
  return mkOpts(ans, w.slice(0, k - 1));
}

/* 小鍵盤：輸入多位數答案。check(v) 回傳 true 表示答對 */
function keypad(box, ans, onRight, opt = {}) {
  let v = '';
  const max = opt.max || String(ans).length + 1;
  box.innerHTML = `<div class="center"><span class="kp-show">&nbsp;</span>${opt.unit ? `<span class="kp-unit">${opt.unit}</span>` : ''}</div>
    <div class="kp">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button type="button" data-d="${d}">${d}</button>`).join('')}<button type="button" class="del" data-d="del">⌫</button><button type="button" class="ok" data-d="ok">✔ 確定</button></div>`;
  const show = $('.kp-show', box);
  const draw = () => { show.innerHTML = v || '&nbsp;'; };
  $$('button', box).forEach(b => b.onclick = () => {
    const d = b.dataset.d;
    if (box.dataset.lock) return;
    if (d === 'del') { v = v.slice(0, -1); sfx('tap'); }
    else if (d === 'ok') {
      if (!v) return;
      if (+v === ans) { box.dataset.lock = 1; show.style.borderColor = 'var(--grass)'; show.style.color = 'var(--grass-d)'; api.ok(); onRight(); return; }
      api.bad(typeof opt.hint === 'function' ? opt.hint(+v) : (opt.hint || `不是 ${v} 喔，再算一次！`), `${v}${opt.unit ? ' ' + opt.unit : ''}`, `${ans}${opt.unit ? ' ' + opt.unit : ''}`); v = '';
    } else if (v.length < max) { v = (v === '0' ? '' : v) + d; sfx('tap'); }
    draw();
  });
  draw();
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}] 或 ans(數字，用小鍵盤), unit, keep, hint, after}；有 eq 時改用列式小幫手 */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    curQ = { q: r.q, c: ansText(r) };
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="opts"></div>`;
    api.say(r.q, r.sp);
    const ops = $('.opts', st);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2000 : 1000);
    };
    if (r.eq) { ops.className = 'eqwrap'; eqBuild(ops, r, next); }
    else if (r.ans !== undefined) { ops.className = ''; keypad(ops, r.ans, next, { unit: r.unit, hint: r.hint }); }
    else (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* 🎯 進階挑戰：5 題，每題答對後顯示詳解與陷阱提醒，按「下一題」繼續
   題目 {q, sp, vis, opts:[{h,ok,hint}] 或 ans, unit, keep, ex(詳解 html), trap(陷阱說明)} */
function adv(st, qs) {
  let i = 0;
  function show() {
    if (i >= qs.length) { api.finish(); return; }
    const r = typeof qs[i] === 'function' ? qs[i]() : qs[i];
    curQ = { q: r.q, c: ansText(r) };
    st.innerHTML = `${dots(i, qs.length)}<div class="center"><span class="adv-badge">🎯 進階挑戰 第 ${i + 1} 題／共 ${qs.length} 題</span></div>
      <div class="qvis">${r.vis || ''}</div><div class="opts"></div><div class="exp-wrap"></div>`;
    api.say(r.q, r.sp);
    const ops = $('.opts', st);
    const done = () => {
      const last = i === qs.length - 1;
      $('.exp-wrap', st).innerHTML = `<div class="exp"><h4>✅ 詳解</h4><div>${r.ex}</div>${r.trap ? `<div class="trap">⚠️ 小心陷阱：${r.trap}</div>` : ''}
        <div class="row-btns"><button type="button" class="btn ghost sm" data-a="read">🔈 唸詳解</button><button type="button" class="btn steel" data-a="next">${last ? '完成挑戰 🎉' : '下一題 ➜'}</button></div></div>`;
      $('[data-a="read"]', st).onclick = () => speak(r.ex + (r.trap ? '。小心陷阱：' + r.trap : ''));
      $('[data-a="next"]', st).onclick = () => { i++; show(); };
      $('.exp', st).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    if (r.eq) { ops.className = 'eqwrap'; eqBuild(ops, r, done); }
    else if (r.ans !== undefined) { ops.className = ''; keypad(ops, r.ans, done, { unit: r.unit, hint: r.hint || '再算一次，小心陷阱！' }); }
    else (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, done, r.hint || '再想想，小心陷阱！')));
  }
  show();
}

/* ---------- 列式小幫手（2026-11，二年級下學期版） ----------
   應用題只要把「算式」列對就過關，答案由電腦算，小朋友不用拿紙筆。
   r.eq：一步題寫 [a, op, b]；兩步以上寫 [[a, op, b], ['R', op, c], ...]，
         'R' 是上一步的答案，'R1'、'R2' 是第 1、2 步的答案。
   r.alt：其他也算對的列法（格式同 eq，可放好幾個）。＋ 和 × 前後交換也算對。
   r.nums：題目文字以外可以點的數字；r.extra：題目沒寫但可以用的數（如含頭尾的 1）。
   r.chips：[[值, '按鈕文字'], ...]，有它就只用這些按鈕（例如公尺公分先換成公分）。
   r.fmt：答案的顯示方式（值 → 文字）；r.numHint：用到題目沒有的數時的提示。
   符號鍵只放 ＋ − 和這題用得到的 ×（二下沒有 ÷）。 */
const EQ_WHY = {
  '+': '合起來、又多了，用加法 ＋',
  '−': '拿走、用掉、還剩幾個、相差幾個，用減法 −',
  '×': '每一份一樣多，有好幾份，用乘法 ×'
};
function eqCalc(a, op, b) { return op === '+' ? a + b : op === '−' ? a - b : a * b; }
function eqPaths(r) {
  const norm = e => Array.isArray(e[0]) ? e : [e];
  return [norm(r.eq)].concat((r.alt || []).map(norm));
}
/* 幾個數連加的所有列法（一個一個加，或兩兩先加再合起來） */
function sumPaths(list) {
  const out = [], seen = new Set(), add = p => { const k = JSON.stringify(p); if (!seen.has(k)) { seen.add(k); out.push(p); } };
  const perms = a => a.length < 2 ? [a] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x, ...p]));
  perms(list).forEach(p => {
    add([[p[0], '+', p[1]], ...p.slice(2).map(x => ['R', '+', x])]);
    if (p.length === 4) add([[p[0], '+', p[1]], [p[2], '+', p[3]], ['R1', '+', 'R2']]);
  });
  return out;
}
/* 正確算式（第一種列法）和答案，給家長報表 */
function eqAns(r) {
  const res = [], val = v => v === 'R' ? res[res.length - 1] : /^R\d$/.test(v) ? res[+v[1] - 1] : v;
  const s = eqPaths(r)[0].map(e => { const [a, op, b] = e.map(val), v = eqCalc(a, op, b); res.push(v); return `${a} ${op} ${b} = ${v}`; }).join('，');
  const v = res[res.length - 1];
  return r.fmt ? `${s}（${r.fmt(v)}）` : s + (r.unit ? ' ' + r.unit : '');
}
function eqBuild(box, r, onRight) {
  let paths = eqPaths(r), rows = [], results = [], act = null, finished = false;
  curQ = { q: r.q, c: eqAns(r) };
  const plain = String(r.q || '').replace(/<[^>]+>/g, '');
  const chips = r.chips ? r.chips.map(c => Array.isArray(c) ? c : [c, String(c)])
    : [...new Set((plain.match(/\d+/g) || []).map(Number).concat(r.nums || []))].map(n => [n, String(n)]);
  const nums = chips.map(c => c[0]);
  const used = new Set(paths.flat().map(s => s[1]));
  const ops = ['+', '−', '×'].filter(o => o !== '×' || used.has(o));
  const hint = typeof r.hint === 'string' ? r.hint : '';
  const fmt = v => r.fmt ? r.fmt(v) : `${v}${r.unit ? ' ' + r.unit : ''}`;
  box.innerHTML = `<div class="eq-tip">✏️ 列出算式，電腦幫你算！</div>
    <div class="eq-chips">${chips.map(([n, h]) => `<button type="button" class="eq-chip" data-n="${n}">${h}</button>`).join('')}</div>
    <div class="eq-rows"></div>
    <div class="eq-ops">${ops.map(k => `<button type="button" class="eq-key op" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="eq-pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '🧹'].map(k => `<button type="button" class="eq-key" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="eq-msg"></div>
    <div class="center"><button type="button" class="btn green eq-go">✔ 對嗎？</button></div>`;
  const rowsBox = $('.eq-rows', box), msg = $('.eq-msg', box);
  function addRow() {
    const i = rows.length, multi = i > 0 || Math.min(...paths.map(p => p.length)) > 1;
    const prev = i === 1 ? `<button type="button" class="eq-chip sm" data-n="${results[0]}">用上一步的 ${results[0]}</button>`
      : results.map((v, k) => `<button type="button" class="eq-chip sm" data-n="${v}">第 ${k + 1} 步的 ${v}</button>`).join('');
    const el = document.createElement('div'); el.className = 'eq-row';
    el.innerHTML = `${multi ? `<div class="eq-step">第 ${i + 1} 步${prev}</div>` : ''}
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
    if (ops.includes(k)) { w.op = k; act.k = 'op'; advance(); }
    else if (k === '⌫') { if (act.k === 'op') w.op = ''; else w[act.k] = w[act.k].slice(0, -1); }
    else if (k === '🧹') { w.a = w.op = w.b = ''; act.k = 'a'; }
    else { if (act.k === 'op') act.k = w.a === '' ? 'a' : 'b'; if (w[act.k].length < 4) w[act.k] = (w[act.k] === '0' ? '' : w[act.k]) + k; }
    draw();
  });
  const val = v => v === 'R' ? results[results.length - 1] : /^R\d$/.test(v) ? results[+v[1] - 1] : v;
  const expect = (p, i) => p[i] ? p[i].map(val) : null;
  function same(w, e) {
    const a = +w.a, b = +w.b, sw = e[1] === '+' || e[1] === '×';
    return w.op === e[1] && ((a === e[0] && b === e[2]) || (sw && a === e[2] && b === e[0]));
  }
  function bad(text) {
    const w = rows[rows.length - 1];
    w.el.classList.remove('shake'); void w.el.offsetWidth; w.el.classList.add('shake');
    msg.innerHTML = '💡 ' + text;
    api.bad(text.replace(/<[^>]+>/g, ''), rows.map((x, k) => `${x.a || '□'} ${x.op || '○'} ${x.b || '□'}${x.done ? ' = ' + results[k] : ''}`).join('，'));
    speak(text);
  }
  $('.eq-go', box).onclick = () => {
    if (finished) return;
    const i = rows.length - 1, w = rows[i];
    if (w.a === '' || w.op === '' || w.b === '') return bad('還有空格喔！要放兩個數字和一個符號。');
    const cand = paths.map(p => expect(p, i)).filter(Boolean);
    const ok = paths.filter(p => p[i] && same(w, expect(p, i)));
    if (!ok.length) {
      const a = +w.a, b = +w.b;
      if (!cand.some(e => e[1] === w.op)) return bad(hint || EQ_WHY[cand[0][1]]);
      if (w.op === '−' && cand.some(e => e[1] === '−' && a === e[2] && b === e[0])) return bad('減法要把<b>大的數</b>放前面喔！');
      const known = nums.concat(results, r.extra || []);
      if (![a, b].every(v => known.includes(v))) return bad(r.numHint || '有一個數字題目裡沒有喔！再看一次題目。');
      return bad(`符號對了！再看看是哪兩個數。${hint}`);
    }
    // 這一步列對了：電腦幫忙算
    paths = ok; w.done = true; w.el.classList.add('done'); act = null; draw();
    const v = eqCalc(+w.a, w.op, +w.b);
    results.push(v);
    const res = $('.res', w.el); res.textContent = v; res.classList.add('pop');
    sfx('ok');
    if (!ok.some(p => p.length === rows.length)) {
      msg.innerHTML = `✅ 對了！是 <b>${v}</b>。再列下一步。`;
      speak(`對了，是 ${v}。再列下一步`); addRow(); return;
    }
    finished = true; $('.eq-go', box).disabled = true;
    msg.innerHTML = `✅ 列對了！答案是 <b class="eq-ans">${fmt(v)}</b>`;
    speak(`列對了！答案是 ${fmt(v)}`);
    api.ok(); later(onRight, 1200);
  };
  addRow();
}

/* ---------- 畫圖 ---------- */
/* 錢：v = 1,5,10,50,100,500,1000 */
function moneyHTML(v) { return `<span class="money ${v >= 100 ? 'bill' : 'coin'} m${v}">${v}</span>`; }
/* 位值積木：百（板）、十（條）、一（小方塊） */
function blocksHTML(h, t, o) {
  const flat = `<span class="flat">${'<i></i>'.repeat(100)}</span>`, rod = `<span class="rod">${'<i></i>'.repeat(10)}</span>`;
  let s = '';
  if (h) s += `<div class="grp">${flat.repeat(h)}</div>`;
  if (t) s += `<div class="grp">${rod.repeat(t)}</div>`;
  if (o) s += `<div class="grp ones-grid">${'<i class="cube1"></i>'.repeat(o)}</div>`;
  return s || '<span class="lbl">（工作台上還沒有積木）</span>';
}
/* 直式：a op b，答案列空白或顯示 */
function vertHTML(a, op, b, ans) {
  return `<div class="vert"><div>${a}</div><div>${op}&nbsp;${b}</div><div class="ln"></div><div class="ans">${ans === undefined ? '&nbsp;' : ans}</div></div>`;
}
/* 天平 SVG：tilt = -1 左邊重（左低）、0 平衡、1 右邊重 */
function balanceSVG(left, right, tilt) {
  const a = tilt * 12, rad = a * Math.PI / 180, cx = 260, cy = 90, L = 170;
  const lx = cx - L * Math.cos(rad), ly = cy - L * Math.sin(rad), rx = cx + L * Math.cos(rad), ry = cy + L * Math.sin(rad);
  const pan = (x, y, items) => `<line x1="${x}" y1="${y}" x2="${x - 50}" y2="${y + 70}" stroke="#4a5258" stroke-width="3"/><line x1="${x}" y1="${y}" x2="${x + 50}" y2="${y + 70}" stroke="#4a5258" stroke-width="3"/>
    <path d="M${x - 70} ${y + 70} Q${x} ${y + 105} ${x + 70} ${y + 70} Z" fill="#ffc400" stroke="#2e3438" stroke-width="4"/>
    <text x="${x}" y="${y + 64}" font-size="34" text-anchor="middle">${items}</text>`;
  return `<svg viewBox="0 0 520 280"><rect x="235" y="240" width="50" height="16" rx="4" fill="#2e3438"/><polygon points="260,90 236,240 284,240" fill="#4a5258"/>
    <line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="#2e3438" stroke-width="10" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="10" fill="#ff7a1a"/>
    ${pan(lx, ly, left)}${pan(rx, ry, right)}</svg>`;
}
/* 分數圖：kind circle/rect/bar，n 份，shade 為塗色的份編號陣列，unequal 不平分 */
function fracSVG(kind, n, shade = [], opt = {}) {
  const fill = k => shade.includes(k) ? (opt.color || '#ff7a1a') : '#fff';
  const st = 'stroke="#2e3438" stroke-width="3"';
  let s = '';
  if (kind === 'circle') {
    const cx = 60, cy = 60, r = 52;
    const cuts = opt.unequal ? [0, 0.4, 0.62, 0.82, 1] : Array.from({ length: n + 1 }, (_, k) => k / n);
    for (let k = 0; k < cuts.length - 1; k++) {
      if (cuts.length - 1 === 1) { s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill(0)}" ${st}/>`; break; }
      const a1 = cuts[k] * 2 * Math.PI - Math.PI / 2, a2 = cuts[k + 1] * 2 * Math.PI - Math.PI / 2;
      const big = cuts[k + 1] - cuts[k] > 0.5 ? 1 : 0;
      s += `<path d="M${cx} ${cy} L${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a2)).toFixed(1)} ${(cy + r * Math.sin(a2)).toFixed(1)} Z" fill="${fill(k)}" ${st} data-k="${k}"/>`;
    }
    return `<svg viewBox="0 0 120 120" class="fsvg">${s}</svg>`;
  }
  const W = kind === 'bar' ? 240 : 150, H = kind === 'bar' ? 40 : 100;
  const cuts = opt.unequal ? [0, 0.18, 0.5, 0.72, 1].slice(0, n + 1).map((v, k, arr) => k === arr.length - 1 ? 1 : v) : Array.from({ length: n + 1 }, (_, k) => k / n);
  for (let k = 0; k < cuts.length - 1; k++) s += `<rect x="${(4 + cuts[k] * W).toFixed(1)}" y="4" width="${((cuts[k + 1] - cuts[k]) * W).toFixed(1)}" height="${H}" fill="${fill(k)}" ${st} data-k="${k}"/>`;
  return `<svg viewBox="0 0 ${W + 8} ${H + 8}" class="fsvg${kind === 'bar' ? ' bar' : ''}">${s}</svg>`;
}
/* 方格圖形：cells 為 [列, 行] 陣列 */
function gridShapeSVG(shapes, rows, cols, sz = 34) {
  let s = '';
  for (let r = 0; r <= rows; r++) s += `<line x1="0" y1="${r * sz}" x2="${cols * sz}" y2="${r * sz}" stroke="#d6dde3" stroke-width="1"/>`;
  for (let c = 0; c <= cols; c++) s += `<line x1="${c * sz}" y1="0" x2="${c * sz}" y2="${rows * sz}" stroke="#d6dde3" stroke-width="1"/>`;
  shapes.forEach(sh => {
    sh.cells.forEach(([r, c]) => s += `<rect class="${sh.cls || ''}" data-s="${sh.name}" x="${c * sz + 1}" y="${r * sz + 1}" width="${sz - 2}" height="${sz - 2}" fill="${sh.color}" stroke="#2e3438" stroke-width="1.5"/>`);
    const [r0, c0] = sh.cells[0];
    s += `<text x="${c0 * sz + sz / 2}" y="${r0 * sz - 6}" text-anchor="middle" font-size="22" font-weight="900" fill="#2e3438">${sh.name}</text>`;
  });
  return `<svg viewBox="-4 -30 ${cols * sz + 8} ${rows * sz + 36}">${s}</svg>`;
}
/* 月曆表格：year 年 month 月（只用來排版） */
function calHTML(title, firstDow, days, opt = {}) {
  let h = `<table class="cal"><caption>${title}</caption><tr>${['日', '一', '二', '三', '四', '五', '六'].map(d => `<th>${d}</th>`).join('')}</tr><tr>`;
  let col = 0;
  for (let k = 0; k < firstDow; k++, col++) h += '<td class="e"></td>';
  const upto = opt.upto || days;
  for (let d = 1; d <= upto; d++, col++) {
    if (col && col % 7 === 0) h += '</tr><tr>';
    h += `<td class="${(opt.hl || []).includes(d) ? 'hl' : ''}${opt.tap ? ' tap' : ''}" data-d="${d}">${(opt.hide || []).includes(d) ? '' : d}</td>`;
  }
  while (col % 7) { h += '<td class="e"></td>'; col++; }
  return h + '</tr></table>';
}
/* 正方體、長方體 SVG */
function boxSVG(w, h, d, color = '#ffc400') {
  const ox = 20, oy = 20 + d * 0.5;
  const dx = d * 0.7, dy = d * 0.5;
  return `<svg viewBox="0 0 ${w + dx + 40} ${h + dy + 40}">
    <polygon points="${ox},${oy} ${ox + w},${oy} ${ox + w + dx},${oy - dy} ${ox + dx},${oy - dy}" fill="#ffe28a" stroke="#2e3438" stroke-width="3"/>
    <polygon points="${ox + w},${oy} ${ox + w + dx},${oy - dy} ${ox + w + dx},${oy - dy + h} ${ox + w},${oy + h}" fill="#d69f00" stroke="#2e3438" stroke-width="3"/>
    <rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="${color}" stroke="#2e3438" stroke-width="3"/></svg>`;
}
