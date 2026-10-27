'use strict';
/* 第 4 單元 年月日 ／ 第 5 單元 0、1、10 的乘法 ／ 第 6 單元 重量 */

const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const WK = ['日', '一', '二', '三', '四', '五', '六'];

/* ===== 4-A 大月小月：點出月份、在月曆上找日期 ===== */
function u4A(st) {
  const tasks = [
    { q: '有 <b>31 天</b>的月份叫「大月」。把<b>全部的大月</b>點出來，再按「好了」。', sp: '有 31 天的月份叫大月。把全部的大月點出來，再按好了。', ans: [1, 3, 5, 7, 8, 10, 12] },
    { q: '把<b>有 30 天</b>的月份全部點出來，再按「好了」。', sp: '把有 30 天的月份全部點出來，再按好了。', ans: [4, 6, 9, 11] }
  ];
  let r = 0;
  function monthRound() {
    const t = tasks[r], on = new Set();
    api.say(t.q + '<br><small>小提示：用拳頭數，凸起來的是大月！</small>', t.sp);
    st.innerHTML = `${dots(r, 3)}<div class="qvis">✊ 拳頭記法：凸的是 31 天，凹的是 30 天（2 月最少）</div>
      <div class="months">${MDAYS.map((_, k) => `<button type="button" class="mcard" data-m="${k + 1}">${k + 1} 月</button>`).join('')}</div>
      <div class="center"><button class="btn green" data-a="ok">好了！</button></div>`;
    $$('.mcard', st).forEach(b => b.onclick = () => { const m = +b.dataset.m; sfx('tap'); on.has(m) ? on.delete(m) : on.add(m); b.classList.toggle('on', on.has(m)); });
    $('[data-a="ok"]', st).onclick = () => {
      const miss = t.ans.filter(m => !on.has(m)), extra = [...on].filter(m => !t.ans.includes(m));
      if (!miss.length && !extra.length) {
        $$('.mcard', st).forEach(b => b.classList.toggle('right', on.has(+b.dataset.m)));
        api.ok(`答對了：${t.ans.join('、')} 月`); speak(`答對了，${t.ans.join('、')} 月`); r++; later(r < 2 ? monthRound : calRound, 1900);
      } else api.bad(extra.length ? `${extra[0]} 月有 ${MDAYS[extra[0] - 1]} 天喔！` : `還有月份沒點到喔！`);
    };
  }
  function calRound() {
    const m = rand(3, 10), first = rand(0, 6), d = rand(3, 15), after = pick([7, 14]), target = d + after;
    api.say(`今天是 ${m} 月 <b>${d}</b> 日，<b>${after === 7 ? '1 星期' : '2 星期'}</b>以後是幾日？在月曆上點出來。`, `今天是 ${m} 月 ${d} 日，${after === 7 ? '1 星期' : '2 星期'}以後是幾日？在月曆上點出來。`);
    st.innerHTML = `${dots(2, 3)}<div class="qvis">${calHTML(`${m} 月`, first, MDAYS[m - 1], { hl: [d], tap: true })}</div>`;
    $$('.cal td.tap', st).forEach(td => td.onclick = () => {
      const v = +td.dataset.d;
      if (v === target) { td.classList.add('hl'); api.ok(`1 星期有 7 天，${d} ＋ ${after} ＝ ${target}`); speak(`1 星期有 7 天，${m} 月 ${target} 日`); later(() => api.finish(), 1800); }
      else api.bad(`1 星期是 7 天，往下一排就是 7 天後喔！`);
    });
  }
  monthRound();
}

