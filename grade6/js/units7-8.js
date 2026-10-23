'use strict';
/* 第 7 單元 速率 ／ 第 8 單元 數量關係 */

/* ===== 7-A 誰跑最快：算速率、點最快的選手，再看賽跑 ===== */
function u7A(st) {
  // [圖示, 名字, 說明, 秒速（公尺）]
  const rounds = [
    { tip: '時間一樣，比距離！', list: [['🐕', '小狗', '10 秒跑 60 公尺', 6], ['🐎', '小馬', '10 秒跑 150 公尺', 15], ['🐈', '小貓', '10 秒跑 90 公尺', 9]] },
    { tip: '距離一樣，用的時間越少越快！', list: [['🐇', '兔子', '100 公尺跑 20 秒', 5], ['🦊', '狐狸', '100 公尺跑 16 秒', 6.25], ['🦌', '小鹿', '100 公尺跑 25 秒', 4]] },
    { tip: '距離和時間都不一樣，先算每秒跑幾公尺！', list: [['🐇', '兔子', '20 秒跑 120 公尺', 6], ['🦊', '狐狸', '28 秒跑 140 公尺', 5], ['🐆', '獵豹', '30 秒跑 210 公尺', 7]] },
    { tip: '單位不一樣，先都換成秒速！', list: [['🚲', '騎腳踏車', '分速 300 公尺', 5], ['🛴', '滑板車', '秒速 4 公尺', 4], ['🏃', '跑步選手', '時速 21.6 公里', 6]] }
  ];
  let r = 0;
  function round() {
    if (r >= rounds.length) return api.finish();
    const R = rounds[r], list = shuffle(R.list), best = Math.max(...list.map(x => x[3]));
    api.say('誰的<b>速率最快</b>？點一下牠，然後看賽跑！');
    st.innerHTML = `${dots(r, rounds.length)}<div class="lanes">${list.map(([e, n, t, v], i) => `<button type="button" class="lane" data-i="${i}"><span class="track2"><span class="runner">${e}</span><span class="flag">🏁</span></span><span class="linfo"><b>${n}</b>　${t}</span></button>`).join('')}</div>`;
    $$('.lane', st).forEach(b => b.onclick = () => {
      const [e, n, t, v] = list[+b.dataset.i];
      if (v !== best) { b.classList.add('wrong'); return api.bad(R.tip); }
      $$('.lane', st).forEach(x => x.disabled = true); b.classList.add('right'); api.ok();
      $$('.runner', st).forEach((x, i) => { x.style.transitionDuration = '2.2s'; x.style.left = `calc(${list[i][3] / best * 100}% - ${list[i][3] / best * 44}px)`; });
      $$('.linfo', st).forEach((x, i) => x.insertAdjacentHTML('beforeend', `<em>＝秒速 ${fmt(list[i][3])} 公尺</em>`));
      speak(`${n}最快，秒速 ${fmt(v)} 公尺`); r++; later(round, 3600);
    });
  }
  round();
}

/* ===== 7-B 速率單位想一想 ===== */
function u7B(st) {
  quiz(st, [
    { q: '<b>速率</b>要怎麼算？', opts: [{ h: '距離 ÷ 時間', ok: true }, { h: '時間 ÷ 距離', ok: false, hint: '速率是「每單位時間走多遠」，用距離除以時間！' }, { h: '距離 × 時間', ok: false }], hint: '速率 = 距離 ÷ 時間' },
    () => { const v = pick([3, 4, 5, 8]); return { q: `秒速 ${v} 公尺 = 分速幾公尺？`, opts: numOpts(v * 60, [v * 10, v * 100, v * 3600], '公尺'), hint: '1 分鐘 = 60 秒，所以乘以 60！', after: `${v} × 60 = ${v * 60}` }; },
    () => { const v = pick([60, 120, 90]); return { q: `時速 ${v} 公里 = 分速幾公里？`, opts: numOpts(v / 60, [v * 60, v / 10, v / 100], '公里'), hint: '1 小時 = 60 分鐘，所以除以 60！', after: `${v} ÷ 60 = ${v / 60}` }; },
    () => { const v = pick([36, 54, 72, 18]); return { q: `時速 ${v} 公里 = 秒速幾公尺？`, opts: numOpts(v / 3.6, [v * 10, v / 60, v / 36], '公尺'), hint: `${v} 公里 = ${v * 1000} 公尺，1 小時 = 3600 秒`, after: `${v * 1000} ÷ 3600 = ${fmt(v / 3.6)}` }; },
    { q: '知道距離和速率，要怎麼求<b>時間</b>？', opts: [{ h: '距離 ÷ 速率', ok: true }, { h: '速率 ÷ 距離', ok: false }, { h: '距離 × 速率', ok: false }], hint: '距離 = 速率 × 時間，所以時間 = 距離 ÷ 速率' }
  ]);
}

