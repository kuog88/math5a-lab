'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林二上有，南一二上沒有的內容
   x1  錢幣與付錢（康軒第 1 單元「使用錢幣」、翰林第 1 單元「付錢」；200 以內，1、5、10、50 元和 100 元）
   x5  面的大小比較（康軒第 5 單元、翰林第 10 單元；南一放在二下第 10 單元，關卡從 grade2-2 的 10-A、10-B 改寫）
   x10 重量的比較（康軒第 10 單元「容量與重量」；南一放在二下第 6 單元，關卡從 grade2-2 的 6-A～6-C 改寫）
   康軒第 5 單元在乘法之前，所以面積只用數格子、疊起來比，不用乘法。 */

const xOpts = (ans, wrongs, fmt = v => typeof v === 'number' ? N(v) : v) => {
  const vals = [ans]; wrongs.forEach(w => { if (!vals.includes(w)) vals.push(w); });
  return vals.map(v => ({ h: fmt(v), ok: v === ans, t: String(v) }));
};
const tag = s => `<div class="readout">${s}</div>`;

/* ---------- 錢幣：把金額拆成錢幣（大的先） ---------- */
const COINS = [100, 50, 10, 5, 1];
function toCoins(n) { const out = []; COINS.forEach(c => { while (n >= c) { out.push(c); n -= c; } }); return out; }
const sumOf = a => a.reduce((x, y) => x + y, 0);
/* 隨機一組錢（不一定是最少枚數）：至少 2 種錢幣 */
function randCoins(max) {
  for (let g = 0; g < 50; g++) {
    const c = { 100: rand(0, max >= 150 ? 1 : 0), 50: rand(0, 2), 10: rand(0, 5), 5: rand(0, 2), 1: rand(0, 5) };
    const list = COINS.flatMap(v => Array(c[v]).fill(v)), s = sumOf(list);
    if (s > 0 && s <= max && new Set(list).size >= 2 && list.length >= 3) return list;
  }
  return [50, 10, 10, 1];
}
const money = list => coinsHTML(list);

/* ===== 補 1-A 數數看有多少錢 ===== */
function x1A(st) {
  const rounds = [0, 1, 2, 3, 4].map(k => () => {
    const list = randCoins(k < 2 ? 99 : 200), n = sumOf(list);
    return { q: '一共是多少元？', vis: money(list), ans: n, unit: '元', hint: '先數大的錢，再數小的錢，一個一個往上加！', after: `${n} 元` };
  });
  quiz(st, rounds);
}

/* ===== 補 1-B 換錢和拿錢 ===== */
function x1B(st) {
  const swap = () => pick([
    { q: '1 張 100 元可以換幾個 10 元？', vis: money([100]) + '<span class="eq">＝</span>' + money([10, 10, 10]) + '<span class="eq">…</span>', ans: 10, unit: '個', hint: '10、20、30……數到 100！', after: '10 個 10 元是 100 元' },
    { q: '1 個 50 元可以換幾個 10 元？', vis: money([50]), ans: 5, unit: '個', hint: '10、20、30、40、50，數一數！', after: '5 個 10 元是 50 元' },
    { q: '2 個 50 元可以換幾張 100 元？', vis: money([50, 50]), ans: 1, unit: '張', hint: '50 加 50 是多少？', after: '50 + 50 = 100，換 1 張 100 元' },
    { q: '1 個 10 元可以換幾個 5 元？', vis: money([10]), ans: 2, unit: '個', hint: '5 加 5 是 10！', after: '2 個 5 元是 10 元' },
    { q: '1 個 5 元可以換幾個 1 元？', vis: money([5]), ans: 5, unit: '個', hint: '1、2、3、4、5！', after: '5 個 1 元是 5 元' }
  ]);
  const take = () => {
    const n = rand(21, 189), right = toCoins(n), d = pick([1, 5, 10]);
    const w1 = toCoins(n + d), w2 = toCoins(n - d > 0 ? n - d : n + 2 * d);
    const sets = [right, w1, w2];
    return { q: `要拿出 <b>${n} 元</b>，哪一組錢剛好？`, sp: `要拿出 ${n} 元，哪一組錢剛好？`, opts: sets.map((s, i) => ({ h: money(s), ok: i === 0, t: `${sumOf(s)} 元` })), hint: '每一組都數一數，看哪一組剛好是這麼多！' };
  };
  quiz(st, [swap, take, swap, take, take]);
}

