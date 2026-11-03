'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林五下有，南一五下沒有（南一放在五上）的內容。
   程式由 grade5（五上）units1-2.js（u1 折線圖）、units5-6.js（u5 線對稱圖形）、units9-10.js（u9 時間的乘除、u10 正方體和長方體）
   搬來（build 腳本產生：函式和常數名前面加 X5，避免和本遊戲衝突；樣式加 .g5x 範圍）。每單元 3 關，和本遊戲一樣是 動手做／想一想／挑戰。
   xline 折線圖（康軒第 5 單元「大數與折線圖」的折線圖）
   xsym  線對稱圖形（翰林第 10 單元）
   xtime 時間的乘除（康軒第 9 單元、翰林第 6 單元）
   xsurf 正方體和長方體的表面積（康軒第 7 單元、翰林第 9 單元「表面積」） */
/* 五上 core.js 的小工具（本遊戲沒有，改名後搬來） */
const X5fmtN = x => String(Math.round(x * 1e4) / 1e4);
function X5numOpts(ans, wrongs, unit = '') {
  const s = [...new Set([X5fmtN(ans), ...wrongs.map(X5fmtN)])].slice(0, 4);
  // 錯的答案和正確答案一樣（或互相重複）時，補附近的數，保證不重複、至少 2 個
  const want = Math.max(2, Math.min(4, wrongs.length + 1)), step = Number.isInteger(ans) ? 1 : 0.1;
  for (let d = 1; s.length < want && d < 100; d++) [ans + d * step, ans - d * step].forEach(v => { if (v >= 0 && s.length < want && !s.includes(X5fmtN(v))) s.push(X5fmtN(v)); });
  return s.map(v => ({ h: `${N(v)}${unit ? `<small>${unit}</small>` : ''}`, ok: v === X5fmtN(ans) }));
}
function X5dragOn(el, onMove, onEnd) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (er) {}
    const at = ev => { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top, r]; };
    onMove(...at(e));
    const mv = ev => onMove(...at(ev));
    const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); onEnd && onEnd(); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}