/* ===== 7-C 速率挑戰 ===== */
function u7C(st) {
  const K = ['.'];
  quiz(st, [
    () => { const [d, t] = pick([[360, 3], [450, 5], [210, 3], [128, 2]]); return { q: `汽車 ${t} 小時行駛了 ${d} 公里，<b>時速</b>是多少公里？`, vis: '<span style="font-size:56px">🚗</span>', ans: d / t, unit: '公里', keys: K, hint: '速率 = 距離 ÷ 時間', after: `${d} ÷ ${t} = ${d / t}` }; },
    () => { const [v, t] = pick([[80, 2.5], [65, 4], [90, 1.5], [72, 3.5]]); return { q: `火車時速 ${v} 公里，行駛 ${fmt(t)} 小時，可以走多少公里？`, vis: '<span style="font-size:56px">🚄</span>', ans: rnd(v * t), unit: '公里', keys: K, hint: '距離 = 速率 × 時間', after: `${v} × ${fmt(t)} = ${fmt(rnd(v * t))}` }; },
    () => { const [d, v] = pick([[1500, 60], [2400, 80], [1800, 75], [900, 50]]); return { q: `小明騎腳踏車，分速 ${v} 公尺，騎 ${d} 公尺要幾分鐘？`, vis: '<span style="font-size:56px">🚴</span>', ans: d / v, unit: '分鐘', keys: K, hint: '時間 = 距離 ÷ 速率', after: `${d} ÷ ${v} = ${d / v}` }; },
    () => { const v = pick([72, 90, 54, 108]); return { q: `時速 ${v} 公里，是秒速多少公尺？`, ans: v / 3.6, unit: '公尺', keys: K, hint: '公里換成公尺 ×1000，小時換成秒 ÷3600', after: `${v * 1000} ÷ 3600 = ${fmt(v / 3.6)}` }; },
    () => { const [km, v] = pick([[3.6, 250], [4.5, 300], [2.4, 160], [5.6, 350]]); return { q: `媽媽走路分速 ${v} 公尺，走 ${fmt(km)} 公里要幾分鐘？`, vis: '<span style="font-size:56px">🚶‍♀️</span>', ans: rnd(km * 1000 / v), unit: '分鐘', keys: K, hint: `單位要一樣：${fmt(km)} 公里 = ${fmt(km * 1000)} 公尺`, after: `${fmt(km * 1000)} ÷ ${v} = ${fmt(rnd(km * 1000 / v))}` }; }
  ]);
}

/* ===== 桌子排一排的圖 ===== */
function tablesSVG(n) {
  const s = 46, gap = 0, W = n * s + 70, H = 130, x0 = 35, y0 = 42;
  let g = '';
  for (let i = 0; i < n; i++) {
    g += `<rect x="${x0 + i * (s + gap)}" y="${y0}" width="${s}" height="${s}" rx="4" fill="#f3d9a6" stroke="#b98326" stroke-width="2"/>`;
    g += `<text x="${x0 + i * s + s / 2}" y="${y0 - 10}" text-anchor="middle" font-size="22">🧒</text><text x="${x0 + i * s + s / 2}" y="${y0 + s + 28}" text-anchor="middle" font-size="22">🧒</text>`;
  }
  g += `<text x="${x0 - 18}" y="${y0 + s / 2 + 8}" text-anchor="middle" font-size="22">🧒</text><text x="${x0 + n * s + 18}" y="${y0 + s / 2 + 8}" text-anchor="middle" font-size="22">🧒</text>`;
  return `<svg class="tables" viewBox="0 0 ${W} ${H}" style="width:min(${W * 1.6}px,100%)">${g}</svg>`;
}

