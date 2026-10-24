'use strict';
/* 第 1 單元 數到 10000 ／ 第 2 單元 四位數的加減 ／ 第 3 單元 乘法 */

const cmpQ = (a, b, sa = a, sb = b) => ({
  q: `${sa} ○ ${sb}，圈圈裡要放什麼？`, vis: `<span class="eq sm">${sa} <span class="box">?</span> ${sb}</span>`, keep: true,
  opts: [{ h: '＞', ok: a > b }, { h: '＝', ok: a === b }, { h: '＜', ok: a < b }], hint: '位數一樣，就從千位開始比！', after: `${sa} ${a > b ? '＞' : a < b ? '＜' : '＝'} ${sb}`
});
/* 隨機的四位數，有些位是 0 */
function num4(zeroP = 0.3) {
  let s = String(rand(1, 9));
  for (let i = 1; i < 4; i++) s += Math.random() < zeroP ? '0' : String(rand(1, 9));
  return +s;
}
/* 一位數的按鈕（0~9），答對呼叫 onRight */
function digitPad(box, d, onRight, hint) {
  box.className = 'numpad'; box.innerHTML = '';
  numpadOpts(d, 0, 9).forEach(o => box.appendChild(optBtn(o, onRight, hint)));
}

/* ===== 1-A 位值積木撥一撥 ===== */
function u1A(st) {
  const targets = [num4(0.2), num4(0.4), num4(0.5), num4(0.4)];
  let r = 0;
  function round() {
    if (r >= targets.length) return api.finish();
    const n = targets[r], dg = [0, 0, 0, 0];
    const byName = r % 2 === 1;
    const ask = byName ? `${digitsOf(n).map((d, i) => `${d} 個${PL[i]}`).join('、')}` : numCN(n);
    api.say(byName ? `撥出：<b>${ask}</b> 合起來的數` : `在位值表撥出：<b class="big">${ask}</b>`, byName ? `撥出 ${ask} 合起來的數` : `在位值表撥出 ${ask}`);
    st.innerHTML = `${dots(r, targets.length)}
      <div class="pc-wrap"><table class="pchart play"><tr>${PL.map(p => `<th>${p}位</th>`).join('')}</tr>
      <tr>${PL.map((_, i) => `<td><button type="button" class="pcb up" data-i="${i}">▲</button><div class="pcd" id="d${i}">0</div><button type="button" class="pcb dn" data-i="${i}">▼</button></td>`).join('')}</tr></table></div>
      <div id="blk" class="blkbox"></div>
      <div class="readout" id="ro"></div>
      <div class="center"><button class="btn mint" id="okb" type="button">好了！</button></div>`;
    const val = () => +dg.join('');
    const draw = () => {
      dg.forEach((d, i) => $('#d' + i, st).textContent = d);
      $('#blk', st).innerHTML = blocksHTML(...dg);
      $('#ro', st).innerHTML = `寫成數字：<b>${val()}</b>`;
    };
    $$('.pcb', st).forEach(b => b.onclick = () => { const i = +b.dataset.i; dg[i] = (dg[i] + (b.classList.contains('up') ? 1 : 9)) % 10; sfx('tap'); draw(); });
    $('#okb', st).onclick = () => {
      const v = val();
      if (v === n) { api.ok(`對！${n}`); speak(`答對了，${numCN(n)}`); r++; later(round, 1900); }
      else {
        const a = digitsOf(n), b = digitsOf(v), k = a.findIndex((c, i) => c !== b[i]);
        api.bad(`${PL[k]}位不對喔！`); speak(`${PL[k]}位不對喔，${byName ? ask : numCN(n)}`);
      }
    };
    draw();
  }
  round();
}

