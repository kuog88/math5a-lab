'use strict';
/* 首頁、關卡切換、過關星星 */
const UNITS = [
  { id: 'u1', no: 1, name: '質因數分解和短除法', icon: '🌳', c: '#ff7eb3', modes: ['短除法拆拆看', '質數與質因數', '公因數公倍數挑戰'] },
  { id: 'u2', no: 2, name: '分數的除法', icon: '🍰', c: '#5bb4ff', modes: ['果汁分裝', '分數除法想一想', '分數除法挑戰'] },
  { id: 'u3', no: 3, name: '小數的除法', icon: '🧮', c: '#3fcf9c', modes: ['小數點搬家', '商和餘數想一想', '小數除法挑戰'] },
  { id: 'u4', no: 4, name: '圓周長和圓面積', icon: '⭕', c: '#ff9a4d', modes: ['滾輪子、切披薩', '圓的公式想一想', '圓周長圓面積挑戰'] },
  { id: 'u5', no: 5, name: '比和比值', icon: '🧃', c: '#a98bff', modes: ['調出一樣的果汁', '比和比值想一想', '比的應用挑戰'] },
  { id: 'u6', no: 6, name: '扇形的周長和面積', icon: '🍕', c: '#ff7eb3', modes: ['拉出扇形', '扇形想一想', '扇形挑戰'] },
  { id: 'u7', no: 7, name: '速率', icon: '🚄', c: '#3fcf9c', modes: ['誰跑最快', '速率單位想一想', '速率挑戰'] },
  { id: 'u8', no: 8, name: '數量關係', icon: '🧩', c: '#5bb4ff', modes: ['排桌子找規律', '關係式想一想', '數量關係挑戰'] },
  // 2026-11 三版本：康軒、翰林六上有、南一六上沒有的內容（關卡在 extra.js）
  { id: 'xcirc', no: '補', name: '圓周長與扇形周長', icon: '🛞', c: '#ff9a4d', modes: ['滾輪子', '周長公式想一想', '弧長與扇形周長挑戰'] },
  { id: 'xscale', no: '補', name: '放大圖、縮圖與比例尺', icon: '🗺️', c: '#a98bff', modes: ['方格紙放大縮小', '放大縮小想一想', '比例尺挑戰'] },
  { id: 'xbase', no: '補', name: '基準量與比較量', icon: '⚖️', c: '#3fcf9c', modes: ['線段圖塗一塗', '基準量想一想', '兩量和差挑戰'] },
  // 🎮 闖關任務（只有一關；程式和六下共用 ../grade6-2/js/ratio-detective.js），翰林第 5 單元「兩量關係」
  { id: 'xgame', no: '補', name: '闖關任務', icon: '🎮', c: '#7c4dff', modes: ['誰才是老大？基準量偵探社'], game: true }
];
LEVELS.xgame = [st => RatioDetective(st)];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰'];
const tagOf = (u, mi) => u.game ? '🎮 闖關任務' : MODE_TAG[mi];
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
  $('#verLine').textContent = `115 學年度・${pub}版 六上`;
  $('#unitGrid').innerHTML = vUnits().map(v => {
    const first = UNITS[uIdx(v.levels[0])];
    return `
    <div class="ucard" style="--c:${first.c}">
      <span class="u-no">第 ${v.no} 單元</span><span class="u-icon">${first.icon}</span>
      <h3>${v.title}</h3>
      ${v.levels.map(id => { const ui = uIdx(id), u = UNITS[ui]; return `${v.levels.length > 1 ? `<div class="u-sub" style="--c:${u.c}">${u.icon} ${(v.names || {})[id] || u.name}</div>` : ''}
      <div class="lv-btns">${u.modes.map((m, mi) => { const s = P[keyOf(ui, mi)] || 0; total += s; max += 3; ORDER.push([ui, mi]); return `<button type="button" class="lv-btn${mi === 3 ? ' adv' : ''}${u.game ? ' game' : ''}" data-u="${ui}" data-m="${mi}"><span>${tagOf(u, mi)}<br><small>${m}</small></span><span class="st">${starHTML(s)}</span></button>`; }).join('')}</div>`; }).join('')}
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
  $('#lvTitle').innerHTML = `<span class="u-no" style="background:${u.c}">${head}${v.title}${sub}</span><br>${tagOf(u, mi)}：${u.modes[mi]}`;
  window.KGReport && KGReport.level(`${v.no}-${u.game ? 'E' : 'ABCD'[mi] || mi + 1} ${tagOf(u, mi)}：${u.modes[mi]}`, `${head}${v.title}${sub}`);
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
