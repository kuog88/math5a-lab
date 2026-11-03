'use strict';
/* 三版本補充單元（2026-11）：康軒、翰林一上有，南一一上沒有的內容
   x2 高矮與厚薄（康軒第 2 單元「比高矮、比厚薄」、翰林第 2 單元「高矮與厚薄」）
   x6 0 的加法和減法（翰林第 6、7 單元「0 的加法」「0 的減法」、康軒第 7 單元活動「0 的加法」）
   依據：課綱 N-1-5（長度：直接比較）、N-1-1（0 的意義）、N-1-3（基本加減法）與公開的學校課程計畫、教案。 */

/* ---------- 圖：站在同一條地面上的人或東西（比高矮） ----------
   list：[{h 高度格數, c 顏色, e 頭上的 emoji, box 墊腳箱高度, name}] */
function heightSVG(list, opt = {}) {
  const cw = 70, unit = opt.unit || 16, ground = 190, w = list.length * cw + 30;
  let s = `<line x1="5" y1="${ground}" x2="${w - 5}" y2="${ground}" stroke="#8b6b4a" stroke-width="5" stroke-linecap="round"/>`;
  list.forEach((p, k) => {
    const x = 20 + k * cw, box = (p.box || 0) * unit, top = ground - box - p.h * unit;
    if (box) s += `<rect x="${x}" y="${ground - box}" width="44" height="${box}" fill="#c9a77c" stroke="#5b4a3a" stroke-width="2"/>`;
    s += `<rect x="${x + 8}" y="${top + 22}" width="28" height="${p.h * unit - 22}" rx="10" fill="${p.c}" stroke="#4a3b5c" stroke-width="2"/>`;
    s += `<text x="${x + 22}" y="${top + 22}" font-size="26" text-anchor="middle">${p.e}</text>`;
    if (opt.grid) for (let j = 1; j < p.h; j++) s += `<line x1="${x + 8}" y1="${ground - box - j * unit}" x2="${x + 36}" y2="${ground - box - j * unit}" stroke="#fff" stroke-width="2"/>`;
    s += `<text x="${x + 22}" y="${ground + 24}" font-size="17" font-weight="900" text-anchor="middle" fill="#4a3b5c" font-family="Arial,'Microsoft JhengHei',sans-serif">${p.name}</text>`;
  });
  return `<svg viewBox="0 0 ${w} 222" style="width:min(${Math.min(420, w * 1.3)}px,88vw);height:auto">${s}</svg>`;
}
/* 圖：一疊一疊的書（比厚薄）。list：[{n 本數, t 每本厚度, c 顏色, name}] */
function stackSVG(list) {
  const cw = 110, ground = 190, w = list.length * cw + 20;
  let s = `<line x1="5" y1="${ground}" x2="${w - 5}" y2="${ground}" stroke="#8b6b4a" stroke-width="5"/>`;
  list.forEach((p, k) => {
    const x = 20 + k * cw; let y = ground;
    for (let j = 0; j < p.n; j++) { y -= p.t; s += `<rect x="${x}" y="${y}" width="80" height="${p.t}" rx="2" fill="${p.c}" stroke="#4a3b5c" stroke-width="2"/>`; }
    s += `<text x="${x + 40}" y="${ground + 24}" font-size="17" font-weight="900" text-anchor="middle" fill="#4a3b5c" font-family="Arial,'Microsoft JhengHei',sans-serif">${p.name}</text>`;
  });
  return `<svg viewBox="0 0 ${w} 222" style="width:min(${Math.min(420, w * 1.3)}px,88vw);height:auto">${s}</svg>`;
}
const KIDS = [{ e: '🐻', name: '熊熊', c: '#ffc93c' }, { e: '🐰', name: '兔兔', c: '#ff7eb3' }, { e: '🐶', name: '狗狗', c: '#5bb4ff' }, { e: '🐱', name: '貓貓', c: '#3fcf9c' }];
const kidOpts = (list, ans) => list.map((p, k) => ({ h: `<span style="font-size:24px">${p.e} ${p.name}</span>`, ok: k === ans, t: p.name }));

