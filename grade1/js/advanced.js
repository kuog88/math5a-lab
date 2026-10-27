'use strict';
/* 🎯 進階挑戰（2026-10）：每單元 5 題考卷程度的題目，答對後顯示詳解與陷阱提醒 */

/* 進階問答：題目物件 {q, sp, vis, opts, keep, pad, hint, ex, trap} */
function xquiz(st, rounds) {
  let i = 0;
  function show() {
    if (i >= rounds.length) { api.finish(); return; }
    let r = rounds[i]; if (typeof r === 'function') r = r();
    st.innerHTML = `${dots(i, rounds.length)}<div class="qvis">${r.vis || ''}</div><div class="${r.pad ? 'numpad' : 'opts'}"></div><div class="xpl" hidden></div>`;
    api.say(r.q, r.sp);
    const ops = $(r.pad ? '.numpad' : '.opts', st);
    (r.keep || r.pad ? r.opts : shuffle(r.opts)).forEach(o => ops.appendChild(optBtn(o, () => {
      const x = $('.xpl', st), last = i === rounds.length - 1;
      x.innerHTML = `<div class="xpl-ex">📖 詳解：${r.ex}</div>${r.trap ? `<div class="xpl-trap">⚠️ 小心陷阱：${r.trap}</div>` : ''}<div class="center"><button class="btn mint xpl-next" type="button">${last ? '完成 🎉' : '下一題 ➜'}</button></div>`;
      x.hidden = false;
      speak('詳解。' + r.ex + (r.trap ? '小心陷阱。' + r.trap : ''));
      $('.xpl-next', x).onclick = () => { i++; show(); };
      x.scrollIntoView && x.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, r.hint)));
  }
  show();
}

/* ---------- 圖解小工具 ---------- */
const XC = { pink: '#ff7eb3', blue: '#5bb4ff', mint: '#3fcf9c', yellow: '#ffc93c', purple: '#a98bff', orange: '#ff9a4d', ink: '#4a3b5c', grid: '#d9d0e3' };
const svgW = (w, h, body, max = 360) => `<svg viewBox="0 0 ${w} ${h}" style="width:min(${max}px,88vw);height:auto">${body}</svg>`;
const txt = (x, y, s, size = 20, fill = XC.ink) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="900" fill="${fill}" font-family="Arial,'Microsoft JhengHei',sans-serif">${s}</text>`;
const opT = (s, ok, size = 26) => ({ h: `<span style="font-size:${size}px">${s}</span>`, ok });
const opE = (s, ok) => ({ h: `<span class="eq" style="font-size:30px">${s}</span>`, ok });
const opN = (v, ok) => ({ h: N(v), ok });
const nums = (ans, list) => list.map(v => opN(v, v === ans));

/* 數線：lo 到 hi，marks 是要圈起來的數 */
function numLine(lo, hi, marks = []) {
  const n = hi - lo, gap = 34, w = n * gap + 50;
  let s = `<line x1="16" y1="40" x2="${w - 10}" y2="40" stroke="${XC.ink}" stroke-width="4" stroke-linecap="round"/><polygon points="${w - 4},40 ${w - 16},33 ${w - 16},47" fill="${XC.ink}"/>`;
  for (let k = 0; k <= n; k++) {
    const x = 25 + k * gap, v = lo + k, m = marks.includes(v);
    s += `<line x1="${x}" y1="30" x2="${x}" y2="50" stroke="${XC.ink}" stroke-width="3"/>`;
    if (m) s += `<circle cx="${x}" cy="76" r="15" fill="#ffe9f2" stroke="${XC.pink}" stroke-width="3"/>`;
    s += txt(x, 83, v, 18);
  }
  return svgW(w, 100, s, Math.min(560, w * 1.4));
}

/* 骰子點數 */
function dieSVG(n, size = 90) {
  const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] }[n];
  return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px"><rect x="6" y="6" width="88" height="88" rx="16" fill="#fff" stroke="${XC.ink}" stroke-width="4"/>${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${XC.ink}"/>`).join('')}</svg>`;
}

/* 時鐘：任意角度的長短針（給「長短針看反」的陷阱用） */
function clockAng(ha, ma) {
  return clockSVG(12, 0).replace(/(class="hand-h" transform="rotate\()0/, `$1${ha}`).replace(/(class="hand-m" transform="rotate\()0/, `$1${ma}`);
}
const clk = (h, m, ok) => ({ h: clockSVG(h, m), ok });

/* 方格上的鉛筆：from、len 用格子算 */
function gridPencils(cols, list) {
  const c = 34, w = cols * c + 40, h = list.length * 56 + 20;
  let s = '';
  list.forEach((p, k) => {
    const y = 14 + k * 56;
    for (let i = 0; i < cols; i++) s += `<rect x="${10 + i * c}" y="${y}" width="${c}" height="${c}" fill="#fbf8ff" stroke="${XC.grid}" stroke-width="2"/>`;
    const x1 = 10 + p.from * c, x2 = x1 + p.len * c - 14;
    s += `<rect x="${x1}" y="${y + 7}" width="${x2 - x1}" height="20" rx="4" fill="${p.c}" stroke="${XC.ink}" stroke-width="2"/><polygon points="${x2},${y + 7} ${x2 + 14},${y + 17} ${x2},${y + 27}" fill="#f5d29b" stroke="${XC.ink}" stroke-width="2"/>`;
  });
  return svgW(w, h, s, 400);
}

/* ===== 第 1 單元 數到 10 ===== */
const X1 = [
  () => {
    const P = [[40, 40], [118, 30], [70, 92], [180, 60], [150, 118], [36, 150], [210, 150], [110, 165]];
    return {
      q: '數一數，一共有幾個點點？<br><small>（點點亂亂的，不要漏掉喔）</small>', sp: '數一數，一共有幾個點點？點點亂亂的，不要漏掉喔。',
      vis: svgW(250, 200, `<rect x="2" y="2" width="246" height="196" rx="18" fill="#fbfdff" stroke="#cfe6fb" stroke-width="3"/>${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="${XC.pink}"/>`).join('')}`, 300),
      opts: nums(8, [7, 8, 9]), hint: '數過的可以用手指按住，一個一個數！',
      ex: '從上面一排開始，一個一個數：1、2、3、4、5、6、7、8，一共 8 個點點。', trap: '點點排得亂亂的，很容易漏數一個（變成 7）或重複數一個（變成 9）。數過的要做記號！'
    };
  },
  () => ({
    q: '盤子裡有幾個 <b>🍎 蘋果</b>？', sp: '盤子裡有幾個蘋果？',
    vis: `<span class="plate"><span class="pics" style="grid-template-columns:repeat(4,1fr)">${['🍎', '🍌', '🍎', '🍎', '🍌', '🍎', '🍎'].map(e => `<span>${e}</span>`).join('')}</span></span>`,
    opts: nums(5, [5, 7, 2]), hint: '只數蘋果，香蕉不要數！',
    ex: '蘋果有 1、2、3、4、5，一共 5 個。香蕉有 2 根，不算。', trap: '題目只問「蘋果」，把香蕉也數進去就會變成 7。'
  }),
  () => {
    const plate = (e, n, fs, cols) => `<span class="plate" style="min-width:150px"><span class="pics" style="grid-template-columns:repeat(${cols},1fr);font-size:${fs}px">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span></span>`;
    return {
      q: '哪一盤<b>剛好有 6 個</b>？', sp: '哪一盤剛好有6個？',
      opts: [{ h: plate('🍉', 5, 40, 3), ok: false }, { h: plate('🍒', 6, 22, 3), ok: true }, { h: plate('🫐', 7, 18, 4), ok: false }],
      hint: '不要看東西大不大，一個一個數！',
      ex: '西瓜盤有 5 個，櫻桃盤有 6 個，藍莓盤有 7 個。剛好 6 個的是櫻桃那一盤。', trap: '西瓜很大、看起來很多，其實只有 5 個。東西大或小，都不會改變有幾個。'
    };
  },
  () => ({
    q: '十格框裡<b>放了</b>幾個 ⭐？', sp: '十格框裡放了幾個星星？',
    vis: `<div class="tf" style="grid-template-columns:repeat(5,44px)">${Array.from({ length: 10 }, (_, k) => `<i class="${k < 7 ? 'on' : ''}" style="width:44px;height:44px;font-size:28px">${k < 7 ? '⭐' : ''}</i>`).join('')}</div>`,
    opts: nums(7, [7, 3, 8]), hint: '上面一排是 5 個，下面再接著數！',
    ex: '上面一排滿滿的是 5 個，下面再數 6、7，一共 7 個星星。', trap: '空的格子有 3 個，題目問的是「放了」幾個，不是空格有幾個。'
  }),
  () => ({
    q: '從 1 數到 10，<b>漏掉</b>了哪一個數？', sp: '從1數到10，漏掉了哪一個數？',
    vis: `<span class="eq" style="font-size:34px">1 , 2 , 3 , 4 , 5 , 6 , 8 , 9 , 10</span>`,
    opts: nums(7, [7, 10, 0]), hint: '一個一個跟著數：1、2、3……哪裡跳過了？',
    ex: '1、2、3、4、5、6 的後面應該是 7，再來才是 8、9、10，所以漏掉 7。', trap: '數字很多的時候，眼睛容易直接跳過去，要一個一個對著數。'
  })
];

