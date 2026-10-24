'use strict';
/* 第 3 單元 多邊形 ／ 第 4 單元 擴分、約分和通分 */

/* ===== 3-A 木棒圍圍看、對角線切三角形 ===== */
function stickSVG(a, b, c) {
  const L = Math.max(a, b, c), [s1, s2] = [a, b, c].sort((x, y) => x - y), s = 300 / L, x0 = 50, y0 = 200;
  let h = `<svg class="pic" viewBox="0 0 400 230" width="400">`;
  if (s1 + s2 > L) {
    /* 以最長邊當底，算出頂點 */
    const px = (L * L + s1 * s1 - s2 * s2) / (2 * L), py = Math.sqrt(Math.max(0, s1 * s1 - px * px));
    h += `<polygon points="${x0},${y0} ${x0 + L * s},${y0} ${x0 + px * s},${y0 - py * s}" fill="#e6fbf3" stroke="none"/>`;
    h += `<line x1="${x0}" y1="${y0}" x2="${x0 + L * s}" y2="${y0}" stroke="#c98a4b" stroke-width="9" stroke-linecap="round"/><line x1="${x0}" y1="${y0}" x2="${x0 + px * s}" y2="${y0 - py * s}" stroke="#a86b32" stroke-width="9" stroke-linecap="round"/><line x1="${x0 + L * s}" y1="${y0}" x2="${x0 + px * s}" y2="${y0 - py * s}" stroke="#e0a060" stroke-width="9" stroke-linecap="round"/>`;
  } else {
    h += `<line x1="${x0}" y1="${y0}" x2="${x0 + L * s}" y2="${y0}" stroke="#c98a4b" stroke-width="9" stroke-linecap="round"/>`;
    h += `<line x1="${x0}" y1="${y0 - 26}" x2="${x0 + s1 * s}" y2="${y0 - 26}" stroke="#a86b32" stroke-width="9" stroke-linecap="round"/><line x1="${x0 + L * s}" y1="${y0 - 46}" x2="${x0 + (L - s2) * s}" y2="${y0 - 46}" stroke="#e0a060" stroke-width="9" stroke-linecap="round"/>`;
    h += `<text x="200" y="60" text-anchor="middle" font-size="20" font-weight="900" fill="#e5508f">${s1 + s2 === L ? '剛好一樣長，躺平了，圍不起來！' : '兩根短的接不起來！'}</text>`;
  }
  return h + `<text x="200" y="226" text-anchor="middle" font-size="16" font-weight="900" fill="#4a3b5c">${a}、${b}、${c} 公分</text></svg>`;
}
function polySVG(n, done, R = 120, cx = 170, cy = 150) {
  const P = Array.from({ length: n }, (_, i) => { const t = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + R * Math.cos(t), cy + R * Math.sin(t)]; });
  const cs = ['#ffd9e8', '#d6ecff', '#d9f7ea', '#fff0c2', '#ece3ff', '#ffe2cc'];
  let h = `<svg class="pic poly" viewBox="0 0 340 300" width="340">`;
  if (done.length === n - 3) for (let k = 1; k < n - 1; k++) h += `<polygon points="${P[0]} ${P[k]} ${P[k + 1]}" fill="${cs[(k - 1) % cs.length]}"/>`;
  h += `<polygon points="${P.join(' ')}" fill="none" stroke="#4a3b5c" stroke-width="4"/>`;
  done.forEach(k => { h += `<line x1="${P[0][0]}" y1="${P[0][1]}" x2="${P[k][0]}" y2="${P[k][1]}" stroke="#ff6b6b" stroke-width="4"/>`; });
  P.forEach((p, i) => { h += `<circle class="vx" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="${i ? 16 : 14}" fill="${i ? (done.includes(i) ? '#ff6b6b' : '#fff') : '#ffc93c'}" stroke="#4a3b5c" stroke-width="3" style="cursor:pointer"/>`; });
  h += `<text x="${P[0][0]}" y="${P[0][1] + 6}" text-anchor="middle" font-size="16" font-weight="900">A</text>`;
  return h + '</svg>';
}
const PNAME = { 3: '三角形', 4: '四邊形', 5: '五邊形', 6: '六邊形', 7: '七邊形', 8: '八邊形', 9: '九邊形', 10: '十邊形' };
function u3A(st) {
  const pr = shuffle([[4, 7], [5, 8], [3, 6], [6, 9], [4, 9]]);
  const ns = shuffle([5, 6, 7, 8]);
  const rounds = [{ t: 's', ab: pr[0], want: true }, { t: 's', ab: pr[1], want: false }, { t: 'c', n: ns[0] }, { t: 'c', n: ns[1] }];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r];
    if (R.t === 's') {
      const [a, b] = R.ab; let c = 0;
      api.say(`有兩根木棒：${a} 公分和 ${b} 公分。再選一根，${R.want ? '<b>圍成</b>一個三角形' : '讓它<b>圍不成</b>三角形'}，選好按「就是這根」。`);
      st.innerHTML = `${dots(r, rounds.length)}<div class="qvis" id="sv"></div>
        <div class="sticks">${Array.from({ length: 13 }, (_, i) => i + 1).map(l => `<button type="button" class="stk" data-l="${l}">${l} 公分<i style="width:${l * 7}px"></i></button>`).join('')}</div>
        <div class="center"><button type="button" class="btn mint" id="okB">就是這根！</button></div>`;
      $('#sv', st).innerHTML = `<div class="readout">${a} 公分 ＋ ${b} 公分 ＋ ？</div>`;
      $$('.stk', st).forEach(x => x.onclick = () => { c = +x.dataset.l; $$('.stk', st).forEach(y => y.classList.toggle('on', y === x)); sfx('tap'); $('#sv', st).innerHTML = stickSVG(a, b, c); });
      $('#okB', st).onclick = () => {
        if (!c) return toast('先選一根木棒！');
        const [s1, s2, L] = [a, b, c].sort((x, y) => x - y), can = s1 + s2 > L;
        if (can === R.want) {
          $$('button', st).forEach(x => x.disabled = true);
          const m = can ? `${s1} + ${s2} = ${s1 + s2}，比最長的 ${L} 長，可以圍成三角形！` : `${s1} + ${s2} = ${s1 + s2}，沒有比最長的 ${L} 長，圍不成三角形！`;
          api.ok(m); speak(m); r++; later(round, 3000);
        } else api.bad(R.want ? '這根圍不起來喔！兩根短的加起來要比最長的還長。' : '這根可以圍成三角形喔！要找一根讓兩短邊加起來不比最長邊長的。');
      };
    } else {
      const n = R.n, need = []; for (let k = 2; k <= n - 2; k++) need.push(k);
      const done = [];
      api.say(`這是${PNAME[n]}。從黃色的頂點 A 出發，點其他頂點畫出<b>所有的對角線</b>，把它切成三角形！`);
      const draw = () => {
        st.innerHTML = `${dots(r, rounds.length)}<div class="readout">${PNAME[n]}：已經畫了 ${done.length} 條對角線</div><div class="qvis">${polySVG(n, done)}</div><div class="opts"></div>`;
        $$('.vx', st).forEach(v => v.addEventListener('click', () => {
          const i = +v.dataset.i;
          if (done.length === n - 3) return;
          if (i === 0) return toast('從 A 出發，點別的頂點！');
          if (i === 1 || i === n - 1) { toast('這個頂點和 A 相鄰，連起來是「邊」，不是對角線！'); return; }
          if (done.includes(i)) return;
          done.push(i); sfx('pop'); draw();
          if (done.length === n - 3) {
            api.say(`${PNAME[n]}被切成了 <b>${n - 2}</b> 個三角形。每個三角形內角和 180°，${PNAME[n]}的內角和是幾度？`);
            const ans = (n - 2) * 180;
            numOpts(ans, [n * 180, (n - 1) * 180, (n - 3) * 180], '°').forEach(o => $('.opts', st).appendChild(optBtn(o, () => { const m = `${n - 2} × 180 = ${ans}°`; toast(m); speak(m); r++; later(round, 2600); }, `${n - 2} 個三角形，每個 180°！`)));
          }
        }));
      };
      draw();
    }
  }
  round();
}

