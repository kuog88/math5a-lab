'use strict';
/* 第 7 單元 認識形狀 ／ 第 8 單元 減一減與加減應用 ／ 第 9 單元 讀鐘錶 */
const SHAPE_C = ['#ff7eb3', '#5bb4ff', '#3fcf9c', '#ffc93c', '#a98bff', '#ff9a4d'];

/* ===== 7-A 形狀分類：拖到對的框框 ===== */
function u7A(st) {
  const types = ['circle', 'tri', 'square', 'rect'];
  const items = shuffle(types.flatMap(t => [0, 1].map(k => ({
    t, svg: shapeSVG(t, pick(SHAPE_C), { v: rand(0, 2), rot: t === 'tri' ? rand(0, 3) * 30 : t === 'rect' ? (k ? 90 : 0) : t === 'square' ? (k ? 15 : 0) : 0, scale: k ? 0.7 : 1 })
  }))));
  let left = items.length, sel = null;
  api.say('把每個形狀<b>拖到</b>對的框框裡！（也可以先點形狀，再點框框）', '把每個形狀拖到對的框框裡！');
  st.innerHTML = `<div class="supply"></div><div class="bins">${[['circle', '#ff7eb3'], ['tri', '#5bb4ff'], ['square', '#3fcf9c'], ['rect', '#ffc93c']].map(([t, c]) => `<div class="bin" data-t="${t}" style="--c:${c}"><h4>${SHAPE_NAME[t]}</h4></div>`).join('')}</div>`;
  const sup = $('.supply', st), bins = $$('.bin', st);
  function put(el, bin) {
    if (bin.dataset.t === el.dataset.t) {
      bin.insertAdjacentHTML('beforeend', el.innerHTML); el.remove(); sel = null; sfx('ok'); left--;
      if (!left) { api.ok('全部分好了！'); later(() => api.finish(), 900); }
    } else api.bad(`這個不是${SHAPE_NAME[bin.dataset.t]}喔！數數看有幾個角？`);
  }
  items.forEach(it => {
    const b = document.createElement('div'); b.className = 'shape'; b.dataset.t = it.t; b.innerHTML = it.svg;
    draggable(b, bins, hit => {
      if (hit === 'tap') { $$('.shape', st).forEach(x => x.style.outline = ''); sel = b; b.style.outline = '4px solid #ffc93c'; b.style.borderRadius = '12px'; sfx('tap'); }
      else if (hit) put(b, hit);
    });
    sup.appendChild(b);
  });
  bins.forEach(bin => bin.addEventListener('click', () => { if (sel) put(sel, bin); }));
}

/* ===== 7-B 找形狀：轉一轉、變大變小還是一樣的形狀 ===== */
function u7B(st) {
  const c = () => pick(SHAPE_C);
  const o = (t, ok, opt = {}) => ({ h: shapeSVG(t, c(), opt), ok });
  const rounds = [
    () => ({ q: '哪一個是<b>三角形</b>？', opts: [o('tri', true, { v: rand(0, 2), rot: rand(0, 5) * 30 }), o('openTri', false), o('square', false)], hint: '三角形有 3 條邊、3 個角，邊要連起來喔！' }),
    () => ({ q: '哪一個是<b>圓形</b>？', opts: [o('circle', true, { scale: 0.6 }), o('ellipse', false), o('hex', false)], hint: '圓形圓圓的，沒有角，每個地方都一樣圓！', after: '小小的也是圓形！' }),
    () => ({ q: '哪一個是<b>正方形</b>？', opts: [o('square', true, { rot: 30 }), o('rect', false), o('tri', false)], hint: '正方形 4 條邊一樣長！轉一轉還是正方形喔！', after: '斜斜放的也是正方形！' }),
    () => ({ q: '哪一個是<b>長方形</b>？', opts: [o('rect', true, { rot: 90 }), o('square', false), o('ellipse', false)], hint: '長方形有 4 個角，有 2 條長邊、2 條短邊！', after: '直直站著的也是長方形！' }),
    () => ({ q: '哪一個<b>不是</b>三角形？', opts: [o('tri', false, { v: 0 }), o('tri', false, { v: 1, rot: 90 }), o('openTri', true)], hint: '找找看哪一個的邊沒有連起來！', after: '邊沒有圍起來，就不是三角形！' })
  ];
  quiz(st, rounds);
}

