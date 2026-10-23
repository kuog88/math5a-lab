'use strict';
/* 第 5 單元 比和比值 ／ 第 6 單元 扇形的周長和面積 */

/* ===== 5-A 調出一樣的果汁：照配方的比，加減水或果汁 ===== */
function u5A(st) {
  const plans = shuffle([[2, 3, 2, 'w'], [3, 5, 2, 'w'], [1, 4, 3, 'w'], [3, 2, 3, 'w'], [2, 5, 2, 'j'], [4, 3, 2, 'j']]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [a, b, k, fix] = plans[r];
    let j = fix === 'w' ? a * k : 0, w = fix === 'w' ? 0 : b * k;
    const what = fix === 'w' ? '水' : '果汁';
    api.say(`配方是 果汁 : 水 = <b>${a} : ${b}</b>。現在有 ${fix === 'w' ? `${j} 杯果汁` : `${w} 杯水`}，要加幾杯${what}，味道才會一樣？`);
    const draw = () => {
      st.innerHTML = `${dots(r, plans.length)}
        <div class="readout">配方 果汁 : 水 = ${a} : ${b}　｜　現在 果汁 : 水 = <b>${j} : ${w}</b></div>
        <div class="jug"><div class="jcol"><div class="lbl">🧃 果汁 ${j} 杯</div><div class="cups2">${'<i class="cj"></i>'.repeat(j)}</div></div><div class="jcol"><div class="lbl">💧 水 ${w} 杯</div><div class="cups2">${'<i class="cw"></i>'.repeat(w)}</div></div></div>
        <div class="center"><button type="button" class="btn blue" id="addB">＋1 杯${what}</button> <button type="button" class="btn ghost" id="subB">－1 杯${what}</button></div>
        <div class="center"><button type="button" class="btn mint" id="okB">調好了！</button></div>`;
      $('#addB', st).onclick = () => { if ((fix === 'w' ? w : j) >= 16) return toast('杯子太多了！'); fix === 'w' ? w++ : j++; sfx('tap'); draw(); };
      $('#subB', st).onclick = () => { if (fix === 'w' ? !w : !j) return; fix === 'w' ? w-- : j--; sfx('tap'); draw(); };
      $('#okB', st).onclick = () => {
        if (j * b === w * a) {
          $$('button', st).forEach(x => x.disabled = true);
          api.ok(`${j} : ${w} = ${a} : ${b}，比值都是 ${fr(...red(a, b))}`);
          speak(`${j} 比 ${w} 和 ${a} 比 ${b} 相等，前項和後項都乘以 ${k}`); r++; later(round, 2600);
        } else api.bad(`${j} : ${w} 和 ${a} : ${b} 不相等。${fix === 'w' ? `果汁 ${a} 杯變成 ${j} 杯是乘以幾？水也要乘一樣多！` : `水 ${b} 杯變成 ${w} 杯是乘以幾？果汁也要乘一樣多！`}`);
      };
    };
    draw();
  }
  round();
}

