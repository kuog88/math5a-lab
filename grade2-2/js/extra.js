'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林二下有，南一二下沒有的內容（每單元 4 關：動手做／想一想／挑戰／🎯 進階挑戰）
   xplane 平面圖形與周長（康軒第 3 單元「平面圖形」、翰林第 4 單元「平面圖形與立體形體」；南一在二上第 10 單元，A～C 從 grade2 改寫）
   xclass 多層分類（康軒第 8 單元「分類與立體圖形」的分類部分：先依一種性質分，再依另一種性質分，看懂二維分類表） */

/* ---------- 畫圖工具（從 grade2 draw.js、units7-10.js 搬來，改名免得和本遊戲的 SHAPES 衝突） ---------- */
const xreg = (n, r = 85, cx = 120, cy = 108) => Array.from({ length: n }, (_, k) => { const a = (k * 360 / n - 90) * Math.PI / 180; return [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]; });
const XPS = {
  tri: { name: '三角形', pts: [[120, 22], [28, 180], [212, 180]] },
  quad: { name: '四邊形', pts: [[40, 40], [200, 22], [222, 172], [26, 150]] },
  pent: { name: '五邊形', pts: xreg(5) },
  hex: { name: '六邊形', pts: xreg(6) },
  eq: { name: '正三角形', pts: [[120, 22], [30, 178], [210, 178]] },
  sq: { name: '正方形', pts: [[50, 34], [190, 34], [190, 174], [50, 174]] },
  rect: { name: '長方形', pts: [[34, 54], [206, 54], [206, 154], [34, 154]] }
};
function xPoly(pts, o = {}) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let s = `<svg class="xpoly" viewBox="-50 -22 340 244" style="width:min(320px,84vw)"><polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${o.c || '#ffd75e'}" stroke="#2e3438" stroke-width="5" stroke-linejoin="round"/>`;
  (o.labels || []).forEach((t, k) => {
    if (t === '' || t === undefined) return;
    const a = pts[k], b = pts[(k + 1) % pts.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, off = 16 + 26 * Math.abs(dx) / d;
    s += `<text x="${mx + dx / d * off}" y="${my + dy / d * off + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="#c8553d" font-family="Arial, sans-serif">${t}</text>`;
  });
  if (o.dot) s += `<circle cx="${o.dot[0]}" cy="${o.dot[1]}" r="9" fill="#ff4d6d" stroke="#fff" stroke-width="3"/>`;
  if (o.vtx) pts.forEach((p, k) => s += `<circle class="vtx" data-k="${k}" cx="${p[0]}" cy="${p[1]}" r="14" fill="#fff" stroke="#3f7cac" stroke-width="4" style="cursor:pointer"/>`);
  return s + '</svg>';
}
function xGrid(cells, color, size = 36) {
  const rows = Math.max(...cells.map(c => c[0])) + 1, cols = Math.max(...cells.map(c => c[1])) + 1;
  let s = `<svg viewBox="0 0 ${cols * size + 4} ${rows * size + 4}" style="width:${cols * size + 4}px;max-width:70vw">`;
  cells.forEach(([r, c]) => s += `<rect x="${2 + c * size}" y="${2 + r * size}" width="${size}" height="${size}" fill="${color}" stroke="#2e3438" stroke-width="2"/>`);
  return s + '</svg>';
}

