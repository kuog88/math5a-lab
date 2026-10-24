'use strict';
/* 第 9 單元 時間的乘除 ／ 第 10 單元 正方體和長方體 */

const TU = { hm: { B: '時', S: '分', R: 60 }, dh: { B: '日', S: '時', R: 24 } };
const tStr = (b, s, u) => `${b ? `${b} ${u.B} ` : ''}${s || !b ? `${s} ${u.S}` : ''}`.trim();

/* ===== 9-A 時間換換機：乘完要進位，除之前要換小單位 ===== */
function u9A(st) {
  const mk = (op, ut) => {
    const u = TU[ut];
    if (op === '×') {
      const k = rand(2, 4), b = rand(1, 2); let s; do { s = rand(u.R === 60 ? 15 : 8, u.R - 5); } while (s * k < u.R);
      return { op, u, k, b, s, B: b * k, S: s * k };
    }
    let k, ab, as, T; do { k = rand(2, 5); ab = rand(1, 2); as = rand(u.R === 60 ? 10 : 3, u.R - 5); T = (ab * u.R + as) * k; } while (Math.floor(T / u.R) % k === 0);
    return { op, u, k, ab, as, B: Math.floor(T / u.R), S: T % u.R };
  };
  const rounds = [mk('×', 'hm'), mk('×', 'dh'), mk('÷', 'hm'), mk('÷', 'dh')];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r], u = R.u;
    let B = R.B, S = R.S;
    if (R.op === '×') api.say(`${tStr(R.b, R.s, u)} × ${R.k}：每一格都乘以 ${R.k}，得到 ${B} ${u.B} ${S} ${u.S}。${u.S}超過 ${u.R} 了，按按鈕把 <b>${u.R} ${u.S}換成 1 ${u.B}</b>！`);
    else api.say(`${tStr(B, S, u)} ÷ ${R.k}：${B} ${u.B}不能平分成 ${R.k} 份。按按鈕把 <b>1 ${u.B}換成 ${u.R} ${u.S}</b>，換到可以平分再按「平分」！`);
    const draw = (warn) => {
      st.innerHTML = `${dots(r, rounds.length)}<div class="readout">${R.op === '×' ? `${tStr(R.b, R.s, u)} × ${R.k}` : `${tStr(R.B, R.S, u)} ÷ ${R.k}`}</div>
        <div class="tbox"><div class="tcell${warn === 'B' ? ' warn' : ''}" style="--c:#5bb4ff"><b>${B}</b><span>${u.B}</span></div><div class="tcell${warn === 'S' ? ' warn' : ''}" style="--c:#ff9a4d"><b>${S}</b><span>${u.S}</span></div></div>
        <div class="btns">${R.op === '×' ? `<button type="button" class="btn blue" id="cvB">${u.R} ${u.S} → 1 ${u.B}</button><button type="button" class="btn mint" id="okB">換好了！</button>` : `<button type="button" class="btn blue" id="cvB">1 ${u.B} → ${u.R} ${u.S}</button><button type="button" class="btn mint" id="okB">平分成 ${R.k} 份</button>`}</div>`;
      $('#cvB', st).onclick = () => {
        if (R.op === '×') { if (S < u.R) return toast(`${S} ${u.S}不到 ${u.R} ${u.S}，不能再換了！`); S -= u.R; B++; }
        else { if (!B) return toast(`沒有${u.B}可以換了！`); B--; S += u.R; }
        sfx('pop'); draw();
      };
      $('#okB', st).onclick = () => {
        if (R.op === '×') {
          if (S >= u.R) { draw('S'); return api.bad(`${S} ${u.S}還超過 ${u.R} ${u.S}，再換一次！`); }
          $$('button', st).forEach(b => b.disabled = true);
          const m = `${tStr(R.b, R.s, u)} × ${R.k} = ${tStr(B, S, u)}`; api.ok(m); speak(m);
        } else {
          if (B % R.k) { draw('B'); return api.bad(`${B} ${u.B}還不能平分成 ${R.k} 份，再把 1 ${u.B}換成 ${u.R} ${u.S}！`); }
          if (S % R.k) { draw('S'); return api.bad(`換太多了！${S} ${u.S}不能平分成 ${R.k} 份。`); }
          $$('button', st).forEach(b => b.disabled = true);
          const m = `${tStr(R.B, R.S, u)} ÷ ${R.k} = ${tStr(B / R.k, S / R.k, u)}`;
          $('.tbox', st).insertAdjacentHTML('afterend', `<div class="after">每一份：${tStr(B / R.k, S / R.k, u)}</div>`); api.ok(m); speak(m);
        }
        r++; later(round, 2800);
      };
    };
    draw();
  }
  round();
}

