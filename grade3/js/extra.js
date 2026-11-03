'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林三上有，南一三上沒有的內容（每單元 4 關，和本遊戲其他單元一樣）
   x1 點數錢幣（康軒第 1 單元「使用錢幣」、翰林第 1 單元「點數錢幣」：1000、500、100 元鈔和硬幣，10000 以內）
   x4 連乘兩步驟（康軒第 4 單元「連乘兩步驟」；南一在三下第 4 單元，4-A 從 grade3-2 改寫）
   x6 面積（康軒第 6 單元；南一在三下第 5 單元，5-A～5-C 從 grade3-2 改寫）
   x7 公斤和公克（翰林第 7 單元；南一在三下第 6 單元，6-A～6-C 從 grade3-2 改寫）
   x9 列表與規律（翰林第 9 單元；南一在三下第 2、10 單元，10-A、10-B、2-B 從 grade3-2 改寫）
   康軒、翰林第 1 單元還沒教四位數加減，所以點數錢幣只數錢、換錢、剛好付錢，不算找錢。 */

const xop = (h, ok, t) => ({ h, ok, t: t || String(h).replace(/<[^>]+>/g, '') });
const sm = s => `<span class="small-opt">${s}</span>`;

/* ---------- 錢：鈔票和硬幣 ---------- */
const MONEY = [1000, 500, 100, 50, 10, 5, 1];
function moneyOne(v) {
  if (v >= 100) { const c = { 1000: ['#cfe6ff', '#3b78c4'], 500: ['#ffe0b8', '#c4762b'], 100: ['#ffd6d6', '#c44b4b'] }[v];
    return `<svg class="xm bill" viewBox="0 0 110 54"><rect x="2" y="2" width="106" height="50" rx="6" fill="${c[0]}" stroke="${c[1]}" stroke-width="3"/><circle cx="26" cy="27" r="13" fill="${c[1]}" opacity=".25"/><text x="72" y="36" text-anchor="middle" font-size="24" font-weight="900" fill="${c[1]}" font-family="Arial">${v}</text></svg>`; }
  const c = { 50: ['#ffd76a', '#c49a17', 50], 10: ['#e6e9ef', '#7d8798', 44], 5: ['#dfe3ea', '#8a93a3', 40], 1: ['#e9b07a', '#a8683a', 34] }[v];
  return `<svg class="xm" viewBox="0 0 100 100" style="width:${c[2]}px;height:${c[2]}px"><circle cx="50" cy="50" r="46" fill="${c[0]}" stroke="${c[1]}" stroke-width="5"/><text x="50" y="63" text-anchor="middle" font-size="36" font-weight="900" fill="#4a3b5c" font-family="Arial">${v}</text></svg>`;
}
/* 錢的組合：{面額: 張數}，同一種超過 4 張就寫「×N」 */
function moneyHTML(cnt) {
  return `<div class="xmoney">${MONEY.filter(v => cnt[v]).map(v => cnt[v] > 4 ? `<span class="xmg">${moneyOne(v)}<b>× ${cnt[v]}</b></span>` : `<span class="xmg">${moneyOne(v).repeat(cnt[v])}</span>`).join('')}</div>`;
}
const mTotal = cnt => MONEY.reduce((s, v) => s + v * (cnt[v] || 0), 0);
function fewest(n) { const c = {}; MONEY.forEach(v => { c[v] = Math.floor(n / v); n %= v; }); return c; }
const pieces = c => MONEY.reduce((s, v) => s + (c[v] || 0), 0);
const moneyText = c => MONEY.filter(v => c[v]).map(v => `${c[v]} ${v >= 100 ? '張' : '個'} ${v} 元`).join('、');

/* ===== 補 1-A 數數看有多少錢 ===== */
function x1A(st) {
  quiz(st, [0, 1, 2, 3, 4].map(k => () => {
    let c; do { c = { 1000: rand(0, k < 2 ? 3 : 8), 500: rand(0, 1), 100: rand(0, 4), 50: rand(0, 1), 10: rand(0, 4), 5: rand(0, 1), 1: rand(0, 4) }; } while (mTotal(c) < 300 || mTotal(c) > 9999 || Object.values(c).filter(Boolean).length < 4);
    const n = mTotal(c);
    return { q: '一共是多少元？', vis: moneyHTML(c), ans: n, unit: '元', hint: '先數鈔票（1000、500、100），再數硬幣，一個一個往上加！', after: `一共 ${n} 元` };
  }));
}

/* ===== 補 1-B 換錢和拿錢 ===== */
function x1B(st) {
  const swap = [
    { q: '1 張 1000 元可以換幾張 100 元？', vis: moneyHTML({ 1000: 1 }), ans: 10, unit: '張', hint: '100、200、300……數到 1000！', after: '10 張 100 元是 1000 元' },
    { q: '1 張 500 元可以換幾張 100 元？', vis: moneyHTML({ 500: 1 }), ans: 5, unit: '張', hint: '100、200、300、400、500！', after: '5 張 100 元是 500 元' },
    { q: '2 張 500 元可以換幾張 1000 元？', vis: moneyHTML({ 500: 2 }), ans: 1, unit: '張', hint: '500 ＋ 500 是多少？', after: '2 張 500 元是 1000 元' },
    { q: '1 張 100 元可以換幾個 10 元？', vis: moneyHTML({ 100: 1 }), ans: 10, unit: '個', hint: '10 個 10 是 100！', after: '10 個 10 元是 100 元' },
    { q: '30 張 100 元可以換幾張 1000 元？', vis: moneyHTML({ 100: 30 }), ans: 3, unit: '張', hint: '10 張 100 元換 1 張 1000 元！', after: '30 張 100 元是 3000 元，換 3 張 1000 元' }
  ];
  const take = () => {
    const n = rand(1, 9) * 1000 + rand(0, 9) * 100 + rand(0, 9) * 10 + rand(0, 9), right = fewest(n);
    const d = pick([1000, 100, 10]), w1 = fewest(n + d), w2 = fewest(n > d ? n - d : n + 2 * d);
    return { q: `要拿出 <b>${n} 元</b>，哪一組錢剛好？`, sp: `要拿出 ${n} 元，哪一組錢剛好？`, opts: [right, w1, w2].map((c, i) => xop(moneyHTML(c), i === 0, `${mTotal(c)} 元`)), hint: '一組一組數，千、百、十、一要對好！' };
  };
  quiz(st, [() => pick(swap.slice(0, 2)), take, () => pick(swap.slice(2)), take, take]);
}

