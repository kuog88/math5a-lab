'use strict';
/* 第 4 單元 順序和多少 ／ 第 5 單元 數到 30 ／ 第 6 單元 加一加 */
const ANIMALS = ['🐶', '🐱', '🐰', '🐻', '🐼', '🐸', '🐷', '🐵'];

function queueHTML(list) { return `<div class="front">⬅ 前面</div><div class="queue">${list.map((a, i) => `<button type="button" class="q" data-i="${i}">${a}</button>`).join('')}</div>`; }

/* ===== 4-A 幾個和第幾個：圈出動物 ===== */
function u4A(st) {
  const plan = shuffle([2, 3, 4, 5, 6]).slice(0, 4).map((k, i) => ({ k, nth: i % 2 === 1 }));
  let r = 0;
  function round() {
    if (r >= plan.length) return api.finish();
    const { k, nth } = plan[r], list = shuffle(ANIMALS);
    const w = nth ? `第 ${k} 個` : `${k} 個`;
    api.say(`從前面數，把 <b class="big">${w}</b> 圈起來，再按「好了」。`, `從前面數，把${w}圈起來，再按好了。`);
    st.innerHTML = `${dots(r, plan.length)}${queueHTML(list)}<div class="center"><button class="btn mint" type="button">好了！</button></div>`;
    $$('.q', st).forEach(b => b.onclick = () => { b.classList.toggle('sel'); sfx('tap'); });
    $('.btn', st).onclick = () => {
      const sel = $$('.q', st).filter(b => b.classList.contains('sel')).map(b => +b.dataset.i).sort((a, b) => a - b);
      const want = nth ? [k - 1] : Array.from({ length: k }, (_, i) => i);
      if (sel.join() === want.join()) { api.ok(nth ? `對！第 ${k} 個只有一隻！` : `對！${k} 個是前面 ${k} 隻！`); r++; later(round, 1300); }
      else if (nth && sel.length === k) api.bad(`這是「${k} 個」。「第 ${k} 個」只要圈一隻喔！`);
      else if (!nth && sel.length === 1 && sel[0] === k - 1) api.bad(`這是「第 ${k} 個」。「${k} 個」要圈 ${k} 隻喔！`);
      else api.bad('從最前面開始，一個一個數數看！');
    };
  }
  round();
}

/* ===== 4-B 比多少：一個對一個 ===== */
function u4B(st) {
  const sets = [['🐰', '🥕', '兔子', '紅蘿蔔'], ['🐝', '🌼', '蜜蜂', '花'], ['🐵', '🍌', '猴子', '香蕉']];
  const rounds = [];
  sets.forEach(([ea, eb, na, nb], k) => {
    let a = rand(3, 8), b = rand(3, 8);
    if (k === 1) b = a; else while (a === b) b = rand(3, 8);
    const row = (e, n) => `<div class="row">${Array.from({ length: 8 }, (_, i) => `<span>${i < n ? e : ''}</span>`).join('')}</div>`;
    const vis = `<div>${row(ea, a)}${row(eb, b)}</div>`;
    rounds.push({
      q: `一個對一個，${na}和${nb}，哪一個比較多？`, vis, keep: true,
      opts: [{ h: `${ea} ${na}`, ok: a > b }, { h: `${eb} ${nb}`, ok: b > a }, { h: '🟰 一樣多', ok: a === b }],
      hint: '上下一個對一個，看誰有多出來的！'
    });
    if (a !== b) rounds.push({
      q: `${a > b ? na : nb}比${a > b ? nb : na}<b>多幾個</b>？`, vis,
      opts: numOpts(Math.abs(a - b), 1, 6), hint: '數一數沒有配對到的有幾個！',
      after: `${Math.max(a, b)} 比 ${Math.min(a, b)} 多 ${Math.abs(a - b)}`
    });
  });
  quiz(st, rounds);
}