/* ===== 8-A 排桌子找規律 ===== */
function u8A(st) {
  const steps = [{ n: 2 }, { n: 3 }, { n: 4 }, { rule: true }, { ask: 10 }, { back: pick([24, 30, 40]) }];
  let i = 0, n = 1;
  function step() {
    if (i >= steps.length) return api.finish();
    const s = steps[i];
    const board = () => `${dots(i, steps.length)}<div class="readout">正方形桌子一張張併成一排，每邊坐 1 人。</div><div class="qvis">${tablesSVG(n)}</div>`;
    if (s.n) {
      api.say(`按「加一張桌子」，排出 <b>${s.n} 張</b>桌子。`);
      const draw = () => {
        st.innerHTML = `${board()}<div class="center"><button type="button" class="btn" id="addB">➕ 加一張桌子</button> <button type="button" class="btn ghost" id="subB">➖ 拿走一張</button></div><div class="opts"></div>`;
        $('#addB', st).onclick = () => { if (n >= 6) return toast('桌子夠多了！'); n++; sfx('tap'); draw(); if (n === s.n) ask(); };
        $('#subB', st).onclick = () => { if (n > 1) { n--; sfx('tap'); draw(); if (n === s.n) ask(); } };
      };
      const ask = () => {
        $$('#addB,#subB', st).forEach(b => b.disabled = true);
        api.say(`${n} 張桌子可以坐幾個人？`);
        shuffle(numOpts(2 * n + 2, [4 * n, 2 * n + 1, 2 * n + 4], '人')).forEach(o => $('.opts', st).appendChild(optBtn(o, () => { toast(`${n} 張桌子坐 ${2 * n + 2} 人`); i++; later(step, 1600); }, '上面、下面各幾人？左右兩端還有 2 人！')));
      };
      draw(); if (n === s.n) ask();
      return;
    }
    st.innerHTML = `${board()}<div class="tbl"><table><tr><th>桌子（張）</th>${[1, 2, 3, 4].map(k => `<td>${k}</td>`).join('')}<td>…</td><td>□</td></tr><tr><th>人數（人）</th>${[1, 2, 3, 4].map(k => `<td>${2 * k + 2}</td>`).join('')}<td>…</td><td>○</td></tr></table></div><div class="opts"></div><div class="kwrap"></div>`;
    const go = () => { i++; later(step, 2400); };
    if (s.rule) {
      api.say('每多一張桌子，就多坐幾個人？關係式是哪一個？（□ 是桌子數、○ 是人數）');
      shuffle([{ h: '○ = □ × 2 + 2', ok: true }, { h: '○ = □ × 4', ok: false, hint: '桌子併在一起，中間的邊不能坐人喔！' }, { h: '○ = □ + 2', ok: false, hint: '每多一張桌子多坐 2 人，不是 1 人！' }, { h: '○ = □ × 2', ok: false, hint: '別忘了左右兩端的 2 人！' }]).forEach(o => $('.opts', st).appendChild(optBtn(o, () => { toast('人數 = 桌子數 × 2 + 2'); speak('人數等於桌子數乘以 2 再加 2'); go(); })));
    } else if (s.ask) {
      api.say(`照這樣排，<b>${s.ask} 張</b>桌子可以坐幾人？`);
      keypad($('.kwrap', st), s.ask * 2 + 2, () => { toast(`${s.ask} × 2 + 2 = ${s.ask * 2 + 2}`); go(); }, '人數 = 桌子數 × 2 + 2', '人');
    } else {
      api.say(`要坐 <b>${s.back} 人</b>，需要幾張桌子？`);
      keypad($('.kwrap', st), (s.back - 2) / 2, () => { toast(`(${s.back} − 2) ÷ 2 = ${(s.back - 2) / 2}`); go(); }, '倒過來想：人數先減 2，再除以 2！', '張');
    }
  }
  step();
}

/* ===== 8-B 關係式想一想 ===== */
function u8B(st) {
  quiz(st, [
    () => { const d = pick([3, 4, 5]); return { q: `哥哥比弟弟大 ${d} 歲。弟弟 □ 歲、哥哥 ○ 歲，關係式是？`, opts: [{ h: `○ = □ + ${d}`, ok: true }, { h: `○ = □ − ${d}`, ok: false, hint: '哥哥比較大，要加！' }, { h: `○ = □ × ${d}`, ok: false, hint: '是「大幾歲」，不是「幾倍」！' }], hint: `哥哥的年齡 = 弟弟的年齡 + ${d}` }; },
    () => { const [p, c, y] = pick([[40, 12, 5], [38, 10, 8], [42, 13, 6]]); return { q: `今年爸爸 ${p} 歲，小明 ${c} 歲。${y} 年後，兩人相差幾歲？`, vis: '<span style="font-size:56px">👨👦</span>', opts: numOpts(p - c, [p - c + y, p - c - y, p + c], '歲'), hint: '每個人都長一樣多歲，年齡差永遠不變！', after: `年齡差不變，還是 ${p - c} 歲` }; },
    () => { const [s, d] = pick([[30, 6], [50, 10], [42, 8], [36, 4]]); return { q: `兩個數的和是 ${s}，差是 ${d}，<b>大的數</b>是多少？`, vis: `<div class="sdbar"><div><i style="flex:${(s - d) / 2}"></i><i class="ex" style="flex:${d}"></i><span>大</span></div><div><i style="flex:${(s - d) / 2}"></i><i style="flex:${d};visibility:hidden"></i><span>小</span></div></div>`, opts: numOpts((s + d) / 2, [(s - d) / 2, s - d, (s + d) / 2 + 2]), hint: '（和 + 差）÷ 2 = 大數', after: `(${s} + ${d}) ÷ 2 = ${(s + d) / 2}` }; },
    () => { const [a, b] = pick([[3, 2], [4, 3], [5, 2]]); return { q: `有 ${a} 件上衣、${b} 件褲子，一件上衣配一件褲子，共有幾種穿法？`, vis: `<span style="font-size:44px">${'👕'.repeat(a)}　${'👖'.repeat(b)}</span>`, opts: numOpts(a * b, [a + b, a * b + 1, a * b - 2], '種'), hint: `每件上衣都可以配 ${b} 件褲子！`, after: `${a} × ${b} = ${a * b}（種）` }; },
    () => { const [v, w] = pick([[12, 3], [15, 2], [10, 4]]); return { q: `船在靜水中時速 ${v} 公里，水流時速 ${w} 公里，<b>順水</b>時船的時速是幾公里？`, vis: '<span style="font-size:56px">⛵🌊</span>', opts: numOpts(v + w, [v - w, v, v * w], '公里'), hint: '順水時，水會推著船走，速率要加起來！', after: `順水速率 = ${v} + ${w} = ${v + w}` }; }
  ]);
}

