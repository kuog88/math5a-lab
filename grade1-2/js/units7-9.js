'use strict';
/* 第 7 單元 錢幣 ／ 第 8 單元 二位數的加減 ／ 第 9 單元 做紀錄 */

/* ===== 錢幣小工具 ===== */
const money = v => v === 100 ? '<span class="bill">100 元</span>' : `<span class="coin c${v}">${v}</span>`;
const moneyRow = vs => `<span class="purse">${vs.map(money).join('')}</span>`;
const sum = a => a.reduce((x, y) => x + y, 0);
/* 用錢幣湊出 v 元（大的先拿） */
function coinsFor(v, set = [50, 10, 5, 1]) { const out = []; set.forEach(c => { while (v >= c) { out.push(c); v -= c; } }); return out; }

/* ===== 7-A 剛好付錢：點錢幣放進付錢盤 ===== */
function u7A(st) {
  const items = shuffle([['🍭', '棒棒糖'], ['🧃', '果汁'], ['🍙', '飯糰'], ['🧸', '小熊'], ['📒', '筆記本'], ['🖍️', '蠟筆']]);
  const prices = [rand(6, 9), rand(12, 29), rand(31, 49), rand(52, 88)];
  let r = 0;
  function round() {
    if (r >= prices.length) return api.finish();
    const p = prices[r], [em, nm] = items[r]; const tray = [];
    api.say(`${nm}賣 <b class="big">${p}</b> 元。<br>點上面的錢，放進付錢盤，要<b>剛好 ${p} 元</b>！`, `${nm}賣 ${p} 元。點上面的錢，放進付錢盤，要剛好 ${p} 元！`);
    st.innerHTML = `${dots(r, prices.length)}<div class="center"><span class="price"><span class="em">${em}</span>${p} 元</span></div>
      <div class="purse">${[1, 5, 10, 50].map(v => `<button type="button" class="money-btn" data-v="${v}">${money(v)}</button>`).join('')}</div>
      <div class="tray"></div><div class="center"><button class="btn" data-a="pay">付錢！</button></div>`;
    const draw = () => {
      $('.tray', st).innerHTML = tray.map((v, i) => `<button type="button" class="money-btn" data-i="${i}">${money(v)}</button>`).join('');
      $$('.tray .money-btn', st).forEach(b => b.onclick = () => { tray.splice(+b.dataset.i, 1); sfx('tap'); draw(); });
    };
    $$('.purse .money-btn', st).forEach(b => b.onclick = () => { if (tray.length < 20) { tray.push(+b.dataset.v); sfx('pop'); speak(b.dataset.v + '元'); draw(); } });
    $('[data-a="pay"]', st).onclick = () => {
      const s = sum(tray);
      if (s === p) { api.ok(`剛好 ${p} 元，謝謝光臨！`); speak(`剛好 ${p} 元，謝謝光臨！`); r++; later(round, 1800); }
      else api.bad(s > p ? `你放了 ${s} 元，太多了喔！點盤子裡的錢可以拿回來。` : `你放了 ${s} 元，還不夠喔！`);
    };
    draw();
  }
  round();
}

/* ===== 7-B 錢幣換一換、數一數 ===== */
function u7B(st) {
  const EX = [[10, 1, 10], [10, 5, 2], [5, 1, 5], [50, 10, 5], [100, 50, 2], [100, 10, 10], [50, 5, 10]];
  const ex = ([big, small, n]) => () => ({
    q: `1 個 ${big} 元可以換幾個 ${small} 元？`.replace(`1 個 100 元`, '1 張 100 元'), vis: `${money(big)}<span class="eq">→</span>${money(small)} ？`,
    opts: mkOpts(n, [n === 10 ? 5 : 10, n === 2 ? 5 : 2, big]), hint: `${small} 元一個一個加，加到 ${big} 元要幾個？`, after: `${Array(n).fill(small).join(' ＋ ')} ＝ ${big}`
  });
  const cnt = () => {
    const vs = [...Array(rand(0, 1)).fill(50), ...Array(rand(1, 3)).fill(10), ...Array(rand(0, 1)).fill(5), ...Array(rand(1, 4)).fill(1)], s = sum(vs);
    return { q: '一共有幾元？', vis: moneyRow(vs), opts: nearOpts(s, 1, 99, 4, [s + 10, s - 5, vs.length]), hint: '先數大的，再數小的！', after: `一共 ${s} 元` };
  };
  const ex3 = shuffle(EX).slice(0, 3);
  quiz(st, [ex(ex3[0]), cnt, ex(ex3[1]), cnt, ex(ex3[2]), cnt]);
}