/* ===== 9-B 時間單位想一想 ===== */
function u9B(st) {
  quiz(st, [
    { q: '1 日是幾小時？', opts: numOpts(24, [12, 60, 100], '時'), hint: '一天有白天和晚上，時鐘的短針要走兩圈。' },
    () => { const h = rand(1, 3), m = rand(5, 55); return { q: `${h} 時 ${m} 分是幾分鐘？`, opts: numOpts(h * 60 + m, [h * 100 + m, h + m, h * 60 + m + 10], '分'), hint: '1 時 = 60 分！', after: `${h} × 60 + ${m} = ${h * 60 + m}（分）` }; },
    () => { const h = rand(1, 3), m = rand(10, 50), T = h * 60 + m; return { q: `${T} 分是幾時幾分？`, opts: [{ h: `${h} 時 ${m} 分`, ok: true }, { h: `${Math.floor(T / 100)} 時 ${T % 100} 分`, ok: false, hint: '1 時是 60 分，不是 100 分！' }, { h: `${h + 1} 時 ${m} 分`, ok: false, hint: `${h + 1} 時就有 ${(h + 1) * 60} 分了，太多了。` }].filter((o, i, a) => a.findIndex(x => x.h === o.h) === i), hint: `${T} ÷ 60 = ? 餘 ?` }; },
    () => { const h = rand(1, 4), m = pick([35, 40, 45, 50]), T = (h * 60 + m) * 2; return { q: `${h} 時 ${m} 分 × 2 = ？`, opts: [{ h: `${Math.floor(T / 60)} 時 ${T % 60} 分`, ok: true }, { h: `${h * 2} 時 ${T % 60} 分`, ok: false, hint: `${m * 2} 分超過 60 分，要進位 1 時！` }, { h: `${Math.floor(T / 60)} 時 ${m * 2 - 50} 分`, ok: false, hint: '進位時要減掉 60 分，不是 50 分。' }], hint: '分 × 2 超過 60 要進位。' }; },
    () => { const [d, k] = pick([[4, 3], [5, 4], [3, 2], [7, 4]]), T = d * 24 / k; return { q: `${d} 日 ÷ ${k} = ？`, opts: [{ h: tStr(Math.floor(T / 24), T % 24, TU.dh), ok: true }, { h: tStr(Math.floor(d / k), d % k, TU.dh), ok: false, hint: `剩下的 ${d % k} 日要換成 ${d % k * 24} 時再平分！` }, { h: tStr(Math.floor(T / 24), T % 24 + 2, TU.dh), ok: false, hint: `${d} 日 = ${d * 24} 時，${d * 24} ÷ ${k} = ${T} 時。` }], hint: '先把日換成時再平分。' }; },
    { q: '1 分鐘是幾秒？', opts: numOpts(60, [100, 24, 10], '秒'), hint: '秒針走一圈是 1 分鐘。' }
  ]);
}

