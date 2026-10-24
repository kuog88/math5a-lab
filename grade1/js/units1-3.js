'use strict';
/* 第 1 單元 數到 10 ／ 第 2 單元 比長短 ／ 第 3 單元 分與合 */
const THINGS = ['🍎', '🐤', '🌸', '⭐', '🐟', '🚗', '🎈', '🍓', '🐞', '🍪'];

/* ===== 1-A 點點數數：一個一個點，數完選數字 ===== */
function u1A(st) {
  let r = 0; const R = 3, ns = shuffle([rand(3, 5), rand(6, 8), rand(9, 10)]);
  function round() {
    if (r >= R) return api.finish();
    const n = ns[r], e = pick(THINGS); let cnt = 0;
    api.say(`一個一個<b>點一下</b>，數數看有幾個 ${e}？`, '一個一個點一下，數數看有幾個？');
    st.innerHTML = `${dots(r, R)}<div class="field"></div><div class="readout">數到：<b class="cnt big">0</b></div><div class="opts" hidden></div>`;
    const f = $('.field', st);
    scatter(n).forEach(([x, y]) => {
      const b = document.createElement('button');
      b.className = 'thing'; b.type = 'button'; b.textContent = e; b.style.left = x + '%'; b.style.top = y + '%';
      b.onclick = () => {
        if (b.classList.contains('counted')) { toast('這個數過了喔！'); return; }
        cnt++; b.classList.add('counted'); b.dataset.n = cnt; sfx('tap'); speak(String(cnt));
        $('.cnt', st).textContent = cnt;
        if (cnt === n) later(ask, 700);
      };
      f.appendChild(b);
    });
    function ask() {
      api.say(`數完了！一共有幾個 ${e}？`, '數完了！一共有幾個？');
      const ops = $('.opts', st); ops.hidden = false;
      numOpts(n, 1, 10).forEach(o => ops.appendChild(optBtn(o, () => { r++; later(round, 1000); }, '最後數到的數字就是答案喔！')));
    }
  }
  round();
}

/* ===== 1-B 數字配對：數字 ↔ 數量，認識 0 ===== */
function u1B(st) {
  const ns = shuffle([rand(1, 4), rand(5, 7), rand(8, 10)]);
  const rounds = [
    () => plateRound(ns[0]),
    () => numRound(ns[1]),
    () => plateRound(0),
    () => numRound(ns[2]),
    () => numRound(0)
  ];
  function plate(n, e) { return `<span class="plate">${n ? pics(e, n, true) : '<span class="lbl">（空空的）</span>'}</span>`; }
  function plateRound(n) {
    const e = pick(THINGS), others = numOpts(n, 0, 10).map(o => o.ok ? n : +o.h.replace(/\D/g, ''));
    return {
      q: `哪一盤剛好有 <b class="big">${n}</b> 個？`, sp: `哪一盤剛好有 ${n} 個？`,
      vis: `<span class="num" style="font-size:80px">${n}</span>`,
      opts: others.map(v => ({ h: plate(v, e), ok: v === n })),
      hint: n === 0 ? '0 就是一個都沒有喔！' : '一個一個數數看！',
      after: n === 0 ? '一個都沒有，就是 0！' : ''
    };
  }
  function numRound(n) {
    const e = pick(THINGS);
    return {
      q: '盤子裡有幾個？點正確的數字。', vis: plate(n, e),
      opts: numOpts(n, 0, 10), hint: n === 0 ? '盤子空空的，一個都沒有喔！' : '一個一個數數看！'
    };
  }
  quiz(st, rounds);
}

/* ===== 1-C 拿出幾個：把剛好的數量放進籃子（含 0） ===== */
function u1C(st) {
  const ns = [rand(3, 6), rand(7, 10), 0, rand(1, 9)];
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r], e = pick(['🍓', '🍎', '🍊', '🥕', '🍪']);
    api.say(`拿出 <b class="big">${n}</b> 個 ${e} 放進籃子，再按「好了」。<br><small>（拖過去或點一下都可以，點籃子裡的可以拿出來）</small>`, `拿出 ${n} 個，放進籃子，再按好了。拖過去或點一下都可以，點籃子裡的可以拿出來。`);
    st.innerHTML = `${dots(r, ns.length)}<div class="supply"></div><div class="basket" data-label="🧺 籃子"></div><div class="center"><button class="btn mint" type="button">好了！</button></div>`;
    const sup = $('.supply', st), bas = $('.basket', st);
    for (let k = 0; k < 10; k++) {
      const it = document.createElement('div'); it.className = 'item'; it.textContent = e;
      draggable(it, [bas, sup], hit => {
        const inB = it.parentNode === bas;
        if (hit === 'tap') (inB ? sup : bas).appendChild(it);
        else if (hit) hit.appendChild(it);
        sfx('tap');
      });
      sup.appendChild(it);
    }
    $('.btn', st).onclick = () => {
      const c = $$('.item', bas).length;
      if (c === n) { api.ok(n === 0 ? '0 個就是一個都不拿！' : `答對了！${n} 個！`); r++; later(round, 1100); }
      else api.bad(c > n ? `太多了，籃子裡有 ${c} 個喔！` : `還不夠，籃子裡只有 ${c} 個喔！`);
    };
  }
  round();
}

