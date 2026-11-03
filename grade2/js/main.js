'use strict';
/* 首頁、關卡切換、過關星星 */
const UNITS = [
  { id: 'u1', no: 1, name: '數到 300', icon: '🧱', c: '#ff7eb3', modes: ['積木排一排', '認識百位', '比大小挑戰'] },
  { id: 'u2', no: 2, name: '二位數的加減', icon: '➕', c: '#5bb4ff', modes: ['加法的直式計算', '減法的直式計算', '加、減法的應用'] },
  { id: 'u3', no: 3, name: '幾公分', icon: '📏', c: '#3fcf9c', modes: ['畫長度', '長度的測量', '長度的加減'] },
  { id: 'u4', no: 4, name: '加減的關係與應用', icon: '🐸', c: '#ff9a4d', modes: ['跳跳青蛙', '解題', '驗算與比大小'] },
  { id: 'u5', no: 5, name: '容量', icon: '🥛', c: '#a98bff', modes: ['倒倒看', '哪個裝得多', '容量挑戰'] },
  { id: 'u6', no: 6, name: '兩步驟的加減', icon: '🚌', c: '#ff7eb3', modes: ['公車上下車', '兩步驟想一想', '兩步驟挑戰'] },
  { id: 'u7', no: 7, name: '2、5、4、8 的乘法', icon: '🍓', c: '#3fcf9c', modes: ['幾的幾倍', '乘法的意義', '乘法快手'] },
  { id: 'u8', no: 8, name: '幾時幾分', icon: '⏰', c: '#5bb4ff', modes: ['撥時鐘', '報讀幾時幾分', '點數經過的時間'] },
  { id: 'u9', no: 9, name: '3、6、7、9 的乘法', icon: '🦘', c: '#ff9a4d', modes: ['袋鼠跳數線', '乘法想一想', '乘法的應用'] },
  { id: 'u10', no: 10, name: '平面圖形', icon: '🔺', c: '#a98bff', modes: ['邊、角和頂點', '認識圖形', '周界和周長'] },
  // 2026-11 三版本：康軒、翰林二上有、南一二上沒有的內容（關卡在 extra.js）
  { id: 'x1', no: '補', name: '錢幣與付錢', icon: '💰', c: '#ff9a4d', modes: ['數數看有多少錢', '換錢和拿錢', '剛好付錢'] },
  { id: 'x5', no: '補', name: '面的大小比較', icon: '🟨', c: '#3fcf9c', modes: ['數格子比面積', '面的比較', '面積比較挑戰'] },
  { id: 'x10', no: '補', name: '重量的比較', icon: '⚖️', c: '#a98bff', modes: ['天平秤一秤', '誰比較重', '用積木當單位'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰'];
const keyOf = (ui, mi) => `${UNITS[ui].id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="star${k < n ? ' on' : ''}">★</span>`).join('');

/* 三版本：依目前版本、範圍排出單元（book.js 的 BOOK；kg-ver.js 沒載入時用南一） */
const VER = () => window.KGVer ? KGVer.cur(BOOK) : { version: 'nani', range: 'all' };
const vUnits = () => window.KGVer ? KGVer.units(BOOK) : BOOK.versions.nani;
const uIdx = id => UNITS.findIndex(u => u.id === id);
const vUnitOf = id => (BOOK.versions[VER().version] || []).find(v => v.levels.includes(id));
let ORDER = []; // 目前顯示的關卡順序 [ui, mi]（「下一關」用）

function renderHub() {
  let total = 0, max = 0; ORDER = [];
  const pub = { nani: '南一', kang: '康軒', han: '翰林' }[VER().version];
  $('#verLine').textContent = `115 學年度・${pub}版 二上`;
  $('#unitGrid').innerHTML = vUnits().map(v => {
    const first = UNITS[uIdx(v.levels[0])];
    return `
    <div class="ucard" style="--c:${first.c}">
      <span class="u-no">第 ${v.no} 單元</span><span class="u-icon">${first.icon}</span>
      <h3>${v.title}</h3>
      ${v.levels.map(id => { const ui = uIdx(id), u = UNITS[ui]; return `${v.levels.length > 1 ? `<div class="u-sub" style="--c:${u.c}">${u.icon} ${(v.names || {})[id] || u.name}</div>` : ''}
      <div class="lv-btns">${u.modes.map((m, mi) => { const s = P[keyOf(ui, mi)] || 0; total += s; max += 3; ORDER.push([ui, mi]); return `<button type="button" class="lv-btn" data-u="${ui}" data-m="${mi}"><span>${MODE_TAG[mi]}<br><small>${m}</small></span><span class="st">${starHTML(s)}</span></button>`; }).join('')}</div>`; }).join('')}
    </div>`; }).join('');
  $('#totalStars').textContent = total;
  $('#maxStars').textContent = max;
  $$('.lv-btn').forEach(b => b.onclick = () => openLevel(+b.dataset.u, +b.dataset.m));
}
function mountExam() { if (window.KGExam) KGExam.mount($('#exam-box'), window.KGVer ? KGVer.examBank(BOOK, EXAM_BANK) : EXAM_BANK); }
window.addEventListener('load', function m() { if (window.KGExam) mountExam(); else setTimeout(m, 200); });
if (window.KGVer) KGVer.bar($('#verBar'), BOOK, () => { renderHub(); mountExam(); });

function openLevel(ui, mi) {
  runCleanup();
  const u = UNITS[ui];
  cur = { ui, mi, miss: 0, done: false }; curQ = null;
  $('#hub').hidden = true; $('#play').hidden = false; $('#homeBtn').hidden = false; $('#result').hidden = true;
  const v = vUnitOf(u.id) || { no: u.no, title: u.name }, nm = (v.names || {})[u.id] || u.name, sub = v.title === nm ? '' : `・${nm}`, head = typeof v.no === 'number' ? `第 ${v.no} 單元 ` : '補充 ';
  $('#lvTitle').innerHTML = `<span class="u-no" style="background:${u.c}">${head}${v.title}${sub}</span><br>${MODE_TAG[mi]}：${u.modes[mi]}`;
  window.KGReport && KGReport.level(`${v.no}-${'ABCD'[mi] || mi + 1} ${MODE_TAG[mi]}：${u.modes[mi]}`, `${head}${v.title}${sub}`);
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st); // 換新的舞台，清掉舊的事件
  window.scrollTo(0, 0);
  try { LEVELS[u.id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回首頁再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.ui, c.mi);
  const best = Math.max(P[k] || 0, stars); P[k] = best; saveP();
  window.KGReport && KGReport.done({ stars });
  sfx('win'); confetti();
  $('#rTitle').textContent = stars === 3 ? '太厲害了！' : stars === 2 ? '過關了！' : '完成了！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對！' : `答錯 ${c.miss} 次，再玩一次可以拿更多星星喔！`;
  const at = ORDER.findIndex(([a, b]) => a === c.ui && b === c.mi), last = at < 0 || at === ORDER.length - 1;
  $('#nextBtn').hidden = last;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 顆星`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; const nx = ORDER[ORDER.findIndex(([a, b]) => a === cur.ui && b === cur.mi) + 1]; if (nx) openLevel(nx[0], nx[1]); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有星星嗎？')) { P = {}; saveP(); renderHub(); } };

(function deco() {
  const d = $('.deco');
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('div'); c.className = 'cloud';
    const w = rand(90, 170); c.style.width = w + 'px'; c.style.height = w * 0.35 + 'px';
    c.style.top = rand(4, 80) + '%'; c.style.animationDuration = rand(40, 80) + 's'; c.style.animationDelay = -rand(0, 60) + 's';
    d.appendChild(c);
  }
})();
renderHub();