/* ===== 補 1-C 剛好付錢 ===== */
function x1C(st) {
  const ITEMS = [['🚲', '腳踏車'], ['🎒', '書包'], ['👟', '球鞋'], ['🎮', '遊戲機'], ['📚', '一套故事書'], ['🧸', '大熊娃娃']];
  const exact = () => {
    const [e, nm] = pick(ITEMS), n = rand(1, 8) * 1000 + rand(1, 9) * 100 + pick([0, 50, 60, 80]), right = fewest(n);
    const w1 = fewest(n + 100), w2 = fewest(n - 10);
    return { q: `${e} ${nm}賣 <b>${n} 元</b>，用哪一組錢可以<b>剛好</b>付清？`, sp: `${nm}賣 ${n} 元，用哪一組錢可以剛好付清？`, opts: [right, w1, w2].map((c, i) => xop(moneyHTML(c), i === 0, `${mTotal(c)} 元`)), hint: '剛好付清就是不多也不少！' };
  };
  const place = () => {
    const n = rand(1, 9) * 1000 + rand(1, 9) * 100 + rand(1, 9) * 10 + rand(1, 9), ask = pick([[1000, '千'], [100, '百'], [10, '十']]);
    const k = Math.floor(n / ask[0]) % 10;
    return { q: `只用 1000 元、100 元、10 元、1 元付 <b>${n} 元</b>，要剛好又用最少的錢，<b>${ask[0]} 元</b>要幾${ask[0] >= 100 ? '張' : '個'}？`, sp: `只用 1000 元、100 元、10 元、1 元付 ${n} 元，要剛好又用最少的錢，${ask[0]} 元要幾${ask[0] >= 100 ? '張' : '個'}？`, ans: k, unit: ask[0] >= 100 ? '張' : '個', hint: `看 ${n} 的${ask[1]}位是多少！`, after: `${n} 的${ask[1]}位是 ${k}，要 ${k} ${ask[0] >= 100 ? '張' : '個'}` };
  };
  const few = () => {
    const n = rand(1, 3) * 1000 + pick([500, 600, 700]) + pick([50, 60, 10]) + pick([5, 6, 0]), c = fewest(n);
    return { q: `付 <b>${n} 元</b>，最少要用幾張鈔票和幾個硬幣？（一共幾個）`, sp: `付 ${n} 元，最少要用幾張鈔票和硬幣？`, vis: moneyHTML({ 1000: 1, 500: 1, 100: 1, 50: 1, 10: 1, 5: 1, 1: 1 }), ans: pieces(c), unit: '個', hint: '先用大的錢，大的不能用了再用小的！', after: `${moneyText(c)}，一共 ${pieces(c)} 個` };
  };
  const enough = () => {
    const c = { 1000: rand(1, 4), 500: rand(0, 1), 100: rand(0, 4) }, h = mTotal(c), price = h + pick([-300, -100, 100, 400]), ok = h >= price;
    return { q: `這些錢夠不夠買 <b>${price} 元</b>的東西？`, sp: `這些錢夠不夠買 ${price} 元的東西？`, vis: moneyHTML(c), keep: true, opts: [xop(sm('夠'), ok, '夠'), xop(sm('不夠'), !ok, '不夠')], hint: '先數有多少錢，再和價錢比大小。', after: `一共 ${h} 元，${ok ? '夠' : '不夠'}` };
  };
  quiz(st, [exact, place, few, enough, exact]);
}

const XM1 = [
  { q: '3 張 1000 元、5 張 100 元和 4 個 1 元，一共是多少元？', vis: moneyHTML({ 1000: 3, 100: 5, 1: 4 }), ans: 3504, unit: '元', hint: '十位是 0 要記得寫！',
    ex: '3 個千、5 個百、0 個十、4 個一，是 3504 元。', trap: '沒有 10 元，十位要寫 0，不是 354。' },
  { q: '1 張 500 元和 6 張 100 元，一共是多少元？', vis: moneyHTML({ 500: 1, 100: 6 }), ans: 1100, unit: '元', hint: '500 ＋ 600。',
    ex: '500 ＋ 600 ＝ 1100 元。', trap: '500 元是 1 張，但它是 5 個百，不是 1 個百。' },
  { q: '用 1000 元、100 元、10 元付 4070 元，要剛好又最少，哪一組對？', keep: true, opts: [xop(sm('4 張 1000 元、7 個 10 元'), true), xop(sm('4 張 1000 元、7 張 100 元'), false), xop(sm('47 張 100 元'), false)],
    ex: '4070 是 4 個千、0 個百、7 個十，所以要 4 張 1000 元和 7 個 10 元。', trap: '百位是 0，不能用 100 元。' },
  { q: '20 張 100 元和幾張 1000 元一樣多？', ans: 2, unit: '張', hint: '10 張 100 元 ＝ 1 張 1000 元。',
    ex: '10 張 100 元是 1000 元，20 張是 2000 元，和 2 張 1000 元一樣多。', trap: '不是 20 張，也不是 200 張。' },
  { q: '小明有 2 張 1000 元、1 張 500 元，想買 2600 元的球鞋，夠不夠？', keep: true, opts: [xop(sm('不夠'), true), xop(sm('夠'), false)],
    ex: '2000 ＋ 500 ＝ 2500 元，2500 比 2600 少，不夠。', trap: '有 3 張鈔票不代表有 3000 元，500 元那張只有 500。' }
];

/* ===== 補 4-A 一箱一箱算（連乘，從 grade3-2 的 4-A 改寫） ===== */
function x4A(st) {
  const items = [['巧克力', '顆', '盒', '箱'], ['貼紙', '張', '包', '袋'], ['彈珠', '顆', '袋', '桶'], ['鉛筆', '枝', '盒', '箱']];
  quiz(st, shuffle(items).slice(0, 3).map(([it, u1, u2, u3]) => () => {
    let a, b, c; do { a = rand(3, 9); b = rand(2, 8); c = rand(2, 6); } while (a * b * c > 400 || a === b || b === c || a === c);
    return {
      q: `一${u2}有 ${a} ${u1}${it}，一${u3}裝 ${b} ${u2}，${c} ${u3}共有幾${u1}${it}？`,
      vis: `${Array.from({ length: Math.min(c, 4) }, () => `<span style="display:inline-block;border:3px solid #ff9a4d;border-radius:12px;padding:4px;margin:4px;font-size:22px">${'📦'.repeat(b)}</span>`).join('')}${c > 4 ? '……' : ''}`,
      eq: [[a, '×', b], ['R', '×', c]], alt: [[[b, '×', c], [a, '×', 'R']]], ans: a * b * c, unit: u1,
      hint: `可以先算一${u3}有幾${u1}，也可以先算共有幾${u2}。一份一份一樣多，要用乘法！`,
      after: `${a} × ${b} ＝ ${a * b}，${a * b} × ${c} ＝ ${a * b * c}`
    };
  }));
}

/* ===== 補 4-B 先算哪一步 ===== */
function x4B(st) {
  const one = () => {
    let a, b, c; do { a = rand(3, 9); b = rand(2, 6); c = rand(2, 5); } while (a === b || b === c || a === c);
    const first = Math.random() < 0.5;
    return { q: `一盒有 ${a} 顆糖，一箱裝 ${b} 盒，${c} 箱有幾顆糖？先算 <b>${first ? `${a} × ${b}` : `${b} × ${c}`}</b>，算出來的是什麼？`, sp: `一盒有${a}顆糖，一箱裝${b}盒，${c}箱有幾顆糖？先算${first ? `${a}乘${b}` : `${b}乘${c}`}，算出來的是什麼？`,
      opts: [xop(sm('一箱有幾顆糖'), first), xop(sm(`${c} 箱有幾盒`), !first), xop(sm(`${c} 箱有幾顆糖`), false)], hint: '看兩個數各是「每盒幾顆」「每箱幾盒」還是「幾箱」。',
      after: first ? `${a} × ${b} ＝ ${a * b}，是一箱有幾顆` : `${b} × ${c} ＝ ${b * c}，是 ${c} 箱有幾盒` };
  };
  const which = () => {
    let a, b, c; do { a = rand(4, 9); b = rand(2, 6); c = rand(2, 5); } while (a === b || b === c || a === c);
    return { q: `一排 ${a} 張椅子，一間教室排 ${b} 排，${c} 間教室有幾張椅子？哪一個算式對？`, sp: `一排${a}張椅子，一間教室排${b}排，${c}間教室有幾張椅子？哪一個算式對？`,
      opts: [xop(`${a} × ${b} × ${c}`, true), xop(`${a} × ${b} ＋ ${c}`, false), xop(`${a} ＋ ${b} × ${c}`, false)], hint: '每一份都一樣多，兩步都是乘法！', after: `${a} × ${b} × ${c} ＝ ${a * b * c}` };
  };
  const same = () => {
    const a = rand(3, 9), b = rand(2, 6), c = rand(2, 5);
    return { q: `${a} × ${b} × ${c}，先算 ${a} × ${b} 或先算 ${b} × ${c}，答案會一樣嗎？`, sp: `${a}乘${b}乘${c}，先算哪兩個，答案會一樣嗎？`, keep: true,
      opts: [xop(sm('一樣'), true), xop(sm('不一樣'), false)], hint: '算算看兩種順序！', after: `${a * b} × ${c} ＝ ${a} × ${b * c} ＝ ${a * b * c}` };
  };
  quiz(st, [one, which, same, one, which]);
}

