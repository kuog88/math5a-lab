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
const F = (a, b) => `<span class="frac"><i>${a}</i><i>${b}</i></span>`;

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
      api.bad(typeof opt.hint === 'function' ? opt.hint(+v) : (opt.hint || `不是 ${v} 喔，再算一次！`)); v = '';
    } else if (v.length < max) { v = (v === '0' ? '' : v) + d; sfx('tap'); }
    draw();
  });
  draw();
}

/* 通用問答：rounds 為題目物件或產生題目的函式
   題目物件 {q, sp, vis, opts:[{h,ok,hint}] 或 ans(數字，用小鍵盤), unit, keep, hint, after} */
function quiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="opts"></div>`;
    api.say(r.q, r.sp);
    const ops = $('.opts', st);
    const next = () => {
      if (r.after) { $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${r.after}</div>`); speak(r.after); }
      i++; later(show, r.after ? 2000 : 1000);
    };
    if (r.ans !== undefined) { ops.className = ''; keypad(ops, r.ans, next, { unit: r.unit, hint: r.hint }); }
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
    if (r.ans !== undefined) { ops.className = ''; keypad(ops, r.ans, done, { unit: r.unit, hint: r.hint || '再算一次，小心陷阱！' }); }
    else (r.keep ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, done, r.hint || '再想想，小心陷阱！')));
  }
  show();
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
