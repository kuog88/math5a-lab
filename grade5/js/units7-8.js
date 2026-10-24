'use strict';
/* 第 7 單元 整數四則計算 ／ 第 8 單元 平行四邊形、三角形和梯形的面積 */

/* ===== 算式工具：tokens = 數字、'+−×÷'、'('、')' ===== */
const isOp = t => typeof t === 'string' && '+−×÷'.includes(t);
const hiOp = t => t === '×' || t === '÷';
const calc = (a, o, b) => o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : a / b;
/* 現在可以先算的運算符號位置 */
function allowedOps(tk) {
  let lo = 0, hi = tk.length - 1;
  const p = tk.indexOf('(');
  if (p >= 0) { lo = p + 1; hi = tk.indexOf(')', p) - 1; }
  const ops = []; for (let i = lo; i <= hi; i++) if (isOp(tk[i])) ops.push(i);
  if (ops.some(i => hiOp(tk[i]))) return ops.filter((i, k) => hiOp(tk[i]) && !(k > 0 && hiOp(tk[ops[k - 1]]) && ops[k - 1] === i - 2));
  return ops.slice(0, 1);
}
function stepAt(tk, i) {
  const v = calc(tk[i - 1], tk[i], tk[i + 1]);
  let t = [...tk.slice(0, i - 1), v, ...tk.slice(i + 2)];
  const j = t.indexOf('(');
  if (j >= 0 && t[j + 2] === ')') t = [...t.slice(0, j), t[j + 1], ...t.slice(j + 3)];
  return { t, at: j >= 0 && t[j] === v ? j : i - 1 };
}
function evalTk(tk) { while (tk.length > 1) tk = stepAt(tk, allowedOps(tk)[0]).t; return tk[0]; }
const tkStr = tk => tk.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
const EXPRS = [
  () => { const a = rand(10, 50), b = rand(2, 9), c = rand(2, 9); return [a, '+', b, '×', c]; },
  () => { const c = rand(2, 9), q = rand(2, 9); return [q + rand(5, 50), '−', c * q, '÷', c]; },
  () => { const a = rand(10, 40), b = rand(5, 30), c = rand(2, 6); return ['(', a, '+', b, ')', '×', c]; },
  () => { const b = rand(5, 12), c = rand(1, b - 2), d = rand(2, 5); return [(b - c) * d + rand(10, 60), '−', '(', b, '−', c, ')', '×', d]; },
  () => { const c = rand(3, 8), q = rand(3, 9), b = rand(10, 40); return ['(', b + c * q, '−', b, ')', '÷', c, '+', rand(5, 30)]; },
  () => { const b = rand(2, 5), c = rand(2, 5), q = rand(2, 9); return [b * c * q, '÷', b, '÷', c]; },
  () => { const c = rand(3, 9), k = rand(2, 9), b = rand(2, 9); return [c * k, '×', b, '÷', c]; },
  () => { const e = rand(2, 9), q = rand(2, 9), a = rand(10, 40), b = rand(2, 9), c = rand(2, 9); return [a, '+', b, '×', c, '−', e * q, '÷', e]; }
];

/* ===== 7-A 算式拆彈：點出現在該先算的符號 ===== */
function u7A(st) {
  const ex = [pick([EXPRS[0], EXPRS[1]])(), pick([EXPRS[2], EXPRS[3], EXPRS[4]])(), pick([EXPRS[5], EXPRS[6]])(), EXPRS[7]()];
  let r = 0;
  function round() {
    if (r >= ex.length) return api.finish();
    let tk = ex[r].slice(), nw = -1;
    const log = [tkStr(tk)];
    api.say('點一下<b>現在應該先算</b>的運算符號！記得：先算括號，再算乘除，最後算加減；同一級的由左往右。');
    const draw = () => {
      st.innerHTML = `${dots(r, ex.length)}<div class="expr">${tk.map((t, i) => isOp(t) ? `<button type="button" class="op" data-i="${i}">${t}</button>` : `<span class="tk${i === nw ? ' nw' : ''}">${t}</span>`).join('')}</div><div class="steps">${log.map((s, i) => (i ? '= ' : '') + s).join('<br>')}</div>`;
      $$('.op', st).forEach(b => b.onclick = () => {
        const i = +b.dataset.i, ok = allowedOps(tk);
        if (!ok.includes(i)) {
          b.classList.add('wrong');
          const p = tk.indexOf('(');
          const inP = p >= 0 && i > p && i < tk.indexOf(')');
          return api.bad(p >= 0 && !inP ? '有括號，要先算括號裡面的！' : !hiOp(tk[i]) && ok.some(k => hiOp(tk[k])) ? '先乘除，後加減！' : '同一級的運算，要由左往右算！');
        }
        sfx('pop'); const s = stepAt(tk, i); tk = s.t; nw = s.at; log.push(tkStr(tk)); draw();
        if (tk.length === 1) { $$('.op', st).forEach(x => x.disabled = true); api.ok(`答案是 ${tk[0]}！`); speak(`答案是 ${tk[0]}`); r++; later(round, 2400); }
      });
    };
    draw();
  }
  round();
}