/* ===== 補 4-C 連乘應用挑戰 ===== */
function x4C(st) {
  const P = [
    () => { const p = rand(12, 25), n = rand(4, 6), k = rand(2, 4); return { q: `一枝原子筆 ${p} 元，一盒有 ${n} 枝，買 ${k} 盒要付多少元？`, eq: [[p, '×', n], ['R', '×', k]], alt: [[[n, '×', k], [p, '×', 'R']]], ans: p * n * k, unit: '元', hint: '先算一盒多少元，或先算一共幾枝。', after: `${p} × ${n} ＝ ${p * n}，${p * n} × ${k} ＝ ${p * n * k}` }; },
    () => { const a = rand(6, 9), b = rand(3, 5), c = rand(3, 6); return { q: `一層樓有 ${b} 間教室，每間教室有 ${a} 扇窗戶，${c} 層樓共有幾扇窗戶？`, eq: [[a, '×', b], ['R', '×', c]], alt: [[[b, '×', c], [a, '×', 'R']]], ans: a * b * c, unit: '扇', hint: '先算一層樓有幾扇窗戶。', after: `${a} × ${b} ＝ ${a * b}，${a * b} × ${c} ＝ ${a * b * c}` }; },
    () => { const a = rand(2, 5), b = rand(3, 7), c = rand(4, 8); return { q: `每天跑 ${a} 圈操場，每週跑 ${b} 天，${c} 週一共跑幾圈？`, eq: [[a, '×', b], ['R', '×', c]], alt: [[[b, '×', c], [a, '×', 'R']]], ans: a * b * c, unit: '圈', hint: '先算一週跑幾圈。', after: `${a} × ${b} ＝ ${a * b}，${a * b} × ${c} ＝ ${a * b * c}` }; },
    () => { const a = rand(3, 6), b = rand(4, 8), c = rand(2, 5); return { q: `一隻兔子吃 ${a} 根紅蘿蔔，一籠有 ${b} 隻兔子，${c} 籠兔子共吃幾根紅蘿蔔？`, eq: [[a, '×', b], ['R', '×', c]], alt: [[[b, '×', c], [a, '×', 'R']]], ans: a * b * c, unit: '根', hint: '先算一籠吃幾根。', after: `${a} × ${b} ＝ ${a * b}，${a * b} × ${c} ＝ ${a * b * c}` }; },
    () => { const p = rand(15, 45), n = rand(2, 4), k = rand(2, 3); return { q: `一張門票 ${p} 元，一家有 ${n} 人，${k} 家人一起去，門票一共多少元？`, eq: [[p, '×', n], ['R', '×', k]], alt: [[[n, '×', k], [p, '×', 'R']]], ans: p * n * k, unit: '元', hint: '先算一家要多少元，或先算一共幾人。', after: `${p} × ${n} ＝ ${p * n}，${p * n} × ${k} ＝ ${p * n * k}` }; }
  ];
  quiz(st, shuffle(P));
}

const XM4 = [
  { q: '一盒有 6 個蛋塔，一箱裝 4 盒，5 箱共有幾個蛋塔？', eq: [[6, '×', 4], ['R', '×', 5]], alt: [[[4, '×', 5], [6, '×', 'R']]], ans: 120, unit: '個', hint: '兩步都是乘法。',
    ex: '6 × 4 ＝ 24（一箱 24 個），24 × 5 ＝ 120 個。也可以先算 4 × 5 ＝ 20 盒，6 × 20 ＝ 120 個。', trap: '不是 6 × 4 ＋ 5，每一箱都有 24 個，要用乘的。' },
  { q: '一盒 8 塊餅乾，一袋 3 盒，2 袋有幾塊？下面哪一個算式<b>不對</b>？', opts: [xop('8 × 3 ＋ 2', true), xop('8 × 3 × 2', false), xop('3 × 2 × 8', false)],
    ex: '8 × 3 × 2 ＝ 48；先算 3 × 2 ＝ 6 盒，再 × 8 也是 48。8 × 3 ＋ 2 ＝ 26 不對。', trap: '題目問「不對」的算式。' },
  { q: '一排 7 人，一班排 4 排，3 班共有幾人？', eq: [[7, '×', 4], ['R', '×', 3]], alt: [[[4, '×', 3], [7, '×', 'R']]], ans: 84, unit: '人', hint: '先算一班幾人。',
    ex: '7 × 4 ＝ 28（一班），28 × 3 ＝ 84 人。', trap: '' },
  { q: '5 × 2 × 9，用哪一種順序最好算？', opts: [xop(sm('先算 5 × 2 ＝ 10，再 × 9'), true), xop(sm('先算 2 × 9 ＝ 18，再 × 5'), false), xop(sm('兩種答案不一樣'), false)],
    ex: '5 × 2 ＝ 10，10 × 9 ＝ 90，很好算。兩種順序答案都是 90。', trap: '換順序答案不會變，只是好不好算。' },
  { q: '一枝筆 12 元，一盒 5 枝，買 3 盒要多少元？', eq: [[12, '×', 5], ['R', '×', 3]], alt: [[[5, '×', 3], [12, '×', 'R']]], ans: 180, unit: '元', hint: '先算一盒多少元。',
    ex: '12 × 5 ＝ 60（一盒），60 × 3 ＝ 180 元。', trap: '不是 12 × 3，一盒有 5 枝。' }
];

