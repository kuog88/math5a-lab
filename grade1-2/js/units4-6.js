'use strict';
/* 第 4 單元 18 以內的減法 ／ 第 5 單元 圖形和形體 ／ 第 6 單元 幾月幾日 */

/* ===== 4-A 拿走幾個：點一下拿走，再說出剩下幾個（退位減法） ===== */
function subPair() { const n = rand(11, 18), k = rand(Math.max(2, n - 9), 9); return [n, k]; }
function u4A(st) {
  const ps = [subPair(), subPair(), subPair()];
  let r = 0;
  function round() {
    if (r >= ps.length) return api.finish();
    const [n, k] = ps[r]; let taken = 0;
    api.say(`有 ${n} 罐蜂蜜，小熊要拿走 <b class="big">${k}</b> 罐。<br>點一下拿走一罐！`, `有 ${n} 罐蜂蜜，小熊要拿走 ${k} 罐。點一下拿走一罐！`);
    st.innerHTML = `${dots(r, ps.length)}<div class="eq center">${n} − ${k} ＝ <span class="box">？</span></div>
      <div class="frames">${tfHTML(10, '🍯')}${tfHTML(n - 10, '🍯')}</div><div class="readout">拿走了 <b class="cnt">0</b> 罐</div><div class="opts"></div>`;
    $$('.tf i.on', st).forEach(i => {
      i.style.cursor = 'pointer';
      i.onclick = () => {
        if (i.classList.contains('out') || taken >= k) return;
        i.classList.add('out'); taken++; sfx('pop'); speak(String(taken));
        $('.cnt', st).textContent = taken;
        if (taken === k) later(ask, 600);
      };
    });
    function ask() {
      api.say(`拿走 ${k} 罐了，還剩下幾罐？`, `拿走 ${k} 罐了，還剩下幾罐？`);
      nearOpts(n - k, 1, 12, 4, [n - k + 1, k]).forEach(o => $('.opts', st).appendChild(optBtn(o, () => {
        $('.box', st).textContent = n - k; speak(`${n} 減 ${k} 等於 ${n - k}`); r++; later(round, 1800);
      }, '數數看還沒拿走的有幾罐！')));
    }
  }
  round();
}

/* ===== 4-B 減法和比較：拿走、比較、合起來、比較少、用加還是減 ===== */
function u4B(st) {
  const take = () => { const [n, k] = subPair(); return { q: `樹上有 ${n} 顆 🍎，掉下來 ${k} 顆，<br>樹上還剩幾顆？`, sp: `樹上有 ${n} 顆蘋果，掉下來 ${k} 顆，樹上還剩幾顆？`, vis: '', opts: nearOpts(n - k, 1, 18, 4, [n + k > 18 ? n - k + 2 : n + k]), hint: '掉下來，要拿走喔！', after: `${n} − ${k} ＝ ${n - k}` }; };
  const cmp = () => { const [n, k] = subPair(); return { q: `熊大有 ${n} 罐蜂蜜，熊二有 ${k} 罐。<br>熊大<b>比</b>熊二<b>多幾罐</b>？`, sp: `熊大有 ${n} 罐蜂蜜，熊二有 ${k} 罐。熊大比熊二多幾罐？`, vis: `<div class="mrow"><span class="name">熊大</span>${pics('🍯', n, true)}</div><div class="mrow"><span class="name">熊二</span>${pics('🍯', k, true)}</div>`, opts: nearOpts(n - k, 1, 18, 4, [n - k + 1]), hint: '一個對一個，看看多出幾罐！', after: `${n} − ${k} ＝ ${n - k}` }; };
  const part = () => { const [n, k] = subPair(); return { q: `花園裡有紅花和黃花，一共 ${n} 朵，<br>紅花有 ${k} 朵，黃花有幾朵？`, sp: `花園裡有紅花和黃花，一共 ${n} 朵，紅花有 ${k} 朵，黃花有幾朵？`, vis: '🌹🌼', opts: nearOpts(n - k, 1, 18, 4, [n - k - 1]), hint: '一共的，拿走紅花，就是黃花！', after: `${n} − ${k} ＝ ${n - k}` }; };
  const less = () => { const [n, k] = subPair(); return { q: `姊姊有 ${n} 張貼紙，<br>妹妹<b>比</b>姊姊<b>少 ${k} 張</b>。<br>妹妹有幾張？`, sp: `姊姊有 ${n} 張貼紙，妹妹比姊姊少 ${k} 張。妹妹有幾張？`, vis: '', opts: nearOpts(n - k, 1, 18, 4, [n - k + 1]), hint: '妹妹比較少，要用減法！', after: `${n} − ${k} ＝ ${n - k}` }; };
  const which = () => {
    const add = Math.random() < 0.5, a = rand(9, 14), b = rand(2, 5);
    const story = add ? `公車上有 ${a} 個人，到站又<b>上來</b> ${b} 個人。` : `公車上有 ${a} 個人，到站<b>下車</b> ${b} 個人。`;
    return { q: `${story}<br>要用哪一個算式？`, sp: story.replace(/<[^>]+>/g, '') + '要用哪一個算式？', vis: '🚌',
      opts: mkOpts(add ? `${a} ＋ ${b}` : `${a} − ${b}`, [add ? `${a} − ${b}` : `${a} ＋ ${b}`], v => `<span class="eq" style="font-size:34px">${v}</span>`),
      hint: add ? '上來了，人變多，用加法！' : '下車了，人變少，用減法！', after: add ? `${a} ＋ ${b} ＝ ${a + b}` : `${a} − ${b} ＝ ${a - b}` };
  };
  quiz(st, [take, cmp, part, less, which, which]);
}

