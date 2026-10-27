'use strict';
/* 首頁（蓋大樓樓層卡）、關卡切換、過關磚塊 */
const UNITS = [
  { id: 'u1', no: 1, name: '數到 1000', site: '磚頭倉庫', icon: '🧱', c: '#c8553d', modes: ['積木工作台', '位值和比大小', '剛好付錢'] },
  { id: 'u2', no: 2, name: '加加減減', site: '水泥攪拌區', icon: '🪣', c: '#3f7cac', modes: ['直式算算看', '加減應用題', '估算夠不夠'] },
  { id: 'u3', no: 3, name: '幾公尺', site: '鋼筋丈量區', icon: '📏', c: '#ff7a1a', modes: ['捲尺量長度', '公尺和公分', '長度加減'] },
  { id: 'u4', no: 4, name: '年月日', site: '工程日曆室', icon: '📅', c: '#4caf6a', modes: ['大月小月', '年月日換算', '共幾天'] },
  { id: 'u5', no: 5, name: '0、1、10 的乘法', site: '螺絲倉庫', icon: '🔩', c: '#7a5cc4', modes: ['一盒一盒裝', '0 和 1 和 10', '乘法交換'] },
  { id: 'u6', no: 6, name: '重量', site: '吊車秤重站', icon: '⚖️', c: '#c8553d', modes: ['天平秤一秤', '誰比較重', '用積木當單位'] },
  { id: 'u7', no: 7, name: '兩步驟的計算', site: '卡車搬運場', icon: '🚚', c: '#3f7cac', modes: ['兩個算式', '先算哪一步', '兩步驟挑戰'] },
  { id: 'u8', no: 8, name: '分東西', site: '材料分配站', icon: '📦', c: '#ff7a1a', modes: ['平分和分裝', '分東西算式', '分東西挑戰'] },
  { id: 'u9', no: 9, name: '單位分數', site: '午餐休息室', icon: '🍕', c: '#4caf6a', modes: ['切一切塗一塗', '幾分之一', '比大小'] },
  { id: 'u10', no: 10, name: '面的大小與立體', site: '屋頂完工', icon: '🏠', c: '#7a5cc4', modes: ['數格子比面積', '面的比較', '正方體長方體'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰', '🎯 進階挑戰'];
const MODES_PER = MODE_TAG.length;
const keyOf = (ui, mi) => `${UNITS[ui].id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="bk${k < n ? ' on' : ''}">🧱</span>`).join('');
const modeName = (u, mi) => mi < 3 ? u.modes[mi] : '考卷陷阱題 5 題';

function renderHub() {
  let total = 0, built = 0;
  $('#unitGrid').innerHTML = UNITS.map((u, ui) => {
    const isBuilt = [0, 1, 2, 3].every(mi => (P[keyOf(ui, mi)] || 0) > 0);
    if (isBuilt) built++;
    return `
    <div class="floor${isBuilt ? ' built' : ''}" style="--c:${u.c}">
      <div class="beam"></div>
      <div class="head"><span class="fl">${u.no}F</span><span class="site-name">第 ${u.no} 單元・${u.site}</span><span class="u-icon">${u.icon}</span></div>
      <h3>${u.name}</h3>
      <div class="lv-btns">${MODE_TAG.map((t, mi) => { const s = P[keyOf(ui, mi)] || 0; total += s; return `<button type="button" class="lv-btn${mi === 3 ? ' adv' : ''}" data-u="${ui}" data-m="${mi}"><span>${t}<br><small>${modeName(u, mi)}</small></span><span class="st">${starHTML(s)}</span></button>`; }).join('')}</div>
    </div>`;
  }).join('');
  $('#totalStars').textContent = total;
  $('#maxStars').textContent = UNITS.length * MODES_PER * 3;
  // 大樓從 1F 往上蓋（column-reverse：第一個元素在最下面）
  $('#tower').innerHTML = UNITS.map((u, ui) => `<i class="${ui < built ? 'on' : ''}">${u.no}F</i>`).join('') + (built === UNITS.length ? '<b>🎉</b>' : '<b>🏗️</b>');
  $$('.lv-btn').forEach(b => b.onclick = () => openLevel(+b.dataset.u, +b.dataset.m));
}

function openLevel(ui, mi) {
  runCleanup();
  const u = UNITS[ui];
  cur = { ui, mi, miss: 0, done: false };
  $('#hub').hidden = true; $('#play').hidden = false; $('#homeBtn').hidden = false; $('#result').hidden = true;
  $('#lvTitle').innerHTML = `<span class="sem">下學期</span><span class="u-no" style="background:${u.c}">${u.no}F・第 ${u.no} 單元 ${u.name}</span><br>${MODE_TAG[mi]}：${modeName(u, mi)}`;
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st); // 換新的舞台，清掉舊的事件
  window.scrollTo(0, 0);
  try { LEVELS[u.id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回工地再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.ui, c.mi);
  const best = Math.max(P[k] || 0, stars); P[k] = best; saveP();
  sfx('win'); confetti();
  $('#rTitle').textContent = stars === 3 ? '太厲害了！' : stars === 2 ? '過關了！' : '完成了！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對！' : `答錯 ${c.miss} 次，再玩一次可以拿更多磚塊喔！`;
  const last = c.ui === UNITS.length - 1 && c.mi === MODES_PER - 1;
  $('#nextBtn').hidden = last;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 塊磚`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; let { ui, mi } = cur; mi++; if (mi >= MODES_PER) { mi = 0; ui++; } if (ui < UNITS.length) openLevel(ui, mi); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有磚塊嗎？')) { P = {}; saveP(); renderHub(); } };

renderHub();
