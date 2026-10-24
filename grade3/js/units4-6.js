'use strict';
/* 第 4 單元 幾毫米 ／ 第 5 單元 角、正方形和長方形 ／ 第 6 單元 除法 */

const cmText = mm => mm % 10 === 0 ? `${mm / 10} 公分` : mm < 10 ? `${mm} 毫米` : `${Math.floor(mm / 10)} 公分 ${mm % 10} 毫米`;

/* 在尺上拖曳筆尖畫線段（每次跳 1 毫米）。onOK(毫米) 回傳 true 表示對 */
function rulerDraw(box, len, onDone) {
  let mm = 0;
  box.innerHTML = `<div class="rwrap">${rulerSVG(len, { pen: 0 })}</div>
    <div class="readout" id="rd"></div>
    <div class="center"><button type="button" class="btn ghost" id="mmL">◀ 1 毫米</button> <button type="button" class="btn ghost" id="mmR">1 毫米 ▶</button> <button type="button" class="btn mint" id="okb">好了！</button></div>`;
  const svg = $('.ruler', box), pen = $('.pen', svg), h = $('.handle', svg);
  const set = v => {
    mm = Math.max(0, Math.min(len * 10, v));
    const x = 20 + mm / 10 * CM;
    pen.setAttribute('x2', x); h.setAttribute('cx', x);
    $('#rd', box).innerHTML = `線段長：<b>${mm ? cmText(mm) : '0'}</b>`;
  };
  const toMM = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return Math.round((q.x - 20) / CM * 10); };
  let drag = false;
  svg.addEventListener('pointerdown', e => { e.preventDefault(); drag = true; try { svg.setPointerCapture(e.pointerId); } catch (er) {} set(toMM(e)); });
  svg.addEventListener('pointermove', e => { if (drag) set(toMM(e)); });
  const end = () => { if (drag) sfx('tap'); drag = false; };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  $('#mmL', box).onclick = () => { sfx('tap'); set(mm - 1); };
  $('#mmR', box).onclick = () => { sfx('tap'); set(mm + 1); };
  $('#okb', box).onclick = () => onDone(mm);
  set(0);
}

/* ===== 4-A 用尺畫線段 ===== */
function u4A(st) {
  const nz = (lo, hi) => { let v; do { v = rand(lo, hi); } while (v % 10 === 0); return v; };
  const t = [rand(3, 9) * 10, nz(31, 89), nz(21, 79), nz(41, 98)];
  const asMM = [false, false, true, false];
  let r = 0;
  function round() {
    if (r >= t.length) return api.finish();
    const v = t[r], ask = asMM[r] ? `${v} 毫米` : cmText(v);
    api.say(`從 0 開始，拖曳粉紅色的筆尖，畫出 <b class="big">${ask}</b> 長的線段。`, `畫出 ${ask} 長的線段`);
    st.innerHTML = `${dots(r, t.length)}<div id="rb"></div>`;
    rulerDraw($('#rb', st), 10, mm => {
      if (mm === v) { api.ok(`對！${ask}${asMM[r] ? ' = ' + cmText(v) : ''}`); speak(`答對了，${ask}`); r++; later(round, 1700); }
      else api.bad(mm > v ? `太長了！${asMM[r] ? `${v} 毫米 = ${cmText(v)}，` : ''}一大格 1 公分，一小格 1 毫米。` : `太短了！${asMM[r] ? `${v} 毫米 = ${cmText(v)}，` : ''}一大格 1 公分，一小格 1 毫米。`);
    });
  }
  round();
}