/* ===== 4-C 順序挑戰：數的前後、大小、第幾個 ===== */
function u4C(st) {
  const rounds = [
    () => { const g = rand(2, 9); return { q: '數字排排站，空格裡是幾？', vis: lineAround(g), opts: numOpts(g, 0, 10), hint: '一個一個往後數！' }; },
    () => { const n = rand(1, 9); return { q: `比 ${n} 多 1 的數是幾？`, vis: `<span class="eq">${n}</span>`, opts: numOpts(n + 1, 0, 10), hint: '多 1 就是往後數一個！' }; },
    () => { const n = rand(1, 10); return { q: `比 ${n} 少 1 的數是幾？`, vis: `<span class="eq">${n}</span>`, opts: numOpts(n - 1, 0, 10), hint: '少 1 就是往前數一個！' }; },
    () => {
      let a = rand(0, 10), b = rand(0, 10); while (a === b) b = rand(0, 10);
      return { q: `${a} 和 ${b}，哪一個比較大？`, keep: true, opts: [{ h: N(a), ok: a > b }, { h: N(b), ok: b > a }], hint: '數數的時候，越後面數到的越大！' };
    },
    () => {
      const list = shuffle(ANIMALS).slice(0, 6), k = rand(2, 5);
      return { q: `從前面數，<b>第 ${k} 個</b>是誰？`, vis: `<div>${queueHTML(list)}</div>`, opts: list.map((a, i) => ({ h: a, ok: i === k - 1 })), keep: true, hint: '從左邊（前面）開始數！' };
    },
    () => {
      const list = shuffle(ANIMALS).slice(0, 6), k = rand(2, 4);
      return { q: `從<b>後面</b>數，第 ${k} 個是誰？`, vis: `<div>${queueHTML(list)}</div>`, opts: list.map((a, i) => ({ h: a, ok: i === list.length - k })), keep: true, hint: '後面是右邊喔！從右邊開始數。' };
    }
  ];
  function lineAround(g) { const s = Math.max(0, Math.min(5, g - rand(1, 4))); return `<span class="eq">${Array.from({ length: 6 }, (_, i) => s + i === g ? '<span class="box">?</span>' : s + i).join(' , ')}</span>`; }
  quiz(st, rounds);
}

/* ===== 5-A 十個一數：點星星放進十格框 ===== */
function u5A(st) {
  const ns = [rand(12, 19), rand(21, 29)];
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r], e = pick(['⭐', '🍬', '🐞']);
    let moved = 0;
    api.say(`東西太多了！點一下，把 ${e} 一個一個<b>放進十格框</b>。`, '東西太多了！點一下，把它們一個一個放進十格框。');
    st.innerHTML = `${dots(r, ns.length)}<div class="field" style="height:300px"></div><div class="frames">${'<div class="tf">' + '<i></i>'.repeat(10) + '</div>'}${'<div class="tf">' + '<i></i>'.repeat(10) + '</div>'}${'<div class="tf">' + '<i></i>'.repeat(10) + '</div>'}</div><div class="qvis"></div><div class="opts"></div>`;
    const f = $('.field', st), cells = $$('.tf i', st);
    scatter(n, 6, 5).forEach(([x, y]) => {
      const b = document.createElement('button'); b.className = 'thing'; b.type = 'button'; b.textContent = e;
      b.style.left = x + '%'; b.style.top = y + '%'; b.style.fontSize = '36px';
      b.onclick = () => {
        cells[moved].textContent = e; cells[moved].classList.add('on'); moved++; b.remove(); sfx('tap');
        if (moved % 10 === 0) { speak(`${moved / 10} 個十`); toast(`裝滿 ${moved / 10} 個十！`); }
        if (moved === n) later(ask, 800);
      };
      f.appendChild(b);
    });
    function ask() {
      f.style.display = 'none';
      const t = Math.floor(n / 10), o = n % 10;
      api.say(`有 ${t} 個十和 ${o} 個一，一共是多少？`);
      numOpts(n, 10, 30).forEach(op => $('.opts', st).appendChild(optBtn(op, () => {
        $('.qvis', st).innerHTML = `<div class="after">${t} 個十和 ${o} 個一是 ${n}</div>`; speak(`${t} 個十和 ${o} 個一是 ${n}`);
        r++; later(round, 2000);
      }, '十、二十… 先數十，再一個一個數！')));
    }
  }
  round();
}

