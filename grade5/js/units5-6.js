'use strict';
/* 第 5 單元 線對稱圖形 ／ 第 6 單元 異分母分數的加減 */

/* ===== 5-A 方格照鏡子：把另一半塗成線對稱圖形 ===== */
/* 在給定的一半裡隨機長出一塊貼著對稱軸的圖形 */
function halfShape(w, h, axisCol, dir) {
  const S = new Set(), k = (x, y) => `${x},${y}`;
  let x = axisCol, y = rand(1, h - 2); S.add(k(x, y));
  while (S.size < 8) {
    const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    if (dir < 0 ? nx > axisCol : nx < axisCol) continue;
    x = nx; y = ny; S.add(k(x, y));
  }
  return S;
}
function u5A(st) {
  const rounds = ['v', 'v', 'h'];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const t = rounds[r], C = 44;
    /* 一律用「左半邊」產生，水平軸時把 x、y 對調 */
    const W = 10, H = 6, gw = t === 'v' ? W : H, gh = t === 'v' ? H : W;
    const base = halfShape(W / 2, H, W / 2 - 1, -1);
    const given = new Set([...base].map(s => { const [x, y] = s.split(',').map(Number); return t === 'v' ? `${x},${y}` : `${y},${x}`; }));
    const want = new Set([...given].map(s => { const [x, y] = s.split(',').map(Number); return t === 'v' ? `${W - 1 - x},${y}` : `${x},${W - 1 - y}`; }));
    const mine = new Set();
    const inMine = (x, y) => t === 'v' ? x >= W / 2 : y >= W / 2;
    api.say(`紅線是<b>對稱軸</b>。把${t === 'v' ? '右' : '下'}半邊的格子塗色，讓整個圖形變成<b>線對稱圖形</b>！可以點一下或拖曳塗色，再點一次會擦掉。`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="qvis"><svg class="gridsvg" viewBox="0 0 ${gw * C + 10} ${gh * C + 10}" style="max-width:${gw * C + 10}px"><g class="cells"></g>
      ${t === 'v' ? `<line x1="${5 + W / 2 * C}" y1="0" x2="${5 + W / 2 * C}" y2="${gh * C + 10}" stroke="#ff6b6b" stroke-width="5" stroke-dasharray="10 6"/>` : `<line x1="0" y1="${5 + W / 2 * C}" x2="${gw * C + 10}" y2="${5 + W / 2 * C}" stroke="#ff6b6b" stroke-width="5" stroke-dasharray="10 6"/>`}</svg></div>
      <div class="center"><button type="button" class="btn ghost" id="clrB">全部擦掉</button> <button type="button" class="btn mint" id="okB">塗好了！</button></div>`;
    const g = $('.cells', st), svg = $('svg', st);
    const draw = () => {
      let h = '';
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
        const s = `${x},${y}`, f = given.has(s) ? '#a98bff' : mine.has(s) ? '#ffb3d1' : '#fff';
        h += `<rect x="${5 + x * C}" y="${5 + y * C}" width="${C}" height="${C}" fill="${f}" stroke="#d9d0e3" stroke-width="2"/>`;
      }
      g.innerHTML = h;
    };
    let mode = null;
    dragOn(svg, (px, py, rect) => {
      const x = Math.floor((px / rect.width * (gw * C + 10) - 5) / C), y = Math.floor((py / rect.height * (gh * C + 10) - 5) / C);
      if (x < 0 || y < 0 || x >= gw || y >= gh) return;
      if (!inMine(x, y)) { if (mode === null) toast('這一半已經畫好了，請塗另一半！'); mode = mode || 'none'; return; }
      const s = `${x},${y}`;
      if (mode === null || mode === 'none') mode = mine.has(s) ? 'off' : 'on';
      if (mode === 'on' && !mine.has(s)) { mine.add(s); sfx('tap'); draw(); }
      if (mode === 'off' && mine.has(s)) { mine.delete(s); draw(); }
    }, () => { mode = null; });
    $('#clrB', st).onclick = () => { mine.clear(); draw(); };
    $('#okB', st).onclick = () => {
      const miss = [...want].filter(s => !mine.has(s)).length, extra = [...mine].filter(s => !want.has(s)).length;
      if (!miss && !extra) {
        $$('button', st).forEach(b => b.disabled = true);
        api.ok('完成！沿著對稱軸對摺，兩邊會完全疊在一起。'); speak('沿著對稱軸對摺，兩邊完全重合，這就是線對稱圖形'); r++; later(round, 2600);
      } else api.bad(`還有 ${miss} 格沒塗、${extra} 格塗錯了。每一格到對稱軸的距離要一樣遠！`);
    };
    draw();
  }
  round();
}

/* ===== 5-B 對稱軸想一想 ===== */
const sv = inner => `<svg viewBox="0 0 120 100" width="110" height="92">${inner}</svg>`;
const SHAPES = {
  sq: sv('<rect x="25" y="15" width="70" height="70" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  rect: sv('<rect x="10" y="25" width="100" height="50" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  tri: sv('<polygon points="60,10 105,88 15,88" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  iso: sv('<polygon points="60,8 90,90 30,90" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  par: sv('<polygon points="35,20 110,20 85,80 10,80" fill="#ffd9e8" stroke="#4a3b5c" stroke-width="4"/>'),
  cir: sv('<circle cx="60" cy="50" r="40" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  kite: sv('<polygon points="60,6 92,38 60,94 28,38" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>')
};
function u5B(st) {
  quiz(st, [
    { q: '下面哪一個<b>不是</b>線對稱圖形？', opts: [{ h: SHAPES.par, ok: true }, { h: SHAPES.iso, ok: false, hint: '等腰三角形從頂點往下對摺，兩邊會重合。' }, { h: SHAPES.rect, ok: false, hint: '長方形左右對摺、上下對摺都會重合。' }, { h: SHAPES.kite, ok: false, hint: '箏形沿著直的那條對角線對摺會重合。' }], hint: '找一個怎麼摺都沒辦法完全重合的圖形。' },
    () => { const [k, n, name] = pick([['sq', 4, '正方形'], ['rect', 2, '長方形'], ['tri', 3, '正三角形'], ['iso', 1, '等腰三角形']]); return { q: `${name}有幾條對稱軸？`, vis: SHAPES[k], opts: numOpts(n, [0, 1, 2, 3, 4, 6].filter(x => x !== n).slice(0, 3), '條'), hint: '想一想：有幾種摺法能讓兩邊完全重合？' }; },
    { q: '圓有幾條對稱軸？', vis: SHAPES.cir, opts: [{ h: '無數條', ok: true }, { h: '1 條', ok: false, hint: '通過圓心的直線都可以對摺喔！' }, { h: '4 條', ok: false, hint: '不只 4 條，通過圓心的每一條直線都是。' }], keep: true },
    { q: '線對稱圖形上的兩個<b>對稱點</b>，連起來的線和對稱軸是什麼關係？', opts: [{ h: '互相垂直', ok: true }, { h: '互相平行', ok: false, hint: '對稱點連線會「穿過」對稱軸，不會平行。' }, { h: '沒有關係', ok: false, hint: '對摺時對稱點會疊在一起，連線一定和對稱軸垂直。' }], keep: true },
    { q: '線對稱圖形的<b>對稱邊</b>和<b>對稱角</b>，哪一句是對的？', opts: [{ h: '對稱邊一樣長，對稱角一樣大', ok: true }, { h: '對稱邊一樣長，對稱角不一定一樣大', ok: false, hint: '對摺後角也會疊在一起，所以一樣大。' }, { h: '都不一定相等', ok: false, hint: '對摺後完全重合，所以邊和角都相等。' }] }
  ]);
}

/* ===== 5-C 對稱點挑戰 ===== */
function kiteSVG(a, b, ang) {
  return `<svg class="pic" viewBox="0 0 260 230" width="240"><polygon points="130,15 200,85 130,215 60,85" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/><line x1="130" y1="5" x2="130" y2="225" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="8 5"/>
    <text x="130" y="12" text-anchor="middle" font-size="16" font-weight="900">A</text><text x="210" y="90" font-size="16" font-weight="900">B</text><text x="130" y="230" text-anchor="middle" font-size="16" font-weight="900">C</text><text x="40" y="90" font-size="16" font-weight="900">D</text>
    ${a ? `<text x="172" y="44" font-size="16" font-weight="900" fill="#e5508f">${a}</text><text x="175" y="160" font-size="16" font-weight="900" fill="#e5508f">${b}</text>` : ''}${ang ? `<text x="168" y="92" font-size="16" font-weight="900" fill="#1fa979">${ang}°</text>` : ''}</svg>`;
}
function u5C(st) {
  quiz(st, [
    () => { const a = rand(4, 9), b = rand(a + 2, 14); return { q: `四邊形 ABCD 是線對稱圖形，對稱軸是 AC。AB = ${a} 公分、BC = ${b} 公分，周長是幾公分？`, vis: kiteSVG(`${a}`, `${b}`), ans: 2 * (a + b), unit: '公分', hint: 'AD 和 AB 是對稱邊、CD 和 CB 是對稱邊，一樣長！', after: `(${a} + ${b}) × 2 = ${2 * (a + b)}（公分）` }; },
    () => { const x = rand(8, 13) * 10; return { q: `四邊形 ABCD 是線對稱圖形，對稱軸是 AC。角 B 是 ${x}°，角 D 是幾度？`, vis: kiteSVG('', '', x), ans: x, unit: '度', hint: '角 B 和角 D 是對稱角。', after: `對稱角一樣大，角 D = ${x}°` }; },
    () => { const k = rand(2, 7); return { q: `方格紙上，A 點在對稱軸左邊 ${k} 格。A 的對稱點 A′ 和 A 相距幾格？`, ans: 2 * k, unit: '格', hint: 'A′ 在對稱軸右邊，離對稱軸也是一樣遠。', after: `${k} + ${k} = ${2 * k}（格）` }; },
    () => { const n = pick([5, 6, 8]); return { q: `正${PNAME[n]}有幾條對稱軸？`, vis: polySVG(n, []).replace(/class="vx"/g, ''), ans: n, unit: '條', hint: '正多邊形有幾條邊，就有幾條對稱軸。', after: `正${PNAME[n]}有 ${n} 條對稱軸` }; },
    () => { const d = rand(3, 9); return { q: `A 點到對稱軸的距離是 ${d} 公分，A 的對稱點 A′ 到對稱軸是幾公分？`, ans: d, unit: '公分', hint: '對稱點到對稱軸的距離相等。' }; },
    () => { const L = rand(4, 9) * 2; return { q: `線對稱圖形中，一組對稱點 P 和 P′ 相距 ${L} 公分。P 到對稱軸是幾公分？`, ans: L / 2, unit: '公分', hint: '對稱軸把對稱點的連線分成一樣長的兩段。', after: `${L} ÷ 2 = ${L / 2}（公分）` }; }
  ]);
}

/* ===== 分數小工具 ===== */
const frAns = (x, y) => { [x, y] = red(x, y); return y === 1 ? x : `${x}/${y}`; };

/* ===== 6-A 找一把共同的尺：選公分母，兩個分數都量得剛好 ===== */
function u6A(st) {
  const P = shuffle([[1, 2, 1, 3, '+'], [1, 4, 1, 6, '+'], [2, 3, 1, 4, '+'], [1, 2, 2, 5, '+']]).slice(0, 2).concat([pick([[3, 4, 1, 6, '−'], [5, 6, 1, 4, '−'], [2, 3, 1, 2, '−']])]);
  let r = 0;
  function round() {
    if (r >= P.length) return api.finish();
    const [a, b, c, d, op] = P[r], L = lcm(b, d);
    const cand = [...new Set([b, d, L, b + d, L * 2 <= 24 ? L * 2 : L + 1, Math.max(b, d) + 1])].filter(x => x <= 24).sort((x, y) => x - y);
    const x = a * L / b, y = c * L / d, rx = op === '+' ? x + y : x - y;
    api.say(`${fr(a, b)} ${op} ${fr(c, d)} = ？分母不一樣不能直接${op === '+' ? '加' : '減'}。選一把「每格是幾分之一」的尺，讓兩條分數條都<b>量得剛好</b>！`, `${b}分之${a} ${op === '+' ? '加' : '減'} ${d}分之${c}，選一把尺，讓兩條都量得剛好`);
    st.innerHTML = `${dots(r, P.length)}<div class="flabel">${fr(a, b)} ${op} ${fr(c, d)}</div><div id="bars">${fbar(a, b)}${fbar(c, d, 'b')}</div>
      <div class="lbl" style="text-align:center">選一把尺：每格是</div><div class="btns">${cand.map(k => `<button type="button" class="btn ghost" data-k="${k}">${fr(1, k)}</button>`).join('')}</div><div class="kwrap"></div>`;
    $$('[data-k]', st).forEach(btn => btn.onclick = () => {
      const D = +btn.dataset.k;
      if (D % b || D % d) { btn.disabled = true; return api.bad(`用 ${fr(1, D)} 的尺量 ${D % b ? fr(1, b) : fr(1, d)}，量不剛好！分母要是 ${b} 和 ${d} 的公倍數。`); }
      $$('[data-k]', st).forEach(z => z.disabled = true); sfx('ok');
      const X = a * D / b, Y = c * D / d;
      $('#bars', st).innerHTML = `${fbar(X, D)}${fbar(Y, D, 'b')}<div class="flabel">${fr(X, D)} ${op} ${fr(Y, D)} = ？</div>`;
      api.say(`量好了！${fr(a, b)} = ${fr(X, D)}，${fr(c, d)} = ${fr(Y, D)}。答案是多少？（要約成最簡分數）`, `${b}分之${a}等於${D}分之${X}，${d}分之${c}等於${D}分之${Y}，答案是多少`);
      keypad($('.kwrap', st), frAns(rx, L), () => { const m = `${fr(a, b)} ${op} ${fr(c, d)} = ${frm(rx, L)}`; toast(m); speak(spText(m)); r++; later(round, 2600); }, '分母一樣了，分子直接算，再約分！', '', ['_', '/']);
    });
  }
  round();
}

/* ===== 6-B 分數加減想一想 ===== */
function u6B(st) {
  quiz(st, [
    { q: `小明算 ${fr(1, 2)} + ${fr(1, 3)} = ${fr(2, 5)}，對嗎？`, vis: `${fbar(1, 2)}${fbar(1, 3, 'b')}`, opts: [{ h: '不對', ok: true }, { h: '對', ok: false, hint: `${fr(1, 2)} 已經比 ${fr(2, 5)} 大了，加起來怎麼可能更小？` }], keep: true, hint: '分母不同時，不能把分子加分子、分母加分母！', after: `${fr(1, 2)} + ${fr(1, 3)} = ${fr(3, 6)} + ${fr(2, 6)} = ${fr(5, 6)}` },
    { q: `計算 ${fr(1, 4)} + ${fr(1, 6)}，第一步要先做什麼？`, opts: [{ h: '通分', ok: true }, { h: '分子、分母直接相加', ok: false, hint: '分母不同的分數，每一份大小不一樣，不能直接加。' }, { h: '約分', ok: false, hint: `${fr(1, 4)} 和 ${fr(1, 6)} 已經是最簡分數了。` }] },
    { q: `${fr(2, 3)} − ${fr(1, 2)} = ？`, opts: [{ h: fr(1, 6), ok: true }, { h: '1', ok: false, hint: '分子減分子、分母減分母是錯的！' }, { h: fr(3, 6), ok: false, hint: `通分後是 ${fr(4, 6)} − ${fr(3, 6)}，再算一次！` }], hint: '通分成分母 6。', after: `${fr(4, 6)} − ${fr(3, 6)} = ${fr(1, 6)}` },
    { q: `2${fr(1, 4)} − 1${fr(2, 3)} = ？`, opts: [{ h: fr(7, 12), ok: true }, { h: `1${fr(7, 12)}`, ok: false, hint: `${fr(3, 12)} 不夠減 ${fr(8, 12)}，要從 2 借 1 喔！` }, { h: `1${fr(5, 12)}`, ok: false, hint: '不可以用大的分子減小的分子，要借 1 再減。' }], hint: '通分成分母 12，不夠減要借 1。', after: `2${fr(3, 12)} − 1${fr(8, 12)} = 1${fr(15, 12)} − 1${fr(8, 12)} = ${fr(7, 12)}` },
    { q: `不用算出答案：${fr(1, 2)} + ${fr(3, 5)} 比 1 大還是比 1 小？`, opts: [{ h: '比 1 大', ok: true }, { h: '比 1 小', ok: false, hint: `${fr(3, 5)} 比 ${fr(1, 2)} 大，兩個 ${fr(1, 2)} 才是 1。` }], keep: true, after: `${fr(1, 2)} + ${fr(3, 5)} = ${fr(11, 10)} = 1${fr(1, 10)}` },
    { q: `${fr(3, 4)} + ${fr(1, 6)} = ？`, opts: [{ h: fr(11, 12), ok: true }, { h: fr(4, 10), ok: false, hint: '分母不能相加！' }, { h: fr(4, 12), ok: false, hint: `${fr(3, 4)} 通分後是 ${fr(9, 12)}，分子也要跟著乘！` }], hint: '最小公分母是 12。', after: `${fr(9, 12)} + ${fr(2, 12)} = ${fr(11, 12)}` }
  ]);
}

/* ===== 6-C 分數加減挑戰 ===== */
function fracPair(sub) {
  for (;;) {
    const b = rand(2, 10), d = rand(2, 10); if (b === d || lcm(b, d) > 40) continue;
    const a = rand(1, b - 1), c = rand(1, d - 1); if (gcd(a, b) > 1 || gcd(c, d) > 1) continue;
    if (sub && a * d <= c * b) continue;
    return [a, b, c, d];
  }
}
function u6C(st) {
  const K = ['_', '/'];
  quiz(st, [
    () => { const [a, b, c, d] = fracPair(false), L = lcm(b, d), x = a * L / b + c * L / d; return { q: `${fr(a, b)} + ${fr(c, d)} = ？`, sp: `${b}分之${a}加${d}分之${c}`, ans: frAns(x, L), keys: K, hint: `通分成分母 ${L}，答案要約成最簡分數。`, after: `${fr(a * L / b, L)} + ${fr(c * L / d, L)} = ${frm(x, L)}` }; },
    () => { const [a, b, c, d] = fracPair(true), L = lcm(b, d), x = a * L / b - c * L / d; return { q: `${fr(a, b)} − ${fr(c, d)} = ？`, sp: `${b}分之${a}減${d}分之${c}`, ans: frAns(x, L), keys: K, hint: `通分成分母 ${L}，答案要約成最簡分數。`, after: `${fr(a * L / b, L)} − ${fr(c * L / d, L)} = ${frm(x, L)}` }; },
    () => { const [a, b, c, d] = pick([[1, 2, 2, 3], [3, 4, 1, 2], [2, 3, 5, 6], [4, 5, 1, 2]]), w1 = rand(1, 3), w2 = rand(1, 2), L = lcm(b, d), x = (w1 * b + a) * L / b + (w2 * d + c) * L / d; return { q: `${w1}${fr(a, b)} + ${w2}${fr(c, d)} = ？`, sp: `${w1}又${b}分之${a}加${w2}又${d}分之${c}`, ans: frAns(x, L), keys: K, hint: '整數和整數加、分數和分數加；分數超過 1 要進位。', after: `= ${frm(x, L)}` }; },
    () => { const [a, b, c, d] = pick([[3, 4, 1, 3], [5, 6, 1, 4], [2, 3, 1, 4], [4, 5, 1, 2]]), L = lcm(b, d), x = a * L / b - c * L / d; return { q: `一瓶果汁有 ${fr(a, b)} 公升，喝掉 ${fr(c, d)} 公升，還剩下幾公升？`, sp: `一瓶果汁有${b}分之${a}公升，喝掉${d}分之${c}公升，還剩幾公升`, vis: '<span style="font-size:56px">🧃</span>', ans: frAns(x, L), keys: K, unit: '公升', hint: `用減法，通分成分母 ${L}。`, after: `${fr(a, b)} − ${fr(c, d)} = ${frm(x, L)}（公升）` }; },
    () => { const [a, b, c, d] = pick([[2, 5, 1, 2], [1, 3, 3, 8], [3, 10, 1, 4], [1, 6, 4, 9]]), L = lcm(b, d), x = a * L / b + c * L / d; return { q: `紅緞帶長 ${fr(a, b)} 公尺，藍緞帶長 ${fr(c, d)} 公尺，兩條一共幾公尺？`, sp: `紅緞帶長${b}分之${a}公尺，藍緞帶長${d}分之${c}公尺，一共幾公尺`, vis: '<span style="font-size:56px">🎀</span>', ans: frAns(x, L), keys: K, unit: '公尺', hint: `用加法，通分成分母 ${L}。`, after: `${fr(a, b)} + ${fr(c, d)} = ${frm(x, L)}（公尺）` }; }
  ]);
}

Object.assign(LEVELS, { u5: [u5A, u5B, u5C], u6: [u6A, u6B, u6C] });