/* ===== 7-C 買東西挑戰：哪一種付法剛好、錢夠不夠 ===== */
function u7C(st) {
  const exact = () => {
    const p = rand(16, 58), a = coinsFor(p), b = coinsFor(p, [10, 5, 1]).length !== a.length ? coinsFor(p, [10, 5, 1]) : coinsFor(p, [10, 1]);
    const right = pick([a, b]), w1 = coinsFor(p + pick([1, 5, 10])), w2 = coinsFor(p - pick([1, 5]));
    return { q: `🍪 餅乾 <b class="big">${p}</b> 元，<br>哪一種付法<b>剛好</b>？`, sp: `餅乾 ${p} 元，哪一種付法剛好？`, vis: '',
      opts: [{ h: moneyRow(right), ok: true }, { h: moneyRow(w1) }, { h: moneyRow(w2) }], hint: '每一種都數數看是幾元！' };
  };
  const enough = () => {
    const p = rand(25, 60), have = coinsFor(p + pick([-6, -3, 2, 5])), s = sum(have), ok = s >= p;
    return { q: `🎈 氣球 <b class="big">${p}</b> 元，<br>這些錢<b>夠不夠</b>買？`, sp: `氣球 ${p} 元，這些錢夠不夠買？`, vis: moneyRow(have),
      opts: mkOpts(ok ? '夠' : '不夠', [ok ? '不夠' : '夠']), hint: '先數數看有幾元，再和價錢比一比！', after: `有 ${s} 元，${ok ? '夠' : '不夠'}買 ${p} 元的氣球` };
  };
  const fewest = () => {
    const p = pick([15, 20, 55, 60, 35]), right = coinsFor(p), w = coinsFor(p, [10, 5, 1]).length > right.length ? coinsFor(p, [10, 5, 1]) : coinsFor(p, [5, 1]);
    return { q: `要付 <b class="big">${p}</b> 元，<br>哪一種用的錢幣<b>最少</b>？`, sp: `要付 ${p} 元，哪一種用的錢幣最少？`, vis: '',
      opts: [{ h: moneyRow(right), ok: true }, { h: moneyRow(w) }], hint: '先用大的錢幣，個數就會比較少！' };
  };
  quiz(st, [exact, enough, exact, fewest, enough]);
}

/* 二位數加一位數（個位會進位，和在 60 以內） */
function carryPair() { const o = rand(2, 9), t = rand(1, 4), a = t * 10 + o, b = rand(10 - o, 9); return a + b <= 60 ? [a, b] : carryPair(); }
/* 二位數減一位數（個位會退位） */
function borrowPair() { const o = rand(0, 7), a = rand(2, 5) * 10 + o; return [a, rand(o + 1, 9)]; }