/* ===== 2-A 對齊比長短：把鉛筆拖到起點，再點比較長的 ===== */
const PENCIL_C = ['#ff7eb3', '#5bb4ff', '#3fcf9c', '#ffc93c', '#a98bff', '#ff9a4d'];
const PENCIL_N = { '#ff7eb3': '粉紅', '#5bb4ff': '藍', '#3fcf9c': '綠', '#ffc93c': '黃', '#a98bff': '紫', '#ff9a4d': '橘' };
function u2A(st) {
  let r = 0; const R = 3;
  function round() {
    if (r >= R) return api.finish();
    const askLong = r !== 1;
    api.say('先把兩枝鉛筆都<b>拖到起點</b>排整齊！', '先把兩枝鉛筆都拖到起點排整齊！');
    st.innerHTML = `${dots(r, R)}<div class="track"><div class="startline"></div></div>`;
    const tr = $('.track', st), W = tr.clientWidth, LX = 20;
    $('.startline', tr).style.left = (LX - 6) + 'px';
    const cols = shuffle(PENCIL_C).slice(0, 2);
    const usable = W - LX - 50;
    let l1 = Math.round(usable * rand(45, 60) / 100), l2 = Math.round(usable * rand(70, 92) / 100);
    if (Math.random() < 0.5) [l1, l2] = [l2, l1];
    const lens = [l1, l2], longer = l1 > l2 ? 0 : 1;
    // 短的那枝放比較右邊，讓沒對齊時看起來比較長
    const pens = lens.map((len, k) => {
      const p = document.createElement('div'); p.className = 'pencil';
      p.style.width = len + 'px'; p.style.background = cols[k]; p.style.top = (50 + k * 100) + 'px';
      const start = k === longer ? LX + rand(30, 60) : Math.min(W - len - 40, LX + rand(90, 160));
      p.style.left = Math.max(LX + 20, start) + 'px';
      p.dataset.x = p.style.left.replace('px', '');
      tr.appendChild(p); return p;
    });
    let phase = 'align';
    pens.forEach((p, k) => {
      p.addEventListener('pointerdown', e => {
        if (phase === 'pick') { choose(k); return; }
        if (p.classList.contains('snap')) return;
        e.preventDefault(); try { p.setPointerCapture(e.pointerId); } catch (er) {}
        const sx = e.clientX, x0 = +p.dataset.x, len = lens[k];
        const mv = ev => { const x = Math.max(0, Math.min(W - len - 32, x0 + ev.clientX - sx)); p.style.left = x + 'px'; p.dataset.x = x; };
        const up = () => {
          p.removeEventListener('pointermove', mv); p.removeEventListener('pointerup', up); p.removeEventListener('pointercancel', up);
          if (Math.abs(+p.dataset.x - LX) < 28) { p.style.left = LX + 'px'; p.dataset.x = LX; p.classList.add('snap'); sfx('tap'); }
          if (pens.every(q => q.classList.contains('snap'))) {
            phase = 'pick';
            const w = askLong ? '長' : '短';
            api.say(`排好了！哪一枝比較<b class="big">${w}</b>？點那一枝鉛筆。`, `排好了！哪一枝比較${w}？點那一枝鉛筆。`);
          }
        };
        p.addEventListener('pointermove', mv); p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up);
      });
    });
    function choose(k) {
      const ans = askLong ? longer : 1 - longer;
      if (k === ans) {
        pens[k].classList.add('pick'); phase = 'done';
        api.ok(`對！${PENCIL_N[cols[k]]}色鉛筆比較${askLong ? '長' : '短'}！`); r++; later(round, 1300);
      } else api.bad('看看哪一枝的尾巴跑得比較遠？');
    }
  }
  round();
}

