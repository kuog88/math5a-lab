'use strict';
/* 第 7 單元 2、5、4、8 的乘法 ／ 第 8 單元 幾時幾分 ／ 第 9 單元 3、6、7、9 的乘法 ／ 第 10 單元 平面圖形 */

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

/* ===== 8-A 撥時鐘：拖動長針（1 分 1 分走），時針會跟著走 ===== */
function u8A(st) {
  const plans = [pick([[3, 15], [10, 5], [5, 30], [8, 50]]), ...shuffle([[7, 42], [2, 26], [9, 18], [4, 53], [11, 37], [6, 9]]).slice(0, 2)];
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [th, tm] = plans[r]; let h = 12, m = 0;
    api.say(`把時鐘撥到 <b class="big">${timeText(th, tm)}</b>。拖動<b>長針</b>，也可以用按鈕調。`, `把時鐘撥到 ${timeText(th, tm)}。拖動長針，也可以用按鈕調。`);
    st.innerHTML = `${dots(r, plans.length)}<div class="center">${digital(th, tm)}</div><div class="clockwrap">${clockSVG(h, m)}</div>
      <div class="opts"><button type="button" class="opt" id="hm">時針 ⟲ 1 小時</button><button type="button" class="opt" id="hp">時針 ⟳ 1 小時</button><button type="button" class="opt" id="mm">長針 ⟲ 1 分</button><button type="button" class="opt" id="mp">長針 ⟳ 1 分</button></div>
      <div class="center"><button class="btn mint" id="okb" type="button">撥好了！</button></div>`;
    const svg = $('svg.clock', st);
    const draw = () => { $('.hand-h', svg).setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 100 100)`); $('.hand-m', svg).setAttribute('transform', `rotate(${m * 6} 100 100)`); };
    const setM = nm => {
      nm = (nm + 60) % 60;
      if (m >= 45 && nm <= 15) h = h % 12 + 1; else if (m <= 15 && nm >= 45) h = (h + 10) % 12 + 1;
      if (nm !== m) sfx('tap');
      m = nm; draw();
    };
    const fromEvent = e => {
      const b = svg.getBoundingClientRect(), x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
      setM(Math.round(((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360) / 6) % 60);
    };
    svg.addEventListener('pointerdown', e => { e.preventDefault(); try { svg.setPointerCapture(e.pointerId); } catch (er) {} fromEvent(e); const mv = ev => fromEvent(ev); const up = () => { svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); }; svg.addEventListener('pointermove', mv); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up); });
    $('#hp', st).onclick = () => { h = h % 12 + 1; sfx('tap'); draw(); };
    $('#hm', st).onclick = () => { h = (h + 10) % 12 + 1; sfx('tap'); draw(); };
    $('#mp', st).onclick = () => setM(m + 1);
    $('#mm', st).onclick = () => setM(m - 1);
    $('#okb', st).onclick = () => {
      if (h === th && m === tm) { api.ok(`對！這是 ${timeText(th, tm)}`); r++; later(round, 1600); }
      else if (m !== tm) api.bad(tm % 5 ? `長針先指到 ${Math.floor(tm / 5) || 12}（${Math.floor(tm / 5) * 5} 分），再往前走 ${tm % 5} 小格！` : `長針一大格是 5 分，${tm} 分要指到 ${tm / 5 || 12}！`);
      else api.bad(`看短針（時針）：${th} 時多，短針要在 ${th} 和 ${th % 12 + 1} 中間。`);
    };
  }
  round();
}

/* ===== 8-B 報讀幾時幾分（每小格 1 分、每大格 5 分） ===== */
function u8B(st) {
  const one = five => [rand(1, 12), five ? rand(1, 11) * 5 : pick([1, 2, 3, 4, 6, 7, 8, 9]) + rand(0, 5) * 10];
  const uniq = list => list.filter((t, i, a) => a.findIndex(x => x[0] === t[0] && x[1] === t[1]) === i).slice(0, 3);
  const readRound = five => () => {
    const [h, m] = one(five), list = uniq([[h, m], [h % 12 + 1, m], [h, (m + (five ? 30 : 5)) % 60], [h, (m + 1) % 60]]);
    return { q: '時鐘上是幾時幾分？', vis: clockSVG(h, m), opts: list.map((t, i) => ({ h: `<span style="font-size:24px">${timeText(t[0], t[1])}</span>`, ok: i === 0 })), hint: '短針剛走過幾就是幾時；長針一大格 5 分，一小格 1 分！' };
  };
  const rounds = [
    { q: '鐘面上，長針走 1 小格是幾分鐘？', vis: clockSVG(12, 1), ans: 1, unit: '分', hint: '一大格裡有 5 小格，一大格是 5 分鐘！', after: '1 小格是 1 分鐘，1 大格是 5 分鐘' },
    readRound(true), readRound(false), readRound(false),
    () => {
      const [h, m] = one(false), list = [[h, m], [h % 12 + 1, m], [h, (m + 15) % 60]];
      return { q: `哪一個時鐘和數字鐘 ${h}:${String(m).padStart(2, '0')} 一樣？`, vis: digital(h, m), opts: list.map((t, i) => ({ h: clockSVG(t[0], t[1]), ok: i === 0 })), hint: '冒號前面是幾時，後面是幾分！' };
    },
    () => { const k = pick([rand(6, 9), rand(11, 14), rand(16, 19), rand(21, 24), rand(26, 29)]); return { q: '長針從 12 走到這裡，走了幾分鐘？', vis: clockSVG(12, k), ans: k, unit: '分', hint: '先 5 分 5 分數大格，再 1 分 1 分數小格！', after: `${Math.floor(k / 5)} 大格又 ${k % 5} 小格，是 ${k} 分` }; }
  ];
  quiz(st, rounds);
}

/* ===== 8-C 點數經過的時間 ===== */
function u8C(st) {
  const pair = (h1, m1, h2, m2) => `<div class="clocks2"><div>${clockSVG(h1, m1, 'clock sm')}<div class="lbl">開始</div></div><span style="font-size:36px">➜</span><div>${clockSVG(h2, m2, 'clock sm')}<div class="lbl">結束</div></div></div>`;
  const rounds = [
    () => { const h = rand(1, 8), k = rand(2, 4); return { q: `從 ${h} 時到 ${h + k} 時，經過幾小時？`, vis: pair(h, 0, h + k, 0), ans: k, unit: '小時', hint: '短針從一個數字走到下一個數字，是 1 小時！', after: `經過 ${k} 小時` }; },
    () => { const h = rand(1, 11), a = rand(0, 20), b = a + rand(3, 12); return { q: `從 ${timeText(h, a)} 到 ${timeText(h, b)}，經過幾分鐘？`, vis: pair(h, a, h, b), ans: b - a, unit: '分', hint: '數一數長針走了幾小格，一小格是 1 分鐘！', after: `經過 ${b - a} 分鐘` }; },
    () => { const h = rand(7, 9); return { q: `小明 ${h} 時開始寫功課，寫完時短針剛好走到 ${h + 1}，長針指著 12。寫了多久？`, vis: pair(h, 0, h + 1, 0), keep: true, opts: [{ h: '1 分鐘', ok: false }, { h: '1 小時', ok: true }, { h: '2 小時', ok: false }], hint: '短針走了一大格，是 1 小時！' }; },
    () => { const h = rand(8, 10); return { q: `運動會從上午 ${h} 時開始，到中午 12 時結束，經過幾小時？`, vis: pair(h, 0, 12, 0), ans: 12 - h, unit: '小時', hint: `從 ${h} 時一小時一小時數到 12 時！`, after: `經過 ${12 - h} 小時` }; },
    () => { const h = rand(1, 6), k = rand(2, 5); return { q: `從 ${h} 時到 ${h + k} 時，短針走了幾大格？`, vis: pair(h, 0, h + k, 0), opts: numOpts(k, 1, 6), hint: '短針從一個數字走到下一個數字，是 1 大格！', after: `走了 ${k} 大格，經過 ${k} 小時` }; }
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

/* ===== 第 10 單元 平面圖形：畫圖工具 ===== */
const reg = (n, r = 85, cx = 120, cy = 108) => Array.from({ length: n }, (_, k) => { const a = (k * 360 / n - 90) * Math.PI / 180; return [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]; });
const SHAPES = {
  tri: { name: '三角形', pts: [[120, 22], [28, 180], [212, 180]] },
  quad: { name: '四邊形', pts: [[40, 40], [200, 22], [222, 172], [26, 150]] },
  pent: { name: '五邊形', pts: reg(5) },
  hex: { name: '六邊形', pts: reg(6) },
  eq: { name: '正三角形', pts: [[120, 22], [30, 178], [210, 178]] },
  sq: { name: '正方形', pts: [[50, 34], [190, 34], [190, 174], [50, 174]] },
  rect: { name: '長方形', pts: [[34, 54], [206, 54], [206, 154], [34, 154]] }
};
/* labels：每條邊旁邊寫的字（第 k 條邊是第 k 點到第 k+1 點）；dot：畫一個紅點；vtx：頂點畫成可以點的圓 */
function polySVG(pts, o = {}) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let s = `<svg class="poly" viewBox="-50 -22 340 244" style="width:min(340px,86vw)"><polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${o.c || '#ffe08a'}" stroke="#4a3b5c" stroke-width="5" stroke-linejoin="round"/>`;
  (o.labels || []).forEach((t, k) => {
    if (t === '' || t === undefined) return;
    const a = pts[k], b = pts[(k + 1) % pts.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, off = 16 + 26 * Math.abs(dx) / d, inX = mx + dx / d * off, inY = my + dy / d * off;
    s += `<text x="${inX}" y="${inY + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="#c2185b" font-family="Arial, sans-serif">${t}</text>`;
  });
  if (o.dot) s += `<circle cx="${o.dot[0]}" cy="${o.dot[1]}" r="9" fill="#ff4d6d" stroke="#fff" stroke-width="3"/>`;
  if (o.vtx) pts.forEach((p, k) => s += `<circle class="vtx" data-k="${k}" cx="${p[0]}" cy="${p[1]}" r="14" fill="#fff" stroke="#5bb4ff" stroke-width="4" style="cursor:pointer"/>`);
  return s + '</svg>';
}

/* ===== 10-A 邊、角和頂點：點出每一個頂點，再數邊和角 ===== */
function u10A(st) {
  const plans = [pick(['tri', 'eq']), pick(['quad', 'rect', 'sq']), pick(['pent', 'hex'])];
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const sh = SHAPES[plans[r]], n = sh.pts.length; let got = 0;
    api.say(`這是${sh.name}。兩條邊碰在一起的尖尖地方叫做<b>頂點</b>，把每一個頂點都點一下！`, `這是${sh.name}。兩條邊碰在一起的尖尖地方叫做頂點，把每一個頂點都點一下！`);
    st.innerHTML = `${dots(r, plans.length)}<div class="readout" id="rd">點了 0 個頂點</div><div class="center">${polySVG(sh.pts, { vtx: true })}</div><div class="qvis" id="qv"></div><div class="kwrap" id="kw"></div>`;
    $$('.vtx', st).forEach(c => c.addEventListener('click', () => {
      if (c.dataset.on) return;
      c.dataset.on = 1; c.setAttribute('fill', '#ffc93c'); sfx('pop'); got++;
      $('#rd', st).textContent = `點了 ${got} 個頂點`;
      if (got === n) later(askSide, 700);
    }));
    function askSide() {
      api.say(`${sh.name}有 ${n} 個頂點。那它有幾條<b>邊</b>？`, `${sh.name}有 ${n} 個頂點。那它有幾條邊？`);
      keypad($('#kw', st), n, () => later(() => {
        api.say(`對！那${sh.name}有幾個<b>角</b>？`, `對！那${sh.name}有幾個角？`);
        keypad($('#kw', st), n, () => {
          $('#qv', st).innerHTML = `<div class="after">${sh.name}有 ${n} 個頂點、${n} 條邊、${n} 個角</div>`; speak($('#qv .after', st).textContent);
          r++; later(round, 2600);
        }, '每一個頂點的地方都有一個角！', '個');
      }, 800), '沿著圖形一條一條數直直的線！', '條');
    }
  }
  round();
}

