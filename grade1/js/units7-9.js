'use strict';
/* 第 7 單元 認識形狀 ／ 第 8 單元 減一減與加減應用 ／ 第 9 單元 讀鐘錶 */
const SHAPE_C = ['#ff7eb3', '#5bb4ff', '#3fcf9c', '#ffc93c', '#a98bff', '#ff9a4d'];

/* 立體形狀 SVG：box 長方體、cube 正方體、cyl 圓柱、ball 球 */
const SOLID_NAME = { box: '長方體', cube: '正方體', cyl: '圓柱', ball: '球' };
const SOLID_HINT = { box: '長方體的面是長方形，有長有短！', cube: '正方體每一個面都是一樣大的正方形！', cyl: '圓柱上下是圓形，躺下來可以滾！', ball: '球圓圓的，往哪裡都可以滾！' };
function solidSVG(type, color, opt = {}) {
  const ln = 'stroke="#4a3b5c" stroke-width="3" stroke-linejoin="round"';
  const hi = 'fill="#fff" fill-opacity=".45"', sh = 'fill="#000" fill-opacity=".16"';
  let s = '';
  if (type === 'box' || type === 'cube') {
    const [w, h, d] = type === 'cube' ? [50, 50, 22] : opt.tall ? [34, 60, 16] : [64, 32, 18];
    const fx = 50 - (w + d) / 2, fy = 50 - (h + d) / 2 + d;
    const top = `${fx},${fy} ${fx + d},${fy - d} ${fx + w + d},${fy - d} ${fx + w},${fy}`;
    const side = `${fx + w},${fy} ${fx + w + d},${fy - d} ${fx + w + d},${fy + h - d} ${fx + w},${fy + h}`;
    s = `<rect x="${fx}" y="${fy}" width="${w}" height="${h}" fill="${color}" ${ln}/>`
      + `<polygon points="${top}" fill="${color}" ${ln}/><polygon points="${top}" ${hi}/>`
      + `<polygon points="${side}" fill="${color}" ${ln}/><polygon points="${side}" ${sh}/>`;
  } else if (type === 'cyl') {
    s = `<path d="M24,24 L24,76 A26,9 0 0 0 76,76 L76,24 Z" fill="${color}" ${ln}/><ellipse cx="50" cy="24" rx="26" ry="9" fill="${color}" ${ln}/><ellipse cx="50" cy="24" rx="26" ry="9" ${hi}/>`;
    if (opt.lie) s = `<g transform="rotate(90 50 50)">${s}</g>`;
  } else if (type === 'ball') {
    s = `<circle cx="50" cy="50" r="34" fill="${color}" ${ln}/><ellipse cx="38" cy="36" rx="10" ry="7" ${hi}/>`;
  }
  return `<svg viewBox="0 0 100 100">${s}</svg>`;
}

/* ===== 7-A 立體分類：長方體、正方體、圓柱、球 ===== */
function u7A(st) {
  const emo = e => `<span class="emo">${e}</span>`;
  const items = shuffle([
    { t: 'box', h: solidSVG('box', pick(SHAPE_C)) }, { t: 'box', h: solidSVG('box', pick(SHAPE_C), { tall: true }) },
    { t: 'cube', h: solidSVG('cube', pick(SHAPE_C)) }, { t: 'cube', h: emo('🎲') },
    { t: 'cyl', h: solidSVG('cyl', pick(SHAPE_C)) }, { t: 'cyl', h: solidSVG('cyl', pick(SHAPE_C), { lie: true }) }, { t: 'cyl', h: emo('🥫') },
    { t: 'ball', h: solidSVG('ball', pick(SHAPE_C)) }, { t: 'ball', h: emo('⚽') }, { t: 'ball', h: emo('🏀') }
  ]);
  let left = items.length, sel = null;
  api.say('把每個東西<b>拖到</b>對的框框裡！（也可以先點東西，再點框框）', '把每個東西拖到對的框框裡！也可以先點東西，再點框框。');
  st.innerHTML = `<div class="supply"></div><div class="bins">${[['box', '#ff7eb3'], ['cube', '#5bb4ff'], ['cyl', '#3fcf9c'], ['ball', '#ffc93c']].map(([t, c]) => `<div class="bin" data-t="${t}" style="--c:${c}"><h4>${SOLID_NAME[t]}</h4></div>`).join('')}</div>`;
  const sup = $('.supply', st), bins = $$('.bin', st);
  function put(el, bin) {
    if (bin.dataset.t === el.dataset.t) {
      bin.insertAdjacentHTML('beforeend', el.innerHTML); el.remove(); sel = null; sfx('ok'); left--;
      if (!left) { api.ok('全部分好了！'); later(() => api.finish(), 900); }
    } else { const m = `這個不是${SOLID_NAME[bin.dataset.t]}喔！${SOLID_HINT[el.dataset.t]}`; api.bad(m); speak(m); }
  }
  items.forEach(it => {
    const b = document.createElement('div'); b.className = 'shape'; b.dataset.t = it.t; b.innerHTML = it.h;
    draggable(b, bins, hit => {
      if (hit === 'tap') { $$('.shape', st).forEach(x => x.style.outline = ''); sel = b; b.style.outline = '4px solid #ffc93c'; b.style.borderRadius = '12px'; sfx('tap'); }
      else if (hit) put(b, hit);
    });
    sup.appendChild(b);
  });
  bins.forEach(bin => bin.addEventListener('click', () => { if (sel) put(sel, bin); }));
}