/* ===== 1-B 讀數、寫數與位值 ===== */
function u1B(st) {
  const rounds = [
    () => {
      const n = num4(0.45), s = String(n);
      const c = [s[0] + s[2] + s[1] + s[3], s[0] + s[1] + s[3] + s[2], s.slice(0, 3) + '0', s[0] + '0' + s.slice(1, 3), s[0] + s.slice(2) + '0', s[0] + '0' + s[2] + s[3], s[0] + s[1] + '0' + s[3], ((+s[0]) % 9 + 1) + s.slice(1)].map(Number).concat([n + 10, n + 100, n - 1]).filter(v => v !== n && v >= 1000 && v <= 9999);
      const wrong = [...new Set(c.map(numCN))].filter(w => w !== numCN(n)).slice(0, 2);
      return { q: `<span class="big">${n}</span> 怎麼讀？`, sp: '這個數怎麼讀？', opts: [{ h: `<span class="small-opt">${numCN(n)}</span>`, ok: true }, ...wrong.map(w => ({ h: `<span class="small-opt">${w}</span>`, ok: false }))], hint: '從千位讀起，中間的 0 要讀「零」！' };
    },
    () => { const n = num4(0.5); return { q: `「${numCN(n)}」寫成數字是多少？`, ans: n, hint: '沒有的位要寫 0 佔位子！', after: String(n) }; },
    () => {
      const n = num4(0.2), d = digitsOf(n); let k; do { k = rand(0, 2); } while (d[k] === 0);
      return { q: `${n} 的<b>${PL[k]}位</b>上的 ${d[k]} 代表多少？`, ans: d[k] * PLV[k], hint: `${d[k]} 在${PL[k]}位，就是 ${d[k]} 個${PL[k]}！`, after: `${d[k]} 個${PL[k]}是 ${d[k] * PLV[k]}` };
    },
    () => { const th = rand(1, 9), h = rand(0, 9), t = rand(0, 9), o = rand(0, 9); const n = th * 1000 + h * 100 + t * 10 + o; return { q: '積木合起來是多少？', vis: blocksHTML(th, h, t, o), ans: n, hint: '先數千方塊，再數百格板、十條、小方塊！', after: String(n) }; },
    () => pick([
      { q: '10 個千是多少？', ans: 10000, hint: '1 千、2 千……數到 10 個千就是一萬！', after: '10 個千是 10000（一萬）' },
      { q: '1000 是幾個百？', ans: 10, unit: '個', hint: '10 個百是 1000！' },
      { q: '1 萬是幾個千？', ans: 10, unit: '個', hint: '10 個千是 1 萬！' }
    ]),
    () => { const h = rand(12, 98); return { q: `${h}00 是幾個百？`, ans: h, unit: '個', hint: `1 個千是 10 個百，${h}00 裡面有幾個 100？`, after: `${h}00 是 ${h} 個百` }; },
    () => { const a = rand(2, 9), c = rand(1, 9), b = rand(1, 9); return { q: `${a} 個千、${b} 個十和 ${c} 個一合起來是多少？`, ans: a * 1000 + b * 10 + c, hint: '沒有百，百位要寫 0！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 1-C 比大小與數線挑戰 ===== */
function u1C(st) {
  const rounds = [
    () => { const a = num4(0.2), s = String(a).split(''); const k = rand(1, 3); s[k] = String((+s[k] + pick([1, 2, 8, 9])) % 10); const b = +s.join(''); return cmpQ(a, b); },
    () => { const a = rand(100, 999), b = rand(1000, 1999); return Math.random() < .5 ? cmpQ(a, b) : cmpQ(b, a); },
    () => {
      const base = rand(1, 8) * 1000, m = rand(1, 9);
      return { q: '數線上箭頭指的數是多少？', vis: `<div class="nlwrap">${numberLineSVG(base, base + 1000, 100, 1000, [{ v: base + m * 100, t: '?' }])}</div>`, ans: base + m * 100, hint: `${base} 到 ${base + 1000} 分成 10 小格，一小格是 100！`, after: String(base + m * 100) };
    },
    () => {
      const base = rand(10, 98) * 100, m = rand(1, 9);
      return { q: '數線上箭頭指的數是多少？', vis: `<div class="nlwrap">${numberLineSVG(base, base + 100, 10, 100, [{ v: base + m * 10, t: '?' }])}</div>`, ans: base + m * 10, hint: `${base} 到 ${base + 100} 分成 10 小格，一小格是 10！`, after: String(base + m * 10) };
    },
    () => {
      const ds = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4), big = +ds.slice().sort((a, b) => b - a).join('');
      const nz = ds.slice().sort((a, b) => a - b), small = nz[0] === 0 ? +(String(nz[1]) + '0' + nz.slice(2).join('')) : +nz.join('');
      return pick([
        { q: `用 ${ds.join('、')} 四張數字卡，排出<b>最大</b>的四位數。`, vis: ds.map(d => `<span class="card">${d}</span>`).join(''), ans: big, hint: '大的數字放在前面（千位）！', after: String(big) },
        { q: `用 ${ds.join('、')} 四張數字卡，排出<b>最小</b>的四位數。`, vis: ds.map(d => `<span class="card">${d}</span>`).join(''), ans: small, hint: '小的放前面，但是 0 不能放在千位！', after: String(small) }
      ]);
    },
    () => { const n = rand(1, 9) * 1000; return pick([{ q: `比 ${n - 1} 多 1 的數是多少？`, ans: n, hint: '個位、十位、百位都滿了要進位！', after: `${n - 1} 再 1 是 ${n}` }, { q: `比 ${n} 少 1 的數是多少？`, ans: n - 1, hint: `往回數 1，${n} 的前一個數。`, after: String(n - 1) }, { q: `比 ${n - 10} 多 10 的數是多少？`, ans: n, hint: '10 個 10 進位成 1 個百！', after: String(n) }]); },
    () => { let ns; do { ns = [num4(.3), num4(.3), num4(.3)]; } while (new Set(ns).size < 3); const mx = Math.max(...ns); return { q: '哪一個數<b>最大</b>？', opts: ns.map(v => ({ h: N(v), ok: v === mx })), hint: '從千位開始比，千位一樣再比百位！' }; }
  ];
  quiz(st, rounds);
}

/* ===== 直式加減：一格一格從個位算起 ===== */
function addSubSteps(a, b, op) {
  const w = 4, A = digitsOf(a), B = digitsOf(b), res = op === '+' ? a + b : a - b, R = String(res).padStart(w, ' ').split('');
  const steps = []; let carry = 0;
  const marks = Array(w).fill('');
  for (let k = w - 1; k >= 0; k--) {
    if (R[k] === ' ') break;
    let hint, mk = null;
    if (op === '+') {
      const s = A[k] + B[k] + carry;
      hint = A[k] + B[k] === 0 ? '前一位進位的 1，直接寫下來！' : `${A[k]} + ${B[k]}${carry ? ' + 進位的 1' : ''} = ${s}${s >= 10 ? '，寫 ' + (s % 10) + '，向前一位進 1' : ''}`;
      carry = s >= 10 ? 1 : 0;
      if (carry && k > 0) mk = [k - 1, '1'];
    } else {
      let t = A[k] - carry;
      const need = t < B[k];
      hint = t < 0 ? `這一位是 0，先向前一位借 1 當 10，再被借走 1 剩 9：9 − ${B[k]} = ${9 - B[k]}` : `${carry ? `被借走 1 剩 ${t}，` : ''}${need ? `不夠減，向前一位借 1 當 10：${t + 10} − ${B[k]} = ${t + 10 - B[k]}` : `${t} − ${B[k]} = ${t - B[k]}`}`;
      if (need) t += 10;
      if (t !== A[k]) mk = [k, String(t)];
      carry = need ? 1 : 0;
    }
    steps.push({ k, d: +R[k], hint, mk: mk ? mk.slice() : null });
  }
  return { w, res, R, steps, marks };
}
function u2A(st) {
  const probs = [];
  { const a = rand(450, 899), b = rand(1000 - a + 11, 999); probs.push([a, b, '+']); }
  { let a, b; do { a = rand(1200, 5800); b = rand(1200, 3900); } while (a + b >= 10000 || (a % 10 + b % 10) < 10); probs.push([a, b, '+']); }
  { let a, b; do { a = rand(2100, 8900); b = rand(200, 999); } while (a % 10 >= b % 10); probs.push([a, b, '−']); }
  { const a = rand(2, 9) * 1000 + rand(0, 5); let b; do { b = rand(1100, a - 100); } while (b % 10 <= a % 10 || Math.floor(b / 1000) >= Math.floor(a / 1000)); probs.push([a, b, '−']); }
  let r = 0;
  function round() {
    if (r >= probs.length) return api.finish();
    const [a, b, op] = probs[r], S = addSubSteps(a, b, op === '+' ? '+' : '-');
    const res = S.R.map(c => c === ' ' ? '' : '_'), marks = S.marks.slice();
    let i = 0;
    function step() {
      const cur = S.steps[i];
      const show = res.slice(); show[cur.k] = '?';
      if (op !== '+' && cur.mk) marks[cur.mk[0]] = cur.mk[1];
      st.innerHTML = `${dots(r, probs.length)}<div class="qvis">${vertHTML(a, b, op, show, S.w, marks)}</div><div class="numpad"></div>`;
      api.say(`${a} ${op} ${b}：${PL[cur.k]}位要寫多少？`, `${PL[cur.k]}位要寫多少？`);
      digitPad($('.numpad', st), cur.d, () => {
        res[cur.k] = String(cur.d);
        if (op === '+' && cur.mk) marks[cur.mk[0]] = cur.mk[1];
        i++;
        if (i < S.steps.length) later(step, 450);
        else {
          st.innerHTML = `${dots(r + 1, probs.length)}<div class="qvis">${vertHTML(a, b, op, res, S.w, marks)}<div class="after">${a} ${op} ${b} = ${S.res}</div></div>`;
          speak(`${a} ${op === '+' ? '加' : '減'} ${b} 等於 ${S.res}`); r++; later(round, 2000);
        }
      }, cur.hint);
    }
    step();
  }
  round();
}

/* ===== 2-B 估算與驗算 ===== */
function u2B(st) {
  const near = () => { const h = rand(12, 58) * 100, d = pick([-3, -2, -1, 1, 2, 3]); return [h + d, h]; };
  const rounds = [
    () => { const [a, ah] = near(), [b, bh] = near(), s = ah + bh; return { q: `${a} + ${b} 大約是多少？`, sp: `${a} 加 ${b} 大約是多少？`, vis: `<span class="eq sm">${a} ≈ ${ah}　${b} ≈ ${bh}</span>`, opts: [{ h: N(s), ok: true }, { h: N(s + 1000), ok: false }, { h: N(s - 100), ok: false }], hint: `${a} 很接近 ${ah}，${b} 很接近 ${bh}，先算整百！`, after: `${ah} + ${bh} = ${s}，大約是 ${s}` }; },
    () => { let a, ah, b, bh; do { [a, ah] = near(); [b, bh] = near(); } while (ah <= bh); const s = ah - bh; return { q: `${a} − ${b} 大約是多少？`, vis: `<span class="eq sm">${a} ≈ ${ah}　${b} ≈ ${bh}</span>`, opts: [{ h: N(s), ok: true }, { h: N(s + 1000), ok: false }, { h: N(s + 200), ok: false }], hint: '先想成接近的整百再減！', after: `${ah} − ${bh} = ${s}` }; },
    () => { const a = rand(3000, 9000), b = rand(1000, a - 500), c = a - b; return { q: `${a} − ${b} = ${c}，可以用哪一個算式來驗算？`, opts: [{ h: `<span class="small-opt">${c} + ${b}</span>`, ok: true }, { h: `<span class="small-opt">${c} − ${b}</span>`, ok: false }, { h: `<span class="small-opt">${a} + ${b}</span>`, ok: false }], hint: '差加減數，會等於被減數！', after: `${c} + ${b} = ${a}，算對了！` }; },
    () => { const s = rand(25, 90) * 100, b = rand(1100, s - 500); return { q: `□ + ${b} = ${s}，□ 是多少？`, vis: `<span class="eq sm"><span class="box">?</span> + ${b} = ${s}</span>`, ans: s - b, hint: `用 ${s} − ${b} 就可以找到 □！`, after: `${s} − ${b} = ${s - b}` }; },
    () => { const a = rand(3000, 9800), c = rand(1000, a - 1000); return { q: `${a} − □ = ${c}，□ 是多少？`, vis: `<span class="eq sm">${a} − <span class="box">?</span> = ${c}</span>`, ans: a - c, hint: `用 ${a} − ${c} 就可以找到 □！`, after: `${a} − ${c} = ${a - c}` }; },
    () => { let a, b; do { a = rand(1200, 6000); b = rand(1200, 3500); } while ((a % 10) + (b % 10) < 10); const wrong = a + b - 10; return { q: `小明算 ${a} + ${b} = ${wrong}，他算對了嗎？`, opts: [{ h: '錯了，忘記進位', ok: true }, { h: '算對了', ok: false }, { h: '錯了，不用進位', ok: false }].map(o => ({ ...o, h: `<span class="small-opt">${o.h}</span>` })), hint: `個位 ${a % 10} + ${b % 10} 滿十了，要進位！`, after: `${a} + ${b} = ${a + b}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 2-C 加減應用挑戰 ===== */
function u2C(st) {
  const rounds = [
    () => { const a = rand(1200, 4800), b = rand(1200, 4800); return { q: `圖書館有故事書 ${a} 本、科學書 ${b} 本，一共有幾本？`, vis: '<span style="font-size:56px">📚</span>', ans: a + b, unit: '本', hint: '合起來用加法！', after: `${a} + ${b} = ${a + b}` }; },
    () => { const a = rand(3, 9) * 1000, b = rand(1050, a - 300); return { q: `媽媽帶了 ${a} 元，買電鍋花了 ${b} 元，還剩下幾元？`, vis: '<span style="font-size:56px">💰</span>', ans: a - b, unit: '元', hint: '剩下用減法，整千減要連續借位喔！', after: `${a} − ${b} = ${a - b}` }; },
    () => { const a = rand(2500, 6000), d = rand(800, 2400); return { q: `第一天有 ${a} 人參觀，第二天比第一天多 ${d} 人，第二天有幾人？`, vis: '<span style="font-size:56px">🎡</span>', ans: a + d, unit: '人', hint: '比第一天多，用加法！', after: `${a} + ${d} = ${a + d}` }; },
    () => { const a = rand(4000, 9000), b = rand(1500, a - 800); return { q: `哥哥跑了 ${a} 公尺，弟弟跑了 ${b} 公尺，哥哥比弟弟多跑幾公尺？`, vis: '<span style="font-size:56px">🏃</span>', ans: a - b, unit: '公尺', hint: '比多少用減法：大的減小的。', after: `${a} − ${b} = ${a - b}` }; },
    () => { const c = rand(3000, 8000), s = rand(1000, c - 1000); return { q: `一箱有 ${c} 顆彈珠，賣掉一些後剩下 ${s} 顆，賣掉幾顆？`, vis: '<span style="font-size:56px">🔮</span>', ans: c - s, unit: '顆', hint: '原來的減掉剩下的，就是賣掉的。', after: `${c} − ${s} = ${c - s}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 3-A 乘法直式工作台（二、三位數 × 一位數） ===== */
function u3A(st) {
  const probs = [[rand(13, 49), rand(3, 9)], [rand(52, 98), rand(2, 9)], [rand(112, 389), rand(2, 9)], [rand(405, 999), rand(2, 9)]];
  let r = 0;
  function round() {
    if (r >= probs.length) return api.finish();
    const [a, b] = probs[r], ad = String(a).split('').map(Number), res = a * b, W = String(res).length;
    // 每一步：從個位算起
    const steps = []; let carry = 0;
    for (let i = ad.length - 1; i >= 0; i--) {
      const p = ad[i] * b + carry, last = i === 0;
      const pos = W - (ad.length - i); // 這一位在第幾格
      steps.push({ pos, v: last ? p : p % 10, last, hint: `${ad[i]} × ${b}${carry ? ` + 進位的 ${carry}` : ''} = ${p}${!last && p >= 10 ? `，寫 ${p % 10}，進 ${Math.floor(p / 10)}` : ''}`, carry: last ? 0 : Math.floor(p / 10) });
      carry = Math.floor(p / 10);
    }
    const cells = Array(W).fill(''), marks = Array(W).fill('');
    let i = 0;
    function step() {
      const s = steps[i], show = cells.slice();
      const len = s.last ? String(s.v).length : 1;
      for (let k = 0; k < len; k++) show[s.pos - k] = k === 0 ? '?' : '_';
      st.innerHTML = `${dots(r, probs.length)}<div class="qvis">${vertHTML(a, b, '×', show, W, marks)}</div><div class="kwrap"></div>`;
      const place = PL[4 - (W - s.pos)] || '';
      api.say(s.last && len > 1 ? `${a} × ${b}：最後一位，乘完寫多少？` : `${a} × ${b}：${place}位要寫多少？`, s.last && len > 1 ? '最後一位，乘完寫多少？' : `${place}位要寫多少？`);
      const done = () => {
        String(s.v).split('').reverse().forEach((c, k) => cells[s.pos - k] = c);
        if (s.carry && s.pos > 0) marks[s.pos - 1] = String(s.carry);
        i++;
        if (i < steps.length) later(step, 450);
        else {
          st.innerHTML = `${dots(r + 1, probs.length)}<div class="qvis">${vertHTML(a, b, '×', cells, W, marks)}<div class="after">${a} × ${b} = ${res}</div></div>`;
          speak(`${a} 乘以 ${b} 等於 ${res}`); r++; later(round, 2000);
        }
      };
      if (len > 1) keypad($('.kwrap', st), s.v, done, s.hint);
      else { const box = $('.kwrap', st); digitPad(box, s.v, done, s.hint); }
    }
    step();
  }
  round();
}

/* ===== 3-B 拆一拆與估算 ===== */
function u3B(st) {
  const t = rand(2, 9), o = rand(1, 9), b = rand(3, 9), a = t * 10 + o;
  const rounds = [
    { q: `${a} × ${b}，可以想成 ${t}0 × ${b} 和 ${o} × ${b}。${t}0 × ${b} = ？`, vis: `<span class="eq sm">${a} × ${b} = ${t}0 × ${b} + ${o} × ${b}</span>`, ans: t * 10 * b, hint: `${t} 個十 × ${b} = ${t * b} 個十`, after: `${t}0 × ${b} = ${t * 10 * b}` },
    { q: `${o} × ${b} = ${o * b}，所以 ${a} × ${b} = ？`, vis: `<span class="eq sm">${t * 10 * b} + ${o * b}</span>`, ans: a * b, hint: `把 ${t * 10 * b} 和 ${o * b} 加起來！`, after: `${a} × ${b} = ${a * b}` },
    () => { const h = rand(2, 9), m = rand(2, 9); return { q: `${h}00 × ${m} = ？`, vis: `<span class="eq sm">${h} 個百 × ${m}</span>`, ans: h * 100 * m, hint: `${h} × ${m} = ${h * m}，${h * m} 個百是多少？`, after: `${h * m} 個百 = ${h * m * 100}` }; },
    () => { const h = rand(2, 9), d = pick([-2, -1, 1, 2]), m = rand(2, 9), n = h * 100 + d, e = h * 100 * m; return { q: `${n} × ${m} 大約是多少？`, vis: `<span class="eq sm">${n} ≈ ${h * 100}</span>`, opts: [{ h: N(e), ok: true }, { h: N(e / 10), ok: false }, { h: N(e + 1000), ok: false }], hint: `${n} 很接近 ${h * 100}，算 ${h * 100} × ${m}！`, after: `${h * 100} × ${m} = ${e}，大約是 ${e}` }; },
    () => { const n = rand(112, 499), m = 3; const len = String(n * m).length; return { q: `${n} × ${m} 的積是幾位數？`, opts: [{ h: N(3), ok: len === 3 }, { h: N(4), ok: len === 4 }, { h: N(2), ok: false }], hint: `估估看：${n} 不到 ${Math.ceil(n / 100) * 100}，乘以 3 會不會超過 1000？`, after: `${n} × ${m} = ${n * m}，是 ${len} 位數` }; },
    () => { const x = rand(12, 48), m = rand(2, 9); return { q: `${m} × ${x} 和哪一個算式的答案一樣？`, opts: [{ h: `<span class="small-opt">${x} × ${m}</span>`, ok: true }, { h: `<span class="small-opt">${x} + ${m}</span>`, ok: false }, { h: `<span class="small-opt">${x} × ${m + 1}</span>`, ok: false }], hint: '兩個數交換相乘，積不變！', after: `${m} × ${x} = ${x} × ${m} = ${m * x}` }; }
  ];
  quiz(st, rounds);
}

/* ===== 3-C 乘法應用挑戰 ===== */
function u3C(st) {
  const rounds = [
    () => { const p = rand(12, 48), n = rand(3, 9); return { q: `一盒彩色筆有 ${p} 枝，${n} 盒有幾枝？`, vis: pics('🖍️', n, true), ans: p * n, unit: '枝', hint: `${p} 枝的 ${n} 倍，用 ${p} × ${n}`, after: `${p} × ${n} = ${p * n}` }; },
    () => { const p = rand(115, 380), n = rand(3, 9); return { q: `一張門票 ${p} 元，買 ${n} 張要多少元？`, vis: '<span style="font-size:56px">🎟️</span>', ans: p * n, unit: '元', hint: `${p} × ${n}，從個位乘起，記得進位！`, after: `${p} × ${n} = ${p * n}` }; },
    () => { const d = rand(205, 650), n = 7; return { q: `小華每天走 ${d} 公尺上學，一個星期 7 天一共走幾公尺？`, vis: '<span style="font-size:56px">🚶</span>', ans: d * n, unit: '公尺', hint: `${d} × 7`, after: `${d} × 7 = ${d * n}` }; },
    () => { const p = rand(125, 299), n = rand(3, 6), have = (Math.floor(p * n / 1000) + 1) * 1000; return { q: `一個便當 ${p} 元，買 ${n} 個，付 ${have} 元，要找回多少元？`, vis: '<span style="font-size:56px">🍱</span>', ans: have - p * n, unit: '元', hint: `先算 ${p} × ${n} = ${p * n}，再用 ${have} 去減。`, after: `${have} − ${p * n} = ${have - p * n}` }; },
    () => { const k = rand(16, 28), n = rand(4, 9); return { q: `一排有 ${k} 張椅子，排了 ${n} 排以後又多排 1 排，一共有幾張？`, vis: '<span style="font-size:56px">🪑</span>', ans: k * (n + 1), unit: '張', hint: `多一排就是 ${n + 1} 排：${k} × ${n + 1}`, after: `${k} × ${n + 1} = ${k * (n + 1)}` }; }
  ];
  quiz(st, rounds);
}

LEVELS.u1 = [u1A, u1B, u1C];
LEVELS.u2 = [u2A, u2B, u2C];
LEVELS.u3 = [u3A, u3B, u3C];