/* ===== 補 1-C 剛好付錢 ===== */
function x1C(st) {
  const ITEMS = [['✏️', '鉛筆'], ['📒', '筆記本'], ['🧃', '果汁'], ['🧸', '小熊'], ['⚽', '足球'], ['🎨', '彩色筆']];
  const exact = () => {
    const [e, nm] = pick(ITEMS), n = rand(16, 195), right = toCoins(n);
    const more = toCoins(n + pick([5, 10])), less = toCoins(n - pick([1, 5]) > 0 ? n - pick([1, 5]) : n + 1);
    return { q: `${e} ${nm}賣 <b>${n} 元</b>，用哪一組錢可以<b>剛好</b>付清？`, sp: `${nm}賣 ${n} 元，用哪一組錢可以剛好付清？`, opts: [right, more, less].map((s, i) => ({ h: money(s), ok: i === 0, t: `${sumOf(s)} 元` })), hint: '剛好付清就是不多也不少！' };
  };
  const enough = () => {
    const [e, nm] = pick(ITEMS), have = randCoins(200), h = sumOf(have), price = Math.max(3, h + pick([-12, -5, 5, 12, 0]));
    const ok = h >= price;
    return { q: `${e} ${nm}賣 <b>${price} 元</b>，這些錢夠不夠買？`, sp: `${nm}賣 ${price} 元，這些錢夠不夠買？`, vis: money(have), keep: true,
      opts: xOpts(ok ? '夠' : '不夠', [ok ? '不夠' : '夠']), hint: '先數一數有多少錢，再和價錢比一比！', after: `一共 ${h} 元，${ok ? '夠' : '不夠'}買 ${price} 元的${nm}` };
  };
  const fewest = () => {
    const n = rand(3, 19) * 10 + pick([0, 5]), c = toCoins(n);
    return { q: `付 <b>${n} 元</b>，最少要用幾個錢幣（紙鈔也算 1 個）？`, sp: `付 ${n} 元，最少要用幾個錢幣？紙鈔也算一個。`, vis: money([100, 50, 10, 5]), ans: c.length, unit: '個', hint: '先用大的錢，大的不能用了再用小的！', after: `${c.join(' + ')} = ${n}，用 ${c.length} 個` };
  };
  quiz(st, [exact, enough, fewest, exact, enough]);
}

/* ---------- 方格圖形（面積） ---------- */
const AREA = { // [列, 行]
  L8: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3]],
  bar8: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
  sq9: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  T7: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [2, 1], [3, 1]],
  r10: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
  z10: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [1, 4], [0, 3]],
  r12a: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
  r12b: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2], [2, 3]]
};
const mv = (cells, dr, dc) => cells.map(([r, c]) => [r + dr, c + dc]);
function areaPair(a, b) {
  const wa = Math.max(...AREA[a].map(x => x[1])) + 1;
  return [{ name: '甲', cells: mv(AREA[a], 1, 0), color: '#ffc93c' }, { name: '乙', cells: mv(AREA[b], 1, wa + 2), color: '#7cc8ff' }];
}
function areaSVG(shapes, sz = 30) {
  const rows = Math.max(...shapes.flatMap(s => s.cells.map(x => x[0]))) + 2, cols = Math.max(...shapes.flatMap(s => s.cells.map(x => x[1]))) + 2;
  let s = '';
  for (let r = 0; r <= rows; r++) s += `<line x1="0" y1="${r * sz}" x2="${cols * sz}" y2="${r * sz}" stroke="#e3d6ec" stroke-width="1"/>`;
  for (let c = 0; c <= cols; c++) s += `<line x1="${c * sz}" y1="0" x2="${c * sz}" y2="${rows * sz}" stroke="#e3d6ec" stroke-width="1"/>`;
  shapes.forEach(sh => {
    sh.cells.forEach(([r, c]) => s += `<rect class="${sh.cls || ''}" data-s="${sh.name}" x="${c * sz + 1}" y="${r * sz + 1}" width="${sz - 2}" height="${sz - 2}" rx="3" fill="${sh.color}" stroke="#4a3b5c" stroke-width="1.5"/>`);
    if (sh.name) { const [r0, c0] = sh.cells[0]; s += `<text x="${c0 * sz + sz / 2}" y="${r0 * sz - 6}" text-anchor="middle" font-size="20" font-weight="900" fill="#4a3b5c">${sh.name}</text>`; }
  });
  return `<svg class="area-svg" viewBox="0 0 ${cols * sz} ${rows * sz}" style="width:min(${cols * sz}px,86vw);height:auto">${s}</svg>`;
}

