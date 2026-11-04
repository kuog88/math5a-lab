'use strict';
/* 🎮 闖關任務「誰才是老大？基準量偵探社」（2026-11 原創）
   六下（南一第 3 單元、康軒第 4 單元）和六上（翰林第 5 單元）共用這一份；六上用 ../grade6-2/js/ratio-detective.js 載入。
   需要主程式的：api（say/ok/bad/finish）、curQ（家長報表）、eqBuild（列式小幫手）、later、speak、sfx。
   四章：①指認老大（誰是基準量）②線段圖對質（選對的線段圖）③列式破案（列式小幫手）④大魔王案件。
   RatioDetective(st) 開始遊戲；RatioDetective.gen 給 node 測試用（出題器）。 */
(function () {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pk = a => a[Math.floor(Math.random() * a.length)];
  const mix = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  /* ---------- 比值：{n, d, kind, tok(列式用), html, txt(報表用), sp(朗讀用), bei(要不要加「倍」)} ---------- */
  const FRH = (n, d) => `<span class="rd-fr"><span>${n}</span><span>${d}</span></span>`;
  const decStr = (n, d) => String(+(n / d).toFixed(4));
  function ratio(kind, n, d) {
    const g = gcd(n, d); n /= g; d /= g;
    if (kind === 'int' || d === 1) return { n, d: 1, kind: 'int', tok: String(n), html: `<b>${n}</b>`, txt: String(n), sp: String(n), bei: true };
    if (kind === 'dec') { const s = decStr(n, d); return { n, d, kind, tok: s, html: `<b>${s}</b>`, txt: s, sp: s, bei: true }; }
    if (kind === 'pct') { const p = n * 100 / d; return { n, d, kind, tok: p + '%', html: `<b>${p}%</b>`, txt: p + '%', sp: `百分之${p}`, bei: false }; }
    return { n, d, kind: 'frac', tok: `${n}/${d}`, html: FRH(n, d), txt: `${n}/${d}`, sp: `${d}分之${n}`, bei: false };
  }
  /* 1 ＋ r、1 − r、r − 1 合成一個數（同一種寫法） */
  const comb = (r, n2) => ratio(r.kind, n2, r.d);
  const FRAC = []; for (let d = 2; d <= 8; d++) for (let n = 1; n < 2 * d; n++) if (n !== d && gcd(n, d) === 1) FRAC.push([n, d]);
  const DEC = [[1, 5], [1, 4], [2, 5], [1, 2], [3, 5], [3, 4], [4, 5], [6, 5], [5, 4], [3, 2], [8, 5], [7, 4], [5, 2]];
  const PCT = [[1, 5], [1, 4], [2, 5], [3, 5], [3, 4], [4, 5], [6, 5], [3, 2]];
  const INT = [2, 3, 4, 5];
  /* opt: kinds、lt1（小於 1）、maxSum（n＋d 上限，線段圖格數）、maxD */
  function pickRatio(o = {}) {
    for (let t = 0; t < 500; t++) {
      const kind = pk(o.kinds || ['frac', 'frac', 'dec', 'int', 'pct']);
      let n, d;
      if (kind === 'int') { if (o.lt1) continue; n = pk(INT); d = 1; }
      else[n, d] = pk(kind === 'frac' ? FRAC : kind === 'dec' ? DEC : PCT);
      if (o.lt1 && n >= d) continue;
      if (o.gt1 && n <= d) continue;
      if (o.maxSum && n + d > o.maxSum) continue;
      if (o.maxD && d > o.maxD) continue;
      return ratio(kind, n, d);
    }
    return ratio('frac', 3, 4);
  }

  /* ---------- 案件情境：A、B 兩個嫌疑人（C 給連環案用）、w 比的東西、u 單位、m 數字放大倍數 ---------- */
  const CTX = [
    { A: '哥哥', B: '弟弟', C: '姊姊', w: '的零用錢', u: '元', m: 10, e: ['👦', '🧒', '👧'] },
    { A: '紅繩', B: '藍繩', C: '綠繩', w: '的長度', u: '公分', m: 1, e: ['🟥', '🟦', '🟩'] },
    { A: '蘋果', B: '橘子', C: '香蕉', w: '的重量', u: '公克', m: 10, e: ['🍎', '🍊', '🍌'] },
    { A: '甲班', B: '乙班', C: '丙班', w: '回收的寶特瓶', u: '個', m: 1, e: ['🅰️', '🅱️', '🆎'] },
    { A: '偵探小安', B: '助手阿德', C: '小狗旺旺', w: '找到的線索', u: '條', m: 1, e: ['🕵️', '🧑‍🔧', '🐶'] },
    { A: '紅隊', B: '藍隊', C: '綠隊', w: '的得分', u: '分', m: 1, e: ['🔴', '🔵', '🟢'] },
    { A: '姊姊', B: '妹妹', C: '媽媽', w: '的存款', u: '元', m: 10, e: ['👧', '👶', '👩'] },
    { A: '大水桶', B: '小水桶', C: '中水桶', w: '裡的水', u: '公升', m: 1, e: ['🪣', '🥛', '🫙'] }
  ];
  /* X＝比較量、Y＝基準量（隨機決定誰當老大） */
  function cast() {
    const c = pk(CTX), sw = Math.random() < .5;
    return { c, X: sw ? c.B : c.A, Y: sw ? c.A : c.B, eX: c.e[sw ? 1 : 0], eY: c.e[sw ? 0 : 1] };
  }
  /* 句子（html／txt／sp）：form = is（X 是 Y 的 r）、rev（Y 的 r 剛好等於 X，順序顛倒）、more、less */
  function sentence(form, P, r) {
    const { X, Y, c } = P, w = c.w, bei = r.bei ? ' 倍' : '', beiS = r.bei ? '倍' : '';
    const S = {
      is: [`${X}${w}是${Y}的 ${r.html}${bei}`, `${X}${w}是${Y}的 ${r.txt}${bei}`, `${X}${w}是${Y}的${r.sp}${beiS}`],
      rev: [`${Y}${w}的 ${r.html}${bei}，剛好等於${X}${w}`, `${Y}${w}的 ${r.txt}${bei}，剛好等於${X}${w}`, `${Y}${w}的${r.sp}${beiS}，剛好等於${X}${w}`],
      more: [`${X}${w}比${Y}多 ${r.html}`, `${X}${w}比${Y}多 ${r.txt}`, `${X}${w}比${Y}多${r.sp}`],
      less: [`${X}${w}比${Y}少 ${r.html}`, `${X}${w}比${Y}少 ${r.txt}`, `${X}${w}比${Y}少${r.sp}`]
    }[form];
    return { html: S[0], txt: S[1], sp: S[2] };
  }
  const WHY = {
    is: (X, Y) => `「${X}是${Y}的幾倍（幾分之幾）」：拿${Y}當標準、當作 1，${Y}就是基準量（老大）。`,
    rev: (X, Y) => `別被順序騙了！「${Y}的幾倍（幾分之幾）」是把${Y}當作 1，${Y}才是基準量。`,
    more: (X, Y) => `「${X}比${Y}多幾分之幾」：多出來的是${Y}的幾分之幾，${Y}當作 1，是基準量。`,
    less: (X, Y) => `「${X}比${Y}少幾分之幾」：少掉的是${Y}的幾分之幾，${Y}當作 1，是基準量。`
  };

  /* ---------- 線段圖 SVG ----------
     rows: [{name, parts, lab, base, plus(最後幾格換色), miss(後面虛線格), seg(false＝不畫格線), len(seg false 時的長度格數), split(合起來：前幾格是基準量色)}]
     brace: {row, from, to, text}（畫在某一列下面的括號） */
  function diag(rows, brace) {
    const maxP = Math.max(...rows.map(r => (r.len || r.parts) + (r.miss || 0)), 1);
    const x0 = 86, W = 236, u = W / maxP, RH = 62, top = 26;
    const H = top + rows.length * RH + (brace ? 28 : 0) - 8;
    let g = '';
    rows.forEach((r, i) => {
      const y = top + i * RH, colB = '#ffd166', colC = '#8ecbff', colP = '#ff8fab';
      g += `<text x="4" y="${y + 19}" font-size="14" font-weight="900" fill="#2b2140">${r.name}${r.base ? ' 👑' : ''}</text>`;
      const L = r.len || r.parts;
      if (r.seg === false) g += `<rect x="${x0}" y="${y}" width="${(L * u).toFixed(1)}" height="26" rx="4" fill="${r.base ? colB : colC}" stroke="#2b2140" stroke-width="2"/>`;
      else for (let j = 0; j < r.parts; j++) {
        const f = r.split !== undefined ? (j < r.split ? colB : colC) : r.base ? colB : (r.plus && j >= r.parts - r.plus) ? colP : colC;
        g += `<rect x="${(x0 + j * u).toFixed(1)}" y="${y}" width="${u.toFixed(1)}" height="26" fill="${f}" stroke="#2b2140" stroke-width="2"/>`;
      }
      for (let j = 0; j < (r.miss || 0); j++) g += `<rect x="${(x0 + (r.parts + j) * u).toFixed(1)}" y="${y + 1}" width="${u.toFixed(1)}" height="24" fill="none" stroke="#ff5d7a" stroke-width="2" stroke-dasharray="4 3"/>`;
      if (r.lab) g += `<text x="${(x0 + Math.max(L, 1) * u / 2).toFixed(1)}" y="${y - 6}" font-size="13" font-weight="900" fill="#5b3fd0" text-anchor="middle">${r.lab}</text>`;
    });
    if (brace) {
      const y = top + brace.row * RH + 32, a = x0 + brace.from * u, b = x0 + brace.to * u;
      g += `<path d="M${a.toFixed(1)},${y} v6 H${b.toFixed(1)} v-6" fill="none" stroke="#e5484d" stroke-width="2.5"/><text x="${((a + b) / 2).toFixed(1)}" y="${y + 21}" font-size="13" font-weight="900" fill="#e5484d" text-anchor="middle">${brace.text}</text>`;
    }
    return `<svg class="rd-svg" viewBox="0 0 330 ${H}" role="img">${g}</svg>`;
  }
  /* 依句型畫出「正確」的線段圖；labs 可指定兩列的標籤 */
  function diagOf(form, P, r, labs = {}) {
    const { n, d } = r, rowY = { name: P.Y, parts: d, base: true, lab: labs.Y || '1（基準量）' };
    let rowX;
    if (form === 'more') rowX = { name: P.X, parts: d + n, plus: n, lab: labs.X || `1 ＋ ${r.txt}` };
    else if (form === 'less') rowX = { name: P.X, parts: d - n, miss: n, lab: labs.X || `1 − ${r.txt}` };
    else rowX = { name: P.X, parts: n, lab: labs.X || r.txt + (r.bei ? ' 倍' : '') };
    return [rowY, rowX];
  }

  /* ---------- 第 1 章：指認老大 ---------- */
  function genSpot(form, askCmp) {
    const P = cast(), r = form === 'more' || form === 'less' ? pickRatio({ kinds: ['frac', 'frac', 'pct'], lt1: true }) : pickRatio();
    const s = sentence(form, P, r);
    return { kind: 'spot', form, P, r, s, askCmp: !!askCmp, ans: askCmp ? P.X : P.Y };
  }
  /* ---------- 第 2 章：線段圖對質（三張圖選一張） ---------- */
  function genMatch(form) {
    const P = cast();
    let r; do { r = pickRatio({ kinds: ['frac', 'frac', 'dec', 'pct'], lt1: form === 'more' || form === 'less', maxD: 6, maxSum: 11 }); } while (form === 'less' && 2 * r.n === r.d); // 少 1/2 時「1 − 1/2」和「1/2」一樣長，不能當錯的圖
    const s = sentence(form, P, r), { n, d } = r;
    const T = r.txt + (r.bei ? ' 倍' : '');
    const right = { rows: diagOf(form, P, r), t: `正確：${P.Y}當 1（${d} 格）` };
    let w1, w2;
    if (form === 'more' || form === 'less') {
      w1 = { rows: [{ name: P.X, parts: d, base: true, lab: '1（基準量）' }, form === 'more' ? { name: P.Y, parts: d + n, plus: n, lab: `1 ＋ ${r.txt}` } : { name: P.Y, parts: d - n, miss: n, lab: `1 − ${r.txt}` }], t: `把${P.X}當成 1（老大認錯了）` };
      w2 = { rows: [{ name: P.Y, parts: d, base: true, lab: '1（基準量）' }, { name: P.X, parts: n, lab: r.txt }], t: `把「比…${form === 'more' ? '多' : '少'}」看成「是…的」` };
    } else {
      w1 = { rows: [{ name: P.X, parts: d, base: true, lab: '1（基準量）' }, { name: P.Y, parts: n, lab: T }], t: `把${P.X}當成 1（老大認錯了）` };
      w2 = { rows: [{ name: P.Y, parts: d, base: true, lab: '1（基準量）' }, { name: P.X, parts: d + n, plus: n, lab: `1 ＋ ${r.txt}` }], t: `把「是…的」看成「比…多」` };
    }
    return { kind: 'match', form, P, r, s, opts: [Object.assign(right, { ok: true }), w1, w2] };
  }

  /* ---------- 第 3、4 章：列式破案（eqBuild 題目） ----------
     回傳 {kind:'eq', s(句子 html/txt/sp), ask(問句), eq, alt, nums, extra, unit, ans(驗證用), rows/brace(線段圖), hint, frac} */
  function V(x) { return String(x); }
  /* 倍數 k：讓基準量（d × k × m）至少 12，數字不會小得太簡單 */
  const kOf = (d, m, span = 8) => { const lo = Math.max(2, Math.ceil(12 / (d * m))); return rnd(lo, lo + span); };
  function genCmp() {
    const P = cast(), r = pickRatio(), m = P.c.m, k = kOf(r.d, m), form = pk(['is', 'is', 'rev']);
    const yv = r.d * k * m, xv = r.n * k * m, s = sentence(form, P, r), u = P.c.u;
    return { kind: 'eq', type: 'cmp', P, r, s, form, given: `${P.Y}${P.c.w}是 <b>${yv}</b> ${u}`, givenT: `${P.Y}${P.c.w}是 ${yv} ${u}`, ask: `${P.X}${P.c.w}是多少${u}？`,
      eq: `${yv} × ${r.tok}`, alt: [`${yv} ÷ ${r.d} × ${r.n}`], nums: [V(yv), r.tok], extra: [], unit: u, ans: xv,
      rows: diagOf(form, P, r, { Y: `1 ＝ ${yv} ${u}`, X: `${r.txt}${r.bei ? ' 倍' : ''} ＝ ？` }), hint: '比較量 ＝ 基準量 × 比值' };
  }
  function genBase() {
    const P = cast(), r = pickRatio({ kinds: ['frac', 'frac', 'dec', 'int', 'pct'] }), m = P.c.m, k = kOf(r.d, m), form = pk(['is', 'rev', 'rev']);
    const yv = r.d * k * m, xv = r.n * k * m, s = sentence(form, P, r), u = P.c.u;
    return { kind: 'eq', type: 'base', P, r, s, form, given: `${P.X}${P.c.w}是 <b>${xv}</b> ${u}`, givenT: `${P.X}${P.c.w}是 ${xv} ${u}`, ask: `${P.Y}${P.c.w}是多少${u}？`,
      eq: `${xv} ÷ ${r.tok}`, alt: [`${xv} ÷ ${r.n} × ${r.d}`], nums: [V(xv), r.tok], extra: [], unit: u, ans: yv,
      rows: diagOf(form, P, r, { Y: '1 ＝ ？', X: `${r.txt}${r.bei ? ' 倍' : ''} ＝ ${xv} ${u}` }), hint: '基準量 ＝ 比較量 ÷ 比值（老大不知道，用除的）' };
  }
  function genRatio() {
    const P = cast(), r = pickRatio({ kinds: ['frac'], maxD: 9 }), m = P.c.m, k = kOf(r.d, m, 5), u = P.c.u;
    const yv = r.d * k * m, xv = r.n * k * m, flip = Math.random() < .4;
    /* flip：問「Y 是 X 的幾倍」→ 基準量變成 X */
    const [cX, cY, a, b] = flip ? [P.Y, P.X, yv, xv] : [P.X, P.Y, xv, yv];
    const g = gcd(a, b);
    return { kind: 'eq', type: 'ratio', P, r, flip,
      s: { html: `${P.X}${P.c.w}有 <b>${xv}</b> ${u}，${P.Y}${P.c.w}有 <b>${yv}</b> ${u}`, txt: `${P.X}${P.c.w}有 ${xv} ${u}，${P.Y}${P.c.w}有 ${yv} ${u}`, sp: `${P.X}${P.c.w}有${xv}${u}，${P.Y}${P.c.w}有${yv}${u}` },
      given: '', givenT: '', ask: `${cX}${P.c.w}是${cY}的幾倍（幾分之幾）？`,
      eq: `${a} ÷ ${b}`, alt: [], nums: [V(xv), V(yv)], extra: [], unit: '', frac: true, ans: [a / g, b / g],
      rows: [{ name: cY, parts: b / g, base: true, lab: `1 ＝ ${b} ${u}` }, { name: cX, parts: a / g, lab: `？ ＝ ${a} ${u}` }],
      hint: `比值 ＝ 比較量 ÷ 基準量；問「是${cY}的幾倍」，${cY}是老大，放在 ÷ 後面` };
  }
  function genMoreLess() {
    const P = cast(), form = pk(['more', 'less']), r = pickRatio({ kinds: ['frac', 'frac', 'pct'], lt1: true, maxSum: 12 }), m = P.c.m, k = kOf(r.d, m), u = P.c.u;
    const sg = form === 'more' ? 1 : -1, yv = r.d * k * m, xv = (r.d + sg * r.n) * k * m, s = sentence(form, P, r);
    const c = comb(r, r.d + sg * r.n), op = form === 'more' ? '+' : '−', askX = Math.random() < .5;
    const base = { kind: 'eq', type: form, P, r, s, form, unit: u, extra: ['1'], hint: `把${P.Y}當作 1，${P.X}是 1 ${op === '+' ? '＋' : '−'} ${r.txt}` };
    if (askX) return Object.assign(base, { given: `${P.Y}${P.c.w}是 <b>${yv}</b> ${u}`, givenT: `${P.Y}${P.c.w}是 ${yv} ${u}`, ask: `${P.X}${P.c.w}是多少${u}？`,
      eq: `${yv} × (1 ${op} ${r.tok})`, alt: [`${yv} ${op} ${yv} × ${r.tok}`, `${yv} × ${c.tok}`, `${yv} ÷ ${r.d} × ${r.d + sg * r.n}`], nums: [V(yv), r.tok], ans: xv,
      rows: diagOf(form, P, r, { Y: `1 ＝ ${yv} ${u}`, X: `1 ${op === '+' ? '＋' : '−'} ${r.txt} ＝ ？` }) });
    return Object.assign(base, { given: `${P.X}${P.c.w}是 <b>${xv}</b> ${u}`, givenT: `${P.X}${P.c.w}是 ${xv} ${u}`, ask: `${P.Y}${P.c.w}是多少${u}？`,
      eq: `${xv} ÷ (1 ${op} ${r.tok})`, alt: [`${xv} ÷ ${c.tok}`, `${xv} ÷ ${r.d + sg * r.n} × ${r.d}`], nums: [V(xv), r.tok], ans: yv,
      rows: diagOf(form, P, r, { Y: '1 ＝ ？', X: `1 ${op === '+' ? '＋' : '−'} ${r.txt} ＝ ${xv} ${u}` }) });
  }
  /* 兩量和：askX＝問比較量（兩步） */
  function genSum(askX) {
    const P = cast(), r = pickRatio({ kinds: ['frac', 'frac', 'dec', 'int'], maxSum: 12 }), m = P.c.m, k = kOf(r.d, m, 7), u = P.c.u;
    const yv = r.d * k * m, xv = r.n * k * m, S = yv + xv, s = sentence('is', P, r), c = comb(r, r.n + r.d), nd = r.n + r.d;
    const [n, d] = [r.n, r.d];
    const o = { kind: 'eq', type: askX ? 'sumX' : 'sum', P, r, s, form: 'is', unit: u, extra: ['1'], given: `兩者合起來是 <b>${S}</b> ${u}`, givenT: `兩者合起來是 ${S} ${u}`,
      nums: [r.tok, V(S)], hint: `把${P.Y}當作 1，合起來是 1 ＋ ${r.txt}`,
      rows: [{ name: P.Y, parts: d, base: true, lab: askX ? '1' : '1 ＝ ？' }, { name: P.X, parts: n, lab: askX ? `${r.txt}${r.bei ? ' 倍' : ''} ＝ ？` : `${r.txt}${r.bei ? ' 倍' : ''}` }, { name: '合起來', parts: nd, split: d, lab: `1 ＋ ${r.txt} ＝ ${S} ${u}` }] };
    if (!askX) return Object.assign(o, { ask: `${P.Y}${P.c.w}是多少${u}？`, eq: `${S} ÷ (1 + ${r.tok})`, alt: [`${S} ÷ ${c.tok}`, `${S} ÷ ${nd} × ${d}`, `${S} ÷ (${n} + ${d}) × ${d}`], ans: yv });
    return Object.assign(o, { ask: `${P.X}${P.c.w}是多少${u}？`, eq: `${S} ÷ (1 + ${r.tok}) × ${r.tok}`, alt: [`${S} ÷ ${c.tok} × ${r.tok}`, `${S} ÷ ${nd} × ${n}`, `${S} ÷ (${n} + ${d}) × ${n}`, `${S} − ${S} ÷ (1 + ${r.tok})`, `${S} − ${S} ÷ ${c.tok}`], ans: xv });
  }
  /* 兩量差：askX＝問比較量（兩步） */
  function genDiff(askX) {
    const P = cast(), r = pickRatio({ kinds: ['frac', 'frac', 'dec'], maxSum: 12 }), m = P.c.m, k = kOf(r.d, m, 7), u = P.c.u;
    const yv = r.d * k * m, xv = r.n * k * m, D = Math.abs(yv - xv), s = sentence('is', P, r), [n, d] = [r.n, r.d], gt = n > d;
    const c = comb(r, Math.abs(n - d)), part = gt ? `(${r.tok} − 1)` : `(1 − ${r.tok})`, nd = Math.abs(n - d);
    const o = { kind: 'eq', type: askX ? 'diffX' : 'diff', P, r, s, form: 'is', unit: u, extra: ['1'],
      given: `${gt ? P.X : P.Y}${P.c.w}比${gt ? P.Y : P.X}多 <b>${D}</b> ${u}`, givenT: `${gt ? P.X : P.Y}${P.c.w}比${gt ? P.Y : P.X}多 ${D} ${u}`,
      nums: [r.tok, V(D)], hint: `把${P.Y}當作 1，相差的是 ${gt ? `${r.txt} − 1` : `1 − ${r.txt}`}`,
      rows: [{ name: P.Y, parts: d, base: true, lab: askX ? '1' : '1 ＝ ？' }, { name: P.X, parts: n, lab: `${r.txt}${r.bei ? ' 倍' : ''}${askX ? ' ＝ ？' : ''}` }],
      brace: { row: gt ? 1 : 0, from: Math.min(n, d), to: Math.max(n, d), text: `相差 ${D} ${u}` } };
    if (!askX) return Object.assign(o, { ask: `${P.Y}${P.c.w}是多少${u}？`, eq: `${D} ÷ ${part}`, alt: [`${D} ÷ ${c.tok}`, `${D} ÷ ${nd} × ${d}`, gt ? `${D} ÷ (${n} − ${d}) × ${d}` : `${D} ÷ (${d} − ${n}) × ${d}`], ans: yv });
    return Object.assign(o, { ask: `${P.X}${P.c.w}是多少${u}？`, eq: `${D} ÷ ${part} × ${r.tok}`, alt: [`${D} ÷ ${c.tok} × ${r.tok}`, `${D} ÷ ${nd} × ${n}`, gt ? `${D} ÷ (${n} − ${d}) × ${n}` : `${D} ÷ (${d} − ${n}) × ${n}`, gt ? `${D} ÷ ${part} + ${D}` : `${D} ÷ ${part} − ${D}`, gt ? `${D} ÷ ${c.tok} + ${D}` : `${D} ÷ ${c.tok} − ${D}`], ans: xv });
  }
  /* 連環案：A 是 B 的 r1，B 是 C 的 r2，C 有 x，A 有多少？ */
  function genChain() {
    const c = pk(CTX), r1 = pickRatio({ kinds: ['frac', 'frac', 'dec', 'int'], maxD: 5 }), r2 = pickRatio({ kinds: ['frac', 'frac', 'dec', 'int'], maxD: 5 });
    const k = rnd(2, 5), x = r1.d * r2.d * k * c.m, b = x / r2.d * r2.n, a = b / r1.d * r1.n, u = c.u;
    const T = (r) => r.bei ? `${r.html} 倍` : r.html, TT = r => r.bei ? `${r.txt} 倍` : r.txt, SP = r => r.sp + (r.bei ? '倍' : '');
    return { kind: 'eq', type: 'chain', P: { c, X: c.A, Y: c.B }, r: r1, r2,
      s: { html: `${c.A}${c.w}是${c.B}的 ${T(r1)}，${c.B}${c.w}是${c.C}的 ${T(r2)}`, txt: `${c.A}${c.w}是${c.B}的 ${TT(r1)}，${c.B}${c.w}是${c.C}的 ${TT(r2)}`, sp: `${c.A}${c.w}是${c.B}的${SP(r1)}，${c.B}${c.w}是${c.C}的${SP(r2)}` },
      given: `${c.C}${c.w}是 <b>${x}</b> ${u}`, givenT: `${c.C}${c.w}是 ${x} ${u}`, ask: `${c.A}${c.w}是多少${u}？`,
      eq: `${x} × ${r2.tok} × ${r1.tok}`, alt: [`${x} × (${r2.tok} × ${r1.tok})`, `${x} ÷ ${r2.d} × ${r2.n} ÷ ${r1.d} × ${r1.n}`], nums: [r1.tok, r2.tok, V(x)], extra: [], unit: u, ans: a,
      rows: [{ name: c.C, len: r1.d * r2.d, seg: false, base: true, lab: `${x} ${u}` }, { name: c.B, len: r1.d * r2.n, seg: false, lab: `${c.C}的 ${TT(r2)}` }, { name: c.A, len: r1.n * r2.n, seg: false, lab: `${c.B}的 ${TT(r1)} ＝ ？` }],
      hint: `一句一句來：先把${c.C}當老大求${c.B}，再把${c.B}當老大求${c.A}`, ok: Number.isInteger(b) && Number.isInteger(a) };
  }

  /* 一整場的案件 */
  function plan() {
    const f1 = mix(['is', 'rev', pk(['more', 'less']), pk(['is', 'rev'])]), cmpAt = rnd(1, 3);
    const ch1 = f1.map((f, i) => genSpot(f, i === cmpAt));
    const ch2 = mix(['is', pk(['rev', 'is']), pk(['more', 'less'])]).map(genMatch);
    const ch3 = [genCmp(), genBase(), genRatio(), genMoreLess(), pk([() => genSum(false), () => genDiff(false)])()];
    let boss; do { boss = pk([() => genSum(true), () => genDiff(true), genChain])(); } while (boss.ok === false);
    return [{ ch: 0, list: ch1 }, { ch: 1, list: ch2 }, { ch: 2, list: ch3 }, { ch: 3, list: [boss] }];
  }

  /* ---------- 樣式（只在 .rd 底下） ---------- */
  const CSS = `
.rd{max-width:640px;margin:0 auto;color:#2b2140}
.rd-hud{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between;background:#2b2140;color:#fff;border-radius:14px;padding:8px 12px;font-weight:900;font-size:15px}
.rd-hud .lvl{background:#ffd166;color:#2b2140;border-radius:999px;padding:2px 10px}
.rd-hud .mg{letter-spacing:1px;font-size:14px}
.rd-file{position:relative;background:#fffaf0;border:3px solid #2b2140;border-radius:14px;padding:14px 14px 12px;margin:12px 0;box-shadow:4px 4px 0 #2b2140}
.rd-file:before{content:attr(data-tag);position:absolute;top:-13px;left:12px;background:#e5484d;color:#fff;font-size:13px;font-weight:900;border-radius:6px;padding:1px 8px}
.rd-sent{font-size:20px;font-weight:900;line-height:1.7}
.rd-sent .rd-given{display:block;font-size:18px;color:#5b3fd0}
.rd-ask{margin-top:6px;font-size:18px;font-weight:900;color:#e5484d}
.rd-fr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;font-size:.8em;line-height:1.05;margin:0 2px}
.rd-fr>span:first-child{border-bottom:2px solid currentColor;padding:0 2px}
.rd-sus{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}
.rd-card{background:#fff;border:3px solid #2b2140;border-radius:14px;padding:12px 6px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 5px 0 #2b2140;transition:transform .1s;font-family:inherit;color:#2b2140}
.rd-card .em{display:block;font-size:40px;line-height:1.2}
.rd-card:active{transform:translateY(3px);box-shadow:0 2px 0 #2b2140}
.rd-card.ok{background:#c9f7d6;border-color:#22a06b}
.rd-card.no{background:#ffe0e5;animation:rdShake .4s}
.rd-opts{display:grid;gap:10px;margin:10px 0}
.rd-opt{background:#fff;border:3px solid #2b2140;border-radius:14px;padding:6px;cursor:pointer;box-shadow:0 4px 0 #2b2140;font-family:inherit;text-align:left}
.rd-opt b.no{display:inline-block;background:#2b2140;color:#fff;border-radius:6px;padding:0 8px;font-size:14px}
.rd-opt.ok{background:#c9f7d6;border-color:#22a06b}.rd-opt.no{background:#ffe0e5;animation:rdShake .4s}
.rd-svg{display:block;width:100%;max-width:440px;height:auto;margin:4px auto}
.rd-clue{background:#f3edff;border:2px dashed #7c4dff;border-radius:12px;padding:6px;margin:8px 0}
.rd-clue h4{margin:0 0 2px;font-size:14px;color:#5b3fd0}
.rd-intro{text-align:center;background:linear-gradient(160deg,#2b2140,#5b3fd0);color:#fff;border-radius:18px;padding:22px 16px;margin:12px 0;box-shadow:0 6px 0 #1a1230}
.rd-intro .big{font-size:56px;line-height:1.1}
.rd-intro h2{margin:6px 0;font-size:24px;color:#ffd166}
.rd-intro p{margin:6px 0 14px;font-size:17px;line-height:1.6}
.rd-btn{border:none;border-radius:999px;background:#ffd166;color:#2b2140;font-weight:900;font-size:19px;padding:10px 26px;cursor:pointer;box-shadow:0 4px 0 #b38600;font-family:inherit}
.rd-why{background:#fff3c4;border-left:6px solid #ffb703;border-radius:8px;padding:8px 10px;margin:8px 0;font-weight:700;line-height:1.6}
.rd-stamp{display:inline-block;border:4px solid #e5484d;color:#e5484d;font-size:26px;font-weight:900;padding:4px 14px;border-radius:10px;transform:rotate(-8deg);animation:rdStamp .4s ease-out}
.rd-cert{background:#fffaf0;border:5px double #b38600;border-radius:16px;padding:18px 14px;text-align:center;margin:12px 0}
.rd-cert h2{color:#b38600;margin:4px 0}
@keyframes rdShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes rdStamp{from{transform:scale(2.2) rotate(-8deg);opacity:0}to{transform:scale(1) rotate(-8deg);opacity:1}}
@media (max-width:480px){.rd-sent{font-size:18px}.rd-card{font-size:18px}.rd-card .em{font-size:34px}.rd-intro h2{font-size:21px}}
`;
  function css() { if (!document.getElementById('rd-css')) { const s = document.createElement('style'); s.id = 'rd-css'; s.textContent = CSS; document.head.appendChild(s); } }

  const CH = [
    { icon: '🔍', name: '第 1 章　指認老大', rank: '見習偵探', tip: '每句話都有一個「老大」：被拿來比、當作 <b>1</b> 的那個，就是<b>基準量</b>。另一個是<b>比較量</b>。小心句子的順序會騙人！' },
    { icon: '📏', name: '第 2 章　線段圖對質', rank: '正式偵探', tip: '嫌疑人交出三張線段圖，只有一張說真話。老大要畫成 <b>1</b>（👑），注意「是……的」和「比……多」不一樣！' },
    { icon: '🧮', name: '第 3 章　列式破案', rank: '名偵探', tip: '看線段圖找出老大，再列出算式。<br>比較量 ＝ 基準量 × 比值；基準量 ＝ 比較量 ÷ 比值。<br>列對算式，答案電腦幫你算！' },
    { icon: '👹', name: '最終章　大魔王案件', rank: '神探', tip: '最後一件要分兩步破案：先找出老大是多少，再求出問的那一個。' }
  ];
  const RANK = ['見習偵探', '正式偵探', '名偵探', '神探'];

  /* ---------- 主程式 ---------- */
  function RatioDetective(st) {
    css();
    const cases = plan(), total = cases.reduce((s, c) => s + c.list.length, 0);
    let ci = 0, qi = 0, solved = 0, rank = 0;
    const hud = () => `<div class="rd-hud"><span>🕵️ 基準量偵探社</span><span class="lvl">${RANK[rank]}</span><span class="mg">🔎 ${solved} / ${total}</span></div>`;
    const setQ = (q, c) => { try { curQ = { q, c }; } catch (e) {} };
    function intro() {
      const C = CH[ci]; rank = ci;
      st.innerHTML = `<div class="rd">${hud()}<div class="rd-intro"><div class="big">${C.icon}</div><h2>${C.name}</h2><p>${C.tip}</p><button type="button" class="rd-btn" id="rdGo">開始調查 ▶</button></div></div>`;
      api.say(`${C.icon} ${C.name}：讀完偵探守則，按「開始調查」！`, `${C.name}。${C.tip.replace(/<[^>]+>/g, '')}`);
      st.querySelector('#rdGo').onclick = () => { sfx('tap'); qi = 0; show(); };
    }
    function next() {
      solved++; qi++;
      if (qi < cases[ci].list.length) return later(show, 900);
      ci++;
      if (ci < cases.length) return later(intro, 1100);
      later(finale, 1000);
    }
    function frame(tag, inner) { return `<div class="rd">${hud()}<div class="rd-file" data-tag="${tag}">${inner}</div><div id="rdBody"></div></div>`; }
    function show() {
      const Q = cases[ci].list[qi], tag = `案件 ${solved + 1}／${total}`;
      RatioDetective.cur = Q; // 測試用：目前案件
      if (Q.kind === 'spot') return spot(Q, tag);
      if (Q.kind === 'match') return match(Q, tag);
      return solve(Q, tag);
    }
    /* 第 1 章 */
    function spot(Q, tag) {
      const who = Q.askCmp ? '比較量（跟班）' : '老大（基準量）';
      st.innerHTML = frame(tag, `<div class="rd-sent">「${Q.s.html}」</div><div class="rd-ask">這句話裡，誰是${who}？</div>`);
      api.say(`誰是${who}？`, `${Q.s.sp}。這句話裡，誰是${Q.askCmp ? '比較量' : '基準量'}？`);
      setQ(`「${Q.s.txt}」誰是${Q.askCmp ? '比較量' : '基準量'}？`, Q.ans);
      const body = st.querySelector('#rdBody');
      body.innerHTML = `<div class="rd-sus">${mix([[Q.P.X, Q.P.eX], [Q.P.Y, Q.P.eY]]).map(([n, e]) => `<button type="button" class="rd-card" data-n="${n}"><span class="em">${e}</span>${n}</button>`).join('')}</div><div id="rdWhy"></div>`;
      let done = false;
      body.querySelectorAll('.rd-card').forEach(b => b.onclick = () => {
        if (done) return;
        const why = WHY[Q.form](Q.P.X, Q.P.Y);
        if (b.dataset.n === Q.ans) {
          done = true; b.classList.add('ok');
          body.querySelector('#rdWhy').innerHTML = `<div class="rd-why">✅ ${why}</div><div style="text-align:center"><span class="rd-stamp">${Q.askCmp ? '抓到跟班！' : '老大現形！'}</span></div>`;
          api.ok(); speak(why); next();
        } else {
          b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
          body.querySelector('#rdWhy').innerHTML = `<div class="rd-why">💡 ${why}</div>`;
          api.bad(Q.form === 'rev' ? '先出現的不一定是老大喔！' : '再看一次：誰被拿來當作 1？', b.dataset.n, Q.ans); speak(why);
        }
      });
    }
    /* 第 2 章 */
    function match(Q, tag) {
      st.innerHTML = frame(tag, `<div class="rd-sent">「${Q.s.html}」</div><div class="rd-ask">哪一張線段圖說的是真話？</div>`);
      api.say('三張線段圖，哪一張是對的？', `${Q.s.sp}。哪一張線段圖是對的？`);
      const opts = mix(Q.opts), right = Q.opts[0];
      setQ(`「${Q.s.txt}」選出正確的線段圖`, `${Q.P.Y}當 1（${Q.r.d} 格），${Q.P.X} ${Q.form === 'more' ? Q.r.d + Q.r.n : Q.form === 'less' ? Q.r.d - Q.r.n : Q.r.n} 格`);
      const body = st.querySelector('#rdBody');
      body.innerHTML = `<div class="rd-opts">${opts.map((o, i) => `<button type="button" class="rd-opt" data-i="${i}"><b class="no">證物 ${'ABC'[i]}</b>${diag(o.rows)}</button>`).join('')}</div><div id="rdWhy"></div>`;
      let done = false;
      body.querySelectorAll('.rd-opt').forEach(b => b.onclick = () => {
        if (done) return;
        const o = opts[+b.dataset.i];
        const why = `${WHY[Q.form](Q.P.X, Q.P.Y)}${Q.form === 'more' ? `${Q.P.X}是 1 ＋ ${Q.r.txt}，要比${Q.P.Y}長。` : Q.form === 'less' ? `${Q.P.X}是 1 − ${Q.r.txt}，要比${Q.P.Y}短。` : ''}`;
        if (o.ok) {
          done = true; b.classList.add('ok');
          body.querySelector('#rdWhy').innerHTML = `<div class="rd-why">✅ ${why}</div><div style="text-align:center"><span class="rd-stamp">證物屬實！</span></div>`;
          api.ok(); speak(why); next();
        } else {
          b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
          body.querySelector('#rdWhy').innerHTML = `<div class="rd-why">💡 這張圖${o.t}。${why}</div>`;
          api.bad(`這張圖${o.t}`, `證物（${o.t}）`, right.t); speak(`這張圖${o.t}`);
        }
      });
    }
    /* 第 3、4 章 */
    function solve(Q, tag) {
      const isBoss = ci === 3;
      st.innerHTML = frame(isBoss ? '👹 大魔王案件' : tag, `<div class="rd-sent">「${Q.s.html}」${Q.given ? `<span class="rd-given">🔎 線索：${Q.given}</span>` : ''}</div><div class="rd-ask">❓ ${Q.ask}</div>`);
      api.say(Q.ask, `${Q.s.sp}。${(Q.givenT || '').replace(/ /g, '')}。${Q.ask}`);
      const body = st.querySelector('#rdBody');
      body.innerHTML = `<div class="rd-clue"><h4>🗂️ 線段圖線索（👑 是老大，當作 1）</h4>${diag(Q.rows, Q.brace)}</div><div class="eqwrap"></div>`;
      const r = { q: `${Q.s.txt}。${Q.givenT ? Q.givenT + '。' : ''}${Q.ask}`, eq: Q.eq, alt: Q.alt, nums: Q.nums, extra: Q.extra, unit: Q.unit, hint: Q.hint, frac: !!Q.frac };
      eqBuild(body.querySelector('.eqwrap'), r, () => {
        body.insertAdjacentHTML('beforeend', `<div style="text-align:center;margin:8px 0"><span class="rd-stamp">${isBoss ? '大魔王落網！' : '破案！'}</span></div>`);
        next();
      });
    }
    function finale() {
      rank = 3;
      st.innerHTML = `<div class="rd">${hud()}<div class="rd-cert"><div style="font-size:54px">🏅</div><h2>破案證書</h2><p style="font-size:18px;font-weight:900;line-height:1.7">恭喜你破了 ${total} 件案子，升級為<b style="color:#e5484d">「神探」</b>！<br>記住偵探守則：<br>👑 被拿來比、當作 1 的是<b>基準量</b><br>比較量 ＝ 基準量 × 比值<br>基準量 ＝ 比較量 ÷ 比值</p></div></div>`;
      api.say('恭喜升級為神探！', '恭喜你破了全部的案子，升級為神探！');
      later(() => api.finish(), 1800);
    }
    intro();
  }
  RatioDetective.gen = { plan, genSpot, genMatch, genCmp, genBase, genRatio, genMoreLess, genSum, genDiff, genChain, pickRatio, ratio, diag, sentence };
  window.RatioDetective = RatioDetective;
})();
