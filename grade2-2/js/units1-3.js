'use strict';
/* 第 1 單元 數到 1000 ／ 第 2 單元 加加減減 ／ 第 3 單元 幾公尺 */

/* ===== 1-A 積木工作台：用百、十、一的積木排出指定的數 ===== */
function u1A(st) {
  const ns = [rand(1, 4) * 100 + rand(1, 9) * 10 + rand(1, 9), rand(5, 9) * 100 + rand(1, 9), rand(2, 9) * 100 + rand(1, 9) * 10, 1000];
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r]; let h = 0, t = 0, o = 0;
    api.say(`用積木排出 <b class="big">${n}</b>，排好按「好了」。<br><small>1 板是 100，1 條是 10，1 顆是 1。</small>`, `用積木排出 ${n}，排好按好了。1 板是 100，1 條是 10，1 顆是 1。`);
    st.innerHTML = `${dots(r, ns.length)}
      <div class="blocks"></div>
      <div class="readout"><span class="h">0</span> 個百、<span class="t">0</span> 個十、<span class="o">0</span> 個一</div>
      <div class="row-btns">
        <button class="btn" data-a="h+">＋ 1 板（百）</button><button class="btn steel" data-a="t+">＋ 1 條（十）</button><button class="btn hz" data-a="o+">＋ 1 顆（一）</button>
      </div>
      <div class="row-btns">
        <button class="btn ghost sm" data-a="h-">拿走 1 板</button><button class="btn ghost sm" data-a="t-">拿走 1 條</button><button class="btn ghost sm" data-a="o-">拿走 1 顆</button>
        <button class="btn dark sm" data-a="to" hidden>10 顆換 1 條</button><button class="btn dark sm" data-a="tt" hidden>10 條換 1 板</button>
      </div>
      <div class="center"><button class="btn green" data-a="ok">好了！</button></div>`;
    const draw = () => {
      $('.blocks', st).innerHTML = blocksHTML(h, t, o);
      $('.h', st).textContent = h; $('.t', st).textContent = t; $('.o', st).textContent = o;
      $('[data-a="to"]', st).hidden = o < 10; $('[data-a="tt"]', st).hidden = t < 10;
    };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === 'h+' && h < 10) h++;
      if (a === 't+' && t < 19) t++;
      if (a === 'o+' && o < 19) o++;
      if (a === 'h-' && h > 0) h--;
      if (a === 't-' && t > 0) t--;
      if (a === 'o-' && o > 0) o--;
      if (a === 'to') { o -= 10; t++; api.ok('10 個一換成 1 個十！'); }
      if (a === 'tt') { t -= 10; h++; api.ok('10 個十換成 1 個百！'); }
      if (a === 'ok') {
        if (o >= 10 || t >= 10) { toast('有 10 個以上，先換一換吧！'); speak('有 10 個以上，先換一換吧！'); return; }
        const v = h * 100 + t * 10 + o;
        if (v === n) {
          const msg = n === 1000 ? '10 個百就是 1000！' : `${h} 個百、${t} 個十、${o} 個一，就是 ${n}！`;
          api.ok(msg); speak(msg); r++; later(round, 1900); return;
        }
        api.bad(`現在是 ${v} 喔！${n === 1000 ? '1000 是 10 個百。' : `百位要 ${Math.floor(n / 100)}，十位要 ${Math.floor(n / 10) % 10}，個位要 ${n % 10}。`}`);
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 1-B 位值和比大小 ===== */
const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function cnNum(n) { // 1000 以內的中文讀法
  if (n === 1000) return '一千';
  const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10;
  let s = h ? CN[h] + '百' : '';
  if (t) s += CN[t] + '十'; else if (h && o) s += '零';
  if (o) s += CN[o];
  return s;
}
function u1B(st) {
  const placeQ = () => {
    const h = rand(2, 9), t = pick([0, rand(1, 9)]), o = rand(1, 9), n = h * 100 + t * 10 + o;
    return { q: `<b>${h}</b> 個百、<b>${t}</b> 個十、<b>${o}</b> 個一，合起來是多少？`, sp: `${h} 個百、${t} 個十、${o} 個一，合起來是多少？`,
      vis: `<div class="blocks">${blocksHTML(h, t, o)}</div>`, opts: mkOpts(n, [h * 100 + o * 10 + t, h * 10 + t + o, n + 100].filter(v => v !== n && v <= 1000)),
      hint: '百位、十位、個位要放對位置，0 個十，十位就寫 0。' };
  };
  const readQ = () => {
    const n = pick([rand(1, 9) * 100 + rand(1, 9), rand(1, 9) * 100 + rand(1, 9) * 10, rand(1, 9) * 100 + rand(1, 9) * 10 + rand(1, 9)]);
    const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10;
    const w = [h * 10 + o, h * 100 + o * 10 + t, h * 1000 + t * 10 + o].filter(v => v !== n);
    return { q: `「<b>${cnNum(n)}</b>」寫成數字是多少？`, vis: `<div class="price">🪧 ${cnNum(n)}</div>`, opts: mkOpts(n, w.slice(0, 3)), hint: '一個三位數有百位、十位、個位三個位置喔！' };
  };
  const cmpQ = () => {
    const h = rand(2, 9), a = h * 100 + rand(10, 99); let b = h * 100 + rand(10, 99); if (a === b) b++;
    return { q: '哪一個數<b>比較大</b>？', sp: '哪一個數比較大？', opts: mkOpts(Math.max(a, b), [Math.min(a, b)]), hint: '百位一樣，就比十位；十位也一樣，再比個位。' };
  };
  const seqQ = () => {
    const by = pick([1, 10, 100]);
    const s = by === 100 ? rand(1, 5) * 100 + rand(0, 9) * 10 : by === 10 ? rand(2, 8) * 100 + rand(5, 6) * 10 + rand(0, 9) : rand(2, 9) * 100 + 97;
    const seq = [s, s + by, s + 2 * by, s + 3 * by], ans = s + 4 * by;
    return { q: `${by} 個一數，下一個是多少？`, vis: `<div class="seq-row">${seq.map(v => `<span class="price">${v}</span>`).join(' ➜ ')} ➜ <span class="box">？</span></div>`, opts: mkOpts(ans, [ans + by, ans - 1 + (by === 1 ? 2 : 0), s + 3 * by + (by === 100 ? 10 : 100)].filter(v => v !== ans && v <= 1000)), hint: `每次多 ${by} 喔！` };
  };
  const digitQ = () => {
    let n = rand(102, 987); const pos = pick(['百', '十', '個']);
    const d = { 百: Math.floor(n / 100), 十: Math.floor(n / 10) % 10, 個: n % 10 }[pos];
    return { q: `<b class="big">${n}</b> 的<b>${pos}位</b>數字是多少？`, sp: `${n} 的${pos}位數字是多少？`, opts: mkOpts(d, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== d).sort(() => Math.random() - 0.5).slice(0, 3)), hint: '從右邊數過來：個位、十位、百位。' };
  };
  quiz(st, shuffle([placeQ, readQ, cmpQ, seqQ, digitQ, placeQ]).concat([{ q: '<b>1000</b> 是幾個百？', sp: '1000 是幾個百？', vis: `<div class="price">💯 × ？ = 1000</div>`, opts: mkOpts(10, [100, 1, 9]), hint: '100、200、300……數到 1000 要數幾次？', after: '10 個百是 1000（一千）' }]));
}