/* ===== 3-B 多邊形想一想 ===== */
const shp = pts => `<svg viewBox="0 0 120 100" width="110" height="92"><polygon points="${pts}" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/></svg>`;
function u3B(st) {
  quiz(st, [
    { q: '下面哪一個是<b>正多邊形</b>？', opts: [{ h: shp('25,15 95,15 95,85 25,85'), ok: true }, { h: shp('5,25 115,25 115,75 5,75'), ok: false, hint: '長方形的邊不是都一樣長。' }, { h: shp('60,5 88,50 60,95 32,50'), ok: false, hint: '菱形的邊都一樣長，但角不是都一樣大。正多邊形要「邊都相等、角也都相等」。' }], hint: '正多邊形：每條邊都一樣長，每個角都一樣大。' },
    () => { const ok = pick([[4, 5, 7], [5, 6, 9], [3, 5, 6]]), eq = pick([[2, 5, 7], [3, 6, 9], [4, 4, 8]]), sh = pick([[2, 3, 8], [3, 4, 9], [2, 4, 10]]); return { q: '三根木棒的長度如下（公分），哪一組<b>可以</b>圍成三角形？', opts: [{ h: ok.join('、'), ok: true }, { h: eq.join('、'), ok: false, hint: `${eq[0]} + ${eq[1]} = ${eq[2]}，剛好一樣長，會躺平，圍不起來。` }, { h: sh.join('、'), ok: false, hint: `${sh[0]} + ${sh[1]} 比 ${sh[2]} 短，接不起來。` }], hint: '兩短邊的和要大於最長邊。' }; },
    { q: '三角形的三個內角加起來是幾度？', opts: [{ h: '180°', ok: true }, { h: '360°', ok: false, hint: '360° 是四邊形的內角和喔！' }, { h: '90°', ok: false, hint: '90° 只是一個直角。' }], keep: true, hint: '把三個角撕下來拼在一起，會拼成一條直線。' },
    () => { const n = rand(6, 9); return { q: `從${PNAME[n]}的一個頂點畫出所有對角線，可以分成幾個三角形？`, vis: polySVG(n, Array.from({ length: n - 3 }, (_, i) => i + 2)), opts: numOpts(n - 2, [n, n - 1, n - 3], '個'), hint: '數一數圖上的三角形！是「邊數 − 2」個。' }; },
    { q: '四邊形的內角和是幾度？', vis: shp('20,20 100,10 110,90 10,80'), opts: [{ h: '360°', ok: true }, { h: '180°', ok: false, hint: '畫一條對角線，四邊形會分成 2 個三角形。' }, { h: '540°', ok: false, hint: '540° 是五邊形的內角和。' }], keep: true },
    { q: '一個三角形有一個角是直角（90°），另外兩個角加起來是幾度？', opts: [{ h: '90°', ok: true }, { h: '180°', ok: false, hint: '三個角加起來才是 180°，要減掉直角！' }, { h: '270°', ok: false, hint: '三角形的內角和只有 180°。' }], keep: true }
  ]);
}