/* ===== 9-C 時間應用挑戰 ===== */
function u9C(st) {
  quiz(st, [
    () => { const m = rand(25, 45); return { q: `小美每天練琴 ${m} 分鐘，一星期 7 天一共練幾分鐘？`, vis: '<span style="font-size:56px">🎹</span>', ans: m * 7, unit: '分', hint: `${m} × 7`, after: `${m} × 7 = ${m * 7}（分）= ${tStr(Math.floor(m * 7 / 60), m * 7 % 60, TU.hm)}` }; },
    () => { const k = pick([3, 4, 5]), e = rand(15, 30), T = e * k; return { q: `一部影片長 ${tStr(Math.floor(T / 60), T % 60, TU.hm)}，分成 ${k} 段一樣長，每段幾分鐘？`, vis: '<span style="font-size:56px">🎬</span>', ans: e, unit: '分', hint: '先把時換成分，再平分。', after: `${T} ÷ ${k} = ${e}（分）` }; },
    () => { const h = rand(2, 6), [m, k] = pick([[40, 3], [20, 3], [15, 4], [30, 2], [45, 4]]); return { q: `火車每天行駛 ${h} 時 ${m} 分，${k} 天一共行駛幾小時？`, vis: '<span style="font-size:56px">🚆</span>', ans: h * k + m * k / 60, unit: '時', hint: `時 × ${k}、分 × ${k}，分再換成時。`, after: `${h * k} 時 ${m * k} 分 = ${h * k + m * k / 60} 時` }; },
    () => { const h = pick([8, 9]), T = h * 7; return { q: `小明每天睡 ${h} 小時，一星期 7 天一共睡了多久？`, vis: '<span style="font-size:56px">😴</span>', opts: [{ h: tStr(Math.floor(T / 24), T % 24, TU.dh), ok: true }, { h: tStr(Math.floor(T / 10), T % 10, TU.dh), ok: false, hint: '1 日是 24 時，不是 10 時！' }, { h: tStr(Math.floor(T / 24) + 1, T % 24, TU.dh), ok: false, hint: `${T} 時 ÷ 24 = ? 再檢查一次。` }], hint: `${h} × 7 = ${T} 時，再換成幾日幾時。` }; },
    () => { const k = pick([4, 5, 6]), e = pick([20, 30, 40]), T = e * k; return { q: `${tStr(Math.floor(T / 60), T % 60, TU.hm)} ÷ ${k} 是幾分？`, ans: e, unit: '分', hint: '先換成分，再除。', after: `${T} ÷ ${k} = ${e}（分）` }; },
    () => { const h = rand(8, 10), m = rand(30, 55), n = 3, len = rand(20, 30), E = h * 60 + m + n * len; const f = t => `${Math.floor(t / 60)} 時 ${String(t % 60).padStart(2, '0')} 分`; return { q: `比賽從 ${h} 時 ${m} 分開始，一共比 ${n} 場，每場 ${len} 分鐘，中間不休息。幾時幾分結束？`, vis: '<span style="font-size:56px">🏓</span>', opts: [{ h: f(E), ok: true }, { h: f(E - 60), ok: false, hint: '分加起來超過 60 要進位 1 時！' }, { h: f(E + 10), ok: false, hint: `先算 ${n} × ${len} = ${n * len} 分，再加上去。` }], hint: `比賽一共 ${n} × ${len} = ${n * len} 分。` }; }
  ]);
}

