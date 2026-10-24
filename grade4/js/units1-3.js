'use strict';
/* 第 1 單元 一億以內的數 ／ 第 2 單元 乘法 ／ 第 3 單元 角度 */

const cmpQ = (a, b, sa = a, sb = b) => ({
  q: `${sa} ○ ${sb}，圈圈裡要放什麼？`, vis: `<span class="eq sm">${sa} <span class="box">?</span> ${sb}</span>`, keep: true,
  opts: [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }], hint: '先比位數，位數一樣再從最高位比起！', after: `${sa} ${a > b ? '＞' : a < b ? '＜' : '＝'} ${sb}`
});
/* 隨機的大數，部分位置是 0 */
function bigNum(lo = 1000000, hi = 99999999) {
  const len = String(rand(lo, hi)).length;
  let s = String(rand(1, 9));
  for (let i = 1; i < len; i++) s += Math.random() < 0.35 ? '0' : String(rand(1, 9));
  return +s;
}

/* ===== 1-A 位值表撥一撥：每一位按 ＋／－ 撥出聽到的數 ===== */
function u1A(st) {
  const targets = [bigNum(100000, 999999), bigNum(1000000, 9999999), bigNum(10000000, 99999999), bigNum(10000000, 99999999)];
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const n = targets[r], dg = Array(8).fill(0);
    api.say(`在位值表撥出：<b class="big">${numCN(n)}</b>`, `在位值表撥出 ${numCN(n)}`);
    st.innerHTML = `${dots(r, targets.length)}
      <div class="pc-wrap"><table class="pchart play"><tr>${PLACES.map((p, i) => `<th class="${i < 4 ? 'w' : ''}">${p}</th>`).join('')}</tr>
      <tr>${PLACES.map((_, i) => `<td><button type="button" class="pcb up" data-i="${i}">▲</button><div class="pcd" id="d${i}">0</div><button type="button" class="pcb dn" data-i="${i}">▼</button></td>`).join('')}</tr></table></div>
      <div class="readout" id="ro"></div>
      <div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const val = () => +dg.join('');
    const draw = () => { dg.forEach((d, i) => $('#d' + i, st).textContent = d); const v = val(); $('#ro', st).innerHTML = `寫成數字：<b>${v ? comma(v) : 0}</b>`; };
    $$('.pcb', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; dg[i] = (dg[i] + (b.classList.contains('up') ? 1 : 9)) % 10; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const v = val();
      if (v === n) { api.ok(`對！${comma(n)}`); speak(`答對了，${numCN(n)}`); r++; later(round, 2000); }
      else {
        const a = String(n).padStart(8, '0'), b = String(v).padStart(8, '0'), k = [...a].findIndex((c, i) => c !== b[i]);
        api.bad(`${PLACES[k]}位不對喔！再聽一次。`); speak(`${PLACES[k]}位不對喔，${numCN(n)}`);
      }
    };
    draw();
  }
  round();
}

/* ===== 1-B 讀數、寫數與換算 ===== */
function u1B(st) {
  const rounds = [
    () => {
      const n = bigNum(10000000, 99999999), s = String(n);
      const cands = [+(s.slice(0, 3) + s[4] + s[3] + s.slice(5)), +(s.slice(0, 4) + s.slice(5) + '0'), +(s[0] + s[2] + s[1] + s.slice(3))];
      for (let k = 1; k < 8; k++) cands.push(+(s.slice(0, k) + ((+s[k] + 1) % 10) + s.slice(k + 1)));
      const wrong = [...new Set(cands.filter(v => v !== n && v >= 10000000).map(numCN))].slice(0, 2);
      return { q: `<span class="big">${comma(n)}</span> 怎麼讀？`, sp: '這個數怎麼讀？', opts: [{ h: `<span class="small-opt">${numCN(n)}</span>`, ok: true }, ...wrong.map(w => ({ h: `<span class="small-opt">${w}</span>`, ok: false }))], hint: '四位一節：先讀「萬」以上，再讀萬以下！' };
    },
    () => { const n = bigNum(1000000, 99999999); return { q: `「${numCN(n)}」寫成數字是多少？`, ans: n, hint: '萬以下一定有 4 位，沒有的位要補 0！', after: comma(n) }; },
    () => {
      const n = bigNum(10000000, 99999999), s = String(n); let k; do { k = rand(1, 7); } while (s[7 - k] === '0');
      const d = +s[7 - k];
      return { q: `${comma(n)} 的<b>${placeName(k)}</b>上的 ${d} 代表多少？`, vis: placeChartHTML(n, k), ans: d * 10 ** k, hint: `${d} 在${placeName(k)}，就是 ${d} 個${PLACES[7 - k]}！`, after: `${d} 個${PLACES[7 - k]}是 ${comma(d * 10 ** k)}` };
    },
    () => pick([
      { q: '1 億是幾個千萬？', ans: 10, unit: '個', hint: '10 個千萬是 1 億！' },
      { q: '1000 萬是幾個百萬？', ans: 10, unit: '個', hint: '10 個百萬是 1 千萬！' },
      { q: '1 萬是幾個百？', ans: 100, unit: '個', hint: '1 萬 = 10 個千 = 100 個百' }
    ]),
    () => { const t = rand(12, 98); return { q: `${t}0 萬是幾個十萬？`, ans: t, unit: '個', hint: `${t}0 萬 = ${t} 個十萬`, after: `${t}0 萬 = ${t} 個十萬` }; },
    () => { const a = rand(2, 9), b = rand(1, 9), c = rand(1, 9); return { q: `${a} 個百萬、${b} 個萬和 ${c} 個百合起來是多少？`, ans: a * 1000000 + b * 10000 + c * 100, hint: '畫位值表，每一個數放在它的位置上！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 1-C 大數比大小與加減 ===== */
function u1C(st) {
  const rounds = [
    () => { const a = bigNum(10000000, 99999999), s = String(a).split(''); const k = rand(1, 6); s[k] = String((+s[k] + pick([1, 9])) % 10); const b = +s.join(''); return cmpQ(a, b, comma(a), comma(b)); },
    () => { const a = bigNum(1000000, 9999999), b = bigNum(10000000, 19999999); return Math.random() < .5 ? cmpQ(a, b, comma(a), comma(b)) : cmpQ(b, a, comma(b), comma(a)); },
    () => { const w1 = rand(21, 68), r1 = rand(11, 49) * 100, w2 = rand(11, 29), r2 = rand(1, 9) * 100; const a = w1 * 10000 + r1, b = w2 * 10000 + r2; return { q: `${wanFmt(a)} + ${wanFmt(b)} = ？`, vis: `<span class="eq sm">${wanFmt(a)} + ${wanFmt(b)}</span>`, ans: a + b, hint: '萬和萬相加，萬以下和萬以下相加！', after: `${wanFmt(a + b)}（${comma(a + b)}）` }; },
    () => { const a = rand(300, 980) * 10000 + rand(1, 9) * 1000, b = rand(120, 290) * 10000 + rand(1, 9) * 1000; return { q: `${comma(a)} − ${comma(b)} = ？`, vis: `<span class="eq sm">${comma(a)} − ${comma(b)}</span>`, ans: a - b, hint: '位數對齊再算，不夠減要向前一位借！', after: comma(a - b) }; },
    () => { const ns = shuffle([bigNum(10000000, 39999999), bigNum(40000000, 69999999), bigNum(70000000, 99999999)]); const mx = Math.max(...ns); return { q: '哪一個數<b>最大</b>？', opts: ns.map(v => ({ h: `<span class="small-opt">${comma(v)}</span>`, ok: v === mx })), hint: '都是八位數，從千萬位開始比！' }; },
    () => { const a = rand(12, 48) * 10000 + rand(1000, 9999), b = rand(5, 29) * 10000 + rand(1000, 9999); return { q: `甲城有 ${comma(a)} 人，乙城有 ${comma(b)} 人，兩城一共有多少人？`, vis: '<span style="font-size:56px">🏙️</span>', ans: a + b, unit: '人', hint: '合起來，用加法！', after: `${comma(a)} + ${comma(b)} = ${comma(a + b)}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 乘法直式：rows 為目前顯示的列 ===== */
function mulVertHTML(a, b, rows, now) {
  const w = String(a * b).length + 1;
  const pad = (v, shift = 0) => { const s = v === '' ? '' : String(v); const cells = Array(w).fill(''); for (let i = 0; i < s.length; i++) cells[w - 1 - shift - (s.length - 1 - i)] = s[i]; return cells; };
  const row = (cells, pre = '', cls = '') => `<div class="vrow ${cls}"><b class="vop">${pre}</b>${cells.map(c => `<span>${c}</span>`).join('')}</div>`;
  let h = `<div class="vert mul">${row(pad(a))}${row(pad(b), '×')}<div class="vline"></div>`;
  rows.forEach((r, i) => {
    if (r.line) { h += '<div class="vline"></div>'; return; }
    let cells = r.v === null ? Array(w).fill('') : pad(r.v, r.shift || 0);
    if (r.v === null) { const len = r.len; for (let k = 0; k < len; k++) cells[w - 1 - (r.shift || 0) - k] = `<i class="vbox${i === now ? ' now' : ''}"></i>`; }
    if (r.shift && r.v !== null) cells[w - 1] = '<em class="ghost0">0</em>';
    h += row(cells);
  });
  return h + '</div>';
}
function mulLevel(st, probs) {
  let r = 0;
  function round() {
    if (r >= probs.length) return api.finish();
    const [a, b] = probs[r], bo = b % 10, bt = Math.floor(b / 10), p1 = a * bo, p2 = a * bt, res = a * b;
    const steps = bt ? [
      { v: p1, msg: `先算 ${a} × <b>${bo}</b>（乘數的個位），第一列填多少？`, hint: `${a} × ${bo} 從個位乘起，記得進位！` },
      { v: p2, shift: 1, msg: `再算 ${a} × <b>${bt}</b> 個十，答案寫在十位開始，填多少？`, hint: `${a} × ${bt} 是多少？它代表 ${a} × ${bt}0，所以從十位寫起。` },
      { v: res, total: true, msg: '最後把兩列加起來，積是多少？', hint: `${p1} + ${p2}0 是多少？` }
    ] : [{ v: res, msg: `${a} × ${b}，從個位乘起，積是多少？`, hint: `個位 ${a % 10} × ${b} = ${a % 10 * b}，滿十要進位！` }];
    const rows = steps.map(s => ({ v: null, len: String(s.v).length, shift: s.shift || 0 }));
    if (bt) rows.splice(2, 0, { line: true });
    let si = 0;
    st.innerHTML = `${dots(r, probs.length)}<div class="vwrap" id="vw"></div><div class="kwrap" id="kw"></div>`;
    function step() {
      const ri = bt && si === 2 ? 3 : si;
      $('#vw', st).innerHTML = mulVertHTML(a, b, rows, ri);
      if (si >= steps.length) { api.ok(`${a} × ${b} = ${res}`); speak(`${a} 乘以 ${b} 等於 ${res}`); r++; return later(round, 2200); }
      const s = steps[si]; api.say(s.msg);
      keypad($('#kw', st), s.v, () => { rows[ri].v = s.v; si++; later(step, 700); }, s.hint);
    }
    step();
  }
  round();
}

/* ===== 2-A 乘法直式工作台 ===== */
function u2A(st) {
  const m2 = (lo, hi) => { let b; do { b = rand(lo, hi); } while (b % 10 === 0); return b; }; // 乘數個位不是 0（乘以幾十在 2-B 練）
  mulLevel(st, [[rand(1203, 2489), rand(3, 4)], [rand(13, 49), m2(21, 68)], [rand(105, 389), m2(23, 47)], [rand(1012, 2345), m2(12, 31)]]);
}

/* ===== 2-B 乘法想一想 ===== */
function u2B(st) {
  const rounds = [
    () => { const a = rand(21, 48), t = rand(2, 4); return { q: `${a} × ${t}5 的直式中，第二列為什麼從<b>十位</b>開始寫？`, vis: mulVertHTML(a, t * 10 + 5, [{ v: a * 5 }, { v: a * t, shift: 1 }], -1), opts: [{ h: `<span class="small-opt">因為是 ${a} × ${t} 個十</span>`, ok: true }, { h: '<span class="small-opt">因為寫錯了</span>', ok: false }, { h: `<span class="small-opt">因為是 ${a} × ${t} 個一</span>`, ok: false }], hint: '乘數的十位是幾個十？' }; },
    () => { const a = pick([198, 297, 302, 401, 499, 603]), b = rand(4, 8), e = Math.round(a / 100) * 100 * b; return { q: `${a} × ${b}，積大約是多少？`, opts: shuffle([e, e + 1000, Math.max(100, e - 1000)]).map(v => ({ h: N(v), ok: v === e })), hint: `${a} 很接近 ${Math.round(a / 100) * 100}！`, after: `${a} 接近 ${Math.round(a / 100) * 100}，${Math.round(a / 100) * 100} × ${b} = ${e}` }; },
    () => { const a = rand(12, 48), b = rand(2, 9); return { q: `${a} × ${b}0 = ？`, vis: `<span class="eq sm">${a} × ${b} = ${a * b}</span>`, ans: a * b * 10, hint: `${b}0 是 ${b} 個十，先算 ${a} × ${b}，再在後面補一個 0！`, after: `${a} × ${b} 個十 = ${a * b} 個十 = ${a * b * 10}` }; },
    () => { const a = rand(23, 89), b = rand(12, 19); return { q: `${a} × ${b} 和下面哪一個一樣？`, opts: [{ h: `<span class="small-opt">${a} × 10 + ${a} × ${b - 10}</span>`, ok: true }, { h: `<span class="small-opt">${a} × 10 + ${b - 10}</span>`, ok: false }, { h: `<span class="small-opt">${a} + 10 × ${b - 10}</span>`, ok: false }], hint: `${b} = 10 + ${b - 10}，兩個部分都要乘 ${a}！` }; },
    () => { const a = rand(1201, 2499), b = rand(3, 4), w = a * b + pick([100, 10, -10]); return { q: `小明算 ${a} × ${b} = ${w}，對不對？`, keep: true, opts: [{ h: '對', ok: w === a * b }, { h: '不對', ok: w !== a * b }], hint: '從個位乘起，檢查每一位的進位！', after: `${a} × ${b} = ${a * b}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 2-C 乘法應用挑戰 ===== */
function u2C(st) {
  const rounds = [
    () => { const a = rand(18, 36), b = rand(24, 48); return { q: `一箱飲料有 ${a} 瓶，${b} 箱共有幾瓶？`, vis: '<span style="font-size:56px">🧃</span>', ans: a * b, unit: '瓶', hint: `${a} × ${b}`, after: `${a} × ${b} = ${a * b}（瓶）` }; },
    () => { const a = rand(12, 39) * 50, b = rand(3, 8); return { q: `一張音樂會門票 ${a} 元，買 ${b} 張要多少元？`, vis: '<span style="font-size:56px">🎫</span>', ans: a * b, unit: '元', hint: `${a} × ${b}`, after: `${a} × ${b} = ${a * b}（元）` }; },
    () => { const a = rand(115, 265), b = rand(14, 31); return { q: `阿嬤每天走 ${a} 公尺，${b} 天共走幾公尺？`, vis: '<span style="font-size:56px">🚶‍♀️</span>', ans: a * b, unit: '公尺', hint: `${a} × ${b}`, after: `${a} × ${b} = ${a * b}（公尺）` }; },
    () => { const a = rand(1105, 2350), b = rand(12, 25); return { q: `學校買 ${b} 臺平板，每臺 ${a} 元，共要多少元？`, vis: '<span style="font-size:56px">📱</span>', ans: a * b, unit: '元', hint: `${a} × ${b}`, after: `${a} × ${b} = ${a * b}（元）` }; },
    () => { const a = rand(25, 45), b = rand(12, 18), c = rand(3, 9); return { q: `每排坐 ${a} 人，坐了 ${b} 排還有 ${c} 人沒位子，一共有幾人？`, vis: '<span style="font-size:56px">🪑</span>', ans: a * b + c, unit: '人', hint: `先算 ${a} × ${b}，再加 ${c}`, after: `${a} × ${b} + ${c} = ${a * b + c}（人）` }; }
  ];
  quiz(st, rounds);
}

/* ===== 3-A 轉轉量角器畫角：拖曳粉紅色的邊 ===== */
function u3A(st) {
  const tg = [rand(4, 8) * 5, rand(11, 17) * 10, rand(19, 33) * 5, rand(5, 16) * 10 + 5];
  const flips = [false, false, true, true];
  let r = 0;
  function round() {
    if (r >= tg.length) return api.finish();
    const t = tg[r], flip = flips[r]; let a = 90;
    api.say(`拖動粉紅色的邊，畫出 <b class="big">${t}°</b> 的角。${flip ? '<br><small>這次另一邊在<b>左邊</b>，要看哪一圈的刻度？</small>' : ''}`, `拖動粉紅色的邊，畫出 ${t} 度的角${flip ? '。這次另一邊在左邊，要看外圈的刻度' : ''}`);
    st.innerHTML = `${dots(r, tg.length)}<div class="prot-wrap" id="pw"></div><div class="center"><button type="button" class="btn ghost" id="m5">◀ 少 5°</button> <button type="button" class="btn ghost" id="p5">多 5° ▶</button></div><div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const pw = $('#pw', st);
    const draw = () => { pw.innerHTML = protractorSVG(a, { flip, handle: true }); };
    draw();
    pw.style.touchAction = 'none';
    const setFrom = e => {
      const svg = $('svg', pw), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      let deg = Math.atan2(210 - p.y, p.x - 200) * 180 / Math.PI;
      if (deg < 0) deg = deg < -90 ? 180 : 0;
      deg = Math.round(deg / 5) * 5; if (flip) deg = 180 - deg;
      deg = Math.max(0, Math.min(180, deg));
      if (deg !== a) { a = deg; draw(); }
    };
    let dragging = false;
    pw.addEventListener('pointerdown', e => { dragging = true; try { pw.setPointerCapture(e.pointerId); } catch (er) {} setFrom(e); e.preventDefault(); });
    pw.addEventListener('pointermove', e => { if (dragging) setFrom(e); });
    pw.addEventListener('pointerup', () => { dragging = false; });
    pw.addEventListener('pointercancel', () => { dragging = false; });
    $('#m5', st).onclick = () => { a = Math.max(0, a - 5); sfx('tap'); draw(); };
    $('#p5', st).onclick = () => { a = Math.min(180, a + 5); sfx('tap'); draw(); };
    $('#okb', st).onclick = () => {
      if (a === t) { api.ok(`對！這是 ${t}° 的角`); speak(`對，這是 ${t} 度的角`); r++; later(round, 1800); }
      else api.bad(`現在是 ${a}°，${a > t ? '太大了' : '太小了'}！${flip ? '從左邊的 0 開始看外圈。' : '從右邊的 0 開始看內圈。'}`);
    };
  }
  round();
}

/* ===== 3-B 量角與角的分類 ===== */
function u3B(st) {
  const kind = d => d < 90 ? '銳角' : d === 90 ? '直角' : d < 180 ? '鈍角' : '平角';
  const kindQ = d => ({ q: '這是什麼角？', vis: angleSVG(d, rand(0, 3) * 15), keep: true, opts: ['銳角', '直角', '鈍角', '平角'].map(k => ({ h: k, ok: k === kind(d) })), hint: '比 90° 小是銳角，比 90° 大、比 180° 小是鈍角！', after: `${d}° 是${kind(d)}` });
  const rounds = [
    () => { const d = rand(3, 16) * 10 + pick([0, 5]); return { q: '量角器上的角是幾度？', vis: `<div class="prot-wrap">${protractorSVG(d)}</div>`, ans: d, unit: '度', hint: '黑色的邊對準右邊的 0，要看內圈（粉紅色）的數字！', after: `${d}°` }; },
    () => { const d = rand(3, 16) * 10 + pick([0, 5]); return { q: '量角器上的角是幾度？（注意：這次邊在左邊）', vis: `<div class="prot-wrap">${protractorSVG(d, { flip: true })}</div>`, ans: d, unit: '度', hint: '黑色的邊對準左邊的 0，要看外圈（藍色）的數字！', after: `${d}°` }; },
    () => kindQ(rand(2, 8) * 10),
    () => kindQ(pick([100, 120, 135, 150, 165])),
    () => kindQ(pick([90, 180])),
    () => { const d = pick([30, 90, 150]); return { q: '估一估，這個角大約是幾度？', vis: angleSVG(d + pick([-4, 3]), rand(0, 2) * 20), keep: true, opts: [30, 90, 150].map(v => ({ h: `約 ${v}°`, ok: v === d })), hint: '先和直角（90°）比一比！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 3-C 旋轉角與角度計算 ===== */
function u3C(st) {
  const rounds = [
    () => { const [t, d] = pick([['3', 90], ['6', 180], ['9', 270]]); return { q: `時鐘的分針從 12 順時針轉到 ${t}，轉了幾度？`, vis: `<span style="font-size:64px">🕛➡️</span>`, ans: d, unit: '度', hint: '轉一圈是 360°，從 12 到 3 是四分之一圈！', after: `${d}°` }; },
    () => pick([
      { q: '轉一整圈是幾度？（周角）', vis: '<span style="font-size:64px">🔄</span>', ans: 360, unit: '度', hint: '兩個平角合起來！', after: '一圈 = 360°' },
      { q: '轉半圈是幾度？（平角）', vis: '<span style="font-size:64px">↩️</span>', ans: 180, unit: '度', hint: '兩個直角合起來！', after: '半圈 = 180°' }
    ]),
    () => { const a = rand(3, 9) * 5, b = rand(4, 12) * 5; return { q: `${a}° 的角和 ${b}° 的角拼在一起，合成幾度？`, vis: `<div class="angs">${angleSVG(a, 0, 120)}<span class="eq">＋</span>${angleSVG(b, 0, 120)}</div>`, ans: a + b, unit: '度', hint: '角的合成就是把度數加起來！', after: `${a}° + ${b}° = ${a + b}°` }; },
    () => { const a = rand(5, 16) * 10 + pick([0, 5]); return { q: `一條直線上（平角）分成兩個角，一個是 ${a}°，另一個是幾度？`, vis: angleSVG(180, 0, 140), ans: 180 - a, unit: '度', hint: '平角是 180°！', after: `180° − ${a}° = ${180 - a}°` }; },
    () => { const a = rand(19, 34) * 10; return { q: `一個周角裡已經有 ${a}° 的角，剩下的角是幾度？`, vis: '<span style="font-size:64px">⭕</span>', ans: 360 - a, unit: '度', hint: '周角是 360°！', after: `360° − ${a}° = ${360 - a}°` }; },
    () => { const [a, b] = pick([[45, 30], [45, 60], [90, 45], [90, 30]]); return { q: `用一副三角板的 ${a}° 角和 ${b}° 角拼起來，是幾度？`, vis: '<span style="font-size:64px">📐📐</span>', ans: a + b, unit: '度', hint: '把兩個角的度數加起來！', after: `${a}° + ${b}° = ${a + b}°` }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u1: [u1A, u1B, u1C], u2: [u2A, u2B, u2C], u3: [u3A, u3B, u3C] });
