/* 4UGov — functional citizen procedure: validated wizard, resumable draft
   (localStorage), folio generation and a back-office tray with audit trail. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DRAFT_KEY = "fy-gov-draft";

  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "TRÁMITE · LICENCIA DE FUNCIONAMIENTO", draft: "Guardar borrador",
      s1T: "PASO 1 · DATOS DEL SOLICITANTE", lb1: "DATOS", lb2: "DOMICILIO", lb3: "DOCUMENTO", lb4: "REVISIÓN", okT: "Trámite recibido", okN: "Recibirás notificaciones oficiales en cada cambio de estado. Puedes dar seguimiento con tu folio.", again: "Iniciar otro trámite", s1N: "Nombre completo",
      e1: "Revisa el nombre y que el CURP tenga 18 caracteres.",
      s2T: "PASO 2 · DOMICILIO DEL ESTABLECIMIENTO", s2C: "Calle y número", s2Z: "Código postal",
      e2: "Captura calle y un código postal de 5 dígitos.",
      s3T: "PASO 3 · DOCUMENTO DE IDENTIDAD", s3U: "Adjuntar identificación (simulado)",
      s3Ok: "✓ documento recibido y verificado", e3: "Adjunta el documento para continuar.",
      s4T: "PASO 4 · REVISIÓN Y ENVÍO", prev: "← Anterior", next: "Siguiente →", send: "Enviar trámite",
      bandT: "BANDEJA BACK-OFFICE · CLIC PARA DICTAMINAR",
      thFolio: "FOLIO", thSol: "SOLICITANTE", thFecha: "RECIBIDO", thEdo: "ESTADO",
      kDone: "COMPLETADOS", kRev: "EN REVISIÓN", kAvg: "TIEMPO PROMEDIO", kAband: "BORRADORES",
      audT: "AUDITORÍA", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      rName: "Solicitante", rAddr: "Domicilio", rDoc: "Identificación", rDocV: "verificada",
      stRev: "EN REVISIÓN", stOk: "APROBADO", stObs: "CON OBSERVACIONES",
      audStep: "avanzó al paso", audSent: "trámite enviado · folio", audDraft: "borrador guardado",
      audResume: "borrador reanudado", audApproved: "aprobado por analista", audObs: "observaciones emitidas",
      audDoc: "documento verificado", days: "días",
      resumeNote: "Borrador reanudado · paso {n} de 4" },
    en: { nav: "← System overview", sub: "PROCEDURE · BUSINESS LICENSE", draft: "Save draft",
      s1T: "STEP 1 · APPLICANT DETAILS", lb1: "DETAILS", lb2: "ADDRESS", lb3: "DOCUMENT", lb4: "REVIEW", okT: "Procedure received", okN: "You will get official notifications on every status change. Track it with your folio.", again: "Start another procedure", s1N: "Full name",
      e1: "Check the name and that the ID has 18 characters.",
      s2T: "STEP 2 · BUSINESS ADDRESS", s2C: "Street and number", s2Z: "ZIP code",
      e2: "Enter a street and a 5-digit ZIP code.",
      s3T: "STEP 3 · IDENTITY DOCUMENT", s3U: "Attach ID (simulated)",
      s3Ok: "✓ document received and verified", e3: "Attach the document to continue.",
      s4T: "STEP 4 · REVIEW & SUBMIT", prev: "← Previous", next: "Next →", send: "Submit procedure",
      bandT: "BACK-OFFICE TRAY · CLICK TO RESOLVE",
      thFolio: "FOLIO", thSol: "APPLICANT", thFecha: "RECEIVED", thEdo: "STATUS",
      kDone: "COMPLETED", kRev: "IN REVIEW", kAvg: "AVG TIME", kAband: "DRAFTS",
      audT: "AUDIT TRAIL", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      rName: "Applicant", rAddr: "Address", rDoc: "ID document", rDocV: "verified",
      stRev: "IN REVIEW", stOk: "APPROVED", stObs: "NEEDS CHANGES",
      audStep: "advanced to step", audSent: "procedure submitted · folio", audDraft: "draft saved",
      audResume: "draft resumed", audApproved: "approved by analyst", audObs: "changes requested",
      audDoc: "document verified", days: "days",
      resumeNote: "Draft resumed · step {n} of 4" }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];

  /* ---------- Audit feed + KPIs ---------- */
  const feed = $("#feed");
  const audit = (cls, txt) => {
    const el = document.createElement("div");
    el.className = `feed-item ${cls}`;
    const n = new Date();
    el.innerHTML = `<time>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</time><span>${txt}</span>`;
    feed.prepend(el);
    while (feed.children.length > 9) feed.lastChild.remove();
  };
  let done = 1, inRev = 1, drafts = 0;
  const kpis = () => {
    $("#kDone").textContent = done;
    $("#kRev").textContent = inRev;
    $("#kAvg").textContent = "2.4 " + t().days;
    $("#kAband").textContent = drafts;
  };

  /* ---------- Wizard state ---------- */
  let step = 1, docOk = false;
  const F = { name: "#gName", curp: "#gCurp", street: "#gStreet", zip: "#gZip" };
  const val = (sel) => $(sel).value.trim();

  const applyPanels = () => { for (let i = 1; i <= 4; i++) $(`#st${i}`).hidden = i !== step; };
  let cancelSwap = null;
  const crossfade = (outEl, inEl) => {
    let swapped = false;
    const enter = () => {
      if (swapped) return;
      swapped = true;
      cancelSwap = null;
      outEl.classList.remove("step-out");
      applyPanels();
      inEl.classList.add("step-in");
      const settle = () => inEl.classList.remove("step-in");
      inEl.addEventListener("animationend", settle, { once: true });
      setTimeout(settle, 300);
    };
    cancelSwap = () => {
      swapped = true;
      cancelSwap = null;
      outEl.classList.remove("step-out");
      inEl.classList.remove("step-in");
    };
    outEl.classList.add("step-out");
    outEl.addEventListener("transitionend", enter, { once: true });
    setTimeout(enter, 200);
  };
  const show = (n) => {
    const prev = step;
    step = n;
    $("#stOk").hidden = true;
    $("#wizNav").hidden = false;
    for (let i = 1; i <= 4; i++) {
      const s = $(`#wb${i}`);
      s.classList.toggle("on", i === n);
      s.classList.toggle("done", i < n);
      s.querySelector(".dot").textContent = i < n ? "✓" : i;
    }
    $("#btnPrev").hidden = n === 1;
    $("#btnNext").textContent = n === 4 ? t().send : t().next;
    if (n === 4) renderReview();
    if (cancelSwap) cancelSwap();
    const outEl = $(`#st${prev}`);
    if (reduced || prev === n || outEl.hidden) { applyPanels(); return; }
    crossfade(outEl, $(`#st${n}`));
  };
  const validate = () => {
    if (step === 1) {
      const ok = val(F.name).length >= 5 && /^[A-Z0-9]{18}$/i.test(val(F.curp));
      $("#e1").hidden = ok; return ok;
    }
    if (step === 2) {
      const ok = val(F.street).length >= 4 && /^\d{5}$/.test(val(F.zip));
      $("#e2").hidden = ok; return ok;
    }
    if (step === 3) { $("#e3").hidden = docOk; return docOk; }
    return true;
  };
  const renderReview = () => {
    $("#review").innerHTML = [
      [t().rName, `${val(F.name)} · ${val(F.curp).toUpperCase()}`],
      [t().rAddr, `${val(F.street)}, CP ${val(F.zip)}`],
      [t().rDoc, t().rDocV]
    ].map(([b, s]) => `<div class="tl-item done"><b>${b}</b><span>${s}</span></div>`).join("");
  };

  $("#btnNext").addEventListener("click", () => {
    if (!validate()) return;
    if (step < 4) { show(step + 1); audit("ok", `${t().audStep} ${step}`); }
    else submit();
  });
  $("#btnPrev").addEventListener("click", () => show(Math.max(1, step - 1)));

  /* ---------- Simulated upload ---------- */
  $("#btnUp").addEventListener("click", () => {
    const bar = $("#upBar"), fill = $("#upFill");
    bar.hidden = false;
    let p = 0;
    const tick = () => {
      p += reduced ? 100 : 6 + Math.random() * 10;
      fill.style.transform = `scaleX(${Math.min(100, p) / 100})`;
      if (p < 100) setTimeout(tick, 60);
      else {
        docOk = true;
        $("#upOk").hidden = false;
        $("#e3").hidden = true;
        audit("ok", t().audDoc);
      }
    };
    tick();
  });

  /* ---------- Draft: save & resume (real localStorage) ---------- */
  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      step, docOk,
      name: val(F.name), curp: val(F.curp), street: val(F.street), zip: val(F.zip)
    }));
    drafts = 1; kpis();
    audit("warn", `💾 ${t().audDraft}`);
  };
  $("#btnDraft").addEventListener("click", saveDraft);
  const showResume = (n) => {
    const el = document.createElement("div");
    el.className = "resume-note mono";
    el.textContent = "↻ " + t().resumeNote.replace("{n}", n);
    $("#wizCard").before(el);
    setTimeout(() => {
      if (reduced) { el.remove(); return; }
      el.classList.add("out");
      el.addEventListener("transitionend", () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 300);
    }, 4000);
  };
  const resumeDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      $(F.name).value = d.name || ""; $(F.curp).value = d.curp || "";
      $(F.street).value = d.street || ""; $(F.zip).value = d.zip || "";
      docOk = !!d.docOk;
      if (docOk) $("#upOk").hidden = false;
      drafts = 1;
      show(Math.min(4, d.step || 1));
      audit("ok", `↻ ${t().audResume}`);
      showResume(Math.min(4, d.step || 1));
    } catch (_) { /* corrupt draft: start clean */ }
  };

  /* ---------- Submit + back-office tray ---------- */
  const tray = $("#trayBody");
  const badge = { rev: () => `<span class="badge warn" data-st="rev">${t().stRev}</span>`,
                  ok: () => `<span class="badge ok" data-st="ok">${t().stOk}</span>`,
                  obs: () => `<span class="badge bad" data-st="obs">${t().stObs}</span>` };
  const addTray = (folio, name, when, st) => {
    const tr = document.createElement("tr");
    tr.dataset.folio = folio;
    tr.innerHTML = `<td class="mono">${folio}</td><td>${name}</td><td class="mono">${when}</td><td>${badge[st]()}</td>`;
    tray.prepend(tr);
  };
  const submit = () => {
    if (cancelSwap) cancelSwap();
    const folio = "LF-2026-" + String(Math.floor(1000 + Math.random() * 9000));
    const n = new Date();
    addTray(folio, val(F.name), `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`, "rev");
    inRev++; drafts = 0; kpis();
    localStorage.removeItem(DRAFT_KEY);
    audit("ok", `▲ ${t().audSent} <b>${folio}</b>`);
    // success view with the folio front and center
    for (let i = 1; i <= 4; i++) { $(`#st${i}`).hidden = true; $(`#wb${i}`).classList.add("done"); $(`#wb${i}`).classList.remove("on"); $(`#wb${i}`).querySelector(".dot").textContent = "✓"; }
    $("#wizNav").hidden = true;
    $("#okFolio").textContent = folio;
    $("#stOk").hidden = false;
    Object.values(F).forEach((s) => { $(s).value = ""; });
    docOk = false; $("#upOk").hidden = true; $("#upBar").hidden = true; $("#upFill").style.transform = "scaleX(0)";
  };
  $("#btnAgain").addEventListener("click", () => show(1));
  // analyst resolves cases by clicking rows: rev → ok → obs → rev
  tray.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const cell = tr.querySelector("[data-st]");
    const cur = cell.dataset.st;
    const next = cur === "rev" ? "ok" : cur === "ok" ? "obs" : "rev";
    cell.outerHTML = badge[next]();
    if (next === "ok") { done++; inRev = Math.max(0, inRev - 1); audit("ok", `<b>${tr.dataset.folio}</b> ${t().audApproved}`); }
    if (next === "obs") { audit("warn", `<b>${tr.dataset.folio}</b> ${t().audObs}`); }
    if (next === "rev") { inRev++; done = Math.max(0, done - 1); }
    kpis();
  });

  /* ---------- Lang ---------- */
  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    $("#btnNext").textContent = step === 4 ? t().send : t().next;
    kpis();
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  /* Seed the tray so the back-office feels alive */
  addTray("LF-2026-1042", "Comercial Ruiz SA", "09:12", "ok");
  addTray("LF-2026-1051", "Panificadora del Valle", "10:03", "rev");
  applyLang();
  show(1);
  resumeDraft();
})();