const X5CH = { W: 560, H: 340, L: 70, R: 540, T: 34, B: 290 };
const X5chX = (i, n) => X5CH.L + (i + 0.5) * (X5CH.R - X5CH.L) / n;
const X5chY = (v, y0, y1) => X5CH.B - (v - y0) / (y1 - y0) * (X5CH.B - X5CH.T);
/* 折線圖的底（格線、刻度、波浪線）；c = {xs, y0, y1, yName, xName, title, broken} */
function X5chartBase(c) {
  const { xs, y0, y1 } = c, n = xs.length, every = y1 - y0 > 14 ? 2 : 1;
  let h = `<rect x="0" y="0" width="${X5CH.W}" height="${X5CH.H}" fill="#fff"/>`;
  h += `<text x="${X5CH.W / 2}" y="20" text-anchor="middle" font-size="18" font-weight="900" fill="#4a3b5c">${c.title}</text>`;
  for (let v = y0; v <= y1; v++) {
    const y = X5chY(v, y0, y1);
    h += `<line x1="${X5CH.L}" y1="${y}" x2="${X5CH.R}" y2="${y}" stroke="${(v - y0) % every ? '#f1ebf6' : '#ddd3e8'}" stroke-width="${(v - y0) % 5 ? 1 : 2}"/>`;
    if ((v - y0) % every === 0) h += `<text x="${X5CH.L - 8}" y="${y + 5}" text-anchor="end" font-size="14" font-weight="700" fill="#6b5a7d">${v}</text>`;
  }
  xs.forEach((x, i) => { h += `<line x1="${X5chX(i, n)}" y1="${X5CH.T}" x2="${X5chX(i, n)}" y2="${X5CH.B}" stroke="#f1ebf6"/><text x="${X5chX(i, n)}" y="${X5CH.B + 22}" text-anchor="middle" font-size="15" font-weight="900" fill="#4a3b5c">${x}</text>`; });
  h += `<line x1="${X5CH.L}" y1="${X5CH.T - 6}" x2="${X5CH.L}" y2="${X5CH.B}" stroke="#4a3b5c" stroke-width="3"/><line x1="${X5CH.L}" y1="${X5CH.B}" x2="${X5CH.R}" y2="${X5CH.B}" stroke="#4a3b5c" stroke-width="3"/>`;
  if (c.broken) h += `<rect x="${X5CH.L - 9}" y="${X5CH.B + 3}" width="18" height="14" fill="#fff"/><path d="M${X5CH.L - 10} ${X5CH.B + 6} q5 -5 10 0 t10 0 M${X5CH.L - 10} ${X5CH.B + 13} q5 -5 10 0 t10 0" stroke="#e5508f" stroke-width="2.5" fill="none"/><text x="${X5CH.L - 14}" y="${X5CH.B + 32}" text-anchor="end" font-size="13" fill="#6b5a7d">0</text>`;
  h += `<text x="${X5CH.L - 4}" y="${X5CH.T - 12}" text-anchor="end" font-size="13" font-weight="900" fill="#8a7a99">(${c.yName})</text><text x="${X5CH.R}" y="${X5CH.B + 44}" text-anchor="end" font-size="13" font-weight="900" fill="#8a7a99">(${c.xName})</text>`;
  return h;
}
function X5linePlot(c, vals, color = '#ff6b6b') {
  const n = c.xs.length, pts = vals.map((v, i) => v === null ? null : [X5chX(i, n), X5chY(v, c.y0, c.y1)]);
  let h = '';
  for (let i = 1; i < n; i++) if (pts[i - 1] && pts[i]) h += `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${pts[i][0]}" y2="${pts[i][1]}" stroke="${color}" stroke-width="4"/>`;
  pts.forEach(p => { if (p) h += `<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${color}" stroke="#fff" stroke-width="3"/>`; });
  return h;
}
const X5lineChart = (c, vals) => `<svg class="chart" viewBox="0 0 ${X5CH.W} ${X5CH.H + 50}">${X5chartBase(c)}${X5linePlot(c, vals)}</svg>`;
/* 複式長條圖：兩組資料並排 */
function X5barChart2(c) {
  const { xs, a, b, y1 } = c, n = xs.length, bw = 30;
  let h = `<svg class="chart" viewBox="0 0 ${X5CH.W} ${X5CH.H + 50}"><rect width="${X5CH.W}" height="${X5CH.H + 50}" fill="#fff"/>`;
  h += `<text x="${X5CH.W / 2}" y="20" text-anchor="middle" font-size="18" font-weight="900" fill="#4a3b5c">${c.title}</text>`;
  for (let v = 0; v <= y1; v += 5) { const y = X5chY(v, 0, y1); h += `<line x1="${X5CH.L}" y1="${y}" x2="${X5CH.R}" y2="${y}" stroke="${v % 10 ? '#f1ebf6' : '#ddd3e8'}"/><text x="${X5CH.L - 8}" y="${y + 5}" text-anchor="end" font-size="14" font-weight="700" fill="#6b5a7d">${v}</text>`; }
  xs.forEach((x, i) => {
    const cx = X5chX(i, n);
    h += `<rect x="${cx - bw - 2}" y="${X5chY(a[i], 0, y1)}" width="${bw}" height="${X5CH.B - X5chY(a[i], 0, y1)}" fill="#5bb4ff"/><rect x="${cx + 2}" y="${X5chY(b[i], 0, y1)}" width="${bw}" height="${X5CH.B - X5chY(b[i], 0, y1)}" fill="#ffb347"/>`;
    h += `<text x="${cx}" y="${X5CH.B + 22}" text-anchor="middle" font-size="15" font-weight="900" fill="#4a3b5c">${x}</text>`;
  });
  h += `<line x1="${X5CH.L}" y1="${X5CH.T - 6}" x2="${X5CH.L}" y2="${X5CH.B}" stroke="#4a3b5c" stroke-width="3"/><line x1="${X5CH.L}" y1="${X5CH.B}" x2="${X5CH.R}" y2="${X5CH.B}" stroke="#4a3b5c" stroke-width="3"/>`;
  h += `<text x="${X5CH.L - 4}" y="${X5CH.T - 12}" text-anchor="end" font-size="13" font-weight="900" fill="#8a7a99">(本)</text>`;
  h += `<rect x="${X5CH.R - 150}" y="${X5CH.T - 4}" width="16" height="16" fill="#5bb4ff"/><text x="${X5CH.R - 128}" y="${X5CH.T + 9}" font-size="15" font-weight="900" fill="#4a3b5c">${c.na}</text><rect x="${X5CH.R - 75}" y="${X5CH.T - 4}" width="16" height="16" fill="#ffb347"/><text x="${X5CH.R - 53}" y="${X5CH.T + 9}" font-size="15" font-weight="900" fill="#4a3b5c">${c.nb}</text>`;
  return h + '</svg>';
}
const X5TIMES = ['8時', '10時', '12時', '14時', '16時'];
/* 一天的氣溫：最高、最低、上升最多的一段都只有一個 */
function X5makeTemps() {
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
const X5tempChart = v => ({ xs: X5TIMES, y0: 20, y1: 32, yName: '度', xName: '時間', title: '一天的氣溫變化', broken: true });
function X5makeBooks() {
  for (;;) {
    const a = Array.from({ length: 4 }, () => rand(2, 12) * 5), b = Array.from({ length: 4 }, () => rand(2, 12) * 5);
    const d = a.map((x, i) => Math.abs(x - b[i])), dm = Math.max(...d);
    if (dm > 0 && d.filter(x => x === dm).length === 1) return { xs: ['9月', '10月', '11月', '12月'], a, b, y1: 60, na: '甲班', nb: '乙班', title: '兩班每月借書本數' };
  }
}
const X5tblHTML = (head, rows) => `<div class="tbl"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((x, i) => i ? `<td>${x}</td>` : `<th>${x}</th>`).join('')}</tr>`).join('')}</table></div>`;

/* ===== 1-A 畫出折線圖：照表格把點拖到正確的高度 ===== */
function X5u1A(st) {
  const sets = [
    { c: X5tempChart(), v: X5makeTemps(), name: '氣溫', unit: '度' },
    (() => { const v = [rand(0, 2)]; for (let i = 1; i < 6; i++) v.push(Math.min(14, v[i - 1] + rand(1, 3))); return { c: { xs: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天'], y0: 0, y1: 14, yName: '公分', xName: '天數', title: '綠豆芽的高度' }, v, name: '高度', unit: '公分' }; })()
  ];
  let r = 0;
  function round() {
    if (r >= sets.length) return api.finish();
    const S = sets[r], n = S.v.length, vals = Array(n).fill(null);
    api.say(`看表格，在每一個${S.c.xName === '時間' ? '時間' : '天數'}上面<b>點一下或拖曳</b>，把點放到正確的${S.name}，點會自動連成折線。畫好按「畫好了」。`);
    st.innerHTML = `${dots(r, sets.length)}${X5tblHTML([S.c.xName, ...S.c.xs], [[`${S.name}（${S.unit}）`, ...S.v]])}
      <div class="qvis"><svg class="chart draw" viewBox="0 0 ${X5CH.W} ${X5CH.H + 50}">${X5chartBase(S.c)}<g class="plot"></g></svg></div>
      <div class="center"><button type="button" class="btn mint" id="okB">畫好了！</button></div>`;
    const svg = $('svg', st), g = $('.plot', st);
    const draw = () => { g.innerHTML = X5linePlot(S.c, vals); };
    X5dragOn(svg, (x, y, rect) => {
      const sx = x / rect.width * X5CH.W, sy = y / rect.height * (X5CH.H + 50);
      const i = Math.max(0, Math.min(n - 1, Math.floor((sx - X5CH.L) / ((X5CH.R - X5CH.L) / n))));
      const v = Math.max(S.c.y0, Math.min(S.c.y1, Math.round((X5CH.B - sy) / (X5CH.B - X5CH.T) * (S.c.y1 - S.c.y0) + S.c.y0)));
      if (vals[i] !== v) { vals[i] = v; draw(); }
    });
    $('#okB', st).onclick = () => {
      const k = vals.findIndex((v, i) => v !== S.v[i]);
      if (k < 0) {
        $('#okB', st).disabled = true;
        api.ok('折線圖畫好了！看線往上、往下，就知道變化的情形。');
        speak('畫得很好！折線往上表示增加，往下表示減少。'); r++; later(round, 2600);
      } else if (vals[k] === null) api.bad(`${S.c.xs[k]} 還沒有畫點喔！`, `${S.c.xs[k]} 沒有畫點`, `${S.c.xs[k]} 畫在 ${S.v[k]} ${S.unit}`);
      else api.bad(`${S.c.xs[k]} 的${S.name}是 ${S.v[k]} ${S.unit}，點要對齊 ${S.v[k]} 的格線！`, `${S.c.xs[k]} 畫在 ${vals[k]} ${S.unit}`, `${S.c.xs[k]} 畫在 ${S.v[k]} ${S.unit}`);
    };
    draw();
  }
  round();
}

/* ===== 1-B 看懂統計圖 ===== */
function X5u1B(st) {
  const v = X5makeTemps(), c = X5tempChart(), vis = X5lineChart(c, v), bk = X5makeBooks();
  const mi = v.indexOf(Math.max(...v)), d = v.slice(1).map((x, i) => x - v[i]), di = d.indexOf(Math.max(...d));
  const bd = bk.a.map((x, i) => Math.abs(x - bk.b[i])), bi = bd.indexOf(Math.max(...bd));
  quiz(st, [
    { q: '看折線圖，哪一個時間的氣溫<b>最高</b>？', vis, opts: X5TIMES.map((t, i) => ({ h: t, ok: i === mi })), keep: true, hint: '找折線上最高的那個點！' },
    { q: '從幾時到幾時，氣溫<b>上升最多</b>？', vis, opts: d.map((x, i) => ({ h: `${X5TIMES[i]}→${X5TIMES[i + 1]}`, ok: i === di })), keep: true, hint: '找往上爬、而且最陡的那一段線！' },
    { q: '縱軸最下面畫了「≈」波浪線，是什麼意思？', vis, opts: [{ h: '省略了 0 到 20 的刻度', ok: true }, { h: '那時候是 0 度', ok: false, hint: '最低的點也在 20 度以上，不是 0 度！' }, { h: '圖畫錯了', ok: false, hint: '波浪線是故意畫的，用來省略用不到的刻度。' }] },
    { q: '想看出「一天中氣溫<b>變化的情形</b>」，用哪一種統計圖最清楚？', opts: [{ h: '📈 折線圖', ok: true }, { h: '📊 長條圖', ok: false, hint: '長條圖適合比較數量多少；看「變化」用折線圖更清楚！' }, { h: '📋 只寫一個數字', ok: false, hint: '一個數字看不出變化喔！' }] },
    { q: '看複式長條圖，哪一個月兩班借書的本數<b>相差最多</b>？', vis: X5barChart2(bk), opts: bk.xs.map((x, i) => ({ h: x, ok: i === bi })), keep: true, hint: '看同一個月的藍色和橘色長條，哪一個月高度差最多？' }
  ]);
}

/* ===== 1-C 統計圖挑戰 ===== */
function X5u1C(st) {
  const v = X5makeTemps(), c = X5tempChart(), vis = X5lineChart(c, v), bk = X5makeBooks(), bvis = X5barChart2(bk);
  const k = rand(0, 4), mx = Math.max(...v), mn = Math.min(...v);
  const segs = v.slice(1).map((x, i) => [i, x - v[i]]).filter(s => s[1] !== 0), [si, sd] = pick(segs);
  const m = rand(0, 3);
  quiz(st, [
    { q: `${X5TIMES[k]}的氣溫是幾度？`, vis, ans: v[k], unit: '度', hint: `從 ${X5TIMES[k]} 的點往左看，對到縱軸的哪一條線？` },
    { q: '這一天最高氣溫和最低氣溫相差幾度？', vis, ans: mx - mn, unit: '度', hint: '先找最高點和最低點，再相減！', after: `${mx} − ${mn} = ${mx - mn}（度）` },
    { q: `從 ${X5TIMES[si]} 到 ${X5TIMES[si + 1]}，氣溫${sd > 0 ? '上升' : '下降'}了幾度？`, vis, ans: Math.abs(sd), unit: '度', hint: '看這兩個點各是幾度，再相減。', after: `${Math.max(v[si], v[si + 1])} − ${Math.min(v[si], v[si + 1])} = ${Math.abs(sd)}（度）` },
    { q: `${bk.xs[m]}甲班和乙班<b>一共</b>借了幾本書？`, vis: bvis, ans: bk.a[m] + bk.b[m], unit: '本', hint: '一格是 5 本，先讀出兩條長條各是幾本。', after: `${bk.a[m]} + ${bk.b[m]} = ${bk.a[m] + bk.b[m]}（本）` },
    { q: '乙班這 4 個月一共借了幾本書？', vis: bvis, ans: bk.b.reduce((s, x) => s + x, 0), unit: '本', hint: '把 4 條橘色長條的本數加起來！', after: `${bk.b.join(' + ')} = ${bk.b.reduce((s, x) => s + x, 0)}（本）` }
  ]);
}


function X5polySVG(n, done, R = 120, cx = 170, cy = 150) {
  const P = Array.from({ length: n }, (_, i) => { const t = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + R * Math.cos(t), cy + R * Math.sin(t)]; });
  const cs = ['#ffd9e8', '#d6ecff', '#d9f7ea', '#fff0c2', '#ece3ff', '#ffe2cc'];
  let h = `<svg class="pic poly" viewBox="0 0 340 300" width="340">`;
  if (done.length === n - 3) for (let k = 1; k < n - 1; k++) h += `<polygon points="${P[0]} ${P[k]} ${P[k + 1]}" fill="${cs[(k - 1) % cs.length]}"/>`;
  h += `<polygon points="${P.join(' ')}" fill="none" stroke="#4a3b5c" stroke-width="4"/>`;
  done.forEach(k => { h += `<line x1="${P[0][0]}" y1="${P[0][1]}" x2="${P[k][0]}" y2="${P[k][1]}" stroke="#ff6b6b" stroke-width="4"/>`; });
  P.forEach((p, i) => { h += `<circle class="vx" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="${i ? 16 : 14}" fill="${i ? (done.includes(i) ? '#ff6b6b' : '#fff') : '#ffc93c'}" stroke="#4a3b5c" stroke-width="3" style="cursor:pointer"/>`; });
  h += `<text x="${P[0][0]}" y="${P[0][1] + 6}" text-anchor="middle" font-size="16" font-weight="900">A</text>`;
  return h + '</svg>';
}
const X5PNAME = { 3: '三角形', 4: '四邊形', 5: '五邊形', 6: '六邊形', 7: '七邊形', 8: '八邊形', 9: '九邊形', 10: '十邊形' };

function X5halfShape(w, h, axisCol, dir) {
  const S = new Set(), k = (x, y) => `${x},${y}`;
  let x = axisCol, y = rand(1, h - 2); S.add(k(x, y));
  while (S.size < 8) {
    const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    if (dir < 0 ? nx > axisCol : nx < axisCol) continue;
    x = nx; y = ny; S.add(k(x, y));
  }
  return S;
}
function X5u5A(st) {
  const rounds = ['v', 'v', 'h'];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const t = rounds[r], C = 44;
    /* 一律用「左半邊」產生，水平軸時把 x、y 對調 */
    const W = 10, H = 6, gw = t === 'v' ? W : H, gh = t === 'v' ? H : W;
    const base = X5halfShape(W / 2, H, W / 2 - 1, -1);
    const given = new Set([...base].map(s => { const [x, y] = s.split(',').map(Number); return t === 'v' ? `${x},${y}` : `${y},${x}`; }));
    const want = new Set([...given].map(s => { const [x, y] = s.split(',').map(Number); return t === 'v' ? `${W - 1 - x},${y}` : `${x},${W - 1 - y}`; }));
    const mine = new Set();
    const inMine = (x, y) => t === 'v' ? x >= W / 2 : y >= W / 2;
    api.say(`紅線是<b>對稱軸</b>。把${t === 'v' ? '右' : '下'}半邊的格子塗色，讓整個圖形變成<b>線對稱圖形</b>！可以點一下或拖曳塗色，再點一次會擦掉。`);
    st.innerHTML = `${dots(r, rounds.length)}<div class="qvis"><svg class="gridsvg" viewBox="0 0 ${gw * C + 10} ${gh * C + 10}" style="max-width:${gw * C + 10}px"><g class="cells"></g>
      ${t === 'v' ? `<line x1="${5 + W / 2 * C}" y1="0" x2="${5 + W / 2 * C}" y2="${gh * C + 10}" stroke="#ff6b6b" stroke-width="5" stroke-dasharray="10 6"/>` : `<line x1="0" y1="${5 + W / 2 * C}" x2="${gw * C + 10}" y2="${5 + W / 2 * C}" stroke="#ff6b6b" stroke-width="5" stroke-dasharray="10 6"/>`}</svg></div>
      <div class="center"><button type="button" class="btn ghost" id="clrB">全部擦掉</button> <button type="button" class="btn mint" id="okB">塗好了！</button></div>`;
    const g = $('.cells', st), svg = $('svg', st);
    const draw = () => {
      let h = '';
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
        const s = `${x},${y}`, f = given.has(s) ? '#a98bff' : mine.has(s) ? '#ffb3d1' : '#fff';
        h += `<rect x="${5 + x * C}" y="${5 + y * C}" width="${C}" height="${C}" fill="${f}" stroke="#d9d0e3" stroke-width="2"/>`;
      }
      g.innerHTML = h;
    };
    let mode = null;
    X5dragOn(svg, (px, py, rect) => {
      const x = Math.floor((px / rect.width * (gw * C + 10) - 5) / C), y = Math.floor((py / rect.height * (gh * C + 10) - 5) / C);
      if (x < 0 || y < 0 || x >= gw || y >= gh) return;
      if (!inMine(x, y)) { if (mode === null) toast('這一半已經畫好了，請塗另一半！'); mode = mode || 'none'; return; }
      const s = `${x},${y}`;
      if (mode === null || mode === 'none') mode = mine.has(s) ? 'off' : 'on';
      if (mode === 'on' && !mine.has(s)) { mine.add(s); sfx('tap'); draw(); }
      if (mode === 'off' && mine.has(s)) { mine.delete(s); draw(); }
    }, () => { mode = null; });
    $('#clrB', st).onclick = () => { mine.clear(); draw(); };
    $('#okB', st).onclick = () => {
      const miss = [...want].filter(s => !mine.has(s)).length, extra = [...mine].filter(s => !want.has(s)).length;
      if (!miss && !extra) {
        $$('button', st).forEach(b => b.disabled = true);
        api.ok('完成！沿著對稱軸對摺，兩邊會完全疊在一起。'); speak('沿著對稱軸對摺，兩邊完全重合，這就是線對稱圖形'); r++; later(round, 2600);
      } else api.bad(`還有 ${miss} 格沒塗、${extra} 格塗錯了。每一格到對稱軸的距離要一樣遠！`, `${miss} 格沒塗、${extra} 格塗錯`, `塗出和另一半對稱的 ${want.size} 格`);
    };
    draw();
  }
  round();
}

/* ===== 5-B 對稱軸想一想 ===== */
const X5sv = inner => `<svg viewBox="0 0 120 100" width="110" height="92">${inner}</svg>`;
const X5SHAPES = {
  sq: X5sv('<rect x="25" y="15" width="70" height="70" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  rect: X5sv('<rect x="10" y="25" width="100" height="50" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  tri: X5sv('<polygon points="60,10 105,88 15,88" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  iso: X5sv('<polygon points="60,8 90,90 30,90" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  par: X5sv('<polygon points="35,20 110,20 85,80 10,80" fill="#ffd9e8" stroke="#4a3b5c" stroke-width="4"/>'),
  cir: X5sv('<circle cx="60" cy="50" r="40" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>'),
  kite: X5sv('<polygon points="60,6 92,38 60,94 28,38" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/>')
};
function X5u5B(st) {
  quiz(st, [
    { q: '下面哪一個<b>不是</b>線對稱圖形？', opts: [{ h: X5SHAPES.par, ok: true, t: '平行四邊形' }, { h: X5SHAPES.iso, ok: false, t: '等腰三角形', hint: '等腰三角形從頂點往下對摺，兩邊會重合。' }, { h: X5SHAPES.rect, ok: false, t: '長方形', hint: '長方形左右對摺、上下對摺都會重合。' }, { h: X5SHAPES.kite, ok: false, t: '箏形', hint: '箏形沿著直的那條對角線對摺會重合。' }], hint: '找一個怎麼摺都沒辦法完全重合的圖形。' },
    () => { const [k, n, name] = pick([['sq', 4, '正方形'], ['rect', 2, '長方形'], ['tri', 3, '正三角形'], ['iso', 1, '等腰三角形']]); return { q: `${name}有幾條對稱軸？`, vis: X5SHAPES[k], opts: X5numOpts(n, [0, 1, 2, 3, 4, 6].filter(x => x !== n).slice(0, 3), '條'), hint: '想一想：有幾種摺法能讓兩邊完全重合？' }; },
    { q: '圓有幾條對稱軸？', vis: X5SHAPES.cir, opts: [{ h: '無數條', ok: true }, { h: '1 條', ok: false, hint: '通過圓心的直線都可以對摺喔！' }, { h: '4 條', ok: false, hint: '不只 4 條，通過圓心的每一條直線都是。' }], keep: true },
    { q: '線對稱圖形上的兩個<b>對稱點</b>，連起來的線和對稱軸是什麼關係？', opts: [{ h: '互相垂直', ok: true }, { h: '互相平行', ok: false, hint: '對稱點連線會「穿過」對稱軸，不會平行。' }, { h: '沒有關係', ok: false, hint: '對摺時對稱點會疊在一起，連線一定和對稱軸垂直。' }], keep: true },
    { q: '線對稱圖形的<b>對稱邊</b>和<b>對稱角</b>，哪一句是對的？', opts: [{ h: '對稱邊一樣長，對稱角一樣大', ok: true }, { h: '對稱邊一樣長，對稱角不一定一樣大', ok: false, hint: '對摺後角也會疊在一起，所以一樣大。' }, { h: '都不一定相等', ok: false, hint: '對摺後完全重合，所以邊和角都相等。' }] }
  ]);
}

/* ===== 5-C 對稱點挑戰 ===== */
function X5kiteSVG(a, b, ang) {
  return `<svg class="pic" viewBox="0 0 260 230" width="240"><polygon points="130,15 200,85 130,215 60,85" fill="#d6ecff" stroke="#4a3b5c" stroke-width="4"/><line x1="130" y1="5" x2="130" y2="225" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="8 5"/>
    <text x="130" y="12" text-anchor="middle" font-size="16" font-weight="900">A</text><text x="210" y="90" font-size="16" font-weight="900">B</text><text x="130" y="230" text-anchor="middle" font-size="16" font-weight="900">C</text><text x="40" y="90" font-size="16" font-weight="900">D</text>
    ${a ? `<text x="172" y="44" font-size="16" font-weight="900" fill="#e5508f">${a}</text><text x="175" y="160" font-size="16" font-weight="900" fill="#e5508f">${b}</text>` : ''}${ang ? `<text x="168" y="92" font-size="16" font-weight="900" fill="#1fa979">${ang}°</text>` : ''}</svg>`;
}
function X5u5C(st) {
  quiz(st, [
    () => { const a = rand(4, 9), b = rand(a + 2, 14); return { q: `四邊形 ABCD 是線對稱圖形，對稱軸是 AC。AB = ${a} 公分、BC = ${b} 公分，周長是幾公分？`, vis: X5kiteSVG(`${a}`, `${b}`), eq: `(${a} + ${b}) × 2`, alt: [`${a} × 2 + ${b} × 2`, `${a} + ${b} + ${a} + ${b}`], known: [2], ans: 2 * (a + b), unit: '公分', hint: 'AD 和 AB 是對稱邊、CD 和 CB 是對稱邊，一樣長！', after: `(${a} + ${b}) × 2 = ${2 * (a + b)}（公分）` }; },
    () => { const x = rand(8, 13) * 10; return { q: `四邊形 ABCD 是線對稱圖形，對稱軸是 AC。角 B 是 ${x}°，角 D 是幾度？`, vis: X5kiteSVG('', '', x), ans: x, unit: '度', hint: '角 B 和角 D 是對稱角。', after: `對稱角一樣大，角 D = ${x}°` }; },
    () => { const k = rand(2, 7); return { q: `方格紙上，A 點在對稱軸左邊 ${k} 格。A 的對稱點 A′ 和 A 相距幾格？`, eq: `${k} + ${k}`, alt: [`${k} × 2`], known: [2], ans: 2 * k, unit: '格', hint: 'A′ 在對稱軸右邊，離對稱軸也是一樣遠。', after: `${k} + ${k} = ${2 * k}（格）` }; },
    () => { const n = pick([5, 6, 8]); return { q: `正${X5PNAME[n]}有幾條對稱軸？`, vis: X5polySVG(n, []).replace(/class="vx"/g, ''), ans: n, unit: '條', hint: '正多邊形有幾條邊，就有幾條對稱軸。', after: `正${X5PNAME[n]}有 ${n} 條對稱軸` }; },
    () => { const d = rand(3, 9); return { q: `A 點到對稱軸的距離是 ${d} 公分，A 的對稱點 A′ 到對稱軸是幾公分？`, ans: d, unit: '公分', hint: '對稱點到對稱軸的距離相等。' }; },
    () => { const L = rand(4, 9) * 2; return { q: `線對稱圖形中，一組對稱點 P 和 P′ 相距 ${L} 公分。P 到對稱軸是幾公分？`, eq: `${L} ÷ 2`, known: [2], ans: L / 2, unit: '公分', hint: '對稱軸把對稱點的連線分成一樣長的兩段。', after: `${L} ÷ 2 = ${L / 2}（公分）` }; }
  ]);
}

/* ===== 分數小工具 ===== */

const X5TU = { hm: { B: '時', S: '分', R: 60 }, dh: { B: '日', S: '時', R: 24 } };
const X5tStr = (b, s, u) => `${b ? `${b} ${u.B} ` : ''}${s || !b ? `${s} ${u.S}` : ''}`.trim();
/* 列式用：b 大單位 s 小單位換成小單位的算式（例如 1 時 15 分 → (1 × 60 + 15)） */
const X5tExp = (b, s, R = 60) => b ? (s ? `(${b} × ${R} + ${s})` : `${b} × ${R}`) : `${s}`;

/* ===== 9-A 時間換換機：乘完要進位，除之前要換小單位 ===== */
function X5u9A(st) {
  const mk = (op, ut) => {
    const u = X5TU[ut];
    if (op === '×') {
      const k = rand(2, 4), b = rand(1, 2); let s; do { s = rand(u.R === 60 ? 15 : 8, u.R - 5); } while (s * k < u.R);
      return { op, u, k, b, s, B: b * k, S: s * k };
    }
    let k, ab, as, T; do { k = rand(2, 5); ab = rand(1, 2); as = rand(u.R === 60 ? 10 : 3, u.R - 5); T = (ab * u.R + as) * k; } while (Math.floor(T / u.R) % k === 0);
    return { op, u, k, ab, as, B: Math.floor(T / u.R), S: T % u.R };
  };
  const rounds = [mk('×', 'hm'), mk('×', 'dh'), mk('÷', 'hm'), mk('÷', 'dh')];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r], u = R.u;
    let B = R.B, S = R.S;
    if (R.op === '×') api.say(`${X5tStr(R.b, R.s, u)} × ${R.k}：每一格都乘以 ${R.k}，得到 ${B} ${u.B} ${S} ${u.S}。${u.S}超過 ${u.R} 了，按按鈕把 <b>${u.R} ${u.S}換成 1 ${u.B}</b>！`);
    else api.say(`${X5tStr(B, S, u)} ÷ ${R.k}：${B} ${u.B}不能平分成 ${R.k} 份。按按鈕把 <b>1 ${u.B}換成 ${u.R} ${u.S}</b>，換到可以平分再按「平分」！`);
    const draw = (warn) => {
      st.innerHTML = `${dots(r, rounds.length)}<div class="readout">${R.op === '×' ? `${X5tStr(R.b, R.s, u)} × ${R.k}` : `${X5tStr(R.B, R.S, u)} ÷ ${R.k}`}</div>
        <div class="tbox"><div class="tcell${warn === 'B' ? ' warn' : ''}" style="--c:#5bb4ff"><b>${B}</b><span>${u.B}</span></div><div class="tcell${warn === 'S' ? ' warn' : ''}" style="--c:#ff9a4d"><b>${S}</b><span>${u.S}</span></div></div>
        <div class="btns">${R.op === '×' ? `<button type="button" class="btn blue" id="cvB">${u.R} ${u.S} → 1 ${u.B}</button><button type="button" class="btn mint" id="okB">換好了！</button>` : `<button type="button" class="btn blue" id="cvB">1 ${u.B} → ${u.R} ${u.S}</button><button type="button" class="btn mint" id="okB">平分成 ${R.k} 份</button>`}</div>`;
      $('#cvB', st).onclick = () => {
        if (R.op === '×') { if (S < u.R) return toast(`${S} ${u.S}不到 ${u.R} ${u.S}，不能再換了！`); S -= u.R; B++; }
        else { if (!B) return toast(`沒有${u.B}可以換了！`); B--; S += u.R; }
        sfx('pop'); draw();
      };
      $('#okB', st).onclick = () => {
        // 家長報表：孩子現在換成的樣子、正確要換成的樣子
        const now = `換成 ${X5tStr(B, S, u)}`, tot = R.B * u.R + R.S, kb = Math.floor(R.B / R.k) * R.k;
        const want = R.op === '×' ? `換成 ${X5tStr(Math.floor((B * u.R + S) / u.R), (B * u.R + S) % u.R, u)}` : `換成 ${X5tStr(kb, tot - kb * u.R, u)} 再平分`;
        if (R.op === '×') {
          if (S >= u.R) { draw('S'); return api.bad(`${S} ${u.S}還超過 ${u.R} ${u.S}，再換一次！`, now, want); }
          $$('button', st).forEach(b => b.disabled = true);
          const m = `${X5tStr(R.b, R.s, u)} × ${R.k} = ${X5tStr(B, S, u)}`; api.ok(m); speak(m);
        } else {
          if (B % R.k) { draw('B'); return api.bad(`${B} ${u.B}還不能平分成 ${R.k} 份，再把 1 ${u.B}換成 ${u.R} ${u.S}！`, now, want); }
          if (S % R.k) { draw('S'); return api.bad(`換太多了！${S} ${u.S}不能平分成 ${R.k} 份。`, now, want); }
          $$('button', st).forEach(b => b.disabled = true);
          const m = `${X5tStr(R.B, R.S, u)} ÷ ${R.k} = ${X5tStr(B / R.k, S / R.k, u)}`;
          $('.tbox', st).insertAdjacentHTML('afterend', `<div class="after">每一份：${X5tStr(B / R.k, S / R.k, u)}</div>`); api.ok(m); speak(m);
        }
        r++; later(round, 2800);
      };
    };
    draw();
  }
  round();
}

/* ===== 9-B 時間單位想一想 ===== */
function X5u9B(st) {
  quiz(st, [
    { q: '1 日是幾小時？', opts: X5numOpts(24, [12, 60, 100], '時'), hint: '一天有白天和晚上，時鐘的短針要走兩圈。' },
    () => { const h = rand(1, 3), m = rand(5, 55); return { q: `${h} 時 ${m} 分是幾分鐘？`, opts: X5numOpts(h * 60 + m, [h * 100 + m, h + m, h * 60 + m + 10], '分'), hint: '1 時 = 60 分！', after: `${h} × 60 + ${m} = ${h * 60 + m}（分）` }; },
    () => { const h = rand(1, 3), m = rand(10, 50), T = h * 60 + m; return { q: `${T} 分是幾時幾分？`, opts: [{ h: `${h} 時 ${m} 分`, ok: true }, { h: `${Math.floor(T / 100)} 時 ${T % 100} 分`, ok: false, hint: '1 時是 60 分，不是 100 分！' }, { h: `${h + 1} 時 ${m} 分`, ok: false, hint: `${h + 1} 時就有 ${(h + 1) * 60} 分了，太多了。` }].filter((o, i, a) => a.findIndex(x => x.h === o.h) === i), hint: `${T} ÷ 60 = ? 餘 ?` }; },
    () => { const h = rand(1, 4), m = pick([35, 40, 45, 50]), T = (h * 60 + m) * 2; return { q: `${h} 時 ${m} 分 × 2 = ？`, opts: [{ h: `${Math.floor(T / 60)} 時 ${T % 60} 分`, ok: true }, { h: `${h * 2} 時 ${T % 60} 分`, ok: false, hint: `${m * 2} 分超過 60 分，要進位 1 時！` }, { h: `${Math.floor(T / 60)} 時 ${m * 2 - 50} 分`, ok: false, hint: '進位時要減掉 60 分，不是 50 分。' }], hint: '分 × 2 超過 60 要進位。' }; },
    () => { const [d, k] = pick([[4, 3], [5, 4], [3, 2], [7, 4]]), T = d * 24 / k; return { q: `${d} 日 ÷ ${k} = ？`, opts: [{ h: X5tStr(Math.floor(T / 24), T % 24, X5TU.dh), ok: true }, { h: X5tStr(Math.floor(d / k), d % k, X5TU.dh), ok: false, hint: `剩下的 ${d % k} 日要換成 ${d % k * 24} 時再平分！` }, { h: X5tStr(Math.floor(T / 24), T % 24 + 2, X5TU.dh), ok: false, hint: `${d} 日 = ${d * 24} 時，${d * 24} ÷ ${k} = ${T} 時。` }], hint: '先把日換成時再平分。' }; },
    { q: '1 分鐘是幾秒？', opts: X5numOpts(60, [100, 24, 10], '秒'), hint: '秒針走一圈是 1 分鐘。' }
  ]);
}

/* ===== 9-C 時間應用挑戰 ===== */
function X5u9C(st) {
  quiz(st, [
    () => { const m = rand(25, 45); return { q: `小美每天練琴 ${m} 分鐘，一星期 7 天一共練幾分鐘？`, vis: '<span style="font-size:56px">🎹</span>', eq: `${m} × 7`, ans: m * 7, unit: '分', hint: `${m} × 7`, after: `${m} × 7 = ${m * 7}（分）= ${X5tStr(Math.floor(m * 7 / 60), m * 7 % 60, X5TU.hm)}` }; },
    () => { const k = pick([3, 4, 5]), e = rand(15, 30), T = e * k; return { q: `一部影片長 ${X5tStr(Math.floor(T / 60), T % 60, X5TU.hm)}，分成 ${k} 段一樣長，每段幾分鐘？`, vis: '<span style="font-size:56px">🎬</span>', eq: `${X5tExp(Math.floor(T / 60), T % 60)} ÷ ${k}`, known: [60], ans: e, unit: '分', hint: '先把時換成分，再平分。', after: `${T} ÷ ${k} = ${e}（分）` }; },
    () => { const h = rand(2, 6), [m, k] = pick([[40, 3], [20, 3], [15, 4], [30, 2], [45, 4]]); return { q: `火車每天行駛 ${h} 時 ${m} 分，${k} 天一共行駛幾小時？`, vis: '<span style="font-size:56px">🚆</span>', eq: `${h} × ${k} + ${m} × ${k} ÷ 60`, alt: [`(${h} × 60 + ${m}) × ${k} ÷ 60`, `(${h} + ${m} ÷ 60) × ${k}`], known: [60], ans: h * k + m * k / 60, unit: '時', hint: `時 × ${k}、分 × ${k}，分再換成時。`, after: `${h * k} 時 ${m * k} 分 = ${h * k + m * k / 60} 時` }; },
    () => { const h = pick([8, 9]), T = h * 7; return { q: `小明每天睡 ${h} 小時，一星期 7 天一共睡了多久？`, vis: '<span style="font-size:56px">😴</span>', opts: [{ h: X5tStr(Math.floor(T / 24), T % 24, X5TU.dh), ok: true }, { h: X5tStr(Math.floor(T / 10), T % 10, X5TU.dh), ok: false, hint: '1 日是 24 時，不是 10 時！' }, { h: X5tStr(Math.floor(T / 24) + 1, T % 24, X5TU.dh), ok: false, hint: `${T} 時 ÷ 24 = ? 再檢查一次。` }], hint: `${h} × 7 = ${T} 時，再換成幾日幾時。` }; },
    () => { const k = pick([4, 5, 6]), e = pick([20, 30, 40]), T = e * k; return { q: `${X5tStr(Math.floor(T / 60), T % 60, X5TU.hm)} ÷ ${k} 是幾分？`, eq: `${X5tExp(Math.floor(T / 60), T % 60)} ÷ ${k}`, known: [60], ans: e, unit: '分', hint: '先換成分，再除。', after: `${T} ÷ ${k} = ${e}（分）` }; },
    () => { const h = rand(8, 10), m = rand(30, 55), n = 3, len = rand(20, 30), E = h * 60 + m + n * len; const f = t => `${Math.floor(t / 60)} 時 ${String(t % 60).padStart(2, '0')} 分`; return { q: `比賽從 ${h} 時 ${m} 分開始，一共比 ${n} 場，每場 ${len} 分鐘，中間不休息。幾時幾分結束？`, vis: '<span style="font-size:56px">🏓</span>', opts: [{ h: f(E), ok: true }, { h: f(E - 60), ok: false, hint: '分加起來超過 60 要進位 1 時！' }, { h: f(E + 10), ok: false, hint: `先算 ${n} × ${len} = ${n * len} 分，再加上去。` }], hint: `比賽一共 ${n} × ${len} = ${n * len} 分。` }; }
  ]);
}

/* ===== 正方體展開圖：在方格上滾動正方體，看每一格是哪一面 ===== */
function X5foldNet(cells) {
  const key = (x, y) => `${x},${y}`, set = new Set(cells.map(([x, y]) => key(x, y)));
  const face = {}, up = {}, q = [[cells[0][0], cells[0][1], { d: 0, u: 1, n: 2, s: 3, e: 4, w: 5 }]];
  face[key(...cells[0])] = 0; up[key(...cells[0])] = 1;
  while (q.length) {
    const [x, y, o] = q.shift();
    const rolls = [[1, 0, { d: o.e, e: o.u, u: o.w, w: o.d, n: o.n, s: o.s }], [-1, 0, { d: o.w, w: o.u, u: o.e, e: o.d, n: o.n, s: o.s }], [0, 1, { d: o.s, s: o.u, u: o.n, n: o.d, e: o.e, w: o.w }], [0, -1, { d: o.n, n: o.u, u: o.s, s: o.d, e: o.e, w: o.w }]];
    for (const [dx, dy, no] of rolls) {
      const k = key(x + dx, y + dy);
      if (set.has(k) && !(k in face)) { face[k] = no.d; up[k] = no.u; q.push([x + dx, y + dy, no]); }
    }
  }
  const ok = Object.keys(face).length === cells.length && new Set(Object.values(face)).size === 6 && cells.length === 6;
  return { ok, face, up, connected: Object.keys(face).length === cells.length };
}
/* 把形狀轉正，旋轉、翻面後都一樣的視為同一種 */
function X5netCanon(cells) {
  const vs = [];
  for (let t = 0; t < 8; t++) {
    let p = cells.map(([x, y]) => { let a = t & 1 ? [y, x] : [x, y]; if (t & 2) a = [-a[0], a[1]]; if (t & 4) a = [a[0], -a[1]]; return a; });
    const mx = Math.min(...p.map(a => a[0])), my = Math.min(...p.map(a => a[1]));
    vs.push(p.map(a => `${a[0] - mx},${a[1] - my}`).sort().join(' '));
  }
  return vs.sort()[0];
}
const X5NETS = [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[1, 0], [1, 1], [0, 1], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], [[2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]];
function X5netSVG(on, star, cols = 5, rows = 4, C = 76) {
  let h = `<svg class="netsvg" viewBox="0 0 ${cols * C + 10} ${rows * C + 10}">`;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const k = `${x},${y}`, f = on.has(k);
    h += `<rect class="nc" data-k="${k}" x="${5 + x * C}" y="${5 + y * C}" width="${C}" height="${C}" fill="${f ? '#ffd27a' : '#fbfdff'}" stroke="${f ? '#4a3b5c' : '#d9d0e3'}" stroke-width="${f ? 4 : 2}" stroke-dasharray="${f ? '' : '6 5'}"/>`;
    if (k === star) h += `<text x="${5 + x * C + C / 2}" y="${5 + y * C + C / 2 + 14}" text-anchor="middle" font-size="40" pointer-events="none">⭐</text>`;
  }
  return h + '</svg>';
}

/* ===== 10-A 展開圖設計師 ===== */
function X5u10A(st) {
  const rounds = ['b', 'b', 'o'];
  let r = 0, first = null;
  function round() {
    if (r >= rounds.length) return api.finish();
    if (rounds[r] === 'b') {
      const on = new Set();
      api.say(first ? '再設計一個<b>不一樣</b>的正方體展開圖（轉一轉、翻一翻一樣的不算）！' : '點方格選出 <b>6 個正方形</b>，拼成一個可以摺成<b>正方體</b>的展開圖！再點一次可以取消。');
      const draw = () => {
        st.innerHTML = `${dots(r, rounds.length)}<div class="readout">已選 ${on.size} / 6 格</div><div class="qvis">${X5netSVG(on)}</div><div class="center"><button type="button" class="btn ghost" id="clrB">清除</button> <button type="button" class="btn mint" id="okB">摺摺看！</button></div>`;
        $$('.nc', st).forEach(c => c.addEventListener('click', () => { const k = c.dataset.k; if (on.has(k)) on.delete(k); else { if (on.size >= 6) return toast('正方體只有 6 個面！'); on.add(k); } sfx('tap'); draw(); }));
        $('#clrB', st).onclick = () => { on.clear(); draw(); };
        $('#okB', st).onclick = () => {
          if (on.size < 6) return toast(`要選 6 格，現在只有 ${on.size} 格。`);
          const cells = [...on].map(s => s.split(',').map(Number)), F = X5foldNet(cells);
          const goal = first ? '另一種不一樣的正方體展開圖' : '可以摺成正方體的展開圖';
          if (!F.connected) return api.bad('6 個正方形要邊和邊連在一起！', '6 格沒有連在一起', goal);
          if (!F.ok) return api.bad('摺起來有兩個面疊在一起，還會缺一個面，摺不成正方體！', '摺不成正方體的排法', goal);
          const c = X5netCanon(cells);
          if (first && c === first) return api.bad('這個和剛才的展開圖轉一轉、翻一翻是一樣的，換一種！', '和剛才一樣的展開圖', goal);
          first = c; $$('button', st).forEach(b => b.disabled = true);
          api.ok('可以摺成正方體！'); speak('可以摺成正方體，6 個面都不重複'); r++; later(round, 2400);
        };
      };
      draw();
    } else {
      const net = pick(X5NETS), F = X5foldNet(net), sk = net.map(a => a.join(','));
      const star = pick(sk), opp = sk.find(k => F.face[k] === F.up[star]), on = new Set(sk);
      api.say('把這個展開圖摺成正方體，哪一面會和 ⭐ <b>相對</b>（在正對面）？點那一格！');
      st.innerHTML = `${dots(r, rounds.length)}<div class="qvis">${X5netSVG(on, star)}</div>`;
      $$('.nc', st).forEach(c => c.addEventListener('click', () => {
        const k = c.dataset.k; if (!on.has(k) || k === star) return;
        if (k === opp) { c.setAttribute('fill', '#b6f0d6'); api.ok('答對了！相對的面不會相鄰。'); speak('答對了，相對的兩個面不會連在一起'); r++; later(round, 2400); }
        else { c.setAttribute('fill', '#ffb3b3'); api.bad('這一面和 ⭐ 相鄰（摺起來會連在一起），不是相對的面！', '點了和 ⭐ 相鄰的面', '和 ⭐ 不相鄰、在正對面的那一面'); }
      }));
    }
  }
  round();
}

/* ===== 長方體圖 ===== */
const X5CUBOID = `<svg class="pic" viewBox="0 0 300 210" width="300">
  <g stroke="#4a3b5c" stroke-width="3" fill="none"><polygon points="40,80 200,80 200,180 40,180" fill="#d6ecff"/><polygon points="40,80 100,30 260,30 200,80" fill="#e8f4ff"/><polygon points="200,80 260,30 260,130 200,180" fill="#c3e2ff"/>
  <line x1="100" y1="30" x2="100" y2="130" stroke-dasharray="6 5"/><line x1="100" y1="130" x2="260" y2="130" stroke-dasharray="6 5"/><line x1="100" y1="130" x2="40" y2="180" stroke-dasharray="6 5"/></g>
  <g font-size="17" font-weight="900" fill="#e5508f"><text x="24" y="78">A</text><text x="204" y="98">B</text><text x="204" y="200">C</text><text x="24" y="198">D</text><text x="92" y="24">E</text><text x="264" y="26">F</text><text x="266" y="140">G</text><text x="106" y="124">H</text></g></svg>`;

/* ===== 10-B 面和邊想一想 ===== */
function X5u10B(st) {
  quiz(st, [
    { q: '長方體有幾個面、幾條邊、幾個頂點？', vis: X5CUBOID, opts: [{ h: '6 面、12 邊、8 頂點', ok: true }, { h: '6 面、8 邊、12 頂點', ok: false, hint: '頂點是角角，數一數：上面 4 個、下面 4 個。' }, { h: '4 面、12 邊、8 頂點', ok: false, hint: '別忘了看不到的後面、下面和左邊！' }] },
    { q: '和面 ABCD <b>平行</b>的面是哪一個？', vis: X5CUBOID, opts: [{ h: '面 EFGH', ok: true }, { h: '面 ABFE', ok: false, hint: '面 ABFE 和面 ABCD 連在一起，是互相垂直。' }, { h: '面 BFGC', ok: false, hint: '面 BFGC 和面 ABCD 連在一起，是互相垂直。' }], hint: '平行的面是正對面，不會相交。' },
    { q: '和邊 AB <b>平行</b>的邊有幾條？', vis: X5CUBOID, opts: X5numOpts(3, [2, 4, 1], '條'), hint: '找和 AB 一樣方向的邊：DC、EF、HG。', after: 'DC、EF、HG，共 3 條' },
    { q: '和面 ABCD <b>垂直</b>的面有幾個？', vis: X5CUBOID, opts: X5numOpts(4, [2, 5, 1], '個'), hint: '和面 ABCD 連在一起的面都和它垂直。', after: '上、下、左、右 4 個面' },
    { q: '和邊 AE <b>垂直</b>的邊有幾條？', vis: X5CUBOID, opts: X5numOpts(4, [2, 3, 8], '條'), hint: '看 A 點和 E 點，各有 2 條邊和 AE 相交成直角。', after: 'AB、AD、EF、EH，共 4 條' },
    { q: '正方體的 6 個面是什麼形狀？', opts: [{ h: '6 個一樣大的正方形', ok: true }, { h: '6 個長方形，大小不一定一樣', ok: false, hint: '那是長方體喔！' }, { h: '4 個正方形和 2 個長方形', ok: false, hint: '正方體所有的邊都一樣長！' }] }
  ]);
}

/* ===== 10-C 表面積挑戰 ===== */
function X5u10C(st) {
  quiz(st, [
    () => { const a = rand(3, 9); return { q: `邊長 ${a} 公分的正方體，表面積是多少平方公分？`, vis: '<span style="font-size:56px">🧊</span>', eq: `${a} × ${a} × 6`, known: [6], ans: 6 * a * a, unit: '平方公分', hint: '6 個一樣大的正方形：邊長 × 邊長 × 6。', after: `${a} × ${a} × 6 = ${6 * a * a}` }; },
    () => { const l = rand(6, 12), w = rand(3, 5), h = rand(2, 8); return { q: `長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分的長方體，表面積是多少平方公分？`, vis: X5CUBOID, eq: `(${l} × ${w} + ${w} × ${h} + ${l} × ${h}) × 2`, alt: [`${l} × ${w} × 2 + ${w} × ${h} × 2 + ${l} × ${h} × 2`], known: [2], ans: 2 * (l * w + w * h + l * h), unit: '平方公分', hint: '3 組相對的面各有 2 個：(長×寬 + 寬×高 + 長×高) × 2。', after: `(${l * w} + ${w * h} + ${l * h}) × 2 = ${2 * (l * w + w * h + l * h)}` }; },
    () => { const l = rand(6, 12), w = rand(3, 5), h = rand(2, 8); return { q: `長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分的長方體，所有的邊長加起來是幾公分？`, eq: `(${l} + ${w} + ${h}) × 4`, alt: [`${l} × 4 + ${w} × 4 + ${h} × 4`], known: [4], ans: 4 * (l + w + h), unit: '公分', hint: '長、寬、高各有 4 條。', after: `(${l} + ${w} + ${h}) × 4 = ${4 * (l + w + h)}` }; },
    () => { const a = rand(2, 8); return { q: `一個正方體的表面積是 ${6 * a * a} 平方公分，它的邊長是幾公分？`, ans: a, unit: '公分', hint: `先算一個面：${6 * a * a} ÷ 6 = ${a * a}，什麼數自己乘自己是 ${a * a}？`, after: `${6 * a * a} ÷ 6 = ${a * a} = ${a} × ${a}` }; },
    () => { const l = rand(8, 15), w = rand(5, 8), h = rand(3, 6); return { q: `做一個<b>沒有蓋子</b>的長方體紙盒，長 ${l} 公分、寬 ${w} 公分、高 ${h} 公分，要用多少平方公分的紙板？`, vis: '<span style="font-size:56px">📦</span>', eq: `${l} × ${w} + (${w} × ${h} + ${l} × ${h}) × 2`, alt: [`${l} × ${w} + ${w} × ${h} × 2 + ${l} × ${h} × 2`], known: [2], ans: l * w + 2 * (w * h + l * h), unit: '平方公分', hint: '沒有蓋子，只有 1 個底面，再加 4 個側面。', after: `${l * w} + (${w * h} + ${l * h}) × 2 = ${l * w + 2 * (w * h + l * h)}` }; },
    () => { const a = rand(3, 9); return { q: `正方體所有的邊長加起來是 ${12 * a} 公分，一條邊是幾公分？`, eq: `${12 * a} ÷ 12`, known: [12], ans: a, unit: '公分', hint: '正方體有 12 條一樣長的邊。', after: `${12 * a} ÷ 12 = ${a}` }; }
  ]);
}


/* 五上的關卡畫面加上 .g5x，讓搬來的樣式只作用在這幾關 */
const X5wrap = f => st => { st.classList.add('g5x'); return f(st); };
document.head.insertAdjacentHTML('beforeend', `<style>
.g5x{--bg1:#fff6e5;--bg2:#e2f3ff;--ink:#4a3b5c;--muted:#8a7a99;--card:#ffffff;
  --pink:#ff7eb3;--blue:#5bb4ff;--mint:#3fcf9c;--yellow:#ffc93c;--orange:#ff9a4d;--purple:#a98bff;--red:#ff6b6b;
  --line:#efe3f5;--shadow:0 6px 0 rgba(74,59,92,.13);}
.g5x .qvis{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px;margin:6px 0 14px;font-size:26px;font-weight:900;text-align:center}
.g5x .after{width:100%;text-align:center;font-size:28px;color:#1fa979;font-weight:900;animation:pop .4s}
.g5x .readout{text-align:center;font-size:24px;font-weight:900;padding:8px 14px;border-radius:18px;background:#f6f2ff;margin:6px 0}
.g5x .btn{border:none;border-radius:999px;padding:12px 26px;font-size:22px;font-weight:900;color:#fff;cursor:pointer;min-height:56px;background:var(--pink);box-shadow:0 5px 0 #d9568f}
.g5x .btn:active{transform:translateY(3px)}
.g5x .btn.mint{background:var(--mint);box-shadow:0 5px 0 #26a37a}
.g5x .btn.blue{background:var(--blue);box-shadow:0 5px 0 #3b8fd6}
.g5x .btn.ghost{background:#fff;color:var(--ink);border:3px solid var(--line);box-shadow:0 5px 0 #e3d6ec}
.g5x .center{text-align:center;margin-top:12px}
.g5x .readout small{font-size:18px;color:var(--muted)}
.g5x .tbl{overflow-x:auto;margin:6px 0}
.g5x .tbl table{margin:0 auto;border-collapse:collapse;font-size:22px;font-weight:900;background:#fff}
.g5x .tbl th,.g5x .tbl td{border:3px solid #d9d0e3;padding:6px 14px;text-align:center}
.g5x .tbl th{background:#f6f2ff;font-size:18px}
.g5x .pic{max-width:100%;height:auto}
.g5x .chart{width:560px;max-width:100%;height:auto;touch-action:none;user-select:none}
.g5x .chart.draw{cursor:crosshair}
.g5x .gridsvg{width:560px;max-width:100%;height:auto;touch-action:none;cursor:pointer;user-select:none}
.g5x .tbox{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:10px 0}
.g5x .tcell{min-width:130px;padding:10px 14px;border-radius:20px;border:4px solid var(--c,#5bb4ff);background:#fff;text-align:center}
.g5x .tcell b{display:block;font-size:46px;font-family:"Arial Rounded MT Bold",Arial,sans-serif}
.g5x .tcell span{font-size:20px;font-weight:900;color:var(--muted)}
.g5x .tcell.warn{background:#fff0f0;animation:shake .4s}
.g5x .btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:10px}
.g5x .netsvg{width:460px;max-width:100%;height:auto;touch-action:manipulation;cursor:pointer;user-select:none}
.g5x .eqwrap .center{text-align:center}
@keyframes pop{50%{transform:scale(1.03)}}
@media (max-width:600px){.g5x .tcell b{font-size:36px}}
</style>`);
Object.assign(LEVELS, {
  xline: [X5u1A, X5u1B, X5u1C].map(X5wrap),
  xsym: [X5u5A, X5u5B, X5u5C].map(X5wrap),
  xtime: [X5u9A, X5u9B, X5u9C].map(X5wrap),
  xsurf: [X5u10A, X5u10B, X5u10C].map(X5wrap)
});
