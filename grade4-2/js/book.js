'use strict';
/* 三版本單元對照（115 學年度四下，資料見 curriculum/math.json）。
   levels＝遊戲內部單元代號（js/main.js 的 UNITS），bankUnits＝月考題庫的 unit 名稱。
   星星記在內部代號上，換版本不會遺失。 */
(function () {
  const B = {
    big: '多位數的乘與除', quad: '垂直、平行與四邊形', fadd: '同分母分數的加減與整數倍', appr: '概數',
    chart: '長條圖與折線圖', dmul: '小數乘以整數', peri: '周長與面積', equiv: '等值分數',
    time: '時間的計算', vol: '體積與立方公分', rule: '數量規律', simp: '四則運算與簡化計算'
  };
  const u = (no, title, ids) => ({ no, title, levels: ids, bankUnits: ids.map(id => B[id]) });
  window.BOOK = {
    subject: 'math', grade: 4, sem: '下', defaultVersion: 'nani', bankNames: B,
    versions: {
      nani: [
        u(1, '多位數的乘與除', ['big']), u(2, '四邊形', ['quad']), u(3, '分數的加減和整數倍', ['fadd']),
        u(4, '概數', ['appr']), u(5, '統計圖表', ['chart']), u(6, '小數乘以整數', ['dmul']),
        u(7, '周長和面積', ['peri']), u(8, '等值分數', ['equiv']), u(9, '時間的加減', ['time']), u(10, '立方公分', ['vol'])
      ],
      kang: [
        u(1, '多位數的乘與除', ['big']), u(2, '四邊形', ['quad']), u(3, '概數', ['appr']),
        u(4, '數量規律', ['rule']), u(5, '小數乘法', ['dmul']), u(6, '周長與面積', ['peri']),
        u(7, '等值分數', ['equiv']), u(8, '簡化計算', ['simp']), u(9, '時間的計算', ['time']), u(10, '立方公分', ['vol'])
      ],
      han: [
        u(1, '概數', ['appr']), u(2, '四則運算', ['simp']), u(3, '垂直、平行與四邊形', ['quad']),
        u(4, '分數（一）', ['fadd']), u(5, '形體的大小', ['vol']), u(6, '小數乘法', ['dmul']),
        u(7, '周長與面積', ['peri']), u(8, '分數（二）', ['equiv']), u(9, '時間的計算', ['time']), u(10, '規律', ['rule'])
      ]
    }
  };
})();
