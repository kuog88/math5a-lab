'use strict';
/* 第 7 單元 乘法(一) ／ 第 8 單元 時間 ／ 第 9 單元 乘法(二) ／ 第 10 單元 面的大小比較 */

const FOODS = { 2: '🍒', 3: '🍡', 4: '🍓', 5: '🍬', 6: '🥚', 7: '🍪', 8: '🐙', 9: '🎈' };
const plate = (n, e) => `<span class="plate2">${pics(e, n, true)}</span>`;
const groupsHTML = (n, k, e = FOODS[n]) => `<div class="groups">${Array.from({ length: k }, () => plate(n, e)).join('')}</div>`;

/* 乘法共用：看圖寫乘法、乘法表、應用題 */
function factRound(n, k) { return { q: `${n} × ${k} = ?`, vis: `<span class="eq">${n} × ${k} = <span class="box">?</span></span>`, ans: n * k, hint: `${n} 個 ${n} 個數：${Array.from({ length: Math.min(k, 4) }, (_, i) => n * (i + 1)).join('、')}……`, after: `${n} × ${k} = ${n * k}` }; }
function picRound(n, k) {
  const e = FOODS[n];
  return { q: `一盤有 ${n} 個，有 ${k} 盤。哪一個算式對？`, vis: groupsHTML(n, k), opts: [{ h: `${n} × ${k}`, ok: true }, { h: `${k} + ${n}`, ok: false }, { h: `${n} × ${k + 1}`, ok: false }], hint: `${k} 盤，每盤 ${n} 個，是 ${n} 的 ${k} 倍！`, after: `${n} × ${k} = ${n * k}（${e} ${n * k} 個）` };
}

/* ===== 乘法裝盤子（7-A、9-A 共用）：做出「n 的 k 倍」 ===== */
function plateLevel(st, plans) {
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [n, k] = plans[r], e = FOODS[n]; let g = 0;
    api.say(`一盤放 ${n} 個 ${e}。做出 <b class="big">${n} 的 ${k} 倍</b>，做好按「好了」。`, `一盤放 ${n} 個。做出 ${n} 的 ${k} 倍，做好按好了。`);
    st.innerHTML = `${dots(r, plans.length)}<div class="readout" id="rd"></div><div class="groups" id="gp"></div>
      <div class="opts"><button type="button" class="opt" id="add">➕ 加一盤</button><button type="button" class="opt" id="sub">➖ 拿走一盤</button></div>
      <div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div><div class="qvis" id="qv"></div><div class="kwrap" id="kw"></div>`;
    const draw = () => { $('#gp', st).innerHTML = Array.from({ length: g }, () => plate(n, e)).join(''); $('#rd', st).textContent = `${g} 盤`; };
    $('#add', st).onclick = () => { if (g >= 9) return toast('盤子太多了！'); g++; sfx('pop'); draw(); };
    $('#sub', st).onclick = () => { if (g) g--; sfx('tap'); draw(); };
    $('#okb', st).onclick = () => {
      if (g !== k) return api.bad(`「${n} 的 ${k} 倍」要有 ${k} 盤喔！`);
      $('#okb', st).disabled = $('#add', st).disabled = $('#sub', st).disabled = true;
      api.ok(`對！${k} 盤就是 ${n} 的 ${k} 倍`);
      later(() => {
        api.say(`${n} 的 ${k} 倍，寫成 ${n} × ${k}，一共有幾個？`);
        keypad($('#kw', st), n * k, () => { $('#qv', st).innerHTML = `<div class="after">${n} × ${k} = ${n * k}</div>`; speak(`${n} 乘以 ${k} 等於 ${n * k}`); r++; later(round, 2200); }, `${n} 個 ${n} 個數數看！`);
      }, 1200);
    };
    draw();
  }
  round();
}

/* ===== 7-A 幾的幾倍 ===== */
function u7A(st) { plateLevel(st, shuffle([2, 5, 4, 8]).slice(0, 3).map(n => [n, rand(2, n === 8 ? 4 : 6)])); }

