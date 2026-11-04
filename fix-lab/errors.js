/* 數學故障修復局：錯誤類型資料庫
   每一類錯誤 = 一台「故障機器」。
   gen(g) 產生一題相似練習（數字亂數），同時附上「照錯誤做法算」的示範步驟：
     q      題目（純文字，分數寫成 a/b、帶分數寫成 2又1/3，畫面會自動排成上下分數）
     input  作答方式：num 數字、frac 分數、fields 多格（商/餘、時/分）、choice 選擇、eq 列式（算式列對，答案電腦算）
     ans    正確答案；bug 照這個錯誤會算出的答案（一定和 ans 不同）
     steps  錯誤示範的每一步；bad 是錯的那一步；fix 正確做法
     v      出題用的數字（給測試程式獨立驗算）
   瀏覽器：window.FixDB；node：module.exports */
(function (root) {
  'use strict';
  /* ---------- 小工具 ---------- */
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const PL = ['個位', '十位', '百位', '千位', '萬位', '十萬位'];
  const dig = n => String(n).split('').reverse().map(Number);
  const pad2 = n => (n < 10 ? '0' : '') + n;

  /* ---------- 精確分數 Q（避免 0.1+0.2 的誤差） ---------- */
  function Q(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); return { n: n / g, d: d / g };
  }
  Q.parse = function (s) {
    if (s === null || s === undefined) return null;
    if (typeof s === 'number') s = String(s);
    s = String(s).replace(/[\s,，]/g, '').replace(/[＋]/g, '+');
    let m;
    if ((m = s.match(/^(\d+)(?:又|\+)(\d+)\/(\d+)$/))) { if (+m[3] === 0) return null; return Q(+m[1] * +m[3] + +m[2], +m[3]); }
    if ((m = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/))) { const a = Q.parse(m[1]), b = Q.parse(m[2]); return a && b && b.n ? Q.div(a, b) : null; }
    if ((m = s.match(/^(-?)(\d*)\.?(\d*)$/)) && (m[2] + m[3]).length && s !== '.') {
      const k = m[3].length; const v = Q(+(m[2] + m[3] || '0'), Math.pow(10, k)); return m[1] ? Q(-v.n, v.d) : v;
    }
    return null;
  };
  Q.of = x => (typeof x === 'object' && x && 'n' in x) ? x : Q.parse(x);
  Q.add = (a, b) => (a = Q.of(a), b = Q.of(b), Q(a.n * b.d + b.n * a.d, a.d * b.d));
  Q.sub = (a, b) => (a = Q.of(a), b = Q.of(b), Q(a.n * b.d - b.n * a.d, a.d * b.d));
  Q.mul = (a, b) => (a = Q.of(a), b = Q.of(b), Q(a.n * b.n, a.d * b.d));
  Q.div = (a, b) => (a = Q.of(a), b = Q.of(b), Q(a.n * b.d, a.d * b.n));
  Q.eq = (a, b) => { a = Q.of(a); b = Q.of(b); return !!a && !!b && a.n === b.n && a.d === b.d; };
  Q.isDec = q => { let d = Q.of(q).d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  // 有限小數寫成小數，其他寫成分數
  Q.str = function (q) {
    q = Q.of(q); if (q.d === 1) return String(q.n);
    if (!Q.isDec(q)) return q.n + '/' + q.d;
    let k = 0, p = 1; while ((q.d * Math.round(p / q.d)) !== p || p % q.d) { p *= 10; k++; }
    const sgn = q.n < 0 ? '-' : '', v = String(Math.abs(q.n) * (p / q.d)).padStart(k + 1, '0');
    return sgn + v.slice(0, v.length - k) + '.' + v.slice(v.length - k);
  };
  Q.frac = q => { q = Q.of(q); return q.d === 1 ? String(q.n) : q.n + '/' + q.d; };
  Q.mixed = q => { q = Q.of(q); if (q.d === 1) return String(q.n); const w = Math.floor(q.n / q.d), r = q.n - w * q.d; return w ? w + '又' + r + '/' + q.d : r + '/' + q.d; };
  const S = x => Q.str(Q.of(x));           // 數字 → 文字
  const dec = (n, k) => S(Q(n, Math.pow(10, k))); // 整數 n 點 k 位小數

  /* 選擇題選項：去重，答案一定在裡面 */
  function opts(ans, cands, n) {
    const out = [ans];
    cands.forEach(c => { if (c !== undefined && c !== null && out.length < (n || 4) && !out.includes(String(c))) out.push(String(c)); });
    return shuffle(out);
  }

  /* 國字讀法（四年級大數用） */
  const ZH = '零一二三四五六七八九';
  function zh4(n, lead) { // 0~9999，lead=前面還有字（十位開頭要說「一十」）
    const d = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10], u = ['千', '百', '十', ''];
    let s = '', zero = false, started = false;
    for (let i = 0; i < 4; i++) {
      if (d[i] === 0) { if (started) zero = true; continue; }
      if (zero) { s += '零'; zero = false; }
      if (i === 2 && d[i] === 1 && !started && !lead) s += '十';
      else s += ZH[d[i]] + u[i];
      started = true;
    }
    return s;
  }
  function zhNum(n) { // < 1 億
    const w = Math.floor(n / 10000), r = n % 10000;
    if (!w) return zh4(r, false) || '零';
    let s = zh4(w, false) + '萬';
    if (r) s += (r < 1000 ? '零' : '') + zh4(r, true);
    return s;
  }

  /* 直式錯誤做法 */
  function noCarryAdd(a, b) { const A = dig(a), B = dig(b), L = Math.max(A.length, B.length), p = []; for (let i = 0; i < L; i++) { const s = (A[i] || 0) + (B[i] || 0); p.unshift(i === L - 1 ? String(s) : String(s % 10)); } return Number(p.join('')); }
  function absDiffSub(a, b) { const A = dig(a), B = dig(b), p = []; for (let i = 0; i < A.length; i++) p.unshift(String(Math.abs(A[i] - (B[i] || 0)))); return Number(p.join('')); }
  function borrowNoDec(a, b) { const A = dig(a), B = dig(b), p = []; for (let i = 0; i < A.length; i++) { let d = A[i] - (B[i] || 0); if (d < 0) d += 10; p.unshift(String(d)); } return Number(p.join('')); }
  function mulNoCarry(a, k) { const A = dig(a), p = []; for (let i = 0; i < A.length; i++) { const s = A[i] * k; p.unshift(i === A.length - 1 ? String(s) : String(s % 10)); } return Number(p.join('')); }

  /* ---------- 錯誤類型 ---------- */
  const T = [];
  function def(o) { T.push(o); }

  /* ===== 一年級 ===== */
  def({
    id: 'count-order', name: '「第幾個」和「幾個」搞混', robot: '排隊機', grades: [1], units: ['1上-4 順序和多少'],
    wrong: '「排第 5 個」前面只有 4 個人，卻回答 5 個，把自己也算進去了。',
    right: '第幾個是「位置」；前面有幾個要扣掉自己：前面 = 第幾個 − 1；後面 = 全部 − 第幾個。',
    gen(g) {
      const nm = pick(['小美', '小明', '阿傑', '小安', '妹妹']);
      if (Math.random() < .5) {
        const n = ri(3, 9);
        return { q: `大家排成一排，${nm}排在第 ${n} 個。${nm}的前面有幾個人？`, input: 'num', ans: String(n - 1), bug: String(n), unit: '人', v: { n, k: 'front' },
          steps: [`${nm}排在第 ${n} 個`, `從 1 數到 ${n}，一共 ${n} 個`, `所以前面有 ${n} 個人`], bad: 1, fix: `第 ${n} 個是${nm}自己，前面只有 ${n} − 1 = ${n - 1} 個人。` };
      }
      const t = ri(6, 10), n = ri(2, t - 2);
      return { q: `${t} 個小朋友排成一排，${nm}從前面數來排第 ${n} 個。${nm}的後面有幾個人？`, input: 'num', ans: String(t - n), bug: String(t - n + 1), unit: '人', v: { t, n, k: 'back' },
        steps: [`一共 ${t} 個人`, `從第 ${n} 個數到第 ${t} 個：${t - n + 1} 個`, `所以後面有 ${t - n + 1} 個人`], bad: 1, fix: `第 ${n} 個是${nm}自己，不能算進去：後面 = ${t} − ${n} = ${t - n} 人。` };
    }
  });
  def({
    id: 'count-on', name: '往後數時把起點也算進去', robot: '數數機', grades: [1], units: ['1下-2 18 以內的加法'],
    wrong: '算 8 + 5 時，從 8 開始數「8、9、10、11、12」，把 8 也數進去，答案少了 1。',
    right: '往後數要從下一個數開始：8 + 5 → 9、10、11、12、13，數 5 下。',
    gen() {
      let a, b; do { a = ri(5, 9); b = ri(3, 9); } while (a + b < 11 || a + b > 18);
      const seq = []; for (let i = 0; i < b; i++) seq.push(a + i);
      return { q: `${a} + ${b} = ？`, input: 'num', ans: String(a + b), bug: String(a + b - 1), v: { a, b },
        steps: [`從 ${a} 開始往後數 ${b} 個數`, `數：${seq.join('、')}`, `答案是 ${a + b - 1}`], bad: 1, fix: `要從 ${a} 的下一個 ${a + 1} 開始數：${seq.map(x => x + 1).join('、')}，答案 ${a + b}。` };
    }
  });
  def({
    id: 'tens-ones', name: '十位和個位寫反', robot: '位值機', grades: [1, 2], units: ['1上-5 數到 30', '1下-1 數到 100'],
    wrong: '「4 個一和 3 個十」照說的順序寫成 43，十位和個位放錯了。',
    right: '幾個十寫在十位，幾個一寫在個位，和句子先說哪一個沒有關係。',
    gen() {
      let t, o; do { t = ri(1, 9); o = ri(1, 9); } while (t === o);
      return { q: `${o} 個一和 ${t} 個十合起來是多少？`, input: 'num', ans: String(10 * t + o), bug: String(10 * o + t), v: { t, o },
        steps: [`先看到 ${o} 個一，寫在十位：${o}`, `再看到 ${t} 個十，寫在個位：${t}`, `答案 ${10 * o + t}`], bad: 0, fix: `${t} 個十是 ${t * 10}，寫在十位；${o} 個一寫在個位：${10 * t + o}。` };
    }
  });
  def({
    id: 'clock-half', name: '半點時短針看錯數字', robot: '時鐘機', grades: [1], units: ['1上-9 讀鐘錶'],
    wrong: '短針在 3 和 4 中間，卻讀成 4 點半；短針還沒走到 4。',
    right: '半點時短針在兩個數字中間，要讀「已經走過」的那個數字（比較小的）。',
    gen() {
      const h = ri(1, 11);
      return { q: `時鐘的長針指著 6，短針在 ${h} 和 ${h + 1} 的中間，現在是幾點？`, fig: { type: 'clock', h, m: 30 }, input: 'choice',
        ans: `${h} 點半`, bug: `${h + 1} 點半`, opts: opts(`${h} 點半`, [`${h + 1} 點半`, `${h} 點`, `${h + 1} 點`]), v: { h },
        steps: ['長針指著 6，是半點', `短針在 ${h} 和 ${h + 1} 中間，看比較大的 ${h + 1}`, `是 ${h + 1} 點半`], bad: 1, fix: `短針走過 ${h}、還沒到 ${h + 1}，所以是 ${h} 點半。` };
    }
  });
  def({
    id: 'coins', name: '數錢只數個數，沒看面額', robot: '撲滿機', grades: [1], units: ['1下-7 錢幣'],
    wrong: '3 個 10 元加 2 個 1 元，數成「5 個」就說 5 元。',
    right: '每種錢幣先算錢：10 元 3 個是 30 元，再和 1 元的合起來。',
    gen() {
      const a = ri(1, 4), b = ri(0, 2), c = ri(1, 4), n = a + b + c, tot = 10 * a + 5 * b + c;
      const q = `撲滿裡有 ${a} 個 10 元${b ? `、${b} 個 5 元` : ''}和 ${c} 個 1 元，一共是幾元？`;
      return { q, input: 'num', ans: String(tot), bug: String(n), unit: '元', v: { a, b, c },
        steps: [`數一數，一共有 ${n} 個錢幣`, `一個錢幣算 1 元，所以是 ${n} 元`], bad: 1, fix: `10 元 ${a} 個是 ${10 * a} 元${b ? `，5 元 ${b} 個是 ${5 * b} 元` : ''}，再加 ${c} 元，一共 ${tot} 元。` };
    }
  });
  def({
    id: 'keyword', name: '看到「多」就用加、看到「少」就用減', robot: '關鍵字機', grades: [1, 2], units: ['1上-8 減一減與加減應用', '2上-4 加減的關係與應用'],
    wrong: '「紅花 15 朵，比黃花多 6 朵，黃花幾朵？」看到「多」就算 15 + 6。',
    right: '先想誰比較多：紅花比黃花多，黃花比較少，要用減法 15 − 6。不要只看關鍵字。',
    gen(g) {
      const A = g <= 1 ? ri(10, 18) : ri(30, 95), B = g <= 1 ? ri(2, 8) : ri(11, 28);
      if (Math.random() < .5) {
        const [x, y] = pick([['紅花', '黃花'], ['小狗', '小貓'], ['姊姊的貼紙', '妹妹的貼紙']]), u = x.includes('花') ? '朵' : x.includes('貼紙') ? '張' : '隻';
        return { q: `${x}有 ${A} ${u}，比${y}多 ${B} ${u}，${y}有幾${u}？`, input: 'eq', eq: [A, '−', B], unit: u, ans: String(A - B), bug: String(A + B), v: { A, B, k: 'more' },
          steps: ['題目有「多」，用加法', `${A} + ${B} = ${A + B}`, `${y}有 ${A + B} ${u}`], bad: 0, fix: `${x}比${y}多，表示${y}比較少，要用減法：${A} − ${B} = ${A - B}。` };
      }
      const [x, y] = pick([['小華', '哥哥'], ['弟弟', '姊姊'], ['小美', '爸爸']]);
      return { q: `${x}有 ${A} 元，比${y}少 ${B} 元，${y}有幾元？`, input: 'eq', eq: [A, '+', B], unit: '元', ans: String(A + B), bug: String(A - B), v: { A, B, k: 'less' },
        steps: ['題目有「少」，用減法', `${A} − ${B} = ${A - B}`, `${y}有 ${A - B} 元`], bad: 0, fix: `${x}比${y}少，表示${y}比較多，要用加法：${A} + ${B} = ${A + B}。` };
    }
  });
  function addCols(a, b) { // 進位沒加的步驟
    const A = dig(a), B = dig(b), L = A.length, steps = [], bads = []; let bad = -1, prev = 0;
    for (let i = 0; i < L; i++) {
      const s = A[i] + (B[i] || 0);
      if (prev >= 10) { bads.push(i); if (bad < 0) bad = i; }
      steps.push(B[i] === undefined ? `${PL[i]}：${A[i]} 照抄，寫 ${A[i]}` : `${PL[i]}：${A[i]} + ${B[i]} = ${s}，寫 ${i === L - 1 ? s : s % 10}`);
      prev = s;
    }
    return { steps, bad, bads };
  }
  def({
    id: 'carry', name: '進位沒加', robot: '加法機', grades: [1, 2, 3], units: ['1下-8 二位數的加減', '2上-2 二位數的加減', '3上-2 四位數的加減'],
    wrong: '個位滿 10 進 1 到十位，算十位時忘了加上這個 1，答案少了 10（或 100）。',
    right: '直式加法從個位算起，滿 10 就在上一位寫小小的 1，算上一位時一定要加進去。',
    gen(g) {
      let a, b;
      for (;;) {
        if (g <= 1) { a = ri(11, 49); b = ri(2, 9); } else if (g === 2) { a = ri(15, 79); b = ri(12, 49); } else { a = ri(1200, 6999); b = ri(150, 2999); }
        if (a + b > (g <= 1 ? 60 : g === 2 ? 99 : 9999)) continue;
        const { bad } = addCols(a, b);
        if (bad >= 0 && noCarryAdd(a, b) !== a + b) break;
      }
      const c = addCols(a, b), bug = noCarryAdd(a, b);
      return { q: `用直式算：${a} + ${b} = ？`, input: 'num', ans: String(a + b), bug: String(bug), v: { a, b }, expr: `${a}+${b}`,
        steps: c.steps.concat([`答案 ${bug}`]), bad: c.bad, bads: c.bads, fix: `${PL[c.bad - 1]}滿 10 要進 1，${PL[c.bad]}要再加 1。正確答案 ${a + b}。` };
    }
  });
  def({
    id: 'big-small', name: '個位不夠減，就倒過來用大減小', robot: '減法機', grades: [1, 2, 3], units: ['1下-4 18 以內的減法', '1下-8 二位數的加減', '2上-2 二位數的加減', '3上-2 四位數的加減'],
    wrong: '43 − 7，個位 3 不夠減 7，就改算 7 − 3 = 4，寫成 44。',
    right: '不夠減要向前一位借 1（當 10）：13 − 7 = 6，前一位少 1。減法不能把上下倒過來。',
    gen(g) {
      let a, b;
      for (;;) {
        if (g <= 1) { a = ri(21, 59); b = ri(3, 9); } else if (g === 2) { a = ri(31, 98); b = ri(12, 69); } else { a = ri(2100, 9899); b = ri(120, 1999); }
        if (b >= a) continue;
        const A = dig(a), B = dig(b);
        if (A.includes(0) || !(A[0] < B[0])) continue;
        if (absDiffSub(a, b) !== a - b) break;
      }
      const A = dig(a), B = dig(b), steps = [], bads = []; let bad = -1;
      for (let i = 0; i < A.length; i++) {
        if (B[i] === undefined) { steps.push(`${PL[i]}：${A[i]} 照抄，寫 ${A[i]}`); continue; }
        if (A[i] < B[i]) { bads.push(i); if (bad < 0) bad = i; steps.push(`${PL[i]}：${A[i]} 不夠減 ${B[i]}，改算 ${B[i]} − ${A[i]} = ${B[i] - A[i]}`); }
        else steps.push(`${PL[i]}：${A[i]} − ${B[i]} = ${A[i] - B[i]}`);
      }
      const bug = absDiffSub(a, b);
      return { q: `用直式算：${a} − ${b} = ？`, input: 'num', ans: String(a - b), bug: String(bug), v: { a, b }, expr: `${a}-${b}`,
        steps: steps.concat([`答案 ${bug}`]), bad, bads, fix: `${PL[bad]}不夠減要向前借 1：${A[bad] + 10} − ${B[bad]} = ${A[bad] + 10 - B[bad]}。正確答案 ${a - b}。` };
    }
  });
  def({
    id: 'borrow-forget', name: '借位後忘記減 1', robot: '借位機', grades: [1, 2, 3], units: ['1下-8 二位數的加減', '2上-2 二位數的加減', '3上-2 四位數的加減'],
    wrong: '52 − 18，個位借 1 變 12 − 8 = 4，十位卻還用 5 − 1 = 4，寫成 44。',
    right: '被借走的那一位要先減 1（在數字上畫斜線寫小一號的數），再往下算。',
    gen(g) {
      let a, b;
      for (;;) {
        if (g <= 1) { a = ri(21, 59); b = ri(3, 9); } else if (g === 2) { a = ri(31, 98); b = ri(12, 69); } else { a = ri(2100, 9899); b = ri(120, 1999); }
        if (b >= a) continue;
        const A = dig(a), B = dig(b);
        if (A.includes(0) || !(A[0] < B[0])) continue;
        if (borrowNoDec(a, b) !== a - b) break;
      }
      const A = dig(a), B = dig(b), steps = [], bads = []; let bad = -1, br = false;
      for (let i = 0; i < A.length; i++) {
        if (br) { bads.push(i); if (bad < 0) bad = i; }
        const bi = B[i] || 0; let d = A[i] - bi; br = false;
        if (d < 0) { steps.push(`${PL[i]}：${A[i]} 不夠減，借 1 當 10：${A[i] + 10} − ${bi} = ${d + 10}`); br = true; }
        else steps.push(B[i] === undefined ? `${PL[i]}：${A[i]} 照抄，寫 ${A[i]}` : `${PL[i]}：${A[i]} − ${bi} = ${d}`);
      }
      const bug = borrowNoDec(a, b);
      return { q: `用直式算：${a} − ${b} = ？`, input: 'num', ans: String(a - b), bug: String(bug), v: { a, b }, expr: `${a}-${b}`,
        steps: steps.concat([`答案 ${bug}`]), bad, bads, fix: `${PL[bad]}已經被借走 1，要先變成 ${A[bad] - 1} 再減。正確答案 ${a - b}。` };
    }
  });

  /* ===== 二年級 ===== */
  def({
    id: 'ruler-start', name: '量長度沒有從 0 開始算', robot: '尺規機', grades: [2], units: ['2上-3 幾公分'],
    wrong: '鉛筆一端對 2、另一端對 9，就說長 9 公分。',
    right: '沒有對齊 0 時，長度 = 尾端刻度 − 起點刻度，或數中間有幾個 1 公分。',
    gen() {
      const s = ri(1, 5), L = ri(3, 9), e = s + L;
      return { q: `鉛筆的一端對準尺上的 ${s}，另一端對準 ${e}。鉛筆長幾公分？`, fig: { type: 'ruler', s, e }, input: 'num', ans: String(L), bug: String(e), unit: '公分', v: { s, e },
        steps: [`看鉛筆尾端對到的刻度：${e}`, `所以鉛筆長 ${e} 公分`], bad: 1, fix: `起點在 ${s} 不在 0，長度 = ${e} − ${s} = ${L} 公分。` };
    }
  });
  def({
    id: 'align', name: '直式數位沒有對齊', robot: '對齊機', grades: [2, 3], units: ['2下-2 加加減減', '3上-2 四位數的加減'],
    wrong: '352 + 46 寫直式時把 46 靠左寫，變成算 352 + 460。',
    right: '直式要「個位對個位、十位對十位」，數字靠右對齊。',
    gen(g) {
      let a, b, k;
      for (;;) {
        if (g <= 2) { a = ri(101, 899); b = ri(11, 89); } else { a = ri(1001, 8999); b = pick([ri(11, 99), ri(101, 999)]); }
        k = Math.pow(10, String(a).length - String(b).length);
        if (a + b * k < (g <= 2 ? 1000 : 10000) && b % 10) break;
      }
      const bug = a + b * k;
      return { q: `用直式算：${a} + ${b} = ？`, input: 'num', ans: String(a + b), bug: String(bug), v: { a, b }, expr: `${a}+${b}`,
        steps: [`把 ${b} 寫在 ${a} 下面，左邊對齊`, `等於在算 ${a} + ${b * k}`, `答案 ${bug}`], bad: 0, fix: `${b} 的個位要對齊 ${a} 的個位（靠右）。${a} + ${b} = ${a + b}。` };
    }
  });
  def({
    id: 'inverse', name: '求 □ 時加減用反', robot: '方格機', grades: [2, 3], units: ['2上-4 加減的關係與應用', '3下-8 乘除的應用'],
    wrong: '□ − 18 = 25，看到減號就算 25 − 18 = 7。',
    right: '用「部分和全部」想：□ − 18 = 25，□ 是全部，□ = 25 + 18。算完代回去驗算。',
    gen(g) {
      const big = g >= 3;
      if (Math.random() < .5) {
        let b, c; do { b = big ? ri(105, 480) : ri(11, 39); c = big ? ri(b + 20, 520) : ri(b + 3, 59); } while (b === c);
        return { q: `□ − ${b} = ${c}，□ 是多少？`, input: 'num', ans: String(b + c), bug: String(c - b), v: { b, c, k: 'sub' },
          steps: ['看到減號，就用減的', `${c} − ${b} = ${c - b}`, `□ = ${c - b}`], bad: 0, fix: `□ 是被減數（全部）：□ = ${c} + ${b} = ${b + c}。驗算 ${b + c} − ${b} = ${c}。` };
      }
      let a, c; do { a = big ? ri(300, 900) : ri(40, 99); c = big ? ri(110, a - 50) : ri(12, a - 10); } while (a - c === c);
      return { q: `${a} − □ = ${c}，□ 是多少？`, input: 'num', ans: String(a - c), bug: String(a + c), v: { a, c, k: 'sub2' },
        steps: ['□ 在減號後面，把兩個數加起來', `${a} + ${c} = ${a + c}`, `□ = ${a + c}`], bad: 0, fix: `${a} 是全部，拿走 □ 剩 ${c}：□ = ${a} − ${c} = ${a - c}。` };
    }
  });
  def({
    id: 'mult-add', name: '「幾個幾」用加的', robot: '倍數機', grades: [2], units: ['2上-7 2、5、4、8 的乘法', '2上-9 3、6、7、9 的乘法'],
    wrong: '「5 個 3」算成 5 + 3 = 8。',
    right: '5 個 3 是 3 + 3 + 3 + 3 + 3，用乘法 3 × 5 = 15。',
    gen() {
      let a, b; do { a = ri(2, 9); b = ri(2, 9); } while (a + b === a * b);
      const q = Math.random() < .5 ? `${a} 個 ${b} 是多少？` : `每盤有 ${b} 顆草莓，${a} 盤一共有幾顆？`;
      return { q, input: 'num', ans: String(a * b), bug: String(a + b), v: { a, b },
        steps: [`把 ${a} 和 ${b} 合起來`, `${a} + ${b} = ${a + b}`], bad: 0, fix: `${a} 個 ${b} 是 ${b} 連加 ${a} 次：${b} × ${a} = ${a * b}。` };
    }
  });
  def({
    id: 'clock-minute', name: '長針指的數字直接當分鐘', robot: '分針機', grades: [2, 3], units: ['2上-8 幾時幾分', '3下-3 時間'],
    wrong: '長針指著 4，就讀成「4 分」。',
    right: '長針走一大格是 5 分鐘：指著 4 是 4 × 5 = 20 分。',
    gen() {
      const h = ri(1, 11), k = ri(1, 11), m = 5 * k;
      return { q: `短針在 ${h} 和 ${h + 1} 之間，長針指著數字 ${k}。現在是幾時幾分？`, fig: { type: 'clock', h, m }, input: 'choice',
        ans: `${h} 時 ${m} 分`, bug: `${h} 時 ${k} 分`, opts: opts(`${h} 時 ${m} 分`, [`${h} 時 ${k} 分`, `${h + 1} 時 ${m} 分`, `${k} 時 ${h * 5} 分`, `${h} 時 ${m + 5 < 60 ? m + 5 : m - 5} 分`]), v: { h, k },
        steps: [`短針過了 ${h}，是 ${h} 時`, `長針指著 ${k}，是 ${k} 分`], bad: 1, fix: `長針一大格 5 分鐘，指著 ${k} 是 ${k} × 5 = ${m} 分，${h} 時 ${m} 分。` };
    }
  });
  def({
    id: 'mult-zero', name: '乘 0、乘 10 算錯', robot: '零號機', grades: [2], units: ['2下-5 0、1、10 的乘法'],
    wrong: '7 × 0 寫成 7（以為乘 0 不會變），或 6 × 10 寫成 16。',
    right: '7 個 0 還是 0，0 個 7 也是 0；乘 10 是在後面加一個 0：6 × 10 = 60。',
    gen() {
      const a = ri(2, 9), r = Math.random();
      if (r < .35) return { q: `${a} × 0 = ？`, input: 'num', ans: '0', bug: String(a), v: { a, k: 'x0' }, steps: [`看到 ${a} × 0`, `乘 0 等於沒有乘，還是 ${a}`, `答案 ${a}`], bad: 1, fix: `${a} × 0 是 ${a} 個 0，0 + 0 + … = 0。` };
      if (r < .6) return { q: `0 × ${a} = ？`, input: 'num', ans: '0', bug: String(a), v: { a, k: '0x' }, steps: [`看到 0 × ${a}`, `0 不算，答案就是 ${a}`, `答案 ${a}`], bad: 1, fix: `0 × ${a} 是 0 個 ${a}，什麼都沒有，答案 0。` };
      return { q: `${a} × 10 = ？`, input: 'num', ans: String(a * 10), bug: String(a + 10), v: { a, k: 'x10' }, steps: [`${a} × 10`, `把 ${a} 和 10 合起來：${a + 10}`], bad: 1, fix: `${a} 個 10 是 ${a * 10}（${a} 後面加一個 0）。` };
    }
  });
  def({
    id: 'm-cm', name: '公尺換公分忘了補 0', robot: '量尺機', grades: [2, 3], units: ['2下-3 幾公尺'],
    wrong: '1 公尺 5 公分寫成 15 公分。',
    right: '1 公尺 = 100 公分：1 公尺 5 公分 = 100 + 5 = 105 公分，十位要補 0。',
    gen() {
      const m = ri(1, 9), c = ri(1, 9);
      return { q: `${m} 公尺 ${c} 公分 = ？公分`, input: 'num', ans: String(100 * m + c), bug: `${m}${c}`, unit: '公分', v: { m, c },
        steps: [`${m} 公尺寫成 ${m}`, `後面接上 ${c} 公分：${m}${c}`, `答案 ${m}${c} 公分`], bad: 0, fix: `${m} 公尺 = ${m * 100} 公分，再加 ${c} 公分 = ${100 * m + c} 公分。` };
    }
  });
  def({
    id: 'two-step', name: '兩步驟的題目只算一步', robot: '雙步機', grades: [2, 3], units: ['2上-6 兩步驟的加減', '2下-7 兩步驟的計算', '3下-4 兩步驟的計算'],
    wrong: '「原有 50 個，賣掉 12 個，又進貨 20 個」只算 50 − 12 就停了。',
    right: '先畫圖或一句一句讀：題目有兩個變化，就要算兩步。最後再讀一次問題。',
    gen(g) {
      if (g >= 3 || (g === 2 && Math.random() < .4)) {
        let A, B, C; do { A = ri(3, 9); B = ri(4, 9); C = ri(3, A * B - 2); } while (A * B - C < 1);
        return { q: `一盒有 ${A} 顆蛋，買了 ${B} 盒，打破了 ${C} 顆，還剩幾顆？`, input: 'eq', eq: [[A, '×', B], ['R', '−', C]], alt: [[[B, '×', A], ['R', '−', C]]], unit: '顆', ans: String(A * B - C), bug: String(A * B), v: { A, B, C, k: 'mul' },
          steps: [`${A} × ${B} = ${A * B}`, `還剩 ${A * B} 顆`], bad: 1, fix: `買來的 ${A * B} 顆還要減掉打破的 ${C} 顆：${A * B} − ${C} = ${A * B - C}。` };
      }
      let A, B, C; do { A = ri(40, 80); B = ri(11, 35); C = ri(10, 40); } while (A - B + C > 99 || A - B < 5);
      return { q: `商店原有 ${A} 個麵包，賣掉 ${B} 個，又做好 ${C} 個，現在有幾個？`, input: 'eq', eq: [[A, '−', B], ['R', '+', C]], alt: [[[A, '+', C], ['R', '−', B]]], unit: '個', ans: String(A - B + C), bug: String(A - B), v: { A, B, C, k: 'add' },
        steps: [`${A} − ${B} = ${A - B}`, `現在有 ${A - B} 個`], bad: 1, fix: `還要加上又做好的 ${C} 個：${A - B} + ${C} = ${A - B + C}。` };
    }
  });
  def({
    id: 'unit-frac', name: '單位分數：分母大就以為比較大', robot: '分數機', grades: [2, 3], units: ['2下-9 單位分數', '3上-8 分數'],
    wrong: '以為 1/5 比 1/3 大，因為 5 比 3 大。',
    right: '同一個東西分成越多份，每一份就越小：1/3 > 1/5。',
    gen() {
      let a, b; do { a = ri(2, 8); b = ri(3, 10); } while (a >= b);
      const ask = Math.random() < .6 ? '大' : '小', ans = ask === '大' ? `1/${a}` : `1/${b}`, bug = ask === '大' ? `1/${b}` : `1/${a}`;
      return { q: `一樣大的蛋糕，1/${a} 個和 1/${b} 個，哪一個比較${ask}？`, input: 'choice', ans, bug, opts: opts(ans, [bug, '一樣大']), v: { a, b, ask },
        steps: ask === '大' ? [`比較分母：${b} 比 ${a} 大`, `所以 1/${b} 比較大`] : [`比較分母：${a} 比 ${b} 小`, `所以 1/${a} 比較小`], bad: 1, fix: `分成 ${b} 份比分成 ${a} 份，每份更小：1/${a} > 1/${b}。` };
    }
  });

  /* ===== 三年級 ===== */
  def({
    id: 'borrow-zero', name: '中間有 0 的連續退位', robot: '零位機', grades: [3], units: ['3上-2 四位數的加減'],
    wrong: '403 − 158，十位的 0 被借之後當成 10，忘了它也借給個位，應該剩 9。',
    right: '0 不夠借，要再向百位借：百位 4 → 3，十位 0 → 10，借 1 給個位後變 9。',
    gen() {
      let a2, a1, b2, bt, b1;
      do { a2 = ri(2, 9); a1 = ri(0, 7); b1 = ri(a1 + 1, 9); bt = ri(1, 9); b2 = ri(0, a2 - 1); } while (a2 * 100 + a1 - (b2 * 100 + bt * 10 + b1) < 10);
      const a = a2 * 100 + a1, b = b2 * 100 + bt * 10 + b1, ans = a - b, bug = ans + 10;
      return { q: `用直式算：${a} − ${b} = ？`, input: 'num', ans: String(ans), bug: String(bug), v: { a, b }, expr: `${a}-${b}`,
        steps: [`個位：${a1} 不夠減 ${b1}，向前借：${a1 + 10} − ${b1} = ${a1 + 10 - b1}`, `十位：0 被借成 10，10 − ${bt} = ${10 - bt}`, `百位：${a2} 借出 1 變 ${a2 - 1}，${a2 - 1} − ${b2} = ${a2 - 1 - b2}`, `答案 ${bug}`], bad: 1,
        fix: `十位的 0 先向百位借成 10，又借 1 給個位，只剩 9：9 − ${bt} = ${9 - bt}。正確答案 ${ans}。` };
    }
  });
  def({
    id: 'mul-carry', name: '乘法直式進位沒加', robot: '乘法機', grades: [3, 4], units: ['3上-3 乘法', '4上-2 乘法'],
    wrong: '47 × 6：7 × 6 = 42 寫 2，4 × 6 = 24 直接寫，忘了加進位的 4，寫成 242。',
    right: '每一位乘完要加上前一位的進位：4 × 6 + 4 = 28，答案 282。',
    gen(g) {
      let a, k;
      for (;;) { a = g <= 3 ? ri(12, 389) : ri(1012, 4999); k = ri(3, 9); const A = dig(a); if (A.includes(0)) continue; let ok = false; for (let i = 0; i < A.length - 1; i++) if (A[i] * k >= 10) ok = true; if (ok && mulNoCarry(a, k) !== a * k) break; }
      const A = dig(a), steps = [], bads = []; let bad = -1, prev = 0;
      for (let i = 0; i < A.length; i++) { const p = A[i] * k; if (prev >= 10) { bads.push(i); if (bad < 0) bad = i; } steps.push(`${PL[i]}：${A[i]} × ${k} = ${p}，寫 ${i === A.length - 1 ? p : p % 10}`); prev = p; }
      const bug = mulNoCarry(a, k);
      return { q: `用直式算：${a} × ${k} = ？`, input: 'num', ans: String(a * k), bug: String(bug), v: { a, k }, expr: `${a}×${k}`,
        steps: steps.concat([`答案 ${bug}`]), bad, bads, fix: `${PL[bad]}乘完要加上前一位進上來的數。正確答案 ${a * k}。` };
    }
  });
  def({
    id: 'div-remainder', name: '餘數比除數大', robot: '分裝機', grades: [3], units: ['3上-6 除法', '3下-1 除法'],
    wrong: '29 ÷ 4 = 6 … 5，餘 5 比除數 4 大，還可以再分一次。',
    right: '餘數一定要比除數小；餘數 ≥ 除數時，商要再加 1。',
    gen(g) {
      const d = ri(3, 9), q = ri(3, g >= 3 ? 12 : 9), r = ri(0, d - 1), n = q * d + r;
      return { q: `${n} ÷ ${d} = ？（商和餘數各是多少）`, input: 'fields', fields: [{ k: 'q', label: '商' }, { k: 'r', label: '餘' }], ans: { q, r }, bug: { q: q - 1, r: r + d }, v: { n, d },
        steps: [`想 ${d} 的乘法：${d} × ${q - 1} = ${d * (q - 1)}`, `商 ${q - 1}，${n} − ${d * (q - 1)} = ${r + d}`, `答案：商 ${q - 1} 餘 ${r + d}`], bad: 2,
        fix: `餘 ${r + d} 比除數 ${d} 大，還能再分一次：${d} × ${q} = ${d * q}，商 ${q} 餘 ${r}。` };
    }
  });
  def({
    id: 'thousand-unit', name: '千進位單位換算少補 0', robot: '換算機', grades: [3, 4], units: ['3上-7 公升和毫升', '3下-6 公斤和公克', '4上-10 長度'],
    wrong: '2 公升 50 毫升寫成 250 毫升。',
    right: '1 公升 = 1000 毫升（公斤和公克、公里和公尺也一樣）：2 公升 50 毫升 = 2050 毫升。',
    gen(g) {
      const P = g >= 4 ? pick([['公升', '毫升'], ['公斤', '公克'], ['公里', '公尺']]) : pick([['公升', '毫升'], ['公斤', '公克']]);
      const big = ri(1, 9), small = pick([ri(1, 9), ri(10, 99)]);
      return { q: `${big} ${P[0]} ${small} ${P[1]} = ？${P[1]}`, input: 'num', ans: String(1000 * big + small), bug: `${big}${small}`, unit: P[1], v: { big, small },
        steps: [`${big} ${P[0]}寫 ${big}`, `後面接 ${small}：${big}${small}`, `答案 ${big}${small} ${P[1]}`], bad: 0,
        fix: `1 ${P[0]} = 1000 ${P[1]}，${big} ${P[0]} = ${big * 1000} ${P[1]}，再加 ${small}：${1000 * big + small} ${P[1]}。` };
    }
  });
  def({
    id: 'mm-cm', name: '公分毫米當成 100 倍', robot: '毫米機', grades: [3], units: ['3上-4 幾毫米'],
    wrong: '以為 1 公分 = 100 毫米，3 公分 5 毫米寫成 305 毫米。',
    right: '1 公分 = 10 毫米：3 公分 5 毫米 = 30 + 5 = 35 毫米。',
    gen() {
      const c = ri(2, 15), m = ri(1, 9);
      return { q: `${c} 公分 ${m} 毫米 = ？毫米`, input: 'num', ans: String(10 * c + m), bug: String(100 * c + m), unit: '毫米', v: { c, m },
        steps: ['1 公分 = 100 毫米', `${c} 公分 = ${100 * c} 毫米`, `再加 ${m}：${100 * c + m} 毫米`], bad: 0, fix: `1 公分 = 10 毫米，${c} 公分 = ${10 * c} 毫米，再加 ${m} = ${10 * c + m} 毫米。` };
    }
  });
  def({
    id: 'radius-diameter', name: '半徑和直徑搞混', robot: '圓規機', grades: [3, 6], units: ['3上-9 圓', '6上-4 圓周長和圓面積'],
    wrong: '半徑 6 公分，就說直徑也是 6 公分。',
    right: '直徑穿過圓心，是半徑的 2 倍：直徑 = 半徑 × 2，半徑 = 直徑 ÷ 2。',
    gen() {
      if (Math.random() < .5) { const r = ri(2, 15); return { q: `一個圓的半徑是 ${r} 公分，直徑是幾公分？`, input: 'num', ans: String(2 * r), bug: String(r), unit: '公分', v: { r, k: 'd' }, steps: ['半徑和直徑都是從圓上量的線', `所以直徑也是 ${r} 公分`], bad: 1, fix: `直徑是半徑的 2 倍：${r} × 2 = ${2 * r} 公分。` }; }
      const d = 2 * ri(2, 15);
      return { q: `一個圓的直徑是 ${d} 公分，半徑是幾公分？`, input: 'num', ans: String(d / 2), bug: String(d * 2), unit: '公分', v: { d, k: 'r' }, steps: ['半徑比直徑長', `半徑 = ${d} × 2 = ${d * 2} 公分`], bad: 0, fix: `半徑只有直徑的一半：${d} ÷ 2 = ${d / 2} 公分。` };
    }
  });
  def({
    id: 'elapsed-60', name: '經過時間當成 100 進位', robot: '計時機', grades: [3, 4], units: ['3下-3 時間', '4下-9 時間的加減'],
    wrong: '9 時 40 分到 10 時 10 分，用 1010 − 940 = 70，說經過 70 分鐘。',
    right: '1 小時是 60 分不是 100 分：9 時 40 分 → 10 時要 20 分，再到 10 時 10 分又 10 分，共 30 分鐘。',
    gen() {
      const h = ri(7, 10), m1 = 5 * ri(7, 11), m2 = 5 * ri(1, 5), ans = 60 - m1 + m2, bug = ans + 40;
      return { q: `從上午 ${h} 時 ${m1} 分到 ${h + 1} 時 ${pad2(m2)} 分，經過幾分鐘？`, input: 'num', ans: String(ans), bug: String(bug), unit: '分鐘', v: { h, m1, m2 },
        steps: [`把時間寫成整數：${h}${m1} 和 ${h + 1}${pad2(m2)}`, `${h + 1}${pad2(m2)} − ${h}${m1} = ${bug}`, `經過 ${bug} 分鐘`], bad: 0,
        fix: `${h} 時 ${m1} 分到 ${h + 1} 時是 ${60 - m1} 分，再到 ${h + 1} 時 ${pad2(m2)} 分是 ${m2} 分，共 ${ans} 分鐘。` };
    }
  });
  def({
    id: 'same-den-add', name: '分數相加，分母也相加', robot: '同分母機', grades: [3, 4], units: ['3下-7 分數的加減', '4下-3 分數的加減和整數倍'],
    wrong: '2/7 + 3/7 算成 5/14，分母也加起來了。',
    right: '分母一樣，表示每一份一樣大；只把份數（分子）相加：2/7 + 3/7 = 5/7。',
    gen() {
      let d, a, b; do { d = ri(5, 12); a = ri(1, d - 2); b = ri(1, d - 2); } while (a + b >= d);
      return { q: `${a}/${d} + ${b}/${d} = ？`, input: 'frac', ans: `${a + b}/${d}`, bug: `${a + b}/${2 * d}`, v: { a, b, d }, expr: `${a}/${d}+${b}/${d}`,
        steps: [`分子相加：${a} + ${b} = ${a + b}`, `分母相加：${d} + ${d} = ${2 * d}`, `答案 ${a + b}/${2 * d}`], bad: 1, fix: `分母 ${d} 不變（一份還是一樣大），${a} 份加 ${b} 份是 ${a + b} 份：${a + b}/${d}。` };
    }
  });
  def({
    id: 'div-zero-quot', name: '商的中間漏寫 0', robot: '除法機', grades: [3, 4], units: ['3下-1 除法', '4上-4 除法'],
    wrong: '624 ÷ 3，十位 2 不夠除 3 就跳過，商寫成 28（應該是 208）。',
    right: '某一位不夠除，要在商的那一位寫 0 佔位，再往下一位算。',
    gen(g) {
      let x, y, d, n; do { x = ri(1, 9); y = ri(1, 9); d = ri(2, 9); n = (100 * x + y) * d; } while (n > (g <= 3 ? 999 : 9999));
      const q = 100 * x + y;
      return { q: `用直式算：${n} ÷ ${d} = ？`, input: 'num', ans: String(q), bug: `${x}${y}`, v: { n, d }, expr: `${n}÷${d}`,
        steps: [`先算前面：商 ${x}`, '十位不夠除，跳過', `個位：商 ${y}`, `答案 ${x}${y}`], bad: 1, fix: `十位不夠除要在商的十位寫 0：${n} ÷ ${d} = ${q}。驗算 ${q} × ${d} = ${n}。` };
    }
  });
  def({
    id: 'mul-div-choice', name: '該用除法卻用乘法', robot: '乘除機', grades: [3, 4], units: ['3上-6 除法', '3下-8 乘除的應用', '4上-4 除法'],
    wrong: '「56 瓶飲料，每箱裝 8 瓶，可以裝幾箱？」算成 56 × 8。',
    right: '知道「全部」和「每份幾個」，求「幾份」用除法：56 ÷ 8 = 7 箱。先估一下答案合不合理。',
    gen(g, o) {
      const each = ri(3, 9), cnt = ri(3, g >= 4 ? 25 : 9), tot = each * cnt, r = o && o.demo ? 0 : Math.random();
      if (r < .4) return { q: `有 ${tot} 瓶飲料，每箱裝 ${each} 瓶，可以裝成幾箱？`, input: 'eq', eq: [tot, '÷', each], unit: '箱', ans: String(cnt), bug: String(tot * each), v: { tot, each, k: 'box' },
        steps: ['題目有「每箱」，用乘法', `${tot} × ${each} = ${tot * each}`, `可以裝 ${tot * each} 箱`], bad: 0, fix: `全部 ${tot} 瓶、每箱 ${each} 瓶，求幾箱用除法：${tot} ÷ ${each} = ${cnt} 箱。` };
      if (r < .7) return { q: `${tot} 顆糖平分給 ${cnt} 個小朋友，每人分到幾顆？`, input: 'eq', eq: [tot, '÷', cnt], unit: '顆', ans: String(each), bug: String(tot * cnt), v: { tot, cnt, k: 'share' },
        steps: ['分給好幾個人，用乘法', `${tot} × ${cnt} = ${tot * cnt}`], bad: 0, fix: `平分用除法：${tot} ÷ ${cnt} = ${each} 顆。` };
      return { q: `每包有 ${each} 片餅乾，買了 ${cnt} 包，一共有幾片？`, input: 'eq', eq: [each, '×', cnt], unit: '片', ans: String(tot), bug: String(each + cnt), v: { each, cnt, k: 'mul' },
        steps: ['把兩個數合起來', `${each} + ${cnt} = ${each + cnt}`], bad: 0, fix: `每包一樣多、有好幾包，用乘法：${each} × ${cnt} = ${tot} 片。` };
    }
  });
  def({
    id: 'decimal-tenths', name: '「幾個 0.1」放錯位置', robot: '小數機', grades: [3], units: ['3下-9 小數'],
    wrong: '「3 個 0.1 和 2 個 1」寫成 3.2。',
    right: '幾個 1 寫在個位，幾個 0.1 寫在小數點後第一位：2 個 1 和 3 個 0.1 = 2.3。',
    gen() {
      let a, b; do { a = ri(1, 9); b = ri(1, 9); } while (a === b);
      return { q: `${b} 個 0.1 和 ${a} 個 1 合起來是多少？`, input: 'num', ans: `${a}.${b}`, bug: `${b}.${a}`, v: { a, b },
        steps: [`先寫 ${b} 個 0.1，寫在個位：${b}`, `再寫 ${a} 個 1，寫在小數點後：${b}.${a}`], bad: 0, fix: `0.1 要寫在小數點後第一位，1 寫在個位：${a}.${b}。` };
    }
  });

  /* ===== 四年級 ===== */
  def({
    id: 'frac-of-whole', name: '「幾分之幾盒」只算了一份', robot: '分糖機', grades: [4], units: ['4上-6 分數'],
    wrong: '一盒 12 顆，3/4 盒算成 3 顆（只算 1/4 盒的量）。',
    right: '先算 1 份：12 ÷ 4 = 3 顆；3/4 盒是 3 份：3 × 3 = 9 顆。',
    gen() {
      const d = pick([3, 4, 5, 6, 8]), k = ri(2, 6), n = ri(2, d - 1), T = d * k;
      return { q: `一盒有 ${T} 顆糖，${n}/${d} 盒是幾顆？`, input: 'num', ans: String(k * n), bug: String(k), unit: '顆', v: { T, n, d },
        steps: [`${T} 顆分成 ${d} 份，一份 ${k} 顆`, `所以 ${n}/${d} 盒是 ${k} 顆`], bad: 1, fix: `${n}/${d} 盒是 ${n} 份：${k} × ${n} = ${k * n} 顆。` };
    }
  });
  def({
    id: 'decimal-compare', name: '小數比大小只看位數多', robot: '比較機', grades: [4], units: ['4上-9 小數'],
    wrong: '以為 0.45 比 0.5 大，因為 45 比 5 大。',
    right: '從整數、十分位、百分位一位一位比：0.5 的十分位是 5，0.45 是 4，所以 0.5 比較大。',
    gen() {
      const w = ri(0, 9); let a, bc; do { a = ri(2, 9); bc = ri(10, 99); } while (Math.floor(bc / 10) >= a || bc % 10 === 0);
      const A = `${w}.${a}`, B = `${w}.${bc}`;
      return { q: `${A} 和 ${B}，哪一個比較大？`, input: 'choice', ans: A, bug: B, opts: opts(A, [B, '一樣大']), v: { A, B },
        steps: [`比小數點後面：${bc} 比 ${a} 大`, `所以 ${B} 比較大`], bad: 0, fix: `先比十分位：${a} 比 ${Math.floor(bc / 10)} 大，所以 ${A} 比較大。` };
    }
  });
  def({
    id: 'big-number-zero', name: '大數讀寫漏了 0', robot: '大數機', grades: [4], units: ['4上-1 一億以內的數'],
    wrong: '「三千零五萬零二十」寫成 305020，萬後面的位數沒補 0。',
    right: '萬的後面一定還有千、百、十、個 4 位，不夠的位要寫 0：3005 0020 → 30050020。',
    gen() {
      let w, b; do { w = ri(1001, 9909); b = pick([ri(1, 9), 10 * ri(2, 9), 10 * ri(2, 9) + ri(1, 9), 100 * ri(1, 9) + ri(0, 9)]); } while (!/0/.test(String(w)));
      const n = w * 10000 + b, bug = `${w}${b}`;
      return { q: `「${zhNum(n)}」寫成數字是多少？`, input: 'num', ans: String(n), bug, v: { n },
        steps: [`${zh4(w)}萬 → 寫 ${w}`, `${zh4(b, true)} → 寫 ${b}`, `接起來：${bug}`], bad: 2, fix: `萬的後面要有 4 位：${b} 寫成 ${String(b).padStart(4, '0')}，所以是 ${n}。` };
    }
  });
  def({
    id: 'mul-shift', name: '乘法第二行沒有往左移一位', robot: '錯位機', grades: [4], units: ['4上-2 乘法', '4下-1 多位數的乘與除'],
    wrong: '234 × 56：234 × 6 = 1404，234 × 5 = 1170 卻和上一行對齊，加起來 2574。',
    right: '第二行是 234 × 50（5 個十），要往左移一位，個位留空（或寫 0）。',
    gen() {
      const a = ri(12, 389), b1 = ri(1, 9), b2 = ri(2, 9), b = 10 * b2 + b1, bug = a * b1 + a * b2;
      return { q: `用直式算：${a} × ${b} = ？`, input: 'num', ans: String(a * b), bug: String(bug), v: { a, b }, expr: `${a}×${b}`,
        steps: [`${a} × ${b1} = ${a * b1}`, `${a} × ${b2} = ${a * b2}，和上一行靠右對齊`, `相加：${a * b1} + ${a * b2} = ${bug}`], bad: 1,
        fix: `${b2} 在十位，是 ${a} × ${b2 * 10} = ${a * b2 * 10}，要往左移一位。${a * b1} + ${a * b2 * 10} = ${a * b}。` };
    }
  });
  def({
    id: 'protractor', name: '量角器內圈外圈讀錯', robot: '量角機', grades: [4], units: ['4上-3 角度'],
    wrong: '一邊對準內圈的 0，卻去讀外圈的數字，40° 讀成 140°。',
    right: '角的一邊對準哪一圈的 0，就讀哪一圈。讀完看一下：銳角要小於 90°，鈍角要大於 90°。',
    gen() {
      let x; do { x = 5 * ri(3, 33); } while (Math.abs(x - 90) < 15);
      return { q: `角的一邊對準量角器「內圈」的 0，另一邊指著內圈 ${x}、外圈 ${180 - x}。這個角是幾度？`, fig: { type: 'protractor', x }, input: 'num', ans: String(x), bug: String(180 - x), unit: '度', v: { x },
        steps: [`另一邊指著外圈的 ${180 - x}`, `所以角是 ${180 - x} 度`], bad: 0, fix: `從內圈的 0 開始量，就要讀內圈：${x} 度。這個角是${x < 90 ? '銳角，比 90 度小' : '鈍角，比 90 度大'}。` };
    }
  });
  def({
    id: 'mixed-improper', name: '帶分數化假分數算錯', robot: '假分數機', grades: [4, 5], units: ['4上-6 分數'],
    wrong: '把 2又3/5 看成 2 × 3/5，寫成 6/5。',
    right: '帶分數是「整數 + 分數」：2又3/5 = 10/5 + 3/5 = 13/5（整數 × 分母 + 分子）。',
    gen() {
      let w, n, d; do { w = ri(1, 5); d = ri(2, 9); n = ri(1, d - 1); } while (w * n === w * d + n);
      return { q: `把 ${w}又${n}/${d} 化成假分數。`, input: 'frac', form: 'improper', ans: `${w * d + n}/${d}`, bug: `${w * n}/${d}`, v: { w, n, d },
        steps: [`${w}又${n}/${d} 就是 ${w} × ${n}/${d}`, `= ${w * n}/${d}`], bad: 0, fix: `${w} = ${w * d}/${d}，再加 ${n}/${d}：${w * d + n}/${d}。` };
    }
  });
  def({
    id: 'order-ops', name: '四則運算沒有先乘除後加減', robot: '順序機', grades: [4, 5, 6], units: ['4上-8 整數四則', '5上-7 整數四則計算', '6下-1 四則混合運算'],
    wrong: '20 + 4 × 5 從左邊算成 24 × 5 = 120。',
    right: '沒有括號時先乘除、後加減：20 + 4 × 5 = 20 + 20 = 40。',
    gen(g) {
      const big = g >= 5, a = ri(big ? 20 : 5, big ? 200 : 60), b = ri(2, big ? 25 : 9), c = ri(2, 9), r = Math.random();
      if (r < .5) return { q: `${a} + ${b} × ${c} = ？`, input: 'num', ans: String(a + b * c), bug: String((a + b) * c), v: { a, b, c, k: '+x' }, expr: `${a}+${b}×${c}`,
        steps: [`先算 ${a} + ${b} = ${a + b}`, `再算 ${a + b} × ${c} = ${(a + b) * c}`], bad: 0, fix: `先乘後加：${b} × ${c} = ${b * c}，${a} + ${b * c} = ${a + b * c}。` };
      if (r < .75) { const a2 = b * c + ri(5, 60); return { q: `${a2} − ${b} × ${c} = ？`, input: 'num', ans: String(a2 - b * c), bug: String((a2 - b) * c), v: { a: a2, b, c, k: '-x' }, expr: `${a2}-${b}×${c}`,
        steps: [`先算 ${a2} − ${b} = ${a2 - b}`, `再算 ${a2 - b} × ${c} = ${(a2 - b) * c}`], bad: 0, fix: `先乘後減：${b} × ${c} = ${b * c}，${a2} − ${b * c} = ${a2 - b * c}。` }; }
      const q = ri(2, 12), bb = q * c;
      return { q: `${a} + ${bb} ÷ ${c} = ？`, input: 'num', ans: String(a + q), bug: S(Q(a + bb, c)), v: { a, b: bb, c, k: '+/' }, expr: `${a}+${bb}÷${c}`,
        steps: [`先算 ${a} + ${bb} = ${a + bb}`, `再算 ${a + bb} ÷ ${c}`], bad: 0, fix: `先除後加：${bb} ÷ ${c} = ${q}，${a} + ${q} = ${a + q}。` };
    }
  });
  def({
    id: 'left-right', name: '同級運算沒有由左往右算', robot: '方向機', grades: [4, 5, 6], units: ['4上-8 整數四則', '5上-7 整數四則計算'],
    wrong: '36 ÷ 6 × 2 先算 6 × 2，變成 36 ÷ 12 = 3。',
    right: '只有乘除（或只有加減）時，從左往右算：36 ÷ 6 = 6，6 × 2 = 12。',
    gen() {
      if (Math.random() < .5) {
        const b = ri(2, 6), c = ri(2, 5), k = ri(2, 6), a = b * c * k;
        return { q: `${a} ÷ ${b} × ${c} = ？`, input: 'num', ans: String(a / b * c), bug: String(k), v: { a, b, c, k: '/x' }, expr: `${a}÷${b}×${c}`,
          steps: [`先算 ${b} × ${c} = ${b * c}`, `${a} ÷ ${b * c} = ${k}`], bad: 0, fix: `由左往右：${a} ÷ ${b} = ${a / b}，${a / b} × ${c} = ${a / b * c}。` };
      }
      const b = ri(12, 40), c = ri(5, 30), a = b + ri(20, 80);
      return { q: `${a} − ${b} + ${c} = ？`, input: 'num', ans: String(a - b + c), bug: String(a - b - c), v: { a, b, c, k: '-+' }, expr: `${a}-${b}+${c}`,
        steps: [`先算 ${b} + ${c} = ${b + c}`, `${a} − ${b + c} = ${a - b - c}`], bad: 0, fix: `由左往右：${a} − ${b} = ${a - b}，${a - b} + ${c} = ${a - b + c}。` };
    }
  });
  def({
    id: 'decimal-align', name: '小數加減沒有對齊小數點', robot: '小數點機', grades: [4, 5], units: ['4上-9 小數'],
    wrong: '3.5 + 1.24 把最後一位對齊，算成 35 + 124 → 1.59。',
    right: '小數加減要「小數點對齊」（位數不夠補 0）：3.50 + 1.24 = 4.74。',
    gen() {
      let x, y, bug, ans, op, raw;
      for (;;) {
        const xi = ri(11, 99), yi = ri(101, 999);
        if (xi % 10 === 0 || yi % 10 === 0) continue;
        if (Math.random() < .5) { op = '+'; x = dec(xi, 1); y = dec(yi, 2); ans = S(Q.add(x, y)); raw = xi + yi; }
        else { const x2 = yi + 1000; op = '−'; x = dec(x2, 2); y = dec(xi, 1); ans = S(Q.sub(x, y)); raw = x2 - xi; }
        bug = dec(raw, 2);
        if (bug !== ans) break;
      }
      const xs = x.replace('.', ''), ys = y.replace('.', '');
      return { q: `${x} ${op} ${y} = ？`, input: 'num', ans, bug, v: { x, y, op }, expr: `${x}${op === '+' ? '+' : '-'}${y}`,
        steps: ['把最後一位數字對齊', `${xs} ${op} ${ys} = ${raw}`, `點上兩位小數：${bug}`], bad: 0, fix: `小數點要對齊，位數不夠補 0：${x} ${op} ${y} = ${ans}。` };
    }
  });
  def({
    id: 'frac-times-int', name: '分數乘整數，分母也乘', robot: '倍數分數機', grades: [4, 5], units: ['4下-3 分數的加減和整數倍'],
    wrong: '2/9 × 4 算成 8/36，分子分母都乘 4（其實大小沒變）。',
    right: '2/9 × 4 是 4 個 2/9，份數變 4 倍，一份的大小不變：8/9。',
    gen() {
      const d = ri(5, 12), n = ri(1, 3), k = ri(2, 5);
      return { q: `${n}/${d} × ${k} = ？`, input: 'frac', ans: `${n * k}/${d}`, bug: `${n * k}/${d * k}`, v: { n, d, k }, expr: `${n}/${d}×${k}`,
        steps: [`分子乘 ${k}：${n * k}`, `分母也乘 ${k}：${d * k}`, `答案 ${n * k}/${d * k}`], bad: 1, fix: `${k} 個 ${n}/${d}，分母不變：${n * k}/${d}。` };
    }
  });
  def({
    id: 'rounding', name: '四捨五入看錯位', robot: '概數機', grades: [4], units: ['4下-4 概數'],
    wrong: '38572 四捨五入到千位，去看十位的 7 或個位，結果寫成 38000。',
    right: '四捨五入到哪一位，就看「它的下一位」：到千位看百位 5，5 以上要進 1 → 39000。',
    gen() {
      const P = pick([['千', 1000, '百', '十'], ['百', 100, '十', '個'], ['萬', 10000, '千', '百']]);
      let n, nd, wd; do { n = ri(21000, 98999); nd = Math.floor(n % P[1] / (P[1] / 10)); wd = Math.floor(n % (P[1] / 10) / (P[1] / 100)); } while (nd < 5 || wd >= 5);
      const ans = Math.round(n / P[1]) * P[1], bug = Math.floor(n / P[1]) * P[1];
      return { q: `${n} 用四捨五入法取概數到${P[0]}位，是多少？`, input: 'num', ans: String(ans), bug: String(bug), v: { n, p: P[1] },
        steps: [`看${P[3]}位：${wd}`, `${wd} 比 5 小，捨去`, `答案 ${bug}`], bad: 0,
        fix: `到${P[0]}位要看下一位（${P[2]}位）：${nd} ≥ 5，要進 1，答案 ${ans}。` };
    }
  });
  def({
    id: 'dec-times-int', name: '小數乘整數忘了點小數點', robot: '點點機', grades: [4, 5], units: ['4下-6 小數乘以整數', '5下-3 小數的乘法'],
    wrong: '0.25 × 6 先算 25 × 6 = 150，最後忘了點回小數點，答案寫 150。',
    right: '被乘數有幾位小數，積就點幾位：0.25 × 6 = 1.50 = 1.5。',
    gen() {
      let xi, k, kk; do { kk = pick([1, 2]); xi = kk === 1 ? ri(2, 99) : ri(12, 399); k = ri(3, 9); } while (xi % 10 === 0);
      const x = dec(xi, kk), ans = S(Q.mul(x, k));
      return { q: `${x} × ${k} = ？`, input: 'num', ans, bug: String(xi * k), v: { x, k }, expr: `${x}×${k}`,
        steps: [`先不管小數點：${xi} × ${k} = ${xi * k}`, `答案 ${xi * k}`], bad: 1, fix: `${x} 有 ${kk} 位小數，積也要點 ${kk} 位：${ans}。` };
    }
  });
  def({
    id: 'area-perimeter', name: '面積和周長搞混', robot: '圍牆機', grades: [4, 5], units: ['4下-7 周長和面積'],
    wrong: '問面積卻算了 (長 + 寬) × 2，問周長卻算了長 × 寬。',
    right: '周長是「繞一圈的長度」（公分）；面積是「裡面有多少格」（平方公分）= 長 × 寬。',
    gen() {
      let L, W; do { L = ri(4, 15); W = ri(2, L - 1); } while (L * W === 2 * (L + W));
      if (Math.random() < .55) return { q: `長 ${L} 公分、寬 ${W} 公分的長方形，面積是多少平方公分？`, input: 'num', ans: String(L * W), bug: String(2 * (L + W)), unit: '平方公分', v: { L, W, k: 'area' },
        steps: ['長方形面積 = (長 + 寬) × 2', `(${L} + ${W}) × 2 = ${2 * (L + W)}`], bad: 0, fix: `那是周長。面積 = 長 × 寬 = ${L} × ${W} = ${L * W} 平方公分。` };
      return { q: `長 ${L} 公分、寬 ${W} 公分的長方形，周長是多少公分？`, input: 'num', ans: String(2 * (L + W)), bug: String(L * W), unit: '公分', v: { L, W, k: 'peri' },
        steps: ['長方形周長 = 長 × 寬', `${L} × ${W} = ${L * W}`], bad: 0, fix: `那是面積。周長 = (長 + 寬) × 2 = (${L} + ${W}) × 2 = ${2 * (L + W)} 公分。` };
    }
  });
  def({
    id: 'equiv-frac', name: '等值分數用加的', robot: '擴分機', grades: [4, 5], units: ['4下-8 等值分數', '5上-4 擴分、約分和通分'],
    wrong: '3/4 = □/12，分母 4 → 12 加了 8，分子也加 8，寫成 11。',
    right: '分母乘幾倍，分子也乘幾倍：4 × 3 = 12，所以 3 × 3 = 9。',
    gen() {
      let a, b, k; do { b = ri(3, 9); a = ri(1, b - 1); k = ri(2, 5); } while (gcd(a, b) !== 1);
      return { q: `${a}/${b} = □/${b * k}，□ 是多少？`, input: 'num', ans: String(a * k), bug: String(a + b * k - b), v: { a, b, k },
        steps: [`分母 ${b} 變 ${b * k}，加了 ${b * k - b}`, `分子也加 ${b * k - b}：${a} + ${b * k - b} = ${a + b * k - b}`], bad: 0, fix: `${b} × ${k} = ${b * k}，分子也乘 ${k}：${a} × ${k} = ${a * k}。` };
    }
  });
  def({
    id: 'time-borrow', name: '時間相減，借 1 時當 100 分', robot: '時差機', grades: [4], units: ['4下-9 時間的加減'],
    wrong: '3 時 10 分 − 1 時 40 分，借 1 時變 110 分，算成 1 時 70 分。',
    right: '1 時 = 60 分，借 1 時是 60 分：70 − 40 = 30，答案 1 時 30 分。',
    gen() {
      const h2 = ri(1, 4), h1 = h2 + ri(2, 5), m1 = 5 * ri(0, 6), m2 = 5 * ri(m1 / 5 + 1, 11);
      const t = (h1 * 60 + m1) - (h2 * 60 + m2), ans = { h: Math.floor(t / 60), m: t % 60 }, bug = { h: h1 - 1 - h2, m: m1 + 100 - m2 };
      return { q: `${h1} 時 ${m1} 分 − ${h2} 時 ${m2} 分 = ？`, input: 'fields', fields: [{ k: 'h', label: '時' }, { k: 'm', label: '分' }], ans, bug, v: { h1, m1, h2, m2 },
        steps: [`分不夠減，向時借 1：${m1} + 100 = ${m1 + 100} 分`, `${m1 + 100} − ${m2} = ${m1 + 100 - m2} 分`, `${h1 - 1} − ${h2} = ${h1 - 1 - h2} 時`], bad: 0,
        fix: `借 1 時是 60 分：${m1 + 60} − ${m2} = ${m1 + 60 - m2} 分，答案 ${ans.h} 時 ${ans.m} 分。` };
    }
  });

  /* ===== 五年級 ===== */
  def({
    id: 'factor-multiple', name: '因數和倍數搞混', robot: '因倍機', grades: [5, 6], units: ['5上-2 因數和倍數', '6上-1 質因數分解和短除法'],
    wrong: '說 24 是 12 的因數（其實 24 是 12 的倍數）。',
    right: 'a ÷ b 能整除，b 是 a 的因數、a 是 b 的倍數。一個數的因數不會比它大。',
    gen() {
      const n = pick([12, 15, 16, 18, 20, 24, 28, 30, 36]); const fs = []; for (let i = 2; i < n; i++) if (n % i === 0) fs.push(i);
      const non = []; for (let i = 2; i < n; i++) if (n % i) non.push(i);
      if (Math.random() < .6) { const f = pick(fs), ans = String(f), bug = String(2 * n);
        return { q: `下面哪一個是 ${n} 的因數？`, input: 'choice', ans, bug, opts: opts(ans, [bug, ...shuffle(non).slice(0, 2)]), v: { n, k: 'f' },
          steps: [`${2 * n} ÷ ${n} = 2，可以整除`, `所以 ${2 * n} 是 ${n} 的因數`], bad: 1, fix: `${2 * n} ÷ ${n} 整除，表示 ${2 * n} 是 ${n} 的倍數。${n} ÷ ${f} 能整除，${f} 才是 ${n} 的因數。` }; }
      const ans = String(n * ri(2, 4)), bug = String(pick(fs));
      return { q: `下面哪一個是 ${n} 的倍數？`, input: 'choice', ans, bug, opts: opts(ans, [bug, String(n + pick([1, 2, 3])), String(n - 1)]), v: { n, k: 'm' },
        steps: [`${n} ÷ ${bug} 可以整除`, `所以 ${bug} 是 ${n} 的倍數`], bad: 1, fix: `${bug} 是 ${n} 的因數。${n} 的倍數是 ${n}、${2 * n}、${3 * n}…，答案 ${ans}。` };
    }
  });
  def({
    id: 'reduce', name: '約分沒有約到最簡', robot: '約分機', grades: [5, 6], units: ['5上-4 擴分、約分和通分', '5上-6 異分母分數的加減'],
    wrong: '12/18 只除以 2 變 6/9 就停了。',
    right: '約完要再檢查分子分母還有沒有公因數；用最大公因數一次約：12/18 = 2/3。',
    gen() {
      let p, q, k, f; do { q = ri(3, 9); p = ri(1, q - 1); k = pick([4, 6, 8, 9, 10, 12]); f = [2, 3, 5].find(x => k % x === 0); } while (gcd(p, q) !== 1);
      const n = p * k, d = q * k;
      return { q: `把 ${n}/${d} 約成最簡分數。`, input: 'frac', form: 'simplest', ans: `${p}/${q}`, bug: `${n / f}/${d / f}`, v: { n, d },
        steps: [`${n} 和 ${d} 都能被 ${f} 整除`, `約成 ${n / f}/${d / f}，完成`], bad: 1, fix: `${n / f} 和 ${d / f} 還能再約。${n} 和 ${d} 的最大公因數是 ${k}：${p}/${q}。` };
    }
  });
  def({
    id: 'unlike-frac', name: '異分母分數相加，分子分母各自相加', robot: '通分機', grades: [5], units: ['5上-6 異分母分數的加減'],
    wrong: '1/3 + 1/4 算成 2/7。',
    right: '分母不同（一份不一樣大）要先通分：1/3 + 1/4 = 4/12 + 3/12 = 7/12。',
    gen() {
      let a, b, c, d; do { b = ri(2, 9); d = ri(2, 9); a = ri(1, b - 1); c = ri(1, d - 1); } while (b === d || gcd(a, b) > 1 || gcd(c, d) > 1);
      const ans = Q.add(Q(a, b), Q(c, d));
      return { q: `${a}/${b} + ${c}/${d} = ？`, input: 'frac', ans: Q.frac(ans), bug: `${a + c}/${b + d}`, v: { a, b, c, d }, expr: `${a}/${b}+${c}/${d}`,
        steps: [`分子相加：${a} + ${c} = ${a + c}`, `分母相加：${b} + ${d} = ${b + d}`, `答案 ${a + c}/${b + d}`], bad: 1,
        fix: `分母不同要先通分（分母 ${lcm(b, d)}）：${a * lcm(b, d) / b}/${lcm(b, d)} + ${c * lcm(b, d) / d}/${lcm(b, d)} = ${Q.mixed(ans)}。` };
    }
  });
  def({
    id: 'triangle-half', name: '三角形、梯形面積忘了 ÷ 2', robot: '三角機', grades: [5], units: ['5上-8 平行四邊形、三角形和梯形的面積'],
    wrong: '底 8 公分、高 5 公分的三角形，面積算成 8 × 5 = 40。',
    right: '三角形是同底同高平行四邊形的一半：底 × 高 ÷ 2 = 20。梯形 = (上底 + 下底) × 高 ÷ 2。',
    gen() {
      if (Math.random() < .6) { const b = ri(4, 20), h = ri(3, 15), ans = S(Q(b * h, 2));
        return { q: `三角形的底是 ${b} 公分，高是 ${h} 公分，面積是多少平方公分？`, input: 'num', ans, bug: String(b * h), unit: '平方公分', v: { b, h, k: 'tri' },
          steps: ['三角形面積 = 底 × 高', `${b} × ${h} = ${b * h}`], bad: 0, fix: `三角形面積 = 底 × 高 ÷ 2 = ${b} × ${h} ÷ 2 = ${ans} 平方公分。` }; }
      const t = ri(3, 10), u = t + ri(2, 10), h = ri(2, 12), ans = S(Q((t + u) * h, 2));
      return { q: `梯形的上底 ${t} 公分、下底 ${u} 公分、高 ${h} 公分，面積是多少平方公分？`, input: 'num', ans, bug: String((t + u) * h), unit: '平方公分', v: { t, u, h, k: 'trap' },
        steps: ['梯形面積 = (上底 + 下底) × 高', `(${t} + ${u}) × ${h} = ${(t + u) * h}`], bad: 0, fix: `兩個一樣的梯形才拼成平行四邊形，要 ÷ 2：(${t} + ${u}) × ${h} ÷ 2 = ${ans} 平方公分。` };
    }
  });
  def({
    id: 'slant-height', name: '用斜邊當作高', robot: '高度機', grades: [5], units: ['5上-8 平行四邊形、三角形和梯形的面積'],
    wrong: '平行四邊形底 10、斜邊 6、高 5，面積算成 10 × 6 = 60。',
    right: '高是和底「垂直」的距離，不是斜斜的邊：面積 = 底 × 高 = 10 × 5 = 50。',
    gen() {
      const b = ri(6, 20), h = ri(3, 12), s = h + ri(1, 5);
      return { q: `平行四邊形的底是 ${b} 公分，斜邊長 ${s} 公分，底上的高是 ${h} 公分。面積是多少平方公分？`, input: 'num', ans: String(b * h), bug: String(b * s), unit: '平方公分', v: { b, h, s },
        steps: ['面積 = 底 × 斜邊', `${b} × ${s} = ${b * s}`], bad: 0, fix: `要用和底垂直的高：${b} × ${h} = ${b * h} 平方公分。` };
    }
  });
  def({
    id: 'time-multiply', name: '時間乘除用 100 進位', robot: '鐘錶機', grades: [5], units: ['5上-9 時間的乘除'],
    wrong: '每次 45 分鐘，4 次 = 180 分，寫成 1 時 80 分。',
    right: '60 分 = 1 時：180 分 ÷ 60 = 3，是 3 時 0 分。',
    gen() {
      let m, k, T; do { m = 5 * ri(5, 11); k = ri(2, 6); T = m * k; } while (T < 100 || (Math.floor(T / 100) === Math.floor(T / 60) && T % 100 === T % 60));
      return { q: `練琴每次 ${m} 分鐘，練了 ${k} 次，一共是幾時幾分？`, input: 'fields', fields: [{ k: 'h', label: '時' }, { k: 'm', label: '分' }], ans: { h: Math.floor(T / 60), m: T % 60 }, bug: { h: Math.floor(T / 100), m: T % 100 }, v: { m, k },
        steps: [`${m} × ${k} = ${T} 分`, `${T} 分 = ${Math.floor(T / 100)} 時 ${T % 100} 分`], bad: 1, fix: `60 分 = 1 時：${T} ÷ 60 = ${Math.floor(T / 60)} 餘 ${T % 60}，是 ${Math.floor(T / 60)} 時 ${T % 60} 分。` };
    }
  });
  def({
    id: 'mixed-times-int', name: '帶分數乘整數，只乘整數部分', robot: '帶分數機', grades: [5], units: ['5下-1 分數的計算'],
    wrong: '2又1/2 × 4 算成 8又1/2，分數部分沒有乘。',
    right: '整數和分數都要乘：2 × 4 + 1/2 × 4 = 8 + 2 = 10。或先化成假分數 5/2 × 4。',
    gen() {
      let w, n, d, j; do { d = ri(2, 6); n = ri(1, d - 1); w = ri(1, 5); j = ri(1, 3); } while (gcd(n, d) !== 1);
      const k = d * j, ans = w * k + n * j;
      return { q: `${w}又${n}/${d} × ${k} = ？`, input: 'frac', ans: String(ans), bug: `${w * k}又${n}/${d}`, v: { w, n, d, k }, expr: `${w}又${n}/${d}×${k}`,
        steps: [`整數部分：${w} × ${k} = ${w * k}`, `分數部分照抄：${n}/${d}`, `答案 ${w * k}又${n}/${d}`], bad: 1, fix: `分數部分也要乘：${n}/${d} × ${k} = ${n * j}，${w * k} + ${n * j} = ${ans}。` };
    }
  });
  def({
    id: 'dec-mult', name: '小數乘小數，小數位數點錯', robot: '位數機', grades: [5], units: ['5下-3 小數的乘法'],
    wrong: '0.3 × 0.4 算成 1.2（只點一位）。',
    right: '積的小數位數 = 兩個數的小數位數相加：一位 + 一位 = 兩位，0.3 × 0.4 = 0.12。',
    gen() {
      let xi, yi, kx, ky, bug, ans;
      for (;;) {
        kx = pick([1, 1, 2]); ky = 1; xi = kx === 1 ? ri(2, 99) : ri(11, 99); yi = ri(2, 9);
        if (xi % 10 === 0) continue;
        ans = S(Q.mul(dec(xi, kx), dec(yi, ky))); bug = dec(xi * yi, Math.max(kx, ky));
        if (bug !== ans) break;
      }
      const x = dec(xi, kx), y = dec(yi, ky);
      return { q: `${x} × ${y} = ？`, input: 'num', ans, bug, v: { x, y }, expr: `${x}×${y}`,
        steps: [`先算 ${xi} × ${yi} = ${xi * yi}`, `${x} 有 ${kx} 位小數，所以點 ${Math.max(kx, ky)} 位：${bug}`], bad: 1, fix: `兩數小數位數相加：${kx} + ${ky} = ${kx + ky} 位，答案 ${ans}。` };
    }
  });
  def({
    id: 'big-unit', name: '面積、體積單位換算倍數錯', robot: '大單位機', grades: [5, 6], units: ['5下-5 體積', '5下-7 生活中的大單位'],
    wrong: '以為 1 平方公尺 = 100 平方公分（其實是 10000）。',
    right: '1 公尺 = 100 公分，1 平方公尺 = 100 × 100 = 10000 平方公分；1 立方公尺 = 100 × 100 × 100 = 1000000 立方公分。',
    gen() {
      const x = ri(2, 9), P = pick([
        ['平方公尺', '平方公分', 10000, 100, '1 公尺 = 100 公分，所以 1 平方公尺 = 100 平方公分', '1 平方公尺 = 100 × 100 = 10000 平方公分'],
        ['立方公尺', '立方公分', 1000000, 100, '1 公尺 = 100 公分，所以 1 立方公尺 = 100 立方公分', '1 立方公尺 = 100 × 100 × 100 = 1000000 立方公分'],
        ['公頃', '平方公尺', 10000, 100, '1 公頃 = 100 平方公尺', '1 公頃 = 100 公畝 = 10000 平方公尺（100 公尺 × 100 公尺）']]);
      return { q: `${x} ${P[0]} = ？${P[1]}`, input: 'num', ans: String(x * P[2]), bug: String(x * P[3]), unit: P[1], v: { x, f: P[2] },
        steps: [P[4], `${x} ${P[0]} = ${x * P[3]} ${P[1]}`], bad: 0, fix: `${P[5]}，${x} ${P[0]} = ${x * P[2]} ${P[1]}。` };
    }
  });
  def({
    id: 'dec-div-int', name: '小數除以整數，商的小數點沒對齊', robot: '除點機', grades: [5], units: ['5下-6 整數、小數除以整數'],
    wrong: '4.8 ÷ 6 先算 48 ÷ 6 = 8，答案寫 8。',
    right: '商的小數點要和被除數的小數點對齊：4.8 ÷ 6 = 0.8。',
    gen() {
      let qi, k; do { qi = ri(2, 49); k = ri(2, 9); } while (qi % 10 === 0 || qi * k % 10 === 0);
      const x = dec(qi * k, 1), ans = dec(qi, 1);
      return { q: `${x} ÷ ${k} = ？`, input: 'num', ans, bug: String(qi), v: { x, k }, expr: `${x}÷${k}`,
        steps: [`先不看小數點：${qi * k} ÷ ${k} = ${qi}`, `答案 ${qi}`], bad: 1, fix: `商的小數點對齊被除數：${x} ÷ ${k} = ${ans}。驗算 ${ans} × ${k} = ${x}。` };
    }
  });
  def({
    id: 'percent', name: '百分率和小數換算錯', robot: '百分機', grades: [5, 6], units: ['5下-8 比率和百分率'],
    wrong: '0.6 寫成 6%，或 35% 寫成 3.5。',
    right: '百分率 = 小數 × 100：0.6 = 60%；小數 = 百分率 ÷ 100：35% = 0.35。',
    gen() {
      if (Math.random() < .5) { const p = ri(1, 9) * 10, x = dec(p, 2);
        return { q: `${x} 寫成百分率是多少 %？`, input: 'num', ans: String(p), bug: S(Q(p, 10)), unit: '%', v: { x, k: 'toP' }, steps: [`把 ${x} 的小數點後面直接加 %`, `答案 ${S(Q(p, 10))}%`], bad: 0, fix: `${x} × 100 = ${p}，是 ${p}%。` }; }
      let p; do { p = ri(11, 99); } while (p % 10 === 0);
      return { q: `${p}% 寫成小數是多少？`, input: 'num', ans: dec(p, 2), bug: dec(p, 1), v: { p, k: 'toD' }, steps: [`${p}% 去掉 %，點一位小數`, `答案 ${dec(p, 1)}`], bad: 0, fix: `${p}% = ${p} ÷ 100 = ${dec(p, 2)}。` };
    }
  });
  def({
    id: 'gcd-lcm', name: '最大公因數、最小公倍數用錯', robot: '公因機', grades: [5, 6], units: ['5上-2 因數和倍數', '6上-1 質因數分解和短除法'],
    wrong: '問「剪成一樣長、每段最長」卻去找最小公倍數。',
    right: '把東西「分成一樣多、最多/最長」→ 最大公因數；「每隔幾分一起出現、最少多久」→ 最小公倍數。',
    gen() {
      let a, b, G, L; do { a = ri(4, 30); b = ri(4, 30); G = gcd(a, b); L = lcm(a, b); } while (a === b || G < 2 || L > 120 || G === L || a % b === 0 || b % a === 0);
      if (Math.random() < .5) return { q: `兩條緞帶分別長 ${a} 公分和 ${b} 公分，要剪成一樣長而且都沒有剩，每段最長是幾公分？`, input: 'num', ans: String(G), bug: String(L), unit: '公分', v: { a, b, k: 'g' },
        steps: ['看到「最長」，找最小公倍數', `${a} 和 ${b} 的最小公倍數是 ${L}`], bad: 0, fix: `每段長度要同時能整除 ${a} 和 ${b}，是公因數；最長 → 最大公因數 ${G} 公分。` };
      return { q: `甲車每 ${a} 分鐘開一班，乙車每 ${b} 分鐘開一班。兩車同時開出後，至少再過幾分鐘又會同時開出？`, input: 'num', ans: String(L), bug: String(G), unit: '分鐘', v: { a, b, k: 'l' },
        steps: ['看到「至少」，找最大公因數', `${a} 和 ${b} 的最大公因數是 ${G}`], bad: 0, fix: `再同時開出的時間要同時是 ${a} 和 ${b} 的倍數；最少 → 最小公倍數 ${L} 分鐘。` };
    }
  });

  /* ===== 六年級 ===== */
  def({
    id: 'frac-div', name: '分數除法顛倒錯邊', robot: '顛倒機', grades: [6], units: ['6上-2 分數的除法'],
    wrong: '3/4 ÷ 2/5 把前面的 3/4 顛倒，算成 4/3 × 2/5。',
    right: '除以一個分數 = 乘以它的倒數，顛倒的是「除數」（後面那個）：3/4 × 5/2 = 15/8。',
    gen() {
      let a, b, c, d; do { b = ri(2, 9); a = ri(1, b - 1); d = ri(2, 9); c = ri(1, d - 1); } while (gcd(a, b) > 1 || gcd(c, d) > 1 || a * d === b * c);
      const ans = Q.div(Q(a, b), Q(c, d)), bug = Q.mul(Q(b, a), Q(c, d));
      return { q: `${a}/${b} ÷ ${c}/${d} = ？`, input: 'frac', ans: Q.frac(ans), bug: Q.frac(bug), v: { a, b, c, d }, expr: `${a}/${b}÷${c}/${d}`,
        steps: ['除以分數要把分數顛倒', `把 ${a}/${b} 顛倒成 ${b}/${a}`, `${b}/${a} × ${c}/${d} = ${Q.frac(bug)}`], bad: 1, fix: `顛倒的是除數 ${c}/${d} → ${d}/${c}：${a}/${b} × ${d}/${c} = ${Q.frac(ans)}。` };
    }
  });
  def({
    id: 'dec-div', name: '小數除以小數，只移了除數的小數點', robot: '移位機', grades: [6], units: ['6上-3 小數的除法'],
    wrong: '4.5 ÷ 0.5 把除數變成 5，被除數沒動，算成 4.5 ÷ 5 = 0.9。',
    right: '被除數和除數要「同時」乘 10（小數點一起移）：45 ÷ 5 = 9。',
    gen() {
      let yi, q; do { yi = ri(2, 9); q = ri(2, 25); } while (q % 10 === 0);
      const y = dec(yi, 1), x = dec(yi * q, 1);
      return { q: `${x} ÷ ${y} = ？`, input: 'num', ans: String(q), bug: S(Q(q, 10)), v: { x, y }, expr: `${x}÷${y}`,
        steps: [`除數 ${y} 的小數點右移一位變 ${yi}，被除數不動`, `${x} ÷ ${yi} = ${S(Q(q, 10))}`], bad: 0, fix: `兩個數一起乘 10：${yi * q} ÷ ${yi} = ${q}。` };
    }
  });
  def({
    id: 'circle-area', name: '圓面積公式用錯（直徑、周長混用）', robot: '圓形機', grades: [6], units: ['6上-4 圓周長和圓面積'],
    wrong: '直徑 10 公分的圓，面積算成 10 × 10 × 3.14；或用 半徑 × 2 × 3.14（那是圓周長）。',
    right: '圓面積 = 半徑 × 半徑 × 3.14；圓周長 = 直徑 × 3.14。先看題目給的是半徑還是直徑。',
    gen() {
      if (Math.random() < .5) { const r = ri(2, 10), d = 2 * r, ans = S(Q(r * r * 314, 100)), bug = S(Q(d * d * 314, 100));
        return { q: `直徑 ${d} 公分的圓，面積是多少平方公分？（圓周率用 3.14）`, input: 'num', ans, bug, unit: '平方公分', v: { r, k: 'd' },
          steps: ['圓面積 = 直徑 × 直徑 × 3.14', `${d} × ${d} × 3.14 = ${bug}`], bad: 0, fix: `要用半徑 ${d} ÷ 2 = ${r}：${r} × ${r} × 3.14 = ${ans} 平方公分。` }; }
      let r; do { r = ri(3, 10); } while (r === 2);
      const ans = S(Q(r * r * 314, 100)), bug = S(Q(2 * r * 314, 100));
      return { q: `半徑 ${r} 公分的圓，面積是多少平方公分？（圓周率用 3.14）`, input: 'num', ans, bug, unit: '平方公分', v: { r, k: 'r' },
        steps: ['圓面積 = 半徑 × 2 × 3.14', `${r} × 2 × 3.14 = ${bug}`], bad: 0, fix: `半徑 × 2 × 3.14 是圓周長。面積 = ${r} × ${r} × 3.14 = ${ans} 平方公分。` };
    }
  });
  def({
    id: 'ratio-order', name: '比值的前後項放反', robot: '比值機', grades: [6], units: ['6上-5 比和比值'],
    wrong: '男生 12 人、女生 18 人，「男生人數和女生人數的比」比值寫成 18 ÷ 12。',
    right: 'a : b 的比值 = a ÷ b（前項 ÷ 後項），照題目說的順序寫比。',
    gen() {
      let a, b; do { a = ri(4, 30); b = ri(4, 30); } while (a === b || gcd(a, b) === 1);
      const ans = Q.frac(Q(a, b)), bug = Q.frac(Q(b, a));
      return { q: `班上男生 ${a} 人、女生 ${b} 人。男生人數和女生人數的比，比值是多少？（用最簡分數或整數）`, input: 'frac', ans, bug, v: { a, b },
        steps: ['比值 = 後項 ÷ 前項', `${b} ÷ ${a} = ${bug}`], bad: 0, fix: `男生 : 女生 = ${a} : ${b}，比值 = ${a} ÷ ${b} = ${ans}。` };
    }
  });
  def({
    id: 'speed-unit', name: '速率題時間單位沒換算', robot: '速度機', grades: [6], units: ['6上-7 速率'],
    wrong: '時速 60 公里走 30 分鐘，算成 60 × 30 = 1800 公里。',
    right: '時速是「每 1 小時」，30 分 = 0.5 小時（30/60）：60 × 0.5 = 30 公里。',
    gen() {
      const t = pick([10, 15, 20, 30, 40, 45]), u = 60 / gcd(t, 60), v = u * ri(Math.ceil(24 / u), Math.floor(120 / u));
      const ans = v * t / 60;
      return { q: `汽車的時速是 ${v} 公里，${t} 分鐘可以走幾公里？`, input: 'num', ans: String(ans), bug: String(v * t), unit: '公里', v: { v, t },
        steps: ['距離 = 速率 × 時間', `${v} × ${t} = ${v * t} 公里`], bad: 1, fix: `時速要配「小時」：${t} 分 = ${t}/60 小時，${v} × ${t}/60 = ${ans} 公里。` };
    }
  });
  def({
    id: 'base-amount', name: '基準量看反（該除卻用乘）', robot: '基準機', grades: [6], units: ['6下-3 基準量和比較量'],
    wrong: '「弟弟有 40 元，是哥哥的 0.8 倍」，哥哥算成 40 × 0.8 = 32 元。',
    right: '「是誰的幾倍」的「誰」是基準量（1 倍）。比較量 ÷ 倍數 = 基準量：40 ÷ 0.8 = 50 元。',
    gen(g, o) {
      const p = pick(['0.2', '0.4', '0.5', '0.6', '0.8', '1.2', '1.5']), B = 10 * ri(2, 20), A = S(Q.mul(B, p));
      if ((o && o.demo) || Math.random() < .6) return { q: `弟弟有 ${A} 元，是哥哥的 ${p} 倍。哥哥有幾元？`, input: 'eq', eq: [A, '÷', p], unit: '元', ans: String(B), bug: S(Q.mul(A, p)), v: { A, p, k: 'base' },
        steps: [`「是哥哥的 ${p} 倍」，用乘的`, `${A} × ${p} = ${S(Q.mul(A, p))}`], bad: 0, fix: `哥哥是基準量（1 倍），弟弟 = 哥哥 × ${p}，所以哥哥 = ${A} ÷ ${p} = ${B} 元。` };
      return { q: `哥哥有 ${B} 元，弟弟的錢是哥哥的 ${p} 倍。弟弟有幾元？`, input: 'eq', eq: [B, '×', p], unit: '元', ans: String(A), bug: S(Q.div(B, p)), v: { B, p, k: 'cmp' },
        steps: ['求弟弟，用除的', `${B} ÷ ${p} = ${S(Q.div(B, p))}`], bad: 0, fix: `哥哥是基準量，弟弟是比較量：${B} × ${p} = ${A} 元。` };
    }
  });
  def({
    id: 'discount', name: '打折算成「便宜的錢」', robot: '折扣機', grades: [6], units: ['6下-3 基準量和比較量'],
    wrong: '原價 500 元打 8 折，算成 500 × 0.2 = 100 元（那是便宜的錢）；或以為便宜 8 成。',
    right: '打 8 折 = 付原價的 8 成 = × 0.8：500 × 0.8 = 400 元。',
    gen() {
      const P = 100 * ri(2, 15), k = ri(6, 9), ans = P * k / 10, bug = P * (10 - k) / 10;
      return { q: `一件衣服原價 ${P} 元，打 ${k} 折後要付幾元？`, input: 'num', ans: String(ans), bug: String(bug), unit: '元', v: { P, k },
        steps: [`打 ${k} 折，是便宜了 ${k} 成，要付 ${10 - k} 成`, `${P} × 0.${10 - k} = ${bug}`], bad: 0, fix: `打 ${k} 折是付原價的 ${k} 成：${P} × 0.${k} = ${ans} 元。` };
    }
  });
  def({
    id: 'scale', name: '比例尺換算單位錯', robot: '地圖機', grades: [6], units: ['6下-4 放大圖、縮圖和比例尺'],
    wrong: '比例尺 1 : 50000，圖上 3 公分，實際 150000 公分，換成公里時只除以 1000，寫成 150 公里。',
    right: '1 公里 = 1000 公尺 = 100000 公分：150000 公分 = 1.5 公里。',
    gen() {
      const S0 = pick([10000, 20000, 25000, 50000, 100000, 200000]), c = ri(2, 9), cm = c * S0, ans = S(Q(cm, 100000)), bug = S(Q(cm, 1000));
      return { q: `地圖的比例尺是 1 : ${S0}，圖上 ${c} 公分，實際距離是幾公里？`, input: 'num', ans, bug, unit: '公里', v: { S0, c },
        steps: [`實際 = ${c} × ${S0} = ${cm} 公分`, `${cm} 公分 = ${cm} ÷ 1000 = ${bug} 公里`], bad: 1, fix: `1 公里 = 100000 公分：${cm} ÷ 100000 = ${ans} 公里。` };
    }
  });
  def({
    id: 'cylinder', name: '圓柱體積用圓周長當底面積', robot: '圓柱機', grades: [6], units: ['6下-6 柱體的體積和表面積'],
    wrong: '圓柱體積用 半徑 × 2 × 3.14 × 高（那是側面積）。',
    right: '柱體體積 = 底面積 × 高，圓的底面積 = 半徑 × 半徑 × 3.14。',
    gen() {
      let r; do { r = ri(3, 10); } while (r === 2);
      const h = ri(2, 12), ans = S(Q(r * r * 314 * h, 100)), bug = S(Q(2 * r * 314 * h, 100));
      return { q: `圓柱的底面半徑是 ${r} 公分、高 ${h} 公分，體積是多少立方公分？（圓周率用 3.14）`, input: 'num', ans, bug, unit: '立方公分', v: { r, h },
        steps: ['底面積 = 半徑 × 2 × 3.14', `${r} × 2 × 3.14 × ${h} = ${bug}`], bad: 0, fix: `底面積 = ${r} × ${r} × 3.14 = ${S(Q(r * r * 314, 100))}，體積 = ${S(Q(r * r * 314, 100))} × ${h} = ${ans} 立方公分。` };
    }
  });

  /* ---------- 作答判斷 ---------- */
  function normAns(s) { return String(s === undefined || s === null ? '' : s).replace(/\s/g, ''); }
  function check(p, given) {
    if (p.input === 'choice') return normAns(given) === normAns(p.ans);
    if (p.input === 'fields') return Object.keys(p.ans).every(k => Q.eq(Q.parse(given && given[k]) || Q(-99999), Q(p.ans[k])));
    const g = Q.parse(given); if (!g) return false;
    if (!Q.eq(g, Q.parse(p.ans))) return false;
    const s = normAns(given);
    if (p.form === 'improper') return /^\d+\/\d+$/.test(s) && (() => { const [n, d] = s.split('/').map(Number); return n >= d; })();
    if (p.form === 'simplest') {
      if (/\./.test(s)) return false;
      let m = s.match(/(\d+)\/(\d+)$/); if (!m) return Q.of(g).d === 1;
      return gcd(+m[1], +m[2]) === 1 && +m[2] !== 1;
    }
    return true;
  }
  function fmtAns(p, a) {
    a = a === undefined ? p.ans : a;
    if (p.input === 'fields') return p.fields.map(f => a[f.k] + ' ' + f.label).join(' ');
    return String(a) + (p.unit && p.input !== 'choice' ? ' ' + p.unit : '');
  }
  // 列式：算式的結果（精確分數）
  function eqCalc(a, op, b) { return op === '+' ? Q.add(a, b) : op === '−' ? Q.sub(a, b) : op === '×' ? Q.mul(a, b) : Q.div(a, b); }
  function eqValue(eq) { const rows = Array.isArray(eq[0]) ? eq : [eq]; let R = null; rows.forEach(r => { const v = r.map(x => x === 'R' ? R : Q.of(x)); R = eqCalc(v[0], r[1], v[2]); }); return R; }

  const byId = {}; T.forEach(t => { byId[t.id] = t; });
  const api = { types: T, byId, Q, check, fmtAns, eqCalc, eqValue, gcd, lcm, noCarryAdd, absDiffSub, borrowNoDec, mulNoCarry, zhNum,
    forGrade: g => T.filter(t => t.grades.includes(+g)),
    gen(id, g, o) { const t = byId[id]; if (!t) return null; g = t.grades.includes(+g) ? +g : t.grades[0]; const p = t.gen(g, o || {}); p.type = id; return p; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FixDB = api;
})(typeof window !== 'undefined' ? window : globalThis);