/* ===== 正方體展開圖：在方格上滾動正方體，看每一格是哪一面 ===== */
function foldNet(cells) {
  const key = (x, y) => `${x},${y}`, set = new Set(cells.map(([x, y]) => key(x, y)));
  const face = {}, up = {}, q = [[cells[0][0], cells[0][1], { d: 0, u: 1, n: 2, s: 3, e: 4, w: 5 }]];
  face[key(...cells[0])] = 0; up[key(...cells[0])] = 1;
  while (q.length) {
    const [x, y, o] = q.shift();
    const rolls = [[1, 0, { d: o.e, e: o.u, u: o.w, w: o.d, n: o.n, s: o.s }], [-1, 0, { d: o.w, w: o.u, u: o.e, e: o.d, n: o.n, s: o.s }], [0, 1, { d: o.s, s: o.u, u: o.n, n: o.d, e: o.e, w: o.w }], [0, -1, { d: o.n, n: o.u, u: o.s, s: o.d, e: o.e, w: o.w }]];
    for (const [dx, dy, no] of rolls) {
      const k = key(x + dx, y + dy);
      if (set.has(k) && !(k in face)) { face[k] = no.d; up[k] = no.u; q.push([x + dx, y + dy, no]); }
    }
  }
  const ok = Object.keys(face).length === cells.length && new Set(Object.values(face)).size === 6 && cells.length === 6;
  return { ok, face, up, connected: Object.keys(face).length === cells.length };
}
/* 把形狀轉正，旋轉、翻面後都一樣的視為同一種 */
function netCanon(cells) {
  const vs = [];
  for (let t = 0; t < 8; t++) {
    let p = cells.map(([x, y]) => { let a = t & 1 ? [y, x] : [x, y]; if (t & 2) a = [-a[0], a[1]]; if (t & 4) a = [a[0], -a[1]]; return a; });
    const mx = Math.min(...p.map(a => a[0])), my = Math.min(...p.map(a => a[1]));
    vs.push(p.map(a => `${a[0] - mx},${a[1] - my}`).sort().join(' '));
  }
  return vs.sort()[0];
}
const NETS = [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[1, 0], [1, 1], [0, 1], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], [[2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]];
function netSVG(on, star, cols = 5, rows = 4, C = 76) {
  let h = `<svg class="netsvg" viewBox="0 0 ${cols * C + 10} ${rows * C + 10}">`;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const k = `${x},${y}`, f = on.has(k);
    h += `<rect class="nc" data-k="${k}" x="${5 + x * C}" y="${5 + y * C}" width="${C}" height="${C}" fill="${f ? '#ffd27a' : '#fbfdff'}" stroke="${f ? '#4a3b5c' : '#d9d0e3'}" stroke-width="${f ? 4 : 2}" stroke-dasharray="${f ? '' : '6 5'}"/>`;
    if (k === star) h += `<text x="${5 + x * C + C / 2}" y="${5 + y * C + C / 2 + 14}" text-anchor="middle" font-size="40" pointer-events="none">⭐</text>`;
  }
  return h + '</svg>';
}

