'use strict';
/* 多位數的乘與除／垂直、平行與四邊形／同分母分數的加減與整數倍／概數 */

const comma = n => n.toLocaleString('en-US');
const cmpOpts = (a, b) => [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }];
const sign = (a, b) => a > b ? '＞' : a < b ? '＜' : '＝';
const yesNo = ok => [{ h: '對', ok }, { h: '不對', ok: !ok }];
/* 帶分數 html */
const MX = (w, n, d) => `${w}${F(n, d)}`;
/* 分母用質數，答案不會被約分（四下還沒學約分） */
const PD = () => pick([5, 7, 11, 13]);

/* ===== 多位數的乘與除 ===== */
/* A 面積模型：把乘數拆成整百、整十、個位，一塊一塊算再加起來 */
function bigA(st) {
  const mk = k => { const a = rand(121, 489); let b; do { b = k === 2 ? rand(12, 89) : rand(112, 249); } while (b % 10 === 0); return [a, b]; };
  const tasks = [mk(2), mk(2), mk(3)];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [a, b] = tasks[r], s = String(b);
    const parts = s.split('').map((d, i) => +d * 10 ** (s.length - 1 - i)).filter(x => x);
    api.say(`化石倉庫有 <b>${a}</b> 箱一排、共 <b>${b}</b> 排。把 ${b} 拆成 ${parts.join(' ＋ ')}，一塊一塊算！`, `${a}乘以${b}，把${b}拆開來算`);
    st.innerHTML = `${dots(r, tasks.length)}<table class="mtable"><tr><th>×</th><th>${a}</th></tr>${parts.map((p, i) => `<tr><th>${p}</th><td id="pp${i}">?</td></tr>`).join('')}<tr><th>合起來</th><td id="ppS">?</td></tr></table>
      <div class="readout" id="ask"></div><div class="kwrap" id="kw"></div>`;
    let k = 0;
    function step() {
      if (k < parts.length) {
        $('#ask', st).innerHTML = `${a} × ${parts[k]} ＝ ?`;
        keypad($('#kw', st), a * parts[k], () => { $('#pp' + k, st).textContent = comma(a * parts[k]); k++; later(step, 500); }, parts[k] >= 10 ? `先算 ${a} × ${String(parts[k])[0]}，再補上 ${String(parts[k]).length - 1} 個 0。` : `${a} × ${parts[k]} 一位一位乘，記得進位。`);
      } else {
        $('#ask', st).innerHTML = `${parts.map(p => comma(a * p)).join(' ＋ ')} ＝ ?`;
        keypad($('#kw', st), a * b, () => {
          $('#ppS', st).textContent = comma(a * b);
          $('#kw', st).innerHTML = `<div class="center"><span class="after">${a} × ${b} ＝ ${comma(a * b)}</span></div>`;
          speak(`${a}乘以${b}等於${a * b}`); r++; later(round, 2200);
        }, '把每一塊的積加起來。');
      }
    }
    step();
  }
  round();
}
/* B 末位是 0 的乘除 */
function bigB(st) {
  quiz(st, shuffle([
    () => { const x = rand(12, 89), y = rand(2, 9); return { q: `${comma(x * 100)} × ${y * 10} ＝ ?`, ans: x * y * 1000, hint: `先算 ${x} × ${y}，再在後面補上 3 個 0。`, after: `${x} × ${y} ＝ ${x * y}，補 3 個 0 → ${comma(x * y * 1000)}` }; },
    () => { const d = rand(2, 9), k = rand(11, 49); return { q: `${comma(k * d * 100)} ÷ ${d * 10} ＝ ?`, ans: k * 10, hint: `被除數和除數同時去掉 1 個 0：${k * d * 10} ÷ ${d}。`, after: `${comma(k * d * 100)} ÷ ${d * 10} ＝ ${k * d * 10} ÷ ${d} ＝ ${k * 10}` }; },
    () => { const d = rand(3, 9) * 100, q = rand(11, 29), rr = rand(1, d / 100 - 1) * 100, n = q * d + rr; return { q: `${comma(n)} ÷ ${d} ＝ ? … ?`, ans2: [q, rr], labels: ['商', '餘數'], hint: `劃掉 0 算 ${n / 100} ÷ ${d / 100}，但餘數要把劃掉的 0 補回來！`, after: `${comma(n)} ÷ ${d} ＝ ${q} … ${rr}（驗算：${d} × ${q} ＋ ${rr} ＝ ${comma(n)}）` }; },
    () => { const a = pick([305, 407, 509, 608, 704, 806]), b = rand(13, 48); return { q: `${a} × ${b} ＝ ?`, ans: a * b, hint: `十位是 0，乘的時候也要佔一位，不要漏掉。`, after: `${a} × ${b} ＝ ${comma(a * b)}` }; },
    () => { const a = rand(1201, 4999), b = rand(21, 99), p = a * b, dg = String(p).length; return { q: `${comma(a)} × ${b} 的積是幾位數？`, opts: [5, 6, 7].map(n => ({ h: `${n} 位數`, ok: n === dg })), hint: `先估一估：大約 ${Math.round(a / 1000)}000 × ${Math.round(b / 10)}0。`, after: `${comma(a)} × ${b} ＝ ${comma(p)}，是 ${dg} 位數` }; },
    () => { const d = rand(21, 89), q = rand(102, 109), n = d * q; return { q: `${comma(n)} ÷ ${d} ＝ ?`, ans: q, hint: '商的十位不夠商 1 的時候，要記得寫 0。', after: `${comma(n)} ÷ ${d} ＝ ${q}（商的十位是 0）` }; }
  ]));
}
/* C 化石運送應用題（列式小幫手） */
function bigC(st) {
  quiz(st, shuffle([
    () => { const n = rand(105, 360), m = rand(12, 65); return { q: `每箱裝 ${n} 塊化石，${m} 箱共有幾塊？`, eq: `${n} × ${m}`, ans: n * m, unit: '塊', hint: '每箱一樣多，有好幾箱，用乘法。' }; },
    () => { const d = rand(12, 48), k = rand(21, 98); return { q: `${comma(d * k)} 公斤的岩石平分給 ${d} 輛卡車載，每輛載幾公斤？`, eq: `${d * k} ÷ ${d}`, ans: k, unit: '公斤', hint: '平分，用除法。' }; },
    () => { const n = rand(125, 480), m = rand(102, 180); return { q: `恐龍博物館每天有 ${n} 位遊客，${m} 天共有幾位遊客？`, eq: `${n} × ${m}`, ans: n * m, unit: '位', hint: '每天一樣多，用乘法。' }; },
    () => { const p = pick([125, 135, 145, 165]), m = rand(12, 28), pay = (Math.floor(p * m / 1000) + 1) * 1000; return { q: `一張恐龍門票 ${p} 元，買 ${m} 張，付 ${comma(pay)} 元，找回幾元？`, eq: `${pay} − ${p} × ${m}`, alt: [`${pay} − (${p} × ${m})`], ans: pay - p * m, unit: '元', hint: `先算門票一共多少錢，再從 ${pay} 元扣掉。` }; },
    () => { const d = rand(105, 250), k = rand(12, 39); return { q: `${comma(d * k)} 張恐龍貼紙，每本貼 ${d} 張，可以貼滿幾本？`, eq: `${d * k} ÷ ${d}`, ans: k, unit: '本', hint: '每本一樣多，求有幾本，用除法。' }; },
    () => { const d = rand(24, 48), q = rand(21, 60), rr = rand(1, d - 1), n = d * q + rr; return { q: `${comma(n)} 顆恐龍蛋模型，每盒裝 ${d} 顆，可以裝滿幾盒？剩下幾顆？`, ans2: [q, rr], labels: ['盒', '顆'], hint: `${n} ÷ ${d}，商是裝滿的盒數，餘數是剩下的顆數。`, after: `${comma(n)} ÷ ${d} ＝ ${q} … ${rr}` }; }
  ]));
}
function bigD(st) {
  adv(st, [
    { q: '4700 ÷ 600 ＝ 7 … □，□ 是多少？', ans: 500, ex: '劃掉兩個 0 算 47 ÷ 6 ＝ 7 … 5，劃掉的 0 要補回餘數：餘數是 500。驗算 600 × 7 ＋ 500 ＝ 4700。', trap: '餘數寫成 5 是錯的，餘數一定要用原來的單位算。' },
    { q: '一個數乘以 30 等於 7200，這個數是多少？', eq: '7200 ÷ 30', ans: 240, ex: '□ × 30 ＝ 7200，□ ＝ 7200 ÷ 30 ＝ 240。', trap: '已知積和乘數，要用除法求另一個數，不是用乘法。' },
    { q: '一個數除以 24，商是 36，餘數是 15，這個數是多少？', eq: '24 × 36 + 15', alt: ['36 × 24 + 15'], ans: 879, ex: '被除數 ＝ 除數 × 商 ＋ 餘數 ＝ 24 × 36 ＋ 15 ＝ 864 ＋ 15 ＝ 879。', trap: '別忘了加上餘數。' },
    { q: '小龍算 305 × 46，寫成 305 × 4 ＝ 1220、305 × 6 ＝ 1830，再把 1220 ＋ 1830 ＝ 3050。他錯在哪裡？', opts: [{ h: '4 在十位，要算 305 × 40 ＝ 12200', ok: true }, { h: '305 × 6 算錯了', ok: false }, { h: '應該用減法', ok: false }, { h: '沒有錯', ok: false }], ex: '46 ＝ 40 ＋ 6，十位的 4 代表 40，305 × 40 ＝ 12200，12200 ＋ 1830 ＝ 14030。', trap: '直式乘十位數時，積要往左移一位（等於補一個 0）。' },
    { q: '790 位遊客搭接駁車，每輛最多坐 45 人，至少要幾輛車？', ans: 18, unit: '輛', ex: '790 ÷ 45 ＝ 17 … 25，剩下的 25 人還要再 1 輛，17 ＋ 1 ＝ 18 輛。', trap: '有餘數時，剩下的人也要坐車，所以要多 1 輛。' }
  ]);
}