/* ===== 4-B 年月日換算 ===== */
function u4B(st) {
  const ym = () => { const y = rand(1, 3), m = rand(1, 11), v = y * 12 + m; return { q: `<b>${y} 年 ${m} 個月</b> ＝ 幾個月？`, sp: `${y} 年 ${m} 個月等於幾個月？`, ans: v, unit: '個月', hint: `1 年有 12 個月，${y} 年是 ${y * 12} 個月。`, after: `${y * 12} ＋ ${m} ＝ ${v} 個月` }; };
  const my = () => { const v = rand(13, 35), y = Math.floor(v / 12), m = v % 12 || 1; const vv = y * 12 + m;
    return { q: `<b>${vv} 個月</b> ＝ 幾年幾個月？`, sp: `${vv} 個月等於幾年幾個月？`, opts: mkOpts(`${y} 年 ${m} 個月`, [`${Math.floor(vv / 10)} 年 ${vv % 10} 個月`, `${y + 1} 年 ${m} 個月`, `${y} 年 ${m > 9 ? m - 2 : m + 2} 個月`].filter(x => x !== `${y} 年 ${m} 個月`)), hint: '12 個月是 1 年，不是 10 個月喔！', after: `${vv} 個月 ＝ ${y} 年 ${m} 個月` }; };
  const wk = () => { const w = rand(2, 4), d = rand(0, 6), v = w * 7 + d; return { q: `<b>${w} 星期${d ? ` ${d} 天` : ''}</b> ＝ 幾天？`, sp: `${w} 星期${d ? ` ${d} 天` : ''}等於幾天？`, ans: v, unit: '天', hint: '1 星期有 7 天。', after: `${w} 個 7 天是 ${w * 7} 天${d ? `，再加 ${d} 天是 ${v} 天` : ''}` }; };
  const feb = () => pick([
    { q: '<b>平年</b>的 2 月有幾天？', ans: 28, unit: '天', hint: '2 月比較短喔！', after: '平年 2 月有 28 天，閏年 2 月有 29 天' },
    { q: '<b>閏年</b>的 2 月有幾天？', ans: 29, unit: '天', hint: '閏年 2 月比平年多 1 天。', after: '閏年 2 月有 29 天' }]);
  const year = () => ({ q: '<b>1 年</b>有幾個月？', ans: 12, unit: '個月', hint: '從 1 月數到 12 月。', after: '1 年有 12 個月' });
  const md = () => { const m = pick([1, 4, 6, 7, 8, 9, 11, 12]); return { q: `<b>${m} 月</b>有幾天？`, ans: MDAYS[m - 1], unit: '天', hint: '用拳頭數一數，凸的是 31 天。', after: `${m} 月有 ${MDAYS[m - 1]} 天` }; };
  quiz(st, [year, ym, my, wk, feb, md].map(f => () => { const t = f(); t.vis = '<div class="price">📅 1 年＝12 個月　1 星期＝7 天</div>'; return t; }));
}

