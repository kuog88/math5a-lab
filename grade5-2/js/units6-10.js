'use strict';
/* 第 6 單元 整數、小數除以整數／第 7 單元 生活中的大單位／第 8 單元 比率和百分率／第 9 單元 容積和容量／第 10 單元 柱體、錐體和球體 */

/* ===== 6-A 分數小數配對 ===== */
function u6A(st) {
  const pool = shuffle([[1, 4, '0.25'], [3, 4, '0.75'], [1, 2, '0.5'], [3, 5, '0.6'], [2, 5, '0.4'], [1, 8, '0.125'], [7, 20, '0.35'], [9, 10, '0.9'], [3, 8, '0.375'], [4, 25, '0.16'], [1, 5, '0.2'], [11, 20, '0.55']]);
  const boards = [pool.slice(0, 4), pool.slice(4, 8)];
  let r = 0;
  function round() {
    if (r >= boards.length) return api.finish();
    const B = boards[r]; let sel = null, left = B.length;
    api.say('駱駝商隊的貨單被風吹亂了！先點一張<b>分數卡</b>，再點和它一樣大的<b>小數卡</b>。');
    st.innerHTML = `${dots(r, boards.length)}<div class="pairs"><div class="pcol">${shuffle(B.map((p, i) => `<button type="button" class="pcard" data-s="f" data-i="${i}">${F(p[0], p[1])}</button>`)).join('')}</div>
      <div class="pcol">${shuffle(B.map((p, i) => `<button type="button" class="pcard" data-s="d" data-i="${i}">${p[2]}</button>`)).join('')}</div></div>`;
    $$('.pcard', st).forEach(c => c.onclick = () => {
      if (c.classList.contains('done')) return;
      sfx('tap');
      if (!sel || sel.dataset.s === c.dataset.s) { if (sel) sel.classList.remove('sel'); sel = c; c.classList.add('sel'); return; }
      const p = B[+c.dataset.i];
      if (sel.dataset.i === c.dataset.i) {
        sel.classList.remove('sel'); sel.classList.add('done'); c.classList.add('done'); sel = null;
        api.ok(`${p[0]}/${p[1]} ＝ ${p[2]}`); speak(`${p[1]}分之${p[0]}等於${p[2]}`);
        if (--left === 0) { r++; later(round, 1500); }
      } else {
        const f = B[+(sel.dataset.s === 'f' ? sel : c).dataset.i];
        sel.classList.remove('sel'); sel = null;
        api.bad(`${f[0]}/${f[1]} 可以用 ${f[0]} ÷ ${f[1]} 算成小數喔！`);
      }
    });
  }
  round();
}

/* ===== 6-B 除到小數 ===== */
function u6B(st) {
  quiz(st, shuffle([
    () => { const [a, b] = pick([[7, 4], [9, 8], [13, 5], [21, 8], [3, 4], [6, 8]]); return { q: `${a} ÷ ${b} ＝ ?（除到沒有餘數）`, ans: rd(a / b), dec: true, hint: '除不盡時，在被除數後面補 0，繼續除。', after: `${a} ÷ ${b} ＝ ${rd(a / b)}` }; },
    () => { const q = rand(11, 99), n = rand(3, 9), d = rd(q * n / 10); return { q: `${d} ÷ ${n} ＝ ?`, ans: rd(q / 10), dec: true, hint: '商的小數點要和被除數的小數點對齊。', after: `${d} ÷ ${n} ＝ ${rd(q / 10)}` }; },
    () => { const q = rand(2, 9), n = rand(3, 9), d = rd(q * n / 100); return { q: `${d} ÷ ${n} ＝ ?`, ans: rd(q / 100), dec: true, hint: '個位不夠商，要記得寫 0 和小數點。', after: `${d} ÷ ${n} ＝ ${rd(q / 100)}` }; },
    () => { const [L, n] = pick([[7.5, 6], [9.6, 8], [5.4, 4], [2.1, 5]]); return { q: `一條 ${L} 公尺的駝鈴繩平分成 ${n} 段，每段長幾公尺？`, ans: rd(L / n), dec: true, unit: '公尺', hint: `${L} ÷ ${n}`, after: `${L} ÷ ${n} ＝ ${rd(L / n)} 公尺` }; },
    { q: '用直式算小數除以整數時，商的小數點要寫在哪裡？', opts: [{ h: '和被除數的小數點對齊', ok: true }, { h: '寫在商的最後面', ok: false }, { h: '不用寫小數點', ok: false }], hint: '商的位值要和被除數對齊。' },
    () => { const p = rand(24, 96) * 5, n = pick([8, 25, 4]); const v = rd(p / n); return { q: `${p} 公斤的乾糧平分給 ${n} 隻駱駝，每隻背幾公斤？`, ans: v, dec: !Number.isInteger(v), unit: '公斤', hint: `${p} ÷ ${n}，除不盡就補 0 繼續除。`, after: `${p} ÷ ${n} ＝ ${v} 公斤` }; }
  ]));
}