/* ===== 8-A 十條和一個：合起來換十條、拆開十條再拿走 ===== */
function u8A(st) {
  const addP = () => ['+', ...carryPair()], subP = () => ['-', ...borrowPair()];
  const ps = [addP(), subP(), addP(), subP()];
  let r = 0;
  function round() {
    if (r >= ps.length) return api.finish();
    const [op, a, b] = ps[r];
    let t = Math.floor(a / 10), o = a % 10, extra = op === '+' ? b : 0, out = 0, phase = op === '+' ? 'merge' : 'break';
    st.innerHTML = `${dots(r, ps.length)}<div class="eq center">${a} ${op === '+' ? '＋' : '−'} ${b} ＝ <span class="box">？</span></div>
      <div class="base"></div><div class="row-btns"></div><div class="opts"></div>`;
    const base = $('.base', st), bt = $('.row-btns', st);
    const draw = () => {
      base.innerHTML = `<div class="grp">${Array.from({ length: t }, () => `<span class="rod">${'<i></i>'.repeat(10)}</span>`).join('')}</div>
        <div class="ones-box">${Array.from({ length: o }, (_, k) => `<span class="unit${k >= o - out ? ' out' : ''}" data-k="${k}"></span>`).join('')}</div>` +
        (extra ? `<div class="ones-box" style="outline:3px dashed #f28c38;border-radius:6px;padding:3px">${'<span class="unit"></span>'.repeat(extra)}</div>` : '');
      if (phase === 'take') $$('.ones-box .unit', base).forEach(u => { u.style.cursor = 'pointer'; u.onclick = take; });
    };
    function btn(txt, cls, fn) { bt.innerHTML = `<button class="btn ${cls}">${txt}</button>`; $('button', bt).onclick = fn; }
    function ask() {
      bt.innerHTML = '';
      const ans = op === '+' ? a + b : a - b;
      api.say(`現在有 ${Math.floor(ans / 10)} 條和 ${ans % 10} 個，是多少？`, `現在有 ${Math.floor(ans / 10)} 條和 ${ans % 10} 個，是多少？`);
      nearOpts(ans, 1, 60, 4, op === '+' ? [ans - 10, ans + 1] : [ans + 10, ans - 1]).forEach(x => $('.opts', st).appendChild(optBtn(x, () => {
        $('.box', st).textContent = ans; speak(`${a} ${op === '+' ? '加' : '減'} ${b} 等於 ${ans}`); r++; later(round, 1800);
      }, '1 條是 10 個，先數條，再數個！')));
    }
    function take() {
      if (out >= b) return;
      out++; sfx('pop'); speak(String(out)); draw();
      if (out === b) { o -= b; out = 0; later(() => { draw(); ask(); }, 600); }
    }
    if (op === '+') {
      api.say(`${a} ＋ ${b}：先把<b>一個一個的</b>合起來！`, `${a} 加 ${b}，先把一個一個的合起來！`);
      btn('🤝 合起來', 'sun', () => {
        o += extra; extra = 0; sfx('tap'); draw();
        api.say(`個位有 ${o} 個，<b>滿 10 個</b>可以換成 1 條！`, `個位有 ${o} 個，滿 10 個可以換成 1 條！`);
        btn('🔄 10 個換 1 條', 'green', () => { o -= 10; t++; sfx('ok'); draw(); ask(); });
      });
    } else {
      api.say(`${a} − ${b}：個位只有 ${o} 個，不夠拿走 ${b} 個，先<b>拆開 1 條</b>！`, `${a} 減 ${b}，個位只有 ${o} 個，不夠拿走 ${b} 個，先拆開 1 條！`);
      btn('🔨 拆開 1 條變 10 個', 'wood', () => {
        t--; o += 10; phase = 'take'; sfx('tap'); bt.innerHTML = ''; draw();
        api.say(`現在有 ${o} 個，點一下拿走一個，拿走 <b class="big">${b}</b> 個！`, `現在有 ${o} 個，點一下拿走一個，拿走 ${b} 個！`);
      });
    }
    draw();
  }
  round();
}