/* ===== 補 5-A 數格子比面積（點格子做記號） ===== */
function x5A(st) {
  const sets = shuffle([['L8', 'sq9'], ['T7', 'L8'], ['r10', 'sq9'], ['bar8', 'T7'], ['z10', 'r10']]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= sets.length) return api.finish();
    const sh = areaPair(...sets[r]), ca = sh[0].cells.length, cb = sh[1].cells.length, marked = new Set();
    curQ = null;
    api.say('點一點格子數一數，<b>甲</b>和<b>乙</b>哪一個面<b>比較大</b>？', '點一點格子數一數，甲和乙哪一個面比較大？');
    st.innerHTML = `${dots(r, sets.length)}<div class="qvis">${areaSVG(sh.map(s => ({ ...s, cls: 'cell' })))}</div>
      <div class="readout">甲點了 <b class="ca">0</b> 格，乙點了 <b class="cb">0</b> 格</div><div class="opts"></div>`;
    const all = $$('rect.cell', st);
    all.forEach((c, i) => { c.style.cursor = 'pointer'; c.addEventListener('click', () => {
      sfx('tap');
      if (marked.has(i)) { marked.delete(i); c.setAttribute('opacity', '1'); } else { marked.add(i); c.setAttribute('opacity', '.4'); }
      let x = 0, y = 0; marked.forEach(k => all[k].dataset.s === '甲' ? x++ : y++);
      $('.ca', st).textContent = x; $('.cb', st).textContent = y;
    }); });
    const ans = ca > cb ? '甲比較大' : ca < cb ? '乙比較大' : '一樣大';
    curQ = { q: `甲有 ${ca} 格、乙有 ${cb} 格，哪一個面比較大？`, c: ans };
    ['甲比較大', '乙比較大', '一樣大'].forEach(h => $('.opts', st).appendChild(optBtn({ h, ok: h === ans }, () => {
      $('.readout', st).innerHTML = `甲有 ${ca} 格，乙有 ${cb} 格，${ans}！`; speak(`甲有 ${ca} 格，乙有 ${cb} 格，${ans}`); r++; later(round, 2200);
    }, '每一格都一樣大，數一數格子的數量。')));
  }
  round();
}

/* ===== 補 5-B 面的比較：疊起來比、數格子、用一樣大的磁磚 ===== */
function x5B(st) {
  const overlap = () => { const big = pick(['紅', '藍']); return { q: '把兩張紙疊在一起比，哪一張的面<b>比較大</b>？', sp: '把兩張紙疊在一起比，哪一張的面比較大？',
    vis: `<svg viewBox="0 0 260 170" style="width:min(260px,80vw)"><rect x="20" y="15" width="${big === '紅' ? 200 : 130}" height="${big === '紅' ? 140 : 90}" fill="#ff7eb3" opacity=".85" stroke="#4a3b5c" stroke-width="3"/><rect x="20" y="15" width="${big === '藍' ? 200 : 130}" height="${big === '藍' ? 140 : 90}" fill="#5bb4ff" opacity=".55" stroke="#4a3b5c" stroke-width="3"/></svg>`,
    opts: xOpts(`${big}色紙`, [`${big === '紅' ? '藍' : '紅'}色紙`, '一樣大']), keep: true, hint: '疊在一起，露出來的那一張比較大。', after: `${big}色紙把另一張完全蓋住，${big}色紙比較大` }; };
  const tile = () => { const a = rand(8, 15), b = a + pick([-3, -2, 2, 3]); return { q: `用<b>一樣大</b>的磁磚鋪地板：客廳用了 <b>${a}</b> 塊，廚房用了 <b>${b}</b> 塊。哪一間的地板比較大？`, sp: `用一樣大的磁磚鋪地板：客廳用了 ${a} 塊，廚房用了 ${b} 塊。哪一間的地板比較大？`,
    vis: '<span style="font-size:40px">🟫🟫🟫</span>', opts: xOpts(a > b ? '客廳' : '廚房', [a > b ? '廚房' : '客廳', '一樣大']), keep: true, hint: '磁磚一樣大，用得越多，面越大。', after: `${Math.max(a, b)} 塊比 ${Math.min(a, b)} 塊多` }; };
  const count = () => { const k = pick(Object.keys(AREA)); return { q: '這個圖形有幾格？', vis: areaSVG([{ name: '', cells: AREA[k], color: '#3fcf9c' }]), ans: AREA[k].length, unit: '格', hint: '一格一格點著數，不要漏掉。', after: `一共 ${AREA[k].length} 格` }; };
  quiz(st, [overlap, count, tile, count, overlap]);
}

