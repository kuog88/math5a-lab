'use strict';
/* 第 6 單元 公斤和公克／第 7 單元 分數／第 8 單元 乘除的應用／第 9 單元 小數／第 10 單元 報讀表格 */

const cmpOpts = (a, b) => [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }];
const sign = (a, b) => a > b ? '＞' : a < b ? '＜' : '＝';

/* ===== 6-A 砝碼秤重 ===== */
function u6A(st) {
  const W = [1000, 500, 200, 100, 50];
  const tasks = [50 * rand(4, 18), 1000 + 50 * rand(2, 18), 2000 + 50 * rand(1, 15), 1000 + 50 * rand(1, 19)];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r], tray = [];
    const txt = r === 3 ? `${T} 公克` : kgg(T);
    api.say(`潛水艇要載 <b class="big">${txt}</b> 的貨物，點砝碼放上秤盤，讓秤面指到 ${txt}。點秤盤上的砝碼可以拿下來。`, `放砝碼，讓秤面指到${txt}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="dial"></div><div class="tray" id="tray"></div>
      <div class="weights">${W.map(w => `<button type="button" class="wbtn" data-w="${w}">${w === 1000 ? '1 公斤' : w + ' 公克'}</button>`).join('')}</div>
      <div class="center"><button class="btn coral" id="okb" type="button">秤好了！</button></div>`;
    const draw = () => {
      const s = tray.reduce((a, b) => a + b, 0);
      $('#dial', st).innerHTML = dialSVG(Math.min(s, 3000), 3000, 50, 500, 230);
      $('#tray', st).innerHTML = tray.length ? tray.map((w, i) => `<button type="button" class="wbtn" data-i="${i}">${w === 1000 ? '1 公斤' : w + ' 公克'}</button>`).join('') : '<span class="note">秤盤是空的</span>';
      $$('#tray .wbtn', st).forEach(b => b.onclick = () => { tray.splice(+b.dataset.i, 1); sfx('tap'); draw(); });
    };
    $$('.weights .wbtn', st).forEach(b => b.onclick = () => { if (tray.length >= 12) return toast('秤盤放不下了！'); tray.push(+b.dataset.w); sfx('pop'); draw(); });
    $('#okb', st).onclick = () => {
      const s = tray.reduce((a, b) => a + b, 0);
      if (s === T) { $('#okb', st).disabled = true; api.ok(`對！${kgg(T)} ＝ ${T} 公克`); speak(`${kgg(T)}等於${T}公克`); r++; later(round, 1900); }
      else api.bad(s > T ? `太重了！現在是 ${kgg(s)}` : `還不夠重！現在是 ${kgg(s)}`);
    };
    draw();
  }
  round();
}

/* ===== 6-B 秤面與換算 ===== */
function u6B(st) {
  quiz(st, [
    () => { const v = 10 * rand(12, 95); return { q: '這是 1 公斤的秤，一小格是 10 公克。指針指在幾公克？', vis: dialSVG(v, 1000, 10, 100), ans: v, unit: '公克', hint: '先看指針過了哪個整百，再數小格。', after: `${v} 公克` }; },
    { q: '這是 3 公斤的秤，0 到 500 公克之間分成 10 小格，一小格是幾公克？', vis: dialSVG(0, 3000, 50, 500), ans: 50, unit: '公克', hint: '500 公克分成 10 小格，500 ÷ 10。', after: '一小格是 50 公克' },
    () => { const v = 1000 + 50 * rand(1, 39); return { q: '3 公斤的秤（一小格 50 公克），指針指在幾公斤幾公克？', vis: dialSVG(v, 3000, 50, 500), ans2: [Math.floor(v / 1000), v % 1000], labels: ['公斤', '公克'], hint: '先看過了幾公斤，再看多出幾公克。', after: kgg(v) }; },
    () => { const k = rand(1, 4), g = pick([rand(1, 9) * 10, rand(1, 9) * 100 + rand(1, 9) * 10, rand(1, 9)]); return { q: `${k} 公斤 ${g} 公克 ＝ ? 公克`, ans: k * 1000 + g, unit: '公克', hint: '1 公斤 ＝ 1000 公克，沒有的位要補 0！', after: `${k} 公斤 ${g} 公克 ＝ ${k * 1000 + g} 公克` }; },
    () => { const v = rand(1, 5) * 1000 + rand(1, 99) * 10; return { q: `${v} 公克 ＝ ? 公斤 ? 公克`, ans2: [Math.floor(v / 1000), v % 1000], labels: ['公斤', '公克'], hint: '1000 公克是 1 公斤！', after: `${v} 公克 ＝ ${kgg(v)}` }; },
    () => { const k = rand(1, 3), g = rand(1, 9) * pick([1, 10]), a = k * 1000 + g, b = k * 1000 + (g < 10 ? g * 10 : g / 10); return { q: `${k} 公斤 ${g} 公克 ○ ${b} 公克`, keep: true, opts: cmpOpts(a, b), hint: `先把 ${k} 公斤 ${g} 公克換成 ${a} 公克再比！`, after: `${a} 公克 ${sign(a, b)} ${b} 公克` }; },
    () => pick([
      { q: '一顆蘋果大約重多少？', opts: [{ h: '約 200 公克', ok: true }, { h: '約 2 公斤', ok: false }, { h: '約 2 公克', ok: false }], hint: '蘋果拿起來不太重。' },
      { q: '一個三年級小朋友大約重多少？', opts: [{ h: '約 28 公斤', ok: true }, { h: '約 28 公克', ok: false }, { h: '約 280 公斤', ok: false }], hint: '人比較重，要用公斤。' },
      { q: '一枝鉛筆大約重多少？', opts: [{ h: '約 5 公克', ok: true }, { h: '約 5 公斤', ok: false }, { h: '約 500 公克', ok: false }], hint: '鉛筆很輕喔。' }
    ])
  ]);
}