/* ---------- 面積：塗格子（從 grade3-2 的 5-A 改寫） ---------- */
function xPaintGrid(st, W, H, onChange) {
  const u = 40, on = new Set();
  let cells = '';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cells += `<rect class="c" data-k="${x},${y}" x="${x * u}" y="${y * u}" width="${u}" height="${u}"/>`;
  const wrap = document.createElement('div'); wrap.className = 'center';
  wrap.innerHTML = `<svg class="xgrid" viewBox="-2 -2 ${W * u + 4} ${H * u + 4}" width="${W * u + 4}">${cells}</svg>`;
  st.appendChild(wrap);
  const svg = $('svg', wrap); let mode = null;
  const hit = e => { const el = e.type === 'pointerdown' ? e.target : document.elementFromPoint(e.clientX, e.clientY); return el && el.classList && el.classList.contains('c') && svg.contains(el) ? el : null; };
  const paint = el => { const k = el.dataset.k; if (mode === 'on') { on.add(k); el.classList.add('on'); } else { on.delete(k); el.classList.remove('on'); } onChange(on); };
  svg.addEventListener('pointerdown', e => { const el = hit(e); if (!el) return; e.preventDefault(); mode = on.has(el.dataset.k) ? 'off' : 'on'; sfx('tap'); paint(el); });
  svg.addEventListener('pointermove', e => { if (!mode) return; const el = hit(e); if (el && (mode === 'on') !== on.has(el.dataset.k)) paint(el); });
  const stop = () => { mode = null; };
  window.addEventListener('pointerup', stop); cleanups.push(() => window.removeEventListener('pointerup', stop));
  return { on, svg, clear() { on.clear(); $$('.c', svg).forEach(c => c.classList.remove('on')); onChange(on); } };
}
function xIsRect(on, a, b) {
  const pts = [...on].map(k => k.split(',').map(Number));
  if (pts.length !== a * b) return false;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1;
  return w * h === pts.length && ((w === a && h === b) || (w === b && h === a));
}
function x6A(st) {
  const tasks = [{ n: rand(5, 9) }, { n: rand(10, 14) }, { a: rand(3, 5), b: rand(2, 4) }, { n: rand(6, 12), two: true }];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r];
    st.innerHTML = dots(r, tasks.length);
    curQ = T.a ? { q: `塗出長 ${T.a} 公分、寬 ${T.b} 公分的長方形`, c: `長 ${T.a} 格、寬 ${T.b} 格的長方形` } : { q: `塗出 ${T.n} 平方公分的圖形`, c: `${T.n} 格` };
    api.say(T.a ? `每一格是 1 平方公分。塗出一個<b>長 ${T.a} 公分、寬 ${T.b} 公分</b>的長方形。` : `每一格是 <b>1 平方公分</b>。在方格板上塗出 <b>${T.n} 平方公分</b>的圖形${T.two ? '，形狀自己決定' : ''}（可以按住拖曳）。`,
      T.a ? `塗出一個長${T.a}公分、寬${T.b}公分的長方形` : `塗出${T.n}平方公分的圖形`);
    const ro = document.createElement('div'); ro.className = 'readout';
    const g = xPaintGrid(st, 8, 6, on => ro.textContent = `已經塗了 ${on.size} 格`);
    st.appendChild(ro); ro.textContent = '已經塗了 0 格';
    const bt = document.createElement('div'); bt.className = 'center';
    bt.innerHTML = '<button class="btn ghost" type="button" id="clr">全部擦掉</button> <button class="btn mint" type="button" id="okb">塗好了！</button>';
    st.appendChild(bt);
    $('#clr', st).onclick = () => g.clear();
    $('#okb', st).onclick = () => {
      if (T.a) {
        if (!xIsRect(g.on, T.a, T.b)) return api.bad(`要塗成長 ${T.a} 格、寬 ${T.b} 格的長方形喔！`, `塗了 ${g.on.size} 格，不是長 ${T.a}、寬 ${T.b} 的長方形`);
        sfx('ok'); rep(true, `長 ${T.a} 格、寬 ${T.b} 格的長方形`); bt.innerHTML = '';
        curQ = { q: `長 ${T.a} 公分、寬 ${T.b} 公分的長方形，面積是幾平方公分？`, c: `${T.a * T.b} 平方公分` };
        api.say('很好！這個長方形的面積是幾平方公分？');
        const kw = document.createElement('div'); kw.className = 'kwrap'; st.appendChild(kw);
        return keypad(kw, T.a * T.b, () => { toast(`${T.a} × ${T.b} ＝ ${T.a * T.b} 平方公分`); r++; later(round, 1800); }, `一排 ${T.a} 格，有 ${T.b} 排！`, '平方公分');
      }
      if (g.on.size !== T.n) return api.bad(g.on.size > T.n ? `塗太多了，要 ${T.n} 格！` : `還不夠，要 ${T.n} 格！`, `塗了 ${g.on.size} 格`);
      $('#okb', st).disabled = true; api.ok(`對！${T.n} 個 1 平方公分就是 ${T.n} 平方公分`); r++; later(round, 1500);
    };
  }
  round();
}