/* ===== 補 2-A 比高矮：腳都站在地上才能比 ===== */
function x2A(st) {
  const rounds = [0, 1, 2, 3, 4].map(k => () => {
    const kids = shuffle(KIDS).slice(0, k < 2 ? 2 : 3);
    const hs = shuffle(k < 2 ? [rand(6, 7), rand(8, 9)] : [5, 7, 9]);
    const list = kids.map((p, j) => Object.assign({}, p, { h: hs[j] }));
    if (k === 4) { // 站在箱子上的陷阱：腳沒有對齊地面
      const lo = hs.indexOf(Math.min(...hs)); list[lo].box = 4;
      const hi = hs.indexOf(Math.max(...hs));
      return { q: `${list[lo].name}站在箱子上。把箱子拿走、腳都站在地上，誰<b>最高</b>？`, sp: `${list[lo].name}站在箱子上。把箱子拿走，腳都站在地上，誰最高？`, vis: heightSVG(list), keep: true, opts: kidOpts(list, hi), hint: '比高矮，腳要站在同一條地面上！箱子不算！', after: `箱子不算，${list[hi].name}最高！` };
    }
    const tall = k % 2 === 0, ans = hs.indexOf(tall ? Math.max(...hs) : Math.min(...hs));
    return { q: `誰比較<b class="big">${tall ? '高' : '矮'}</b>？`, sp: `誰比較${tall ? '高' : '矮'}？`, vis: heightSVG(list), keep: true, opts: kidOpts(list, ans), hint: '腳都站在地上，看誰的頭比較上面！', after: `${list[ans].name}最${tall ? '高' : '矮'}！` };
  });
  quiz(st, rounds);
}

/* ===== 補 2-B 比厚薄：一樣的書疊起來，本數多的比較厚 ===== */
function x2B(st) {
  const cols = ['#ff7eb3', '#5bb4ff', '#3fcf9c', '#ffc93c'];
  const rounds = [
    () => { const a = rand(2, 4), b = rand(5, 7), sw = Math.random() < 0.5, L = sw ? [b, a] : [a, b];
      return { q: '一樣的書疊起來，哪一疊比較<b class="big">厚</b>？', sp: '一樣的書疊起來，哪一疊比較厚？', vis: stackSVG([{ n: L[0], t: 14, c: cols[0], name: '紅色' }, { n: L[1], t: 14, c: cols[1], name: '藍色' }]), keep: true,
        opts: [{ h: '🟥 紅色', ok: L[0] > L[1] }, { h: '🟦 藍色', ok: L[1] > L[0] }, { h: '🟰 一樣厚', ok: false }], hint: '底部對齊，看哪一疊比較高！', after: '疊得比較高的那一疊比較厚！' }; },
    () => { const n = rand(3, 6);
      return { q: '紅色和藍色的書都疊了一樣多本，都是同一種書。哪一疊比較厚？', sp: '紅色和藍色的書都疊了一樣多本，都是同一種書。哪一疊比較厚？', vis: stackSVG([{ n, t: 14, c: cols[0], name: '紅色' }, { n, t: 14, c: cols[1], name: '藍色' }]), keep: true,
        opts: [{ h: '🟥 紅色', ok: false }, { h: '🟦 藍色', ok: false }, { h: '🟰 一樣厚', ok: true }], hint: '一樣的書、一樣多本，疊起來的高度一樣！', after: '一樣多本，一樣厚！' }; },
    () => { const n = rand(4, 7);
      return { q: `這一疊有幾本一樣的書？`, sp: '這一疊有幾本一樣的書？', vis: stackSVG([{ n, t: 16, c: cols[2], name: '綠色' }]), opts: numOpts(n, 1, 10), hint: '從下面一本一本數上去！' }; },
    () => { const thin = rand(0, 1);
      return { q: '哪一本書比較<b class="big">薄</b>？', sp: '哪一本書比較薄？', vis: stackSVG([{ n: 1, t: thin ? 44 : 12, c: cols[3], name: '黃色' }, { n: 1, t: thin ? 12 : 44, c: cols[1], name: '藍色' }]), keep: true,
        opts: [{ h: '📙 黃色', ok: thin === 0 }, { h: '📘 藍色', ok: thin === 1 }, { h: '🟰 一樣薄', ok: false }], hint: '平放在桌上，比較矮的比較薄！', after: '平放比一比，矮的那本比較薄。' }; },
    () => { const a = rand(3, 5), d = rand(1, 2);
      return { q: `綠色疊了 ${a} 本，黃色疊了 ${a + d} 本，都是同一種書。哪一疊比較<b class="big">薄</b>？`, sp: `綠色疊了${a}本，黃色疊了${a + d}本，都是同一種書。哪一疊比較薄？`, vis: stackSVG([{ n: a, t: 14, c: cols[2], name: '綠色' }, { n: a + d, t: 14, c: cols[3], name: '黃色' }]), keep: true,
        opts: [{ h: '🟩 綠色', ok: true }, { h: '🟨 黃色', ok: false }, { h: '🟰 一樣薄', ok: false }], hint: '一樣的書，本數少的比較薄！', after: `${a} 本比 ${a + d} 本少，綠色比較薄。` }; }
  ];
  quiz(st, rounds);
}