/* ===== 7-C 數形狀：圖畫裡有幾個？（點圖形可以做記號） ===== */
const PICS = {
  house: { name: '房子', n: { tri: 1, square: 1, rect: 1, circle: 3 }, svg: `
    <circle class="pk" cx="250" cy="45" r="28" fill="#ffc93c" stroke="#4a3b5c" stroke-width="3"/>
    <polygon class="pk" points="150,30 250,110 50,110" fill="#ff7eb3" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="70" y="110" width="160" height="140" fill="#fff4dc" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="130" y="180" width="40" height="70" fill="#a98bff" stroke="#4a3b5c" stroke-width="3"/>
    <circle class="pk" cx="105" cy="150" r="18" fill="#5bb4ff" stroke="#4a3b5c" stroke-width="3"/>
    <circle class="pk" cx="195" cy="150" r="18" fill="#5bb4ff" stroke="#4a3b5c" stroke-width="3"/>` },
  rocket: { name: '火箭', n: { tri: 3, rect: 1, circle: 2, square: 0 }, svg: `
    <polygon class="pk" points="150,15 190,80 110,80" fill="#ff7eb3" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="110" y="80" width="80" height="140" fill="#e2f3ff" stroke="#4a3b5c" stroke-width="3"/>
    <polygon class="pk" points="110,170 110,230 65,230" fill="#ff9a4d" stroke="#4a3b5c" stroke-width="3"/>
    <polygon class="pk" points="190,170 190,230 235,230" fill="#ff9a4d" stroke="#4a3b5c" stroke-width="3"/>
    <circle class="pk" cx="150" cy="115" r="18" fill="#ffc93c" stroke="#4a3b5c" stroke-width="3"/>
    <circle class="pk" cx="150" cy="165" r="14" fill="#ffc93c" stroke="#4a3b5c" stroke-width="3"/>` },
  robot: { name: '機器人', n: { tri: 1, square: 1, rect: 5, circle: 2 }, svg: `
    <polygon class="pk" points="150,8 168,38 132,38" fill="#ff7eb3" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="110" y="38" width="80" height="80" fill="#e2f3ff" stroke="#4a3b5c" stroke-width="3"/>
    <circle class="pk" cx="133" cy="72" r="11" fill="#ffc93c" stroke="#4a3b5c" stroke-width="3"/>
    <circle class="pk" cx="167" cy="72" r="11" fill="#ffc93c" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="100" y="124" width="100" height="70" fill="#3fcf9c" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="50" y="130" width="46" height="20" fill="#a98bff" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="204" y="130" width="46" height="20" fill="#a98bff" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="112" y="198" width="22" height="52" fill="#ff9a4d" stroke="#4a3b5c" stroke-width="3"/>
    <rect class="pk" x="166" y="198" width="22" height="52" fill="#ff9a4d" stroke="#4a3b5c" stroke-width="3"/>` }
};
function u7C(st) {
  const qs = [['house', 'circle'], ['rocket', 'tri'], ['robot', 'rect'], ['house', 'tri'], ['robot', 'circle']];
  st.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.pk'); if (t) { t.classList.toggle('marked'); sfx('tap'); } });
  quiz(st, qs.map(([p, t]) => () => {
    const pic = PICS[p], ans = pic.n[t];
    return {
      q: `${pic.name}裡有幾個<b>${SHAPE_NAME[t]}</b>？<br><small>（點一下圖形可以做記號）</small>`, sp: `${pic.name}裡有幾個${SHAPE_NAME[t]}？`,
      vis: `<div class="pic"><svg viewBox="0 0 300 260">${pic.svg}</svg></div>`,
      opts: numOpts(ans, 0, 6), hint: `一個一個找${SHAPE_NAME[t]}，找到就點一下做記號！`
    };
  }));
}

/* ===== 8-A 飛走了：拿走型減法 ===== */
function u8A(st) {
  let r = 0; const R = 3;
  function round() {
    if (r >= R) return api.finish();
    const n = rand(5, 10), b = rand(1, Math.min(5, n - 1)), e = r === 1 ? '🍪' : '🎈';
    const verb = e === '🎈' ? '飛走' : '吃掉';
    let gone = 0;
    api.say(`有 ${n} 個 ${e}，${verb}了 ${b} 個。點一點，讓 <b class="big">${b}</b> 個${verb}！`, `有 ${n} 個，${verb}了 ${b} 個。點一點，讓 ${b} 個${verb}！`);
    st.innerHTML = `${dots(r, R)}<div class="field" style="height:220px"></div><div class="qvis"></div><div class="opts"></div>`;
    const f = $('.field', st);
    scatter(n, 5, 2).forEach(([x, y]) => {
      const t = document.createElement('button'); t.type = 'button'; t.className = 'thing balloon'; t.textContent = e;
      t.style.left = x + '%'; t.style.top = y + '%';
      t.onclick = () => {
        if (t.dataset.gone) return;
        if (gone >= b) { toast(`只有 ${b} 個${verb}喔！`); return; }
        t.dataset.gone = 1; gone++; sfx('pop');
        if (e === '🎈') t.classList.add('away'); else { t.textContent = '💨'; t.style.opacity = '.35'; }
        speak(String(gone));
        if (gone === b) later(ask, 900);
      };
      f.appendChild(t);
    });
    function ask() {
      api.say(`${n} 個${verb}了 ${b} 個，還剩幾個？`);
      $('.qvis', st).innerHTML = `<span class="eq">${n} − ${b} = <span class="box">?</span></span>`;
      numOpts(n - b, 0, 10).forEach(o => $('.opts', st).appendChild(optBtn(o, () => {
        $('.box', st).textContent = n - b; speak(`${n} 減 ${b} 等於 ${n - b}`); r++; later(round, 1800);
      }, '數一數還留下來的！')));
    }
  }
  round();
}