/* ===== 6-C 概數與應用 ===== */
function u6C(st) {
  quiz(st, shuffle([
    () => { const b = pick([3, 7, 9, 11]), a = rand(b + 1, b * 5); return a % b ? { q: `${a} ÷ ${b} 的商，用四捨五入法取到<b>小數第一位</b>是多少？`, ans: Math.round(a / b * 10) / 10, dec: true, hint: '要除到小數第二位，再看第二位四捨五入。', after: `${a} ÷ ${b} ＝ ${(a / b).toFixed(3)}… ≈ ${Math.round(a / b * 10) / 10}` } : { q: `${a} ÷ ${b} ＝ ?`, ans: a / b, hint: '剛好整除喔！', after: `${a} ÷ ${b} ＝ ${a / b}` }; },
    { q: '2 公升椰棗汁平分給 3 人，每人約幾公升？（四捨五入到小數第二位）', ans: 0.67, dec: true, unit: '公升', hint: '2 ÷ 3 ＝ 0.666…，看小數第三位。', after: '2 ÷ 3 ＝ 0.666… ≈ 0.67 公升' },
    () => { const [n, d] = pick([[3, 8], [7, 25], [9, 20], [5, 4], [13, 50]]); return { q: `把 ${F(n, d)} 化成小數。`, ans: rd(n / d), dec: true, hint: `分數就是除法：${n} ÷ ${d}。`, after: `${F(n, d)} ＝ ${n} ÷ ${d} ＝ ${rd(n / d)}` }; },
    () => { const [x, n, d] = pick([['0.45', 9, 20], ['0.6', 3, 5], ['1.25', 5, 4], ['0.08', 2, 25], ['0.375', 3, 8]]); return { q: `把 ${x} 化成<b>最簡分數</b>。`, frac: [n, d], simplest: true, hint: '幾位小數就用 10、100、1000 當分母，再約分。', after: `${x} ＝ ${F(n, d)}` }; },
    () => { const [n, d, x] = pick([[3, 5, 0.58], [3, 4, 0.8], [7, 8, 0.875], [2, 5, 0.45]]); return { q: `${F(n, d)} ○ ${x}`, keep: true, opts: cmpOpts(Math.round(n / d * 1000), Math.round(x * 1000)), hint: '先把分數化成小數再比。', after: `${F(n, d)} ＝ ${rd(n / d)} ${sign(Math.round(n / d * 1000), Math.round(x * 1000))} ${x}` }; },
    { q: '7 公尺的布做 3 面旗子，每面約幾公尺？（四捨五入到小數第一位）', ans: 2.3, dec: true, unit: '公尺', hint: '7 ÷ 3 ＝ 2.33…', after: '7 ÷ 3 ＝ 2.33… ≈ 2.3 公尺' }
  ]));
}

