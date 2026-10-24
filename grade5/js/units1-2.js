'use strict';
/* 第 1 單元 折線圖 ／ 第 2 單元 因數和倍數 */

/* ===== 統計圖 ===== */
const CH = { W: 560, H: 340, L: 70, R: 540, T: 34, B: 290 };
const chX = (i, n) => CH.L + (i + 0.5) * (CH.R - CH.L) / n;
const chY = (v, y0, y1) => CH.B - (v - y0) / (y1 - y0) * (CH.B - CH.T);
/* 折線圖的底（格線、刻度、波浪線）；c = {xs, y0, y1, yName, xName, title, broken} */
function chartBase(c) {
  const { xs, y0, y1 } = c, n = xs.length, every = y1 - y0 > 14 ? 2 : 1;
  let h = `<rect x="0" y="0" width="${CH.W}" height="${CH.H}" fill="#fff"/>`;
  h += `<text x="${CH.W / 2}" y="20" text-anchor="middle" font-size="18" font-weight="900" fill="#4a3b5c">${c.title}</text>`;
  for (let v = y0; v <= y1; v++) {
    const y = chY(v, y0, y1);
    h += `<line x1="${CH.L}" y1="${y}" x2="${CH.R}" y2="${y}" stroke="${(v - y0) % every ? '#f1ebf6' : '#ddd3e8'}" stroke-width="${(v - y0) % 5 ? 1 : 2}"/>`;
    if ((v - y0) % every === 0) h += `<text x="${CH.L - 8}" y="${y + 5}" text-anchor="end" font-size="14" font-weight="700" fill="#6b5a7d">${v}</text>`;
  }
  xs.forEach((x, i) => { h += `<line x1="${chX(i, n)}" y1="${CH.T}" x2="${chX(i, n)}" y2="${CH.B}" stroke="#f1ebf6"/><text x="${chX(i, n)}" y="${CH.B + 22}" text-anchor="middle" font-size="15" font-weight="900" fill="#4a3b5c">${x}</text>`; });
  h += `<line x1="${CH.L}" y1="${CH.T - 6}" x2="${CH.L}" y2="${CH.B}" stroke="#4a3b5c" stroke-width="3"/><line x1="${CH.L}" y1="${CH.B}" x2="${CH.R}" y2="${CH.B}" stroke="#4a3b5c" stroke-width="3"/>`;
  if (c.broken) h += `<rect x="${CH.L - 9}" y="${CH.B + 3}" width="18" height="14" fill="#fff"/><path d="M${CH.L - 10} ${CH.B + 6} q5 -5 10 0 t10 0 M${CH.L - 10} ${CH.B + 13} q5 -5 10 0 t10 0" stroke="#e5508f" stroke-width="2.5" fill="none"/><text x="${CH.L - 14}" y="${CH.B + 32}" text-anchor="end" font-size="13" fill="#6b5a7d">0</text>`;
  h += `<text x="${CH.L - 4}" y="${CH.T - 12}" text-anchor="end" font-size="13" font-weight="900" fill="#8a7a99">(${c.yName})</text><text x="${CH.R}" y="${CH.B + 44}" text-anchor="end" font-size="13" font-weight="900" fill="#8a7a99">(${c.xName})</text>`;
  return h;
}
function linePlot(c, vals, color = '#ff6b6b') {
  const n = c.xs.length, pts = vals.map((v, i) => v === null ? null : [chX(i, n), chY(v, c.y0, c.y1)]);
  let h = '';
  for (let i = 1; i < n; i++) if (pts[i - 1] && pts[i]) h += `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${pts[i][0]}" y2="${pts[i][1]}" stroke="${color}" stroke-width="4"/>`;
  pts.forEach(p => { if (p) h += `<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${color}" stroke="#fff" stroke-width="3"/>`; });
  return h;
}
const lineChart = (c, vals) => `<svg class="chart" viewBox="0 0 ${CH.W} ${CH.H + 50}">${chartBase(c)}${linePlot(c, vals)}</svg>`;
/* 複式長條圖：兩組資料並排 */
function barChart2(c) {
  const { xs, a, b, y1 } = c, n = xs.length, bw = 30;
  let h = `<svg class="chart" viewBox="0 0 ${CH.W} ${CH.H + 50}"><rect width="${CH.W}" height="${CH.H + 50}" fill="#fff"/>`;
  h += `<text x="${CH.W / 2}" y="20" text-anchor="middle" font-size="18" font-weight="900" fill="#4a3b5c">${c.title}</text>`;
  for (let v = 0; v <= y1; v += 5) { const y = chY(v, 0, y1); h += `<line x1="${CH.L}" y1="${y}" x2="${CH.R}" y2="${y}" stroke="${v % 10 ? '#f1ebf6' : '#ddd3e8'}"/><text x="${CH.L - 8}" y="${y + 5}" text-anchor="end" font-size="14" font-weight="700" fill="#6b5a7d">${v}</text>`; }
  xs.forEach((x, i) => {
    const cx = chX(i, n);
    h += `<rect x="${cx - bw - 2}" y="${chY(a[i], 0, y1)}" width="${bw}" height="${CH.B - chY(a[i], 0, y1)}" fill="#5bb4ff"/><rect x="${cx + 2}" y="${chY(b[i], 0, y1)}" width="${bw}" height="${CH.B - chY(b[i], 0, y1)}" fill="#ffb347"/>`;
    h += `<text x="${cx}" y="${CH.B + 22}" text-anchor="middle" font-size="15" font-weight="900" fill="#4a3b5c">${x}</text>`;
  });
  h += `<line x1="${CH.L}" y1="${CH.T - 6}" x2="${CH.L}" y2="${CH.B}" stroke="#4a3b5c" stroke-width="3"/><line x1="${CH.L}" y1="${CH.B}" x2="${CH.R}" y2="${CH.B}" stroke="#4a3b5c" stroke-width="3"/>`;
  h += `<text x="${CH.L - 4}" y="${CH.T - 12}" text-anchor="end" font-size="13" font-weight="900" fill="#8a7a99">(本)</text>`;
  h += `<rect x="${CH.R - 150}" y="${CH.T - 4}" width="16" height="16" fill="#5bb4ff"/><text x="${CH.R - 128}" y="${CH.T + 9}" font-size="15" font-weight="900" fill="#4a3b5c">${c.na}</text><rect x="${CH.R - 75}" y="${CH.T - 4}" width="16" height="16" fill="#ffb347"/><text x="${CH.R - 53}" y="${CH.T + 9}" font-size="15" font-weight="900" fill="#4a3b5c">${c.nb}</text>`;
  return h + '</svg>';
}
const TIMES = ['8時', '10時', '12時', '14時', '16時'];
/* 一天的氣溫：最高、最低、上升最多的一段都只有一個 */
function makeTemps() {
  for (;;) {
    const v = [rand(20, 24)];
    for (let i = 1; i < 5; i++) v.push(v[i - 1] + (i < 3 ? rand(1, 4) : rand(-4, 1)));
    if (v.some(x => x < 20 || x > 32)) continue;
    const mx = Math.max(...v), mn = Math.min(...v), d = v.slice(1).map((x, i) => x - v[i]), dm = Math.max(...d);
    if (v.filter(x => x === mx).length > 1 || v.filter(x => x === mn).length > 1 || d.filter(x => x === dm).length > 1) continue;
    if (!d.some(x => x < 0)) continue;
    return v;
  }
}
const tempChart = v => ({ xs: TIMES, y0: 20, y1: 32, yName: '度', xName: '時間', title: '一天的氣溫變化', broken: true });
function makeBooks() {
  for (;;) {
    const a = Array.from({ length: 4 }, () => rand(2, 12) * 5), b = Array.from({ length: 4 }, () => rand(2, 12) * 5);
    const d = a.map((x, i) => Math.abs(x - b[i])), dm = Math.max(...d);
    if (dm > 0 && d.filter(x => x === dm).length === 1) return { xs: ['9月', '10月', '11月', '12月'], a, b, y1: 60, na: '甲班', nb: '乙班', title: '兩班每月借書本數' };
  }
}
const tblHTML = (head, rows) => `<div class="tbl"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((x, i) => i ? `<td>${x}</td>` : `<th>${x}</th>`).join('')}</tr>`).join('')}</table></div>`;

/* ===== 1-A 畫出折線圖：照表格把點拖到正確的高度 ===== */
function u1A(st) {
  const sets = [
    { c: tempChart(), v: makeTemps(), name: '氣溫', unit: '度' },
    (() => { const v = [rand(0, 2)]; for (let i = 1; i < 6; i++) v.push(Math.min(14, v[i - 1] + rand(1, 3))); return { c: { xs: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天'], y0: 0, y1: 14, yName: '公分', xName: '天數', title: '綠豆芽的高度' }, v, name: '高度', unit: '公分' }; })()
  ];
  let r = 0;
  function round() {
    if (r >= sets.length) return api.finish();
    const S = sets[r], n = S.v.length, vals = Array(n).fill(null);
    api.say(`看表格，在每一個${S.c.xName === '時間' ? '時間' : '天數'}上面<b>點一下或拖曳</b>，把點放到正確的${S.name}，點會自動連成折線。畫好按「畫好了」。`);
    st.innerHTML = `${dots(r, sets.length)}${tblHTML([S.c.xName, ...S.c.xs], [[`${S.name}（${S.unit}）`, ...S.v]])}
      <div class="qvis"><svg class="chart draw" viewBox="0 0 ${CH.W} ${CH.H + 50}">${chartBase(S.c)}<g class="plot"></g></svg></div>
      <div class="center"><button type="button" class="btn mint" id="okB">畫好了！</button></div>`;
    const svg = $('svg', st), g = $('.plot', st);
    const draw = () => { g.innerHTML = linePlot(S.c, vals); };
    dragOn(svg, (x, y, rect) => {
      const sx = x / rect.width * CH.W, sy = y / rect.height * (CH.H + 50);
      const i = Math.max(0, Math.min(n - 1, Math.floor((sx - CH.L) / ((CH.R - CH.L) / n))));
      const v = Math.max(S.c.y0, Math.min(S.c.y1, Math.round((CH.B - sy) / (CH.B - CH.T) * (S.c.y1 - S.c.y0) + S.c.y0)));
      if (vals[i] !== v) { vals[i] = v; draw(); }
    });
    $('#okB', st).onclick = () => {
      const k = vals.findIndex((v, i) => v !== S.v[i]);
      if (k < 0) {
        $('#okB', st).disabled = true;
        api.ok('折線圖畫好了！看線往上、往下，就知道變化的情形。');
        speak('畫得很好！折線往上表示增加，往下表示減少。'); r++; later(round, 2600);
      } else if (vals[k] === null) api.bad(`${S.c.xs[k]} 還沒有畫點喔！`);
      else api.bad(`${S.c.xs[k]} 的${S.name}是 ${S.v[k]} ${S.unit}，點要對齊 ${S.v[k]} 的格線！`);
    };
    draw();
  }
  round();
}

/* ===== 1-B 看懂統計圖 ===== */
function u1B(st) {
  const v = makeTemps(), c = tempChart(), vis = lineChart(c, v), bk = makeBooks();
  const mi = v.indexOf(Math.max(...v)), d = v.slice(1).map((x, i) => x - v[i]), di = d.indexOf(Math.max(...d));
  const bd = bk.a.map((x, i) => Math.abs(x - bk.b[i])), bi = bd.indexOf(Math.max(...bd));
  quiz(st, [
    { q: '看折線圖，哪一個時間的氣溫<b>最高</b>？', vis, opts: TIMES.map((t, i) => ({ h: t, ok: i === mi })), keep: true, hint: '找折線上最高的那個點！' },
    { q: '從幾時到幾時，氣溫<b>上升最多</b>？', vis, opts: d.map((x, i) => ({ h: `${TIMES[i]}→${TIMES[i + 1]}`, ok: i === di })), keep: true, hint: '找往上爬、而且最陡的那一段線！' },
    { q: '縱軸最下面畫了「≈」波浪線，是什麼意思？', vis, opts: [{ h: '省略了 0 到 20 的刻度', ok: true }, { h: '那時候是 0 度', ok: false, hint: '最低的點也在 20 度以上，不是 0 度！' }, { h: '圖畫錯了', ok: false, hint: '波浪線是故意畫的，用來省略用不到的刻度。' }] },
    { q: '想看出「一天中氣溫<b>變化的情形</b>」，用哪一種統計圖最清楚？', opts: [{ h: '📈 折線圖', ok: true }, { h: '📊 長條圖', ok: false, hint: '長條圖適合比較數量多少；看「變化」用折線圖更清楚！' }, { h: '📋 只寫一個數字', ok: false, hint: '一個數字看不出變化喔！' }] },
    { q: '看複式長條圖，哪一個月兩班借書的本數<b>相差最多</b>？', vis: barChart2(bk), opts: bk.xs.map((x, i) => ({ h: x, ok: i === bi })), keep: true, hint: '看同一個月的藍色和橘色長條，哪一個月高度差最多？' }
  ]);
}

/* ===== 1-C 統計圖挑戰 ===== */
function u1C(st) {
  const v = makeTemps(), c = tempChart(), vis = lineChart(c, v), bk = makeBooks(), bvis = barChart2(bk);
  const k = rand(0, 4), mx = Math.max(...v), mn = Math.min(...v);
  const segs = v.slice(1).map((x, i) => [i, x - v[i]]).filter(s => s[1] !== 0), [si, sd] = pick(segs);
  const m = rand(0, 3);
  quiz(st, [
    { q: `${TIMES[k]}的氣溫是幾度？`, vis, ans: v[k], unit: '度', hint: `從 ${TIMES[k]} 的點往左看，對到縱軸的哪一條線？` },
    { q: '這一天最高氣溫和最低氣溫相差幾度？', vis, ans: mx - mn, unit: '度', hint: '先找最高點和最低點，再相減！', after: `${mx} − ${mn} = ${mx - mn}（度）` },
    { q: `從 ${TIMES[si]} 到 ${TIMES[si + 1]}，氣溫${sd > 0 ? '上升' : '下降'}了幾度？`, vis, ans: Math.abs(sd), unit: '度', hint: '看這兩個點各是幾度，再相減。', after: `${Math.max(v[si], v[si + 1])} − ${Math.min(v[si], v[si + 1])} = ${Math.abs(sd)}（度）` },
    { q: `${bk.xs[m]}甲班和乙班<b>一共</b>借了幾本書？`, vis: bvis, ans: bk.a[m] + bk.b[m], unit: '本', hint: '一格是 5 本，先讀出兩條長條各是幾本。', after: `${bk.a[m]} + ${bk.b[m]} = ${bk.a[m] + bk.b[m]}（本）` },
    { q: '乙班這 4 個月一共借了幾本書？', vis: bvis, ans: bk.b.reduce((s, x) => s + x, 0), unit: '本', hint: '把 4 條橘色長條的本數加起來！', after: `${bk.b.join(' + ')} = ${bk.b.reduce((s, x) => s + x, 0)}（本）` }
  ]);
}

/* ===== 2-A 閱兵排方陣：能排得整整齊齊的排數就是因數 ===== */
function u2A(st) {
  const Ns = [pick([12, 16, 18, 20]), pick([24, 30, 36])];
  let r = 0;
  function round() {
    if (r >= Ns.length) return api.finish();
    const n = Ns[r], fs = []; for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i);
    const got = new Set(), tried = new Set();
    api.say(`${n} 位小兵要排成方陣，每一排人數一樣、不能有人落單。按排數試試看，找出 ${n} 的<b>所有因數</b>！`);
    st.innerHTML = `${dots(r, Ns.length)}<div class="readout" id="ro">${n} 位小兵，排成幾排？</div><div class="qvis" id="army"></div>
      <div class="rowbtns">${Array.from({ length: n }, (_, i) => `<button type="button" class="rbtn" data-r="${i + 1}">${i + 1}</button>`).join('')}</div>
      <div class="lbl" style="text-align:center">找到的因數：</div><div class="chips" id="chips"></div>`;
    const chips = () => { $('#chips', st).innerHTML = fs.map(f => got.has(f) ? `<b>${f}</b>` : '<b class="q">?</b>').join(''); };
    $$('.rbtn', st).forEach(b => b.onclick = () => {
      const rows = +b.dataset.r, cols = Math.ceil(n / rows), last = n - cols * (rows - 1), ok = n % rows === 0;
      const s = Math.min(30, 300 / rows, 520 / cols);
      let h = `<svg class="pic" viewBox="0 0 ${cols * s + 10} ${rows * s + 10}" width="${cols * s + 10}">`;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const idx = y * cols + x; if (idx >= n) continue;
        h += `<circle cx="${x * s + s / 2 + 5}" cy="${y * s + s / 2 + 5}" r="${s * 0.38}" fill="${!ok && y === rows - 1 ? '#ff6b6b' : '#5bb4ff'}"/>`;
      }
      $('#army', st).innerHTML = h + '</svg>';
      sfx('tap'); tried.add(rows);
      if (ok) {
        b.classList.add('yes'); got.add(rows); got.add(n / rows);
        $$('.rbtn', st).forEach(x => { if (+x.dataset.r === n / rows) x.classList.add('yes'); });
        $('#ro', st).innerHTML = `排 ${rows} 排，每排 ${n / rows} 人 ✔　${n} ÷ ${rows} = ${n / rows}　→ <b>${rows}</b> 和 <b>${n / rows}</b> 都是 ${n} 的因數`;
        chips();
        if (got.size === fs.length) {
          $$('.rbtn', st).forEach(x => x.disabled = true);
          api.ok(`${n} 的因數有 ${fs.join('、')}，共 ${fs.length} 個！`);
          speak(`${n} 的因數有 ${fs.join('、')}`); r++; later(round, 3000);
        }
      } else {
        b.classList.add('no');
        $('#ro', st).innerHTML = `排 ${rows} 排，最後一排只有 ${last} 人 ✘　${n} ÷ ${rows} 不能整除`;
      }
    });
    chips();
  }
  round();
}

/* ===== 2-B 因數倍數想一想 ===== */
function u2B(st) {
  quiz(st, [
    () => { const b = rand(3, 9), k = rand(4, 12), w1 = b * k + rand(1, b - 1), w2 = b * (k + 1) + rand(1, b - 1); return { q: '下面哪一個算式是<b>整除</b>？', opts: [{ h: `${b * k} ÷ ${b}`, ok: true }, { h: `${w1} ÷ ${b}`, ok: false, hint: `${w1} ÷ ${b} 有餘數，不是整除。` }, { h: `${w2} ÷ ${b}`, ok: false, hint: `${w2} ÷ ${b} 有餘數，不是整除。` }], hint: '整除就是商是整數、沒有餘數。' }; },
    () => { const n = pick([24, 30, 36, 40]), fs = [], no = []; for (let i = 2; i < n; i++) (n % i ? no : fs).push(i); return { q: `哪一個<b>不是</b> ${n} 的因數？`, opts: [{ h: N(pick(no.filter(x => x < 16))), ok: true }, ...shuffle(fs).slice(0, 3).map(f => ({ h: N(f), ok: false, hint: `${n} ÷ ${f} = ${n / f}，可以整除，${f} 是 ${n} 的因數。` }))] }; },
    () => { const [a, b] = pick([[12, 18], [12, 30], [18, 27], [20, 30]]), cf = [], fa = []; for (let i = 1; i <= a; i++) { if (a % i === 0) fa.push(i); if (a % i === 0 && b % i === 0) cf.push(i); } const extra = fa.find(x => b % x); return { q: `${a} 和 ${b} 的<b>公因數</b>有哪些？`, opts: [{ h: cf.join('、'), ok: true }, { h: [...cf, extra].sort((x, y) => x - y).join('、'), ok: false, hint: `${extra} 不是 ${b} 的因數喔！` }, { h: fa.join('、'), ok: false, hint: `這些是 ${a} 的因數，要找 ${a} 和 ${b} 共同的因數。` }], hint: '公因數要同時是兩個數的因數。' }; },
    () => { const x = rand(6, 9), k = rand(5, 12); return { q: `哪一個數是 ${x} 的倍數？`, opts: [{ h: N(x * k), ok: true }, { h: N(x * k + 1), ok: false, hint: `${x * k + 1} ÷ ${x} 有餘數。` }, { h: N(x * (k + 2) - 2), ok: false, hint: `${x * (k + 2) - 2} ÷ ${x} 有餘數。` }, { h: N(x + 10), ok: false, hint: `${x + 10} ÷ ${x} 有餘數。` }], hint: `${x} 的倍數 ÷ ${x} 會整除。` }; },
    () => { const h = rand(1, 9), t = rand(1, 9); return { q: '哪一個數<b>同時</b>是 2 的倍數和 5 的倍數？', opts: [{ h: N(`${h}${t}0`), ok: true }, { h: N(`${h}${t}5`), ok: false, hint: '個位是 5，是 5 的倍數，但不是 2 的倍數。' }, { h: N(`${h}${t}${pick([2, 4, 6, 8])}`), ok: false, hint: '個位是雙數，是 2 的倍數，但不是 5 的倍數。' }, { h: N(`${t}${h}${pick([1, 3, 7, 9])}`), ok: false, hint: '個位是單數，不是 2 的倍數。' }], hint: '個位是 0 的數，同時是 2、5、10 的倍數。' }; },
    { q: '下面哪一句話是對的？', opts: [{ h: '1 是所有正整數的因數', ok: true }, { h: '一個數的倍數只有 10 個', ok: false, hint: '倍數可以一直寫下去，有無限多個！' }, { h: '一個數最大的因數是 1', ok: false, hint: '一個數最大的因數是它自己。' }] }
  ]);
}

/* ===== 2-C 公因數公倍數挑戰 ===== */
function u2C(st) {
  quiz(st, [
    () => { const n = pick([16, 18, 20, 28, 32]), fs = []; for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i); return { q: `${n} 的因數一共有幾個？`, ans: fs.length, unit: '個', hint: '一對一對找：1 和自己、2 和……', after: `${fs.join('、')}，共 ${fs.length} 個` }; },
    () => { const [a, b] = pick([[24, 36], [18, 30], [16, 40], [27, 45], [28, 42]]); return { q: `${a} 和 ${b} 的<b>最大公因數</b>是多少？`, ans: gcd(a, b), hint: '先找出兩個數的因數，再找共同的、最大的。', after: `最大公因數是 ${gcd(a, b)}` }; },
    () => { const [a, b] = pick([[6, 8], [4, 10], [6, 9], [8, 12], [9, 12]]); return { q: `${a} 和 ${b} 的<b>最小公倍數</b>是多少？`, ans: lcm(a, b), hint: `把 ${b} 的倍數一個一個寫出來，看哪一個也是 ${a} 的倍數。`, after: `最小公倍數是 ${lcm(a, b)}` }; },
    () => { const [a, b] = pick([[24, 36], [30, 45], [32, 48], [18, 42]]); return { q: `有 ${a} 顆糖果和 ${b} 塊餅乾，要平分給一些小朋友，都剛好分完。<b>最多</b>可以分給幾人？`, vis: '<span style="font-size:56px">🍬🍪</span>', ans: gcd(a, b), unit: '人', hint: `人數要同時是 ${a} 和 ${b} 的因數，而且最大。`, after: `${a} 和 ${b} 的最大公因數是 ${gcd(a, b)}` }; },
    () => { const [a, b] = pick([[6, 8], [10, 15], [8, 12], [12, 18]]); return { q: `甲公車每 ${a} 分鐘一班，乙公車每 ${b} 分鐘一班。7 點兩車同時發車，<b>至少</b>再過幾分鐘兩車會再同時發車？`, vis: '<span style="font-size:56px">🚌🚍</span>', ans: lcm(a, b), unit: '分鐘', hint: `時間要同時是 ${a} 和 ${b} 的倍數，而且最小。`, after: `${a} 和 ${b} 的最小公倍數是 ${lcm(a, b)}` }; },
    () => { const x = pick([6, 7, 8, 9]), m = pick([50, 60, 80]); return { q: `${m} 以內（含 ${m}），${x} 的倍數有幾個？`, ans: Math.floor(m / x), unit: '個', hint: `${m} ÷ ${x} = ? 商就是答案。`, after: `${m} ÷ ${x} = ${Math.floor(m / x)} …… ${m % x}，有 ${Math.floor(m / x)} 個` }; }
  ]);
}

Object.assign(LEVELS, { u1: [u1A, u1B, u1C], u2: [u2A, u2B, u2C] });