/* ===== 3-C 內角和挑戰 ===== */
function u3C(st) {
  quiz(st, [
    () => { const a = rand(35, 80), b = rand(30, 170 - a - 10); return { q: `三角形的兩個角是 ${a}° 和 ${b}°，第三個角是幾度？`, ans: 180 - a - b, unit: '度', hint: '三角形內角和是 180°！', after: `180 − ${a} − ${b} = ${180 - a - b}°` }; },
    () => { let a, b, c, d; do { a = rand(70, 110); b = rand(60, 120); c = rand(60, 120); d = 360 - a - b - c; } while (d < 40 || d > 150); return { q: `四邊形的三個角是 ${a}°、${b}° 和 ${c}°，第四個角是幾度？`, ans: d, unit: '度', hint: '四邊形內角和是 360°！', after: `360 − ${a} − ${b} − ${c} = ${d}°` }; },
    () => { const n = rand(7, 10); return { q: `${PNAME[n]}的內角和是幾度？`, ans: (n - 2) * 180, unit: '度', hint: `${PNAME[n]}可以切成 ${n} − 2 個三角形。`, after: `(${n} − 2) × 180 = ${(n - 2) * 180}°` }; },
    () => { const n = pick([5, 6, 8, 10]); return { q: `正${PNAME[n]}的<b>每一個</b>內角是幾度？`, ans: (n - 2) * 180 / n, unit: '度', hint: `先算內角和，再平分給 ${n} 個一樣大的角。`, after: `(${n} − 2) × 180 ÷ ${n} = ${(n - 2) * 180 / n}°` }; },
    () => { const t = pick([30, 40, 50, 70, 80, 100]); return { q: `等腰三角形的頂角是 ${t}°，一個底角是幾度？`, ans: (180 - t) / 2, unit: '度', hint: '兩個底角一樣大，先用 180 減掉頂角。', after: `(180 − ${t}) ÷ 2 = ${(180 - t) / 2}°` }; },
    () => { const a = rand(4, 8), b = rand(5, 9); return { q: `三角形的兩邊是 ${a} 公分和 ${b} 公分，第三邊是整數公分，<b>最長</b>可以是幾公分？`, ans: a + b - 1, unit: '公分', hint: `第三邊要比 ${a} + ${b} 短。`, after: `要比 ${a + b} 短，最長是 ${a + b - 1} 公分` }; }
  ]);
}