/* ---------- 面積：整格和半格的圖形（# 整格；q p b d 是四種半格三角形） ---------- */
const XSHAPES = [
  ['.##.', '####', '.##.'], ['d##b', '####'], ['d#b', '###'], ['.db.', 'd##b', '####'],
  ['##b', '###', 'q..'], ['db', '##', 'pq'], ['d##', '##q'], ['###', '#.#', '###'], ['d#b', '###', '.#.']
];
function xArea(rows) { let a = 0; rows.forEach(r => [...r].forEach(ch => { if (ch === '#') a += 1; else if ('qpbd'.includes(ch)) a += 0.5; })); return a; }
function xShapeSVG(rows, col = '#3fcf9c', u = 34) {
  const H = rows.length, W = Math.max(...rows.map(r => r.length));
  let g = '', s = '';
  for (let y = 0; y <= H; y++) g += `<line x1="0" y1="${y * u}" x2="${W * u}" y2="${y * u}" stroke="#d9d0e3" stroke-width="1"/>`;
  for (let x = 0; x <= W; x++) g += `<line x1="${x * u}" y1="0" x2="${x * u}" y2="${H * u}" stroke="#d9d0e3" stroke-width="1"/>`;
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    const X = x * u, Y = y * u, X2 = X + u, Y2 = Y + u;
    const tri = { q: [[X, Y], [X2, Y], [X, Y2]], p: [[X, Y], [X2, Y], [X2, Y2]], b: [[X, Y], [X, Y2], [X2, Y2]], d: [[X2, Y], [X2, Y2], [X, Y2]] }[ch];
    if (ch === '#') s += `<rect x="${X}" y="${Y}" width="${u}" height="${u}" fill="${col}" stroke="#4a3b5c" stroke-width="1.5"/>`;
    else if (tri) s += `<polygon points="${tri.map(p => p.join(',')).join(' ')}" fill="${col}" stroke="#4a3b5c" stroke-width="1.5"/>`;
  }));
  return `<svg class="xgrid" viewBox="-2 -2 ${W * u + 4} ${H * u + 4}" width="${Math.min(W * u + 4, 300)}">${g}${s}</svg>`;
}
function x6B(st) {
  const sh = shuffle(XSHAPES);
  quiz(st, [
    { q: '1 平方公分是多大？', opts: [xop(sm('邊長 1 公分的正方形那麼大'), true), xop(sm('長 1 公分的線那麼長'), false), xop(sm('邊長 1 公尺的正方形'), false)], hint: '面積是「一塊面」的大小，不是線的長度。' },
    ...[0, 1, 2].map(i => () => ({ q: '每一格是 1 平方公分，兩個半格可以拼成 1 格。這個圖形的面積是幾平方公分？', vis: xShapeSVG(sh[i]), ans: xArea(sh[i]), unit: '平方公分', hint: '先數整格，再把半格兩個兩個拼起來！', after: `面積是 ${xArea(sh[i])} 平方公分` })),
    () => { const A = sh[3], B = sh[4], a = xArea(A), b = xArea(B); return { q: '哪一個圖形的面積比較大？', vis: `<div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;align-items:end"><div>${xShapeSVG(A, '#3fcf9c', 28)}<div>甲</div></div><div>${xShapeSVG(B, '#ffc93c', 28)}<div>乙</div></div></div>`, keep: true, opts: [xop('甲', a > b), xop('一樣大', a === b), xop('乙', b > a)], hint: '分別數一數有幾平方公分！', after: `甲 ${a} 平方公分，乙 ${b} 平方公分` }; },
    { q: '把一張正方形紙剪成兩半，再拼成一個長方形，面積會怎樣？', opts: [xop('不變', true), xop('變大', false), xop('變小', false)], hint: '紙沒有多也沒有少，只是換了位置。', after: '切割再拼湊，面積不變！' }
  ]);
}
function xBlobSVG(rx, ry, W, H, u = 30) {
  let g = '';
  for (let y = 0; y <= H; y++) g += `<line x1="0" y1="${y * u}" x2="${W * u}" y2="${y * u}" stroke="#d9d0e3"/>`;
  for (let x = 0; x <= W; x++) g += `<line x1="${x * u}" y1="0" x2="${x * u}" y2="${H * u}" stroke="#d9d0e3"/>`;
  return `<svg class="xgrid" viewBox="-2 -2 ${W * u + 4} ${H * u + 4}" width="${Math.min(W * u + 4, 360)}">${g}<ellipse cx="${W * u / 2}" cy="${H * u / 2}" rx="${rx * u}" ry="${ry * u}" fill="rgba(63,207,156,.5)" stroke="#2b8a66" stroke-width="3"/></svg>`;
}
function x6C(st) {
  const est = () => {
    const rx = rand(3, 5) + 0.3, ry = rand(2, 3) + 0.4, A = Math.round(Math.PI * rx * ry), W = Math.ceil(rx * 2) + 2, H = Math.ceil(ry * 2) + 2;
    return { q: '每一格是 1 平方公分。這片樹葉的面積<b>大約</b>是多少？（滿格算 1 格，不滿的兩個併成 1 格）', sp: '每一格是1平方公分。這片樹葉的面積大約是多少？', vis: xBlobSVG(rx, ry, W, H), keep: true,
      opts: [xop(`約 ${A} 平方公分`, true), xop(`約 ${Math.round(A / 2)} 平方公分`, false), xop(`約 ${Math.round(A * 1.9)} 平方公分`, false)], hint: '數一數整格，再加上不滿一格的一半。', after: `大約 ${A} 平方公分` };
  };
  quiz(st, [
    est, est,
    () => pick([
      { q: '一張郵票的面積大約是多少？', opts: [xop('約 6 平方公分', true), xop('約 600 平方公分', false), xop('約 6 公分', false)], hint: '郵票很小，大約是 2 公分 × 3 公分。' },
      { q: '一張悠遊卡的面積大約是多少？', opts: [xop('約 46 平方公分', true), xop('約 5 平方公分', false), xop('約 460 平方公分', false)], hint: '悠遊卡大約長 8 公分、寬 5 公分多。' }
    ]),
    () => { const a = rand(3, 5), b = rand(3, 4), s = a * b + pick([-1, 1]); return { q: `長方形卡片長 ${a} 公分、寬 ${b} 公分；一片樹葉估算大約 ${s} 平方公分。哪一個比較大？`, keep: true, opts: [xop('長方形卡片', a * b > s), xop('樹葉', s > a * b)], hint: `長方形是 ${a} × ${b} 平方公分。`, after: `長方形 ${a * b} 平方公分，樹葉約 ${s} 平方公分` }; },
    () => { const s = rand(4, 9); return { q: `一個正方形，每邊 ${s} 公分，面積是幾平方公分？`, eq: [s, '×', s], ans: s * s, unit: '平方公分', hint: `一排 ${s} 格，有 ${s} 排。`, after: `${s} × ${s} ＝ ${s * s} 平方公分` }; }
  ]);
}
const XM6 = [
  { q: '甲是長 6 公分、寬 2 公分的長方形，乙是邊長 4 公分的正方形，哪一個面積比較大？', keep: true, opts: [xop('乙', true), xop('甲', false), xop('一樣大', false)],
    ex: '甲：6 × 2 ＝ 12 平方公分；乙：4 × 4 ＝ 16 平方公分，乙比較大。', trap: '甲比較長，但面積要看有幾個 1 平方公分。' },
  { q: '一個圖形有 8 個整格和 6 個半格（每格 1 平方公分），面積是幾平方公分？', ans: 11, unit: '平方公分', hint: '2 個半格拼成 1 格。',
    ex: '6 個半格拼成 3 格，8 ＋ 3 ＝ 11 平方公分。', trap: '半格不能當 1 格算，也不能丟掉。' },
  { q: '「平方公分」是用來量什麼的？', opts: [xop(sm('面積的大小'), true), xop(sm('線的長度'), false), xop(sm('東西的重量'), false)],
    ex: '1 平方公分是邊長 1 公分的正方形的面積，用來量面的大小。', trap: '「公分」量長度，「平方公分」量面積，不一樣。' },
  { q: '長方形長 7 公分、寬 3 公分，面積是幾平方公分？', eq: [7, '×', 3], ans: 21, unit: '平方公分', hint: '一排 7 格，有 3 排。',
    ex: '7 × 3 ＝ 21 平方公分。', trap: '不是 7 ＋ 3 ＝ 10，那是兩條邊的長度合起來。' },
  { q: '把一張 12 平方公分的紙剪成三塊，再拼成一個新形狀，面積是幾平方公分？', ans: 12, unit: '平方公分', hint: '紙沒有多也沒有少。',
    ex: '切割再拼湊，面積不變，還是 12 平方公分。', trap: '形狀改變，面積不會變。' }
];

