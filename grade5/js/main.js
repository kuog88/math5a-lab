'use strict';
/* 首頁、關卡切換、過關星星 */
const UNITS = [
  { id: 'u1', no: 1, name: '折線圖', icon: '📈', c: '#ff7eb3', modes: ['畫出折線圖', '看懂統計圖', '統計圖挑戰', '考卷陷阱題'] },
  { id: 'u2', no: 2, name: '因數和倍數', icon: '🪖', c: '#5bb4ff', modes: ['閱兵排方陣', '因數倍數想一想', '公因數公倍數挑戰', '考卷陷阱題'] },
  { id: 'u3', no: 3, name: '多邊形', icon: '🔷', c: '#3fcf9c', modes: ['木棒圍圍看、切三角形', '多邊形想一想', '內角和挑戰', '考卷陷阱題'] },
  { id: 'u4', no: 4, name: '擴分、約分和通分', icon: '🍫', c: '#ff9a4d', modes: ['分數條切切看', '擴分約分想一想', '通分比大小挑戰', '考卷陷阱題'] },
  { id: 'u5', no: 5, name: '線對稱圖形', icon: '🦋', c: '#a98bff', modes: ['方格照鏡子', '對稱軸想一想', '對稱點挑戰', '考卷陷阱題'] },
  { id: 'u6', no: 6, name: '異分母分數的加減', icon: '🧁', c: '#ff7eb3', modes: ['找一把共同的尺', '分數加減想一想', '分數加減挑戰', '考卷陷阱題'] },
  { id: 'u7', no: 7, name: '整數四則計算', icon: '🧮', c: '#3fcf9c', modes: ['算式拆彈', '計算規則想一想', '四則應用挑戰', '考卷陷阱題'] },
  { id: 'u8', no: 8, name: '平行四邊形、三角形和梯形的面積', icon: '📐', c: '#5bb4ff', modes: ['找高算面積', '面積公式想一想', '面積挑戰', '考卷陷阱題'] },
  { id: 'u9', no: 9, name: '時間的乘除', icon: '⏰', c: '#ff9a4d', modes: ['時間換換機', '時間單位想一想', '時間應用挑戰', '考卷陷阱題'] },
  { id: 'u10', no: 10, name: '正方體和長方體', icon: '🎲', c: '#a98bff', modes: ['展開圖設計師', '面和邊想一想', '表面積挑戰', '考卷陷阱題'] }
];
const MODE_TAG = ['🖐 動手做', '💡 想一想', '🏆 挑戰', '🎯 進階挑戰'];
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
  $('#maxStars').textContent = UNITS.length * MODE_TAG.length * 3;
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
  const last = c.ui === UNITS.length - 1 && c.mi === MODE_TAG.length - 1;
  $('#nextBtn').hidden = last;
  $('#result').hidden = false;
  speak($('#rTitle').textContent + `得到 ${stars} 顆星`);
};

$('#againBtn').onclick = () => cur && openLevel(cur.ui, cur.mi);
$('#nextBtn').onclick = () => { if (!cur) return; let { ui, mi } = cur; mi++; if (mi >= MODE_TAG.length) { mi = 0; ui++; } if (ui < UNITS.length) openLevel(ui, mi); else goHome(); };
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
