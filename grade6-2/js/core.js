'use strict';
/* 六年級下學期・星際太空站任務隊：共用工具（進度、音效、朗讀、題目、拖曳） */
const KEY = 'math-g6-2-stars';
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
    c.style.left = Math.random() * 100 + 'vw'; c.style.width = c.style.height = s + 'px'; c.textContent = pick(['💠', '⭐', '🪐', '✨']); c.style.fontSize = s + 'px';
    c.style.animationDelay = Math.random() * 0.8 + 's';
    box.appendChild(c); setTimeout(() => c.remove(), 3200);
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
/* 家長報表：curQ 是目前的題目和正確答案（quiz、eqBuild 會設定；其他關卡用說話泡泡的內容當題目）。
   repTxt 把分數 span 換成「3/4」、帶分數換成「1又2/3」，不然去掉標籤會黏在一起 */
let curQ = null;
const repTxt = s => s === undefined ? s : String(s)
  .replace(/(\d+)<span class="frac"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, ' $1又$2/$3 ')
  .replace(/<span class="frac"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, ' $1/$2 ');
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
      api.bad(hint || '再算算看！', v + (unit ? ' ' + unit : ''), ans + (unit ? ' ' + unit : '')); if (hint) speak(hint); v = '';
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
      const said = labels.map((l, i) => `${vals[i]} ${l}`).join('、');
      slots.forEach((s, i) => { if (+vals[i] !== ans[i]) { s.classList.remove('wrong'); void s.offsetWidth; s.classList.add('wrong'); vals[i] = ''; } });
      at = +vals[0] === ans[0] ? 1 : 0;
      api.bad(hint || '再算算看！', said, labels.map((l, i) => `${ans[i]} ${l}`).join('、')); if (hint) speak(hint);
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
      api.bad(h, `${n}/${d}`, simplest ? simp(ans[0], ans[1]).join('/') : `${ans[0]}/${ans[1]}`); speak(h);
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
    const eqm = !!r.eq, typed = !eqm && (r.ans !== undefined || r.ans2 !== undefined || r.frac !== undefined);
    curQ = { q: r.q, c: eqm ? '' : r.frac ? (r.simplest ? simp(r.frac[0], r.frac[1]) : r.frac).join('/') : r.ans2 ? r.labels.map((l, k) => `${r.ans2[k]} ${l}`).join('、') : typed ? `${r.ans}${r.unit ? ' ' + r.unit : ''}` : optText((r.opts || []).find(o => o.ok)) };
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${eqm ? 'eqwrap' : typed ? 'kwrap' : 'opts'}"></div>`;
    api.say(r.q, r.sp);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2200 : 1000);
    };
    if (eqm) return eqBuild($('.eqwrap', st), r, next);
    if (r.frac) return fracpad($('.kwrap', st), r.frac, next, r.hint, r.simplest);
    if (r.ans2) return keypad2($('.kwrap', st), r.labels, r.ans2, next, r.hint);
    if (typed) return keypad($('.kwrap', st), r.ans, next, r.hint, r.unit, r.dec);
    const ops = $('.opts', st);
    (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, next, r.hint)));
  }
  show();
}

/* ---------- 列式小幫手（2026-11，由三上 eqBuild 改寫成五年級版） ----------
   應用題只要把「算式」列對就過關，答案由電腦用精確分數算，小朋友不用拿紙筆。
   r.eq：算式字串，例如 '64 ÷ (1 + 3/5)'、'5 × 5 × 3.14'、'1200 ÷ (70 + 50)'。
     數字可寫整數、小數、分數 a/b（a/b 是「一個數」）、百分率 p%；運算用 ＋ − × ÷ 和括號。
     也相容三上的陣列寫法 [[a, op, b], [x, op, 'R']]。
   r.alt：其他也算對的列法（字串陣列），可以讓「一步一步列」走別的路。
   r.nums：題目數字不在文字裡（例如在圖上）時，直接給數字按鈕。
   可以一行列完（用括號），也可以一步一步列：列對其中一步，電腦算出答案，下一行用「第 N 步的答案」。
   ＋、× 的順序可以交換；0.48、48%、12/25 都當成同一個數；值對、而且只用到題目數字或標準換算數的列法也算對。
   r.eqRound：列對後，再用小鍵盤填 r.ans（例如四捨五入的概數）。r.frac 有給時，答案用分數顯示。 */
