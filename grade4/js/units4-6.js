'use strict';
/* 第 4 單元 除法 ／ 第 5 單元 三角形 ／ 第 6 單元 分數 */

/* ===== 除法直式：每一步自己想商，電腦幫忙乘和減 ===== */
function divHTML(a, b, qd, log, now) {
  const ds = String(a).split('');
  return `<div class="ldiv"><div class="lq"><span class="ldv"></span>${ds.map((_, i) => `<span>${qd[i] === undefined ? '' : qd[i] === '?' ? `<i class="vbox${now ? ' now' : ''}"></i>` : qd[i]}</span>`).join('')}</div>
    <div class="lrow"><span class="ldv">${b}</span><span class="lbr">)</span>${ds.map(d => `<span class="ld">${d}</span>`).join('')}</div></div>
    <div class="llog">${log.map(l => `<div>${l}</div>`).join('')}</div>`;
}
function divLevel(st, probs) {
  let r = 0;
  function round() {
    if (r >= probs.length) return api.finish();
    const [a, b] = probs[r], ds = String(a).split('').map(Number), qd = {}, log = [];
    let i = 0, cur = 0, started = false;
    st.innerHTML = `${dots(r, probs.length)}<div class="vwrap" id="vw"></div><div class="kwrap" id="kw"></div>`;
    const draw = now => { $('#vw', st).innerHTML = divHTML(a, b, qd, log, now); };
    function step() {
      if (i >= ds.length) {
        draw(false);
        const q = Math.floor(a / b), rm = a % b;
        api.ok(`${a} ÷ ${b} = ${q}${rm ? ` …… ${rm}` : ''}`); speak(`${a} 除以 ${b} 等於 ${q}${rm ? `，餘 ${rm}` : ''}`);
        r++; return later(round, 2600);
      }
      cur = cur * 10 + ds[i];
      if (!started && cur < b && i < ds.length - 1) { log.push(`${cur} 比 ${b} 小，不夠除，再多看一位。`); i++; return step(); }
      started = true;
      const q = Math.floor(cur / b), place = placeName(ds.length - 1 - i);
      qd[i] = '?'; draw(true);
      api.say(`${cur} ÷ ${b}，商的<b>${place}</b>是多少？`, `${cur} 除以 ${b}，商的${place}是多少？`);
      keypad($('#kw', st), q, () => {
        qd[i] = q; const left = cur - q * b;
        log.push(`${cur} − ${b} × ${q} = ${left}${i < ds.length - 1 ? `，帶下 ${ds[i + 1]} → ${left * 10 + ds[i + 1]}` : left ? `，餘數 ${left}` : '，除盡了'}`);
        cur = left; i++; draw(false); later(step, 800);
      }, q === 0 ? `${cur} 比 ${b} 小，商寫 0！` : `${b} × ${q} 最接近 ${cur} 又不超過喔！`);
    }
    step();
  }
  round();
}

/* ===== 4-A 除法直式一步步 ===== */
function u4A(st) {
  const p1b = rand(3, 7), p2b = rand(12, 24), p3b = rand(21, 48);
  divLevel(st, [
    [rand(1012, 9998), p1b],
    [p2b * rand(2, 3) + rand(0, p2b - 1), p2b],
    [p3b * rand(11, 19) + rand(0, p3b - 1), p3b],
    [rand(4, 9) * 1000 + rand(0, 9) * 10 + rand(0, 9), rand(4, 9)]
  ]);
}