/* ===== 4-B 公分、毫米的換算 ===== */
function u4B(st) {
  const rounds = [
    { q: '1 公分是幾毫米？', ans: 10, unit: '毫米', hint: '尺上 1 公分裡面有 10 小格！', after: '1 公分 = 10 毫米' },
    () => { const c = rand(2, 9), m = rand(1, 9); return { q: `${c} 公分 ${m} 毫米是幾毫米？`, ans: c * 10 + m, unit: '毫米', hint: `${c} 公分是 ${c * 10} 毫米，再加 ${m} 毫米`, after: `${c * 10} + ${m} = ${c * 10 + m}（毫米）` }; },
    () => { const v = rand(21, 99); const c = Math.floor(v / 10); return { q: `${v} 毫米是 ${c} 公分又幾毫米？`, ans: v % 10, unit: '毫米', hint: `${c * 10} 毫米是 ${c} 公分，剩下的呢？`, after: `${v} 毫米 = ${cmText(v)}` }; },
    () => { const L = rand(22, 48); const s = rand(1, 3); return { q: '鉛筆有多長？（尺的前面斷掉了）', vis: `<div class="rwrap">${rulerSVG(8, { items: [{ from: s, len: L / 10, c: '#ffc93c' }] }).replace(/>(\d)<\/text>/g, (m0, d) => `>${+d + 2}</text>`)}</div>`, ans: L, unit: '毫米', hint: `從 ${s + 2} 開始，數一數有幾大格、幾小格！`, after: `長 ${L} 毫米（${cmText(L)}）` }; },
    () => { const a = rand(3, 8), m = rand(1, 9), b = a * 10 + m + pick([-3, -1, 2, 4]); const A = a * 10 + m; return { q: `${a} 公分 ${m} 毫米 ○ ${b} 毫米`, vis: `<span class="eq sm">${a} 公分 ${m} 毫米 <span class="box">?</span> ${b} 毫米</span>`, keep: true, opts: [{ h: '＞', ok: A > b }, { h: '＝', ok: A === b }, { h: '＜', ok: A < b }], hint: `先把 ${a} 公分 ${m} 毫米換成 ${A} 毫米再比！`, after: `${A} 毫米 ${A > b ? '＞' : '＜'} ${b} 毫米` }; },
    { q: '1 公尺是幾公分？', ans: 100, unit: '公分', hint: '一根公尺尺上有 100 公分！', after: '1 公尺 = 100 公分 = 1000 毫米' },
    () => pick([
      { q: '一枚 1 元硬幣大約有多厚？', keep: true, opts: [{ h: '2 毫米', ok: true }, { h: '2 公分', ok: false }, { h: '2 公尺', ok: false }], hint: '硬幣很薄，要用最小的單位！' },
      { q: '一顆橡皮擦大約有多長？', keep: true, opts: [{ h: '4 毫米', ok: false }, { h: '4 公分', ok: true }, { h: '4 公尺', ok: false }], hint: '想想看尺上 4 公分有多長。' },
      { q: '教室的門大約有多高？', keep: true, opts: [{ h: '2 毫米', ok: false }, { h: '2 公分', ok: false }, { h: '2 公尺', ok: true }], hint: '比大人還要高一點！' }
    ])
  ];
  quiz(st, rounds);
}