/* ===== 10-A 展開圖設計師 ===== */
function u10A(st) {
  const rounds = ['b', 'b', 'o'];
  let r = 0, first = null;
  function round() {
    if (r >= rounds.length) return api.finish();
    if (rounds[r] === 'b') {
      const on = new Set();
      api.say(first ? '再設計一個<b>不一樣</b>的正方體展開圖（轉一轉、翻一翻一樣的不算）！' : '點方格選出 <b>6 個正方形</b>，拼成一個可以摺成<b>正方體</b>的展開圖！再點一次可以取消。');
      const draw = () => {
        st.innerHTML = `${dots(r, rounds.length)}<div class="readout">已選 ${on.size} / 6 格</div><div class="qvis">${netSVG(on)}</div><div class="center"><button type="button" class="btn ghost" id="clrB">清除</button> <button type="button" class="btn mint" id="okB">摺摺看！</button></div>`;
        $$('.nc', st).forEach(c => c.addEventListener('click', () => { const k = c.dataset.k; if (on.has(k)) on.delete(k); else { if (on.size >= 6) return toast('正方體只有 6 個面！'); on.add(k); } sfx('tap'); draw(); }));
        $('#clrB', st).onclick = () => { on.clear(); draw(); };
        $('#okB', st).onclick = () => {
          if (on.size < 6) return toast(`要選 6 格，現在只有 ${on.size} 格。`);
          const cells = [...on].map(s => s.split(',').map(Number)), F = foldNet(cells);
          if (!F.connected) return api.bad('6 個正方形要邊和邊連在一起！');
          if (!F.ok) return api.bad('摺起來有兩個面疊在一起，還會缺一個面，摺不成正方體！');
          const c = netCanon(cells);
          if (first && c === first) return api.bad('這個和剛才的展開圖轉一轉、翻一翻是一樣的，換一種！');
          first = c; $$('button', st).forEach(b => b.disabled = true);
          api.ok('可以摺成正方體！'); speak('可以摺成正方體，6 個面都不重複'); r++; later(round, 2400);
        };
      };
      draw();
    } else {
      const net = pick(NETS), F = foldNet(net), sk = net.map(a => a.join(','));
      const star = pick(sk), opp = sk.find(k => F.face[k] === F.up[star]), on = new Set(sk);
      api.say('把這個展開圖摺成正方體，哪一面會和 ⭐ <b>相對</b>（在正對面）？點那一格！');
      st.innerHTML = `${dots(r, rounds.length)}<div class="qvis">${netSVG(on, star)}</div>`;
      $$('.nc', st).forEach(c => c.addEventListener('click', () => {
        const k = c.dataset.k; if (!on.has(k) || k === star) return;
        if (k === opp) { c.setAttribute('fill', '#b6f0d6'); api.ok('答對了！相對的面不會相鄰。'); speak('答對了，相對的兩個面不會連在一起'); r++; later(round, 2400); }
        else { c.setAttribute('fill', '#ffb3b3'); api.bad('這一面和 ⭐ 相鄰（摺起來會連在一起），不是相對的面！'); }
      }));
    }
  }
  round();
}

/* ===== 長方體圖 ===== */
const CUBOID = `<svg class="pic" viewBox="0 0 300 210" width="300">
  <g stroke="#4a3b5c" stroke-width="3" fill="none"><polygon points="40,80 200,80 200,180 40,180" fill="#d6ecff"/><polygon points="40,80 100,30 260,30 200,80" fill="#e8f4ff"/><polygon points="200,80 260,30 260,130 200,180" fill="#c3e2ff"/>
  <line x1="100" y1="30" x2="100" y2="130" stroke-dasharray="6 5"/><line x1="100" y1="130" x2="260" y2="130" stroke-dasharray="6 5"/><line x1="100" y1="130" x2="40" y2="180" stroke-dasharray="6 5"/></g>
  <g font-size="17" font-weight="900" fill="#e5508f"><text x="24" y="78">A</text><text x="204" y="98">B</text><text x="204" y="200">C</text><text x="24" y="198">D</text><text x="92" y="24">E</text><text x="264" y="26">F</text><text x="266" y="140">G</text><text x="106" y="124">H</text></g></svg>`;