/* ===== 8-B 加減應用題（60 以內） ===== */
function u8B(st) {
  const addTwo = () => { const t1 = rand(1, 3), t2 = rand(1, 5 - t1), o1 = rand(1, 8), o2 = rand(0, 9 - o1), a = t1 * 10 + o1, b = t2 * 10 + o2; return { q: `花園裡有 ${a} 朵 🌻，又種了 ${b} 朵，<br>一共有幾朵？`, sp: `花園裡有 ${a} 朵向日葵，又種了 ${b} 朵，一共有幾朵？`, vis: '', opts: nearOpts(a + b, 1, 60, 4, [a + b - 10, a + b + 10]), hint: '十位和十位加，個位和個位加！', after: `${a} ＋ ${b} ＝ ${a + b}` }; };
  const addOne = () => { const [a, b] = carryPair(); return { q: `🐝 第一群有 ${a} 隻蜜蜂，<br>第二群有 ${b} 隻，合起來有幾隻？`, sp: `第一群有 ${a} 隻蜜蜂，第二群有 ${b} 隻，合起來有幾隻？`, vis: '', opts: nearOpts(a + b, 1, 60, 4, [a + b - 10, a + b + 1]), hint: '個位滿 10 要進到十位喔！', after: `${a} ＋ ${b} ＝ ${a + b}` }; };
  const subOne = () => { const [a, b] = borrowPair(); return { q: `籃子裡有 ${a} 顆 🍓，吃掉 ${b} 顆，<br>還剩幾顆？`, sp: `籃子裡有 ${a} 顆草莓，吃掉 ${b} 顆，還剩幾顆？`, vis: '', opts: nearOpts(a - b, 1, 60, 4, [a - b + 10, a - b - 1]), hint: '個位不夠減，要從十位拆 1 條喔！', after: `${a} − ${b} ＝ ${a - b}` }; };
  const subTwo = () => { const t1 = rand(3, 5), o1 = rand(4, 9), t2 = rand(1, t1 - 1), o2 = rand(1, o1), a = t1 * 10 + o1, b = t2 * 10 + o2; return { q: `哥哥有 ${a} 張卡片，弟弟有 ${b} 張，<br>哥哥比弟弟多幾張？`, sp: `哥哥有 ${a} 張卡片，弟弟有 ${b} 張，哥哥比弟弟多幾張？`, vis: '', opts: nearOpts(a - b, 1, 60, 4, [a + b <= 60 ? a + b : a - b + 10]), hint: '比多幾張，要用減法！', after: `${a} − ${b} ＝ ${a - b}` }; };
  quiz(st, [addOne, subOne, addTwo, subTwo, addOne]);
}

/* ===== 8-C 加減好朋友：加法和減法的關係 ===== */
function u8C(st) {
  const fam = () => { const a = rand(12, 45), b = rand(3, 9); return [a, b, a + b]; };
  const back1 = () => { const [a, b, c] = fam(); return { q: `<span class="eq">${a} ＋ ${b} ＝ ${c}</span><br>那 <span class="eq">${c} − ${b} ＝ <span class="box">？</span></span>`, sp: `${a} 加 ${b} 等於 ${c}，那 ${c} 減 ${b} 等於多少？`, vis: '', opts: mkOpts(a, [b, c, a + 1]), hint: '合起來再拿走一樣多，就回到原來的數！' }; };
  const back2 = () => { const [a, b, c] = fam(); return { q: `<span class="eq">${a} ＋ ${b} ＝ ${c}</span><br>那 <span class="eq">${c} − ${a} ＝ <span class="box">？</span></span>`, sp: `${a} 加 ${b} 等於 ${c}，那 ${c} 減 ${a} 等於多少？`, vis: '', opts: mkOpts(b, [a, c, b + 1]), hint: '拿走一部分，剩下的就是另一部分！' }; };
  const pickFam = () => {
    const [a, b, c] = fam(), s = v => `<span class="eq" style="font-size:32px">${v}</span>`;
    return { q: `哪一個算式和 <span class="eq">${a} ＋ ${b} ＝ ${c}</span> 是<b>一家人</b>？`, sp: `哪一個算式和 ${a} 加 ${b} 等於 ${c} 是一家人？`, vis: '',
      opts: mkOpts(`${c} − ${b} ＝ ${a}`, [`${c} ＋ ${b} ＝ ${c + b}`, `${a} − ${b} ＝ ${a - b}`], s), hint: '一家人用的是同樣的三個數！' };
  };
  const check = () => { const [a, b] = borrowPair(), c = a - b; return { q: `小松鼠算 <span class="eq">${a} − ${b} ＝ ${c}</span>，<br>用哪一個加法可以檢查？`, sp: `小松鼠算 ${a} 減 ${b} 等於 ${c}，用哪一個加法可以檢查？`, vis: '🐿️',
    opts: mkOpts(`${c} ＋ ${b} ＝ ${a}`, [`${a} ＋ ${b} ＝ ${a + b}`, `${c} ＋ ${a} ＝ ${c + a}`], v => `<span class="eq" style="font-size:32px">${v}</span>`), hint: '剩下的加上拿走的，要回到原來的數！' }; };
  quiz(st, [back1, back2, pickFam, check, back1]);
}