/* ===== 補 5-C 面積比較挑戰 ===== */
function x5C(st) {
  const look = () => { const sh = areaPair('bar8', 'sq9'); return { q: '甲看起來比較長，哪一個面<b>比較大</b>？', sp: '甲看起來比較長，哪一個面比較大？', vis: areaSVG(sh), opts: xOpts('乙', ['甲', '一樣大']), keep: true, hint: '不能只看長不長，要數格子！', after: '甲 8 格，乙 9 格，乙比較大' }; };
  const same = () => { const sh = areaPair('r12a', 'r12b'); return { q: '甲和乙，哪一個面<b>比較大</b>？', sp: '甲和乙，哪一個面比較大？', vis: areaSVG(sh), opts: xOpts('一樣大', ['甲', '乙']), keep: true, hint: '兩個都數數看！', after: '甲 12 格，乙 12 格，一樣大' }; };
  const unit = () => ({ q: '甲桌面用 <b>6 塊大磁磚</b>鋪滿，乙桌面用 <b>6 塊小磁磚</b>鋪滿。哪一張桌面比較大？', sp: '甲桌面用 6 塊大磁磚鋪滿，乙桌面用 6 塊小磁磚鋪滿。哪一張桌面比較大？',
    vis: `<svg viewBox="0 0 300 110" style="width:min(300px,84vw)"><text x="64" y="16" font-size="16" font-weight="900" text-anchor="middle">甲</text>${[0, 1, 2].map(c => [0, 1].map(r => `<rect x="${2 + c * 42}" y="${22 + r * 42}" width="40" height="40" fill="#ffc93c" stroke="#4a3b5c" stroke-width="2"/>`).join('')).join('')}<text x="220" y="16" font-size="16" font-weight="900" text-anchor="middle">乙</text>${[0, 1, 2].map(c => [0, 1].map(r => `<rect x="${184 + c * 24}" y="${22 + r * 24}" width="22" height="22" fill="#7cc8ff" stroke="#4a3b5c" stroke-width="2"/>`).join('')).join('')}</svg>`,
    opts: xOpts('甲', ['乙', '一樣大']), keep: true, hint: '塊數一樣，可是磁磚大小一樣嗎？', after: '甲的磁磚比較大，甲的桌面比較大' });
  const diff = () => { const [a, b] = shuffle([['L8', 'sq9'], ['T7', 'L8'], ['r10', 'sq9']])[0], sh = areaPair(a, b), ca = AREA[a].length, cb = AREA[b].length;
    return { q: '大的面比小的面多幾格？', vis: areaSVG(sh), eq: [Math.max(ca, cb), '−', Math.min(ca, cb)], nums: [ca, cb], unit: '格', hint: '多幾格是相差，用減法 −', after: `${Math.max(ca, cb)} − ${Math.min(ca, cb)} = ${Math.abs(ca - cb)} 格` }; };
  quiz(st, [look, diff, unit, same, diff]);
}