/* ===== 4-C 共幾天、星期幾 ===== */
function u4C(st) {
  const span = () => { const m = rand(3, 10), a = rand(2, 10), b = a + rand(5, 12); const v = b - a + 1; const first = rand(0, 6);
    return { q: `工人從 ${m} 月 <b>${a}</b> 日開始做，做到 ${m} 月 <b>${b}</b> 日（這兩天都有做），一共做了幾天？`, sp: `工人從 ${m} 月 ${a} 日開始做，做到 ${m} 月 ${b} 日，這兩天都有做，一共做了幾天？`,
      vis: calHTML(`${m} 月`, first, MDAYS[m - 1], { hl: Array.from({ length: v }, (_, k) => a + k) }), ans: v, unit: '天', hint: v => v === b - a ? '開始的那一天也要算進去喔！' : '在月曆上一格一格數。', after: `${a} 日到 ${b} 日，數一數共 ${v} 天` }; };
  const cross = () => { const m = pick([3, 5, 7, 8, 10]), start = rand(27, 30), len = 7; const left = MDAYS[m - 1] - start + 1, endD = len - left;
    return { q: `工程第 1 天是 ${m} 月 <b>${start}</b> 日，連續做 <b>7 天</b>，最後一天是幾月幾日？`, sp: `工程第 1 天是 ${m} 月 ${start} 日，連續做 7 天，最後一天是幾月幾日？`,
      vis: `<div class="price">${m} 月有 ${MDAYS[m - 1]} 天</div>`, opts: mkOpts(`${m + 1} 月 ${endD} 日`, [`${m + 1} 月 ${endD + 1} 日`, `${m} 月 ${start + 7 > 31 ? 31 : start + 6} 日`, `${m + 1} 月 ${endD - 1 || 7} 日`]), hint: `${m} 月最後一天是 ${MDAYS[m - 1]} 日，接著就是下個月 1 日。`, after: `${m} 月 ${start} 日數到 ${MDAYS[m - 1]} 日是 ${left} 天，再數 ${endD} 天到 ${m + 1} 月 ${endD} 日` }; };
  const dow = () => { const t = rand(0, 6), k = pick([8, 9, 10, 11, 12, 13]), a = (t + k) % 7;
    return { q: `今天是<b>星期${WK[t]}</b>，再過 <b>${k}</b> 天是星期幾？`, sp: `今天是星期${WK[t]}，再過 ${k} 天是星期幾？`, vis: `<div class="row-btns">${WK.map((w, i) => `<span class="price" style="font-size:22px${i === t ? ';background:#ffc400' : ''}">${w}</span>`).join('')}</div>`,
      opts: mkOpts(`星期${WK[a]}`, [`星期${WK[(a + 1) % 7]}`, `星期${WK[(a + 6) % 7]}`]), hint: '過 7 天又是同一個星期幾，再往後數剩下的天數。', after: `過 7 天還是星期${WK[t]}，再過 ${k - 7} 天是星期${WK[a]}` }; };
  quiz(st, [span, cross, dow, span, dow]);
}

/* ===== 4-D 進階挑戰 ===== */
function u4D(st) {
  adv(st, [
    { q: '<b>2 年 5 個月</b> ＝ 幾個月？', sp: '2 年 5 個月等於幾個月？', vis: '<div class="price">📅 2 年 5 個月</div>', opts: mkOpts(29, [25, 17, 205]),
      ex: '1 年 ＝ 12 個月，2 年 ＝ 24 個月，24 ＋ 5 ＝ <b>29</b> 個月。', trap: '1 年是 12 個月，不是 10 個月，所以不是 25。' },
    { q: '<b>38 個月</b> ＝ 幾年幾個月？', sp: '38 個月等於幾年幾個月？', vis: '<div class="price">📅 38 個月</div>', opts: mkOpts('3 年 2 個月', ['3 年 8 個月', '2 年 2 個月', '3 年 6 個月']),
      ex: '12 個月 1 年：12、24、36，36 個月是 3 年，38 − 36 ＝ 2，所以是 <b>3 年 2 個月</b>。', trap: '不能把 38 拆成「3 和 8」！要用 12 個月一數。' },
    { q: '下面哪一組月份<b>全部都是大月</b>（31 天）？', sp: '下面哪一組月份全部都是大月？', vis: '<div class="price">✊ 用拳頭數一數</div>',
      opts: mkOpts('1 月、7 月、8 月', ['7 月、9 月、12 月', '3 月、5 月、6 月', '8 月、10 月、11 月']),
      ex: '大月是 1、3、5、7、8、10、12 月。<b>1 月、7 月、8 月</b>都是 31 天。9 月、6 月、11 月都只有 30 天。', trap: '7 月和 8 月連續兩個月都是大月，很多人以為 8 月是 30 天。' },
    { q: '<b>2 月</b>可能有幾天？', sp: '2 月可能有幾天？', vis: '<div class="price">📅 2 月</div>',
      opts: mkOpts('28 天或 29 天', ['只有 28 天', '30 天', '31 天']),
      ex: '平年的 2 月有 28 天，閏年的 2 月有 29 天，所以 2 月有 <b>28 天或 29 天</b>。', trap: '題目問「可能」，要想到平年和閏年兩種情形。' },
    { q: '5 月 1 日是<b>星期五</b>，那 5 月 <b>20</b> 日是星期幾？', sp: '5 月 1 日是星期五，那 5 月 20 日是星期幾？', vis: calHTML('5 月', 5, 31, { upto: 7, hl: [1] }),
      opts: mkOpts('星期三', ['星期二', '星期四', '星期五']),
      ex: '1 日是星期五，往後每加 7 天還是星期五：8 日、15 日都是星期五。<br>15 日再過 5 天是 20 日：星期六、日、一、二、<b>三</b>。', trap: '是「1 日到 20 日」差 19 天，不是 20 天；用「每 7 天同一個星期幾」來數最不會錯。' }
  ]);
}