/* ===== 4-C 減法心算快手 ===== */
function u4C(st) {
  const calc = () => { const [n, k] = subPair(); return { q: `<span class="eq">${n} − ${k} ＝ <span class="box">？</span></span>`, sp: `${n} 減 ${k} 等於多少？`, vis: '', pad: true, opts: numpadOpts(n - k, 1, 12), hint: '可以先從 10 拿走喔！' }; };
  const find = () => {
    const d = rand(4, 9), n = rand(Math.max(11, d + 2), Math.min(18, d + 9)), right = `${n} − ${n - d}`;
    const ws = new Set();
    while (ws.size < 3) { const x = rand(11, 18), y = rand(3, 9); if (x - y !== d) ws.add(`${x} − ${y}`); }
    return { q: `哪一張卡片的答案是 <b class="big">${d}</b>？`, sp: `哪一張卡片的答案是 ${d}？`, vis: '',
      opts: mkOpts(right, [...ws], v => `<span class="eq" style="font-size:34px">${v}</span>`), hint: '每一張都算算看！' };
  };
  quiz(st, [calc, calc, calc, find, calc, calc, calc, find]);
}

/* ===== 方格圖形小工具 ===== */
const POLY = {
  L: [[0, 0], [0, 1], [0, 2], [1, 2]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], Z5: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
  I3: [[0, 0], [1, 0], [2, 0]], V: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]]
};
function norm(cs) { const mx = Math.min(...cs.map(c => c[0])), my = Math.min(...cs.map(c => c[1])); return cs.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); }
const keyCells = cs => norm(cs).map(c => c.join(',')).join(' ');
function variants(cs) {
  const out = []; let c = cs;
  for (let f = 0; f < 2; f++) { for (let k = 0; k < 4; k++) { c = c.map(([x, y]) => [y, -x]); out.push(norm(c)); } c = c.map(([x, y]) => [-x, y]); }
  return out;
}
const sameShape = (a, b) => variants(a).some(v => keyCells(v) === keyCells(b));
function cellSVG(cs, color, size = 26) {
  const n = norm(cs), w = Math.max(...n.map(c => c[0])) + 1, h = Math.max(...n.map(c => c[1])) + 1;
  return `<svg viewBox="-2 -2 ${w * size + 4} ${h * size + 4}" width="${w * size + 4}" height="${h * size + 4}">${n.map(([x, y]) => `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" rx="3" fill="${color}" stroke="#3b2a1a" stroke-width="2"/>`).join('')}</svg>`;
}