/* ===== 補 2-C 高矮厚薄挑戰：最高、最矮、最厚、最薄混合 ===== */
function x2C(st) {
  const rounds = Array.from({ length: 6 }, (_, k) => () => {
    if (k % 2 === 0) {
      const kids = shuffle(KIDS).slice(0, 3), hs = shuffle([4, 6, 8, 10].slice(rand(0, 1)).slice(0, 3));
      const list = kids.map((p, j) => Object.assign({}, p, { h: hs[j] })), tall = k !== 2;
      const ans = hs.indexOf(tall ? Math.max(...hs) : Math.min(...hs));
      return { q: `三個人站在一起，誰<b class="big">最${tall ? '高' : '矮'}</b>？`, sp: `三個人站在一起，誰最${tall ? '高' : '矮'}？`, vis: heightSVG(list), keep: true, opts: kidOpts(list, ans), hint: '腳都在地上，看頭的位置！' };
    }
    const ns = shuffle([2, 4, 6]), names = ['紅色', '藍色', '綠色'], c = ['#ff7eb3', '#5bb4ff', '#3fcf9c'], thick = k !== 3;
    const ans = ns.indexOf(thick ? 6 : 2);
    return { q: `一樣的書疊成三疊，哪一疊<b class="big">最${thick ? '厚' : '薄'}</b>？`, sp: `一樣的書疊成三疊，哪一疊最${thick ? '厚' : '薄'}？`,
      vis: stackSVG(ns.map((n, j) => ({ n, t: 14, c: c[j], name: names[j] }))), keep: true,
      opts: names.map((n, j) => ({ h: `<span style="font-size:22px">${n}</span>`, ok: j === ans })), hint: `本數${thick ? '多' : '少'}的比較${thick ? '厚' : '薄'}！` };
  });
  quiz(st, rounds);
}