/* ===== 7-B 面和形狀：平平的面、彎彎的面，描下來是什麼形狀 ===== */
function u7B(st) {
  const c = () => pick(SHAPE_C);
  const o = (t, ok, opt = {}) => ({ h: shapeSVG(t, c(), opt), ok });
  const so = (t, ok, opt = {}) => ({ h: solidSVG(t, c(), opt), ok });
  const trace = (t, opt, ans, q) => () => ({
    q, vis: solidSVG(t, c(), opt).replace('<svg ', '<svg style="width:150px;height:150px" '),
    opts: [o('circle', ans === 'circle', { scale: 0.8 }), o('square', ans === 'square', { scale: 0.8 }), o('rect', ans === 'rect', { scale: 0.8 }), o('tri', false, { scale: 0.8 })],
    hint: '看看貼在紙上的那一面，是什麼形狀？', after: `描下來是${SHAPE_NAME[ans]}！`
  });
  const rounds = [
    () => ({ q: '哪一個<b>只有平平的面</b>，可以穩穩的疊高高？', opts: [so('cube', true), so('ball', false), so('cyl', false, { lie: true })], hint: '有彎彎的面就會滾來滾去喔！', after: '正方體的面都是平平的！' }),
    () => ({ q: '哪一個<b>只有彎彎的面</b>，往哪裡都可以滾？', opts: [so('ball', true), so('cyl', false), so('box', false)], hint: '圓柱有平平的面，也有彎彎的面喔！', after: '球只有彎彎的面！' }),
    trace('cyl', {}, 'circle', '把圓柱立在紙上，沿著底下的面描一圈，會描出什麼形狀？'),
    trace('cube', {}, 'square', '把正方體放在紙上，沿著底下的面描一圈，會描出什麼形狀？'),
    trace('box', {}, 'rect', '把這個長方體平放在紙上，沿著底下的面描一圈，會描出什麼形狀？'),
    () => ({ q: '哪一個是<b>三角形</b>？', opts: [o('tri', true, { v: rand(0, 2), rot: rand(0, 5) * 30 }), o('openTri', false), o('square', false)], hint: '三角形有 3 條邊、3 個角，邊要連起來喔！' }),
    () => ({ q: '哪一個是<b>長方形</b>？', opts: [o('rect', true, { rot: 90 }), o('square', false), o('ellipse', false)], hint: '長方形有 4 個角，有 2 條長邊、2 條短邊！', after: '直直站著的也是長方形！' })
  ];
  quiz(st, rounds);
}

