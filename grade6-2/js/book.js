'use strict';
/* 三版本單元對照（115 學年度六下，資料見 curriculum/math.json）。
   levels＝遊戲內部單元代號（js/main.js 的 UNITS），bankUnits＝月考題庫的 unit 名稱。
   星星記在內部代號上，換版本不會遺失。 */
(function () {
  const B = {
    mixed: '分數與小數的四則混合計算', pie: '圓形圖與可能性', base: '基準量與比較量', scale: '放大圖、縮圖與比例尺',
    solve: '怎樣解題（年齡、和差、雞兔、平均）', chase: '相遇、追趕與流水', speed: '速率', prism: '柱體的體積與表面積', circ: '圓面積與扇形面積'
  };
  const u = (no, title, ids) => ({ no, title, levels: ids, bankUnits: ids.map(id => B[id]) });
  window.BOOK = {
    subject: 'math', grade: 6, sem: '下', defaultVersion: 'nani', bankNames: B,
    versions: {
      nani: [
        u(1, '四則混合運算', ['mixed']), u(2, '圓形圖', ['pie']), u(3, '基準量和比較量', ['base']),
        u(4, '放大圖、縮圖和比例尺', ['scale']), u(5, '怎樣解題', ['solve', 'chase']), u(6, '柱體的體積和表面積', ['prism'])
      ],
      kang: [
        u(1, '小數與分數的計算', ['mixed']), u(2, '速率的應用', ['speed', 'chase']), u(3, '柱體體積與表面積', ['prism']),
        u(4, '基準量與比較量', ['base']), u(5, '怎樣解題', ['solve']), u(6, '圓形圖', ['pie'])
      ],
      han: [
        u(1, '小數與分數的四則運算', ['mixed']), u(2, '圓面積與扇形面積', ['circ']), u(3, '速率', ['speed']),
        u(4, '統計圖表', ['pie']), u(5, '怎樣解題', ['solve', 'chase']), u(6, '角柱與圓柱', ['prism'])
      ]
    }
  };
})();