/* ===== 第 2 單元 比長短 ===== */
const X2 = [
  () => ({
    q: '紅鉛筆和藍鉛筆，哪一枝比較長？<br><small>（看看下面的格子）</small>', sp: '紅鉛筆和藍鉛筆，哪一枝比較長？看看下面的格子。',
    vis: gridPencils(9, [{ from: 3, len: 4, c: XC.pink }, { from: 0, len: 6, c: XC.blue }]), keep: true,
    opts: [opT('🟥 紅鉛筆', false), opT('🟦 藍鉛筆', true), opT('🟰 一樣長', false)], hint: '數數看，每一枝佔了幾格？',
    ex: '紅鉛筆佔 4 格，藍鉛筆佔 6 格，6 格比 4 格長，所以藍鉛筆比較長。', trap: '紅鉛筆的尾巴跑得比較遠，但是它的頭沒有對齊。起點不一樣，不能只看尾巴！'
  }),
  () => {
    const clip = (x, y, w) => `<rect x="${x + 2}" y="${y}" width="${w - 4}" height="16" rx="8" fill="none" stroke="${XC.ink}" stroke-width="3"/>`;
    let s = `<rect x="10" y="18" width="240" height="22" rx="4" fill="${XC.pink}"/>`;
    for (let k = 0; k < 5; k++) s += clip(10 + k * 48, 46, 48);
    s += `<rect x="10" y="98" width="168" height="22" rx="4" fill="${XC.blue}"/>`;
    for (let k = 0; k < 7; k++) s += clip(10 + k * 24, 126, 24);
    return {
      q: '紅緞帶量了 <b>5 個大迴紋針</b>，藍緞帶量了 <b>7 個小迴紋針</b>。哪一條緞帶比較長？', sp: '紅緞帶量了5個大迴紋針，藍緞帶量了7個小迴紋針。哪一條緞帶比較長？',
      vis: svgW(260, 160, s), keep: true,
      opts: [opT('🟥 紅緞帶', true), opT('🟦 藍緞帶', false), opT('🟰 一樣長', false)], hint: '迴紋針一樣大嗎？看看圖！',
      ex: '大迴紋針比小迴紋針長很多。看圖，紅緞帶比藍緞帶長。', trap: '7 比 5 多，但是兩個迴紋針不一樣大，數字多的不一定比較長。要用一樣大的東西量，才能比數字。'
    };
  },
  () => ({
    q: '這枝鉛筆有<b>幾格</b>長？', sp: '這枝鉛筆有幾格長？',
    vis: gridPencils(9, [{ from: 2, len: 6, c: XC.mint }]),
    opts: nums(6, [6, 8, 9]), hint: '只數鉛筆下面的格子！',
    ex: '只數鉛筆下面的格子：1、2、3、4、5、6，一共 6 格，所以是 6 格長。', trap: '鉛筆前面空了 2 格，從最左邊一路數到鉛筆尾巴會數成 8。前面空的格子不能算！'
  }),
  () => ({
    q: '紅繩子比藍繩子長，藍繩子比綠繩子長。哪一條繩子<b>最短</b>？', sp: '紅繩子比藍繩子長，藍繩子比綠繩子長。哪一條繩子最短？',
    keep: true, opts: [opT('🟥 紅繩子', false), opT('🟦 藍繩子', false), opT('🟩 綠繩子', true)], hint: '可以用手比一比：紅最長，再來是誰？',
    ex: '紅比藍長，藍又比綠長，從長排到短是：紅、藍、綠。最短的是綠繩子。', trap: '題目問的是「最短」，不是「最長」。紅繩子是最長的喔！'
  }),
  () => {
    const kid = (x, foot, body, face, c) => `<rect x="${x - 22}" y="${foot - body}" width="44" height="${body - 30}" rx="12" fill="${c}" stroke="${XC.ink}" stroke-width="3"/><text x="${x}" y="${foot - body + 2}" text-anchor="middle" font-size="40">${face}</text><rect x="${x - 18}" y="${foot - 30}" width="14" height="30" fill="${c}"/><rect x="${x + 4}" y="${foot - 30}" width="14" height="30" fill="${c}"/>`;
    const s = `<line x1="0" y1="232" x2="300" y2="232" stroke="${XC.ink}" stroke-width="4"/>
      <rect x="45" y="182" width="70" height="50" fill="#e6b45f" stroke="${XC.ink}" stroke-width="3"/>${txt(80, 214, '椅子', 16, '#fff')}
      ${kid(80, 182, 120, '🐰', XC.pink)}${kid(215, 232, 150, '🐻', XC.blue)}`;
    return {
      q: '兔兔站在椅子上，熊熊站在地上。誰的<b>身體</b>比較高？', sp: '兔兔站在椅子上，熊熊站在地上。誰的身體比較高？',
      vis: svgW(300, 240, s, 320), keep: true,
      opts: [opT('🐰 兔兔', false), opT('🐻 熊熊', true), opT('🟰 一樣高', false)], hint: '椅子不是身體喔！把兔兔放到地上想想看。',
      ex: '兔兔是站在椅子上才看起來比較高。把椅子拿走，兔兔的腳和熊熊的腳一樣在地上，熊熊比較高。', trap: '比高矮要從腳底一起對齊比。站在椅子上，只是頭比較高，身體並沒有變長。'
    };
  }
];

