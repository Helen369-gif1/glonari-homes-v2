/* Experience Gia — demonstration engine. No server, no external APIs, no real operations.
   One code path for both modes: the screens are real DOM, every interaction goes through the same click handlers.
   Watch Demo = a runner that moves a visible cursor to an element and calls element.click(); Try It Yourself = the visitor does the clicking. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const el = {
    app: $("#app"), fit: $("#fit"), stage: $("#stage"), notice: $("#notice"),
    crumb: $("#crumb"), eyebrow: $("#eyebrow"), headline: $("#headline"), display: $("#display"), actions: $("#actions"),
    gia: $("#gia-line"), you: $("#you"), live: $("#live"), composer: $("#composer"), input: $("#composer-in"),
    sheet: $("#sheet"), guard: $("#guard"), cursor: $("#cursor"), menu: $("#menu-list"), menuBtn: $('[data-k="menu"]'),
    pause: $('[data-k="pause"]'), restart: $('[data-k="restart"]'), focus: $('[data-k="focus"]'),
    mw: $('[data-k="mode-watch"]'), mt: $('[data-k="mode-try"]')
  };

  let D = null;
  const S = { mode: "idle", scn: -1, step: 0, sel: 0, state: {}, run: 0, paused: false, busy: false, done: false, note: "", sheetOk: false, sheetOpen: false, scale: 1, maxH: Infinity, cx: 0, cy: 0, genTimer: 0, sayText: "", sayP: Promise.resolve() };
  let sayId = 0;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const alive = (run) => run === S.run;
  const pad = (n) => String(n).padStart(2, "0");

  /* ---------- layout: wide = fixed 1440x900 scaled, tablet / phone = normal flow ---------- */
  function layout() {
    const w = document.documentElement.clientWidth;
    const L = w >= 1200 ? "wide" : w >= 768 ? "tablet" : "phone";
    el.app.dataset.layout = L;
    if (L === "wide") {
      let s = Math.min(w / 1440, 1600 / 1440);
      if (isFinite(S.maxH)) s = Math.min(s, Math.max(0.72, (S.maxH - el.notice.offsetHeight) / 900));
      S.scale = s;
      el.fit.style.width = Math.round(1440 * s) + "px";
      el.fit.style.height = Math.round(900 * s) + "px";
      el.stage.style.transform = "scale(" + s + ")";
    } else {
      S.scale = 1;
      el.fit.style.width = el.fit.style.height = el.stage.style.transform = "";
    }
    postHeight();
  }
  let hRaf = 0;
  function postHeight() {
    cancelAnimationFrame(hRaf);
    hRaf = requestAnimationFrame(() => {
      if (window.parent === window) return;
      window.parent.postMessage({ type: "gia-demo-height", height: Math.ceil(el.app.getBoundingClientRect().height) }, "*");
    });
  }
  window.addEventListener("message", (e) => {
    if (!e.data || e.data.type !== "gia-demo-viewport") return;
    S.maxH = Number(e.data.height) || Infinity;
    layout();
  });
  window.addEventListener("resize", layout);
  if ("ResizeObserver" in window) new ResizeObserver(postHeight).observe(el.app);

  /* ---------- state helpers ---------- */
  const scn = () => D.scenarios[S.scn];
  const curStep = () => scn().steps[S.step];
  function view() {
    if (S.scn < 0) return { layout: "intro", crumb: "Welcome", headline: D.intro.headline, brief: D.intro.brief, id: "INTRO" };
    const st = curStep();
    return Object.assign({}, D.screens[st.screen], st);
  }
  const homes = () => D.homes;

  /* ---------- templates ---------- */
  const rows = (items, pressedKey) => items.map((t, i) => `<li><b>${pad(i + 1)}</b><span>${esc(t)}</span></li>`).join("");

  const T = {
    intro() {
      return `<p class="arr__sub">${esc(D.intro.sub)}</p>
        <p class="label dark-label">Four ways to start</p>
        <div class="arr__rows" role="group" aria-label="Scenarios">${D.scenarios.map((s, i) =>
          `<button type="button" data-k="sc-${i}" aria-pressed="${S.sel === i}"><b>${pad(i + 1)}</b><span>${esc(s.name)}</span></button>`).join("")}</div>`;
    },
    arrival(v) {
      return `<p class="arr__sub">${esc(v.sub)}</p>
        <p class="label dark-label">${esc(v.label)}</p>
        <ol class="arr__rows" style="list-style:none;padding:0">${rows(v.items).replace(/<li>/g, "<li>")}</ol>`;
    },
    priorities(v) {
      const p = S.state.prio || [];
      return `<div class="card list"><p class="label">${esc(v.label)}</p><div class="list__rows" role="group" aria-label="${esc(v.label)}">${v.items.map((t, i) =>
        `<button type="button" data-k="prio-${i}" aria-pressed="${!!p[i]}"><span class="check"></span><span>${esc(t)}</span></button>`).join("")}</div><p class="hint">${esc(v.hint)}</p></div>`;
    },
    map(v) {
      const sel = S.state.home ?? -1;
      const pins = [[84, 307], [168, 175], [277, 103]];
      return `<div class="mapgrid"><div class="map"><svg viewBox="0 0 420 410" role="group" aria-label="Schematic map with three sample homes">
          <rect width="420" height="410" fill="#E7E0D0"/>
          <rect x="50" y="52" width="76" height="96" rx="8" fill="#CBD2B5"/><rect x="238" y="30" width="72" height="96" rx="8" fill="#CBD2B5"/><rect x="196" y="238" width="82" height="102" rx="8" fill="#CBD2B5"/><rect x="58" y="288" width="86" height="66" rx="8" fill="#CBD2B5"/>
          <path d="M318 0 C 300 90 346 150 320 230 S 330 340 350 410" fill="none" stroke="#C6D3CF" stroke-width="30" stroke-linecap="round"/>
          <g fill="none" stroke="#FBF7F0" stroke-width="9" stroke-linecap="round"><path d="M0 62 Q210 40 420 66"/><path d="M0 160 Q210 142 420 170"/><path d="M0 256 Q210 240 420 262"/><path d="M0 346 Q210 334 420 352"/>
          <path d="M44 0 Q52 205 40 410"/><path d="M148 0 Q156 205 144 410"/><path d="M232 0 Q240 205 228 410"/><path d="M392 0 Q400 205 388 410"/></g>
          <polyline points="${pins.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#8A6628" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          ${pins.map((p, i) => `<g class="pin" data-k="pin-${i}" role="button" tabindex="0" aria-pressed="${sel === i}" aria-label="${esc(homes()[i].name)}, ${esc(homes()[i].short)}"><circle cx="${p[0]}" cy="${p[1]}" r="${sel === i ? 21 : 18}"/><text x="${p[0]}" y="${p[1] + 6}">${i + 1}</text></g>`).join("")}
        </svg><span class="map__cap">Schematic • not live navigation</span></div>
        <div class="card homes"><p class="label">${esc(v.label)}</p><ul>${homes().map((h, i) =>
          `<li><button type="button" data-k="home-${i}" aria-pressed="${sel === i}">${esc(h.name)} • ${esc(h.short)}<small>${i === 0 ? "Matches your priorities" : "Sample home"}</small></button></li>`).join("")}</ul>
        <p class="hint">Map ↔ Accessible list</p></div></div>`;
    },
    theater(v) {
      return `<div class="pc"><div class="pc__ph"><img src="assets/house-792.webp" alt="Oak Ridge Residence, a sample home with a stone and timber front and large windows, lit at dusk" width="792" height="864"><span class="chip">${esc(v.badge)}</span></div>
        <div class="card"><p class="pc__t">${esc(v.title)}</p>${v.lines.map((l) => `<p class="pc__l">${esc(l)}</p>`).join("")}<p class="pc__n">${esc(v.note)}</p></div></div>`;
    },
    evidence(v) {
      return `<div class="card ev"><p class="label label--warn">${esc(v.label)}</p>${v.rows.map((r) =>
        `<div class="ev__row"><span class="ev__who">${esc(r[0])}</span><span class="ev__v">${esc(r[1])}</span><p class="ev__why">${esc(r[2])}</p></div>`).join("")}<p class="hint">${esc(v.hint)}</p></div>`;
    },
    shortlist(v) {
      const picks = S.state.picks || [];
      const saved = v.saved || [];
      const body = v.pickable
        ? `<div class="list__rows" role="group" aria-label="Homes to compare">${v.items.map((t, i) => `<button type="button" data-k="pick-${i}" aria-pressed="${!!picks[i]}"><span class="check"></span><span>${esc(t)}</span></button>`).join("")}</div>`
        : `<ul class="list__rows">${v.items.map((t, i) => `<li><b>${pad(i + 1)}</b><span>${esc(t)}</span>${saved.includes(i) ? '<span class="tag">Saved</span>' : ""}</li>`).join("")}</ul>`;
      return `<div class="pc pc--short"><div class="pc__ph"><img src="assets/house-792.webp" alt="Oak Ridge Residence, a sample home" width="792" height="864" style="object-position:50% 40%"><span class="chip">${esc(v.badge)}</span></div>
        <div class="card">${body}<p class="hint" style="margin-top:6px;font-size:15px">${esc(v.hint)}</p></div></div>`;
    },
    compare(v) {
      const H = homes();
      const f = v.focus === "commute";
      const row = (key, label, fn, btn) => {
        const inner = `<span class="label">${label}</span>${H.map((h) => `<span>${esc(fn(h))}</span>`).join("")}`;
        return btn ? `<button type="button" class="cmp__row${f && key === "commute" ? " is-focus" : ""}" data-k="row-${key}">${inner}</button>`
          : `<div class="cmp__row${f && key === "commute" ? " is-focus" : ""}">${inner}</div>`;
      };
      return `<div class="card cmp"><div class="cmp__grid">${H.map((h) =>
        `<div class="cmp__h"><img src="${h.img}" alt="" width="548" height="208"><b>${esc(h.name)}</b><span>${esc(h.price)}</span></div>`).join("")}
        ${row("commute", f ? "Commute est. · your preference: under 25 min" : "Commute est.", (h) => h.commute, true)}
        ${row("space", "Guest space", (h) => h.space)}${row("trade", "Tradeoff", (h) => h.trade)}</div></div>`;
    },
    destinations(v) {
      const d = S.state.dest ?? -1;
      return `<div class="card list"><p class="label">${esc(v.label)}</p><div class="list__rows" role="group" aria-label="${esc(v.label)}">${v.rows.map((r, i) =>
        `<button type="button" data-k="dest-${i}" aria-pressed="${d === i}"><span class="check"></span><span>${esc(r[0])}</span><span class="val">${esc(r[1])}</span></button>`).join("")}</div><p class="hint">${esc(v.hint)}</p></div>`;
    },
    renovation() {
      const R = D.reno, st = S.state;
      const pos = st.pos ?? 50;
      let top;
      if (st.gen === "done") {
        top = `<div class="ba" style="--p:${pos}%"><img src="assets/kitchen-before-900.webp" alt="The original kitchen: oak cabinets, laminate counters and a white range" style="object-position:50% 60%"><img class="ba__after" src="assets/kitchen-after-900.webp" alt="A generated concept of the same kitchen: pale cabinets, a floating shelf and brass fixtures" style="object-position:50% 60%">
          <span class="ba__line"></span><span class="ba__knob"></span><span class="chip">Original room</span><span class="chip chip--r">${esc(R.badge)}</span>
          <input type="range" min="0" max="100" value="${pos}" data-k="slider" aria-label="Compare the original room with the generated concept"><span class="ba__ring"></span></div>`;
      } else {
        const a = st.photo
          ? `<div class="slot slot--photo"><img src="assets/kitchen-before-900.webp" alt="The original kitchen photo" style="object-position:50% 60%"><span class="chip">Original room</span></div>`
          : `<div class="slot"><p class="label">${esc(R.slotA.label)}</p><p class="slot__t">${esc(R.slotA.text)}</p><button type="button" class="btn-s" data-k="photo">${esc(R.slotA.btn)}</button><span class="slot__w">${esc(R.slotA.wait)}</span></div>`;
        const b = st.gen === "busy"
          ? `<div class="slot slot--b"><p class="label">${esc(R.slotB.label)}</p><p class="busy" role="status">${esc(R.slotB.busy)}<i></i></p><button type="button" class="btn-s" data-k="stop">${esc(R.slotB.stop)}</button></div>`
          : `<div class="slot slot--b"><p class="label">${esc(R.slotB.label)}</p><p class="slot__t">${esc(R.slotB.text)}</p><button type="button" class="btn-s" data-k="gen" ${st.photo ? "" : "disabled"}>${esc(R.slotB.btn)}</button></div>`;
        top = `<div class="reno">${a}${b}</div>`;
      }
      const mats = R.mats.map((m, i) => `<button type="button" data-k="mat-${i}" aria-pressed="${st.mat === i}" aria-label="${esc(m[1])}" style="background:${m[0]}"></button>`).join("");
      return `<div class="reno-wrap">${top}<div class="card reno__card"><b>${esc(R.caption)}</b><span class="bud">${esc(R.budget)}</span><div class="mats">${mats}<span>${esc(st.mat >= 0 && st.mat != null ? R.mats[st.mat][1] : R.matLabel)}</span></div></div></div>`;
    },
    request(v) {
      const st = S.state;
      const acc = ["Ask me first", "I will be home"];
      return `<div class="card rq"><p class="label">${esc(v.label)}</p>
        <div class="fld"><label class="k" for="issue" style="display:block;font-size:15px;color:var(--ink-2);margin-bottom:4px">What needs attention?</label><input type="text" id="issue" data-k="issue" value="${esc(st.issue || "")}" placeholder="Describe the issue"></div>
        <div class="fld"><span class="k">Photo</span><div class="att"><span class="att__th">${st.attach ? '<img src="assets/kitchen-before-900.webp" alt="">' : ""}</span><span class="att__n">${st.attach ? "Photo attached" : "No photo yet"}</span>
          <button type="button" class="btn-s" style="margin:0 0 0 auto" data-k="attach" aria-pressed="${!!st.attach}">${st.attach ? "Remove photo" : "Attach sample photo"}</button></div></div>
        <div class="fld"><span class="k">Access permission</span><div class="acc" role="group" aria-label="Access permission">${acc.map((a, i) => `<button type="button" data-k="acc-${i}" aria-pressed="${st.acc === i}">${a}</button>`).join("")}</div></div>
        <p class="hint">${esc(v.hint)}</p></div>`;
    },
    progress(v) {
      return `<div class="card list"><p class="label">${esc(v.label)}</p><ul class="list__rows">${v.items.map((t, i) => `<li><b>${pad(i + 1)}</b><span>${esc(t)}</span></li>`).join("")}</ul><p class="hint">${esc(v.hint)}</p></div>`;
    }
  };

  /* ---------- render ---------- */
  function renderActions(v) {
    const u = D.ui;
    if (S.scn < 0) {
      el.actions.className = "actions";
      el.actions.innerHTML = `<button type="button" class="btn-p" data-k="start-watch">${u.watch}</button><button type="button" class="btn-p btn-p--ghost" data-k="start-try">${u.try}</button>`;
      return;
    }
    if (S.done || v.end) {
      const last = S.scn === D.scenarios.length - 1;
      const nextLabel = last ? u.start : `${u.next}: ${D.scenarios[S.scn + 1].name}`;
      el.actions.className = "actions";
      el.actions.innerHTML = `${S.note ? `<p class="done-note" style="margin:0;flex:1;font-size:16px;padding:6px 12px;line-height:1.35">${esc(S.note)}</p>` : ""}<button type="button" class="btn-p btn-p--ghost" data-k="replay">${u.replay}</button><button type="button" class="btn-p" style="${S.note ? "flex:0 0 auto" : ""}" data-k="next">${esc(nextLabel)}</button>`;
      return;
    }
    el.actions.className = "actions";
    el.actions.innerHTML = `<button type="button" class="btn-p" data-k="primary">${esc(v.primary)}</button>`;
  }

  function renderDisplay(v) {
    const t = T[v.layout] || T.arrival;
    el.display.innerHTML = t(v);
  }

  function renderChrome(v) {
    el.crumb.textContent = v.crumb;
    el.headline.textContent = v.headline;
    el.eyebrow.textContent = S.scn < 0 ? D.intro.eyebrow : `Sample experience · ${scn().name} · ${S.step + 1} of ${scn().steps.length}`;
    el.app.dataset.mode = S.mode;
    el.mw.setAttribute("aria-pressed", S.mode === "watch");
    el.mt.setAttribute("aria-pressed", S.mode === "try");
    el.pause.hidden = S.mode !== "watch";
    el.restart.hidden = S.scn < 0;
    el.pause.textContent = S.paused ? (reduce.matches ? "Next step" : D.ui.play) : D.ui.pause;
    el.guard.hidden = S.mode !== "watch";
    el.input.disabled = S.mode === "watch";
  }

  function render({ speak = true } = {}) {
    const v = view();
    renderChrome(v);
    renderDisplay(v);
    renderActions(v);
    el.you.hidden = true;
    if (speak) S.sayP = say(v.brief);
    postHeight();
  }

  function refresh() { // re-render the display only (state changed inside the same screen), keep focus
    const v = view();
    const k = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.k;
    renderDisplay(v);
    if (k) { const n = $(`[data-k="${k}"]`, el.display); if (n && n.tagName !== "INPUT") n.focus({ preventScroll: true }); }
  }

  /* ---------- Gia line ---------- */
  function say(text) {
    const id = ++sayId;
    S.sayText = text;
    el.live.textContent = text;
    if (reduce.matches) { el.gia.textContent = text; return Promise.resolve(); }
    el.gia.textContent = "";
    return (async () => {
      for (let i = 1; i <= text.length; i++) {
        if (id !== sayId) return;
        el.gia.textContent = text.slice(0, i);
        await sleep(13);
      }
    })();
  }
  async function typeInto(input, text, run) {
    input.focus({ preventScroll: true });
    input.value = "";
    for (let i = 1; i <= text.length; i++) {
      if (run != null && !alive(run)) return;
      input.value = text.slice(0, i);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (!reduce.matches) await sleep(46);
    }
  }
  async function sendUser(text, reply, run) {
    if (S.mode === "watch") {
      await moveTo(el.input, 0.2, 0.5, run);
      if (!alive(run)) return;
      await typeInto(el.input, text, run);
      if (!alive(run)) return;
      await sleep(350);
    }
    el.input.value = "";
    el.you.textContent = text;
    el.you.hidden = false;
    postHeight();
    await sleep(reduce.matches ? 0 : 450);
    if (reply) await say(reply);
    await sleep(reduce.matches ? 0 : 1000);
  }

  /* ---------- navigation ---------- */
  async function go(i) {
    S.busy = true;
    el.display.classList.add("is-out");
    await sleep(reduce.matches ? 0 : 190);
    S.step = i;
    S.sheetOk = false;
    clearTimeout(S.genTimer);
    render();
    el.display.classList.remove("is-out");
    if (S.mode === "try" && el.stage.contains(document.activeElement)) el.headline.focus({ preventScroll: true });
    await sleep(reduce.matches ? 0 : 200);
    S.busy = false;
  }

  function complete() {
    const v = view();
    S.done = true;
    S.note = v.done ? v.done.note : "";
    renderActions(v);
    if (v.done) S.sayP = say(v.done.brief);
    postHeight();
  }

  function requiresOk(key) {
    const st = S.state;
    if (key === "picks") return (st.picks || []).filter(Boolean).length >= 2;
    if (key === "concept") return st.gen === "done";
    if (key === "issue") return !!(st.issue && st.issue.trim());
    return true;
  }

  async function onPrimary(run) {
    if (S.busy || S.scn < 0) return;
    const v = view();
    if (v.requires && !requiresOk(v.requires)) {
      S.sayP = say(v.guard);
      const b = $('[data-k="primary"]');
      if (b) { b.classList.remove("is-shake"); void b.offsetWidth; b.classList.add("is-shake"); }
      return;
    }
    if (v.sends) {
      S.busy = true;
      await sendUser(v.sends, v.reply, run);
      S.busy = false;
      if (S.mode === "watch" && !alive(run)) return;
      return go(S.step + 1);
    }
    if (v.sheet && !S.sheetOk) return openSheet(v.sheet);
    if (v.final) return complete();
    return go(S.step + 1);
  }

  /* ---------- review sheet (exact scope, approve or decline; nothing is sent) ---------- */
  function openSheet(key) {
    const sh = D.sheets[key];
    let rowsData = sh.rows;
    if (key === "repair") {
      const st = S.state;
      rowsData = [["Issue", st.issue || "Not described"], ["Photo", st.attach ? "Attached" : "Not attached"], ["Access", st.acc === 1 ? "I will be home" : "Ask me first"], ["Emergency", "Not an emergency"]];
    }
    el.sheet.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t"><h3 id="sheet-t">${esc(sh.title)}</h3>${rowsData.map((r) => `<div class="sheet__r"><span>${esc(r[0])}</span><span>${esc(r[1])}</span></div>`).join("")}
      <p class="hint">${esc(sh.foot)}</p><div class="sheet__b"><button type="button" class="btn-p" data-k="approve">${esc(sh.approve)}</button><button type="button" class="btn-p btn-p--ghost" data-k="decline">${esc(sh.decline)}</button></div></div>`;
    el.sheet.hidden = false;
    S.sheetOpen = true;
    if (S.mode === "try") $('[data-k="approve"]', el.sheet).focus({ preventScroll: true });
  }
  function closeSheet(restoreFocus) {
    el.sheet.hidden = true;
    el.sheet.innerHTML = "";
    S.sheetOpen = false;
    if (restoreFocus && S.mode === "try") { const p = $('[data-k="primary"]'); if (p) p.focus({ preventScroll: true }); }
  }

  /* ---------- scenario control ---------- */
  function startIntro() {
    S.run++; S.scn = -1; S.step = 0; S.mode = "idle"; S.paused = false; S.done = false; S.note = ""; S.state = {};
    closeSheet(); hideCursor(); clearTimeout(S.genTimer);
    render();
  }
  function startScenario(i, mode) {
    S.run++;
    const run = S.run;
    S.scn = i; S.step = 0; S.mode = mode; S.paused = false; S.done = false; S.note = ""; S.state = {}; S.sheetOk = false; S.busy = false;
    closeSheet(); clearTimeout(S.genTimer); hideCursor();
    render();
    if (mode === "watch") { S.sel = i; play(run); }
  }
  function takeover() {
    if (S.mode !== "watch") return;
    S.run++;
    S.mode = "try"; S.paused = false;
    hideCursor();
    renderChrome(view());
  }

  /* ---------- cursor ---------- */
  function hideCursor() { el.cursor.classList.remove("on"); }
  function stagePoint(cx, cy) {
    const r = el.stage.getBoundingClientRect();
    return { x: (cx - r.left) / S.scale, y: (cy - r.top) / S.scale };
  }
  async function reveal(node) {
    if (S.scale !== 1 || window.parent === window) return;
    const r = node.getBoundingClientRect();
    window.parent.postMessage({ type: "gia-demo-reveal", y: r.top + r.height / 2 }, "*");
    await sleep(reduce.matches ? 0 : 550);
  }
  async function moveTo(node, dx = 0.5, dy = 0.5, run) {
    await reveal(node);
    if (run != null && !alive(run)) return;
    const r = node.getBoundingClientRect();
    const p = stagePoint(r.left + r.width * dx, r.top + r.height * dy);
    if (!el.cursor.classList.contains("on")) {
      const q = stagePoint(r.left + r.width / 2, r.top + r.height / 2);
      S.cx = Math.max(0, q.x - 140); S.cy = q.y + 60;
      el.cursor.style.transform = `translate(${S.cx}px,${S.cy}px)`;
      el.cursor.classList.add("on");
      await sleep(reduce.matches ? 0 : 200);
    }
    if (reduce.matches) {
      el.cursor.style.transform = `translate(${p.x}px,${p.y}px)`;
    } else {
      const dist = Math.hypot(p.x - S.cx, p.y - S.cy);
      const a = el.cursor.animate([{ transform: `translate(${S.cx}px,${S.cy}px)` }, { transform: `translate(${p.x}px,${p.y}px)` }], { duration: Math.min(1000, 380 + dist * 0.9), easing: "cubic-bezier(.45,.05,.2,1)", fill: "forwards" });
      try { await a.finished; } catch (e) { return; }
      el.cursor.style.transform = `translate(${p.x}px,${p.y}px)`;
      a.cancel();
    }
    S.cx = p.x; S.cy = p.y;
  }
  async function clickEffect() {
    el.cursor.classList.remove("click"); void el.cursor.offsetWidth; el.cursor.classList.add("click");
    await sleep(reduce.matches ? 0 : 170);
  }

  /* ---------- watch runner ---------- */
  async function waitResume(run) { while (S.paused && alive(run)) await sleep(120); }
  async function pace(ms, run) { // cancellable, pausable wait
    const end = performance.now() + (reduce.matches ? Math.min(ms, 300) : ms);
    while (performance.now() < end) { if (!alive(run)) return; await waitResume(run); await sleep(60); }
  }
  async function until(fn, run) { while (!fn()) { if (!alive(run)) return; await sleep(60); } }

  async function doAction(a, run) {
    if (typeof a === "string") {
      const n = $(`[data-k="${a}"]`, el.sheet.hidden ? el.stage : el.sheet) || $(`[data-k="${a}"]`);
      if (!n) return;
      await moveTo(n, 0.5, 0.5, run);
      if (!alive(run)) return;
      await clickEffect();
      if (!alive(run)) return;
      if (n.tagName === "svg" || n.closest("svg")) n.dispatchEvent(new MouseEvent("click", { bubbles: true })); else n.click();
      await sleep(reduce.matches ? 0 : 160);
    } else if (a.wait != null) {
      await pace(a.wait, run);
    } else if (a.type != null) {
      const n = $(`[data-k="${a.into}"]`);
      if (!n) return;
      await moveTo(n, 0.3, 0.5, run);
      if (!alive(run)) return;
      await clickEffect();
      await typeInto(n, a.type, run);
    } else if (a.drag != null) {
      const n = $(`[data-k="${a.drag}"]`);
      if (!n) return;
      const box = n.closest(".ba");
      const at = (v) => { const r = box.getBoundingClientRect(); return stagePoint(r.left + r.width * v / 100, r.top + r.height / 2); };
      let cur = Number(n.value);
      await moveTo(box, cur / 100, 0.5, run);
      if (!alive(run)) return;
      const t0 = performance.now(), dur = reduce.matches ? 0 : 900, from = cur;
      await new Promise((res) => {
        const tick = (now) => {
          if (!alive(run)) return res();
          const k = dur ? Math.min(1, (now - t0) / dur) : 1;
          const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          cur = from + (a.to - from) * e;
          n.value = cur; n.dispatchEvent(new Event("input", { bubbles: true }));
          const p = at(cur); S.cx = p.x; S.cy = p.y; el.cursor.style.transform = `translate(${p.x}px,${p.y}px)`;
          k < 1 ? requestAnimationFrame(tick) : res();
        };
        requestAnimationFrame(tick);
      });
    }
  }

  async function play(run) {
    let first = true;
    for (;;) {
      if (!alive(run)) return;
      const key = S.scn + ":" + S.step;
      if (!first && reduce.matches) { S.paused = true; renderChrome(view()); }
      first = false;
      await waitResume(run);
      await S.sayP;
      if (!alive(run)) return;
      await pace(500, run);
      const st = curStep();
      for (const a of (st.auto || ["primary"])) {
        if (!alive(run)) return;
        await waitResume(run);
        await doAction(a, run);
      }
      await until(() => !S.busy, run);
      if (!alive(run)) return;
      if (S.scn + ":" + S.step === key) { // same step after its script: the scenario has finished
        await until(() => !S.busy, run);
        hideCursor();
        return;
      }
    }
  }

  /* ---------- interactions (shared by both modes) ---------- */
  function setIn(arr, i) { const a = (S.state[arr] || []).slice(); a[i] = !a[i]; S.state[arr] = a; }

  function onAct(k, node) {
    const run = S.run;
    if (k === "mode-watch") { return startScenario(S.scn < 0 ? S.sel : S.scn, "watch"); }
    if (k === "mode-try") { if (S.mode === "watch") return takeover(); if (S.mode === "idle") return startScenario(S.sel, "try"); return; }
    if (k === "pause") {
      S.paused = !S.paused; renderChrome(view());
      return;
    }
    if (k === "restart") return startScenario(S.scn, S.mode === "idle" ? "try" : S.mode);
    if (k === "focus") { const on = el.app.dataset.focus !== "on"; el.app.dataset.focus = on ? "on" : "off"; el.focus.setAttribute("aria-pressed", on); postHeight(); return; }
    if (k === "menu") { const open = el.menu.hidden; el.menu.hidden = !open; el.menuBtn.setAttribute("aria-expanded", open); return; }
    if (k.startsWith("menu-")) { el.menu.hidden = true; el.menuBtn.setAttribute("aria-expanded", "false"); const i = Number(k.slice(5)); return i < 0 ? startIntro() : startScenario(i, S.mode === "watch" ? "watch" : "try"); }
    if (k.startsWith("sc-")) { S.sel = Number(k.slice(3)); return refresh(); }
    if (k === "start-watch") return startScenario(S.sel, "watch");
    if (k === "start-try") return startScenario(S.sel, "try");
    if (k === "replay") return startScenario(S.scn, S.mode === "watch" ? "watch" : "try");
    if (k === "next") { const n = S.scn + 1; return n >= D.scenarios.length ? startIntro() : startScenario(n, S.mode === "watch" ? "watch" : "try"); }
    if (k === "primary") return onPrimary(run);
    if (k === "approve") { closeSheet(false); S.sheetOk = true; return curStep().final ? complete() : go(S.step + 1); }
    if (k === "decline") { closeSheet(true); S.sayP = say("No problem. Nothing was sent."); return; }

    if (k.startsWith("prio-")) { setIn("prio", Number(k.slice(5))); return refresh(); }
    if (k.startsWith("pin-") || k.startsWith("home-")) { S.state.home = Number(k.split("-")[1]); return refresh(); }
    if (k.startsWith("pick-")) { setIn("picks", Number(k.slice(5))); return refresh(); }
    if (k.startsWith("dest-")) { S.state.dest = Number(k.slice(5)); return refresh(); }
    if (k === "row-commute") { if (!curStep().focus && !S.busy) go(S.step + 1); return; }
    if (k === "photo") { S.state.photo = true; return refresh(); }
    if (k === "gen") {
      S.state.gen = "busy"; refresh();
      clearTimeout(S.genTimer);
      S.genTimer = setTimeout(() => { S.state.gen = "done"; S.state.pos = 50; refresh(); S.sayP = say("Here is a labeled concept next to your original. Drag to compare."); }, reduce.matches ? 200 : 1500);
      return;
    }
    if (k === "stop") { clearTimeout(S.genTimer); S.state.gen = "idle"; return refresh(); }
    if (k.startsWith("mat-")) { S.state.mat = Number(k.slice(4)); return refresh(); }
    if (k === "attach") { S.state.attach = !S.state.attach; return refresh(); }
    if (k.startsWith("acc-")) { S.state.acc = Number(k.slice(4)); return refresh(); }
  }

  el.stage.addEventListener("click", (e) => {
    if (e.target === el.guard) { takeover(); return; }
    const n = e.target.closest("[data-k]");
    if (!n || n.dataset.k === "slider" || n.dataset.k === "issue") return;
    if (n.closest(".bar") && !n.closest(".menu__list") && ["mode-watch", "mode-try", "pause", "restart", "focus", "menu"].indexOf(n.dataset.k) < 0) return;
    onAct(n.dataset.k, n);
  });
  el.stage.addEventListener("keydown", (e) => {
    const g = e.target.closest && e.target.closest("g.pin");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onAct(g.dataset.k, g); }
    if (e.key === "Escape") {
      if (S.sheetOpen) { onAct("decline"); return; }
      if (!el.menu.hidden) { el.menu.hidden = true; el.menuBtn.setAttribute("aria-expanded", "false"); el.menuBtn.focus(); }
    }
    if (e.key === "Tab" && S.sheetOpen) {
      const f = $$("button", el.sheet); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  el.stage.addEventListener("input", (e) => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k === "slider") { S.state.pos = Number(e.target.value); e.target.closest(".ba").style.setProperty("--p", S.state.pos + "%"); }
    if (k === "issue") { S.state.issue = e.target.value; }
  });
  document.addEventListener("click", (e) => {
    if (!el.menu.hidden && !e.target.closest(".menu")) { el.menu.hidden = true; el.menuBtn.setAttribute("aria-expanded", "false"); }
  });
  el.composer.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = el.input.value.trim();
    if (!t || S.mode === "watch") return;
    el.input.value = "";
    el.you.textContent = t; el.you.hidden = false;
    S.sayP = say(D.ui.canned);
    postHeight();
  });

  /* ---------- boot ---------- */
  fetch("demo-data.json").then((r) => r.json()).then((data) => {
    D = data;
    el.menu.innerHTML = `<li><button type="button" data-k="menu--1">${D.ui.start}</button></li>` + D.scenarios.map((s, i) => `<li><button type="button" data-k="menu-${i}">${pad(i + 1)}  ${esc(s.name)}</button></li>`).join("");
    layout();
    startIntro();
    layout();
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
    idle(() => ["assets/kitchen-after-900.webp", "assets/kitchen-before-900.webp", "assets/house-792.webp", "assets/cottage-548.webp"].forEach((s) => { new Image().src = s; }));
  }).catch(() => {
    el.display.textContent = "The demonstration could not be loaded. Please reload the page.";
  });
})();