/* ===== 10-B 面和邊想一想 ===== */
function u10B(st) {
  quiz(st, [
    { q: '長方體有幾個面、幾條邊、幾個頂點？', vis: CUBOID, opts: [{ h: '6 面、12 邊、8 頂點', ok: true }, { h: '6 面、8 邊、12 頂點', ok: false, hint: '頂點是角角，數一數：上面 4 個、下面 4 個。' }, { h: '4 面、12 邊、8 頂點', ok: false, hint: '別忘了看不到的後面、下面和左邊！' }] },
    { q: '和面 ABCD <b>平行</b>的面是哪一個？', vis: CUBOID, opts: [{ h: '面 EFGH', ok: true }, { h: '面 ABFE', ok: false, hint: '面 ABFE 和面 ABCD 連在一起，是互相垂直。' }, { h: '面 BFGC', ok: false, hint: '面 BFGC 和面 ABCD 連在一起，是互相垂直。' }], hint: '平行的面是正對面，不會相交。' },
    { q: '和邊 AB <b>平行</b>的邊有幾條？', vis: CUBOID, opts: numOpts(3, [2, 4, 1], '條'), hint: '找和 AB 一樣方向的邊：DC、EF、HG。', after: 'DC、EF、HG，共 3 條' },
    { q: '和面 ABCD <b>垂直</b>的面有幾個？', vis: CUBOID, opts: numOpts(4, [2, 5, 1], '個'), hint: '和面 ABCD 連在一起的面都和它垂直。', after: '上、下、左、右 4 個面' },
    { q: '和邊 AE <b>垂直</b>的邊有幾條？', vis: CUBOID, opts: numOpts(4, [2, 3, 8], '條'), hint: '看 A 點和 E 點，各有 2 條邊和 AE 相交成直角。', after: 'AB、AD、EF、EH，共 4 條' },
    { q: '正方體的 6 個面是什麼形狀？', opts: [{ h: '6 個一樣大的正方形', ok: true }, { h: '6 個長方形，大小不一定一樣', ok: false, hint: '那是長方體喔！' }, { h: '4 個正方形和 2 個長方形', ok: false, hint: '正方體所有的邊都一樣長！' }] }
  ]);
}

/* ===== 10-C 表面積挑戰 ===== */
function u10C(st) {
  quiz(st, [
    () => { const a = rand(3, 9); return { q: `邊長 ${a} 公分的正方體，表面積是多少平方公分？`, vis: '<span style="font-size:56px">🧊</span>', ans: 6 * a * a, unit: '平方公分', hint: '6 個一樣大的正方形：邊長 × 邊長 × 6。', after: `${a} × ${a} × 6 = ${6 * a * a}` }; },
    () => { const l = rand(6, 12), w = rand(3, 5), h = rand(2, 8); return { q: `長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分的長方體，表面積是多少平方公分？`, vis: CUBOID, ans: 2 * (l * w + w * h + l * h), unit: '平方公分', hint: '3 組相對的面各有 2 個：(長×寬 + 寬×高 + 長×高) × 2。', after: `(${l * w} + ${w * h} + ${l * h}) × 2 = ${2 * (l * w + w * h + l * h)}` }; },
    () => { const l = rand(6, 12), w = rand(3, 5), h = rand(2, 8); return { q: `長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分的長方體，所有的邊長加起來是幾公分？`, ans: 4 * (l + w + h), unit: '公分', hint: '長、寬、高各有 4 條。', after: `(${l} + ${w} + ${h}) × 4 = ${4 * (l + w + h)}` }; },
    () => { const a = rand(2, 8); return { q: `一個正方體的表面積是 ${6 * a * a} 平方公分，它的邊長是幾公分？`, ans: a, unit: '公分', hint: `先算一個面：${6 * a * a} ÷ 6 = ${a * a}，什麼數自己乘自己是 ${a * a}？`, after: `${6 * a * a} ÷ 6 = ${a * a} = ${a} × ${a}` }; },
    () => { const l = rand(8, 15), w = rand(5, 8), h = rand(3, 6); return { q: `做一個<b>沒有蓋子</b>的長方體紙盒，長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分，要用多少平方公分的紙板？`, vis: '<span style="font-size:56px">📦</span>', ans: l * w + 2 * (w * h + l * h), unit: '平方公分', hint: '沒有蓋子，只有 1 個底面，再加 4 個側面。', after: `${l * w} + (${w * h} + ${l * h}) × 2 = ${l * w + 2 * (w * h + l * h)}` }; },
    () => { const a = rand(3, 9); return { q: `正方體所有的邊長加起來是 ${12 * a} 公分，一條邊是幾公分？`, ans: a, unit: '公分', hint: '正方體有 12 條一樣長的邊。', after: `${12 * a} ÷ 12 = ${a}` }; }
  ]);
}

Object.assign(LEVELS, { u9: [u9A, u9B, u9C], u10: [u10A, u10B, u10C] });