/* ===== 5-A 照樣子拼：在空格子上點出一樣的圖形（可以換位置） ===== */
function u5A(st) {
  const shapes = shuffle(['L', 'T', 'S', 'P', 'U', 'F']).slice(0, 3), cols = ['#4fa3d9', '#e2574c', '#2f8f5b'];
  let r = 0;
  function round() {
    if (r >= shapes.length) return api.finish();
    const tgt = POLY[shapes[r]], c = cols[r], G = 5;
    const on = new Set();
    api.say('照左邊的樣子，在右邊的格子<b>點一點</b>，拼出一樣的圖形！', '照左邊的樣子，在右邊的格子點一點，拼出一樣的圖形！');
    const tw = Math.max(...tgt.map(p => p[0])) + 1, th = Math.max(...tgt.map(p => p[1])) + 1;
    let left = `<div class="gridbox" style="grid-template-columns:repeat(${tw},auto);--c:${c}">`;
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) left += `<span class="${tgt.some(p => p[0] === x && p[1] === y) ? 'on' : ''}"></span>`;
    left += '</div>';
    let right = `<div class="gridbox play" style="grid-template-columns:repeat(${G},auto);--c:${c}">`;
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) right += `<button type="button" data-x="${x}" data-y="${y}" aria-label="格子"></button>`;
    right += '</div>';
    st.innerHTML = `${dots(r, shapes.length)}<div class="grids"><div><div class="lab">樣子</div>${left}</div><div><div class="lab">換你拼</div>${right}</div></div>
      <div class="row-btns"><button class="btn ghost" data-a="clr">全部清掉</button><button class="btn" data-a="ok">好了！</button></div>`;
    $$('.play button', st).forEach(b => b.onclick = () => {
      const k = b.dataset.x + ',' + b.dataset.y; sfx('tap');
      if (on.has(k)) { on.delete(k); b.classList.remove('on'); } else { on.add(k); b.classList.add('on'); }
    });
    $('[data-a="clr"]', st).onclick = () => { on.clear(); $$('.play button', st).forEach(b => b.classList.remove('on')); };
    $('[data-a="ok"]', st).onclick = () => {
      const mine = [...on].map(s => s.split(',').map(Number));
      if (mine.length === tgt.length && keyCells(mine) === keyCells(tgt)) { api.ok('一模一樣！'); speak('一模一樣！'); r++; later(round, 1300); }
      else if (mine.length === tgt.length && sameShape(mine, tgt)) api.bad('形狀對了，但是方向要和左邊一樣喔！');
      else api.bad(mine.length !== tgt.length ? `左邊有 ${tgt.length} 格，你點了 ${mine.length} 格喔！` : '再看看左邊的樣子！');
    };
  }
  round();
}