/* ===== 7-B 計算規則想一想 ===== */
function u7B(st) {
  quiz(st, [
    () => { const c = rand(2, 6), q = rand(3, 9), a = rand(30, 60); return { q: `${a} − ${c * q} ÷ ${c}，要先算哪一步？`, opts: [{ h: `${c * q} ÷ ${c}`, ok: true }, { h: `${a} − ${c * q}`, ok: false, hint: '先乘除，後加減！' }], keep: true }; },
    () => { const b = rand(2, 6), c = rand(2, 6), a = b * c * rand(2, 5); return { q: `${a} ÷ ${b} ÷ ${c} 和哪一個算式的答案一樣？`, opts: [{ h: `${a} ÷ (${b} × ${c})`, ok: true }, { h: `${a} ÷ ${b} × ${c}`, ok: false, hint: '連除兩次，等於除以兩個數的積，不是乘！' }, { h: `${a} ÷ (${b} + ${c})`, ok: false, hint: '連除是除以兩個數的「積」，不是「和」。' }], hint: '連續除以兩個數，等於除以這兩個數的積。' }; },
    () => { const a = rand(12, 40), b = rand(12, 40), c = rand(3, 9); return { q: `(${a} + ${b}) × ${c} 和哪一個算式的答案一樣？`, opts: [{ h: `${a} × ${c} + ${b} × ${c}`, ok: true }, { h: `${a} + ${b} × ${c}`, ok: false, hint: `${a} 也要乘 ${c} 喔！` }, { h: `${a} × ${b} + ${c}`, ok: false, hint: '這樣意思完全不一樣了。' }], hint: '分配律：括號裡的每一個數都要乘。' }; },
    () => { const m = pick([25, 36, 48, 12]); return { q: `99 × ${m} 怎麼算比較快？`, opts: [{ h: `100 × ${m} − ${m}`, ok: true }, { h: `100 × ${m} − 1`, ok: false, hint: `99 個 ${m} = 100 個 ${m} 少 1 個 ${m}，要減 ${m}！` }, { h: `99 × 100 − ${m}`, ok: false, hint: '這樣意思不一樣了。' }], hint: '99 = 100 − 1，用分配律。' }; },
    () => { let s; do { s = Array.from({ length: 4 }, () => rand(16, 19) * 5); } while (s.reduce((x, y) => x + y) % 4); const avg = s.reduce((x, y) => x + y) / 4; return { q: `小美 4 次數學測驗是 ${s.join('、')} 分，平均幾分？`, opts: numOpts(avg, [avg + 5, avg - 5, Math.max(...s)], '分'), hint: '平均 = 總和 ÷ 次數。', after: `(${s.join(' + ')}) ÷ 4 = ${avg}（分）` }; },
    () => { const k = pick([[36, 4, 9], [28, 4, 7], [32, 4, 8]]); return { q: `25 × ${k[0]} 可以怎麼算比較快？`, opts: [{ h: `25 × ${k[1]} × ${k[2]}`, ok: true }, { h: `25 × 3 × 6`, ok: false, hint: `3 × 6 = 18，不是 ${k[0]}！` }, { h: `25 × 30 × 6`, ok: false, hint: `30 × 6 = 180，不是 ${k[0]}！` }], hint: '25 × 4 = 100，拆出 4 來！' }; }
  ]);
}