/* ===== 第 3 單元 分與合 ===== */
const X3 = [
  () => ({
    q: '下面哪一個是<b>錯的</b>？', sp: '下面哪一個是錯的？',
    opts: [opT('9 可以分成 4 和 5', false, 24), opT('9 可以分成 3 和 6', false, 24), opT('9 可以分成 2 和 6', true, 24)],
    hint: '每一個都合起來看看，是不是 9？',
    ex: '4 和 5 合起來是 9，3 和 6 合起來是 9，2 和 6 合起來只有 8，所以「9 可以分成 2 和 6」是錯的。', trap: '題目問「錯的」，要找不對的那一個，不是找對的。'
  }),
  () => ({
    q: '3 和 5 合起來的數（★），也可以分成 2 和幾？', sp: '3和5合起來的數，也可以分成2和幾？',
    vis: `${tree('★', 3, 5)}${tree('★', 2, '?')}`, pad: true, opts: numpadOpts(6, 1, 10),
    hint: '先算出 ★ 是幾，再分成 2 和幾！',
    ex: '先算 3 和 5 合起來是 8，★ 是 8。8 可以分成 2 和 6，所以答案是 6。', trap: '這題要做兩步：先找出 ★，再分。直接看到 5 就填 5 是不對的。'
  }),
  () => ({
    q: '哪兩個數合起來是 <b class="big">10</b>？', sp: '哪兩個數合起來是10？',
    opts: [opT('4 和 6', true, 30), opT('3 和 6', false, 30), opT('5 和 4', false, 30), opT('2 和 7', false, 30)],
    hint: '用 10 個手指頭比比看！',
    ex: '4 和 6 合起來是 10。3 和 6 是 9，5 和 4 是 9，2 和 7 也是 9。', trap: '有三個選項合起來都是 9，只差 1 個，要一個一個仔細數。'
  }),
  () => ({
    q: '哪一個骰子和左邊的骰子<b>合起來是 9 個點</b>？', sp: '哪一個骰子和左邊的骰子合起來是9個點？',
    vis: `${dieSVG(4, 100)}<span class="eq">和</span><span class="box" style="font-size:40px">?</span>`, keep: true,
    opts: [{ h: dieSVG(5), ok: true }, { h: dieSVG(6), ok: false }, { h: dieSVG(4), ok: false }],
    hint: '左邊有 4 個點，9 可以分成 4 和幾？',
    ex: '左邊骰子有 4 個點。9 可以分成 4 和 5，所以要找 5 個點的骰子。', trap: '6 個點和 4 個點合起來是 10，不是 9；先數清楚左邊有幾個點。'
  }),
  () => ({
    q: '8 可以分成 2 和 6，也可以分成 6 和幾？', sp: '8可以分成2和6，也可以分成6和幾？',
    vis: `${tree(8, 2, 6)}${tree(8, 6, '?')}`, pad: true, opts: numpadOpts(2, 1, 10),
    hint: '左右換一下位置就好！',
    ex: '8 分成 2 和 6，把兩邊換位置，就是 8 分成 6 和 2，答案是 2。', trap: '看到 6 就填 6，或填上面的 8，都不對。分成的兩個數換位置，合起來還是一樣。'
  })
];

