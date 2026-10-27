'use strict';
/* 第 7 單元 兩步驟的計算 ／ 第 8 單元 分東西 ／ 第 9 單元 單位分數 ／ 第 10 單元 面的大小與立體 */

/* ===== 兩步驟題目產生器：回傳 {q, s1(第一步算式), v1, s2, v2, w1(錯的第一步)} ===== */
function twoStep(type) {
  const a = rand(3, 9), b = rand(3, 9);
  if (type === 'mulAdd') { const c = rand(2, 9), p = a * b;
    return { q: `每箱有 <b>${a}</b> 塊磚，搬來 <b>${b}</b> 箱，另外還有 <b>${c}</b> 塊散的磚。一共有幾塊磚？`, s1: `${a} × ${b} ＝ ${p}`, s2: `${p} ＋ ${c} ＝ ${p + c}`, v2: p + c, w1: [`${a} ＋ ${b} ＝ ${a + b}`, `${b} ＋ ${c} ＝ ${b + c}`], trapAns: [a + b + c, a * (b + c)] }; }
  if (type === 'mulSub') { const p = a * b, c = rand(2, Math.min(9, p - 1));
    return { q: `每包有 <b>${a}</b> 根釘子，買了 <b>${b}</b> 包，用掉 <b>${c}</b> 根。還剩幾根？`, s1: `${a} × ${b} ＝ ${p}`, s2: `${p} − ${c} ＝ ${p - c}`, v2: p - c, w1: [`${a} ＋ ${b} ＝ ${a + b}`, `${a} ＋ ${c} ＝ ${a + c}`], trapAns: [p + c, p] }; }
  if (type === 'addMul') { const x = rand(2, 5), c = rand(2, 9 - x) || 2, y = x + c;
    return { q: `每排原來有 <b>${x}</b> 位工人，每排又來了 <b>${c}</b> 位，一共有 <b>${b}</b> 排。現在一共有幾位工人？`, s1: `${x} ＋ ${c} ＝ ${y}`, s2: `${y} × ${b} ＝ ${y * b}`, v2: y * b, w1: [`${x} × ${b} ＝ ${x * b}`, `${c} × ${b} ＝ ${c * b}`], trapAns: [x * b + c, y + b] }; }
  const x = rand(5, 9), c = rand(1, x - 2), y = x - c; // subMul
  return { q: `每盒原來有 <b>${x}</b> 顆螺絲，每盒都拿走 <b>${c}</b> 顆，一共有 <b>${b}</b> 盒。現在還有幾顆？`, s1: `${x} − ${c} ＝ ${y}`, s2: `${y} × ${b} ＝ ${y * b}`, v2: y * b, w1: [`${x} × ${b} ＝ ${x * b}`, `${c} × ${b} ＝ ${c * b}`], trapAns: [x * b - c, x * b] };
}
const TYPES2 = ['mulAdd', 'mulSub', 'addMul', 'subMul'];

/* ===== 7-A 兩個算式：先選第一步，再算出答案 ===== */
function u7A(st) {
  const types = shuffle(TYPES2);
  let r = 0;
  function round() {
    if (r >= types.length) return api.finish();
    const t = twoStep(types[r]);
    api.say(`${t.q}<br><small>第一步：先算什麼？</small>`, toSpeech(t.q) + '。第一步，先算什麼？');
    st.innerHTML = `${dots(r, types.length)}<div class="qvis"><div class="price">🚚 ${t.q}</div></div><div class="lbl center">① 第一步的算式</div><div class="opts"></div><div class="step2"></div>`;
    shuffle([{ h: t.s1, ok: true }, ...t.w1.map(h => ({ h, ok: false }))]).forEach(o => $('.opts', st).appendChild(optBtn(o, () => {
      api.say(`第一步：${t.s1}<br>② 第二步，答案是多少？`, `第一步，${t.s1}。第二步，答案是多少？`);
      const box = $('.step2', st); box.innerHTML = '<div class="lbl center">② 第二步，算出答案</div><div class="kpx"></div>';
      keypad($('.kpx', st), t.v2, () => { $('.step2', st).insertAdjacentHTML('beforeend', `<div class="after">${t.s1}，${t.s2}</div>`); speak(`${t.s1}，${t.s2}`); r++; later(round, 2200); }, { hint: '用第一步的答案，再算第二步。' });
    }, '想一想：題目裡哪兩個數要先一起算？')));
  }
  round();
}

/* ===== 7-B 先算哪一步 ===== */
function u7B(st) {
  quiz(st, shuffle(TYPES2.concat([pick(TYPES2)])).map(ty => () => { const t = twoStep(ty);
    return { q: `${t.q}<br><b>第一步</b>要先算哪一個？`, sp: toSpeech(t.q) + '。第一步要先算哪一個？', vis: '<div class="price">🤔 先算哪一步？</div>', opts: [{ h: t.s1, ok: true }, ...t.w1.map(h => ({ h, ok: false }))], hint: '先找出「每一份一樣多」的地方。', after: `${t.s1}，再 ${t.s2}` }; }));
}