/* ===== 6-C 重量的計算 ===== */
function u6C(st) {
  const kg2 = v => [Math.floor(v / 1000), v % 1000];
  quiz(st, shuffle([
    () => { const a = rand(1, 3) * 1000 + rand(4, 8) * 100 + rand(0, 9) * 10, b = rand(1, 2) * 1000 + rand(3, 7) * 100 + rand(0, 9) * 10, s = a + b; return { q: `一箱海草重 ${kgg(a)}，一箱貝殼重 ${kgg(b)}，兩箱一共重幾公斤幾公克？`, ans2: kg2(s), labels: ['公斤', '公克'], hint: '公克加起來滿 1000，進位成 1 公斤！', after: `一共 ${kgg(s)}` }; },
    () => { const a = rand(3, 5) * 1000 + rand(1, 3) * 100 + rand(0, 9) * 10, b = rand(1, 2) * 1000 + rand(5, 9) * 100 + rand(0, 9) * 10, s = a - b; return { q: `${kgg(a)} − ${kgg(b)} ＝ ? 公斤 ? 公克`, ans2: kg2(s), labels: ['公斤', '公克'], hint: '公克不夠減，向公斤借 1（1000 公克）！', after: `答案是 ${kgg(s)}` }; },
    () => { const w = pick([250, 150, 350, 450, 200]), n = rand(3, 6), s = w * n; return { q: `一包魚飼料重 ${w} 公克，${n} 包共重幾公斤幾公克？`, ans2: kg2(s), labels: ['公斤', '公克'], hint: `先算 ${w} × ${n} 公克，再換成公斤和公克。`, after: `${w} × ${n} ＝ ${s} 公克 ＝ ${s % 1000 ? kgg(s) : kgg(s) + ' 0 公克'}` }; },
    () => { const tot = rand(2, 4) * 1000 + rand(1, 9) * 100; return { q: `潛水員背上氧氣瓶後量體重是 ${kgg(tot + 30000)}，沒背時是 30 公斤，氧氣瓶重幾公斤幾公克？`, ans2: kg2(tot), labels: ['公斤', '公克'], hint: '背了以後的重量 − 本來的重量。', after: `氧氣瓶重 ${kgg(tot)}` }; },
    () => { const a = rand(1, 2) * 1000 + rand(1, 9) * 100, b = 3000 - a; return { q: `一個桶子可以裝 3 公斤，已經裝了 ${kgg(a)} 的沙，還可以再裝幾公克？`, ans: b, unit: '公克', hint: '3 公斤 ＝ 3000 公克，再減掉已經裝的。', after: `3000 − ${a} ＝ ${b} 公克` }; }
  ]));
}

/* ===== 7-A 分數條塗一塗 ===== */
function u7A(st) {
  const tasks = [];
  [[rand(4, 6)], [rand(7, 9)], [rand(10, 12)]].forEach(([n]) => tasks.push({ n, k: rand(2, n - 1) }));
  const n4 = rand(6, 10), a4 = rand(1, 3), b4 = rand(1, n4 - a4 - 1); tasks.push({ n: n4, k: a4 + b4, add: [a4, b4] });
  const n5 = rand(5, 9), a5 = rand(n5 - 3, n5 - 1); tasks.push({ n: n5, k: n5, full: a5 });
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r];
    const ask = T.add ? `${F(T.add[0], T.n)} ＋ ${F(T.add[1], T.n)}` : T.full ? `塗滿 1 整條（${F(T.n, T.n)}）` : F(T.k, T.n);
    api.say(T.add ? `海龜吃了 ${F(T.add[0], T.n)} 條西瓜，又吃了 ${F(T.add[1], T.n)} 條，把吃掉的部分塗出來！` : T.full ? `已經塗了 ${F(T.full, T.n)}，再塗幾格可以變成 1 整條？把它塗滿！` : `一條西瓜平分成 ${T.n} 份，塗出 <b class="big">${F(T.k, T.n)}</b> 條。`);
    let on = T.full ? T.full : 0;
    st.innerHTML = `${dots(r, tasks.length)}<div class="qvis">${ask}</div><div class="bar" id="bar">${Array.from({ length: T.n }, (_, i) => `<div class="seg${i < on ? ' on' : ''}" data-i="${i}"></div>`).join('')}</div><div class="readout" id="ro"></div><div class="center"><button class="btn coral" id="okb" type="button">塗好了！</button></div>`;
    const draw = () => { on = $$('.seg.on', st).length; $('#ro', st).innerHTML = `塗了 ${on} 個 ${F(1, T.n)}，是 ${F(on, T.n)}`; };
    $$('.seg', st).forEach(s => s.onclick = () => { s.classList.toggle('on'); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (on === T.k) { $('#okb', st).disabled = true; const m = T.full ? `${F(T.n, T.n)} ＝ 1` : T.add ? `${F(T.add[0], T.n)} ＋ ${F(T.add[1], T.n)} ＝ ${F(T.k, T.n)}` : `${T.k} 個 ${F(1, T.n)} 是 ${F(T.k, T.n)}`; $('#ro', st).innerHTML = m; api.ok('答對了！'); speak(m); r++; later(round, 2000); }
      else api.bad(T.add ? `分子加起來：${T.add[0]} ＋ ${T.add[1]}` : T.full ? '每一格都要塗滿喔！' : `要塗 ${T.k} 格喔！`);
    };
    draw();
  }
  round();
}