/* ===== 5-B 比和比值想一想 ===== */
function u5B(st) {
  quiz(st, [
    () => { const [a, b] = pick([[3, 5], [2, 7], [4, 9], [5, 8]]); return { q: `${a} : ${b} 的<b>比值</b>是多少？`, opts: [{ h: fr(a, b), ok: true }, { h: fr(b, a), ok: false, hint: '比值 = 前項 ÷ 後項，前項當分子！' }, { h: N(a + b), ok: false, hint: '比值是用除的，不是加！' }], hint: '比值 = 前項 ÷ 後項' }; },
    () => { const [a, b] = pick([[4, 6], [6, 9], [10, 15], [8, 12]]); const [x, y] = red(a, b); return { q: `哪一個比和 <b>${a} : ${b}</b> 相等？`, opts: [{ h: `${x} : ${y}`, ok: true }, { h: `${b} : ${a}`, ok: false, hint: '前項和後項的位置不能交換！' }, { h: `${a + 2} : ${b + 2}`, ok: false, hint: '前後項要同時乘或除以同一個數，不是加！' }, { h: `${x} : ${y + 1}`, ok: false, hint: '算算看兩個比的比值一不一樣！' }], hint: '相等的比，比值一樣。' }; },
    () => { const [a, b] = pick([[18, 24], [15, 35], [12, 30], [16, 40]]); const [x, y] = red(a, b), g = gcd(a, b); const half = g % 2 === 0 && g > 2 ? [a / 2, b / 2] : [a / g * 2, b / g * 2]; return { q: `${a} : ${b} 的<b>最簡整數比</b>是哪一個？`, opts: [{ h: `${x} : ${y}`, ok: true }, { h: `${half[0]} : ${half[1]}`, ok: false, hint: '還可以再約喔！' }, { h: `${y} : ${x}`, ok: false, hint: '前後項不能交換！' }], hint: `前項和後項同除以最大公因數 ${g}` }; },
    () => { const [a, b, x, y] = pick([[0.6, 1.5, 2, 5], [1.2, 0.8, 3, 2], [0.4, 1, 2, 5], [2.5, 1.5, 5, 3]]); return { q: `${fmt(a)} : ${fmt(b)} 的最簡整數比是哪一個？`, opts: [{ h: `${x} : ${y}`, ok: true }, { h: `${fmt(a * 10)} : ${fmt(b * 10)}`, ok: false, hint: '變成整數後，還要再約分！' }, { h: `${y} : ${x}`, ok: false, hint: '前後項不能交換！' }], hint: '先同乘 10 變成整數，再約分。', after: `${fmt(a)} : ${fmt(b)} = ${fmt(a * 10)} : ${fmt(b * 10)} = ${x} : ${y}` }; },
    () => { const [a, b, c, d, x, y] = pick([[1, 2, 1, 3, 3, 2], [2, 3, 1, 2, 4, 3], [3, 4, 1, 2, 3, 2], [1, 4, 1, 6, 3, 2]]); return { q: `${fr(a, b)} : ${fr(c, d)} 的最簡整數比是哪一個？`, opts: [{ h: `${x} : ${y}`, ok: true }, { h: `${a} : ${c}`, ok: false, hint: '分數的比，要先通分或同乘公倍數！' }, { h: `${y} : ${x}`, ok: false, hint: '前後項不能交換！' }, { h: `${b} : ${d}`, ok: false, hint: '分母大的分數反而比較小喔！' }].filter((o, i, s) => s.findIndex(t => t.h === o.h) === i), hint: `兩項都乘以 ${lcm(b, d)}`, after: `兩項都乘以 ${lcm(b, d)}，得到 ${x} : ${y}` }; }
  ]);
}

