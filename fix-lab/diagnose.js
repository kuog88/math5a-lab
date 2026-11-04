/* 數學故障修復局：從錯題猜「可能的錯誤類型」
   diagnose({ q, a, c }, grade) → [{ id, why }]（可能好幾個；判斷不出來回傳 [{ id:'other' }]）
   scanReport(kg-report-v1 的資料) → 依錯誤類型整理的清單
   規則依序：① 用錯誤做法「重算一次」，剛好得到孩子的答案 → 最可信
            ② 答案和正確答案的關係（差 10 倍、差 10/100、差 40 分鐘、互為倒數…）配合題目關鍵字
   瀏覽器：window.FixDiag；node：module.exports */
(function (root) {
  'use strict';
  const D = root.FixDB || (typeof require !== 'undefined' ? require('./errors.js') : null);
  const { Q, gcd, lcm } = D;

  const UNIT_RE = /(平方|立方)?(公里|公尺|公分|毫米|公升|毫升|公斤|公克|公頃|公畝|公噸)/;
  function clean(s) { return String(s === undefined || s === null ? '' : s).replace(/[，,]/g, '').replace(/\s+/g, ' ').trim(); }
  // 解讀答案：數字／分數、商與餘、幾時幾分
  function val(s) {
    s = clean(s); if (!s) return null;
    let m;
    if ((m = s.match(/(\d+)\s*(?:…+|\.\.\.+|餘)\s*(\d+)/)) || (m = s.match(/商\s*(\d+)\D+餘\s*(\d+)/))) return { k: 'qr', q: +m[1], r: +m[2] };
    if ((m = s.match(/(\d+)\s*[時点點]\s*半/))) return { k: 'hm', h: +m[1], m: 30 };
    if ((m = s.match(/(\d+)\s*(?:小時|時|點)\s*(\d+)\s*分/))) return { k: 'hm', h: +m[1], m: +m[2] };
    if ((m = s.match(/^(\d+)\s*(?:小時|時|點)$/))) return { k: 'hm', h: +m[1], m: 0 };
    const t = s.replace(/\s/g, '').match(/\d+又\d+\/\d+|\d+(?:\.\d+)?\/\d+(?:\.\d+)?|\d*\.?\d+/);
    if (!t) return null;
    const v = Q.parse(t[0]); if (!v) return null;
    return { k: 'n', v, raw: t[0], pct: /%/.test(s), unsimplified: /\//.test(t[0]) && (() => { const mm = t[0].match(/(\d+)\/(\d+)$/); return mm && gcd(+mm[1], +mm[2]) > 1; })() };
  }
  // 題目裡的算式：數字（含分數、小數）和運算符號
  function tokens(q) {
    const s = clean(q).replace(/[＋]/g, '+').replace(/[－—–]/g, '−').replace(/(\d)\s*[xX＊*]\s*(\d)/g, '$1×$2').replace(/(\d)\s*-\s*(\d)/g, '$1−$2');
    const re = /(\d+又\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)|([+−×÷])/g, out = []; let m;
    while ((m = re.exec(s))) out.push(m[1] ? { n: Q.parse(m[1]), raw: m[1] } : { op: m[2] });
    // 找最長的「數 符號 數 符號 數…」
    let best = null;
    for (let i = 0; i < out.length; i++) {
      if (!out[i].n) continue;
      const e = [out[i]]; let j = i + 1;
      while (j + 1 < out.length && out[j].op && out[j + 1].n) { e.push(out[j], out[j + 1]); j += 2; }
      if (e.length >= 3 && (!best || e.length > best.length)) best = e;
    }
    return { expr: best, nums: out.filter(x => x.n).map(x => x.n) };
  }
  const isInt = q => q.d === 1;
  const n = q => q.n / q.d;
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  function calc(a, op, b) { return D.eqCalc(a, op, b); }
  function leftToRight(e) { let r = e[0].n; for (let i = 1; i < e.length; i += 2) r = calc(r, e[i].op, e[i + 1].n); return r; }
  function rightFirst(e) { if (e.length !== 5) return null; return calc(e[0].n, e[1].op, calc(e[2].n, e[3].op, e[4].n)); }
  const p10 = r => [10, 100, 1000, 10000, 1e6].some(k => near(r, k));
  const pick = (g, map) => { for (const [gs, id] of map) if (gs.includes(g)) return id; return map[map.length - 1][1]; };

  function diagnose(rec, grade) {
    const q = clean(rec.q), A = val(rec.a), C = val(rec.c), g = +grade || 0, out = [];
    const add = (id, why) => { if (!out.some(o => o.id === id)) out.push({ id, why }); };
    if (!A || !C) return [{ id: 'other', why: '答案不是數字，無法用規則判斷' }];
    const T = tokens(q), e = T.expr;
    const has = re => re.test(q);

    // ---- 商和餘數 ----
    if (A.k === 'qr') {
      const dv = e && e[1].op === '÷' ? n(e[2].n) : (C.k === 'qr' && A.q === C.q - 1 ? A.r - C.r : 0);
      if (dv && A.r >= dv) add('div-remainder', `餘數 ${A.r} 不比除數 ${dv} 小`);
    }
    // ---- 時間 ----
    if (A.k === 'hm' && C.k === 'hm') {
      if (A.m >= 60 || A.m - C.m === 40 || (A.h === C.h - 1 && A.m - C.m === 40)) add(pick(g, [[[1, 2, 3], 'elapsed-60'], [[4], 'time-borrow'], [[5, 6], 'time-multiply']]), `分鐘數 ${A.m} 像是用 100 進位算的（1 時應該是 60 分）`);
      if (!out.length && near(A.h * 100 + A.m, C.h * 60 + C.m)) add(pick(g, [[[1, 2, 3], 'elapsed-60'], [[4], 'time-borrow'], [[5, 6], 'time-multiply']]), '分鐘換成時用了 100 進位（1 時應該是 60 分）');
      if (A.m === 30 && C.m === 30 && A.h === C.h + 1) add('clock-half', '半點時讀了短針後面那個數字');
      if (A.h === C.h && A.m * 5 === C.m && A.m) add('clock-minute', `長針指 ${A.m} 讀成 ${A.m} 分（應該 × 5）`);
    }
    if (A.k === 'hm' && C.k === 'n' && has(/分鐘|幾分/) && near(A.h * 100 + A.m, n(C.v))) add('time-multiply', '分鐘數用 100 進位換成時');
    if (A.k === 'n' && C.k === 'hm' && has(/時|分/) && near(n(A.v), C.h * 100 + C.m)) add('time-multiply', '把時和分直接接在一起');
    if (A.k !== 'n' || C.k !== 'n') return out.length ? out : [{ id: 'other', why: '' }];

    const a = A.v, c = C.v, av = n(a), cv = n(c), ratio = cv ? av / cv : 0;
    // ---- ① 用錯誤做法重算 ----
    if (e && e.length === 3) {
      const x = e[0].n, op = e[1].op, y = e[2].n, xi = isInt(x) && isInt(y), X = n(x), Y = n(y);
      if (xi && op === '+') {
        if (av === D.noCarryAdd(X, Y) && av !== X + Y) add('carry', '進位的 1 沒有加上去');
        const k = Math.pow(10, Math.abs(String(X).length - String(Y).length));
        if (k > 1 && (av === X + Y * k || av === X * k + Y)) add('align', '直式靠左對齊，位數沒對好');
        if (av === X + Y - 1 && X + Y <= 20) add('count-on', '往後數時把起點也數進去，少了 1');
      }
      if (xi && op === '−') {
        if (av === D.absDiffSub(X, Y) && av !== X - Y) add('big-small', '不夠減時倒過來用大減小');
        if (av === D.borrowNoDec(X, Y) && av !== X - Y) add('borrow-forget', '借位之後前一位忘了減 1');
        if (av === X - Y + 10 && /\d0\d$/.test(String(X))) add('borrow-zero', '中間有 0 的連續退位，0 借完沒有變 9');
      }
      if (xi && op === '×') {
        if (Y < 10 && av === D.mulNoCarry(X, Y) && av !== X * Y) add('mul-carry', '乘法進位沒有加');
        if (X < 10 && av === D.mulNoCarry(Y, X) && av !== X * Y) add('mul-carry', '乘法進位沒有加');
        if (Y >= 10 && Y < 100 && av === X * (Math.floor(Y / 10) + Y % 10)) add('mul-shift', '第二行沒有往左移一位');
        if ((Y === 0 || X === 0) && av !== 0) add('mult-zero', '乘 0 的答案應該是 0');
        if ((Y === 10 || X === 10) && av === X + Y) add('mult-zero', '乘 10 算成加 10');
        if (av === X + Y && X * Y !== X + Y) add('mult-add', '乘法算成加法');
      }
      if (xi && op === '÷' && isInt(c) && String(av) === String(cv).replace(/0/g, '') && av !== cv) add('div-zero-quot', '商中間的 0 漏寫了');
      if (!xi && (op === '+' || op === '−')) {
        const xs = e[0].raw, ys = e[2].raw;
        if (/\./.test(xs + ys) && !/\//.test(xs + ys)) {
          const dx = (xs.split('.')[1] || '').length, dy = (ys.split('.')[1] || '').length, xx = +xs.replace('.', ''), yy = +ys.replace('.', ''), k = Math.max(dx, dy);
          if (dx !== dy && near(av, (op === '+' ? xx + yy : xx - yy) / Math.pow(10, k))) add('decimal-align', '小數點沒有對齊，最後一位對齊了');
        }
        if (/^\d+\/\d+$/.test(xs) && /^\d+\/\d+$/.test(ys) && op === '+') {
          const [xn, xd] = xs.split('/').map(Number), [yn, yd] = ys.split('/').map(Number);
          if (Q.eq(a, Q(xn + yn, xd + yd))) add(xd === yd ? 'same-den-add' : 'unlike-frac', '分子加分子、分母加分母');
        }
      }
      if (op === '×' && /\//.test(e[0].raw + e[2].raw) && Q.eq(a, /\//.test(e[0].raw) ? x : y) && !Q.eq(a, c)) add('frac-times-int', '分子分母都乘，大小沒變');
      if (op === '×' && /又/.test(e[0].raw)) { const m = e[0].raw.match(/(\d+)又(\d+)\/(\d+)/); if (m && Q.eq(a, Q.add(Q(+m[1] * Y), Q(+m[2], +m[3])))) add('mixed-times-int', '帶分數只乘了整數部分'); }
      if (op === '÷' && /\//.test(e[0].raw + e[2].raw) && Q.eq(Q.mul(a, c), Q(1))) add('frac-div', '顛倒錯邊（答案剛好是倒數）');
      if (op === '÷' && /\./.test(e[2].raw) && near(ratio, 0.1)) add('dec-div', '只移了除數的小數點');
      if (op === '÷' && isInt(y) && /\./.test(e[0].raw) && p10(ratio)) add('dec-div-int', '商的小數點沒對齊');
      if (op === '×' && /\./.test(e[0].raw + e[2].raw) && (p10(ratio) || p10(1 / ratio))) add(/\./.test(e[0].raw) && /\./.test(e[2].raw) ? 'dec-mult' : 'dec-times-int', '小數點位數點錯');
    }
    if (e && e.length === 5) {
      const ops = [e[1].op, e[3].op], lvl = o => (o === '+' || o === '−') ? 1 : 2;
      const L = leftToRight(e), R = rightFirst(e);
      if (lvl(ops[0]) !== lvl(ops[1]) && lvl(ops[1]) === 2 && L && Q.eq(a, L)) add('order-ops', '沒有先乘除後加減，從左邊算了');
      if (lvl(ops[0]) === lvl(ops[1]) && R && Q.eq(a, R) && !Q.eq(a, c)) add('left-right', '同一級的運算沒有由左往右算');
    }
    // ---- ② 答案之間的關係 + 題目關鍵字 ----
    const nums = T.nums.map(n);
    if (has(/約分|最簡/) && Q.eq(a, c) && A.unsimplified) add('reduce', '大小對，但還沒約到最簡');
    if (has(/假分數/) && !Q.eq(a, c)) add('mixed-improper', '帶分數化假分數算錯');
    { const m = q.match(/(\d+)\s*\/\s*(\d+)\s*=\s*□\s*\/\s*(\d+)/); if (m && near(av, +m[1] + +m[3] - +m[2])) add('equiv-frac', '分母加多少，分子也加多少（應該用乘的）'); }
    { const m = q.match(/(\d+)\s*[顆個張枝本元公].*?(\d+)\/(\d+)\s*[盒包袋箱打份]/); if (m && +m[2] > 1 && near(av, +m[1] / +m[3])) add('frac-of-whole', '幾分之幾只算了一份'); }
    if (has(/毫米/) && has(/公分/) && nums.length >= 2 && near(av, nums[0] * 100 + nums[1])) add('mm-cm', '以為 1 公分 = 100 毫米');
    if (has(/哪.*[大小]|比較[大小]/) && /^1\/\d+$/.test(A.raw) && /^1\/\d+$/.test(C.raw)) add('unit-frac', '單位分數以為分母大就比較大');
    if (has(/哪.*[大小]|比較[大小]/) && /\./.test(A.raw) && /\./.test(C.raw) && A.raw.split('.')[1].length !== C.raw.split('.')[1].length) add('decimal-compare', '小數比大小只看位數多寡');
    if (nums.length >= 3 && !out.length && !has(/[+−×÷]/)) {
      const [x, y] = nums, cand = [x + y, x - y, x * y, y ? x / y : NaN];
      if (cand.some(v => near(av, v)) && !cand.some(v => near(cv, v))) add('two-step', '只算了第一步就停了');
    }
    if (has(/□/) && nums.length >= 2 && !out.length) { const [x, y] = nums; if (near(av, Math.abs(x - y)) || near(av, x + y)) add('inverse', '求 □ 時加減用反了'); }
    if (has(/比.*[多少]/) && nums.length >= 2 && !has(/比值|比例/)) { const [x, y] = nums; if ((near(av, x + y) && near(cv, Math.abs(x - y))) || (near(cv, x + y) && near(av, Math.abs(x - y)))) add('keyword', '看到「多」就加、看到「少」就減'); }
    if (has(/倍/) && nums.length >= 2) { const [x, p] = nums; if (near(av, x * p) && near(cv, x / p)) add('base-amount', '基準量看反，該除卻用乘'); else if (near(av, x / p) && near(cv, x * p)) add('base-amount', '基準量看反，該乘卻用除'); }
    if (has(/個\s*\d+\s*是多少|盤|每/) && nums.length >= 2 && near(av, nums[0] + nums[1]) && near(cv, nums[0] * nums[1])) add('mult-add', '「幾個幾」用加的');
    if (has(/[箱袋包盒人份].*幾|平分|每/) && nums.length >= 2 && near(av, nums[0] * nums[1]) && near(cv, nums[0] / nums[1])) add('mul-div-choice', '該用除法卻用乘法');
    if (has(/面積|周長/) && nums.length >= 2) { const [L, W] = nums; if ((near(av, 2 * (L + W)) && near(cv, L * W)) || (near(av, L * W) && near(cv, 2 * (L + W)))) add('area-perimeter', '面積和周長的算法搞混'); }
    if (has(/三角形|梯形/) && near(ratio, 2)) add('triangle-half', '面積忘了 ÷ 2');
    if (has(/平行四邊形/) && nums.length >= 3 && nums.some(s => near(av, nums[0] * s)) && !near(av, cv)) add('slant-height', '用斜邊當作高');
    if (has(/圓柱/) && !near(av, cv)) add('cylinder', '圓柱體積底面積算錯');
    else if (has(/圓/) && has(/面積/) && (near(ratio, 4) || nums.some(r => near(av, r * 2 * 3.14)))) add('circle-area', '圓面積公式用錯');
    if (has(/半徑|直徑/) && !has(/面積|周長/) && (near(ratio, 2) || near(ratio, 0.5) || near(ratio, 4) || near(ratio, 0.25))) add('radius-diameter', '半徑和直徑搞混');
    if (has(/角|量角器|度/) && near(av + cv, 180)) add('protractor', '量角器內外圈讀錯');
    if (has(/最長|最多|最大|最少|至少|一起|同時/) && nums.length >= 2) { const G = gcd(nums[0], nums[1]), L = lcm(nums[0], nums[1]); if ((near(av, L) && near(cv, G)) || (near(av, G) && near(cv, L))) add('gcd-lcm', '最大公因數、最小公倍數用反'); }
    if (has(/因數|倍數/) && !out.length && !near(av, cv)) add('factor-multiple', '因數和倍數搞混');
    if (has(/比值/) && Q.eq(Q.mul(a, c), Q(1))) add('ratio-order', '比的前後項放反');
    if (has(/折/) && nums.length && nums.some(P => near(av + cv, P))) add('discount', '算成便宜的錢');
    if (has(/%|百分/) && (near(ratio, 10) || near(ratio, 0.1))) add('percent', '百分率和小數換算差 10 倍');
    if (has(/比例尺/) && (p10(ratio) || p10(1 / ratio))) add('scale', '比例尺單位換算錯');
    if (has(/時速|分速|秒速|速率/) && (near(ratio, 60) || near(ratio, 1 / 60) || near(ratio, 3600))) add('speed-unit', '時間單位沒有換算');
    if (has(/小數點|幾個\s*0\.1|個\s*0\.1/) && /\./.test(A.raw) && A.raw.split('.').reverse().join('.') === C.raw) add('decimal-tenths', '幾個 0.1 和幾個 1 位置放反');
    if (has(/個十|個一/) && isInt(a) && av >= 10 && av < 100 && String(av).split('').reverse().join('') === String(cv)) add('tens-ones', '十位和個位寫反');
    if (has(/[一二三四五六七八九]千|萬/) && isInt(a) && String(cv).replace(/0/g, '') === String(av).replace(/0/g, '') && av < cv) add('big-number-zero', '大數裡的 0 漏寫了');
    if (has(/四捨五入|概數/) && !near(av, cv)) add('rounding', '四捨五入看錯位');
    if (has(/元/) && has(/個\s*(10|5|50|1)\s*元/) && av < cv && av <= 20) add('coins', '只數了錢幣個數');
    if (has(/經過|到.*[時點].*分/) && near(av - cv, 40)) add(has(/經過/) || g <= 3 ? 'elapsed-60' : 'time-borrow', '時間用 100 進位算了（多了 40 分）');
    if (has(/第\s*\d+\s*個/) && Math.abs(av - cv) === 1) add('count-order', '「第幾個」和「幾個」差 1');
    if (has(/尺|刻度/) && nums.length >= 2 && near(av, Math.max(...nums))) add('ruler-start', '沒有從 0 開始量');
    // 單位換算：答案像是把兩個數直接接起來，或差 10 的次方
    const um = q.match(UNIT_RE);
    if (um) {
      const concat = nums.length >= 2 && String(av) === `${nums[0]}${nums[1]}`;
      const area = /平方|立方|公頃|公畝/.test(q);
      if (concat || p10(ratio) || p10(1 / ratio)) {
        let id = null;
        if (area) id = 'big-unit';
        else if (/公尺/.test(q) && /公分/.test(q) && !/公里/.test(q)) id = 'm-cm';
        else if (/毫米/.test(q)) id = 'mm-cm';
        else if (/公升|毫升|公斤|公克|公里/.test(q)) id = 'thousand-unit';
        if (id && !(id === 'thousand-unit' && g <= 2)) add(id, concat ? '直接把兩個數接在一起，沒有補 0' : '單位換算差了 10 的倍數');
      }
    }
    // ---- ③ 最後的大方向判斷 ----
    if (!out.length && !near(av, cv)) {
      const diff = Math.abs(av - cv), hasDec = /\./.test(q + rec.a + rec.c);
      if ((p10(ratio) || p10(1 / ratio)) && hasDec) add(pick(g, [[[3, 4], 'dec-times-int'], [[5], 'dec-mult'], [[6], 'dec-div']]), '答案差了 10 倍、100 倍：小數點位置可能點錯');
      else if ([10, 100, 1000].includes(diff) && e) {
        const op = e[1].op;
        if (op === '+') add('carry', `答案差了 ${diff}：可能是進位沒加`);
        else if (op === '−') add('borrow-forget', `答案差了 ${diff}：可能是借位後忘記減 1`);
        else if (op === '×') add('mul-carry', `答案差了 ${diff}：可能是乘法進位沒加`);
      } else if (p10(ratio) || p10(1 / ratio)) add(um ? pick(g, [[[2], 'm-cm'], [[3, 4], 'thousand-unit'], [[5, 6], 'big-unit']]) : pick(g, [[[1, 2, 3], 'align'], [[4], 'mul-shift'], [[5], 'dec-mult'], [[6], 'dec-div']]), '答案差了 10 倍、100 倍：可能是單位換算或位數');
    }
    // 只保留資料庫有的類型
    const res = out.filter(o => D.byId[o.id]);
    return res.length ? res : [{ id: 'other', why: '規則判斷不出來' }];
  }

  // 讀家長報表：所有數學遊戲（含月考測驗卷）的錯題
  function scanReport(data, opt) {
    opt = opt || {};
    const games = (data && data.games) || {}, res = {}, list = [];
    Object.keys(games).forEach(gid => {
      const G = games[gid];
      if (!/^math5a-lab\//.test(gid) && G.subject !== '數學') return;
      if (/fix-lab/.test(gid)) return; // 自己這個遊戲的練習不算
      const m = gid.match(/grade(\d)/), grade = m ? +m[1] : (opt.grade || 0);
      (G.wrong || []).forEach(w => {
        if (!w || (!w.a && !w.c)) return;
        const r = diagnose({ q: w.q, a: w.a, c: w.c }, grade);
        list.push({ gid, grade, w, r });
        r.forEach(o => {
          const k = o.id; const it = res[k] || (res[k] = { id: k, count: 0, fixed: 0, grade, ex: [] });
          it.count++; if (w.fixed) it.fixed++;
          if (it.ex.length < 3) it.ex.push({ q: w.q, a: w.a, c: w.c, lv: w.lv, why: o.why, gid, ts: w.ts });
        });
      });
    });
    const types = Object.values(res).sort((x, y) => (x.id === 'other') - (y.id === 'other') || y.count - x.count);
    return { total: list.length, types, list };
  }

  const api = { diagnose, scanReport, val, tokens };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FixDiag = api;
})(typeof window !== 'undefined' ? window : globalThis);