/* ===== 7-C 兩步驟挑戰 ===== */
function u7C(st) {
  const money = () => { const p = rand(4, 9), n = rand(3, 6), cost = p * n, have = pick([50, 60, 80, 100].filter(h => h > cost));
    return { q: `一枝筆 <b>${p}</b> 元，買 <b>${n}</b> 枝，付 <b>${have}</b> 元，要找回幾元？`, vis: `<div class="price">✏️ ${p} 元 × ${n} 枝　👛 ${have} 元</div>`, ans: have - cost, unit: '元', hint: '先算買筆要花幾元，再算找回幾元。', after: `${p} × ${n} ＝ ${cost}，${have} − ${cost} ＝ ${have - cost}` }; };
  quiz(st, [...shuffle(TYPES2).map(ty => () => { const t = twoStep(ty); return { q: t.q, vis: '<div class="price">🚚 兩步驟</div>', ans: t.v2, hint: v => t.trapAns.includes(v) ? '小心！這是只算一步或算錯順序的答案。' : '先算第一步，再算第二步。', after: `${t.s1}，${t.s2}` }; }), money]);
}

/* ===== 7-D 進階挑戰 ===== */
function u7D(st) {
  adv(st, [
    { q: '每包有 <b>6</b> 顆糖，買了 <b>4</b> 包，吃掉 <b>5</b> 顆。還剩幾顆？', sp: '每包有 6 顆糖，買了 4 包，吃掉 5 顆。還剩幾顆？', vis: '<div class="price">🍬 6 顆 × 4 包，吃掉 5 顆</div>', opts: mkOpts(19, [29, 15, 24]),
      ex: '第一步：6 × 4 ＝ 24（顆）。第二步：24 − 5 ＝ <b>19</b>（顆）。', trap: '不能只算 6×4＝24 就停下來，還要減掉吃掉的 5 顆；也不是加 5。' },
    { q: '每排原來有 <b>3</b> 人，每排又來了 <b>2</b> 人，一共有 <b>5</b> 排。現在一共有幾人？', sp: '每排原來有 3 人，每排又來了 2 人，一共有 5 排。現在一共有幾人？',
      vis: `<svg viewBox="0 0 300 160">${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => `<circle cx="${30 + c * 50}" cy="${20 + r * 30}" r="11" fill="${c < 3 ? '#3f7cac' : '#ff7a1a'}"/>`).join('')).join('')}<text x="290" y="85" font-size="16" text-anchor="end">🟠 新來的</text></svg>`,
      opts: mkOpts(25, [17, 13, 30]),
      ex: '每排現在有 3 ＋ 2 ＝ 5 人，5 排是 5 × 5 ＝ <b>25</b> 人。', trap: '是「每排」都來 2 人，一共來了 10 人，不是只來 2 人，所以不是 3×5＋2＝17。' },
    { q: '每盒原來有 <b>9</b> 個蛋，每盒都破了 <b>2</b> 個，一共 <b>6</b> 盒。好的蛋還有幾個？', sp: '每盒原來有 9 個蛋，每盒都破了 2 個，一共 6 盒。好的蛋還有幾個？', vis: '<div class="price">🥚 每盒 9 個，每盒破 2 個，6 盒</div>', opts: mkOpts(42, [52, 54, 48]),
      ex: '每盒好的蛋：9 − 2 ＝ 7 個，6 盒：7 × 6 ＝ <b>42</b> 個。', trap: '每盒都破 2 個，6 盒共破 12 個；9×6−2＝52 只減了 2 個，是錯的。' },
    { q: '小華有 <b>50</b> 元，買了 <b>3</b> 枝 <b>8</b> 元的筆，還剩幾元？', sp: '小華有 50 元，買了 3 枝 8 元的筆，還剩幾元？', vis: '<div class="price">👛 50 元　✏️ 8 元 × 3 枝</div>', opts: mkOpts(26, [34, 42, 24]),
      ex: '筆的錢：8 × 3 ＝ 24 元。剩下：50 − 24 ＝ <b>26</b> 元。', trap: '50 − 8 ＝ 42 只算了 1 枝筆；50 − 24 要退位，個位 10 − 4 ＝ 6，十位 4 − 2 ＝ 2。' },
    { q: '每箱有 <b>10</b> 瓶水，搬來 <b>7</b> 箱，還有 <b>6</b> 瓶沒裝箱。一共有幾瓶水？', sp: '每箱有 10 瓶水，搬來 7 箱，還有 6 瓶沒裝箱。一共有幾瓶水？', vis: '<div class="price">📦 10 瓶 × 7 箱 ＋ 6 瓶</div>', opts: mkOpts(76, [706, 23, 70]),
      ex: '10 × 7 ＝ 70 瓶，70 ＋ 6 ＝ <b>76</b> 瓶。', trap: '7 個十和 6 個一是 76，不是 706；也不是 10＋7＋6。' }
  ]);
}