/* ===== 7-B 分數比大小 ===== */
function u7B(st) {
  quiz(st, [
    () => { const n = rand(5, 12); let a, b; do { a = rand(1, n); b = rand(1, n); } while (a === b); return { q: `${F(a, n)} ○ ${F(b, n)}，圈圈裡要放什麼？`, sp: `${n}分之${a}和${n}分之${b}比大小`, vis: `${barHTML(n, a)}${barHTML(n, b)}`, keep: true, opts: cmpOpts(a, b), hint: '分母一樣，分子大的就比較大！', after: `${F(a, n)} ${sign(a, b)} ${F(b, n)}` }; },
    () => { let a, b; do { a = rand(2, 10); b = rand(2, 10); } while (a === b); return { q: `${F(1, a)} ○ ${F(1, b)}，圈圈裡要放什麼？`, sp: `${a}分之1和${b}分之1比大小`, vis: `${barHTML(a, 1)}${barHTML(b, 1)}`, keep: true, opts: cmpOpts(1 / a, 1 / b), hint: '分得越多份，每一份就越小！', after: `${F(1, a)} ${sign(1 / a, 1 / b)} ${F(1, b)}` }; },
    () => { const n = rand(5, 12), k = rand(2, n - 1); return { q: `${F(k, n)} 是幾個 ${F(1, n)}？`, ans: k, unit: '個', hint: '看分子就知道！', after: `${F(k, n)} 是 ${k} 個 ${F(1, n)}` }; },
    () => { const n = rand(5, 12), k = rand(2, n - 1); return { q: `${k} 個 ${F(1, n)} 是多少？`, opts: [{ h: F(k, n), ok: true }, { h: F(1, k * n > 99 ? n + k : k * n), ok: false }, { h: F(n, k), ok: false }], hint: `${k} 個 ${n} 分之 1，分子就是 ${k}。`, after: `${k} 個 ${F(1, n)} 是 ${F(k, n)}` }; },
    () => { const n = rand(3, 10); return { q: `${F(n, n)} 等於多少？`, opts: [{ h: N(1), ok: true }, { h: N(n), ok: false }, { h: F(1, n), ok: false }], hint: '全部的份數都拿了，就是 1 整個！', after: `${F(n, n)} ＝ 1` }; },
    () => { const n = rand(7, 12), s = shuffle(Array.from({ length: n - 1 }, (_, i) => i + 1)).slice(0, 3), mx = Math.max(...s); return { q: '哪一個最大？', opts: s.map(k => ({ h: F(k, n), ok: k === mx })), hint: '分母都一樣，比分子！', after: `${F(mx, n)} 最大` }; }
  ]);
}

