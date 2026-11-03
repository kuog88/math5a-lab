'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林四上有，南一四上沒有的內容（每單元 3 關，和本遊戲其他單元一樣）
   x2  三位數的乘法（康軒第 2 單元「整數的乘法」、翰林第 2 單元「乘法」：乘數是三位數、末位是 0 的乘法、乘法規律；南一在四下第 1 單元）
   x4  除以三位數（翰林第 6 單元「除法」：除數是三位數；南一、康軒在四下第 1 單元）
   x6  分數的加減與整數倍（康軒第 9 單元「分數」：同分母分數加減、分數的整數倍；南一在四下第 3 單元）
   x10 統計圖（康軒第 10 單元「統計圖」、翰林第 10 單元「統計圖表」：長條圖、折線圖；南一在四下第 5 單元）
   x2、x4 的直式工作台沿用本遊戲的乘法直式、除法直式（units1-3.js、units4-6.js），應用題用列式小幫手。 */

const xop = (h, ok, t) => ({ h, ok, t: t || String(h).replace(/<[^>]+>/g, '') });
const xsm = s => `<span class="small-opt">${s}</span>`;
const nz = (lo, hi) => { let v; do { v = rand(lo, hi); } while (String(v).includes('0')); return v; }; // 每一位都不是 0

/* ===== 補 2-A 乘法直式（乘數是三位數）：個位、十位、百位各乘一列，再加起來 ===== */
function mul3HTML(a, b, rows, now) {
  const w = String(a * b).length + 1;
  const pad = (v, shift) => { const s = String(v), c = Array(w).fill(''); for (let i = 0; i < s.length; i++) c[w - 1 - shift - (s.length - 1 - i)] = s[i]; return c; };
  const row = (cells, pre = '') => `<div class="vrow"><b class="vop">${pre}</b>${cells.map(c => `<span>${c}</span>`).join('')}</div>`;
  let h = `<div class="vert mul">${row(pad(a, 0))}${row(pad(b, 0), '×')}<div class="vline"></div>`;
  rows.forEach((r, i) => {
    if (r.line) { h += '<div class="vline"></div>'; return; }
    const sh = r.shift || 0;
    let cells;
    if (r.v === null) { cells = Array(w).fill(''); for (let k = 0; k < r.len; k++) cells[w - 1 - sh - k] = `<i class="vbox${i === now ? ' now' : ''}"></i>`; }
    else cells = pad(r.v, sh);
    for (let k = 0; k < sh; k++) if (r.v !== null) cells[w - 1 - k] = '<em class="ghost0">0</em>';
    h += row(cells);
  });
  return h + '</div>';
}
function mul3Level(st, probs) {
  let r = 0;
  function round() {
    if (r >= probs.length) return api.finish();
    const [a, b] = probs[r], d = String(b).split('').reverse().map(Number), res = a * b, PN = ['個位', '十位', '百位'], PV = ['', ' 個十', ' 個百'];
    const steps = d.map((x, k) => ({ v: a * x, shift: k, msg: `${a} × <b>${x}</b>${PV[k]}（乘數的${PN[k]}），從${PN[k]}開始寫，填多少？`, hint: k ? `${a} × ${x} 是多少？它代表 ${a} × ${x}${'0'.repeat(k)}，所以從${PN[k]}寫起。` : `${a} × ${x}，從個位乘起，記得進位！` }));
    steps.push({ v: res, shift: 0, msg: '最後把三列加起來，積是多少？', hint: `${steps.map(s => s.v + '0'.repeat(s.shift)).join(' + ')} 是多少？` });
    const rows = steps.map(s => ({ v: null, len: String(s.v).length, shift: s.shift }));
    rows.splice(3, 0, { line: true });
    let si = 0;
    st.innerHTML = `${dots(r, probs.length)}<div class="vwrap" id="vw"></div><div class="kwrap" id="kw"></div>`;
    function step() {
      const ri = si === 3 ? 4 : si;
      $('#vw', st).innerHTML = mul3HTML(a, b, rows, ri);
      if (si >= steps.length) { api.ok(`${a} × ${b} = ${res}`); speak(`${a} 乘以 ${b} 等於 ${res}`); r++; return later(round, 2200); }
      const s = steps[si]; curQ = { q: `${a} × ${b}：${s.msg}`, c: String(s.v) }; api.say(s.msg);
      keypad($('#kw', st), s.v, () => { rows[ri].v = s.v; si++; later(step, 700); }, s.hint);
    }
    step();
  }
  round();
}
function x2A(st) { mul3Level(st, [[rand(21, 89), nz(112, 389)], [rand(102, 349), nz(121, 298)], [rand(203, 489), nz(112, 245)]]); }

