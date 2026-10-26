'use strict';
/* 首頁（潛水地圖）、關卡切換、過關貝殼 */
const UNITS = [
  { id: 'u1', no: 1, name: '除法', icon: '💎', zone: '珊瑚礁', c: '#ff7a59', modes: ['寶石平分裝箱', '直式除法與餘數', '餘數應用與估算'] },
  { id: 'u2', no: 2, name: '找規律', icon: '🐠', zone: '熱帶魚群', c: '#ffb648', modes: ['排出下一個圖形', '數的規律', '數量關係的規律'] },
  { id: 'u3', no: 3, name: '時間', icon: '⏰', zone: '沉船鐘樓', c: '#2ad1c9', modes: ['24 時制撥鐘', '日、時、分、秒', '時間的計算'] },
  { id: 'u4', no: 4, name: '兩步驟的計算', icon: '🦀', zone: '螃蟹市場', c: '#ff6f91', modes: ['兩步驟的乘法', '倍的計算', '加除、減除問題'] },
  { id: 'u5', no: 5, name: '面積', icon: '🟦', zone: '海藻田', c: '#58c26b', modes: ['塗出平方公分', '切割和拼湊', '面積的估算'] },
  { id: 'u6', no: 6, name: '公斤和公克', icon: '⚖️', zone: '潛水艇貨艙', c: '#8b7bff', modes: ['砝碼秤重', '秤面與換算', '重量的計算'] },
  { id: 'u7', no: 7, name: '分數', icon: '🍉', zone: '海龜餐廳', c: '#ff7a59', modes: ['分數條塗一塗', '分數比大小', '分數的加減'] },
  { id: 'u8', no: 8, name: '乘除的應用', icon: '🐳', zone: '鯨魚港口', c: '#3aa3ff', modes: ['數字卡乘除家族', '驗算小偵探', '找出未知數'] },
  { id: 'u9', no: 9, name: '小數', icon: '🫧', zone: '泡泡實驗室', c: '#2ad1c9', modes: ['0.1 塗一塗', '小數的大小', '小數的加減'] },
  { id: 'u10', no: 10, name: '報讀表格', icon: '📋', zone: '海洋觀測站', c: '#ffb648', modes: ['數一數做表格', '一維表格', '二維表格'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰'];
const keyOf = (ui, mi) => `${UNITS[ui].id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="star${k < n ? ' on' : ''}">🐚</span>`).join('');

function renderHub() {
  let total = 0;
  $('#unitGrid').innerHTML = UNITS.map((u, ui) => `
    <div class="station" style="--c:${u.c}">
      <div class="st-head"><span class="porthole">${u.icon}</span>
        <div><span class="u-no">第 ${u.no} 單元・${u.zone}</span><h3>${u.name}</h3></div></div>
      <div class="lv-btns">${u.modes.map((m, mi) => { const s = P[keyOf(ui, mi)] || 0; total += s; return `<button type="button" class="lv-btn" data-u="${ui}" data-m="${mi}"><span>${MODE_TAG[mi]}<br><small>${m}</small></span><span class="st">${starHTML(s)}</span></button>`; }).join('')}</div>
    </div>`).join('');
  $('#totalStars').textContent = total;
  $('#maxStars').textContent = UNITS.length * 9;
  $$('.lv-btn').forEach(b => b.onclick = () => openLevel(+b.dataset.u, +b.dataset.m));
}

function openLevel(ui, mi) {
  runCleanup();
  const u = UNITS[ui];
  cur = { ui, mi, miss: 0, done: false };
  $('#hub').hidden = true; $('#play').hidden = false; $('#homeBtn').hidden = false; $('#result').hidden = true;
  $('#lvTitle').innerHTML = `<span class="sem-mini">下學期</span><span class="u-no" style="background:${u.c}">第 ${u.no} 單元 ${u.name}</span><br>${MODE_TAG[mi]}：${u.modes[mi]}`;
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st);
  window.scrollTo(0, 0);
  try { LEVELS[u.id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回基地再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.ui, c.mi);
  P[k] = Math.max(P[k] || 0, stars); saveP();
  sfx('win'); bubbles();
  $('#rTitle').textContent = stars === 3 ? '探險大成功！' : stars === 2 ? '過關了！' : '完成任務！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對，拿到 3 個貝殼！' : `答錯 ${c.miss} 次，再潛一次可以撿到更多貝殼喔！`;
  $('#nextBtn').hidden = c.ui === UNITS.length - 1 && c.mi === 2;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 個貝殼`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; let { ui, mi } = cur; mi++; if (mi > 2) { mi = 0; ui++; } if (ui < UNITS.length) openLevel(ui, mi); else goHome(); };
$('#backBtn').onclick = goHome;
$('#homeBtn').onclick = goHome;
$('#speakBtn').onclick = () => speak(lastSay);
$('#soundBtn').onclick = () => { muted = !muted; $('#soundBtn').textContent = muted ? '🔇' : '🔊'; if (muted) try { speechSynthesis.cancel(); } catch (e) {} };
$('#resetBtn').onclick = () => { if (confirm('確定要清除所有貝殼嗎？')) { P = {}; saveP(); renderHub(); } };

(function sea() {
  const d = $('.sea');
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('span'); b.className = 'bub';
    const s = rand(8, 26); b.style.width = b.style.height = s + 'px';
    b.style.left = rand(0, 100) + '%'; b.style.animationDuration = rand(9, 20) + 's'; b.style.animationDelay = -rand(0, 20) + 's';
    d.appendChild(b);
  }
  ['🐟', '🐠', '🐡', '🦑', '🐢'].forEach((f, i) => {
    const e = document.createElement('span'); e.className = 'swim'; e.textContent = f;
    e.style.top = (12 + i * 16) + '%'; e.style.animationDuration = rand(28, 50) + 's'; e.style.animationDelay = -rand(0, 40) + 's';
    d.appendChild(e);
  });
})();
renderHub();
