'use strict';
/* 第 3 單元 小數的除法 ／ 第 4 單元 圓周長和圓面積 */

/* ===== 3-A 小數點搬家：被除數和除數一起 ×10，把除數變成整數再算 ===== */
function u3A(st) {
  const plans = shuffle([[7.2, 0.24, 30], [9.6, 0.3, 32], [4.5, 1.5, 3], [6, 0.25, 24], [1.26, 0.6, 2.1], [8.4, 0.12, 70], [3.6, 0.45, 8], [2.88, 0.4, 7.2]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [a, b, q] = plans[r]; let x = a, y = b, k = 0;
    api.say(`算 ${fmt(a)} ÷ ${fmt(b)}：先把<b>除數變成整數</b>。被除數和除數要怎麼移小數點？`);
    const draw = () => {
      st.innerHTML = `${dots(r, plans.length)}
        <div class="qvis"><div class="divbox"><span class="dv">${fmt(x)}</span><span class="dop">÷</span><span class="ds${Number.isInteger(rnd(y, 6)) ? ' int' : ''}">${fmt(y)}</span></div>
        ${k ? `<div class="lbl" style="width:100%">兩個數的小數點都往右移了 ${k} 位（都乘以 ${10 ** k}）</div>` : ''}</div>
        <div class="center"><button type="button" class="btn" id="both">被除數和除數都 ×10</button> <button type="button" class="btn ghost" id="only">只有除數 ×10</button></div>
        <div class="center"><button type="button" class="btn mint" id="go">除數是整數了，開始算！</button></div>
        <div class="kwrap"></div>`;
      $('#both', st).onclick = () => {
        if (Number.isInteger(rnd(y, 6))) return api.bad('除數已經是整數了，不用再移了！');
        x = rnd(x * 10, 6); y = rnd(y * 10, 6); k++; sfx('pop'); draw();
      };
      $('#only', st).onclick = () => api.bad('只移除數，商會變喔！被除數也要一起 ×10。');
      $('#go', st).onclick = () => {
        if (!Number.isInteger(rnd(y, 6))) return api.bad(`除數 ${fmt(y)} 還不是整數喔！`);
        $$('.btn', st).forEach(b => b.disabled = true);
        api.say(`${fmt(a)} ÷ ${fmt(b)} 和 ${fmt(x)} ÷ ${fmt(y)} 的商一樣。商是多少？`);
        keypad($('.kwrap', st), q, () => { toast(`${fmt(a)} ÷ ${fmt(b)} = ${fmt(q)}`); speak(`${fmt(a)} ÷ ${fmt(b)} = ${fmt(q)}`); r++; later(round, 2200); }, '用直式慢慢除，小數點要對齊商！', '', ['.']);
      };
    };
    draw();
  }
  round();
}

/* ===== 3-B 商和餘數想一想 ===== */
function u3B(st) {
  quiz(st, [
    () => { const n = pick([8, 12, 15]); return { q: `哪一個算式的商<b>比 ${n} 大</b>？`, opts: [{ h: `${n} ÷ 0.5`, ok: true }, { h: `${n} ÷ 1.2`, ok: false, hint: '除數比 1 大，商會變小！' }, { h: `${n} ÷ 2`, ok: false, hint: '除數比 1 大，商會變小！' }, { h: `${n} ÷ 1`, ok: false, hint: '除以 1，商和原來一樣！' }], hint: '除數比 1 小，商就比被除數大。' }; },
    () => { const [a, b] = pick([[2.45, 0.7], [3.84, 0.6], [1.75, 0.25], [5.4, 0.18]]); const k = String(b).split('.')[1].length; const A = rnd(a * 10 ** k, 4), B = rnd(b * 10 ** k, 4); return { q: `${fmt(a)} ÷ ${fmt(b)} 的商，和哪一個算式一樣？`, opts: [{ h: `${fmt(A)} ÷ ${fmt(B)}`, ok: true }, { h: `${fmt(a)} ÷ ${fmt(B)}`, ok: false, hint: '被除數也要一起乘喔！' }, { h: `${fmt(rnd(A * 10, 4))} ÷ ${fmt(B)}`, ok: false, hint: '被除數和除數要乘一樣多！' }], hint: '被除數和除數同時乘以 10、100，商不變。' }; },
    () => { const [a, b, q, rm] = pick([[5.3, 0.4, 13, 0.1], [7.6, 0.3, 25, 0.1], [4.7, 0.6, 7, 0.5], [9.5, 0.7, 13, 0.4]]); return { q: `${fmt(a)} ÷ ${fmt(b)}，商算到整數是 ${q}，<b>餘數</b>是多少？`, opts: [{ h: N(fmt(rm)), ok: true }, { h: N(fmt(rnd(rm * 10, 3))), ok: false, hint: `驗算：${fmt(b)} × ${q} + 餘數 = ${fmt(a)}，餘數的小數點要對齊被除數原來的小數點！` }, { h: N(fmt(rnd(rm / 10, 3))), ok: false, hint: `驗算看看：${fmt(b)} × ${q} = ${fmt(rnd(b * q, 3))}` }], after: `${fmt(b)} × ${q} + ${fmt(rm)} = ${fmt(a)}` }; },
    () => { const [a, b, e] = pick([[19.8, 0.49, 40], [31.5, 0.81, 40], [5.9, 0.29, 20], [8.1, 0.19, 40]]); return { q: `估一估：${fmt(a)} ÷ ${fmt(b)} 的商<b>大約</b>是多少？`, opts: numOpts(e, [e / 10, e * 10]), hint: `把數字想成整數：${Math.round(a)} ÷ ${fmt(Math.round(b * 10) / 10)} 大約是多少？`, after: `${Math.round(a)} ÷ ${fmt(Math.round(b * 10) / 10)} ≈ ${e}` }; },
    { q: '10 ÷ 3 = 3.333……，用<b>四捨五入法</b>取到小數第一位是多少？', sp: '10 除以 3 等於 3.333，用四捨五入法取到小數第一位是多少？', opts: numOpts(3.3, [3.4, 3, 3.33]), hint: '看小數第二位是 3，要捨去。', after: '10 ÷ 3 ≈ 3.3' }
  ]);
}

/* ===== 3-C 小數除法挑戰 ===== */
function u3C(st) {
  const K = ['.'];
  quiz(st, [
    () => { const [a, b, q] = pick([[8.64, 0.24, 36], [5.25, 0.15, 35], [9.36, 0.18, 52], [4.68, 0.36, 13]]); return { q: `${fmt(a)} ÷ ${fmt(b)} = ？`, ans: q, keys: K, hint: '兩個數的小數點都往右移 2 位再算！', after: `${fmt(a * 100)} ÷ ${fmt(b * 100)} = ${q}` }; },
    () => { const [a, b, q] = pick([[18, 0.4, 45], [27, 0.6, 45], [21, 0.35, 60], [12, 0.8, 15]]); return { q: `${a} ÷ ${fmt(b)} = ？`, ans: q, keys: K, hint: '被除數是整數也要跟著 ×10、×100 喔！', after: `${a} ÷ ${fmt(b)} = ${q}` }; },
    () => { const [a, b, q] = pick([[3.36, 1.2, 2.8], [6.25, 2.5, 2.5], [4.32, 0.9, 4.8], [7.56, 1.8, 4.2]]); return { q: `${fmt(a)} ÷ ${fmt(b)} = ？`, ans: q, keys: K, hint: '除數變成整數後，商的小數點要對齊被除數的小數點。', after: `${fmt(a)} ÷ ${fmt(b)} = ${fmt(q)}` }; },
    () => { const [a, b, q] = pick([[3.6, 0.45, 8], [4.8, 0.32, 15], [5.4, 0.36, 15], [7.5, 0.25, 30]]); return { q: `一條 ${fmt(a)} 公尺的繩子，每 ${fmt(b)} 公尺剪一段，可以剪成幾段？`, vis: '<span style="font-size:56px">🪢✂️</span>', ans: q, unit: '段', keys: K, hint: '繩子長 ÷ 每段長', after: `${fmt(a)} ÷ ${fmt(b)} = ${q}（段）` }; },
    () => { const [a, b] = pick([[12.5, 0.6], [9.2, 0.7], [15.4, 0.8], [10.3, 0.4]]); const q = Math.floor(a / b); return { q: `有 ${fmt(a)} 公升果汁，每瓶裝 ${fmt(b)} 公升，<b>最多可以裝滿幾瓶</b>？`, vis: '<span style="font-size:56px">🧃🍶</span>', ans: q, unit: '瓶', keys: K, hint: '商只要算到整數，剩下的裝不滿一瓶！', after: `${fmt(a)} ÷ ${fmt(b)} = ${q} … ${fmt(rnd(a - q * b, 2))}，最多裝滿 ${q} 瓶` }; },
    () => { const [a, b] = pick([[5, 3], [7, 6], [2, 3], [11, 7]]); const q = Math.round(a / b * 10) / 10; return { q: `${a} ÷ ${b} 的商用<b>四捨五入法</b>取到小數第一位是多少？`, ans: q, keys: K, hint: '算到小數第二位，再看要不要進位！', after: `${a} ÷ ${b} = ${fmt(Math.floor(a / b * 100) / 100)}… ≈ ${fmt(q)}` }; }
  ]);
}

/* ===== 圓的圖 ===== */
function circleSVG(r, label, kind = 'r') {
  const R = 80, c = 100;
  const line = kind === 'd' ? `<line x1="${c - R}" y1="${c}" x2="${c + R}" y2="${c}" stroke="#e5508f" stroke-width="4"/><text x="${c}" y="${c - 10}" text-anchor="middle" font-size="18" font-weight="900" fill="#e5508f">${label}</text>`
    : `<line x1="${c}" y1="${c}" x2="${c + R}" y2="${c}" stroke="#e5508f" stroke-width="4"/><text x="${c + R / 2}" y="${c - 10}" text-anchor="middle" font-size="18" font-weight="900" fill="#e5508f">${label}</text>`;
  return `<svg class="pic" viewBox="0 0 200 200" width="200" height="200"><circle cx="${c}" cy="${c}" r="${R}" fill="#e2f3ff" stroke="#5bb4ff" stroke-width="4"/><circle cx="${c}" cy="${c}" r="4" fill="#4a3b5c"/>${line}</svg>`;
}
function halfSVG(label) {
  return `<svg class="pic" viewBox="0 0 200 120" width="200" height="120"><path d="M20 100 A80 80 0 0 1 180 100 Z" fill="#fff4dc" stroke="#ff9a4d" stroke-width="4"/><circle cx="100" cy="100" r="4" fill="#4a3b5c"/><line x1="100" y1="100" x2="180" y2="100" stroke="#e5508f" stroke-width="4"/><text x="140" y="92" text-anchor="middle" font-size="18" font-weight="900" fill="#e5508f">${label}</text></svg>`;
}

/* ===== 4-A 滾輪子、切披薩 ===== */
function u4A(st) {
  const ds = shuffle([10, 8, 6]).slice(0, 2);
  const steps = [
    { d: ds[0], q: '輪子滾一圈的長度（圓周長），大約是直徑的幾倍？', opts: d => numOpts(3.14, [2, 4, 1.5], '倍') },
    { d: ds[1], q: '這個輪子滾一圈，大約滾了幾公分？', opts: d => numOpts(rnd(d * 3.14), [d * 2, rnd(d * 3.14 * 2), d * 4], '公分') },
    { cut: true, q: '拼成的圖形很像長方形。它的<b>長</b>是多少？', opts: () => [{ h: '圓周長的一半<br><small>（半徑 × 3.14）</small>', ok: true }, { h: '圓周長', ok: false, hint: '上下兩邊合起來才是整個圓周長！' }, { h: '直徑', ok: false, hint: '看看長邊是由什麼組成的：一半的弧！' }] },
    { cut: true, keep: true, q: '它的<b>寬</b>是多少？', opts: () => [{ h: '半徑', ok: true }, { h: '直徑', ok: false, hint: '寬是從圓心到圓周，是半徑！' }, { h: '圓周長的一半', ok: false, hint: '那是長喔！' }] }
  ];
  let r = 0;
  function round() {
    if (r >= steps.length) return api.finish();
    const s = steps[r];
    if (s.cut) return cutRound(s);
    const d = s.d, sc = 30 / d * 10 / 3, R = d / 2 * sc, C = Math.PI * d * sc, x0 = 20, ground = 150;
    api.say(`輪子的直徑是 ${d} 公分。按「滾一圈」，看看輪子滾一圈走多遠。`);
    let ticks = '';
    for (let cm = 0; cm * sc <= 360; cm += 5) ticks += `<line x1="${x0 + cm * sc}" y1="${ground}" x2="${x0 + cm * sc}" y2="${ground + (cm % 10 ? 6 : 12)}" stroke="#8a7a99" stroke-width="2"/>${cm % 10 ? '' : `<text x="${x0 + cm * sc}" y="${ground + 28}" text-anchor="middle" font-size="13" fill="#8a7a99">${cm}</text>`}`;
    st.innerHTML = `${dots(r, steps.length)}<div class="qvis"><svg class="roll" viewBox="0 0 400 190"><line x1="0" y1="${ground}" x2="400" y2="${ground}" stroke="#4a3b5c" stroke-width="3"/>${ticks}
      <line id="trail" x1="${x0}" y1="${ground - 2}" x2="${x0}" y2="${ground - 2}" stroke="#ff6b6b" stroke-width="6" stroke-linecap="round"/>
      <g id="wheel"><circle r="${R}" fill="#ffe9a8" stroke="#ff9a4d" stroke-width="4"/><line x1="${-R}" y1="0" x2="${R}" y2="0" stroke="#5bb4ff" stroke-width="3"/><circle cx="0" cy="${R}" r="6" fill="#ff6b6b"/></g>
      <text x="${x0}" y="20" font-size="16" font-weight="900" fill="#5bb4ff">直徑 ${d} 公分</text></svg></div>
      <div class="center"><button type="button" class="btn" id="rollB">🛞 滾一圈</button></div><div class="opts"></div>`;
    const wheel = $('#wheel', st), trail = $('#trail', st);
    const place = t => { wheel.setAttribute('transform', `translate(${x0 + t * C} ${ground - R}) rotate(${t * 360})`); trail.setAttribute('x2', x0 + t * C); };
    place(0);
    $('#rollB', st).onclick = () => {
      $('#rollB', st).disabled = true; sfx('tap');
      const t0 = performance.now();
      const step = () => {
        if (!wheel.isConnected) return;
        const t = Math.min(1, (performance.now() - t0) / 1800); place(t);
        if (t < 1) return later(step, 16);
        toast(`滾了大約 ${fmt(rnd(d * 3.14))} 公分`);
        api.say(s.q);
        shuffle(s.opts(d)).forEach(o => $('.opts', st).appendChild(optBtn(o, () => { speak(`圓周長 = 直徑 × 3.14`); toast('圓周長 = 直徑 × 圓周率（約 3.14）'); r++; later(round, 2400); })));
      };
      step();
    };
  }
  function cutRound(s) {
    const n = 16, R = 70, th = 360 / n, w = 2 * R * Math.sin(Math.PI / n), cx = 180, cy = 100;
    const x0 = (360 - (n / 2 + 0.5) * w) / 2, yb = 175;
    const a1 = (-90 - th / 2) * Math.PI / 180, a2 = (-90 + th / 2) * Math.PI / 180;
    const d = `M0 0 L${(R * Math.cos(a1)).toFixed(2)} ${(R * Math.sin(a1)).toFixed(2)} A${R} ${R} 0 0 1 ${(R * Math.cos(a2)).toFixed(2)} ${(R * Math.sin(a2)).toFixed(2)} Z`;
    const home = i => `translate(${cx}px,${cy}px) rotate(${i * th}deg)`;
    const away = i => { const j = Math.floor(i / 2); return i % 2 === 0 ? `translate(${x0 + j * w + w / 2}px,${yb}px) rotate(0deg)` : `translate(${x0 + (j + 1) * w}px,${yb - R}px) rotate(180deg)`; };
    const first = r === 2;
    api.say(first ? '把圓切成 16 塊，按「切開排一排」，看看會變成什麼圖形？' : s.q);
    st.innerHTML = `${dots(r, steps.length)}<div class="qvis"><svg class="roll" viewBox="0 0 360 200">${Array.from({ length: n }, (_, i) => `<path class="sec" d="${d}" fill="${i % 2 ? '#ffc93c' : '#ff9a4d'}" stroke="#fff" stroke-width="1.5" style="transform:${first ? home(i) : away(i)}"/>`).join('')}
      ${first ? '' : `<line x1="${x0}" y1="${yb + 12}" x2="${x0 + (n / 2 + 0.5) * w}" y2="${yb + 12}" stroke="#e5508f" stroke-width="3"/><text x="${x0 + (n / 2 + 0.5) * w / 2}" y="${yb + 26}" text-anchor="middle" font-size="13" font-weight="900" fill="#e5508f">長</text><line x1="${x0 - 10}" y1="${yb}" x2="${x0 - 10}" y2="${yb - R}" stroke="#5bb4ff" stroke-width="3"/><text x="${x0 - 16}" y="${yb - R / 2}" text-anchor="end" font-size="13" font-weight="900" fill="#5bb4ff">寬</text>`}</svg></div>
      ${first ? '<div class="center"><button type="button" class="btn" id="cutB">🔪 切開排一排</button></div>' : ''}<div class="opts"></div>`;
    const ask = () => {
      api.say(s.q);
      const o = s.opts(); (s.keep ? o : shuffle(o)).forEach(x => $('.opts', st).appendChild(optBtn(x, () => {
        if (r === 3) { toast('圓面積 = 半徑 × 半徑 × 3.14'); speak('長乘以寬，所以圓面積等於半徑乘以半徑乘以 3.14'); }
        r++; later(round, r === 4 ? 3200 : 1600);
      })));
    };
    if (!first) return ask();
    $('#cutB', st).onclick = () => {
      $('#cutB', st).disabled = true; sfx('pop');
      $$('.sec', st).forEach((p, i) => { p.style.transform = away(i); });
      later(() => { $('svg', st).insertAdjacentHTML('beforeend', `<line x1="${x0}" y1="${yb + 12}" x2="${x0 + (n / 2 + 0.5) * w}" y2="${yb + 12}" stroke="#e5508f" stroke-width="3"/><text x="${x0 + (n / 2 + 0.5) * w / 2}" y="${yb + 26}" text-anchor="middle" font-size="13" font-weight="900" fill="#e5508f">長</text><line x1="${x0 - 10}" y1="${yb}" x2="${x0 - 10}" y2="${yb - R}" stroke="#5bb4ff" stroke-width="3"/><text x="${x0 - 16}" y="${yb - R / 2}" text-anchor="end" font-size="13" font-weight="900" fill="#5bb4ff">寬</text>`); ask(); }, 1300);
    };
  }
  round();
}

/* ===== 4-B 圓的公式想一想 ===== */
function u4B(st) {
  quiz(st, [
    { q: '圓周率 = 圓周長 ÷ ？', opts: [{ h: '直徑', ok: true }, { h: '半徑', ok: false, hint: '圓周長大約是直徑的 3.14 倍！' }, { h: '圓面積', ok: false }], hint: '任何圓的圓周長 ÷ 直徑，都大約是 3.14。' },
    { q: '圓面積的公式是哪一個？', opts: [{ h: '半徑 × 半徑 × 3.14', ok: true }, { h: '直徑 × 3.14', ok: false, hint: '那是圓周長的公式！' }, { h: '半徑 × 2 × 3.14', ok: false, hint: '那也是圓周長喔！' }, { h: '直徑 × 直徑 × 3.14', ok: false, hint: '要用半徑，不是直徑！' }] },
    { q: '圓的半徑變成原來的 2 倍，<b>圓周長</b>會變成原來的幾倍？', opts: numOpts(2, [4, 3.14, 1], '倍'), hint: '圓周長 = 半徑 × 2 × 3.14，半徑乘 2，圓周長也乘 2。' },
    { q: '圓的半徑變成原來的 2 倍，<b>圓面積</b>會變成原來的幾倍？', opts: numOpts(4, [2, 6.28, 8], '倍'), hint: '面積 = 半徑 × 半徑 × 3.14，半徑乘 2 用了兩次！', after: '2 × 2 = 4 倍' },
    { q: '<b>半圓形</b>的周長要怎麼算？', vis: halfSVG('半徑'), opts: [{ h: '圓周長 ÷ 2 + 直徑', ok: true }, { h: '圓周長 ÷ 2', ok: false, hint: '別忘了下面那條直線（直徑）！' }, { h: '圓周長 ÷ 2 + 半徑', ok: false, hint: '下面那條直線是直徑，不是半徑！' }] }
  ]);
}

/* ===== 4-C 圓周長圓面積挑戰 ===== */
function u4C(st) {
  const K = ['.'];
  quiz(st, [
    () => { const d = pick([6, 8, 12, 15, 20]); return { q: `直徑 ${d} 公分的圓，<b>圓周長</b>是多少公分？（圓周率用 3.14）`, vis: circleSVG(d / 2, `${d} 公分`, 'd'), ans: rnd(d * 3.14), unit: '公分', keys: K, hint: '圓周長 = 直徑 × 3.14', after: `${d} × 3.14 = ${fmt(rnd(d * 3.14))}` }; },
    () => { const r = pick([3, 4, 5, 7, 9]); return { q: `半徑 ${r} 公分的圓，<b>圓周長</b>是多少公分？`, vis: circleSVG(r, `${r} 公分`), ans: rnd(r * 2 * 3.14), unit: '公分', keys: K, hint: '圓周長 = 半徑 × 2 × 3.14', after: `${r} × 2 × 3.14 = ${fmt(rnd(r * 2 * 3.14))}` }; },
    () => { const r = pick([2, 3, 4, 5, 6, 10]); return { q: `半徑 ${r} 公分的圓，<b>圓面積</b>是多少平方公分？`, vis: circleSVG(r, `${r} 公分`), ans: rnd(r * r * 3.14), unit: '平方公分', keys: K, hint: '圓面積 = 半徑 × 半徑 × 3.14', after: `${r} × ${r} × 3.14 = ${fmt(rnd(r * r * 3.14))}` }; },
    () => { const d = pick([5, 10, 20, 30]); return { q: `一個圓的圓周長是 ${fmt(rnd(d * 3.14))} 公分，它的<b>直徑</b>是幾公分？`, ans: d, unit: '公分', keys: K, hint: '直徑 = 圓周長 ÷ 3.14', after: `${fmt(rnd(d * 3.14))} ÷ 3.14 = ${d}` }; },
    () => { const r = pick([4, 5, 6, 10]); const p = rnd(r * 3.14 + 2 * r); return { q: `半徑 ${r} 公分的<b>半圓形</b>，周長是多少公分？`, vis: halfSVG(`${r} 公分`), ans: p, unit: '公分', keys: K, hint: '半圓周長 = 圓周長 ÷ 2 + 直徑', after: `${r * 2} × 3.14 ÷ 2 + ${r * 2} = ${fmt(p)}` }; },
    () => { const d = pick([60, 50, 40]); const L = rnd(d * 3.14 * 10 / 100); return { q: `腳踏車輪子直徑 ${d} 公分，滾了 10 圈，前進了幾公尺？`, vis: '<span style="font-size:56px">🚲</span>', ans: L, unit: '公尺', keys: K, hint: '先算一圈多長，再乘 10 圈，最後換成公尺（÷100）！', after: `${d} × 3.14 × 10 = ${fmt(rnd(d * 31.4))} 公分 = ${fmt(L)} 公尺` }; }
  ]);
}

Object.assign(LEVELS, { u3: [u3A, u3B, u3C], u4: [u4A, u4B, u4C] });