/* ===== 補 2-B 乘法想一想：末位是 0、乘法規律、估算、拆開算 ===== */
function x2B(st) {
  quiz(st, [
    () => { const a = rand(12, 48), b = rand(2, 9); return { q: `${a}0 × ${b}00 = ？`, vis: `<span class="eq sm">${a} × ${b} = ${a * b}</span>`, ans: a * b * 1000, hint: `先算 ${a} × ${b}，再數一數兩個數後面共有幾個 0，補在積的後面！`, after: `${a} × ${b} = ${a * b}，後面補 3 個 0：${a * b * 1000}` }; },
    () => { const [x, y] = pick([[25, 4], [125, 8], [50, 2], [20, 5]]), k = rand(2, 9); return { q: `${x} × ${y} = ${x * y}，那麼 ${x} × ${y * k} = ？`, ans: x * y * k, hint: `${y * k} 是 ${y} 的 ${k} 倍，積也會變成 ${k} 倍！`, after: `${x * y} × ${k} = ${x * y * k}` }; },
    () => { const a = pick([198, 302, 401, 499, 597, 703]), b = pick([202, 298, 301, 399, 502]), ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100, e = ra * rb; return { q: `${a} × ${b}，積大約是多少？`, opts: shuffle([e, e * 10, e / 10]).map(v => xop(N(v), v === e)), hint: `${a} 接近 ${ra}，${b} 接近 ${rb}！`, after: `${ra} × ${rb} = ${e}` }; },
    () => { const a = rand(21, 68), h = rand(1, 3), o = rand(1, 9), b = h * 100 + o; return { q: `${a} × ${b} 和下面哪一個一樣？`, opts: [xop(xsm(`${a} × ${h}00 + ${a} × ${o}`), true), xop(xsm(`${a} × ${h}00 + ${o}`), false), xop(xsm(`${a} × ${h} + ${a} × ${o}`), false)], hint: `${b} = ${h}00 + ${o}，兩個部分都要乘 ${a}！` }; },
    () => { const a = rand(103, 289), b = nz(112, 199), d = String(b).split('').reverse().map(Number); return { q: `小美算 ${a} × ${b}，第三列（乘數的百位）應該從哪一位開始寫？`, vis: mul3HTML(a, b, [{ v: a * d[0], shift: 0 }, { v: a * d[1], shift: 1 }, { v: null, len: String(a * d[2]).length, shift: 2 }], 2), keep: true, opts: [xop('個位', false), xop('十位', false), xop('百位', true)], hint: `乘數的百位是 ${d[2]} 個百，所以從百位寫起。` }; }
  ]);
}

/* ===== 補 2-C 乘法應用挑戰（列式小幫手） ===== */
function x2C(st) {
  quiz(st, [
    () => { const a = rand(24, 48), b = rand(112, 365); return { q: `一盒彩色筆有 ${a} 枝，學校買了 ${b} 盒，共有幾枝？`, vis: '<span style="font-size:56px">🖍️</span>', ans: a * b, eq: `${a} × ${b}`, unit: '枝', hint: '每盒一樣多，有好幾盒', after: `${a} × ${b} = ${a * b}（枝）` }; },
    () => { const a = rand(125, 480), b = rand(105, 365); return { q: `一臺機器每天做 ${a} 個零件，${b} 天共做幾個？`, vis: '<span style="font-size:56px">⚙️</span>', ans: a * b, eq: `${a} × ${b}`, unit: '個', hint: '每天做一樣多，做好幾天', after: `${a} × ${b} = ${a * b}（個）` }; },
    () => { const a = rand(12, 35) * 10, b = rand(2, 6) * 100; return { q: `一本畫冊 ${a} 元，圖書館買 ${b} 本，要多少元？`, vis: '<span style="font-size:56px">📘</span>', ans: a * b, eq: `${a} × ${b}`, unit: '元', hint: '每本一樣多錢', after: `${a} × ${b} = ${a * b}（元）` }; },
    () => { const a = rand(150, 320), b = rand(120, 250), c = rand(100, 900); return { q: `每箱橘子 ${a} 顆，運來 ${b} 箱，另外還有 ${c} 顆散裝，一共幾顆？`, vis: '<span style="font-size:56px">🍊</span>', ans: a * b + c, eq: `${a} × ${b} + ${c}`, unit: '顆', hint: '先算整箱的，再加散裝的', after: `${a} × ${b} + ${c} = ${a * b + c}（顆）` }; },
    () => { const a = rand(105, 250), b = rand(112, 199); return { q: `一捲緞帶長 ${a} 公分，${b} 捲接起來（不重疊）共長幾公分？`, vis: '<span style="font-size:56px">🎀</span>', ans: a * b, eq: `${a} × ${b}`, unit: '公分', hint: '每捲一樣長', after: `${a} × ${b} = ${a * b}（公分）` }; }
  ]);
}