/* ===== 8-B 加還是減：讀題選算式 ===== */
function u8B(st) {
  const bank = [
    (a, b) => [`池塘有 ${a} 隻小鴨，游走了 ${b} 隻，還剩幾隻？`, '-'],
    (a, b) => [`籃子裡有 ${a} 顆蘋果，媽媽又放進 ${b} 顆，現在有幾顆？`, '+'],
    (a, b) => [`哥哥有 ${a} 張貼紙，我有 ${b} 張，哥哥比我多幾張？`, '-'],
    (a, b) => [`妹妹有 ${a} 顆糖，吃掉 ${b} 顆，還有幾顆？`, '-'],
    (a, b) => [`公車上有 ${a} 個人，又上車 ${b} 個人，現在有幾個人？`, '+'],
    (a, b) => [`紅花有 ${a} 朵，黃花有 ${b} 朵，一共有幾朵？`, '+']
  ];
  quiz(st, shuffle(bank).map(fn => () => {
    const a = rand(5, 9), bb = rand(1, Math.min(4, 10 - a));
    const [q, op] = fn(a, bb);
    const plus = `${a} + ${bb} = ${a + bb}`, minus = `${a} − ${bb} = ${a - bb}`;
    return {
      q: `${q}<br><small>選出對的算式：</small>`, sp: q,
      opts: [{ h: `<span class="eq" style="font-size:30px">${plus}</span>`, ok: op === '+' }, { h: `<span class="eq" style="font-size:30px">${minus}</span>`, ok: op === '-' }],
      hint: op === '+' ? '「又來了」、「一共」是變多，用加法！' : '「走了」、「吃掉」、「多幾個」用減法！'
    };
  }));
}

/* ===== 8-C 加減快手 ===== */
function u8C(st) {
  const rounds = Array.from({ length: 8 }, (_, k) => () => {
    if (k < 4) { const a = rand(2, 10), b = k === 3 ? a : rand(0, a); return { q: `${a} − ${b} = ？`, vis: `<span class="eq">${a} − ${b} = <span class="box">?</span></span>`, opts: numpadOpts(a - b), pad: true, hint: b === a ? '全部拿走，就一個都不剩！' : b === 0 ? '減 0 就是沒有拿走！' : `從 ${a} 往回數 ${b} 個！` }; }
    if (k < 6) { const a = rand(1, 8), b = rand(1, 10 - a); return { q: `${a} + ${b} = ？`, vis: `<span class="eq">${a} + ${b} = <span class="box">?</span></span>`, opts: numpadOpts(a + b), pad: true, hint: `從 ${a} 往後數 ${b} 個！` }; }
    const a = rand(5, 10), c = rand(0, a - 1);
    return { q: '空格裡要填幾？', vis: `<span class="eq">${a} − <span class="box">?</span> = ${c}</span>`, opts: numpadOpts(a - c), pad: true, hint: `${a} 要拿走幾個，才會剩下 ${c} 個？` };
  });
  quiz(st, rounds);
}

