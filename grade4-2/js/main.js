'use strict';
/* 首頁（恐龍谷地圖，依版本排列單元）、關卡切換、過關化石 */
const UNITS = {
  big: { name: '多位數的乘與除', icon: '🦕', zone: '長頸龍化石倉庫', c: '#3b8f4e', modes: ['面積模型拆乘法', '末位是 0 的乘除', '化石運送應用題'] },
  quad: { name: '垂直、平行與四邊形', icon: '🦖', zone: '暴龍的方格營地', c: '#d0482a', modes: ['點出四邊形', '垂直、平行與對角線', '四邊形的邊和角'] },
  fadd: { name: '同分母分數的加減與整數倍', icon: '🥚', zone: '恐龍蛋孵化室', c: '#f08a24', modes: ['塗分數條', '分數加減算一算', '分數的整數倍'] },
  appr: { name: '概數', icon: '🌋', zone: '火山測量站', c: '#a34a2a', modes: ['數線找最近的整百', '三種取概數的方法', '概數與估算'] },
  chart: { name: '長條圖與折線圖', icon: '📊', zone: '恐龍數量調查站', c: '#3a6ea5', modes: ['畫出長條圖', '讀長條圖', '折線圖與複雜長條圖'] },
  dmul: { name: '小數乘以整數', icon: '🦴', zone: '骨頭測量室', c: '#7a5aa8', modes: ['百格圖乘一乘', '小數點在哪裡', '小數乘法應用題'] },
  peri: { name: '周長與面積', icon: '🌿', zone: '蕨類植物園', c: '#2f7d6d', modes: ['排出長方形', '周長、面積公式', '複合圖形與平方公尺'] },
  equiv: { name: '等值分數', icon: '🍃', zone: '樹葉分分看', c: '#4f9d3a', modes: ['塗出一樣多', '找等值分數', '分數和小數'] },
  time: { name: '時間的計算', icon: '⏳', zone: '化石年代鐘塔', c: '#8b5e34', modes: ['時間往後撥', '時間單位換算', '時間的加減與經過'] },
  vol: { name: '體積與立方公分', icon: '🧊', zone: '琥珀方塊工坊', c: '#c58b16', modes: ['堆出積木', '數一數體積', '比一比體積'] },
  rule: { name: '數量規律', icon: '👣', zone: '恐龍腳印小徑', c: '#6a7d2a', modes: ['排出圖形規律', '數列找規律', '規律的應用'] },
  simp: { name: '四則運算與簡化計算', icon: '🧮', zone: '翼龍算盤塔', c: '#9a3f6b', modes: ['先算哪一個', '運算的性質', '簡化計算與併式'] }
};
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰', '🎯 進階挑戰'];
const ADV_NAME = '考卷陷阱題 5 題';
const keyOf = (id, mi) => `${id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="star${k < n ? ' on' : ''}">🦴</span>`).join('');
const PUBN = { nani: '南一', kang: '康軒', han: '翰林' };

/* 目前版本、範圍要顯示的單元（沒有 kg-ver.js 時用預設版本全冊） */
function verUnits() { return window.KGVer ? KGVer.units(BOOK) : BOOK.versions[BOOK.defaultVersion]; }
function verName() { return PUBN[window.KGVer ? KGVer.cur(BOOK).version : BOOK.defaultVersion]; }
/* 顯示中的關卡順序（下一關用） */
function order() { const o = []; verUnits().forEach(vu => vu.levels.forEach(id => [0, 1, 2, 3].forEach(mi => o.push({ vu, id, mi })))); return o; }

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
      ${vu.levels.map(id => `${vu.levels.length > 1 ? `<div class="sub-name">${UNITS[id].name}</div>` : ''}<div class="lv-btns">${[0, 1, 2, 3].map(mi => {
        const s = P[keyOf(id, mi)] || 0; total += s; max += 3;
        return `<button type="button" class="lv-btn${mi === 3 ? ' adv' : ''}" data-u="${id}" data-m="${mi}" data-no="${vu.no}"><span>${MODE_TAG[mi]}<br><small>${mi === 3 ? ADV_NAME : UNITS[id].modes[mi]}</small></span><span class="st">${starHTML(s)}</span></button>`;
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
  const mname = mi === 3 ? ADV_NAME : u.modes[mi];
  $('#lvTitle').innerHTML = `<span class="sem-mini">下學期</span><span class="u-no" style="background:${u.c}">第 ${vu.no} 單元 ${vu.title}</span><br>${MODE_TAG[mi]}：${mname}`;
  window.KGReport && KGReport.level(`${vu.no}-${'ABCD'[mi]} ${MODE_TAG[mi]}：${mname}`, `第 ${vu.no} 單元 ${vu.title}（${verName()}版）`);
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st);
  window.scrollTo(0, 0);
  try { LEVELS[id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回營地再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }
function nextOf(c) { const o = order(), k = o.findIndex(x => x.id === c.id && x.mi === c.mi && x.vu.no === c.no); return k >= 0 ? o[k + 1] : null; }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.id, c.mi);
  P[k] = Math.max(P[k] || 0, stars); saveP();
  sfx('win'); coins();
  window.KGReport && KGReport.done({ stars });
  $('#rTitle').textContent = stars === 3 ? '挖到完整化石！' : stars === 2 ? '過關了！' : '完成任務！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對，拿到 3 塊化石！' : `答錯 ${c.miss} 次，再挑戰一次可以拿到更多化石喔！`;
  $('#nextBtn').hidden = !nextOf(c);
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 塊化石`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.id, cur.mi, cur.no);
$('#nextBtn').onclick = () => { if (!cur) return; const n = nextOf(cur); if (n) openLevel(n.id, n.mi, n.vu.no); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有化石嗎？')) { P = {}; saveP(); renderHub(); } };

/* 版本／範圍切換：重畫單元與月考試卷 */
function mountExam() { if (window.KGExam && window.EXAM_BANK) KGExam.mount($('#exam-box'), window.KGVer ? KGVer.examBank(BOOK, EXAM_BANK) : EXAM_BANK); }
function onVer() { renderHub(); mountExam(); }
if (window.KGVer) KGVer.bar($('#verBar'), BOOK, onVer);
renderHub();
window.addEventListener('load', function m() { if (window.KGExam) mountExam(); else setTimeout(m, 200); });