/* ===== 5-B 蓋印和翻轉：積木蓋出的形狀、轉一轉翻一翻一樣的圖形 ===== */
function solidSVG(type) {
  const s = 'stroke="#3b2a1a" stroke-width="3" stroke-linejoin="round"', F = '#f28c38', S = '#f3e2c4', T = '#fbf1de';
  let b = '';
  if (type === 'cube') b = `<polygon points="30,40 52,18 112,18 90,40" fill="${T}" ${s}/><polygon points="90,40 112,18 112,78 90,100" fill="${S}" ${s}/><rect x="30" y="40" width="60" height="60" fill="${F}" ${s}/>`;
  if (type === 'box') b = `<polygon points="10,58 32,36 132,36 110,58" fill="${T}" ${s}/><polygon points="110,58 132,36 132,76 110,98" fill="${S}" ${s}/><rect x="10" y="58" width="100" height="40" fill="${F}" ${s}/>`;
  if (type === 'cyl') b = `<circle cx="82" cy="46" r="34" fill="${S}" ${s}/><polygon points="29.6,56.6 55.6,24.6 108.4,67.4 82.4,99.4" fill="${S}"/><line x1="29.6" y1="56.6" x2="55.6" y2="24.6" ${s}/><line x1="82.4" y1="99.4" x2="108.4" y2="67.4" ${s}/><circle cx="56" cy="78" r="34" fill="${F}" ${s}/>`;
  if (type === 'prism') b = `<polygon points="55,30 80,8 125,82 100,104" fill="${S}" ${s}/><polygon points="15,104 40,82 125,82 100,104" fill="${T}" ${s}/><polygon points="15,104 100,104 55,30" fill="${F}" ${s}/>`;
  return `<svg viewBox="0 0 140 120" width="170" height="146">${b}</svg>`;
}
function u5B(st) {
  const stampFor = { cube: 'square', box: 'rect', cyl: 'circle', prism: 'tri' };
  const stamp = type => () => ({
    q: '用積木<b>橘色的那一面</b>蓋印章，<br>會蓋出哪一個形狀？', sp: '用積木橘色的那一面蓋印章，會蓋出哪一個形狀？', vis: solidSVG(type),
    opts: ['square', 'rect', 'circle', 'tri'].map(t => ({ h: `<span class="optsvg">${shapeSVG(t, '#f28c38')}</span>`, ok: t === stampFor[type] })),
    hint: '看看橘色那一面是什麼形狀！', after: `蓋出來是${SHAPE_NAME[stampFor[type]]}`
  });
  const turn = () => {
    const ks = shuffle(Object.keys(POLY).filter(k => POLY[k].length >= 4)), tgt = POLY[ks[0]];
    const vs = variants(tgt).filter(v => keyCells(v) !== keyCells(tgt)), right = pick(vs.length ? vs : [tgt]);
    const wrong = ks.slice(1).filter(k => POLY[k].length === tgt.length && !sameShape(POLY[k], tgt)).slice(0, 2).map(k => pick(variants(POLY[k])));
    return { q: '哪一個和左邊的圖形<b>一樣</b>？<br><small>（可以轉一轉、翻一翻）</small>', sp: '哪一個和左邊的圖形一樣？可以轉一轉、翻一翻。', vis: cellSVG(tgt, '#4fa3d9', 32),
      opts: [{ h: cellSVG(right, '#7cc47f'), ok: true }, ...wrong.map(w => ({ h: cellSVG(w, '#7cc47f') }))], hint: '在心裡把它轉一轉、翻一翻看看！' };
  };
  const count = () => {
    const k = pick(['P', 'U', 'F', 'V', 'L', 'T']), cs = POLY[k];
    return { q: '這個圖形是用幾個<b>正方形</b>拼成的？', sp: '這個圖形是用幾個正方形拼成的？', vis: cellSVG(cs, '#f6c443', 40), opts: nearOpts(cs.length, 2, 8, 3), hint: '一格一格數數看！' };
  };
  const ts = shuffle(['cube', 'box', 'cyl', 'prism']);
  quiz(st, [stamp(ts[0]), turn, stamp(ts[1]), turn, count]);
}

/* ===== 5-C 數積木：數數看用了幾個積木 ===== */
function cubesSVG(hs) {
  const s = 40, d = 16, H = Math.max(...hs), W = hs.length * s + d + 10, Ht = H * s + d + 10;
  let g = '';
  hs.forEach((h, x) => {
    for (let k = 0; k < h; k++) {
      const X = 5 + x * s, Y = Ht - 5 - (k + 1) * s;
      g += `<polygon points="${X},${Y} ${X + d},${Y - d} ${X + s + d},${Y - d} ${X + s},${Y}" fill="#d9ecf8" stroke="#3b2a1a" stroke-width="2"/>`;
      g += `<polygon points="${X + s},${Y} ${X + s + d},${Y - d} ${X + s + d},${Y + s - d} ${X + s},${Y + s}" fill="#8fc3e6" stroke="#3b2a1a" stroke-width="2"/>`;
      g += `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="#b9dcf2" stroke="#3b2a1a" stroke-width="2"/>`;
    }
  });
  return `<span class="cubes"><svg viewBox="0 ${-d} ${W} ${Ht + d}">${g}</svg></span>`;
}
function u5C(st) {
  const make = (len, max) => () => {
    const hs = Array.from({ length: len }, () => rand(1, max)), n = hs.reduce((a, b) => a + b, 0);
    return { q: '這個造型用了幾個積木？', vis: cubesSVG(hs), opts: nearOpts(n, 1, 18, 4, [n - 1, n + 1, len]), hint: '一行一行，由下往上數！', after: `${hs.join(' ＋ ')} ＝ ${n}` };
  };
  const taller = () => {
    const a = rand(2, 5); let b = rand(2, 5); if (a === b) b = a + 1;
    return { q: '哪一座積木塔比較<b>高</b>？', vis: `<span style="display:flex;gap:40px;align-items:flex-end"><span>${cubesSVG([a])}<br>小熊的塔</span><span>${cubesSVG([b])}<br>小兔的塔</span></span>`,
      opts: mkOpts(a > b ? '小熊的塔' : '小兔的塔', [a > b ? '小兔的塔' : '小熊的塔']), hint: '數數看各疊了幾個！', after: `小熊 ${a} 個，小兔 ${b} 個` };
  };
  quiz(st, [make(2, 3), make(3, 3), taller, make(3, 4), make(4, 3)]);
}