/* ===== 5-C 比的應用挑戰 ===== */
function u5C(st) {
  quiz(st, [
    () => { const [a, b] = pick([[6, 8], [9, 12], [10, 4], [15, 6]]); const [x, y] = red(a, b); return { q: `${a} : ${b} 的<b>比值</b>是多少？（用最簡分數或整數）`, ans: y === 1 ? x : `${x}/${y}`, keys: ['/'], hint: '比值 = 前項 ÷ 後項，再約分！', after: `${a} ÷ ${b} = ${frm(x, y)}` }; },
    () => { const [a, b] = pick([[24, 36], [45, 30], [28, 42], [16, 56]]); const [x, y] = red(a, b); return { q: `把 ${a} : ${b} 化成<b>最簡整數比</b>。`, sp: `把 ${a} 比 ${b} 化成最簡整數比`, ans: `${x}:${y}`, hint: '前項和後項同除以最大公因數！', after: `${a} : ${b} = ${x} : ${y}` }; },
    () => { const [a, b] = pick([[3, 4], [2, 5], [5, 6], [4, 7]]), k = rand(3, 8); return { q: `${a} : ${b} = ${a * k} : □，□ 是多少？`, ans: b * k, hint: `${a} 變成 ${a * k} 是乘以幾？後項也要乘一樣多！`, after: `前後項都乘以 ${k}，□ = ${b * k}` }; },
    () => { const [a, b] = pick([[3, 4], [2, 3], [4, 5], [3, 5]]), k = pick([5, 6, 7, 8]); const T = (a + b) * k; return { q: `哥哥和弟弟按 <b>${a} : ${b}</b> 分 ${T} 張貼紙，哥哥分到幾張？`, vis: '<span style="font-size:56px">👦🧒⭐</span>', ans: a * k, unit: '張', hint: `全部分成 ${a} + ${b} = ${a + b} 份，哥哥拿 ${a} 份！`, after: `${T} × ${fr(a, a + b)} = ${a * k}（張）` }; },
    () => { const [a, b] = pick([[2, 5], [3, 8], [1, 4], [3, 10]]), k = pick([40, 50, 60, 100]); return { q: `做鬆餅時，糖和麵粉的重量比是 ${a} : ${b}。用了 ${b * k} 公克麵粉，要用幾公克糖？`, vis: '<span style="font-size:56px">🥞</span>', ans: a * k, unit: '公克', hint: `麵粉 ${b} 份是 ${b * k} 公克，1 份是多少？`, after: `${b * k} ÷ ${b} × ${a} = ${a * k}（公克）` }; },
    () => { const [a, b] = pick([[3, 2], [5, 4], [4, 3]]), k = pick([3, 4, 5, 6]); return { q: `長方形的長和寬的比是 ${a} : ${b}，長是 ${a * k} 公分，<b>面積</b>是多少平方公分？`, ans: a * k * b * k, unit: '平方公分', hint: '先用比求出寬，再算長 × 寬！', after: `寬 = ${b * k} 公分，面積 = ${a * k} × ${b * k} = ${a * b * k * k}` }; }
  ]);
}