/* ===== 第 4 單元 順序和多少 ===== */
const X4 = [
  () => ({
    q: '🐱 從<b>前面</b>數是第 3 個，從<b>後面</b>數是第幾個？', sp: '小貓從前面數是第3個，從後面數是第幾個？',
    vis: `<div>${queueHTML(['🐶', '🐰', '🐱', '🐻', '🐼', '🐸', '🐷'])}</div>`,
    opts: nums(5, [5, 4, 3]), hint: '從右邊（後面）開始，一個一個數到 🐱！',
    ex: '從後面數：🐷 第 1、🐸 第 2、🐼 第 3、🐻 第 4、🐱 第 5，所以是第 5 個。', trap: '一共有 7 隻，不是用 7 去拿掉 3。要從後面真的一個一個數，🐱 自己也要算進去。'
  }),
  () => ({
    q: '🙋 小明排在<b>第 4 個</b>，他<b>前面</b>有幾個人？', sp: '小明排在第4個，他前面有幾個人？',
    vis: `<div>${queueHTML(['🧒', '🧒', '🧒', '🙋', '🧒', '🧒'])}</div>`,
    opts: nums(3, [3, 4, 5]), hint: '小明前面的人才算，小明自己不算！',
    ex: '小明是第 4 個，在他前面的是第 1、第 2、第 3 個，一共 3 個人。', trap: '「第 4 個」是小明自己的位置，問「前面有幾個人」不能把小明算進去。'
  }),
  () => {
    const row = (e, n, gap) => `<div style="display:flex;gap:min(${gap}px,${gap / 8}vw);justify-content:flex-start;font-size:32px;line-height:1.3;padding-left:8px">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</div>`;
    return {
      q: '🐰 和 🥕，哪一個比較<b>多</b>？', sp: '兔子和紅蘿蔔，哪一個比較多？',
      vis: `<div style="width:100%;max-width:520px">${row('🐰', 5, 38)}${row('🥕', 6, 0)}</div>`, keep: true,
      opts: [opT('🐰 兔子', false), opT('🥕 紅蘿蔔', true), opT('🟰 一樣多', false)], hint: '不要看排得多長，一個一個數！',
      ex: '兔子有 5 隻，紅蘿蔔有 6 根，6 比 5 多，所以紅蘿蔔比較多。', trap: '兔子排得開開的、看起來比較長，其實比較少。排得長不一定比較多！'
    };
  },
  () => {
    const cell = e => `<span style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center">${e}</span>`;
    const box = hl => `<span style="display:inline-block;width:40px;height:40px;margin:2px;border:3px dashed ${hl ? XC.pink : '#b9a9c9'};border-radius:8px;vertical-align:middle;background:${hl ? '#ffe9f2' : '#fff'}"></span>`;
    return {
      q: '🐱 有 5 隻，🐶 比 🐱 <b>多 2 隻</b>。🐶 有幾隻？', sp: '小貓有5隻，小狗比小貓多2隻。小狗有幾隻？',
      vis: `<div style="text-align:left;font-size:30px"><div>🐱 ${Array.from({ length: 5 }, () => cell('🐱')).join('')}</div><div>🐶 ${Array.from({ length: 7 }, (_, k) => box(k >= 5)).join('')}</div></div>`,
      opts: nums(7, [7, 3, 5]), hint: '先和小貓一樣多，再多出 2 個格子！',
      ex: '小狗先和小貓一樣多是 5 隻，再多 2 隻：6、7，所以小狗有 7 隻。', trap: '「多 2 隻」是說小狗比較多，要往後數，不是往前數變成 3。'
    };
  },
  () => ({
    q: '比 5 <b>大</b>、又比 8 <b>小</b>的數，有幾個？', sp: '比5大、又比8小的數，有幾個？',
    vis: numLine(0, 10), opts: nums(2, [2, 3, 4]), hint: '在數線上找到 5 和 8，看中間有哪些數！',
    ex: '比 5 大又比 8 小的數是 6 和 7，一共 2 個。', trap: '5 和 8 自己不算，因為 5 沒有比 5 大，8 也沒有比 8 小。'
  })
];

