'use strict';
/* 第 1 單元 200 以內的數 ／ 第 2 單元 二位數的加減法 ／ 第 3 單元 認識公分 */

const split3 = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
const hto = n => { const [h, t, o] = split3(n); return `${h} 個百、${t} 個十、${o} 個一`; };

/* ===== 1-A 積木排一排：用百格板、十條、小方塊拼出數字 ===== */
function u1A(st) {
  const targets = [rand(101, 129), rand(130, 169), rand(170, 199), rand(41, 99)];
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const n = targets[r]; let h = 0, t = 0, o = 0;
    api.say(`用積木拼出 <b class="big">${n}</b>，拼好按「好了」。`, `用積木拼出 ${n}，拼好按好了。`);
    st.innerHTML = `${dots(r, targets.length)}
      <div class="readout" id="hto"></div>
      <div class="bfield" id="bf"></div>
      <div class="bbtns">
        ${[[100, '百'], [10, '十'], [1, '一']].map(([v, w]) => `<div class="bcol"><button type="button" class="opt badd" data-v="${v}">${blockSVG(v)}<span>＋1 個${w}</span></button><button type="button" class="btn ghost bsub" data-v="${v}">拿走 1 個${w}</button></div>`).join('')}
      </div>
      <div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const draw = () => { $('#bf', st).innerHTML = blocksHTML(h, t, o) || ''; $('#hto', st).textContent = `${h} 個百、${t} 個十、${o} 個一`; };
    $$('.badd', st).forEach(b => b.onclick = () => {
      const v = +b.dataset.v; sfx('tap');
      if (v === 100) { if (h >= 2) return toast('這一關最多用 2 個百喔！'); h++; }
      if (v === 10) { t++; if (t === 10) { if (h >= 2) { t = 9; return toast('這一關最多到 200 喔！'); } t = 0; h++; toast('10 個十換成 1 個百！'); speak('10 個十換成 1 個百'); } }
      if (v === 1) { o++; if (o === 10) { o = 0; t++; toast('10 個一換成 1 個十！'); speak('10 個一換成 1 個十'); if (t === 10) { t = 0; h++; } } }
      draw();
    });
    $$('.bsub', st).forEach(b => b.onclick = () => { const v = +b.dataset.v; if (v === 100 && h) h--; if (v === 10 && t) t--; if (v === 1 && o) o--; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const v = h * 100 + t * 10 + o;
      if (v === n) { api.ok(`對！${n} 是 ${hto(n)}`); speak(`${n} 是 ${hto(n)}`); r++; later(round, 2200); }
      else api.bad(v > n ? `現在是 ${v}，太多了！` : `現在是 ${v}，還不夠喔！`);
    };
    draw();
  }
  round();
}

/* ===== 1-B 幾個百十一與付錢 ===== */
function u1B(st) {
  const rounds = [
    () => { const n = rand(102, 199), [h, t, o] = split3(n); return { q: '積木一共是多少？', vis: blocksHTML(h, t, o), ans: n, hint: '先數百、再數十、最後數一！', after: `${hto(n)}是 ${n}` }; },
    () => {
      const n = rand(111, 198), [h, t, o] = split3(n);
      const fmt = (a, b, c) => `${a} 個百、${b} 個十、${c} 個一`;
      const wrong = [fmt(h, o, t), fmt(t, h, o), fmt(h, (t + 1) % 10, o), fmt(h, t, (o + 1) % 10)];
      return { q: `<span class="big">${n}</span> 是幾個百、幾個十、幾個一？`, sp: `${n} 是幾個百、幾個十、幾個一？`, opts: [hto(n), ...wrong].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).map((h2, i) => ({ h: `<span style="font-size:22px">${h2}</span>`, ok: i === 0 })), hint: '百位、十位、個位，從左邊數過來！' };
    },
    () => { const list = shuffle([100, 50, 10, 10, 5, 1, 1].slice(0, rand(4, 7))).sort((a, b) => b - a); const s = list.reduce((a, b) => a + b, 0); return { q: '錢包裡一共有多少元？', vis: coinsHTML(list), ans: s, unit: '元', hint: '從大的錢開始，一個一個加起來！', after: `一共是 ${s} 元` }; },
    { q: '1 張 100 元可以換幾個 10 元？', vis: coinsHTML([100]) + '<span class="eq">＝ ？個</span>' + coinsHTML([10]), ans: 10, unit: '個', hint: '10、20、30……數到 100 要幾個 10 元？', after: '10 個 10 元是 100 元' },
    () => {
      const price = pick([6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17]) * 10 + pick([0, 5]);
      const t = Math.floor((price % 100) / 10), f = price % 10;
      const right = [100, ...Array(t).fill(10), ...(f ? [5] : [])].slice(price >= 100 ? 0 : 1);
      return { q: `玩具 <b>${price} 元</b>，要怎麼付剛好？`, sp: `玩具 ${price} 元，要怎麼付剛好？`, vis: `<span style="font-size:60px">🧸</span>`, opts: [
        { h: coinsHTML(right), ok: true },
        { h: coinsHTML(price >= 100 ? [100, ...Array(Math.max(0, t - 1)).fill(10), ...(f ? [5] : [])] : [...Array(t + 1).fill(10)]), ok: false },
        { h: coinsHTML([...(price >= 100 ? [50, 10, 10, 10] : [50]), ...Array(t).fill(10)].slice(0, 7)), ok: false }
      ], hint: '把錢加起來，看看是不是剛好！' };
    }
  ];
  quiz(st, rounds);
}

/* ===== 1-C 比大小挑戰：＞、＜、＝ 和數的順序 ===== */
function u1C(st) {
  const cmp = (a, b) => ({
    q: `${a} ○ ${b}，圈圈裡要放什麼？`, vis: `<span class="eq">${a} <span class="box">?</span> ${b}</span>`, keep: true,
    opts: [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }], hint: '開口朝向比較大的數！', after: `${a} ${a > b ? '＞' : a < b ? '＜' : '＝'} ${b}`
  });
  const rounds = [
    () => { const a = rand(100, 199); let b = a + pick([-10, -1, 1, 10, 9]); if (b > 200) b = a - 1; return cmp(a, b); },
    () => { const a = rand(30, 99), b = rand(101, 199); return Math.random() < .5 ? cmp(a, b) : cmp(b, a); },
    () => { const n = rand(102, 189), m = n + pick([-10, 0, 1, 10]); return { q: `甲是 ${n}，乙是 ${hto(m)}，哪一個比較大？`, keep: true, opts: [{ h: '甲', ok: n > m }, { h: '乙', ok: m > n }, { h: '一樣大', ok: n === m }], hint: '先把乙說成數字，再比比看！', after: `乙是 ${m}` }; },
    () => { const s = rand(100, 155), g = rand(1, 4); return { q: '10 個 10 個數，空格裡是多少？', vis: `<span class="eq">${[0, 1, 2, 3, 4].map(k => k === g ? '<span class="box">?</span>' : s + k * 10).join(' , ')}</span>`, ans: s + g * 10, hint: '每次多 10，十位加 1！' }; },
    () => { const s = rand(120, 200), g = rand(1, 4); return { q: '倒著數，空格裡是多少？', vis: `<span class="eq">${[0, 1, 2, 3, 4].map(k => k === g ? '<span class="box">?</span>' : s - k).join(' , ')}</span>`, ans: s - g, hint: '倒著數，每次少 1！' }; },
    () => { const ns = shuffle([rand(100, 129), rand(130, 159), rand(160, 199)]); const mx = Math.max(...ns); return { q: '哪一個數<b>最大</b>？', keep: true, opts: ns.map(v => ({ h: N(v), ok: v === mx })), hint: '百位一樣，就比十位！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 直式填一填（加法、減法共用）：從個位開始一格一格填 ===== */
function vertLevel(st, probs, op) {
  let r = 0;
  function round() {
    if (r >= probs.length) return api.finish();
    const [a, b] = probs[r], res = op === '+' ? a + b : a - b;
    const digits = String(res).split('').map(Number), w = Math.max(String(a).length, digits.length);
    const needCarry = op === '+' && (a % 10) + (b % 10) >= 10, needBorrow = op === '−' && (a % 10) < (b % 10);
    const filled = Array(w).fill('_'); let pos = w - 1, flag = {};
    if (w > digits.length) filled.fill('', 0, w - digits.length);
    st.innerHTML = `${dots(r, probs.length)}<div class="vwrap" id="vw"></div><div class="kwrap" id="kw"></div>`;
    const draw = () => { const f = filled.slice(); if (pos >= 0) f[pos] = '?'; $('#vw', st).innerHTML = vertHTML(a, b, op, f, flag); };
    const place = ['個位', '十位', '百位'];
    function step() {
      const k = w - 1 - pos, d = +String(res).padStart(w, '0')[pos];
      if (pos < w - digits.length || pos < 0) { draw(); api.ok(`${a} ${op} ${b} = ${res}`); speak(`${a} ${op} ${b} = ${res}`); r++; return later(round, 2200); }
      let msg = `${a} ${op} ${b}，先算<b>${place[k]}</b>，填多少？`;
      if (k === 0 && needBorrow) { flag.borrow = true; msg = `個位不夠減，向十位借 1 個十。個位現在是 ${10 + a % 10} − ${b % 10}，填多少？`; }
      else if (k === 0) msg = `先算<b>個位</b>：${a % 10} ${op} ${b % 10}，填多少？`;
      else if (k === 1 && op === '+') msg = `再算<b>十位</b>：${Math.floor(a / 10) % 10} + ${Math.floor(b / 10) % 10}${needCarry ? ' + 進位的 1' : ''}，十位填多少？`;
      else if (k === 1) msg = `再算<b>十位</b>：${Math.floor(a / 10) % 10 - (needBorrow ? 1 : 0)} − ${Math.floor(b / 10) % 10}，填多少？`;
      else msg = '十位滿十，進到<b>百位</b>，百位填多少？';
      draw(); api.say(msg);
      keypad($('#kw', st), d, () => {
        filled[pos] = String(d); pos--;
        if (k === 0 && needCarry) { flag.carry = true; toast('個位滿十，進 1 到十位！'); speak('個位滿十，進 1 到十位'); }
        later(step, 900);
      }, k === 0 && needCarry ? '加起來超過 10，只寫個位的數字，1 個十要進位！' : needBorrow && k === 1 ? '十位已經借走 1 了，要先減 1 喔！' : '再算一次看看！');
    }
    step();
  }
  round();
}

/* ===== 2-A 加法直式 ===== */
function u2A(st) {
  const p1 = [rand(2, 5) * 10 + rand(1, 4), rand(1, 4) * 10 + rand(1, 5)];
  const p2 = [rand(2, 5) * 10 + rand(5, 9), rand(1, 3) * 10 + rand(5, 9)];
  const at = rand(6, 8), p3 = [at * 10 + rand(0, 4), rand(10 - at, 6) * 10 + rand(0, 5)];
  vertLevel(st, [p1, p2, p3], '+');
}

/* ===== 2-B 減法直式 ===== */
function u2B(st) {
  const p1 = [rand(5, 9) * 10 + rand(5, 9), rand(1, 4) * 10 + rand(1, 5)];
  const p2 = [rand(5, 9) * 10 + rand(0, 4), rand(1, 4) * 10 + rand(5, 9)];
  const p3 = [rand(6, 9) * 10, rand(2, 5) * 10 + rand(1, 9)];
  vertLevel(st, [p1, p2, p3], '−');
}

/* ===== 2-C 加減挑戰：＞＜＝ 與生活問題 ===== */
function u2C(st) {
  const rounds = [
    () => { const a = rand(25, 59), b = rand(15, 39), c = a + b + pick([-3, 0, 4]); return { q: `${a} + ${b} ○ ${c}`, vis: `<span class="eq">${a} + ${b} <span class="box">?</span> ${c}</span>`, keep: true, opts: [{ h: '＞', ok: a + b > c }, { h: '＝', ok: a + b === c }, { h: '＜', ok: a + b < c }], hint: `先算 ${a} + ${b} 是多少！`, after: `${a} + ${b} = ${a + b}` }; },
    () => { const a = rand(61, 95), b = rand(18, 45), c = a - b + pick([-2, 0, 3]); return { q: `${a} − ${b} ○ ${c}`, vis: `<span class="eq">${a} − ${b} <span class="box">?</span> ${c}</span>`, keep: true, opts: [{ h: '＞', ok: a - b > c }, { h: '＝', ok: a - b === c }, { h: '＜', ok: a - b < c }], hint: `先算 ${a} − ${b} 是多少！`, after: `${a} − ${b} = ${a - b}` }; },
    () => { const a = rand(38, 67), b = rand(25, 48); return { q: `二年甲班有 ${a} 本故事書，又買了 ${b} 本，現在有幾本？`, vis: '<span style="font-size:56px">📚</span>', ans: a + b, unit: '本', hint: '又買了，是變多，用加法！', after: `${a} + ${b} = ${a + b}（本）` }; },
    () => { const a = rand(52, 93), b = rand(17, 39); return { q: `小美有 ${a} 張貼紙，送給妹妹 ${b} 張，還剩幾張？`, vis: '<span style="font-size:56px">⭐</span>', ans: a - b, unit: '張', hint: '送出去會變少，用減法！', after: `${a} − ${b} = ${a - b}（張）` }; },
    () => { const a = rand(55, 89), b = rand(26, 49); return { q: `哥哥跳繩 ${a} 下，弟弟跳 ${b} 下，哥哥比弟弟多跳幾下？`, vis: '<span style="font-size:56px">🪢</span>', ans: a - b, unit: '下', hint: '比多少，用大的減小的！', after: `${a} − ${b} = ${a - b}（下）` }; }
  ];
  quiz(st, rounds);
}

/* ===== 3-A 畫一畫：沿著尺畫出指定長度 ===== */
function u3A(st) {
  const lens = shuffle([4, 6, 7, 9, 11]).slice(0, 3);
  let r = 0;
  function round() {
    if (r >= lens.length) return api.finish();
    const want = lens[r], L = 12; let cur = 1;
    api.say(`從 0 開始，拖動尺上方的彩帶，畫出 <b class="big">${want} 公分</b>。`, `從 0 開始，拖動彩帶，畫出 ${want} 公分。`);
    st.innerHTML = `${dots(r, lens.length)}<div class="readout" id="rd"></div><div class="rwrap" id="rw">${rulerSVG(L, [{ from: 0, len: 1, c: '#a98bff' }])}</div><div class="center"><button class="btn mint" id="okb" type="button">畫好了！</button></div>`;
    const svg = $('svg', st), bar = $('rect', svg);
    const set = v => { cur = Math.max(1, Math.min(L, v)); bar.setAttribute('width', cur * CM); $('#rd', st).textContent = `現在是 ${cur} 公分`; };
    const fromEvent = e => { const b = svg.getBoundingClientRect(), x = (e.clientX - b.left) * (svg.viewBox.baseVal.width / b.width); set(Math.round((x - 20) / CM)); };
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', e => { e.preventDefault(); try { svg.setPointerCapture(e.pointerId); } catch (er) {} fromEvent(e); const mv = ev => fromEvent(ev); const up = () => { svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); sfx('tap'); }; svg.addEventListener('pointermove', mv); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up); });
    set(1);
    $('#okb', st).onclick = () => {
      if (cur === want) { api.ok(`對！${want} 公分就是 ${want} 個 1 公分！`); r++; later(round, 1600); }
      else api.bad(cur > want ? '太長了！看看尺上的數字。' : '太短了！看看尺上的數字。');
    };
  }
  round();
}

/* ===== 3-B 量長度：個別單位、從 0 量、不從 0 量 ===== */
function u3B(st) {
  const rounds = [
    () => { const a = rand(5, 8), b = a + rand(2, 3); return { q: `用迴紋針量鉛筆是 ${a} 個；用橡皮擦量蠟筆是 ${b} 個。可以直接說蠟筆比較長嗎？`, vis: `<span style="font-size:44px">📎×${a}　🧽×${b}</span>`, keep: true, opts: [{ h: '可以', ok: false }, { h: '不可以', ok: true }], hint: '迴紋針和橡皮擦一樣長嗎？單位不一樣，不能直接比！', after: '要用一樣的單位量，才能比長短' }; },
    () => { const n = rand(3, 10); return { q: '彩帶從 0 開始量，有幾公分？', vis: rulerSVG(11, [{ from: 0, len: n, c: '#3fcf9c' }]), ans: n, unit: '公分', hint: '從 0 開始，看彩帶的尾巴對到幾！', after: `${n} 公分` }; },
    () => { const s = rand(2, 4), n = rand(3, 7); return { q: `這條彩帶<b>沒有</b>從 0 開始，有幾公分？`, sp: '這條彩帶沒有從 0 開始，有幾公分？', vis: rulerSVG(12, [{ from: s, len: n, c: '#ff7eb3' }]), ans: n, unit: '公分', hint: `從 ${s} 數到 ${s + n}，數數看中間有幾個 1 公分！`, after: `${s + n} − ${s} = ${n}（公分）` }; },
    { q: '量長度的時候，下面哪一種方法是對的？', vis: '', opts: [{ h: '<span style="font-size:22px">東西的一端對齊 0</span>', ok: true }, { h: '<span style="font-size:22px">東西的一端對齊 1</span>', ok: false }, { h: '<span style="font-size:22px">隨便放都可以</span>', ok: false }], hint: '從 0 開始量最方便喔！' },
    () => { const a = rand(6, 12), b = rand(6, 12); return { q: `紅彩帶 ${a} 公分，藍彩帶 ${b} 公分，哪一條比較長？`, keep: true, opts: [{ h: '🟥 紅彩帶', ok: a > b }, { h: '🟦 藍彩帶', ok: b > a }, { h: '一樣長', ok: a === b }], hint: '公分數越大越長！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 3-C 長度的加減 ===== */
function u3C(st) {
  const rounds = [
    () => { const a = rand(5, 9), b = rand(3, 8); return { q: `把 ${a} 公分和 ${b} 公分的紙條接起來（沒有重疊），一共幾公分？`, vis: rulerSVG(a + b + 1, [{ from: 0, len: a, c: '#ffc93c' }, { from: a, len: b, c: '#5bb4ff' }]), ans: a + b, unit: '公分', hint: '接起來是合在一起，用加法！', after: `${a} + ${b} = ${a + b}（公分）` }; },
    () => { const a = rand(10, 14), b = rand(3, 6); return { q: `一條 ${a} 公分的緞帶，剪掉 ${b} 公分，還剩幾公分？`, vis: '<span style="font-size:56px">🎀✂️</span>', ans: a - b, unit: '公分', hint: '剪掉會變短，用減法！', after: `${a} − ${b} = ${a - b}（公分）` }; },
    () => { const a = rand(12, 18), b = rand(6, 11); return { q: `鉛筆長 ${a} 公分，蠟筆長 ${b} 公分，鉛筆比蠟筆長幾公分？`, vis: '<span style="font-size:56px">✏️🖍️</span>', ans: a - b, unit: '公分', hint: '比長多少，用大的減小的！', after: `${a} − ${b} = ${a - b}（公分）` }; },
    () => { const a = rand(23, 45), b = rand(14, 30); return { q: `小明量窗戶，先量到 ${a} 公分，再往上量 ${b} 公分，窗戶一共有幾公分高？`, vis: '<span style="font-size:56px">📏</span>', ans: a + b, unit: '公分', hint: '兩段接起來，用加法！', after: `${a} + ${b} = ${a + b}（公分）` }; },
    () => { const e = rand(6, 9); return { q: `小華估計書桌上的橡皮擦大約長幾公分？`, vis: '<span style="font-size:56px">🧽</span>', keep: true, opts: [{ h: '約 1 公分', ok: false }, { h: `約 ${e} 公分`, ok: true }, { h: '約 100 公分', ok: false }], hint: '想想看，橡皮擦大概有幾根手指寬？' }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u1: [u1A, u1B, u1C], u2: [u2A, u2B, u2C], u3: [u3A, u3B, u3C] });