/* ===== 8-C 數量關係挑戰 ===== */
function u8C(st) {
  quiz(st, [
    () => { const [s, d] = pick([[86, 14], [120, 26], [75, 15], [64, 18]]); return { q: `姊姊和妹妹共有 ${s} 張卡片，姊姊比妹妹多 ${d} 張，妹妹有幾張？`, vis: '<span style="font-size:56px">👧👧🃏</span>', ans: (s - d) / 2, unit: '張', hint: '（和 − 差）÷ 2 = 小的數', after: `(${s} − ${d}) ÷ 2 = ${(s - d) / 2}` }; },
    () => { const f = pick([12, 13, 14, 15]), n = pick([3, 4, 5]); const kid = f - n, mom = 3 * f - n; return { q: `媽媽今年 ${mom} 歲，女兒 ${kid} 歲。幾年後，媽媽的年齡是女兒的 3 倍？`, vis: '<span style="font-size:56px">👩👧</span>', ans: n, unit: '年', hint: `年齡差 ${mom - kid} 歲不變，3 倍時差是女兒的 2 倍，女兒那時幾歲？`, after: `年齡差 ${mom - kid}，女兒 ${(mom - kid) / 2} 歲時是 3 倍，${n} 年後` }; },
    () => { const [v, w, t] = pick([[15, 3, 4], [12, 2, 3], [18, 4, 2]]); const d = (v - w) * t; return { q: `船在靜水中時速 ${v} 公里，水流時速 ${w} 公里。<b>逆水</b>航行 ${d} 公里要幾小時？`, vis: '<span style="font-size:56px">🚤🌊</span>', ans: t, unit: '小時', hint: `逆水速率 = ${v} − ${w}`, after: `${d} ÷ (${v} − ${w}) = ${t}` }; },
    () => { const n = pick([4, 5, 6]); return { q: `從 ${n} 位同學中選出<b>班長和副班長</b>各 1 人，共有幾種選法？`, vis: `<span style="font-size:44px">${'🧑‍🎓'.repeat(n)}</span>`, ans: n * (n - 1), unit: '種', hint: `班長有 ${n} 種選法，選完後副班長剩幾種？`, after: `${n} × ${n - 1} = ${n * (n - 1)}（種）` }; },
    () => { const [h, rb] = pick([[10, 3], [12, 5], [15, 4], [20, 7]]); const f = (h - rb) * 2 + rb * 4; return { q: `籠子裡有雞和兔子共 ${h} 隻，腳共 ${f} 隻，<b>兔子</b>有幾隻？`, vis: '<span style="font-size:56px">🐔🐇</span>', ans: rb, unit: '隻', hint: `假設全部都是雞，腳有 ${h * 2} 隻，少了幾隻？每隻兔子多 2 隻腳！`, after: `(${f} − ${h} × 2) ÷ 2 = ${rb}（隻）` }; },
    () => { const n = pick([8, 10, 12]); return { q: `用火柴棒排正方形，排成一排：1 個用 4 根、2 個用 7 根、3 個用 10 根……排 ${n} 個要幾根？`, vis: `<svg class="pic" viewBox="0 0 200 60" width="220" height="66">${[0, 1, 2].map(k => `<rect x="${10 + k * 50}" y="5" width="50" height="50" fill="none" stroke="#ff9a4d" stroke-width="5"/>`).join('')}</svg>`, ans: 3 * n + 1, unit: '根', hint: '每多 1 個正方形多用 3 根：根數 = 個數 × 3 + 1', after: `${n} × 3 + 1 = ${3 * n + 1}（根）` }; }
  ]);
}

Object.assign(LEVELS, { u7: [u7A, u7B, u7C], u8: [u8A, u8B, u8C] });