/* ===== 7-C 四則應用挑戰 ===== */
function u7C(st) {
  quiz(st, [
    () => { const b = rand(3, 6), c = rand(2, 5), q = rand(3, 9); return { q: `有 ${b * c * q} 顆糖，平分裝成 ${b} 盒，每盒再平分給 ${c} 個人，每人分到幾顆？`, vis: '<span style="font-size:56px">🍬📦</span>', ans: q, unit: '顆', hint: `${b * c * q} ÷ ${b} ÷ ${c}`, after: `${b * c * q} ÷ ${b} ÷ ${c} = ${q}（顆）` }; },
    () => { const n = rand(2, 4), p = rand(12, 18), k = rand(20, 35), pay = n * p + k > 90 ? 200 : 100; return { q: `買 ${n} 枝筆，每枝 ${p} 元，再買 1 本簿子 ${k} 元，付 ${pay} 元，要找回幾元？`, vis: '<span style="font-size:56px">✏️📒</span>', ans: pay - (n * p + k), unit: '元', hint: '先算一共要花多少錢，再用 ${pay} 減。', after: `${pay} − (${n} × ${p} + ${k}) = ${pay - (n * p + k)}（元）` }; },
    () => { const avg = rand(30, 45), a = avg + rand(1, 8), b = avg - rand(1, 8), c = 3 * avg - a - b; return { q: `小明 3 次跳繩的平均是 ${avg} 下。前 2 次是 ${a} 下和 ${b} 下，第 3 次跳了幾下？`, vis: '<span style="font-size:56px">🪢</span>', ans: c, unit: '下', hint: '先算 3 次一共幾下：平均 × 3。', after: `${avg} × 3 − ${a} − ${b} = ${c}（下）` }; },
    () => { const a = rand(12, 48), b = rand(11, 89); return { q: `用簡單的方法算：${a} × ${b} + ${a} × ${100 - b} = ？`, ans: a * 100, hint: `${a} × (${b} + ${100 - b})`, after: `${a} × (${b} + ${100 - b}) = ${a} × 100 = ${a * 100}` }; },
    () => { const k = pick([98, 99, 101, 102]), m = rand(12, 35); return { q: `用簡單的方法算：${k} × ${m} = ？`, ans: k * m, hint: `${k} = 100 ${k < 100 ? '−' : '+'} ${Math.abs(100 - k)}，用分配律。`, after: `100 × ${m} ${k < 100 ? '−' : '+'} ${Math.abs(100 - k)} × ${m} = ${k * m}` }; },
    () => { const [a, b] = pick([[25, 4], [125, 8], [50, 2]]), c = rand(3, 9); return { q: `用簡單的方法算：${a} × ${c} × ${b} = ？`, ans: a * b * c, hint: `先算 ${a} × ${b}！`, after: `${a} × ${b} × ${c} = ${a * b} × ${c} = ${a * b * c}` }; }
  ]);
}

/* ===== 面積圖形（1 格 = 1 公分） ===== */
const CM = 34;
function areaShape(type) {
  let pts, cand, txt = [], ans, h = rand(3, 5);
  if (type === 'p') {
    const b = rand(5, 8), s = rand(1, 3);
    pts = [[s, 0], [s + b, 0], [b, h], [0, h]];
    cand = [[[s, 0], [s, h]], [[s, 0], [0, h]], [[s, 0], [b, h]]];
    txt.push([b / 2, h + 0.7, `底 ${b} 公分`]); ans = b * h;
    return { pts, cand, txt, ans, W: s + b, h, name: '平行四邊形', f: `${b} × ${h} = ${ans}` };
  }
  if (type === 't') {
    let b, p; do { b = rand(5, 9); p = rand(1, b - 1); } while ((b * h) % 2 || p * 2 === b);
    pts = [[p, 0], [b, h], [0, h]];
    cand = [[[p, 0], [p, h]], [[p, 0], [0, h]], [[p, 0], [b / 2, h]]];
    txt.push([b / 2, h + 0.7, `底 ${b} 公分`]); ans = b * h / 2;
    return { pts, cand, txt, ans, W: b, h, name: '三角形', f: `${b} × ${h} ÷ 2 = ${ans}` };
  }
  let T, B, s; do { T = rand(2, 5); B = rand(T + 2, 9); s = rand(1, B - T - 1 || 1); } while (((T + B) * h) % 2 || s + T >= B);
  pts = [[s, 0], [s + T, 0], [B, h], [0, h]];
  cand = [[[s, 0], [s, h]], [[s, 0], [0, h]], [[s, 0], [B, h]]];
  txt.push([s + T / 2, -0.35, `上底 ${T} 公分`], [B / 2, h + 0.7, `下底 ${B} 公分`]); ans = (T + B) * h / 2;
  return { pts, cand, txt, ans, W: B, h, name: '梯形', f: `(${T} + ${B}) × ${h} ÷ 2 = ${ans}` };
}
function areaSVG(S, chosen) {
  const ox = 20, oy = 40, W = (S.W + 1) * CM + 40, H = (S.h + 1) * CM + 60, X = x => ox + x * CM, Y = y => oy + y * CM;
  let g = `<svg class="pic" viewBox="0 0 ${W} ${H}" width="${W}">`;
  for (let x = 0; x <= S.W + 1; x++) g += `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(S.h)}" stroke="#eee6f4"/>`;
  for (let y = 0; y <= S.h; y++) g += `<line x1="${X(0)}" y1="${Y(y)}" x2="${X(S.W + 1)}" y2="${Y(y)}" stroke="#eee6f4"/>`;
  g += `<polygon points="${S.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>`;
  const col = ['#ff6b6b', '#ff9a4d', '#a98bff'];
  S.order.forEach((ci, k) => {
    if (chosen && ci !== 0) return;
    const [[x1, y1], [x2, y2]] = S.cand[ci];
    g += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${chosen ? '#1fa979' : col[k]}" stroke-width="4" stroke-dasharray="8 5"/>`;
    if (!chosen) g += `<circle cx="${X((x1 + x2) / 2)}" cy="${Y((y1 + y2) / 2)}" r="13" fill="${col[k]}"/><text x="${X((x1 + x2) / 2)}" y="${Y((y1 + y2) / 2) + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="#fff">${'①②③'[k]}</text>`;
    else g += `<text x="${X(x1) + 8}" y="${Y(S.h / 2) + 6}" font-size="16" font-weight="900" fill="#1fa979">高 ${S.h} 公分</text>`;
  });
  S.txt.forEach(([x, y, t]) => { g += `<text x="${X(x)}" y="${Y(y)}" text-anchor="middle" font-size="16" font-weight="900" fill="#e5508f">${t}</text>`; });
  return g + '</svg>';
}

