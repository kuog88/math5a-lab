'use strict';
/* 第 4 單元 加減的關係與應用 ／ 第 5 單元 容量 ／ 第 6 單元 兩步驟的加減 */

/* ===== 4-A 跳跳青蛙：往上數，找出加了多少 ===== */
function u4A(st) {
  const plans = [[rand(12, 28), 0], [rand(24, 45), 0], [rand(31, 56), 0]].map(([a]) => [a, a + rand(1, 3) * 10 + rand(2, 8)]);
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [a, c] = plans[r]; let pos = a; const hops = [];
    api.say(`青蛙在 <b>${a}</b>，要跳到 <b class="big">${c}</b>。用「跳 10」和「跳 1」幫牠跳過去！`, `青蛙在 ${a}，要跳到 ${c}。用跳10和跳1幫牠跳過去！`);
    st.innerHTML = `${dots(r, plans.length)}<div class="frog"><div class="fpos"><span style="font-size:56px">🐸</span><span class="num" id="fp"></span></div><span style="font-size:40px">➜</span><div class="fpos"><span style="font-size:56px">🪷</span><span class="num">${c}</span></div></div>
      <div class="hops" id="hops"></div>
      <div class="opts"><button type="button" class="opt" data-d="10">跳 10</button><button type="button" class="opt" data-d="1">跳 1</button><button type="button" class="opt" data-d="back">↩ 退回</button></div>
      <div class="qvis" id="qv"></div><div class="kwrap" id="kw"></div>`;
    const draw = () => { $('#fp', st).textContent = pos; $('#hops', st).innerHTML = hops.map(d => `<span class="hop">+${d}</span>`).join(''); };
    $$('.opt[data-d]', st).forEach(b => b.onclick = () => {
      if (pos === c && b.dataset.d !== 'back') return;
      const d = b.dataset.d; sfx('tap');
      if (d === 'back') { if (hops.length) pos -= hops.pop(); }
      else { if (pos + +d > c) { api.bad('跳過頭了！試試小一點的跳法。'); return; } pos += +d; hops.push(+d); }
      draw();
      if (pos === c) { api.ok('到了！'); later(ask, 700); }
    });
    function ask() {
      $$('.opt[data-d]', st).forEach(b => b.disabled = true);
      api.say(`${a} + <span class="box">?</span> = ${c}，青蛙一共跳了多少？`, `${a} 加多少等於 ${c}？青蛙一共跳了多少？`);
      keypad($('#kw', st), c - a, () => { $('#qv', st).innerHTML = `<div class="after">${a} + ${c - a} = ${c}，也就是 ${c} − ${a} = ${c - a}</div>`; speak(`${a} 加 ${c - a} 等於 ${c}，也就是 ${c} 減 ${a} 等於 ${c - a}`); r++; later(round, 3000); }, '把跳的 10 和 1 加起來！');
    }
    draw();
  }
  round();
}