/* ===== 補 4-A 除法直式（除數是三位數）：沿用 divLevel，自己試商 ===== */
function x4A(st) {
  const b1 = rand(112, 248), b2 = rand(205, 389), b3 = rand(121, 298);
  divLevel(st, [
    [b1 * rand(3, 8) + rand(0, b1 - 1), b1],
    [b2 * rand(2, 9) + rand(0, b2 - 1), b2],
    [b3 * rand(12, 38) + rand(0, b3 - 1), b3]
  ]);
}

/* ===== 補 4-B 除法想一想：估商、驗算、末位是 0、餘數 ===== */
function x4B(st) {
  quiz(st, [
    () => { const t = rand(2, 4), b = t * 100 + pick([-2, -1, 1, 2, 3]), q = rand(3, 9), a = b * q + rand(0, Math.min(40, b - 1)); const qa = Math.floor(a / b); return { q: `估商：${a} ÷ ${b}，商是多少？`, opts: shuffle([qa - 1, qa, qa + 1].filter(v => v > 0)).map(v => xop(N(v), v === qa)), hint: `把 ${b} 看成 ${t * 100}，再用乘法檢查！`, after: `${b} × ${qa} = ${b * qa}，${b} × ${qa + 1} = ${b * (qa + 1)}` }; },
    () => { const b = rand(2, 9), q = rand(2, 9), z = pick([1, 2]); return { q: `${b * q}${'0'.repeat(z + 1)} ÷ ${b}${'0'.repeat(z + 1)} = ？`, ans: q, hint: `被除數和除數後面都有 ${z + 1} 個 0，可以一起去掉，想成 ${b * q} ÷ ${b}！`, after: `${b * q} ÷ ${b} = ${q}` }; },
    () => { const b = rand(120, 360), q = rand(3, 9), rm = rand(1, b - 1); return { q: `一個除法算式，除數 ${b}，商 ${q}，餘數 ${rm}，被除數是多少？`, vis: `<span class="eq sm"><span class="box">?</span> ÷ ${b} = ${q} …… ${rm}</span>`, ans: b * q + rm, eq: `${b} × ${q} + ${rm}`, hint: '驗算：除數 × 商 ＋ 餘數 ＝ 被除數', after: `${b} × ${q} + ${rm} = ${b * q + rm}` }; },
    () => { const b = rand(150, 400); return { q: `一個數除以 ${b}，餘數<b>不可能</b>是多少？`, opts: shuffle([rand(100, b - 1), b + rand(0, 30), rand(1, 99)]).map(v => xop(N(v), v >= b)), hint: '餘數一定比除數小！' }; },
    () => { const b = rand(120, 280), q = rand(4, 9), rm = rand(1, b - 1), a = b * q + rm, w = q - 1; return { q: `小傑算 ${a} ÷ ${b} = ${w} …… ${rm + b}，對不對？`, keep: true, opts: [xop('對', false), xop('不對', true)], hint: `餘數 ${rm + b} 比除數 ${b} 大，表示商還可以再大 1！`, after: `正確答案：${q} …… ${rm}` }; }
  ]);
}

/* ===== 補 4-C 除法應用挑戰（列式小幫手） ===== */
function x4C(st) {
  quiz(st, [
    () => { const b = rand(120, 250), q = rand(12, 36); return { q: `${b * q} 張貼紙平分給 ${b} 個小朋友，每人分到幾張？`, vis: '<span style="font-size:56px">⭐</span>', ans: q, eq: `${b * q} ÷ ${b}`, unit: '張', hint: '平分給很多人', after: `${b * q} ÷ ${b} = ${q}（張）` }; },
    () => { const b = rand(125, 250), q = rand(5, 9), rm = rand(1, b - 1), a = b * q + rm; return { q: `${a} 毫升果汁，每 ${b} 毫升裝一瓶，<b>最多</b>可以裝滿幾瓶？`, vis: '<span style="font-size:56px">🧃</span>', ans: q, eq: `${a} ÷ ${b}`, rem: [q, rm], unit: '瓶', hint: '剩下不夠一瓶的不算', after: `${a} ÷ ${b} = ${q} …… ${rm}，最多 ${q} 瓶` }; },
    () => { const b = rand(110, 180), q = rand(3, 8), rm = rand(1, b - 1), a = b * q + rm; return { q: `${a} 公分的繩子，每 ${b} 公分剪一段，剪完後剩下幾公分？`, vis: '<span style="font-size:56px">🧵</span>', ans: rm, eq: `${a} ÷ ${b}`, rem: [q, rm], unit: '公分', hint: '剩下的就是餘數', after: `${a} ÷ ${b} = ${q} …… ${rm}` }; },
    () => { const b = rand(120, 200), q = rand(4, 8), rm = rand(1, b - 1), a = b * q + rm; return { q: `${a} 本書，每個書櫃放 ${b} 本，<b>至少</b>要幾個書櫃才放得完？`, vis: '<span style="font-size:56px">📚</span>', ans: q + 1, eq: `${a} ÷ ${b}`, rem: [q, rm], eqRound: true, roundQ: `放滿 ${q} 個書櫃，還剩 ${rm} 本也要放，<b>至少</b>要幾個書櫃？`, unit: '個', hint: '剩下的書也要放！', after: `${q} + 1 = ${q + 1}（個）` }; },
    () => { const b = rand(105, 165), q = rand(21, 48); return { q: `工廠做了 ${b * q} 個餅乾，每 ${b} 個裝一箱，剛好裝完，共裝幾箱？`, vis: '<span style="font-size:56px">🍪</span>', ans: q, eq: `${b * q} ÷ ${b}`, unit: '箱', hint: '每幾個裝一箱，就是看裡面有幾個', after: `${b * q} ÷ ${b} = ${q}（箱）` }; }
  ]);
}