/* ===== 8-A 平分和分裝 ===== */
function u8A(st) {
  const items = ['🧱', '🔩', '🪵'];
  const rounds = [{ t: 'share', k: 3, e: rand(3, 5) }, { t: 'share', k: 4, e: rand(2, 4) }, { t: 'pack', per: pick([3, 4, 5]), n: rand(3, 5) }];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r], it = items[r];
    if (R.t === 'share') {
      const total = R.k * R.e; let left = total; const cnt = Array(R.k).fill(0);
      api.say(`把 <b>${total}</b> 個${it}<b>平分</b>給 ${R.k} 位工人。點一下工人的盤子，就放 1 個進去。`, `把 ${total} 個平分給 ${R.k} 位工人。點一下盤子，就放 1 個進去。`);
      st.innerHTML = `${dots(r, rounds.length)}<div class="pile"></div><div class="plates">${cnt.map((_, i) => `<div class="plate" data-i="${i}"><b>工人 ${i + 1}</b></div>`).join('')}</div>
        <div class="row-btns"><button class="btn ghost sm" data-a="reset">全部拿回來</button></div>`;
      const draw = () => { $('.pile', st).innerHTML = it.repeat(left) || '<span class="lbl">分完了！</span>'; $$('.plate', st).forEach((p, i) => p.innerHTML = it.repeat(cnt[i]) + `<b>工人 ${i + 1}</b>`); };
      $$('.plate', st).forEach(p => p.onclick = () => {
        if (!left) return; const i = +p.dataset.i;
        if (cnt[i] > Math.min(...cnt)) { toast('先讓每個人都一樣多，一人一個輪流放！'); speak('一人一個輪流放'); }
        cnt[i]++; left--; sfx('tap'); draw();
        if (!left) {
          if (cnt.every(v => v === R.e)) { api.ok(`每人分到 ${R.e} 個！`); speak(`平分好了，每人分到 ${R.e} 個，${R.e} 乘 ${R.k} 等於 ${total}`); $('.pile', st).insertAdjacentHTML('afterend', `<div class="after">每人 ${R.e} 個：${R.e} × ${R.k} ＝ ${total}</div>`); r++; later(round, 2300); }
          else api.bad('每個人分到的不一樣多，這樣不是平分喔！按「全部拿回來」再分一次。');
        }
      });
      $('[data-a="reset"]', st).onclick = () => { cnt.fill(0); left = total; draw(); };
      draw();
    } else {
      const total = R.per * R.n; let left = total, bags = 0;
      api.say(`有 <b>${total}</b> 根${it}，<b>每袋裝 ${R.per} 根</b>。按「裝 1 袋」，裝完以後，可以裝幾袋？`, `有 ${total} 根，每袋裝 ${R.per} 根。裝完以後，可以裝幾袋？`);
      st.innerHTML = `${dots(r, rounds.length)}<div class="pile"></div><div class="crates"></div><div class="row-btns"><button class="btn" data-a="bag">🛍️ 裝 1 袋</button></div><div class="ask"></div>`;
      const draw = () => { $('.pile', st).innerHTML = it.repeat(left) || '<span class="lbl">裝完了！</span>'; $('.crates', st).innerHTML = Array.from({ length: bags }, () => `<span class="crate">${it.repeat(R.per)}</span>`).join(''); };
      $('[data-a="bag"]', st).onclick = () => {
        if (!left) return; left -= R.per; bags++; sfx('tap'); draw();
        if (!left) {
          $('[data-a="bag"]', st).disabled = true;
          api.say('裝完了！一共裝了幾袋？', '裝完了！一共裝了幾袋？');
          const ask = $('.ask', st); ask.innerHTML = '<div class="opts"></div>';
          mkOpts(R.n, [R.n + 1, R.per, R.n - 1]).forEach(o => $('.opts', ask).appendChild(optBtn(o, () => { ask.insertAdjacentHTML('beforeend', `<div class="after">${R.per} × ${R.n} ＝ ${total}，裝了 ${R.n} 袋</div>`); speak(`${R.per} 乘 ${R.n} 等於 ${total}，裝了 ${R.n} 袋`); r++; later(round, 2300); }, '數一數有幾個袋子。')));
        }
      };
      draw();
    }
  }
  round();
}

/* ===== 8-B 分東西算式 ===== */
function u8B(st) {
  const share = () => { const k = rand(2, 5), e = rand(2, 9), t = k * e; return { q: `<b>${t}</b> 塊木板平分給 <b>${k}</b> 個人，每人分到幾塊？`, vis: `<div class="eq">□ × ${k} ＝ ${t}</div><div class="lbl" style="width:100%">每人 □ 塊，${k} 個人</div>`, ans: e, unit: '塊', hint: `想一想：幾的 ${k} 倍是 ${t}？`, after: `${e} × ${k} ＝ ${t}，每人 ${e} 塊` }; };
  const pack = () => { const per = rand(2, 6), n = rand(2, 9), t = per * n; return { q: `<b>${t}</b> 顆螺絲，每盒裝 <b>${per}</b> 顆，可以裝成幾盒？`, vis: `<div class="eq">${per} × □ ＝ ${t}</div><div class="lbl" style="width:100%">每盒 ${per} 顆，□ 盒</div>`, ans: n, unit: '盒', hint: `${per} 個一數，數到 ${t} 數了幾次？`, after: `${per} × ${n} ＝ ${t}，裝成 ${n} 盒` }; };
  quiz(st, [share, pack, share, pack, share]);
}