/* ===== 第 5 單元 數到 30 ===== */
const X5 = [
  () => ({
    q: '<b>2 個十和 0 個一</b>是多少？', sp: '2個十和0個一是多少？',
    vis: sticks(2, 0), opts: nums(20, [20, 2, 12]), hint: '一捆是 10 枝，數數看：十、二十……',
    ex: '一捆是 10，兩捆是 10、20。沒有單枝的，所以是 20。', trap: '寫成 2 是忘了「十」，寫成 12 是把兩捆當成 1 個十和 2 個一。'
  }),
  () => ({
    q: '1 捆是 10 枝。一共有幾枝吸管？', sp: '一捆是10枝。一共有幾枝吸管？',
    vis: sticks(1, 12), opts: nums(22, [22, 13, 21]), hint: '先數一捆是 10，再接著 11、12……數單枝的！',
    ex: '一捆是 10，再接著數 12 枝單枝的：11、12、……、22，一共 22 枝。也可以想：單枝的 12 枝裡，10 枝可以再綁成一捆，就是 2 個十和 2 個一。', trap: '單枝的超過 10 枝了！把它當成「1 個十和 2 個一」說成 12 或 13 是不對的。'
  }),
  () => ({
    q: '17 和 21 的<b>中間</b>有幾個數？', sp: '17和21的中間有幾個數？',
    vis: numLine(15, 23), opts: nums(3, [3, 4, 5]), hint: '在數線上找 17 和 21，數中間的！',
    ex: '17 和 21 中間的數是 18、19、20，一共 3 個。', trap: '17 和 21 自己不算。把它們算進去就會數成 5 個。'
  }),
  () => ({
    q: '從 30 開始<b>倒著數</b>，數到的<b>第 4 個數</b>是多少？', sp: '從30開始倒著數，數到的第4個數是多少？',
    vis: `<span class="eq" style="font-size:34px">30 , 29 , … </span>`, opts: nums(27, [27, 26, 28]), hint: '30 自己就是第 1 個喔！',
    ex: '倒著數：30 是第 1 個、29 是第 2 個、28 是第 3 個、27 是第 4 個。', trap: '30 本身就是第 1 個，從 29 才開始算第 1 個會答成 26。'
  }),
  () => ({
    q: '哪一個數比 25 <b>大</b>，又比 28 <b>小</b>？', sp: '哪一個數比25大，又比28小？',
    vis: numLine(22, 30), keep: true, opts: [opN(24, false), opN(26, true), opN(28, false), opN(29, false)], hint: '兩個條件都要做到喔！',
    ex: '比 25 大又比 28 小的數有 26 和 27，選項裡只有 26。', trap: '28 不比 28 小；29 比 25 大但比 28 大。兩個條件都要成立才算。'
  })
];