/* ===== 4-C 長度計算挑戰 ===== */
function u4C(st) {
  const opt3 = (v, alts) => [{ h: `<span class="small-opt">${cmText(v)}</span>`, ok: true }, ...[...new Set(alts.filter(x => x !== v && x > 0))].slice(0, 2).map(x => ({ h: `<span class="small-opt">${cmText(x)}</span>`, ok: false }))];
  const rounds = [
    () => { const a = rand(21, 59), b = rand(12, 39), s = a + b; return { q: `${cmText(a)} + ${cmText(b)} = ？`, opts: opt3(s, [s - 10, s + 10, s + 1]), hint: '毫米加毫米，滿 10 毫米換成 1 公分！', after: `= ${cmText(s)}` }; },
    () => { let a, b; do { a = rand(52, 98); b = rand(13, 48); } while (a % 10 >= b % 10); const d = a - b; return { q: `${cmText(a)} − ${cmText(b)} = ？`, opts: opt3(d, [d + 10, d - 10, d + 2]), hint: '毫米不夠減，借 1 公分當 10 毫米！', after: `= ${cmText(d)}` }; },
    () => { const c = rand(15, 85); return { q: `1 公尺 − ${c} 公分 = 幾公分？`, ans: 100 - c, unit: '公分', hint: '1 公尺 = 100 公分', after: `100 − ${c} = ${100 - c}（公分）` }; },
    () => { const m = rand(1, 3), c = rand(5, 95); return { q: `${m} 公尺 ${c} 公分是幾公分？`, ans: m * 100 + c, unit: '公分', hint: `${m} 公尺是 ${m * 100} 公分`, after: `${m * 100} + ${c} = ${m * 100 + c}（公分）` }; },
    () => { const a = rand(3, 6), m = rand(2, 8), n = rand(2, 4), L = (a * 10 + m) * n; return { q: `一段緞帶長 ${a} 公分 ${m} 毫米，${n} 段接起來一共長幾毫米？`, vis: '<span style="font-size:56px">🎀</span>', ans: L, unit: '毫米', hint: `先換成 ${a * 10 + m} 毫米，再乘以 ${n}`, after: `${a * 10 + m} × ${n} = ${L}（毫米）= ${cmText(L)}` }; },
    () => { const a = rand(8, 15), b = rand(2, 6), m = rand(1, 9); return { q: `一根吸管長 ${a} 公分，剪掉 ${b} 公分 ${m} 毫米，還剩幾毫米？`, vis: '<span style="font-size:56px">🥤</span>', ans: a * 10 - b * 10 - m, unit: '毫米', hint: `${a} 公分 = ${a * 10} 毫米，${b} 公分 ${m} 毫米 = ${b * 10 + m} 毫米`, after: `${a * 10} − ${b * 10 + m} = ${a * 10 - b * 10 - m}（毫米）` }; }
  ];
  quiz(st, rounds);
}

/* ===== 5-A 角的分類箱 ===== */
function u5A(st) {
  const kindOf = d => d === 90 ? 'right' : d < 90 ? 'acute' : 'obt';
  const HINT = { acute: '比直角小的角是銳角！', right: '和三角板的直角一樣大，是直角！', obt: '比直角大的角是鈍角！' };
  const mk = () => shuffle([pick([30, 40, 45]), pick([55, 60, 70]), 90, 90, pick([110, 120]), pick([135, 140, 150])]).map(d => ({ d, rot: d === 90 ? pick([0, 20, 35]) : rand(0, 25), len: rand(48, 64) }));
  const rounds = [mk(), mk()];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const items = rounds[r]; let left = items.length;
    api.say('把角拖進對的箱子！可以用三角板的直角比一比。', '把角拖進對的箱子');
    st.innerHTML = `${dots(r, rounds.length)}<div class="supply angs">${items.map((o, i) => `<button type="button" class="shape ashape" data-k="${kindOf(o.d)}" data-i="${i}">${angleSVG(o.d, o.rot, 88, o.len)}</button>`).join('')}</div>
      <div class="bins">${[['acute', '銳角', '#ff9a4d'], ['right', '直角', '#5bb4ff'], ['obt', '鈍角', '#a98bff']].map(([k, t, c]) => `<div class="bin" data-k="${k}" style="--c:${c}"><h4>${t}</h4></div>`).join('')}</div>`;
    const bins = $$('.bin', st);
    $$('.ashape', st).forEach(el => draggable(el, bins, hit => {
      if (hit === 'tap') { toast('把它拖到下面的箱子裡！'); return; }
      if (!hit) return;
      if (hit.dataset.k === el.dataset.k) {
        sfx('pop'); el.dataset.lock = 1; el.classList.add('in'); hit.appendChild(el); left--;
        if (!left) { api.ok('全部分好了！'); r++; later(round, 1500); }
      } else api.bad('不對喔！' + HINT[el.dataset.k]);
    }));
  }
  round();
}