/* ---------- 天平 ---------- */
function balanceSVG(left, right, tilt) {
  const a = tilt * 12, rad = a * Math.PI / 180, cx = 260, cy = 90, L = 170;
  const lx = cx - L * Math.cos(rad), ly = cy - L * Math.sin(rad), rx = cx + L * Math.cos(rad), ry = cy + L * Math.sin(rad);
  const pan = (x, y, items) => `<line x1="${x}" y1="${y}" x2="${x - 50}" y2="${y + 70}" stroke="#8a7d99" stroke-width="3"/><line x1="${x}" y1="${y}" x2="${x + 50}" y2="${y + 70}" stroke="#8a7d99" stroke-width="3"/>
    <path d="M${x - 70} ${y + 70} Q${x} ${y + 105} ${x + 70} ${y + 70} Z" fill="#ffc93c" stroke="#4a3b5c" stroke-width="4"/>
    <text x="${x}" y="${y + 64}" font-size="34" text-anchor="middle">${items}</text>`;
  return `<svg class="scale-svg" viewBox="0 0 520 280" style="width:min(340px,84vw);height:auto"><rect x="235" y="240" width="50" height="16" rx="4" fill="#4a3b5c"/><polygon points="260,90 236,240 284,240" fill="#a98bff"/>
    <line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="#4a3b5c" stroke-width="10" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="10" fill="#ff7eb3"/>
    ${pan(lx, ly, left)}${pan(rx, ry, right)}</svg>`;
}

