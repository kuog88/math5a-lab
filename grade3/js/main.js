'use strict';
/* 首頁、關卡切換、過關星星 */
const UNITS = [
  { id: 'u1', no: 1, name: '數到 10000', icon: '🔢', c: '#ff7eb3', modes: ['位值積木撥一撥', '讀數、寫數與位值', '比大小與數線挑戰', '考卷陷阱題'] },
  { id: 'u2', no: 2, name: '四位數的加減', icon: '➕', c: '#5bb4ff', modes: ['加減直式一格一格算', '估算與驗算', '加減應用挑戰', '考卷陷阱題'] },
  { id: 'u3', no: 3, name: '乘法', icon: '✖️', c: '#3fcf9c', modes: ['乘法直式工作台', '拆一拆與估算', '乘法應用挑戰', '考卷陷阱題'] },
  { id: 'u4', no: 4, name: '幾毫米', icon: '📏', c: '#ff9a4d', modes: ['用尺畫線段', '公分、毫米的換算', '長度計算挑戰', '考卷陷阱題'] },
  { id: 'u5', no: 5, name: '角、正方形和長方形', icon: '📐', c: '#a98bff', modes: ['角的分類箱', '比較角的大小', '正方形和長方形', '考卷陷阱題'] },
  { id: 'u6', no: 6, name: '除法', icon: '➗', c: '#ff7eb3', modes: ['分一分、裝一裝', '餘數、奇數和偶數', '直式除法與應用', '考卷陷阱題'] },
  { id: 'u7', no: 7, name: '公升和毫升', icon: '🥛', c: '#5bb4ff', modes: ['量杯倒水', '公升和毫升的換算與比較', '容量計算挑戰', '考卷陷阱題'] },
  { id: 'u8', no: 8, name: '分數', icon: '🍕', c: '#3fcf9c', modes: ['分數塗一塗', '幾分之幾', '單位分數的累加', '考卷陷阱題'] },
  { id: 'u9', no: 9, name: '圓', icon: '⭕', c: '#ff9a4d', modes: ['圓規畫圓', '圓心、半徑和直徑', '圓的挑戰', '考卷陷阱題'] },
  // 2026-11 三版本：康軒、翰林三上有、南一三上沒有的內容（關卡在 extra.js）
  { id: 'x1', no: '補', name: '點數錢幣', icon: '💰', c: '#ffc93c', modes: ['數數看有多少錢', '換錢和拿錢', '付錢和找錢', '考卷陷阱題'] },
  { id: 'x4', no: '補', name: '連乘兩步驟', icon: '📦', c: '#3fcf9c', modes: ['一箱一箱算', '先算哪一步', '連乘應用挑戰', '考卷陷阱題'] },
  { id: 'x6', no: '補', name: '面積', icon: '🟩', c: '#5bb4ff', modes: ['塗出平方公分', '切割和拼湊', '面積的估算', '考卷陷阱題'] },
  { id: 'x7', no: '補', name: '公斤和公克', icon: '⚖️', c: '#a98bff', modes: ['砝碼秤重', '秤面與換算', '重量的計算', '考卷陷阱題'] },
  { id: 'x9', no: '補', name: '列表與規律', icon: '📋', c: '#ff9a4d', modes: ['數一數做表格', '報讀表格', '找規律', '考卷陷阱題'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰', '🎯 進階挑戰'];
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
  $('#verLine').textContent = `115 學年度・${pub}版 三上`;
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
  const v = vUnitOf(u.id) || { no: u.no, title: u.name }, nm = (v.names || {}).hasOwnProperty(u.id) ? v.names[u.id] : u.name, sub = v.title === nm ? '' : `・${nm}`, head = typeof v.no === 'number' ? `第 ${v.no} 單元 ` : '補充 ';
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
