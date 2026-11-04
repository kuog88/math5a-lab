// 每個出題函式在每個適用年級跑 300 次，用「另外寫的解法」驗算答案。
// 執行：node publish/math5a-lab/fix-lab/tests/verify.test.js
const D = require('../errors.js'), { Q } = D;
const N = +(process.argv[2] || 300);
const g2 = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
const num = s => Q.parse(s);
const r100 = (x) => Q(Math.round(x * 100), 100); // 有限位小數用
// 獨立解法：只看出題數字 v（或題目文字），不用出題函式算好的答案
const SOLVE = {
  'count-order': v => v.k === 'front' ? v.n - 1 : v.t - v.n,
  'count-on': v => v.a + v.b,
  'tens-ones': v => v.t * 10 + v.o,
  'clock-half': v => `${v.h} 點半`,
  'coins': v => v.a * 10 + v.b * 5 + v.c,
  'keyword': v => v.k === 'more' ? v.A - v.B : v.A + v.B,
  'carry': v => v.a + v.b, 'big-small': v => v.a - v.b, 'borrow-forget': v => v.a - v.b, 'borrow-zero': v => v.a - v.b,
  'ruler-start': v => v.e - v.s,
  'align': v => v.a + v.b,
  'inverse': v => v.k === 'sub' ? v.b + v.c : v.a - v.c,
  'mult-add': v => v.a * v.b,
  'clock-minute': v => `${v.h} 時 ${v.k * 5} 分`,
  'mult-zero': v => v.k === 'x10' ? v.a * 10 : 0,
  'm-cm': v => v.m * 100 + v.c,
  'two-step': v => v.k === 'mul' ? v.A * v.B - v.C : v.A - v.B + v.C,
  'unit-frac': v => v.ask === '大' ? `1/${Math.min(v.a, v.b)}` : `1/${Math.max(v.a, v.b)}`,
  'mul-carry': v => v.a * v.k,
  'div-remainder': v => ({ q: Math.floor(v.n / v.d), r: v.n % v.d }),
  'thousand-unit': v => v.big * 1000 + v.small,
  'mm-cm': v => v.c * 10 + v.m,
  'radius-diameter': v => v.k === 'd' ? v.r * 2 : v.d / 2,
  'elapsed-60': v => ((v.h + 1) * 60 + v.m2) - (v.h * 60 + v.m1),
  'same-den-add': v => Q(v.a + v.b, v.d),
  'div-zero-quot': v => v.n / v.d,
  'mul-div-choice': v => v.k === 'box' ? v.tot / v.each : v.k === 'share' ? v.tot / v.cnt : v.each * v.cnt,
  'decimal-tenths': v => Q(v.a * 10 + v.b, 10),
  'frac-of-whole': v => v.T / v.d * v.n,
  'decimal-compare': v => (parseFloat(v.A) > parseFloat(v.B) ? v.A : v.B),
  'big-number-zero': v => v.n,
  'mul-shift': v => v.a * v.b,
  'protractor': v => v.x,
  'mixed-improper': v => Q(v.w * v.d + v.n, v.d),
  'order-ops': v => v.k === '+x' ? v.a + v.b * v.c : v.k === '-x' ? v.a - v.b * v.c : v.a + v.b / v.c,
  'left-right': v => v.k === '/x' ? v.a / v.b * v.c : v.a - v.b + v.c,
  'decimal-align': v => r100(v.op === '+' ? parseFloat(v.x) + parseFloat(v.y) : parseFloat(v.x) - parseFloat(v.y)),
  'frac-times-int': v => Q(v.n * v.k, v.d),
  'rounding': v => Math.round(v.n / v.p) * v.p,
  'dec-times-int': v => r100(parseFloat(v.x) * v.k * 10) && Q(Math.round(parseFloat(v.x) * 1000) * v.k, 1000),
  'area-perimeter': v => v.k === 'area' ? v.L * v.W : 2 * (v.L + v.W),
  'equiv-frac': v => v.a * v.k,
  'time-borrow': v => { const t = v.h1 * 60 + v.m1 - v.h2 * 60 - v.m2; return { h: Math.floor(t / 60), m: t % 60 }; },
  'factor-multiple': (v, p) => p.opts.find(o => v.k === 'f' ? (v.n % +o === 0 && +o < v.n) : (+o % v.n === 0)),
  'reduce': v => { const g = g2(v.n, v.d); return Q(v.n / g, v.d / g); },
  'unlike-frac': v => Q(v.a * v.d + v.c * v.b, v.b * v.d),
  'triangle-half': v => v.k === 'tri' ? Q(v.b * v.h, 2) : Q((v.t + v.u) * v.h, 2),
  'slant-height': v => v.b * v.h,
  'time-multiply': v => ({ h: Math.floor(v.m * v.k / 60), m: v.m * v.k % 60 }),
  'mixed-times-int': v => Q((v.w * v.d + v.n) * v.k, v.d),
  'dec-mult': v => Q(Math.round(parseFloat(v.x) * 100) * Math.round(parseFloat(v.y) * 10), 1000),
  'big-unit': v => v.x * v.f,
  'dec-div-int': v => Q(Math.round(parseFloat(v.x) * 10), 10 * v.k),
  'percent': v => v.k === 'toP' ? Math.round(parseFloat(v.x) * 100) : Q(v.p, 100),
  'gcd-lcm': v => v.k === 'g' ? g2(v.a, v.b) : v.a * v.b / g2(v.a, v.b),
  'frac-div': v => Q(v.a * v.d, v.b * v.c),
  'dec-div': v => Math.round(parseFloat(v.x) * 10) / Math.round(parseFloat(v.y) * 10),
  'circle-area': v => Q(v.r * v.r * 314, 100),
  'ratio-order': v => Q(v.a, v.b),
  'speed-unit': v => Q(v.v * v.t, 60),
  'base-amount': v => v.k === 'base' ? Q.div(v.A, v.p) : Q.mul(v.B, v.p),
  'discount': v => v.P * v.k / 10,
  'scale': v => Q(v.c * v.S0, 100000),
  'cylinder': v => Q(v.r * v.r * 314 * v.h, 100),
};
const same = (p, a, b) => {
  if (p.input === 'choice') return String(a) === String(b);
  if (p.input === 'fields') return Object.keys(a).every(k => +a[k] === +b[k]);
  return Q.eq(Q.of(typeof a === 'object' ? a : String(a)), Q.of(typeof b === 'object' ? b : String(b)));
};
let fails = 0, total = 0; const errs = [];
function bad(t, g, msg, p) { fails++; if (errs.length < 40) errs.push(`[${t.id} g${g}] ${msg}\n   ${JSON.stringify(p).slice(0, 300)}`); }
for (const t of D.types) {
  if (!SOLVE[t.id]) { bad(t, 0, '缺少獨立解法', {}); continue; }
  for (const g of t.grades) for (let i = 0; i < N; i++) {
    total++;
    const p = D.gen(t.id, g, i % 3 === 0 ? { demo: true } : {});
    const text = [p.q, ...(p.steps || []), p.fix].join('|');
    if (/undefined|NaN|null|Infinity|\[object/.test(text)) bad(t, g, '文字有 undefined/NaN', p);
    if (/國小|五福/.test(text)) bad(t, g, '出現校名', p);
    if (!(p.steps && p.steps.length >= 2 && p.bad >= 0 && p.bad < p.steps.length)) bad(t, g, '示範步驟或錯的那一步不正確', p);
    if (p.bads && !(p.bads.includes(p.bad) && p.bads.every(x => x >= 0 && x < p.steps.length - 1))) bad(t, g, 'bads 不正確', p);
    const want = SOLVE[t.id](p.v, p);
    if (!same(p, p.ans, want)) bad(t, g, `答案不對：出題 ${JSON.stringify(p.ans)}，驗算 ${JSON.stringify(want && want.n !== undefined ? Q.str(want) : want)}`, p);
    if (p.form ? String(p.ans) === String(p.bug) : same(p, p.ans, p.bug)) bad(t, g, '錯誤答案竟然和正確答案一樣', p);
    if (!D.check(p, p.ans)) bad(t, g, '正確答案被判錯', p);
    if (D.check(p, p.bug)) bad(t, g, '錯誤答案被判對', p);
    if (p.input !== 'choice' && p.input !== 'fields') { const a = num(p.ans); if (!a || a.n < 0) bad(t, g, '答案不是正數', p); }
    if (p.input === 'fields') { if (Object.values(p.ans).some(x => !(Number.isInteger(x) && x >= 0))) bad(t, g, '多格答案不是非負整數', p); }
    if (p.input === 'choice') {
      if (!p.opts.includes(p.ans) || new Set(p.opts).size !== p.opts.length || p.opts.length < 2) bad(t, g, '選項有問題', p);
      if (!p.opts.includes(p.bug)) bad(t, g, '錯誤答案沒有放進選項', p);
    }
    if (p.input === 'eq') {
      if (!Q.eq(D.eqValue(p.eq), num(p.ans))) bad(t, g, '列式算出來和答案不同', p);
      (p.alt || []).forEach(a => { if (!Q.eq(D.eqValue(a), num(p.ans))) bad(t, g, '另一種列法算出來不同', p); });
      const nums = (p.q.match(/\d+(?:\.\d+)?/g) || []).map(x => Q.str(num(x)));
      const used = [].concat(...(Array.isArray(p.eq[0]) ? p.eq : [p.eq]).map(r => [r[0], r[2]])).filter(x => x !== 'R').map(x => Q.str(Q.of(String(x))));
      if (!used.every(x => nums.includes(x))) bad(t, g, '列式用到題目裡沒有的數字', p);
      // 每一步都要是整數或有限小數、不能是負數
      let R = null; (Array.isArray(p.eq[0]) ? p.eq : [p.eq]).forEach(r => { R = D.eqCalc(r[0] === 'R' ? R : Q.of(String(r[0])), r[1], r[2] === 'R' ? R : Q.of(String(r[2]))); if (R.n < 0 || !Q.isDec(R)) bad(t, g, '列式中間結果是負數或除不盡', p); });
    }
  }
}
// 作答判斷的幾個邊界
const chk = [
  [{ input: 'frac', ans: '13/5', form: 'improper' }, '13/5', true], [{ input: 'frac', ans: '13/5', form: 'improper' }, '2又3/5', false],
  [{ input: 'frac', ans: '2/3', form: 'simplest' }, '4/6', false], [{ input: 'frac', ans: '2/3', form: 'simplest' }, '2/3', true],
  [{ input: 'frac', ans: '7/12' }, '14/24', true], [{ input: 'num', ans: '1.5' }, '1.50', true], [{ input: 'num', ans: '1.5' }, '15', false],
  [{ input: 'frac', ans: '10' }, '10', true], [{ input: 'frac', ans: '10' }, '8又1/2', false], [{ input: 'num', ans: '0.12' }, '.12', true],
];
chk.forEach(([p, a, w]) => { total++; if (D.check(p, a) !== w) { fails++; errs.push(`check(${JSON.stringify(p)}, ${a}) 應該是 ${w}`); } });
console.log(`錯誤類型 ${D.types.length} 類；每年級：${[1, 2, 3, 4, 5, 6].map(g => g + '年級 ' + D.forGrade(g).length).join('、')}`);
console.log(`共驗證 ${total} 題，失敗 ${fails}`);
errs.forEach(e => console.log(' ✗ ' + e));
process.exit(fails ? 1 : 0);