/* ===== 7-C 分數的加減 ===== */
function u7C(st) {
  const ask = (eq, n, ans, hint, after, q) => ({ q: q || `${eq} ＝ ?`, vis: `<div class="eq">${eq} ＝ ${F('?', n)}</div>`, ans, unit: `（分子，分母是 ${n}）`, hint, after });
  quiz(st, shuffle([
    () => { const n = rand(5, 12), a = rand(1, n - 2), b = rand(1, n - a - 1); return ask(`${F(a, n)} ＋ ${F(b, n)}`, n, a + b, '分母不變，分子相加！', `${F(a, n)} ＋ ${F(b, n)} ＝ ${F(a + b, n)}`); },
    () => { const n = rand(5, 12), a = rand(3, n - 1), b = rand(1, a - 1); return ask(`${F(a, n)} − ${F(b, n)}`, n, a - b, '分母不變，分子相減！', `${F(a, n)} − ${F(b, n)} ＝ ${F(a - b, n)}`); },
    () => { const n = rand(4, 10), b = rand(1, n - 1); return ask(`1 − ${F(b, n)}`, n, n - b, `1 可以看成 ${F(n, n)}！`, `1 − ${F(b, n)} ＝ ${F(n, n)} − ${F(b, n)} ＝ ${F(n - b, n)}`); },
    () => { const n = 8, a = rand(1, 4), b = rand(1, 3); return ask(`${F(a, n)} ＋ ${F(b, n)}`, n, a + b, '分子相加，分母不變。', `一共吃了 ${F(a + b, n)} 個`, `海龜餐廳的披薩切成 8 片，海龜吃了 ${F(a, n)} 個，小魚吃了 ${F(b, n)} 個，一共吃了幾分之幾個？`); },
    () => { const n = rand(5, 9), u = rand(2, n - 1); return ask(`1 − ${F(u, n)}`, n, n - u, `1 公尺 ＝ ${F(n, n)} 公尺。`, `還剩 ${F(n - u, n)} 公尺`, `一條 1 公尺的海帶，用掉 ${F(u, n)} 公尺，還剩下幾分之幾公尺？`); },
    () => { const n = pick([4, 6, 8, 10]), h = n / 2; return { q: `${F(h, n)} ＋ ${F(h, n)} ＝ ?`, opts: [{ h: N(1), ok: true }, { h: F(n, n * 2), ok: false }, { h: F(h, n), ok: false }], hint: '分子加起來等於分母，就是 1！', after: `${F(h, n)} ＋ ${F(h, n)} ＝ ${F(n, n)} ＝ 1` }; }
  ]));
}

/* ===== 8-A 數字卡乘除家族 ===== */
function u8A(st) {
  const fams = [];
  while (fams.length < 3) { const a = rand(3, 9), b = rand(3, 9); if (a !== b && !fams.some(f => f[2] === a * b)) fams.push([a, b, a * b]); }
  let r = 0, step = 0;
  const EQ = [['×', '＝'], ['÷', '＝'], ['÷', '＝']];
  let firstDiv = null;
  function round() {
    if (r >= fams.length) return api.finish();
    const [a, b, p] = fams[r], op = EQ[step][0];
    const cards = shuffle([a, b, p, p + a]);
    api.say(step === 0 ? `用數字卡 ${a}、${b}、${p} 排出一個<b>乘法</b>算式（點卡片或拖進格子，點格子可以拿掉）。` : `用同樣的數字，排出${step === 2 ? '<b>另一個</b>' : '一個'}<b>除法</b>算式！`, step === 0 ? `用數字卡排出一個乘法算式` : `排出${step === 2 ? '另一個' : '一個'}除法算式`);
    st.innerHTML = `${dots(r * 3 + step, fams.length * 3)}<div class="slots"><span class="sl" data-s="0"></span> ${op} <span class="sl" data-s="1"></span> ＝ <span class="sl" data-s="2"></span></div><div class="cards">${cards.map((c, i) => `<div class="ncard" data-v="${c}" data-i="${i}">${c}</div>`).join('')}</div>`;
    const val = [null, null, null], from = [null, null, null], slots = $$('.sl', st);
    let locked = false;
    const place = (ci, si) => {
      const card = $(`.ncard[data-i="${ci}"]`, st);
      if (locked || card.classList.contains('used')) return;
      if (si == null) si = val.indexOf(null);
      if (si < 0) return;
      if (from[si] != null) $(`.ncard[data-i="${from[si]}"]`, st).classList.remove('used');
      val[si] = +card.dataset.v; from[si] = ci; slots[si].textContent = card.dataset.v; card.classList.add('used'); sfx('tap');
      if (!val.includes(null)) check();
    };
    slots.forEach((s, si) => s.onclick = () => { if (locked || from[si] == null) return; $(`.ncard[data-i="${from[si]}"]`, st).classList.remove('used'); val[si] = null; from[si] = null; s.textContent = ''; });
    $$('.ncard', st).forEach(c => draggable(c, slots, hit => { if (!hit) return; place(+c.dataset.i, hit === 'tap' ? null : +hit.dataset.s); }));
    function check() {
      const [x, y, z] = val;
      locked = true;
      const right = op === '×' ? x * y === z && z === p : y !== 0 && x === p && x / y === z && (step === 1 || y !== firstDiv);
      if (right) {
        slots.forEach(s => s.classList.add('right')); api.ok(`${x} ${op} ${y} ＝ ${z}`); speak(`${x}${op === '×' ? '乘以' : '除以'}${y}等於${z}`);
        if (step === 1) firstDiv = y;
        step++; if (step > 2) { step = 0; r++; firstDiv = null; }
        later(round, 1600);
      } else {
        api.bad(step === 2 && x === p && y === firstDiv ? `換一個除數試試看！` : `${x} ${op} ${y} 不等於 ${z} 喔！`);
        later(() => { slots.forEach((s, si) => { if (from[si] != null) $(`.ncard[data-i="${from[si]}"]`, st).classList.remove('used'); val[si] = null; from[si] = null; s.textContent = ''; }); locked = false; }, 700);
      }
    }
  }
  round();
}