/* ===== 補 10-A 天平秤一秤：用積木秤出東西的重量 ===== */
function x10A(st) {
  const items = shuffle([['📕', '故事書'], ['🍎', '蘋果'], ['🧸', '小熊'], ['🥤', '水壺'], ['👟', '球鞋']]).slice(0, 3).map(x => [...x, rand(3, 9)]);
  let r = 0;
  function round() {
    if (r >= items.length) return api.finish();
    const [e, nm, w] = items[r]; let k = 0;
    curQ = { q: `${nm}放在左邊，右邊放幾個積木天平會平衡？`, c: `${w} 個積木` };
    api.say(`${nm}放在左邊，在右邊放積木 🟨，放到天平<b>平衡</b>為止。`, `${nm}放在左邊，在右邊放積木，放到天平平衡為止。`);
    st.innerHTML = `${dots(r, items.length)}<div class="qvis sc-wrap"></div><div class="readout">右邊有 <b class="k">0</b> 個積木</div>
      <div class="center" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center"><button type="button" class="btn blue" data-a="+">＋ 1 個積木</button><button type="button" class="btn ghost" data-a="-">拿走 1 個</button><button type="button" class="btn mint" data-a="ok">平衡了！</button></div>`;
    const draw = () => { $('.sc-wrap', st).innerHTML = balanceSVG(e, k ? (k > 4 ? `🟨×${k}` : '🟨'.repeat(k)) : '', k < w ? -1 : k > w ? 1 : 0); $('.k', st).textContent = k; };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === '+' && k < 12) k++;
      if (a === '-' && k > 0) k--;
      if (a === 'ok') {
        if (k === w) { api.ok(`${nm}和 ${w} 個積木一樣重！`); speak(`${nm}和 ${w} 個積木一樣重`); r++; later(round, 1800); return; }
        api.bad(k < w ? `左邊比較低，表示${nm}比較重，再放積木。` : '右邊比較低，積木太多了！', `${k} 個積木`, `${w} 個積木`);
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 補 10-B 誰比較重 ===== */
function x10B(st) {
  const pairQ = () => { // 依真實輕重排好：前面的比後面的重
    const list = [['🍉', '西瓜'], ['🎒', '書包'], ['📕', '故事書'], ['✏️', '鉛筆'], ['🍃', '樹葉'], ['🪶', '羽毛']];
    const i = rand(0, 3), j = rand(i + 1, 5), heavy = list[i], light = list[j];
    const [a, b] = Math.random() < 0.5 ? [heavy, light] : [light, heavy], tilt = a === heavy ? -1 : 1;
    return { q: '看天平，<b>哪一個比較重</b>？', sp: '看天平，哪一個比較重？', vis: balanceSVG(a[0], b[0], tilt), opts: xOpts(`${heavy[0]} ${heavy[1]}`, [`${a[0]} ${a[1]}`, `${b[0]} ${b[1]}`, '一樣重']), hint: '比較重的那邊會往下沉。', after: `往下沉的${heavy[1]}比較重` };
  };
  const eqQ = () => ({ q: '天平兩邊<b>一樣高</b>，表示什麼？', sp: '天平兩邊一樣高，表示什麼？', vis: balanceSVG('🍎', '🟨🟨🟨', 0), opts: xOpts('兩邊一樣重', ['左邊比較重', '右邊比較重']), keep: true, hint: '平衡就是一樣重。', after: '1 顆蘋果和 3 個積木一樣重' });
  const transQ = () => {
    const nm = shuffle([['🟥', '紅盒子'], ['🟦', '藍盒子'], ['🟩', '綠盒子']]), askHeavy = Math.random() < 0.5; // nm[0] > nm[1] > nm[2]
    return { q: `${nm[0][1]}比${nm[1][1]}重，${nm[1][1]}比${nm[2][1]}重。哪一個<b>最${askHeavy ? '重' : '輕'}</b>？`, sp: `${nm[0][1]}比${nm[1][1]}重，${nm[1][1]}比${nm[2][1]}重。哪一個最${askHeavy ? '重' : '輕'}？`,
      vis: balanceSVG(nm[0][0], nm[1][0], -1) + balanceSVG(nm[1][0], nm[2][0], -1),
      opts: xOpts(askHeavy ? nm[0][1] : nm[2][1], [nm[1][1], askHeavy ? nm[2][1] : nm[0][1]]), hint: '排一排：最重 ＞ 中間 ＞ 最輕。', after: `${nm[0][1]} ＞ ${nm[1][1]} ＞ ${nm[2][1]}` };
  };
  quiz(st, [pairQ, eqQ, transQ, pairQ, transQ]);
}

/* ===== 補 10-C 用積木當單位 ===== */
function x10C(st) {
  const diffQ = () => { const a = rand(6, 12), b = rand(3, a - 2); return { q: `📕 故事書和 <b>${a}</b> 個積木一樣重，🍎 蘋果和 <b>${b}</b> 個積木一樣重。故事書比蘋果重幾個積木？`, sp: `故事書和 ${a} 個積木一樣重，蘋果和 ${b} 個積木一樣重。故事書比蘋果重幾個積木？`,
    vis: balanceSVG('📕', `🟨×${a}`, 0) + balanceSVG('🍎', `🟨×${b}`, 0), eq: [a, '−', b], unit: '個積木', hint: '重幾個積木是相差，用減法 −', after: `${a} − ${b} ＝ ${a - b} 個積木` }; };
  const whichQ = () => { const a = rand(4, 9), b = a + rand(1, 4); return { q: `🧤 手套重 <b>${a}</b> 個迴紋針，🧢 帽子重 <b>${b}</b> 個迴紋針。哪一個比較重？`, sp: `手套重 ${a} 個迴紋針，帽子重 ${b} 個迴紋針。哪一個比較重？`, vis: '<span style="font-size:40px">📎</span>', opts: xOpts('🧢 帽子', ['🧤 手套', '一樣重']), keep: true, hint: '同一種單位，數量多的比較重。', after: `${b} 個比 ${a} 個多，帽子比較重` }; };
  const unitQ = () => ({ q: '小明說：「書重 8 個<b>迴紋針</b>」；小華說：「盒子重 5 個<b>積木</b>」。可以直接說書比較重嗎？', sp: '小明說：書重 8 個迴紋針；小華說：盒子重 5 個積木。可以直接說書比較重嗎？', vis: '<span style="font-size:30px">📎 × 8　　🟨 × 5</span>', opts: xOpts('不可以，單位不一樣', ['可以，8 比 5 大', '可以，盒子比較重']), keep: true, hint: '迴紋針和積木一樣重嗎？', after: '要用同樣的單位，才能比數量' });
  quiz(st, [diffQ, whichQ, unitQ, diffQ, whichQ]);
}

Object.assign(LEVELS, { x1: [x1A, x1B, x1C], x5: [x5A, x5B, x5C], x10: [x10A, x10B, x10C] });