/* ===== 5-A 一盒一盒裝 ===== */
function u5A(st) {
  const rounds = shuffle([{ per: 10, n: rand(3, 6) }, { per: 10, n: rand(7, 9) }, { per: 1, n: rand(5, 9) }]).concat([{ per: 10, n: 10 }]);
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const { per, n } = rounds[r], target = per * n; let k = 0;
    api.say(`每盒裝 <b>${per}</b> 根螺絲，要準備 <b class="big">${target}</b> 根，需要幾盒？按「＋1 盒」裝出來。`, `每盒裝 ${per} 根螺絲，要準備 ${target} 根，需要幾盒？`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="crates"></div><div class="readout"><span class="eqr"></span></div>
      <div class="row-btns"><button class="btn" data-a="+">＋1 盒</button><button class="btn ghost sm" data-a="-">拿走 1 盒</button><button class="btn green" data-a="ok">好了！</button></div>`;
    const draw = () => {
      $('.crates', st).innerHTML = Array.from({ length: k }, () => `<span class="crate">${'🔩'.repeat(per)}</span>`).join('') || '<span class="lbl">還沒有盒子</span>';
      $('.eqr', st).innerHTML = `${per} × ${k} ＝ ${per * k} 根`;
    };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === '+' && k < 12) k++;
      if (a === '-' && k > 0) k--;
      if (a === 'ok') {
        if (k === n) { api.ok(`${per} × ${n} ＝ ${target}`); speak(`${per} 乘 ${n} 等於 ${target}，需要 ${n} 盒`); r++; later(round, 1800); return; }
        api.bad(per * k > target ? '太多盒了！' : '還不夠喔！');
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 5-B 0 和 1 和 10 ===== */
function u5B(st) {
  const zero = () => { const n = rand(2, 9), f = Math.random() < 0.5; return { q: `<b>${f ? `0 × ${n}` : `${n} × 0`}</b> ＝ ？`, vis: f ? `<div class="crates">${'<span class="crate empty"></span>'.repeat(n)}</div><div class="lbl" style="width:100%">每盒 0 個，有 ${n} 盒</div>` : `<div class="lbl">每盒 ${n} 個，1 盒也沒有</div>`, opts: mkOpts(0, [n, 1]), hint: '0 個的幾倍還是 0；幾個的 0 倍也是 0。', after: `${f ? `0 × ${n}` : `${n} × 0`} ＝ 0` }; };
  const one = () => { const n = rand(2, 9), f = Math.random() < 0.5; return { q: `<b>${f ? `1 × ${n}` : `${n} × 1`}</b> ＝ ？`, vis: `<div class="crates">${(f ? '<span class="crate">🔩</span>'.repeat(n) : `<span class="crate">${'🔩'.repeat(n)}</span>`)}</div>`, opts: mkOpts(n, [1, n + 1, 0]), hint: '1 的幾倍就是幾；幾的 1 倍也是幾。', after: `${f ? `1 × ${n}` : `${n} × 1`} ＝ ${n}` }; };
  const ten = () => { const n = rand(2, 10); return { q: `<b>10 × ${n}</b> ＝ ？`, vis: `<div class="crates">${`<span class="crate">${'🔩'.repeat(10)}</span>`.repeat(n)}</div>`, ans: 10 * n, hint: '10 個一數。', after: `10 × ${n} ＝ ${10 * n}` }; };
  const pat2 = () => ({ q: '2 的乘法（2×1 到 2×9），答案的<b>個位</b>不會是哪一個？', opts: mkOpts(N(7), [N(4), N(8), N(6)], v => v), hint: '2、4、6、8、10、12……個位都是雙數。', after: '2 的乘法個位只有 0、2、4、6、8' });
  const pat5 = () => { const ok = 5 * rand(3, 9); const w = shuffle([ok + 2, ok - 3, ok + 1]).slice(0, 2); return { q: '下面哪一個是 <b>5 的乘法</b>的答案？', opts: mkOpts(ok, w), hint: '5 的乘法，個位只有 0 或 5。', after: `${ok} ＝ 5 × ${ok / 5}` }; };
  quiz(st, shuffle([zero, one, ten, pat2, pat5, zero]).map(f => () => { const t = f(); t.vis = t.vis || '<div class="price">✖️ 乘法表</div>'; return t; }));
}

/* ===== 5-C 乘法交換 ===== */
function arrHTML(r, c) { return `<span class="array" style="grid-template-columns:repeat(${c},26px)">${'<i></i>'.repeat(r * c)}</span>`; }
function u5C(st) {
  const swap = () => { const a = rand(3, 9), b = rand(2, 9); return { q: `<b>□ × ${a} ＝ ${a} × ${b}</b>，□ 是多少？`, vis: `${arrHTML(a, b)}<span class="lbl">橫著看、直著看，一樣多</span>`, opts: mkOpts(b, [a, a * b, b + 1].filter(v => v !== b)), hint: '兩個數交換，答案一樣。', after: `${b} × ${a} ＝ ${a} × ${b} ＝ ${a * b}` }; };
  const same = () => { const a = rand(3, 8), b = rand(4, 9); return { q: `<b>${a} × ${b}</b> 和 <b>${b} × ${a}</b> 的答案一樣嗎？`, vis: arrHTML(a, b), opts: [{ h: '一樣', ok: true }, { h: `${a} × ${b} 比較大`, ok: false }, { h: `${b} × ${a} 比較大`, ok: false }], keep: true, hint: '看看點點圖，轉個方向，點點數量一樣。', after: `${a} × ${b} ＝ ${b} × ${a} ＝ ${a * b}` }; };
  const teen = () => { const a = rand(2, 4), t = rand(11, 15), v = a * t; return { q: `每排放 <b>${a}</b> 根鋼管，排了 <b>${t}</b> 排，一共有幾根？<br><small>${a} × ${t} ＝ ${t} × ${a}，可以用 ${Array(a).fill(t).join(' ＋ ')} 算</small>`, sp: `每排放 ${a} 根鋼管，排了 ${t} 排，一共有幾根？`, vis: arrHTML(t, a), ans: v, hint: `把 ${a} 個 ${t} 加起來。`, after: `${Array(a).fill(t).join(' ＋ ')} ＝ ${v}，${a} × ${t} ＝ ${v}` }; };
  quiz(st, [same, swap, teen, swap, teen]);
}

/* ===== 5-D 進階挑戰 ===== */
function u5D(st) {
  adv(st, [
    { q: '<b>0 × 9</b> 和 <b>9 × 0</b>，哪一個比較大？', sp: '0 乘 9 和 9 乘 0，哪一個比較大？', vis: '<div class="eq">0 × 9 ○ 9 × 0</div>',
      opts: mkOpts('一樣大', ['0 × 9 比較大', '9 × 0 比較大']), keep: true,
      ex: '0 × 9 是 9 個 0，等於 0；9 × 0 是 0 個 9，也等於 0。兩個都是 0，<b>一樣大</b>。', trap: '看到 9 不要以為答案是 9！只要有乘 0，答案就是 0。' },
    { q: '<b>10 × □ ＝ 80</b>，□ 是多少？', sp: '10 乘幾等於 80？', vis: '<div class="eq">10 × □ ＝ 80</div>', opts: mkOpts(8, [80, 70, 18]),
      ex: '10、20、30……10 個一數，數到 80 數了 8 次，所以 □ ＝ <b>8</b>。', trap: '□ 是「幾個 10」，不是 80，也不是 80−10。' },
    { q: '下面哪一個數<b>不可能</b>是 5 的乘法（5×1 到 5×9）的答案？', sp: '下面哪一個數不可能是 5 的乘法的答案？', vis: '<div class="price">5、10、15、20……</div>', opts: mkOpts(42, [35, 40, 45]),
      ex: '5 的乘法答案個位只有 0 或 5：35＝5×7、40＝5×8、45＝5×9。<b>42</b> 的個位是 2，不可能。', trap: '題目問「不可能」，要選不是 5 的乘法答案的那一個。' },
    { q: '<b>4 × 13</b> ＝ ？', sp: '4 乘 13 等於多少？', vis: arrHTML(13, 4), ans: 52,
      ex: '4 × 13 ＝ 13 × 4，可以用 13 ＋ 13 ＋ 13 ＋ 13 算：26 ＋ 26 ＝ <b>52</b>。', trap: '乘法表只到 9，13 要用交換再連加；不能寫成 4 × 1 和 4 × 3 拼成 412。' },
    { q: '有 9 個盤子各放 <b>1</b> 個麵包，另外 6 個盤子都是<b>空的</b>。全部一共有幾個麵包？', sp: '有 9 個盤子各放 1 個麵包，另外 6 個盤子都是空的。全部一共有幾個麵包？',
      vis: `<div class="crates">${'<span class="crate">🍞</span>'.repeat(9)}${'<span class="crate empty"></span>'.repeat(6)}</div>`, opts: mkOpts(9, [15, 6, 0]),
      ex: '1 × 9 ＝ 9 個，0 × 6 ＝ 0 個，9 ＋ 0 ＝ <b>9</b> 個。', trap: '盤子有 15 個，但空盤子沒有麵包，不能算成 15 個。' }
  ]);
}

/* ===== 6-A 天平秤一秤：用積木秤出東西的重量 ===== */
function u6A(st) {
  const items = shuffle([['🔨', '鐵鎚'], ['🧱', '磚頭'], ['🪣', '油漆桶'], ['🔧', '扳手'], ['⛑️', '安全帽']]).slice(0, 3).map(x => [...x, rand(3, 9)]);
  let r = 0;
  function round() {
    if (r >= items.length) return api.finish();
    const [e, nm, w] = items[r]; let k = 0;
    api.say(`${nm}放在左邊，在右邊放積木 🟨，放到天平<b>平衡</b>為止。`, `${nm}放在左邊，在右邊放積木，放到天平平衡為止。`);
    st.innerHTML = `${dots(r, items.length)}<div class="scale-wrap center"></div><div class="readout">右邊有 <b class="k">0</b> 個積木</div>
      <div class="row-btns"><button class="btn hz" data-a="+">＋ 1 個積木</button><button class="btn ghost sm" data-a="-">拿走 1 個</button><button class="btn green" data-a="ok">平衡了！</button></div>`;
    const draw = () => {
      const tilt = k < w ? -1 : k > w ? 1 : 0;
      $('.scale-wrap', st).innerHTML = balanceSVG(e, k ? (k > 4 ? `🟨×${k}` : '🟨'.repeat(k)) : '', tilt);
      $('.k', st).textContent = k;
    };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === '+' && k < 12) k++;
      if (a === '-' && k > 0) k--;
      if (a === 'ok') {
        if (k === w) { api.ok(`${nm}和 ${w} 個積木一樣重！`); speak(`${nm}和 ${w} 個積木一樣重`); r++; later(round, 1800); return; }
        api.bad(k < w ? `左邊比較低，表示${nm}比較重，再放積木。` : '右邊比較低，積木太多了！');
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 6-B 誰比較重 ===== */
function u6B(st) {
  const pairQ = () => { // 依真實輕重排好：前面的比後面的重
    const list = [['🪣', '油漆桶'], ['🧱', '磚頭'], ['🔨', '鐵鎚'], ['📐', '三角板'], ['🧤', '手套'], ['🪶', '羽毛']];
    const i = rand(0, 3), j = rand(i + 1, 5), heavy = list[i], light = list[j];
    const [a, b] = Math.random() < 0.5 ? [heavy, light] : [light, heavy], tilt = a === heavy ? -1 : 1;
    return { q: `看天平，<b>哪一個比較重</b>？`, vis: `<div class="scale-wrap">${balanceSVG(a[0], b[0], tilt)}</div>`, opts: mkOpts(`${heavy[0]} ${heavy[1]}`, [`${a[0]} ${a[1]}`, `${b[0]} ${b[1]}`, '一樣重']), hint: '比較重的那邊會往下沉。', after: `往下沉的${heavy[1]}比較重` }; };
  const eqQ = () => ({ q: '天平兩邊<b>一樣高</b>，表示什麼？', vis: `<div class="scale-wrap">${balanceSVG('🧱', '🟨🟨🟨', 0)}</div>`, opts: mkOpts('兩邊一樣重', ['左邊比較重', '右邊比較重']), keep: true, hint: '平衡就是一樣重。', after: '1 塊磚頭和 3 個積木一樣重' });
  const transQ = () => { const nm = shuffle([['🟥', '紅箱子'], ['🟦', '藍箱子'], ['🟩', '綠箱子']]); // nm[0] > nm[1] > nm[2]
    const askHeavy = Math.random() < 0.5;
    return { q: `${nm[0][1]}比${nm[1][1]}重，${nm[1][1]}比${nm[2][1]}重。哪一個<b>最${askHeavy ? '重' : '輕'}</b>？`, vis: `<div class="scale-wrap">${balanceSVG(nm[0][0], nm[1][0], -1)}</div><div class="scale-wrap">${balanceSVG(nm[1][0], nm[2][0], -1)}</div>`,
      opts: mkOpts(askHeavy ? nm[0][1] : nm[2][1], [nm[1][1], askHeavy ? nm[2][1] : nm[0][1]]), hint: '排一排：最重 ＞ 中間 ＞ 最輕。', after: `${nm[0][1]} ＞ ${nm[1][1]} ＞ ${nm[2][1]}` }; };
  quiz(st, [pairQ, eqQ, transQ, pairQ, transQ]);
}

/* ===== 6-C 用積木當單位 ===== */
function u6C(st) {
  const diffQ = () => { const a = rand(6, 12), b = rand(3, a - 2); return { q: `🔨 鐵鎚和 <b>${a}</b> 個積木一樣重，🔧 扳手和 <b>${b}</b> 個積木一樣重。鐵鎚比扳手重幾個積木？`, sp: `鐵鎚和 ${a} 個積木一樣重，扳手和 ${b} 個積木一樣重。鐵鎚比扳手重幾個積木？`, vis: `<div class="scale-wrap">${balanceSVG('🔨', `🟨×${a}`, 0)}</div><div class="scale-wrap">${balanceSVG('🔧', `🟨×${b}`, 0)}</div>`, ans: a - b, unit: '個積木', hint: '用減法算相差幾個。', after: `${a} − ${b} ＝ ${a - b} 個積木` }; };
  const whichQ = () => { const a = rand(4, 9), b = a + rand(1, 4); return { q: `🧤 手套重 <b>${a}</b> 個迴紋針，⛑️ 安全帽重 <b>${b}</b> 個迴紋針。哪一個比較重？`, vis: '<div class="price">📎 用迴紋針當單位</div>', opts: mkOpts('⛑️ 安全帽', ['🧤 手套', '一樣重']), keep: true, hint: '同一種單位，數量多的比較重。', after: `${b} 個比 ${a} 個多，安全帽比較重` }; };
  const unitQ = () => ({ q: '小明說：「書重 8 個<b>迴紋針</b>」；小華說：「盒子重 5 個<b>積木</b>」。可以直接說書比較重嗎？', vis: '<div class="price">📎 × 8　　🟨 × 5</div>', opts: mkOpts('不可以，單位不一樣', ['可以，8 比 5 大', '可以，盒子比較重']), keep: true, hint: '迴紋針和積木一樣重嗎？', after: '要用同樣的單位，才能比數量' });
  quiz(st, [diffQ, whichQ, unitQ, diffQ, whichQ]);
}

/* ===== 6-D 進階挑戰 ===== */
function u6D(st) {
  adv(st, [
    { q: '看天平，<b>哪一個比較重</b>？', sp: '看天平，哪一個比較重？', vis: `<div class="scale-wrap">${balanceSVG('📕', '🧰', 1)}</div><div class="lbl" style="width:100%">左邊：書　右邊：工具箱</div>`,
      opts: mkOpts('工具箱', ['書', '一樣重']), keep: true,
      ex: '天平右邊往下沉，右邊的<b>工具箱</b>比較重；左邊翹起來，書比較輕。', trap: '翹得比較高的那邊是比較「輕」，不是比較重，不要看反了！' },
    { q: 'A 比 B 重，C 比 A 重。哪一個<b>最重</b>？', sp: 'A 比 B 重，C 比 A 重。哪一個最重？', vis: '<div class="price">A ＞ B　　C ＞ A</div>',
      opts: mkOpts('C', ['A', 'B']), keep: true,
      ex: 'C ＞ A，A ＞ B，所以 C ＞ A ＞ B，<b>C</b> 最重。', trap: '第一句先講 A 比 B 重，但 C 又比 A 重，最重的是 C。' },
    { q: '西瓜和 <b>12</b> 個積木一樣重，鳳梨和 <b>9</b> 個積木一樣重。西瓜比鳳梨重幾個積木？', sp: '西瓜和 12 個積木一樣重，鳳梨和 9 個積木一樣重。西瓜比鳳梨重幾個積木？',
      vis: `<div class="scale-wrap">${balanceSVG('🍉', '🟨×12', 0)}</div><div class="scale-wrap">${balanceSVG('🍍', '🟨×9', 0)}</div>`, opts: mkOpts(3, [21, 12, 9]),
      ex: '12 − 9 ＝ <b>3</b>，西瓜比鳳梨重 3 個積木。', trap: '問「重幾個」是相差，用減法；不是把 12 和 9 加起來。' },
    { q: '小美用迴紋針量，書包重 <b>20 個迴紋針</b>；小明用積木量<b>同一個書包</b>，重 <b>5 個積木</b>。下面哪一句是對的？', sp: '小美用迴紋針量，書包重 20 個迴紋針；小明用積木量同一個書包，重 5 個積木。下面哪一句是對的？',
      vis: '<div class="price">🎒 ＝ 📎 × 20　　🎒 ＝ 🟨 × 5</div>',
      opts: mkOpts('1 個積木比 1 個迴紋針重', ['小美量的書包比較重', '小明量的書包比較重', '1 個迴紋針比 1 個積木重']),
      ex: '是同一個書包，所以一樣重。20 個迴紋針才和 5 個積木一樣重，表示<b>1 個積木比 1 個迴紋針重</b>。', trap: '數字大不一定比較重！單位越輕，要用的數量越多。' },
    { q: '把一團黏土從圓球捏成<b>長條</b>，重量會怎樣？', sp: '把一團黏土從圓球捏成長條，重量會怎樣？', vis: '<div class="price">🟤 ➜ 〰️</div>',
      opts: mkOpts('一樣重', ['變重', '變輕']), keep: true,
      ex: '黏土沒有加，也沒有拿走，只是形狀改變，所以重量<b>一樣</b>。', trap: '長條看起來比較大，但東西沒有變多，重量不會改變。' }
  ]);
}

LEVELS.u4 = [u4A, u4B, u4C, u4D];
LEVELS.u5 = [u5A, u5B, u5C, u5D];
LEVELS.u6 = [u6A, u6B, u6C, u6D];
