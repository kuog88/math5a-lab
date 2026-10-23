'use strict';
/* 第 1 單元 質因數分解和短除法 ／ 第 2 單元 分數的除法 */

/* 短除法的樣子：rows = [[除數, [數...]], ...]，last = 最後一列的商 */
function ladderHTML(rows, last) {
  return `<div class="ladder">${rows.map(([p, ns]) => `<div class="lrow"><span class="ld">${p}</span><span class="lvs">${ns.map(n => `<span>${n}</span>`).join('')}</span></div>`).join('')}<div class="lrow"><span class="ld"></span><span class="lvs end">${last.map(n => `<span>${n}</span>`).join('')}</span></div></div>`;
}

/* ===== 1-A 短除法拆拆看：點質數去除，做出質因數分解、最大公因數、最小公倍數 ===== */
function u1A(st) {
  const singles = shuffle([36, 48, 60, 72, 84, 90, 100, 126, 132, 150, 168, 180]).slice(0, 2);
  const pairs = shuffle([[12, 18], [24, 36], [30, 45], [36, 48], [40, 60], [28, 42], [54, 72]]).slice(0, 2);
  const plans = [...singles.map(n => [n]), ...pairs];
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const start = plans[r], two = start.length === 2;
    let now = start.slice(); const rows = [];
    api.say(two
      ? `用短除法找 <b>${start[0]}</b> 和 <b>${start[1]}</b> 的公因數：點一個質數，<b>兩個數都要能被它整除</b>。除到兩數互質就停。`
      : `用短除法把 <b class="big">${start[0]}</b> 做質因數分解：點一個能整除它的質數，除到商是質數就停。`);
    const draw = () => {
      st.innerHTML = `${dots(r, plans.length)}<div class="qvis">${ladderHTML(rows, now)}</div>
        <div class="opts">${[2, 3, 5, 7].map(p => `<button type="button" class="opt pbtn" data-p="${p}">${N(p)}</button>`).join('')}</div>
        <div class="center"><button type="button" class="btn mint" id="stopB">除完了！</button></div>`;
      $$('.pbtn', st).forEach(b => b.onclick = () => {
        const p = +b.dataset.p;
        if (now.some(n => n % p)) return api.bad(two ? `${now.join(' 和 ')} 不是都能被 ${p} 整除喔！` : `${now[0]} 不能被 ${p} 整除喔！`);
        if (!two && isPrime(now[0])) return api.bad(`${now[0]} 已經是質數了，可以停了！`);
        sfx('pop'); rows.push([p, now.slice()]); now = now.map(n => n / p); draw();
      });
      $('#stopB', st).onclick = () => {
        const doneOK = two ? gcd(now[0], now[1]) === 1 : isPrime(now[0]);
        if (!doneOK) return api.bad(two ? `${now.join(' 和 ')} 還有公因數，繼續除！` : `${now[0]} 還不是質數，還可以再除！`);
        const ps = rows.map(x => x[0]);
        let msg, sp;
        if (two) {
          const g = ps.reduce((a, b) => a * b, 1), l = g * now[0] * now[1];
          msg = `最大公因數 = ${ps.join('×')} = <b>${g}</b><br>最小公倍數 = ${[...ps, ...now].join('×')} = <b>${l}</b>`;
          sp = `最大公因數是 ${g}，最小公倍數是 ${l}`;
        } else {
          const all = [...ps, now[0]].sort((a, b) => a - b);
          msg = `${start[0]} = ${all.join(' × ')}`; sp = msg;
        }
        api.ok(); $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${msg}</div>`); speak(sp);
        $$('button', st).forEach(b => b.disabled = true);
        r++; later(round, 3200);
      };
    };
    draw();
  }
  round();
}

/* ===== 1-B 質數與質因數 ===== */
function u1B(st) {
  quiz(st, [
    () => {
      const p = pick([23, 29, 31, 37, 41, 43, 47, 53, 59]), cs = shuffle([21, 27, 33, 39, 49, 51, 57, 63, 91]).slice(0, 3);
      return { q: '哪一個是<b>質數</b>？', sp: '哪一個是質數？', opts: [{ h: N(p), ok: true }, ...cs.map(c => ({ h: N(c), ok: false, hint: `${c} = ${primeFactors(c).join('×')}，它是合數喔！` }))], hint: '質數只有 1 和自己兩個因數。' };
    },
    { q: '1 是質數還是合數？', opts: [{ h: '都不是', ok: true }, { h: '質數', ok: false }, { h: '合數', ok: false }], hint: '1 只有 1 個因數，所以既不是質數，也不是合數。', after: '1 既不是質數，也不是合數' },
    () => {
      const n = pick([60, 84, 90, 126, 140, 150]), f = primeFactors(n);
      const w1 = `${f[0]}×${n / f[0]}`, w2 = `${f[0]}×${f[1]}×${n / f[0] / f[1]}`;
      const w3 = [...f.slice(0, -1), f[f.length - 1] + 2].join('×');
      return { q: `<b class="big">${n}</b> 的質因數分解，哪一個正確？`, sp: `${n} 的質因數分解，哪一個正確？`, opts: [
        { h: f.join('×'), ok: true },
        { h: w1, ok: false, hint: `${n / f[0]} 不是質數，還可以再分解！` },
        { h: w2, ok: false, hint: `${n / f[0] / f[1]} 不是質數喔！` },
        { h: w3, ok: false, hint: '乘起來不等於原來的數喔！' }
      ].filter((o, i, a) => a.findIndex(x => x.h === o.h) === i) };
    },
    () => {
      const n = pick([42, 66, 70, 78, 105, 110]), f = [...new Set(primeFactors(n))];
      const good = pick(f), bad = shuffle([2, 3, 5, 7, 11, 13].filter(p => n % p)).slice(0, 2);
      return { q: `哪一個是 <b class="big">${n}</b> 的<b>質因數</b>？`, sp: `哪一個是 ${n} 的質因數？`, opts: [{ h: N(good), ok: true }, ...bad.map(b => ({ h: N(b), ok: false, hint: `${n} 不能被 ${b} 整除喔！` })), { h: N(n / good), ok: false, hint: `${n / good} 是 ${n} 的因數，但它不是質數！` }].filter((o, i, a) => a.findIndex(x => x.h === o.h) === i) };
    },
    () => {
      const ok = pick([[8, 15], [9, 14], [16, 21], [10, 27], [25, 12]]), no = shuffle([[12, 18], [15, 25], [14, 21], [16, 24], [9, 27]]).slice(0, 2);
      return { q: '哪一組數<b>互質</b>（最大公因數是 1）？', sp: '哪一組數互質？最大公因數是 1', opts: [{ h: `${ok[0]} 和 ${ok[1]}`, ok: true }, ...no.map(([a, b]) => ({ h: `${a} 和 ${b}`, ok: false, hint: `${a} 和 ${b} 的最大公因數是 ${gcd(a, b)}，不是 1！` }))] };
    }
  ]);
}

/* ===== 1-C 公因數公倍數挑戰 ===== */
function u1C(st) {
  const pair = () => { const g = pick([2, 3, 4, 6, 8, 12]); const [x, y] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]]); return [g * x, g * y, g]; };
  quiz(st, [
    () => { const [a, b, g] = pair(); return { q: `<b>${a}</b> 和 <b>${b}</b> 的<b>最大公因數</b>是多少？`, sp: `${a} 和 ${b} 的最大公因數是多少？`, ans: g, hint: '用短除法，把左邊的除數乘起來！', after: `${a} 和 ${b} 的最大公因數是 ${g}` }; },
    () => { const [a, b] = pair(); const l = lcm(a, b); return { q: `<b>${a}</b> 和 <b>${b}</b> 的<b>最小公倍數</b>是多少？`, sp: `${a} 和 ${b} 的最小公倍數是多少？`, ans: l, hint: '短除法：左邊的除數和最下面的商全部乘起來！', after: `${a} 和 ${b} 的最小公倍數是 ${l}` }; },
    () => { const [a, b, g] = pair(); return { q: `兩條緞帶長 ${a} 公分和 ${b} 公分，要剪成<b>一樣長</b>的小段，都沒有剩下。每段<b>最長</b>幾公分？`, vis: '<span style="font-size:56px">🎀✂️</span>', ans: g, unit: '公分', hint: '每段長度要同時是兩個數的因數，而且最大！', after: `${a} 和 ${b} 的最大公因數是 ${g}，每段最長 ${g} 公分` }; },
    () => { const [a, b] = pick([[6, 8], [8, 12], [10, 15], [12, 18], [6, 9], [9, 12]]); const l = lcm(a, b); return { q: `紅色公車每 ${a} 分鐘一班，藍色公車每 ${b} 分鐘一班。早上 7 點同時發車，<b>最少再過幾分鐘</b>又會同時發車？`, vis: '<span style="font-size:56px">🚌 🚍</span>', ans: l, unit: '分鐘', hint: '要同時是兩個數的倍數，而且最小！', after: `${a} 和 ${b} 的最小公倍數是 ${l}，再過 ${l} 分鐘` }; },
    () => { const [a, b] = pick([[4, 6], [6, 8], [6, 9], [8, 12], [10, 15]]); const l = lcm(a, b); return { q: `用長 ${a} 公分、寬 ${b} 公分的長方形卡片，同方向排成一個<b>最小的正方形</b>，正方形邊長是幾公分？`, vis: '<span style="font-size:56px">🟨🟨</span>', ans: l, unit: '公分', hint: '邊長要同時是長和寬的倍數，而且最小！', after: `邊長是 ${a} 和 ${b} 的最小公倍數 ${l} 公分` }; },
    () => { const [a, b, g] = pair(); return { q: `有 ${a} 顆糖果和 ${b} 塊餅乾，平分給一些小朋友，剛好分完。<b>最多</b>可以分給幾人？`, vis: '<span style="font-size:56px">🍬🍪</span>', ans: g, unit: '人', hint: '人數要同時能整除兩個數，而且最多！', after: `最多分給 ${g} 人` }; }
  ]);
}

/* ===== 2-A 果汁分裝：一杯一杯倒，看看能倒幾杯、剩多少 ===== */
function u2A(st) {
  const plans = shuffle([[6, 7, 2, 7], [7, 9, 2, 9], [9, 10, 3, 10]]).slice(0, 2).concat([pick([[5, 6, 1, 4], [7, 8, 1, 3], [3, 4, 1, 6]]), pick([[2, 1, 2, 5], [3, 1, 3, 4], [2, 1, 1, 3]])]);
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [a, b, c, d] = plans[r], D = lcm(b, d), T = a * D / b, m = c * D / d;
    const q = Math.floor(T / m), rem = T % m, L = Math.ceil(T / D);
    let left = T, cups = 0;
    const tot = fr(a, b), each = fr(c, d);
    const tong = b !== d && b !== 1 ? `先通分：${fr(a, b)} = ${fr(T, D)}，${fr(c, d)} = ${fr(m, D)}` : b === 1 ? `${a} 公升 = ${fr(T, D)} 公升` : '';
    api.say(`有 ${tot} 公升果汁，每杯裝 ${each} 公升。按「倒一杯」一直倒，倒不滿一杯時按「倒不下了」。`);
    st.innerHTML = `${dots(r, plans.length)}
      <div class="readout">${tot} ÷ ${each} = ？${tong ? `<br><small>${tong}</small>` : ''}</div>
      <div class="bars">${Array.from({ length: L }, (_, l) => `<div class="bar">${Array.from({ length: D }, (_, k) => { const i = l * D + k; return `<i class="${i < T ? 'j' : ''}" data-i="${i}"></i>`; }).join('')}</div>`).join('')}</div>
      <div class="cupsrow" id="cups"></div>
      <div class="center"><button type="button" class="btn" id="pourB">🥤 倒一杯</button> <button type="button" class="btn blue" id="stopB">倒不下了</button></div>`;
    const color = ['#ff9a4d', '#5bb4ff', '#3fcf9c', '#a98bff', '#ff7eb3', '#ffc93c'];
    $('#pourB', st).onclick = () => {
      if (left < m) return api.bad(`剩下 ${fr(left, D)} 公升，不夠倒滿一杯了！`);
      for (let k = 0; k < m; k++) { const i = T - left + k, s = $(`.bar i[data-i="${i}"]`, st); s.className = 'p'; s.style.background = color[cups % color.length]; }
      left -= m; cups++; sfx('pop');
      $('#cups', st).insertAdjacentHTML('beforeend', `<span class="cup" style="--c:${color[(cups - 1) % color.length]}">🥤<b>${cups}</b></span>`);
    };
    $('#stopB', st).onclick = () => {
      if (left >= m) return api.bad('還可以再倒一杯喔！');
      $$('button', st).forEach(b => b.disabled = true); api.ok();
      const ans = rem ? `${q} 杯，剩下 ${fr(rem, D)} 公升` : `剛好 ${q} 杯`;
      const ansSp = rem ? `${q} 杯，剩下 ${frSp(rem, D)} 公升` : `剛好 ${q} 杯`;
      later(() => {
        const opts = [{ h: ans, ok: true }];
        if (rem) opts.push({ h: `${q} 杯，剩下 ${fr(rem, m)} 公升`, ok: false, hint: `剩下的是 ${rem} 個 ${fr(1, D)} 公升，要用公升來說！` });
        opts.push({ h: `${q + 1} 杯${rem ? '' : '，剩下 0 公升'}`, ok: false, hint: '數一數倒滿的杯子！' });
        if (!rem) opts.push({ h: `${q - 1} 杯，剩下 ${fr(m, D)} 公升`, ok: false, hint: '剩下的還能倒一杯喔！' });
        st.insertAdjacentHTML('beforeend', '<div class="opts" id="o2"></div>');
        api.say(`${tot} 公升倒成每杯 ${each} 公升，結果是？`, `${spText(tot)} 公升倒成每杯 ${spText(each)} 公升，結果是？`);
        shuffle(opts).forEach(o => $('#o2', st).appendChild(optBtn(o, () => { toast(`${tot} ÷ ${each} = ${rem ? `${q} … ${fr(rem, D)}` : q}`); speak(ansSp); r++; later(round, 2600); })));
      }, 700);
    };
  }
  round();
}

/* ===== 2-B 分數除法想一想 ===== */
function u2B(st) {
  quiz(st, [
    () => { const ok = pick([[7, 12], [5, 9], [8, 15], [11, 14]]); const no = shuffle([[9, 12], [10, 15], [8, 14], [6, 21], [12, 16]]).slice(0, 3); return { q: '哪一個是<b>最簡分數</b>？', opts: [{ h: fr(...ok), ok: true }, ...no.map(([a, b]) => ({ h: fr(a, b), ok: false, hint: `${a} 和 ${b} 都能被 ${gcd(a, b)} 整除，還能約分！` }))], hint: '分子和分母互質，才是最簡分數。' }; },
    () => { const [a, b, c, d] = pick([[3, 4, 2, 5], [2, 3, 5, 7], [5, 6, 3, 4], [4, 9, 2, 3]]); return { q: `${fr(a, b)} ÷ ${fr(c, d)} 可以改成哪一個算式？`, opts: [{ h: `${fr(a, b)} × ${fr(d, c)}`, ok: true }, { h: `${fr(b, a)} × ${fr(c, d)}`, ok: false, hint: '是除數要顛倒，不是被除數！' }, { h: `${fr(a, b)} × ${fr(c, d)}`, ok: false, hint: '除以一個數，要乘以它的倒數喔！' }, { h: `${fr(b, a)} × ${fr(d, c)}`, ok: false, hint: '被除數不用顛倒！' }], hint: '除以一個分數 = 乘以它的倒數。' }; },
    () => { const n = pick([12, 15, 20, 24]), [c, d] = pick([[3, 4], [2, 5], [5, 6], [1, 3]]); return { q: `不用算，${n} ÷ ${fr(c, d)} 的商會比 ${n} 大還是小？`, sp: `不用算，${n} 除以 ${d}分之${c} 的商會比 ${n} 大還是小？`, opts: [{ h: `比 ${n} 大`, ok: true }, { h: `比 ${n} 小`, ok: false }, { h: `和 ${n} 一樣`, ok: false }], keep: true, hint: '除數比 1 小，商就比被除數大！', after: `除數 ${fr(c, d)} 比 1 小，商比 ${n} 大` }; },
    () => { const n = pick([6, 8, 10, 14]), [c, d] = pick([[5, 4], [7, 3], [3, 2], [9, 5]]); return { q: `不用算，${n} ÷ ${fr(c, d)} 的商會比 ${n} 大還是小？`, sp: `不用算，${n} 除以 ${d}分之${c} 的商會比 ${n} 大還是小？`, opts: [{ h: `比 ${n} 大`, ok: false }, { h: `比 ${n} 小`, ok: true }, { h: `和 ${n} 一樣`, ok: false }], keep: true, hint: '除數比 1 大，商就比被除數小！', after: `除數 ${fr(c, d)} 比 1 大，商比 ${n} 小` }; },
    { q: `有 ${fr(5, 6)} 公升果汁，每杯倒 ${fr(1, 3)} 公升，可以倒滿幾杯、剩下多少公升？`, sp: '有 6分之5 公升果汁，每杯倒 3分之1 公升，可以倒滿幾杯、剩下多少公升？', vis: '<span style="font-size:56px">🧃➜🥤🥤</span>', opts: [{ h: `2 杯，剩 ${fr(1, 6)} 公升`, ok: true }, { h: `2 杯，剩 ${fr(1, 2)} 公升`, ok: false, hint: `${fr(1, 2)} 是剩下半杯，不是半公升！` }, { h: `3 杯，剩 0 公升`, ok: false, hint: `3 杯要 1 公升，果汁不夠！` }], hint: `先通分：${fr(5, 6)} = ${fr(5, 6)}、${fr(1, 3)} = ${fr(2, 6)}`, after: `${fr(5, 6)} ÷ ${fr(1, 3)} = 2 … ${fr(1, 6)}` }
  ]);
}

/* ===== 2-C 分數除法挑戰 ===== */
function u2C(st) {
  const ansOf = (p, q) => { [p, q] = red(p, q); return q === 1 ? p : `${p}/${q}`; };
  const K = ['_', '/'];
  const tail = '（可以寫假分數或帶分數，要約到最簡）';
  quiz(st, [
    () => { const b = pick([5, 7, 9, 11]), c = rand(1, 3), a = c * rand(2, 3) + rand(0, 1); const A = Math.min(a, b - 1); return { q: `${fr(A, b)} ÷ ${fr(c, b)} = ？`, ans: ansOf(A, c), keys: K, hint: '分母一樣，就用分子除以分子！', after: `${fr(A, b)} ÷ ${fr(c, b)} = ${A} ÷ ${c} = ${frm(A, c)}` }; },
    () => { const n = rand(2, 6), [c, d] = pick([[2, 3], [3, 4], [2, 5], [4, 5], [3, 7]]); return { q: `${n} ÷ ${fr(c, d)} = ？`, ans: ansOf(n * d, c), keys: K, hint: `除以 ${fr(c, d)} 就是乘以 ${fr(d, c)}`, after: `${n} × ${fr(d, c)} = ${frm(n * d, c)}` }; },
    () => { const [a, b] = pick([[4, 5], [6, 7], [8, 9], [9, 10]]), n = pick([2, 3, 4]); return { q: `${fr(a, b)} ÷ ${n} = ？`, ans: ansOf(a, b * n), keys: K, hint: `除以 ${n} 就是乘以 ${fr(1, n)}`, after: `${fr(a, b)} × ${fr(1, n)} = ${frm(a, b * n)}` }; },
    () => { const [a, b, c, d] = pick([[3, 4, 2, 3], [5, 6, 3, 8], [7, 10, 2, 5], [2, 3, 4, 9], [5, 8, 5, 6]]); return { q: `${fr(a, b)} ÷ ${fr(c, d)} = ？`, sp: `${b}分之${a} 除以 ${d}分之${c} 等於多少？${tail}`, ans: ansOf(a * d, b * c), keys: K, hint: '乘以除數的倒數，再約分！', after: `${fr(a, b)} × ${fr(d, c)} = ${frm(a * d, b * c)}` }; },
    () => { const [a, b, c, d] = pick([[3, 4, 3, 8], [9, 10, 3, 10], [5, 6, 5, 12], [4, 5, 2, 15]]); const q = a * d / (b * c); return { q: `一條緞帶長 ${fr(a, b)} 公尺，每 ${fr(c, d)} 公尺做一個蝴蝶結，可以做幾個？`, vis: '<span style="font-size:56px">🎀</span>', ans: q, unit: '個', keys: K, hint: '緞帶長 ÷ 每個要用的長度', after: `${fr(a, b)} ÷ ${fr(c, d)} = ${q}（個）` }; },
    () => { const [a, b, c, d] = pick([[2, 3, 1, 4], [3, 5, 1, 3], [3, 4, 1, 2], [4, 5, 2, 3]]); return { q: `小華 ${fr(c, d)} 小時走了 ${fr(a, b)} 公里，照這樣走，1 小時走幾公里？`, vis: '<span style="font-size:56px">🚶</span>', ans: ansOf(a * d, b * c), unit: '公里', keys: K, hint: '走的距離 ÷ 用的時間', after: `${fr(a, b)} ÷ ${fr(c, d)} = ${frm(a * d, b * c)}（公里）` }; }
  ]);
}

Object.assign(LEVELS, { u1: [u1A, u1B, u1C], u2: [u2A, u2B, u2C] });