/* ===== 10-B 認識圖形：正三角形、正方形、長方形，內部、外部和周界 ===== */
function u10B(st) {
  const nameRound = () => {
    const k = pick(['eq', 'sq', 'rect']), a = rand(3, 8), b = a + rand(2, 5);
    const lab = { eq: [a, a, a], sq: [a, a, a, a], rect: [b, a, b, a] }[k].map(v => `${v} 公分`);
    return { q: '這是什麼圖形？', vis: polySVG(SHAPES[k].pts, { labels: lab }), keep: true, opts: ['eq', 'sq', 'rect'].map(x => ({ h: SHAPES[x].name, ok: x === k })), hint: '數一數有幾條邊，再看邊是不是都一樣長！', after: { eq: '3 條邊一樣長，是正三角形', sq: '4 條邊一樣長，是正方形', rect: '上下兩條邊一樣長、左右兩條邊一樣長，是長方形' }[k] };
  };
  const placeRound = w => () => {
    const k = pick(['tri', 'sq', 'rect', 'pent']), pts = SHAPES[k].pts;
    const cx = Math.round(pts.reduce((s, p) => s + p[0], 0) / pts.length), cy = Math.round(pts.reduce((s, p) => s + p[1], 0) / pts.length);
    const e = rand(0, pts.length - 1), a = pts[e], b = pts[(e + 1) % pts.length];
    const dot = [[cx, cy + 10], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [226, 14]][w];
    const names = ['內部', '周界上', '外部'];
    return { q: '紅點在圖形的哪裡？', vis: polySVG(pts, { dot }), keep: true, opts: names.map((h, i) => ({ h, ok: i === w })), hint: '圍成圖形的邊是周界；被圍在裡面的是內部，在外面的是外部！', after: `紅點在${names[w]}` };
  };
  const ws = shuffle([0, 1, 2]);
  const rounds = [
    nameRound,
    () => { const a = rand(4, 9); return { q: `正方形的一條邊是 ${a} 公分，另外 3 條邊各是幾公分？`, vis: polySVG(SHAPES.sq.pts, { labels: [`${a} 公分`] }), ans: a, unit: '公分', hint: '正方形 4 條邊都一樣長！', after: `4 條邊都是 ${a} 公分` }; },
    () => { const a = rand(3, 6), b = a + rand(2, 5); return { q: `長方形上面的邊是 ${b} 公分，<b>下面</b>的邊是幾公分？`, sp: `長方形上面的邊是 ${b} 公分，下面的邊是幾公分？`, vis: polySVG(SHAPES.rect.pts, { labels: [`${b} 公分`, `${a} 公分`, '?'] }), ans: b, unit: '公分', hint: '長方形相對的兩條邊一樣長！', after: `上下兩條邊都是 ${b} 公分，左右兩條邊都是 ${a} 公分` }; },
    nameRound,
    placeRound(ws[0]), placeRound(ws[1])
  ];
  quiz(st, rounds);
}

