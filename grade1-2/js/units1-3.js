'use strict';
/* 第 1 單元 數到 100 ／ 第 2 單元 18 以內的加法 ／ 第 3 單元 長度 */

/* ===== 1-A 捆數棒：用「一捆十根」和「一根」排出指定的數 ===== */
function sticksHTML(t, o) {
  let h = '';
  for (let k = 0; k < t; k++) h += `<span class="bundle">${'<i class="stick"></i>'.repeat(10)}</span>`;
  if (o) h += `<span class="ones">${'<i class="stick"></i>'.repeat(o)}</span>`;
  return h || '<span class="lbl">（還沒有數棒）</span>';
}
function u1A(st) {
  const ns = [rand(21, 39), rand(41, 69), rand(7, 9) * 10, rand(71, 99)];
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r]; let t = 0, o = 0;
    api.say(`用數棒排出 <b class="big">${n}</b>，排好按「好了」。<br><small>一捆是 10 根喔！</small>`, `用數棒排出 ${n}，排好按好了。一捆是 10 根喔！`);
    st.innerHTML = `${dots(r, ns.length)}
      <div class="sticks"></div>
      <div class="readout"><span class="t">0</span> 捆 和 <span class="o">0</span> 根</div>
      <div class="row-btns">
        <button class="btn green" data-a="t+">＋ 一捆</button><button class="btn sun" data-a="o+">＋ 一根</button>
        <button class="btn ghost" data-a="t-">拿走一捆</button><button class="btn ghost" data-a="o-">拿走一根</button>
        <button class="btn wood" data-a="tie" hidden>🎀 10 根綁成一捆</button>
      </div>
      <div class="center"><button class="btn" data-a="ok">好了！</button></div>`;
    const draw = () => {
      $('.sticks', st).innerHTML = sticksHTML(t, o);
      $('.t', st).textContent = t; $('.o', st).textContent = o;
      $('[data-a="tie"]', st).hidden = o < 10;
    };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === 't+' && t < 10) t++;
      if (a === 'o+' && o < 19) o++;
      if (a === 't-' && t > 0) t--;
      if (a === 'o-' && o > 0) o--;
      if (a === 'tie') { o -= 10; t++; api.ok('10 根綁成 1 捆！'); }
      if (a === 'ok') {
        if (o >= 10) { toast('有 10 根以上，先綁成一捆吧！'); speak('有 10 根以上，先綁成一捆吧！'); return; }
        if (t * 10 + o === n) {
          api.ok(`${t} 個十和 ${o} 個一，就是 ${n}！`); speak(`${t} 個十和 ${o} 個一，就是 ${n}`);
          r++; later(round, 1800); return;
        }
        api.bad(`現在是 ${t * 10 + o} 喔！十位要 ${Math.floor(n / 10)}，個位要 ${n % 10}。`);
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 1-B 個位和十位：位值、比大小、5 個一數、10 個一數 ===== */
function u1B(st) {
  const placeQ = () => {
    const t = rand(2, 9), o = rand(1, 9);
    return { q: `<b>${t}</b> 個十和 <b>${o}</b> 個一，合起來是多少？`, sp: `${t} 個十和 ${o} 個一，合起來是多少？`,
      vis: `<div class="sticks">${sticksHTML(t, o)}</div>`, opts: mkOpts(t * 10 + o, [o * 10 + t, t + o, t * 10 + o + 10].filter(v => v !== t * 10 + o && v <= 100)),
      hint: '一捆是一個十，一根是一個一喔！' };
  };
  const digitQ = () => {
    let n = rand(21, 98); if (n % 10 === Math.floor(n / 10)) n++;
    const askT = Math.random() < 0.5, t = Math.floor(n / 10), o = n % 10;
    return { q: `<b class="big">${n}</b> 的<b>${askT ? '十位' : '個位'}</b>是多少？`, sp: `${n} 的${askT ? '十位' : '個位'}是多少？`,
      vis: `<div class="seq"><span>${t}<br><small class="lbl">十位</small></span><span>${o}<br><small class="lbl">個位</small></span></div>`,
      opts: mkOpts(askT ? t : o, askT ? [o, t + 1] : [t, o + 1]), hint: '左邊是十位，右邊是個位。',
      after: `${n} 是 ${t} 個十和 ${o} 個一` };
  };
  const cmpQ = () => {
    const a = rand(2, 9), b = rand(1, 9);
    let x = a * 10 + b, y = Math.random() < 0.5 ? b * 10 + a : x + pick([-1, 1, 9, -9]);
    if (x === y) y = x + 1;
    return { q: '哪一個數<b>比較大</b>？', vis: '', opts: mkOpts(Math.max(x, y), [Math.min(x, y)]),
      hint: '先比十位，十位一樣再比個位。' };
  };
  const skipQ = () => {
    const by = pick([5, 10]), s = by === 5 ? rand(1, 12) * 5 : rand(1, 4) * 10 + rand(1, 9);
    const seq = [s, s + by, s + 2 * by, s + 3 * by];
    return { q: `${by} 個一數，下一個是多少？`, vis: `<div class="seq">${seq.map(v => `<span>${v}</span>`).join('')}<span class="q">？</span></div>`,
      opts: mkOpts(s + 4 * by, [s + 3 * by + 1, s + 4 * by + (by === 5 ? 5 : 1), s + 3 * by + (by === 5 ? 10 : 5)]), hint: `每次多 ${by} 喔！`,
      sp: `${seq.join('、')}，${by} 個一數，下一個是多少？` };
  };
  const tenQ = () => {
    const t = rand(3, 9);
    return { q: `<b class="big">${t * 10}</b> 是幾個十？`, sp: `${t * 10} 是幾個十？`, vis: `<div class="sticks">${sticksHTML(t, 0)}</div>`,
      opts: mkOpts(t, [t * 10, 0, t + 1]), hint: '數數看有幾捆！' };
  };
  quiz(st, shuffle([placeQ, digitQ, cmpQ, skipQ, tenQ]));
}

/* ===== 1-C 百數表挑戰：找出不見的數、序數 ===== */
function u1C(st) {
  const tableQ = () => {
    const r0 = rand(0, 6), hide = rand(r0 * 10 + 1, r0 * 10 + 30);
    let h = '<div class="hundred">';
    for (let v = r0 * 10 + 1; v <= r0 * 10 + 30; v++) h += v === hide ? '<span class="q">？</span>' : `<span>${v}</span>`;
    h += '</div>';
    return { q: '百數表裡，<b>？</b>是多少？', vis: h, opts: mkOpts(hide, [hide + 10, hide - 10, hide + 1].filter(v => v > 0 && v <= 100)),
      hint: '看看它的左邊、右邊和上面！' };
  };
  const nbQ = () => {
    const kind = pick(['多 1', '少 1', '多 10', '少 10']), n = rand(21, 89), ans = { '多 1': n + 1, '少 1': n - 1, '多 10': n + 10, '少 10': n - 10 }[kind];
    return { q: `比 <b class="big">${n}</b> <b>${kind}</b> 的數是多少？`, sp: `比 ${n} ${kind} 的數是多少？`, vis: '',
      opts: mkOpts(ans, [n + (kind.includes('多') ? -1 : 1) * (kind.includes('10') ? 10 : 1), n + (kind.includes('10') ? (kind.includes('多') ? 1 : -1) : (kind.includes('多') ? 10 : -10))]),
      hint: kind.includes('10') ? '多 10 或少 10，是十位變喔！' : '多 1 或少 1，是個位變喔！' };
  };
  const ordQ = () => {
    const A = ['🐻', '🐰', '🦊', '🐼', '🐸', '🐨', '🦉', '🐷', '🐯', '🐵'], row = shuffle(A).slice(0, 9), k = rand(3, 8);
    return { q: `火車從<b>左邊</b>數來，<b>第 ${k} 節</b>坐的是誰？`, sp: `火車從左邊數來，第 ${k} 節坐的是誰？`,
      vis: `<div class="cars">🚂${row.map(e => `<span class="car">${e}</span>`).join('')}</div>`,
      opts: mkOpts(row[k - 1], [row[k - 2], row[k]]), hint: '從左邊一節一節數！' };
  };
  const hundQ = () => ({ q: '99 再多 1 是多少？', vis: '<div class="seq"><span>97</span><span>98</span><span>99</span><span class="q">？</span></div>',
    opts: mkOpts(100, [90, 98, 10]), hint: '99 的下一個數是 100！', after: '10 個十就是 100' });
  quiz(st, [tableQ, tableQ, nbQ, ordQ, hundQ]);
}

/* ===== 2-A 湊成十：把右邊的蘑菇搬到左邊填滿十格，再算出答案 ===== */
function tfHTML(n, e, cls = '') { let h = `<div class="tf ${cls}">`; for (let k = 0; k < 10; k++) h += k < n ? `<i class="on">${e}</i>` : '<i></i>'; return h + '</div>'; }
function u2A(st) {
  const ps = shuffle([[9, rand(3, 8)], [8, rand(4, 8)], [7, rand(5, 8)], [6, rand(6, 9)]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= ps.length) return api.finish();
    const [a, b] = ps[r]; let L = a, R = b;
    api.say(`${a} ＋ ${b} 是多少？<br>點右邊的 🍄，把它搬到左邊，先<b>湊成 10</b>！`, `${a} 加 ${b} 是多少？點右邊的蘑菇，把它搬到左邊，先湊成 10！`);
    st.innerHTML = `${dots(r, ps.length)}<div class="eq center">${a} ＋ ${b} ＝ <span class="box">？</span></div><div class="frames"></div><div class="opts"></div>`;
    const fr = $('.frames', st);
    const draw = () => {
      fr.innerHTML = tfHTML(L, '🍄') + tfHTML(R, '🍄', 'right');
      $$('.right i.on', fr).forEach(i => { i.style.cursor = 'pointer'; i.onclick = move; });
    };
    function move() {
      if (L >= 10) return;
      L++; R--; sfx('pop'); draw();
      if (L === 10) {
        api.say(`湊成 10 了！10 和 ${R} 合起來是多少？`, `湊成 10 了！10 和 ${R} 合起來是多少？`);
        $$('.right i.on', fr).forEach(i => i.onclick = null);
        nearOpts(a + b, 10, 18, 4, [a + b - 10, a + b + 1]).forEach(o => $('.opts', st).appendChild(optBtn(o, () => {
          $('.box', st).textContent = a + b; speak(`${a} 加 ${b} 等於 ${a + b}`); r++; later(round, 1800);
        }, `10 再多 ${R} 是多少呢？`)));
      }
    }
    draw();
  }
  round();
}

/* ===== 2-B 連加和算式：連加、看圖選算式、比較型加法 ===== */
function u2B(st) {
  const chainQ = () => {
    const x = rand(1, 9), y = 10 - x, z = rand(2, 8), arr = shuffle([[x, y, z], [x, z, y]])[0];
    return { q: `<span class="eq">${arr.join(' ＋ ')} ＝ <span class="box">？</span></span>`, sp: `${arr.join('加')}等於多少？`, vis: '',
      opts: nearOpts(10 + z, 10, 18, 4, [10 + z - 1, 10 + z + 1]), hint: `先找出合起來是 10 的兩個數！`, after: `${x} 和 ${y} 湊成 10，10 ＋ ${z} ＝ ${10 + z}` };
  };
  const picQ = () => {
    const a = rand(6, 9), b = rand(11 - a, 9), e = pick(['🐦', '🐿️', '🦋']);
    return { q: `樹上有 ${a} 隻 ${e}，又飛來 ${b} 隻。<br>要用哪一個算式？`, sp: `樹上有 ${a} 隻，又飛來 ${b} 隻。要用哪一個算式？`,
      vis: `${pics(e, a, true)}<span class="eq">＋</span>${pics(e, b, true)}`,
      opts: mkOpts(`${a} ＋ ${b}`, [a > b ? `${a} − ${b}` : `${b} − ${a}`, `${a} ＋ ${a}`], v => `<span class="eq" style="font-size:34px">${v}</span>`), hint: '又飛來，變多了，要用加法！',
      after: `${a} ＋ ${b} ＝ ${a + b}，一共 ${a + b} 隻` };
  };
  const cmpQ = () => {
    const a = rand(6, 9), d = rand(11 - a, 9);
    return { q: `小松鼠有 ${a} 顆橡果，<br>小兔子<b>比</b>小松鼠<b>多 ${d} 顆</b>。<br>小兔子有幾顆？`, sp: `小松鼠有 ${a} 顆橡果，小兔子比小松鼠多 ${d} 顆。小兔子有幾顆？`,
      vis: '', opts: nearOpts(a + d, 1, 18, 4, [a - d > 0 ? a - d : a + d + 2, d]), hint: '比小松鼠多，所以小兔子的比較多喔！', after: `${a} ＋ ${d} ＝ ${a + d}` };
  };
  const dblQ = () => {
    const n = rand(5, 9), s = Math.random() < 0.5 ? 1 : -1;
    return { q: `${n} ＋ ${n} ＝ ${n * 2}<br>那 <span class="eq">${n} ＋ ${n + s}</span> 是多少？`, sp: `${n} 加 ${n} 等於 ${n * 2}，那 ${n} 加 ${n + s} 是多少？`, vis: '',
      opts: mkOpts(n * 2 + s, [n * 2, n * 2 - s]), hint: `加數${s > 0 ? '多' : '少'} 1，和也${s > 0 ? '多' : '少'} 1 喔！` };
  };
  quiz(st, [chainQ, picQ, cmpQ, chainQ, dblQ]);
}

/* ===== 2-C 加法心算快手：心算 6 題＋找出指定的和 ===== */
function addPair(lo = 11) { const a = rand(2, 9), b = rand(Math.max(2, lo - a), 9); return [a, b]; }
function u2C(st) {
  const calc = () => { const [a, b] = addPair(); return { q: `<span class="eq">${a} ＋ ${b} ＝ <span class="box">？</span></span>`, sp: `${a} 加 ${b} 等於多少？`, vis: '', pad: true, opts: numpadOpts(a + b, 7, 18), hint: '可以先湊成 10 喔！' }; };
  const find = () => {
    const s = rand(12, 16), a = rand(s - 9, 9), right = `${a} ＋ ${s - a}`;
    const ws = new Set();
    while (ws.size < 3) { const x = rand(3, 9), y = rand(3, 9); if (x + y !== s) ws.add(`${x} ＋ ${y}`); }
    return { q: `哪一張卡片的答案是 <b class="big">${s}</b>？`, sp: `哪一張卡片的答案是 ${s}？`, vis: '',
      opts: mkOpts(right, [...ws], v => `<span class="eq" style="font-size:34px">${v}</span>`), hint: '每一張都算算看！' };
  };
  quiz(st, [calc, calc, calc, find, calc, calc, calc, find]);
}

/* ===== 3-A 排排量長度：用迴紋針排出和東西一樣長 ===== */
const CLIP = 44;
function u3A(st) {
  const objs = shuffle([['🖍️ 蠟筆', '#e2574c'], ['🪵 樹枝', '#8b5a2b'], ['🎀 緞帶', '#4fa3d9'], ['🥢 筷子', '#d39f18']]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= objs.length) return api.finish();
    const [name, c] = objs[r], L = rand(3, 7) - (r === 0 ? 1 : 0); let k = 0;
    api.say(`用 📎 迴紋針，從起點排出和${name.split(' ')[1]}<b>一樣長</b>，排好按「好了」。`, `用迴紋針，從起點排出和${name.split(' ')[1]}一樣長，排好按好了。`);
    st.innerHTML = `${dots(r, objs.length)}<div class="measure">
      <div class="mrow"><span class="name">${name}</span><span class="bar" style="width:${L * CLIP}px;background:${c}"></span></div>
      <div class="mrow"><span class="name">📎</span><span class="units"></span></div></div>
      <div class="row-btns"><button class="btn sun" data-a="+">＋ 放一個 📎</button><button class="btn ghost" data-a="-">拿走一個</button><button class="btn" data-a="ok">好了！</button></div>`;
    const draw = () => { $('.units', st).innerHTML = Array.from({ length: k }, () => `<i style="width:${CLIP}px;background:#e6eef5">📎</i>`).join(''); };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === '+' && k < 10) k++;
      if (a === '-' && k > 0) k--;
      if (a === 'ok') {
        if (k === L) {
          const nm = name.split(' ')[1];
          api.say(`對了！${nm}有 <b class="big">${L}</b> 個迴紋針那麼長！`, `對了！${nm}有 ${L} 個迴紋針那麼長！`); sfx('ok');
          r++; later(round, 2200); return;
        }
        api.bad(k < L ? '還不夠長喔！' : '太長了喔！');
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 3-B 比一比誰長：間接比較、個別單位比較、單位不一樣 ===== */
function unitRow(name, n, w, bg, e) { return `<div class="mrow"><span class="name">${name}</span><span class="units">${Array.from({ length: n }, () => `<i style="width:${w}px;background:${bg}">${e}</i>`).join('')}</span></div>`; }
function u3B(st) {
  const indirect = () => {
    const [A, B] = shuffle([['書桌', '🪑'], ['書櫃', '🗄️'], ['窗戶', '🪟'], ['床', '🛏️']]).slice(0, 2), longer = rand(0, 1);
    const P = [A, B];
    return { q: `用一條繩子量：<br>${P[0][0]}的寬<b>${longer === 0 ? '比繩子長' : '比繩子短'}</b>，<br>${P[1][0]}的寬<b>和繩子一樣長</b>。<br>哪一個比較寬？`,
      sp: `用一條繩子量：${P[0][0]}的寬${longer === 0 ? '比繩子長' : '比繩子短'}，${P[1][0]}的寬和繩子一樣長。哪一個比較寬？`,
      vis: `<span style="font-size:60px">${P[0][1]}　〰️　${P[1][1]}</span>`,
      opts: mkOpts(P[longer][0], [P[1 - longer][0]]), hint: '和繩子一樣長的，拿來和另一個比一比！' };
  };
  const units = () => {
    const a = rand(4, 8); let b = rand(3, 8); if (b === a) b = a - 1;
    return { q: '用迴紋針量兩條緞帶，哪一條比較長？', vis: `<div class="measure" style="width:100%">${unitRow('紅緞帶', a, 44, '#f6c9c5', '📎')}${unitRow('藍緞帶', b, 44, '#cfe6f6', '📎')}</div>`,
      opts: mkOpts(a > b ? '紅緞帶' : '藍緞帶', [a > b ? '藍緞帶' : '紅緞帶']), hint: '數數看各有幾個迴紋針！',
      after: `紅緞帶 ${a} 個，藍緞帶 ${b} 個，${a > b ? '紅' : '藍'}緞帶比較長` };
  };
  const howMuch = () => {
    const a = rand(5, 9), b = rand(2, a - 1);
    return { q: `🐛 毛毛蟲有 ${a} 個 📎 長，🐌 蝸牛有 ${b} 個 📎 長。<br>毛毛蟲比蝸牛長幾個 📎？`, sp: `毛毛蟲有 ${a} 個迴紋針長，蝸牛有 ${b} 個迴紋針長。毛毛蟲比蝸牛長幾個迴紋針？`,
      vis: `<div class="measure" style="width:100%">${unitRow('🐛', a, 44, '#e5f6ea', '📎')}${unitRow('🐌', b, 44, '#fff3c4', '📎')}</div>`,
      opts: nearOpts(a - b, 1, 9, 3, [a + b > 9 ? a - b + 1 : a + b]), hint: '多出來的有幾個？', after: `${a} − ${b} ＝ ${a - b}` };
  };
  const diffUnit = () => {
    const n = rand(3, 5);
    return { q: `紅緞帶有 ${n} 個<b>大積木</b>長，<br>藍緞帶有 ${n} 個<b>小積木</b>長。<br>哪一條比較長？`, sp: `紅緞帶有 ${n} 個大積木長，藍緞帶有 ${n} 個小積木長。哪一條比較長？`,
      vis: `<div class="measure" style="width:100%">${unitRow('紅緞帶', n, 72, '#f6c9c5', '🟫')}${unitRow('藍緞帶', n, 36, '#cfe6f6', '▫️')}</div>`,
      opts: mkOpts('紅緞帶', ['藍緞帶', '一樣長']), hint: '數量一樣，但是積木一個大一個小喔！', after: '大積木比較長，所以紅緞帶比較長' };
  };
  quiz(st, [indirect, units, howMuch, diffUnit]);
}

/* ===== 3-C 接起來剪下來：長度的合成和分解 ===== */
function cells(n, c) { return `<span class="units cells">${Array.from({ length: n }, () => `<i style="width:34px;background:${c}"></i>`).join('')}</span>`; }
function u3C(st) {
  const join = () => {
    const a = rand(3, 8), b = rand(3, 9);
    return { q: `紅木條有 ${a} 格長，藍木條有 ${b} 格長，<br>接起來一共有幾格長？`, sp: `紅木條有 ${a} 格長，藍木條有 ${b} 格長，接起來一共有幾格長？`,
      vis: `<div class="mrow">${cells(a, '#e2574c')}${cells(b, '#4fa3d9')}</div>`, pad: true, opts: numpadOpts(a + b, 6, 17), hint: '把兩段的格子合起來數！', after: `${a} ＋ ${b} ＝ ${a + b}` };
  };
  const cut = () => {
    const a = rand(10, 15), b = rand(3, 7);
    return { q: `木條有 ${a} 格長，<b>剪掉</b> ${b} 格，<br>剩下幾格長？`, sp: `木條有 ${a} 格長，剪掉 ${b} 格，剩下幾格長？`,
      vis: `<div class="mrow">${cells(a - b, '#8b5a2b')}<span class="units cells" style="opacity:.35">${Array.from({ length: b }, () => '<i style="width:34px;background:#8b5a2b">✂️</i>').join('')}</span></div>`,
      pad: true, opts: numpadOpts(a - b, 1, 12), hint: '剪掉了，要變少喔！', after: `${a} − ${b} ＝ ${a - b}` };
  };
  const part = () => {
    const t = rand(9, 14), a = rand(3, t - 3);
    return { q: `紅藍接起來的木條共 ${t} 格，紅色有 ${a} 格，<br>藍色有幾格？`, sp: `紅藍接起來的木條共 ${t} 格，紅色有 ${a} 格，藍色有幾格？`,
      vis: `<div class="mrow">${cells(a, '#e2574c')}<span class="units cells">${Array.from({ length: t - a }, () => '<i style="width:34px;background:#fff;border-style:dashed">?</i>').join('')}</span></div>`,
      pad: true, opts: numpadOpts(t - a, 1, 12), hint: '全部減掉紅色的就是藍色的！', after: `${t} − ${a} ＝ ${t - a}` };
  };
  const which = () => {
    const goal = rand(9, 13), a = rand(4, 6), good = goal - a, ws = [good + 1, good - 2, good + 2].filter(v => v > 0);
    return { q: `紅木條 ${a} 格，要再接上哪一條，<br>才會剛好 <b class="big">${goal}</b> 格長？`, sp: `紅木條 ${a} 格，要再接上哪一條，才會剛好 ${goal} 格長？`,
      vis: `<div class="mrow">${cells(a, '#e2574c')}</div>`,
      opts: mkOpts(good, ws, v => `<span style="display:flex;flex-direction:column;align-items:center;gap:4px">${cells(v, '#4fa3d9')}<small class="lbl">${v} 格</small></span>`),
      hint: `${a} 再加幾是 ${goal}？` };
  };
  quiz(st, [join, cut, part, join, which]);
}

LEVELS.u1 = [u1A, u1B, u1C];
LEVELS.u2 = [u2A, u2B, u2C];
LEVELS.u3 = [u3A, u3B, u3C];