/* ===== 1-C 剛好付錢：100、500、1000 元 ===== */
function u1C(st) {
  const things = [['🪚', '電鋸'], ['🪜', '梯子'], ['🧰', '工具箱'], ['⛑️', '安全帽'], ['🔦', '手電筒'], ['🧯', '滅火器']];
  const rounds = shuffle(things).slice(0, 4).map(([e, nm], k) => [e, nm, k === 0 ? rand(2, 4) * 100 + rand(1, 9) * 10 : rand(5, 9) * 100 + rand(0, 9) * 10 + pick([0, rand(1, 9)])]);
  const purse = [500, 100, 100, 100, 100, 50, 10, 10, 10, 10, 10, 5, 1, 1, 1, 1, 1];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const [e, nm, price] = rounds[r];
    api.say(`${nm}要 <b class="big">${price}</b> 元，從錢包拿出<b>剛好</b>的錢，放到付錢盤。`, `${nm}要 ${price} 元，從錢包拿出剛好的錢，放到付錢盤。`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="center"><span class="price"><span class="em">${e}</span>${nm} ${price} 元</span></div>
      <div class="lbl">👛 錢包（點一下放進付錢盤）</div><div class="purse"></div><div class="tray"></div>
      <div class="readout">付錢盤共 <b class="sum">0</b> 元</div><div class="center"><button class="btn green" data-a="ok">付錢！</button></div>`;
    const pu = $('.purse', st), tr = $('.tray', st);
    purse.forEach(v => {
      const b = document.createElement('button'); b.className = 'money-btn'; b.type = 'button'; b.dataset.v = v; b.innerHTML = moneyHTML(v);
      b.onclick = () => { sfx('tap'); (b.parentNode === pu ? tr : pu).appendChild(b); upd(); };
      pu.appendChild(b);
    });
    const sum = () => $$('.money-btn', tr).reduce((s, b) => s + +b.dataset.v, 0);
    const upd = () => { $('.sum', st).textContent = sum(); };
    $('[data-a="ok"]', st).onclick = () => {
      const s = sum();
      if (s === price) { api.ok(`剛好 ${price} 元！`); speak(`剛好 ${price} 元`); r++; later(round, 1600); }
      else api.bad(s > price ? `付了 ${s} 元，太多了，要剛好 ${price} 元。` : `付了 ${s} 元，還不夠喔！`);
    };
  }
  round();
}

/* ===== 1-D 進階挑戰 ===== */
function u1D(st) {
  const lineSVG = `<svg viewBox="0 0 520 90"><line x1="20" y1="45" x2="500" y2="45" stroke="#2e3438" stroke-width="4"/>
    ${[985, 990, 995, 1000, 1005].map((v, k) => `<line x1="${40 + k * 110}" y1="33" x2="${40 + k * 110}" y2="57" stroke="#2e3438" stroke-width="4"/><text x="${40 + k * 110}" y="84" font-size="20" font-weight="900" text-anchor="middle">${k === 0 ? 985 : '？'}</text>`).join('')}
    <path d="M40 30 Q95 0 150 30 M150 30 Q205 0 260 30 M260 30 Q315 0 370 30" fill="none" stroke="#ff7a1a" stroke-width="3"/><text x="95" y="14" font-size="16" text-anchor="middle">第1次</text><text x="205" y="14" font-size="16" text-anchor="middle">第2次</text><text x="315" y="14" font-size="16" text-anchor="middle">第3次</text></svg>`;
  adv(st, [
    { q: '「<b>七百零六</b>」寫成數字是多少？', sp: '七百零六，寫成數字是多少？', vis: '<div class="price">🪧 七百零六</div>',
      opts: mkOpts(706, [76, 760, 7006]),
      ex: '七百零六 ＝ 7 個百、0 個十、6 個一。十位沒有東西也要寫 0 佔位子，所以是 <b>706</b>。',
      trap: '「零」表示十位是 0，不能省略寫成 76，也不是 7006（那是四位數）。' },
    { q: '<b>3</b> 個百、<b>15</b> 個十、<b>4</b> 個一，合起來是多少？', sp: '3 個百、15 個十、4 個一，合起來是多少？',
      vis: `<div class="blocks">${blocksHTML(3, 15, 4)}</div>`, opts: mkOpts(454, [3154, 354, 3514]),
      ex: '15 個十 ＝ 10 個十和 5 個十 ＝ 1 個百和 5 個十。<br>所以共有 3＋1＝4 個百、5 個十、4 個一，就是 <b>454</b>。',
      trap: '十位不能寫 15！10 個十要換成 1 個百。' },
    { q: '用 <b>3、0、8</b> 三張數字卡排成三位數，<b>最小</b>的是多少？', sp: '用 3、0、8 三張數字卡排成三位數，最小的是多少？',
      vis: '<div class="row-btns"><span class="price">3</span><span class="price">0</span><span class="price">8</span></div>', opts: mkOpts(308, ['038', 380, 803], v => N(v)),
      ex: '想要最小，百位放最小的數字。但是百位不能放 0（038 只是 38，不是三位數），所以百位放 3，十位放 0，個位放 8：<b>308</b>。',
      trap: '0 不能放在百位！038 不是三位數。' },
    { q: '從 <b>985</b> 開始，<b>5 個一數</b>，往後數 <b>3 次</b>，是多少？', sp: '從 985 開始，5 個一數，往後數 3 次，是多少？',
      vis: lineSVG, opts: mkOpts(1000, [995, 990, 1015]),
      ex: '985 ➜ 990（第 1 次）➜ 995（第 2 次）➜ <b>1000</b>（第 3 次）。',
      trap: '985 是起點，不算第 1 次。數到 995 只數了 2 次喔！' },
    { q: '錢包裡有這些錢，<b>一共是幾元</b>？', sp: '錢包裡有這些錢，一共是幾元？',
      vis: `<div class="purse">${[500, 100, 100, 50, 50, 50, 10, 10, 10, 10].map(moneyHTML).join('')}</div>`, opts: mkOpts(890, [790, 860, 1000]),
      ex: '500 元 1 張、100 元 2 張是 700 元；50 元 3 個是 150 元；10 元 4 個是 40 元。<br>700＋150＋40＝<b>890</b> 元。',
      trap: '50 元硬幣 3 個是 150 元，不要當成 30 元；先算大的錢再算小的錢比較不會漏。' }
  ]);
}

/* ===== 2-A 直式算算看 ===== */
function genAdd(kind) { // kind: 1 個位進位、2 二次進位
  for (;;) {
    const a = rand(120, 680), b = rand(110, 300), s = a + b;
    const c1 = a % 10 + b % 10 >= 10, c2 = Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 + (c1 ? 1 : 0) >= 10;
    if (s < 1000 && (kind === 1 ? c1 && !c2 : c1 && c2)) return [a, b, s];
  }
}
function genSub(kind) { // kind: 1 十位退個位、2 連續退位
  for (;;) {
    const a = kind === 2 ? rand(3, 9) * 100 + rand(0, 1) * 10 + rand(0, 4) : rand(400, 980), b = rand(110, a - 100), d = a - b;
    const b1 = a % 10 < b % 10, b2 = Math.floor(a / 10) % 10 - (b1 ? 1 : 0) < Math.floor(b / 10) % 10;
    if (d >= 100 && (kind === 1 ? b1 && !b2 : b1 && b2)) return [a, b, d];
  }
}
function u2A(st) {
  const qs = [['+', ...genAdd(1)], ['+', ...genAdd(2)], ['−', ...genSub(1)], ['−', ...genSub(2)]];
  quiz(st, qs.map(([op, a, b, ans]) => () => ({
    q: `用直式算：<b>${a} ${op} ${b}</b>，答案是多少？<br><small>${op === '+' ? '從個位加起，滿 10 要進位。' : '從個位減起，不夠減要向前一位借 1。'}</small>`,
    sp: `用直式算 ${a} ${op === '+' ? '加' : '減'} ${b}，答案是多少？`,
    vis: vertHTML(a, op === '+' ? '+' : '−', b), ans,
    hint: v => op === '+' ? (v === ans - 100 || v === ans - 10 ? '好像忘了進位喔！' : '從個位開始，一位一位加。') : (v === ans + 100 || v === ans + 10 ? '借位以後，前一位要少 1 喔！' : '從個位開始，一位一位減。'),
    after: `${a} ${op} ${b} ＝ ${ans}`
  })));
}

/* ===== 2-B 加減應用題（加減互逆） ===== */
function u2B(st) {
  const T = [
    () => { const a = rand(150, 480), b = rand(120, 450); return { q: `工地有 <b>${a}</b> 塊磚，又運來 <b>${b}</b> 塊，現在有幾塊？`, ans: a + b, eq: `${a} + ${b} ＝ ${a + b}` }; },
    () => { const b = rand(120, 350), c = rand(b + 120, 950); return { q: `倉庫原來有一些釘子，又買了 <b>${b}</b> 根，現在有 <b>${c}</b> 根。原來有幾根？`, ans: c - b, eq: `${c} − ${b} ＝ ${c - b}` }; },
    () => { const a = rand(500, 950), c = rand(110, a - 120); return { q: `有 <b>${a}</b> 包水泥，用掉一些後，還剩 <b>${c}</b> 包。用掉幾包？`, ans: a - c, eq: `${a} − ${c} ＝ ${a - c}` }; },
    () => { const b = rand(120, 400), c = rand(110, 450); return { q: `一捆電線剪掉 <b>${b}</b> 公分，還剩 <b>${c}</b> 公分。原來有幾公分？`, ans: b + c, eq: `${b} + ${c} ＝ ${b + c}`, unit: '公分' }; },
    () => { const a = rand(400, 900), b = rand(110, 300); return { q: `大卡車載了 <b>${a}</b> 箱，小卡車比大卡車<b>少</b> <b>${b}</b> 箱。小卡車載幾箱？`, ans: a - b, eq: `${a} − ${b} ＝ ${a - b}` }; },
    () => { const a = rand(200, 500), b = rand(110, 400); return { q: `紅隊搬了 <b>${a}</b> 塊磚，藍隊比紅隊<b>多</b>搬 <b>${b}</b> 塊。藍隊搬了幾塊？`, ans: a + b, eq: `${a} + ${b} ＝ ${a + b}` }; }
  ];
  quiz(st, shuffle(T).slice(0, 5).map(f => () => { const t = f(); return { q: t.q, vis: '<div class="price">🚧 工地應用題</div>', ans: t.ans, unit: t.unit, hint: '想一想：要算「合起來」還是「拿走、相差」？', after: t.eq }; }));
}

/* ===== 2-C 估算夠不夠 ===== */
function u2C(st) {
  const near = h => h * 100 + pick([-3, -2, -1, 1, 2, 3]);
  const estQ = () => {
    const h1 = rand(2, 4), h2 = rand(2, 4), a = near(h1), b = near(h2), e = (h1 + h2) * 100;
    return { q: `<b>${a} + ${b}</b> 大約是幾百？`, sp: `${a} 加 ${b} 大約是幾百？`, vis: `<div class="eq">${a} + ${b} ≈ ？</div>`,
      opts: mkOpts(e, [e - 100, e + 100]), hint: `${a} 大約是 ${h1}00，${b} 大約是 ${h2}00。`, after: `${a} 大約 ${h1}00，${b} 大約 ${h2}00，合起來大約 ${e}` };
  };
  const subEst = () => {
    const h1 = rand(6, 9), h2 = rand(2, 4), a = near(h1), b = near(h2), e = (h1 - h2) * 100;
    return { q: `<b>${a} − ${b}</b> 大約是幾百？`, sp: `${a} 減 ${b} 大約是幾百？`, vis: `<div class="eq">${a} − ${b} ≈ ？</div>`,
      opts: mkOpts(e, [e - 100, e + 100]), hint: `${a} 大約是 ${h1}00，${b} 大約是 ${h2}00。`, after: `大約 ${h1}00 − ${h2}00 ＝ ${e}` };
  };
  const enough = () => {
    const a = rand(1, 3) * 100 + rand(80, 98), b = rand(1, 3) * 100 + rand(5, 30), s = a + b, have = pick([Math.ceil(s / 100) * 100, Math.floor(s / 100) * 100]);
    const ok = have >= s;
    return { q: `買 <b>${a}</b> 元的鐵鎚和 <b>${b}</b> 元的鋸子，帶 <b>${have}</b> 元夠不夠？`, sp: `買 ${a} 元的鐵鎚和 ${b} 元的鋸子，帶 ${have} 元夠不夠？`,
      vis: `<span class="price">🔨 ${a} 元</span><span class="price">🪚 ${b} 元</span><span class="price">👛 ${have} 元</span>`,
      opts: [{ h: '夠', ok }, { h: '不夠', ok: !ok }], keep: true, hint: '先估一估，再算一算合起來是幾元。', after: `${a} + ${b} ＝ ${s}，${ok ? `${have} 元夠` : `${have} 元不夠`}` };
  };
  const chain = () => {
    const a = rand(110, 300), b = rand(110, 300), c = rand(110, 300);
    return { q: `三台卡車分別載了 <b>${a}</b>、<b>${b}</b>、<b>${c}</b> 塊磚，一共載了幾塊？`, vis: '<div class="price">🚚🚚🚚</div>', ans: a + b + c, hint: '先算前兩個，再加第三個。', after: `${a} + ${b} ＝ ${a + b}，${a + b} + ${c} ＝ ${a + b + c}` };
  };
  quiz(st, [estQ, subEst, enough, enough, chain]);
}

/* ===== 2-D 進階挑戰 ===== */
function u2D(st) {
  adv(st, [
    { q: '用直式算：<b>503 − 278</b> ＝ ？', sp: '用直式算 503 減 278 等於多少？', vis: vertHTML(503, '−', 278), opts: mkOpts(225, [335, 375, 235]),
      ex: '個位 3 不夠減 8，要向十位借，但十位是 0，所以先向百位借 1 個百（＝10 個十），十位變 10，再借 1 個十給個位：<br>個位 13−8＝5，十位 9−7＝2，百位 4−2＝2，答案 <b>225</b>。',
      trap: '十位是 0 時要連續退位，百位要記得減 1；直接用 8−3＝5 是錯的。' },
    { q: '一盒彩色筆用掉 <b>156</b> 枝，還剩 <b>287</b> 枝。原來有幾枝？', sp: '一盒彩色筆用掉 156 枝，還剩 287 枝。原來有幾枝？', vis: '<div class="price">🖍️ 原來 □ 枝</div>', opts: mkOpts(443, [131, 433, 343]),
      ex: '原來的 ＝ 用掉的 ＋ 剩下的：156 ＋ 287 ＝ <b>443</b> 枝。',
      trap: '看到「用掉」不一定要用減法！問的是「原來」，要把用掉的加回去。' },
    { q: '哥哥有 <b>465</b> 張貼紙，比弟弟<b>多</b> <b>128</b> 張。弟弟有幾張？', sp: '哥哥有 465 張貼紙，比弟弟多 128 張。弟弟有幾張？',
      vis: `<svg viewBox="0 0 460 110"><text x="0" y="30" font-size="20" font-weight="900">哥哥</text><rect x="60" y="10" width="380" height="28" fill="#ff7a1a"/><text x="250" y="31" font-size="18" text-anchor="middle" fill="#fff" font-weight="900">465</text>
        <text x="0" y="84" font-size="20" font-weight="900">弟弟</text><rect x="60" y="64" width="275" height="28" fill="#3f7cac"/><text x="197" y="85" font-size="18" text-anchor="middle" fill="#fff" font-weight="900">？</text>
        <line x1="335" y1="56" x2="440" y2="56" stroke="#c8553d" stroke-width="3"/><text x="387" y="84" font-size="18" text-anchor="middle" fill="#c8553d" font-weight="900">多 128</text></svg>`,
      opts: mkOpts(337, [593, 347, 343]),
      ex: '哥哥比弟弟多，表示弟弟比較少：465 − 128 ＝ <b>337</b> 張。',
      trap: '題目有「多」字，但問的是比較少的弟弟，要用減法，不是 465＋128。' },
    { q: '<b>900 − 365 − 235</b> ＝ ？', sp: '900 減 365 再減 235 等於多少？', vis: '<div class="eq">900 − 365 − 235 ＝ ？</div>', opts: mkOpts(300, [400, 310, 200]),
      ex: '從左邊開始算：900 − 365 ＝ 535，535 − 235 ＝ <b>300</b>。',
      trap: '連減要一步一步算，第一步 900−365 要連續退位，個位 10−5＝5、十位 9−6＝3、百位 8−3＝5。' },
    { q: '用整百來估：<b>312 + 489</b> 大約是多少？', sp: '用整百來估，312 加 489 大約是多少？', vis: '<div class="eq">312 + 489 ≈ ？</div>', opts: mkOpts(800, [700, 900, 801]),
      ex: '312 接近 300，489 接近 500，所以大約是 300 ＋ 500 ＝ <b>800</b>。（真正的答案是 801，很接近 800。）',
      trap: '489 比較接近 500，不是 400；而且題目問「大約」，801 是精算的答案，不是估算。' }
  ]);
}

/* ===== 3-A 捲尺量長度：用 1 公尺和 10 公分排出長度 ===== */
const mcm = (m, c) => ((m ? `${m} 公尺` : '') + (c ? ` ${c} 公分` : '')).trim() || '0 公分';
function u3A(st) {
  const goals = shuffle([[1, 40], [2, 30], [3, 0], [2, 80], [1, 90], [3, 50]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= goals.length) return api.finish();
    const [gm, gc] = goals[r], gv = gm * 100 + gc; let m = 0, c = 0;
    api.say(`鋼筋要剪成 <b class="big">${mcm(gm, gc)}</b>，用捲尺排出這個長度。`, `鋼筋要剪成 ${mcm(gm, gc)}，用捲尺排出這個長度。`);
    st.innerHTML = `${dots(r, goals.length)}<div class="tape"><div class="fill"></div><div class="goal" style="left:${gv / 4}%"></div></div>
      <div class="lbl center">一格黃黑色是 10 公分，整條最長 4 公尺</div>
      <div class="readout"><span class="rd">0 公分</span></div>
      <div class="row-btns"><button class="btn" data-a="m+">＋ 1 公尺</button><button class="btn hz" data-a="c+">＋ 10 公分</button><button class="btn ghost sm" data-a="m-">− 1 公尺</button><button class="btn ghost sm" data-a="c-">− 10 公分</button></div>
      <div class="center"><button class="btn green" data-a="ok">剪下去！✂️</button></div>`;
    const draw = () => {
      const v = m * 100 + c, f = $('.fill', st);
      f.style.width = (v / 4) + '%'; f.style.setProperty('--n', Math.max(1, v / 10));
      $('.rd', st).textContent = `${mcm(m, c)}（＝ ${v} 公分）`;
    };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === 'm+' && m * 100 + c <= 300) m++;
      if (a === 'c+' && m * 100 + c < 400) { c += 10; if (c === 100) { c = 0; m++; toast('100 公分就是 1 公尺！'); } }
      if (a === 'm-' && m > 0) m--;
      if (a === 'c-') { if (c > 0) c -= 10; else if (m > 0) { m--; c = 90; } }
      if (a === 'ok') {
        if (m * 100 + c === gv) { api.ok(`${mcm(gm, gc)} ＝ ${gv} 公分！`); speak(`${mcm(gm, gc)} 等於 ${gv} 公分`); r++; later(round, 1800); return; }
        api.bad(`現在是 ${mcm(m, c)}，${m * 100 + c > gv ? '太長了' : '還不夠長'}！`);
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 3-B 公尺和公分 ===== */
function u3B(st) {
  const toCm = () => { const m = rand(1, 6), c = pick([rand(1, 9), rand(11, 99)]); const v = m * 100 + c; return { q: `<b>${m} 公尺 ${c} 公分</b> ＝ 幾公分？`, sp: `${m} 公尺 ${c} 公分等於幾公分？`, ans: v, unit: '公分', hint: `1 公尺是 100 公分，${m} 公尺是 ${m * 100} 公分。`, after: `${m * 100} ＋ ${c} ＝ ${v} 公分` }; };
  const toM = () => { const v = rand(1, 7) * 100 + rand(1, 99), m = Math.floor(v / 100), c = v % 100; return { q: `<b>${v} 公分</b> ＝ 幾公尺幾公分？`, sp: `${v} 公分等於幾公尺幾公分？`, opts: mkOpts(mcm(m, c), [mcm(c, m), mcm(m * 10, c % 10 || 1), mcm(m + 1, c)].filter(x => x !== mcm(m, c))), hint: '100 公分換成 1 公尺。', after: `${v} 公分 ＝ ${mcm(m, c)}` }; };
  const est = () => pick([
    { q: '教室的門大約有多高？', opts: mkOpts('2 公尺', ['2 公分', '20 公尺']), hint: '比大人高一點點。' },
    { q: '一枝鉛筆大約有多長？', opts: mkOpts('15 公分', ['15 公尺', '1 公尺']), hint: '比手掌長一點點。' },
    { q: '學校的籃球場大約有多長？', opts: mkOpts('28 公尺', ['28 公分', '2 公尺']), hint: '要跑很多步才跑得完喔！' },
    { q: '小朋友張開雙手，大約有多長？', opts: mkOpts('1 公尺 20 公分', ['12 公分', '12 公尺']), hint: '和自己的身高差不多。' }
  ]);
  const cmp = () => { const m = rand(2, 5), c = rand(1, 9), v1 = m * 100 + c, v2 = m * 100 + c * 10; const pairs = [[`${m} 公尺 ${c} 公分`, v1], [`${v2} 公分`, v2]];
    return { q: `哪一個比較<b>長</b>？`, opts: mkOpts(pairs[1][0], [pairs[0][0]]), hint: '先把公尺換成公分再比。', after: `${m} 公尺 ${c} 公分 ＝ ${v1} 公分，比 ${v2} 公分短` }; };
  quiz(st, [toCm, toM, est, cmp, toCm, est].map(f => () => { const t = f(); t.vis = t.vis || '<div class="price">📏 1 公尺 ＝ 100 公分</div>'; return t; }));
}

/* ===== 3-C 長度加減、長度的關係 ===== */
function u3C(st) {
  const addQ = () => { const a = rand(1, 3), b = rand(20, 80), c = rand(1, 2), d = rand(30, 90), t = a * 100 + b + c * 100 + d; const m = Math.floor(t / 100), cc = t % 100;
    return { q: `一段水管長 <b>${mcm(a, b)}</b>，再接上 <b>${mcm(c, d)}</b>，接起來共長多少？`, opts: mkOpts(mcm(m, cc), [b + d >= 100 ? mcm(a + c, cc) : mcm(m, cc >= 90 ? cc - 10 : cc + 10), mcm(m - 1, cc), mcm(m + 1, cc)].filter(x => x !== mcm(m, cc))), hint: '公分加起來超過 100，要換成 1 公尺。', after: `${a * 100 + b} ＋ ${c * 100 + d} ＝ ${t} 公分 ＝ ${mcm(m, cc)}` }; };
  const subQ = () => { const a = rand(3, 5), b = rand(10, 40), c = rand(1, 2), d = rand(50, 90), t = a * 100 + b - c * 100 - d; const m = Math.floor(t / 100), cc = t % 100;
    return { q: `一條繩子長 <b>${mcm(a, b)}</b>，剪掉 <b>${mcm(c, d)}</b>，還剩多長？`, opts: mkOpts(mcm(m, cc), [mcm(m + 1, cc), mcm(a - c, d - b), mcm(m, (cc + 20) % 100)].filter(x => x !== mcm(m, cc))), hint: '公分不夠減，要拿 1 公尺換成 100 公分。', after: `${a * 100 + b} − ${c * 100 + d} ＝ ${t} 公分 ＝ ${mcm(m, cc)}` }; };
  const transQ = () => { const nm = shuffle(['紅色鋼筋', '藍色鋼筋', '黃色鋼筋']); // nm[0] > nm[1] > nm[2]
    const askLong = Math.random() < 0.5;
    return { q: `${nm[0]}比${nm[1]}長，${nm[1]}比${nm[2]}長。哪一條<b>最${askLong ? '長' : '短'}</b>？`, vis: '<div class="price">🤔 ＞ ＞</div>', opts: mkOpts(askLong ? nm[0] : nm[2], [nm[1], askLong ? nm[2] : nm[0]]), hint: '把三條排一排：最長的在前面。', after: `${nm[0]} ＞ ${nm[1]} ＞ ${nm[2]}` }; };
  quiz(st, [addQ, subQ, transQ, addQ, subQ].map(f => () => { const t = f(); t.vis = t.vis || '<div class="price">📏🔧</div>'; return t; }));
}

/* ===== 3-D 進階挑戰 ===== */
function u3D(st) {
  adv(st, [
    { q: '<b>4 公尺 8 公分</b> ＝ 幾公分？', sp: '4 公尺 8 公分等於幾公分？', vis: '<div class="price">📏 4 公尺 8 公分</div>', opts: mkOpts(408, [48, 480, 4008]),
      ex: '4 公尺 ＝ 400 公分，再加 8 公分：400 ＋ 8 ＝ <b>408</b> 公分。', trap: '8 公分只有 8，十位要補 0，不是 48 也不是 480。' },
    { q: '比一比：<b>3 公尺 6 公分</b> ○ <b>360 公分</b>，○ 裡要填什麼？', sp: '3 公尺 6 公分和 360 公分比一比，圓圈裡要填什麼？', vis: '<div class="eq">3 公尺 6 公分 ○ 360 公分</div>',
      opts: mkOpts('＜', ['＞', '＝']), keep: true,
      ex: '3 公尺 6 公分 ＝ 306 公分。306 比 360 小，所以填 <b>＜</b>。', trap: '數字都是 3 和 6，看起來好像一樣，換成公分才知道 306 ≠ 360。' },
    { q: '<b>2 公尺 35 公分 ＋ 1 公尺 80 公分</b> ＝ ？', sp: '2 公尺 35 公分加 1 公尺 80 公分等於多少？', vis: '<div class="eq">2 公尺 35 公分 ＋ 1 公尺 80 公分</div>',
      opts: mkOpts('4 公尺 15 公分', ['3 公尺 15 公分', '4 公尺 25 公分', '3 公尺 55 公分']),
      ex: '公分：35 ＋ 80 ＝ 115 公分 ＝ 1 公尺 15 公分。<br>公尺：2 ＋ 1 ＋ 1 ＝ 4 公尺。答案是 <b>4 公尺 15 公分</b>。', trap: '115 公分超過 100，要進位成 1 公尺，公尺要多加 1。' },
    { q: '一條 <b>5 公尺</b>長的繩子，剪掉 <b>1 公尺 40 公分</b>，還剩多長？', sp: '一條 5 公尺長的繩子，剪掉 1 公尺 40 公分，還剩多長？',
      vis: `<svg viewBox="0 0 520 70"><rect x="10" y="20" width="500" height="22" rx="6" fill="#ffc400" stroke="#2e3438" stroke-width="3"/><rect x="370" y="20" width="140" height="22" rx="6" fill="#ddd" stroke="#2e3438" stroke-width="3" stroke-dasharray="6 4"/><text x="440" y="66" text-anchor="middle" font-size="18" font-weight="900">剪掉 1 公尺 40 公分</text><text x="190" y="66" text-anchor="middle" font-size="18" font-weight="900">剩下 ？</text><text x="260" y="15" text-anchor="middle" font-size="16">全長 5 公尺</text></svg>`,
      opts: mkOpts('3 公尺 60 公分', ['4 公尺 40 公分', '4 公尺 60 公分', '3 公尺 40 公分']),
      ex: '5 公尺 ＝ 500 公分，1 公尺 40 公分 ＝ 140 公分。500 − 140 ＝ 360 公分 ＝ <b>3 公尺 60 公分</b>。', trap: '0 公分不夠減 40 公分，要把 1 公尺換成 100 公分，所以公尺剩 4−1＝3，不是 4。' },
    { q: '甲比乙長，丙比甲長。三條繩子中，<b>最短</b>的是哪一條？', sp: '甲比乙長，丙比甲長。三條繩子中，最短的是哪一條？', vis: '<div class="price">甲 ＞ 乙　　丙 ＞ 甲</div>',
      opts: mkOpts('乙', ['甲', '丙']), keep: true,
      ex: `丙 ＞ 甲，甲 ＞ 乙，所以 丙 ＞ 甲 ＞ 乙，最短的是 <b>乙</b>。<div class="svgx"><svg viewBox="0 0 400 110"><text x="0" y="24" font-size="20" font-weight="900">丙</text><rect x="40" y="8" width="340" height="20" fill="#c8553d"/><text x="0" y="60" font-size="20" font-weight="900">甲</text><rect x="40" y="44" width="250" height="20" fill="#ff7a1a"/><text x="0" y="96" font-size="20" font-weight="900">乙</text><rect x="40" y="80" width="150" height="20" fill="#3f7cac"/></svg></div>`,
      trap: '題目先講「甲比乙長」，很多人以為甲最長；其實丙比甲更長，要把三條排好再判斷。' }
  ]);
}

LEVELS.u1 = [u1A, u1B, u1C, u1D];
LEVELS.u2 = [u2A, u2B, u2C, u2D];
LEVELS.u3 = [u3A, u3B, u3C, u3D];