/* ===== 4-A 分數條切切看：擴分和約分 ===== */
function fbar(n, d, cls = '') { return `<div class="fbar ${cls}">${Array.from({ length: d }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`; }
function u4A(st) {
  const ex = shuffle([[2, 3, 12], [3, 4, 12], [1, 2, 8], [2, 5, 10], [3, 5, 15], [5, 6, 12]]), rd = shuffle([[6, 9], [8, 12], [4, 10], [9, 12], [6, 18], [12, 18]]);
  const rounds = [{ t: 'x', s: ex[0] }, { t: 'r', s: rd[0] }, { t: 'x', s: ex[1] }, { t: 'r', s: rd[1] }];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r];
    let n, d, goal;
    if (R.t === 'x') { [n, d, goal] = R.s; api.say(`把 ${fr(n, d)} 變成分母是 <b>${goal}</b> 的分數。用「切」的按鈕把每一格切開！`, `把${d}分之${n}變成分母是${goal}的分數`); }
    else { [n, d] = R.s; goal = red(n, d)[1]; api.say(`把 ${fr(n, d)} <b>約成最簡分數</b>。用「合」的按鈕把格子合起來，合到不能再合！`, `把${d}分之${n}約成最簡分數`); }
    const n0 = n, d0 = d;
    const draw = () => {
      st.innerHTML = `${dots(r, rounds.length)}<div class="flabel">${fr(n0, d0)} ${n !== n0 ? `= ${fr(n, d)}` : ''}</div>${fbar(n, d)}
        <div class="btns"><button type="button" class="btn blue" data-o="x2">✂ 每格切 2 份</button><button type="button" class="btn blue" data-o="x3">✂ 每格切 3 份</button>
        <button type="button" class="btn ghost" data-o="d2">🧲 每 2 格合 1 格</button><button type="button" class="btn ghost" data-o="d3">🧲 每 3 格合 1 格</button></div>
        <div class="center"><button type="button" class="btn mint" id="okB">完成了！</button></div>`;
      $$('[data-o]', st).forEach(b => b.onclick = () => {
        const o = b.dataset.o, k = +o[1];
        if (o[0] === 'x') { if (d * k > 36) return toast('格子太細了，切不下去！'); n *= k; d *= k; }
        else { if (d % k || n % k) return toast(`塗色的格子沒辦法剛好每 ${k} 格合成 1 格！`); n /= k; d /= k; }
        sfx('tap'); draw();
      });
      $('#okB', st).onclick = () => {
        if (d === goal) {
          $$('button', st).forEach(b => b.disabled = true);
          const m = R.t === 'x' ? `分子、分母同乘以 ${goal / d0}：${fr(n0, d0)} = ${fr(n, d)}（擴分）` : `分子、分母同除以 ${d0 / d}：${fr(n0, d0)} = ${fr(n, d)}（約分）`;
          api.ok(m); speak(m); r++; later(round, 2800);
        } else api.bad(R.t === 'x' ? `現在分母是 ${d}，要變成 ${goal}！` : (gcd(n, d) > 1 ? `${fr(n, d)} 還可以再約喔！` : `分母變成 ${d} 了，${fr(n0, d0)} 的最簡分數分母比較小喔！`));
      };
    };
    draw();
  }
  round();
}