/* ===== 4-B 除法想一想 ===== */
function u4B(st) {
  const rounds = [
    () => { const b = rand(12, 35), q = rand(12, 28), rm = rand(1, b - 1); return { q: `一個除法算式，除數 ${b}，商 ${q}，餘數 ${rm}，被除數是多少？`, vis: `<span class="eq sm"><span class="box">?</span> ÷ ${b} = ${q} …… ${rm}</span>`, ans: b * q + rm, hint: '驗算：除數 × 商 ＋ 餘數 ＝ 被除數', after: `${b} × ${q} + ${rm} = ${b * q + rm}` }; },
    () => { const b = rand(6, 15); return { q: `一個數除以 ${b}，餘數<b>可能</b>是多少？`, opts: shuffle([rand(1, b - 1), b, b + rand(1, 5)]).map(v => ({ h: N(v), ok: v < b })), hint: '餘數一定比除數小！' }; },
    () => { const b = rand(2, 9), q = rand(11, 32); return { q: `${b * q}0 ÷ ${b}0 = ？`, vis: `<span class="eq sm">${b * q}0 ÷ ${b}0 = ${b * q} ÷ ${b}</span>`, ans: q, hint: '被除數和除數同時去掉一個 0，商不變！', after: `${b * q} ÷ ${b} = ${q}` }; },
    () => { const b = pick([21, 31, 41, 32, 42]), q = rand(3, 8), a = b * q + rand(0, 5); const t = Math.floor(b / 10) * 10; return { q: `估商：${a} ÷ ${b}，商大約是多少？`, opts: shuffle([q - 1, q, q + 1]).map(v => ({ h: N(v), ok: v === Math.floor(a / b) })), hint: `把 ${b} 看成 ${t}，${a} 裡面有幾個 ${t}？`, after: `${b} × ${Math.floor(a / b)} = ${b * Math.floor(a / b)}` }; },
    () => { const b = rand(3, 8), q = rand(101, 199), rm = rand(1, b - 1), a = b * q + rm, w = q + pick([-10, 10]); return { q: `小華算 ${a} ÷ ${b} = ${w} …… ${rm}，對不對？`, keep: true, opts: [{ h: '對', ok: false }, { h: '不對', ok: true }], hint: `用驗算檢查：${b} × ${w} + ${rm} 是不是 ${a}？`, after: `正確答案：${q} …… ${rm}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 4-C 除法應用挑戰 ===== */
function u4C(st) {
  const rounds = [
    () => { const b = rand(4, 8), q = rand(120, 480); return { q: `${b * q} 張色紙平分給 ${b} 個班，每班分到幾張？`, vis: '<span style="font-size:56px">📄</span>', ans: q, unit: '張', hint: `${b * q} ÷ ${b}`, after: `${b * q} ÷ ${b} = ${q}（張）` }; },
    () => { const b = rand(12, 25), q = rand(11, 30), rm = rand(1, b - 1), a = b * q + rm; return { q: `${a} 顆糖果，每 ${b} 顆裝一袋，<b>最多</b>可以裝滿幾袋？`, vis: '<span style="font-size:56px">🍬</span>', ans: q, unit: '袋', hint: `${a} ÷ ${b}，剩下的不夠一袋！`, after: `${a} ÷ ${b} = ${q} …… ${rm}，最多 ${q} 袋` }; },
    () => { const b = rand(12, 25), q = rand(11, 30), rm = rand(1, b - 1), a = b * q + rm; return { q: `${a} 顆糖果，每 ${b} 顆裝一袋，裝完後剩下幾顆？`, vis: '<span style="font-size:56px">🍬</span>', ans: rm, unit: '顆', hint: '剩下的就是餘數！', after: `${a} ÷ ${b} = ${q} …… ${rm}` }; },
    () => { const b = rand(35, 45), q = rand(5, 9), rm = rand(1, 20), a = b * q + rm; return { q: `${a} 人去校外教學，每輛車坐 ${b} 人，<b>至少</b>要幾輛車？`, vis: '<span style="font-size:56px">🚌</span>', ans: q + 1, unit: '輛', hint: `${a} ÷ ${b} = ${q} …… ${rm}，剩下的人也要坐車！`, after: `${q} + 1 = ${q + 1}（輛）` }; },
    () => { const b = rand(12, 24), q = rand(15, 45); return { q: `${b} 個人合買一臺 ${b * q * 10} 元的投影機，每人出幾元？`, vis: '<span style="font-size:56px">📽️</span>', ans: q * 10, unit: '元', hint: `${b * q * 10} ÷ ${b}`, after: `${b * q * 10} ÷ ${b} = ${q * 10}（元）` }; }
  ];
  quiz(st, rounds);
}

/* ===== 5-A 三角形分類箱：把三角形拖到正確的箱子 ===== */
function u5A(st) {
  const sideRound = {
    say: '看邊長，把三角形拖進對的箱子！', bins: [['eq', '正三角形', '#ff7eb3'], ['iso', '等腰三角形', '#5bb4ff'], ['sca', '三邊都不一樣長', '#3fcf9c']],
    items: shuffle([
      ['eq', () => { const s = rand(3, 8); return { pts: TRI.eq(), sides: [s, s, s] }; }],
      ['eq', () => { const s = rand(3, 8); return { pts: TRI.eq(), sides: [s, s, s], fill: '#e2f3ff', stroke: '#5bb4ff' }; }],
      ['iso', () => { const a = rand(4, 6), b = a + 2; return { pts: triPts(a, b, b), sides: [a, b, b] }; }],
      ['iso', () => ({ pts: TRI.isoR(), sides: [5, '', 5], right: 0, fill: '#e6fbf3', stroke: '#3fcf9c' })],
      ['sca', () => ({ pts: triPts(7, 5, 4), sides: [7, 4, 5] })],
      ['sca', () => ({ pts: TRI.scaR(), sides: [6, '', 4], right: 0, fill: '#f6f2ff', stroke: '#a98bff' })]
    ]).map(([k, f]) => [k, f()]),
    hint: { eq: '三條邊一樣長是正三角形！', iso: '有兩條邊一樣長是等腰三角形！', sca: '三條邊都不一樣長！' }
  };
  const angRound = {
    say: '看角，把三角形拖進對的箱子！', bins: [['acute', '銳角三角形', '#ff9a4d'], ['right', '直角三角形', '#5bb4ff'], ['obt', '鈍角三角形', '#a98bff']],
    items: shuffle([
      ['acute', { pts: TRI.eq() }], ['acute', { pts: TRI.acute(), fill: '#e2f3ff', stroke: '#5bb4ff' }],
      ['right', { pts: TRI.isoR(), right: 0 }], ['right', { pts: TRI.scaR(), right: 0, fill: '#e6fbf3', stroke: '#3fcf9c' }],
      ['obt', { pts: TRI.obt() }], ['obt', { pts: TRI.isoO(), fill: '#f6f2ff', stroke: '#a98bff' }]
    ]),
    hint: { acute: '三個角都是銳角！', right: '有一個角是直角！', obt: '有一個角是鈍角（比直角大）！' }
  };
  const rounds = [sideRound, angRound];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r]; let left = R.items.length;
    api.say(R.say + (r === 0 ? '<br><small>（正三角形也是一種等腰三角形，這裡請放進「正三角形」）</small>' : ''), R.say);
    st.innerHTML = `${dots(r, rounds.length)}<div class="supply tris" id="sup">${R.items.map(([k, o], i) => `<button type="button" class="shape tshape" data-k="${k}" data-i="${i}">${triSVG(o.pts, { ...o, size: 118 })}</button>`).join('')}</div>
      <div class="bins">${R.bins.map(([k, t, c]) => `<div class="bin" data-k="${k}" style="--c:${c}"><h4>${t}</h4></div>`).join('')}</div>`;
    const bins = $$('.bin', st);
    $$('.tshape', st).forEach(el => draggable(el, bins, hit => {
      if (hit === 'tap') { toast('把它拖到下面的箱子裡！'); return; }
      if (!hit) return;
      if (hit.dataset.k === el.dataset.k) {
        sfx('pop'); el.dataset.lock = 1; el.classList.add('in'); hit.appendChild(el); left--;
        if (!left) { api.ok('全部分好了！'); r++; later(round, 1500); }
      } else api.bad('不對喔！' + R.hint[hit.dataset.k]);
    }));
  }
  round();
}

/* ===== 5-B 三角形的性質 ===== */
function u5B(st) {
  const rounds = [
    { q: '正三角形的三個角都是幾度？', vis: triSVG(TRI.eq(), { angs: ['?', '?', '?'] }), ans: 60, unit: '度', hint: '用量角器量量看，三個角一樣大！', after: '正三角形三個角都是 60°' },
    () => { const d = pick([40, 50, 65, 70, 75]); return { q: `等腰三角形的一個底角是 ${d}°，另一個底角是幾度？`, vis: triSVG(TRI.iso(), { angs: [d + '°', '?', ''] }), ans: d, unit: '度', hint: '等腰三角形的兩個底角一樣大！', after: `兩個底角都是 ${d}°` }; },
    () => { const s = rand(4, 12); return { q: `正三角形的一邊是 ${s} 公分，周長是幾公分？`, vis: triSVG(TRI.eq(), { sides: [s, '', ''] }), ans: s * 3, unit: '公分', hint: '三條邊一樣長！', after: `${s} × 3 = ${s * 3}（公分）` }; },
    () => { const a = rand(5, 9), b = a + rand(1, 4); return { q: `等腰三角形兩腰各 ${b} 公分，底邊 ${a} 公分，周長是幾公分？`, vis: triSVG(triPts(a, b, b), { sides: [a, b, b] }), ans: a + b * 2, unit: '公分', hint: '把三條邊加起來！', after: `${b} + ${b} + ${a} = ${a + b * 2}（公分）` }; },
    () => pick([
      { q: '有一個角是直角的三角形叫什麼？', keep: true, opts: [{ h: '直角三角形', ok: true }, { h: '鈍角三角形', ok: false }, { h: '正三角形', ok: false }] },
      { q: '有一個角是鈍角的三角形叫什麼？', keep: true, opts: [{ h: '鈍角三角形', ok: true }, { h: '直角三角形', ok: false }, { h: '銳角三角形', ok: false }] }
    ]),
    { q: '一個三角形，可以有兩個直角嗎？', keep: true, opts: [{ h: '可以', ok: false }, { h: '不可以', ok: true }], hint: '畫畫看，兩個直角的邊會平行，圍不起來！', after: '三角形最多只有一個直角或鈍角' }
  ];
  quiz(st, rounds);
}

/* ===== 5-C 全等三角形 ===== */
function u5C(st) {
  const base = () => { const a = rand(6, 8), b = rand(4, 6), c = rand(5, 7); return { a, b, c, pts: triPts(a, b, c) }; };
  const rot = pts => pts.map(([x, y]) => [-x, -y]); // 轉半圈
  const rounds = [
    () => { const t = base(), same = Math.random() < .5, k = same ? 1 : 2; return { q: '這兩個三角形全等嗎？', vis: `<div class="angs">${triSVG(t.pts, { sides: [t.a, t.c, t.b] })}${triSVG(rot(t.pts), { sides: [t.a * k, t.c * k, t.b * k], fill: '#e2f3ff', stroke: '#5bb4ff' })}</div>`, keep: true, opts: [{ h: '全等', ok: same }, { h: '不全等', ok: !same }], hint: '全等要形狀一樣、大小也一樣（邊長一樣長）！' }; },
    () => { const t = base(); return { q: `△ABC 和 △DEF 全等（A 對應 D、B 對應 E、C 對應 F），邊 EF 是幾公分？`, vis: `<div class="angs">${triSVG(t.pts, { sides: [t.a, t.c, t.b], verts: ['A', 'B', 'C'] })}${triSVG(rot(t.pts), { verts: ['D', 'E', 'F'], sides: ['', '?', ''], fill: '#e2f3ff', stroke: '#5bb4ff' })}</div>`, ans: t.c, unit: '公分', hint: 'EF 對應的是 BC！', after: `EF = BC = ${t.c} 公分` }; },
    () => { const t = base(), d = rand(5, 7) * 10; return { q: `△ABC 和 △DEF 全等，∠B 是 ${d}°，∠E 是幾度？`, vis: `<div class="angs">${triSVG(t.pts, { verts: ['A', 'B', 'C'], angs: ['', d + '°', ''] })}${triSVG(rot(t.pts), { verts: ['D', 'E', 'F'], angs: ['', '?', ''], fill: '#e2f3ff', stroke: '#5bb4ff' })}</div>`, ans: d, unit: '度', hint: '全等圖形的對應角一樣大！', after: `∠E = ∠B = ${d}°` }; },
    { q: '兩個全等的圖形，下面哪一個說法<b>正確</b>？', opts: [{ h: '<span class="small-opt">可以完全疊合</span>', ok: true }, { h: '<span class="small-opt">只要形狀一樣就好</span>', ok: false }, { h: '<span class="small-opt">只要周長一樣就好</span>', ok: false }], hint: '全等是疊起來完全重合！' },
    { q: '用尺和量角器畫三角形：知道兩條邊的長度和它們的夾角，可以畫出幾種不同的三角形？', vis: '<span style="font-size:56px">📏📐</span>', keep: true, opts: [{ h: '1 種', ok: true }, { h: '2 種', ok: false }, { h: '很多種', ok: false }], hint: '畫出來的三角形都可以疊在一起！', after: '畫出來的三角形都全等' }
  ];
  quiz(st, rounds);
}

/* ===== 6-A 分數條塗一塗 ===== */
function u6A(st) {
  const d1 = rand(3, 6), d2 = rand(3, 5), d3 = pick([4, 5, 6]), d4 = pick([3, 4]);
  const targets = [[rand(2, d1 - 1), d1], [d2 + rand(1, d2 - 1), d2], [d3 * 2 + rand(1, d3 - 1), d3], [d4 * 2, d4]];
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const [n, d] = targets[r], bars = Math.ceil(n / d) + (n % d === 0 ? 1 : 0), on = new Set();
    api.say(`每一條是 1 個整體，塗出 ${F(n, d)}`, `每一條是 1 個整體，塗出 ${fracText(n, d)}`);
    st.innerHTML = `${dots(r, targets.length)}<div class="fbars">${Array.from({ length: bars }, (_, b) => `<div class="fline"><span class="flabel">1</span>${fracBar(d, 0, 'play')}</div>`).join('')}</div>
      <div class="readout" id="ro"></div><div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    $$('.fbar', st).forEach((bar, b) => $$('i', bar).forEach((c, k) => {
      const id = b * d + k;
      c.onclick = () => { sfx('tap'); if (on.has(id)) on.delete(id); else on.add(id); c.classList.toggle('on'); $('#ro', st).innerHTML = `塗了 ${on.size} 個 ${F(1, d)}`; };
    }));
    $('#ro', st).innerHTML = `塗了 0 個 ${F(1, d)}`;
    $('#okb', st).onclick = () => {
      if (on.size !== n) return api.bad(`${fracText(n, d)}是 ${n} 個${fracText(1, d)}，現在塗了 ${on.size} 個！`);
      const w = Math.floor(n / d), m = n % d;
      const say = n < d ? `${fracText(n, d)}比 1 小，是真分數` : m ? `${fracText(n, d)}是假分數，等於 ${fracText(m, d, w)}` : `${fracText(n, d)}是假分數，等於 ${w}`;
      $('#ro', st).innerHTML = n < d ? `${F(n, d)} 是真分數` : `${F(n, d)} ＝ ${m ? F(m, d, w) : `<b class="big">${w}</b>`}`;
      api.ok('塗對了！'); speak(say); r++; later(round, 2600);
    };
  }
  round();
}

/* ===== 6-B 真分數、假分數、帶分數 ===== */
function u6B(st) {
  const kindQ = () => {
    const t = rand(0, 2), d = rand(3, 9);
    const [h, kind] = t === 0 ? [F(rand(1, d - 1), d), '真分數'] : t === 1 ? [F(d + rand(0, d), d), '假分數'] : [F(rand(1, d - 1), d, rand(1, 4)), '帶分數'];
    return { q: '這是哪一種分數？', vis: `<span class="eq">${h}</span>`, keep: true, opts: ['真分數', '假分數', '帶分數'].map(k => ({ h: k, ok: k === kind })), hint: '分子比分母小是真分數；分子等於或大於分母是假分數；整數和真分數合起來是帶分數。' };
  };
  const rounds = [
    kindQ, kindQ,
    () => { const d = rand(3, 8), w = rand(1, 3), m = rand(1, d - 1), n = w * d + m; return { q: `${fracText(n, d)}換成帶分數是多少？`, vis: `<span class="eq">${F(n, d)} ＝ ？</span>`, opts: [{ h: F(m, d, w), ok: true }, { h: F(m, d, w + 1), ok: false }, { h: w !== m ? F(w, d, m) : F(m, d, w - 1), ok: false }], hint: `${n} 裡面有幾個 ${d}？剩下幾個？`, after: `${n} ÷ ${d} = ${w} …… ${m}` }; },
    () => { const d = rand(3, 8), w = rand(1, 4), m = rand(1, d - 1); return { q: `${fracText(m, d, w)}換成假分數，分子是多少？`, vis: `<span class="eq">${F(m, d, w)} ＝ ${F('?', d)}</span>`, ans: w * d + m, hint: `1 = ${fracText(d, d)}，${w} 就是 ${w} 個 ${d}，再加 ${m}！`, after: `${d} × ${w} + ${m} = ${w * d + m}` }; },
    () => { const d = rand(3, 9), w = rand(2, 5); return { q: `${w} 是${d}分之幾？`, vis: `<span class="eq">${w} ＝ ${F('?', d)}</span>`, ans: w * d, hint: `1 = ${fracText(d, d)}，${w} 就是 ${w} 個 ${d}！`, after: `${w} = ${fracText(w * d, d)}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 6-C 分數數線挑戰 ===== */
function u6C(st) {
  const lineQ = () => {
    const d = pick([3, 4, 5]), hi = rand(2, 3), n = rand(1, hi * d - 1), w = Math.floor(n / d), m = n % d;
    const opts = [{ h: F(n, d), ok: true }, { h: F(n + 1, d), ok: false }, { h: F(n, d + 1), ok: false }];
    return { q: '箭頭指的地方是多少？（每 1 平分成同樣大的格子）', vis: `<div class="nlwrap">${numberLineSVG(0, hi, d, [{ v: n / d, t: '?' }])}</div>`, opts, hint: `0 到 1 分成 ${d} 格，每格是 ${fracText(1, d)}，數數有幾格！`, after: m && w ? `${fracText(n, d)} = ${fracText(m, d, w)}` : '' };
  };
  const rounds = [
    lineQ, lineQ,
    () => { const d = rand(4, 9), a = rand(d + 1, d * 2), b = a + pick([-2, -1, 1, 2]); return { q: `比一比：${fracText(a, d)} ○ ${fracText(b, d)}`, vis: `<span class="eq">${F(a, d)} <span class="box">?</span> ${F(b, d)}</span>`, keep: true, opts: [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }], hint: '分母一樣，分子大的比較大！' }; },
    () => { const d = rand(3, 6), w = 1, m = rand(1, d - 1), n = d + m + pick([-1, 1]); const cmp = n > d + m ? '＞' : '＜'; return { q: `比一比：${fracText(n, d)} ○ ${fracText(m, d, w)}`, vis: `<span class="eq">${F(n, d)} <span class="box">?</span> ${F(m, d, w)}</span>`, keep: true, opts: [{ h: '＞', ok: cmp === '＞' }, { h: '＝', ok: false }, { h: '＜', ok: cmp === '＜' }], hint: `先把 ${fracText(m, d, w)} 換成假分數再比！`, after: `${fracText(m, d, w)} = ${fracText(d + m, d)}` }; },
    () => { const d = pick([4, 5]), vals = shuffle([[rand(1, d - 1), d, 0], [rand(1, d - 1), d, 1], [d * 2 + rand(1, d - 1), d, 0]]); const v = x => x[2] + x[0] / x[1], mx = Math.max(...vals.map(v)); return { q: '哪一個數<b>最大</b>？', keep: true, opts: vals.map(x => ({ h: F(x[0], x[1], x[2]), ok: v(x) === mx })), hint: '想想看它們在數線上的位置！' }; }
  ];
  quiz(st, rounds);
}

Object.assign(LEVELS, { u4: [u4A, u4B, u4C], u5: [u5A, u5B, u5C], u6: [u6A, u6B, u6C] });
