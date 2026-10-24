'use strict';
/* 第 7 單元 數量關係 ／ 第 8 單元 整數四則 ／ 第 9 單元 小數 ／ 第 10 單元 長度 */

/* 排成 r 列 c 行的點點圖 */
function dotFig(r, c, k) {
  const g = 14, W = c * g + 8, H = r * g + 8;
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:${W * 2}px;max-width:30vw;height:auto">`;
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) s += `<circle cx="${4 + g / 2 + j * g}" cy="${4 + g / 2 + i * g}" r="5" fill="#ff7eb3"/>`;
  return `<div class="dfig">${s}</svg><small>第 ${k} 個</small></div>`;
}

/* ===== 7-A 點點圖形規律：在方格上點出第 4 個圖形 ===== */
function u7A(st) {
  const kinds = shuffle([
    { name: '正方形', dim: n => [n, n] },
    { name: '長方形', dim: n => [n, n + 1] },
    { name: '兩列', dim: n => [2, n + 1] }
  ]);
  let r = 0;
  function round() {
    if (r >= kinds.length) return api.finish();
    const K = kinds[r], [tr, tc] = K.dim(4), on = new Set(), G = 6;
    api.say('找出規律，在方格裡點出<b>第 4 個</b>圖形！', '找出規律，在方格裡點出第 4 個圖形');
    st.innerHTML = `${dots(r, kinds.length)}<div class="dfigs">${[1, 2, 3].map(n => dotFig(...K.dim(n), n)).join('')}<div class="dfig q">？<small>第 4 個</small></div></div>
      <div class="paint dgrid" style="grid-template-columns:repeat(${G},1fr);max-width:330px">${Array.from({ length: G * G }, (_, k) => `<button type="button" class="cell" data-k="${k}"></button>`).join('')}</div>
      <div class="readout" id="ro">點了 0 個</div><div class="center"><button class="btn ghost" id="clr" type="button">全部清掉</button> <button class="btn mint" id="okb" type="button">好了！</button></div>`;
    $$('.cell', st).forEach(c => c.onclick = () => { const k = +c.dataset.k; sfx('tap'); on.has(k) ? on.delete(k) : on.add(k); c.classList.toggle('on'); $('#ro', st).textContent = `點了 ${on.size} 個`; });
    $('#clr', st).onclick = () => { on.clear(); $$('.cell', st).forEach(c => c.classList.remove('on')); $('#ro', st).textContent = '點了 0 個'; };
    $('#okb', st).onclick = () => {
      const ks = [...on], rs = ks.map(k => Math.floor(k / G)), cs = ks.map(k => k % G);
      const h = ks.length ? Math.max(...rs) - Math.min(...rs) + 1 : 0, w = ks.length ? Math.max(...cs) - Math.min(...cs) + 1 : 0;
      const ok = ks.length === h * w && ((h === tr && w === tc) || (h === tc && w === tr));
      if (ok) { api.ok(`對！第 4 個有 ${tr * tc} 個點`); speak(`對，第 4 個是 ${tr} 乘 ${tc}，有 ${tr * tc} 個點`); r++; later(round, 2200); }
      else api.bad(`看看每一個比前一個多了一列還是一行？第 4 個應該排成 ${tr} 列！`);
    };
  }
  round();
}