/* ===== 2-B 數格子：用一樣大的格子量長度 ===== */
function blocks(n, c) { return `<span class="blocks">${Array.from({ length: n }, () => `<i style="background:${c}"></i>`).join('')}</span>`; }
function u2B(st) {
  const pairs = [[rand(3, 5), rand(6, 8)], [rand(4, 8), 0], [rand(5, 9), rand(2, 4)]];
  pairs[1][1] = pairs[1][0]; // 一樣長
  const rounds = [];
  pairs.forEach(([a, b], k) => {
    const vis = `<div class="blockrow"><span class="lbl">紅</span>${blocks(a, '#ff7eb3')}</div><div class="blockrow"><span class="lbl">藍</span>${blocks(b, '#5bb4ff')}</div>`;
    if (k !== 1) rounds.push({ q: `紅色緞帶有幾格長？`, vis, opts: numOpts(a, 1, 10), hint: '一格一格數數看！' });
    rounds.push({
      q: '紅色和藍色，哪一條比較長？', vis, keep: true,
      opts: [{ h: '🟥 紅色', ok: a > b }, { h: '🟦 藍色', ok: b > a }, { h: '🟰 一樣長', ok: a === b }],
      hint: '數數看，誰的格子比較多？', after: a === b ? `都是 ${a} 格，一樣長！` : `${Math.max(a, b)} 格比 ${Math.min(a, b)} 格長！`
    });
  });
  // 直線和曲線：頭尾對齊，彎彎的拉直會比較長
  rounds.push({
    q: '兩條繩子的頭和尾都對齊了，哪一條比較長？',
    vis: `<svg viewBox="0 0 300 150" style="width:min(320px,86vw)"><line x1="30" y1="10" x2="30" y2="140" stroke="#b9a9c9" stroke-width="3" stroke-dasharray="6 5"/><line x1="270" y1="10" x2="270" y2="140" stroke="#b9a9c9" stroke-width="3" stroke-dasharray="6 5"/>
      <line x1="30" y1="40" x2="270" y2="40" stroke="#ff7eb3" stroke-width="9" stroke-linecap="round"/>
      <path d="M30,110 C60,70 80,70 110,110 S160,150 190,110 S240,70 270,110" fill="none" stroke="#5bb4ff" stroke-width="9" stroke-linecap="round"/></svg>`,
    keep: true,
    opts: [{ h: '🟥 直直的紅繩子', ok: false }, { h: '🟦 彎彎的藍繩子', ok: true }, { h: '🟰 一樣長', ok: false }],
    hint: '想想看，把彎彎的繩子拉直，會跑到哪裡？', after: '彎彎的繩子拉直以後，會比直直的長！'
  });
  quiz(st, rounds);
}

/* ===== 2-C 排排看：從最長點到最短 ===== */
function u2C(st) {
  let r = 0; const counts = [3, 4, 4];
  function round() {
    if (r >= counts.length) return api.finish();
    const n = counts[r], lens = shuffle([30, 45, 60, 75, 92].slice(5 - n)), cols = shuffle(PENCIL_C);
    const order = lens.map((l, i) => i).sort((x, y) => lens[y] - lens[x]);
    let step = 0;
    api.say('從<b>最長</b>的開始，一條一條點下去，排出 1、2、3…', '從最長的開始，一條一條點下去，排出 1、2、3。');
    st.innerHTML = `${dots(r, counts.length)}<div class="ribbons" style="padding-right:56px"></div>`;
    const box = $('.ribbons', st);
    lens.forEach((l, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ribbon';
      b.style.width = l + '%'; b.style.background = cols[i];
      b.onclick = () => {
        if (b.dataset.done) return;
        if (i === order[step]) {
          step++; b.dataset.done = 1; b.insertAdjacentHTML('beforeend', `<span class="tag">${step}</span>`); sfx('tap'); speak('第' + step);
          if (step === n) { api.ok('排好了，好厲害！'); r++; later(round, 1300); }
        } else api.bad('還有更長的喔！左邊都對齊了，看右邊的尾巴。');
      };
      box.appendChild(b);
    });
  }
  round();
}

/* ===== 3-A 分糖果：點糖果換盤子，分成兩份 ===== */
function u3A(st) {
  const totals = [rand(5, 6), rand(7, 8), rand(9, 10)];
  let r = 0;
  function round() {
    if (r >= totals.length) return api.finish();
    const n = totals[r], k = rand(1, n - 1), e = pick(['🍬', '🍭', '🧁', '🍩']);
    let asked = false;
    api.say(`${n} 個 ${e} 都在左邊盤子。點一點，讓<b>左邊剩下 <span class="big">${k}</span> 個</b>，其他放到右邊。`, `點一點，讓左邊剩下 ${k} 個，其他放到右邊`);
    st.innerHTML = `${dots(r, totals.length)}<div class="plates"><div class="basket" data-label="左邊盤子"></div><div class="basket" data-label="右邊盤子"></div></div><div class="center"><button class="btn mint" type="button">分好了！</button></div><div class="qvis"></div><div class="opts"></div>`;
    const [L, Rr] = $$('.basket', st);
    for (let i = 0; i < n; i++) {
      const it = document.createElement('div'); it.className = 'item'; it.textContent = e;
      draggable(it, [L, Rr], hit => {
        if (asked) return;
        if (hit === 'tap') (it.parentNode === L ? Rr : L).appendChild(it);
        else if (hit) hit.appendChild(it);
        sfx('tap');
      });
      L.appendChild(it);
    }
    $('.btn', st).onclick = () => {
      if (asked) return;
      const c = $$('.item', L).length;
      if (c !== k) { api.bad(`左邊現在有 ${c} 個，要剩下 ${k} 個喔！`); return; }
      asked = true; $('.btn', st).hidden = true;
      api.say(`${n} 可以分成 ${k} 和幾？`);
      $('.qvis', st).innerHTML = `<span class="eq">${n} 可以分成 ${k} 和 <span class="box">?</span></span>`;
      numOpts(n - k, 0, 10).forEach(o => $('.opts', st).appendChild(optBtn(o, () => {
        $('.box', st).textContent = n - k; speak(`${n} 可以分成 ${k} 和 ${n - k}`); r++; later(round, 1700);
      }, '數數看右邊盤子有幾個？')));
    };
  }
  round();
}