/* ===== 補 6-A 分數條加加減減：先塗好一部分，再塗上（或擦掉）幾格 ===== */
function x6A(st) {
  const mk = sub => { const d = rand(5, 9); if (sub) { const a = rand(3, d), b = rand(1, a - 1); return [d, a, -b]; } const a = rand(1, d - 1), b = rand(1, d - 1); return [d, a, b]; };
  const rounds = [mk(false), mk(true), mk(false), mk(true)];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const [d, a, b] = rounds[r], n = a + b, bars = Math.max(1, Math.ceil(Math.max(a, n) / d)), on = new Set(Array.from({ length: a }, (_, k) => k));
    const sign = b > 0 ? '＋' : '－', ab = Math.abs(b);
    curQ = { q: `${a}/${d} ${sign} ${ab}/${d}`, c: `塗 ${n} 格（${n}/${d}）` };
    api.say(b > 0 ? `已經塗了 ${F(a, d)}，再塗 ${F(ab, d)}，一共是多少？` : `已經塗了 ${F(a, d)}，擦掉 ${F(ab, d)}，剩下多少？`, b > 0 ? `已經塗了${fracText(a, d)}，再塗${fracText(ab, d)}` : `已經塗了${fracText(a, d)}，擦掉${fracText(ab, d)}`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="qvis"><span class="eq">${F(a, d)} ${sign} ${F(ab, d)}</span></div>
      <div class="fbars">${Array.from({ length: bars }, () => `<div class="fline"><span class="flabel">1</span>${fracBar(d, 0, 'play')}</div>`).join('')}</div>
      <div class="readout" id="ro"></div><div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const show = () => { $('#ro', st).innerHTML = `現在塗了 ${on.size} 個 ${F(1, d)}`; };
    $$('.fbar', st).forEach((bar, bi) => $$('i', bar).forEach((c, k) => {
      const id = bi * d + k; if (on.has(id)) c.classList.add('on');
      c.onclick = () => { sfx('tap'); if (on.has(id)) on.delete(id); else on.add(id); c.classList.toggle('on'); show(); };
    }));
    show();
    $('#okb', st).onclick = () => {
      if (on.size !== n) return api.bad(b > 0 ? `要再塗 ${ab} 格喔！${a} ＋ ${ab} ＝ ？` : `要擦掉 ${ab} 格喔！${a} － ${ab} ＝ ？`, `塗了 ${on.size} 格`, `塗 ${n} 格（${n}/${d}）`);
      const w = Math.floor(n / d), m = n % d;
      $('#ro', st).innerHTML = `${F(a, d)} ${sign} ${F(ab, d)} ＝ ${F(n, d)}${n > d && m ? ` ＝ ${F(m, d, w)}` : n === d ? ' ＝ 1' : ''}`;
      api.ok('答對了！'); speak(`分母不變，分子${b > 0 ? '相加' : '相減'}，等於${fracText(n, d)}`); r++; later(round, 2600);
    };
  }
  round();
}

