'use strict';
/* 首頁（太空站地圖，依版本排列單元）、關卡切換、過關能量晶石 */
const UNITS = {
  mixed: { name: '分數與小數的四則混合計算', icon: '🧪', zone: '能量配方實驗室', c: '#8b5cf6', modes: ['依順序點出計算', '四則混合算一算', '補給品應用題'] },
  pie: { name: '圓形圖與可能性', icon: '🪐', zone: '星球資源分析站', c: '#14b8c8', modes: ['調出圓形圖', '讀圓形圖', '可能性與圓形圖應用'] },
  base: { name: '基準量與比較量', icon: '⚖️', zone: '燃料比例艙', c: '#ff8a3d', modes: ['線段圖比一比', '誰是基準量', '兩量和與兩量差'] },
  scale: { name: '放大圖、縮圖與比例尺', icon: '🔭', zone: '星圖測繪室', c: '#2f6bff', modes: ['畫出放大圖', '對應邊與對應角', '比例尺換算'] },
  solve: { name: '怎樣解題（年齡、和差、雞兔、平均）', icon: '🧩', zone: '外星謎題艙', c: '#22a06b', modes: ['外星雞兔調配', '年齡與和差', '平均、組合與堆疊'] },
  chase: { name: '相遇、追趕與流水', icon: '🛸', zone: '星際航道', c: '#e5484d', modes: ['飛船相遇模擬', '相遇與相離', '追趕與流水'] },
  speed: { name: '速率', icon: '🚀', zone: '火箭試飛場', c: '#d49a00', modes: ['誰飛得最快', '距離、時間、速率', '速率單位換算'] },
  prism: { name: '柱體的體積與表面積', icon: '🛢️', zone: '貨艙倉儲區', c: '#0b7f8c', modes: ['調出柱體體積', '柱體的體積', '柱體的表面積'] },
  circ: { name: '圓面積與扇形面積', icon: '🌕', zone: '月球基地', c: '#5d6a8f', modes: ['圓面積切一切', '扇形面積', '複合圖形面積'] },
  /* 🎮 闖關任務（只有一關，程式在 js/ratio-detective.js，六上也共用） */
  bgame: { name: '🎮 闖關任務', icon: '🕵️', zone: '偵探社', c: '#7c4dff', modes: ['誰才是老大？基準量偵探社'], game: true }
};
LEVELS.bgame = [st => RatioDetective(st)];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰', '🎯 進階挑戰'];
const GAME_TAG = '🎮 闖關任務';
const mis = id => UNITS[id].game ? [0] : [0, 1, 2, 3]; // 每個內部單元有哪些關卡
const tagOf = (id, mi) => UNITS[id].game ? GAME_TAG : MODE_TAG[mi];
const lvName = (id, mi) => UNITS[id].game ? UNITS[id].modes[0] : mi === 3 ? ADV_NAME : UNITS[id].modes[mi];
const ADV_NAME = '考卷陷阱題 5 題';
const keyOf = (id, mi) => `${id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="star${k < n ? ' on' : ''}">💠</span>`).join('');
const PUBN = { nani: '南一', kang: '康軒', han: '翰林' };

/* 目前版本、範圍要顯示的單元（沒有 kg-ver.js 時用預設版本全冊） */
function verUnits() { return window.KGVer ? KGVer.units(BOOK) : BOOK.versions[BOOK.defaultVersion]; }
function verName() { return PUBN[window.KGVer ? KGVer.cur(BOOK).version : BOOK.defaultVersion]; }
/* 顯示中的關卡順序（下一關用） */
function order() { const o = []; verUnits().forEach(vu => vu.levels.forEach(id => mis(id).forEach(mi => o.push({ vu, id, mi })))); return o; }

