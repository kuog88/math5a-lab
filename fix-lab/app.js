/* 數學故障修復局：重啟任務！ 畫面與流程
   進度存在 localStorage 'kg-fixlab-v1'：
   { grade, machines: { 類型id: { g, src:{auto,manual,entry,play}, added, fixed, wins, tries } }, entries: [...], muted }
   網址參數：?grade=3 先選好年級；?go=scan 直接打開「自動掃描錯題」；?go=entry 打開「輸入錯題」 */
(function () {
  'use strict';
  const D = window.FixDB, X = window.FixDiag, Q = D.Q;
  const KEY = 'kg-fixlab-v1', REP = 'kg-report-v1', ROUND = 5;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const app = $('#app');

  /* ---------- 存檔 ---------- */
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.machines) return Object.assign({ entries: [], muted: false }, s); } catch (e) { } return { grade: 0, machines: {}, entries: [], muted: false }; }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function report() { try { return JSON.parse(localStorage.getItem(REP)) || { games: {} }; } catch (e) { return { games: {} }; } }
  const params = new URLSearchParams(location.search);
  if (+params.get('grade') >= 1 && +params.get('grade') <= 6) S.grade = +params.get('grade');
  if (!S.grade) { // 依最近玩的數學遊戲猜年級
    let best = 0, bg = 3; const gs = report().games || {};
    Object.keys(gs).forEach(k => { const m = k.match(/^math5a-lab\/grade(\d)/); if (m && (gs[k].last || 0) > best) { best = gs[k].last || 0; bg = +m[1]; } });
    S.grade = bg;
  }
  save();

  /* ---------- 小工具 ---------- */
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // 純文字 → 畫面：a/b 排成上下分數，2又1/3 排成帶分數
  function fmt(s) {
    return esc(s)
      .replace(/(\d+)又(\d+)\/(\d+)/g, '<span class="mx">$1<b class="y">又</b><span class="fr"><i>$2</i><b>/</b><i>$3</i></span></span>')
      .replace(/(\d+)\/(\d+)/g, '<span class="fr"><i>$1</i><b>/</b><i>$2</i></span>')
      .replace(/\n/g, '<br>');
  }
  const hue = id => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const bot = (id, ok, cls) => `<div class="bot ${ok ? 'ok' : 'broken'} ${cls || ''}" style="--h:${hue(id)}"><i class="ant"></i><div class="head"><i class="eye"></i><i class="eye"></i><i class="mouth"></i></div><div class="body"></div><i class="smoke"></i><i class="smoke s2"></i></div>`;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const later = (f, ms) => setTimeout(f, ms);
  const gOf = (t, g) => t.grades.includes(+g) ? +g : t.grades.reduce((b, x) => Math.abs(x - g) < Math.abs(b - g) ? x : b, t.grades[0]);
  const SRC = { auto: ['auto', '🔍 錯題偵測'], manual: ['manual', '☑️ 家長勾選'], entry: ['entry', '✍️ 輸入錯題'], play: ['', '🎮 自己挑'] };

  /* ---------- 音效（可關） ---------- */
  let ac = null;
  function tone(fs, dur, type, vol) {
    if (S.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime;
      fs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(vol || .06, t + i * dur); g.gain.exponentialRampToValueAtTime(.001, t + i * dur + dur * .95); o.connect(g); g.connect(ac.destination); o.start(t + i * dur); o.stop(t + i * dur + dur); });
    } catch (e) { }
  }
  const sfx = { tap: () => tone([660], .05, 'square', .025), ok: () => tone([660, 990], .1), bad: () => tone([240, 170], .14, 'sawtooth', .035), boot: () => tone([392, 523, 659, 784, 1046], .11, 'triangle', .07) };
  function muteIcon() { $('.snd').textContent = S.muted ? '🔇' : '🔊'; $('.snd').setAttribute('aria-pressed', S.muted ? 'true' : 'false'); }

  /* ---------- 家長報表 ---------- */
  // 報表程式由 home-button.js 從網站非同步載入；還沒載好就先記住關卡，第一次作答時再補設定
  const Rp = {
    cur: null, set: false,
    level(t, g) { this.cur = { name: `故障修復：${t.name}`, unit: `${g} 年級 ${t.units.find(u => u.startsWith(String(g))) || t.units[0]}` }; this.set = false; this.sync(); },
    sync() { if (!this.set && this.cur && window.KGReport) { KGReport.level(this.cur.name, this.cur.unit); this.set = true; } return !!window.KGReport; },
    ans(ok, q, a, c) { if (this.sync()) KGReport.answer(ok, { q, a, c }); },
    done(o) { if (this.sync()) KGReport.done(o); }
  };

  /* ---------- 畫面切換 ---------- */
  let screen = 'home';
  function go(name, arg) { screen = name; clearTimeout(go.t); window.scrollTo(0, 0); ({ home, scan, pick, entry, catalog, mission }[name])(arg); }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'home') { M = null; go('home'); }
    else if (a === 'mute') { S.muted = !S.muted; save(); muteIcon(); }
    else if (a === 'grade') { S.grade = +b.dataset.g; save(); go(screen === 'pick' || screen === 'catalog' ? screen : 'home', S.grade); }
    else if (a === 'go') go(b.dataset.to, b.dataset.arg);
    else if (a === 'machine') go('mission', b.dataset.id);
  });
  const gradeBar = () => `<div class="grades" role="group" aria-label="選年級">${[1, 2, 3, 4, 5, 6].map(g => `<button type="button" class="gbtn ${g === S.grade ? 'on' : ''}" data-act="grade" data-g="${g}">${g} 年級</button>`).join('')}</div>`;

  function machineCard(id, opt) {
    const t = D.byId[id], m = S.machines[id], fixed = m && m.fixed;
    const tags = m ? Object.keys(m.src || {}).filter(k => SRC[k]).map(k => `<span class="tag ${SRC[k][0]}">${SRC[k][1]}</span>`).join('') : '<span class="tag">還沒送修</span>';
    return `<button type="button" class="mc ${fixed ? 'fixed' : ''}" data-act="machine" data-id="${id}">
      ${bot(id, fixed)}
      <span class="rb">${esc(t.robot)}</span>
      <span class="nm">${esc(t.name)}</span>
      <span class="tags">${opt && opt.grade ? `<span class="tag">${m && m.g || t.grades[0]} 年級</span>` : ''}${tags}${fixed ? `<span class="tag ok">修好 ${m.wins || 1} 次</span>` : ''}</span>
      <span class="st ${fixed ? 'good' : 'bad'}">${fixed ? '✅ 運轉中（可再練）' : '⚠️ 故障中，點我修理'}</span></button>`;
  }

  /* ---------- 首頁：修理工廠 ---------- */
  function home() {
    const ids = Object.keys(S.machines).filter(id => D.byId[id]);
    const broken = ids.filter(id => !S.machines[id].fixed).sort((a, b) => S.machines[b].added - S.machines[a].added);
    const fixed = ids.filter(id => S.machines[id].fixed).sort((a, b) => S.machines[b].fixed - S.machines[a].fixed);
    app.innerHTML = `
      <section class="hero"><h1>數學故障修復局：<span class="y">重啟任務！</span></h1>
        <p>每一種常犯的錯，都是一台故障機器。先找出<b>錯在哪一步</b>，再連續修好 ${ROUND} 題相似題，機器就會重新啟動！</p></section>
      ${gradeBar()}
      <div class="sec">🧰 送修：機器從哪裡來？</div>
      <div class="srcs">
        <button type="button" class="src" style="--c:var(--orange)" data-act="go" data-to="scan"><span class="ic">🔍</span><span><b>自動掃描錯題</b><span>讀這台裝置的家長報表，從數學遊戲和月考測驗卷的錯題猜出常犯的錯。</span></span></button>
        <button type="button" class="src" style="--c:var(--violet)" data-act="go" data-to="pick"><span class="ic">☑️</span><span><b>家長勾選</b><span>依孩子作業、習作上常錯的地方，勾選要修的錯誤類型。</span></span></button>
        <button type="button" class="src" style="--c:var(--cyan)" data-act="go" data-to="entry"><span class="ic">✍️</span><span><b>輸入一題錯題</b><span>打上題目、孩子的答案和正確答案，系統建議可能的錯誤類型。</span></span></button>
      </div>
      <div class="sec">🏭 我的修理工廠 <small>${broken.length} 台故障、${fixed.length} 台已重啟</small></div>
      ${ids.length ? `<div class="floor">${broken.concat(fixed).map(id => machineCard(id, { grade: true })).join('')}</div>`
        : `<div class="empty">工廠還是空的！<br>請家長用上面三種方式送修，或直接到下面挑一台機器來修。</div>`}
      <div class="row"><button type="button" class="btn sec2" data-act="go" data-to="catalog" data-arg="${S.grade}">📚 看 ${S.grade} 年級全部 ${D.forGrade(S.grade).length} 台機器</button></div>
      <p class="note" style="color:#9fb2d3;text-align:center">給家長：進度存在這台裝置的瀏覽器裡；換孩子時資料會自動分開。每一題作答都會記到「📊 家長報表」。</p>`;
  }

  /* ---------- 全部機器（依年級） ---------- */
  function catalog(g) {
    g = +g || S.grade;
    const list = D.forGrade(g);
    app.innerHTML = `${gradeBar()}<div class="sec">📚 ${g} 年級的故障機器 <small>共 ${list.length} 台</small></div>
      <div class="floor">${list.map(t => machineCard(t.id)).join('')}</div>
      <div class="row"><button type="button" class="btn sec2" data-act="home">← 回修理工廠</button></div>`;
  }

  function addMachine(id, src, g) {
    const t = D.byId[id]; if (!t) return;
    const m = S.machines[id] || (S.machines[id] = { g: gOf(t, g || S.grade), src: {}, added: Date.now(), fixed: 0, wins: 0, tries: 0 });
    m.src[src] = 1;
    if (src !== 'play' && m.fixed) { m.fixed = 0; m.added = Date.now(); } // 又被偵測到：重新變成故障
  }

  /* ---------- 來源 1：自動掃描家長報表 ---------- */
  function scan() {
    const r = X.scanReport(report(), { grade: S.grade });
    const known = r.types.filter(x => x.id !== 'other'), other = r.types.find(x => x.id === 'other');
    const exLine = e => `<div class="ex">「${fmt(e.q || '（沒有題目文字）')}」孩子答 <b>${fmt(e.a)}</b>，正確是 <b>${fmt(e.c)}</b>${e.why ? `｜${esc(e.why)}` : ''}</div>`;
    app.innerHTML = `<div class="panel">
      <div class="mhead">${bot('scan', false)}<div class="t"><h2>🔍 自動掃描錯題</h2><small>來源：這台裝置的家長報表（數學各年級遊戲＋月考測驗卷）</small></div></div>
      ${r.total ? `<p class="lead">讀到 <b>${r.total}</b> 題數學錯題。依照「答案和正確答案的關係」判斷可能的錯誤類型（例如差 10 倍可能是小數點或單位，差 10、100 可能是進位或借位）。請家長確認要送修哪些：</p>
        <div id="list">${known.map(x => { const t = D.byId[x.id], have = S.machines[x.id]; return `<label class="chk ${have && !have.fixed ? '' : 'on'}"><input type="checkbox" value="${x.id}" data-g="${x.grade}" ${have && !have.fixed ? '' : 'checked'}>
          <span><b>${esc(t.name)}　<span class="tag">${x.count} 題${x.fixed ? `，已訂正 ${x.fixed}` : ''}</span>${have && !have.fixed ? ' <span class="tag auto">已在工廠</span>' : ''}</b><span>${esc(t.wrong)}</span>${x.ex.map(exLine).join('')}</span></label>`; }).join('') || '<p class="lead">這些錯題都判斷不出明確的類型。</p>'}</div>
        ${other ? `<details class="note"><summary>還有 ${other.count} 題歸到「其他」（規則判斷不出來，例如題意理解、圖形題、看錯題目）</summary>${other.ex.map(exLine).join('')}</details>` : ''}
        <div class="row"><button type="button" class="btn go" id="sendAuto">🚚 把勾選的機器送進工廠</button><button type="button" class="btn sec2" data-act="home">取消</button></div>`
        : `<div class="empty" style="color:var(--muted);border-color:#cfd8e6">這台裝置還沒有數學遊戲的錯題紀錄。<br>孩子先玩一玩各年級的數學遊戲或月考測驗卷，再回來掃描；也可以改用「家長勾選」或「輸入一題錯題」。</div>
        <div class="row"><button type="button" class="btn" data-act="go" data-to="pick">☑️ 改用家長勾選</button><button type="button" class="btn sec2" data-act="home">← 回工廠</button></div>`}
      </div>`;
    $$('.chk input', app).forEach(i => i.onchange = () => i.closest('.chk').classList.toggle('on', i.checked));
    const b = $('#sendAuto'); if (b) b.onclick = () => {
      const sel = $$('#list input:checked', app); sel.forEach(i => addMachine(i.value, 'auto', +i.dataset.g || S.grade));
      save(); sfx.ok(); go('home');
    };
  }

  /* ---------- 來源 2：家長勾選 ---------- */
  function pick(g) {
    g = +g || S.grade;
    const list = D.forGrade(g);
    app.innerHTML = `${gradeBar()}<div class="panel">
      <h2>☑️ 家長勾選：${g} 年級常見錯誤</h2>
      <p class="lead">依孩子作業、習作、考卷上常錯的地方勾選。勾到的會變成工廠裡的故障機器；取消勾選會把「家長勾選」送來的機器移出工廠。</p>
      <div id="list">${list.map(t => { const m = S.machines[t.id], on = !!(m && m.src && m.src.manual); return `<label class="chk ${on ? 'on' : ''}"><input type="checkbox" value="${t.id}" ${on ? 'checked' : ''}>
        <span><b>${esc(t.name)}</b><span>${esc(t.wrong)}</span><span class="tag">${esc(t.units.join('、'))}</span></span></label>`; }).join('')}</div>
      <div class="row"><button type="button" class="btn go" id="savePick">💾 儲存，送進工廠</button><button type="button" class="btn sec2" data-act="home">取消</button></div></div>`;
    $$('.chk input', app).forEach(i => i.onchange = () => i.closest('.chk').classList.toggle('on', i.checked));
    $('#savePick').onclick = () => {
      $$('#list input', app).forEach(i => {
        const m = S.machines[i.value];
        if (i.checked) addMachine(i.value, 'manual', g);
        else if (m && m.src && m.src.manual) { delete m.src.manual; if (!Object.keys(m.src).length && !m.wins) delete S.machines[i.value]; }
      });
      save(); sfx.ok(); go('home');
    };
  }

  /* ---------- 來源 3：家長輸入一題錯題 ---------- */
  function entry() {
    const recent = (S.entries || []).slice(0, 6);
    app.innerHTML = `<div class="panel">
      <h2>✍️ 輸入一題錯題</h2>
      <p class="lead">把作業或考卷上的一題錯題打進來（不用拍照），系統會用規則猜可能的錯誤類型，請家長確認。</p>
      <div class="form">
        <label>年級<select id="eg">${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}" ${g === S.grade ? 'selected' : ''}>${g} 年級</option>`).join('')}</select></label>
        <label>題目（算式或應用題原文）<textarea id="eq" placeholder="例：用直式算 52 − 18 = ？"></textarea></label>
        <label>孩子的答案<input id="ea" inputmode="text" placeholder="例：44（分數寫 3/4，帶分數寫 2又1/3，有餘數寫 6…5）"></label>
        <label>正確答案<input id="ec" inputmode="text" placeholder="例：34"></label>
      </div>
      <div class="row"><button type="button" class="btn" id="anal">🔍 分析可能的錯誤</button><button type="button" class="btn sec2" data-act="home">← 回工廠</button></div>
      <div id="sug"></div>
      ${recent.length ? `<div class="sec" style="color:var(--ink)">最近輸入的錯題</div>${recent.map(e => `<div class="chk" style="cursor:default"><span><b>${fmt(e.q)}</b><span>孩子答 ${fmt(e.a)}，正確 ${fmt(e.c)} → ${e.types.map(id => D.byId[id] ? esc(D.byId[id].name) : '其他').join('、')}</span></span></div>`).join('')}` : ''}
      </div>`;
    $('#anal').onclick = () => {
      const q = $('#eq').value.trim(), a = $('#ea').value.trim(), c = $('#ec').value.trim(), g = +$('#eg').value;
      const box = $('#sug');
      if (!q || !a || !c) { box.innerHTML = '<p class="msg bad">題目、孩子的答案、正確答案都要填喔。</p>'; return; }
      const res = X.diagnose({ q, a, c }, g).filter(o => o.id !== 'other');
      const rest = D.forGrade(g).filter(t => !res.some(o => o.id === t.id));
      box.innerHTML = `${res.length ? `<p class="lead"><b>可能是這些錯誤</b>（請確認，取消不像的）：</p>${res.map(o => { const t = D.byId[o.id]; return `<label class="chk on"><input type="checkbox" value="${o.id}" checked><span><b>${esc(t.name)}</b><span>${esc(o.why)}。${esc(t.wrong)}</span></span></label>`; }).join('')}`
        : '<p class="lead">規則判斷不出明確的錯誤類型（會先記成「其他」）。可以從下面自己選一類：</p>'}
        <div class="form"><label>也可以自己選一類<select id="extra"><option value="">（不用）</option>${rest.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label></div>
        <div class="row"><button type="button" class="btn go" id="sendEntry">🚚 確認，送進工廠</button></div>`;
      $$('.chk input', box).forEach(i => i.onchange = () => i.closest('.chk').classList.toggle('on', i.checked));
      $('#sendEntry').onclick = () => {
        const ids = $$('.chk input:checked', box).map(i => i.value), ex = $('#extra').value; if (ex) ids.push(ex);
        ids.forEach(id => addMachine(id, 'entry', g));
        S.entries = [{ q, a, c, g, types: ids.length ? ids : ['other'], ts: Date.now() }].concat(S.entries || []).slice(0, 50);
        save(); sfx.ok(); go('home');
      };
    };
  }

  /* ---------- 圖：時鐘、尺、量角器 ---------- */
  function fig(f) {
    if (!f) return '';
    if (f.type === 'clock') {
      const cx = 80, cy = 80, ha = ((f.h % 12) + f.m / 60) * 30, ma = f.m * 6, P = (a, r) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
      let s = `<svg viewBox="0 0 160 160" width="170" role="img" aria-label="時鐘"><circle cx="80" cy="80" r="74" fill="#fff" stroke="#2b3d5c" stroke-width="5"/>`;
      for (let i = 1; i <= 12; i++) { const [x, y] = P(i * 30, 58); s += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="#2b3d5c">${i}</text>`; }
      for (let i = 0; i < 60; i++) { const [x1, y1] = P(i * 6, 72), [x2, y2] = P(i * 6, i % 5 ? 68 : 65); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8fa3bf" stroke-width="${i % 5 ? 1 : 2}"/>`; }
      const [hx, hy] = P(ha, 36), [mx, my] = P(ma, 56);
      return s + `<line x1="80" y1="80" x2="${hx}" y2="${hy}" stroke="#ff4d5e" stroke-width="7" stroke-linecap="round"/><line x1="80" y1="80" x2="${mx}" y2="${my}" stroke="#2b3d5c" stroke-width="4" stroke-linecap="round"/><circle cx="80" cy="80" r="5" fill="#2b3d5c"/></svg>`;
    }
    if (f.type === 'ruler') {
      const u = 20, x0 = 12; let s = `<svg viewBox="0 0 330 96" width="330" role="img" aria-label="尺和鉛筆"><rect x="${x0 + f.s * u}" y="10" width="${(f.e - f.s) * u - 14}" height="18" rx="4" fill="#ffcf33" stroke="#b88c00" stroke-width="2"/><polygon points="${x0 + f.e * u - 14},10 ${x0 + f.e * u},19 ${x0 + f.e * u - 14},28" fill="#f2c79b" stroke="#b88c00" stroke-width="2"/><rect x="${x0 + f.s * u - 2}" y="10" width="6" height="18" fill="#ff8aa0"/>`;
      s += `<rect x="4" y="36" width="322" height="54" rx="6" fill="#e9f6ff" stroke="#2b3d5c" stroke-width="2"/>`;
      for (let i = 0; i <= 15; i++) { const x = x0 + i * u; s += `<line x1="${x}" y1="36" x2="${x}" y2="56" stroke="#2b3d5c" stroke-width="2"/><text x="${x}" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#2b3d5c">${i}</text>`; if (i < 15) s += `<line x1="${x + u / 2}" y1="36" x2="${x + u / 2}" y2="48" stroke="#2b3d5c"/>`; }
      return s + `<text x="318" y="86" text-anchor="end" font-size="10" fill="#5d6b80">公分</text></svg>`;
    }
    if (f.type === 'protractor') {
      const cx = 150, cy = 140, P = (a, r) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
      let s = `<svg viewBox="0 0 300 160" width="300" role="img" aria-label="量角器"><path d="M20 140 A130 130 0 0 1 280 140 Z" fill="#eaf6ff" stroke="#2b3d5c" stroke-width="2"/>`;
      for (let a = 0; a <= 180; a += 10) {
        const [x1, y1] = P(a, 130), [x2, y2] = P(a, a % 30 ? 122 : 116); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2b3d5c"/>`;
        if (a % 30 === 0) { const [ox, oy] = P(a, 104), [ix, iy] = P(a, 80); s += `<text x="${ox}" y="${oy + 4}" text-anchor="middle" font-size="11" fill="#8c7bff" font-weight="700">${180 - a}</text><text x="${ix}" y="${iy + 4}" text-anchor="middle" font-size="11" fill="#2b3d5c" font-weight="700">${a}</text>`; }
      }
      const [rx, ry] = P(f.x, 150);
      return s + `<line x1="${cx}" y1="${cy}" x2="290" y2="${cy}" stroke="#ff4d5e" stroke-width="4"/><line x1="${cx}" y1="${cy}" x2="${rx}" y2="${ry}" stroke="#ff4d5e" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="4" fill="#2b3d5c"/>
        <text x="8" y="156" font-size="10" fill="#8c7bff">外圈（紫）</text><text x="292" y="156" text-anchor="end" font-size="10" fill="#2b3d5c">內圈（黑）</text></svg>`;
    }
    return '';
  }

  /* ---------- 修理任務 ---------- */
  let M = null;
  function mission(id) {
    const t = D.byId[id]; if (!t) return go('home');
    const m = S.machines[id], g = m && m.g ? gOf(t, m.g) : gOf(t, S.grade);
    M = { id, t, g, stage: 'demo', p: D.gen(id, g, { demo: true }), found: false, res: [], i: 0, seen: [] };
    Rp.level(t, g);
    demo();
  }
  function headHTML(ok) {
    const t = M.t;
    return `<div class="mhead">${bot(M.id, ok)}<div class="t"><small>${esc(t.robot)}｜${M.g} 年級｜${esc(t.units.join('、'))}</small><h2>${esc(t.name)}</h2></div></div>`;
  }
  function demo() {
    const p = M.p, t = M.t;
    app.innerHTML = `<div class="panel">${headHTML(false)}
      <div class="say">嗶嗶…滋滋！我是<b>${esc(t.robot)}</b>，我算出來的答案是 <b>${fmt(D.fmtAns(p, p.bug))}</b>，可是好像錯了😵<br>你能找出我是<b>哪一步</b>出錯的嗎？點那一步！</div>
      <div class="qbox">${fmt(p.q)}</div><div class="fig">${fig(p.fig)}</div>
      <div class="steps">${p.steps.map((s, i) => `<button type="button" class="step" data-i="${i}"><span class="n">${i + 1}</span><span>${fmt(s)}</span></button>`).join('')}</div>
      <div class="msg" id="dmsg"></div><div id="after"></div></div>
      <div class="row"><button type="button" class="link" data-act="home">← 回工廠</button></div>`;
    $$('.step', app).forEach(b => b.onclick = () => {
      if (M.found) return;
      const i = +b.dataset.i, qtext = `找出錯的步驟：${p.q}`, bads = p.bads && p.bads.length ? p.bads : [p.bad];
      if (bads.includes(i)) {
        M.found = true; sfx.ok();
        $$('.step', app).forEach((x, j) => x.classList.add(bads.includes(j) ? 'bad' : 'okstep'));
        Rp.ans(true, qtext, `第 ${i + 1} 步`, bads.map(x => `第 ${x + 1} 步`).join('或'));
        $('#dmsg').className = 'msg good'; $('#dmsg').textContent = bads.length > 1 ? `🎯 找到故障零件了！同樣的錯誤也出現在第 ${bads.filter(x => x !== i).map(x => x + 1).join('、')} 步（紅色）。` : '🎯 找到故障零件了！';
        $('#after').innerHTML = `<div class="explain w"><b>❌ 錯在哪裡：</b>${fmt(t.wrong)}</div>
          <div class="explain r"><b>✅ 正確觀念：</b>${fmt(t.right)}<br><b>這一題：</b>${fmt(p.fix)}<br><b>正確答案：</b>${fmt(D.fmtAns(p))}</div>
          <div class="row"><button type="button" class="btn go" id="startFix">🔧 開始修理：做 ${ROUND} 題相似題</button></div>`;
        $('#startFix').onclick = () => startRound();
      } else {
        sfx.bad(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        Rp.ans(false, qtext, `第 ${i + 1} 步`, bads.map(x => `第 ${x + 1} 步`).join('或'));
        $('#dmsg').className = 'msg bad'; $('#dmsg').textContent = '這一步沒有錯喔！再找找看是哪一步讓答案變成錯的。';
      }
    });
  }
  function startRound() { M.stage = 'practice'; M.i = 0; M.res = []; M.seen = []; nextQ(); }
  function nextQ() {
    let p, n = 0; do { p = D.gen(M.id, M.g); n++; } while (M.seen.includes(p.q) && n < 15);
    M.seen.push(p.q); M.p = p; M.locked = false; question();
  }
  function progHTML() { return `<div class="prog" aria-label="修理進度">${Array.from({ length: ROUND }, (_, i) => `<i class="${i < M.res.length ? (M.res[i] ? 'ok' : 'no') : i === M.i ? 'now' : ''}">${i < M.res.length ? (M.res[i] ? '✓' : '✗') : '⚙'}</i>`).join('')}</div>`; }
  function question() {
    const p = M.p;
    app.innerHTML = `<div class="panel">${headHTML(false)}${progHTML()}
      <div class="qbox">${fmt(p.q)}</div><div class="fig">${fig(p.fig)}</div>
      <div id="w"></div><div class="msg" id="qmsg"></div><div id="after"></div></div>
      <div class="row"><button type="button" class="link" data-act="home">← 回工廠（這一輪不算）</button></div>`;
    const w = $('#w');
    if (p.input === 'choice') choiceW(w, p);
    else if (p.input === 'eq') eqW(w, p);
    else padW(w, p);
  }
  // 交卷：記錄、顯示對錯
  function answered(ok, given, extra) {
    if (M.locked) return; M.locked = true;
    const p = M.p;
    Rp.ans(ok, p.q, given, D.fmtAns(p));
    M.res.push(ok); M.i++;
    const msg = $('#qmsg'), after = $('#after');
    $('.prog').outerHTML = progHTML();
    if (ok) { sfx.ok(); msg.className = 'msg good'; msg.textContent = pick1(['✅ 零件裝好了！', '✅ 正確！機器亮了一格！', '✅ 修得好！']); }
    else { sfx.bad(); msg.className = 'msg bad'; msg.textContent = '❌ 這個零件裝錯了'; }
    after.innerHTML = `${ok ? '' : `<div class="explain r">${extra || ''}<b>正確答案：</b>${fmt(D.fmtAns(p))}<br><b>為什麼：</b>${fmt(p.fix)}</div>`}
      <div class="row"><button type="button" class="btn ${ok ? 'go' : ''}" id="nextB">${M.i >= ROUND ? '看修理結果 →' : '下一題 →'}</button></div>`;
    const nx = () => { clearTimeout(go.t); if (!M || M.p !== p) return; if (M.i >= ROUND) endRound(); else nextQ(); };
    $('#nextB').onclick = nx;
    if (ok) go.t = later(nx, 1300);
  }
  const pick1 = a => a[Math.floor(Math.random() * a.length)];

  // 選擇題
  function choiceW(w, p) {
    w.innerHTML = `<div class="choices">${p.opts.map(o => `<button type="button" class="choice">${fmt(o)}</button>`).join('')}</div>`;
    $$('.choice', w).forEach((b, i) => b.onclick = () => {
      if (M.locked) return;
      const o = p.opts[i], ok = D.check(p, o);
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) $$('.choice', w)[p.opts.indexOf(p.ans)].classList.add('right');
      answered(ok, o);
    });
  }
  // 數字鍵盤（數字、分數、多格）
  function padW(w, p) {
    const fields = p.input === 'fields' ? p.fields : [{ k: '_', label: p.unit || '' }];
    const val = {}; fields.forEach(f => val[f.k] = ''); let act = fields[0].k;
    const frac = p.input === 'frac', multi = p.input === 'fields';
    const keys = frac ? ['7', '8', '9', '⌫', '4', '5', '6', '/', '1', '2', '3', '又', '0', '🧹', 'OK'] : multi ? ['7', '8', '9', '⌫', '4', '5', '6', '🧹', '1', '2', '3', '0', 'OK'] : ['7', '8', '9', '⌫', '4', '5', '6', '🧹', '1', '2', '3', '.', '0', 'OK'];
    w.innerHTML = `<div class="ans">${fields.map(f => `<button type="button" class="abox ${multi ? 'sm' : ''}" data-k="${f.k}" aria-label="答案${f.label}"></button>${f.label ? `<span class="unit">${esc(f.label)}</span>` : ''}`).join('')}</div>
      ${frac ? '<p class="note" style="text-align:center">分數用「/」：3/4；帶分數用「又」：2又1/3</p>' : ''}
      <div class="pad">${keys.map(k => `<button type="button" class="key ${k === 'OK' ? 'ent' : /[⌫🧹]/.test(k) ? 'fn' : /[\/又.]/.test(k) ? 'op' : ''}" data-k="${k}" ${k === 'OK' ? `style="grid-column:span ${frac ? 2 : multi ? 4 : 3}"` : ''}>${k === 'OK' ? '✔ 確定' : k}</button>`).join('')}</div>`;
    function draw() { $$('.abox', w).forEach(b => { const v = val[b.dataset.k]; b.innerHTML = v ? fmt(v) : '<span class="ph">輸入</span>'; b.classList.toggle('act', b.dataset.k === act); }); }
    $$('.abox', w).forEach(b => b.onclick = () => { act = b.dataset.k; draw(); });
    function press(k) {
      if (M.locked) return;
      let v = val[act];
      if (k === 'OK') return submit();
      sfx.tap();
      if (k === '⌫') v = v.slice(0, -1);
      else if (k === '🧹') v = '';
      else if (k === '.' && (v.includes('.') || frac)) return;
      else if ((k === '/' && (v.includes('/') || !v)) || (k === '又' && (v.includes('又') || v.includes('/') || !v))) return;
      else if (v.length < 9) v = (v === '0' && /\d/.test(k) ? '' : v) + k;
      val[act] = v; draw();
    }
    function submit() {
      if (fields.some(f => val[f.k] === '')) { const m = $('#qmsg'); m.className = 'msg bad'; m.textContent = '還有空格沒填喔！'; return; }
      if (multi) { const ok = D.check(p, val); answered(ok, fields.map(f => val[f.k] + ' ' + f.label).join(' ')); }
      else { const ok = D.check(p, val._); let extra = ''; if (!ok && p.form === 'simplest' && Q.parse(val._) && Q.eq(Q.parse(val._), Q.parse(p.ans))) extra = '<b>大小對了，但還能再約分喔！</b><br>'; if (!ok && p.form === 'improper' && Q.parse(val._) && Q.eq(Q.parse(val._), Q.parse(p.ans))) extra = '<b>大小對了，但題目要寫成假分數。</b><br>'; answered(ok, val._ + (p.unit ? ' ' + p.unit : ''), extra); }
      $$('.key', w).forEach(b => b.disabled = true);
    }
    $$('.key', w).forEach(b => b.onclick = () => press(b.dataset.k));
    w.onkeydown = null;
    keyHandler = e => {
      if (screen !== 'mission' || !M || M.stage !== 'practice' || M.locked || !$('.pad', w)) return;
      if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === '.') press('.'); else if (e.key === '/') press('/');
      else if (e.key === 'Backspace') { e.preventDefault(); press('⌫'); } else if (e.key === 'Enter') { e.preventDefault(); press('OK'); }
      else if (e.key === 'Tab' && multi) { e.preventDefault(); const i = fields.findIndex(f => f.k === act); act = fields[(i + 1) % fields.length].k; draw(); }
    };
    draw();
  }
  let keyHandler = null;
  document.addEventListener('keydown', e => { if (keyHandler && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) keyHandler(e); });

  // 列式小幫手：算式列對，答案電腦算
  const EQ_OPS = ['+', '−', '×', '÷'];
  const EQ_WHY = { '+': '「一共、合起來、比……多（求多的那個）」通常用加法 +', '−': '「還剩、用掉、比……少（求少的那個）、相差」通常用減法 −', '×': '「每一份一樣多，有好幾份」或「求比較量（基準量 × 倍數）」用乘法 ×', '÷': '「平分、每份幾個、可以分成幾份」或「求基準量（比較量 ÷ 倍數）」用除法 ÷' };
  function eqW(w, p) {
    keyHandler = null;
    const norm = e => Array.isArray(e[0]) ? e : [e];
    let paths = [norm(p.eq)].concat((p.alt || []).map(norm)); const rows = [], results = []; let act = null;
    const nums = [...new Set((p.q.match(/\d+(?:\.\d+)?/g) || []).map(x => Q.str(Q.parse(x))))];
    const steps = Math.min(...paths.map(x => x.length));
    w.innerHTML = `<div class="eq-tip">✏️ 列式小幫手：把<b>算式</b>排出來，答案電腦幫你算！</div>
      <div class="eq-chips"><span class="note" style="margin:0">題目裡的數字：</span>${nums.map(n => `<button type="button" class="eq-chip" data-n="${n}">${n}</button>`).join('')}</div>
      <div class="eq-rows"></div>
      <div class="pad">${['7', '8', '9', '+', '4', '5', '6', '−', '1', '2', '3', '×', '0', '.', '⌫', '÷'].map(k => `<button type="button" class="key ${EQ_OPS.includes(k) ? 'op' : k === '⌫' ? 'fn' : ''}" data-k="${k}">${k}</button>`).join('')}</div>
      <div class="row"><button type="button" class="btn go eq-go">✔ 檢查算式</button></div>`;
    const box = $('.eq-rows', w);
    function addRow() {
      const i = rows.length, el = document.createElement('div'); el.className = 'eq-row';
      el.innerHTML = `${steps > 1 ? `<div class="eq-step">第 ${i + 1} 步${i ? `　<button type="button" class="eq-chip" data-n="${Q.str(results[0])}">用第 1 步的答案 ${Q.str(results[0])}</button>` : ''}</div>` : ''}
        <button type="button" class="eq-slot" data-s="a"></button><button type="button" class="eq-slot op" data-s="op"></button><button type="button" class="eq-slot" data-s="b"></button><span class="eq-sign">=</span><span class="eq-slot res">?</span>`;
      box.appendChild(el);
      const row = { el, a: '', op: '', b: '' }; rows.push(row);
      $$('.eq-slot[data-s]', el).forEach(s => s.onclick = () => { if (row.done || M.locked) return; act = { r: i, k: s.dataset.s }; sfx.tap(); draw(); });
      $$('.eq-chip', el).forEach(c => c.onclick = () => put(c.dataset.n));
      act = { r: i, k: 'a' }; draw();
    }
    function draw() { rows.forEach((row, i) => $$('.eq-slot[data-s]', row.el).forEach(s => { const k = s.dataset.s, v = row[k]; s.textContent = v === '' ? (k === 'op' ? '○' : '□') : v; s.classList.toggle('filled', v !== ''); s.classList.toggle('act', !row.done && !!act && act.r === i && act.k === k); })); }
    const cur = () => rows[act.r];
    const adv = () => { const nx = ['a', 'op', 'b'].find(k => cur()[k] === ''); if (nx) act.k = nx; };
    function put(n) { if (!act || M.locked || cur().done) return; if (act.k === 'op') act.k = cur().a === '' ? 'a' : 'b'; cur()[act.k] = String(n); sfx.tap(); adv(); draw(); }
    $$('.eq-chips .eq-chip', w).forEach(c => c.onclick = () => put(c.dataset.n));
    $$('.key', w).forEach(b => b.onclick = () => {
      if (!act || M.locked || cur().done) return;
      const k = b.dataset.k, r = cur(); sfx.tap();
      if (EQ_OPS.includes(k)) { r.op = k; act.k = 'op'; adv(); }
      else if (k === '⌫') { if (act.k === 'op') r.op = ''; else r[act.k] = r[act.k].slice(0, -1); }
      else { if (act.k === 'op') act.k = r.a === '' ? 'a' : 'b'; if (k === '.' && r[act.k].includes('.')) return; if (r[act.k].length < 7) r[act.k] = (r[act.k] === '0' && k !== '.' ? '' : r[act.k]) + k; }
      draw();
    });
    const expect = (path, i) => path[i] ? path[i].map((v, j) => j === 1 ? v : v === 'R' ? results[0] : Q.of(String(v))) : null;
    const same = (r, e) => { const a = Q.parse(r.a), b = Q.parse(r.b); if (!a || !b || r.op !== e[1]) return false; const sw = e[1] === '+' || e[1] === '×'; return (Q.eq(a, e[0]) && Q.eq(b, e[2])) || (sw && Q.eq(a, e[2]) && Q.eq(b, e[0])); };
    const eqText = path => path.map((r, i) => r.map(v => v === 'R' ? `（第 ${i} 步的答案）` : String(v)).join(' ')).join('，再算 ');
    $('.eq-go', w).onclick = () => {
      if (M.locked) return;
      const i = rows.length - 1, r = rows[i];
      if (r.a === '' || r.op === '' || r.b === '') { const m = $('#qmsg'); m.className = 'msg bad'; m.textContent = '還有格子是空的喔！兩個數字和中間的符號都要放。'; return; }
      const ok = paths.filter(pp => pp[i] && same(r, expect(pp, i)));
      const said = rows.map(x => `${x.a} ${x.op} ${x.b}`).join('，');
      if (!ok.length) {
        const cand = paths.map(pp => expect(pp, i)).filter(Boolean), a = Q.parse(r.a), b = Q.parse(r.b);
        let why = '';
        if (!cand.some(e => e[1] === r.op)) why = EQ_WHY[cand[0][1]];
        else if (a && b && cand.some(e => e[1] === r.op && Q.eq(a, e[2]) && Q.eq(b, e[0]))) why = r.op === '−' ? '減法要把原本全部（比較大）的數放前面。' : '除法要把全部的量放前面，除以每份或倍數。';
        else why = '符號對了，數字再檢查一下：要算的是哪兩個量？';
        r.el.classList.add('shake');
        $$('.key,.eq-chip,.eq-go', w).forEach(b => b.disabled = true);
        return answered(false, said, `<b>提示：</b>${esc(why)}<br><b>正確算式：</b>${fmt(eqText(norm(p.eq)))}<br>`);
      }
      paths = ok; r.done = true; r.el.classList.add('done'); act = null; draw();
      const v = D.eqCalc(Q.parse(r.a), r.op, Q.parse(r.b)); results.push(v);
      $('.res', r.el).textContent = Q.str(v); sfx.ok();
      if (paths.some(pp => pp.length > rows.length)) { const m = $('#qmsg'); m.className = 'msg good'; m.textContent = `第 ${rows.length} 步列對了！電腦算出 ${Q.str(v)}，接著列下一步。`; addRow(); return; }
      $$('.key,.eq-chip,.eq-go', w).forEach(b => b.disabled = true);
      answered(true, said);
      $('#qmsg').textContent = `✅ 算式列對了！電腦算出答案：${Q.str(v)}${p.unit ? ' ' + p.unit : ''}`;
    };
    addRow();
  }

  /* ---------- 一輪結束 ---------- */
  function endRound() {
    const right = M.res.filter(Boolean).length, all = right === ROUND;
    const m = S.machines[M.id] || (addMachine(M.id, 'play', M.g), S.machines[M.id]);
    m.tries = (m.tries || 0) + 1;
    Rp.done({ stars: all ? 3 : right >= 4 ? 2 : right >= 3 ? 1 : 0, right, total: ROUND });
    if (all) { m.fixed = Date.now(); m.wins = (m.wins || 0) + 1; save(); reboot(); return; }
    save();
    app.innerHTML = `<div class="panel">${headHTML(false)}${progHTML()}
      <div class="say">滋…滋…修好了 <b>${right}</b> / ${ROUND} 個零件，還差一點點！要 ${ROUND} 題全對，機器才能重新啟動。</div>
      <div class="explain r"><b>小提醒：</b>${fmt(M.t.right)}</div>
      <div class="row"><button type="button" class="btn go" id="again">🔧 再校正一次（新的 ${ROUND} 題）</button><button type="button" class="btn sec2" id="redemo">👀 再看一次示範</button><button type="button" class="btn sec2" data-act="home">回工廠</button></div></div>`;
    $('#again').onclick = () => startRound();
    $('#redemo').onclick = () => { M.stage = 'demo'; M.found = false; M.p = D.gen(M.id, M.g, { demo: true }); demo(); };
  }
  function reboot() {
    const nextId = Object.keys(S.machines).find(id => D.byId[id] && !S.machines[id].fixed && id !== M.id);
    const ov = document.createElement('div'); ov.className = 'reboot'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', '機器重新啟動');
    ov.innerHTML = `<div class="box"><div class="gears"><span>⚙️</span><span>⚙️</span><span>⚙️</span></div><div id="rbBot">${bot(M.id, false, 'big')}</div>
      <div class="bar"><i></i></div><div class="log" id="rbLog">檢查電路…</div><h2>✅ 重啟成功！</h2>
      <p id="rbP" style="opacity:0;transition:.4s;line-height:1.7">「${esc(M.t.name)}」已經修好了！<br>${esc(M.t.robot)}：謝謝你，我又可以正確計算了！</p>
      <div class="row" id="rbBtns" style="opacity:0;transition:.4s;pointer-events:none">${nextId ? `<button type="button" class="btn go" id="rbNext">🔧 修下一台</button>` : ''}<button type="button" class="btn ${nextId ? 'sec2' : 'go'}" id="rbHome">🏭 回修理工廠</button></div></div>`;
    document.body.appendChild(ov);
    later(() => { $('.bar i', ov).style.width = '100%'; }, 50);
    ['更換零件…', '校正程式…', '重新開機…'].forEach((s, i) => later(() => { if (!ov.isConnected) return; $('#rbLog', ov).textContent = s; sfx.tap(); }, 600 * (i + 1)));
    const id = M.id;
    later(() => {
      if (!ov.isConnected) return;
      ov.classList.add('done'); $('#rbBot', ov).innerHTML = bot(id, true, 'big'); $('#rbLog', ov).textContent = 'SYSTEM ONLINE ✔';
      $('#rbP', ov).style.opacity = 1; const bb = $('#rbBtns', ov); bb.style.opacity = 1; bb.style.pointerEvents = 'auto';
      sfx.boot(); sparks(); const fl = document.createElement('div'); fl.className = 'flash'; document.body.appendChild(fl); later(() => fl.remove(), 600);
    }, 2500);
    const close = to => { ov.remove(); if (to) go('mission', to); else { M = null; go('home'); } };
    ov.addEventListener('click', e => { if (e.target.id === 'rbHome') close(); if (e.target.id === 'rbNext') close(nextId); });
  }
  function sparks() {
    const fx = $('#fx'), cols = ['#ffcf33', '#2fd38a', '#38d6ff', '#ff8a1f', '#8c7bff'];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('i'); s.className = 'spark'; const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 220;
      s.style.cssText = `left:50%;top:45%;background:${cols[i % cols.length]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px`;
      fx.appendChild(s); later(() => s.remove(), 1200);
    }
  }

  // 給測試用（不影響遊戲）
  window.FixLab = { state: () => S, go, get M() { return M; } };

  muteIcon();
  const goTo = params.get('go');
  go(goTo === 'scan' || goTo === 'entry' || goTo === 'pick' ? goTo : 'home');
})();