/* 一捆十枝的吸管 SVG */
function sticks(t, o) {
  let s = '', x = 6;
  for (let k = 0; k < t; k++) {
    for (let i = 0; i < 10; i++) s += `<rect x="${x + i * 5}" y="6" width="4" height="88" rx="2" fill="#ff9a4d"/>`;
    s += `<rect x="${x - 3}" y="44" width="56" height="12" rx="4" fill="#5bb4ff"/>`;
    x += 66;
  }
  for (let k = 0; k < o; k++) { s += `<rect x="${x}" y="6" width="5" height="88" rx="2" fill="#ff9a4d"/>`; x += 14; }
  return `<svg viewBox="0 0 ${x + 6} 100" style="width:min(${(x + 6) * 2}px,92vw);height:auto">${s}</svg>`;
}

/* ===== 5-B 十和一：看吸管說數字 ===== */
function u5B(st) {
  const rounds = [0, 1, 2, 3, 4].map(k => () => {
    const t = rand(1, 2), o = rand(0, 9), n = t * 10 + o;
    if (k % 2 === 0) return { q: '一捆是 10 枝。一共有幾枝吸管？', vis: sticks(t, o), opts: numOpts(n, 10, 30), hint: '先數一捆一捆：十、二十，再數一枝一枝！', after: `${t} 個十和 ${o} 個一是 ${n}` };
    const opts = [[t, o], [o, t], [t, Math.min(9, o + 1 + rand(0, 1))]].map(([a, b]) => `${a} 個十和 ${b} 個一`);
    const uniq = [...new Set(opts)];
    while (uniq.length < 3) uniq.push(`${t} 個十和 ${(o + uniq.length + 2) % 10} 個一`);
    return { q: `<span class="big">${n}</span> 是幾個十和幾個一？`, sp: `${n} 是幾個十和幾個一？`, vis: '', opts: uniq.map(h => ({ h: `<span style="font-size:24px">${h}</span>`, ok: h === opts[0] })), hint: '左邊的數字是「十」，右邊的數字是「一」！' };
  });
  quiz(st, rounds);
}