/* ===== 8-B 驗算小偵探 ===== */
function u8B(st) {
  quiz(st, [
    () => { const b = rand(3, 9), q = rand(11, 30), rm = rand(1, b - 1), a = b * q + rm; return { q: `${a} ÷ ${b} ＝ ${q} … ${rm}，要怎麼驗算？`, opts: [{ h: `${b} × ${q} ＋ ${rm}`, ok: true }, { h: `${b} × ${q} − ${rm}`, ok: false }, { h: `${a} × ${b} ＋ ${rm}`, ok: false }], hint: '除數 × 商 ＋ 餘數 ＝ 被除數', after: `${b} × ${q} ＋ ${rm} ＝ ${a}，算對了！` }; },
    () => { const a = rand(12, 99), b = rand(3, 9); return { q: `${a} × ${b} ＝ ${a * b}，可以用哪個算式驗算？`, opts: [{ h: `${a * b} ÷ ${b}`, ok: true }, { h: `${a * b} × ${b}`, ok: false }, { h: `${a * b} − ${b}`, ok: false }], hint: '乘法和除法是相反的！', after: `${a * b} ÷ ${b} ＝ ${a}` }; },
    () => { const b = rand(5, 9), q = rand(12, 40), rm = rand(0, b - 3), a = b * q + rm, good = Math.random() < 0.5, srm = good ? rm : rm + rand(1, 2); return { q: `小章魚算 ${a} ÷ ${b} ＝ ${q} … ${srm}，用驗算檢查，對嗎？`, opts: [{ h: '對', ok: good }, { h: '不對', ok: !good }], keep: true, hint: `驗算：${b} × ${q} ＋ ${srm}，要等於 ${a} 才對。`, after: `${b} × ${q} ＋ ${srm} ＝ ${b * q + srm}，${good ? '算對了！' : `不等於 ${a}，正確是 ${q} … ${rm}`}` }; },
    () => { const b = rand(4, 9), q = rand(6, 9), rm = rand(1, b - 1); return { q: `□ ÷ ${b} ＝ ${q} … ${rm}，□ 是多少？`, vis: `<div class="eq"><span class="box">?</span> ÷ ${b} ＝ ${q} … ${rm}</div>`, ans: b * q + rm, hint: `用驗算：${b} × ${q} ＋ ${rm}`, after: `${b} × ${q} ＋ ${rm} ＝ ${b * q + rm}` }; },
    () => { const b = rand(5, 9), q = rand(20, 60), a = b * q; return { q: `${a} ÷ ${b} ＝ ?，算完用 ${b} × 商 驗算看看！`, vis: longDivHTML(a, b, '?'), ans: q, hint: '先分十位，再分個位。', after: `${a} ÷ ${b} ＝ ${q}，驗算 ${b} × ${q} ＝ ${a}` }; }
  ]);
}

/* ===== 8-C 找出未知數 ===== */
function u8C(st) {
  const box = '<span class="box">?</span>';
  quiz(st, shuffle([
    () => { const a = rand(3, 9), b = rand(3, 9); return { q: `□ × ${b} ＝ ${a * b}，□ 是多少？`, vis: `<div class="eq">${box} × ${b} ＝ ${a * b}</div>`, ans: a, hint: `被乘數未知，用 ${a * b} ÷ ${b}。`, after: `${a * b} ÷ ${b} ＝ ${a}` }; },
    () => { const a = rand(12, 30), b = rand(3, 4); return { q: `${a * b} ＝ ${b} × □，□ 是多少？`, vis: `<div class="eq">${b} × ${box} ＝ ${a * b}</div>`, ans: a, hint: `用 ${a * b} ÷ ${b}。`, after: `${a * b} ÷ ${b} ＝ ${a}` }; },
    () => { const b = rand(3, 9), q = rand(4, 12); return { q: `□ ÷ ${b} ＝ ${q}，□ 是多少？`, vis: `<div class="eq">${box} ÷ ${b} ＝ ${q}</div>`, ans: b * q, hint: `被除數未知，用 ${b} × ${q}。`, after: `${b} × ${q} ＝ ${b * q}` }; },
    () => { const b = rand(3, 9), q = rand(3, 9); return { q: `${b * q} ÷ □ ＝ ${q}，□ 是多少？`, vis: `<div class="eq">${b * q} ÷ ${box} ＝ ${q}</div>`, ans: b, hint: `除數未知，用 ${b * q} ÷ ${q}。`, after: `${b * q} ÷ ${q} ＝ ${b}` }; },
    () => { const per = rand(6, 9), n = rand(4, 9); return { q: `鯨魚港口有幾盒魚罐頭不知道，每盒 ${per} 罐，一共 ${per * n} 罐，有幾盒？`, ans: n, unit: '盒', hint: `□ × ${per} ＝ ${per * n}`, after: `${per * n} ÷ ${per} ＝ ${n} 盒` }; },
    () => { const k = rand(5, 8), each = rand(6, 9), rm = rand(1, k - 1); return { q: `一袋小魚乾平分給 ${k} 隻海獅，每隻分到 ${each} 條，還剩 ${rm} 條。原來有幾條？`, ans: k * each + rm, unit: '條', hint: `${k} × ${each} ＋ ${rm}`, after: `${k} × ${each} ＋ ${rm} ＝ ${k * each + rm} 條` }; }
  ]));
}