/* ===== 5-B 比較角的大小 ===== */
function u5B(st) {
  const rounds = [
    () => { const a = pick([40, 50, 60]), b = a + pick([30, 40]); const big = Math.random() < .5; const [da, db] = big ? [a, b] : [b, a]; return { q: '哪一個角比較大？', vis: `<div class="dfigs"><div class="dfig">${angleSVG(da, 10, 120, 66)}<b>甲</b></div><div class="dfig">${angleSVG(db, 0, 120, 40)}<b>乙</b></div></div>`, keep: true, opts: [{ h: '甲', ok: da > db }, { h: '乙', ok: db > da }, { h: '一樣大', ok: false }], hint: '角的大小看兩條邊張開的程度，和邊的長短沒有關係！' }; },
    () => { const d = pick([45, 60, 120]); return { q: '甲、乙兩個角，哪一個比較大？', vis: `<div class="dfigs"><div class="dfig">${angleSVG(d, 0, 120, 66)}<b>甲</b></div><div class="dfig">${angleSVG(d, 20, 120, 36)}<b>乙</b></div></div>`, keep: true, opts: [{ h: '甲', ok: false }, { h: '乙', ok: false }, { h: '一樣大', ok: true }], hint: '邊比較長，角不會變大喔！把兩個角疊在一起比比看。', after: '張開的程度一樣，兩個角一樣大' }; },
    { q: '角上兩條直直的線叫做什麼？', keep: true, opts: [{ h: '邊', ok: true }, { h: '頂點', ok: false }, { h: '直角', ok: false }], hint: '兩條邊交會的點才是頂點。', after: '角有 1 個頂點和 2 個邊' },
    () => pick([
      { q: '這個角和三角板的直角比，比直角大，它是什麼角？', vis: angleSVG(130, 0, 130), keep: true, opts: [{ h: '銳角', ok: false }, { h: '直角', ok: false }, { h: '鈍角', ok: true }], hint: '比直角大的角是鈍角。' },
      { q: '這個角和三角板的直角比，比直角小，它是什麼角？', vis: angleSVG(50, 0, 130), keep: true, opts: [{ h: '銳角', ok: true }, { h: '直角', ok: false }, { h: '鈍角', ok: false }], hint: '比直角小的角是銳角。' }
    ]),
    { q: '時鐘上 3 時整，長針和短針形成什麼角？', vis: '<span style="font-size:64px">🕒</span>', keep: true, opts: [{ h: '銳角', ok: false }, { h: '直角', ok: true }, { h: '鈍角', ok: false }], hint: '長針指 12、短針指 3，剛好是直角！' },
    () => { const ds = shuffle([pick([30, 45]), 90, pick([120, 150])]); const mx = Math.max(...ds); return { q: '哪一個角最大？', opts: ds.map(d => ({ h: angleSVG(d, rand(0, 20), 80, rand(40, 60)), ok: d === mx })), hint: '看看哪一個張得最開！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 5-C 正方形和長方形 ===== */
function u5C(st) {
  const fig = (k) => k === 'sq' ? quadSVG(4, 4, 0, 90) : k === 'rect' ? quadSVG(6, 3, 0, 110) : k === 'para' ? quadSVG(5, 3, 2, 110) : quadSVG(4, 4, 1, 100);
  const rounds = [
    { q: '哪一個是<b>正方形</b>？', sp: '哪一個是正方形？', opts: ['sq', 'rect', 'para'].map(k => ({ h: fig(k), ok: k === 'sq' })), hint: '正方形 4 條邊一樣長，4 個角都是直角！' },
    { q: '哪一個是<b>長方形</b>？', sp: '哪一個是長方形？', opts: ['rect', 'para', 'rh'].map(k => ({ h: fig(k), ok: k === 'rect' })), hint: '長方形的 4 個角都是直角！' },
    { q: '正方形有幾個直角？', vis: quadSVG(4, 4, 0, 110), ans: 4, unit: '個', hint: '用三角板的直角一個一個比！', after: '正方形和長方形都有 4 個直角' },
    () => { const L = rand(6, 12), W = rand(3, L - 2); return { q: `長方形的長是 ${L} 公分、寬是 ${W} 公分，對面那一條長邊是幾公分？`, vis: `<div class="dfig">${quadSVG(6, 3, 0, 150)}<small>長 ${L} 公分、寬 ${W} 公分</small></div>`, ans: L, unit: '公分', hint: '長方形對面的兩條邊一樣長！', after: `兩條長邊都是 ${L} 公分` }; },
    () => { const s = rand(3, 9); return { q: `正方形一條邊長 ${s} 公分，4 條邊合起來是幾公分？`, vis: quadSVG(4, 4, 0, 110), ans: s * 4, unit: '公分', hint: '正方形 4 條邊一樣長！', after: `${s} + ${s} + ${s} + ${s} = ${s * 4}（公分）` }; },
    { q: '下面哪一句話是<b>對</b>的？', sp: '下面哪一句話是對的？', opts: [{ h: '<span class="small-opt">正方形的 4 條邊一樣長</span>', ok: true }, { h: '<span class="small-opt">長方形的 4 條邊一樣長</span>', ok: false }, { h: '<span class="small-opt">長方形有 2 個直角</span>', ok: false }], hint: '長方形是對邊一樣長，有 4 個直角。' }
  ];
  quiz(st, rounds);
}

/* ===== 6-A 分一分、裝一裝 ===== */
function u6A(st) {
  const E = ['🍓', '🍪', '🍬', '🥟'];
  const rounds = [
    { k: 'share', n: rand(2, 4), q: rand(3, 5), r: 0 },
    { k: 'pack', n: rand(3, 5), q: rand(3, 5), r: 0 },
    { k: 'share', n: rand(3, 4), q: rand(2, 4), r: 1 },
    { k: 'pack', n: rand(4, 6), q: rand(2, 4), r: 1 }
  ].map(o => { const rem = o.r ? rand(1, o.n - 1) : 0; return { ...o, rem, total: o.n * o.q + rem, e: pick(E) }; });
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r], share = R.k === 'share';
    const say = share ? `把 ${R.total} 個${R.e}<b>平分</b>給 ${R.n} 個盤子。點一下${R.e}，它會放進下一個盤子。` : `${R.total} 個${R.e}，每袋裝 <b>${R.n}</b> 個。點一下${R.e}把它裝進袋子。`;
    api.say(say, share ? `把 ${R.total} 個平分給 ${R.n} 個盤子` : `${R.total} 個，每袋裝 ${R.n} 個`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="supply" id="sup">${Array.from({ length: R.total }, () => `<button type="button" class="item dv">${R.e}</button>`).join('')}</div>
      <div class="plates">${Array.from({ length: share ? R.n : 0 }, (_, i) => `<div class="plate dvp" data-i="${i}"></div>`).join('')}</div>
      <div class="bags" id="bags"></div>
      <div class="center"><button type="button" class="btn mint" id="fin">分好了！</button></div><div id="ask"></div>`;
    const plates = $$('.dvp', st), cnt = Array(share ? R.n : 0).fill(0); let p = 0, bag = null, inBag = 0, bagsFull = 0;
    $$('.dv', st).forEach(b => b.onclick = () => {
      if (b.dataset.lock) return;
      sfx('pop'); b.dataset.lock = 1;
      if (share) { plates[p].appendChild(b); cnt[p]++; p = (p + 1) % R.n; }
      else {
        if (!bag || inBag === R.n) { bag = document.createElement('div'); bag.className = 'bag'; $('#bags', st).appendChild(bag); inBag = 0; }
        bag.appendChild(b); inBag++; if (inBag === R.n) { bagsFull++; bag.classList.add('full'); }
      }
    });
    $('#fin', st).onclick = () => {
      const left = $$('.dv:not([data-lock])', st).length;
      const can = share ? left >= R.n : (left + (inBag < R.n && bag ? inBag : 0)) >= R.n;
      if (can) { api.bad(share ? `還有 ${left} 個，每盤還可以再分 1 個！` : '還可以再裝滿一袋喔！'); return; }
      $('#fin', st).remove();
      const qs = share ? [[`每盤分到幾個？`, R.q], ['還剩下幾個？', R.rem]] : [['可以裝滿幾袋？', R.q], ['還剩下幾個？', R.rem]];
      let k = 0;
      const ask = () => {
        if (k >= qs.length) {
          const eq = `${R.total} ÷ ${R.n} = ${R.q}${R.rem ? ` … ${R.rem}` : ''}`;
          $('#ask', st).innerHTML = `<div class="after">${eq}</div>`; speak(eq.replace('…', '餘')); r++; later(round, 2300); return;
        }
        api.say(qs[k][0]);
        $('#ask', st).innerHTML = '<div class="numpad"></div>';
        digitPad($('.numpad', st), qs[k][1], () => { k++; later(ask, 600); }, k === 0 ? (share ? '數數看每一盤有幾個' : '數數看裝滿的袋子') : '數數看沒有分出去的');
      };
      ask();
    };
  }
  round();
}

/* ===== 6-B 餘數、奇數和偶數 ===== */
function u6B(st) {
  const rounds = [
    () => { const d = rand(3, 9), q = rand(2, 9), m = rand(1, d - 1), n = d * q + m; return { q: `${n} ÷ ${d} = ${q} … ${m}，${m} 叫做什麼？`, vis: `<span class="eq sm">${n} ÷ ${d} = ${q} … ${m}</span>`, keep: true, opts: [{ h: '商', ok: false }, { h: '餘數', ok: true }, { h: '除數', ok: false }], hint: '分完剩下的數叫做餘數。' }; },
    () => { const d = rand(4, 7); const ok = rand(1, d - 1); return { q: `一個數除以 ${d}，餘數<b>可能</b>是多少？`, sp: `一個數除以 ${d}，餘數可能是多少？`, opts: [{ h: N(ok), ok: true }, { h: N(d), ok: false }, { h: N(d + 2), ok: false }], hint: `餘數一定要比除數 ${d} 小，不然還可以再分！` }; },
    () => { const d = rand(3, 9), q = rand(3, 9), m = rand(1, d - 1), n = d * q + m; return { q: `${n} ÷ ${d} 的商是多少？`, sp: `${n} 除以 ${d} 的商是多少？`, pad: true, opts: numpadOpts(q, 0, 9), hint: `${d} 的幾倍最接近 ${n} 又不超過？`, after: `${n} ÷ ${d} = ${q} … ${m}` }; },
    () => { const n = rand(11, 49), even = n % 2 === 0; return { q: `${n} 是奇數還是偶數？`, vis: `<span class="eq">${n}</span>`, keep: true, opts: [{ h: '奇數', ok: !even }, { h: '偶數', ok: even }], hint: '看個位：0、2、4、6、8 是偶數；1、3、5、7、9 是奇數。', after: `${n} ÷ 2 ${even ? '沒有餘數，是偶數' : '餘 1，是奇數'}` }; },
    () => { const ns = shuffle([rand(5, 49) * 2, rand(5, 49) * 2 + 1, rand(5, 49) * 2 + 1]); const ev = ns.find(v => v % 2 === 0); return { q: '哪一個數是<b>偶數</b>？', sp: '哪一個數是偶數？', opts: ns.map(v => ({ h: N(v), ok: v === ev })), hint: '兩個兩個分剛好分完的是偶數，個位是 0、2、4、6、8。' }; },
    () => pick([
      () => { const d = rand(2, 9); return { q: `0 ÷ ${d} = ？`, pad: true, opts: numpadOpts(0, 0, 9), hint: `0 個平分給 ${d} 人，每人分到 0 個。`, after: `0 ÷ ${d} = 0` }; },
      () => { const n = rand(2, 9); return { q: `${n} ÷ 1 = ？`, pad: true, opts: numpadOpts(n, 0, 9), hint: `${n} 個全部給 1 個人。`, after: `${n} ÷ 1 = ${n}` }; },
      () => { const n = rand(2, 9); return { q: `${n} ÷ ${n} = ？`, pad: true, opts: numpadOpts(1, 0, 9), hint: `${n} 個平分給 ${n} 人，每人 1 個。`, after: `${n} ÷ ${n} = 1` }; }
    ])()
  ];
  quiz(st, rounds);
}

/* ===== 6-C 直式除法與應用 ===== */
function ldivHTML(n, d, q, p, m) {
  const c = v => v === '?' ? '<i class="vbox now"></i>' : v === '_' ? '<i class="vbox"></i>' : v;
  return `<div class="ldv"><div class="ldv-q">${c(q)}</div><div class="ldv-row"><span class="ldv-d">${d}</span><span class="ldv-n">${n}</span></div><div class="ldv-p">${c(p)}</div><div class="ldv-line"></div><div class="ldv-p">${c(m)}</div></div>`;
}
function u6C(st) {
  const probs = Array.from({ length: 3 }, () => { const d = rand(3, 9), q = rand(3, 9), m = rand(0, d - 1); return [d * q + m, d, q, m]; });
  let r = 0;
  function round() {
    if (r >= probs.length) return word();
    const [n, d, q, m] = probs[r];
    const steps = [
      { k: 'q', v: q, say: `${n} ÷ ${d}：商（上面）要寫多少？`, hint: `${d} 的幾倍最接近 ${n} 又不超過？` },
      { k: 'p', v: d * q, say: `${q} × ${d} 是多少？寫在 ${n} 的下面。`, hint: `${q} × ${d} = ${d * q}` },
      { k: 'm', v: m, say: `${n} − ${d * q} 是多少？這是餘數。`, hint: `${n} − ${d * q} = ${m}，餘數要比 ${d} 小！` }
    ];
    const val = { q: '_', p: '_', m: '_' };
    let i = 0;
    function step() {
      if (i >= steps.length) {
        st.innerHTML = `${dots(r + 1, probs.length + 2)}<div class="qvis">${ldivHTML(n, d, q, d * q, m)}<div class="after">${n} ÷ ${d} = ${q}${m ? ` … ${m}` : ''}</div></div>`;
        speak(`${n} 除以 ${d} 等於 ${q}${m ? '，餘 ' + m : ''}`); r++; later(round, 2100); return;
      }
      const s = steps[i], show = { ...val }; show[s.k] = '?';
      st.innerHTML = `${dots(r, probs.length + 2)}<div class="qvis">${ldivHTML(n, d, show.q, show.p, show.m)}</div><div class="kwrap"></div>`;
      api.say(s.say);
      const done = () => { val[s.k] = s.v; i++; later(step, 450); };
      if (s.v >= 10) keypad($('.kwrap', st), s.v, done, s.hint); else digitPad($('.kwrap', st), s.v, done, s.hint);
    }
    step();
  }
  function word() {
    const w = [
      () => { const d = rand(4, 8), q = rand(4, 9), m = rand(1, d - 1), n = d * q + m; return { q: `${n} 顆糖果平分給 ${d} 個小朋友，每人分到幾顆？`, vis: '<span style="font-size:56px">🍬</span>', a: q, hint: `${n} ÷ ${d}，看商！`, after: `${n} ÷ ${d} = ${q} … ${m}，每人 ${q} 顆，剩 ${m} 顆` }; },
      () => { const d = rand(5, 9), q = rand(3, 9), m = rand(1, d - 1), n = d * q + m; return { q: `${n} 枝鉛筆，每 ${d} 枝綁成一束，綁好後剩下幾枝？`, vis: '<span style="font-size:56px">✏️</span>', a: m, hint: `${n} ÷ ${d}，看餘數！`, after: `${n} ÷ ${d} = ${q} … ${m}，剩 ${m} 枝` }; }
    ];
    let k = 0;
    const once = () => {
      if (k >= w.length) return api.finish();
      const R = w[k]();
      st.innerHTML = `${dots(probs.length + k, probs.length + 2)}<div class="qvis">${R.vis}</div><div class="numpad"></div>`;
      api.say(R.q);
      digitPad($('.numpad', st), R.a, () => {
        $('.qvis', st).insertAdjacentHTML('beforeend', `<div class="after">${R.after}</div>`); speak(R.after.replace(/…/g, '餘')); k++; later(once, 2300);
      }, R.hint);
    };
    once();
  }
  round();
}

LEVELS.u4 = [u4A, u4B, u4C];
LEVELS.u5 = [u5A, u5B, u5C];
LEVELS.u6 = [u6A, u6B, u6C];