/* ===== 8-C 分東西挑戰 ===== */
function u8C(st) {
  const pickEq = () => { const k = rand(3, 5), e = rand(3, 8), t = k * e; return { q: `${t} 個便當平分給 ${k} 組，每組幾個？要用哪個算式記錄？`, vis: '<div class="price">🍱 平分</div>', opts: mkOpts(`□ × ${k} ＝ ${t}`, [`${t} × ${k} ＝ □`, `${t} ＋ ${k} ＝ □`, `${k} ＋ □ ＝ ${t}`]), hint: '每組 □ 個，有幾組？', after: `□ × ${k} ＝ ${t}，□ ＝ ${e}` }; };
  const which = () => { const per = rand(3, 6), n = rand(3, 6), t = per * n; return { q: `${t} 枝鉛筆，每 ${per} 枝綁成一束，可以綁幾束？`, vis: '<div class="price">✏️ 分裝</div>', opts: mkOpts(n, [t - per, per, n + 1]), hint: `${per} 個一數。`, after: `${per} × ${n} ＝ ${t}，綁 ${n} 束` }; };
  const two = () => { const k = rand(2, 4), e = rand(4, 8), t = k * e, g = rand(1, e - 2); return { q: `${t} 塊餅乾平分給 ${k} 人，每人再吃掉 ${g} 塊，每人還剩幾塊？`, vis: '<div class="price">🍪 先平分，再吃掉</div>', ans: e - g, unit: '塊', hint: '先算每人分到幾塊。', after: `每人 ${e} 塊，${e} − ${g} ＝ ${e - g}` }; };
  quiz(st, [pickEq, which, two, pickEq, which]);
}

/* ===== 8-D 進階挑戰 ===== */
function u8D(st) {
  adv(st, [
    { q: '<b>24</b> 顆糖平分給 <b>4</b> 人，每人分到幾顆？', sp: '24 顆糖平分給 4 人，每人分到幾顆？', vis: '<div class="price">🍬 24 顆 ➜ 👦👧👦👧</div>', opts: mkOpts(6, [20, 28, 8]),
      ex: '每人 □ 顆，4 人：□ × 4 ＝ 24，因為 6 × 4 ＝ 24，所以每人 <b>6</b> 顆。', trap: '平分不是用 24 − 4，也不是 24 ＋ 4；要找「幾的 4 倍是 24」。' },
    { q: '<b>30</b> 枝筆，每 <b>5</b> 枝裝一盒，可以裝幾盒？', sp: '30 枝筆，每 5 枝裝一盒，可以裝幾盒？', vis: '<div class="eq">5 × □ ＝ 30</div>', opts: mkOpts(6, [25, 35, 5]),
      ex: '5、10、15、20、25、30，數了 6 次，5 × 6 ＝ 30，可以裝 <b>6</b> 盒。', trap: '每盒 5 枝，不是有 5 盒；答案是「盒數」6。' },
    { q: '<b>18</b> 個蘋果<b>平分</b>成 <b>3</b> 盤，要用哪一個算式記錄？', sp: '18 個蘋果平分成 3 盤，要用哪一個算式記錄？', vis: '<div class="price">🍎 × 18 ➜ 🍽️🍽️🍽️</div>',
      opts: mkOpts('□ × 3 ＝ 18', ['18 × 3 ＝ □', '18 ＋ 3 ＝ □', '3 × 18 ＝ □']),
      ex: '每盤 □ 個，有 3 盤，合起來是 18 個：<b>□ × 3 ＝ 18</b>，□ ＝ 6。', trap: '18 × 3 是 3 個 18，會變成 54 個，比原來還多，一定不對。' },
    { q: '<b>20</b> 個積木平分給 <b>4</b> 人，每人再送給朋友 <b>2</b> 個。每人還剩幾個？', sp: '20 個積木平分給 4 人，每人再送給朋友 2 個。每人還剩幾個？', vis: '<div class="price">🟨 × 20 ➜ 4 人，每人送出 2 個</div>', opts: mkOpts(3, [5, 18, 12]),
      ex: '先平分：□ × 4 ＝ 20，每人 5 個。再送出 2 個：5 − 2 ＝ <b>3</b> 個。', trap: '20 − 2 ＝ 18 是錯的；要先算每人分到幾個，再減。' },
    { q: '一包有 <b>6</b> 張貼紙，哥哥買了 <b>4</b> 包，和弟弟兩人<b>平分</b>。每人分到幾張？', sp: '一包有 6 張貼紙，哥哥買了 4 包，和弟弟兩人平分。每人分到幾張？', vis: '<div class="price">⭐ 6 張 × 4 包 ➜ 2 人平分</div>', opts: mkOpts(12, [24, 8, 10]),
      ex: '先算全部：6 × 4 ＝ 24 張。再平分給 2 人：□ × 2 ＝ 24，每人 <b>12</b> 張。', trap: '24 張是兩個人加起來的，還要平分；是「哥哥和弟弟」兩個人，不是 4 個人。' }
  ]);
}