/* ===== 補 6-A 空盤子：一個也沒有就是 0 ===== */
function x6A(st) {
  const fruits = ['🍎', '🍓', '🍊', '🍌', '🍪'];
  const rounds = [
    () => { const a = rand(3, 8), e = pick(fruits); return { q: `左邊盤子有 ${a} 個，右邊盤子是空的。合起來有幾個？`, sp: `左邊盤子有${a}個，右邊盤子是空的。合起來有幾個？`, vis: `<div class="plates"><div class="basket">${pics(e, a, true)}</div><div class="basket"></div></div>`, opts: numpadOpts(a), pad: true, hint: '空盤子是 0 個，合起來還是一樣多！', after: `${a} + 0 = ${a}` }; },
    () => { const a = rand(2, 7), e = pick(fruits); return { q: `盤子裡原本是空的，媽媽放了 ${a} 個進去，現在有幾個？`, sp: `盤子裡原本是空的，媽媽放了${a}個進去，現在有幾個？`, vis: `<div class="plates"><div class="basket">${pics(e, a, true)}</div></div>`, opts: numpadOpts(a), pad: true, hint: '原本是 0 個，放進去幾個就有幾個！', after: `0 + ${a} = ${a}` }; },
    () => { const a = rand(3, 9), e = pick(fruits); return { q: `盤子裡有 ${a} 個，全部吃光了，還剩幾個？`, sp: `盤子裡有${a}個，全部吃光了，還剩幾個？`, vis: `<div class="plates"><div class="basket" style="opacity:.55">${pics(e, a, true)}</div></div>`, opts: numpadOpts(0), pad: true, hint: '全部吃光，一個也沒有了！', after: `${a} − ${a} = 0` }; },
    () => { const a = rand(4, 9), e = pick(fruits); return { q: `盤子裡有 ${a} 個，一個也沒有拿走，還剩幾個？`, sp: `盤子裡有${a}個，一個也沒有拿走，還剩幾個？`, vis: `<div class="plates"><div class="basket">${pics(e, a, true)}</div></div>`, opts: numpadOpts(a), pad: true, hint: '沒有拿走，就是拿走 0 個！', after: `${a} − 0 = ${a}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 補 6-B 0 的算式：看圖選算式、0 的規則 ===== */
function x6B(st) {
  const rounds = [
    () => { const a = rand(3, 8); return { q: `籃子裡有 ${a} 顆球，又放進 0 顆。哪一個算式對？`, sp: `籃子裡有${a}顆球，又放進0顆。哪一個算式對？`, vis: pics('⚽', a, true), keep: false,
      opts: [{ h: `<span class="eq">${a} + 0 = ${a}</span>`, ok: true, t: `${a} + 0 = ${a}` }, { h: `<span class="eq">${a} + 0 = 0</span>`, ok: false, t: `${a} + 0 = 0` }, { h: `<span class="eq">${a} + 1 = ${a + 1}</span>`, ok: false, t: `${a} + 1 = ${a + 1}` }], hint: '放進 0 顆，數量不會變！' }; },
    () => { const a = rand(2, 9); return { q: `${a} 隻鳥全部飛走了。哪一個算式對？`, sp: `${a}隻鳥全部飛走了。哪一個算式對？`, vis: pics('🐦', a, true),
      opts: [{ h: `<span class="eq">${a} − ${a} = 0</span>`, ok: true, t: `${a} − ${a} = 0` }, { h: `<span class="eq">${a} − 0 = ${a}</span>`, ok: false, t: `${a} − 0 = ${a}` }, { h: `<span class="eq">${a} + ${a} = 0</span>`, ok: false, t: `${a} + ${a} = 0` }], hint: '全部飛走，剩下 0 隻！' }; },
    () => { const a = rand(1, 9); return { q: `${a} + 0 = ？`, vis: `<span class="eq">${a} + 0 = <span class="box">?</span></span>`, opts: numpadOpts(a), pad: true, hint: '加 0，數量不變！' }; },
    () => { const a = rand(1, 9); return { q: `0 + ${a} = ？`, vis: `<span class="eq">0 + ${a} = <span class="box">?</span></span>`, opts: numpadOpts(a), pad: true, hint: '0 加上幾，就是幾！' }; },
    () => { const a = rand(2, 9); return { q: `${a} − 0 = ？`, vis: `<span class="eq">${a} − 0 = <span class="box">?</span></span>`, opts: numpadOpts(a), pad: true, hint: '拿走 0 個，數量不變！' }; },
    () => { const a = rand(2, 9); return { q: `${a} − ${a} = ？`, vis: `<span class="eq">${a} − ${a} = <span class="box">?</span></span>`, opts: numpadOpts(0), pad: true, hint: '全部拿走，剩下 0！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 補 6-C 0 的加減快手：□ 填空與列式應用 ===== */
function x6C(st) {
  const rounds = [
    () => { const a = rand(2, 9); return { q: '空格裡要填幾？', vis: `<span class="eq">${a} + <span class="box">?</span> = ${a}</span>`, opts: numpadOpts(0), pad: true, hint: `${a} 加上幾還是 ${a}？` }; },
    () => { const a = rand(2, 9); return { q: '空格裡要填幾？', vis: `<span class="eq">${a} − <span class="box">?</span> = 0</span>`, opts: numpadOpts(a), pad: true, hint: `${a} 拿走幾個，才會一個都不剩？` }; },
    () => { const a = rand(2, 9); return { q: '空格裡要填幾？', vis: `<span class="eq"><span class="box">?</span> − 0 = ${a}</span>`, opts: numpadOpts(a), pad: true, hint: '拿走 0 個還剩下幾個，原來就有幾個！' }; },
    () => { const a = rand(3, 9); return { q: `樹上有 ${a} 隻小鳥，全部飛走了。樹上還剩幾隻？`, eq: [a, '−', a], ops: ['+', '−'], ic: { [a]: '🐦' }, unit: '隻', hint: '「飛走」用 − ！' }; },
    () => { const a = rand(3, 9); return { q: `哥哥有 ${a} 張貼紙，弟弟有 0 張。兩人一共有幾張？`, eq: [a, '+', 0], ops: ['+', '−'], ic: { [a]: '⭐' }, e: '⭐', unit: '張', nums: [0], hint: '「一共」用 ＋ ！' }; },
    () => { const a = rand(3, 9); return { q: `盒子裡有 ${a} 塊餅乾，妹妹吃了 0 塊。還剩幾塊？`, eq: [a, '−', 0], ops: ['+', '−'], ic: { [a]: '🍪' }, e: '🍪', unit: '塊', hint: '「吃了」「還剩」用 − ！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 🎯 進階挑戰：考卷挑戰題（每單元 5 題，含詳解與陷阱提醒） ===== */
const XX2 = [
  () => { const list = [Object.assign({}, KIDS[0], { h: 6, box: 4 }), Object.assign({}, KIDS[1], { h: 9 })];
    return { q: '熊熊站在箱子上，看起來比兔兔高。真正比較高的是誰？', vis: heightSVG(list), keep: true, opts: kidOpts(list, 1), hint: '把箱子拿走再比！',
      ex: '把箱子拿走以後，兩個人的腳都站在地上，兔兔的頭比較上面，兔兔比較高。', trap: '比高矮時腳要對齊在同一個地面，站在箱子上不算。' }; },
  () => ({ q: '同一種書，紅色疊了 5 本，藍色疊了 3 本。哪一疊比較厚？', vis: stackSVG([{ n: 5, t: 14, c: '#ff7eb3', name: '紅色' }, { n: 3, t: 14, c: '#5bb4ff', name: '藍色' }]), keep: true,
    opts: [{ h: '🟥 紅色', ok: true }, { h: '🟦 藍色', ok: false }, { h: '🟰 一樣厚', ok: false }], ex: '一樣的書，5 本比 3 本多，疊起來比較高，紅色比較厚。', trap: '' }),
  () => ({ q: '要比兩本書哪一本比較厚，怎麼放最好比？', keep: true,
    opts: [{ h: '<span style="font-size:20px">兩本平放，底部對齊，看誰比較高</span>', ok: true }, { h: '<span style="font-size:20px">一本平放、一本立起來</span>', ok: false }, { h: '<span style="font-size:20px">看哪一本封面比較大</span>', ok: false }],
    ex: '比厚薄要把兩本書用一樣的放法、底部對齊，再看誰比較高。', trap: '封面大不代表比較厚，厚薄是看書本「疊起來的高度」。' }),
  () => { const list = [Object.assign({}, KIDS[2], { h: 7 }), Object.assign({}, KIDS[3], { h: 7 })];
    return { q: '狗狗和貓貓的腳都站在地上，誰比較高？', vis: heightSVG(list), keep: true, opts: kidOpts(list, -1).concat([{ h: '<span style="font-size:24px">🟰 一樣高</span>', ok: true, t: '一樣高' }]), hint: '頭的位置一樣嗎？',
      ex: '兩個人的腳都在地上，頭也在同一個高度，所以一樣高。', trap: '答案也可能是「一樣高」，不一定有一個比較高。' }; },
  () => { const list = [Object.assign({}, KIDS[0], { h: 9 }), Object.assign({}, KIDS[1], { h: 6 }), Object.assign({}, KIDS[2], { h: 8 })];
    return { q: '熊熊比狗狗高，狗狗比兔兔高。誰<b>最矮</b>？', vis: heightSVG(list), keep: true, opts: kidOpts(list, 1), hint: '找頭最低的！',
      ex: '熊熊最高，狗狗第二，兔兔最矮。', trap: '題目問「最矮」，不是「最高」。' }; }
];
const XX6 = [
  () => ({ q: '7 + 0 = ？', vis: '<span class="eq">7 + 0 = <span class="box">?</span></span>', opts: numpadOpts(7), pad: true, ex: '加 0 就是什麼都沒有加，7 + 0 = 7。', trap: '加 0 不是變成 0！' }),
  () => ({ q: '5 − 5 = ？', vis: '<span class="eq">5 − 5 = <span class="box">?</span></span>', opts: numpadOpts(0), pad: true, ex: '5 個全部拿走，一個都不剩，5 − 5 = 0。', trap: '' }),
  () => ({ q: '下面哪一個算式的答案<b>不是</b> 6？', opts: [opE('6 − 6', true), opE('6 + 0', false), opE('0 + 6', false), opE('6 − 0', false)],
    ex: '6 + 0、0 + 6、6 − 0 都是 6；6 − 6 = 0。', trap: '題目問「不是」6 的算式，要找答案是 0 的那一個。' }),
  () => ({ q: '桌上有 8 顆糖，弟弟一顆也沒有吃。桌上還有幾顆糖？', eq: [8, '−', 0], ops: ['+', '−'], nums: [0], ic: { 8: '🍬' }, e: '🍬', unit: '顆',
    ex: '一顆也沒有吃，就是吃了 0 顆：8 − 0 = 8。', trap: '「一顆也沒有」就是 0。' }),
  () => ({ q: '<span class="eq">4 + <span class="box">?</span> = 4</span>，□ 是多少？', sp: '4加幾等於4？', opts: numpadOpts(0), pad: true, ex: '4 加上 0 還是 4，所以 □ 是 0。', trap: '不是 4！4 + 4 = 8。' })
];

Object.assign(LEVELS, { x2: [x2A, x2B, x2C, st => xquiz(st, XX2)], x6: [x6A, x6B, x6C, st => xquiz(st, XX6)] });