/* ===== 9-A 分類回收：把東西放進對的回收桶，再數一數 ===== */
const BINS = [{ n: '紙類', c: '#4fa3d9', items: ['📰', '📦', '📄', '📚'] }, { n: '塑膠類', c: '#2f8f5b', items: ['🧴', '🥤', '🛍️'] }, { n: '鐵鋁罐', c: '#e2574c', items: ['🥫'] }];
function u9A(st) {
  const cnt = [rand(2, 4), rand(2, 4), rand(1, 3)];
  const queue = shuffle(cnt.flatMap((n, b) => Array.from({ length: n }, () => [b, pick(BINS[b].items)])));
  const got = [[], [], []];
  let i = 0;
  st.innerHTML = `${dots(0, 2)}<div class="big-item"></div><div class="bins">${BINS.map((b, k) => `<div class="bin" style="--c:${b.c}" data-b="${k}"><h4>${b.n}</h4></div>`).join('')}</div><div class="opts"></div>`;
  api.say('這是什麼？點一下<b>正確的回收桶</b>！', '這是什麼？點一下正確的回收桶！');
  const show = () => { $('.big-item', st).textContent = queue[i][1]; $('.big-item', st).style.animation = 'none'; void st.offsetWidth; $('.big-item', st).style.animation = ''; };
  $$('.bin', st).forEach(bn => bn.onclick = () => {
    if (i >= queue.length) return;
    const k = +bn.dataset.b, [b, e] = queue[i];
    if (k !== b) { api.bad(`${e} 不是${BINS[k].n}喔！`); return; }
    got[b].push(e); bn.insertAdjacentHTML('beforeend', `<span>${e}</span>`); sfx('pop'); i++;
    if (i < queue.length) show(); else { $('.big-item', st).textContent = '👍'; later(counting, 700); }
  });
  show();
  let q = 0;
  function counting() {
    if (q >= 3) return api.finish();
    $('.prog', st).outerHTML = dots(1, 2);
    api.say(`分好了！<b>${BINS[q].n}</b>有幾個？`, `分好了！${BINS[q].n}有幾個？`);
    const ops = $('.opts', st); ops.innerHTML = '';
    numOpts(got[q].length, 1, 6).forEach(o => ops.appendChild(optBtn(o, () => { q++; later(counting, 900); }, '數數看那個桶子裡有幾個！')));
  }
}