/* ===== 9-A 切一切塗一塗 ===== */
function u9A(st) {
  const ns = shuffle([2, 3, 4, 6, 8]).slice(0, 4), kinds = ['circle', 'rect', 'bar', 'circle'];
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r], kind = kinds[r]; let parts = 1, shade = -1;
    const name = { circle: '披薩', rect: '蛋糕', bar: '吐司' }[kind];
    api.say(`把${name}<b>平分</b>，塗出 ${F(1, n)} 。<br><small>先按「＋切一份」決定分成幾份，再點一塊塗色。</small>`, `把${name}平分，塗出 ${n} 分之 1。先決定分成幾份，再點一塊塗色。`);
    st.innerHTML = `${dots(r, ns.length)}<div class="qvis fz" style="min-height:160px"></div><div class="readout">平分成 <b class="pp">1</b> 份</div>
      <div class="row-btns"><button class="btn steel" data-a="+">＋ 切一份</button><button class="btn ghost sm" data-a="-">少一份</button><button class="btn green" data-a="ok">好了！</button></div>`;
    const draw = () => {
      const box = $('.fz', st); box.innerHTML = fracSVG(kind, parts, shade >= 0 ? [shade] : []);
      const svg = $('svg', box); svg.style.width = kind === 'bar' ? '420px' : '220px';
      $$('[data-k]', box).forEach(p => { p.style.cursor = 'pointer'; p.addEventListener('click', () => { shade = +p.dataset.k; sfx('tap'); draw(); }); });
      if (parts === 1) { const whole = $('svg > *', box); whole.style.cursor = 'pointer'; whole.addEventListener('click', () => { shade = 0; draw(); }); }
      $('.pp', st).textContent = parts;
    };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === '+' && parts < 10) { parts++; shade = -1; }
      if (a === '-' && parts > 1) { parts--; shade = -1; }
      if (a === 'ok') {
        if (parts !== n) return api.bad(`${F(1, n)} 是平分成 ${n} 份，現在是 ${parts} 份喔！`);
        if (shade < 0) return api.bad('還沒有塗色，點一塊塗起來。');
        api.ok(`平分成 ${n} 份，塗 1 份，就是 ${F(1, n)}`); speak(`平分成 ${n} 份，其中 1 份就是 ${n} 分之 1`); r++; later(round, 1900); return;
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 9-B 幾分之一 ===== */
function u9B(st) {
  const nameQ = () => { const n = pick([2, 3, 4, 5, 6, 8]), kind = pick(['circle', 'rect', 'bar']); return { q: '塗色的部分是<b>幾分之一</b>？', vis: fracSVG(kind, n, [rand(0, n - 1)]), opts: mkOpts(n, [n - 1, n + 1, 1].filter(v => v > 1 && v !== n), v => F(1, v)), hint: '數一數全部平分成幾份。', after: `平分成 ${n} 份，塗 1 份，是 ${F(1, n)}` }; };
  const eqQ = () => { const eq = Math.random() < 0.5; return { q: `塗色的部分是 ${F(1, 4)} 嗎？`, sp: '塗色的部分是 4 分之 1 嗎？', vis: fracSVG(pick(['circle', 'rect']), 4, [1], { unequal: !eq }), opts: [{ h: '是', ok: eq }, { h: '不是，沒有平分', ok: !eq }], keep: true, hint: '每一份要一樣大，才是平分。', after: eq ? `平分成 4 份，塗 1 份是 ${F(1, 4)}` : '4 份不一樣大，不能說是四分之一' }; };
  const readQ = () => { const n = pick([3, 5, 6, 7, 8, 9]); const cn = ['', '', '二', '三', '四', '五', '六', '七', '八', '九'][n]; return { q: `「<b>${cn}分之一</b>」要怎麼寫？`, sp: `${cn}分之一要怎麼寫？`, vis: `<div class="price">✍️ ${cn}分之一</div>`, opts: [{ h: F(1, n), ok: true }, { h: F(n, 1), ok: false }, { h: F(1, n + 1), ok: false }], hint: '分成幾份寫在下面，1 份寫在上面。', after: `${cn}分之一寫成 ${F(1, n)}` }; };
  quiz(st, [nameQ, eqQ, readQ, nameQ, eqQ, readQ]);
}

/* ===== 9-C 比大小 ===== */
function u9C(st) {
  const two = () => { let [a, b] = shuffle([2, 3, 4, 5, 6, 8]).slice(0, 2); const big = Math.min(a, b);
    return { q: `同樣大的吐司，${F(1, a)} 和 ${F(1, b)}，哪一個<b>比較大</b>？`, sp: `同樣大的吐司，${a} 分之 1 和 ${b} 分之 1，哪一個比較大？`, vis: `<div style="width:100%">${fracSVG('bar', a, [0])}</div><div style="width:100%">${fracSVG('bar', b, [0], { color: '#3f7cac' })}</div>`, opts: [{ h: F(1, a), ok: a === big }, { h: F(1, b), ok: b === big }], keep: true, hint: '分得越多份，每一份越小。', after: `${F(1, big)} 比較大` }; };
  const small3 = () => { const arr = shuffle([2, 3, 4, 6, 8]).slice(0, 3), sm = Math.max(...arr);
    return { q: `${arr.map(n => F(1, n)).join('、')}，哪一個<b>最小</b>？`, sp: `${arr.map(n => `${n} 分之 1`).join('、')}，哪一個最小？`, vis: '<div class="price">🍞 同樣大的吐司</div>', opts: arr.map(n => ({ h: F(1, n), ok: n === sm })), hint: '分母越大，表示切得越多份，每份越小。', after: `${F(1, sm)} 最小` }; };
  const pizza = () => ({ q: `同一個披薩，哥哥吃 ${F(1, 3)}，妹妹吃 ${F(1, 6)}，誰吃得比較多？`, sp: '同一個披薩，哥哥吃 3 分之 1，妹妹吃 6 分之 1，誰吃得比較多？', vis: fracSVG('circle', 3, [0]) + fracSVG('circle', 6, [0], { color: '#3f7cac' }), opts: mkOpts('哥哥', ['妹妹', '一樣多']), keep: true, hint: '看圖比一比哪一塊大。', after: `${F(1, 3)} 比 ${F(1, 6)} 大，哥哥吃得多` });
  quiz(st, [two, small3, pizza, two, small3]);
}

/* ===== 9-D 進階挑戰 ===== */
function u9D(st) {
  adv(st, [
    { q: `這個披薩分成 4 塊，塗色的部分是 ${F(1, 4)} 嗎？`, sp: '這個披薩分成 4 塊，塗色的部分是 4 分之 1 嗎？', vis: fracSVG('circle', 4, [0], { unequal: true }),
      opts: mkOpts('不是，因為沒有平分', ['是，因為分成 4 塊', '是，因為塗了 1 塊']), keep: true,
      ex: `四分之一要「平分」成 4 份、每份一樣大。這 4 塊大小不一樣，所以<b>不是</b> ${F(1, 4)}。`, trap: '只數塊數不夠，一定要每一份都一樣大才可以。' },
    { q: `${F(1, 2)}、${F(1, 6)}、${F(1, 4)}，哪一個<b>最小</b>？（同一條吐司）`, sp: '2 分之 1、6 分之 1、4 分之 1，哪一個最小？', vis: `<div style="width:100%">${fracSVG('bar', 2, [0])}</div><div style="width:100%">${fracSVG('bar', 6, [0])}</div><div style="width:100%">${fracSVG('bar', 4, [0])}</div>`,
      opts: [{ h: F(1, 6), ok: true }, { h: F(1, 2), ok: false }, { h: F(1, 4), ok: false }], keep: true,
      ex: `同一條吐司切成 6 份，每份最小，所以 <b>${F(1, 6)}</b> 最小。`, trap: '6 是最大的數字，但切得越多，每一份越小！' },
    { q: '一條緞帶<b>平分</b>成 <b>8</b> 段，1 段是全部的幾分之一？', sp: '一條緞帶平分成 8 段，1 段是全部的幾分之一？', vis: fracSVG('bar', 8, [3]),
      opts: [{ h: F(1, 8), ok: true }, { h: F(1, 7), ok: false }, { h: F(8, 1), ok: false }, { h: F(1, 4), ok: false }],
      ex: `平分成 8 段，1 段就是 <b>${F(1, 8)}</b>。`, trap: '數的是「段」不是剪的刀數（剪 7 刀分成 8 段），所以不是七分之一。' },
    { q: `同一個蛋糕，哥哥吃了 ${F(1, 3)}，妹妹吃了 ${F(1, 4)}。誰吃得比較多？`, sp: '同一個蛋糕，哥哥吃了 3 分之 1，妹妹吃了 4 分之 1。誰吃得比較多？', vis: fracSVG('rect', 3, [0]) + fracSVG('rect', 4, [0], { color: '#3f7cac' }),
      opts: mkOpts('哥哥', ['妹妹', '一樣多']), keep: true,
      ex: `${F(1, 3)} 是切成 3 份的 1 份，${F(1, 4)} 是切成 4 份的 1 份，3 份的每份比較大，所以<b>哥哥</b>吃得多。`, trap: '4 比 3 大，但四分之一比三分之一小。' },
    { q: `下面哪一個圖的塗色部分是 ${F(1, 3)}？`, sp: '下面哪一個圖的塗色部分是 3 分之 1？',
      opts: [{ h: fracSVG('circle', 3, [0]), ok: true }, { h: fracSVG('rect', 3, [0], { unequal: true }), ok: false }, { h: fracSVG('rect', 4, [0]), ok: false }, { h: fracSVG('circle', 3, [0, 1]), ok: false }],
      ex: `要平分成 3 份、塗 1 份：<b>第一種圓形</b>才對。長方形沒有平分；4 份塗 1 份是 ${F(1, 4)}；3 份塗 2 份不是三分之一。`, trap: '三個條件都要對：平分、分成 3 份、只塗 1 份。' }
  ]);
}

/* ===== 10 單元：方格圖形 ===== */
const SHAPES = { // 名字、格子
  L8: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3]],
  bar8: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
  sq9: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  T7: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [2, 1], [3, 1]],
  r10: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
  z10: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [1, 4], [0, 3]],
  r12a: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
  r12b: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2], [2, 3]]
};
const shift = (cells, dr, dc) => cells.map(([r, c]) => [r + dr, c + dc]);
function pairShapes(a, b) { // 甲在左、乙在右
  const wa = Math.max(...SHAPES[a].map(x => x[1])) + 1;
  return [{ name: '甲', cells: shift(SHAPES[a], 1, 0), color: '#ffc400' }, { name: '乙', cells: shift(SHAPES[b], 1, wa + 2), color: '#9ec9ea' }];
}
function gridSize(shapes) { return [Math.max(...shapes.flatMap(s => s.cells.map(x => x[0]))) + 2, Math.max(...shapes.flatMap(s => s.cells.map(x => x[1]))) + 2]; }