/* ===== 補 6-B 分數加減想一想 ===== */
function x6B(st) {
  quiz(st, [
    () => { const d = rand(5, 12), a = rand(1, d - 2), b = rand(1, d - 1 - a); return { q: `${fracText(a, d)}＋${fracText(b, d)}，分子是多少？`, vis: `<span class="eq">${F(a, d)} ＋ ${F(b, d)} ＝ ${F('?', d)}</span>`, ans: a + b, hint: '分母一樣，分母不變，分子相加！', after: `${a} + ${b} = ${a + b}` }; },
    () => { const d = rand(5, 12), a = rand(3, d - 1), b = rand(1, a - 1); return { q: `${fracText(a, d)}－${fracText(b, d)}，分子是多少？`, vis: `<span class="eq">${F(a, d)} － ${F(b, d)} ＝ ${F('?', d)}</span>`, ans: a - b, hint: '分母不變，分子相減！', after: `${a} − ${b} = ${a - b}` }; },
    () => { const d = rand(4, 10), a = rand(1, d - 1); return { q: `1 － ${fracText(a, d)}，分子是多少？`, vis: `<span class="eq">1 － ${F(a, d)} ＝ ${F('?', d)}</span>`, ans: d - a, hint: `1 ＝ ${fracText(d, d)}，再減 ${a} 個 ${fracText(1, d)}！`, after: `${d} − ${a} = ${d - a}` }; },
    () => { const d = rand(4, 8), a = rand(2, d - 1), b = rand(d - a + 1, d - 1), n = a + b; return { q: `${fracText(a, d)}＋${fracText(b, d)} 等於多少？（用帶分數表示）`, vis: `<span class="eq">${F(a, d)} ＋ ${F(b, d)} ＝ ？</span>`, opts: [xop(F(n - d, d, 1), true, `1又${n - d}/${d}`), xop(F(n, d + d), false, `${n}/${2 * d}`), xop(F(n - d, d), false, `${n - d}/${d}`)], hint: `分子相加是 ${fracText(n, d)}，比 1 大，換成帶分數！`, after: `${fracText(n, d)} ＝ ${fracText(n - d, d, 1)}` }; },
    () => { const d = rand(5, 9); let a = rand(1, d - 1), b = rand(1, d - 1); while (a === b) b = rand(1, d - 1); return { q: `${fracText(a, d)} 和 ${fracText(b, d)}，哪一個比較大？`, vis: `<span class="eq">${F(a, d)} ○ ${F(b, d)}</span>`, opts: [xop(F(a, d), a > b, `${a}/${d}`), xop(F(b, d), b > a, `${b}/${d}`)], keep: true, hint: '分母一樣，分子大的比較大！' }; }
  ]);
}

/* ===== 補 6-C 整數倍與分數應用 ===== */
function x6C(st) {
  quiz(st, [
    () => { const d = rand(5, 9), a = rand(1, d - 1), k = rand(2, 5); return { q: `${fracText(a, d)} 的 ${k} 倍是${d}分之幾？`, vis: `<span class="eq">${F(a, d)} × ${k} ＝ ${F('?', d)}</span>`, ans: a * k, hint: `${k} 個 ${fracText(a, d)} 就是 ${a} × ${k} 個 ${fracText(1, d)}！`, after: `${a} × ${k} = ${a * k}，是 ${fracText(a * k, d)}` }; },
    () => { const d = pick([4, 5, 8, 10]), a = rand(1, d - 1), k = rand(3, 6); return { q: `每杯果汁 ${fracText(a, d)} 公升，${k} 杯共幾公升？（分子是多少）`, sp: `每杯果汁${fracText(a, d)}公升，${k}杯共幾公升？`, vis: `<span style="font-size:48px">🥤</span><span class="eq">${F(a, d)} × ${k} ＝ ${F('?', d)}</span>`, ans: a * k, unit: '', hint: `${k} 杯一樣多，就是 ${fracText(a, d)} 的 ${k} 倍！`, after: `${fracText(a * k, d)} 公升` }; },
    () => { const d = rand(6, 12), a = rand(1, d - 3), b = rand(1, d - 1 - a); return { q: `一條蛋糕捲，哥哥吃了 ${fracText(a, d)} 條，妹妹吃了 ${fracText(b, d)} 條，兩人共吃了幾條？（分子是多少）`, sp: `哥哥吃了${fracText(a, d)}條，妹妹吃了${fracText(b, d)}條，兩人共吃了幾條？`, vis: `<span style="font-size:48px">🍰</span><span class="eq">${F(a, d)} ＋ ${F(b, d)} ＝ ${F('?', d)}</span>`, ans: a + b, hint: '合起來用加法，分母不變！', after: `共吃了 ${fracText(a + b, d)} 條` }; },
    () => { const d = rand(5, 10), a = rand(1, d - 1); return { q: `一盒巧克力，吃掉了 ${fracText(a, d)} 盒，還剩下幾盒？（分子是多少）`, sp: `一盒巧克力，吃掉了${fracText(a, d)}盒，還剩下幾盒？`, vis: `<span style="font-size:48px">🍫</span><span class="eq">1 － ${F(a, d)} ＝ ${F('?', d)}</span>`, ans: d - a, hint: `一整盒是 ${fracText(d, d)}！`, after: `還剩 ${fracText(d - a, d)} 盒` }; },
    () => { const d = rand(3, 6), a = rand(1, d - 1), k = rand(d, 2 * d); const n = a * k, w = Math.floor(n / d), m = n % d; return { q: `${fracText(a, d)} × ${k} 等於多少？`, vis: `<span class="eq">${F(a, d)} × ${k} ＝ ？</span>`, opts: [xop(m ? F(m, d, w) : `<b class="big">${w}</b>`, true, m ? `${w}又${m}/${d}` : String(w)), xop(F(a * k, d * k), false, `${a * k}/${d * k}`), xop(F(a, d * k), false, `${a}/${d * k}`)], hint: '分數乘整數，分母不變，分子乘整數！', after: `${fracText(n, d)}${m ? ` ＝ ${fracText(m, d, w)}` : ` ＝ ${w}`}` }; }
  ]);
}