/* ===== 補 平面 A 邊、角和頂點：點出每一個頂點，再數邊和角 ===== */
function xplaneA(st) {
  const plans = [pick(['tri', 'eq']), pick(['quad', 'rect', 'sq']), pick(['pent', 'hex'])];
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const sh = XPS[plans[r]], n = sh.pts.length; let got = 0;
    curQ = { q: `點出${sh.name}的每一個頂點`, c: `${n} 個頂點` };
    api.say(`這是${sh.name}。兩條邊碰在一起的尖尖地方叫做<b>頂點</b>，把每一個頂點都點一下！`, `這是${sh.name}。兩條邊碰在一起的尖尖地方叫做頂點，把每一個頂點都點一下！`);
    st.innerHTML = `${dots(r, plans.length)}<div class="readout" id="rd">點了 0 個頂點</div><div class="center">${xPoly(sh.pts, { vtx: true })}</div><div class="qvis" id="qv"></div><div id="kw"></div>`;
    $$('.vtx', st).forEach(c => c.addEventListener('click', () => {
      if (c.dataset.on) return;
      c.dataset.on = 1; c.setAttribute('fill', '#ffc400'); sfx('tap'); got++;
      $('#rd', st).textContent = `點了 ${got} 個頂點`;
      if (got === n) later(askSide, 700);
    }));
    function askSide() {
      curQ = { q: `${sh.name}有幾條邊？`, c: `${n} 條` };
      api.say(`${sh.name}有 ${n} 個頂點。那它有幾條<b>邊</b>？`, `${sh.name}有 ${n} 個頂點。那它有幾條邊？`);
      keypad($('#kw', st), n, () => later(() => {
        curQ = { q: `${sh.name}有幾個角？`, c: `${n} 個` };
        api.say(`對！那${sh.name}有幾個<b>角</b>？`, `對！那${sh.name}有幾個角？`);
        delete $('#kw', st).dataset.lock; // 本遊戲的小鍵盤答對後會鎖住外框，換下一題要解鎖
        keypad($('#kw', st), n, () => {
          $('#qv', st).innerHTML = `<div class="after">${sh.name}有 ${n} 個頂點、${n} 條邊、${n} 個角</div>`; speak($('#qv .after', st).textContent);
          r++; later(round, 2600);
        }, { unit: '個', hint: '每一個頂點的地方都有一個角！' });
      }, 800), { unit: '條', hint: '沿著圖形一條一條數直直的線！' });
    }
  }
  round();
}

/* ===== 補 平面 B 認識圖形：正三角形、正方形、長方形，內部、外部和周界 ===== */
function xplaneB(st) {
  const nameRound = () => {
    const k = pick(['eq', 'sq', 'rect']), a = rand(3, 8), b = a + rand(2, 5);
    const lab = { eq: [a, a, a], sq: [a, a, a, a], rect: [b, a, b, a] }[k].map(v => `${v} 公分`);
    return { q: '這是什麼圖形？', vis: xPoly(XPS[k].pts, { labels: lab }), keep: true, opts: ['eq', 'sq', 'rect'].map(x => ({ h: XPS[x].name, ok: x === k })), hint: '數一數有幾條邊，再看邊是不是都一樣長！', after: { eq: '3 條邊一樣長，是正三角形', sq: '4 條邊一樣長，是正方形', rect: '上下兩條邊一樣長、左右兩條邊一樣長，是長方形' }[k] };
  };
  const placeRound = w => () => {
    const k = pick(['tri', 'sq', 'rect', 'pent']), pts = XPS[k].pts;
    const cx = Math.round(pts.reduce((s, p) => s + p[0], 0) / pts.length), cy = Math.round(pts.reduce((s, p) => s + p[1], 0) / pts.length);
    const e = rand(0, pts.length - 1), a = pts[e], b = pts[(e + 1) % pts.length];
    const dot = [[cx, cy + 10], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [226, 14]][w];
    const names = ['內部', '周界上', '外部'];
    return { q: '紅點在圖形的哪裡？', vis: xPoly(pts, { dot }), keep: true, opts: names.map((h, i) => ({ h, ok: i === w })), hint: '圍成圖形的邊是周界；被圍在裡面的是內部，在外面的是外部！', after: `紅點在${names[w]}` };
  };
  const ws = shuffle([0, 1, 2]);
  quiz(st, [
    nameRound,
    () => { const a = rand(4, 9); return { q: `正方形的一條邊是 ${a} 公分，另外 3 條邊各是幾公分？`, vis: xPoly(XPS.sq.pts, { labels: [`${a} 公分`] }), ans: a, unit: '公分', hint: '正方形 4 條邊都一樣長！', after: `4 條邊都是 ${a} 公分` }; },
    () => { const a = rand(3, 6), b = a + rand(2, 5); return { q: `長方形上面的邊是 ${b} 公分，<b>下面</b>的邊是幾公分？`, sp: `長方形上面的邊是 ${b} 公分，下面的邊是幾公分？`, vis: xPoly(XPS.rect.pts, { labels: [`${b} 公分`, `${a} 公分`, '?'] }), ans: b, unit: '公分', hint: '長方形相對的兩條邊一樣長！', after: `上下兩條邊都是 ${b} 公分，左右兩條邊都是 ${a} 公分` }; },
    nameRound,
    placeRound(ws[0]), placeRound(ws[1])
  ]);
}