/* ===== 4-B 選算式：加數、被減數不知道的問題 ===== */
function u4B(st) {
  const rounds = [
    () => { const a = rand(18, 39), b = rand(12, 35), c = a + b; return { q: `小安原來有 ${a} 顆彈珠，又得到一些，現在有 ${c} 顆。要算得到幾顆，哪個算式對？`, vis: '<span style="font-size:52px">🔮</span>', opts: [{ h: `${c} − ${a} = □`, ok: true }, { h: `${c} + ${a} = □`, ok: false }, { h: `${a} − ${c} = □`, ok: false }], hint: '現在的 − 原來的 = 得到的！', after: `${c} − ${a} = ${b}，得到 ${b} 顆` }; },
    () => { const b = rand(12, 28), c = b + rand(3, 15); return { q: `籃子裡的蘋果吃掉 ${b} 個後，還剩 ${c} 個。原來有幾個？`, vis: '<span style="font-size:52px">🍎🧺</span>', opts: [{ h: `${c} + ${b} = □`, ok: true }, { h: `${c} − ${b} = □`, ok: false }, { h: `${b} − ${c} = □`, ok: false }], hint: '原來的 = 剩下的 + 吃掉的！', after: `${c} + ${b} = ${b + c}，原來有 ${b + c} 個` }; },
    () => { const a = rand(45, 80), b = rand(12, 30); return { q: `書架上有 ${a} 本書，借走一些後剩 ${a - b} 本。借走幾本？`, vis: '<span style="font-size:52px">📚</span>', opts: [{ h: `${a} − ${a - b} = □`, ok: true }, { h: `${a} + ${a - b} = □`, ok: false }, { h: `${a - b} − ${a} = □`, ok: false }], hint: '原來的 − 剩下的 = 借走的！', after: `${a} − ${a - b} = ${b}，借走 ${b} 本` }; },
    () => { const b = rand(13, 29), a = b + rand(5, 20); return { q: `□ − ${b} = ${a}，□ 要怎麼算？`, opts: [{ h: `${a} + ${b}`, ok: true }, { h: `${a} − ${b}`, ok: false }, { h: `${b} − ${a}`, ok: false }], hint: '減掉以後剩下的，加回減掉的，就是原來的！', after: `${a} + ${b} = ${a + b}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 4-C 解題和驗算 ===== */
function u4C(st) {
  const rounds = [
    () => { const b = rand(14, 38), c = b + rand(20, 50); return { q: `□ + ${b} = ${c}，□ 是多少？`, vis: `<span class="eq"><span class="box">?</span> + ${b} = ${c}</span>`, ans: c - b, hint: `用 ${c} − ${b} 算算看！`, after: `${c} − ${b} = ${c - b}` }; },
    () => { const a = rand(60, 95), x = rand(15, 45); return { q: `${a} − □ = ${a - x}，□ 是多少？`, vis: `<span class="eq">${a} − <span class="box">?</span> = ${a - x}</span>`, ans: x, hint: `用 ${a} − ${a - x} 算算看！`, after: `${a} − ${a - x} = ${x}` }; },
    () => { const b = rand(16, 34), c = rand(22, 50); return { q: `□ − ${b} = ${c}，□ 是多少？`, vis: `<span class="eq"><span class="box">?</span> − ${b} = ${c}</span>`, ans: b + c, hint: `用 ${c} + ${b} 算算看！`, after: `${c} + ${b} = ${b + c}` }; },
    () => { const a = rand(52, 94), b = rand(17, 39), d = a - b; return { q: `${a} − ${b} = ${d}，用哪一個算式<b>驗算</b>？`, sp: `${a} − ${b} = ${d}，用哪一個算式驗算？`, opts: [{ h: `${d} + ${b} = ${a}`, ok: true }, { h: `${d} − ${b} = ${d - b}`, ok: false }, { h: `${a} + ${b} = ${a + b}`, ok: false }], hint: '答案加回減掉的數，要等於原來的數！' }; },
    () => { const a = rand(36, 58), b = rand(25, 39), wrong = a + b - 10; return { q: `小明算 ${a} + ${b} = ${wrong}。用 ${wrong} − ${b} 驗算，結果是 ${wrong - b}，他算對了嗎？`, opts: [{ h: '算對了', ok: false }, { h: '算錯了', ok: true }], keep: true, hint: `${wrong - b} 跟 ${a} 不一樣，所以算錯了！`, after: `正確答案是 ${a + b}` }; },
    () => { const a = rand(25, 59), b = rand(15, 39), c = a + b + pick([-3, 0, 4]); return { q: `${a} + ${b} ○ ${c}，圈圈裡要放什麼？`, vis: `<span class="eq">${a} + ${b} <span class="box">?</span> ${c}</span>`, keep: true, opts: [{ h: '＞', ok: a + b > c }, { h: '＝', ok: a + b === c }, { h: '＜', ok: a + b < c }], hint: `先算 ${a} + ${b} 是多少！`, after: `${a} + ${b} = ${a + b}` }; },
    () => { const a = rand(61, 95), b = rand(18, 45), c = a - b + pick([-2, 0, 3]); return { q: `${a} − ${b} ○ ${c}，圈圈裡要放什麼？`, vis: `<span class="eq">${a} − ${b} <span class="box">?</span> ${c}</span>`, keep: true, opts: [{ h: '＞', ok: a - b > c }, { h: '＝', ok: a - b === c }, { h: '＜', ok: a - b < c }], hint: `先算 ${a} − ${b} 是多少！`, after: `${a} − ${b} = ${a - b}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 5-A 倒倒看：用杯子裝滿瓶子 ===== */
function u5A(st) {
  const kinds = shuffle(['tall', 'jar', 'wide']);
  const plans = [[{ k: kinds[0], n: rand(4, 6) }, { k: kinds[1], n: rand(7, 9) }], [{ k: kinds[2], n: rand(5, 8) }, { k: kinds[0], n: rand(5, 8) }]];
  if (plans[1][0].n === plans[1][1].n) plans[1][1].n++;
  plans.forEach(p => { if (Math.random() < .5) p.reverse(); });
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const ps = plans[r], cnt = [0, 0], names = ['甲', '乙'];
    api.say('點一下瓶子下面的「倒一杯」，把兩個瓶子都<b>裝滿</b>，數數看各倒了幾杯。', '點一下倒一杯，把兩個瓶子都裝滿，數數看各倒了幾杯。');
    st.innerHTML = `${dots(r, plans.length)}<div class="bottles">${ps.map((p, i) => `<div class="bcell" data-i="${i}"><div class="bname">${names[i]}</div><div class="bsvg">${bottleSVG(p.k, 0)}</div><div class="cups" id="cups${i}"></div><button type="button" class="btn blue pour" data-i="${i}">🥛 倒一杯</button></div>`).join('')}</div><div class="qvis" id="qv"></div><div class="opts" id="op"></div>`;
    $$('.pour', st).forEach(b => b.onclick = () => {
      const i = +b.dataset.i, p = ps[i];
      if (cnt[i] >= p.n) return toast('已經滿了！');
      cnt[i]++; sfx('pop');
      $(`.bcell[data-i="${i}"] .bsvg`, st).innerHTML = bottleSVG(p.k, cnt[i] / p.n * 100);
      $('#cups' + i, st).textContent = `${cnt[i]} 杯`;
      if (cnt[i] === p.n) { b.disabled = true; b.textContent = '裝滿了！'; speak(`${names[i]}裝了 ${p.n} 杯`); if (cnt[0] === ps[0].n && cnt[1] === ps[1].n) later(ask, 900); }
    });
    function ask() {
      const big = ps[0].n > ps[1].n ? 0 : 1;
      api.say('哪一個瓶子裝的水比較多？');
      [0, 1].forEach(i => $('#op', st).appendChild(optBtn({ h: `${names[i]}瓶`, ok: i === big }, () => {
        $('#qv', st).innerHTML = `<div class="after">${names[big]}裝 ${ps[big].n} 杯，比${names[1 - big]}多 ${Math.abs(ps[0].n - ps[1].n)} 杯</div>`;
        speak($('#qv .after', st).textContent); r++; later(round, 2600);
      }, '倒的杯數越多，裝的水越多！')));
    }
  }
  round();
}

/* ===== 5-B 比容量：直接比較、間接比較 ===== */
function u5B(st) {
  const rounds = [
    { q: '把甲瓶裝滿水倒進乙瓶，水<b>滿出來</b>了。哪一瓶裝得比較多？', sp: '把甲瓶裝滿水倒進乙瓶，水滿出來了。哪一瓶裝得比較多？', vis: `<div class="bottles sm"><div>甲${bottleSVG('tall', 100)}</div><span style="font-size:40px">➜</span><div>乙${bottleSVG('cup', 100)}<div style="font-size:30px">💦</div></div></div>`, keep: true, opts: [{ h: '甲瓶', ok: true }, { h: '乙瓶', ok: false }], hint: '倒不完會滿出來，表示原來的瓶子裝得比較多！' },
    { q: '把甲、乙兩瓶裝滿的水，分別倒進<b>一樣的</b>大杯子。哪一瓶裝得比較多？', sp: '把甲、乙兩瓶裝滿的水，分別倒進一樣的大杯子。哪一瓶裝得比較多？', vis: `<div class="bottles sm"><div>甲的水${bottleSVG('wide', 40)}</div><div>乙的水${bottleSVG('wide', 75)}</div></div>`, keep: true, opts: [{ h: '甲瓶', ok: false }, { h: '乙瓶', ok: true }], hint: '用一樣的杯子，水位越高，水越多！' },
    { q: '這兩個瓶子裝的水一樣高，裝的水一樣多嗎？', vis: `<div class="bottles sm"><div>${bottleSVG('cup', 60)}</div><div>${bottleSVG('wide', 60)}</div></div>`, keep: true, opts: [{ h: '一樣多', ok: false }, { h: '不一定一樣多', ok: true }], hint: '瓶子胖瘦不一樣，水一樣高也不一定一樣多！' },
    () => { const a = rand(4, 6), b = a + rand(2, 4); return { q: `用<b>大杯子</b>量甲瓶是 ${a} 杯，用<b>小杯子</b>量乙瓶是 ${b} 杯。可以說乙瓶裝得比較多嗎？`, sp: `用大杯子量甲瓶是 ${a} 杯，用小杯子量乙瓶是 ${b} 杯。可以說乙瓶裝得比較多嗎？`, keep: true, opts: [{ h: '可以', ok: false }, { h: '不可以', ok: true }], hint: '杯子大小不一樣，不能只比杯數！', after: '要用一樣的杯子量，才能比較' }; }
  ];
  quiz(st, rounds);
}

/* ===== 5-C 容量挑戰：用杯數比 ===== */
function u5C(st) {
  const rounds = [
    () => { const a = rand(8, 14), b = rand(3, 7); return { q: `用同樣的杯子量，水壺裝 ${a} 杯，水瓶裝 ${b} 杯，水壺比水瓶多裝幾杯？`, vis: '<span style="font-size:52px">🫖 🍼</span>', ans: a - b, unit: '杯', hint: '比多幾杯，用減法！', after: `${a} − ${b} = ${a - b}（杯）` }; },
    () => { const a = rand(6, 12), b = rand(5, 9); return { q: `把裝 ${a} 杯的水和裝 ${b} 杯的水一起倒進大水桶，一共幾杯？`, vis: '<span style="font-size:52px">🪣</span>', ans: a + b, unit: '杯', hint: '合在一起，用加法！', after: `${a} + ${b} = ${a + b}（杯）` }; },
    () => { const ns = shuffle([rand(3, 5), rand(6, 8), rand(9, 12)]), names = ['🫖 水壺', '🥤 水瓶', '🍲 湯鍋']; const mx = Math.max(...ns); return { q: `用同樣的杯子量：水壺 ${ns[0]} 杯、水瓶 ${ns[1]} 杯、湯鍋 ${ns[2]} 杯。哪一個裝得<b>最多</b>？`, sp: `用同樣的杯子量：水壺 ${ns[0]} 杯、水瓶 ${ns[1]} 杯、湯鍋 ${ns[2]} 杯。哪一個裝得最多？`, keep: true, opts: names.map((h, i) => ({ h, ok: ns[i] === mx })), hint: '杯數最多的裝得最多！' }; },
    () => { const s = rand(3, 4), b = s * 2; return { q: `同一個水瓶，用紅杯子量是 ${s} 杯，用藍杯子量是 ${b} 杯。哪一種杯子比較大？`, keep: true, opts: [{ h: '🟥 紅杯子', ok: true }, { h: '🟦 藍杯子', ok: false }], hint: '杯子越大，倒的杯數越少喔！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 6-A 公車上下車：兩步驟 ===== */
function u6A(st) {
  const plans = [[rand(8, 15), rand(4, 7), rand(3, 6)], [rand(10, 18), rand(3, 6), rand(4, 7)]];
  let r = 0;
  function round() {
    if (r >= plans.length) return api.finish();
    const [a, b, c] = plans[r]; let onBus = a, phase = 1, got = 0, off = 0;
    st.innerHTML = `${dots(r, plans.length)}<div class="bus"><div class="bus-top">🚌 公車上有 <b id="bn">${a}</b> 人</div><div class="seats" id="seats"></div></div><div class="stop" id="stop"></div><div class="qvis" id="qv"></div><div class="kwrap" id="kw"></div>`;
    const seats = $('#seats', st), stop = $('#stop', st);
    const person = () => { const p = document.createElement('button'); p.type = 'button'; p.className = 'pp'; p.textContent = pick(['🧑', '👧', '👦', '👩', '👴', '👵']); return p; };
    for (let i = 0; i < a; i++) seats.appendChild(person());
    api.say(`車站有 <b>${b}</b> 個人要<b>上車</b>，點他們上車！`, `車站有 ${b} 個人要上車，點他們上車！`);
    stop.innerHTML = '<span class="lbl">🚏 車站</span>';
    for (let i = 0; i < b; i++) { const p = person(); stop.appendChild(p); p.onclick = () => { if (phase !== 1) return; seats.appendChild(p); p.onclick = null; sfx('tap'); got++; onBus++; $('#bn', st).textContent = onBus; if (got === b) later(phase2, 700); }; }
    function phase2() {
      phase = 2; stop.innerHTML = '<span class="lbl">下車的人會站到這裡</span>';
      api.say(`到下一站，有 <b>${c}</b> 個人要<b>下車</b>，點車上的人下車！`, `到下一站，有 ${c} 個人要下車，點車上的人下車！`);
      $$('.pp', seats).forEach(p => p.onclick = () => { if (phase !== 2) return; stop.appendChild(p); p.onclick = null; sfx('tap'); off++; onBus--; $('#bn', st).textContent = onBus; if (off === c) later(ask, 700); });
    }
    function ask() {
      phase = 3; $('#bn', st).textContent = '?';
      api.say(`公車上原來有 ${a} 人，上車 ${b} 人，下車 ${c} 人。現在車上有幾人？`);
      keypad($('#kw', st), a + b - c, () => { $('#qv', st).innerHTML = `<div class="after">${a} + ${b} − ${c} = ${a + b - c}（人）</div>`; speak(`${a} 加 ${b} 減 ${c} 等於 ${a + b - c}`); r++; later(round, 2600); }, '先加上車的，再減下車的！', '人');
    }
  }
  round();
}

/* ===== 6-B 兩步驟想一想：選算式、三數相加 ===== */
function u6B(st) {
  const rounds = [
    () => { const a = rand(20, 35), b = rand(10, 20), c = rand(5, 15); return { q: `小玉有 ${a} 元，媽媽給她 ${b} 元，她買文具花了 ${c} 元。還剩幾元？哪個算式對？`, vis: '<span style="font-size:52px">👛</span>', opts: [{ h: `${a} + ${b} − ${c}`, ok: true }, { h: `${a} − ${b} + ${c}`, ok: false }, { h: `${a} + ${b} + ${c}`, ok: false }], hint: '給她是變多（加），花掉是變少（減）！', after: `${a} + ${b} − ${c} = ${a + b - c}（元）` }; },
    () => { const a = rand(40, 60), b = rand(8, 15), c = rand(8, 15); return { q: `樹上有 ${a} 隻鳥，先飛走 ${b} 隻，又飛走 ${c} 隻。還剩幾隻？哪個算式對？`, vis: '<span style="font-size:52px">🐦🌳</span>', opts: [{ h: `${a} − ${b} − ${c}`, ok: true }, { h: `${a} − ${b} + ${c}`, ok: false }, { h: `${a} + ${b} − ${c}`, ok: false }], hint: '飛走兩次，都要減！', after: `${a} − ${b} − ${c} = ${a - b - c}（隻）` }; },
    () => { const x = rand(2, 7) * 10 + pick([1, 2, 3, 4, 6, 7, 8, 9]), y = 10 - x % 10 + rand(1, 3) * 10; let m = rand(11, 29); while (m === x || m === y || (m + x) % 10 === 0 || (m + y) % 10 === 0) m++; return { q: `${x} + ${m} + ${y}，先算哪兩個數比較好算？`, opts: [{ h: `${x} + ${y}`, ok: true }, { h: `${x} + ${m}`, ok: false }, { h: `${m} + ${y}`, ok: false }], hint: '個位加起來剛好是 10 的，先加起來最好算！', after: `${x} + ${y} = ${x + y}，${x + y} + ${m} = ${x + y + m}` }; },
    () => { const a = rand(12, 30), b = rand(12, 30), c = rand(12, 30); return { q: `${a} + ${b} + ${c} 和 ${a} + ${c} + ${b}，答案一樣嗎？`, keep: true, opts: [{ h: '一樣', ok: true }, { h: '不一樣', ok: false }], hint: '三個數相加，換順序加，答案不變！', after: `都是 ${a + b + c}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 6-C 兩步驟挑戰 ===== */
function u6C(st) {
  const rounds = [
    () => { const a = rand(15, 30), b = rand(12, 25), c = rand(10, 20); return { q: `一年級種了 ${a} 棵樹，二年級種了 ${b} 棵，三年級種了 ${c} 棵。一共種了幾棵？`, vis: '<span style="font-size:52px">🌳</span>', ans: a + b + c, unit: '棵', hint: '三個數加起來，可以一個一個加！', after: `${a} + ${b} + ${c} = ${a + b + c}（棵）` }; },
    () => { const a = rand(60, 90), b = rand(12, 25), c = rand(10, 20); return { q: `圖書館有 ${a} 本書，借出 ${b} 本，又借出 ${c} 本。還剩幾本？`, vis: '<span style="font-size:52px">📖</span>', ans: a - b - c, unit: '本', hint: '借出兩次，連續減！', after: `${a} − ${b} − ${c} = ${a - b - c}（本）` }; },
    () => { const a = rand(30, 50), b = rand(15, 25), c = rand(10, 30); return { q: `停車場有 ${a} 輛車，開走 ${b} 輛，又開進來 ${c} 輛。現在有幾輛？`, vis: '<span style="font-size:52px">🚗🅿️</span>', ans: a - b + c, unit: '輛', hint: '開走是減，開進來是加！', after: `${a} − ${b} + ${c} = ${a - b + c}（輛）` }; },
    () => { const a = rand(25, 40), d = rand(8, 15), b = a - d; return { q: `哥哥有 ${a} 張卡片，弟弟比哥哥少 ${d} 張。兩人一共有幾張？`, vis: '<span style="font-size:52px">🃏</span>', ans: a + b, unit: '張', hint: `先算弟弟有 ${a} − ${d} 張，再把兩人加起來！`, after: `弟弟 ${a} − ${d} = ${b}，${a} + ${b} = ${a + b}（張）` }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u4: [u4A, u4B, u4C], u5: [u5A, u5B, u5C], u6: [u6A, u6B, u6C] });