/* ===== 7-A 裝滿 1 公噸 ===== */
function u7A(st) {
  const ITEMS = [['🪨', '石塊', 500], ['🏺', '陶罐', 250], ['🌾', '麥子', 100], ['🧂', '鹽袋', 50]];
  const tasks = shuffle([[1000, '1 公噸'], [1500, '1.5 公噸'], [2300, '2 公噸 300 公斤'], [3250, '3.25 公噸'], [1750, '1 公噸 750 公斤']]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [T, name] = tasks[r], load = [];
    api.say(`尼羅河的運貨船要剛好載 <b>${name}</b> 的貨物。點貨物裝上船，點船上的貨物可以卸下來。`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="cargo" id="src">${ITEMS.map((it, i) => `<button type="button" class="cbtn" data-i="${i}"><span class="e">${it[0]}</span>${it[1]} ${it[2]} 公斤</button>`).join('')}</div>
      <div class="readout">⛵ 船上：<span id="sum"></span></div><div class="meter" id="mt"><i></i></div><div class="cargo" id="ship"></div>
      <div class="center"><button class="btn gold" id="okb" type="button">開船！</button></div>`;
    const draw = () => {
      const s = load.reduce((a, i) => a + ITEMS[i][2], 0);
      $('#sum', st).textContent = `${s} 公斤${s >= 1000 ? `（${Math.floor(s / 1000)} 公噸${s % 1000 ? ' ' + s % 1000 + ' 公斤' : ''}）` : ''}`;
      $('#mt i', st).style.width = Math.min(100, s / T * 100) + '%'; $('#mt', st).classList.toggle('over', s > T);
      $('#ship', st).innerHTML = load.map((i, k) => `<button type="button" class="cbtn" data-k="${k}"><span class="e">${ITEMS[i][0]}</span>${ITEMS[i][2]}</button>`).join('') || '<span class="note">船上還沒有貨物</span>';
      $$('#ship .cbtn', st).forEach(b => b.onclick = () => { load.splice(+b.dataset.k, 1); sfx('tap'); draw(); });
    };
    $$('#src .cbtn', st).forEach(b => b.onclick = () => { if (load.length >= 20) return toast('船裝不下那麼多件了！'); load.push(+b.dataset.i); sfx('pop'); draw(); });
    $('#okb', st).onclick = () => {
      const s = load.reduce((a, i) => a + ITEMS[i][2], 0);
      if (s === T) { $('#okb', st).disabled = true; api.ok(`剛好 ${name} ＝ ${T} 公斤！`); speak(`${name}等於${T}公斤`); r++; later(round, 1900); }
      else api.bad(s > T ? `太重了！${name} 是 ${T} 公斤` : `還不夠！${name} 是 ${T} 公斤，1 公噸 ＝ 1000 公斤`);
    };
    draw();
  }
  round();
}

/* ===== 7-B 公畝、公頃、平方公里 ===== */
function u7B(st) {
  quiz(st, [
    { q: '1 公噸 ＝ ? 公斤', ans: 1000, unit: '公斤', hint: '1 公噸是 1000 公斤。' },
    { q: '邊長 <b>10 公尺</b>的正方形土地，面積是 1 什麼？', opts: [{ h: '公畝', ok: true }, { h: '公頃', ok: false }, { h: '平方公里', ok: false }], hint: '10 × 10 ＝ 100 平方公尺 ＝ 1 公畝。', after: '1 公畝 ＝ 100 平方公尺' },
    { q: '邊長 <b>100 公尺</b>的正方形土地，面積是 1 什麼？', opts: [{ h: '公頃', ok: true }, { h: '公畝', ok: false }, { h: '平方公里', ok: false }], hint: '100 × 100 ＝ 10000 平方公尺 ＝ 1 公頃。', after: '1 公頃 ＝ 10000 平方公尺' },
    { q: '1 公頃 ＝ ? 公畝', ans: 100, unit: '公畝', hint: '1 公頃 10000 平方公尺，1 公畝 100 平方公尺。', after: '1 公頃 ＝ 100 公畝' },
    { q: '1 平方公里 ＝ ? 公頃', ans: 100, unit: '公頃', hint: '1 平方公里是邊長 1000 公尺的正方形：1000000 平方公尺。', after: '1 平方公里 ＝ 100 公頃 ＝ 1000000 平方公尺' },
    () => pick([
      { q: '一輛小汽車大約重多少？', opts: [{ h: '約 1 公噸', ok: true }, { h: '約 1 公斤', ok: false }, { h: '約 100 公噸', ok: false }], hint: '小汽車大約 1000 多公斤。' },
      { q: '臺灣的面積大約是 36000 什麼？', opts: [{ h: '平方公里', ok: true }, { h: '公頃', ok: false }, { h: '平方公尺', ok: false }], hint: '很大的面積用平方公里。' },
      { q: '學校的操場面積大約是多少？', opts: [{ h: '約 1 公頃', ok: true }, { h: '約 1 平方公里', ok: false }, { h: '約 1 平方公尺', ok: false }], hint: '1 公頃是邊長 100 公尺的正方形。' }
    ])
  ]);
}

/* ===== 7-C 大單位換算 ===== */
function u7C(st) {
  quiz(st, shuffle([
    () => { const a = rand(2, 6), b = pick([50, 300, 75, 820]); return { q: `${a} 公噸 ${b} 公斤 ＝ ? 公斤`, ans: a * 1000 + b, unit: '公斤', hint: '1 公噸 ＝ 1000 公斤，空位補 0。', after: `${a} 公噸 ${b} 公斤 ＝ ${a * 1000 + b} 公斤` }; },
    () => { const k = rand(11, 59) * 100; return { q: `${k} 公斤 ＝ ? 公噸`, ans: rd(k / 1000), dec: true, unit: '公噸', hint: '除以 1000。', after: `${k} 公斤 ＝ ${rd(k / 1000)} 公噸` }; },
    () => { const h = rand(11, 99); return { q: `${rd(h / 10)} 公頃 ＝ ? 公畝`, ans: h * 10, unit: '公畝', hint: '1 公頃 ＝ 100 公畝。', after: `${rd(h / 10)} 公頃 ＝ ${h * 10} 公畝` }; },
    () => { const [l, w] = pick([[200, 150], [300, 200], [250, 80], [500, 120]]); return { q: `一塊長 ${l} 公尺、寬 ${w} 公尺的麥田，面積是幾公頃？`, ans: rd(l * w / 10000), dec: true, unit: '公頃', hint: '先算平方公尺，再除以 10000。', after: `${l} × ${w} ＝ ${l * w} 平方公尺 ＝ ${rd(l * w / 10000)} 公頃` }; },
    () => { const k = rand(11, 99); return { q: `${rd(k / 10)} 平方公里 ＝ ? 公頃`, ans: k * 10, unit: '公頃', hint: '1 平方公里 ＝ 100 公頃。', after: `${rd(k / 10)} 平方公里 ＝ ${k * 10} 公頃` }; },
    () => { const a = rand(2, 9); return { q: `${a} 公畝 ＝ ? 平方公尺`, ans: a * 100, unit: '平方公尺', hint: '1 公畝 ＝ 100 平方公尺。', after: `${a} 公畝 ＝ ${a * 100} 平方公尺` }; },
    () => { const cap = pick([3.5, 4, 2.5]), n = rand(12, 18), w = 120; const left = cap * 1000 - n * w; return { q: `一艘船最多載 ${cap} 公噸，已經裝了 ${n} 箱、每箱 ${w} 公斤，還可以再裝幾公斤？`, ans: left, unit: '公斤', hint: `先把 ${cap} 公噸換成公斤，再減掉 ${w} × ${n}。`, after: `${cap * 1000} − ${w} × ${n} ＝ ${left} 公斤` }; }
  ]).slice(0, 6));
}

/* ===== 8-A 塗出百分率 ===== */
function u8A(st) {
  const tasks = shuffle([[35, '<b>35%</b>', '35%'], [60, '比率 <b>0.6</b>', '比率 0.6'], [75, `全部的 <b>${F(3, 4)}</b>`, '4分之3'], [8, '<b>8%</b>', '8%'], [42, '<b>42%</b>', '42%']]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [T, html, sp] = tasks[r];
    api.say(`金庫的地磚一共 100 格。塗出 ${html} 的地磚！（可以點，也可以按住拖著塗）`, `塗出${sp}的地磚`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="g">${grid100SVG(28)}</div>
      <div class="readout">已塗 <span id="n">0</span> 格 ＝ <span id="pc">0</span>%</div>
      <div class="center"><button class="btn ghost" id="clr" type="button">全部擦掉</button> <button class="btn gold" id="okb" type="button">塗好了！</button></div>`;
    const svg = $('svg', st); let mode = null, last = null;
    const upd = () => { const n = $$('rect.c.on', st).length; $('#n', st).textContent = n; $('#pc', st).textContent = n; };
    const paint = el => { if (el && el.classList && el.classList.contains('c')) { el.classList.toggle('on', mode); upd(); } };
    svg.addEventListener('pointerdown', e => { const el = e.target; if (!el.classList.contains('c')) return; e.preventDefault(); mode = !el.classList.contains('on'); last = [e.clientX, e.clientY]; paint(el); sfx('tap'); });
    /* 手指移動很快時，補塗兩點之間經過的格子 */
    svg.addEventListener('pointermove', e => {
      if (mode === null) return;
      const [x0, y0] = last, k = Math.max(1, Math.ceil(Math.hypot(e.clientX - x0, e.clientY - y0) / 6));
      for (let i = 1; i <= k; i++) paint(document.elementFromPoint(x0 + (e.clientX - x0) * i / k, y0 + (e.clientY - y0) * i / k));
      last = [e.clientX, e.clientY];
    });
    const stop = () => { mode = null; };
    svg.addEventListener('pointerup', stop); svg.addEventListener('pointerleave', stop); svg.addEventListener('pointercancel', stop);
    $('#clr', st).onclick = () => { $$('rect.c', st).forEach(c => c.classList.remove('on')); upd(); };
    $('#okb', st).onclick = () => {
      const n = $$('rect.c.on', st).length;
      if (n === T) { $('#okb', st).disabled = true; api.ok(`對！${T} 格就是 ${T}%`); speak(`${T}格就是百分之${T}`); r++; later(round, 1800); }
      else api.bad(`要塗 ${T} 格，現在是 ${n} 格。100 格的 1% 是 1 格。`);
    };
  }
  round();
}

/* ===== 8-B 認識比率 ===== */
function u8B(st) {
  quiz(st, [
    () => { const [a, b] = pick([[5, 20], [6, 24], [9, 25], [4, 16], [12, 30]]); return { q: `探險隊有 ${b} 人，其中 ${a} 人戴帽子。戴帽子的人數占全隊的比率是多少？`, ans: rd(a / b), dec: true, hint: '比率 ＝ 部分量 ÷ 全部量。', after: `${a} ÷ ${b} ＝ ${rd(a / b)}` }; },
    { q: '25% 化成比率（小數）是多少？', opts: [{ h: '0.25', ok: true }, { h: '2.5', ok: false }, { h: '0.025', ok: false }], hint: '25% 就是 25/100。' },
    () => { const k = pick([8, 45, 3, 70]); return { q: `比率 ${rd(k / 100)} ＝ ?%`, ans: k, unit: '%', hint: '比率乘以 100，就是百分率。', after: `${rd(k / 100)} ＝ ${k}%` }; },
    () => { const [n, d] = pick([[3, 5], [1, 4], [7, 20], [9, 25]]); return { q: `${F(n, d)} ＝ ?%`, ans: n * 100 / d, unit: '%', hint: `先把分母變成 100：${n}/${d} ＝ ?/100。`, after: `${F(n, d)} ＝ ${F(n * 100 / d, 100)} ＝ ${n * 100 / d}%` }; },
    { q: '去年寶藏有 100 枚，今年有 120 枚。今年是去年的比率是多少？', ans: 1.2, dec: true, hint: '120 ÷ 100，比率也可以比 1 大喔！', after: '120 ÷ 100 ＝ 1.2 ＝ 120%' },
    { q: '「打八折」是原價的百分之多少？', ans: 80, unit: '%', hint: '八折就是原價的 0.8。', after: '八折 ＝ 0.8 ＝ 80%' },
    { q: '全部的量，用百分率表示是多少？', opts: [{ h: '100%', ok: true }, { h: '1%', ok: false }, { h: '10%', ok: false }], hint: '全部就是 100/100。' }
  ]);
}

/* ===== 8-C 百分率的應用 ===== */
function u8C(st) {
  quiz(st, shuffle([
    () => { const P = pick([500, 800, 1200, 360]), [k, z] = pick([[0.75, '七五折'], [0.8, '八折'], [0.9, '九折'], [0.85, '八五折']]); return { q: `一盞神燈原價 ${P} 元，打${z}賣，要付幾元？`, ans: rd(P * k), unit: '元', hint: `${z}是原價的 ${k}。`, after: `${P} × ${k} ＝ ${rd(P * k)} 元` }; },
    () => { const [n, p] = pick([[25, 48], [40, 35], [20, 45], [50, 62]]); return { q: `全班 ${n} 人，女生占 ${p}%，女生有幾人？`, ans: n * p / 100, unit: '人', hint: `${n} × ${p}/100`, after: `${n} × ${rd(p / 100)} ＝ ${n * p / 100} 人` }; },
    () => { const [v, p] = pick([[600, 30], [500, 40], [1200, 25]]); return { q: `一瓶 ${v} 毫升的水喝了 ${p}%，還剩多少毫升？`, ans: v * (100 - p) / 100, unit: '毫升', hint: `剩下 ${100 - p}%。`, after: `${v} × ${rd((100 - p) / 100)} ＝ ${v * (100 - p) / 100} 毫升` }; },
    () => { const [n, k] = pick([[40, 26], [25, 18], [20, 17], [50, 46]]); return { q: `投石遊戲投了 ${n} 次，命中 ${k} 次，命中率是百分之多少？`, ans: k * 100 / n, unit: '%', hint: '命中率 ＝ 命中次數 ÷ 全部次數 × 100%。', after: `${k} ÷ ${n} ＝ ${rd(k / n)} ＝ ${k * 100 / n}%` }; },
    () => { const [t, p] = pick([[1250, 20], [800, 15], [3600, 5]]); return { q: `寶藏有 ${t} 枚金幣，你分到 ${p}%，分到幾枚？`, ans: t * p / 100, unit: '枚', hint: `${t} × ${p}/100`, after: `${t} × ${rd(p / 100)} ＝ ${t * p / 100} 枚` }; },
    () => { const [s, p] = pick([[240, 60], [180, 75], [90, 30]]); return { q: `沙狐隊長已經走了 ${s} 公尺，是全程的 ${p}%。全程是幾公尺？`, ans: s * 100 / p, unit: '公尺', hint: `全程 × ${rd(p / 100)} ＝ ${s}，用除法算全程。`, after: `${s} ÷ ${rd(p / 100)} ＝ ${s * 100 / p} 公尺` }; }
  ]));
}

/* ===== 9-A 排水法量體積 ===== */
function u9A(st) {
  const OBJ = [['🪨', '石頭'], ['🗿', '小石像'], ['🔱', '金權杖頭'], ['💎', '寶石'], ['🐚', '貝殼化石']];
  const tasks = shuffle(OBJ).slice(0, 3).map(o => { const w0 = rand(10, 30) * 10; return { o, w0, V: rand(3, 15) * 10 }; });
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { o, w0, V } = tasks[r];
    api.say(`量筒裡有一些水。把${o[1]} ${o[0]} 放進量筒，用水位上升的量算出${o[1]}的體積！（1 毫升 ＝ 1 立方公分）`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="ctl"><div id="cy">${cylSVG(w0, 500, 10)}</div><button type="button" class="cbtn" id="drop"><span class="e">${o[0]}</span>放進去</button></div>
      <div class="readout" id="rd">放入前水位：自己讀讀看</div><div class="kwrap" id="kw"></div>`;
    $('#drop', st).onclick = () => {
      $('#drop', st).disabled = true; sfx('pop');
      $('#cy', st).innerHTML = cylSVG(w0 + V, 500, 10, o[0]);
      $('#rd', st).innerHTML = `放入前是 <b>${w0}</b> 毫升，現在水位是幾毫升？讀刻度算算看${o[1]}的體積。`;
      api.say(`${o[1]}的體積是多少立方公分？`);
      keypad($('#kw', st), V, () => { $('#kw', st).insertAdjacentHTML('afterend', `<div class="center"><span class="after">${w0 + V} − ${w0} ＝ ${V} 毫升 ＝ ${V} 立方公分</span></div>`); speak(`${o[1]}的體積是${V}立方公分`); r++; later(round, 2300); }, '放入後的水位 − 放入前的水位。一小格是 10 毫升。', '立方公分');
    };
  }
  round();
}

/* ===== 9-B 容積和容量 ===== */
function u9B(st) {
  quiz(st, [
    { q: '1 毫升 ＝ ? 立方公分', ans: 1, unit: '立方公分', hint: '1 毫升的水，體積剛好 1 立方公分。' },
    { q: '1 公升 ＝ ? 立方公分', ans: 1000, unit: '立方公分', hint: '1 公升 ＝ 1000 毫升。', after: '1 公升 ＝ 1000 毫升 ＝ 1000 立方公分' },
    { q: '容器<b>內部</b>可以容納的體積，叫做容器的什麼？', opts: [{ h: '容積', ok: true }, { h: '面積', ok: false }, { h: '重量', ok: false }], hint: '容積是容器裡面空間的大小。' },
    { q: '容器最多可以裝多少水（用公升、毫升表示），叫做容器的什麼？', opts: [{ h: '容量', ok: true }, { h: '體積', ok: false }, { h: '長度', ok: false }], hint: '容量是能裝的液體量。' },
    { q: '一個陶罐內部是長、寬、高都 10 公分的正方體，最多可以裝幾公升水？', ans: 1, unit: '公升', hint: '10 × 10 × 10 ＝ 1000 立方公分。', after: '1000 立方公分 ＝ 1 公升' },
    () => { const k = rand(11, 49); return { q: `${rd(k / 10)} 公升 ＝ ? 立方公分`, ans: k * 100, unit: '立方公分', hint: '1 公升 ＝ 1000 立方公分。', after: `${rd(k / 10)} 公升 ＝ ${k * 100} 立方公分` }; }
  ]);
}

/* ===== 9-C 容器的計算 ===== */
function u9C(st) {
  quiz(st, shuffle([
    () => { const L = rand(12, 22), W = rand(10, 14), H = rand(8, 12); return { q: `一個<b>有蓋</b>的木箱，外面長 ${L}、寬 ${W}、高 ${H} 公分，木板厚 1 公分。容積是多少立方公分？`, ans: (L - 2) * (W - 2) * (H - 2), unit: '立方公分', hint: '長、寬、高都要減掉兩邊的厚度（2 公分）。', after: `(${L} − 2) × (${W} − 2) × (${H} − 2) ＝ ${(L - 2) * (W - 2) * (H - 2)} 立方公分` }; },
    () => { const L = rand(12, 20), W = rand(8, 12), H = rand(6, 10); return { q: `一個<b>沒有蓋子</b>的石盒，外面長 ${L}、寬 ${W}、高 ${H} 公分，厚 1 公分。容積是多少立方公分？`, ans: (L - 2) * (W - 2) * (H - 1), unit: '立方公分', hint: '沒有蓋子，高只要減掉底部 1 公分。', after: `(${L} − 2) × (${W} − 2) × (${H} − 1) ＝ ${(L - 2) * (W - 2) * (H - 1)} 立方公分` }; },
    () => { const [l, w, v, d] = pick([[50, 40, 30, 15], [40, 30, 24, 20], [25, 20, 6, 12]]); return { q: `水箱內部長 ${l} 公分、寬 ${w} 公分，倒入 ${v} 公升的水，水深幾公分？`, ans: d, unit: '公分', hint: `${v} 公升 ＝ ${v * 1000} 立方公分，除以底面積 ${l} × ${w}。`, after: `${v * 1000} ÷ (${l} × ${w}) ＝ ${d} 公分` }; },
    () => { const [l, w, up] = pick([[20, 15, 2], [30, 20, 1.5], [25, 12, 4]]); return { q: `容器內部長 ${l} 公分、寬 ${w} 公分，放入一顆寶石後，水面上升 ${up} 公分。寶石的體積是多少立方公分？`, ans: l * w * up, unit: '立方公分', hint: '上升的水的體積 ＝ 底面積 × 上升的高度。', after: `${l} × ${w} × ${up} ＝ ${l * w * up} 立方公分` }; },
    { q: '1.2 公升的水倒進內部長 10 公分、寬 12 公分的容器，水深幾公分？', ans: 10, unit: '公分', hint: '1.2 公升 ＝ 1200 立方公分。', after: '1200 ÷ (10 × 12) ＝ 10 公分' }
  ]));
}

/* ===== 10-A 立體分類 ===== */
function u10A(st) {
  const ALL = [['prism', 3, '三角柱', 0], ['prism', 4, '四角柱', 0], ['prism', 5, '五角柱', 0], ['prism', 6, '六角柱', 0], ['cylinder', 0, '圓柱', 0],
    ['pyramid', 3, '三角錐', 1], ['pyramid', 4, '四角錐', 1], ['pyramid', 5, '五角錐', 1], ['cone', 0, '圓錐', 1], ['sphere', 0, '球', 2]];
  const set = shuffle([...shuffle(ALL.filter(a => a[3] === 0)).slice(0, 3), ...shuffle(ALL.filter(a => a[3] === 1)).slice(0, 3), ALL[9]]);
  let left = set.length, sel = null;
  api.say('金字塔裡散落著好多立體石雕！把它們拖到（或點一下再點）正確的寶庫：<b>柱體</b>、<b>錐體</b>、<b>球體</b>。');
  st.innerHTML = `<div class="solids">${set.map((s, i) => `<div class="solid" data-i="${i}">${solidSVG(s[0], s[1], 84)}<div>${s[2]}</div></div>`).join('')}</div>
    <div class="bins">${['柱體', '錐體', '球體'].map((b, i) => `<div class="bin" data-b="${i}"><h4>${b}</h4><div class="in"></div></div>`).join('')}</div>`;
  const bins = $$('.bin', st);
  const put = (el, bin) => {
    const s = set[+el.dataset.i];
    if (+bin.dataset.b === s[3]) {
      $('.in', bin).insertAdjacentHTML('beforeend', `<span>${s[2]}</span>`); el.remove(); api.ok(`${s[2]}是${['柱體', '錐體', '球體'][s[3]]}`); sel = null;
      if (--left === 0) later(api.finish, 900);
    } else { el.classList.remove('sel'); sel = null; api.bad(s[3] === 0 ? '上下兩個底面一樣大、互相平行的是柱體。' : s[3] === 1 ? '只有一個底面、往上收成一個頂點的是錐體。' : '圓圓的、怎麼切都是圓的是球。'); }
  };
  $$('.solid', st).forEach(el => draggable(el, bins, hit => {
    if (hit === 'tap') { $$('.solid.sel', st).forEach(x => x.classList.remove('sel')); sel = el; el.classList.add('sel'); sfx('tap'); }
    else if (hit) put(el, hit);
  }));
  bins.forEach(b => b.onclick = () => { if (sel) put(sel, b); });
}

/* ===== 10-B 構成要素 ===== */
function u10B(st) {
  const NM = ['', '', '', '三', '四', '五', '六', '七', '八'];
  quiz(st, [
    () => { const n = rand(3, 6); return { q: `${NM[n]}角柱有幾個<b>面</b>？`, vis: solidSVG('prism', n, 130), ans: n + 2, unit: '個', hint: `${n} 個側面加上 2 個底面。`, after: `${n} ＋ 2 ＝ ${n + 2} 個面` }; },
    () => { const n = rand(3, 6); return { q: `${NM[n]}角柱有幾條<b>邊</b>？`, vis: solidSVG('prism', n, 130), ans: 3 * n, unit: '條', hint: `上底 ${n} 條、下底 ${n} 條，再加上 ${n} 條側邊。`, after: `${n} × 3 ＝ ${3 * n} 條邊` }; },
    () => { const n = rand(3, 6); return { q: `${NM[n]}角柱有幾個<b>頂點</b>？`, vis: solidSVG('prism', n, 130), ans: 2 * n, unit: '個', hint: `上下兩個底面各有 ${n} 個頂點。`, after: `${n} × 2 ＝ ${2 * n} 個頂點` }; },
    () => { const n = rand(3, 6); return { q: `${NM[n]}角錐有幾個<b>面</b>？`, vis: solidSVG('pyramid', n, 130), ans: n + 1, unit: '個', hint: `${n} 個側面加上 1 個底面。`, after: `${n} ＋ 1 ＝ ${n + 1} 個面` }; },
    () => { const n = rand(3, 6); return { q: `${NM[n]}角錐有幾條<b>邊</b>？`, vis: solidSVG('pyramid', n, 130), ans: 2 * n, unit: '條', hint: `底面 ${n} 條邊，加上連到頂點的 ${n} 條。`, after: `${n} × 2 ＝ ${2 * n} 條邊` }; },
    () => { const n = rand(3, 6); return { q: `${NM[n]}角錐有幾個<b>頂點</b>？`, vis: solidSVG('pyramid', n, 130), ans: n + 1, unit: '個', hint: `底面 ${n} 個頂點，再加上最上面 1 個。`, after: `${n} ＋ 1 ＝ ${n + 1} 個頂點` }; },
    { q: '角錐的側面都是什麼形狀？', vis: solidSVG('pyramid', 4, 120), opts: [{ h: '三角形', ok: true }, { h: '長方形', ok: false }, { h: '圓形', ok: false }], hint: '每個側面都連到同一個頂點。' }
  ]);
}

/* ===== 10-C 面和面的關係 ===== */
function u10C(st) {
  const NM = ['', '', '', '三', '四', '五', '六', '七', '八', '九', '十'];
  quiz(st, shuffle([
    () => { const n = rand(5, 8); return { q: `一個角柱有 ${3 * n} 條邊，它是幾角柱？`, ans: n, unit: '角柱', hint: '角柱的邊數是底面邊數的 3 倍。', after: `${3 * n} ÷ 3 ＝ ${n}，是${NM[n]}角柱` }; },
    () => { const n = rand(5, 9); return { q: `一個角錐有 ${n + 1} 個面，它是幾角錐？`, ans: n, unit: '角錐', hint: '角錐的面數 ＝ 底面邊數 ＋ 1。', after: `${n + 1} − 1 ＝ ${n}，是${NM[n]}角錐` }; },
    { q: '角柱的兩個底面互相怎麼樣？', vis: solidSVG('prism', 5, 120), opts: [{ h: '平行', ok: true }, { h: '垂直', ok: false }, { h: '相交', ok: false }], hint: '上下兩個底面一樣大，而且永遠不會碰在一起。' },
    { q: '直角柱的側面和底面互相怎麼樣？', vis: solidSVG('prism', 4, 120), opts: [{ h: '垂直', ok: true }, { h: '平行', ok: false }, { h: '重疊', ok: false }], hint: '側面是直立在底面上的。' },
    { q: '圓錐的側面攤開來，是什麼形狀？', vis: solidSVG('cone', 0, 120), opts: [{ h: '扇形', ok: true }, { h: '長方形', ok: false }, { h: '三角形', ok: false }], hint: '想想第 4 單元：兩條半徑和一段圓弧。' },
    { q: '用刀子切球，切面都是什麼形狀？', vis: solidSVG('sphere', 0, 120), opts: [{ h: '圓形', ok: true }, { h: '正方形', ok: false }, { h: '扇形', ok: false }], hint: '從哪個方向切都一樣喔。' },
    { q: '球心到球面上任意一點的距離，叫做球的什麼？', opts: [{ h: '半徑', ok: true }, { h: '直徑', ok: false }, { h: '高', ok: false }], hint: '和圓一樣，從中心到邊上是半徑。' },
    { q: '圓柱的兩個底面是什麼形狀？', vis: solidSVG('cylinder', 0, 120), opts: [{ h: '一樣大的圓形', ok: true }, { h: '一大一小的圓形', ok: false }, { h: '長方形', ok: false }], hint: '柱體的兩個底面一樣大。' }
  ]).slice(0, 7));
}

LEVELS.u6 = [u6A, u6B, u6C];
LEVELS.u7 = [u7A, u7B, u7C];
LEVELS.u8 = [u8A, u8B, u8C];
LEVELS.u9 = [u9A, u9B, u9C];
LEVELS.u10 = [u10A, u10B, u10C];