/* ===== 扇形的圖 ===== */
function sectorPath(deg, R = 100, c = 120) {
  if (deg >= 360) return `M${c} ${c - R} A${R} ${R} 0 1 1 ${c - 0.01} ${c - R} Z`;
  const t = (deg - 90) * Math.PI / 180, x = c + R * Math.cos(t), y = c + R * Math.sin(t);
  return `M${c} ${c} L${c} ${c - R} A${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}
function sectorSVG(deg, label) {
  return `<svg class="pic" viewBox="0 0 240 240" width="200" height="200"><circle cx="120" cy="120" r="100" fill="none" stroke="#d9d0e3" stroke-width="2" stroke-dasharray="6 6"/><path d="${sectorPath(deg)}" fill="#ffd9a8" stroke="#ff9a4d" stroke-width="4"/><text x="128" y="112" font-size="16" font-weight="900" fill="#4a3b5c">${deg}°</text>${label ? `<text x="${120 + 6}" y="${120 - 50}" font-size="16" font-weight="900" fill="#e5508f">${label}</text>` : ''}</svg>`;
}

/* ===== 6-A 拉出扇形：拖曳半徑做出指定圓心角 ===== */
function u6A(st) {
  const targets = shuffle([[90, '圓心角 90° 的扇形'], [120, `${fr(1, 3)} 圓`], [270, `${fr(3, 4)} 圓`], [60, `${fr(1, 6)} 圓`], [180, '半圓'], [45, `${fr(1, 8)} 圓`]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const [deg, name] = targets[r]; let cur = 30;
    api.say(`拖動圓上的紅點，做出 <b>${name}</b>，做好按「好了」。`);
    st.innerHTML = `${dots(r, targets.length)}<div class="readout" id="ro"></div>
      <div class="qvis"><svg class="fan" viewBox="0 0 240 240"><circle cx="120" cy="120" r="100" fill="#fbfdff" stroke="#cfe6fb" stroke-width="3"/>
      ${Array.from({ length: 24 }, (_, i) => { const t = i * 15 * Math.PI / 180; return `<line x1="${120 + 92 * Math.sin(t)}" y1="${120 - 92 * Math.cos(t)}" x2="${120 + 100 * Math.sin(t)}" y2="${120 - 100 * Math.cos(t)}" stroke="#cdbfe0" stroke-width="${i % 6 ? 1.5 : 3}"/>`; }).join('')}
      <path id="sec" fill="#ffd9a8" stroke="#ff9a4d" stroke-width="4"/><circle id="knob" r="12" fill="#ff6b6b" stroke="#fff" stroke-width="3"/><circle cx="120" cy="120" r="5" fill="#4a3b5c"/></svg></div>
      <div class="center"><button type="button" class="btn ghost" id="mB">－15°</button> <button type="button" class="btn ghost" id="pB">＋15°</button> <button type="button" class="btn mint" id="okB">好了！</button></div>`;
    const svg = $('.fan', st);
    const draw = () => {
      $('#sec', st).setAttribute('d', sectorPath(cur));
      const t = (cur - 90) * Math.PI / 180; $('#knob', st).setAttribute('cx', 120 + 100 * Math.cos(t)); $('#knob', st).setAttribute('cy', 120 + 100 * Math.sin(t));
      const [p, q] = red(cur, 360);
      $('#ro', st).innerHTML = `圓心角 <b>${cur}°</b>　＝　${fr(p, q)} 圓`;
    };
    dragOn(svg, (x, y, rect) => {
      const sx = x / rect.width * 240 - 120, sy = y / rect.height * 240 - 120;
      let a = Math.atan2(sx, -sy) * 180 / Math.PI; if (a < 0) a += 360;
      let v = Math.round(a / 15) * 15; if (v === 0) v = cur > 180 ? 360 : 15;
      if (v !== cur) { cur = v; draw(); }
    });
    $('#mB', st).onclick = () => { cur = Math.max(15, cur - 15); sfx('tap'); draw(); };
    $('#pB', st).onclick = () => { cur = Math.min(360, cur + 15); sfx('tap'); draw(); };
    $('#okB', st).onclick = () => {
      if (cur === deg) { $$('button', st).forEach(b => b.disabled = true); const [p, q] = red(deg, 360); api.ok(`${name}：圓心角 ${deg}° 是 ${fr(p, q)} 個圓`); speak(`圓心角 ${deg} 度，是 ${q}分之${p} 個圓`); r++; later(round, 2400); }
      else api.bad(`現在是 ${cur}°。一整圈是 360°，${name} 要幾度？`);
    };
    draw();
  }
  round();
}

/* ===== 6-B 扇形想一想 ===== */
function u6B(st) {
  quiz(st, [
    () => { const [d, p, q] = pick([[90, 1, 4], [120, 1, 3], [60, 1, 6], [72, 1, 5]]); return { q: `圓心角 ${d}° 的扇形，是幾分之幾個圓？`, vis: sectorSVG(d), opts: [{ h: fr(p, q), ok: true }, { h: fr(...red(d, 100)), ok: false, hint: '一整個圓是 360°，不是 100°！' }, { h: fr(p, q + 1), ok: false, hint: `算算看：${d} ÷ 360` }], hint: `${d} ÷ 360 = ?` }; },
    { q: '扇形面積要怎麼算？', opts: [{ h: '圓面積 × <span class="fr"><span>圓心角</span><span>360</span></span>', ok: true }, { h: '圓面積 × <span class="fr"><span>圓心角</span><span>180</span></span>', ok: false, hint: '一整圈是 360°，不是 180°！' }, { h: '半徑 × 圓心角', ok: false, hint: '扇形是圓的一部分，先想整個圓的面積！' }] },
    { q: '扇形的<b>周長</b>包含哪些部分？', vis: sectorSVG(90, '半徑'), opts: [{ h: '弧長 + 2 個半徑', ok: true }, { h: '只有弧長', ok: false, hint: '別忘了兩條直直的邊（半徑）！' }, { h: '弧長 + 1 個半徑', ok: false, hint: '扇形有兩條半徑喔！' }] },
    { q: '兩個扇形的半徑一樣長，圓心角越大，面積會？', opts: [{ h: '越大', ok: true }, { h: '越小', ok: false }, { h: '一樣', ok: false }], keep: true, hint: '圓心角越大，佔圓的部分越多！' },
    () => { const [p, q, d] = pick([[3, 4, 270], [2, 3, 240], [5, 6, 300], [3, 8, 135]]); return { q: `${fr(p, q)} 個圓的扇形，圓心角是幾度？`, opts: numOpts(d, [d - 30, d + 45, 360 / q], '°'), hint: `360 × ${fr(p, q)}`, after: `360 × ${fr(p, q)} = ${d}°` }; }
  ]);
}

/* ===== 6-C 扇形挑戰 ===== */
function u6C(st) {
  const K = ['.'];
  quiz(st, [
    () => { const [r, d] = pick([[10, 90], [6, 120], [12, 60], [8, 90], [9, 120]]); const L = rnd(r * 2 * 3.14 * d / 360); return { q: `半徑 ${r} 公分、圓心角 ${d}° 的扇形，<b>弧長</b>是多少公分？`, vis: sectorSVG(d, `${r} 公分`), ans: L, unit: '公分', keys: K, hint: '弧長 = 半徑 × 2 × 3.14 × 圓心角 ÷ 360', after: `${r} × 2 × 3.14 × ${fr(d, 360)} = ${fmt(L)}` }; },
    () => { const [r, d] = pick([[6, 120], [10, 90], [4, 180], [12, 30], [3, 120]]); const A = rnd(r * r * 3.14 * d / 360); return { q: `半徑 ${r} 公分、圓心角 ${d}° 的扇形，<b>面積</b>是多少平方公分？`, vis: sectorSVG(d, `${r} 公分`), ans: A, unit: '平方公分', keys: K, hint: '扇形面積 = 半徑 × 半徑 × 3.14 × 圓心角 ÷ 360', after: `${r} × ${r} × 3.14 × ${fr(d, 360)} = ${fmt(A)}` }; },
    () => { const [r, d] = pick([[10, 90], [6, 60], [12, 90], [9, 120]]); const L = rnd(r * 2 * 3.14 * d / 360), P = rnd(L + 2 * r); return { q: `半徑 ${r} 公分、圓心角 ${d}° 的扇形，<b>周長</b>是多少公分？`, vis: sectorSVG(d, `${r} 公分`), ans: P, unit: '公分', keys: K, hint: '周長 = 弧長 + 2 個半徑', after: `${fmt(L)} + ${r} × 2 = ${fmt(P)}` }; },
    () => { const r = pick([2, 4, 6, 8]); const A = rnd(r * r * 3.14 / 4); return { q: `正方形邊長 ${r} 公分，以一個角為圓心畫 ${fr(1, 4)} 圓（扇形），扇形面積是多少平方公分？`, vis: `<svg class="pic" viewBox="0 0 220 220" width="180" height="180"><rect x="10" y="10" width="200" height="200" fill="#fff" stroke="#5bb4ff" stroke-width="4"/><path d="M10 210 L10 10 A200 200 0 0 1 210 210 Z" fill="#ffd9a8" stroke="#ff9a4d" stroke-width="3"/><text x="110" y="205" text-anchor="middle" font-size="18" font-weight="900" fill="#e5508f">${r} 公分</text></svg>`, ans: A, unit: '平方公分', keys: K, hint: '半徑就是正方形的邊長！', after: `${r} × ${r} × 3.14 ÷ 4 = ${fmt(A)}` }; },
    () => { const [r, L, d] = pick([[10, 15.7, 90], [6, 6.28, 60], [12, 12.56, 60], [9, 18.84, 120]]); return { q: `半徑 ${r} 公分的扇形，弧長是 ${fmt(L)} 公分，圓心角是幾度？`, ans: d, unit: '度', keys: K, hint: `先算整個圓周長：${r * 2} × 3.14 = ${fmt(rnd(r * 6.28))}，弧長佔幾分之幾？`, after: `${fmt(L)} ÷ ${fmt(rnd(r * 6.28))} × 360 = ${d}°` }; }
  ]);
}

Object.assign(LEVELS, { u5: [u5A, u5B, u5C], u6: [u6A, u6B, u6C] });