/* ---------- 公斤和公克（從 grade3-2 的 6-A～6-C 改寫） ---------- */
const xkg = g => g >= 1000 ? `${Math.floor(g / 1000)} 公斤${g % 1000 ? ` ${g % 1000} 公克` : ''}` : `${g} 公克`;
function xDial(v, max, step, lab, size = 230) {
  const c = 125, R = 100, ang = g => (g / max) * 300 - 150;
  let t = '';
  for (let g = 0; g <= max; g += step) {
    const a = ang(g) * Math.PI / 180, big = g % lab === 0, r1 = big ? 82 : (g % (step * 5) === 0 ? 88 : 92);
    t += `<line x1="${c + Math.sin(a) * r1}" y1="${c - Math.cos(a) * r1}" x2="${c + Math.sin(a) * R}" y2="${c - Math.cos(a) * R}" stroke="#4a3b5c" stroke-width="${big ? 3 : 1.2}"/>`;
    if (big) { const txt = g === 0 ? '0' : g % 1000 === 0 ? `${g / 1000}公斤` : `${g}`; t += `<text x="${c + Math.sin(a) * 64}" y="${c - Math.cos(a) * 64 + 5}" font-size="${g % 1000 === 0 && g ? 13 : 12}" font-weight="900" text-anchor="middle" fill="#4a3b5c">${txt}</text>`; }
  }
  const a = ang(v) * Math.PI / 180;
  return `<svg viewBox="0 0 250 250" width="${size}" height="${size}" style="max-width:76vw;height:auto"><circle cx="${c}" cy="${c}" r="116" fill="#fff" stroke="#a98bff" stroke-width="10"/>${t}
    <line x1="${c}" y1="${c}" x2="${c + Math.sin(a) * 92}" y2="${c - Math.cos(a) * 92}" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="9" fill="#4a3b5c"/></svg>`;
}
function x7A(st) {
  const W = [1000, 500, 200, 100, 50];
  const tasks = [50 * rand(4, 18), 1000 + 50 * rand(2, 18), 2000 + 50 * rand(1, 15), 1000 + 50 * rand(1, 19)];
  let r = 0;
  function round() {
    if (r >= tasks.length) return api.finish();
    const T = tasks[r], tray = [], txt = r === 3 ? `${T} 公克` : xkg(T);
    curQ = { q: `放砝碼，讓秤面指到 ${txt}`, c: xkg(T) };
    api.say(`點砝碼放上秤盤，讓秤面指到 <b class="big">${txt}</b>。點秤盤上的砝碼可以拿下來。`, `放砝碼，讓秤面指到${txt}`);
    st.innerHTML = `${dots(r, tasks.length)}<div class="center" id="dial"></div><div class="xtray" id="tray"></div>
      <div class="xweights">${W.map(w => `<button type="button" class="xwbtn" data-w="${w}">${w === 1000 ? '1 公斤' : w + ' 公克'}</button>`).join('')}</div>
      <div class="center"><button class="btn mint" id="okb" type="button">秤好了！</button></div>`;
    const draw = () => {
      const s = tray.reduce((a, b) => a + b, 0);
      $('#dial', st).innerHTML = xDial(Math.min(s, 3000), 3000, 50, 500);
      $('#tray', st).innerHTML = tray.length ? tray.map((w, i) => `<button type="button" class="xwbtn" data-i="${i}">${w === 1000 ? '1 公斤' : w + ' 公克'}</button>`).join('') : '<span class="small-note">秤盤是空的</span>';
      $$('#tray .xwbtn', st).forEach(b => b.onclick = () => { tray.splice(+b.dataset.i, 1); sfx('tap'); draw(); });
    };
    $$('.xweights .xwbtn', st).forEach(b => b.onclick = () => { if (tray.length >= 12) return toast('秤盤放不下了！'); tray.push(+b.dataset.w); sfx('pop'); draw(); });
    $('#okb', st).onclick = () => {
      const s = tray.reduce((a, b) => a + b, 0);
      if (s === T) { $('#okb', st).disabled = true; api.ok(`對！${xkg(T)} ＝ ${T} 公克`); speak(`${xkg(T)}等於${T}公克`); r++; later(round, 1900); }
      else api.bad(s > T ? `太重了！現在是 ${xkg(s)}` : `還不夠重！現在是 ${xkg(s)}`, xkg(s));
    };
    draw();
  }
  round();
}
const kgOpts = (v, wrongs) => [xop(xkg(v), true), ...wrongs.filter(w => w !== v && w > 0).filter((w, i, a) => a.indexOf(w) === i).slice(0, 2).map(w => xop(xkg(w), false))];
function x7B(st) {
  quiz(st, [
    () => { const v = 10 * rand(12, 95); return { q: '這是 1 公斤的秤，一小格是 10 公克。指針指在幾公克？', vis: xDial(v, 1000, 10, 100), ans: v, unit: '公克', hint: '先看指針過了哪個整百，再數小格。', after: `${v} 公克` }; },
    { q: '這是 3 公斤的秤，0 到 500 公克之間分成 10 小格，一小格是幾公克？', vis: xDial(0, 3000, 50, 500), ans: 50, unit: '公克', hint: '500 公克分成 10 小格，10 小格是 500 公克。', after: '一小格是 50 公克' },
    () => { const v = 1000 + 50 * rand(1, 39); return { q: '3 公斤的秤（一小格 50 公克），指針指在哪裡？', vis: xDial(v, 3000, 50, 500), keep: false, opts: kgOpts(v, [v + 100, v - 100, v + 50, v - 50]), hint: '先看過了幾公斤，再看多出幾公克。', after: xkg(v) }; },
    () => { const k = rand(1, 4), g = pick([rand(1, 9) * 10, rand(1, 9) * 100 + rand(1, 9) * 10, rand(1, 9)]); return { q: `${k} 公斤 ${g} 公克 ＝ ? 公克`, ans: k * 1000 + g, unit: '公克', hint: '1 公斤 ＝ 1000 公克，沒有的位要補 0！', after: `${k} 公斤 ${g} 公克 ＝ ${k * 1000 + g} 公克` }; },
    () => { const v = rand(1, 5) * 1000 + rand(1, 99) * 10, k = Math.floor(v / 1000), g = v % 1000; return { q: `${v} 公克 ＝ ？`, opts: [xop(xkg(v), true), xop(`${k} 公斤 ${g * 10} 公克`, false), xop(`${k * 10 + Math.floor(g / 100)} 公斤 ${g % 100} 公克`, false)], hint: '1000 公克是 1 公斤！', after: `${v} 公克 ＝ ${xkg(v)}` }; },
    () => { const k = rand(1, 3), g = rand(1, 9) * pick([1, 10]), a = k * 1000 + g, b = k * 1000 + (g < 10 ? g * 10 : g / 10); return { q: `${k} 公斤 ${g} 公克 ○ ${b} 公克`, keep: true, opts: [xop('＞', a > b), xop('＝', a === b), xop('＜', a < b)], hint: `先把 ${k} 公斤 ${g} 公克換成 ${a} 公克再比！`, after: `${a} 公克 ${a > b ? '＞' : a < b ? '＜' : '＝'} ${b} 公克` }; },
    () => pick([
      { q: '一顆蘋果大約重多少？', opts: [xop('約 200 公克', true), xop('約 2 公斤', false), xop('約 2 公克', false)], hint: '蘋果拿起來不太重。' },
      { q: '一個三年級小朋友大約重多少？', opts: [xop('約 28 公斤', true), xop('約 28 公克', false), xop('約 280 公斤', false)], hint: '人比較重，要用公斤。' },
      { q: '一枝鉛筆大約重多少？', opts: [xop('約 5 公克', true), xop('約 5 公斤', false), xop('約 500 公克', false)], hint: '鉛筆很輕喔。' }
    ])
  ]);
}
function x7C(st) {
  quiz(st, shuffle([
    () => { const a = rand(1, 3) * 1000 + rand(4, 8) * 100 + rand(0, 9) * 10, b = rand(1, 2) * 1000 + rand(3, 7) * 100 + rand(0, 9) * 10; return { q: `一箱蘋果重 ${a} 公克，一箱橘子重 ${b} 公克，兩箱一共重幾公克？`, eq: [a, '+', b], ans: a + b, unit: '公克', hint: '「一共」用加法！', after: `${a} ＋ ${b} ＝ ${a + b} 公克（${xkg(a + b)}）` }; },
    () => { const a = rand(3, 5) * 1000 + rand(1, 3) * 100 + rand(0, 9) * 10, b = rand(1, 2) * 1000 + rand(5, 9) * 100 + rand(0, 9) * 10; return { q: `一袋米重 ${a} 公克，吃掉 ${b} 公克，還剩幾公克？`, eq: [a, '−', b], ans: a - b, unit: '公克', hint: '「還剩」用減法！', after: `${a} − ${b} ＝ ${a - b} 公克（${xkg(a - b)}）` }; },
    () => { const w = pick([250, 150, 350, 450, 200]), n = rand(3, 6); return { q: `一包餅乾重 ${w} 公克，${n} 包共重幾公克？`, eq: [w, '×', n], ans: w * n, unit: '公克', hint: '每包一樣重，用乘法！', after: `${w} × ${n} ＝ ${w * n} 公克（${xkg(w * n)}）` }; },
    () => { const tot = rand(2, 4) * 1000 + rand(1, 9) * 100, kid = 25000 + rand(1, 9) * 1000; return { q: `哥哥背書包量體重是 ${kid + tot} 公克，沒背時是 ${kid} 公克，書包重幾公克？`, eq: [kid + tot, '−', kid], ans: tot, unit: '公克', hint: '背了以後的重量 − 本來的重量。', after: `${kid + tot} − ${kid} ＝ ${tot} 公克（${xkg(tot)}）` }; },
    () => { const a = rand(1, 2) * 1000 + rand(1, 9) * 100; return { q: `一個桶子可以裝 3000 公克的沙，已經裝了 ${a} 公克，還可以再裝幾公克？`, eq: [3000, '−', a], ans: 3000 - a, unit: '公克', hint: '可以裝的 − 已經裝的。', after: `3000 − ${a} ＝ ${3000 - a} 公克` }; }
  ]));
}
const XM7 = [
  { q: '2 公斤 5 公克 ＝ ? 公克', ans: 2005, unit: '公克', hint: '1 公斤 ＝ 1000 公克。',
    ex: '2 公斤 ＝ 2000 公克，再加 5 公克，是 2005 公克。', trap: '不是 25 或 250，百位和十位要補 0。' },
  { q: '3 公斤 40 公克和 3400 公克，哪一個比較重？', keep: true, opts: [xop('3400 公克', true), xop('3 公斤 40 公克', false), xop('一樣重', false)],
    ex: '3 公斤 40 公克 ＝ 3040 公克，3040 ＜ 3400，所以 3400 公克比較重。', trap: '40 公克不是 400 公克。' },
  { q: '1 公斤的棉花和 1000 公克的鐵，哪一個比較重？', keep: true, opts: [xop('一樣重', true), xop('鐵', false), xop('棉花', false)],
    ex: '1 公斤 ＝ 1000 公克，兩個一樣重。', trap: '鐵感覺比較重，但重量一樣。' },
  { q: '一袋糖重 1500 公克，又倒進 800 公克，現在重幾公克？', eq: [1500, '+', 800], ans: 2300, unit: '公克', hint: '「又倒進」用加法。',
    ex: '1500 ＋ 800 ＝ 2300 公克，也就是 2 公斤 300 公克。', trap: '' },
  { q: '一隻小狗大約重多少？', opts: [xop('約 6 公斤', true), xop('約 6 公克', false), xop('約 600 公斤', false)],
    ex: '小狗抱起來有點重，大約幾公斤。', trap: '重的東西用公斤，輕的東西用公克。' }
];