/* ---------- 統計圖：長條圖、折線圖（SVG） ---------- */
const XCOL = ['#ff7eb3', '#5bb4ff', '#3fcf9c', '#ff9a4d', '#a98bff', '#ffc93c'];
/* o: {labels, vals, step, top, title, xl, yl, line, hi} */
function chartSVG(o) {
  const W = 360, H = 250, x0 = 50, y0 = 205, ytop = 30, n = o.labels.length, cw = (W - x0 - 14) / n, Y = v => y0 - v / o.top * (y0 - ytop);
  let s = `<svg class="xchart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><text x="${W / 2}" y="18" text-anchor="middle" font-size="16" font-weight="900" fill="#4a3b5c">${o.title}</text>`;
  for (let v = 0; v <= o.top; v += o.step) s += `<line x1="${x0}" y1="${Y(v)}" x2="${W - 10}" y2="${Y(v)}" stroke="#e3d9f0" stroke-width="1.5"/><text x="${x0 - 6}" y="${Y(v) + 5}" text-anchor="end" font-size="13" fill="#4a3b5c" font-family="Arial">${v}</text>`;
  s += `<line x1="${x0}" y1="${ytop - 8}" x2="${x0}" y2="${y0}" stroke="#4a3b5c" stroke-width="2.5"/><line x1="${x0}" y1="${y0}" x2="${W - 8}" y2="${y0}" stroke="#4a3b5c" stroke-width="2.5"/>`;
  s += `<text x="8" y="${ytop - 12}" font-size="12" fill="#6b5a7e">（${o.yl}）</text>`;
  o.labels.forEach((l, i) => { s += `<text x="${x0 + cw * (i + .5)}" y="${y0 + 18}" text-anchor="middle" font-size="13" font-weight="700" fill="#4a3b5c">${l}</text>`; });
  if (o.line) {
    const pts = o.vals.map((v, i) => `${x0 + cw * (i + .5)},${Y(v)}`);
    s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#e5508f" stroke-width="3"/>` + pts.map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="5" fill="#e5508f"/>`).join('');
  } else o.vals.forEach((v, i) => { s += `<rect x="${x0 + cw * i + cw * .2}" y="${Y(v)}" width="${cw * .6}" height="${y0 - Y(v)}" fill="${XCOL[i % XCOL.length]}" stroke="#4a3b5c" stroke-width="1.5"/>`; });
  s += `<text x="${W - 8}" y="${H - 4}" text-anchor="end" font-size="12" fill="#6b5a7e">（${o.xl}）</text>`;
  return s + '</svg>';
}
function xTable(head, rows, cap) {
  return `<table class="xtable">${cap ? `<caption>${cap}</caption>` : ''}<tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th>${c}</th>`).join('')}</tr>`).join('')}</table>`;
}
const XBARSET = [
  { title: '四年甲班最喜歡的運動', labels: ['跳繩', '躲避球', '籃球', '游泳'], xl: '運動', yl: '人', unit: '人' },
  { title: '一週回收的寶特瓶', labels: ['一', '二', '三', '四', '五'], xl: '星期', yl: '個', unit: '個' },
  { title: '圖書館各類書借出本數', labels: ['故事', '科學', '漫畫', '歷史'], xl: '類別', yl: '本', unit: '本' },
  { title: '各班參加園遊會人數', labels: ['甲班', '乙班', '丙班', '丁班', '戊班'], xl: '班級', yl: '人', unit: '人' }
];
const XLINESET = [
  { title: '小樹每個月的高度', labels: ['3月', '4月', '5月', '6月', '7月'], xl: '月', yl: '公分', unit: '公分' },
  { title: '一天中的氣溫變化', labels: ['8時', '10時', '12時', '14時', '16時'], xl: '時刻', yl: '度', unit: '度' },
  { title: '小明每週跳繩次數', labels: ['第1週', '第2週', '第3週', '第4週', '第5週'], xl: '週', yl: '次', unit: '次' }
];
/* 亂數資料：每個值是 step 的倍數，且各不相同 */
function xData(n, step, cells) { let v; do { v = Array.from({ length: n }, () => rand(1, cells) * step); } while (new Set(v).size < n); return v; }