/* ===== 第 6 單元 加一加 ===== */
const X6 = [
  () => ({
    q: '樹上有 3 隻 🐦，飛來 2 隻，<b>又</b>飛來 4 隻。現在樹上有幾隻？', sp: '樹上有3隻鳥，飛來2隻，又飛來4隻。現在樹上有幾隻？',
    vis: `${pics('🐦', 3, true)}<span class="eq">+</span>${pics('🐦', 2, true)}<span class="eq">+</span>${pics('🐦', 4, true)}`,
    opts: nums(9, [9, 5, 7]), hint: '一共飛來了兩次，都要加進去！',
    ex: '3 + 2 = 5，再 5 + 4 = 9，現在樹上有 9 隻。', trap: '有兩次「飛來」，只加一次會答成 5 或 7。'
  }),
  () => ({
    q: '空格裡要填幾？', vis: `<span class="eq"><span class="box">?</span> + 4 = 10</span>`, sp: '幾加4等於10？',
    pad: true, opts: numpadOpts(6, 1, 10), hint: '幾和 4 合起來是 10？',
    ex: '10 可以分成 6 和 4，所以 6 + 4 = 10，空格填 6。', trap: '不是把 10 和 4 合起來，也不是填 4。要想「幾加 4 才會變成 10」。'
  }),
  () => ({
    q: '盤子裡有 4 顆 🍎 和 3 根 🍌，媽媽又放進 2 顆 🍎。現在有幾顆 <b>蘋果</b>？', sp: '盤子裡有4顆蘋果和3根香蕉，媽媽又放進2顆蘋果。現在有幾顆蘋果？',
    vis: `<span class="plate">${pics('🍎', 4, true)}${pics('🍌', 3, true)}</span><span class="eq">+</span>${pics('🍎', 2, true)}`,
    opts: nums(6, [6, 9, 7]), hint: '只問蘋果，香蕉不用加！',
    ex: '蘋果原本 4 顆，又放進 2 顆：4 + 2 = 6，現在有 6 顆蘋果。', trap: '香蕉是多出來的條件，題目只問蘋果。把香蕉也加進去會變成 9。'
  }),
  () => ({
    q: '哪一題的答案和 <b>3 + 5</b> 一樣？', sp: '哪一題的答案和3加5一樣？',
    opts: [opE('4 + 4', true), opE('3 + 6', false), opE('5 + 2', false)], hint: '先算 3 + 5 是幾！',
    ex: '3 + 5 = 8。4 + 4 = 8，3 + 6 = 9，5 + 2 = 7，所以是 4 + 4。', trap: '3 + 6 和 5 + 2 裡面都有 3 或 5，看起來很像，但答案不一樣，要真的算出來。'
  }),
  () => ({
    q: '哪一題的答案<b>最大</b>？', sp: '哪一題的答案最大？',
    opts: [opE('6 + 3', false), opE('5 + 5', true), opE('2 + 7', false)], hint: '每一題都算出來再比！',
    ex: '6 + 3 = 9，5 + 5 = 10，2 + 7 = 9。10 最大，所以是 5 + 5。', trap: '7 是裡面最大的數字，但 2 + 7 的答案不是最大。要比的是「答案」。'
  })
];