/* ===== 7-B 數字的規律 ===== */
function u7B(st) {
  const seqQ = (arr, g, hint) => ({ q: '找規律，空格裡是多少？', vis: `<span class="eq sm">${arr.map((v, i) => i === g ? '<span class="box">?</span>' : v).join(' , ')}</span>`, ans: arr[g], hint });
  const rounds = [
    () => { const s = rand(3, 20), d = rand(4, 12); return seqQ([0, 1, 2, 3, 4, 5].map(k => s + d * k), rand(3, 5), '後面一個比前面一個多多少？'); },
    () => { const s = rand(150, 300), d = rand(6, 15); return seqQ([0, 1, 2, 3, 4, 5].map(k => s - d * k), rand(3, 5), '後面一個比前面一個少多少？'); },
    () => { const s = rand(2, 5); return seqQ([0, 1, 2, 3, 4, 5].map(k => s * 2 ** k), rand(4, 5), '每一個都是前一個的幾倍？'); },
    () => { const s = rand(1, 9), a = rand(2, 5), b = rand(6, 9); const arr = [s]; for (let k = 1; k < 7; k++) arr.push(arr[k - 1] + (k % 2 ? a : b)); return seqQ(arr, 6, `一次加 ${a}、一次加 ${b}，輪流加！`); },
    () => {
      const st0 = rand(1, 3), row = rand(1, 3), col = rand(0, 6), v = st0 + row * 7 + col;
      let cal = '<table class="cal"><tr>' + ['日', '一', '二', '三', '四', '五', '六'].map(x => `<th>${x}</th>`).join('') + '</tr>';
      for (let i = 0; i < 4; i++) { cal += '<tr>'; for (let j = 0; j < 7; j++) { const n = st0 + i * 7 + j; cal += `<td>${i === row && j === col ? '<span class="box">?</span>' : (i === row || j === col) && Math.abs(i - row) + Math.abs(j - col) > 1 ? '' : n}</td>`; } cal += '</tr>'; }
      return { q: '月曆上被遮住的日期是幾號？', vis: cal + '</table>', ans: v, hint: '月曆上，下面一格比上面一格多 7！', after: '上下相差 7，左右相差 1' };
    }
  ];
  quiz(st, rounds);
}

