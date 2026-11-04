// 產生 README 的「錯誤類型一覽」表格（從 errors.js 直接讀，避免文件和程式不一致）
// 執行：node publish/math5a-lab/fix-lab/tests/make-readme-table.js > 表格.md
const D = require('../errors.js');
const IN = { num: '數字', frac: '分數', fields: '多格', choice: '選擇', eq: '列式' };
const out = [];
for (let g = 1; g <= 6; g++) {
  const list = D.types.filter(t => t.grades[0] === g);
  out.push(`\n### 從 ${g} 年級開始（${list.length} 類；${g} 年級可用的共 ${D.forGrade(g).length} 類）\n`);
  out.push('| id | 故障機器 | 錯誤類型 | 錯在哪裡 | 正確觀念 | 適用年級 | 對應單元（南一） | 作答 |');
  out.push('|---|---|---|---|---|---|---|---|');
  list.forEach(t => {
    const p = t.gen(t.grades[0], {});
    out.push(`| \`${t.id}\` | ${t.robot} | ${t.name} | ${t.wrong} | ${t.right} | ${t.grades.join('、')} | ${t.units.join('、')} | ${IN[p.input]} |`);
  });
}
console.log(out.join('\n'));