/* ---------- 列表與規律（從 grade3-2 的 10-A、10-B、2-B 改寫） ---------- */
function xTable(head, rows, title) {
  return `${title ? `<div class="small-note" style="font-weight:900">${title}</div>` : ''}<table class="xtable"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((v, i) => i === 0 ? `<th>${v}</th>` : `<td${v === '?' ? ' class="q"' : ''}>${v}</td>`).join('')}</tr>`).join('')}</table>`;
}
function x9A(st) {
  let r = 0;
  const kinds = [['🍎', '蘋果'], ['🍌', '香蕉'], ['🍇', '葡萄'], ['🍓', '草莓'], ['🍊', '橘子'], ['🍉', '西瓜']];
  function round() {
    if (r >= 2) return api.finish();
    const ks = shuffle(kinds).slice(0, r ? 4 : 3), cnt = ks.map(() => rand(2, 7));
    const items = shuffle(ks.flatMap((k, i) => Array(cnt[i]).fill(k[0]))), val = ks.map(() => 0);
    curQ = { q: '數一數水果，填好表格', c: ks.map((k, i) => `${k[1]} ${cnt[i]}`).join('、') };
    api.say('班上最喜歡的水果投票！數一數，按 ＋／－ 填好表格（點水果可以做記號）。', '數一數水果，填好表格');
    const pos = items.map((_, i) => { const c = i % 6, rr = Math.floor(i / 6); return [8 + c * 16.5 + rand(-3, 3), 10 + rr * (80 / Math.ceil(items.length / 6)) + rand(-2, 3)]; });
    st.innerHTML = `${dots(r, 2)}<div class="xscatter">${items.map((e, i) => `<span style="left:${pos[i][0]}%;top:${pos[i][1] + 4}%">${e}</span>`).join('')}</div>
      <div class="xtally">${ks.map((k, i) => `<div class="t">${k[0]} ${k[1]}<span class="v" id="v${i}">0</span><button type="button" data-i="${i}" data-d="-1">－</button> <button type="button" data-i="${i}" data-d="1">＋</button></div>`).join('')}</div>
      <div class="center"><button class="btn mint" id="okb" type="button">表格填好了！</button></div>`;
    $$('.xscatter span', st).forEach(s => s.onclick = () => { s.classList.toggle('done'); sfx('tap'); });
    $$('.xtally button', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; val[i] = Math.max(0, val[i] + +b.dataset.d); $('#v' + i, st).textContent = val[i]; sfx('tap'); });
    $('#okb', st).onclick = () => {
      const bad = val.findIndex((v, i) => v !== cnt[i]);
      if (bad >= 0) return api.bad(`${ks[bad][1]}的票數不對，再數一次！`, `${ks[bad][1]} 填 ${val[bad]} 票`);
      sfx('ok'); rep(true, '表格填對了');
      const tot = cnt.reduce((a, b) => a + b, 0);
      curQ = { q: '表格做好了！一共有幾票？', c: `${tot} 票` };
      st.innerHTML = `${dots(r, 2)}<div class="qvis">${xTable(['水果', ...ks.map(k => k[0] + k[1])], [['票數（票）', ...cnt]], '最喜歡的水果統計表')}</div><div class="kwrap"></div>`;
      api.say('表格做好了！一共有幾票？');
      keypad($('.kwrap', st), tot, () => { toast(`一共 ${tot} 票`); r++; later(round, 2000); }, '把表格裡的票數全部加起來！', '票');
    };
  }
  round();
}
function x9B(st) {
  const days = ['星期一', '星期二', '星期三', '星期四', '星期五'];
  let v; do { v = days.map(() => rand(12, 60)); } while (new Set(v).size < 5);
  const t = () => xTable(['星期', ...days], [['人數（人）', ...v]], '圖書館一週借書人數');
  const mx = Math.max(...v), mn = Math.min(...v), i1 = rand(0, 4); let i2; do { i2 = rand(0, 4); } while (i2 === i1);
  quiz(st, [
    { q: `${days[i1]}有幾人借書？`, vis: t(), ans: v[i1], unit: '人', hint: `找到「${days[i1]}」那一格。`, after: `${days[i1]} ${v[i1]} 人` },
    { q: '哪一天借書的人最多？', vis: t(), opts: days.map((d, i) => xop(sm(d), v[i] === mx, d)), keep: true, hint: '找最大的數字！', after: `${days[v.indexOf(mx)]} 最多，有 ${mx} 人` },
    { q: '哪一天借書的人最少？', vis: t(), opts: days.map((d, i) => xop(sm(d), v[i] === mn, d)), keep: true, hint: '找最小的數字！', after: `${days[v.indexOf(mn)]} 最少，有 ${mn} 人` },
    { q: `${days[i1]}比${days[i2]}${v[i1] > v[i2] ? '多' : '少'}幾人？`, vis: t(), ans: Math.abs(v[i1] - v[i2]), unit: '人', hint: '大的數減小的數。', after: `${Math.max(v[i1], v[i2])} − ${Math.min(v[i1], v[i2])} ＝ ${Math.abs(v[i1] - v[i2])}` },
    { q: '這 5 天一共有幾人借書？', vis: t(), ans: v.reduce((a, b) => a + b, 0), unit: '人', hint: '把 5 天的人數全部加起來。', after: `一共 ${v.reduce((a, b) => a + b, 0)} 人` }
  ]);
}
const XSYM = [['🔴', '🔵', '🟡', '🟢'], ['⭐', '🌙', '☀️', '☁️'], ['🐶', '🐱', '🐰', '🐻']];
function x9C(st) {
  const arith = up => () => {
    const d = pick(up ? [3, 4, 5, 6, 7, 8, 9, 25, 50, 100] : [2, 3, 4, 5, 6, 7, 9, 10, 50]);
    const a0 = up ? rand(1, 60) : rand(d * 6, d * 6 + 200), seq = Array.from({ length: 6 }, (_, i) => up ? a0 + d * i : a0 - d * i), bi = rand(3, 5);
    return { q: `找規律：數字每次${up ? '多' : '少'}多少？空格是多少？`, vis: `<div class="xseq">${seq.map((v, i) => `<div class="xcell${i === bi ? ' blank' : ''}">${i === bi ? '?' : v}</div>`).join('')}</div>`, ans: seq[bi], hint: `相鄰兩個數相差 ${d}！`, after: `每次${up ? '加' : '減'} ${d}` };
  };
  const pic = () => {
    const syms = pick(XSYM), unit = pick([[0, 1], [0, 1, 2], [0, 0, 1], [0, 1, 1, 2]]).map(k => syms[k]), L = unit.length * 2 + 2;
    const seq = Array.from({ length: L }, (_, i) => unit[i % unit.length]), bi = L - 1, ans = seq[bi];
    return { q: '找出規律，空格要放什麼？', vis: `<div class="xseq">${seq.map((s, i) => `<div class="xcell${i === bi ? ' blank' : ''}">${i === bi ? '?' : s}</div>`).join('')}</div>`, opts: [...new Set(unit)].concat(syms[3]).map(s => xop(`<span style="font-size:32px">${s}</span>`, s === ans, s)), hint: `${unit.length} 個一組，一直重複！`, after: `規律是 ${unit.join('')}` };
  };
  const nth = () => {
    const syms = pick(XSYM).slice(0, 3), n = rand(10, 20), ans = syms[(n - 1) % 3];
    return { q: `照這樣排下去，第 <b>${n}</b> 個是什麼？`, sp: `照這樣排下去，第${n}個是什麼？`, vis: `<div class="xseq">${[...syms, ...syms].map(s => `<div class="xcell">${s}</div>`).join('')}<span>……</span></div>`, opts: syms.map(s => xop(`<span style="font-size:32px">${s}</span>`, s === ans, s)), hint: '3 個一組，想想第幾組的第幾個。', after: `${n} ÷ 3 ＝ ${Math.floor(n / 3)} … ${n % 3}，是 ${ans}` };
  };
  const table = () => {
    const k = pick([3, 4, 5]), n = rand(5, 8), lab = { 3: ['三輪車（輛）', '輪子（個）'], 4: ['汽車（輛）', '輪子（個）'], 5: ['手（隻）', '手指（根）'] }[k];
    return { q: '看表格找規律，空格是多少？', vis: xTable([lab[0], '1', '2', '3', '4', String(n)], [[lab[1], k, 2 * k, 3 * k, 4 * k, '?']]), ans: k * n, hint: `每多 1，就多 ${k}！`, after: `${n} × ${k} ＝ ${k * n}` };
  };
  quiz(st, [pic, arith(true), table, arith(false), nth]);
}
const XM9 = [
  { q: '2、5、8、11、（　），空格是多少？', ans: 14, hint: '每次多 3。', ex: '相鄰兩數相差 3，11 ＋ 3 ＝ 14。', trap: '不是每次多 1，要先看相差多少。' },
  { q: '🔴🔵🔵🔴🔵🔵…照這樣排，第 9 個是什麼？', opts: [xop('<span style="font-size:30px">🔵</span>', true, '🔵'), xop('<span style="font-size:30px">🔴</span>', false, '🔴')],
    ex: '3 個一組（🔴🔵🔵），第 9 個是第 3 組的最後一個，是 🔵。', trap: '一組有 3 個，不是 2 個。' },
  { q: '看表格：1 隻雞有 2 隻腳，2 隻雞有 4 隻腳，3 隻雞有 6 隻腳。7 隻雞有幾隻腳？', ans: 14, unit: '隻', hint: '每多 1 隻雞，多 2 隻腳。', ex: '7 × 2 ＝ 14 隻腳。', trap: '不是 7 ＋ 2。' },
  null, // 第 4 題在下面用亂數產生
  { q: '100、90、80、70，下一個數是多少？', ans: 60, hint: '每次少 10。', ex: '每次減 10，70 − 10 ＝ 60。', trap: '數字變小，是減的規律。' }
];
// 第 4 題：讀表格的陷阱題（表格是亂數）
XM9[3] = () => {
  const v = [rand(12, 30), rand(12, 30), rand(12, 30)]; while (v[0] === v[1] || v[1] === v[2] || v[0] === v[2]) v[2] = rand(12, 30);
  const tb = xTable(['班級', '甲班', '乙班', '丙班'], [['借書（本）', ...v]], '三年級借書統計');
  const mn = Math.min(...v), who = ['甲班', '乙班', '丙班'][v.indexOf(mn)];
  return { q: '哪一班借的書<b>最少</b>？', sp: '哪一班借的書最少？', vis: tb, keep: true, opts: ['甲班', '乙班', '丙班'].map((c, i) => xop(sm(c), v[i] === mn, c)),
    ex: `甲班 ${v[0]} 本、乙班 ${v[1]} 本、丙班 ${v[2]} 本，最少的是${who}。`, trap: '題目問「最少」，不是最多。' };
};

/* 進階挑戰：每題先設定 curQ（題目和正確答案），家長報表才記得到正確答案 */
const xq = bank => st => xquiz(st, bank.map(r => () => {
  const o = typeof r === 'function' ? r() : r, ok = (o.opts || []).find(x => x.ok);
  curQ = { q: o.q, c: o.eq ? eqText(eqPaths(o)[0]) + ' = ' + o.ans + (o.unit ? ' ' + o.unit : '') : o.ans !== undefined ? o.ans + (o.unit ? ' ' + o.unit : '') : ok ? ok.t || ok.h : '' };
  return o;
}));
Object.assign(LEVELS, {
  x1: [x1A, x1B, x1C, xq(XM1)],
  x4: [x4A, x4B, x4C, xq(XM4)],
  x6: [x6A, x6B, x6C, xq(XM6)],
  x7: [x7A, x7B, x7C, xq(XM7)],
  x9: [x9A, x9B, x9C, xq(XM9)]
});