function renderHub() {
  let total = 0, max = 0;
  const list = verUnits();
  $('#verName').textContent = verName();
  $('#unitCount').textContent = (BOOK.versions[window.KGVer ? KGVer.cur(BOOK).version : BOOK.defaultVersion] || []).length;
  $('#unitGrid').innerHTML = list.map(vu => {
    const head = UNITS[vu.levels[0]];
    return `<div class="ruin" style="--c:${head.c}">
      <div class="st-head"><span class="glyph">${head.icon}</span>
        <div><span class="u-no">第 ${vu.no} 單元・${head.zone}</span><h3>${vu.title}</h3></div></div>
      ${vu.levels.map(id => `${vu.levels.length > 1 ? `<div class="sub-name">${UNITS[id].name}</div>` : ''}<div class="lv-btns">${mis(id).map(mi => {
        const s = P[keyOf(id, mi)] || 0; total += s; max += 3;
        return `<button type="button" class="lv-btn${mi === 3 ? ' adv' : ''}${UNITS[id].game ? ' game' : ''}" data-u="${id}" data-m="${mi}" data-no="${vu.no}"><span>${tagOf(id, mi)}<br><small>${lvName(id, mi)}</small></span><span class="st">${starHTML(s)}</span></button>`;
      }).join('')}</div>`).join('')}
    </div>`;
  }).join('');
  $('#totalStars').textContent = total;
  $('#maxStars').textContent = max;
  $$('.lv-btn').forEach(b => b.onclick = () => openLevel(b.dataset.u, +b.dataset.m, +b.dataset.no));
}

function openLevel(id, mi, no) {
  runCleanup();
  const u = UNITS[id], vu = verUnits().find(v => v.no === no && v.levels.includes(id)) || verUnits().find(v => v.levels.includes(id)) || { no: '', title: u.name };
  cur = { id, mi, no: vu.no, miss: 0, done: false }; curQ = null;
  $('#hub').hidden = true; $('#play').hidden = false; $('#homeBtn').hidden = false; $('#result').hidden = true;
  const mname = lvName(id, mi), tag = tagOf(id, mi);
  $('#lvTitle').innerHTML = `<span class="sem-mini">下學期</span><span class="u-no" style="background:${u.c}">第 ${vu.no} 單元 ${vu.title}</span><br>${tag}：${mname}`;
  window.KGReport && KGReport.level(`${vu.no}-${u.game ? 'E' : 'ABCD'[mi]} ${tag}：${mname}`, `第 ${vu.no} 單元 ${vu.title}（${verName()}版）`);
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st);
  window.scrollTo(0, 0);
  try { LEVELS[id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回太空站再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }
function nextOf(c) { const o = order(), k = o.findIndex(x => x.id === c.id && x.mi === c.mi && x.vu.no === c.no); return k >= 0 ? o[k + 1] : null; }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.id, c.mi);
  P[k] = Math.max(P[k] || 0, stars); saveP();
  sfx('win'); coins();
  window.KGReport && KGReport.done({ stars });
  $('#rTitle').textContent = stars === 3 ? '任務完美達成！' : stars === 2 ? '過關了！' : '完成任務！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對，拿到 3 顆能量晶石！' : `答錯 ${c.miss} 次，再挑戰一次可以拿到更多晶石喔！`;
  $('#nextBtn').hidden = !nextOf(c);
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 顆能量晶石`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.id, cur.mi, cur.no);
$('#nextBtn').onclick = () => { if (!cur) return; const n = nextOf(cur); if (n) openLevel(n.id, n.mi, n.vu.no); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有能量晶石嗎？')) { P = {}; saveP(); renderHub(); } };

/* 版本／範圍切換：重畫單元與月考試卷 */
function mountExam() { if (window.KGExam && window.EXAM_BANK) KGExam.mount($('#exam-box'), window.KGVer ? KGVer.examBank(BOOK, EXAM_BANK) : EXAM_BANK); }
function onVer() { renderHub(); mountExam(); }
if (window.KGVer) KGVer.bar($('#verBar'), BOOK, onVer);
renderHub();
window.addEventListener('load', function m() { if (window.KGExam) mountExam(); else setTimeout(m, 200); });