/* ===== 9-A 0.1 塗一塗 ===== */
function u9A(st) {
  const tasks = shuffle([rand(2, 5), rand(6, 9)]).concat([rand(11, 15), rand(16, 19), 10]);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r], two = r >= 2, d = r1(T / 10);
    api.say(`一條是 1，平分成 10 格，一格是 0.1。塗出 <b class="big">${d}</b>${two ? '（第一條塗滿再塗第二條）' : ''}。`, `塗出${d}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="bars">${(two ? [0, 10] : [0]).map(o => `<div class="bar dec">${Array.from({ length: 10 }, (_, i) => `<div class="seg" data-i="${o + i}"></div>`).join('')}</div>`).join('')}</div><div class="readout" id="ro"></div><div class="center"><button class="btn coral" id="okb" type="button">塗好了！</button></div>`;
    const draw = () => { const n = $$('.seg.on', st).length; $('#ro', st).textContent = `塗了 ${n} 個 0.1，是 ${r1(n / 10)}`; };
    $$('.seg', st).forEach(s => s.onclick = () => { s.classList.toggle('on'); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const n = $$('.seg.on', st).length;
      if (n === T) { $('#okb', st).disabled = true; api.ok(`${T} 個 0.1 是 ${d}`); speak(`${T}個零點一是${d}`); r++; later(round, 1700); }
      else api.bad(`${d} 是 ${T} 個 0.1，要塗 ${T} 格！`);
    };
    draw();
  }
  round();
}

/* ===== 9-B 小數的大小 ===== */
function lineSVG(k) {
  const u = 22, x0 = 20;
  let t = '';
  for (let i = 0; i <= 20; i++) t += `<line x1="${x0 + i * u}" y1="${i % 10 ? 40 : 32}" x2="${x0 + i * u}" y2="56" stroke="#12324f" stroke-width="${i % 10 ? 1.5 : 3}"/>`;
  [0, 1, 2].forEach(n => t += `<text x="${x0 + n * 10 * u}" y="78" font-size="16" font-weight="900" text-anchor="middle">${n}</text>`);
  return `<svg viewBox="0 0 480 90" width="460" style="max-width:100%"><line x1="${x0}" y1="48" x2="${x0 + 20 * u}" y2="48" stroke="#12324f" stroke-width="3"/>${t}<text x="${x0 + k * u}" y="24" font-size="24" text-anchor="middle">🔻</text></svg>`;
}
function u9B(st) {
  quiz(st, [
    () => { const k = rand(2, 9); return { q: `0.${k} 是幾個 0.1？`, ans: k, unit: '個', vis: barHTML(10, k, 'dec'), hint: '0.1 是 1 格，數一數有幾格。', after: `0.${k} 是 ${k} 個 0.1` }; },
    () => { const k = rand(11, 29); return { q: `${k} 個 0.1 是多少？`, ans: r1(k / 10), hint: '10 個 0.1 是 1！', after: `${k} 個 0.1 是 ${r1(k / 10)}` }; },
    () => { const k = rand(1, 19); return { q: '箭頭指的位置是多少？（每一小格是 0.1）', vis: lineSVG(k), ans: r1(k / 10), hint: '從 0 開始數，一小格是 0.1。', after: `是 ${r1(k / 10)}` }; },
    () => { let a, b; do { a = rand(1, 29); b = rand(1, 29); } while (a === b || Math.floor(a / 10) === Math.floor(b / 10) && Math.random() < 0.5); return { q: `${r1(a / 10)} ○ ${r1(b / 10)}，圈圈裡要放什麼？`, keep: true, opts: cmpOpts(a, b), hint: '先比整數部分，再比小數點後面的十分位！', after: `${r1(a / 10)} ${sign(a, b)} ${r1(b / 10)}` }; },
    () => { const c = rand(1, 5), mm = rand(1, 9); return { q: `一隻小蝦長 ${c} 公分 ${mm} 毫米，是幾公分？`, ans: r1(c + mm / 10), unit: '公分', hint: '1 毫米 ＝ 0.1 公分！', after: `${c} 公分 ${mm} 毫米 ＝ ${r1(c + mm / 10)} 公分` }; },
    () => { const s = shuffle(Array.from({ length: 25 }, (_, i) => i + 3)).slice(0, 3), mx = Math.max(...s); return { q: '哪一個數最大？', opts: s.map(v => ({ h: N(r1(v / 10)), ok: v === mx })), hint: '整數部分大的比較大；一樣的話，再比十分位。', after: `${r1(mx / 10)} 最大` }; }
  ]);
}

