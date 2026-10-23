'use strict';
/* 首頁、關卡切換、過關星星 */
const UNITS = [
  { id: 'u1', no: 1, name: '一億以內的數', icon: '🔢', c: '#ff7eb3', modes: ['位值表撥一撥', '讀數、寫數與換算', '大數比大小與加減'] },
  { id: 'u2', no: 2, name: '乘法', icon: '✖️', c: '#5bb4ff', modes: ['乘法直式工作台', '乘法想一想', '乘法應用挑戰'] },
  { id: 'u3', no: 3, name: '角度', icon: '📐', c: '#3fcf9c', modes: ['轉轉量角器畫角', '量角與角的分類', '旋轉角與角度計算'] },
  { id: 'u4', no: 4, name: '除法', icon: '➗', c: '#ff9a4d', modes: ['除法直式一步步', '除法想一想', '除法應用挑戰'] },
  { id: 'u5', no: 5, name: '三角形', icon: '🔺', c: '#a98bff', modes: ['三角形分類箱', '三角形的性質', '全等三角形'] },
  { id: 'u6', no: 6, name: '分數', icon: '🍕', c: '#ff7eb3', modes: ['分數條塗一塗', '真分數、假分數、帶分數', '分數數線挑戰'] },
  { id: 'u7', no: 7, name: '數量關係', icon: '🧩', c: '#3fcf9c', modes: ['點點圖形規律', '數字的規律', '奇偶與規律挑戰'] },
  { id: 'u8', no: 8, name: '整數四則', icon: '🧮', c: '#5bb4ff', modes: ['先算哪一步', '列出併式', '四則計算挑戰'] },
  { id: 'u9', no: 9, name: '小數', icon: '🔟', c: '#ff9a4d', modes: ['百格板塗一塗', '二位小數與比大小', '小數加減與數線'] },
  { id: 'u10', no: 10, name: '長度', icon: '🏃', c: '#a98bff', modes: ['跑道跑一跑', '公里、公尺、公分換算', '長度計算挑戰'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰'];
const keyOf = (ui, mi) => `${UNITS[ui].id}-${mi}`;
const starHTML = n => [0, 1, 2].map(k => `<span class="star${k < n ? ' on' : ''}">★</span>`).join('');

function renderHub() {
  let total = 0;
  $('#unitGrid').innerHTML = UNITS.map((u, ui) => `
    <div class="ucard" style="--c:${u.c}">
      <span class="u-no">第 ${u.no} 單元</span><span class="u-icon">${u.icon}</span>
      <h3>${u.name}</h3>
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
  $('#lvTitle').innerHTML = `<span class="u-no" style="background:${u.c}">第 ${u.no} 單元 ${u.name}</span><br>${MODE_TAG[mi]}：${u.modes[mi]}`;
  const old = $('#stage'), st = old.cloneNode(false); old.replaceWith(st); // 換新的舞台，清掉舊的事件
  window.scrollTo(0, 0);
  try { LEVELS[u.id][mi](st); } catch (e) { console.error(e); st.innerHTML = '<p>這一關出了點問題，請回首頁再試一次。</p>'; }
}

function goHome() { runCleanup(); cur = null; $('#play').hidden = true; $('#result').hidden = true; $('#homeBtn').hidden = true; $('#hub').hidden = false; renderHub(); window.scrollTo(0, 0); }

window.onLevelDone = c => {
  const stars = c.miss === 0 ? 3 : c.miss <= 2 ? 2 : 1, k = keyOf(c.ui, c.mi);
  const best = Math.max(P[k] || 0, stars); P[k] = best; saveP();
  sfx('win'); confetti();
  $('#rTitle').textContent = stars === 3 ? '太厲害了！' : stars === 2 ? '過關了！' : '完成了！';
  $('#rStars').innerHTML = starHTML(stars);
  $('#rMsg').textContent = stars === 3 ? '全部一次就答對！' : `答錯 ${c.miss} 次，再玩一次可以拿更多星星喔！`;
  const last = c.ui === UNITS.length - 1 && c.mi === 2;
  $('#nextBtn').hidden = last;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 顆星`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; let { ui, mi } = cur; mi++; if (mi > 2) { mi = 0; ui++; } if (ui < UNITS.length) openLevel(ui, mi); else goHome(); };
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