/* ===== 10-A 數格子比面積 ===== */
function u10A(st) {
  const sets = shuffle([['L8', 'sq9'], ['T7', 'L8'], ['r10', 'sq9'], ['bar8', 'T7'], ['z10', 'r10']]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= sets.length) return api.finish();
    const sh = pairShapes(...sets[r]), [rows, cols] = gridSize(sh), ca = sh[0].cells.length, cb = sh[1].cells.length;
    const marked = new Set();
    api.say('點一點格子數一數，<b>甲</b>和<b>乙</b>哪一個面<b>比較大</b>？', '點一點格子數一數，甲和乙哪一個面比較大？');
    st.innerHTML = `${dots(r, sets.length)}<div class="gridsvg center">${gridShapeSVG(sh.map(s => ({ ...s, cls: 'cell' })), rows, cols)}</div>
      <div class="readout">甲點了 <b class="ca">0</b> 格，乙點了 <b class="cb">0</b> 格</div><div class="opts"></div>`;
    $$('rect.cell', st).forEach((c, i) => c.addEventListener('click', () => {
      sfx('tap'); const key = i;
      if (marked.has(key)) { marked.delete(key); c.setAttribute('opacity', '1'); } else { marked.add(key); c.setAttribute('opacity', '.45'); }
      const all = $$('rect.cell', st); let x = 0, y = 0; marked.forEach(k => all[k].dataset.s === '甲' ? x++ : y++);
      $('.ca', st).textContent = x; $('.cb', st).textContent = y;
    }));
    const ans = ca > cb ? '甲比較大' : ca < cb ? '乙比較大' : '一樣大';
    ['甲比較大', '乙比較大', '一樣大'].forEach(h => $('.opts', st).appendChild(optBtn({ h, ok: h === ans }, () => { $('.readout', st).innerHTML = `甲有 ${ca} 格，乙有 ${cb} 格，${ans}！`; speak(`甲有 ${ca} 格，乙有 ${cb} 格，${ans}`); r++; later(round, 2200); }, '每一格都一樣大，數一數格子的數量。')));
  }
  round();
}

