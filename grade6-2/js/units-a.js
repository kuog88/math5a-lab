'use strict';
/* 分數與小數的四則混合計算／圓形圖與可能性／基準量與比較量 */

const comma = n => n.toLocaleString('en-US');
const cmpOpts = (a, b) => [{ h: '＞', ok: a > b }, { h: '＝', ok: Math.abs(a - b) < 1e-9 }, { h: '＜', ok: a < b }];
const sign = (a, b) => Math.abs(a - b) < 1e-9 ? '＝' : a > b ? '＞' : '＜';
const yesNo = ok => [{ h: '對', ok }, { h: '不對', ok: !ok }];
const coprime = b => pick(Array.from({ length: b - 1 }, (_, i) => i + 1).filter(a => gcd(a, b) === 1));
/* 精確值 [n,d] 的答案輸入：整數或有限小數用小鍵盤，其他用分數鍵盤 */
const isFinDec = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
function ansOf(v) { return v[1] === 1 ? { ans: v[0] } : isFinDec(v[1]) ? { ans: v[0] / v[1], dec: true } : { frac: v }; }

/* ===== 分數與小數的四則混合計算 ===== */
function nextOp(T) {
  let lo = 0, hi = T.length;
  const o = T.lastIndexOf('(');
  if (o >= 0) { lo = o + 1; hi = T.indexOf(')', o); }
  for (const set of ['×÷', '+−']) for (let i = lo; i < hi; i++) if (set.includes(T[i])) return i;
  return -1;
}
function calcQ(a, op, b) { const x = qLit(a), y = qLit(b); return op === '+' ? qAdd(x, y) : op === '−' ? qAdd(x, [-y[0], y[1]]) : op === '×' ? qMul(x, y) : qMul(x, qInv(y)); }
const valOf = T => { let E = T.slice(); while (E.length > 1) { const i = nextOp(E); const v = calcQ(E[i - 1], E[i], E[i + 1]); if (v[0] < 0) return null; E.splice(i - 1, 3, qTok(v)); const o = E.indexOf('('); if (o >= 0 && E[o + 2] === ')') E.splice(o, 3, E[o + 1]); } return qLit(E[0]); };
function mixedA(st) {
  const fr = () => { const b = pick([3, 4, 5, 6, 8]); return `${coprime(b)}/${b}`; };
  const T = [
    () => [fr(), '+', fr(), '×', String(pick([2, 3, 4, 6]))],
    () => ['(', fr(), '+', fr(), ')', '×', String(pick([12, 24]))],
    () => [String(pick([0.5, 1.5, 2.4, 0.6])), '×', fr(), '+', fr()],
    () => [String(pick([3, 4, 6])), '÷', fr(), '−', String(pick([0.5, 1.2, 2]))],
    () => ['(', String(pick([2.5, 3.6, 4.8])), '−', fr(), ')', '÷', String(pick([2, 4]))],
    () => [fr(), '×', String(pick([1.2, 0.8, 2.5])), '÷', fr()]
  ];
  const tasks = shuffle(T).slice(0, 4).map(f => { for (;;) { const e = f(); const v = valOf(e); if (v && v[1] <= 60) return e; } });
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    let E = tasks[r].slice();
    const origH = E.map(eqTokHTML).join(' '), steps = [];
    api.say(`能量配方：<b>${origH}</b>。依照計算順序，<b>點先算的那個符號</b>（電腦會幫你算出那一步）。`, '依照計算順序，點先算的那個符號');
    st.innerHTML = `${dots(r, tasks.length)}<div class="ops-line" id="ex"></div><div class="readout" id="log"></div><div class="kwrap" id="kw"></div>`;
    function draw() {
      $('#ex', st).innerHTML = E.map((t, i) => '+−×÷'.includes(t) ? `<button type="button" class="opk" data-i="${i}">${t}</button>` : `<span>${eqTokHTML(t)}</span>`).join('');
      $('#log', st).innerHTML = steps.map(s => `<div>${s}</div>`).join('');
      $$('.opk', st).forEach(b => b.onclick = () => {
        const i = +b.dataset.i, want = nextOp(E);
        if (i !== want) return api.bad(E.includes('(') ? '括號裡面的要先算！' : '先乘除、後加減；同一級的由左到右。', `先點了「${E[i]}」`, `先算 ${E[want - 1]} ${E[want]} ${E[want + 1]}`);
        const v = calcQ(E[i - 1], E[i], E[i + 1]);
        steps.push(`${eqTokHTML(E[i - 1])} ${E[i]} ${eqTokHTML(E[i + 1])} ＝ ${qFmt(v, !isFinDec(v[1]))}`); sfx('pop');
        E.splice(i - 1, 3, qTok(v));
        const o = E.indexOf('('); if (o >= 0 && E[o + 2] === ')') E.splice(o, 3, E[o + 1]);
        if (E.length === 1) {
          const fin = qLit(E[0]), A = ansOf(fin);
          $('#ex', st).innerHTML = `<span>${origH} ＝ ?</span>`; $('#log', st).innerHTML = steps.map(s => `<div>${s}</div>`).join('');
          api.ok('順序都對了！'); api.say(`照順序算好了，答案是多少？${A.frac ? '（用分數回答）' : ''}`);
          const done = () => { $('#kw', st).innerHTML = `<div class="center"><span class="after">答案 ＝ ${qFmt(fin, !!A.frac)}</span></div>`; r++; later(round, 2200); };
          if (A.frac) fracpad($('#kw', st), A.frac, done, '看最後一步算出來的數。'); else keypad($('#kw', st), A.ans, done, '看最後一步算出來的數。', '', !!A.dec);
          return;
        }
        draw();
      });
    }
    draw();
  }
  round();
}
function mixedB(st) {
  quiz(st, shuffle([
    () => { const b = pick([3, 5, 7]), a = coprime(b), d = pick([2, 4]), c = coprime(d), e = pick([2, 4, 6]); const v = qAdd(qMul([a, b], [c, d]), [1, e]); return { q: `${F(a, b)} × ${F(c, d)} ＋ ${F(1, e)} ＝ ?（用分數回答）`, frac: v, hint: '先乘後加，分母不同要通分。', after: `＝ ${FS(a * c, b * d)} ＋ ${F(1, e)} ＝ ${FS(v[0], v[1])}` }; },
    () => { const x = pick([0.75, 1.25, 2.5, 0.6]), [c, d] = pick([[4, 5], [2, 5], [3, 5], [1, 4]]); const v = qMul(qLit(String(x)), [c, d]); return { q: `${x} × ${F(c, d)} ＝ ?（用小數回答）`, ans: v[0] / v[1], dec: true, hint: `可以把 ${F(c, d)} 化成小數 ${c / d}，或把 ${x} 化成分數。`, after: `${x} × ${F(c, d)} ＝ ${qFmt(v)}` }; },
    () => { const [a, b, c, d] = pick([[2, 3, 1, 4], [1, 2, 1, 3], [3, 4, 1, 6], [5, 6, 1, 4]]), n = 12; const v = qMul(qAdd([a, b], [c, d]), [n, 1]); return { q: `(${F(a, b)} ＋ ${F(c, d)}) × ${n} ＝ ?`, ans: v[0] / v[1], hint: `可以用分配律：${F(a, b)} × ${n} ＋ ${F(c, d)} × ${n}。`, after: `${a * n / b} ＋ ${c * n / d} ＝ ${v[0] / v[1]}` }; },
    () => { const b = pick([4, 8, 5]), a = coprime(b), x = rand(2, 9), y = b * rand(1, 3) - x; if (y <= 0) return null; const v = a * (x + y) / b; return { q: `${F(a, b)} × ${x} ＋ ${F(a, b)} × ${y} ＝ ?`, ans: v, dec: !Number.isInteger(v), hint: `兩項都有 ${F(a, b)}，先算 ${x} ＋ ${y}。`, after: `${F(a, b)} × (${x} ＋ ${y}) ＝ ${F(a, b)} × ${x + y} ＝ ${rd(v)}` }; },
    () => { const x = pick([1.25, 2.4, 3.6]), [c, d] = pick([[3, 5], [2, 3], [3, 4]]), z = pick([0.5, 0.2]); const v = qMul(qMul(qLit(String(x)), [c, d]), qInv(qLit(String(z)))); return isFinDec(v[1]) ? { q: `${x} × ${F(c, d)} ÷ ${z} ＝ ?`, ans: v[0] / v[1], dec: true, hint: '乘除由左到右。', after: `＝ ${qFmt(v)}` } : null; },
    () => { const n = rand(12, 60), [a, b] = pick([[7, 8], [5, 6], [3, 4]]); return { q: `${n} × ${F(a, b)} ○ ${n} ÷ ${F(a, b)}`, keep: true, opts: cmpOpts(n * a / b, n * b / a), hint: '乘以比 1 小的數會變小，除以比 1 小的數會變大。', after: `${n} × ${F(a, b)} 比 ${n} 小，${n} ÷ ${F(a, b)} 比 ${n} 大` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function mixedC(st) {
  quiz(st, shuffle([
    () => { const T = pick([16, 24, 32, 40]), [a, b] = pick([[3, 8], [1, 4], [5, 8]]), u = pick([1.5, 2.5, 3.5]); const v = T - T * a / b - u; return { q: `太空站一桶燃料 ${T} 公升，第一天用了全部的 ${F(a, b)}，第二天用了 ${u} 公升，還剩幾公升？`, eq: `${T} − ${T} × ${a}/${b} − ${u}`, alt: [`${T} × (1 − ${a}/${b}) − ${u}`, `${T} − (${T} × ${a}/${b} + ${u})`], ans: v, unit: '公升', hint: `第一天用了 ${T} 的 ${a}/${b}，是 ${T} × ${a}/${b}。` }; },
    () => { const [a, b] = pick([[3, 4], [2, 3], [5, 6]]), n = pick([6, 8, 10]), k = pick([4, 5]); return { q: `每包太空食物重 ${F(a, b)} 公斤，${n} 包平分給 ${k} 位太空人，每人分到幾公斤？`, eq: `${a}/${b} × ${n} ÷ ${k}`, alt: [`${a}/${b} × ${n} × 1/${k}`, `${a}/${b} × (${n} ÷ ${k})`], frac: qMul([a * n, b], [1, k]), ans: a * n / b / k, unit: '公斤', hint: '先算一共幾公斤，再平分。' }; },
    () => { const [a, b] = pick([[5, 8], [3, 4], [2, 5]]), k = rand(6, 16), L = k * a / b; return Number.isInteger(L * 10) ? { q: `一條電纜長 ${L} 公尺，每 ${F(a, b)} 公尺剪成一段，可以剪成幾段？`, eq: `${L} ÷ ${a}/${b}`, ans: k, unit: '段', hint: '求「有幾個 a/b」，用除法。' } : null; },
    () => { const x = pick([1.2, 2.4, 3.6]), [a, b] = pick([[3, 4], [2, 3], [5, 6]]), y = pick([0.6, 0.8, 1.5]); const v = qAdd(qMul(qLit(String(x)), [a, b]), qLit(String(y))); return isFinDec(v[1]) ? { q: `一箱零件重 ${x} 公斤，取出它的 ${F(a, b)}，再放入 ${y} 公斤的工具，放入的工具和取出的零件一共幾公斤？`, eq: `${x} × ${a}/${b} + ${y}`, ans: v[0] / v[1], unit: '公斤', hint: `取出的是 ${x} 的 ${a}/${b}。` } : null; },
    () => { const L = pick([4.5, 6, 7.5, 9]), [a, b] = pick([[2, 3], [4, 5]]); const w = L * a / b; return Number.isInteger(w * 10) ? { q: `太陽能板是長方形，長 ${L} 公尺，寬是長的 ${F(a, b)}，面積是幾平方公尺？`, eq: `${L} × (${L} × ${a}/${b})`, alt: [`${L} × ${L} × ${a}/${b}`], ans: rd(L * w), unit: '平方公尺', hint: '先求寬，再算 長 × 寬。' } : null; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function mixedD(st) {
  adv(st, [
    { q: `${F(3, 4)} ＋ ${F(1, 4)} × 2 ＝ ?（用分數回答）`, frac: [5, 4], ex: `先乘後加：${F(1, 4)} × 2 ＝ ${F(1, 2)}，${F(3, 4)} ＋ ${F(2, 4)} ＝ ${F(5, 4)}。`, trap: `不能先算 ${F(3, 4)} ＋ ${F(1, 4)} ＝ 1 再乘 2。` },
    { q: '2.5 × 3.7 ＋ 2.5 × 6.3 ＝ ?', ans: 25, dec: true, ex: '用分配律：2.5 × (3.7 ＋ 6.3) ＝ 2.5 × 10 ＝ 25。', trap: '看到兩項都有 2.5，先合併再算最快。' },
    { q: `6 ÷ ${F(3, 4)} − 1.5 ＝ ?`, ans: 6.5, dec: true, ex: `6 ÷ ${F(3, 4)} ＝ 6 × ${F(4, 3)} ＝ 8，8 − 1.5 ＝ 6.5。`, trap: `除以 ${F(3, 4)} 要乘以倒數 ${F(4, 3)}，答案會比 6 大。` },
    { q: '一瓶 2.4 公升的營養液，第一天喝了 1/3，第二天喝了剩下的 1/4，第二天喝了幾公升？', eq: '2.4 × (1 − 1/3) × 1/4', alt: ['(2.4 − 2.4 × 1/3) × 1/4', '(2.4 − 2.4 × 1/3) ÷ 4', '2.4 × (1 − 1/3) ÷ 4'], ans: 0.4, unit: '公升', ex: '剩下 2.4 × (1 − 1/3) ＝ 1.6 公升，第二天喝 1.6 × 1/4 ＝ 0.4 公升。', trap: '「剩下的 1/4」基準量是剩下的 1.6 公升，不是 2.4 公升。' },
    { q: `下面哪一個算式的答案<b>最大</b>？（a 是比 0 大的數）`, opts: [{ h: `a ÷ ${F(2, 3)}`, ok: true }, { h: `a × ${F(2, 3)}`, ok: false }, { h: 'a × 1', ok: false }, { h: 'a ÷ 1.5', ok: false }], ex: `a ÷ ${F(2, 3)} ＝ a × 1.5 最大；a × ${F(2, 3)} 和 a ÷ 1.5 都比 a 小。`, trap: '除以比 1 小的數，答案會變大。' }
  ]);
}

/* ===== 圓形圖與可能性 ===== */
const PCOL = ['#8b5cf6', '#14b8c8', '#ffc83d', '#ff8a3d', '#22a06b', '#e5484d'];
/* 圓形圖：parts [{n, p}]（p 是百分率），從 12 點鐘方向順時針畫 */
function pieSVG(parts, S = 220, lab = true) {
  const c = S / 2, r = c - 10; let a0 = 0, g = '';
  parts.forEach((pt, i) => {
    if (pt.p <= 0) return;
    const a1 = a0 + pt.p / 100 * 360, P = a => [c + r * Math.sin(a * Math.PI / 180), c - r * Math.cos(a * Math.PI / 180)];
    const [x0, y0] = P(a0), [x1, y1] = P(a1), mid = P((a0 + a1) / 2).map((v, k) => c + (v - c) * 0.62);
    g += pt.p >= 100 ? `<circle cx="${c}" cy="${c}" r="${r}" fill="${PCOL[i]}"/>` : `<path d="M${c},${c}L${x0.toFixed(1)},${y0.toFixed(1)}A${r},${r} 0 ${pt.p > 50 ? 1 : 0},1 ${x1.toFixed(1)},${y1.toFixed(1)}Z" fill="${PCOL[i]}" stroke="#fff" stroke-width="2"/>`;
    if (lab && pt.p >= 8) g += `<text x="${mid[0].toFixed(1)}" y="${(mid[1] - 2).toFixed(1)}" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" stroke="#1b2340" stroke-width="3" paint-order="stroke">${pt.n}</text><text x="${mid[0].toFixed(1)}" y="${(mid[1] + 14).toFixed(1)}" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" stroke="#1b2340" stroke-width="3" paint-order="stroke">${pt.p}%</text>`;
    a0 = a1;
  });
  return `<svg class="svgbox" viewBox="0 0 ${S} ${S}" width="${S}"><circle cx="${c}" cy="${c}" r="${r}" fill="#eef2ff" stroke="#9fb0e8" stroke-width="2"/>${g}</svg>`;
}
/* 隨機百分率（5 的倍數，總和 100，各不相同） */
function pcts(k) { for (;;) { const a = []; let left = 20; for (let i = 0; i < k - 1; i++) { const v = rand(1, left - (k - 1 - i)); a.push(v); left -= v; } a.push(left); if (new Set(a).size === k && a.every(v => v >= 2)) return shuffle(a).map(v => v * 5); } }
const RES = ['水', '氧氣', '食物', '燃料', '零件'];
function pieA(st) {
  const tasks = [[20, 3], [40, 4]];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [N, k] = tasks[r], ps = pcts(k), names = RES.slice(0, k), cnt = ps.map(p => N * p / 100), curp = names.map(() => 0);
    api.say(`太空站 ${N} 箱補給品：${names.map((n, i) => `${n} <b>${cnt[i]}</b> 箱`).join('、')}。先算出每一種占全部的百分率，再用 ＋ − 調出圓形圖！`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="pie"></div><div class="pie-ctl">${names.map((n, i) => `<div class="grp"><span class="sw" style="background:${PCOL[i]}"></span>${n}<button type="button" data-i="${i}" data-d="-5">−</button><span id="pv${i}">0</span>%<button type="button" data-i="${i}" data-d="5">＋</button></div>`).join('')}</div>
      <div class="readout">合計 <span id="sum">0</span>%</div><div class="center"><button type="button" class="btn gold" id="okb">畫好了！</button></div>`;
    const draw = () => { $('#pie', st).innerHTML = pieSVG(names.map((n, i) => ({ n, p: curp[i] }))); curp.forEach((p, i) => $('#pv' + i, st).textContent = p); $('#sum', st).textContent = curp.reduce((a, b) => a + b, 0); };
    $$('.pie-ctl button', st).forEach(b => b.onclick = () => { const i = +b.dataset.i, s = curp.reduce((a, x) => a + x, 0), d = +b.dataset.d; if (d > 0 && s >= 100) return toast('合計已經 100% 了！'); curp[i] = Math.max(0, curp[i] + d); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const w = ps.findIndex((p, i) => p !== curp[i]);
      if (w >= 0) return api.bad(`${names[w]} ${cnt[w]} 箱 ÷ ${N} 箱 ＝ ${ps[w] / 100}，是 ${ps[w]}%。`, `${names[w]} ${curp[w]}%`, `${ps[w]}%`);
      $('#okb', st).disabled = true; api.ok('圓形圖畫對了！'); speak('圓形圖畫對了'); r++; later(round, 1800);
    };
    draw();
  }
  round();
}
function pieB(st) {
  const mk = () => { const ps = pcts(4), names = shuffle(['看書', '運動', '畫畫', '音樂', '電玩']).slice(0, 4); return { ps, names, vis: pieSVG(names.map((n, i) => ({ n, p: ps[i] }))) }; };
  quiz(st, [
    () => { const c = mk(), m = Math.max(...c.ps); return { q: '太空學校學生最喜歡的活動（圓形圖）。哪一種的人<b>最多</b>？', vis: c.vis, opts: c.names.map((n, i) => ({ h: n, ok: c.ps[i] === m })), hint: '扇形最大、百分率最大的人最多。' }; },
    () => { const c = mk(), N = pick([200, 400, 500, 800]), i = rand(0, 3); return { q: `全校有 ${N} 人，最喜歡<b>${c.names[i]}</b>的有幾人？`, vis: c.vis, eq: `${N} × ${c.ps[i]}%`, alt: [`${N} × ${c.ps[i] / 100}`, `${N} ÷ 100 × ${c.ps[i]}`], nums: [N, c.ps[i] + '%'], ans: N * c.ps[i] / 100, unit: '人', hint: '人數 ＝ 全部 × 百分率。' }; },
    () => { const c = mk(), [i, j] = shuffle([0, 1, 2, 3]); const a = Math.max(c.ps[i], c.ps[j]), b = Math.min(c.ps[i], c.ps[j]), ni = c.ps[i] >= c.ps[j] ? c.names[i] : c.names[j], nj = c.ps[i] >= c.ps[j] ? c.names[j] : c.names[i]; return a === b ? null : { q: `${ni}比${nj}多百分之幾？`, vis: c.vis, ans: a - b, unit: '%', hint: '兩個百分率相減。', after: `${a}% − ${b}% ＝ ${a - b}%` }; },
    () => { const c = mk(), i = c.ps.findIndex(p => p === 25 || p === 50 || p === 20 || p === 10); return i < 0 ? null : { q: `最喜歡${c.names[i]}的人占全部的幾分之幾？（用最簡分數）`, vis: c.vis, frac: simp(c.ps[i], 100), simplest: true, hint: `${c.ps[i]}% ＝ ${c.ps[i]}/100，再約分。` }; },
    () => { const c = mk(), N = pick([40, 60, 80]); const i = c.ps.findIndex(p => N * p % 100 === 0); return i < 0 ? null : { q: `如果全班 ${N} 人，最喜歡${c.names[i]}的比全班少幾人？`, vis: c.vis, eq: `${N} − ${N} × ${c.ps[i]}%`, alt: [`${N} × (100% − ${c.ps[i]}%)`, `${N} × (1 − ${c.ps[i]}%)`], nums: [N, c.ps[i] + '%'], ans: N - N * c.ps[i] / 100, unit: '人', hint: '先求最喜歡的人數，再用全班減。' }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; }));
}
function pieC(st) {
  quiz(st, shuffle([
    () => { const c = [rand(4, 8), rand(1, 3), rand(1, 3)]; if (c[1] === c[2]) c[2]++; const nm = ['紅色', '藍色', '黃色'], m = c.indexOf(Math.max(...c)); return { q: `袋子裡有紅球 ${c[0]} 顆、藍球 ${c[1]} 顆、黃球 ${c[2]} 顆，閉著眼睛摸一顆，摸到哪一種顏色的<b>可能性最大</b>？`, opts: nm.map((n, i) => ({ h: n, ok: i === m })), hint: '數量最多的，摸到的可能性最大。' }; },
    { q: '袋子裡只有 6 顆紅球，摸一顆是紅球的可能性是？', opts: [{ h: '一定', ok: true }, { h: '可能', ok: false }, { h: '不可能', ok: false }], hint: '袋子裡全部是紅球。' },
    { q: '袋子裡只有紅球和藍球，摸到綠球的可能性是？', opts: [{ h: '不可能', ok: true }, { h: '可能', ok: false }, { h: '一定', ok: false }], hint: '袋子裡沒有綠球。' },
    { q: '擲一顆骰子，出現「偶數」和出現「6」，哪一個可能性比較大？', opts: [{ h: '偶數', ok: true }, { h: '6', ok: false }, { h: '一樣大', ok: false }], hint: '偶數有 2、4、6 三種，6 只有一種。' },
    () => { const ps = pcts(3), nm = ['火星', '木星', '土星'], m = ps.indexOf(Math.max(...ps)); return { q: '轉動這個轉盤，指針最可能停在哪一個區域？', vis: pieSVG(nm.map((n, i) => ({ n, p: ps[i] }))), opts: nm.map((n, i) => ({ h: n, ok: i === m })), hint: '扇形面積越大，停在那裡的可能性越大。' }; },
    () => { const T = pick([2400, 3600, 4800]), p = pick([25, 35, 40, 15]); return { q: `太空站每月預算 ${comma(T)} 元，圓形圖顯示食物費占 ${p}%，食物費是幾元？`, eq: `${T} × ${p}%`, alt: [`${T} × ${p / 100}`, `${T} ÷ 100 × ${p}`], ans: T * p / 100, unit: '元', hint: '全部 × 百分率。' }; }
  ]));
}
function pieD(st) {
  const ps = [40, 25, 20, 15], nm = ['水', '食物', '燃料', '零件'];
  adv(st, [
    { q: '太空站 600 箱補給品的分配（圓形圖）。燃料比零件多幾箱？', vis: pieSVG(nm.map((n, i) => ({ n, p: ps[i] }))), nums: [600, '20%', '15%'], eq: '600 × 20% − 600 × 15%', alt: ['600 × (20% − 15%)', '600 × 5%', '600 × 0.2 − 600 × 0.15', '600 × 0.05'], ans: 30, unit: '箱', ex: '燃料 600 × 20% ＝ 120 箱，零件 600 × 15% ＝ 90 箱，相差 30 箱（或 600 × 5% ＝ 30）。', trap: '問的是「箱數」，不是 20% − 15% ＝ 5%。' },
    { q: '同上圖，如果水有 240 箱，全部補給品有幾箱？', vis: pieSVG(nm.map((n, i) => ({ n, p: ps[i] }))), nums: [240, '40%'], eq: '240 ÷ 40%', alt: ['240 ÷ 0.4', '240 ÷ 40 × 100'], ans: 600, unit: '箱', ex: '水占 40%，全部 ＝ 240 ÷ 40% ＝ 600 箱。', trap: '已知部分和百分率求全部，用除法，不是 240 × 40%。' },
    { q: '圓形圖中，占 25% 的扇形，圓心角是幾度？', ans: 90, unit: '度', ex: '整個圓 360 度，360 × 25% ＝ 90 度。', trap: '不是 25 度，要用 360 度乘以百分率。' },
    { q: '袋子裡有紅球 5 顆、藍球 3 顆。再放入幾顆藍球，摸到紅球和藍球的可能性就一樣大？', ans: 2, unit: '顆', ex: '兩種顏色一樣多時可能性一樣大，5 − 3 ＝ 2 顆。', trap: '不是放 5 顆，是讓藍球也變成 5 顆。' },
    { q: '下面哪一個敘述<b>正確</b>？', opts: [{ h: '圓形圖各部分的百分率加起來是 100%', ok: true }, { h: '圓形圖適合看資料隨時間的變化', ok: false }, { h: '摸到可能性比較小的球，就一定摸不到', ok: false }, { h: '圓形圖的扇形越大，數量一定越少', ok: false }], ex: '圓形圖表示各部分占全部的百分率，總和是 100%；看隨時間的變化用折線圖。', trap: '可能性小不等於不可能，還是有可能摸到。' }
  ]);
}

/* ===== 基準量與比較量 ===== */
function baseA(st) {
  const mk = () => { const n = pick([3, 4, 5, 6]), a = rand(1, 2 * n - 1); if (a === n) return mk(); const v = rand(3, 9) * pick([2, 4]); return { n, a, v }; };
  const tasks = [mk(), mk(), mk()];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { n, a, v } = tasks[r], A = n * v;
    let k = 0;
    api.say(`藍色燃料艙是 <b>${A}</b> 公升（基準量），分成 ${n} 格。紅色燃料艙是藍色的 <b>${F(a, n)}</b>，用 ＋ − 排出紅色的格數！`);
    st.innerHTML = `${dots(r, tasks.length)}<div id="bars"></div><div class="ctl"><div class="grp">紅色 <button type="button" data-d="-1">−</button><span class="v" id="vk">0</span><button type="button" data-d="1">＋</button> 格</div></div>
      <div class="center"><button type="button" class="btn gold" id="okb">排好了！</button></div><div class="kwrap" id="kw"></div>`;
    const cell = `display:inline-block;width:min(40px, calc((100vw - 120px) / ${2 * n}));height:34px;border:2px solid #1b2340;margin-right:-2px;vertical-align:middle`;
    const draw = () => { $('#bars', st).innerHTML = `<div style="margin:6px 0;font-weight:900">藍（基準量）：<span style="white-space:nowrap">${Array.from({ length: n }, () => `<i style="${cell};background:#5aa8ff"></i>`).join('')}</span> ${A} 公升</div><div style="margin:6px 0;font-weight:900">紅（比較量）：<span style="white-space:nowrap">${Array.from({ length: k }, () => `<i style="${cell};background:#ff7a8a"></i>`).join('')}</span> ?</div>`; $('#vk', st).textContent = k; };
    $$('.ctl button', st).forEach(b => b.onclick = () => { if ($('#okb', st).disabled) return; k = Math.max(0, Math.min(2 * n, k + +b.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (k !== a) return api.bad(`${F(a, n)} 就是 ${a} 個 ${F(1, n)}，要排 ${a} 格。`, `排了 ${k} 格`, `${a} 格`);
      $('#okb', st).disabled = true; api.ok('排對了！');
      api.say(`每格是 ${A} ÷ ${n} ＝ ${v} 公升。紅色燃料艙是幾公升？`);
      keypad($('#kw', st), a * v, () => { $('#kw', st).innerHTML = `<div class="center"><span class="after">比較量 ＝ 基準量 × 比值 ＝ ${A} × ${F(a, n)} ＝ ${a * v} 公升</span></div>`; speak(`${A}乘以${n}分之${a}等於${a * v}`); r++; later(round, 2400); }, `${a} 格 × 每格 ${v} 公升。`, '公升');
    };
    draw();
  }
  round();
}
function baseB(st) {
  quiz(st, shuffle([
    () => { const [x, y] = pick([['紅隊', '藍隊'], ['哥哥', '弟弟'], ['火箭甲', '火箭乙']]); const [a, b] = pick([[4, 5], [3, 2], [5, 8]]); return { q: `「${x}的人數是${y}的 ${F(a, b)}」，這句話的<b>基準量</b>是誰？`, opts: [{ h: y, ok: true }, { h: x, ok: false }, { h: '兩隊合起來', ok: false }], hint: '「是誰的幾分之幾」，「誰」就是基準量。' }; },
    () => { const [a, b] = pick([[2, 3], [3, 4], [5, 6], [7, 4]]), B = b * rand(4, 15); return { q: `乙有 ${B} 個零件，甲的零件數是乙的 ${F(a, b)}，甲有幾個？`, eq: `${B} × ${a}/${b}`, ans: B * a / b, unit: '個', hint: '比較量 ＝ 基準量 × 比值。' }; },
    () => { const [a, b] = pick([[3, 4], [2, 5], [5, 3], [4, 7]]), k = rand(4, 12), A = a * k; return { q: `甲有 ${A} 公升燃料，是乙的 ${F(a, b)}，乙有幾公升？`, eq: `${A} ÷ ${a}/${b}`, alt: [`${A} ÷ ${a} × ${b}`], ans: b * k, unit: '公升', hint: '基準量 ＝ 比較量 ÷ 比值。' }; },
    () => { const P = pick([800, 1200, 1500, 2000]), d = pick([75, 80, 85, 90]); return { q: `一個太空模型原價 ${comma(P)} 元，打 ${d % 10 ? d : d / 10} 折（${d}%）後賣多少元？`, eq: `${P} × ${d}%`, alt: [`${P} × ${d / 100}`, `${P} ÷ 100 × ${d}`], ans: P * d / 100, unit: '元', hint: '打折後的價錢 ＝ 原價 × 折數。' }; },
    () => { const b = rand(12, 40), a = rand(5, b - 2); return { q: `甲有 ${a} 個，乙有 ${b} 個。甲是乙的幾分之幾？（比值，用分數）`, frac: [a, b], hint: '比值 ＝ 比較量 ÷ 基準量 ＝ 甲 ÷ 乙。', after: `${a} ÷ ${b} ＝ ${FS(a, b)}` }; },
    () => { const B = pick([40, 60, 80, 120]), p = pick([15, 25, 35, 45]); return { q: `全班 ${B} 人，戴眼鏡的占 ${p}%，戴眼鏡的有幾人？`, eq: `${B} × ${p}%`, alt: [`${B} × ${p / 100}`], ans: B * p / 100, unit: '人', hint: '比較量 ＝ 基準量 × 百分率。' }; }
  ].map(f => typeof f !== 'function' ? f : () => { let q; do { q = f(); } while (!q || (q.ans !== undefined && !Number.isInteger(q.ans))); return q; })));
}
function baseC(st) {
  quiz(st, shuffle([
    () => { const [a, b] = pick([[3, 5], [2, 3], [3, 4], [4, 5]]), k = rand(3, 9), y = b * k, S = y + a * k; return { q: `甲的貼紙數是乙的 ${F(a, b)}，兩人合起來有 ${S} 張，乙有幾張？`, eq: `${S} ÷ (1 + ${a}/${b})`, alt: [`${S} ÷ ${a + b} × ${b}`, `${S} ÷ (${a} + ${b}) × ${b}`, `${S} ÷ ${a + b}/${b}`], ans: y, unit: '張', hint: `把乙看成 1，兩人合起來是 1 ＋ ${a}/${b}。` }; },
    () => { const [a, b] = pick([[1, 4], [1, 5], [2, 5], [1, 3]]), k = rand(3, 12), y = b * k, d = a * k; return { q: `甲比乙多乙的 ${F(a, b)}，甲比乙多 ${d} 公斤，乙有幾公斤？`, eq: `${d} ÷ ${a}/${b}`, alt: [`${d} ÷ ${a} × ${b}`], ans: y, unit: '公斤', hint: `多出來的 ${d} 公斤就是乙的 ${a}/${b}。` }; },
    () => { const P = pick([500, 800, 1000, 1200, 1500]), d = pick([80, 75, 90]), S = P * d / 100; return { q: `打 ${d % 10 ? d : d / 10} 折（${d}%）以後賣 ${S} 元，原價是幾元？`, eq: `${S} ÷ ${d}%`, alt: [`${S} ÷ ${d / 100}`, `${S} ÷ ${d} × 100`], ans: P, unit: '元', hint: '原價是基準量：原價 ＝ 售價 ÷ 折數。' }; },
    () => { const O = pick([50, 80, 120, 150, 200]), p = pick([10, 20, 25]), N = O * (100 + p) / 100; return { q: `太空站的人數比原來增加了 ${p}%，現在是 ${N} 人，原來有幾人？`, eq: `${N} ÷ (1 + ${p}%)`, alt: [`${N} ÷ (100% + ${p}%)`, `${N} ÷ ${(100 + p) / 100}`, `${N} ÷ ${100 + p}%`], ans: O, unit: '人', hint: `原來看成 100%，現在是 100% ＋ ${p}%。` }; },
    () => { const T = pick([30, 40, 45, 50, 60]), [a, b] = pick([[2, 3], [1, 4], [3, 2], [1, 2]]); const g = T * b / (a + b); return Number.isInteger(g) ? { q: `全班 ${T} 人，男生人數是女生的 ${F(a, b)}，女生有幾人？`, eq: `${T} ÷ (1 + ${a}/${b})`, alt: [`${T} ÷ ${a + b} × ${b}`, `${T} ÷ (${a} + ${b}) × ${b}`], ans: g, unit: '人', hint: `把女生看成 1，全班是 1 ＋ ${a}/${b}。` } : null; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function baseD(st) {
  adv(st, [
    { q: '甲是乙的 3/4，乙是丙的 2/3。丙有 48 個，甲有幾個？', eq: '48 × 2/3 × 3/4', alt: ['48 × 2/3 × 3 ÷ 4', '48 × (2/3 × 3/4)'], ans: 24, unit: '個', ex: '乙 ＝ 48 × 2/3 ＝ 32，甲 ＝ 32 × 3/4 ＝ 24。', trap: '每一句的基準量不同：先用丙求乙，再用乙求甲。' },
    { q: '一件衣服打八折後是 640 元，比原價便宜幾元？', eq: '640 ÷ 80% − 640', alt: ['640 ÷ 0.8 − 640', '640 ÷ 80% × 20%', '640 ÷ 0.8 × 0.2'], ans: 160, unit: '元', ex: '原價 ＝ 640 ÷ 0.8 ＝ 800 元，便宜 800 − 640 ＝ 160 元。', trap: '不是 640 × 20% ＝ 128，20% 的基準量是原價 800 元。' },
    { q: '甲比乙多 25%，乙比甲少百分之幾？', opts: [{ h: '20%', ok: true }, { h: '25%', ok: false }, { h: '75%', ok: false }, { h: '125%', ok: false }], ex: '設乙 100，甲 125。乙比甲少 25，基準量是甲 125，25 ÷ 125 ＝ 20%。', trap: '基準量換了，百分率就不一樣，不是 25%。' },
    { q: '男生是女生的 5/4，全班 36 人，男生比女生多幾人？', eq: '36 ÷ (1 + 5/4) × 1/4', alt: ['36 ÷ 9 × 5 − 36 ÷ 9 × 4', '36 ÷ 9', '36 ÷ (5 + 4)'], ans: 4, unit: '人', ex: '女生 ＝ 36 ÷ (1 ＋ 5/4) ＝ 16 人，男生 20 人，多 4 人。', trap: '先求出女生（基準量），男生多的是女生的 1/4。' },
    { q: '一桶燃料用掉 40% 後還剩 72 公升，原來有幾公升？', eq: '72 ÷ (1 − 40%)', alt: ['72 ÷ 60%', '72 ÷ 0.6', '72 ÷ (100% − 40%)'], ans: 120, unit: '公升', ex: '剩下的是原來的 60%，原來 ＝ 72 ÷ 60% ＝ 120 公升。', trap: '72 公升是剩下的 60%，不是用掉的 40%。' }
  ]);
}

Object.assign(LEVELS, {
  mixed: [mixedA, mixedB, mixedC, mixedD],
  pie: [pieA, pieB, pieC, pieD],
  base: [baseA, baseB, baseC, baseD]
});