/* ===== 9-B 數一數記下來：數花朵，填進表格 ===== */
const FLW = [['🌷', '鬱金香'], ['🌻', '向日葵'], ['🌼', '小黃花']];
function u9B(st) {
  const cnt = shuffle([rand(3, 4), rand(5, 6), rand(7, 9)]), spots = scatter(cnt[0] + cnt[1] + cnt[2], 6, 4);
  let k = 0; const marks = shuffle(cnt.flatMap((n, f) => Array(n).fill(f)));
  const field = marks.map((f, j) => `<span style="left:${spots[j][0]}%;top:${spots[j][1]}%">${FLW[f][0]}</span>`).join('');
  const done = [null, null, null];
  const table = () => `<table class="tbl"><tr><th>花</th>${FLW.map(f => `<th>${f[0]}<br><small>${f[1]}</small></th>`).join('')}</tr><tr><th>朵數</th>${done.map(v => v === null ? '<td class="q">？</td>' : `<td>${v}</td>`).join('')}</tr></table>`;
  const ask = f => () => {
    if (f > 0) done[f - 1] = cnt[f - 1];
    return { q: `數數看，<b>${FLW[f][1]}</b> ${FLW[f][0]} 有幾朵？`, sp: `數數看，${FLW[f][1]}有幾朵？`, vis: `<div class="meadow" style="width:100%">${field}</div>${table()}`,
      opts: numOpts(cnt[f], 1, 10, 4), hint: '數過的可以用手指頭記住喔！' };
  };
  const most = () => {
    done[2] = cnt[2];
    const mx = cnt.indexOf(Math.max(...cnt));
    return { q: '看表格，哪一種花<b>最多</b>？', vis: table(), opts: FLW.map((f, j) => ({ h: `${f[0]} ${f[1]}`, ok: j === mx })), keep: true, hint: '比一比表格裡的數字！' };
  };
  quiz(st, [ask(0), ask(1), ask(2), most]);
}

/* ===== 9-C 看統計表：最多、最少、多幾個、一共 ===== */
function u9C(st) {
  const F = shuffle([['🍎', '蘋果'], ['🍌', '香蕉'], ['🍇', '葡萄'], ['🍉', '西瓜']]);
  let v = shuffle([3, 4, 6, 8]); v = v.map(x => x + rand(0, 1)); while (new Set(v).size < 4) v = shuffle([3, 5, 6, 8]);
  const tbl = `<table class="tbl"><caption style="font-weight:900;padding-bottom:6px">一年甲班最喜歡的水果</caption><tr><th>水果</th>${F.map(f => `<th>${f[0]}<br><small>${f[1]}</small></th>`).join('')}</tr><tr><th>人數</th>${v.map(x => `<td>${x}</td>`).join('')}</tr></table>`;
  const mx = v.indexOf(Math.max(...v)), mn = v.indexOf(Math.min(...v)), fo = F.map((f, j) => j);
  const name = j => `${F[j][0]} ${F[j][1]}`;
  const rounds = [
    () => ({ q: '喜歡哪一種水果的人<b>最多</b>？', vis: tbl, opts: fo.map(j => ({ h: name(j), ok: j === mx })), keep: true, hint: '找表格裡最大的數字！' }),
    () => ({ q: '喜歡哪一種水果的人<b>最少</b>？', vis: tbl, opts: fo.map(j => ({ h: name(j), ok: j === mn })), keep: true, hint: '找表格裡最小的數字！' }),
    () => ({ q: `喜歡${F[1][1]}的有幾人？`, vis: tbl, opts: numOpts(v[1], 1, 10, 4), hint: `找到${F[1][1]}那一格！` }),
    () => ({ q: `喜歡${F[mx][1]}的比喜歡${F[mn][1]}的<b>多幾人</b>？`, vis: tbl, opts: nearOpts(v[mx] - v[mn], 1, 9, 4, [v[mx] + v[mn] <= 18 ? v[mx] + v[mn] : 1]), hint: '用減法算算看！', after: `${v[mx]} − ${v[mn]} ＝ ${v[mx] - v[mn]}` }),
    () => ({ q: `喜歡${F[0][1]}和${F[2][1]}的<b>一共</b>有幾人？`, vis: tbl, pad: true, opts: numpadOpts(v[0] + v[2], 7, 18), hint: '用加法算算看！', after: `${v[0]} ＋ ${v[2]} ＝ ${v[0] + v[2]}` })
  ];
  quiz(st, rounds);
}

LEVELS.u7 = [u7A, u7B, u7C];
LEVELS.u8 = [u8A, u8B, u8C];
LEVELS.u9 = [u9A, u9B, u9C];