/* ===== 4-B 擴分約分想一想 ===== */
function u4B(st) {
  quiz(st, [
    { q: `把 ${fr(2, 3)} 的分子和分母<b>同乘以</b> 4，變成 ${fr(8, 12)}，這叫做什麼？`, opts: [{ h: '擴分', ok: true }, { h: '約分', ok: false, hint: '約分是同「除以」一個數。' }, { h: '通分', ok: false, hint: '通分是把兩個分數變成分母一樣。' }], keep: true },
    () => { const [a, b] = pick([[3, 4], [2, 5], [5, 6]]), k = rand(2, 4); return { q: `下面哪一個分數和 ${fr(a, b)} <b>一樣大</b>？`, vis: fbar(a, b), opts: [{ h: fr(a * k, b * k), ok: true }, { h: fr(a, b * k), ok: false, hint: '分子分母要同乘一個數，只乘分母會變小！' }, { h: fr(a + k, b + k), ok: false, hint: '分子分母同「加」一個數，大小會改變喔！' }, { h: fr(a * k, b), ok: false, hint: '只乘分子會變大！' }] }; },
    () => { const ok = pick([[5, 8], [7, 9], [4, 15], [9, 10]]); return { q: '哪一個是<b>最簡分數</b>？', opts: [{ h: fr(...ok), ok: true }, ...shuffle([[6, 9], [4, 10], [10, 12], [14, 21], [8, 20]]).slice(0, 3).map(([x, y]) => ({ h: fr(x, y), ok: false, hint: `${x} 和 ${y} 都可以被 ${gcd(x, y)} 整除，還可以約分。` }))], hint: '最簡分數的分子和分母，除了 1 以外沒有其他公因數。' }; },
    () => { const [a, b] = pick([[4, 6], [6, 8], [6, 9], [4, 10]]); return { q: `把 ${fr(1, a)} 和 ${fr(1, b)} 通分，用哪一個數當公分母<b>最小</b>？`, opts: [{ h: N(lcm(a, b)), ok: true }, { h: N(a * b), ok: false, hint: `${a * b} 也可以，但不是最小的，找 ${a} 和 ${b} 的最小公倍數！` }, { h: N(a + b), ok: false, hint: `${a + b} 不是 ${a} 和 ${b} 的公倍數。` }, { h: N(b), ok: false, hint: `${b} 不是 ${a} 的倍數。` }], hint: '最小公分母就是兩個分母的最小公倍數。' }; },
    () => { const [a, b, c, d] = pick([[2, 3, 3, 5], [3, 4, 5, 7], [5, 6, 3, 4], [4, 5, 2, 3]]); const big = a * d > c * b; const L = lcm(b, d); return { q: `${fr(a, b)} 和 ${fr(c, d)}，哪一個比較大？`, opts: [{ h: fr(a, b), ok: big }, { h: fr(c, d), ok: !big }], keep: true, hint: `通分成分母 ${L} 再比分子！`, after: `${fr(a, b)} = ${fr(a * L / b, L)}，${fr(c, d)} = ${fr(c * L / d, L)}` }; },
    { q: `${fr(3, 5)} 的分子和分母<b>同時加 2</b>，變成 ${fr(5, 7)}，大小一樣嗎？`, opts: [{ h: '不一樣', ok: true }, { h: '一樣', ok: false, hint: `通分看看：${fr(3, 5)} = ${fr(21, 35)}，${fr(5, 7)} = ${fr(25, 35)}，不一樣！` }], keep: true, hint: '只有同乘或同除，分數大小才不變。', after: `${fr(3, 5)} = ${fr(21, 35)}，${fr(5, 7)} = ${fr(25, 35)}` }
  ]);
}

