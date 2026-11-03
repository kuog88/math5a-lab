'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林五上有，南一五上沒有的內容（每單元 4 關，和本遊戲其他單元一樣是 動手做／想一想／挑戰／🎯 進階挑戰）
   x2   公倍數與公因數的應用（康軒第 3 單元「倍數與公倍數」、翰林第 4 單元「公倍數與公因數」：2、5、10 的倍數、最小公倍數、最大公因數的應用）
   xdec 多位小數（康軒第 1 單元「多位小數與加減」；南一、翰林在五下）：位值、比大小、取概數、加減
   xsec 扇形（康軒第 5 單元「多邊形與扇形」、翰林第 10 單元「扇形」；南一在五下第 4 單元，A～C 從 grade5-2 改寫）
   xsol 柱體、錐體和球（康軒第 10 單元、翰林第 5 單元「立體形體」；南一在五下第 10 單元，A～C 從 grade5-2 改寫）
   xfm  分數與整數相除（翰林第 9 單元「乘以幾分之一」：分數表示整數相除、整數乘以幾分之一；南一在五下第 1 單元，A 從 grade5-2 改寫） */

const xsm5 = s => `<span class="small-opt">${s}</span>`;
const fs5 = (n, d) => { [n, d] = red(n, d); return d === 1 ? String(n) : `${n}/${d}`; }; // 最簡分數字串（給小鍵盤當答案）

