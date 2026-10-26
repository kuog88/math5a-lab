'use strict';
/* 第 1 單元 分數的計算／第 2 單元 數的十進位結構／第 3 單元 小數的乘法／第 4 單元 扇形／第 5 單元 體積 */

const cmpOpts = (a, b) => [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }];
const sign = (a, b) => a > b ? '＞' : a < b ? '＜' : '＝';
/* 和 b 互質的 1 ~ b-1 */
const coprime = b => pick(Array.from({ length: b - 1 }, (_, i) => i + 1).filter(a => gcd(a, b) === 1));
const comma = n => n.toLocaleString('en-US');
/* 分數答案的「答對後」說明：不是最簡就補上約分 */
const fracAfter = (lhs, n, d) => { const [a, b] = simp(n, d); return `${lhs} ＝ ${F(n, d)}${a !== n ? ` ＝ ${b === 1 ? a : F(a, b)}` : ''}`; };

/* ===== 1-A 石板平分：整數相除用分數表示 ===== */
function u1A(st) {
  const tasks = shuffle([[3, 4], [2, 3], [4, 5], [5, 4], [3, 5], [7, 4]]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [a, b] = tasks[r];
    api.say(`太陽神殿有 <b>${a}</b> 塊一樣大的石板，要平分給 <b>${b}</b> 位隊員。每塊都切成 ${b} 份，點出<b>一位隊員</b>分到的部分。`, `${a}塊石板平分給${b}位隊員，點出一位隊員分到的部分`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="fbars">${Array.from({ length: a }, () => `<div class="fbar">${Array.from({ length: b }, () => '<div class="seg"></div>').join('')}</div>`).join('')}</div>
      <div class="readout">已選 <span id="cnt">0</span> 份（每份是 ${F(1, b)} 塊）</div>
      <div class="center"><button class="btn gold" id="okb" type="button">分好了！</button></div><div class="kwrap" id="kw"></div>`;
    let n = 0;
    $$('.seg', st).forEach(s => s.onclick = () => {
      if ($('#okb', st).disabled) return;
      s.classList.toggle('on'); sfx('tap');
      n = $$('.seg.on', st).length; $('#cnt', st).textContent = n;
    });
    $('#okb', st).onclick = () => {
      if (n !== a) return api.bad(`每塊石板，每人都拿 1 份；${a} 塊就拿 ${a} 份喔！`);
      $('#okb', st).disabled = true; api.ok('分對了！');
      api.say(`一位隊員分到 ${a} 個 ${F(1, b)} 塊。用分數表示：${a} ÷ ${b} ＝ ? 塊`);
      fracpad($('#kw', st), [a, b], () => {
        $('#kw', st).insertAdjacentHTML('afterend', `<div class="center"><span class="after">${a} ÷ ${b} ＝ ${F(a, b)} 塊</span></div>`);
        speak(`${a}除以${b}等於${b}分之${a}塊`); r++; later(round, 2300);
      }, `${a} 個 1/${b} 就是 ${b} 分之 ${a}`);
    };
  }
  round();
}

/* ===== 1-B 分數倍與積的大小 ===== */
function u1B(st) {
  quiz(st, [
    () => { const q = pick([3, 4, 5, 6, 8]), p = coprime(q), n = q * rand(2, 6), ans = n / q * p; return { q: `一袋神殿細沙重 ${n} 公斤，${F(p, q)} 袋重幾公斤？`, ans, unit: '公斤', hint: `先算 ${n} ÷ ${q}，再乘以 ${p}。`, after: `${n} × ${F(p, q)} ＝ ${ans} 公斤` }; },
    () => { const b = rand(3, 7), a = coprime(b), d = rand(2, 6), c = coprime(d); return { q: `${F(a, b)} × ${F(c, d)} ＝ ?`, frac: [a * c, b * d], hint: '分子乘分子，分母乘分母。', after: fracAfter(`${F(a, b)} × ${F(c, d)}`, a * c, b * d) }; },
    () => { const [a, b, c, d] = pick([[3, 4, 2, 3], [5, 6, 3, 5], [4, 5, 1, 2], [2, 3, 3, 4], [5, 8, 2, 5]]); return { q: `一條金色緞帶長 ${F(a, b)} 公尺，用掉它的 ${F(c, d)}，用掉幾公尺？`, frac: [a * c, b * d], hint: `用掉 ${a}/${b} 公尺的 ${c}/${d} 倍，用乘法算。`, after: fracAfter(`${F(a, b)} × ${F(c, d)}`, a * c, b * d) + ' 公尺' }; },
    () => { const n = pick([24, 36, 48, 60]), m = pick([[3, 5], [7, 4], [5, 8], [9, 5], [2, 3]]), v = n * m[0] / m[1]; return { q: `${n} × ${F(m[0], m[1])} ○ ${n}`, keep: true, opts: cmpOpts(v, n), hint: '乘數比 1 大，積就比被乘數大；乘數比 1 小，積就變小。', after: `${n} × ${F(m[0], m[1])} ＝ ${v}，${sign(v, n)} ${n}` }; },
    () => { const m = pick([[4, 3], [2, 7], [11, 6], [5, 9]]), [a, b] = pick([[3, 4], [2, 5], [5, 6]]); const L = a * m[0] / (b * m[1]), R = a / b; return { q: `${F(a, b)} × ${F(m[0], m[1])} ○ ${F(a, b)}`, keep: true, opts: cmpOpts(L, R), hint: `看乘數 ${m[0]}/${m[1]} 比 1 大還是比 1 小。`, after: `乘數 ${F(m[0], m[1])} ${m[0] > m[1] ? '＞' : '＜'} 1，所以積${m[0] > m[1] ? '變大' : '變小'}` }; },
    { q: '一個數（不是 0）乘以<b>真分數</b>，積會比原來的數怎麼樣？', opts: [{ h: '變小', ok: true }, { h: '變大', ok: false }, { h: '不變', ok: false }], hint: '真分數比 1 小，乘以比 1 小的數，積會變小。' }
  ]);
}

/* ===== 1-C 分數除以整數 ===== */
function u1C(st) {
  quiz(st, shuffle([
    () => { const b = pick([5, 7, 9, 11]), n = pick([2, 3]), k = rand(1, Math.floor((b - 1) / n)), a = n * k; return { q: `${F(a, b)} ÷ ${n} ＝ ?`, frac: [a, b * n], hint: '分子可以被整除時，直接把分子除以整數。', after: `${F(a, b)} ÷ ${n} ＝ ${FS(a, b * n)}` }; },
    () => { const b = pick([3, 4, 5, 7]), a = coprime(b), n = pick([2, 3, 4].filter(x => a % x)); return { q: `${F(a, b)} ÷ ${n} ＝ ?`, frac: [a, b * n], hint: `分子不能整除時，把分母乘以 ${n}。`, after: `${F(a, b)} ÷ ${n} ＝ ${F(a, b + ' × ' + n)} ＝ ${FS(a, b * n)}` }; },
    () => { const [a, b, n, what, per] = pick([[4, 5, 2, '公升椰棗汁', '人'], [9, 10, 3, '公斤香料', '袋'], [3, 4, 5, '公尺麻繩', '段'], [6, 7, 4, '公斤沙金', '罐']]); return { q: `${F(a, b)} ${what}平分成 ${n} ${per}，每${per}是多少？`, frac: [a, b * n], hint: `用 ${a}/${b} ÷ ${n} 來算。`, after: `${F(a, b)} ÷ ${n} ＝ ${FS(a, b * n)}` }; },
    () => { const b = rand(4, 9), a = rand(2, 13); return { q: `${a} 公升水平分給 ${b} 隻駱駝，每隻喝幾公升？（用分數回答）`, frac: [a, b], hint: '整數相除的結果可以用分數表示：被除數當分子，除數當分母。', after: `${a} ÷ ${b} ＝ ${FS(a, b)} 公升` }; },
    () => { const n = pick([2, 3, 4]), b = pick([5, 7]), a = coprime(b); return { q: `□ ÷ ${n} ＝ ${F(a, b)}，□ ＝ ?`, frac: [a * n, b], hint: `用乘法還原：□ ＝ ${a}/${b} × ${n}。`, after: `□ ＝ ${F(a, b)} × ${n} ＝ ${FS(a * n, b)}` }; },
    () => { const b = pick([5, 7, 9]), a = coprime(b), n = rand(2, 4); return { q: `${F(a, b)} ÷ ${n} ○ ${F(a, b)}`, keep: true, opts: cmpOpts(a / (b * n), a / b), hint: '分給好幾份，每一份會比原來少。', after: `${F(a, b)} ÷ ${n} ＝ ${F(a, b * n)}，比 ${F(a, b)} 小` }; }
  ]));
}

/* ===== 2-A 位值石盤 ===== */
function u2A(st) {
  const DEC = { names: ['個位', '十分位', '百分位', '千分位'], w: [1000, 100, 10, 1] };
  const BIG = { names: ['兆位', '千億位', '百億位', '十億位', '億位'], w: [10000, 1000, 100, 10, 1] };
  const mk = big => {
    if (big) { const e = rand(1, 9), f = rand(11, 19), g = rand(1, 9); return { big, T: e * 10000 + f * 100 + g, desc: `<b>${e}</b> 個一兆、<b>${f}</b> 個一百億和 <b>${g}</b> 個一億` }; }
    const a = rand(1, 8), b = rand(1, 9), c = rand(10, 19), d = rand(1, 9);
    return { big, T: a * 1000 + b * 100 + c * 10 + d, desc: `<b>${a}</b> 個 1、<b>${b}</b> 個 0.1、<b>${c}</b> 個 0.01 和 <b>${d}</b> 個 0.001` };
  };
  const tasks = [mk(false), mk(true), mk(false), mk(true)];
  const read = (big, t) => big ? `${Math.floor(t / 10000)} 兆${t % 10000 ? ` ${t % 10000} 億` : ''}` : String(rd(t / 1000));
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const { big, T, desc } = tasks[r], C = big ? BIG : DEC, v = C.w.map(() => 0);
    api.say(`方尖碑上刻著：${desc}。在位值石盤上排出這個數！滿十要進位喔。`);
    st.innerHTML = `${dots(r, tasks.length)}<table class="pv"><tr>${C.names.map((n, i) => (!big && i === 1 ? '<th class="dot"></th>' : '') + `<th>${n}</th>`).join('')}</tr>
      <tr>${C.names.map((n, i) => (!big && i === 1 ? '<td class="dot">.</td>' : '') + `<td><button type="button" data-i="${i}" data-d="1">▲</button><span class="v" id="v${i}">0</span><button type="button" data-i="${i}" data-d="-1">▼</button></td>`).join('')}</tr></table>
      <div class="pv-read">目前：<span id="now"></span></div><div class="center"><button class="btn gold" id="okb" type="button">排好了！</button></div>`;
    const draw = () => { v.forEach((x, i) => $('#v' + i, st).textContent = x); $('#now', st).textContent = read(big, v.reduce((s, x, i) => s + x * C.w[i], 0)); };
    $$('.pv button', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; v[i] = (v[i] + +b.dataset.d + 10) % 10; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const s = v.reduce((a, x, i) => a + x * C.w[i], 0);
      if (s === T) { $('#okb', st).disabled = true; api.ok('排對了！'); $('#okb', st).insertAdjacentHTML('afterend', `<div><span class="after">這個數是 ${read(big, T)}</span></div>`); speak('這個數是' + read(big, T)); r++; later(round, 2200); }
      else api.bad(big ? '10 個百億是 1 個千億，記得進位！' : '10 個 0.01 是 1 個 0.1，記得進位！');
    };
    draw();
  }
  round();
}

/* ===== 2-B 大數與多位小數 ===== */
function u2B(st) {
  quiz(st, [
    { q: '1 兆是幾個 1 億？', ans: 10000, unit: '個', hint: '萬萬是億，萬億是兆。', after: '1 兆 ＝ 10000 億' },
    { q: '0.001 的 10 倍是多少？', opts: [{ h: '0.01', ok: true }, { h: '0.1', ok: false }, { h: '0.0001', ok: false }], hint: '10 個 0.001 是 0.01。', after: '0.001 × 10 ＝ 0.01' },
    () => { const n = rand(101, 999); return { q: `${rd(n / 100)} 是幾個 0.01？`, ans: n, unit: '個', hint: '1 是 100 個 0.01，0.1 是 10 個 0.01。', after: `${rd(n / 100)} 是 ${n} 個 0.01` }; },
    () => { const p = rand(1, 3), ds = [rand(0, 9), rand(0, 9), rand(1, 9)], num = rand(1, 9) + '.' + ds.join(''), digit = ds[p - 1], name = ['十分位', '百分位', '千分位'][p - 1]; return { q: `${num} 的<b>${name}</b>是哪個數字？`, ans: digit, hint: '小數點後第一位是十分位，第二位是百分位，第三位是千分位。', after: `${name}是 ${digit}，表示 ${digit} 個 ${['0.1', '0.01', '0.001'][p - 1]}` }; },
    () => { const a = rand(10, 99), b = rand(1, 9) * 100 + rand(0, 9) * 10 + rand(1, 9), A = a * 10, sa = rd(a / 100), sb = rd(b / 1000); return { q: `${sa} ○ ${sb}`, keep: true, opts: cmpOpts(A, b), hint: '從十分位開始，一位一位比。', after: `${sa} ${sign(A, b)} ${sb}` }; },
    { q: '0.6 和 0.600 哪一個比較大？', opts: [{ h: '一樣大', ok: true }, { h: '0.600 比較大', ok: false }, { h: '0.6 比較大', ok: false }], hint: '小數末尾的 0 可以去掉，大小不變。' },
    { q: '1 億的 10 倍是多少？', opts: [{ h: '十億', ok: true }, { h: '一兆', ok: false }, { h: '一千萬', ok: false }], hint: '每多一位就是 10 倍：億、十億、百億、千億、兆。' }
  ]);
}

/* ===== 2-C 十進位挑戰 ===== */
function u2C(st) {
  quiz(st, shuffle([
    () => { const x = rand(1, 9), y = rand(1, 9), z = rand(1, 9), D = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']; const v = (x * 1000 + y) * 1e8 + z * 1000 * 1e4; return { q: `哪一個是「${D[x]}千零${D[y]}億${D[z]}千萬」？`, opts: [{ h: comma(v), ok: true }, { h: comma((x * 100 + y) * 1e8 + z * 1000 * 1e4), ok: false, hint: '千億位要有數字喔，看清楚是「幾千」億。' }, { h: comma((x * 1000 + y) * 1e8 + z * 100 * 1e4), ok: false, hint: '「千萬」是 4 個萬的位，要看清楚。' }], hint: '先寫億的部分，再寫萬的部分，空位補 0。', after: `${D[x]}千零${D[y]}億${D[z]}千萬 ＝ ${comma(v)}` }; },
    () => { const k = rand(11, 99); return { q: `${rd(k / 10)} 億 ＝ ? 萬`, ans: k * 1000, unit: '萬', hint: '1 億 ＝ 10000 萬。', after: `${rd(k / 10)} 億 ＝ ${k * 1000} 萬` }; },
    () => { let n; do n = rand(1001, 9999); while (n % 10 === 0); return { q: `${rd(n / 1000)} × 100 ＝ ?`, ans: rd(n / 10), dec: true, hint: '乘以 100，小數點往右移 2 位。', after: `${rd(n / 1000)} × 100 ＝ ${rd(n / 10)}` }; },
    () => { let n; do n = rand(101, 999); while (n % 10 === 0); return { q: `${rd(n / 10)} ÷ 1000 ＝ ?`, ans: rd(n / 10000), dec: true, hint: '除以 1000，小數點往左移 3 位，不夠的位補 0。', after: `${rd(n / 10)} ÷ 1000 ＝ ${rd(n / 10000)}` }; },
    () => { const a = rand(1, 9); return { q: `比 ${a}.999 多 0.001 的數是多少？`, ans: a + 1, dec: true, hint: '0.999 再加 0.001，千分位、百分位、十分位都要進位。', after: `${a}.999 ＋ 0.001 ＝ ${a + 1}` }; },
    () => { const p = rand(1, 9), q = rand(2, 9), s = rand(1, 8), t = rand(1, 9), ans = t < s ? q : q - 1; return { q: `0.${p}□${t} ＜ 0.${p}${q}${s}，□ 裡最大可以填多少？`, ans, hint: `先試試 □ 填 ${q}，再比較千分位。`, after: `□ 最大是 ${ans}：0.${p}${ans}${t} ＜ 0.${p}${q}${s}` }; }
  ]));
}

/* ===== 3-A 百格圖乘一乘 ===== */
function u3A(st) {
  const tasks = [];
  while (tasks.length < 3) { const a = rand(2, 9), b = rand(2, 9); if (a !== b && !tasks.some(t => t[0] === a && t[1] === b)) tasks.push([a, b]); }
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [a, b] = tasks[r]; let w = 0, h = 0;
    api.say(`整張方格布是 1。調整寬和高，塗出 <b>0.${a} × 0.${b}</b> 的長方形（寬 0.${a}、高 0.${b}）。`, `塗出零點${a}乘以零點${b}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center">${grid100SVG(28)}</div>
      <div class="ctl"><div class="grp">寬 <button type="button" data-k="w" data-d="-1">−</button><span class="v" id="wv">0</span><button type="button" data-k="w" data-d="1">＋</button></div>
      <div class="grp">高 <button type="button" data-k="h" data-d="-1">−</button><span class="v" id="hv">0</span><button type="button" data-k="h" data-d="1">＋</button></div></div>
      <div class="center"><button class="btn gold" id="okb" type="button">塗好了！</button></div><div class="kwrap" id="kw"></div>`;
    const draw = () => { $('#wv', st).textContent = rd(w / 10); $('#hv', st).textContent = rd(h / 10); $$('rect.c', st).forEach(c => c.classList.toggle('on', +c.dataset.c < w && 9 - +c.dataset.r < h)); };
    $$('.grp button', st).forEach(bt => bt.onclick = () => { if ($('#okb', st).disabled) return; const d = +bt.dataset.d; if (bt.dataset.k === 'w') w = Math.max(0, Math.min(10, w + d)); else h = Math.max(0, Math.min(10, h + d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (!((w === a && h === b) || (w === b && h === a))) return api.bad(`寬要是 0.${a}（${a} 行），高要是 0.${b}（${b} 列）。`);
      $('#okb', st).disabled = true; api.ok('塗對了！');
      api.say(`塗了 ${a} × ${b} ＝ ${a * b} 格，每格是 0.01。所以 0.${a} × 0.${b} ＝ ?`);
      keypad($('#kw', st), rd(a * b / 100), () => {
        $('#kw', st).insertAdjacentHTML('afterend', `<div class="center"><span class="after">0.${a} × 0.${b} ＝ ${rd(a * b / 100)}</span></div>`); speak(`答案是${rd(a * b / 100)}`); r++; later(round, 2200);
      }, `${a * b} 個 0.01 是多少？`, '', true);
    };
    draw();
  }
  round();
}

/* ===== 3-B 積會變大還是變小 ===== */
function u3B(st) {
  quiz(st, [
    () => { const n = rand(12, 60), m = pick([0.8, 0.5, 0.75, 1.2, 2.5, 1.05]), v = rd(n * m); return { q: `${n} × ${m} ○ ${n}`, keep: true, opts: cmpOpts(v, n), hint: '乘數比 1 大，積比被乘數大；乘數比 1 小，積比被乘數小。', after: `${n} × ${m} ＝ ${v}` }; },
    () => { const a = pick([2.4, 3.6, 5.2, 8.5]), m = pick([1.3, 0.6, 0.9, 1.5]), v = rd(a * m); return { q: `${a} × ${m} ○ ${a}`, keep: true, opts: cmpOpts(v, a), hint: `看乘數 ${m} 比 1 大還是小。`, after: `${a} × ${m} ＝ ${v}` }; },
    () => { const [a, b] = pick([[2.13, 1.2], [1.23, 2.1], [0.4, 0.27], [3.05, 0.6], [1.5, 0.007]]); const k = (String(a).split('.')[1] || '').length + (String(b).split('.')[1] || '').length; return { q: `${a} × ${b}，積是幾位小數？（先不化簡）`, ans: k, unit: '位', hint: '被乘數幾位小數加上乘數幾位小數。', after: `${a} 是 ${(String(a).split('.')[1] || '').length} 位、${b} 是 ${(String(b).split('.')[1] || '').length} 位，積是 ${k} 位小數` }; },
    () => { const [x, y] = pick([[136, 24], [215, 13], [48, 125], [306, 15]]), p = x * y; return { q: `已知 ${x} × ${y} ＝ ${p}，那麼 ${rd(x / 100)} × ${rd(y / 10)} ＝ ?`, ans: rd(p / 1000), dec: true, hint: '被乘數變成 1/100，乘數變成 1/10，積就變成 1/1000。', after: `${rd(x / 100)} × ${rd(y / 10)} ＝ ${rd(p / 1000)}` }; },
    () => { const [x, y] = pick([[136, 24], [215, 13], [306, 15]]), p = x * y; return { q: `已知 ${x} × ${y} ＝ ${p}，那麼 ${rd(x / 10)} × ${rd(y / 100)} ＝ ?`, ans: rd(p / 1000), dec: true, hint: '一共縮小了 10 × 100 ＝ 1000 倍。', after: `${rd(x / 10)} × ${rd(y / 100)} ＝ ${rd(p / 1000)}` }; },
    { q: '乘數小於 1（不是 0）的時候，積和被乘數比起來？', opts: [{ h: '積比較小', ok: true }, { h: '積比較大', ok: false }, { h: '一樣大', ok: false }], hint: '例如 10 × 0.5 ＝ 5，變小了。' }
  ]);
}

/* ===== 3-C 市集算帳 ===== */
function u3C(st) {
  quiz(st, shuffle([
    () => { const A = rand(11, 99), B = rand(2, 9), v = rd(A * B / 100); return { q: `${rd(A / 10)} × ${rd(B / 10)} ＝ ?`, ans: v, dec: true, hint: '先當整數乘，再數一數共有幾位小數。', after: `${rd(A / 10)} × ${rd(B / 10)} ＝ ${v}` }; },
    () => { const A = rand(101, 999), n = rand(3, 9), v = rd(A * n / 100); return { q: `${rd(A / 100)} × ${n} ＝ ?`, ans: v, dec: true, hint: '先算整數乘法，積是 2 位小數。', after: `${rd(A / 100)} × ${n} ＝ ${v}` }; },
    () => { const n = pick([8, 4]), v = rd(0.125 * n); return { q: `0.125 × ${n} ＝ ?`, ans: v, dec: true, hint: '125 × 8 ＝ 1000 喔！', after: `0.125 × ${n} ＝ ${v}` }; },
    () => { const [p, q, u, txt] = pick([[32.5, 2.4, '元', '一公升椰子油 32.5 元，買 2.4 公升要幾元？'], [45, 2.6, '元', '絲綢每公尺 45 元，買 2.6 公尺要幾元？'], [1.8, 3.5, '公尺', '一匹布長 1.8 公尺，3.5 匹布長幾公尺？']]); const v = rd(p * q); return { q: txt, ans: v, unit: u, dec: true, hint: `${p} × ${q}`, after: `${p} × ${q} ＝ ${v} ${u}` }; },
    () => { const [l, w] = pick([[12.5, 4.8], [6.5, 3.2], [7.5, 0.8]]), v = rd(l * w); return { q: `一塊長方形攤位長 ${l} 公尺、寬 ${w} 公尺，面積是多少平方公尺？`, ans: v, unit: '平方公尺', dec: true, hint: '長方形面積 ＝ 長 × 寬。', after: `${l} × ${w} ＝ ${v} 平方公尺` }; },
    () => { const p = pick([0.6, 0.8, 1.2]), k = pick([0.75, 0.5, 2.5]), v = rd(p * k); return { q: `一包香料重 ${p} 公斤，${k} 包重幾公斤？`, ans: v, unit: '公斤', dec: true, hint: `${p} × ${k}`, after: `${p} × ${k} ＝ ${v} 公斤` }; }
  ]));
}

/* ===== 4-A 轉出圓心角 ===== */
function u4A(st) {
  const tasks = shuffle([['1/4 圓', 90], ['1/3 圓', 120], ['1/6 圓', 60], ['1/2 圓', 180], ['3/4 圓', 270], ['圓心角 150° 的扇形', 150], ['1/8 圓', 45], ['5/6 圓', 300]]).slice(0, 4);
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const [name, T] = tasks[r]; let deg = 30;
    api.say(`天文台的星盤要轉出 <b>${name}</b>。拖曳金色扇形的邊（或按按鈕），轉出正確的圓心角！`, `轉出${name}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="dial"></div>
      <div class="ctl"><div class="grp"><button type="button" data-d="-15">−15°</button><button type="button" data-d="-5">−5°</button><span class="v" id="dv"></span><button type="button" data-d="5">＋5°</button><button type="button" data-d="15">＋15°</button></div></div>
      <div class="center"><button class="btn gold" id="okb" type="button">轉好了！</button></div>`;
    const draw = () => { $('#dial', st).innerHTML = sectorSVG(deg, { size: 260, full: true, label: deg + '°' }); $('#dv', st).textContent = '圓心角 ' + deg + '°'; };
    $$('.grp button', st).forEach(b => b.onclick = () => { deg = Math.max(5, Math.min(355, deg + +b.dataset.d)); sfx('tap'); draw(); });
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
      else api.bad(name.includes('/') ? `一整圈是 360°，${name}的圓心角是 360° 的 ${name.replace(' 圓', '')}。` : `要轉到 ${T}°，現在是 ${deg}°。`);
    };
    draw();
  }
  round();
}

/* ===== 4-B 認識扇形 ===== */
function u4B(st) {
  const fig = d => `<svg viewBox="0 0 110 110" width="96" height="96"><circle cx="55" cy="55" r="44" fill="none" stroke="#c9a86a" stroke-width="2" stroke-dasharray="4 4"/><path d="${d}" fill="#e9a21b" fill-opacity=".85" stroke="#3d2410" stroke-width="3" stroke-linejoin="round"/><circle cx="55" cy="55" r="3" fill="#3d2410"/></svg>`;
  const P = a => { const t = a * Math.PI / 180; return `${(55 + 44 * Math.cos(t)).toFixed(1)},${(55 - 44 * Math.sin(t)).toFixed(1)}`; };
  const sector = fig(`M55,55L${P(20)}A44,44 0 0,0 ${P(130)}Z`), segment = fig(`M${P(20)}A44,44 0 0,0 ${P(160)}Z`), wrongV = fig(`M${P(270)}L${P(30)}A44,44 0 0,0 ${P(150)}Z`);
  quiz(st, [
    { q: '哪一個是<b>扇形</b>？（虛線是圓）', opts: [{ h: sector, ok: true }, { h: segment, ok: false, hint: '這個沒有經過圓心，是一條弦和一段圓弧。' }, { h: wrongV, ok: false, hint: '這個的頂點在圓周上，不是圓心。' }], hint: '扇形的頂點在圓心。' },
    { q: '扇形是由<b>兩條半徑</b>和一段什麼圍成的圖形？', opts: [{ h: '圓弧', ok: true }, { h: '直徑', ok: false }, { h: '線段', ok: false }], hint: '扇形外圍彎彎的那一段是圓弧。' },
    { q: '扇形中，兩條半徑所夾的角叫做什麼？', opts: [{ h: '圓心角', ok: true }, { h: '直角', ok: false }, { h: '平角', ok: false }], hint: '這個角的頂點在圓心。' },
    () => { const [n, d] = pick([[1, 6], [1, 4], [1, 3], [1, 8], [1, 2]]); return { q: `${F(n, d)} 圓的圓心角是幾度？`, vis: sectorSVG(360 / d, { size: 150, full: true }), ans: 360 / d, unit: '度', hint: `一整圈是 360°，360 ÷ ${d}。`, after: `360° ÷ ${d} ＝ ${360 / d}°` }; },
    () => { const a = pick([45, 60, 30, 90]); return { q: `一個圓可以剛好分成幾個圓心角 ${a}° 的扇形？`, ans: 360 / a, unit: '個', hint: `360 ÷ ${a}`, after: `360 ÷ ${a} ＝ ${360 / a} 個` }; },
    { q: '圓心角是 180° 的扇形，也就是什麼？', vis: sectorSVG(180, { size: 150, full: true }), opts: [{ h: `${F(1, 2)} 圓`, ok: true }, { h: `${F(1, 4)} 圓`, ok: false }, { h: '一整個圓', ok: false }], hint: '180° 是 360° 的一半。' }
  ]);
}

/* ===== 4-C 扇形與幾分之幾圓 ===== */
function u4C(st) {
  quiz(st, shuffle([
    () => { const a = pick([120, 72, 270, 240, 40]); const [n, d] = simp(a, 360); return { q: `這個扇形的圓心角是 ${a}°，它是幾分之幾圓？`, vis: sectorSVG(a, { size: 160, full: true, label: a + '°' }), frac: [a, 360], simplest: true, hint: `用 ${a}/360 再約分。`, after: `${a}/360 ＝ ${F(n, d)}，是 ${F(n, d)} 圓` }; },
    () => { const k = rand(2, 5); return { q: `${k} 個 ${F(1, 6)} 圓拼在一起，是圓心角幾度的扇形？`, ans: 60 * k, unit: '度', hint: '1/6 圓是 60°。', after: `60° × ${k} ＝ ${60 * k}°` }; },
    { q: `${F(1, 4)} 圓和 ${F(1, 3)} 圓拼在一起，圓心角是幾度？`, ans: 210, unit: '度', hint: '90° ＋ 120°', after: '90° ＋ 120° ＝ 210°' },
    { q: '時鐘的時針從 12 走到 4，掃過的扇形是幾分之幾圓？', frac: [1, 3], simplest: true, hint: '12 走到 4 是 4 大格，一圈有 12 大格。', after: `4/12 ＝ ${F(1, 3)} 圓（120°）` },
    { q: '兩個扇形半徑一樣長，圓心角一個是 90°、一個是 60°，哪一個比較大？', opts: [{ h: '90° 的扇形', ok: true }, { h: '60° 的扇形', ok: false }, { h: '一樣大', ok: false }], hint: '半徑相同時，圓心角越大，扇形越大。' },
    () => { const [n, d] = pick([[3, 4], [5, 6], [2, 3], [3, 8]]); return { q: `${F(n, d)} 圓的圓心角是幾度？`, ans: 360 / d * n, unit: '度', hint: `360 ÷ ${d} × ${n}`, after: `360° ÷ ${d} × ${n} ＝ ${360 / d * n}°` }; }
  ]));
}

/* ===== 5-A 堆出長方體 ===== */
function u5A(st) {
  const tasks = [];
  while (tasks.length < 3) { const l = rand(2, 5), w = rand(2, 4), h = rand(1, 4); if (!tasks.some(t => t.l === l && t.w === w && t.h === h)) tasks.push({ l, w, h, miss: pick(['l', 'w', 'h']) }); }
  const NM = { l: '長', w: '寬', h: '高' };
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r], V = T.l * T.w * T.h, d = { l: 1, w: 1, h: 1 };
    const given = ['l', 'w', 'h'].filter(k => k !== T.miss).map(k => `${NM[k]} ${T[k]} 公分`).join('、');
    api.say(`用 1 立方公分的小石塊堆一個長方體：${given}，體積要是 <b>${V} 立方公分</b>。調整長、寬、高堆出來！`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="pic"></div>
      <div class="ctl">${['l', 'w', 'h'].map(k => `<div class="grp">${NM[k]} <button type="button" data-k="${k}" data-d="-1">−</button><span class="v" id="${k}v"></span><button type="button" data-k="${k}" data-d="1">＋</button></div>`).join('')}</div>
      <div class="readout">體積：<span id="vv"></span> 立方公分</div><div class="center"><button class="btn gold" id="okb" type="button">堆好了！</button></div>`;
    const draw = () => { $('#pic', st).innerHTML = isoSVG(boxCubes(d.l, d.w, d.h), { u: 24, max: 360 }); ['l', 'w', 'h'].forEach(k => $('#' + k + 'v', st).textContent = d[k]); $('#vv', st).textContent = `${d.l} × ${d.w} × ${d.h} ＝ ${d.l * d.w * d.h}`; };
    $$('.grp button', st).forEach(b => b.onclick = () => { const k = b.dataset.k; d[k] = Math.max(1, Math.min(6, d[k] + +b.dataset.d)); sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      if (d.l === T.l && d.w === T.w && d.h === T.h) { $('#okb', st).disabled = true; api.ok('堆對了！'); speak(`長乘以寬乘以高，${T.l}乘${T.w}乘${T.h}等於${V}立方公分`); r++; later(round, 2000); }
      else if (d.l * d.w * d.h === V) api.bad(`體積對了，但要符合題目：${given}。`);
      else api.bad(`${NM[T.miss]} ＝ ${V} ÷ ${['l', 'w', 'h'].filter(k => k !== T.miss).map(k => T[k]).join(' ÷ ')}，算算看！`);
    };
    draw();
  }
  round();
}

/* ===== 5-B 立方公尺與換算 ===== */
function u5B(st) {
  quiz(st, [
    { q: '1 立方公尺 ＝ ? 立方公分', opts: [{ h: '1000000', ok: true }, { h: '1000', ok: false }, { h: '10000', ok: false }], hint: '1 公尺 ＝ 100 公分，100 × 100 × 100。', after: '100 × 100 × 100 ＝ 1000000' },
    () => { const k = rand(2, 9); return { q: `${k} 立方公尺 ＝ ? 立方公分`, ans: k * 1000000, unit: '立方公分', hint: '1 立方公尺是 1000000 立方公分。', after: `${k} 立方公尺 ＝ ${comma(k * 1000000)} 立方公分` }; },
    () => { const k = rand(11, 49); return { q: `${comma(k * 100000)} 立方公分 ＝ ? 立方公尺`, ans: rd(k / 10), dec: true, unit: '立方公尺', hint: '除以 1000000。', after: `${comma(k * 100000)} 立方公分 ＝ ${rd(k / 10)} 立方公尺` }; },
    () => { const l = rand(3, 6), w = rand(2, 4), h = rand(2, 4); return { q: '這個長方體的體積是多少立方公分？', vis: isoSVG(boxCubes(l, w, h), { u: 22, dims: { l, w, h } }), ans: l * w * h, unit: '立方公分', hint: '長方體體積 ＝ 長 × 寬 × 高。', after: `${l} × ${w} × ${h} ＝ ${l * w * h} 立方公分` }; },
    () => { const [l, w, h] = pick([[2, 1.5, 1], [3, 2, 0.5], [2.5, 2, 2]]), v = rd(l * w * h); return { q: `長 ${l} 公尺、寬 ${w} 公尺、高 ${h} 公尺的石箱，體積是多少立方公尺？`, ans: v, dec: true, unit: '立方公尺', hint: '長 × 寬 × 高，單位是立方公尺。', after: `${l} × ${w} × ${h} ＝ ${v} 立方公尺` }; },
    { q: '正方體的體積公式是什麼？', opts: [{ h: '邊長 × 邊長 × 邊長', ok: true, }, { h: '邊長 × 4', ok: false }, { h: '邊長 × 邊長', ok: false }], hint: '正方體的長、寬、高都是邊長。' }
  ]);
}

/* ===== 5-C 複合形體的體積 ===== */
function u5C(st) {
  const L = () => { const a = rand(4, 6), b = rand(2, 3), c = rand(1, 2), t = rand(2, 3), k = rand(1, 2); return { cubes: [...boxCubes(a, b, c), ...boxCubes(k, b, t, 0, 0, c)], v: a * b * c + k * b * t, txt: `下層：長 ${a}、寬 ${b}、高 ${c}；上層：長 ${k}、寬 ${b}、高 ${t}（單位：公分）`, how: `${a} × ${b} × ${c} ＋ ${k} × ${b} × ${t} ＝ ${a * b * c + k * b * t}` }; };
  const Cut = () => { const a = rand(4, 6), b = rand(3, 4), c = rand(3, 4), x = 2, z = rand(1, 2); const cubes = boxCubes(a, b, c).filter(([i, , k]) => !(i >= a - x && k >= c - z)); return { cubes, v: a * b * c - x * b * z, txt: `大長方體長 ${a}、寬 ${b}、高 ${c}，挖掉一角（長 ${x}、寬 ${b}、高 ${z}）（單位：公分）`, how: `${a} × ${b} × ${c} − ${x} × ${b} × ${z} ＝ ${a * b * c - x * b * z}` }; };
  const Step = () => { const b = rand(2, 3); return { cubes: [...boxCubes(3, b, 1), ...boxCubes(2, b, 1, 0, 0, 1), ...boxCubes(1, b, 1, 0, 0, 2)], v: 6 * b, txt: `每一個小石塊都是 1 立方公分，寬 ${b} 公分的石階`, how: `(3 ＋ 2 ＋ 1) × ${b} ＝ ${6 * b}` }; };
  quiz(st, [L, Cut, Step, L].map(g => () => { const s = g(); return { q: `這個複合形體的體積是多少立方公分？<br><small>${s.txt}</small>`, vis: isoSVG(s.cubes, { u: 22, max: 360 }), ans: s.v, unit: '立方公分', hint: '可以切成兩個長方體相加，或用大長方體減去缺的部分。', after: s.how + ' 立方公分' }; }));
}

LEVELS.u1 = [u1A, u1B, u1C];
LEVELS.u2 = [u2A, u2B, u2C];
LEVELS.u3 = [u3A, u3B, u3C];
LEVELS.u4 = [u4A, u4B, u4C];
LEVELS.u5 = [u5A, u5B, u5C];