/* ===== 垂直、平行與四邊形 ===== */
/* 依邊和角判斷四邊形種類（點已依繞圈順序排好） */
function quadKind(p) {
  const v = p.map((a, i) => { const b = p[(i + 1) % 4]; return [b[0] - a[0], b[1] - a[1]]; });
  const cr = (a, b) => a[0] * b[1] - a[1] * b[0], dt = (a, b) => a[0] * b[0] + a[1] * b[1], L = a => dt(a, a);
  for (let i = 0; i < 4; i++) if (cr(v[i], v[(i + 1) % 4]) === 0) return 'none';
  const s = Math.sign(cr(v[0], v[1])); if (![1, 2, 3].every(i => Math.sign(cr(v[i], v[(i + 1) % 4])) === s)) return 'concave';
  const p1 = cr(v[0], v[2]) === 0, p2 = cr(v[1], v[3]) === 0;
  if (p1 && p2) { const eq = v.every(x => L(x) === L(v[0])), rt = dt(v[0], v[1]) === 0; return eq && rt ? 'square' : rt ? 'rect' : eq ? 'rhombus' : 'para'; }
  return p1 || p2 ? 'trap' : 'quad';
}
const QK = { square: '正方形', rect: '長方形', rhombus: '菱形', para: '平行四邊形', trap: '梯形', quad: '一般的四邊形' };
function quadA(st) {
  const tasks = shuffle(['square', 'rect', 'rhombus', 'para', 'trap']).slice(0, 4);
  const ask = { square: '正方形', rect: '長方形（不是正方形）', rhombus: '菱形（不是正方形，四個角都不是直角）', para: '平行四邊形（沒有直角，而且四個邊不是都一樣長）', trap: '梯形（只有一組對邊平行）' };
  const why = { square: '四個邊一樣長，四個角都是直角。', rect: '兩組對邊平行，四個角都是直角。', rhombus: '四個邊一樣長，兩組對邊平行。', para: '兩組對邊都平行。', trap: '只有一組對邊平行。' };
  const G = 7, U = 46;
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const t = tasks[r]; let sel = [];
    api.say(`在方格點上點 4 個點，圍出一個<b>${ask[t]}</b>。`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center"><svg class="svgbox dotgrid" viewBox="0 0 ${G * U} ${G * U}" width="${G * U}"><g id="ln"></g>${Array.from({ length: G * G }, (_, i) => `<circle class="pt" data-x="${i % G}" data-y="${Math.floor(i / G)}" cx="${(i % G) * U + U / 2}" cy="${Math.floor(i / G) * U + U / 2}" r="10"/>`).join('')}</svg></div>
      <div class="readout" id="info">已選 0 個點</div><div class="center"><button type="button" class="btn ghost" id="clr">🧹 重來</button> <button type="button" class="btn gold" id="okb">圍好了！</button></div>`;
    const sorted = () => { const cx = sel.reduce((s, q) => s + q[0], 0) / 4, cy = sel.reduce((s, q) => s + q[1], 0) / 4; return sel.slice().sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx)); };
    const draw = () => {
      $$('.pt', st).forEach(c => c.classList.toggle('on', sel.some(q => q[0] === +c.dataset.x && q[1] === +c.dataset.y)));
      $('#ln', st).innerHTML = sel.length === 4 ? `<polygon points="${sorted().map(q => `${q[0] * U + U / 2},${q[1] * U + U / 2}`).join(' ')}" fill="rgba(240,138,36,.3)" stroke="#d0482a" stroke-width="4"/>` : '';
      $('#info', st).textContent = `已選 ${sel.length} 個點`;
    };
    $$('.pt', st).forEach(c => c.onclick = () => {
      if ($('#okb', st).disabled) return;
      const x = +c.dataset.x, y = +c.dataset.y, k = sel.findIndex(q => q[0] === x && q[1] === y);
      if (k >= 0) sel.splice(k, 1); else if (sel.length < 4) sel.push([x, y]); else return toast('已經有 4 個點了，先點一下取消一個點。');
      sfx('tap'); draw();
    });
    $('#clr', st).onclick = () => { if ($('#okb', st).disabled) return; sel = []; draw(); };
    $('#okb', st).onclick = () => {
      if (sel.length < 4) return toast('要點滿 4 個點喔！');
      const k = quadKind(sorted());
      if (k === t) { $('#okb', st).disabled = true; api.ok('圍對了！'); $('#info', st).innerHTML = `<span class="after">這是${QK[t]}：${why[t]}</span>`; speak(`這是${QK[t]}。${why[t]}`); r++; later(round, 2600); return; }
      const said = k === 'none' || k === 'concave' ? '圍不出四邊形' : QK[k];
      api.bad(k === 'none' ? '有 3 個點在同一條直線上，圍不出四邊形喔！' : k === 'concave' ? '這個圖形有一個角凹進去了，換個點試試。' : `你圍出來的是${QK[k]}，再看看${QK[t]}的特徵：${why[t]}`, said, ask[t]);
    };
    draw();
  }
  round();
}
/* 四條直線：a、b 平行（水平），c 和 a、b 垂直，d 是斜線 */
const LINES_SVG = `<svg class="svgbox" viewBox="0 0 320 220" width="320"><g stroke-width="4" stroke-linecap="round">
  <line x1="20" y1="50" x2="300" y2="50" stroke="#3b8f4e"/><line x1="20" y1="160" x2="300" y2="160" stroke="#3a6ea5"/>
  <line x1="110" y1="15" x2="110" y2="205" stroke="#d0482a"/><line x1="170" y1="205" x2="290" y2="15" stroke="#7a5aa8"/></g>
  <g font-size="22" font-weight="900"><text x="22" y="42" fill="#3b8f4e">a</text><text x="22" y="152" fill="#3a6ea5">b</text><text x="116" y="30" fill="#d0482a">c</text><text x="270" y="40" fill="#7a5aa8">d</text></g>
  <path d="M110,60 h10 v-10" fill="none" stroke="#2c2a1a" stroke-width="2"/><path d="M110,170 h10 v-10" fill="none" stroke="#2c2a1a" stroke-width="2"/></svg>`;
function quadB(st) {
  quiz(st, shuffle([
    { q: '看圖，哪兩條直線互相<b>平行</b>？', vis: LINES_SVG, opts: [{ h: 'a 和 b', ok: true }, { h: 'a 和 c', ok: false }, { h: 'c 和 d', ok: false }], hint: '平行線永遠不會相交，兩線之間的距離處處相等。' },
    { q: '看圖，和直線 a <b>互相垂直</b>的是哪一條？', vis: LINES_SVG, opts: [{ h: 'c', ok: true }, { h: 'b', ok: false }, { h: 'd', ok: false }], hint: '垂直的兩條線相交成直角（90 度）。' },
    { q: '兩條平行線之間的垂直線段，長度都一樣。', opts: yesNo(true), hint: '平行線之間的距離處處相等。' },
    { q: '梯形有幾組對邊互相平行？', opts: [{ h: '1 組', ok: true }, { h: '2 組', ok: false }, { h: '0 組', ok: false }], hint: '梯形只有一組對邊平行。' },
    { q: '一個四邊形有幾條對角線？', opts: numOpts(2, [1, 4, 3]), hint: '對角線是連接不相鄰兩個頂點的線段。' },
    { q: '哪一種四邊形的兩條對角線<b>一樣長而且互相垂直</b>？', opts: [{ h: '正方形', ok: true }, { h: '長方形', ok: false }, { h: '菱形', ok: false }, { h: '梯形', ok: false }], hint: '長方形對角線一樣長但不一定垂直；菱形互相垂直但不一定一樣長。' },
    { q: '菱形的兩條對角線一定互相垂直。', opts: yesNo(true), hint: '菱形四個邊一樣長，對角線會互相垂直。' },
    { q: '平行四邊形的兩條對角線一定一樣長。', opts: yesNo(false), hint: '只有長方形、正方形的對角線一樣長；一般的平行四邊形不一樣長。' }
  ]).slice(0, 6));
}
function quadC(st) {
  quiz(st, shuffle([
    () => { const a = rand(55, 80); return { q: `平行四邊形有一個角是 ${a} 度，它的<b>對角</b>是幾度？`, ans: a, unit: '度', hint: '平行四邊形的兩組對角一樣大。', after: `對角相等，也是 ${a} 度` }; },
    () => { const s = rand(6, 15); return { q: `一個菱形的周長是 ${s * 4} 公分，它的邊長是幾公分？`, eq: `${s * 4} ÷ 4`, ans: s, unit: '公分', hint: '菱形四個邊一樣長。' }; },
    () => { const a = rand(7, 15), b = rand(3, a - 1); return { q: `平行四邊形的兩個鄰邊分別是 ${a} 公分和 ${b} 公分，周長是幾公分？`, eq: `(${a} + ${b}) × 2`, alt: [`${a} + ${b} + ${a} + ${b}`, `${a} × 2 + ${b} × 2`], ans: (a + b) * 2, unit: '公分', hint: '平行四邊形的對邊一樣長，有兩組。' }; },
    () => { const d = rand(8, 16); return { q: `長方形的一條對角線長 ${d} 公分，另一條對角線長幾公分？`, ans: d, unit: '公分', hint: '長方形的兩條對角線一樣長。', after: `一樣是 ${d} 公分` }; },
    { q: '兩條直線都和直線 L 互相垂直，這兩條直線的關係是？', opts: [{ h: '互相平行', ok: true }, { h: '互相垂直', ok: false }, { h: '一定相交', ok: false }], hint: '和同一條直線垂直的兩條直線，會互相平行。' },
    { q: '只有一組對邊平行的四邊形叫做什麼？', opts: [{ h: '梯形', ok: true }, { h: '平行四邊形', ok: false }, { h: '菱形', ok: false }], hint: '平行四邊形有兩組對邊平行。' },
    () => { const s = rand(5, 12); return { q: `正方形的邊長是 ${s} 公分，它的兩條對角線相交成幾度？`, ans: 90, unit: '度', hint: '正方形的對角線互相垂直。', after: '互相垂直，是 90 度' }; }
  ]).slice(0, 6));
}
function quadD(st) {
  adv(st, [
    { q: '平行四邊形 ABCD 的周長是 30 公分，AB 邊長 9 公分，BC 邊長幾公分？', eq: '30 ÷ 2 − 9', alt: ['(30 − 9 × 2) ÷ 2', '(30 − 9 − 9) ÷ 2'], ans: 6, unit: '公分', ex: '周長的一半是一組鄰邊的和：30 ÷ 2 ＝ 15，15 − 9 ＝ 6 公分。', trap: '不是 30 − 9 ＝ 21，周長裡有兩個 AB 和兩個 BC。' },
    { q: '正方形的兩條對角線把它分成 4 個三角形，對角線相交的地方，每個角是幾度？', ans: 90, unit: '度', ex: '正方形的兩條對角線互相垂直，所以相交處的 4 個角都是 90 度。', trap: '長方形的對角線不一定互相垂直，正方形和菱形才一定垂直。' },
    { q: '下面哪一個敘述是<b>錯誤</b>的？', opts: [{ h: '平行四邊形的兩條對角線一樣長', ok: true }, { h: '菱形的四個邊一樣長', ok: false }, { h: '長方形的兩條對角線一樣長', ok: false }, { h: '梯形只有一組對邊平行', ok: false }], ex: '一般的平行四邊形，兩條對角線不一樣長；只有長方形和正方形的對角線一樣長。', trap: '題目問「錯誤」的，要選說錯的那一個。' },
    { q: '直線 a 和 b 互相平行，直線 c 和 a 互相垂直。c 和 b 的關係是？', vis: LINES_SVG, opts: [{ h: '互相垂直', ok: true }, { h: '互相平行', ok: false }, { h: '沒有關係', ok: false }], ex: 'c 和 a 垂直，b 和 a 平行，所以 c 也和 b 垂直（圖中 c 和 b 也相交成直角）。', trap: '不要以為和 a 垂直的線就會和 b 平行。' },
    { q: '直線 a 和 b 平行，兩線的距離是 3 公分。從 a 上任意一點畫到 b 的垂直線段長幾公分？', ans: 3, unit: '公分', ex: '平行線之間的距離處處相等，所以任意一點的垂直線段都是 3 公分。', trap: '要畫「垂直」線段才是距離，斜斜畫的線段會比較長。' }
  ]);
}

/* ===== 同分母分數的加減與整數倍 ===== */
function faddA(st) {
  const mk = kind => {
    const d = pick([5, 7, 8, 9]);
    if (kind === 'add') { const a = rand(1, d - 3), b = rand(1, d - a - 1); return { kind, d, a, b, bars: 1 }; }
    if (kind === 'big') { const a = rand(2, d - 1), b = rand(d - a + 1, d - 1); return { kind, d, a, b, bars: 2 }; }
    const a = rand(3, d - 1), b = rand(1, a - 1); return { kind, d, a, b, bars: 1 };
  };
  const tasks = [mk('add'), mk('sub'), mk('big')];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { kind, d, a, b, bars } = tasks[r], add = kind !== 'sub', res = add ? a + b : a - b;
    api.say(add ? `孵化室的蛋殼已經塗了 ${F(a, d)}，再塗 ${F(b, d)}。點格子把 ${F(b, d)} 塗上去！` : `蛋殼塗了 ${F(a, d)}，被恐龍寶寶啄掉 ${F(b, d)}。點已塗的格子把 ${F(b, d)} 去掉！`, add ? `${d}分之${a}加${d}分之${b}` : `${d}分之${a}減${d}分之${b}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="fbars">${Array.from({ length: bars }, (_, k) => `<div class="fbar">${Array.from({ length: d }, (_, i) => `<div class="seg${k * d + i < a ? ' on' : ''}" data-i="${k * d + i}"></div>`).join('')}</div>`).join('')}</div>
      <div class="readout">${bars > 1 ? '每一條是 1 個整體。' : ''}現在塗了 <span id="cnt">${a}</span> 格（每格 ${F(1, d)}）</div>
      <div class="center"><button class="btn gold" id="okb" type="button">好了！</button></div><div class="kwrap" id="kw"></div>`;
    const segs = $$('.seg', st);
    segs.forEach(s => s.onclick = () => {
      if ($('#okb', st).disabled) return;
      const i = +s.dataset.i;
      if (add && i < a) return toast('這格原本就塗好了，塗後面空白的格子。');
      if (!add && i >= a) return toast('要去掉的是已經塗色的格子。');
      s.classList.toggle(add ? 'on' : 'x'); if (!add) s.classList.toggle('on'); sfx('tap');
      $('#cnt', st).textContent = segs.filter(x => x.classList.contains('on')).length;
    });
    $('#okb', st).onclick = () => {
      const n = segs.filter(x => x.classList.contains('on')).length;
      if (n !== res) return api.bad(add ? `要再塗 ${b} 格喔！` : `要去掉 ${b} 格喔！`, `塗了 ${n} 格`, `${res} 格`);
      $('#okb', st).disabled = true; api.ok('塗對了！');
      api.say(`${F(a, d)} ${add ? '＋' : '−'} ${F(b, d)} ＝ ?（${res > d ? '用假分數回答' : '用分數回答'}）`);
      fracpad($('#kw', st), [res, d], () => {
        $('#kw', st).innerHTML = `<div class="center"><span class="after">${F(a, d)} ${add ? '＋' : '−'} ${F(b, d)} ＝ ${F(res, d)}${res > d ? ` ＝ ${MX(Math.floor(res / d), res % d, d)}` : ''}</span></div>`;
        speak('分母不變，分子相' + (add ? '加' : '減')); r++; later(round, 2400);
      }, `分母不變，分子 ${a} ${add ? '＋' : '−'} ${b}。`);
    };
  }
  round();
}
function faddB(st) {
  quiz(st, shuffle([
    () => { const d = PD(), a = rand(1, d - 2), b = rand(1, d - a - 1); return { q: `${F(a, d)} ＋ ${F(b, d)} ＝ ?`, frac: [a + b, d], hint: '同分母相加，分母不變，分子相加。', after: `${F(a, d)} ＋ ${F(b, d)} ＝ ${F(a + b, d)}` }; },
    () => { const d = PD(), a = rand(2, d - 1), b = rand(d - a + 1, d - 1); return { q: `${F(a, d)} ＋ ${F(b, d)} ＝ ?（用假分數回答）`, frac: [a + b, d], hint: '分母不變，分子相加；分子比分母大也沒關係。', after: `${F(a + b, d)} ＝ ${MX(1, a + b - d, d)}` }; },
    () => { const d = PD(), a = rand(1, d - 1); return { q: `1 − ${F(a, d)} ＝ ?`, frac: [d - a, d], hint: `1 ＝ ${d}/${d}，再減。`, after: `${F(d, d)} − ${F(a, d)} ＝ ${F(d - a, d)}` }; },
    () => { const d = PD(), w1 = rand(1, 3), w2 = rand(1, 3), a = rand(1, d - 2), b = rand(1, d - a - 1); return { q: `${MX(w1, a, d)} ＋ ${MX(w2, b, d)} ＝ ? 又 ?/${d}`, ans2: [w1 + w2, a + b], labels: ['整數', `分子（分母 ${d}）`], hint: '整數加整數，分數加分數。', after: `${MX(w1, a, d)} ＋ ${MX(w2, b, d)} ＝ ${MX(w1 + w2, a + b, d)}` }; },
    () => { const d = PD(), w1 = rand(3, 5), w2 = rand(1, w1 - 2), a = rand(1, d - 2), b = rand(a + 1, d - 1), n = (w1 * d + a) - (w2 * d + b); return { q: `${MX(w1, a, d)} − ${MX(w2, b, d)} ＝ ? 又 ?/${d}`, ans2: [Math.floor(n / d), n % d], labels: ['整數', `分子（分母 ${d}）`], hint: `${a}/${d} 不夠減 ${b}/${d}，從整數借 1 ＝ ${d}/${d}。`, after: `${MX(w1, a, d)} − ${MX(w2, b, d)} ＝ ${MX(w1 - 1, a + d, d)} − ${MX(w2, b, d)} ＝ ${MX(Math.floor(n / d), n % d, d)}` }; },
    () => { const d = PD(), w = rand(2, 4), a = rand(1, d - 1), n = w * d + a; return { q: `${F(n, d)} 化成帶分數是 ? 又 ?/${d}`, ans2: [w, a], labels: ['整數', `分子（分母 ${d}）`], hint: `${n} 裡面有幾個 ${d}？剩下的就是分子。`, after: `${n} ÷ ${d} ＝ ${w} … ${a}，${F(n, d)} ＝ ${MX(w, a, d)}` }; },
    () => { const d = PD(), a = rand(1, d - 1), b = rand(1, d - 1); return a === b ? null : { q: `${F(a, d)} ○ ${F(b, d)}`, keep: true, opts: cmpOpts(a, b), hint: '分母一樣，分子大的分數比較大。', after: `${F(a, d)} ${sign(a, b)} ${F(b, d)}` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })).slice(0, 6));
}
function faddC(st) {
  quiz(st, shuffle([
    () => { const d = PD(), a = rand(1, 3), n = rand(2, Math.floor((d - 1) / a)); return { q: `${F(a, d)} × ${n} ＝ ?`, frac: [a * n, d], hint: `${n} 個 ${a}/${d}，分母不變，分子 × ${n}。`, after: `${F(a, d)} × ${n} ＝ ${F(a * n, d)}` }; },
    () => { const d = pick([7, 11, 13]), a = rand(2, 5), n = rand(3, 8); return { q: `每隻小恐龍喝 ${F(a, d)} 公升的水，${n} 隻共喝幾公升？`, eq: `${a}/${d} × ${n}`, alt: [`${n} × ${a}/${d}`], frac: [a * n, d], ans: a * n / d, unit: '公升', hint: '每隻一樣多，有好幾隻，用乘法。' }; },
    () => { const d = PD(), a = rand(3, d - 1), b = rand(1, a - 1); return { q: `一條藤蔓長 ${F(a, d)} 公尺，剪掉 ${F(b, d)} 公尺，還剩幾公尺？`, eq: `${a}/${d} − ${b}/${d}`, frac: [a - b, d], ans: (a - b) / d, unit: '公尺', hint: '剪掉，用減法。' }; },
    () => { const d = PD(), a = rand(1, d - 2), b = rand(1, d - a - 1); return { q: `恐龍寶寶早上吃了 ${F(a, d)} 籃蕨葉，下午吃了 ${F(b, d)} 籃，一共吃了幾籃？`, eq: `${a}/${d} + ${b}/${d}`, frac: [a + b, d], ans: (a + b) / d, unit: '籃', hint: '合起來，用加法。' }; },
    () => { const d = PD(), w = 1, a = rand(1, Math.floor((d - 1) / 3)), n = 3, t = (w * d + a) * n; return { q: `${MX(w, a, d)} × ${n} ＝ ? 又 ?/${d}`, ans2: [Math.floor(t / d), t % d], labels: ['整數', `分子（分母 ${d}）`], hint: `整數部分 × ${n}，分數部分也 × ${n}。`, after: `${MX(w, a, d)} × ${n} ＝ ${MX(w * n, a * n, d)}` }; },
    () => { const d = pick([11, 13]), a = rand(2, 4), b = rand(2, 4); return { q: `1 整盒蛋糕，第一天吃 ${F(a, d)} 盒，第二天吃 ${F(b, d)} 盒，還剩幾盒？`, eq: `1 − ${a}/${d} − ${b}/${d}`, alt: [`1 − (${a}/${d} + ${b}/${d})`], frac: [d - a - b, d], ans: (d - a - b) / d, unit: '盒', hint: `1 盒 ＝ ${d}/${d} 盒，扣掉兩天吃的。` }; }
  ]));
}
function faddD(st) {
  adv(st, [
    { q: `${F(4, 9)} ＋ ${F(5, 9)} ＋ ${F(7, 9)} ＝ ?（用假分數回答）`, frac: [16, 9], ex: `分母不變，分子相加：4 ＋ 5 ＋ 7 ＝ 16，答案 ${F(16, 9)} ＝ ${MX(1, 7, 9)}。`, trap: '分母不能相加，寫成 16/27 是錯的。' },
    { q: `3 − ${MX(1, 2, 7)} ＝ ? 又 ?/7`, ans2: [1, 5], labels: ['整數', '分子（分母 7）'], ex: `3 ＝ ${MX(2, 7, 7)}，${MX(2, 7, 7)} − ${MX(1, 2, 7)} ＝ ${MX(1, 5, 7)}。`, trap: '3 − 1 ＝ 2 之後，還要再減 2/7，不是 2又2/7。' },
    { q: `□/8 ＋ ${F(3, 8)} ＝ ${MX(1, 1, 8)}，□ 是多少？`, ans: 6, ex: `${MX(1, 1, 8)} ＝ ${F(9, 8)}，9 − 3 ＝ 6，□ ＝ 6。`, trap: '要先把帶分數化成假分數再比，不是 1 − 3。' },
    { q: `${F(2, 5)} × 4 ○ 1`, keep: true, opts: cmpOpts(8, 5), ex: `${F(2, 5)} × 4 ＝ ${F(8, 5)}，比 ${F(5, 5)} ＝ 1 大。`, trap: '分數乘以整數，分母不變，不是 2/20。' },
    { q: '一瓶果汁有 2 公升，每天喝 3/7 公升，喝了 4 天，還剩幾公升？', eq: '2 − 3/7 × 4', alt: ['2 − (3/7 × 4)'], frac: [2, 7], ans: 2 / 7, unit: '公升', ex: `4 天喝 ${F(3, 7)} × 4 ＝ ${F(12, 7)} 公升，2 ＝ ${F(14, 7)}，${F(14, 7)} − ${F(12, 7)} ＝ ${F(2, 7)} 公升。`, trap: '要先算 4 天一共喝多少，再從 2 公升扣掉。' }
  ]);
}

/* ===== 概數 ===== */
function lineSVG(lo, hi, n) {
  const W = 340, x = v => 20 + (v - lo) / (hi - lo) * (W - 40);
  let t = ''; for (let k = 0; k <= 10; k++) { const v = lo + (hi - lo) * k / 10; t += `<line x1="${x(v)}" y1="60" x2="${x(v)}" y2="${k === 5 ? 44 : 50}" stroke="#2c2a1a" stroke-width="${k % 5 ? 1.5 : 3}"/>`; }
  return `<svg class="svgbox" viewBox="0 0 ${W} 110" width="${W}"><line x1="10" y1="60" x2="${W - 10}" y2="60" stroke="#2c2a1a" stroke-width="3"/>${t}
    <text x="${x(lo)}" y="90" font-size="16" font-weight="900" text-anchor="middle">${comma(lo)}</text><text x="${x(hi)}" y="90" font-size="16" font-weight="900" text-anchor="middle">${comma(hi)}</text>
    <text x="${x((lo + hi) / 2)}" y="34" font-size="12" text-anchor="middle" fill="#6f6a4c">一半</text>
    <circle cx="${x(n)}" cy="60" r="8" fill="#d0482a"/><text x="${x(n)}" y="${n < (lo + hi) / 2 ? 106 : 106}" font-size="15" font-weight="900" fill="#d0482a" text-anchor="middle">${comma(n)}</text></svg>`;
}
const PLACE = { 100: '百位', 1000: '千位', 10000: '萬位' };
const roundTo = (n, p) => Math.floor(n / p + 0.5) * p, floorTo = (n, p) => Math.floor(n / p) * p, ceilTo = (n, p) => Math.ceil(n / p) * p;
function apprA(st) {
  const mk = p => { const lo = rand(p === 100 ? 12 : p === 1000 ? 3 : 2, p === 100 ? 89 : 49) * p; let n; do { n = lo + rand(1, 99) * p / 100; } while (n === lo + p / 2 && Math.random() < .5); return { p, lo, n }; };
  const tasks = [mk(100), mk(100), mk(1000), mk(10000)];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { p, lo, n } = tasks[r], hi = lo + p, ans = roundTo(n, p);
    api.say(`火山測量站量到 <b>${comma(n)}</b>。它比較接近 ${comma(lo)} 還是 ${comma(hi)}？用<b>四捨五入法</b>取到${PLACE[p]}。`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center">${lineSVG(lo, hi, n)}</div><div class="opts" id="ops"></div>`;
    [lo, hi].forEach(v => $('#ops', st).appendChild(optBtn({ h: comma(v), ok: v === ans }, () => {
      $('#ops', st).insertAdjacentHTML('afterend', `<div class="center"><span class="after">看${PLACE[p / 10] || '十位'}的數字 ${Math.floor(n / (p / 10)) % 10}，${Math.floor(n / (p / 10)) % 10 >= 5 ? '5 以上進 1' : '4 以下捨去'} → ${comma(ans)}</span></div>`);
      speak(`四捨五入取到${PLACE[p]}是${ans}`); r++; later(round, 2400);
    }, `看${PLACE[p / 10] || '十位'}的數字：0～4 捨去，5～9 進 1。`)));
  }
  round();
}
function apprB(st) {
  quiz(st, shuffle([
    () => { const n = rand(10001, 99999); if (n % 1000 === 0) return null; return { q: `${comma(n)} 用<b>無條件捨去法</b>取到千位是多少？`, ans: floorTo(n, 1000), hint: '千位以下的數字全部當作 0。', after: `${comma(n)} → ${comma(floorTo(n, 1000))}` }; },
    () => { const k = rand(3, 89), n = k * 1000 + pick([1, 2, 3, 10, 20, 100]); return { q: `${comma(n)} 用<b>無條件進入法</b>取到千位是多少？`, ans: ceilTo(n, 1000), hint: '千位以下只要不是全部是 0，就要進 1。', after: `${comma(n)} → ${comma(ceilTo(n, 1000))}` }; },
    () => { const n = rand(100001, 999999); return { q: `${comma(n)} 用<b>四捨五入法</b>取到萬位是多少？`, ans: roundTo(n, 10000), hint: '看千位：0～4 捨去，5～9 進 1。', after: `${comma(n)} → ${comma(roundTo(n, 10000))}` }; },
    () => { const p = rand(1201, 4899); return { q: `買一台 ${comma(p)} 元的恐龍望遠鏡，要準備幾張千元鈔才<b>夠</b>付？要用哪一種方法？`, opts: [{ h: '無條件進入法', ok: true }, { h: '無條件捨去法', ok: false }, { h: '四捨五入法', ok: false }], hint: '錢不夠就買不到，不足 1000 的部分也要多一張。', after: `用無條件進入法：要 ${Math.ceil(p / 1000)} 張千元鈔` }; },
    () => { const n = rand(1201, 4899); return { q: `${comma(n)} 顆化石，每 100 顆裝一箱，可以裝滿幾箱？要用哪一種方法取到百位？`, opts: [{ h: '無條件捨去法', ok: true }, { h: '無條件進入法', ok: false }, { h: '四捨五入法', ok: false }], hint: '不滿 100 顆的不能算一箱。', after: `用無條件捨去法：${comma(floorTo(n, 100))} 顆，裝滿 ${Math.floor(n / 100)} 箱` }; },
    () => { const c = pick([3, 4, 5, 6, 7]) * 1000; const ok = c - rand(1, 499), w = [c - 500 - rand(1, 400), c + 500 + rand(1, 300), c + 500]; return { q: `哪一個數用四捨五入法取到千位是 ${comma(c)}？`, opts: [{ h: comma(ok), ok: true }, ...w.map(v => ({ h: comma(v), ok: false }))], hint: `取到千位是 ${c}，這個數要在 ${c - 500} 到 ${c + 499} 之間。` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function apprC(st) {
  quiz(st, shuffle([
    () => { const a = rand(301, 699), b = rand(201, 499); return { q: `${a} ＋ ${b} 先用四捨五入法取到百位，再估算，大約是多少？`, ans: roundTo(a, 100) + roundTo(b, 100), hint: '先把每個數取到百位，再相加。', after: `${roundTo(a, 100)} ＋ ${roundTo(b, 100)} ＝ ${roundTo(a, 100) + roundTo(b, 100)}` }; },
    () => { const c = rand(12, 89) * 100; return { q: `一個整數用四捨五入法取到百位是 ${comma(c)}，這個數<b>最大</b>是多少？`, ans: c + 49, hint: `比 ${c} 大的數，十位最大只能是 4。`, after: `最大是 ${comma(c + 49)}（${comma(c + 50)} 就會變成 ${comma(c + 100)}）` }; },
    () => { const c = rand(12, 89) * 100; return { q: `一個整數用四捨五入法取到百位是 ${comma(c)}，這個數<b>最小</b>是多少？`, ans: c - 50, hint: `比 ${c} 小的數，十位要是 5 以上才會進位。`, after: `最小是 ${comma(c - 50)}` }; },
    () => { const c = rand(3, 9) * 1000; return { q: `一個整數用無條件進入法取到千位是 ${comma(c)}，這個數<b>最小</b>是多少？`, ans: c - 999, hint: `${c - 1000} 本身不會進位，比它多 1 才會進到 ${c}。`, after: `最小是 ${comma(c - 999)}` }; },
    () => { const a = rand(21, 89), b = rand(21, 89); if (a % 10 === 5 || b % 10 === 5) return null; return { q: `${a} × ${b} 先用四捨五入法取到十位再估算，大約是多少？`, ans: roundTo(a, 10) * roundTo(b, 10), hint: '先取概數，再相乘。', after: `${roundTo(a, 10)} × ${roundTo(b, 10)} ＝ ${roundTo(a, 10) * roundTo(b, 10)}（實際是 ${a * b}）` }; },
    () => { const p = pick([198, 289, 312, 405, 498]), n = rand(3, 6); return { q: `一件恐龍 T 恤 ${p} 元，買 ${n} 件，先用四捨五入法取到百位估算，大約要多少元？`, ans: roundTo(p, 100) * n, unit: '元', hint: `${p} 大約是 ${roundTo(p, 100)}。`, after: `${roundTo(p, 100)} × ${n} ＝ ${roundTo(p, 100) * n} 元` }; }
  ].map(f => () => { let q; do { q = f(); } while (!q); return q; })));
}
function apprD(st) {
  adv(st, [
    { q: '哪一個數用四捨五入法取到萬位是 60000？', opts: [{ h: '55000', ok: true }, { h: '54999', ok: false }, { h: '65000', ok: false }, { h: '49999', ok: false }], ex: '取到萬位是 60000，要在 55000～64999 之間。55000 的千位是 5，進 1 變 60000。', trap: '65000 會變成 70000；54999 會變成 50000。' },
    { q: '用無條件捨去法取到百位得到 4200 的整數，一共有幾個？', ans: 100, unit: '個', ex: '4200、4201、……、4299，從 4200 到 4299 共 100 個。', trap: '4300 取到百位是 4300，不算在裡面；4200 本身要算。' },
    { q: '315 位學生搭遊覽車，每輛坐 40 人，至少要幾輛？', ans: 8, unit: '輛', ex: '315 ÷ 40 ＝ 7 … 35，剩下 35 人也要坐車，要 8 輛（就是用無條件進入法的想法）。', trap: '不能用四捨五入，剩下的人不能不坐車。' },
    { q: '39512 用四捨五入法取到千位是多少？', ans: 40000, ex: '看百位是 5，要進 1：39 個千進 1 變 40 個千，就是 40000。', trap: '進位後千位變成 0、萬位變成 4，不是 39000 也不是 391000。' },
    { q: '4499 ＋ 2499，<b>先</b>把兩個數用四捨五入法取到千位<b>再相加</b>，結果是多少？', ans: 6000, ex: '4499 → 4000，2499 → 2000，4000 ＋ 2000 ＝ 6000。', trap: '如果先相加 6998 再取概數會得到 7000，題目說要先取概數再算。' }
  ]);
}

Object.assign(LEVELS, {
  big: [bigA, bigB, bigC, bigD],
  quad: [quadA, quadB, quadC, quadD],
  fadd: [faddA, faddB, faddC, faddD],
  appr: [apprA, apprB, apprC, apprD]
});
