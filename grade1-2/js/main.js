'use strict';
/* 首頁（森林車站路線圖）、關卡切換、過關車票 */
const UNITS = [
  { id: 'u1', no: 1, name: '數到 100', st: '橡果站', icon: '🌰', c: '#2f8f5b', modes: ['捆數棒', '個位和十位', '百數表挑戰'] },
  { id: 'u2', no: 2, name: '18 以內的加法', st: '蘑菇站', icon: '🍄', c: '#e2574c', modes: ['湊成十', '連加和算式', '加法心算快手'] },
  { id: 'u3', no: 3, name: '長度', st: '木頭站', icon: '🪵', c: '#8b5a2b', modes: ['排排量長度', '比一比誰長', '接起來剪下來'] },
  { id: 'u4', no: 4, name: '18 以內的減法', st: '蜂蜜站', icon: '🍯', c: '#d39f18', modes: ['拿走幾個', '減法和比較', '減法心算快手'] },
  { id: 'u5', no: 5, name: '圖形和形體', st: '積木站', icon: '🧱', c: '#4fa3d9', modes: ['照樣子拼', '蓋印和翻轉', '數積木'] },
  { id: 'u6', no: 6, name: '幾月幾日', st: '日曆站', icon: '📅', c: '#f28c38', modes: ['月曆填填看', '今天明天昨天', '年曆小偵探'] },
  { id: 'u7', no: 7, name: '錢幣', st: '商店站', icon: '🪙', c: '#2f8f5b', modes: ['剛好付錢', '錢幣換一換', '買東西挑戰'] },
  { id: 'u8', no: 8, name: '二位數的加減', st: '花園站', icon: '🌻', c: '#e2574c', modes: ['十條和一個', '加減應用題', '加減好朋友'] },
  { id: 'u9', no: 9, name: '做紀錄', st: '終點站', icon: '🏁', c: '#8b5a2b', modes: ['分類回收', '數一數記下來', '看統計表'] },
  // 2026-11 三版本：康軒、翰林一下有、南一一下沒有的內容（關卡在 extra.js）
  { id: 'x1', no: '補', name: '50 以內的數', st: '松果站', icon: '🌲', c: '#4fa3d9', modes: ['數棒排一排', '2 個一數、10 個一數', '比大小和順序'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰'];
const keyOf = (ui, mi) => `${UNITS[ui].id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="tk${k < n ? ' on' : ''}">🎫</span>`).join('');

/* 三版本：依目前版本、範圍排出單元（book.js 的 BOOK；kg-ver.js 沒載入時用南一） */
const VER = () => window.KGVer ? KGVer.cur(BOOK) : { version: 'nani', range: 'all' };
const vUnits = () => window.KGVer ? KGVer.units(BOOK) : BOOK.versions.nani;
const uIdx = id => UNITS.findIndex(u => u.id === id);
const vUnitOf = id => (BOOK.versions[VER().version] || []).find(v => v.levels.includes(id));
let ORDER = []; // 目前顯示的關卡順序 [ui, mi]（「下一關」用）

function renderHub() {
  let total = 0, max = 0; ORDER = [];
  const pub = { nani: '南一', kang: '康軒', han: '翰林' }[VER().version];
  $('#verLine').textContent = `115 學年度・${pub}版 一下`;
  $('#unitGrid').innerHTML = vUnits().map(v => {
    const first = UNITS[uIdx(v.levels[0])];
    return `
    <div class="station" style="--c:${first.c}">
      <div class="roof"><span class="u-no">第 ${v.no} 站</span>${first.st}<span class="u-icon">${first.icon}</span></div>
      <h3>${v.title}</h3>
      ${v.levels.map(id => { const ui = uIdx(id), u = UNITS[ui]; return `${v.levels.length > 1 ? `<div class="u-sub" style="--c:${u.c}">${u.icon} ${(v.names || {})[id] || u.name}</div>` : ''}
      <div class="lv-btns">${u.modes.map((m, mi) => { const s = P[keyOf(ui, mi)] || 0; total += s; max += 3; ORDER.push([ui, mi]); return `<button type="button" class="lv-btn${mi === 3 ? ' adv' : ''}" data-u="${ui}" data-m="${mi}"><span>${MODE_TAG[mi]}<br><small>${m}</small></span><span class="st">${starHTML(s)}</span></button>`; }).join('')}</div>`; }).join('')}
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
  $('#lvTitle').innerHTML = `<span class="sem">下學期</span><span class="u-no" style="background:${u.c}">${head}${v.title}${sub}</span><br>${MODE_TAG[mi]}：${u.modes[mi]}`;
  window.KGReport && KGReport.level(`${v.no}-${'ABCD'[mi] || mi + 1} ${MODE_TAG[mi]}：${u.modes[mi]}`, `${head}${v.title}${sub}`);
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st); // 換新的舞台，清掉舊的事件
  window.scrollTo(0, 0);
  try { LEVELS[u.id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回車站再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.ui, c.mi);
  const best = Math.max(P[k] || 0, stars); P[k] = best; saveP();
  sfx('win'); confetti();
  window.KGReport && KGReport.done({ stars });
  $('#rTitle').textContent = stars === 3 ? '太厲害了！' : stars === 2 ? '過關了！' : '完成了！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對！' : `答錯 ${c.miss} 次，再玩一次可以拿更多車票喔！`;
  const at = ORDER.findIndex(([a, b]) => a === c.ui && b === c.mi), last = at < 0 || at === ORDER.length - 1;
  $('#nextBtn').hidden = last;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 張車票`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; const nx = ORDER[ORDER.findIndex(([a, b]) => a === cur.ui && b === cur.mi) + 1]; if (nx) openLevel(nx[0], nx[1]); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有車票嗎？')) { P = {}; saveP(); renderHub(); } };

renderHub();