/* ===== 補 平面 C 周界和周長（列式小幫手） ===== */
function xplaneC(st) {
  const sum = a => a.reduce((s, v) => s + v, 0);
  quiz(st, [
    { q: '沿著圖形的周界走一圈，這一圈的長度叫做什麼？', vis: xPoly(XPS.quad.pts, { c: '#c9f2e3' }), keep: true, opts: [{ h: '周長', ok: true }, { h: '頂點', ok: false }, { h: '內部', ok: false }], hint: '周界一圈的長度叫做周長！' },
    () => { const s = [rand(4, 9), rand(4, 9), rand(4, 9)]; return { q: '這個三角形的周長是幾公分？', vis: xPoly(XPS.tri.pts, { labels: s.map(v => `${v} 公分`) }), eq: sumPaths(s)[0], alt: sumPaths(s), nums: s, unit: '公分', hint: '周長是 3 條邊加起來！', after: `${s.join(' + ')} = ${sum(s)}（公分）` }; },
    () => { const a = rand(3, 6), b = a + rand(2, 5); return { q: '這個長方形的周長是幾公分？', vis: xPoly(XPS.rect.pts, { labels: [`${b} 公分`, `${a} 公分`] }), eq: sumPaths([b, a, b, a])[0], alt: sumPaths([b, a, b, a]).concat([[[b, '+', a], ['R', '×', 2]], [[b, '×', 2], [a, '×', 2], ['R1', '+', 'R2']]]), nums: [b, a], extra: [2], unit: '公分', hint: '長方形 4 條邊，對面的邊一樣長，全部加起來！', after: `${b} + ${a} + ${b} + ${a} = ${2 * (a + b)}（公分）` }; },
    () => { const a = rand(3, 9); return { q: `正方形一條邊 ${a} 公分，周長是幾公分？`, vis: xPoly(XPS.sq.pts, { labels: [`${a} 公分`] }), eq: [a, '×', 4], alt: sumPaths([a, a, a, a]).concat([[[a, '+', a], ['R', '×', 2]], [[a, '×', 2], ['R', '×', 2]]]), extra: [2, 4], unit: '公分', hint: '正方形 4 條邊一樣長，4 條加起來，或用乘法！', after: `${a} × 4 = ${4 * a}（公分）` }; },
    () => { const w = rand(2, 5), h = rand(1, 3), cells = []; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) cells.push([i, j]); return { q: '每一小格的邊都是 1 公分，這個圖形的周長是幾公分？', vis: xGrid(cells, '#ffd1b8'), ans: 2 * (w + h), unit: '公分', hint: '沿著外面的邊，一段一段數，有幾個 1 公分？', after: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}（公分）` }; }
  ]);
}
const XPLANE = [
  { q: '正三角形的一條邊是 6 公分，周長是幾公分？', ans: 18, unit: '公分', vis: xPoly(XPS.eq.pts, { labels: ['6 公分'] }), ex: '正三角形 3 條邊一樣長：6 ＋ 6 ＋ 6 ＝ <b>18</b> 公分。', trap: '只標一條邊，另外兩條也是 6 公分，不是只有 6。' },
  { q: '長方形的長 8 公分、寬 3 公分，周長是幾公分？', ans: 22, unit: '公分', vis: xPoly(XPS.rect.pts, { labels: ['8 公分', '3 公分'] }), ex: '8 ＋ 3 ＋ 8 ＋ 3 ＝ <b>22</b> 公分。', trap: '不是 8 ＋ 3 ＝ 11，長方形有 4 條邊。' },
  { q: '下面哪一個圖形有 5 個頂點？', opts: [{ h: '五邊形', ok: true }, { h: '正方形', ok: false }, { h: '三角形', ok: false }], hint: '幾邊形就有幾個頂點。', ex: '<b>五邊形</b>有 5 條邊、5 個頂點、5 個角。', trap: '正方形是四邊形，只有 4 個頂點。' },
  { q: '一個正方形的周長是 20 公分，一條邊是幾公分？', ans: 5, unit: '公分', ex: '4 條邊一樣長，4 個 5 是 20，一條邊是 <b>5</b> 公分。', trap: '不是 20 ÷ 2，正方形有 4 條邊。' },
  { q: '紅點在三角形的邊上，它在圖形的哪裡？', vis: xPoly(XPS.tri.pts, { dot: [74, 101] }), opts: [{ h: '周界上', ok: true }, { h: '內部', ok: false }, { h: '外部', ok: false }], keep: true, ex: '點在邊上，是在<b>周界上</b>。', trap: '在邊上的點不是內部，也不是外部。' }
];

/* ---------- 補 xclass 多層分類 ---------- */
const XC_SHAPE = { c: '圓形', t: '三角形', s: '正方形' }, XC_COLOR = { r: ['紅色', '#ef5350'], b: ['藍色', '#42a5f5'] };
function xcSVG(sh, col, size = 46) {
  const f = XC_COLOR[col][1], s = 'stroke="#2e3438" stroke-width="3"';
  const g = sh === 'c' ? `<circle cx="25" cy="25" r="20" fill="${f}" ${s}/>` : sh === 't' ? `<polygon points="25,5 45,44 5,44" fill="${f}" ${s}/>` : `<rect x="6" y="6" width="38" height="38" fill="${f}" ${s}/>`;
  return `<svg viewBox="0 0 50 50" width="${size}" height="${size}">${g}</svg>`;
}
function xcSet(n) { const shs = Object.keys(XC_SHAPE), a = []; for (let i = 0; i < n; i++) a.push([pick(shs), pick(['r', 'b'])]); return a; }
/* 二維分類表：列是形狀、行是顏色 */
function xcTable(items, shs) {
  const cnt = (s, c) => items.filter(x => x[0] === s && x[1] === c).length;
  return `<table class="xct"><tr><th></th><th>紅色</th><th>藍色</th></tr>${shs.map(s => `<tr><th>${XC_SHAPE[s]}</th><td>${cnt(s, 'r')}</td><td>${cnt(s, 'b')}</td></tr>`).join('')}</table>`;
}
function xclassA(st) {
  const rounds = [['形狀', 0], ['顏色', 1], ['形狀', 0]];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const [by, k] = rounds[r], items = xcSet(8), keys = k === 0 ? [...new Set(items.map(x => x[0]))] : ['r', 'b'];
    const label = v => k === 0 ? XC_SHAPE[v] : XC_COLOR[v][0];
    let sel = null, left = items.length;
    curQ = { q: `依${by}分類`, c: keys.map(v => `${label(v)} ${items.filter(x => x[k] === v).length} 個`).join('、') };
    api.say(`依<b>${by}</b>分類！先點一個圖形，再點它要放的盒子。`, `依${by}分類，先點一個圖形，再點它要放的盒子`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="xcitems">${items.map((x, i) => `<button type="button" class="xci" data-i="${i}">${xcSVG(x[0], x[1])}</button>`).join('')}</div>
      <div class="xcbins">${keys.map(v => `<button type="button" class="xcbin" data-v="${v}"><h4>${label(v)}</h4><div class="in"></div></button>`).join('')}</div>`;
    $$('.xci', st).forEach(b => b.onclick = () => { $$('.xci.sel', st).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); sfx('tap'); });
    $$('.xcbin', st).forEach(bin => bin.onclick = () => {
      if (!sel) return toast('先點一個圖形！');
      const it = items[+sel.dataset.i];
      if (it[k] === bin.dataset.v) { $('.in', bin).insertAdjacentHTML('beforeend', xcSVG(it[0], it[1], 26)); sel.remove(); sel = null; sfx('ok'); if (--left === 0) { api.ok('分好了！'); r++; later(round, 1500); } }
      else { sel.classList.remove('sel'); sel = null; api.bad(`這次是依${by}分，看清楚它是什麼${by}！`, label(bin.dataset.v), label(it[k])); }
    });
  }
  round();
}
function xclassB(st) {
  const mk = () => { let items; do items = xcSet(rand(9, 13)); while (new Set(items.map(x => x[0])).size < 3); return items; };
  const items = mk(), shs = ['c', 't', 's'], T = () => xcTable(items, shs);
  const cnt = (s, c) => items.filter(x => (!s || x[0] === s) && (!c || x[1] === c)).length;
  const s1 = pick(shs), c1 = pick(['r', 'b']), s2 = pick(shs.filter(x => x !== s1));
  quiz(st, [
    { q: `看分類表，<b>${XC_COLOR[c1][0]}的${XC_SHAPE[s1]}</b>有幾個？`, sp: `看分類表，${XC_COLOR[c1][0]}的${XC_SHAPE[s1]}有幾個？`, vis: T(), ans: cnt(s1, c1), unit: '個', hint: `找「${XC_SHAPE[s1]}」那一列、「${XC_COLOR[c1][0]}」那一行。`, after: `${XC_COLOR[c1][0]}的${XC_SHAPE[s1]}有 ${cnt(s1, c1)} 個` },
    { q: `<b>${XC_SHAPE[s2]}</b>一共有幾個？`, sp: `${XC_SHAPE[s2]}一共有幾個？`, vis: T(), eq: [cnt(s2, 'r'), '+', cnt(s2, 'b')], nums: [cnt(s2, 'r'), cnt(s2, 'b')], unit: '個', hint: '紅色的加藍色的。', after: `${cnt(s2, 'r')} + ${cnt(s2, 'b')} = ${cnt(s2)}（個）` },
    { q: `<b>${XC_COLOR[c1][0]}</b>的圖形一共有幾個？`, sp: `${XC_COLOR[c1][0]}的圖形一共有幾個？`, vis: T(), ans: cnt(null, c1), unit: '個', hint: `把「${XC_COLOR[c1][0]}」那一行全部加起來。`, after: `${shs.map(s => cnt(s, c1)).join(' + ')} = ${cnt(null, c1)}` },
    { q: '這張表是先依什麼、再依什麼分類的？', vis: T(), opts: [{ h: '形狀和顏色', ok: true }, { h: '大小和顏色', ok: false }, { h: '只有形狀', ok: false }], hint: '看表格左邊和上面寫什麼。' },
    { q: '全部一共有幾個圖形？', vis: T(), ans: items.length, unit: '個', hint: '把表格裡的數全部加起來。', after: `一共 ${items.length} 個` }
  ]);
}
function xclassC(st) {
  const ANI = [['🐶', '狗', 4, '陸地'], ['🐱', '貓', 4, '陸地'], ['🐔', '雞', 2, '陸地'], ['🦆', '鴨', 2, '水邊'], ['🐸', '青蛙', 4, '水邊'], ['🐧', '企鵝', 2, '水邊']];
  quiz(st, [
    () => { const a = pick(ANI); return { q: `${a[0]} ${a[1]}有幾隻腳？要放在哪一類？`, opts: [{ h: '2 隻腳', ok: a[2] === 2 }, { h: '4 隻腳', ok: a[2] === 4 }], keep: true, hint: '想一想牠有幾隻腳。' }; },
    { q: '把「狗、雞、鴨、青蛙」先依腳的數量分，<b>4 隻腳</b>的有哪些？', sp: '把狗、雞、鴨、青蛙先依腳的數量分，4 隻腳的有哪些？', opts: [{ h: '狗、青蛙', ok: true }, { h: '狗、雞', ok: false }, { h: '雞、鴨', ok: false }], hint: '狗 4 隻腳、雞 2 隻、鴨 2 隻、青蛙 4 隻。' },
    { q: '4 隻腳的「狗、青蛙」，再依住的地方分，住在<b>水邊</b>的是誰？', sp: '4隻腳的狗和青蛙，再依住的地方分，住在水邊的是誰？', opts: [{ h: '青蛙', ok: true }, { h: '狗', ok: false }], keep: true, hint: '青蛙住在水邊。' },
    () => { const pens = rand(3, 6), pencils = rand(4, 8), redP = rand(1, pens - 1); return { q: `筆盒裡有原子筆 ${pens} 枝（紅色 ${redP} 枝，其他是黑色）、鉛筆 ${pencils} 枝。黑色的原子筆有幾枝？`, eq: [pens, '−', redP], unit: '枝', hint: '先找原子筆，再分紅色和黑色。', after: `${pens} − ${redP} = ${pens - redP}（枝）` }; },
    { q: '先依「形狀」分，再依「顏色」分，這樣叫做什麼？', opts: [{ h: '多層分類', ok: true }, { h: '只分一次', ok: false }, { h: '排順序', ok: false }], hint: '分了兩次（兩層）。' }
  ]);
}
const XCLASS = [
  () => { const items = [['c', 'r'], ['c', 'r'], ['t', 'b'], ['s', 'r'], ['t', 'r'], ['c', 'b'], ['s', 'b'], ['t', 'r']]; return { q: '看分類表，<b>紅色的三角形</b>有幾個？', sp: '看分類表，紅色的三角形有幾個？', vis: xcTable(items, ['c', 't', 's']), ans: 2, unit: '個', ex: '找「三角形」那一列和「紅色」那一行交叉的格子：<b>2</b> 個。', trap: '不是所有三角形（3 個），也不是所有紅色（5 個）。' }; },
  () => { const items = [['c', 'r'], ['c', 'b'], ['c', 'b'], ['s', 'r'], ['t', 'r'], ['t', 'b'], ['s', 'b'], ['s', 'b']]; return { q: '看分類表，<b>藍色</b>的圖形一共有幾個？', sp: '看分類表，藍色的圖形一共有幾個？', vis: xcTable(items, ['c', 't', 's']), ans: 5, unit: '個', ex: '藍色那一行：2 ＋ 1 ＋ 2 ＝ <b>5</b> 個。', trap: '要把藍色那一行的三格都加起來。' }; },
  { q: '小明把積木先依顏色分成紅、藍兩堆，再把紅色那堆依形狀分。這是幾層分類？', opts: [{ h: '兩層', ok: true }, { h: '一層', ok: false }, { h: '三層', ok: false }], ex: '先依顏色分（第一層），再依形狀分（第二層），是<b>兩層</b>分類。', trap: '分了兩次，不是一層。' },
  { q: '有 12 個鈕扣，紅色 7 個、黃色 5 個。紅色裡有 3 個是圓的，紅色的方形鈕扣有幾個？', eq: [7, '−', 3], unit: '個', ex: '只看紅色的 7 個，圓的 3 個，方的 7 − 3 ＝ <b>4</b> 個。', trap: '不是 12 − 3，題目只問紅色的。' },
  { q: '依「有沒有翅膀」分類，下面哪一個和其他不同？', opts: [{ h: '🐟 魚', ok: true }, { h: '🐦 鳥', ok: false }, { h: '🦋 蝴蝶', ok: false }], ex: '鳥和蝴蝶有翅膀，<b>魚</b>沒有翅膀。', trap: '要依題目說的「有沒有翅膀」來分。' }
];

document.head.insertAdjacentHTML('beforeend', `<style>
.xpoly{height:auto}
.xcitems{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.xci{border:3px solid var(--line);border-radius:12px;background:#fff;padding:4px;cursor:pointer}
.xci.sel{border-color:var(--or);background:#fff1e0}
.xcbins{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px;margin-top:12px}
.xcbin{min-height:96px;border:3px dashed var(--ch2);border-radius:14px;background:var(--cement);padding:6px;font:inherit;color:var(--ink);cursor:pointer}
.xcbin h4{margin:2px 0 6px;font-size:18px}.xcbin .in{display:flex;flex-wrap:wrap;gap:2px;justify-content:center}
.xct{border-collapse:collapse;margin:0 auto;background:#fff;font-size:20px;font-weight:900}
.xct th,.xct td{border:2px solid var(--ch2);padding:6px 12px;text-align:center}.xct th{background:var(--cement)}
</style>`);

Object.assign(LEVELS, {
  xplane: [xplaneA, xplaneB, xplaneC, st => adv(st, XPLANE)],
  xclass: [xclassA, xclassB, xclassC, st => adv(st, XCLASS)]
});
