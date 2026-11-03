'use strict';
/* 三版本補充單元（2026-11）：康軒一下第 1 單元「50 以內的數」（康軒把 100 以內的數分成兩個單元：第 1 單元數到 50、第 6 單元數到 100）。
   南一第 1 單元、翰林第 4 單元直接數到 100（u1），康軒第 6 單元也用 u1。
   x1 每關 3 關：數棒排一排（50 以內）、2 個一數和 10 個一數、50 以內比大小和順序。 */

/* ===== 補 1-A 數棒排一排（50 以內） ===== */
function x1A(st) {
  const ns = [rand(11, 19), rand(21, 29), rand(31, 39), rand(41, 50)];
  let r = 0;
  function round() {
    if (r >= ns.length) return api.finish();
    const n = ns[r]; let t = 0, o = 0;
    curQ = { q: `用數棒排出 ${n}`, c: `${Math.floor(n / 10)} 捆 ${n % 10} 根` };
    api.say(`用數棒排出 <b class="big">${n}</b>，排好按「好了」。<br><small>一捆是 10 根喔！</small>`, `用數棒排出 ${n}，排好按好了。一捆是 10 根喔！`);
    st.innerHTML = `${dots(r, ns.length)}
      <div class="sticks"></div>
      <div class="readout"><span class="t">0</span> 捆 和 <span class="o">0</span> 根</div>
      <div class="row-btns">
        <button class="btn green" data-a="t+">＋ 一捆</button><button class="btn sun" data-a="o+">＋ 一根</button>
        <button class="btn ghost" data-a="t-">拿走一捆</button><button class="btn ghost" data-a="o-">拿走一根</button>
        <button class="btn wood" data-a="tie" hidden>🎀 10 根綁成一捆</button>
      </div>
      <div class="center"><button class="btn" data-a="ok">好了！</button></div>`;
    const draw = () => { $('.sticks', st).innerHTML = sticksHTML(t, o); $('.t', st).textContent = t; $('.o', st).textContent = o; $('[data-a="tie"]', st).hidden = o < 10; };
    $$('[data-a]', st).forEach(b => b.onclick = () => {
      const a = b.dataset.a; sfx('tap');
      if (a === 't+' && t < 5) t++;
      if (a === 'o+' && o < 19) o++;
      if (a === 't-' && t > 0) t--;
      if (a === 'o-' && o > 0) o--;
      if (a === 'tie') { o -= 10; t++; sfx('ok'); toast('10 根綁成 1 捆！'); }
      if (a === 'ok') {
        if (o >= 10) { toast('有 10 根以上，先綁成一捆吧！'); speak('有 10 根以上，先綁成一捆吧！'); return; }
        if (t * 10 + o === n) { api.ok(`${t} 個十和 ${o} 個一，就是 ${n}！`); speak(`${t} 個十和 ${o} 個一，就是 ${n}`); r++; later(round, 1800); return; }
        api.bad(`現在是 ${t * 10 + o} 喔！十位要 ${Math.floor(n / 10)}，個位要 ${n % 10}。`, `${t} 捆 ${o} 根（${t * 10 + o}）`, `${Math.floor(n / 10)} 捆 ${n % 10} 根（${n}）`);
      }
      draw();
    });
    draw();
  }
  round();
}