/* ===== 9-A 撥鐘：拖動長針和短針 ===== */
function u9A(st) {
  const targets = shuffle([[rand(1, 4), 0], [rand(5, 8), 0], [rand(9, 12), 0], [rand(1, 6), 30], [rand(7, 11), 30]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const [th, tm] = targets[r];
    let h = rand(1, 12), m = 0; if (h === th) h = h % 12 + 1;
    api.say(`請把時鐘撥到 <b class="big">${timeText(th, tm)}</b>！<br><small>拖動<span style="color:#e5508f">粉紅短針</span>和<b>黑色長針</b></small>`, `請把時鐘撥到${timeText(th, tm)}！拖動短針和長針。`);
    st.innerHTML = `${dots(r, targets.length)}<div class="clockwrap">${clockSVG(h, m)}</div><div class="center"><button class="btn mint" type="button">撥好了！</button></div>`;
    const svg = $('svg', st);
    const draw = () => {
      $('.hand-h', svg).setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 100 100)`);
      $('.hand-m', svg).setAttribute('transform', `rotate(${m * 6} 100 100)`);
    };
    const pos = e => { const b = svg.getBoundingClientRect(); const x = (e.clientX - b.left) / b.width * 200 - 100, y = (e.clientY - b.top) / b.height * 200 - 100; return { a: (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360, d: Math.hypot(x, y) }; };
    const angDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
    let hand = null;
    svg.addEventListener('pointerdown', e => {
      e.preventDefault(); const p = pos(e);
      const dh = angDiff(p.a, ((h % 12) + m / 60) * 30), dm = angDiff(p.a, m * 6);
      hand = Math.abs(dh - dm) < 25 ? (p.d > 58 ? 'm' : 'h') : (dh < dm ? 'h' : 'm');
      try { svg.setPointerCapture(e.pointerId); } catch (er) {}
      move(e);
    });
    const move = e => {
      if (!hand) return; const { a } = pos(e);
      if (hand === 'm') { const nm = (a > 90 && a < 270) ? 30 : 0; if (nm !== m) { m = nm; sfx('tap'); } }
      else { const nh = (Math.round((a - m / 2) / 30) + 12) % 12 || 12; if (nh !== h) { h = nh; sfx('tap'); } }
      draw();
    };
    svg.addEventListener('pointermove', move);
    const up = () => { hand = null; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    $('.btn', st).onclick = () => {
      if (h === th && m === tm) { api.ok(`對了！是 ${timeText(th, tm)}！`); speak(`對了！是${timeText(th, tm)}`); r++; later(round, 1500); }
      else if (m !== tm) api.bad(tm === 0 ? '整點的時候，長針要指著 12 喔！' : '半點的時候，長針要指著 6 喔！');
      else api.bad(tm === 0 ? `短針要指著 ${th} 喔！` : `${th} 點半，短針在 ${th} 和 ${th % 12 + 1} 的中間！`);
    };
  }
  round();
}

/* 時間選項：答案＋容易搞混的時間 */
function timeOpts(h, m) {
  const ans = timeText(h, m), cand = m === 0 ? [timeText(h, 30), timeText(12, 0), timeText((h + 5) % 12 + 1, 0)] : [timeText(h % 12 + 1, 30), timeText(h, 0), timeText(6, 0)];
  const set = [...new Set([ans, ...cand.filter(c => c !== ans)])].slice(0, 3);
  return set.map(t => ({ h: t, ok: t === ans }));
}

/* ===== 9-B 看鐘說時間 ===== */
function u9B(st) {
  const rounds = [0, 1, 2, 3, 4].map(k => () => {
    const h = rand(1, 12), m = k % 2 ? 30 : 0;
    return { q: '時鐘上是幾點？', vis: `<div class="clockwrap">${clockSVG(h, m)}</div>`, opts: timeOpts(h, m), hint: m ? '長針指著 6 是半點，短針剛走過的數字是幾點！' : '長針指著 12 是整點，看短針指著幾！' };
  });
  quiz(st, rounds);
}

/* ===== 9-C 生活時間挑戰 ===== */
function u9C(st) {
  const clockOpt = (h, m, ok) => ({ h: clockSVG(h, m), ok });
  const rounds = [
    () => ({ q: '早上 <b>7 點</b>起床，哪一個時鐘是 7 點？', sp: '早上7點起床，哪一個時鐘是7點？', opts: [clockOpt(7, 0, true), clockOpt(7, 30, false), clockOpt(12, 0, false)], hint: '7 點：短針指 7，長針指 12！' }),
    () => ({ q: '中午 <b>12 點</b>吃午餐，哪一個時鐘是 12 點？', sp: '中午12點吃午餐，哪一個時鐘是12點？', opts: [clockOpt(12, 0, true), clockOpt(12, 30, false), clockOpt(6, 0, false)], hint: '12 點：長針和短針都指著 12！' }),
    () => ({ q: '下午 <b>3 點半</b>放學，哪一個時鐘是 3 點半？', sp: '下午3點半放學，哪一個時鐘是3點半？', opts: [clockOpt(3, 30, true), clockOpt(4, 30, false), clockOpt(3, 0, false)], hint: '3 點半：長針指 6，短針在 3 和 4 的中間！' }),
    () => { const a = rand(6, 9), b = a + rand(1, 2); return { q: '早上的時間，哪一個比較<b>早</b>？', opts: [clockOpt(a, 0, true), clockOpt(b, 30, false)], hint: '數字比較小的時間比較早！' }; },
    () => { const h = rand(1, 10); return { q: `現在 ${h} 點，再過 1 個小時是幾點？`, vis: `<div class="clockwrap">${clockSVG(h, 0)}</div>`, opts: shuffle([timeText(h + 1, 0), timeText(h, 30), timeText(h + 2, 0)]).map(t => ({ h: t, ok: t === timeText(h + 1, 0) })), hint: '過 1 個小時，短針走到下一個數字！' }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C], u9: [u9A, u9B, u9C] });