/* ===== 7-C 奇偶與規律挑戰 ===== */
function u7C(st) {
  const oe = v => v % 2 ? '奇數' : '偶數';
  const rounds = [
    () => { const a = rand(11, 99), b = rand(11, 99); return { q: `${a} + ${b} 的答案是奇數還是偶數？（不用算出來）`, vis: `<span class="eq sm">${oe(a)} + ${oe(b)}</span>`, keep: true, opts: [{ h: '奇數', ok: (a + b) % 2 === 1 }, { h: '偶數', ok: (a + b) % 2 === 0 }], hint: '奇數＋奇數＝偶數，偶數＋偶數＝偶數，奇數＋偶數＝奇數', after: `${a} + ${b} = ${a + b}，是${oe(a + b)}` }; },
    () => {
      const mul = Math.random() < .5, a = mul ? rand(11, 49) : rand(50, 99), b = mul ? rand(3, 9) : rand(11, 49), v = mul ? a * b : a - b, op = mul ? '×' : '−';
      return { q: `${a} ${op} ${b} 的答案是奇數還是偶數？（不用算出來）`, vis: `<span class="eq sm">${oe(a)} ${op} ${oe(b)}</span>`, keep: true, opts: [{ h: '奇數', ok: v % 2 === 1 }, { h: '偶數', ok: v % 2 === 0 }], hint: mul ? '奇數×奇數＝奇數；只要有一個是偶數，積就是偶數！' : '奇數−奇數＝偶數，偶數−偶數＝偶數，奇數和偶數相減＝奇數', after: `${a} ${op} ${b} = ${v}，是${oe(v)}` };
    },
    () => { const v = rand(101, 999); return { q: `${v} 是奇數還是偶數？`, keep: true, opts: [{ h: '奇數', ok: v % 2 === 1 }, { h: '偶數', ok: v % 2 === 0 }], hint: '看個位：0、2、4、6、8 是偶數！' }; },
    () => { const pat = shuffle(['🔴', '🔺', '🟦', '⭐']).slice(0, rand(3, 4)), n = rand(17, 35), ans = pat[(n - 1) % pat.length]; return { q: `照這個規律排下去，第 ${n} 個是什麼？`, vis: `<span class="eq sm">${Array.from({ length: pat.length * 2 }, (_, k) => pat[k % pat.length]).join(' ')} ……</span>`, keep: true, opts: pat.map(p => ({ h: p, ok: p === ans })), hint: `每 ${pat.length} 個一組，${n} ÷ ${pat.length} 餘多少？`, after: `${n} ÷ ${pat.length} = ${Math.floor(n / pat.length)} …… ${n % pat.length}` }; },
    () => { const n = rand(6, 12); return { q: `用火柴棒排正方形：1 個用 4 根，2 個用 7 根，3 個用 10 根……排 ${n} 個要幾根？`, vis: '<span style="font-size:44px">🟧🟧🟧</span>', ans: 3 * n + 1, unit: '根', hint: '每多 1 個正方形，就多 3 根！', after: `4 + 3 × ${n - 1} = ${3 * n + 1}（根）` }; },
    () => { const n = rand(5, 9); return { q: `1、3、5、7…… 這樣連續的奇數，前 ${n} 個加起來是多少？`, vis: '<span class="eq sm">1 = 1，1 + 3 = 4，1 + 3 + 5 = 9</span>', ans: n * n, hint: '1、4、9……是 1×1、2×2、3×3！', after: `${n} × ${n} = ${n * n}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 整數四則：找出先算的那一步 ===== */
const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };
function firstOp(t) {
  let s = 0, e = t.length - 1;
  const close = t.indexOf(')');
  if (close >= 0) { e = close - 1; s = t.lastIndexOf('(', close) + 1; }
  for (let i = s; i <= e; i++) if (t[i] === '×' || t[i] === '÷') return i;
  for (let i = s; i <= e; i++) if (t[i] === '+' || t[i] === '−') return i;
  return -1;
}
function evalTokens(t) { t = t.slice(); let i; while ((i = firstOp(t)) >= 0) { t.splice(i - 1, 3, OPS[t[i]](t[i - 1], t[i + 1])); const j = i - 1; if (t[j - 1] === '(' && t[j + 1] === ')') t.splice(j - 1, 3, t[j]); } return t[0]; }
const exprText = t => t.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
function genExpr(kind) {
  const k = rand(2, 9);
  switch (kind) {
    case 0: return [rand(20, 90), '+', rand(3, 9), '×', rand(3, 9)];
    case 1: return [rand(60, 150), '−', k * rand(3, 9), '÷', k];
    case 2: return ['(', rand(12, 40), '+', rand(5, 30), ')', '×', rand(2, 6)];
    case 3: { const a = rand(6, 9), b = rand(6, 9), c = rand(2, 5), d = rand(2, 5); return [a, '×', b, '−', c, '×', d]; }
    case 4: return [rand(100, 300), '−', rand(20, 90), '+', rand(10, 60)];
    case 5: { const c = rand(2, 9), m = c + rand(2, 6); return [m * rand(3, 12), '÷', '(', m + c, '−', c, ')']; }
    case 7: return [k * rand(4, 15), '÷', k, '×', rand(2, 9)];
    default: return [rand(2, 9), '×', '(', rand(30, 60), '−', rand(5, 25), ')', '+', rand(10, 50)];
  }
}
const ruleHint = t => t.includes('(') ? '有括號，括號裡面要先算！' : (t.includes('×') || t.includes('÷')) && (t.includes('+') || t.includes('−')) ? '先乘除、後加減！' : t.includes('×') || t.includes('÷') ? '只有乘除，由左而右算！' : '只有加減，由左而右算！';

/* ===== 8-A 先算哪一步：點算式裡要先算的符號 ===== */
function u8A(st) {
  const exprs = [genExpr(4), genExpr(7), genExpr(0), genExpr(2), genExpr(3), genExpr(6)];
  let r = 0;
  function round() {
    if (r >= exprs.length) return api.finish();
    let t = exprs[r].slice();
    const ans = evalTokens(t);
    st.innerHTML = `${dots(r, exprs.length)}<div class="expr" id="ex"></div><div class="llog" id="lg"></div>`;
    const lg = $('#lg', st);
    function step() {
      const i = firstOp(t);
      if (i < 0) { api.ok(`${exprText(exprs[r])} = ${ans}`); speak(`答案是 ${ans}`); r++; return later(round, 2200); }
      $('#ex', st).innerHTML = t.map((x, k) => '+−×÷'.includes(x) && typeof x === 'string' && x.length === 1 ? `<button type="button" class="opk" data-k="${k}">${x}</button>` : `<span>${x}</span>`).join('');
      api.say('點一下<b>要先算</b>的符號！', '點一下要先算的符號');
      $$('.opk', st).forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (k !== i) { b.classList.add('wrong'); return api.bad(ruleHint(t)); }
        const v = OPS[t[k]](t[k - 1], t[k + 1]);
        lg.insertAdjacentHTML('beforeend', `<div>${t[k - 1]} ${t[k]} ${t[k + 1]} = ${v}</div>`);
        sfx('ok'); t.splice(k - 1, 3, v);
        const j = k - 1; if (t[j - 1] === '(' && t[j + 1] === ')') t.splice(j - 1, 3, t[j]);
        later(step, 600);
      });
    }
    step();
  }
  round();
}

/* ===== 8-B 列出併式 ===== */
function u8B(st) {
  const rounds = [
    () => { const a = rand(3, 6), b = rand(25, 45), c = rand(10, 30); return { q: `買 ${a} 枝 ${b} 元的筆和 1 本 ${c} 元的筆記本，共要多少元？哪一個併式正確？`, opts: [{ h: `<span class="small-opt">${b} × ${a} + ${c}</span>`, ok: true }, { h: `<span class="small-opt">(${b} + ${c}) × ${a}</span>`, ok: false }, { h: `<span class="small-opt">${b} + ${a} × ${c}</span>`, ok: false }], hint: '筆要乘枝數，筆記本只有 1 本！', after: `${b} × ${a} + ${c} = ${b * a + c}（元）` }; },
    () => { const a = rand(30, 60), b = rand(10, 25), c = rand(3, 6); return { q: `一件上衣 ${a} 元，一條褲子 ${b} 元，買 ${c} 套共要多少元？`, opts: [{ h: `<span class="small-opt">(${a} + ${b}) × ${c}</span>`, ok: true }, { h: `<span class="small-opt">${a} + ${b} × ${c}</span>`, ok: false }, { h: `<span class="small-opt">${a} × ${c} + ${b}</span>`, ok: false }], hint: '一套是上衣加褲子，要先算一套多少錢，所以加括號！', after: `(${a} + ${b}) × ${c} = ${(a + b) * c}（元）` }; },
    () => { const c = rand(3, 8), q = rand(25, 55), a = 500; return { q: `媽媽有 ${a} 元，買了 ${c} 盒餅乾，每盒 ${q} 元，還剩多少元？`, opts: [{ h: `<span class="small-opt">${a} − ${q} × ${c}</span>`, ok: true }, { h: `<span class="small-opt">(${a} − ${q}) × ${c}</span>`, ok: false }, { h: `<span class="small-opt">${a} − ${q} + ${c}</span>`, ok: false }], hint: '先算餅乾一共多少錢，再從 500 元扣掉；先乘除後加減，不用加括號！', after: `${a} − ${q} × ${c} = ${a} − ${q * c} = ${a - q * c}（元）` }; },
    () => { const a = rand(120, 300), b = rand(20, 60), c = rand(30, 80); return { q: `${a} − ${b} + ${c}，要先算哪一步？`, keep: true, opts: [{ h: `<span class="small-opt">${a} − ${b}</span>`, ok: true }, { h: `<span class="small-opt">${b} + ${c}</span>`, ok: false }], hint: '只有加減，由左而右！', after: `${a} − ${b} + ${c} = ${a - b + c}` }; },
    () => { const a = rand(40, 90), b = rand(2, 9), c = rand(2, 9); return { q: `${a} + ${b} × ${c} 和 (${a} + ${b}) × ${c}，答案一樣嗎？`, keep: true, opts: [{ h: '一樣', ok: false }, { h: '不一樣', ok: true }], hint: '括號會改變計算的順序！', after: `${a + b * c} 和 ${(a + b) * c}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 8-C 四則計算挑戰 ===== */
function u8C(st) {
  const ex = kind => () => { const t = genExpr(kind); return { q: '算算看，答案是多少？', vis: `<span class="eq sm">${exprText(t)} = <span class="box">?</span></span>`, ans: evalTokens(t), hint: ruleHint(t) }; };
  quiz(st, [ex(4), ex(7), ex(1), ex(2), ex(5), ex(3), ex(6)]);
}

/* ===== 9-A 百格板塗一塗 ===== */
function u9A(st) {
  const targets = [rand(2, 9) * 10 + rand(1, 9), rand(1, 9), rand(3, 9) * 10];
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const n = targets[r], v = (n / 100).toFixed(2), on = new Set();
    api.say(`整個百格板是 1，塗出 <b class="big">${v}</b>`, `整個百格板是 1，塗出 ${v}`);
    st.innerHTML = `${dots(r, targets.length)}${grid100(0, 'g100 play')}<div class="readout" id="ro"></div>
      <div class="center"><button class="btn ghost" id="col" type="button">塗一整條（0.1）</button> <button class="btn ghost" id="clr" type="button">清掉</button> <button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const cells = $$('.g100 i', st);
    const draw = () => { cells.forEach(c => c.classList.toggle('on', on.has(+c.dataset.i))); $('#ro', st).innerHTML = `塗了 ${on.size} 格 ＝ ${Math.floor(on.size / 10)} 個 0.1 和 ${on.size % 10} 個 0.01`; };
    cells.forEach(c => c.onclick = () => { const i = +c.dataset.i; on.has(i) ? on.delete(i) : on.add(i); sfx('tap'); draw(); });
    $('#col', st).onclick = () => { for (let c = 0; c < 10; c++) { const col = [...Array(10)].map((_, k) => c * 10 + k); if (col.some(i => !on.has(i))) { col.forEach(i => on.add(i)); break; } } sfx('tap'); draw(); };
    $('#clr', st).onclick = () => { on.clear(); draw(); };
    $('#okb', st).onclick = () => {
      if (on.size === n) { api.ok(`對！${v} 是 ${n} 個 0.01`); speak(`對，${v} 是 ${Math.floor(n / 10)} 個 0.1 和 ${n % 10} 個 0.01`); r++; later(round, 2200); }
      else api.bad(`${v} 是 ${n} 個 0.01，現在塗了 ${on.size} 格！`);
    };
    draw();
  }
  round();
}

/* ===== 9-B 二位小數與比大小 ===== */
function u9B(st) {
  const rounds = [
    () => { const n = rand(11, 99); return { q: `${(n / 100).toFixed(2)} 是幾個 0.01？`, vis: grid100(n), ans: n, unit: '個', hint: '百格板一格是 0.01！', after: `${(n / 100).toFixed(2)} = ${n} 個 0.01` }; },
    () => { const w = rand(1, 9), t = rand(1, 9), h = rand(1, 9), v = `${w}.${t}${h}`; const [k, nm] = pick([[t, '十分位'], [h, '百分位']]), vals = [k, k / 10, k / 100], val = nm === '十分位' ? k / 10 : k / 100; return { q: `${v} 的<b>${nm}</b>是 ${k}，代表多少？`, vis: `<table class="pchart"><tr><th>個位</th><th>．</th><th>十分位</th><th>百分位</th></tr><tr><td>${w}</td><td>．</td><td>${t}</td><td>${h}</td></tr></table>`, opts: vals.map(x => ({ h: N(dec2(x)), ok: x === val })), hint: '十分位是幾個 0.1，百分位是幾個 0.01！' }; },
    () => { const a = rand(2, 8) / 10, b = dec2(a - 0.1 + rand(1, 9) / 100); return Math.random() < .5 ? cmpQ(a, b, a.toFixed(1), b.toFixed(2)) : cmpQ(b, a, b.toFixed(2), a.toFixed(1)); },
    () => { const a = dec2(rand(101, 499) / 100), b = dec2(a + pick([-0.1, 0.01, 0.1, -0.01])); return cmpQ(a, b, a.toFixed(2), b.toFixed(2)); },
    () => { const w = rand(1, 9), h = rand(1, 9), v = `${w}.0${h}`; return { q: `${v} 怎麼讀？`, keep: true, opts: [{ h: `<span class="small-opt">${CN_D[w]}點零${CN_D[h]}</span>`, ok: true }, { h: `<span class="small-opt">${CN_D[w]}點${CN_D[h]}</span>`, ok: false }, { h: `<span class="small-opt">${CN_D[w]}點${CN_D[h]}零</span>`, ok: false }], hint: '小數點後面的數字一個一個讀！' }; },
    { q: '1 是幾個 0.01？', ans: 100, unit: '個', hint: '百格板一共有幾格？', after: '1 = 100 個 0.01' }
  ];
  quiz(st, rounds);
}

/* ===== 9-C 小數加減與數線 ===== */
function u9C(st) {
  const f = v => String(dec2(v)); // 1.50 → 1.5、2.00 → 2
  const rounds = [
    () => { const a = dec2(rand(105, 480) / 100), b = dec2(rand(12, 390) / 100); return { q: `${f(a)} + ${f(b)} = ？`, vis: `<span class="eq sm">${f(a)} + ${f(b)}</span>`, ans: dec2(a + b), hint: '小數點對齊，再從百分位加起！', after: `${f(a)} + ${f(b)} = ${f(dec2(a + b))}` }; },
    () => { const a = dec2(rand(400, 900) / 100), b = dec2(rand(105, 380) / 100); return { q: `${f(a)} − ${f(b)} = ？`, vis: `<span class="eq sm">${f(a)} − ${f(b)}</span>`, ans: dec2(a - b), hint: '小數點對齊，不夠減就向前一位借！', after: `${f(a)} − ${f(b)} = ${f(dec2(a - b))}` }; },
    () => { const a = dec2(rand(12, 35) / 10), b = dec2(rand(15, 45) / 100); return { q: `一瓶果汁 ${f(a)} 公升，喝掉 ${f(b)} 公升，還剩幾公升？`, vis: '<span style="font-size:56px">🧃</span>', ans: dec2(a - b), unit: '公升', hint: `${f(a)} 可以想成 ${a.toFixed(2)}！`, after: `${a.toFixed(2)} − ${f(b)} = ${f(dec2(a - b))}（公升）` }; },
    () => { const k = rand(1, 9), lo = rand(0, 2); return { q: '箭頭指的地方是多少？', vis: `<div class="nlwrap">${numberLineSVG(lo, lo + 1, 10, [{ v: lo + k / 10, t: '?' }])}</div>`, opts: shuffle([lo + k / 10, lo + k / 100, lo + 1 + k / 10]).map(v => ({ h: N(f(dec2(v))), ok: Math.abs(v - (lo + k / 10)) < 1e-9 })), hint: '1 平分成 10 格，每格是 0.1！' }; },
    () => { const k = rand(1, 9), b = rand(1, 8) / 10; return { q: '箭頭指的地方是多少？', vis: `<div class="nlwrap">${numberLineSVG(0, 1, 10, [{ v: k / 10, t: '?' }], { label: v => (b + v / 10).toFixed(1) })}</div>`, opts: shuffle([b + k / 100, b + k / 10, b + 0.1 + k / 100]).map(v => ({ h: N(dec2(v).toFixed(2)), ok: Math.abs(v - (b + k / 100)) < 1e-9 })), hint: '0.1 再平分成 10 格，每格是 0.01！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 10-A 跑道跑一跑：把跑者拖到指定的距離 ===== */
function u10A(st) {
  const targets = shuffle([1000 + rand(1, 19) * 50, rand(4, 19) * 50, 1000 + rand(1, 9) * 100, 2000 - rand(1, 9) * 50]);
  const kmText = m => m >= 1000 ? `${Math.floor(m / 1000)} 公里${m % 1000 ? ` ${m % 1000} 公尺` : ''}` : `${m} 公尺`;
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const t = targets[r]; let m = 0;
    api.say(`把跑者拖到 <b class="big">${kmText(t)}</b> 的地方！`, `把跑者拖到 ${kmText(t)} 的地方`);
    let ticks = '';
    for (let k = 0; k <= 40; k++) { const x = 20 + k * 13, big = k % 20 === 0, mid = k % 2 === 0; ticks += `<line x1="${x}" y1="${big ? 30 : mid ? 40 : 46}" x2="${x}" y2="60" stroke="#4a3b5c" stroke-width="${big ? 3 : mid ? 1.8 : 1}"/>`; if (k % 10 === 0) ticks += `<text x="${x}" y="80" font-size="${big ? 15 : 12}" font-weight="900" text-anchor="middle" fill="${big ? '#4a3b5c' : '#8a7a99'}" font-family="Arial,Microsoft JhengHei">${big ? (k / 20) + '公里' : k === 10 ? '500公尺' : '1公里500公尺'}</text>`; }
    st.innerHTML = `${dots(r, targets.length)}<div class="trackw" id="tw"><svg viewBox="0 0 560 90" class="trk"><rect x="20" y="52" width="520" height="8" rx="4" fill="#ffd2a8"/>${ticks}<text id="runner" x="20" y="34" font-size="34" text-anchor="middle">🏃</text></svg></div>
      <div class="center small-note">一小格是 50 公尺，一大格是 100 公尺</div>
      <div class="center"><button type="button" class="btn ghost" id="m1">◀ 50 公尺</button> <button type="button" class="btn ghost" id="p1">50 公尺 ▶</button></div>
      <div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const tw = $('#tw', st), svg = $('svg', tw), run = $('#runner', st);
    const draw = () => run.setAttribute('x', 20 + m / 50 * 13);
    const setFrom = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); m = Math.max(0, Math.min(2000, Math.round((p.x - 20) / 13) * 50)); draw(); };
    let drag = false; tw.style.touchAction = 'none';
    tw.addEventListener('pointerdown', e => { drag = true; try { tw.setPointerCapture(e.pointerId); } catch (er) {} setFrom(e); e.preventDefault(); });
    tw.addEventListener('pointermove', e => { if (drag) setFrom(e); });
    tw.addEventListener('pointerup', () => { drag = false; }); tw.addEventListener('pointercancel', () => { drag = false; });
    $('#m1', st).onclick = () => { m = Math.max(0, m - 50); sfx('tap'); draw(); };
    $('#p1', st).onclick = () => { m = Math.min(2000, m + 50); sfx('tap'); draw(); };
    $('#okb', st).onclick = () => {
      if (m === t) { api.ok(`對！${kmText(t)} = ${t} 公尺`); speak(`對，${kmText(t)}就是 ${t} 公尺`); r++; later(round, 2000); }
      else api.bad(`現在在 ${kmText(m)}，${m > t ? '跑過頭了' : '還沒到'}！`);
    };
    draw();
  }
  round();
}

/* ===== 10-B 公里、公尺、公分換算 ===== */
function u10B(st) {
  const rounds = [
    { q: '1 公里是幾公尺？', vis: '<span style="font-size:56px">🛣️</span>', ans: 1000, unit: '公尺', hint: '1 公里 = 1000 公尺', after: '1 公里 = 1000 公尺' },
    () => { const k = rand(2, 9), m = pick([rand(1, 9) * 100, rand(11, 99), rand(1, 9)]); return { q: `${k} 公里 ${m} 公尺是幾公尺？`, ans: k * 1000 + m, unit: '公尺', hint: `${k} 公里是 ${k * 1000} 公尺，再加 ${m} 公尺；注意 0 要補！`, after: `${k * 1000} + ${m} = ${k * 1000 + m}（公尺）` }; },
    () => { const k = rand(1, 9), m = rand(1, 999), v = k * 1000 + m; return { q: `${v} 公尺是幾公里幾公尺？`, opts: [{ h: `<span class="small-opt">${k} 公里 ${m} 公尺</span>`, ok: true }, { h: `<span class="small-opt">${Math.floor(v / 100)} 公里 ${v % 100} 公尺</span>`, ok: false }, { h: `<span class="small-opt">${k} 公里 ${m < 100 ? m * 10 : m % 100} 公尺</span>`, ok: false }], hint: '1000 公尺換 1 公里，看千位！' }; },
    { q: '1 公里是幾公分？', ans: 100000, unit: '公分', hint: '1 公里 = 1000 公尺，1 公尺 = 100 公分', after: '1000 × 100 = 100000（公分）' },
    () => { const [thing, num, u] = pick([['高雄到臺北的距離', '約 350', '公里'], ['教室的長', '約 9', '公尺'], ['數學課本的長', '約 26', '公分'], ['繞學校操場一圈', '約 200', '公尺'], ['鳳山到高雄火車站開車', '約 10', '公里']]); return { q: `${thing}，${num}（　），要填哪一個單位？`, keep: true, opts: ['公里', '公尺', '公分'].map(x => ({ h: x, ok: x === u })), hint: '想想看實際有多長！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 10-C 長度計算挑戰 ===== */
function u10C(st) {
  const kmT = v => `${Math.floor(v / 1000)} 公里${v % 1000 ? ` ${v % 1000} 公尺` : ''}`;
  const rounds = [
    () => { const a = rand(1, 3) * 1000 + rand(3, 9) * 100, b = rand(1, 2) * 1000 + rand(4, 9) * 100; return { q: `${kmT(a)} + ${kmT(b)} 是幾公尺？`, ans: a + b, unit: '公尺', hint: '公里加公里、公尺加公尺，滿 1000 公尺換 1 公里！', after: `= ${kmT(a + b)} = ${a + b} 公尺` }; },
    () => { const a = rand(4, 8) * 1000 + rand(1, 4) * 100, b = rand(1, 3) * 1000 + rand(5, 9) * 100; return { q: `${kmT(a)} − ${kmT(b)} 是幾公尺？`, ans: a - b, unit: '公尺', hint: '公尺不夠減，向公里借 1 公里 = 1000 公尺！', after: `= ${kmT(a - b)} = ${a - b} 公尺` }; },
    () => { const l = pick([200, 250, 400]), n = rand(3, 9); return { q: `操場一圈 ${l} 公尺，跑 ${n} 圈是幾公尺？`, vis: '<span style="font-size:56px">🏟️</span>', ans: l * n, unit: '公尺', hint: `${l} × ${n}`, after: `${l * n} 公尺 = ${l * n >= 1000 ? kmT(l * n) : l * n + ' 公尺'}` }; },
    () => { const a = rand(2, 4) * 1000 + rand(1, 9) * 100, b = rand(1, 9) * 100 + 50; return { q: `從家到學校 ${b} 公尺，從學校到圖書館 ${kmT(a)}，從家經過學校到圖書館一共是幾公尺？`, vis: '<span style="font-size:48px">🏠➡️🏫➡️📚</span>', ans: a + b, unit: '公尺', hint: '先把公里換成公尺再加！', after: `${a} + ${b} = ${a + b}（公尺）` }; },
    () => {
      const a = rand(2, 5) * 1000 + rand(1, 9) * 100 + pick([0, 50]), b = a + pick([-900, -90, 0, 90, 900]), s = b > a ? '＜' : b < a ? '＞' : '＝';
      return { q: `比一比：${kmT(a)} ○ ${b} 公尺`, vis: `<span class="eq sm">${kmT(a)} <span class="box">?</span> ${b} 公尺</span>`, keep: true, opts: ['＞', '＝', '＜'].map(x => ({ h: x, ok: x === s })), hint: '都換成公尺再比！', after: `${a} 公尺 ${s} ${b} 公尺` };
    }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C], u9: [u9A, u9B, u9C], u10: [u10A, u10B, u10C] });