/* ===== 補 1-B 2 個一數、10 個一數 ===== */
const XPAIR = ['🧦', '👟', '🥢', '🧤'];
function x1B(st) {
  const pairQ = () => {
    const k = rand(6, 12), e = pick(XPAIR);
    return { q: `<b>2 個一數</b>，一共有幾個？`, sp: '2 個一數，一共有幾個？', vis: `<div class="xpairs">${Array.from({ length: k }, () => `<span>${e}${e}</span>`).join('')}</div>`,
      opts: mkOpts(2 * k, [2 * k - 1, 2 * k + 2, k]), hint: '2、4、6、8、10……一雙一雙數！', after: `${k} 雙，${Array.from({ length: k }, (_, i) => 2 * (i + 1)).join('、')}` };
  };
  const twoSeq = () => {
    const s = rand(1, 15) * 2 + pick([0, 1]), seq = [s, s + 2, s + 4, s + 6];
    return { q: '2 個一數，下一個是多少？', vis: `<div class="seq">${seq.map(v => `<span>${v}</span>`).join('')}<span class="q">？</span></div>`,
      opts: mkOpts(s + 8, [s + 7, s + 9, s + 10]), hint: '每次多 2 喔！', sp: `${seq.join('、')}，2 個一數，下一個是多少？` };
  };
  const tenSeq = () => {
    const s = rand(1, 9), seq = [s, s + 10, s + 20];
    return { q: '10 個一數，下一個是多少？', vis: `<div class="seq">${seq.map(v => `<span>${v}</span>`).join('')}<span class="q">？</span></div>`,
      opts: mkOpts(s + 30, [s + 21, s + 31, s + 40]), hint: '每次多 10，十位加 1，個位不變！', sp: `${seq.join('、')}，10 個一數，下一個是多少？` };
  };
  const bundleQ = () => {
    const t = rand(1, 4), o = rand(1, 9);
    return { q: `<b>${t}</b> 捆和 <b>${o}</b> 根，一共幾根？`, sp: `${t} 捆和 ${o} 根，一共幾根？`, vis: `<div class="sticks">${sticksHTML(t, o)}</div>`,
      opts: mkOpts(t * 10 + o, [o * 10 + t, t + o, t * 10 + o + 1].filter(v => v !== t * 10 + o)), hint: '一捆是 10 根，先 10 個一數，再一個一個數。' };
  };
  quiz(st, [pairQ, twoSeq, tenSeq, bundleQ, pairQ]);
}

/* ===== 補 1-C 50 以內比大小和順序 ===== */
function x1C(st) {
  const bigQ = () => {
    let a = rand(11, 50), b = rand(11, 50); while (a === b) b = rand(11, 50);
    if (Math.random() < 0.5 && a % 10 && a < 50) { const t = Math.floor(a / 10), o = a % 10; if (o * 10 + t <= 50 && o * 10 + t !== a) b = o * 10 + t; }
    const ask = pick(['大', '小']), ans = ask === '大' ? Math.max(a, b) : Math.min(a, b);
    return { q: `哪一個數<b>比較${ask}</b>？`, sp: `哪一個數比較${ask}？`, opts: mkOpts(ans, [ans === a ? b : a]), hint: '先比十位，十位一樣再比個位。' };
  };
  const nbQ = () => {
    const n = rand(12, 49), before = Math.random() < 0.5;
    return { q: `<b class="big">${n}</b> 的${before ? '前一個' : '後一個'}數是多少？`, sp: `${n} 的${before ? '前一個' : '後一個'}數是多少？`,
      opts: mkOpts(before ? n - 1 : n + 1, [before ? n + 1 : n - 1, before ? n - 10 : n + 10]), hint: before ? '前一個數是少 1。' : '後一個數是多 1。' };
  };
  const betweenQ = () => {
    const n = rand(12, 48);
    return { q: `${n - 1} 和 ${n + 1} 中間的數是多少？`, vis: `<div class="seq"><span>${n - 1}</span><span class="q">？</span><span>${n + 1}</span></div>`, opts: mkOpts(n, [n + 2, n - 2, n + 10].filter(v => v <= 50)), hint: '比前面多 1、比後面少 1。' };
  };
  const smallQ = () => {
    const s = new Set(); while (s.size < 4) s.add(rand(10, 50)); const v = [...s], mn = Math.min(...v);
    return { q: '下面哪一個數<b>最小</b>？', sp: '下面哪一個數最小？', opts: v.map(x => ({ h: N(x), ok: x === mn })), hint: '先找十位最小的。' };
  };
  const placeQ = () => {
    const n = rand(21, 49), t = Math.floor(n / 10), o = n % 10;
    return { q: `<b class="big">${n}</b> 是幾個十和幾個一？`, sp: `${n} 是幾個十和幾個一？`, opts: mkOpts(`${t} 個十和 ${o} 個一`, [`${o} 個十和 ${t} 個一`, `${t} 個十和 ${o + 1} 個一`].filter(x => x !== `${t} 個十和 ${o} 個一`)), hint: '左邊是十位，右邊是個位。' };
  };
  quiz(st, [bigQ, nbQ, betweenQ, smallQ, placeQ]);
}

document.head.insertAdjacentHTML('beforeend', `<style>
.xpairs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;font-size:30px;max-width:420px;margin:0 auto}
.xpairs span{background:#fff;border:2px dashed #c9b28f;border-radius:12px;padding:2px 6px}
</style>`);

Object.assign(LEVELS, { x1: [x1A, x1B, x1C] });
