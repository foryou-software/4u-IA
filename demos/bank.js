/* ============================================================
   4UBank — full interactive demo
   Live transaction stream, TPS sparkline, score distribution,
   fraud spike injection and a per-transaction timeline drawer.
   All data simulated client-side.
   ============================================================ */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("fy-theme", t);
    themeBtn.setAttribute("aria-pressed", String(t === "light"));
    drawAll();
  };
  themeBtn.addEventListener("click", () =>
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  /* ---------- i18n ---------- */
  const T = {
    es: {
      nav: "← Ficha del sistema", sub: "CONSOLA DE OPERACIÓN · PAGOS",
      pause: "Pausar", play: "Reanudar", spike: "Inyectar pico de fraude", load: "Carga",
      thId: "ID", thCh: "CANAL", thAmt: "MONTO", thScore: "SCORE", thState: "ESTADO", thLat: "LAT",
      kTps: "TX / SEG", kAppr: "APROBACIÓN", kP95: "SCORE P95", kDlq: "DEAD-LETTER",
      capTps: "THROUGHPUT · 60S", capDist: "DISTRIBUCIÓN DE SCORES", feedT: "ALERTAS",
      ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      rulesT: "REGLAS DE FRAUDE · EN VIVO", r1: "Monto > $8,000 → retar", r2: "Canal ECOM alto riesgo → retar",
      alarmT: "Pico de fraude detectado — revisando transacciones retadas",
      dApr: "✓ Aprobar", dBlk: "✕ Bloquear", approvedBy: "aprobada por analista", blockedBy: "bloqueada por analista",
      ruleOn: "regla activada", ruleOff: "regla desactivada",
      stApproved: "aprobada", stChallenged: "retada", stBlocked: "bloqueada",
      spikeOn: "Pico de fraude inyectado — el modelo responde", spikeOff: "Distribución normalizada",
      dlq: "evento a dead-letter · reproceso disponible",
      replayBtn: "Reprocesar", replayed: "reprocesada por torre · re-evaluada",
      tlRecv: "Recibida (gateway)", tlScore: "Score de fraude", tlRoute: "Ruteo al adquirente", tlSettle: "Liquidada",
      meta: (c, a) => `Canal ${c} · ${a} MXN`
    },
    en: {
      nav: "← System overview", sub: "OPS CONSOLE · PAYMENTS",
      pause: "Pause", play: "Resume", spike: "Inject fraud spike", load: "Load",
      thId: "ID", thCh: "CHANNEL", thAmt: "AMOUNT", thScore: "SCORE", thState: "STATE", thLat: "LAT",
      kTps: "TX / SEC", kAppr: "APPROVAL", kP95: "SCORE P95", kDlq: "DEAD-LETTER",
      capTps: "THROUGHPUT · 60S", capDist: "SCORE DISTRIBUTION", feedT: "ALERTS",
      ribbon: "CONCEPT DEMO · SIMULATED DATA",
      rulesT: "FRAUD RULES · LIVE", r1: "Amount > $8,000 → challenge", r2: "High-risk ECOM channel → challenge",
      alarmT: "Fraud spike detected — reviewing challenged transactions",
      dApr: "✓ Approve", dBlk: "✕ Block", approvedBy: "approved by analyst", blockedBy: "blocked by analyst",
      ruleOn: "rule enabled", ruleOff: "rule disabled",
      stApproved: "approved", stChallenged: "challenged", stBlocked: "blocked",
      spikeOn: "Fraud spike injected — the model responds", spikeOff: "Distribution normalized",
      dlq: "event sent to dead-letter · replay available",
      replayBtn: "Replay", replayed: "replayed by tower · re-scored",
      tlRecv: "Received (gateway)", tlScore: "Fraud score", tlRoute: "Routed to acquirer", tlSettle: "Settled",
      meta: (c, a) => `Channel ${c} · ${a} MXN`
    }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const icoPause = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5.5v13M15 5.5v13"/></svg>`;
  const icoPlay = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>`;
  const applyLang = () => {
    const t = T[lang];
    document.querySelectorAll("[data-t]").forEach((el) => {
      if (typeof t[el.dataset.t] === "string") el.textContent = t[el.dataset.t];
    });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) =>
      s.classList.toggle("on", s.dataset.langOpt === lang));
    $("#btnPlay").innerHTML = running ? `${icoPause} <span>${t.pause}</span>` : `${icoPlay} <span>${t.play}</span>`;
  };
  $("#langToggle").addEventListener("click", () => {
    lang = lang === "es" ? "en" : "es";
    localStorage.setItem("fy-lang", lang);
    applyLang();
  });

  /* ---------- Simulation ---------- */
  const CH = ["POS", "ECOM", "SPEI", "ATM", "APP"];
  let running = true, loadMul = 1, spiking = 0, seq = 48210, dlq = 0;
  const RULES = { r1: false, r2: true };
  let approved = 0, total = 0;
  const scores = [];          // rolling for P95 + histogram
  const tpsWindow = new Array(60).fill(0); // last 60s

  const genTx = () => {
    seq++;
    const base = spiking > 0 && Math.random() < 0.45 ? 55 + Math.random() * 45 : Math.random() * 46;
    const score = Math.min(99, Math.round(base));
    let state = score > 78 ? "blocked" : score > 55 ? "challenged" : "approved";
    const _amt = 120 + Math.random() * 18800;
    if (state === "approved" && RULES.r1 && _amt > 8000) state = "challenged";
    return {
      id: `TX-${seq}`,
      ch: CH[Math.floor(Math.random() * CH.length)],
      amt: _amt.toFixed(2),
      score, state,
      lat: 28 + Math.round(Math.random() * 34),
      ts: new Date()
    };
  };
  const applyRules = (tx) => {
    if (tx.state === "approved" && RULES.r2 && tx.ch === "ECOM" && tx.score > 30) tx.state = "challenged";
    return tx;
  };

  /* ---------- Table ---------- */
  const body = $("#txBody");
  const badge = (tx) => {
    const t = T[lang];
    const cls = tx.state === "approved" ? "ok" : tx.state === "challenged" ? "warn" : "bad";
    const label = tx.state === "approved" ? t.stApproved : tx.state === "challenged" ? t.stChallenged : t.stBlocked;
    return `<span class="badge ${cls}">${label}</span>`;
  };
  const addRow = (tx) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td class="mono">${tx.id}</td><td class="mono">${tx.ch}</td>` +
      `<td class="mono">$${Number(tx.amt).toLocaleString("es-MX")}</td>` +
      `<td class="mono">${tx.score}</td><td>${badge(tx)}</td><td class="mono">${tx.lat}ms</td>`;
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.addEventListener("click", () => { curRow = tr; openDrawer(tx); });
    tr.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.key === " ") e.preventDefault();
      curRow = tr; openDrawer(tx);
    });
    body.prepend(tr);
    while (body.children.length > 16) body.lastChild.remove();
  };

  /* ---------- Feed ---------- */
  const feed = $("#feed");
  const pushFeed = (cls, text) => {
    const item = document.createElement("div");
    item.className = `feed-item ${cls}`;
    const n = new Date();
    item.innerHTML = `<time>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</time><span>${text}</span>`;
    feed.prepend(item);
    while (feed.children.length > 7) feed.lastChild.remove();
  };

  /* ---------- Canvases ---------- */
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const cvT = $("#cvTps"), cvD = $("#cvDist");
  const sizeCanvas = (cv) => {
    const r = cv.getBoundingClientRect();
    cv.width = Math.max(200, r.width * devicePixelRatio);
    cv.height = cv.getAttribute("height") * devicePixelRatio;
  };
  const drawTps = () => {
    sizeCanvas(cvT);
    const ctx = cvT.getContext("2d");
    const W = cvT.width, H = cvT.height, max = Math.max(...tpsWindow, 8);
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    tpsWindow.forEach((v, i) => {
      const x = (i / (tpsWindow.length - 1)) * W;
      const y = H - (v / max) * (H - 8) - 4;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = css("--acc") || "#3F7BD1";
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.stroke();
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.globalAlpha = 0.12; ctx.fillStyle = css("--acc"); ctx.fill(); ctx.globalAlpha = 1;
  };
  const drawDist = () => {
    sizeCanvas(cvD);
    const ctx = cvD.getContext("2d");
    const W = cvD.width, H = cvD.height;
    ctx.clearRect(0, 0, W, H);
    const bins = new Array(10).fill(0);
    scores.slice(-400).forEach((s) => bins[Math.min(9, Math.floor(s / 10))]++);
    const max = Math.max(...bins, 1);
    const bw = W / 10;
    bins.forEach((b, i) => {
      const h = (b / max) * (H - 10);
      ctx.fillStyle = i >= 8 ? (css("--err") || "#E2687A") : i >= 6 ? (css("--warn") || "#E2A649") : css("--acc");
      ctx.globalAlpha = 0.85;
      ctx.fillRect(i * bw + 2 * devicePixelRatio, H - h, bw - 4 * devicePixelRatio, h);
    });
    ctx.globalAlpha = 1;
  };
  const drawAll = () => { drawTps(); drawDist(); };
  addEventListener("resize", drawAll);

  /* ---------- KPIs ---------- */
  const p95 = () => {
    if (!scores.length) return "—";
    const s = [...scores].slice(-400).sort((a, b) => a - b);
    return s[Math.floor(s.length * 0.95)];
  };
  const refreshKpis = (tpsNow) => {
    $("#kTps").textContent = (tpsNow / 1000).toFixed(1) + "k";
    $("#kAppr").textContent = total ? Math.round((approved / total) * 100) + "%" : "—";
    $("#kP95").textContent = p95();
    $("#kDlq").textContent = dlq;
  };

  /* ---------- Drawer ---------- */
  const drawer = $("#drawer");
  let curTx = null, curRow = null, lastFocus = null;
  const openDrawer = (tx) => {
    curTx = tx;
    lastFocus = document.activeElement;
    const t = T[lang];
    $("#dTitle").textContent = `${tx.id} · ${badgeText(tx)}`;
    $("#dMeta").textContent = t.meta(tx.ch, Number(tx.amt).toLocaleString("es-MX"));
    const steps = [
      [t.tlRecv, "0 ms"], [t.tlScore, `${Math.round(tx.lat * 0.4)} ms · score ${tx.score}`],
      [t.tlRoute, `${Math.round(tx.lat * 0.75)} ms`], [t.tlSettle, `${tx.lat} ms`]
    ];
    const blockedAt = tx.state === "blocked" ? 2 : 5;
    $("#dTimeline").innerHTML = steps.map(([b, s], i) =>
      `<div class="tl-item ${i < blockedAt ? "done" : ""}"><b>${b}</b><span>${s}</span></div>`).join("");
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    $("#drawerClose").focus();
  };
  const closeDrawer = () => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  };
  const badgeText = (tx) => {
    const t = T[lang];
    return tx.state === "approved" ? t.stApproved : tx.state === "challenged" ? t.stChallenged : t.stBlocked;
  };
  const resolve = (state, key) => {
    if (!curTx || !curRow) return;
    curTx.state = state;
    const cell = curRow.querySelector("td:nth-last-child(2)");
    if (cell) cell.innerHTML = badge(curTx);
    pushFeed(state === "approved" ? "ok" : "bad", `<b>${curTx.id}</b> ${T[lang][key]}`);
    closeDrawer();
  };
  $("#dApprove").addEventListener("click", () => resolve("approved", "approvedBy"));
  $("#dBlock").addEventListener("click", () => resolve("blocked", "blockedBy"));
  $("#drawerClose").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  /* ---------- Controls ---------- */
  $("#btnPlay").addEventListener("click", () => {
    running = !running;
    $("#btnPlay").classList.toggle("on", running);
    applyLang();
  });
  $("#rngTps").addEventListener("input", (e) => { loadMul = parseFloat(e.target.value); });
  const wireRule = (id, key) => {
    document.getElementById(id).addEventListener("click", (e) => {
      RULES[key] = !RULES[key];
      e.currentTarget.classList.toggle("on", RULES[key]);
      pushFeed(RULES[key] ? "warn" : "ok", `${key.toUpperCase()} · ${RULES[key] ? T[lang].ruleOn : T[lang].ruleOff}`);
    });
  };
  wireRule("rw1", "r1");
  wireRule("rw2", "r2");

  $("#btnSpike").addEventListener("click", () => {
    spiking = 35;                       // ~12s de riesgo elevado (35 ticks de 340ms)
    $("#alarm").classList.add("on");
    pushFeed("bad", T[lang].spikeOn);
  });

  /* Replay de dead-letter: el evento fallido se re-emite y se re-evalúa en vivo */
  feed.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rp]");
    if (!b) return;
    const item = b.closest(".feed-item");
    if (item) item.remove();
    dlq = Math.max(0, dlq - 1);
    $("#kDlq").textContent = dlq;
    const tx = applyRules(genTx());
    tx.id = b.dataset.rp;
    total++;
    scores.push(tx.score);
    if (tx.state === "approved") approved++;
    addRow(tx);
    const row = $("#txBody").firstElementChild;
    if (row) row.classList.add("rehit");
    pushFeed("ok", `${tx.id} ${T[lang].replayed}`);
  });

  /* ---------- Engine ----------
     El stream simulado tiene un volumen modelado por un generador determinista
     (sembrado); la tabla muestra una muestra de ese stream. El TPS reportado
     ES el volumen del modelo — sin multiplicadores de presentación. */
  let prngState = 20260801;
  const prng = () => {
    prngState |= 0; prngState = (prngState + 0x6D2B79F5) | 0;
    let t = Math.imul(prngState ^ (prngState >>> 15), 1 | prngState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let secTx = 0;
  window.fyLoop(() => {                 // per-tick generator
    if (!running) return;
    const n = Math.round((1 + Math.random() * 2) * loadMul);
    for (let i = 0; i < n; i++) {
      const tx = applyRules(genTx());
      total++;
      scores.push(tx.score);
      if (scores.length > 600) scores.shift();
      if (tx.state === "approved") approved++;
      if (tx.state === "blocked" && Math.random() < 0.25) {
        dlq++;
        pushFeed("warn", `${tx.id} ${T[lang].dlq}`);
        const item = feed.firstElementChild;
        if (item) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "ctl rp";
          b.dataset.rp = tx.id;
          b.textContent = T[lang].replayBtn;
          item.appendChild(b);
        }
      }
      addRow(tx);
    }
    secTx += Math.round((2300 + prng() * 900) * loadMul);   // volumen del stream modelado en este tick
    if (spiking > 0 && --spiking === 0) { pushFeed("ok", T[lang].spikeOff); $("#alarm").classList.remove("on"); }
    drawDist();
  }, { el: document.querySelector(".app-main"), interval: 340, reduced: "run" });

  const needle = $("#tpsNeedle");
  window.fyLoop(() => {                 // 1s cadence: window + KPIs + velocímetro
    tpsWindow.push(secTx);
    tpsWindow.shift();
    refreshKpis(secTx);
    if (needle) {
      const deg = -90 + Math.min(1, secTx / (12000 * loadMul)) * 180;
      needle.style.transform = `rotate(${deg.toFixed(1)}deg)`;
    }
    secTx = 0;
    drawTps();
  }, { el: document.querySelector(".app-main"), interval: 1000, reduced: "run" });

  setTheme(localStorage.getItem("fy-theme") || "dark");
  applyLang();
  for (let i = 0; i < 10; i++) addRow(applyRules(genTx()));   // seed the table
  drawAll();
})();