/* ===== 8-A 找高算面積 ===== */
function u8A(st) {
  const types = ['p', 't', 'k'];
  let r = 0;
  function round() {
    if (r >= types.length) return api.finish();
    const S = areaShape(types[r]); S.order = shuffle([0, 1, 2]);
    api.say(`這是一個${S.name}（一格是 1 公分）。哪一條虛線是對應這個底的<b>高</b>？`);
    st.innerHTML = `${dots(r, types.length)}<div class="qvis">${areaSVG(S)}</div><div class="opts"></div><div class="kwrap"></div>`;
    S.order.forEach((ci, k) => $('.opts', st).appendChild(optBtn({ h: '①②③'[k], ok: ci === 0, hint: ci === 1 ? '這是斜斜的邊，不是高。高要和底垂直！' : '這條線和底沒有垂直喔！' }, () => {
      $('.qvis', st).innerHTML = areaSVG(S, true);
      api.say(`對！高是 ${S.h} 公分，和底互相垂直。這個${S.name}的面積是多少平方公分？`);
      keypad($('.kwrap', st), S.ans, () => { toast(`${S.f}（平方公分）`); speak(spText(`${S.f}平方公分`)); r++; later(round, 2600); }, S.name === '平行四邊形' ? '面積 = 底 × 高' : S.name === '三角形' ? '面積 = 底 × 高 ÷ 2' : '面積 = (上底 + 下底) × 高 ÷ 2', '平方公分');
    })));
  }
  round();
}

/* ===== 8-B 面積公式想一想 ===== */
function u8B(st) {
  const sameBase = `<svg class="pic" viewBox="0 0 340 150" width="320"><line x1="10" y1="20" x2="330" y2="20" stroke="#8a7a99" stroke-width="2" stroke-dasharray="6 4"/><line x1="10" y1="130" x2="330" y2="130" stroke="#8a7a99" stroke-width="2"/>
    <polygon points="30,130 110,130 40,20" fill="#ffd9e8" stroke="#4a3b5c" stroke-width="3"/><polygon points="130,130 210,130 170,20" fill="#d6ecff" stroke="#4a3b5c" stroke-width="3"/><polygon points="230,130 310,130 330,20" fill="#d9f7ea" stroke="#4a3b5c" stroke-width="3"/>
    <text x="70" y="148" text-anchor="middle" font-size="14" font-weight="900">甲</text><text x="170" y="148" text-anchor="middle" font-size="14" font-weight="900">乙</text><text x="270" y="148" text-anchor="middle" font-size="14" font-weight="900">丙</text></svg>`;
  quiz(st, [
    { q: '平行四邊形的面積怎麼算？', opts: [{ h: '底 × 高', ok: true }, { h: '底 × 斜邊', ok: false, hint: '斜邊不是高！把平行四邊形剪拼成長方形，長方形的寬是「高」。' }, { h: '底 × 高 ÷ 2', ok: false, hint: '除以 2 是三角形喔！' }] },
    { q: '三角形的面積怎麼算？', opts: [{ h: '底 × 高 ÷ 2', ok: true }, { h: '底 × 高', ok: false, hint: '兩個一樣的三角形才拼成一個平行四邊形，要除以 2！' }, { h: '(底 + 高) × 2', ok: false, hint: '這是在算周長的方法，不是面積。' }] },
    { q: '梯形的面積怎麼算？', opts: [{ h: '(上底 + 下底) × 高 ÷ 2', ok: true }, { h: '上底 × 下底 × 高', ok: false, hint: '兩個一樣的梯形可以拼成平行四邊形，底是「上底 + 下底」。' }, { h: '(上底 + 下底) × 高', ok: false, hint: '這是兩個梯形拼起來的面積，要除以 2！' }] },
    { q: '甲、乙、丙三個三角形的底一樣長，夾在兩條平行線中間，哪一個面積最大？', vis: sameBase, opts: [{ h: '一樣大', ok: true }, { h: '甲', ok: false, hint: '底一樣、高也一樣（兩條平行線的距離），面積就一樣！' }, { h: '丙', ok: false, hint: '形狀不一樣，但底和高都一樣喔！' }], keep: true },
    { q: '兩個一模一樣的梯形，可以拼成什麼圖形？', opts: [{ h: '平行四邊形', ok: true }, { h: '三角形', ok: false, hint: '把其中一個倒過來接在旁邊試試看。' }, { h: '圓形', ok: false, hint: '梯形的邊都是直的，拼不出圓。' }], keep: true },
    { q: '三角形的底不變，高變成原來的 2 倍，面積會變成原來的幾倍？', opts: [{ h: '2 倍', ok: true }, { h: '4 倍', ok: false, hint: '只有高變 2 倍，底沒有變。' }, { h: '不變', ok: false, hint: '面積 = 底 × 高 ÷ 2，高變大面積也會變大。' }], keep: true }
  ]);
}