/* ===== 7-B 乘法的意義：2、5、4、8 ===== */
function u7B(st) {
  const rounds = [
    () => picRound(pick([2, 5]), rand(3, 6)),
    () => { const n = pick([2, 4, 5]), k = rand(3, 5); return { q: `${Array(k).fill(n).join(' + ')} 可以寫成哪一個乘法算式？`, opts: [{ h: `${n} × ${k}`, ok: true }, { h: `${n} + ${k}`, ok: false }, { h: `${n} × ${k + 1}`, ok: false }], hint: `有 ${k} 個 ${n} 相加！`, after: `${n} × ${k} = ${n * k}` }; },
    () => { const n = pick([4, 8]), k = rand(2, 5); return { q: `${n} × ${k} 的意思是？`, opts: [{ h: `<span style="font-size:22px">${k} 個 ${n}</span>`, ok: true }, { h: `<span style="font-size:22px">${n} 加 ${k}</span>`, ok: false }, { h: `<span style="font-size:22px">${n} 和 ${k} 合起來</span>`, ok: false }], hint: `被乘數 ${n} 是一份有幾個，乘數 ${k} 是有幾份！` }; },
    () => picRound(pick([4, 8]), rand(2, 5)),
    () => { const n = pick([2, 5, 4]), k = rand(3, 8); return { q: `${n} × ${k} 比 ${n} × ${k - 1} 多多少？`, opts: numOpts(n, 1, 9), hint: `多一份，就多一個 ${n}！`, after: `${n * k} − ${n * (k - 1)} = ${n}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 7-C 乘法快手與應用 ===== */
function u7C(st) {
  const rounds = [
    () => factRound(2, rand(2, 9)), () => factRound(5, rand(2, 9)), () => factRound(4, rand(2, 9)), () => factRound(8, rand(2, 9)),
    () => { const k = rand(3, 9); return { q: `一隻章魚有 8 隻腳，${k} 隻章魚有幾隻腳？`, vis: pics('🐙', k, true), ans: 8 * k, unit: '隻', hint: `8 × ${k} 算算看！`, after: `8 × ${k} = ${8 * k}（隻）` }; },
    () => { const k = rand(3, 9); return { q: `一包糖果 5 元，買 ${k} 包要幾元？`, vis: pics('🍬', k, true), ans: 5 * k, unit: '元', hint: `5 × ${k} 算算看！`, after: `5 × ${k} = ${5 * k}（元）` }; }
  ];
  quiz(st, rounds);
}

/* ===== 8-A 撥時鐘：拖動長針（5 分 5 分走），時針會跟著走 ===== */
function u8A(st) {
  const plans = shuffle([[3, 15], [7, 40], [10, 5], [5, 30], [8, 50], [2, 25]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [th, tm] = plans[r]; let h = 12, m = 0;
    api.say(`把時鐘撥到 <b class="big">${timeText(th, tm)}</b>。拖動<b>長針</b>，也可以用按鈕調時針。`, `把時鐘撥到 ${timeText(th, tm)}。拖動長針，也可以用按鈕調時針。`);
    st.innerHTML = `${dots(r, plans.length)}<div class="center">${digital(th, tm)}</div><div class="clockwrap">${clockSVG(h, m)}</div>
      <div class="opts"><button type="button" class="opt" id="hm">時針 ⟲ 1 小時</button><button type="button" class="opt" id="hp">時針 ⟳ 1 小時</button></div>
      <div class="center"><button class="btn mint" id="okb" type="button">撥好了！</button></div>`;
    const svg = $('svg.clock', st);
    const draw = () => { $('.hand-h', svg).setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 100 100)`); $('.hand-m', svg).setAttribute('transform', `rotate(${m * 6} 100 100)`); };
    const fromEvent = e => {
      const b = svg.getBoundingClientRect(), x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
      let nm = Math.round(((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360) / 30) * 5 % 60;
      if (m >= 45 && nm <= 15) h = h % 12 + 1; else if (m <= 15 && nm >= 45) h = (h + 10) % 12 + 1;
      if (nm !== m) sfx('tap');
      m = nm; draw();
    };
    svg.addEventListener('pointerdown', e => { e.preventDefault(); try { svg.setPointerCapture(e.pointerId); } catch (er) {} fromEvent(e); const mv = ev => fromEvent(ev); const up = () => { svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); }; svg.addEventListener('pointermove', mv); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up); });
    $('#hp', st).onclick = () => { h = h % 12 + 1; sfx('tap'); draw(); };
    $('#hm', st).onclick = () => { h = (h + 10) % 12 + 1; sfx('tap'); draw(); };
    $('#okb', st).onclick = () => {
      if (h === th && m === tm) { api.ok(`對！這是 ${timeText(th, tm)}`); r++; later(round, 1600); }
      else if (m !== tm) api.bad(`長針指著的數字 × 5 就是幾分。${tm} 分要指到 ${tm / 5 || 12}！`);
      else api.bad(`看短針（時針）：${th} 點多，短針要在 ${th} 和 ${th % 12 + 1} 中間。`);
    };
  }
  round();
}