/* ===== 10-C 周界和周長 ===== */
function u10C(st) {
  const sum = a => a.reduce((s, v) => s + v, 0);
  const rounds = [
    { q: '沿著圖形的周界走一圈，這一圈的長度叫做什麼？', vis: polySVG(SHAPES.quad.pts, { c: '#c9f2e3' }), keep: true, opts: [{ h: '周長', ok: true }, { h: '頂點', ok: false }, { h: '內部', ok: false }], hint: '周界一圈的長度叫做周長！' },
    () => { const s = [rand(4, 9), rand(4, 9), rand(4, 9)]; return { q: '這個三角形的周長是幾公分？', vis: polySVG(SHAPES.tri.pts, { labels: s.map(v => `${v} 公分`) }), ans: sum(s), unit: '公分', hint: '把 3 條邊的長度加起來！', after: `${s.join(' + ')} = ${sum(s)}（公分）` }; },
    () => { const a = rand(3, 6), b = a + rand(2, 5); return { q: '這個長方形的周長是幾公分？', vis: polySVG(SHAPES.rect.pts, { labels: [`${b} 公分`, `${a} 公分`] }), ans: 2 * (a + b), unit: '公分', hint: `長方形對邊一樣長：${b} + ${a} + ${b} + ${a}`, after: `${b} + ${a} + ${b} + ${a} = ${2 * (a + b)}（公分）` }; },
    () => { const a = rand(3, 9); return { q: `正方形一條邊 ${a} 公分，周長是幾公分？`, vis: polySVG(SHAPES.sq.pts, { labels: [`${a} 公分`] }), ans: 4 * a, unit: '公分', hint: `4 條邊都是 ${a} 公分：${a} + ${a} + ${a} + ${a}，也可以用 ${a} × 4`, after: `${a} × 4 = ${4 * a}（公分）` }; },
    () => { const w = rand(2, 5), h = rand(1, 3), cells = []; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) cells.push([i, j]); return { q: '每一小格的邊都是 1 公分，這個圖形的周長是幾公分？', vis: gridShape(cells, '#ffd1e3'), ans: 2 * (w + h), unit: '公分', hint: '沿著外面的邊，一段一段數，有幾個 1 公分？', after: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}（公分）` }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C], u9: [u9A, u9B, u9C], u10: [u10A, u10B, u10C] });
