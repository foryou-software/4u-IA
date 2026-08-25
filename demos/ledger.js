/* ============================================================
   4ULedger — full interactive demo
   Bank ↔ GL reconciliation workbench: tolerance-driven auto
   matching with animation, difference explanation flow,
   progress donut and client-side CSV export.
   All data simulated client-side.
   ============================================================ */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("fy-theme", t);
    themeBtn.setAttribute("aria-pressed", String(t === "light"));
  };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () =>
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  /* ---------- i18n ---------- */
  const T = {
    es: {
      nav: "← Ficha del sistema", sub: "MESA DE CONCILIACIÓN · CIERRE MARZO",
      closed: "Cierre conciliado al 100% — listo para reporte", fAll: "Todos", fPend: "Pendientes", fDone: "Conciliados", grpDone: "CONCILIADOS", diff: "Δ banco vs GL", addMv: "+ Movimiento", added: "movimiento capturado — corriendo matching",
      run: "Correr matching", tolD: "± días", tolA: "± monto", export: "Exportar CSV",
      colBank: "ESTADO DE CUENTA · BANCO", colGl: "CONTABILIDAD · PÓLIZAS",
      kMatched: "CONCILIADOS", kPend: "PENDIENTES", kAdj: "AJUSTES", kDiff: "DIF. NETA",
      feedT: "BITÁCORA", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      mTitle: "Explicar diferencia", rFee: "Comisión bancaria", rTiming: "Diferencia de fecha (tránsito)",
      rError: "Error de captura → generar ajuste",
      logRun: (n, tot) => `Matching: ${n}/${tot} conciliados automáticamente`,
      logFee: (id) => `${id} explicado como comisión`,
      logTiming: (id) => `${id} explicado como tránsito`,
      logError: (id) => `${id} → póliza de ajuste generada`,
      logExport: "CSV de conciliación exportado",
      detail: (b, g) => `Banco: ${b} · Contabilidad: ${g || "sin contrapartida"}`
    },
    en: {
      nav: "← System overview", sub: "RECONCILIATION DESK · MARCH CLOSE",
      closed: "Close fully reconciled — ready to report", fAll: "All", fPend: "Pending", fDone: "Matched", grpDone: "MATCHED", diff: "Δ bank vs GL", addMv: "+ Entry", added: "entry captured — running matching",
      run: "Run matching", tolD: "± days", tolA: "± amount", export: "Export CSV",
      colBank: "BANK STATEMENT", colGl: "GENERAL LEDGER · ENTRIES",
      kMatched: "MATCHED", kPend: "PENDING", kAdj: "ADJUSTMENTS", kDiff: "NET DIFF",
      feedT: "AUDIT LOG", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      mTitle: "Explain difference", rFee: "Bank fee", rTiming: "Timing difference (in transit)",
      rError: "Capture error → create adjustment",
      logRun: (n, tot) => `Matching: ${n}/${tot} auto-reconciled`,
      logFee: (id) => `${id} explained as bank fee`,
      logTiming: (id) => `${id} explained as timing`,
      logError: (id) => `${id} → adjustment entry created`,
      logExport: "Reconciliation CSV exported",
      detail: (b, g) => `Bank: ${b} · GL: ${g || "no counterpart"}`
    }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const applyLang = () => {
    const t = T[lang];
    $$("[data-t]").forEach((el) => {
      if (typeof t[el.dataset.t] === "string") el.textContent = t[el.dataset.t];
    });
    document.documentElement.lang = lang;
    $$("#langToggle [data-lang-opt]").forEach((s) =>
      s.classList.toggle("on", s.dataset.langOpt === lang));
  };
  $("#langToggle").addEventListener("click", () => {
    lang = lang === "es" ? "en" : "es";
    localStorage.setItem("fy-lang", lang);
    applyLang();
  });

  /* ---------- Deterministic dataset (seeded PRNG) ---------- */
  let seed = 20260331;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const CONCEPTS = ["Depósito cliente", "Pago proveedor", "Nómina", "Transferencia interna", "Venta terminal", "Servicio SaaS"];
  const bank = [], gl = [];
  for (let i = 0; i < 16; i++) {
    const amt = Math.round((800 + rnd() * 92000)) / 1;
    const day = 1 + Math.floor(rnd() * 28);
    const c = CONCEPTS[Math.floor(rnd() * CONCEPTS.length)];
    bank.push({ id: `B-${300 + i}`, day, amt, c, matched: false, explained: null });
    const roll = rnd();
    if (roll < 0.62) gl.push({ id: `P-${500 + i}`, day, amt, c, matched: false });                       // exact
    else if (roll < 0.8) gl.push({ id: `P-${500 + i}`, day: Math.min(28, day + 1 + Math.floor(rnd() * 2)), amt, c, matched: false }); // timing
    else if (roll < 0.92) gl.push({ id: `P-${500 + i}`, day, amt: amt - (5 + Math.round(rnd() * 30)), c, matched: false });          // fee-ish
    // else: bank line with no GL counterpart
  }
  // a couple of GL-only entries (accruals)
  gl.push({ id: "P-590", day: 27, amt: 4180, c: "Provisión servicios", matched: false });

  /* ---------- Render columns ---------- */
  const money = (v) => "$" + v.toLocaleString("es-MX");
  const rowHtml = (m, side) => {
    const live = side === "bank" && !(m.matched || m.explained);
    return `<div class="mv pending" data-side="${side}" data-id="${m.id}"${live ? ' tabindex="0" role="button"' : ""}>
       <span><b class="mono">${m.id}</b> · ${m.c}</span>
       <span class="mono">${String(m.day).padStart(2, "0")}/03</span>
       <span class="amt mono">${money(m.amt)}</span>
     </div>`;
  };
  let filter = "all";
  const money0 = (n) => "$" + Math.round(n).toLocaleString("es-MX");
  const paint = () => {
    const split = (arr, side) => {
      const pend = arr.filter((m) => !(m.matched || m.explained));
      const done = arr.filter((m) => m.matched || m.explained);
      return {
        pend: (filter === "done" ? [] : pend).map((m) => rowHtml(m, side)).join(""),
        done: (filter === "pend" ? [] : done).map((m) => rowHtml(m, side)).join(""),
        n: done.length,
        tot: arr.reduce((s, m) => s + m.amt, 0)
      };
    };
    const b = split(bank, "bank"), g = split(gl, "gl");
    $("#colBank").innerHTML = b.pend;
    $("#grpBank").innerHTML = b.done;
    $("#nBank").textContent = b.n;
    $("#totBank").textContent = money0(b.tot);
    $("#colGl").innerHTML = g.pend;
    $("#grpGl").innerHTML = g.done;
    $("#nGl").textContent = g.n;
    $("#totGl").textContent = money0(g.tot);
    // difference pill: only what's still unexplained on the bank side
    const diff = bank.filter((m) => !(m.matched || m.explained)).reduce((s, m) => s + m.amt, 0);
    const pill = $("#diffPill");
    pill.textContent = `${T[lang].diff}: ${money0(diff)}`;
    pill.classList.toggle("zero", Math.round(diff) === 0);
    // matched rows inside groups keep their look
    $("#grpBank").querySelectorAll(".mv").forEach((el) => { el.classList.add("matched"); el.classList.remove("pending"); });
    $("#grpGl").querySelectorAll(".mv").forEach((el) => { el.classList.add("matched"); el.classList.remove("pending"); });
  };
  // filters + group toggles
  document.querySelector(".wb-filters").addEventListener("click", (e) => {
    if (!e.target.dataset.f) return;
    filter = e.target.dataset.f;
    document.querySelectorAll(".wb-filters .ctl").forEach((b) => b.classList.toggle("on", b.dataset.f === filter));
    paint();
  });
  [["tgBank", "grpBank"], ["tgGl", "grpGl"]].forEach(([tg, grp]) => {
    $("#" + tg).addEventListener("click", () => { $("#" + grp).hidden = !$("#" + grp).hidden; });
  });

  /* ---------- Feed ---------- */
  const feed = $("#feed");
  const log = (cls, text) => {
    const item = document.createElement("div");
    item.className = `feed-item ${cls}`;
    const n = new Date();
    item.innerHTML = `<time>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</time><span>${text}</span>`;
    feed.prepend(item);
    while (feed.children.length > 8) feed.lastChild.remove();
  };

  /* ---------- Matching engine ---------- */
  let adjustments = 0;
  const tol = () => ({ d: +$("#rngDays").value, a: +$("#rngAmt").value });
  const elFor = (id) => document.querySelector(`.mv[data-id="${id}"]`);

  const runMatching = () => {
    // reset visual state (explained items stay resolved)
    bank.forEach((b) => { if (!b.explained) b.matched = false; });
    gl.forEach((g) => { g.matched = false; });
    const { d, a } = tol();
    const pairs = [];
    bank.forEach((b) => {
      if (b.explained) { b.matched = true; return; }
      const hit = gl.find((g) => !g.matched && g.c === b.c &&
        Math.abs(g.day - b.day) <= d && Math.abs(g.amt - b.amt) <= a);
      if (hit) { b.matched = true; hit.matched = true; pairs.push([b.id, hit.id]); }
    });
    // animate: flash then settle, staggered
    $$(".mv").forEach((el) => el.classList.remove("matched", "flash"));
    pairs.forEach(([bid, gid], i) => {
      setTimeout(() => {
        [elFor(bid), elFor(gid)].forEach((el) => {
          if (!el) return;
          el.classList.add("flash", "beam");
          setTimeout(() => { el.classList.remove("flash", "beam"); el.classList.add("matched"); el.classList.remove("pending"); }, reduced ? 0 : 380);
        });
        if (i === pairs.length - 1) refresh();
      }, reduced ? 0 : i * 60);
    });
    bank.filter((b) => b.explained).forEach((b) => {
      const el = elFor(b.id);
      if (el) { el.classList.add("matched"); el.classList.remove("pending"); }
    });
    log("ok", T[lang].logRun(pairs.length + bank.filter((b) => b.explained).length, bank.length));
    setTimeout(() => { refresh(); paint(); }, reduced ? 0 : pairs.length * 60 + 380);
  };

  /* ---------- KPIs + donut ---------- */
  const refresh = () => {
    const matched = bank.filter((b) => b.matched).length;
    const pend = bank.length - matched;
    const pct = Math.round((matched / bank.length) * 100);
    $("#kMatched").textContent = matched;
    $("#kPend").textContent = pend;
    $("#kAdj").textContent = adjustments;
    const diff = bank.filter((b) => !b.matched).reduce((s, b) => s + b.amt, 0);
    $("#kDiff").textContent = money(Math.round(diff));
    const C = 2 * Math.PI * 50;
    $("#donut").style.strokeDashoffset = (C * (1 - pct / 100)).toFixed(1);
    $("#donutNum").textContent = pct + "%";
    $("#donut").classList.toggle("full", pct === 100);
    document.querySelector(".donut-wrap").classList.toggle("party", pct === 100);
    if (pct === 100 && !window._fyParty) { window._fyParty = true; log("ok", T[lang].closed); }
    if (pct < 100) window._fyParty = false;
  };

  /* ---------- Explain-difference flow ---------- */
  const modalBg = $("#modalBg");
  let current = null, lastFocus = null;
  const openExplain = (row) => {
    current = bank.find((b) => b.id === row.dataset.id);
    if (!current || current.matched) return;
    const t = T[lang];
    $("#mDetail").textContent = t.detail(`${current.id} ${money(current.amt)}`, "");
    lastFocus = document.activeElement;
    modalBg.classList.add("open");
    modalBg.querySelector(".modal").focus();
  };
  const closeExplain = () => {
    modalBg.classList.remove("open");
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  };
  document.addEventListener("click", (e) => {
    const row = e.target.closest(".mv.pending[data-side='bank']");
    if (row) openExplain(row);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalBg.classList.contains("open")) closeExplain();
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest && e.target.closest(".mv.pending[data-side='bank']");
    if (!row) return;
    if (e.key === " ") e.preventDefault();
    openExplain(row);
  });
  modalBg.addEventListener("click", (e) => { if (e.target === modalBg) closeExplain(); });
  $$(".modal .ctl").forEach((btn) => btn.addEventListener("click", () => {
    if (!current) return;
    const reason = btn.dataset.reason;
    current.explained = reason;
    setTimeout(paint, 450);
    current.matched = true;
    if (reason === "error") adjustments++;
    const el = elFor(current.id);
    if (el) { el.classList.add("matched"); el.classList.remove("pending"); }
    const t = T[lang];
    log(reason === "error" ? "warn" : "ok",
      reason === "fee" ? t.logFee(current.id) : reason === "timing" ? t.logTiming(current.id) : t.logError(current.id));
    closeExplain();
    refresh();
  }));

  /* ---------- CSV export (client-side) ---------- */
  $("#btnExport").addEventListener("click", () => {
    const rows = [["id", "dia", "concepto", "monto", "estado", "explicacion"]];
    bank.forEach((b) => rows.push([b.id, b.day, b.c, b.amt, b.matched ? "conciliado" : "pendiente", b.explained || ""]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "conciliacion-4uledger.csv" });
    a.click();
    URL.revokeObjectURL(url);
    log("ok", T[lang].logExport);
  });

  /* ---------- Controls ---------- */
  $("#btnRun").addEventListener("click", runMatching);
  $("#btnAdd").addEventListener("click", () => {
    // captures a bank movement + its GL twin one day apart: shows matching value instantly
    const id = "B-" + (900 + bank.length);
    const concepts = ["Transferencia cliente", "Pago proveedor", "Comisión bancaria", "Nómina"];
    const c = concepts[Math.floor(Math.random() * concepts.length)];
    const day = 3 + Math.floor(Math.random() * 24);
    const amt = Math.round(1000 + Math.random() * 90000) / 1;
    bank.push({ id, c, day, amt, matched: false });
    gl.push({ id: "P-" + (900 + gl.length), c, day: Math.min(27, day + 1), amt, matched: false });
    paint();
    log("ok", T[lang].added);
    setTimeout(runMatching, reduced ? 0 : 350);
  });
  /* Recálculo vivo: mover el dial re-corre el matching (debounce corto) */
  let tolTimer = null;
  const liveRun = () => { clearTimeout(tolTimer); tolTimer = setTimeout(runMatching, reduced ? 0 : 250); };
  $("#rngDays").addEventListener("input", (e) => { $("#valDays").textContent = e.target.value; liveRun(); });
  $("#rngAmt").addEventListener("input", (e) => { $("#valAmt").textContent = "$" + e.target.value; liveRun(); });

  /* ---------- Boot ---------- */
  applyLang();
  paint();
  refresh();
  setTimeout(runMatching, reduced ? 0 : 700);   // the desk reconciles itself on arrival
})();