/* ===== 8-B 報讀時刻 ===== */
function u8B(st) {
  const one = () => { const h = rand(1, 12), m = rand(0, 11) * 5; return [h, m]; };
  const rounds = [0, 1, 2].map(() => () => {
    const [h, m] = one(), wrong = [[h % 12 + 1, m], [h, (m + 30) % 60], [m === 0 ? 12 : m / 5, h * 5 % 60]];
    const list = [[h, m], ...wrong].filter((t, i, a) => a.findIndex(x => x[0] === t[0] && x[1] === t[1]) === i).slice(0, 3);
    return { q: '時鐘上是幾點幾分？', vis: clockSVG(h, m), opts: list.map((t, i) => ({ h: `<span style="font-size:24px">${timeText(t[0], t[1])}</span>`, ok: i === 0 })), hint: '短針指幾點，長針從 12 開始 5 分 5 分數！' };
  });
  rounds.push(() => {
    const [h, m] = one(), list = [[h, m], [h % 12 + 1, m], [h, (m + 15) % 60]];
    return { q: `哪一個時鐘和數字鐘 ${h}:${String(m).padStart(2, '0')} 一樣？`, vis: digital(h, m), opts: list.map((t, i) => ({ h: clockSVG(t[0], t[1]), ok: i === 0 })), hint: '冒號前面是幾點，後面是幾分！' };
  });
  rounds.push(() => { const k = rand(1, 11); return { q: `長針從 12 走到 ${k}，走了幾分鐘？`, vis: clockSVG(12, k * 5), ans: k * 5, unit: '分', hint: '長針走一個數字是 5 分鐘！', after: `${k} 個 5 分是 ${k * 5} 分` }; });
  quiz(st, rounds);
}