/* ===== 5-C 數到 30 挑戰：順序與大小 ===== */
function u5C(st) {
  const rounds = [
    () => { const s = rand(10, 24), g = s + rand(1, 4); return { q: '空格裡是幾？', vis: `<span class="eq">${[0, 1, 2, 3, 4, 5].map(i => s + i === g ? '<span class="box">?</span>' : s + i).join(' , ')}</span>`, opts: numOpts(g, 10, 30), hint: '一個一個往後數！' }; },
    () => { const n = rand(10, 29); return { q: `比 ${n} 多 1 是幾？`, opts: numOpts(n + 1, 10, 30), hint: '往後數一個！' }; },
    () => { const s = rand(14, 30), g = s - rand(1, 3); return { q: '倒著數，空格裡是幾？', vis: `<span class="eq">${[0, 1, 2, 3, 4].map(i => s - i === g ? '<span class="box">?</span>' : s - i).join(' , ')}</span>`, opts: numOpts(g, 10, 30), hint: '倒著數是越來越小喔！' }; },
    () => { const x = 10 + rand(5, 9), y = 20 + rand(0, 4); return { q: `${x} 和 ${y}，哪一個比較大？`, keep: true, opts: shuffle([{ h: N(x), ok: x > y }, { h: N(y), ok: y > x }]), hint: '先比「十」的數字！' }; },
    () => { let a = rand(10, 30), b = rand(10, 30); while (a === b) b = rand(10, 30); return { q: `${a} 和 ${b}，哪一個比較小？`, keep: true, opts: [{ h: N(a), ok: a < b }, { h: N(b), ok: b < a }], hint: '先比「十」，十一樣再比「一」！' }; },
    () => { const n = rand(11, 30); return { q: `比 ${n} 少 1 是幾？`, opts: numOpts(n - 1, 10, 30), hint: '往前數一個！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 6-A 放進去：加一加 ===== */
function u6A(st) {
  let r = 0; const R = 3;
  function round() {
    if (r >= R) return api.finish();
    const a = rand(1, 6), b = rand(1, Math.min(4, 10 - a)), e = pick(['🍎', '🍊', '🥚', '🐟']);
    let inB = 0, asked = false;
    api.say(`籃子裡有 ${a} 個 ${e}，再<b>放進 ${b} 個</b>！把下面的 ${e} 拖進籃子（點一下也可以）。`, `籃子裡有 ${a} 個，再放進 ${b} 個！把下面的拖進籃子，點一下也可以。`);
    st.innerHTML = `${dots(r, R)}<div class="basket" data-label="🧺 籃子">${Array.from({ length: a }, () => `<div class="item">${e}</div>`).join('')}</div><div class="supply" style="margin-top:12px"></div><div class="qvis"></div><div class="opts"></div>`;
    const bas = $('.basket', st), sup = $('.supply', st);
    for (let i = 0; i < b; i++) {
      const it = document.createElement('div'); it.className = 'item'; it.textContent = e;
      draggable(it, [bas], hit => {
        if (!hit) return;
        bas.appendChild(it); it.dataset.lock = 1; it.style.filter = 'drop-shadow(0 0 6px #ffc93c)'; sfx('tap'); inB++;
        if (inB === b && !asked) { asked = true; later(ask, 500); }
      });
      sup.appendChild(it);
    }
    function ask() {
      sup.hidden = true;
      api.say(`${a} 個再放進 ${b} 個，現在一共有幾個？`);
      $('.qvis', st).innerHTML = `<span class="eq">${a} + ${b} = <span class="box">?</span></span>`;
      numOpts(a + b, 1, 10).forEach(o => $('.opts', st).appendChild(optBtn(o, () => {
        $('.box', st).textContent = a + b; speak(`${a} 加 ${b} 等於 ${a + b}`); r++; later(round, 1800);
      }, `從 ${a} 接著往後數 ${b} 個！`)));
    }
  }
  round();
}

/* ===== 6-B 看圖選算式 ===== */
function u6B(st) {
  const stories = [
    (a, b) => [`樹上有 ${a} 隻 🐦，又飛來 ${b} 隻。`, '🐦', '🐦', '隻'],
    (a, b) => [`池塘有 ${a} 隻 🦆，又游來 ${b} 隻。`, '🦆', '🦆', '隻'],
    (a, b) => [`左手 ${a} 顆 🍬，右手 ${b} 顆。`, '🍬', '🍬', '顆'],
    (a, b) => [`紅花 ${a} 朵 🌹，黃花 ${b} 朵 🌼。`, '🌹', '🌼', '朵'],
    (a, b) => [`公車上有 ${a} 人 🧒，又上車 ${b} 人。`, '🧒', '🧒', '人']
  ];
  const rounds = shuffle(stories).map(fn => () => {
    const a = rand(2, 6), b = rand(1, Math.min(4, 10 - a)), [txt, ea, eb, u] = fn(a, b), c = a + b;
    // 第 6 單元還沒教減號，錯的選項只用加法
    const wrong = [`${a} + ${b} = ${c + 1}`, `${a} + ${b} = ${c - 1}`, `${a + 1} + ${b} = ${c + 1}`];
    return {
      q: `${txt}<br>一共有幾${u}？選對的算式。`, sp: `${txt}一共有幾${u}？選對的算式。`,
      vis: `${pics(ea, a, true)}<span class="eq">+</span>${pics(eb, b, true)}`,
      opts: [{ h: `<span class="eq" style="font-size:30px">${a} + ${b} = ${c}</span>`, ok: true }, ...shuffle(wrong).slice(0, 2).map(w => ({ h: `<span class="eq" style="font-size:30px">${w}</span>`, ok: false }))],
      hint: '「又來了」、「一共」要用加法，再數數看答案對不對！'
    };
  });
  quiz(st, rounds);
}

/* ===== 6-C 加法快手 ===== */
function u6C(st) {
  const rounds = Array.from({ length: 8 }, (_, k) => () => {
    if (k >= 6) {
      const a = rand(1, 6), c = rand(a + 1, 10);
      return { q: '空格裡要填幾？', vis: `<span class="eq">${a} + <span class="box">?</span> = ${c}</span>`, opts: numpadOpts(c - a), pad: true, hint: `從 ${a} 往後數到 ${c}，數了幾下？` };
    }
    const a = rand(1, k < 2 ? 5 : 9), b = rand(1, 10 - a); // 課本：1 到 10 之數的加法，和在 10 以內
    return { q: `${a} + ${b} = ？`, vis: `<span class="eq">${a} + ${b} = <span class="box">?</span></span>`, opts: numpadOpts(a + b), pad: true, hint: `從 ${a} 往後數 ${b} 個！` };
  });
  quiz(st, rounds);
}

Object.assign(LEVELS, { u4: [u4A, u4B, u4C], u5: [u5A, u5B, u5C], u6: [u6A, u6B, u6C] });