/* ===== 7-C 數形狀：圖畫裡有幾個？（點圖形可以做記號） ===== */
const PICS = {
  house: { name: '房子', n: { tri: 1, square: 0, rect: 2, circle: 3 }, svg: `
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
  const qs = [['house', 'circle'], ['rocket', 'tri'], ['robot', 'rect'], ['robot', 'circle']];
  st.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.pk'); if (t) { t.classList.toggle('marked'); sfx('tap'); } });
  const count = qs.map(([p, t]) => () => {
    const pic = PICS[p], ans = pic.n[t];
    return {
      q: `${pic.name}裡有幾個<b>${SHAPE_NAME[t]}</b>？<br><small>（點一下圖形可以做記號）</small>`, sp: `${pic.name}裡有幾個${SHAPE_NAME[t]}？點一下圖形可以做記號。`,
      vis: `<div class="pic"><svg viewBox="0 0 300 260">${pic.svg}</svg></div>`,
      opts: numOpts(ans, 0, 6), hint: `一個一個找${SHAPE_NAME[t]}，找到就點一下做記號！`
    };
  });
  // 圖形的規律：接下來是哪一個？
  const COLS = { circle: '#ff7eb3', tri: '#5bb4ff', square: '#3fcf9c', rect: '#ffc93c' };
  const mini = t => `<span style="display:inline-block;width:48px;height:48px">${shapeSVG(t, COLS[t]).replace('<svg ', '<svg style="width:100%;height:100%" ')}</span>`;
  const rule = unit => () => {
    const seq = Array.from({ length: unit.length * 2 + 1 }, (_, i) => unit[i % unit.length]), ans = unit[seq.length % unit.length];
    return {
      q: '形狀排隊有規律，接下來是哪一個？',
      vis: `<div>${seq.map(mini).join('')}<span class="box" style="vertical-align:top">?</span></div>`,
      opts: ['circle', 'tri', 'square'].map(t => ({ h: mini(t), ok: t === ans })),
      hint: '從頭再看一次，哪幾個形狀一直重複？', after: '找到規律了！'
    };
  };
  quiz(st, [...count, rule(shuffle(['circle', 'tri'])), rule(['square', 'circle', 'circle'])]);
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
      q: `${q}<br><small>選出對的算式：</small>`, sp: `${q}選出對的算式。`,
      opts: [{ h: `<span class="eq" style="font-size:30px">${plus}</span>`, ok: op === '+' }, { h: `<span class="eq" style="font-size:30px">${minus}</span>`, ok: op === '-' }],
      hint: op === '+' ? '「又來了」、「一共」是變多，用加法！' : '「走了」、「吃掉」、「多幾個」用減法！'
    };
  }));
}

/* ===== 8-C 加減快手 ===== */
function u8C(st) {
  const rounds = Array.from({ length: 8 }, (_, k) => () => {
    // 課本：被減數 10 以內、加數和減數 1 到 10，不出 0
    if (k < 4) { const a = rand(2, 10), b = rand(1, a - 1); return { q: `${a} − ${b} = ？`, vis: `<span class="eq">${a} − ${b} = <span class="box">?</span></span>`, opts: numpadOpts(a - b), pad: true, hint: `從 ${a} 往回數 ${b} 個！` }; }
    if (k < 6) { const a = rand(1, 8), b = rand(1, 10 - a); return { q: `${a} + ${b} = ？`, vis: `<span class="eq">${a} + ${b} = <span class="box">?</span></span>`, opts: numpadOpts(a + b), pad: true, hint: `從 ${a} 往後數 ${b} 個！` }; }
    const a = rand(5, 10), c = rand(1, a - 1);
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
    api.say(`請把時鐘撥到 <b class="big">${timeText(th, tm)}</b>！<br><small>拖動<span style="color:#e5508f">粉紅短針</span>和<b>黑色長針</b></small>`, `請把時鐘撥到${timeText(th, tm)}！拖動粉紅短針和黑色長針。`);
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
    // 事件的先後順序與時間長短（「過幾小時」是二年級才教）
    () => ({ q: '種花的時候，哪一件事<b>最先</b>發生？', opts: [{ h: '🌰 種下種子', ok: true }, { h: '🌱 長出小芽', ok: false }, { h: '🌷 開出花朵', ok: false }], hint: '要先種下去，才會長大開花喔！', after: '先種種子，再長芽，最後開花！' }),
    () => ({ q: '哪一件事做的時間比較<b>長</b>？', keep: true, opts: [{ h: '🪥 刷牙', ok: false }, { h: '😴 晚上睡覺', ok: true }], hint: '想一想，晚上睡覺要睡多久？', after: '睡覺要睡一整個晚上，比刷牙久多了！' })
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C], u9: [u9A, u9B, u9C] });