/* ===== 9-C 小數的加減 ===== */
function u9C(st) {
  const D = v => r1(v / 10);
  quiz(st, shuffle([
    () => { const a = rand(3, 9), b = rand(10 - a + 1, 9); return { q: `${D(a)} ＋ ${D(b)} ＝ ?`, vis: `<div class="eq">${D(a)} ＋ ${D(b)} ＝ <span class="box">?</span></div>`, ans: D(a + b), hint: '10 個 0.1 進位成 1！', after: `${D(a)} ＋ ${D(b)} ＝ ${D(a + b)}` }; },
    () => { const a = rand(12, 48), b = rand(5, 30); return { q: `${D(a)} ＋ ${D(b)} ＝ ?（小數點要對齊）`, vis: `<div class="eq">${D(a)} ＋ ${D(b)} ＝ <span class="box">?</span></div>`, ans: D(a + b), hint: '小數點對齊，從十分位開始加。', after: `${D(a)} ＋ ${D(b)} ＝ ${D(a + b)}` }; },
    () => { let a, b; do { a = rand(21, 58); b = rand(5, a - 3); } while (b % 10 <= a % 10); return { q: `${D(a)} − ${D(b)} ＝ ?`, vis: `<div class="eq">${D(a)} − ${D(b)} ＝ <span class="box">?</span></div>`, ans: D(a - b), hint: '十分位不夠減，向個位借 1（10 個 0.1）！', after: `${D(a)} − ${D(b)} ＝ ${D(a - b)}` }; },
    () => { const b = rand(1, 9); return { q: `1 − ${D(b)} ＝ ?`, ans: D(10 - b), hint: '1 是 10 個 0.1！', after: `1 − ${D(b)} ＝ ${D(10 - b)}` }; },
    () => { const a = rand(12, 25), b = rand(5, 18); return { q: `泡泡實驗室有 ${D(a)} 公升的海水，又倒進 ${D(b)} 公升，現在有幾公升？`, ans: D(a + b), unit: '公升', hint: '小數點對齊再加。', after: `${D(a)} ＋ ${D(b)} ＝ ${D(a + b)} 公升` }; },
    () => { const a = rand(30, 60), b = rand(8, 25); return { q: `一條緞帶長 ${D(a)} 公尺，剪下 ${D(b)} 公尺做海星，還剩幾公尺？`, ans: D(a - b), unit: '公尺', hint: '小數點對齊再減。', after: `${D(a)} − ${D(b)} ＝ ${D(a - b)} 公尺` }; }
  ]));
}

/* ===== 10-A 數一數做表格 ===== */
function u10A(st) {
  let r = 0;
  const kinds = [['🐟', '小魚'], ['🐢', '海龜'], ['🦀', '螃蟹'], ['🐙', '章魚'], ['🪼', '水母'], ['🐬', '海豚']];
  function round() {
    if (r >= 2) return api.finish();
    const ks = shuffle(kinds).slice(0, r ? 4 : 3), cnt = ks.map(() => rand(2, 7));
    const items = shuffle(ks.flatMap((k, i) => Array(cnt[i]).fill(k[0])));
    const val = ks.map(() => 0);
    api.say('數一數海洋觀測站看到的動物，按 ＋／－ 填好表格（點動物可以做記號）。', '數一數海洋動物，填好表格');
    const pos = items.map((_, i) => { const c = i % 6, rr = Math.floor(i / 6); return [8 + c * 16.5 + rand(-3, 3), 10 + rr * (80 / Math.ceil(items.length / 6)) + rand(-2, 3)]; });
    st.innerHTML = `${dots(r, 2)}<div class="scatter">${items.map((e, i) => `<span style="left:${pos[i][0]}%;top:${pos[i][1] + 4}%">${e}</span>`).join('')}</div>
      <div class="tally">${ks.map((k, i) => `<div class="t">${k[0]} ${k[1]}<span class="v" id="v${i}">0</span><button type="button" data-i="${i}" data-d="-1">－</button> <button type="button" data-i="${i}" data-d="1">＋</button></div>`).join('')}</div>
      <div class="center"><button class="btn coral" id="okb" type="button">表格填好了！</button></div>`;
    $$('.scatter span', st).forEach(s => s.onclick = () => { s.classList.toggle('done'); sfx('tap'); });
    $$('.tally button', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; val[i] = Math.max(0, val[i] + +b.dataset.d); $('#v' + i, st).textContent = val[i]; sfx('tap'); });
    $('#okb', st).onclick = () => {
      const bad = val.findIndex((v, i) => v !== cnt[i]);
      if (bad >= 0) return api.bad(`${ks[bad][1]}的數量不對，再數一次！`);
      sfx('ok');
      const mx = Math.max(...cnt), who = ks.filter((_, i) => cnt[i] === mx).map(k => k[1]);
      const tot = cnt.reduce((a, b) => a + b, 0);
      st.innerHTML = `${dots(r, 2)}<div class="qvis">${tableHTML(['動物', ...ks.map(k => k[0] + k[1])], [['數量（隻）', ...cnt]], '海洋觀測站動物統計表')}</div><div class="kwrap"></div>`;
      api.say('表格做好了！一共看到幾隻動物？');
      keypad($('.kwrap', st), tot, () => { toast(`一共 ${tot} 隻，最多的是${who.join('、')}`); r++; later(round, 2000); }, '把表格裡的數量全部加起來！', '隻');
    };
  }
  round();
}