/* ===== 月曆小工具（115 學年度下學期是 2027 年） ===== */
const YEAR = 2027, WK = ['日', '一', '二', '三', '四', '五', '六'];
const daysIn = m => new Date(YEAR, m, 0).getDate();
const wdOf = (m, d) => new Date(YEAR, m - 1, d).getDay();
function calHTML(m, opt = {}) {
  const first = wdOf(m, 1), n = daysIn(m), q = opt.q || [], hl = opt.hl;
  let h = `<table class="cal"><caption>${m} 月</caption><tr>${WK.map(w => `<th>${w}</th>`).join('')}</tr><tr>`;
  for (let k = 0; k < first; k++) h += '<td class="e"></td>';
  for (let d = 1; d <= n; d++) {
    const c = [q.includes(d) ? 'q' : '', d === hl ? 'hl' : ''].join(' ').trim();
    h += `<td${c ? ` class="${c}"` : ''}>${q.includes(d) ? '？' : d}</td>`;
    if ((first + d) % 7 === 0 && d < n) h += '</tr><tr>';
  }
  return h + '</tr></table>';
}
const md = (m, d) => `${m} 月 ${d} 日`;

/* ===== 6-A 月曆填填看 ===== */
function u6A(st) {
  const m = pick([3, 4, 5]), n = daysIn(m), hid = shuffle(Array.from({ length: n - 2 }, (_, k) => k + 2)).slice(0, 4);
  const left = hid.slice();
  // 每答對一格，下一題就把那一格填回月曆
  const fill = i => () => {
    if (i > 0) left.splice(left.indexOf(hid[i - 1]), 1);
    const d = hid[i];
    return { q: `月曆上<b>藍框</b>的？是幾日？`, sp: '月曆上藍框的問號是幾日？', vis: calHTML(m, { q: left.slice(), hl: d }),
      opts: mkOpts(d, [d + 7 <= n ? d + 7 : d - 7, d + 1, d - 1]), hint: '看看它的左邊、右邊，或上面一格！', after: `是 ${d} 日` };
  };
  const count = () => ({ q: `${m} 月有幾天？`, sp: `${m} 月有幾天？`, vis: calHTML(m), opts: mkOpts(n, [n === 31 ? 30 : 31, 28]), hint: '看看月曆上最後一天是幾日！' });
  quiz(st, [...hid.map((_, i) => fill(i)), count]);
}