/* ===== 8-C 面積挑戰 ===== */
function u8C(st) {
  quiz(st, [
    () => { const b = rand(8, 15), h = rand(4, 12); return { q: `平行四邊形的底是 ${b} 公分、高是 ${h} 公分，面積是多少平方公分？`, ans: b * h, unit: '平方公分', hint: '底 × 高', after: `${b} × ${h} = ${b * h}` }; },
    () => { let b, h; do { b = rand(6, 16); h = rand(4, 12); } while (b * h % 2); return { q: `三角形的底是 ${b} 公分、高是 ${h} 公分，面積是多少平方公分？`, ans: b * h / 2, unit: '平方公分', hint: '底 × 高 ÷ 2', after: `${b} × ${h} ÷ 2 = ${b * h / 2}` }; },
    () => { let t, b, h; do { t = rand(3, 9); b = rand(t + 2, 15); h = rand(4, 10); } while ((t + b) * h % 2); return { q: `梯形的上底 ${t} 公分、下底 ${b} 公分、高 ${h} 公分，面積是多少平方公分？`, ans: (t + b) * h / 2, unit: '平方公分', hint: '(上底 + 下底) × 高 ÷ 2', after: `(${t} + ${b}) × ${h} ÷ 2 = ${(t + b) * h / 2}` }; },
    () => { const b = rand(4, 12), h = rand(3, 10); return { q: `三角形的面積是 ${b * h / 2} 平方公分，底是 ${b} 公分，高是幾公分？`, ans: h, unit: '公分', hint: '底 × 高 ÷ 2 = 面積，所以高 = 面積 × 2 ÷ 底。', after: `${b * h / 2} × 2 ÷ ${b} = ${h}` }; },
    () => { let t, b, h; do { t = rand(3, 8); b = rand(t + 1, 14); h = rand(4, 8); } while ((t + b) * h % 2); const A = (t + b) * h / 2; return { q: `梯形的面積是 ${A} 平方公分，上底 ${t} 公分、高 ${h} 公分，下底是幾公分？`, ans: b, unit: '公分', hint: '先算上底 + 下底 = 面積 × 2 ÷ 高。', after: `${A} × 2 ÷ ${h} − ${t} = ${b}` }; },
    () => { const w = rand(3, 6) * 2, h1 = rand(4, 8), h2 = rand(2, 5); return { q: `小房子的圖形：下面是長 ${w} 公分、寬 ${h1} 公分的長方形，上面是底 ${w} 公分、高 ${h2} 公分的三角形屋頂。整個面積是多少平方公分？`, vis: `<svg class="pic" viewBox="0 0 200 180" width="180"><polygon points="30,80 170,80 170,170 30,170" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/><polygon points="30,80 170,80 100,20" fill="#ffd9e8" stroke="#4a3b5c" stroke-width="4"/></svg>`, ans: w * h1 + w * h2 / 2, unit: '平方公分', hint: '長方形面積 + 三角形面積', after: `${w} × ${h1} + ${w} × ${h2} ÷ 2 = ${w * h1 + w * h2 / 2}` }; }
  ]);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C] });