/* ===== 10-B 面的比較 ===== */
function u10B(st) {
  const overlap = () => { const big = pick(['紅', '藍']); return { q: '把兩張紙疊在一起比，哪一張的面<b>比較大</b>？', vis: `<svg viewBox="0 0 260 170"><rect x="20" y="15" width="${big === '紅' ? 200 : 130}" height="${big === '紅' ? 140 : 90}" fill="#ff7a1a" opacity=".85" stroke="#2e3438" stroke-width="3"/><rect x="20" y="15" width="${big === '藍' ? 200 : 130}" height="${big === '藍' ? 140 : 90}" fill="#3f7cac" opacity=".55" stroke="#2e3438" stroke-width="3"/></svg>`, opts: mkOpts(`${big}色紙`, [`${big === '紅' ? '藍' : '紅'}色紙`, '一樣大']), keep: true, hint: '疊在一起，露出來的比較大。', after: `${big}色紙把另一張完全蓋住，${big}色紙比較大` }; };
  const tile = () => { const a = rand(8, 15), b = a + pick([-3, -2, 2, 3]); return { q: `用<b>一樣大</b>的磁磚鋪地板：客廳用了 <b>${a}</b> 塊，廚房用了 <b>${b}</b> 塊。哪一間的地板比較大？`, vis: '<div class="price">🟫 一樣大的磁磚</div>', opts: mkOpts(a > b ? '客廳' : '廚房', [a > b ? '廚房' : '客廳', '一樣大']), keep: true, hint: '磁磚一樣大，用得越多，面越大。', after: `${Math.max(a, b)} 塊比 ${Math.min(a, b)} 塊多` }; };
  const count = () => { const k = pick(Object.keys(SHAPES)), sh = [{ name: '', cells: shift(SHAPES[k], 0, 0), color: '#ffc400' }], [rows, cols] = gridSize(sh);
    return { q: '這個圖形有幾格？', vis: `<div class="gridsvg">${gridShapeSVG(sh, rows, cols)}</div>`, ans: SHAPES[k].length, unit: '格', hint: '一格一格點著數，不要漏掉。', after: `一共 ${SHAPES[k].length} 格` }; };
  quiz(st, [overlap, count, tile, count, overlap]);
}

