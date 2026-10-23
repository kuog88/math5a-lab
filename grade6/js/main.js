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
  { id: 'u8', no: 8, name: '數量關係', icon: '🧩', c: '#5bb4ff', modes: ['排桌子找規律', '關係式想一想', '數量關係挑戰'] }
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
