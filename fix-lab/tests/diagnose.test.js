// 自動判斷測試：① 每一類的錯誤答案丟回去，看能不能認出來 ② 假的 kg-report-v1 資料
// 執行：node publish/math5a-lab/fix-lab/tests/diagnose.test.js
const D = require('../errors.js'), X = require('../diagnose.js');
const fmt = (p, v) => p.input === 'fields' ? (p.fields[0].k === 'q' ? `${v.q} … ${v.r}` : `${v.h} 時 ${v.m} 分`) : String(v);
let fails = 0; const rows = [];
for (const t of D.types) {
  let hit = 0, other = 0; const N = 100;
  for (let i = 0; i < N; i++) {
    const g = t.grades[i % t.grades.length], p = D.gen(t.id, g, { demo: true });
    const r = X.diagnose({ q: p.q, a: fmt(p, p.bug), c: fmt(p, p.ans) }, g);
    if (r.some(o => o.id === t.id)) hit++; if (r[0].id === 'other') other++;
  }
  rows.push([t.id, hit, other]);
}
const good = rows.filter(r => r[1] >= 90).length;
console.log(`① 用每一類的錯誤答案測：${good}/${rows.length} 類認得出來（100 題中 ≥ 90 題）`);
rows.filter(r => r[1] < 90).forEach(r => console.log(`   ${r[0]}：認出 ${r[1]}/100，其他 ${r[2]}`));

// ② 假的家長報表（格式和 parent-report.js 存的一樣）
const fake = { games: {
  'math5a-lab/grade2': { subject: '數學', wrong: [
    { ts: 1, lv: '2-A 直式加法', q: '用直式算：47 + 38 = ？', a: '75', c: '85' },
    { ts: 2, lv: '2-B 直式減法', q: '用直式算：52 − 18 = ？', a: '44', c: '34' },
    { ts: 3, lv: '2-B 直式減法', q: '63 - 27 = ?', a: '44', c: '36' },
    { ts: 4, lv: '3-A 幾公尺', q: '1 公尺 5 公分 = ？公分', a: '15', c: '105' },
    { ts: 5, lv: '8-A 幾時幾分', q: '短針在 4 和 5 之間，長針指著 3，是幾時幾分？', a: '4 時 3 分', c: '4 時 15 分' },
    { ts: 6, lv: '月考測驗卷 二上', q: '小明畫了一隻小狗，牠有幾條腿？', a: '3', c: '4' } ] },
  'math5a-lab/grade3': { subject: '數學', wrong: [
    { ts: 7, lv: '6-B 除法', q: '29 ÷ 4 = ？', a: '6 … 5', c: '7 … 1' },
    { ts: 8, lv: '3-C 時間', q: '從 9 時 40 分到 10 時 10 分經過幾分鐘？', a: '70', c: '30' },
    { ts: 9, lv: '7-A 分數加法', q: '2/7 + 3/7 = ？', a: '5/14', c: '5/7' } ] },
  'math5a-lab/grade4': { subject: '數學', wrong: [
    { ts: 10, lv: '8-A 整數四則', q: '20 + 4 × 5 = ？', a: '120', c: '40' },
    { ts: 11, lv: '6-A 小數乘整數', q: '0.25 × 6 = ？', a: '150', c: '1.5' },
    { ts: 12, lv: '2-B 乘法', q: '234 × 56 = ？', a: '2574', c: '13104' } ] },
  'math5a-lab/grade5': { subject: '數學', wrong: [
    { ts: 13, lv: '6-A 異分母', q: '1/3 + 1/4 = ？', a: '2/7', c: '7/12' },
    { ts: 14, lv: '8-B 三角形面積', q: '三角形的底 8 公分、高 5 公分，面積是多少平方公分？', a: '40', c: '20' },
    { ts: 15, lv: '4-A 約分', q: '把 12/18 約成最簡分數', a: '6/9', c: '2/3' } ] },
  'math5a-lab/grade6': { subject: '數學', wrong: [
    { ts: 16, lv: '3-A 基準量', q: '弟弟有 40 元，是哥哥的 0.8 倍，哥哥有幾元？', a: '32', c: '50' },
    { ts: 17, lv: '3-B 小數除法', q: '4.5 ÷ 0.5 = ？', a: '0.9', c: '9' } ] },
  'math5a-lab/fix-lab': { subject: '數學', wrong: [{ ts: 18, lv: '故障修復', q: '47 + 38 = ？', a: '75', c: '85' }] },
  'social-puzzle/grade3': { subject: '社會', wrong: [{ ts: 19, lv: 'x', q: '高雄有幾個區？', a: '30', c: '38' }] },
} };
const expect = { 1: 'carry', 2: 'borrow-forget', 3: 'big-small', 4: 'm-cm', 5: 'clock-minute', 6: 'other', 7: 'div-remainder', 8: 'elapsed-60', 9: 'same-den-add',
  10: 'order-ops', 11: 'dec-times-int', 12: 'mul-shift', 13: 'unlike-frac', 14: 'triangle-half', 15: 'reduce', 16: 'base-amount', 17: 'dec-div' };
const S = X.scanReport(fake);
console.log(`② 假報表：讀到 ${S.total} 筆數學錯題（應為 17，不含故障修復局自己和社會科）`);
if (S.total !== 17) fails++;
S.list.forEach(it => {
  const want = expect[it.w.ts], got = it.r.map(o => o.id);
  const ok = got.includes(want);
  if (!ok) fails++;
  console.log(`   ${ok ? '✓' : '✗'} ${it.w.q}｜孩子 ${it.w.a}｜正確 ${it.w.c} → ${got.join('、')}${ok ? '' : `（應有 ${want}）`}`);
});
console.log('   彙整：' + S.types.map(t => `${t.id}×${t.count}`).join('、'));
if (good < rows.length * 0.8) fails++;
console.log(fails ? `失敗 ${fails}` : '全部通過');
process.exit(fails ? 1 : 0);