/* ===== 4-C 通分比大小挑戰 ===== */
function u4C(st) {
  quiz(st, [
    () => { const [a, b] = pick([[2, 3], [3, 4], [4, 5], [5, 6]]), k = rand(3, 6); return { q: `${fr(a, b)} = ${fr('□', b * k)}，□ 是多少？`, sp: `${b}分之${a}等於${b * k}分之多少`, ans: a * k, hint: `分母 ${b} 變成 ${b * k} 是乘以幾？分子也要乘一樣多！`, after: `${fr(a, b)} = ${fr(a * k, b * k)}` }; },
    () => { const [a, b] = pick([[3, 5], [2, 7], [5, 8], [3, 4]]), k = rand(2, 5); return { q: `${fr(a * k, b * k)} = ${fr(a, '□')}，□ 是多少？`, sp: `${b * k}分之${a * k}等於多少分之${a}`, ans: b, hint: `分子 ${a * k} 變成 ${a} 是除以幾？分母也要除以一樣多！`, after: `${fr(a * k, b * k)} = ${fr(a, b)}` }; },
    () => { const [a, b] = pick([[18, 24], [16, 40], [21, 28], [15, 35], [24, 36], [20, 45]]); const [x, y] = red(a, b); return { q: `把 ${fr(a, b)} 約成<b>最簡分數</b>。`, sp: `把${b}分之${a}約成最簡分數`, ans: `${x}/${y}`, hint: `分子分母同除以最大公因數 ${gcd(a, b)}！`, after: `${fr(a, b)} = ${fr(x, y)}` }; },
    () => { const [a, b] = pick([[3, 4], [4, 6], [6, 8], [6, 9], [8, 12]]); return { q: `把 ${fr(1, a)} 和 ${fr(1, b)} 通分，最小的公分母是多少？`, ans: lcm(a, b), hint: `找 ${a} 和 ${b} 的最小公倍數。`, after: `${a} 和 ${b} 的最小公倍數是 ${lcm(a, b)}` }; },
    () => { const [a, b, c, d] = pick([[3, 8, 5, 12], [5, 6, 7, 9], [2, 9, 1, 6], [7, 10, 3, 4]]), L = lcm(b, d), x = a * L / b, y = c * L / d; return { q: `在 ○ 裡填入 &gt; 或 &lt;：${fr(a, b)} ○ ${fr(c, d)}`, sp: `${b}分之${a} 和 ${d}分之${c} 比大小`, opts: [{ h: '&gt;', ok: x > y }, { h: '&lt;', ok: x < y }], keep: true, hint: `通分成分母 ${L}！`, after: `${fr(x, L)} ${x > y ? '&gt;' : '&lt;'} ${fr(y, L)}` }; },
    () => { const [a, b, c, d] = pick([[3, 8, 5, 12], [2, 3, 5, 8], [3, 4, 7, 10]]), L = lcm(b, d), x = a * L / b, y = c * L / d; return { q: `小明吃了 ${fr(a, b)} 個披薩，小華吃了 ${fr(c, d)} 個披薩，誰吃得<b>比較多</b>？`, vis: '<span style="font-size:56px">🍕</span>', opts: [{ h: '👦 小明', ok: x > y }, { h: '👧 小華', ok: y > x }], keep: true, hint: `通分成分母 ${L} 再比！`, after: `${fr(a, b)} = ${fr(x, L)}，${fr(c, d)} = ${fr(y, L)}` }; }
  ]);
}

Object.assign(LEVELS, { u3: [u3A, u3B, u3C], u4: [u4A, u4B, u4C] });