/* ===== 8-C 經過多久 ===== */
function u8C(st) {
  const pair = (h1, m1, h2, m2) => `<div class="clocks2"><div>${clockSVG(h1, m1, 'clock sm')}<div class="lbl">開始</div></div><span style="font-size:36px">➜</span><div>${clockSVG(h2, m2, 'clock sm')}<div class="lbl">結束</div></div></div>`;
  const rounds = [
    () => { const h = rand(1, 8), k = rand(2, 4); return { q: `從 ${h} 點整到 ${h + k} 點整，經過幾小時？`, vis: pair(h, 0, h + k, 0), ans: k, unit: '小時', hint: '短針走一大格是 1 小時！', after: `經過 ${k} 小時` }; },
    () => { const h = rand(1, 11), a = rand(0, 4) * 5, b = a + rand(2, 7) * 5; return { q: `從 ${timeText(h, a)} 到 ${timeText(h, b)}，經過幾分鐘？`, vis: pair(h, a, h, b), ans: b - a, unit: '分', hint: '數一數長針走了幾個 5 分！', after: `經過 ${b - a} 分鐘` }; },
    { q: '1 小時是幾分鐘？', vis: '<span style="font-size:56px">⏰</span>', ans: 60, unit: '分', hint: '長針走一整圈是 1 小時，一圈有 12 個 5 分！', after: '1 小時 = 60 分' },
    () => { const h = rand(7, 9); return { q: `小明 ${h} 點整開始寫功課，寫了 1 小時，寫完是幾點？`, vis: clockSVG(h, 0), opts: [{ h: `${h + 1} 點整`, ok: true }, { h: `${h} 點 1 分`, ok: false }, { h: `${h + 2} 點整`, ok: false }], hint: '過 1 小時，短針走到下一個數字！' }; },
    () => { const h = rand(2, 5), m = rand(1, 5) * 5; return { q: `電影 ${timeText(h, m)} 開始，看了 30 分鐘，結束是幾點幾分？`, vis: '<span style="font-size:56px">🎬</span>', opts: [{ h: timeText(h, m + 30), ok: true }, { h: timeText(h + 1, m), ok: false }, { h: timeText(h, m + 3), ok: false }].map(o => ({ ...o, h: `<span style="font-size:22px">${o.h}</span>` })), hint: '30 分鐘是長針走半圈！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 9-A 袋鼠跳數線：每次跳 n，跳 k 次 ===== */
function u9A(st) {
  const plans = shuffle([3, 6, 7, 9]).slice(0, 3).map(n => [n, rand(3, n >= 7 ? 5 : 6)]);
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [n, k] = plans[r], max = n * (k + 1); let j = 0;
    api.say(`袋鼠每次跳 <b>${n}</b> 格，請讓牠跳 <b class="big">${k} 次</b>。`, `袋鼠每次跳 ${n} 格，請讓牠跳 ${k} 次。`);
    st.innerHTML = `${dots(r, plans.length)}<div class="nline" id="nl"></div><div class="readout" id="rd"></div>
      <div class="center"><button type="button" class="btn blue" id="jump">🦘 跳！</button> <button type="button" class="btn ghost" id="back">↩ 退回</button> <button type="button" class="btn mint" id="okb">跳好了！</button></div>
      <div class="qvis" id="qv"></div><div class="kwrap" id="kw"></div>`;
    const W = 640, x = v => 20 + v * (W - 40) / max;
    const draw = () => {
      let s = `<svg viewBox="0 0 ${W} 130" style="width:100%;max-width:${W}px"><line x1="10" y1="100" x2="${W - 10}" y2="100" stroke="#4a3b5c" stroke-width="3"/>`;
      for (let v = 0; v <= max; v++) { const big = v % n === 0; s += `<line x1="${x(v)}" y1="${big ? 90 : 95}" x2="${x(v)}" y2="${big ? 110 : 105}" stroke="#4a3b5c" stroke-width="${big ? 2.5 : 1}"/>`; if (v === 0 || (big && v <= j * n)) s += `<text x="${x(v)}" y="127" text-anchor="middle" font-size="15" font-weight="900" fill="#4a3b5c" font-family="Arial">${v}</text>`; }
      for (let i = 0; i < j; i++) { const a = x(i * n), b = x((i + 1) * n); s += `<path d="M${a} 96 Q${(a + b) / 2} 30 ${b} 96" fill="none" stroke="#ff7eb3" stroke-width="3"/>`; }
      s += `<text x="${x(j * n)}" y="84" text-anchor="middle" font-size="34">🦘</text></svg>`;
      $('#nl', st).innerHTML = s; $('#rd', st).textContent = `跳了 ${j} 次`;
    };
    $('#jump', st).onclick = () => { if (j >= k + 1) return toast('跳太遠了！'); j++; sfx('pop'); draw(); };
    $('#back', st).onclick = () => { if (j) j--; sfx('tap'); draw(); };
    $('#okb', st).onclick = () => {
      if (j !== k) return api.bad(`要跳 ${k} 次喔，現在是 ${j} 次。`);
      $('#jump', st).disabled = $('#back', st).disabled = $('#okb', st).disabled = true;
      api.say(`${n} × ${k}，袋鼠跳到幾？`);
      keypad($('#kw', st), n * k, () => { $('#qv', st).innerHTML = `<div class="after">${n} × ${k} = ${n * k}</div>`; speak(`${n} 乘以 ${k} 等於 ${n * k}`); r++; later(round, 2200); }, `${n}、${n * 2}、${n * 3}……一次跳 ${n} 往後數！`);
    };
    draw();
  }
  round();
}

/* ===== 9-B 3、6、7、9 的乘法 ===== */
function u9B(st) {
  const rounds = [
    () => picRound(pick([3, 6]), rand(2, 5)),
    () => picRound(pick([7, 9]), rand(2, 4)),
    () => { const n = pick([3, 6, 7, 9]), k = rand(2, 8); return { q: `${n} × ${k + 1} 比 ${n} × ${k} 多多少？`, opts: numOpts(n, 1, 12), hint: `多一份，就多一個 ${n}！`, after: `多 ${n}` }; },
    () => { const k = rand(2, 8); return { q: `3 × ${k} 是 ${3 * k}，那 6 × ${k} 是多少？`, opts: numOpts(6 * k, 6, 60), hint: `6 是 3 的 2 倍，6 × ${k} 就是 ${3 * k} 的 2 倍！`, after: `6 × ${k} = ${6 * k}` }; },
    () => { const n = pick([7, 9]), seq = [1, 2, 3, 4, 5].map(i => n * i), g = rand(1, 4); return { q: `${n} 的乘法表，空格是多少？`, vis: `<span class="eq">${seq.map((v, i) => i === g ? '<span class="box">?</span>' : v).join(' , ')}</span>`, opts: numOpts(seq[g], n, n * 6), hint: `每次多 ${n}！` }; }
  ];
  quiz(st, rounds);
}

/* ===== 9-C 乘法挑戰 ===== */
function u9C(st) {
  const rounds = [
    () => factRound(3, rand(2, 9)), () => factRound(6, rand(2, 9)), () => factRound(7, rand(2, 9)), () => factRound(9, rand(2, 9)),
    () => { const n = pick([3, 6, 7, 9]), k = rand(2, 9); return { q: `□ × ${k} = ${n * k}，□ 是多少？`, vis: `<span class="eq"><span class="box">?</span> × ${k} = ${n * k}</span>`, ans: n, hint: `幾的 ${k} 倍是 ${n * k}？背背乘法表！`, after: `${n} × ${k} = ${n * k}` }; },
    () => { const k = rand(3, 8); return { q: `一星期有 7 天，${k} 個星期有幾天？`, vis: '<span style="font-size:52px">📅</span>', ans: 7 * k, unit: '天', hint: `7 × ${k} 算算看！`, after: `7 × ${k} = ${7 * k}（天）` }; },
    () => { const k = rand(3, 7); return { q: `一盒蛋有 6 顆，${k} 盒蛋，再加上 3 顆，一共有幾顆？`, vis: pics('🥚', 6, true), ans: 6 * k + 3, unit: '顆', hint: `先算 6 × ${k}，再加 3！`, after: `6 × ${k} = ${6 * k}，${6 * k} + 3 = ${6 * k + 3}（顆）` }; }
  ];
  quiz(st, rounds);
}

/* ===== 10-A 塗方格：塗出指定格數 ===== */
function u10A(st) {
  const ns = shuffle([5, 7, 8, 10, 12]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r], R = 4, C = 6;
    api.say(`點方格塗顏色，塗出 <b class="big">${n} 格</b>那麼大的面。`, `點方格塗顏色，塗出 ${n} 格那麼大的面。`);
    st.innerHTML = `${dots(r, ns.length)}<div class="readout" id="rd">塗了 0 格</div><div class="paint" style="grid-template-columns:repeat(${C},1fr)">${'<button type="button" class="cell"></button>'.repeat(R * C)}</div><div class="center"><button class="btn mint" id="okb" type="button">塗好了！</button></div>`;
    const cnt = () => $$('.cell.on', st).length;
    $$('.cell', st).forEach(c => c.onclick = () => { c.classList.toggle('on'); sfx('tap'); $('#rd', st).textContent = `塗了 ${cnt()} 格`; });
    $('#okb', st).onclick = () => {
      const k = cnt();
      if (k === n) { api.ok(`對！這個面有 ${n} 格那麼大`); r++; later(round, 1500); }
      else api.bad(k > n ? '塗太多了！' : '還不夠喔！');
    };
  }
  round();
}

/* ===== 10-B 面的直接比較、間接比較 ===== */
function u10B(st) {
  const svgPair = (a, b, ca = '#ffc93c', cb = '#5bb4ff') => `<div class="clocks2"><div>${a}<div class="lbl">甲</div></div><div>${b}<div class="lbl">乙</div></div></div>`;
  const rounds = [
    { q: '把甲疊在乙上面，甲<b>完全蓋住</b>乙，還有多出來。哪一個比較大？', sp: '把甲疊在乙上面，甲完全蓋住乙，還有多出來。哪一個比較大？', vis: `<svg viewBox="0 0 200 140" style="width:min(260px,70vw)"><rect x="10" y="10" width="180" height="120" rx="6" fill="#ffc93c" stroke="#4a3b5c" stroke-width="3"/><rect x="40" y="35" width="110" height="70" rx="6" fill="#5bb4ff" stroke="#4a3b5c" stroke-width="3" stroke-dasharray="6 4" opacity=".75"/><text x="22" y="32" font-size="18" font-weight="900">甲</text><text x="85" y="78" font-size="18" font-weight="900">乙</text></svg>`, keep: true, opts: [{ h: '甲', ok: true }, { h: '乙', ok: false }, { h: '一樣大', ok: false }], hint: '能蓋住別人、還多出來的比較大！' },
    () => { const a = blob(rand(6, 9)), b = blob(a.length + pick([-2, -1, 1, 2])); const big = a.length > b.length ? '甲' : '乙'; return { q: '數一數方格，哪一個面比較大？', vis: svgPair(gridShape(a, '#ffc93c'), gridShape(b, '#5bb4ff')), keep: true, opts: [{ h: '甲', ok: big === '甲' }, { h: '乙', ok: big === '乙' }, { h: '一樣大', ok: false }], hint: '每一格一樣大，格數越多面越大！', after: `甲 ${a.length} 格，乙 ${b.length} 格` }; },
    () => { const n = rand(6, 9), a = blob(n), b = blob(n); return { q: '形狀不一樣，哪一個面比較大？', vis: svgPair(gridShape(a, '#3fcf9c'), gridShape(b, '#ff7eb3')), keep: true, opts: [{ h: '甲', ok: false }, { h: '乙', ok: false }, { h: '一樣大', ok: true }], hint: '數數看兩個都是幾格！', after: `都是 ${n} 格，一樣大` }; },
    { q: '甲、乙兩張紙不能拿起來疊，要怎麼比大小？', opts: [{ h: '<span style="font-size:20px">用一樣大的方格去數</span>', ok: true }, { h: '<span style="font-size:20px">看哪張比較長</span>', ok: false }, { h: '<span style="font-size:20px">看哪張顏色比較深</span>', ok: false }], hint: '用一樣大的單位來量，就能比較！' }
  ];
  quiz(st, rounds);
}

/* ===== 10-C 面積挑戰：數方格、多幾格、單位不同 ===== */
function u10C(st) {
  const rounds = [
    () => { const a = blob(rand(7, 12), 4, 6); return { q: '這個面有幾格那麼大？', vis: gridShape(a, '#a98bff'), ans: a.length, unit: '格', hint: '一格一格數，數過的可以用手指按住！', after: `${a.length} 格` }; },
    () => { const a = blob(rand(8, 12), 4, 6), b = blob(rand(4, 7)); return { q: '甲比乙多幾格？', vis: `<div class="clocks2"><div>${gridShape(a, '#ffc93c')}<div class="lbl">甲</div></div><div>${gridShape(b, '#5bb4ff')}<div class="lbl">乙</div></div></div>`, ans: a.length - b.length, unit: '格', hint: '先數兩個各幾格，再用減法！', after: `${a.length} − ${b.length} = ${a.length - b.length}（格）` }; },
    () => { const a = blob(6), b = blob(8); return { q: '甲用<b>大方格</b>數是 6 格，乙用<b>小方格</b>數是 8 格。乙一定比較大嗎？', sp: '甲用大方格數是 6 格，乙用小方格數是 8 格。乙一定比較大嗎？', vis: `<div class="clocks2"><div>${gridShape(a, '#ffc93c', 46)}<div class="lbl">甲</div></div><div>${gridShape(b, '#5bb4ff', 22)}<div class="lbl">乙</div></div></div>`, keep: true, opts: [{ h: '一定', ok: false }, { h: '不一定', ok: true }], hint: '方格大小不一樣，不能只比格數！', after: '要用一樣大的方格數，才能比較' }; },
    () => { const k = rand(3, 5), rows = rand(2, 3); const cells = []; for (let i = 0; i < rows; i++) for (let j = 0; j < k; j++) cells.push([i, j]); return { q: `每排 ${k} 格，有 ${rows} 排。一共幾格？`, vis: gridShape(cells, '#3fcf9c'), ans: k * rows, unit: '格', hint: `可以用乘法：${k} × ${rows}`, after: `${k} × ${rows} = ${k * rows}（格）` }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C], u9: [u9A, u9B, u9C], u10: [u10A, u10B, u10C] });
