'use strict';
/* 首頁（遺跡地圖）、關卡切換、過關金幣 */
const UNITS = [
  { id: 'u1', no: 1, name: '分數的計算', icon: '☀️', zone: '太陽神殿', c: '#c8553d', modes: ['石板平分', '分數倍與積的大小', '分數除以整數'] },
  { id: 'u2', no: 2, name: '數的十進位結構', icon: '🗿', zone: '數字方尖碑', c: '#2f5aa8', modes: ['位值石盤', '大數與多位小數', '十進位挑戰'] },
  { id: 'u3', no: 3, name: '小數的乘法', icon: '🏺', zone: '綠洲市集', c: '#14989a', modes: ['百格圖乘一乘', '積會變大還是變小', '市集算帳'] },
  { id: 'u4', no: 4, name: '扇形', icon: '🧭', zone: '星盤天文台', c: '#e9a21b', modes: ['轉出圓心角', '認識扇形', '扇形與幾分之幾圓'] },
  { id: 'u5', no: 5, name: '體積', icon: '🧱', zone: '石塊倉庫', c: '#8a5a2b', modes: ['堆出長方體', '立方公尺與換算', '複合形體的體積'] },
  { id: 'u6', no: 6, name: '整數、小數除以整數', icon: '🐫', zone: '駱駝商隊', c: '#c8553d', modes: ['分數小數配對', '除到小數', '概數與應用'] },
  { id: 'u7', no: 7, name: '生活中的大單位', icon: '🌾', zone: '尼羅河農田', c: '#4f9d3a', modes: ['裝滿 1 公噸', '公畝、公頃、平方公里', '大單位換算'] },
  { id: 'u8', no: 8, name: '比率和百分率', icon: '💰', zone: '寶藏金庫', c: '#e9a21b', modes: ['塗出百分率', '認識比率', '百分率的應用'] },
  { id: 'u9', no: 9, name: '容積和容量', icon: '⚱️', zone: '香料陶罐房', c: '#2f5aa8', modes: ['排水法量體積', '容積和容量', '容器的計算'] },
  { id: 'u10', no: 10, name: '柱體、錐體和球體', icon: '🔺', zone: '金字塔之心', c: '#14989a', modes: ['立體分類', '構成要素', '面和面的關係'] },
  // 2026-11 三版本：康軒、翰林五下有、南一五下沒有的內容（關卡在 extra.js）
  { id: 'xline', no: '補', name: '折線圖', icon: '📈', zone: '星象紀錄牆', c: '#c8553d', modes: ['畫出折線圖', '看懂統計圖', '統計圖挑戰'] },
  { id: 'xsym', no: '補', name: '線對稱圖形', icon: '🦋', zone: '鏡像神殿', c: '#2f5aa8', modes: ['方格照鏡子', '對稱軸想一想', '對稱點挑戰'] },
  { id: 'xtime', no: '補', name: '時間的乘除', icon: '⏳', zone: '日晷廣場', c: '#e9a21b', modes: ['時間換換機', '時間單位想一想', '時間應用挑戰'] },
  { id: 'xsurf', no: '補', name: '正方體和長方體', icon: '📦', zone: '石盒工坊', c: '#14989a', modes: ['展開圖設計師', '面和邊想一想', '表面積挑戰'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰'];
const keyOf = (ui, mi) => `${UNITS[ui].id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="star${k < n ? ' on' : ''}">🪙</span>`).join('');

/* 三版本：依目前版本、範圍排出單元（book.js 的 BOOK；kg-ver.js 沒載入時用南一） */
const VER = () => window.KGVer ? KGVer.cur(BOOK) : { version: 'nani', range: 'all' };
const vUnits = () => window.KGVer ? KGVer.units(BOOK) : BOOK.versions.nani;
const uIdx = id => UNITS.findIndex(u => u.id === id);
const vUnitOf = id => (BOOK.versions[VER().version] || []).find(v => v.levels.includes(id));
let ORDER = []; // 目前顯示的關卡順序 [ui, mi]（「下一關」用）

function renderHub() {
  let total = 0, max = 0; ORDER = [];
  const pub = { nani: '南一', kang: '康軒', han: '翰林' }[VER().version];
  $('#verLine').textContent = `115 學年度・${pub}版 五下`;
  $('#unitGrid').innerHTML = vUnits().map(v => {
    const first = UNITS[uIdx(v.levels[0])];
    return `
    <div class="ruin" style="--c:${first.c}">
      <div class="st-head"><span class="glyph">${first.icon}</span>
        <div><span class="u-no">第 ${v.no} 單元・${first.zone}</span><h3>${v.title}</h3></div></div>
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
  $('#lvTitle').innerHTML = `<span class="sem-mini">下學期</span><span class="u-no" style="background:${u.c}">${head}${v.title}${sub}</span><br>${MODE_TAG[mi]}：${u.modes[mi]}`;
  window.KGReport && KGReport.level(`${v.no}-${'ABCD'[mi] || mi + 1} ${MODE_TAG[mi]}：${u.modes[mi]}`, `${head}${v.title}${sub}`);
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st);
  window.scrollTo(0, 0);
  try { LEVELS[u.id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回營地再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.ui, c.mi);
  P[k] = Math.max(P[k] || 0, stars); saveP();
  sfx('win'); coins();
  window.KGReport && KGReport.done({ stars });
  $('#rTitle').textContent = stars === 3 ? '寶藏大發現！' : stars === 2 ? '過關了！' : '完成任務！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對，拿到 3 枚金幣！' : `答錯 ${c.miss} 次，再挑戰一次可以拿到更多金幣喔！`;
  const at = ORDER.findIndex(([a, b]) => a === c.ui && b === c.mi);
  $('#nextBtn').hidden = at < 0 || at === ORDER.length - 1;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 枚金幣`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; const nx = ORDER[ORDER.findIndex(([a, b]) => a === cur.ui && b === cur.mi) + 1]; if (nx) openLevel(nx[0], nx[1]); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有金幣嗎？')) { P = {}; saveP(); renderHub(); } };

renderHub();