/* ---------- 補 x2 公倍數與公因數的應用 ---------- */
/* 數字表：點出所有符合條件的數 */
function x2A(st) {
  const tasks = shuffle([
    { q: '點出 1～40 裡所有 <b>5 的倍數</b>', f: n => n % 5 === 0, max: 40, hint: '個位是 0 或 5 的數，就是 5 的倍數。' },
    { q: '點出 1～40 裡所有 <b>10 的倍數</b>', f: n => n % 10 === 0, max: 40, hint: '個位是 0 的數，就是 10 的倍數。' },
    { q: '點出 1～40 裡所有 <b>4 和 6 的公倍數</b>', f: n => n % 12 === 0, max: 40, hint: '同時是 4 的倍數，也是 6 的倍數。最小的是 12。' },
    { q: '點出 1～36 裡所有 <b>24 和 36 的公因數</b>', f: n => 24 % n === 0 && 36 % n === 0, max: 36, hint: '能同時整除 24 和 36 的數，別忘了 1。' },
    { q: '點出 1～30 裡所有 <b>2 的倍數中，個位是 4 的數</b>', f: n => n % 10 === 4, max: 30, hint: '2 的倍數個位是 0、2、4、6、8，再挑個位是 4 的。' },
    { q: '點出 1～40 裡所有 <b>6 和 9 的公倍數</b>', f: n => n % 18 === 0, max: 40, hint: '6 和 9 的最小公倍數是 18。' }
  ]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r], want = Array.from({ length: T.max }, (_, i) => i + 1).filter(T.f), on = new Set();
    curQ = { q: T.q.replace(/<[^>]+>/g, ''), c: want.join('、') };
    api.say(T.q + '，點好按「好了」。', T.q.replace(/<[^>]+>/g, ''));
    st.innerHTML = `${dots(r, tasks.length)}<div class="xnum">${Array.from({ length: T.max }, (_, i) => `<button type="button" data-n="${i + 1}">${i + 1}</button>`).join('')}</div>
      <div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    $$('.xnum button', st).forEach(b => b.onclick = () => { const n = +b.dataset.n; sfx('tap'); if (on.has(n)) on.delete(n); else on.add(n); b.classList.toggle('on'); });
    $('#okb', st).onclick = () => {
      const miss = want.filter(n => !on.has(n)), extra = [...on].filter(n => !T.f(n));
      if (miss.length || extra.length) return api.bad(extra.length ? `${extra[0]} 不符合喔！${T.hint}` : `還有漏掉的！${T.hint}`, [...on].sort((a, b) => a - b).join('、'), want.join('、'));
      $('#okb', st).disabled = true; api.ok('全部找到了！'); speak('全部找到了'); r++; later(round, 1600);
    };
  }
  round();
}
function x2B(st) {
  quiz(st, [
    () => { const n = pick([rand(11, 99) * 10, rand(11, 99) * 10 + 5, rand(101, 999) * 2 + 1]); const ok = n % 10 === 0 ? '2、5、10 都是' : n % 5 === 0 ? '只是 5 的倍數' : '都不是'; return { q: `${n} 是 2、5、10 的倍數嗎？`, opts: ['2、5、10 都是', '只是 5 的倍數', '都不是'].map(t => ({ h: xsm5(t), ok: t === ok, t })), keep: true, hint: '看個位：0 → 2、5、10 的倍數；5 → 5 的倍數；單數 → 不是 2 的倍數。' }; },
    () => { const [a, b] = pick([[4, 6], [6, 8], [6, 9], [8, 12], [10, 15], [9, 12]]); return { q: `${a} 和 ${b} 的<b>最小公倍數</b>是多少？`, sp: `${a}和${b}的最小公倍數是多少？`, ans: lcm(a, b), hint: `把 ${b} 的倍數一個一個列出來，找第一個也是 ${a} 的倍數。`, after: `${a} 和 ${b} 的最小公倍數是 ${lcm(a, b)}` }; },
    () => { const [a, b] = pick([[24, 36], [18, 30], [16, 40], [28, 42], [45, 60]]); return { q: `${a} 和 ${b} 的<b>最大公因數</b>是多少？`, sp: `${a}和${b}的最大公因數是多少？`, ans: gcd(a, b), hint: `列出 ${a} 的因數，再找也能整除 ${b} 的最大一個。`, after: `${a} 和 ${b} 的最大公因數是 ${gcd(a, b)}` }; },
    { q: '兩個數的公倍數，有沒有<b>最大</b>的？', sp: '兩個數的公倍數有沒有最大的？', opts: [{ h: xsm5('沒有，公倍數有無限多個'), ok: true, t: '沒有' }, { h: xsm5('有，就是兩數相乘'), ok: false, t: '有' }], keep: true, hint: '公倍數可以一直變大下去。' },
    () => { const [a, b] = pick([[3, 5], [4, 9], [5, 7], [8, 9]]); return { q: `${a} 和 ${b} 的最大公因數是多少？`, ans: 1, hint: `${a} 和 ${b} 除了 1 以外，沒有別的公因數。`, after: `${a} 和 ${b} 的最大公因數是 1，最小公倍數是 ${a * b}` }; }
  ]);
}
function x2C(st) {
  quiz(st, [
    () => { const [a, b] = pick([[6, 8], [10, 15], [12, 18], [8, 12]]); return { q: `甲公車每 ${a} 分鐘一班、乙公車每 ${b} 分鐘一班，早上 7 點同時發車，<b>下一次</b>同時發車是幾分鐘後？`, sp: `甲公車每${a}分鐘一班，乙公車每${b}分鐘一班，下一次同時發車是幾分鐘後？`, vis: '<span style="font-size:52px">🚌🚌</span>', ans: lcm(a, b), unit: '分鐘', hint: '同時發車的時間是兩個數的公倍數，下一次是最小公倍數。', after: `${a} 和 ${b} 的最小公倍數是 ${lcm(a, b)}` }; },
    () => { const [a, b] = pick([[24, 36], [30, 45], [32, 48], [42, 56]]); return { q: `一張長 ${b} 公分、寬 ${a} 公分的紙，剪成大小一樣的正方形，剛好剪完沒有剩，正方形的邊長<b>最長</b>是幾公分？`, sp: `長${b}公分、寬${a}公分的紙剪成一樣大的正方形，正方形邊長最長是幾公分？`, vis: '<span style="font-size:52px">✂️</span>', ans: gcd(a, b), unit: '公分', hint: '邊長要能同時整除長和寬，要最長就找最大公因數。', after: `${a} 和 ${b} 的最大公因數是 ${gcd(a, b)}` }; },
    () => { const [a, b] = pick([[18, 24], [20, 30], [36, 48], [27, 45]]); return { q: `有 ${a} 枝鉛筆和 ${b} 塊橡皮擦，平分給一些小朋友，都剛好分完，<b>最多</b>可以分給幾人？`, sp: `${a}枝鉛筆和${b}塊橡皮擦平分給小朋友都剛好分完，最多可以分給幾人？`, vis: '<span style="font-size:52px">✏️🧽</span>', ans: gcd(a, b), unit: '人', hint: '人數要同時整除兩個數量，要最多就找最大公因數。', after: `${a} 和 ${b} 的最大公因數是 ${gcd(a, b)}` }; },
    () => { const [a, b] = pick([[4, 6], [6, 9], [8, 12], [6, 10]]); return { q: `用長 ${b} 公分、寬 ${a} 公分的長方形磁磚，同一方向排成一個正方形，這個正方形的邊長<b>最短</b>是幾公分？`, sp: `用長${b}公分、寬${a}公分的磁磚排成正方形，邊長最短是幾公分？`, vis: '<span style="font-size:52px">🧱</span>', ans: lcm(a, b), unit: '公分', hint: '邊長要是長和寬的公倍數，要最短就找最小公倍數。', after: `${a} 和 ${b} 的最小公倍數是 ${lcm(a, b)}` }; },
    () => { const n = pick([3, 4, 6]), m = pick([5, 8, 9].filter(x => gcd(x, n) === 1)); return { q: `一盒蛋糕，${n} 個一數或 ${m} 個一數都剛好數完，這盒蛋糕<b>最少</b>有幾個？`, sp: `${n}個一數或${m}個一數都剛好數完，最少有幾個？`, vis: '<span style="font-size:52px">🧁</span>', ans: lcm(n, m), unit: '個', hint: '個數是兩個數的公倍數，最少就是最小公倍數。', after: `${n} 和 ${m} 的最小公倍數是 ${lcm(n, m)}` }; }
  ]);
}
const XX2 = [
  { q: '一個三位數 47□ 是 2 的倍數，也是 5 的倍數，□ 裡是多少？', ans: 0, hint: '同時是 2 和 5 的倍數，個位要是幾？', ex: '2 的倍數個位是 0、2、4、6、8；5 的倍數個位是 0、5。兩個都要，個位只能是 <b>0</b>。', trap: '填 5 只是 5 的倍數，不是 2 的倍數。' },
  { q: '小明每 4 天去一次圖書館，小華每 6 天去一次。今天兩人在圖書館遇到，<b>至少</b>再過幾天會再遇到？', sp: '小明每4天去一次圖書館，小華每6天去一次，至少再過幾天會再遇到？', ans: 12, unit: '天', hint: '找 4 和 6 的最小公倍數。', ex: '4 的倍數：4、8、<b>12</b>；6 的倍數：6、<b>12</b>。最小公倍數是 12，再過 <b>12</b> 天。', trap: '不是 4 × 6 = 24 天，24 是公倍數但不是最小的。' },
  { q: '有 48 顆糖和 60 顆巧克力，平分裝袋，每袋一樣多、都裝完，<b>最多</b>可以裝幾袋？', sp: '48顆糖和60顆巧克力平分裝袋都裝完，最多可以裝幾袋？', ans: 12, unit: '袋', hint: '袋數要同時整除 48 和 60。', ex: '48 和 60 的最大公因數是 12，最多 <b>12</b> 袋，每袋 4 顆糖、5 顆巧克力。', trap: '問「最多幾袋」用最大公因數；不是最小公倍數 240。' },
  { q: '下面哪一個數<b>同時</b>是 2、5、10 的倍數？', opts: [{ h: N(350), ok: true }, { h: N(255), ok: false }, { h: N(502), ok: false }, { h: N(125), ok: false }], hint: '個位要是 0。', ex: '個位是 0 的數同時是 2、5、10 的倍數，所以是 <b>350</b>。', trap: '255、125 個位是 5，只是 5 的倍數；502 只是 2 的倍數。' },
  { q: '一個數除以 6 和除以 8 都<b>剛好整除</b>，這個數在 50 以內最大是多少？', sp: '一個數除以6和除以8都剛好整除，在50以內最大是多少？', ans: 48, hint: '先找 6 和 8 的最小公倍數，再看它的倍數。', ex: '6 和 8 的最小公倍數是 24，公倍數有 24、48、72……，50 以內最大是 <b>48</b>。', trap: '24 是最小的，題目問的是 50 以內最大的。' }
];

/* ---------- 補 xdec 多位小數 ---------- */
const xrd = x => +x.toFixed(4);
function xdecA(st) {
  const names = ['個位', '十分位', '百分位', '千分位'], w = [1000, 100, 10, 1];
  const mk = () => { const a = rand(1, 8), b = rand(1, 9), c = rand(10, 19), d = rand(1, 9); return { T: a * 1000 + b * 100 + c * 10 + d, desc: `<b>${a}</b> 個 1、<b>${b}</b> 個 0.1、<b>${c}</b> 個 0.01 和 <b>${d}</b> 個 0.001` }; };
  const tasks = [mk(), mk(), mk()];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { T, desc } = tasks[r], v = [0, 0, 0, 0], read = t => String(xrd(t / 1000));
    curQ = { q: `在位值表排出：${desc.replace(/<[^>]+>/g, '')}`, c: read(T) };
    api.say(`在位值表排出：${desc}。滿十要進位喔！`);
    st.innerHTML = `${dots(r, tasks.length)}<table class="xpv"><tr>${names.map((n, i) => (i === 1 ? '<th class="dot"></th>' : '') + `<th>${n}</th>`).join('')}</tr>
      <tr>${names.map((n, i) => (i === 1 ? '<td class="dot">.</td>' : '') + `<td><button type="button" data-i="${i}" data-d="1">▲</button><span class="v" id="v${i}">0</span><button type="button" data-i="${i}" data-d="-1">▼</button></td>`).join('')}</tr></table>
      <div class="readout">目前：<span id="now"></span></div><div class="center"><button class="btn mint" id="okb" type="button">排好了！</button></div>`;
    const draw = () => { v.forEach((x, i) => $('#v' + i, st).textContent = x); $('#now', st).textContent = read(v.reduce((s, x, i) => s + x * w[i], 0)); };
    $$('.xpv button', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; v[i] = (v[i] + +b.dataset.d + 10) % 10; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const s = v.reduce((a, x, i) => a + x * w[i], 0);
      if (s === T) { $('#okb', st).disabled = true; api.ok('排對了！'); speak('這個數是' + read(T)); r++; later(round, 1900); }
      else api.bad('10 個 0.01 是 1 個 0.1，記得進位！', read(s), read(T));
    };
    draw();
  }
  round();
}
function xdecB(st) {
  quiz(st, [
    () => { const n = rand(1001, 9999); return { q: `${xrd(n / 1000)} 是幾個 0.001？`, ans: n, unit: '個', hint: '1 是 1000 個 0.001。', after: `${xrd(n / 1000)} 是 ${n} 個 0.001` }; },
    () => { const p = rand(1, 3), ds = [rand(0, 9), rand(0, 9), rand(1, 9)], num = rand(1, 9) + '.' + ds.join(''), name = ['十分位', '百分位', '千分位'][p - 1]; return { q: `${num} 的<b>${name}</b>是哪個數字？`, sp: `${num}的${name}是哪個數字？`, ans: ds[p - 1], hint: '小數點後第一位是十分位，第二位是百分位，第三位是千分位。', after: `${name}是 ${ds[p - 1]}` }; },
    () => { const a = rand(10, 99), b = rand(101, 999); const A = a * 10, sa = String(xrd(a / 100)), sb = String(xrd(b / 1000)); return { q: `${sa} 和 ${sb}，哪一個比較大？`, opts: [{ h: N(sa), ok: A > b, t: sa }, { h: N(sb), ok: b > A, t: sb }, { h: xsm5('一樣大'), ok: A === b, t: '一樣大' }], keep: true, hint: '從十分位開始，一位一位比。' }; },
    { q: '0.7 和 0.700 哪一個比較大？', opts: [{ h: xsm5('一樣大'), ok: true, t: '一樣大' }, { h: N('0.700'), ok: false, t: '0.700' }, { h: N('0.7'), ok: false, t: '0.7' }], hint: '小數末尾的 0 可以去掉，大小不變。' },
    () => { let n; do n = rand(1001, 9999); while (n % 10 === 0); const v = n / 1000, ans = Math.round(n / 10) / 100; return { q: `${xrd(v)} 用四捨五入法取到<b>百分位</b>是多少？`, sp: `${xrd(v)}用四捨五入法取到百分位是多少？`, ans, keys: ['.'], hint: '看千分位：4 以下捨去，5 以上進位。', after: `${xrd(v)} ≈ ${ans}` }; }
  ]);
}
function xdecC(st) {
  const d3 = () => xrd(rand(1001, 9999) / 1000), d2 = () => xrd(rand(101, 999) / 100);
  quiz(st, [
    () => { const a = d3(), b = d2(); return { q: `${a} ＋ ${b} ＝ ?`, ans: xrd(a + b), keys: ['.'], hint: '小數點對齊，位數不夠的補 0 再加。', after: `${a} ＋ ${b} ＝ ${xrd(a + b)}` }; },
    () => { let a = d3(), b = d3(); if (a < b) [a, b] = [b, a]; return { q: `${a} − ${b} ＝ ?`, ans: xrd(a - b), keys: ['.'], hint: '小數點對齊，從千分位開始減，不夠減要借位。', after: `${a} − ${b} ＝ ${xrd(a - b)}` }; },
    () => { const a = d3(), b = d2(); return { q: `一包麵粉重 ${a} 公斤，一包糖重 ${b} 公斤，兩包共重幾公斤？`, vis: '<span style="font-size:52px">🛍️</span>', eq: `${a} + ${b}`, ans: xrd(a + b), unit: '公斤', hint: '合起來用加法。', after: `${a} ＋ ${b} ＝ ${xrd(a + b)} 公斤` }; },
    () => { const a = xrd(rand(2001, 4999) / 1000), b = xrd(rand(101, 1999) / 1000); return { q: `一瓶水有 ${a} 公升，喝掉 ${b} 公升，還剩幾公升？`, vis: '<span style="font-size:52px">🧴</span>', eq: `${a} − ${b}`, ans: xrd(a - b), unit: '公升', hint: '剩下多少用減法。', after: `${a} − ${b} ＝ ${xrd(a - b)} 公升` }; },
    () => { const a = xrd(rand(1001, 1999) / 1000), b = xrd(rand(1001, 1999) / 1000); const hi = Math.max(a, b), lo = Math.min(a, b); return { q: `哥哥跳遠 ${hi} 公尺，弟弟跳 ${lo} 公尺，哥哥比弟弟多跳幾公尺？`, vis: '<span style="font-size:52px">🏃</span>', eq: `${hi} − ${lo}`, ans: xrd(hi - lo), unit: '公尺', hint: '比多少用減法。', after: `${hi} − ${lo} ＝ ${xrd(hi - lo)} 公尺` }; }
  ]);
}
const XDEC = [
  { q: '0.36 是 36 個多少？', opts: [{ h: N('0.01'), ok: true }, { h: N('0.1'), ok: false }, { h: N('0.001'), ok: false }], hint: '百分位的單位是 0.01。', ex: '0.36 的最後一位在百分位，0.36 是 36 個 <b>0.01</b>。', trap: '不是 36 個 0.1，36 個 0.1 是 3.6。' },
  { q: '5.07 和 5.1 哪一個比較大？', opts: [{ h: N('5.1'), ok: true }, { h: N('5.07'), ok: false }, { h: xsm5('一樣大'), ok: false }], hint: '先比十分位。', ex: '個位都是 5，比十分位：5.07 的十分位是 0，5.1 的十分位是 1，所以 <b>5.1</b> 比較大。', trap: '不能看小數點後面的「07」和「1」誰大，要一位一位比。' },
  { q: '2.3 ＋ 1.456 ＝ ?', ans: 3.756, keys: ['.'], hint: '2.3 想成 2.300。', ex: '小數點對齊：2.300 ＋ 1.456 ＝ <b>3.756</b>。', trap: '要對齊小數點，不是把最後一位對齊（2.3 不是 0.023）。' },
  { q: '6 − 2.375 ＝ ?', ans: 3.625, keys: ['.'], hint: '6 想成 6.000。', ex: '6.000 − 2.375 ＝ <b>3.625</b>，從千分位開始借位。', trap: '整數 6 要補成 6.000 再減，不能直接寫 4.375。' },
  { q: '一個小數取到百分位是 4.30，下面哪一個<b>可能</b>是原來的數？', sp: '一個小數取到百分位是4.30，下面哪一個可能是原來的數？', opts: [{ h: N('4.296'), ok: true }, { h: N('4.306'), ok: false }, { h: N('4.29'), ok: false }, { h: N('4.3'), ok: false }], hint: '取到百分位要看千分位四捨五入。', ex: '4.296 的千分位是 6，進位後是 <b>4.30</b>。4.306 會變 4.31；4.29、4.3 本來就只到百分位或十分位。', trap: '4.30 末尾的 0 表示取到百分位，不能直接把 4.3 當答案。' }
];

/* ---------- 扇形、立體圖形（從 grade5-2 draw.js 搬來，改名免得和本遊戲衝突） ---------- */
function xSecPath(cx, cy, r, deg) {
  if (deg >= 360) return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
  const a = deg * Math.PI / 180, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  return `M${cx},${cy}L${cx + r},${cy}A${r},${r} 0 ${deg > 180 ? 1 : 0},0 ${x.toFixed(2)},${y.toFixed(2)}Z`;
}
function xSector(deg, opt = {}) {
  const S = opt.size || 220, c = S / 2, r = c - 14, col = opt.color || '#ff9a4d';
  const arcMark = deg > 0 && deg < 360 ? `<path d="M${c + 26},${c}A26,26 0 ${deg > 180 ? 1 : 0},0 ${(c + 26 * Math.cos(deg * Math.PI / 180)).toFixed(2)},${(c - 26 * Math.sin(deg * Math.PI / 180)).toFixed(2)}" fill="none" stroke="#e5508f" stroke-width="3"/>` : '';
  return `<svg class="xsvg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
    ${opt.full ? `<circle cx="${c}" cy="${c}" r="${r}" fill="#fff" stroke="#b9aecb" stroke-width="2" stroke-dasharray="5 5"/>` : ''}
    <path d="${xSecPath(c, c, r, deg)}" fill="${col}" fill-opacity=".85" stroke="#4a3b5c" stroke-width="3" stroke-linejoin="round"/>
    ${arcMark}<circle cx="${c}" cy="${c}" r="5" fill="#4a3b5c"/>
    ${opt.label ? `<text x="${c + 34}" y="${c - 10}" font-size="18" font-weight="900" fill="#e5508f">${opt.label}</text>` : ''}</svg>`;
}
function xSolid(kind, n = 4, size = 100) {
  const cx = 50, by = 78, R = 34, k = 0.34, h = 50, s = 'stroke="#4a3b5c" stroke-width="2.4" stroke-linejoin="round"';
  const base = Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI + Math.PI / 2 + (n % 2 ? 0 : Math.PI / n) + (n === 4 ? 0.45 : 0); return [cx + R * Math.cos(a), by + R * k * Math.sin(a)]; });
  const pts = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const frontEdges = () => base.map((p, i) => { const q = base[(i + 1) % n]; return (p[1] + q[1]) / 2 > by - 0.5 ? `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${s}/>` : ''; }).join('');
  let g = '';
  if (kind === 'prism') {
    const top = base.map(([x, y]) => [x, y - h]);
    g += `<polygon points="${pts(base)}" fill="#9fd4ff" ${s} stroke-dasharray="4 3"/>`;
    base.forEach(([x, y], i) => { g += `<line x1="${x}" y1="${y}" x2="${top[i][0]}" y2="${top[i][1]}" ${s}/>`; });
    g += frontEdges() + `<polygon points="${pts(top)}" fill="#d6ecff" ${s}/>`;
  } else if (kind === 'pyramid') {
    const ap = [cx, by - h - 8];
    g += `<polygon points="${pts(base)}" fill="#9fd4ff" ${s} stroke-dasharray="4 3"/>`;
    base.forEach(([x, y]) => { g += `<line x1="${x}" y1="${y}" x2="${ap[0]}" y2="${ap[1]}" ${s}/>`; });
    g += frontEdges();
  } else if (kind === 'cylinder') {
    g += `<path d="M${cx - R},${by - h}V${by}A${R},${R * k} 0 0,0 ${cx + R},${by}V${by - h}" fill="#9fd4ff" ${s}/><ellipse cx="${cx}" cy="${by - h}" rx="${R}" ry="${R * k}" fill="#d6ecff" ${s}/>`;
  } else if (kind === 'cone') {
    g += `<path d="M${cx - R},${by}L${cx},${by - h - 8}L${cx + R},${by}A${R},${R * k} 0 0,1 ${cx - R},${by}Z" fill="#9fd4ff" ${s}/><path d="M${cx - R},${by}A${R},${R * k} 0 0,1 ${cx + R},${by}" fill="none" ${s} stroke-dasharray="4 3"/>`;
  } else {
    g += `<circle cx="${cx}" cy="${by - 26}" r="${R + 4}" fill="#9fd4ff" ${s}/><ellipse cx="${cx}" cy="${by - 26}" rx="${R + 4}" ry="${(R + 4) * k}" fill="none" ${s} stroke-dasharray="4 3"/>`;
  }
  return `<svg class="xsvg" viewBox="0 0 100 100" width="${size}" height="${size}">${g}</svg>`;
}

/* ---------- 補 xsec 扇形 ---------- */
function xsecA(st) {
  const tasks = shuffle([['1/4 圓', 90], ['1/3 圓', 120], ['1/6 圓', 60], ['1/2 圓', 180], ['3/4 圓', 270], ['圓心角 150° 的扇形', 150], ['1/8 圓', 45], ['5/6 圓', 300]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [name, T] = tasks[r]; let deg = 30;
    curQ = { q: `轉出${name}`, c: `${T}°` };
    api.say(`轉出 <b>${name}</b>！拖曳扇形的邊（或按按鈕），轉出正確的圓心角。`, `轉出${name}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="dial"></div>
      <div class="xctl"><button type="button" data-d="-15">−15°</button><button type="button" data-d="-5">−5°</button><span class="v" id="dv"></span><button type="button" data-d="5">＋5°</button><button type="button" data-d="15">＋15°</button></div>
      <div class="center"><button class="btn mint" id="okb" type="button">轉好了！</button></div>`;
    const draw = () => { $('#dial', st).innerHTML = xSector(deg, { size: 240, full: true, label: deg + '°' }); $('#dv', st).textContent = '圓心角 ' + deg + '°'; };
    $$('.xctl button', st).forEach(b => b.onclick = () => { deg = Math.max(5, Math.min(355, deg + +b.dataset.d)); sfx('tap'); draw(); });
    const dial = $('#dial', st);
    dial.style.touchAction = 'none';
    const fromEvt = e => { const s = $('svg', dial); if (!s) return; const R = s.getBoundingClientRect(); if (!R.width) return; const x = e.clientX - (R.left + R.width / 2), y = (R.top + R.height / 2) - e.clientY; let a = Math.atan2(y, x) * 180 / Math.PI; if (a < 0) a += 360; a = Math.round(a / 5) * 5; deg = Math.max(5, Math.min(355, a === 0 ? (deg > 180 ? 355 : 5) : a)); draw(); };
    let drag = false;
    dial.addEventListener('pointerdown', e => { drag = true; try { dial.setPointerCapture(e.pointerId); } catch (er) {} fromEvt(e); });
    dial.addEventListener('pointermove', e => { if (drag) fromEvt(e); });
    dial.addEventListener('pointerup', () => { drag = false; });
    dial.addEventListener('pointercancel', () => { drag = false; });
    $('#okb', st).onclick = () => {
      if (deg === T) { $('#okb', st).disabled = true; api.ok(`對！${name}的圓心角是 ${T}°`); speak(`${name}的圓心角是${T}度`); r++; later(round, 1900); }
      else api.bad(name.includes('/') ? `一整圈是 360°，${name}的圓心角是 360° 的 ${name.replace(' 圓', '')}。` : `要轉到 ${T}°，現在是 ${deg}°。`, `${deg}°`, `${T}°`);
    };
    draw();
  }
  round();
}
function xsecB(st) {
  const fig = d => `<svg viewBox="0 0 110 110" width="96" height="96"><circle cx="55" cy="55" r="44" fill="none" stroke="#b9aecb" stroke-width="2" stroke-dasharray="4 4"/><path d="${d}" fill="#ff9a4d" fill-opacity=".85" stroke="#4a3b5c" stroke-width="3" stroke-linejoin="round"/><circle cx="55" cy="55" r="3" fill="#4a3b5c"/></svg>`;
  const P = a => { const t = a * Math.PI / 180; return `${(55 + 44 * Math.cos(t)).toFixed(1)},${(55 - 44 * Math.sin(t)).toFixed(1)}`; };
  const sector = fig(`M55,55L${P(20)}A44,44 0 0,0 ${P(130)}Z`), segment = fig(`M${P(20)}A44,44 0 0,0 ${P(160)}Z`), wrongV = fig(`M${P(270)}L${P(30)}A44,44 0 0,0 ${P(150)}Z`);
  quiz(st, [
    { q: '哪一個是<b>扇形</b>？（虛線是圓）', sp: '哪一個是扇形？', opts: [{ h: sector, t: '兩條半徑和一段圓弧圍成的圖（頂點在圓心）', ok: true }, { h: segment, t: '一條弦和一段圓弧圍成的圖', ok: false, hint: '這個沒有經過圓心，是一條弦和一段圓弧。' }, { h: wrongV, t: '頂點在圓周上的圖', ok: false, hint: '這個的頂點在圓周上，不是圓心。' }], hint: '扇形的頂點在圓心。' },
    { q: '扇形是由<b>兩條半徑</b>和一段什麼圍成的圖形？', sp: '扇形是由兩條半徑和一段什麼圍成的圖形？', opts: [{ h: '圓弧', ok: true }, { h: '直徑', ok: false }, { h: '線段', ok: false }], hint: '扇形外圍彎彎的那一段是圓弧。' },
    { q: '扇形中，兩條半徑所夾的角叫做什麼？', opts: [{ h: '圓心角', ok: true }, { h: '直角', ok: false }, { h: '平角', ok: false }], hint: '這個角的頂點在圓心。' },
    () => { const d = pick([6, 4, 3, 8, 2]); return { q: `${fr(1, d)} 圓的圓心角是幾度？`, vis: xSector(360 / d, { size: 150, full: true }), eq: `360 ÷ ${d}`, alt: [`360 × 1/${d}`], known: [360], chips: [360], ans: 360 / d, unit: '度', hint: `一整圈是 360°，360 ÷ ${d}。`, after: `360° ÷ ${d} ＝ ${360 / d}°` }; },
    () => { const a = pick([45, 60, 30, 90]); return { q: `一個圓可以剛好分成幾個圓心角 ${a}° 的扇形？`, eq: `360 ÷ ${a}`, known: [360], chips: [360], ans: 360 / a, unit: '個', hint: `一圈 360°，360 ÷ ${a}`, after: `360 ÷ ${a} ＝ ${360 / a} 個` }; },
    { q: '圓心角是 180° 的扇形，也就是什麼？', vis: xSector(180, { size: 150, full: true }), opts: [{ h: `${fr(1, 2)} 圓`, ok: true, t: '1/2 圓' }, { h: `${fr(1, 4)} 圓`, ok: false, t: '1/4 圓' }, { h: '一整個圓', ok: false }], hint: '180° 是 360° 的一半。' }
  ]);
}
function xsecC(st) {
  quiz(st, shuffle([
    () => { const a = pick([120, 72, 270, 240, 40]); const [n, d] = red(a, 360); return { q: `這個扇形的圓心角是 ${a}°，它是幾分之幾圓？（用最簡分數）`, vis: xSector(a, { size: 160, full: true, label: a + '°' }), ans: `${n}/${d}`, hint: `用 ${a}/360 再約分。`, after: `${a}/360 ＝ ${fr(n, d)}，是 ${fr(n, d)} 圓` }; },
    () => { const k = rand(2, 5); return { q: `${k} 個 ${fr(1, 6)} 圓拼在一起，是圓心角幾度的扇形？`, eq: `60 × ${k}`, alt: [`360 ÷ 6 × ${k}`, `360 × 1/6 × ${k}`, `360 × ${k}/6`], known: [360, 60], ans: 60 * k, unit: '度', hint: '1/6 圓是 60°。', after: `60° × ${k} ＝ ${60 * k}°` }; },
    { q: `${fr(1, 4)} 圓和 ${fr(1, 3)} 圓拼在一起，圓心角是幾度？`, eq: '90 + 120', alt: ['360 ÷ 4 + 360 ÷ 3', '360 × 1/4 + 360 × 1/3', '360 × 7/12'], known: [360, 90, 120], ans: 210, unit: '度', hint: '90° ＋ 120°', after: '90° ＋ 120° ＝ 210°' },
    { q: '時鐘的時針從 12 走到 4，掃過的扇形是幾分之幾圓？（用最簡分數）', ans: '1/3', hint: '12 走到 4 是 4 大格，一圈有 12 大格。', after: `4/12 ＝ ${fr(1, 3)} 圓（120°）` },
    { q: '兩個扇形半徑一樣長，圓心角一個是 90°、一個是 60°，哪一個比較大？', opts: [{ h: xsm5('90° 的扇形'), ok: true, t: '90° 的扇形' }, { h: xsm5('60° 的扇形'), ok: false, t: '60° 的扇形' }, { h: xsm5('一樣大'), ok: false, t: '一樣大' }], hint: '半徑相同時，圓心角越大，扇形越大。' },
    () => { const [n, d] = pick([[3, 4], [5, 6], [2, 3], [3, 8]]); return { q: `${fr(n, d)} 圓的圓心角是幾度？`, eq: `360 ÷ ${d} × ${n}`, alt: [`360 × ${n}/${d}`, `360 × ${n} ÷ ${d}`], known: [360], chips: [360], ans: 360 / d * n, unit: '度', hint: `360 ÷ ${d} × ${n}`, after: `360° ÷ ${d} × ${n} ＝ ${360 / d * n}°` }; }
  ]).slice(0, 5));
}
const XSEC = [
  { q: '一個扇形的圓心角是 90°，它是幾分之幾圓？', opts: [{ h: `${fr(1, 4)} 圓`, ok: true, t: '1/4 圓' }, { h: `${fr(1, 3)} 圓`, ok: false, t: '1/3 圓' }, { h: `${fr(1, 2)} 圓`, ok: false, t: '1/2 圓' }], hint: '90 ÷ 360 ＝ ?', ex: '90/360 ＝ <b>1/4</b>，是 1/4 圓。', trap: '不是 1/90 圓，要和一整圈 360° 比。' },
  { q: '把一個圓平分成 8 個一樣大的扇形，每個扇形的圓心角是幾度？', ans: 45, unit: '度', hint: '360 ÷ 8', ex: '360° ÷ 8 ＝ <b>45°</b>。', trap: '一整圈是 360°，不是 180°。' },
  { q: '<b>3/4</b> 圓的圓心角是幾度？', sp: '4分之3圓的圓心角是幾度？', ans: 270, unit: '度', hint: '先算 1/4 圓是幾度。', ex: '1/4 圓是 90°，3/4 圓是 90° × 3 ＝ <b>270°</b>。', trap: '不是 360 ÷ 3 ＝ 120，那是 1/3 圓。' },
  { q: '下面哪一句話<b>不對</b>？', sp: '下面哪一句話不對？', opts: [{ h: xsm5('扇形的頂點可以在圓周上'), ok: true, t: '扇形的頂點可以在圓周上' }, { h: xsm5('扇形有兩條半徑'), ok: false, t: '扇形有兩條半徑' }, { h: xsm5('半圓也是扇形'), ok: false, t: '半圓也是扇形' }], hint: '想一想扇形的頂點在哪裡。', ex: '扇形是兩條半徑和一段圓弧圍成的，頂點一定在<b>圓心</b>。半圓（圓心角 180°）也是扇形。', trap: '半圓也是扇形，很多人以為不是。' },
  { q: '時鐘從 3 點走到 3 點 20 分，分針轉過的圓心角是幾度？', sp: '時鐘從3點走到3點20分，分針轉過的圓心角是幾度？', ans: 120, unit: '度', hint: '分針走 60 分鐘轉一圈 360°。', ex: '20 分鐘是一圈的 20/60 ＝ 1/3，360° × 1/3 ＝ <b>120°</b>。', trap: '看的是分針，不是時針；分針 1 分鐘轉 6°。' }
];

/* ---------- 補 xsol 柱體、錐體和球 ---------- */
const XSOLS = [['prism', 3, '三角柱', 0], ['prism', 4, '四角柱', 0], ['prism', 5, '五角柱', 0], ['prism', 6, '六角柱', 0], ['cylinder', 0, '圓柱', 0],
  ['pyramid', 3, '三角錐', 1], ['pyramid', 4, '四角錐', 1], ['pyramid', 5, '五角錐', 1], ['cone', 0, '圓錐', 1], ['sphere', 0, '球', 2]];
function xsolA(st) {
  const set = shuffle([...shuffle(XSOLS.filter(a => a[3] === 0)).slice(0, 3), ...shuffle(XSOLS.filter(a => a[3] === 1)).slice(0, 3), XSOLS[9]]);
  const K = ['柱體', '錐體', '球體'];
  let left = set.length, sel = null;
  api.say('把立體圖形分類！先點一個圖形，再點它屬於的箱子：<b>柱體</b>、<b>錐體</b>、<b>球體</b>。', '把立體圖形分類，先點圖形，再點箱子');
  st.innerHTML = `<div class="xsolids">${set.map((s, i) => `<button type="button" class="xsolid" data-i="${i}">${xSolid(s[0], s[1], 80)}<div>${s[2]}</div></button>`).join('')}</div>
    <div class="xbins">${K.map((b, i) => `<button type="button" class="xbin" data-b="${i}"><h4>${b}</h4><div class="in"></div></button>`).join('')}</div>`;
  $$('.xsolid', st).forEach(el => el.onclick = () => { $$('.xsolid.sel', st).forEach(x => x.classList.remove('sel')); sel = el; el.classList.add('sel'); sfx('tap'); });
  $$('.xbin', st).forEach(bin => bin.onclick = () => {
    if (!sel) return toast('先點一個立體圖形！');
    const s = set[+sel.dataset.i];
    curQ = { q: `${s[2]}是柱體、錐體還是球體？`, c: K[s[3]] };
    if (+bin.dataset.b === s[3]) {
      $('.in', bin).insertAdjacentHTML('beforeend', `<span>${s[2]}</span>`); sel.remove(); api.ok(`${s[2]}是${K[s[3]]}`); sel = null;
      if (--left === 0) later(api.finish, 900);
    } else { sel.classList.remove('sel'); sel = null; api.bad(s[3] === 0 ? '上下兩個底面一樣大、互相平行的是柱體。' : s[3] === 1 ? '只有一個底面、往上收成一個頂點的是錐體。' : '圓圓的、怎麼切都是圓的是球。', K[+bin.dataset.b]); }
  });
}
const XNM = ['', '', '', '三', '四', '五', '六', '七', '八', '九', '十'];
function xsolB(st) {
  quiz(st, [
    () => { const n = rand(3, 6); return { q: `${XNM[n]}角柱有幾個<b>面</b>？`, sp: `${XNM[n]}角柱有幾個面？`, vis: xSolid('prism', n, 130), ans: n + 2, unit: '個', hint: `${n} 個側面加上 2 個底面。`, after: `${n} ＋ 2 ＝ ${n + 2} 個面` }; },
    () => { const n = rand(3, 6); return { q: `${XNM[n]}角柱有幾條<b>邊</b>？`, sp: `${XNM[n]}角柱有幾條邊？`, vis: xSolid('prism', n, 130), ans: 3 * n, unit: '條', hint: `上底 ${n} 條、下底 ${n} 條，再加上 ${n} 條側邊。`, after: `${n} × 3 ＝ ${3 * n} 條邊` }; },
    () => { const n = rand(3, 6); return { q: `${XNM[n]}角柱有幾個<b>頂點</b>？`, sp: `${XNM[n]}角柱有幾個頂點？`, vis: xSolid('prism', n, 130), ans: 2 * n, unit: '個', hint: `上下兩個底面各有 ${n} 個頂點。`, after: `${n} × 2 ＝ ${2 * n} 個頂點` }; },
    () => { const n = rand(3, 6); return { q: `${XNM[n]}角錐有幾個<b>面</b>？`, sp: `${XNM[n]}角錐有幾個面？`, vis: xSolid('pyramid', n, 130), ans: n + 1, unit: '個', hint: `${n} 個側面加上 1 個底面。`, after: `${n} ＋ 1 ＝ ${n + 1} 個面` }; },
    () => { const n = rand(3, 6); return { q: `${XNM[n]}角錐有幾條<b>邊</b>？`, sp: `${XNM[n]}角錐有幾條邊？`, vis: xSolid('pyramid', n, 130), ans: 2 * n, unit: '條', hint: `底面 ${n} 條邊，加上連到頂點的 ${n} 條。`, after: `${n} × 2 ＝ ${2 * n} 條邊` }; },
    { q: '角錐的側面都是什麼形狀？', vis: xSolid('pyramid', 4, 120), opts: [{ h: '三角形', ok: true }, { h: '長方形', ok: false }, { h: '圓形', ok: false }], hint: '每個側面都連到同一個頂點。' }
  ]);
}
function xsolC(st) {
  quiz(st, shuffle([
    () => { const n = rand(5, 8); return { q: `一個角柱有 ${3 * n} 條邊，它是幾角柱？`, opts: [n - 1, n, n + 1].map(k => ({ h: `${XNM[k]}角柱`, ok: k === n })), keep: true, hint: '角柱的邊數是底面邊數的 3 倍。', after: `${3 * n} ÷ 3 ＝ ${n}，是${XNM[n]}角柱` }; },
    () => { const n = rand(5, 9); return { q: `一個角錐有 ${n + 1} 個面，它是幾角錐？`, opts: [n - 1, n, n + 1].map(k => ({ h: `${XNM[k]}角錐`, ok: k === n })), keep: true, hint: '角錐的面數 ＝ 底面邊數 ＋ 1。', after: `${n + 1} − 1 ＝ ${n}，是${XNM[n]}角錐` }; },
    { q: '角柱的兩個底面互相怎麼樣？', vis: xSolid('prism', 5, 120), opts: [{ h: '平行', ok: true }, { h: '垂直', ok: false }, { h: '相交', ok: false }], hint: '上下兩個底面一樣大，而且永遠不會碰在一起。' },
    { q: '直角柱的側面和底面互相怎麼樣？', vis: xSolid('prism', 4, 120), opts: [{ h: '垂直', ok: true }, { h: '平行', ok: false }, { h: '重疊', ok: false }], hint: '側面是直立在底面上的。' },
    { q: '用刀子切球，切面都是什麼形狀？', vis: xSolid('sphere', 0, 120), opts: [{ h: '圓形', ok: true }, { h: '正方形', ok: false }, { h: '扇形', ok: false }], hint: '從哪個方向切都一樣喔。' },
    { q: '球心到球面上任意一點的距離，叫做球的什麼？', opts: [{ h: '半徑', ok: true }, { h: '直徑', ok: false }, { h: '高', ok: false }], hint: '和圓一樣，從中心到邊上是半徑。' },
    { q: '圓柱的兩個底面是什麼形狀？', vis: xSolid('cylinder', 0, 120), opts: [{ h: xsm5('一樣大的圓形'), ok: true, t: '一樣大的圓形' }, { h: xsm5('一大一小的圓形'), ok: false, t: '一大一小的圓形' }, { h: '長方形', ok: false }], hint: '柱體的兩個底面一樣大。' }
  ]).slice(0, 6));
}
const XSOL = [
  { q: '六角柱有幾個面、幾條邊、幾個頂點？', opts: [{ h: xsm5('8 個面、18 條邊、12 個頂點'), ok: true, t: '8、18、12' }, { h: xsm5('7 個面、12 條邊、7 個頂點'), ok: false, t: '7、12、7' }, { h: xsm5('6 個面、18 條邊、12 個頂點'), ok: false, t: '6、18、12' }], hint: '底面是六邊形。', ex: '面：6 個側面 ＋ 2 個底面 ＝ <b>8</b>；邊：6 × 3 ＝ <b>18</b>；頂點：6 × 2 ＝ <b>12</b>。', trap: '7、12、7 是六角錐。角柱有 2 個底面，角錐只有 1 個。' },
  { q: '一個角錐有 8 個頂點，它有幾條邊？', ans: 14, unit: '條', hint: '先想它是幾角錐。', ex: '角錐頂點 ＝ 底面邊數 ＋ 1，8 − 1 ＝ 7，是七角錐，邊數 7 × 2 ＝ <b>14</b> 條。', trap: '不是 8 × 2 ＝ 16，要先扣掉最上面的頂點。' },
  { q: '下面哪一個立體圖形<b>沒有頂點</b>？', sp: '下面哪一個立體圖形沒有頂點？', opts: [{ h: '圓柱', ok: true }, { h: '圓錐', ok: false }, { h: '三角錐', ok: false }], hint: '圓錐最上面有一個尖尖的點。', ex: '<b>圓柱</b>由兩個圓和一個曲面圍成，沒有頂點；圓錐有 1 個頂點。', trap: '圓錐雖然底面是圓，但上面有 1 個頂點。' },
  { q: '三角柱和三角錐的<b>面數</b>相差幾個？', sp: '三角柱和三角錐的面數相差幾個？', ans: 1, unit: '個', hint: '三角柱有幾個面？三角錐有幾個面？', ex: '三角柱 3 ＋ 2 ＝ 5 個面，三角錐 3 ＋ 1 ＝ 4 個面，相差 <b>1</b> 個。', trap: '三角錐的 4 個面都是三角形，別少算底面。' },
  { q: '把一張長方形紙捲起來（兩邊剛好接合），會做出哪一種立體的側面？', opts: [{ h: '圓柱', ok: true }, { h: '圓錐', ok: false }, { h: '球', ok: false }], hint: '想想展開圖。', ex: '圓柱的側面展開是<b>長方形</b>，所以長方形捲起來是圓柱的側面。', trap: '圓錐的側面展開是扇形，不是長方形。' }
];

/* ---------- 補 xfm 分數與整數相除 ---------- */
function xfmA(st) {
  const tasks = shuffle([[3, 4], [2, 3], [4, 5], [5, 4], [3, 5], [7, 4]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [a, b] = tasks[r];
    curQ = { q: `${a} 塊蛋糕平分給 ${b} 人，點出一人分到的部分`, c: `${a} 份` };
    api.say(`有 <b>${a}</b> 塊一樣大的蛋糕，平分給 <b>${b}</b> 人。每塊都切成 ${b} 份，點出<b>一個人</b>分到的部分。`, `${a}塊蛋糕平分給${b}人，點出一個人分到的部分`);
    st.innerHTML = `${dots(r, tasks.length)}${Array.from({ length: a }, () => `<div class="fbar xfb">${'<i></i>'.repeat(b)}</div>`).join('')}
      <div class="readout">已選 <span id="cnt">0</span> 份（每份是 ${fr(1, b)} 塊）</div>
      <div class="center"><button class="btn mint" id="okb" type="button">分好了！</button></div><div class="kwrap" id="kw"></div>`;
    let n = 0;
    $$('.xfb i', st).forEach(s => s.onclick = () => { if ($('#okb', st).disabled) return; s.classList.toggle('on'); sfx('tap'); n = $$('.xfb i.on', st).length; $('#cnt', st).textContent = n; });
    $('#okb', st).onclick = () => {
      if (n !== a) return api.bad(`每塊蛋糕，每人都拿 1 份；${a} 塊就拿 ${a} 份喔！`, `選了 ${n} 份`, `${a} 份`);
      $('#okb', st).disabled = true; api.ok('分對了！');
      curQ = { q: `${a} ÷ ${b} ＝ ? 塊（用分數）`, c: `${a}/${b}` };
      api.say(`一個人分到 ${a} 個 ${fr(1, b)} 塊。用分數表示：${a} ÷ ${b} ＝ ? 塊`, `一個人分到${a}個${b}分之1塊，${a}除以${b}等於幾塊？`);
      keypad($('#kw', st), `${a}/${b}`, () => { $('#kw', st).insertAdjacentHTML('afterend', `<div class="center"><span class="after">${a} ÷ ${b} ＝ ${fr(a, b)} 塊</span></div>`); speak(`${a}除以${b}等於${b}分之${a}塊`); r++; later(round, 2300); }, `${a} 個 1/${b} 就是 ${b} 分之 ${a}`, '塊', ['/', '_']);
    };
  }
  round();
}
function xfmB(st) {
  quiz(st, [
    () => { const d = pick([3, 4, 5, 6]), n = d * rand(2, 9); return { q: `${n} × ${fr(1, d)} ＝ ?`, ans: n / d, hint: `乘以 ${fr(1, d)} 就是平分成 ${d} 份，取其中 1 份：${n} ÷ ${d}。`, after: `${n} × ${fr(1, d)} ＝ ${n} ÷ ${d} ＝ ${n / d}` }; },
    () => { const d = pick([3, 4, 5, 7]); let n; do n = rand(2, 13); while (n % d === 0); return { q: `${n} × ${fr(1, d)} ＝ ?（用最簡分數或帶分數）`, ans: fs5(n, d), keys: ['/', '_'], hint: `${n} × ${fr(1, d)} ＝ ${n} ÷ ${d}，除不盡就用分數表示。`, after: `${n} × ${fr(1, d)} ＝ ${frm(n, d)}` }; },
    () => { const b = rand(3, 9), a = rand(1, b - 1); return { q: `${a} ÷ ${b} 用分數表示是多少？`, ans: fs5(a, b), keys: ['/'], hint: '被除數當分子，除數當分母。', after: `${a} ÷ ${b} ＝ ${frm(a, b)}` }; },
    () => { const d = pick([4, 5, 6]), n = d * rand(3, 8); return { q: `${n} 的 ${fr(1, d)} 和 ${n} ÷ ${d}，哪一個比較大？`, opts: [{ h: xsm5('一樣大'), ok: true, t: '一樣大' }, { h: xsm5(`${n} 的 1/${d}`), ok: false, t: `${n} 的 1/${d}` }, { h: xsm5(`${n} ÷ ${d}`), ok: false, t: `${n} ÷ ${d}` }], keep: true, hint: `${n} 的 ${d} 分之 1，就是平分成 ${d} 份中的 1 份。`, after: `都是 ${n / d}` }; },
    () => { const d = pick([3, 4, 5]); let n; do n = rand(d + 1, 3 * d); while (n % d === 0); return { q: `${n} ÷ ${d} 的商用帶分數表示，整數部分是多少？`, ans: Math.floor(n / d), hint: `${n} 裡面有幾個 ${d}？`, after: `${n} ÷ ${d} ＝ ${frm(n, d)}` }; }
  ]);
}
function xfmC(st) {
  quiz(st, [
    () => { const d = pick([4, 6, 8]), n = d * rand(3, 9); return { q: `一盒有 ${n} 顆糖果，妹妹吃了全部的 ${fr(1, d)}，妹妹吃了幾顆？`, vis: '<span style="font-size:52px">🍬</span>', eq: `${n} × 1/${d}`, alt: [`${n} ÷ ${d}`], ans: n / d, unit: '顆', hint: `${n} 的 ${fr(1, d)} 是多少？`, after: `${n} × ${fr(1, d)} ＝ ${n / d} 顆` }; },
    () => { const b = pick([3, 4, 6]); let a; do a = rand(2, 11); while (a % b === 0); return { q: `${a} 公升果汁平分給 ${b} 人，每人分到幾公升？（用分數回答）`, vis: '<span style="font-size:52px">🧃</span>', eq: `${a} ÷ ${b}`, ans: fs5(a, b), keys: ['/', '_'], unit: '公升', hint: '整數相除的結果可以用分數表示。', after: `${a} ÷ ${b} ＝ ${frm(a, b)} 公升` }; },
    () => { const d = pick([5, 10]), n = d * rand(3, 9); return { q: `一條繩子長 ${n} 公尺，用掉了 ${fr(1, d)}，用掉幾公尺？`, vis: '<span style="font-size:52px">🪢</span>', eq: `${n} × 1/${d}`, alt: [`${n} ÷ ${d}`], ans: n / d, unit: '公尺', hint: `${n} 的 ${fr(1, d)}`, after: `${n} × ${fr(1, d)} ＝ ${n / d} 公尺` }; },
    () => { const b = pick([4, 5, 8]), a = rand(1, b - 1); return { q: `${a} 張披薩平分給 ${b} 個人，每人分到幾張？（用分數回答）`, vis: '<span style="font-size:52px">🍕</span>', eq: `${a} ÷ ${b}`, ans: fs5(a, b), keys: ['/'], unit: '張', hint: '被除數當分子，除數當分母。', after: `${a} ÷ ${b} ＝ ${frm(a, b)} 張` }; },
    () => { const d = pick([3, 4]), n = d * rand(5, 12); return { q: `班上有 ${n} 人，其中 ${fr(1, d)} 的人戴眼鏡，戴眼鏡的有幾人？`, vis: '<span style="font-size:52px">👓</span>', eq: `${n} × 1/${d}`, alt: [`${n} ÷ ${d}`], ans: n / d, unit: '人', hint: `${n} 的 ${fr(1, d)}`, after: `${n} × ${fr(1, d)} ＝ ${n / d} 人` }; }
  ]);
}
const XFM = [
  { q: '7 ÷ 4 用帶分數表示是多少？', ans: '7/4', keys: ['/', '_'], hint: '7 裡面有 1 個 4，還剩 3。', ex: '7 ÷ 4 ＝ 7/4 ＝ <b>1又3/4</b>。', trap: '不是 4/7，被除數 7 要當分子。' },
  { q: '18 × 1/6 ＝ ?', ans: 3, hint: '18 的 1/6 是多少？', ex: '乘以 1/6 就是平分成 6 份取 1 份：18 ÷ 6 ＝ <b>3</b>。', trap: '不是 18 × 6 ＝ 108，乘以幾分之一會變小。' },
  { q: '5 公斤的米平分成 8 包，每包幾公斤？', ans: '5/8', keys: ['/'], unit: '公斤', hint: '5 ÷ 8，除不盡用分數。', ex: '5 ÷ 8 ＝ <b>5/8</b> 公斤。', trap: '不是 8 ÷ 5，是把 5 公斤平分成 8 份。' },
  { q: '24 的 1/3 和 24 的 1/4，相差多少？', ans: 2, hint: '分別算出來再相減。', ex: '24 × 1/3 ＝ 8，24 × 1/4 ＝ 6，相差 <b>2</b>。', trap: '1/3 比 1/4 大，24 的 1/3 也比較大。' },
  { q: '一個數乘以 1/5 等於 9，這個數是多少？', ans: 45, hint: '這個數平分成 5 份，1 份是 9。', ex: '1 份是 9，5 份就是 9 × 5 ＝ <b>45</b>。', trap: '不是 9 ÷ 5，要還原成整體用乘法。' }
];

document.head.insertAdjacentHTML('beforeend', `<style>
.small-opt{font-size:20px;line-height:1.35}
.xnum{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;max-width:460px;margin:8px auto}
.xnum button{min-height:42px;border-radius:10px;border:3px solid var(--line);background:#fff;font-size:18px;font-weight:900;color:var(--ink);cursor:pointer}
.xnum button.on{background:var(--yellow);border-color:#e0a800}
.xpv{border-collapse:collapse;margin:0 auto;background:#fff;font-weight:900}
.xpv th,.xpv td{border:2px solid #cbb8e6;padding:6px 8px;text-align:center;min-width:64px}.xpv th{background:#f6f2ff;font-size:16px}
.xpv td .v{font-size:30px;color:#3b8fd6;display:block}.xpv td button{width:40px;height:34px;border-radius:8px;border:2px solid var(--line);background:#fff;font-size:18px;font-weight:900;cursor:pointer}
.xpv .dot{min-width:16px;font-size:30px;border:0;background:none}
.xctl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:8px 0}
.xctl button{min-width:52px;height:42px;border-radius:10px;border:2px solid var(--line);background:#fff;font-size:18px;font-weight:900;cursor:pointer}
.xctl .v{min-width:110px;text-align:center;font-size:20px;font-weight:900;color:#e5508f}
.xsvg{max-width:90vw;height:auto}
.xsolids{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.xsolid{width:100px;border:3px solid var(--line);border-radius:12px;background:#fff;padding:4px;font:inherit;font-weight:900;font-size:15px;color:var(--ink);cursor:pointer}
.xsolid.sel{border-color:var(--orange);background:#fff1e0}
.xbins{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.xbin{min-height:110px;border:3px dashed #b9aecb;border-radius:14px;background:#f6f2ff;padding:6px;font:inherit;color:var(--ink);cursor:pointer}
.xbin h4{margin:2px 0 6px;font-size:19px}.xbin .in{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
.xbin .in span{font-size:13px;background:#fff;border-radius:6px;padding:2px 6px;font-weight:900}
.xfb i{cursor:pointer}
@media (max-width:600px){.xpv th,.xpv td{min-width:44px;padding:4px}.xpv td .v{font-size:24px}.xpv td button{width:32px}.xsolid{width:88px}.xnum{grid-template-columns:repeat(6,1fr)}}
</style>`);

Object.assign(LEVELS, {
  x2: [x2A, x2B, x2C, st => xquiz(st, XX2)],
  xdec: [xdecA, xdecB, xdecC, st => xquiz(st, XDEC)],
  xsec: [xsecA, xsecB, xsecC, st => xquiz(st, XSEC)],
  xsol: [xsolA, xsolB, xsolC, st => xquiz(st, XSOL)],
  xfm: [xfmA, xfmB, xfmC, st => xquiz(st, XFM)]
});