/* ===== 6-B 今天明天昨天 ===== */
function u6B(st) {
  const tom = () => {
    const m = rand(3, 6), d = rand(2, daysIn(m) - 1);
    return { q: `今天是 <b>${md(m, d)}</b>，<br><b>明天</b>是幾月幾日？`, sp: `今天是 ${m} 月 ${d} 日，明天是幾月幾日？`, vis: '🌅',
      opts: mkOpts(md(m, d + 1), [md(m, d - 1), md(m + 1, d)]), hint: '明天是今天的下一天！' };
  };
  const yes = () => {
    const m = rand(3, 6), d = rand(2, daysIn(m) - 1);
    return { q: `今天是 <b>${md(m, d)}</b>，<br><b>昨天</b>是幾月幾日？`, sp: `今天是 ${m} 月 ${d} 日，昨天是幾月幾日？`, vis: '🌙',
      opts: mkOpts(md(m, d - 1), [md(m, d + 1), md(m, d + 2)]), hint: '昨天是今天的前一天！' };
  };
  const wk = () => {
    const w = rand(0, 6), t = Math.random() < 0.5;
    const ans = WK[(w + (t ? 1 : 6)) % 7], wrong = WK[(w + (t ? 6 : 1)) % 7];
    return { q: `今天是<b>星期${WK[w]}</b>，<br>${t ? '明天' : '昨天'}是星期幾？`, sp: `今天是星期${WK[w]}，${t ? '明天' : '昨天'}是星期幾？`, vis: '',
      opts: mkOpts(`星期${ans}`, [`星期${wrong}`, `星期${WK[w]}`]), hint: '星期日、一、二、三、四、五、六，照順序想想看！' };
  };
  const look = () => {
    const m = rand(3, 6), d = rand(3, daysIn(m) - 1), w = wdOf(m, d);
    return { q: `看月曆，<b>${md(m, d)}</b>是星期幾？`, sp: `看月曆，${m} 月 ${d} 日是星期幾？`, vis: calHTML(m, { hl: d }),
      opts: mkOpts(`星期${WK[w]}`, [`星期${WK[(w + 1) % 7]}`, `星期${WK[(w + 6) % 7]}`]), hint: '從藍框往上看，最上面就是星期幾！' };
  };
  const sundays = () => {
    const m = rand(3, 6), n = daysIn(m); let c = 0; for (let d = 1; d <= n; d++) if (wdOf(m, d) === 0) c++;
    return { q: `看月曆，${m} 月有幾個<b>星期日</b>？`, sp: `看月曆，${m} 月有幾個星期日？`, vis: calHTML(m), opts: mkOpts(c, [c === 5 ? 4 : 5, 7]), hint: '紅色那一行，一個一個數！' };
  };
  quiz(st, [tom, yes, wk, look, sundays]);
}

/* ===== 6-C 年曆小偵探 ===== */
function u6C(st) {
  const months = `<div class="days">${Array.from({ length: 12 }, (_, k) => `<span class="seq"><span style="font-size:24px;min-width:64px">${k + 1} 月</span></span>`).join('')}</div>`;
  const year = () => ({ q: '看年曆，一年有幾個月？', vis: months, opts: mkOpts(12, [10, 7, 31]), hint: '從 1 月數到最後一個月！' });
  const next = () => { const m = rand(1, 11); return { q: `${m} 月的<b>下一個月</b>是幾月？`, sp: `${m} 月的下一個月是幾月？`, vis: months, opts: mkOpts(`${m + 1} 月`, [m > 1 ? `${m - 1} 月` : '12 月', `${m < 11 ? m + 2 : 10} 月`]), hint: '在年曆上往後找一個月！' }; };
  const dec = () => ({ q: '12 月的下一個月是幾月？', vis: '🎆', opts: mkOpts('1 月', ['13 月', '11 月']), hint: '12 月過完，就是新的一年的 1 月！', after: '12 月過完是新的一年，從 1 月開始' });
  const last = () => {
    const m = pick([3, 4, 5]), n = daysIn(m);
    return { q: `看月曆，<b>${md(m, n)}</b>的明天是幾月幾日？`, sp: `看月曆，${m} 月 ${n} 日的明天是幾月幾日？`, vis: calHTML(m, { hl: n }),
      opts: mkOpts(md(m + 1, 1), [md(m, n + 1), md(m, 1)]), hint: `${m} 月最後一天是 ${n} 日，再過一天就是下一個月了！` };
  };
  const nth = () => {
    const m = rand(3, 6), w = rand(1, 5), k = pick([2, 3]);
    let d = 1; while (wdOf(m, d) !== w) d++; d += (k - 1) * 7;
    return { q: `看月曆，${m} 月的<b>第 ${k} 個星期${WK[w]}</b>是幾日？`, sp: `看月曆，${m} 月的第 ${k} 個星期${WK[w]}是幾日？`, vis: calHTML(m),
      opts: mkOpts(d, [d + 7, d - 7 > 0 ? d - 7 : d + 1, d + 1]), hint: `找到星期${WK[w]}那一行，從上往下數！` };
  };
  quiz(st, [year, next, last, nth, dec]);
}

LEVELS.u4 = [u4A, u4B, u4C];
LEVELS.u5 = [u5A, u5B, u5C];
LEVELS.u6 = [u6A, u6B, u6C];