/* ===== 補 10-A 畫長條圖：照表格把長條點到正確高度 ===== */
function x10A(st) {
  const sets = shuffle(XBARSET).slice(0, 3).concat([XBARSET[0]]), steps = [1, 2, 5, 10];
  let r = 0;
  function round() {
    if (r >= 4) return api.finish();
    const S = sets[r], step = steps[r], cells = 8, n = S.labels.length, vals = xData(n, step, cells), hgt = Array(n).fill(0);
    curQ = { q: `照表格畫長條圖（一格 ${step} ${S.unit}）`, c: S.labels.map((l, i) => `${l} ${vals[i]}`).join('、') };
    api.say(`照表格畫出長條圖！縱軸<b>一格是 ${step} ${S.unit}</b>，點一點方格，把長條拉到正確的高度。`, `照表格畫出長條圖，縱軸一格是${step}${S.unit}`);
    st.innerHTML = `${dots(r, 4)}<div class="qvis">${xTable([S.xl, ...S.labels], [[`${S.yl}數`, ...vals]], S.title)}</div>
      <div class="xbc" style="--n:${n}"><div class="xbc-y">${Array.from({ length: cells }, (_, k) => `<span>${(cells - k) * step}</span>`).join('')}<span class="z">0</span><em></em></div>
      ${S.labels.map((l, i) => `<div class="xbc-col" data-i="${i}">${Array.from({ length: cells }, (_, k) => `<i data-h="${cells - k}"></i>`).join('')}<b>${l}</b></div>`).join('')}</div>
      <div class="center"><button class="btn mint" id="okb" type="button">畫好了！</button></div>`;
    $$('.xbc-col', st).forEach(col => $$('i', col).forEach(c => c.onclick = () => {
      const i = +col.dataset.i, h = +c.dataset.h; sfx('tap'); hgt[i] = hgt[i] === h ? h - 1 : h;
      $$('i', col).forEach(x => x.classList.toggle('on', +x.dataset.h <= hgt[i]));
    }));
    $('#okb', st).onclick = () => {
      const bad = vals.findIndex((v, i) => hgt[i] * step !== v);
      if (bad >= 0) return api.bad(`「${S.labels[bad]}」是 ${vals[bad]} ${S.unit}，一格是 ${step}，要畫 ${vals[bad] / step} 格！`, `${S.labels[bad]} 畫了 ${hgt[bad] * step}`, `${S.labels[bad]} ${vals[bad]}`);
      api.ok('長條圖畫對了！'); speak('長條圖畫對了'); r++; later(round, 1800);
    };
  }
  round();
}

/* ===== 補 10-B 報讀長條圖 ===== */
function x10B(st) {
  const S = pick(XBARSET), step = pick([2, 5, 10]), vals = xData(S.labels.length, step, 9), top = step * 10;
  const vis = () => chartSVG({ ...S, vals, step, top });
  const mx = Math.max(...vals), mn = Math.min(...vals), i1 = vals.indexOf(mx), i2 = vals.indexOf(mn), k = rand(0, S.labels.length - 1), tot = vals.reduce((a, b) => a + b, 0);
  quiz(st, [
    { q: '這張長條圖，縱軸一格代表多少？', vis: vis(), opts: [step, step * 2, 1].filter((v, i, a) => a.indexOf(v) === i).map(v => xop(xsm(`${v} ${S.unit}`), v === step)), keep: true, hint: '看縱軸上相鄰兩條線差多少！' },
    { q: `「${S.labels[k]}」是多少${S.unit}？`, vis: vis(), ans: vals[k], unit: S.unit, hint: `一格 ${step}，數一數長條有幾格高！`, after: `${S.labels[k]} ${vals[k]} ${S.unit}` },
    { q: '哪一項最多？', vis: vis(), opts: S.labels.map((l, i) => xop(xsm(l), i === i1)), keep: true, hint: '找最高的長條！', after: `${S.labels[i1]} 最多，${mx} ${S.unit}` },
    { q: `最多的比最少的多幾${S.unit}？`, vis: vis(), ans: mx - mn, eq: `${mx} − ${mn}`, nums: [mx, mn, ...vals.filter(v => v !== mx && v !== mn)], unit: S.unit, hint: '最高的減最低的', after: `${mx} − ${mn} = ${mx - mn}（${S.unit}）` },
    { q: `全部合起來是多少${S.unit}？`, vis: vis(), ans: tot, unit: S.unit, hint: '把每一條的數量加起來！', after: `${vals.join(' + ')} = ${tot}` }
  ]);
}

