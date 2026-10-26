'use strict';
/* 第 1 單元 除法／第 2 單元 找規律／第 3 單元 時間／第 4 單元 兩步驟的計算／第 5 單元 面積 */

/* ===== 1-A 寶石平分裝箱 ===== */
function u1A(st) {
  const tasks = shuffle([[17, 3], [26, 4], [23, 5], [30, 7], [19, 2]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [n, k] = tasks[r], box = Array(k).fill(0);
    let pile = n;
    api.say(`把 <b>${n}</b> 顆寶石<b>平分</b>到 ${k} 個寶箱。點寶箱放 1 顆，或按「每箱放 1 顆」。不夠分了就按「分好了」。`, `把${n}顆寶石平分到${k}個寶箱，不夠分了就按分好了`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="pile" id="pile"></div><div class="chests">${box.map((_, i) => `<button type="button" class="chest" data-i="${i}"><span class="cnt">0 顆</span><span class="gems"></span></button>`).join('')}</div>
      <div class="center"><button class="btn teal" id="each" type="button">每箱放 1 顆</button> <button class="btn ghost" id="redo" type="button">重來</button> <button class="btn coral" id="done" type="button">分好了！</button></div>`;
    const draw = () => {
      $('#pile', st).innerHTML = pile ? '💎'.repeat(pile) : '<span class="note">沒有寶石了</span>';
      $$('.chest', st).forEach((c, i) => { $('.cnt', c).textContent = `${box[i]} 顆`; $('.gems', c).textContent = '💎'.repeat(box[i]); });
    };
    $$('.chest', st).forEach(c => c.onclick = () => { if (!pile) return; pile--; box[+c.dataset.i]++; sfx('pop'); draw(); });
    $('#each', st).onclick = () => { if (pile < k) { toast(`剩 ${pile} 顆，不夠每箱放 1 顆了！`); return; } box.forEach((_, i) => box[i]++); pile -= k; sfx('pop'); draw(); };
    $('#redo', st).onclick = () => { box.fill(0); pile = n; draw(); };
    $('#done', st).onclick = () => {
      if (box.some(b => b !== box[0])) return api.bad('每個寶箱要一樣多才是平分喔！');
      if (pile >= k) return api.bad(`還剩 ${pile} 顆，還可以每箱再放 1 顆！`);
      sfx('ok');
      const q = Math.floor(n / k), rem = n % k;
      $('.center', st).innerHTML = '';
      api.say(`分好了！${n} ÷ ${k} ＝ ? … ?，每箱幾顆？剩下幾顆？`, `${n}除以${k}，每箱幾顆，剩下幾顆`);
      const kw = document.createElement('div'); kw.className = 'kwrap'; st.appendChild(kw);
      keypad2(kw, ['顆（每箱）', '顆（剩下）'], [q, rem], () => {
        toast(`${n} ÷ ${k} ＝ ${q} … ${rem}`); speak(`${n}除以${k}等於${q}餘${rem}`); r++; later(round, 2000);
      }, '數一數每個寶箱和桌上剩下的寶石！');
    };
    draw();
  }
  round();
}

/* ===== 1-B 直式除法與餘數 ===== */
function u1B(st) {
  quiz(st, [
    () => { const b = rand(2, 4), q = rand(11, Math.floor(99 / b)), a = b * q; return { q: `用直式算：${a} ÷ ${b} ＝ ?`, vis: longDivHTML(a, b, '?'), ans: q, hint: '先分十位，再分個位！', after: `${a} ÷ ${b} ＝ ${q}` }; },
    () => { const b = rand(3, 9), q = rand(10, Math.floor(98 / b)), rm = rand(1, b - 1), a = b * q + rm; return a > 99 ? { q: `用直式算：${a - b} ÷ ${b} ＝ ? … ?`, vis: longDivHTML(a - b, b, '?'), ans2: [q - 1, rm], labels: ['商', '餘數'], hint: '餘數一定要比除數小！', after: `${a - b} ÷ ${b} ＝ ${q - 1} … ${rm}` } : { q: `用直式算：${a} ÷ ${b} ＝ ? … ?`, vis: longDivHTML(a, b, '?'), ans2: [q, rm], labels: ['商', '餘數'], hint: '餘數一定要比除數小！', after: `${a} ÷ ${b} ＝ ${q} … ${rm}` }; },
    () => { const b = rand(2, 4), q = rand(100, Math.floor(990 / b)), rm = rand(0, b - 1), a = b * q + rm; return { q: `三位數除以一位數：${a} ÷ ${b} ＝ ? … ?`, vis: longDivHTML(a, b, '?'), ans2: [q, rm], labels: ['商', '餘數'], hint: '從百位開始分，分不完的換成十再分。', after: `${a} ÷ ${b} ＝ ${q} … ${rm}` }; },
    () => { let a, b, q, rm; do { b = rand(5, 9); q = rand(12, 99); rm = rand(0, b - 1); a = b * q + rm; } while (a < 100 || a > 999 || Math.floor(a / 100) >= b); return { q: `${a} ÷ ${b} ＝ ? … ?（百位不夠分喔）`, vis: longDivHTML(a, b, '?'), ans2: [q, rm], labels: ['商', '餘數'], hint: `${Math.floor(a / 100)} 個百不夠分給 ${b}，先把前兩位 ${Math.floor(a / 10)} 個十拿來分。`, after: `${a} ÷ ${b} ＝ ${q} … ${rm}` }; },
    () => { const b = rand(4, 9), big = Math.random() < 0.5; let a; do { a = rand(100, 999); } while (big ? Math.floor(a / 100) < b : Math.floor(a / 100) >= b); return { q: `${a} ÷ ${b}，商是幾位數？`, vis: longDivHTML(a, b, '?'), opts: [{ h: '三位數', ok: big }, { h: '二位數', ok: !big }], keep: true, hint: `看百位的 ${Math.floor(a / 100)} 夠不夠分給 ${b}。`, after: big ? `百位 ${Math.floor(a / 100)} ≥ ${b}，商是三位數` : `百位 ${Math.floor(a / 100)} ＜ ${b}，商是二位數` }; },
    () => { const b = rand(4, 9); return { q: `除數是 ${b}，餘數最大可能是多少？`, ans: b - 1, hint: '餘數要比除數小！', after: `餘數最大是 ${b - 1}` }; },
    () => { const b = rand(4, 8), q = rand(5, 9), rm = b + rand(0, 1); const a = b * q + rm; return { q: `小海豚算 ${a} ÷ ${b} ＝ ${q} … ${rm}，對嗎？`, opts: [{ h: '<span class="small-opt">不對，餘數比除數大，還能再分</span>', ok: true }, { h: '<span class="small-opt">對，算得很好</span>', ok: false }], keep: true, after: `${a} ÷ ${b} ＝ ${q + 1} … ${rm - b}` }; }
  ]);
}

/* ===== 1-C 餘數應用與估算 ===== */
function u1C(st) {
  quiz(st, shuffle([
    () => { const k = rand(4, 8), n = k * rand(3, 9) + rand(1, k - 1); const ans = Math.ceil(n / k); return { q: `${n} 位潛水員要搭小艇，每艘最多坐 ${k} 人，至少要幾艘小艇？`, ans, unit: '艘', hint: '剩下的人也要坐船，商要再加 1！', after: `${n} ÷ ${k} ＝ ${Math.floor(n / k)} … ${n % k}，${Math.floor(n / k)} ＋ 1 ＝ ${ans} 艘` }; },
    () => { const k = rand(6, 9), n = k * rand(4, 9) + rand(1, k - 1); const ans = Math.floor(n / k); return { q: `一個貝殼吊飾 ${k} 元，小美有 ${n} 元，最多可以買幾個？`, ans, unit: '個', hint: '剩下的錢不夠再買一個，商不用加 1。', after: `${n} ÷ ${k} ＝ ${ans} … ${n % k}，最多買 ${ans} 個` }; },
    () => { const k = rand(6, 9), q = rand(12, 40), rm = rand(1, k - 1), n = k * q + rm; return { q: `${n} 顆珍珠，每盒裝 ${k} 顆，可以裝滿幾盒？還剩幾顆？`, ans2: [q, rm], labels: ['盒', '顆（剩）'], hint: '用除法算，剩下的就是餘數！', after: `${n} ÷ ${k} ＝ ${q} … ${rm}` }; },
    () => { const k = rand(3, 5), pages = k * rand(8, 18) + rand(1, k - 1), d = Math.ceil(pages / k); return { q: `一本海洋圖鑑有 ${pages} 頁，每天看 ${k} 頁，至少要幾天才能看完？`, ans: d, unit: '天', hint: '最後剩下的幾頁也要再看一天！', after: `${pages} ÷ ${k} ＝ ${Math.floor(pages / k)} … ${pages % k}，要 ${d} 天` }; },
    () => { const b = rand(2, 4), Q = rand(1, Math.floor(9 / b)) * 100; let e; do { e = rand(-6, 6); } while (!e); const a = Q * b + e; return { q: `估一估：${a} ÷ ${b} 的商大約是多少？`, sp: `估一估，${a}除以${b}的商大約是多少`, opts: [{ h: N(Q), ok: true }, { h: N(Q / 10), ok: false }, { h: N(Q + 100), ok: false }], hint: `把 ${a} 看成 ${Q * b} 來算！`, after: `${a} 看成 ${Q * b}，${Q * b} ÷ ${b} ＝ ${Q}，商大約是 ${Q}` }; },
    () => { let b, Q; do { b = rand(3, 9); Q = rand(2, 9) * 10; } while (Q * b < 100 || Q * b > 900); let e; do { e = rand(-3, 3); } while (!e); const a = Q * b + e; return { q: `估一估：${a} ÷ ${b} 的商大約是多少？`, sp: `估一估，${a}除以${b}的商大約是多少`, opts: [{ h: N(Q), ok: true }, { h: N(Q * 10), ok: false }, { h: N(Q + 10), ok: false }], hint: `把 ${a} 看成 ${Q * b} 來算！`, after: `${a} 看成 ${Q * b}，${Q * b} ÷ ${b} ＝ ${Q}，商大約是 ${Q}` }; }
  ]));
}

/* ===== 2-A 排出下一個圖形 ===== */
const SEA = ['🐟', '🐠', '🐡', '🦀', '🐚', '⭐', '🐙', '🦐'];
const PAT = ['AB', 'ABC', 'AAB', 'ABB', 'ABCC', 'AABB'];
function makePattern(type) {
  const syms = shuffle(SEA).slice(0, 4), map = {};
  [...new Set(type)].forEach((c, i) => map[c] = syms[i]);
  return { unit: [...type].map(c => map[c]), syms: [...new Set(type)].map(c => map[c]), spare: syms[3] };
}
function u2A(st) {
  const types = shuffle(PAT).slice(0, 5);
  let r = 0;
  function round() {
    if (r >= types.length) return api.finish();
    const p = makePattern(types[r]), L = Math.max(8, p.unit.length * 2 + 2);
    const seq = Array.from({ length: L }, (_, i) => p.unit[i % p.unit.length]);
    const blank = r < 2 ? L - 1 : rand(Math.floor(L / 2), L - 1);
    const ans = seq[blank];
    api.say(r < 2 ? '找出規律，把正確的海洋生物<b>拖進</b>空格（也可以直接點）！' : '空格在中間喔！找出規律再拖進去。', '找出規律，把正確的海洋生物拖進空格');
    st.innerHTML = `${dots(r, types.length)}<div class="seq">${seq.map((s, i) => `<div class="cell${i === blank ? ' blank' : ''}">${i === blank ? '?' : s}</div>`).join('')}</div><div class="palette">${shuffle([...p.syms, p.spare]).map(s => `<button type="button" class="opt" data-s="${s}">${s}</button>`).join('')}</div>`;
    const hole = $('.blank', st); let done = false;
    $$('.palette .opt', st).forEach(b => draggable(b, [hole], hit => {
      if (done || !hit) return;
      if (b.dataset.s === ans) { done = true; hole.textContent = ans; hole.classList.remove('blank'); b.classList.add('right'); api.ok(`對！規律是 ${p.unit.join('')}`); r++; later(round, 1500); }
      else { b.classList.add('wrong'); api.bad(`看看 ${p.unit.length} 個一組，一直重複喔！`); }
    }));
  }
  round();
}

/* ===== 2-B 數的規律 ===== */
function u2B(st) {
  const arith = (up) => () => {
    const d = pick(up ? [3, 4, 5, 6, 7, 8, 9, 25, 50, 100] : [2, 3, 4, 5, 6, 7, 9, 10, 50]);
    const a0 = up ? rand(1, 60) : rand(d * 6, d * 6 + 200);
    const seq = Array.from({ length: 6 }, (_, i) => up ? a0 + d * i : a0 - d * i);
    const bi = rand(3, 5);
    return { q: `找規律：數字每次${up ? '多' : '少'}多少？空格是多少？`, vis: `<div class="seq">${seq.map((v, i) => `<div class="cell${i === bi ? ' blank' : ''}" style="width:auto;padding:0 10px;font-size:26px">${i === bi ? '?' : v}</div>`).join('')}</div>`, ans: seq[bi], hint: `相鄰兩個數相差 ${d}！`, after: `每次${up ? '加' : '減'} ${d}` };
  };
  quiz(st, [
    arith(true), arith(false), arith(true),
    () => { const p = makePattern(pick(['ABC', 'AB', 'ABCD'.slice(0, 3)])), n = rand(10, 20), ans = p.unit[(n - 1) % p.unit.length]; return { q: `照這樣排下去，第 <b>${n}</b> 個是什麼？`, vis: `<div class="seq">${[...p.unit, ...p.unit].map(s => `<div class="cell">${s}</div>`).join('')}<span>……</span></div>`, opts: p.syms.map(s => ({ h: `<span style="font-size:34px">${s}</span>`, ok: s === ans })), hint: `${p.unit.length} 個一組，想想 ${n} 是第幾組的第幾個。`, after: `${n} ÷ ${p.unit.length} ＝ ${Math.floor(n / p.unit.length)} … ${n % p.unit.length}，是 ${ans}` }; },
    () => { const s = rand(2, 9), d = 10, seq = [s, s + d, s + 2 * d, s + 3 * d]; return { q: `百數表上，從 ${s} 往下一格一格走：${seq.join('、')}，再往下一格是多少？`, ans: s + 4 * d, hint: '百數表往下一格就是加 10！', after: `${seq[3]} ＋ 10 ＝ ${s + 40}` }; }
  ]);
}

/* ===== 2-C 數量關係的規律 ===== */
function u2C(st) {
  const rel = [
    { t: '🐙 章魚的隻數和腳的數量', a: '章魚（隻）', b: '腳（隻）', f: n => 8 * n, h: '每多 1 隻章魚，就多 8 隻腳。' },
    { t: '🪵 用小棒排一排正方形', a: '正方形（個）', b: '小棒（根）', f: n => 3 * n + 1, h: '第一個用 4 根，之後每多 1 個正方形只要多 3 根。' },
    { t: '🔺 用小棒排一排三角形', a: '三角形（個）', b: '小棒（根）', f: n => 2 * n + 1, h: '第一個用 3 根，之後每多 1 個三角形只要多 2 根。' },
    { t: '🪑 長桌排成一長排，旁邊坐人', a: '桌子（張）', b: '座位（個）', f: n => 2 * n + 2, h: '每多 1 張桌子，就多 2 個座位。' },
    { t: '🦀 螃蟹的隻數和腳的數量', a: '螃蟹（隻）', b: '腳（隻）', f: n => 10 * n, h: '每多 1 隻螃蟹，就多 10 隻腳。' },
    { t: '🎫 買海洋館門票，一張 35 元', a: '門票（張）', b: '錢（元）', f: n => 35 * n, h: '每多 1 張，就多 35 元。' }
  ];
  quiz(st, shuffle(rel).slice(0, 5).map(R => () => {
    const n = rand(5, 9);
    return { q: `${R.t}：看表格找規律，${n} 的時候是多少？`, vis: tableHTML([R.a, '1', '2', '3', '4', String(n)], [[R.b, R.f(1), R.f(2), R.f(3), R.f(4), '?']]), ans: R.f(n), hint: R.h, after: `${n} 的時候是 ${R.f(n)}` };
  }));
}

/* ===== 3-A 24 時制撥鐘 ===== */
function u3A(st) {
  const tasks = shuffle([[rand(13, 17), 5 * rand(1, 11)], [rand(18, 22), 5 * rand(0, 11)], [rand(7, 11), 5 * rand(1, 11)], [rand(13, 22), 5 * rand(0, 11)]]);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [H, M] = tasks[r];
    if (r % 2 === 1) {
      api.say(`現在是<b>${H < 12 ? '上午' : H < 18 ? '下午' : '晚上'}</b>，鐘面上的時間用 24 時制怎麼說？`, `現在是${H < 12 ? '上午' : H < 18 ? '下午' : '晚上'}，用24時制怎麼說`);
      st.innerHTML = `${dots(r, tasks.length)}<div class="qvis">${clockSVG(H, M)}<div class="tline">${H < 12 ? '☀️ 上午' : H < 18 ? '🌤 下午' : '🌙 晚上'}</div></div><div class="kwrap"></div>`;
      return keypad2($('.kwrap', st), ['時', '分'], [H, M], () => { toast(`${t12(H, M)} ＝ ${t24(H, M)}`); speak(`${t24(H, M)}`); r++; later(round, 1800); }, H >= 12 ? '下午和晚上的時，要加 12！' : '上午的時不用改。');
    }
    let h = 12, m = 0, pm = false;
    api.say(`把時鐘撥到 <b class="big">${t24(H, M)}</b>，再選上午或下午。`, `把時鐘撥到${t24(H, M)}，再選上午或下午`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="clockbox"><div id="clk"></div><div class="clockctl">
      <div class="row">時 <button type="button" data-a="h-">－</button><button type="button" data-a="h+">＋</button></div>
      <div class="row">分 <button type="button" data-a="m-">－5</button><button type="button" data-a="m+">＋5</button></div>
      <div class="row ampm"><button type="button" data-p="0">上午</button><button type="button" data-p="1">下午、晚上</button></div>
      <div class="readout" id="ro"></div><button class="btn coral" id="okb" type="button">撥好了！</button></div></div>`;
    const draw = () => { $('#clk', st).innerHTML = clockSVG(h, m); $('#ro', st).textContent = `${pm ? '下午' : '上午'} ${h} 時 ${pad2(m)} 分`; $$('.ampm button', st).forEach(b => b.classList.toggle('on', +b.dataset.p === +pm)); };
    $$('.clockctl [data-a]', st).forEach(b => b.onclick = () => { const a = b.dataset.a; sfx('tap'); if (a === 'h+') h = h % 12 + 1; if (a === 'h-') h = (h + 10) % 12 + 1; if (a === 'm+') m = (m + 5) % 60; if (a === 'm-') m = (m + 55) % 60; draw(); });
    $$('.ampm button', st).forEach(b => b.onclick = () => { pm = b.dataset.p === '1'; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const h24 = pm ? (h % 12) + 12 : h % 12;
      if (h24 === H && m === M) { $('#okb', st).disabled = true; api.ok(`對！${t24(H, M)} 就是 ${t12(H, M)}`); speak(`${t24(H, M)}就是${t12(H, M)}`); r++; later(round, 2000); }
      else if (m !== M) api.bad('長針（分針）的位置不對喔！');
      else if (h % 12 !== H % 12) api.bad(H > 12 ? `${H} 時要減 12，是 ${H - 12} 時！` : '短針（時針）的位置不對喔！');
      else api.bad(H >= 12 ? '超過 12 時是下午或晚上喔！' : '小於 12 時是上午喔！');
    };
    draw();
  }
  round();
}

/* ===== 3-B 日、時、分、秒 ===== */
function u3B(st) {
  quiz(st, [
    () => { const d = rand(2, 3); return { q: `${d} 日是幾小時？`, ans: 24 * d, unit: '時', hint: '1 日 ＝ 24 時！', after: `${d} 日 ＝ ${24 * d} 時` }; },
    () => { const z = rand(26, 47); return { q: `${z} 時是幾日幾時？`, ans2: [1, z - 24], labels: ['日', '時'], hint: '24 時是 1 日！', after: `${z} 時 ＝ 1 日 ${z - 24} 時` }; },
    () => { const x = rand(1, 3), y = 5 * rand(1, 11); return { q: `${x} 時 ${y} 分是幾分鐘？`, ans: 60 * x + y, unit: '分', hint: '1 時 ＝ 60 分！', after: `${x} 時 ${y} 分 ＝ ${60 * x + y} 分` }; },
    () => { const z = rand(65, 200); return { q: `${z} 分是幾時幾分？`, ans2: [Math.floor(z / 60), z % 60], labels: ['時', '分'], hint: '60 分是 1 時，看看有幾個 60。', after: `${z} 分 ＝ ${Math.floor(z / 60)} 時 ${z % 60} 分` }; },
    () => { const x = rand(1, 3), y = rand(5, 55); return { q: `${x} 分 ${y} 秒是幾秒？`, ans: 60 * x + y, unit: '秒', hint: '1 分 ＝ 60 秒！', after: `${x} 分 ${y} 秒 ＝ ${60 * x + y} 秒` }; },
    () => { const z = rand(65, 190); return { q: `海豚憋氣 ${z} 秒，是幾分幾秒？`, ans2: [Math.floor(z / 60), z % 60], labels: ['分', '秒'], hint: '60 秒是 1 分！', after: `${z} 秒 ＝ ${Math.floor(z / 60)} 分 ${z % 60} 秒` }; },
    () => pick([
      { q: '秒針走 1 圈，是多久？', opts: [{ h: '1 分', ok: true }, { h: '1 秒', ok: false }, { h: '1 時', ok: false }], hint: '秒針走一圈是 60 秒。' },
      { q: '分針（長針）走 1 圈，是多久？', opts: [{ h: '1 時', ok: true }, { h: '1 分', ok: false }, { h: '1 日', ok: false }], hint: '長針走一圈是 60 分。' },
      { q: '時針（短針）從半夜 0 時走到第二天 0 時，走了幾圈？', opts: [{ h: '2 圈', ok: true }, { h: '1 圈', ok: false }, { h: '24 圈', ok: false }], hint: '一天有 24 時，時針走 1 圈是 12 時。' }
    ])
  ]);
}

/* ===== 3-C 時間的計算 ===== */
function u3C(st) {
  quiz(st, shuffle([
    () => { const a = rand(1, 3), b = rand(25, 55), c = rand(1, 2), d = rand(60 - b + 1, 55); const t = a * 60 + b + c * 60 + d; return { q: `潛水艇先開了 ${a} 時 ${b} 分，又開了 ${c} 時 ${d} 分，一共開了幾時幾分？`, ans2: [Math.floor(t / 60), t % 60], labels: ['時', '分'], hint: '分加起來滿 60，要進位成 1 時！', after: `${a} 時 ${b} 分 ＋ ${c} 時 ${d} 分 ＝ ${Math.floor(t / 60)} 時 ${t % 60} 分` }; },
    () => { const a = rand(3, 6), b = rand(5, 30), c = rand(1, a - 1), d = rand(b + 5, 55); const t = a * 60 + b - (c * 60 + d); return { q: `${a} 時 ${b} 分 − ${c} 時 ${d} 分 ＝ ? 時 ? 分`, ans2: [Math.floor(t / 60), t % 60], labels: ['時', '分'], hint: '分不夠減，跟時借 1 時（60 分）！', after: `答案是 ${Math.floor(t / 60)} 時 ${t % 60} 分` }; },
    () => { const h1 = rand(8, 14), m1 = 5 * rand(6, 11), dur = rand(70, 170); const e = h1 * 60 + m1 + dur; const h2 = Math.floor(e / 60), m2 = e % 60; return { q: `海洋館表演從 ${t24(h1, m1)} 開始，到 ${t24(h2, m2)} 結束，一共經過幾時幾分？`, ans2: [Math.floor(dur / 60), dur % 60], labels: ['時', '分'], hint: '先算到整點，再算剩下的！', after: `經過 ${Math.floor(dur / 60)} 時 ${dur % 60} 分` }; },
    () => { const h1 = rand(13, 17), m1 = 5 * rand(4, 11), dh = rand(1, 3), dm = 5 * rand(3, 9); const e = h1 * 60 + m1 + dh * 60 + dm; return { q: `船在 ${t24(h1, m1)} 出發，開了 ${dh} 時 ${dm} 分到達小島，到達時是幾時幾分？（24 時制）`, ans2: [Math.floor(e / 60), e % 60], labels: ['時', '分'], hint: '時加時、分加分，分滿 60 進位！', after: `到達時是 ${t24(Math.floor(e / 60), e % 60)}` }; },
    () => { const a = rand(1, 2), b = rand(30, 55), c = rand(1, 2), d = rand(60 - b, 55); const t = a * 60 + b + c * 60 + d; return { q: `小海龜游了 ${a} 分 ${b} 秒，又游了 ${c} 分 ${d} 秒，一共游了幾分幾秒？`, ans2: [Math.floor(t / 60), t % 60], labels: ['分', '秒'], hint: '秒加起來滿 60，要進位成 1 分！', after: `一共 ${Math.floor(t / 60)} 分 ${t % 60} 秒` }; },
    () => { const a = rand(10, 20), b = rand(26 - a > 5 ? 26 - a : 6, 20); const t = a + b; return { q: `探險隊先在海底待了 1 日 ${a} 時，又待了 ${b} 時，一共待了幾日幾時？`, ans2: [1 + Math.floor(t / 24), t % 24], labels: ['日', '時'], hint: '時加起來滿 24，要進位成 1 日！', after: `一共 ${1 + Math.floor(t / 24)} 日 ${t % 24} 時` }; }
  ]));
}

/* ===== 4-A 兩步驟的乘法（一步一步算） ===== */
function u4A(st) {
  const items = [['珍珠', '顆', '盒', '箱'], ['海星貼紙', '張', '包', '袋'], ['魚飼料', '包', '盒', '箱'], ['貝殼', '個', '串', '籃']];
  const tasks = shuffle(items).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [it, u1, u2, u3] = tasks[r];
    let a, b, c; do { a = rand(3, 9); b = rand(2, 8); c = rand(2, 6); } while (a * b * c > 400);
    const q = `一${u2}有 ${a} ${u1}${it}，一${u3}裝 ${b} ${u2}，${c} ${u3}共有幾${u1}${it}？`;
    api.say(`${q}<br>第 1 步：先算什麼？`, `${q}第一步先算什麼`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="qvis">${Array.from({ length: Math.min(c, 4) }, () => `<span style="display:inline-block;border:3px solid #b07a3c;border-radius:12px;padding:4px;margin:4px">${'📦'.repeat(b)}</span>`).join('')}${c > 4 ? '……' : ''}</div><div class="opts"></div>`;
    const ops = $('.opts', st);
    const step2 = (first, v) => {
      const sec = first === 'ab' ? `${v} × ${c}` : `${a} × ${v}`;
      api.say(`第 1 步：${first === 'ab' ? `${a} × ${b} ＝ ${v}（一${u3}有幾${u1}）` : `${b} × ${c} ＝ ${v}（共有幾${u2}）`}<br>第 2 步：${sec} ＝ ?`, `第二步，${sec}等於多少`);
      ops.className = 'kwrap'; ops.innerHTML = '';
      keypad(ops, a * b * c, () => { toast(`共有 ${a * b * c} ${u1}`); r++; later(round, 1600); }, '用第 1 步的答案再乘一次！', u1);
    };
    const step1 = first => {
      const v = first === 'ab' ? a * b : b * c;
      api.say(`${first === 'ab' ? `${a} × ${b}` : `${b} × ${c}`} ＝ ?`);
      ops.className = 'kwrap'; ops.innerHTML = '';
      keypad(ops, v, () => later(() => step2(first, v), 700), '用九九乘法想一想！');
    };
    shuffle([
      { h: `${a} × ${b}<br><small>先算一${u3}有幾${u1}</small>`, ok: true, k: 'ab' },
      { h: `${b} × ${c}<br><small>先算共有幾${u2}</small>`, ok: true, k: 'bc' },
      { h: `${a} ＋ ${b}`, ok: false }
    ]).forEach(o => ops.appendChild(optBtn(o, () => later(() => step1(o.k), 500), '一盒一盒一樣多，要用乘法！')));
  }
  round();
}

/* ===== 4-B 倍的計算 ===== */
function u4B(st) {
  quiz(st, shuffle([
    () => { const a = rand(12, 48), b = rand(3, 9); return { q: `小丑魚有 ${a} 條，神仙魚的條數是小丑魚的 ${b} 倍，神仙魚有幾條？`, ans: a * b, unit: '條', hint: `${a} 的 ${b} 倍就是 ${a} × ${b}。`, after: `${a} × ${b} ＝ ${a * b}` }; },
    () => { const a = rand(3, 9), b = rand(2, 5), c = rand(2, 4); return { q: `海星有 ${a} 顆，海膽是海星的 ${b} 倍，貝殼又是海膽的 ${c} 倍，貝殼有幾個？`, ans: a * b * c, unit: '個', hint: `先算海膽 ${a} × ${b}，再乘 ${c}。`, after: `${a} × ${b} ＝ ${a * b}，${a * b} × ${c} ＝ ${a * b * c}` }; },
    () => { const b = rand(3, 9), x = rand(4, 12); return { q: `珊瑚有 ${x * b} 株，是海葵的 ${b} 倍，海葵有幾株？`, ans: x, unit: '株', hint: `海葵的 ${b} 倍是 ${x * b}，用除法算。`, after: `${x * b} ÷ ${b} ＝ ${x}` }; },
    () => { const a = rand(6, 25), b = rand(2, 5); return { q: `弟弟撿了 ${a} 個貝殼，哥哥撿的是弟弟的 ${b} 倍，兩人一共撿了幾個？`, ans: a + a * b, unit: '個', hint: '先算哥哥撿幾個，再加起來！', after: `${a} × ${b} ＝ ${a * b}，${a} ＋ ${a * b} ＝ ${a + a * b}` }; },
    () => { const a = rand(15, 60), b = rand(2, 6); return { q: `一隻海豚重 ${a} 公斤，一隻小鯨魚的重量是海豚的 ${b} 倍，小鯨魚比海豚重多少公斤？`, ans: a * b - a, unit: '公斤', hint: '先算小鯨魚多重，再減海豚的重量。', after: `${a} × ${b} ＝ ${a * b}，${a * b} − ${a} ＝ ${a * b - a}` }; },
    () => { const a = rand(5, 9), b = rand(2, 4); return { q: `紅色魚缸有 ${a} 條魚，藍色魚缸是紅色的 ${b} 倍，綠色魚缸又是藍色的 2 倍。綠色魚缸是紅色魚缸的幾倍？`, ans: b * 2, unit: '倍', hint: `${b} 倍的 2 倍，就是 ${b} × 2 倍。`, after: `${b} × 2 ＝ ${b * 2}，是 ${b * 2} 倍` }; }
  ]).slice(0, 5));
}

/* ===== 4-C 加除、減除問題 ===== */
function u4C(st) {
  quiz(st, shuffle([
    () => { const k = rand(3, 6), t = k * rand(8, 20), x = rand(Math.floor(t / 3), Math.floor(t * 2 / 3)), y = t - x; return { q: `哥哥有 ${x} 元，妹妹有 ${y} 元，把錢合起來平分給 ${k} 人，每人分到幾元？`, ans: t / k, unit: '元', hint: `先加：${x} ＋ ${y}，再除以 ${k}。`, after: `${x} ＋ ${y} ＝ ${t}，${t} ÷ ${k} ＝ ${t / k}` }; },
    () => { const k = rand(4, 8), left = k * rand(5, 12), e = rand(5, 30), n = left + e; return { q: `船上有 ${n} 條魚，賣掉 ${e} 條，剩下的每 ${k} 條裝一袋，可以裝幾袋？`, ans: left / k, unit: '袋', hint: `先減：${n} − ${e}，再除以 ${k}。`, after: `${n} − ${e} ＝ ${left}，${left} ÷ ${k} ＝ ${left / k}` }; },
    () => { const k = rand(3, 8), n = k * rand(6, 15), e = rand(3, 12); return { q: `${n} 顆糖果平分給 ${k} 位潛水員，老師又多給每人 ${e} 顆，每人一共有幾顆？`, ans: n / k + e, unit: '顆', hint: '先平分，再加上多給的！', after: `${n} ÷ ${k} ＝ ${n / k}，${n / k} ＋ ${e} ＝ ${n / k + e}` }; },
    () => { const k = rand(3, 7), n = k * rand(8, 16), e = rand(2, 6); return { q: `${n} 公尺的繩子平分成 ${k} 段，每段再剪掉 ${e} 公尺，每段剩下幾公尺？`, ans: n / k - e, unit: '公尺', hint: '先平分，再減掉剪掉的。', after: `${n} ÷ ${k} ＝ ${n / k}，${n / k} − ${e} ＝ ${n / k - e}` }; },
    () => { const k = rand(3, 6), t = k * rand(6, 15), x = rand(10, t - 10), y = t - x; return { q: `上午撿 ${x} 個貝殼，下午撿 ${y} 個，全部平分裝成 ${k} 籃，要先算什麼？`, opts: [{ h: `先算 ${x} ＋ ${y}`, ok: true }, { h: `先算 ${y} ÷ ${k}`, ok: false }, { h: `先算 ${x} × ${k}`, ok: false }], hint: '要先知道全部有幾個，才能平分！', after: `${x} ＋ ${y} ＝ ${t}，${t} ÷ ${k} ＝ ${t / k}` }; },
    () => { const k = rand(4, 9), left = k * rand(4, 10), e = rand(8, 25), n = left + e; return { q: `${n} 張海洋卡，送給朋友 ${e} 張，剩下的平分給 ${k} 個人，每人幾張？`, ans: left / k, unit: '張', hint: '先算剩下幾張，再平分。', after: `${n} − ${e} ＝ ${left}，${left} ÷ ${k} ＝ ${left / k}` }; }
  ]).slice(0, 5));
}

/* ===== 5-A 塗出平方公分 ===== */
function paintGrid(st, W, H, onChange) {
  const u = 40, on = new Set();
  let cells = '';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cells += `<rect class="c" data-k="${x},${y}" x="${x * u}" y="${y * u}" width="${u}" height="${u}"/>`;
  const wrap = document.createElement('div'); wrap.className = 'center';
  wrap.innerHTML = `<svg class="grid-svg" viewBox="-2 -2 ${W * u + 4} ${H * u + 4}" width="${W * u + 4}">${cells}</svg>`;
  st.appendChild(wrap);
  const svg = $('svg', wrap); let mode = null;
  const hit = e => { const el = e.type === 'pointerdown' ? e.target : document.elementFromPoint(e.clientX, e.clientY); return el && el.classList && el.classList.contains('c') && svg.contains(el) ? el : null; };
  const paint = el => { const k = el.dataset.k; if (mode === 'on') { on.add(k); el.classList.add('on'); } else { on.delete(k); el.classList.remove('on'); } onChange(on); };
  svg.addEventListener('pointerdown', e => { const el = hit(e); if (!el) return; e.preventDefault(); mode = on.has(el.dataset.k) ? 'off' : 'on'; sfx('tap'); paint(el); });
  svg.addEventListener('pointermove', e => { if (!mode) return; const el = hit(e); if (el && (mode === 'on') !== on.has(el.dataset.k)) paint(el); });
  const stop = () => { mode = null; };
  window.addEventListener('pointerup', stop); cleanups.push(() => window.removeEventListener('pointerup', stop));
  return { on, clear() { on.clear(); $$('.c', svg).forEach(c => c.classList.remove('on')); onChange(on); } };
}
function isRect(on, a, b) {
  const pts = [...on].map(k => k.split(',').map(Number));
  if (pts.length !== a * b) return false;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1;
  return w * h === pts.length && ((w === a && h === b) || (w === b && h === a));
}
function u5A(st) {
  const tasks = [{ n: rand(5, 9) }, { n: rand(10, 14) }, { a: rand(3, 5), b: rand(2, 4) }, { n: rand(6, 12), two: true }];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r];
    st.innerHTML = dots(r, tasks.length);
    api.say(T.a ? `每一格是 1 平方公分。塗出一個<b>長 ${T.a} 公分、寬 ${T.b} 公分</b>的長方形。` : `每一格是 <b>1 平方公分</b>。在方格板上塗出 <b>${T.n} 平方公分</b>的圖形${T.two ? '，形狀自己決定' : ''}（可以按住拖曳）。`,
      T.a ? `塗出一個長${T.a}公分、寬${T.b}公分的長方形` : `塗出${T.n}平方公分的圖形`);
    const ro = document.createElement('div'); ro.className = 'readout';
    const g = paintGrid(st, 8, 6, on => ro.textContent = `已經塗了 ${on.size} 格`);
    st.appendChild(ro); ro.textContent = '已經塗了 0 格';
    const bt = document.createElement('div'); bt.className = 'center';
    bt.innerHTML = '<button class="btn ghost" type="button" id="clr">全部擦掉</button> <button class="btn coral" type="button" id="okb">塗好了！</button>';
    st.appendChild(bt);
    $('#clr', st).onclick = () => g.clear();
    $('#okb', st).onclick = () => {
      if (T.a) {
        if (!isRect(g.on, T.a, T.b)) return api.bad(`要塗成長 ${T.a} 格、寬 ${T.b} 格的長方形喔！`);
        sfx('ok'); bt.innerHTML = '';
        api.say(`很好！這個長方形的面積是幾平方公分？`);
        const kw = document.createElement('div'); kw.className = 'kwrap'; st.appendChild(kw);
        return keypad(kw, T.a * T.b, () => { toast(`${T.a} × ${T.b} ＝ ${T.a * T.b} 平方公分`); r++; later(round, 1800); }, `一排 ${T.a} 格，有 ${T.b} 排！`, '平方公分');
      }
      if (g.on.size !== T.n) return api.bad(g.on.size > T.n ? `塗太多了，要 ${T.n} 格！` : `還不夠，要 ${T.n} 格！`);
      $('#okb', st).disabled = true; api.ok(`對！${T.n} 個 1 平方公分就是 ${T.n} 平方公分`); r++; later(round, 1500);
    };
  }
  round();
}

/* ===== 5-B 切割和拼湊 ===== */
const SHAPES = [
  ['.##.', '####', '.##.'], ['d##b', '####'], ['d#b', '###'], ['.db.', 'd##b', '####'],
  ['##b', '###', 'q..'], ['db', '##', 'pq'], ['d##', '##q'], ['###', '#.#', '###'], ['d#b', '###', '.#.']
];
function u5B(st) {
  const sh = shuffle(SHAPES);
  const area = s => shapeArea(s);
  quiz(st, [
    { q: '1 平方公分是多大？', opts: [{ h: '<span class="small-opt">邊長 1 公分的正方形那麼大</span>', ok: true }, { h: '<span class="small-opt">長 1 公分的線那麼長</span>', ok: false }, { h: '<span class="small-opt">邊長 1 公尺的正方形</span>', ok: false }], hint: '面積是「一塊面」的大小，不是線的長度。' },
    ...[0, 1, 2].map(i => () => ({ q: '每一格是 1 平方公分，兩個半格可以拼成 1 格。這個圖形的面積是幾平方公分？', vis: shapeSVG(sh[i]), ans: area(sh[i]), unit: '平方公分', hint: '先數整格，再把半格兩個兩個拼起來！', after: `面積是 ${area(sh[i])} 平方公分` })),
    () => { const A = sh[3], B = sh[4], a = area(A), b = area(B); return { q: '哪一個圖形的面積比較大？', vis: `<div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;align-items:end"><div>${shapeSVG(A, '#58c26b', 28)}<div>甲</div></div><div>${shapeSVG(B, '#ffb648', 28)}<div>乙</div></div></div>`, keep: true, opts: [{ h: '甲', ok: a > b }, { h: '一樣大', ok: a === b }, { h: '乙', ok: b > a }], hint: '分別數一數有幾平方公分！', after: `甲 ${a} 平方公分，乙 ${b} 平方公分` }; },
    { q: '把一張正方形紙剪成兩半，再拼成一個長方形，面積會怎樣？', opts: [{ h: '不變', ok: true }, { h: '變大', ok: false }, { h: '變小', ok: false }], hint: '紙沒有多也沒有少，只是換了位置。', after: '切割再拼湊，面積不變！' }
  ]);
}

/* ===== 5-C 面積的估算 ===== */
function blobSVG(rx, ry, W, H, u = 30) {
  let g = '';
  for (let y = 0; y <= H; y++) g += `<line x1="0" y1="${y * u}" x2="${W * u}" y2="${y * u}" stroke="#9cc3d6"/>`;
  for (let x = 0; x <= W; x++) g += `<line x1="${x * u}" y1="0" x2="${x * u}" y2="${H * u}" stroke="#9cc3d6"/>`;
  return `<svg class="grid-svg" viewBox="-2 -2 ${W * u + 4} ${H * u + 4}" width="${Math.min(W * u + 4, 420)}">${g}<ellipse cx="${W * u / 2}" cy="${H * u / 2}" rx="${rx * u}" ry="${ry * u}" fill="rgba(88,194,107,.55)" stroke="#2b7a3a" stroke-width="3"/></svg>`;
}
function u5C(st) {
  const est = () => {
    const rx = rand(3, 5) + 0.3, ry = rand(2, 3) + 0.4, A = Math.round(Math.PI * rx * ry);
    const W = Math.ceil(rx * 2) + 2, H = Math.ceil(ry * 2) + 2;
    return { q: '每一格是 1 平方公分。這片海藻葉的面積<b>大約</b>是多少？（滿格算 1 格，不滿的兩個併成 1 格）', vis: blobSVG(rx, ry, W, H), opts: [{ h: `約 ${A} 平方公分`, ok: true }, { h: `約 ${Math.round(A / 2)} 平方公分`, ok: false }, { h: `約 ${Math.round(A * 1.9)} 平方公分`, ok: false }], keep: true, hint: '數一數整格，再加上不滿一格的一半。', after: `大約 ${A} 平方公分` };
  };
  quiz(st, [
    est, est,
    () => pick([
      { q: '一張郵票的面積大約是多少？', opts: [{ h: '約 6 平方公分', ok: true }, { h: '約 600 平方公分', ok: false }, { h: '約 6 公分', ok: false }], hint: '郵票很小，大約是 2 公分 × 3 公分。' },
      { q: '一張悠遊卡的面積大約是多少？', opts: [{ h: '約 46 平方公分', ok: true }, { h: '約 5 平方公分', ok: false }, { h: '約 460 平方公分', ok: false }], hint: '悠遊卡大約長 8 公分、寬 5 公分多。' }
    ]),
    () => { const a = rand(3, 5), b = rand(3, 4), s = a * b + pick([-1, 1]); return { q: `長方形魚缸底板長 ${a} 公分、寬 ${b} 公分；另一塊不規則的石板估算大約 ${s} 平方公分。哪一個比較大？`, opts: [{ h: '長方形底板', ok: a * b > s }, { h: '石板', ok: s > a * b }], keep: true, hint: `長方形是 ${a} × ${b} 平方公分。`, after: `長方形 ${a * b} 平方公分，石板約 ${s} 平方公分` }; },
    () => { const s = rand(4, 9); return { q: `一個正方形，每邊 ${s} 公分，面積是幾平方公分？`, ans: s * s, unit: '平方公分', hint: `一排 ${s} 格，有 ${s} 排。`, after: `${s} × ${s} ＝ ${s * s} 平方公分` }; }
  ]);
}

Object.assign(LEVELS, {
  u1: [u1A, u1B, u1C], u2: [u2A, u2B, u2C], u3: [u3A, u3B, u3C], u4: [u4A, u4B, u4C], u5: [u5A, u5B, u5C]
});