/* ===== 10-B 一維表格 ===== */
function u10B(st) {
  const days = ['星期一', '星期二', '星期三', '星期四', '星期五'];
  let v; do { v = days.map(() => rand(12, 60)); } while (new Set(v).size < 5);
  const t = () => tableHTML(['星期', ...days], [['人數（人）', ...v]], '海洋館一週參觀人數');
  const mx = Math.max(...v), mn = Math.min(...v), i1 = rand(0, 4); let i2; do { i2 = rand(0, 4); } while (i2 === i1);
  quiz(st, [
    { q: `${days[i1]}有幾人參觀？`, vis: t(), ans: v[i1], unit: '人', hint: `找到「${days[i1]}」那一格。`, after: `${days[i1]} ${v[i1]} 人` },
    { q: '哪一天參觀的人最多？', vis: t(), opts: days.map((d, i) => ({ h: `<span class="small-opt">${d}</span>`, ok: v[i] === mx })), keep: true, hint: '找最大的數字！', after: `${days[v.indexOf(mx)]} 最多，有 ${mx} 人` },
    { q: '哪一天參觀的人最少？', vis: t(), opts: days.map((d, i) => ({ h: `<span class="small-opt">${d}</span>`, ok: v[i] === mn })), keep: true, hint: '找最小的數字！', after: `${days[v.indexOf(mn)]} 最少，有 ${mn} 人` },
    { q: `${days[i1]}比${days[i2]}${v[i1] > v[i2] ? '多' : '少'}幾人？`, vis: t(), ans: Math.abs(v[i1] - v[i2]), unit: '人', hint: '大的數減小的數。', after: `${Math.max(v[i1], v[i2])} − ${Math.min(v[i1], v[i2])} ＝ ${Math.abs(v[i1] - v[i2])}` },
    { q: '這 5 天一共有幾人參觀？', vis: t(), ans: v.reduce((a, b) => a + b, 0), unit: '人', hint: '把 5 天的人數全部加起來。', after: `一共 ${v.reduce((a, b) => a + b, 0)} 人` }
  ]);
}

/* ===== 10-C 二維表格 ===== */
function u10C(st) {
  const cls = ['三年 1 班', '三年 2 班', '三年 3 班'], an = ['小丑魚', '海龜', '鯊魚', '海豚'];
  let M; do { M = cls.map(() => an.map(() => rand(2, 12))); } while (new Set(M.map(r => r[0])).size < 3);
  const t = () => tableHTML(['班級＼動物', ...an], cls.map((c, i) => [c, ...M[i]]), '三年級最喜歡的海洋動物（人）');
  const ci = rand(0, 2), ai = rand(0, 3), cj = rand(0, 2), aj = rand(0, 3);
  const rowSum = M[cj].reduce((a, b) => a + b, 0), colSum = M.reduce((a, r) => a + r[aj], 0);
  const mx = Math.max(...M.map(r => r[0]));
  quiz(st, [
    { q: `${cls[ci]}最喜歡「${an[ai]}」的有幾人？`, vis: t(), ans: M[ci][ai], unit: '人', hint: `橫的找「${cls[ci]}」，直的找「${an[ai]}」，交叉的那一格。`, after: `${M[ci][ai]} 人` },
    { q: `${cls[cj]}一共有幾人參加調查？`, vis: t(), ans: rowSum, unit: '人', hint: `把「${cls[cj]}」那一橫排加起來。`, after: `${M[cj].join(' ＋ ')} ＝ ${rowSum}` },
    { q: `三個班最喜歡「${an[aj]}」的一共有幾人？`, vis: t(), ans: colSum, unit: '人', hint: `把「${an[aj]}」那一直行加起來。`, after: `${M.map(r => r[aj]).join(' ＋ ')} ＝ ${colSum}` },
    { q: '哪一班最喜歡「小丑魚」的人最多？', vis: t(), opts: cls.map((c, i) => ({ h: `<span class="small-opt">${c}</span>`, ok: M[i][0] === mx })), keep: true, hint: '看「小丑魚」那一直行，找最大的。', after: `${cls[M.findIndex(r => r[0] === mx)]}，有 ${mx} 人` },
    () => { const i = rand(0, 2); let a, b; do { a = rand(0, 3); b = rand(0, 3); } while (a === b || M[i][a] === M[i][b]); const big = M[i][a] > M[i][b] ? a : b, sm = big === a ? b : a; return { q: `${cls[i]}喜歡「${an[big]}」的比喜歡「${an[sm]}」的多幾人？`, vis: t(), ans: M[i][big] - M[i][sm], unit: '人', hint: '找到兩格，大減小。', after: `${M[i][big]} − ${M[i][sm]} ＝ ${M[i][big] - M[i][sm]}` }; }
  ]);
}

Object.assign(LEVELS, {
  u6: [u6A, u6B, u6C], u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C], u9: [u9A, u9B, u9C], u10: [u10A, u10B, u10C]
});