/* ===== 補 10-C 折線圖挑戰 ===== */
function x10C(st) {
  const S = pick(XLINESET), step = pick([2, 5]), top = step * 10;
  let vals; do { vals = Array.from({ length: 5 }, () => rand(1, 9) * step); } while (new Set(vals.slice(1).map((v, i) => v - vals[i])).size < 4 || vals.slice(1).every((v, i) => v >= vals[i]) || vals.slice(1).every((v, i) => v <= vals[i]));
  const vis = () => chartSVG({ ...S, vals, step, top, line: true });
  const diffs = vals.slice(1).map((v, i) => v - vals[i]), up = Math.max(...diffs), iu = diffs.indexOf(up), down = diffs.findIndex(d => d < 0), k = rand(0, 4);
  const seg = i => `${S.labels[i]}到${S.labels[i + 1]}`;
  quiz(st, [
    { q: `${S.labels[k]}是多少${S.unit}？`, vis: vis(), ans: vals[k], unit: S.unit, hint: `一格 ${step}，看點的位置對到縱軸哪裡！`, after: `${S.labels[k]} ${vals[k]} ${S.unit}` },
    { q: '哪一段<b>增加</b>得最多？', sp: '哪一段增加得最多？', vis: vis(), opts: [0, 1, 2, 3].map(i => xop(xsm(seg(i)), i === iu)), keep: true, hint: '線往上爬得最陡的那一段！', after: `${seg(iu)}增加 ${up} ${S.unit}` },
    // 只放一段減少的當答案，其他減少的段不放進選項
    { q: '哪一段是<b>減少</b>的？', sp: '哪一段是減少的？', vis: vis(), opts: [0, 1, 2, 3].filter(i => i === down || diffs[i] >= 0).map(i => xop(xsm(seg(i)), i === down)), keep: true, hint: '線往下走，表示變少了！' },
    { q: `${S.labels[4]}比${S.labels[0]}${vals[4] >= vals[0] ? '多' : '少'}幾${S.unit}？`, vis: vis(), ans: Math.abs(vals[4] - vals[0]), unit: S.unit, hint: '大的減小的', after: `${Math.max(vals[4], vals[0])} − ${Math.min(vals[4], vals[0])} = ${Math.abs(vals[4] - vals[0])}` },
    () => { const c = pick([['記錄一棵樹每個月長多高', '折線圖'], ['比較各班喜歡的水果人數', '長條圖'], ['記錄一週每天的氣溫變化', '折線圖'], ['比較各種顏色的球有幾個', '長條圖']]); return { q: `「${c[0]}」，用哪一種統計圖最容易看出來？`, opts: [xop('長條圖', c[1] === '長條圖'), xop('折線圖', c[1] === '折線圖')], keep: true, hint: '看「變化的情形」用折線圖；比較「各項多少」用長條圖。' }; }
  ]);
}

/* 統計圖、表格的樣式（只給補充單元用） */
document.head.insertAdjacentHTML('beforeend', `<style>
.xchart{width:min(360px,92vw);height:auto;background:#fff;border-radius:16px;border:3px solid #e8dcf5}
.xtable{border-collapse:collapse;font-size:18px;background:#fff;margin:0 auto}.xtable caption{font-weight:900;padding:4px}
.xtable th,.xtable td{border:2px solid #cbb8e6;padding:4px 6px;text-align:center;white-space:nowrap;font-size:16px}.xtable th{background:#f6f2ff}
.xbc{display:grid;grid-template-columns:34px repeat(var(--n),1fr);gap:6px;max-width:420px;margin:8px auto;align-items:end}
.xbc-y{display:flex;flex-direction:column;font-size:13px;font-weight:700;text-align:right}
.xbc-y span{flex:none;height:30px;line-height:1;transform:translateY(-7px)}.xbc-y span.z{height:0}.xbc-y em{flex:none;height:24px}
.xbc-col{display:flex;flex-direction:column;align-items:stretch}.xbc-col i{flex:none;box-sizing:border-box;height:28px;margin-top:2px;border:2px dashed #d8c8ee;border-radius:4px;cursor:pointer;background:#fff}
.xbc-col i.on{background:#5bb4ff;border:2px solid #3b8fd6}.xbc-col b{flex:none;height:20px;font-size:13px;text-align:center;margin-top:4px;white-space:nowrap}
</style>`);

Object.assign(LEVELS, {
  x2: [x2A, x2B, x2C],
  x4: [x4A, x4B, x4C],
  x6: [x6A, x6B, x6C],
  x10: [x10A, x10B, x10C]
});