/* 分合圖 */
function tree(top, l, rr) {
  const t = v => v === '?' ? `<tspan fill="#e5508f">?</tspan>` : v;
  return `<svg viewBox="0 0 220 170" style="width:220px"><line x1="110" y1="40" x2="50" y2="125" stroke="#b9a9c9" stroke-width="5"/><line x1="110" y1="40" x2="170" y2="125" stroke="#b9a9c9" stroke-width="5"/>
  <circle cx="110" cy="40" r="34" fill="#fff4dc" stroke="#e6b45f" stroke-width="5"/><circle cx="50" cy="128" r="34" fill="#e2f3ff" stroke="#5bb4ff" stroke-width="5"/><circle cx="170" cy="128" r="34" fill="#e6fbf3" stroke="#3fcf9c" stroke-width="5"/>
  <text x="110" y="53" text-anchor="middle" font-size="38" font-weight="900" fill="#4a3b5c" font-family="Arial">${t(top)}</text>
  <text x="50" y="141" text-anchor="middle" font-size="38" font-weight="900" fill="#4a3b5c" font-family="Arial">${t(l)}</text>
  <text x="170" y="141" text-anchor="middle" font-size="38" font-weight="900" fill="#4a3b5c" font-family="Arial">${t(rr)}</text></svg>`;
}

/* ===== 3-B 合起來：看圖說出合起來和分開 ===== */
function u3B(st) {
  const rounds = [0, 1, 2, 3, 4].map(k => () => {
    const e = pick(['🐠', '🍓', '🐥', '🌼', '🍎']);
    if (k % 2 === 0) {
      const a = rand(1, 6), b = rand(1, 10 - a);
      return {
        q: `左邊 ${a} 個，右邊 ${b} 個，<b>合起來</b>是幾個？`,
        vis: `<span class="plate">${pics(e, a, true)}</span><span class="eq">和</span><span class="plate">${pics(e, b, true)}</span>`,
        opts: numOpts(a + b, 1, 10), hint: '把兩邊全部數一數！', after: `${a} 和 ${b} 合起來是 ${a + b}`
      };
    }
    const n = rand(4, 10), a = rand(1, n - 1);
    return {
      q: `${n} 個 ${e}，藏起來一些，看得到 ${a} 個。<b>藏起來幾個？</b>`,
      vis: `<span class="plate">${pics(e, a, true)}</span><span class="plate" style="font-size:60px">📦</span>${tree(n, a, '?')}`,
      opts: numOpts(n - a, 1, n), hint: `從 ${a} 接著往後數到 ${n}，數了幾下？`, after: `${n} 可以分成 ${a} 和 ${n - a}`
    };
  });
  quiz(st, rounds);
}

/* ===== 3-C 分合圖挑戰：用數字鍵盤填空 ===== */
function u3C(st) {
  const rounds = Array.from({ length: 6 }, (_, k) => () => {
    const n = rand(3, 10), a = rand(1, n - 1); // 課本分與合是分成兩份，不出 0
    if (k === 2 || k === 5) return {
      q: `${a} 和 ${n - a} 合起來是幾？`, vis: tree('?', a, n - a),
      opts: numpadOpts(n), pad: true, hint: '兩個數合起來，要變大喔！'
    };
    const left = Math.random() < 0.5;
    return {
      q: `${n} 可以分成 ${left ? '幾' : a} 和 ${left ? n - a : '幾'}？`, vis: left ? tree(n, '?', n - a) : tree(n, a, '?'),
      opts: numpadOpts(left ? a : n - a), pad: true, hint: '可以用手指頭幫忙數數看！'
    };
  });
  quiz(st, rounds);
}

Object.assign(LEVELS, { u1: [u1A, u1B, u1C], u2: [u2A, u2B, u2C], u3: [u3A, u3B, u3C] });