/* ===== 10-C 正方體和長方體 ===== */
function u10C(st) {
  const faces = () => ({ q: '<b>正方體</b>一共有幾個面？', vis: boxSVG(100, 100, 100), ans: 6, unit: '個面', hint: '前後、左右、上下，一共幾個？', after: '正方體有 6 個面' });
  const cubeFace = () => ({ q: '<b>正方體</b>的每一個面都是什麼形狀？', vis: boxSVG(100, 100, 100), opts: mkOpts('正方形', ['長方形', '三角形', '圓形']), hint: '正方體每個面都一樣大。', after: '正方體的 6 個面都是一樣大的正方形' });
  const boxFaces = () => ({ q: '<b>長方體</b>一共有幾個面？', vis: boxSVG(160, 70, 70, '#c8553d'), ans: 6, unit: '個面', hint: '和正方體一樣數一數。', after: '長方體也有 6 個面' });
  const obj = () => { const ok = Math.random() < 0.5; return ok ? { q: '下面哪一個東西的形狀像<b>正方體</b>？', vis: '<div class="price">🔍 找正方體</div>', opts: mkOpts('🎲 骰子', ['🧱 磚頭', '⚽ 足球', '🥫 罐頭']), hint: '每個面都一樣大的正方形。', after: '骰子像正方體' } : { q: '下面哪一個東西的形狀像<b>長方體</b>？', vis: '<div class="price">🔍 找長方體</div>', opts: mkOpts('🧱 磚頭', ['🎲 骰子', '⚽ 足球', '🥫 罐頭']), hint: '長長的盒子形狀。', after: '磚頭像長方體' }; };
  const flat = () => ({ q: '用<b>長方體</b>的面蓋印章，<b>不可能</b>印出什麼形狀？', vis: boxSVG(160, 70, 70, '#c8553d'), opts: mkOpts('圓形', ['長方形', '正方形']), keep: true, hint: '長方體的面都是四個角的形狀。', after: '長方體的面是長方形或正方形，不會是圓形' });
  quiz(st, [faces, cubeFace, boxFaces, obj, flat]);
}

/* ===== 10-D 進階挑戰 ===== */
function u10D(st) {
  const s1 = pairShapes('bar8', 'sq9'), g1 = gridSize(s1);
  const s5 = pairShapes('r12a', 'r12b'), g5 = gridSize(s5);
  adv(st, [
    { q: '甲看起來比較長，哪一個面<b>比較大</b>？', sp: '甲看起來比較長，哪一個面比較大？', vis: `<div class="gridsvg">${gridShapeSVG(s1, g1[0], g1[1])}</div>`,
      opts: mkOpts('乙', ['甲', '一樣大']), keep: true,
      ex: '甲有 8 格，乙有 3 × 3 ＝ 9 格，<b>乙</b>比較大。', trap: '比面的大小要數格子，不能只看哪一個比較長。' },
    { q: '甲桌面用 <b>6 塊大磁磚</b>剛好鋪滿，乙桌面用 <b>6 塊小磁磚</b>剛好鋪滿。哪一張桌面比較大？', sp: '甲桌面用 6 塊大磁磚剛好鋪滿，乙桌面用 6 塊小磁磚剛好鋪滿。哪一張桌面比較大？',
      vis: `<svg viewBox="0 0 420 130"><text x="70" y="18" font-size="18" font-weight="900" text-anchor="middle">甲</text>${[0, 1, 2].map(c => [0, 1].map(r => `<rect x="${10 + c * 42}" y="${26 + r * 42}" width="40" height="40" fill="#ffc400" stroke="#2e3438" stroke-width="2"/>`).join('')).join('')}
        <text x="280" y="18" font-size="18" font-weight="900" text-anchor="middle">乙</text>${[0, 1, 2].map(c => [0, 1].map(r => `<rect x="${245 + c * 24}" y="${26 + r * 24}" width="22" height="22" fill="#9ec9ea" stroke="#2e3438" stroke-width="2"/>`).join('')).join('')}</svg>`,
      opts: mkOpts('甲', ['乙', '一樣大']), keep: true,
      ex: '兩張桌子都用 6 塊，但甲的磁磚比較大，所以<b>甲</b>的桌面比較大。', trap: '塊數一樣，不代表一樣大；單位（磁磚）大小不同，不能只比數字。' },
    { q: '從這個方向只看得到 <b>3</b> 個面，<b>正方體</b>一共有幾個面？', sp: '從這個方向只看得到 3 個面，正方體一共有幾個面？', vis: boxSVG(100, 100, 100), opts: mkOpts(6, [3, 4, 8]),
      ex: '看得到前面、上面、右面 3 個面，後面、下面、左面被擋住了。一共 <b>6</b> 個面。', trap: '看不到的面也要算！' },
    { q: '<b>長方體</b>的面<b>不可能</b>是什麼形狀？', sp: '長方體的面不可能是什麼形狀？', vis: boxSVG(160, 80, 80, '#c8553d') + boxSVG(150, 70, 50, '#3f7cac'),
      opts: mkOpts('三角形', ['長方形', '正方形']), keep: true,
      ex: '長方體的面都是長方形，有的長方體兩端是正方形，但<b>不會是三角形</b>。', trap: '有些長方體也有正方形的面（像左邊那一個的兩端），所以「正方形」是可能的。' },
    { q: '甲和乙，哪一個面<b>比較大</b>？', sp: '甲和乙，哪一個面比較大？', vis: `<div class="gridsvg">${gridShapeSVG(s5, g5[0], g5[1])}</div>`,
      opts: mkOpts('一樣大', ['甲', '乙']), keep: true,
      ex: '甲是 2 排、每排 6 格，6 × 2 ＝ 12 格；乙是 3 排、每排 4 格，4 × 3 ＝ 12 格。兩個<b>一樣大</b>。', trap: '形狀不一樣，面的大小也可能一樣；甲比較長、乙比較高，都要數格子才知道。' }
  ]);
}

LEVELS.u7 = [u7A, u7B, u7C, u7D];
LEVELS.u8 = [u8A, u8B, u8C, u8D];
LEVELS.u9 = [u9A, u9B, u9C, u9D];
LEVELS.u10 = [u10A, u10B, u10C, u10D];