/* ===== 第 7 單元 認識形狀 ===== */
const X7 = [
  () => ({
    q: '哪一個<b>會滾</b>，<b>也可以</b>穩穩的疊起來？', sp: '哪一個會滾，也可以穩穩的疊起來？',
    opts: [{ h: solidSVG('cyl', XC.mint), ok: true }, { h: solidSVG('ball', XC.pink), ok: false }, { h: solidSVG('cube', XC.blue), ok: false }],
    hint: '要有彎彎的面，也要有平平的面！',
    ex: '圓柱有彎彎的面可以滾，上下有平平的面可以疊。球只能滾，正方體只能疊。', trap: '兩個條件都要做到。球會滾，但不能穩穩的疊。'
  }),
  () => {
    const st = `stroke="${XC.ink}" stroke-width="3" stroke-linejoin="round"`;
    const s = `<circle class="pk" cx="250" cy="40" r="24" fill="${XC.yellow}" ${st}/>
      <polygon class="pk" points="140,30 140,150 70,150" fill="${XC.pink}" ${st}/>
      <polygon class="pk" points="150,50 150,150 205,150" fill="${XC.blue}" ${st}/>
      <polygon class="pk" points="140,10 140,30 168,20" fill="${XC.orange}" ${st}/>
      <line x1="140" y1="10" x2="140" y2="160" stroke="${XC.ink}" stroke-width="4"/>
      <rect class="pk" x="55" y="160" width="170" height="36" fill="#e6b45f" ${st}/>
      <polyline class="pk" points="248,142 232,182 272,182 263,160" fill="none" stroke="${XC.purple}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    return {
      q: '這張帆船圖裡，有幾個<b>三角形</b>？<br><small>（點一下圖形可以做記號）</small>', sp: '這張帆船圖裡，有幾個三角形？',
      vis: `<div class="pic">${svgW(300, 210, s, 320)}</div>`, opts: nums(3, [3, 4, 2]), hint: '三角形要有 3 條直直的邊，而且要連起來！',
      ex: '兩片船帆是 2 個三角形，旗子是 1 個三角形，一共 3 個。右下角紫色的線沒有連起來，不是三角形。', trap: '紫色的線看起來像三角形，但是有一個缺口沒有接起來，不能算。小旗子很小，也別漏數！'
    };
  },
  () => {
    const fan = `<svg viewBox="0 0 100 100"><path d="M50,14 L86,82 Q50,98 14,82 Z" fill="${XC.yellow}" stroke="${XC.ink}" stroke-width="3" stroke-linejoin="round"/></svg>`;
    return {
      q: '哪一個<b>不是</b>三角形？', sp: '哪一個不是三角形？',
      opts: [{ h: shapeSVG('tri', XC.pink, { v: 0, rot: 180 }), ok: false }, { h: shapeSVG('tri', XC.blue, { v: 1 }), ok: false }, { h: fan, ok: true }],
      hint: '三角形的 3 條邊都是直直的！',
      ex: '倒過來的和斜斜的，都有 3 條直直的邊，是三角形。黃色那個下面的邊是彎彎的，不是三角形。', trap: '三角形倒過來、轉個方向，還是三角形；有彎彎的邊就不是三角形。'
    };
  },
  () => {
    const C = { circle: XC.pink, tri: XC.blue };
    const mini = t => `<span style="display:inline-block;width:44px;height:44px">${shapeSVG(t, C[t]).replace('<svg ', '<svg style="width:100%;height:100%" ')}</span>`;
    const seq = ['circle', 'circle', 'tri', 'circle', 'circle', 'tri'];
    const q3 = '<span class="box" style="vertical-align:top;font-size:24px">?</span>';
    return {
      q: '形狀照規律一直排下去，<b>第 9 個</b>是什麼形狀？', sp: '形狀照規律一直排下去，第9個是什麼形狀？',
      vis: `<div>${seq.map(mini).join('')}${q3}${q3}${q3}</div>`, keep: true,
      opts: [{ h: mini('circle'), ok: false }, { h: mini('tri'), ok: true }], hint: '找出一直重複的是哪幾個，再接著排到第 9 個！',
      ex: '規律是「圓、圓、三角形」一直重複。第 7 個是圓、第 8 個是圓、第 9 個是三角形。', trap: '問的是第 9 個，不是下一個（第 7 個）。要一個一個接著排到第 9 個。'
    };
  },
  () => {
    const cell = h => `<span style="display:inline-block;width:70px;height:70px">${h.replace('<svg ', '<svg style="width:100%;height:100%" ')}</span>`;
    const emo = e => `<span style="display:inline-block;width:70px;height:70px;font-size:52px;line-height:70px;vertical-align:top">${e}</span>`;
    return {
      q: '下面這些東西裡，有幾個是<b>圓柱</b>？', sp: '下面這些東西裡，有幾個是圓柱？',
      vis: `<div>${cell(solidSVG('cyl', XC.mint))}${cell(solidSVG('box', XC.pink))}${cell(solidSVG('cyl', XC.yellow, { lie: true }))}${cell(solidSVG('ball', XC.blue))}${emo('🥫')}${cell(solidSVG('cube', XC.purple))}${cell(solidSVG('box', XC.orange, { tall: true }))}</div>`,
      opts: nums(3, [3, 2, 4]), hint: '躺下來的也要找喔！',
      ex: '站著的綠色圓柱、躺著的黃色圓柱、罐頭，一共 3 個圓柱。', trap: '躺下來的圓柱和罐頭也都是圓柱，只找站著的會數成 1 或 2 個。'
    };
  }
];

/* ===== 第 8 單元 減一減與加減應用 ===== */
const X8 = [
  () => ({
    q: '妹妹有 8 顆 🍬，吃了 2 顆，媽媽<b>又給她</b> 3 顆。現在妹妹有幾顆？', sp: '妹妹有8顆糖，吃了2顆，媽媽又給她3顆。現在妹妹有幾顆？',
    vis: pics('🍬', 8, true), opts: nums(9, [9, 5, 6]), hint: '先減掉吃掉的，再加上媽媽給的！',
    ex: '先算吃掉以後：8 − 2 = 6，再加上媽媽給的：6 + 3 = 9，現在有 9 顆。', trap: '這題有兩個步驟。只算 8 − 2 會答 6；把 3 也當成減掉會答 3 或 5。'
  }),
  () => {
    const row = (e, n) => `<div class="row" style="font-size:32px">${Array.from({ length: 7 }, (_, i) => `<span style="width:40px">${i < n ? e : ''}</span>`).join('')}</div>`;
    return {
      q: '🐶 有 7 隻，🐱 有 4 隻。🐱 比 🐶 <b>少</b>幾隻？', sp: '小狗有7隻，小貓有4隻。小貓比小狗少幾隻？',
      vis: `<div>${row('🐶', 7)}${row('🐱', 4)}</div>`, opts: nums(3, [3, 4, 7]), hint: '一個對一個，看小貓缺了幾隻！',
      ex: '一隻小狗對一隻小貓，小貓缺了 3 隻。7 − 4 = 3，小貓比小狗少 3 隻。', trap: '「少幾隻」也是用減的，用大的數減小的數：7 − 4，不是 4 − 7，也不是答小貓有 4 隻。'
    };
  },
  () => ({
    q: '空格裡要填幾？', vis: `<span class="eq"><span class="box">?</span> − 4 = 5</span>`, sp: '幾減4等於5？',
    pad: true, opts: numpadOpts(9, 1, 10), hint: '拿走 4 個以後還剩 5 個，原本有幾個？',
    ex: '拿走 4 個還剩 5 個，原本就是 5 和 4 合起來：5 + 4 = 9。檢查：9 − 4 = 5。', trap: '不能直接算 5 − 4 = 1。空格是「原本有幾個」，一定比剩下的 5 還要多。'
  }),
  () => ({
    q: '停車場有 10 輛 🚗，開走了一些，還剩 6 輛。<b>開走了</b>幾輛？', sp: '停車場有10輛車，開走了一些，還剩6輛。開走了幾輛？',
    vis: `<span class="eq">10 − <span class="box">?</span> = 6</span>`, opts: nums(4, [4, 6, 10]), hint: '10 要拿走幾個，才會剩下 6 個？',
    ex: '10 可以分成 6 和 4，剩下 6 輛，所以開走了 4 輛。10 − 4 = 6。', trap: '6 是「剩下」的車，題目問的是「開走」的車。'
  }),
  () => ({
    q: '哪一題的答案<b>不是</b> 5？', sp: '哪一題的答案不是5？',
    opts: [opE('9 − 4', false), opE('8 − 3', false), opE('7 − 3', true), opE('2 + 3', false)], hint: '每一題都算算看！',
    ex: '9 − 4 = 5，8 − 3 = 5，2 + 3 = 5，7 − 3 = 4，所以答案不是 5 的是 7 − 3。', trap: '題目有「不是」兩個字，要找答案「不是 5」的那一題。'
  })
];

/* ===== 第 9 單元 讀鐘錶 ===== */
const X9 = [
  () => ({
    q: '哪一個時鐘是 <b>3 點</b>？', sp: '哪一個時鐘是3點？',
    opts: [clk(3, 0, true), { h: clockAng(0, 90), ok: false }, clk(3, 30, false)], hint: '短針指幾就是幾點，整點的時候長針指著 12！',
    ex: '3 點的時候，粉紅短針指著 3，黑色長針指著 12。', trap: '有一個時鐘是長針指 3、短針指 12，長短針看反了！還有一個長針指 6，是 3 點半。'
  }),
  () => ({
    q: '長針指著 6，短針在 10 和 11 的中間，是幾點？', sp: '長針指著6，短針在10和11的中間，是幾點？',
    vis: `<div class="clockwrap">${clockSVG(10, 30)}</div>`, keep: true,
    opts: [opT('10 點半', true, 28), opT('11 點半', false, 28), opT('6 點', false, 28)], hint: '短針剛走過的數字是幾點！',
    ex: '長針指著 6 是半點。短針剛走過 10、還沒到 11，所以是 10 點半。', trap: '短針已經靠近 11，但還沒走到 11，不是 11 點半；長針指 6 也不是 6 點。'
  }),
  () => ({
    q: '小明 7 點起床，<b>7 點半</b>吃早餐，8 點出門上學。哪一個時鐘是<b>吃早餐</b>的時間？', sp: '小明7點起床，7點半吃早餐，8點出門上學。哪一個時鐘是吃早餐的時間？',
    opts: [clk(7, 30, true), clk(7, 0, false), clk(8, 0, false)], hint: '吃早餐是幾點？找長針指著 6 的！',
    ex: '吃早餐是 7 點半：長針指著 6，短針在 7 和 8 的中間。', trap: '題目有三個時間，要找的是「吃早餐」的 7 點半，不是起床或上學的時間。'
  }),
  () => ({
    q: '早上的時間，哪一個<b>最早</b>？', sp: '早上的時間，哪一個最早？',
    opts: [clk(9, 0, false), clk(8, 30, true), clk(9, 30, false)], hint: '先看短針走到哪裡！',
    ex: '三個時鐘是 9 點、8 點半、9 點半。8 點半還沒到 9 點，最早。', trap: '8 點半的長針指著 6，看起來不像整點，但它比 9 點還早喔。'
  }),
  () => ({
    q: '時鐘現在是 5 點。長針轉到 <b>6</b> 的時候，是幾點？', sp: '時鐘現在是5點。長針轉到6的時候，是幾點？',
    vis: `<div class="clockwrap">${clockSVG(5, 0)}</div>`, keep: true,
    opts: [opT('5 點半', true, 28), opT('6 點', false, 28), opT('6 點半', false, 28)], hint: '長針指著 6 是半點，短針還在 5 和 6 的中間！',
    ex: '長針從 12 走到 6，就是半點。短針從 5 走到 5 和 6 的中間，所以是 5 點半。', trap: '長針指著 6 不是 6 點！看幾點要看短針，長針指 6 代表「半」。'
  })
];

['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'].forEach((id, k) => {
  const bank = [X1, X2, X3, X4, X5, X6, X7, X8, X9][k];
  LEVELS[id].push(st => {
    if (id === 'u7') st.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.pk'); if (t) { t.classList.toggle('marked'); sfx('tap'); } });
    xquiz(st, bank);
  });
});
const XBANK = { u1: X1, u2: X2, u3: X3, u4: X4, u5: X5, u6: X6, u7: X7, u8: X8, u9: X9 };