const EQ_WHY = {
  '+': '「一共、合起來、兩量的和」用加法 ＋',
  '−': '「還剩、用掉、相差、速率差」用減法 −',
  '×': '「每份一樣多，有好幾份」「比較量 ＝ 基準量 × 比值」「速率 × 時間」「底面積 × 高」用乘法 ×',
  '÷': '「平分」「基準量 ＝ 比較量 ÷ 比值」「速率 ＝ 距離 ÷ 時間」「時間 ＝ 距離 ÷ 速率」用除法 ÷'
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
  const w = Math.floor(n / d), f = F(n, d);
  if (!frac) return `${f} ≈ ${(Math.floor(n / d * 10000) / 10000).toFixed(4)}…`;
  return w >= 1 ? `${f} ＝ ${w}${F(n - w * d, d)}` : f;
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
  const plain = String(r.q || '').replace(/<span class="frac"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/(\d),(?=\d{3})/g, '$1');
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
  return m ? F(m[1], m[2] || '□') + m[3] : eqIsNum(s) ? s : `<i class="eq-o">${s}</i>`;
};
function eqBuild(box, r, onRight) {
  const paths = [r.eq, ...(r.alt || [])].map(e => eqParse(eqTok(eqStr(e))));
  if (paths.some(p => !p)) console.error('列式小幫手：算式寫錯了', r.eq, r.alt);
  const nums = eqNums(r), frac = !!r.frac;
  if (paths[0]) curQ = { q: r.q, c: `${Array.isArray(r.eq) ? eqStr(r.eq).slice(1, -1) : r.eq} = ${qFmt(eqVal(paths[0]), frac)}${r.eqRound ? `，答案 ${r.ans}` : ''}${r.unit ? ' ' + r.unit : ''}` }; // 家長報表：正確算式和答案
  const S = { paths: paths.filter(Boolean), allowed: new Set([...nums.map(qLit).filter(Boolean).map(qKey), ...paths.filter(Boolean).flatMap(eqLeaves)]) };
  const rows = [];
  let finished = false;
  box.innerHTML = `<div class="eq-tip">✏️ 不用自己算！把<b>算式</b>列出來，答案電腦幫你算。<br><small>可以一次列完（先算的加括號），也可以一步一步列。分數用「／」鍵，例如 3／4。</small></div>
    <div class="eq-chips">${nums.length ? '<span class="eq-lbl">題目裡的數字：</span>' : '<span class="eq-lbl">數字在圖上，用下面的鍵盤輸入：</span>'}${nums.map(n => `<button type="button" class="eq-chip" data-n="${n}">${eqTokHTML(n)}</button>`).join('')}</div>
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
    msg.innerHTML = `✅ 算式列對了！答案是 <b class="eq-ans">${qFmt(v, frac)}${r.unit ? ' ' + r.unit : ''}</b>`;
    api.ok();
    if (r.eqRound) {
      msg.insertAdjacentHTML('beforeend', `<br>${r.roundQ || '再用四捨五入取概數：'}`); speak(r.roundQ || '再用四捨五入取概數');
      return keypad($('.eq-round', box), r.ans, onRight, r.hint, r.unit, true);
    }
    later(onRight, 700);
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

/* 🎯 進階挑戰：5 題考卷程度的陷阱題，每題答對後顯示詳解與「小心陷阱」，按「下一題」繼續。
   題目 {q, sp, vis, opts | ans(unit, dec) | frac | ans2+labels | eq, keep, hint, ex(詳解), trap(陷阱說明)} */
function adv(st, qs) {
  let i = 0;
  function show() {
    if (i >= qs.length) { api.finish(); return; }
    const r = typeof qs[i] === 'function' ? qs[i]() : qs[i];
    const eqm = !!r.eq, typed = !eqm && (r.ans !== undefined || r.ans2 !== undefined || r.frac !== undefined);
    curQ = { q: r.q, c: eqm ? '' : r.frac ? r.frac.join('/') : r.ans2 ? r.labels.map((l, k) => `${r.ans2[k]} ${l}`).join('、') : typed ? `${r.ans}${r.unit ? ' ' + r.unit : ''}` : optText((r.opts || []).find(o => o.ok)) };
    st.innerHTML = `${dots(i, qs.length)}<div class="center"><span class="adv-badge">🎯 進階挑戰 第 ${i + 1} 題／共 ${qs.length} 題</span></div>
      <div class="qvis">${r.vis || ''}</div><div class="${eqm ? 'eqwrap' : typed ? 'kwrap' : 'opts'}"></div><div class="exp-wrap"></div>`;
    api.say(r.q, r.sp);
    const box = $(eqm ? '.eqwrap' : typed ? '.kwrap' : '.opts', st);
    const done = () => {
      const last = i === qs.length - 1;
      $('.exp-wrap', st).innerHTML = `<div class="exp"><h4>✅ 詳解</h4><div>${r.ex}</div>${r.trap ? `<div class="trap">⚠️ 小心陷阱：${r.trap}</div>` : ''}
        <div class="center"><button type="button" class="btn ghost" data-a="read">🔈 唸詳解</button> <button type="button" class="btn teal" data-a="next">${last ? '完成挑戰 🎉' : '下一題 ➜'}</button></div></div>`;
      $('[data-a="read"]', st).onclick = () => speak(r.ex + (r.trap ? '。小心陷阱：' + r.trap : ''));
      $('[data-a="next"]', st).onclick = () => { i++; show(); };
      $('.exp', st).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    const hint = r.hint || '再想想，小心陷阱！';
    if (eqm) return eqBuild(box, r, done);
    if (r.frac) return fracpad(box, r.frac, done, hint, r.simplest);
    if (r.ans2) return keypad2(box, r.labels, r.ans2, done, hint);
    if (typed) return keypad(box, r.ans, done, hint, r.unit, r.dec);
    (r.keep ? r.opts : shuffle(r.opts)).forEach(o => box.appendChild(optBtn(o, done, hint)));
  }
  show();
}
