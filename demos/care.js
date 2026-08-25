/* 4UCare — clinical monitoring: patient roster, live vitals + EKG, alarms, audited access. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "MONITOREO CLÍNICO · PISO 4", evt: "Simular taquicardia",
      vHr: "FRECUENCIA CARDIACA", vSp: "SpO₂", vTp: "TEMPERATURA", ekgT: "EKG · DERIVACIÓN II",
      tlT: "EXPEDIENTE · LÍNEA DE TIEMPO", ptT: "PACIENTES · PISO 4",
      kPts: "MONITOREADOS", kOk: "ESTABLES", kAcc: "LECTURAS AUDITADAS", kAl: "ALARMAS TURNO",
      feedT: "AUDITORÍA DE ACCESO", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      alarmHr: "FC sobre umbral — enfermería notificada", norm: "signos normalizados",
      opened: "expediente abierto (motivo: monitoreo)", bed: "Cama",
      hlT: "PUENTE HL7 · MENSAJES", hlRx: "FARMACIA",
      tl: [["Ingreso a piso", "hace 2 días"], ["Laboratorios completos", "ayer 07:40"], ["Cambio de medicación", "ayer 19:15"], ["Monitoreo continuo", "en curso"]] },
    en: { nav: "← System overview", sub: "CLINICAL MONITORING · FLOOR 4", evt: "Simulate tachycardia",
      vHr: "HEART RATE", vSp: "SpO₂", vTp: "TEMPERATURE", ekgT: "EKG · LEAD II",
      tlT: "RECORD · TIMELINE", ptT: "PATIENTS · FLOOR 4",
      kPts: "MONITORED", kOk: "STABLE", kAcc: "READS AUDITED", kAl: "SHIFT ALARMS",
      feedT: "ACCESS AUDIT", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      alarmHr: "HR above threshold — nursing notified", norm: "vitals back to normal",
      opened: "record opened (reason: monitoring)", bed: "Bed",
      hlT: "HL7 BRIDGE · MESSAGES", hlRx: "PHARMACY",
      tl: [["Floor admission", "2 days ago"], ["Full lab work", "yesterday 07:40"], ["Medication change", "yesterday 19:15"], ["Continuous monitoring", "ongoing"]] }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];

  const feed = $("#feed");
  const push = (cls, txt) => {
    const el = document.createElement("div");
    el.className = `feed-item ${cls}`;
    const n = new Date();
    el.innerHTML = `<time>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</time><span>${txt}</span>`;
    feed.prepend(el);
    while (feed.children.length > 8) feed.lastChild.remove();
  };

  /* Patients: each with its own baseline */
  const PTS = [
    { id: "PX-4102", name: "M. Herrera", bed: "401-A", hr: 72, sp: 97, tp: 36.6 },
    { id: "PX-4118", name: "L. Cordero", bed: "402-B", hr: 84, sp: 95, tp: 37.1 },
    { id: "PX-4123", name: "R. Islas", bed: "404-A", hr: 66, sp: 98, tp: 36.4 },
    { id: "PX-4131", name: "A. Bustos", bed: "405-B", hr: 78, sp: 96, tp: 36.9 }
  ];
  let cur = PTS[0], tachy = 0, alarms = 0, inAlarm = false;

  const ptList = $("#ptList");
  const renderPts = () => {
    ptList.innerHTML = PTS.map((p) => `
      <div class="pt ${p === cur ? "sel" : ""}" data-id="${p.id}">
        <span class="pv">${p.name[0]}</span>
        <span><b>${p.name}</b><span class="mono">${p.id} · ${t().bed} ${p.bed}</span></span>
        <span class="mono" style="color:${p === cur && inAlarm ? "#E2687A" : "var(--ok)"}">●</span>
      </div>`).join("");
  };
  ptList.addEventListener("click", (e) => {
    const el = e.target.closest(".pt");
    if (!el) return;
    cur = PTS.find((p) => p.id === el.dataset.id);
    tachy = 0; inAlarm = false; $("#alarm").classList.remove("on");
    push("ok", `<b>${cur.id}</b> ${t().opened}`);
    renderPts(); renderTl();
  });

  const renderTl = () => {
    $("#tl").innerHTML = t().tl.map(([b, s], i) =>
      `<div class="tl-item ${i < 3 ? "done" : ""}"><b>${b}</b><span>${cur.id} · ${s}</span></div>`).join("");
  };

  /* Vitals tick */
  const vHr = $("#vHr"), vSp = $("#vSp"), vTp = $("#vTp");
  const tick = () => {
    const hr = Math.round(cur.hr + (tachy > 0 ? 46 : 0) + Math.random() * 6 - 3);
    const sp = Math.min(99, Math.round(cur.sp - (tachy > 0 ? 3 : 0) + Math.random() * 2 - 1));
    const tp = (cur.tp + Math.random() * 0.2 - 0.1).toFixed(1);
    vHr.querySelector("b").textContent = hr;
    vSp.querySelector("b").textContent = sp + "%";
    vTp.querySelector("b").textContent = tp + "°";
    const high = hr > 110;
    vHr.classList.toggle("alarm", high);
    if (high && !inAlarm) {
      inAlarm = true; alarms++;
      $("#alarm").classList.add("on");
      $("#alarmTxt").textContent = t().alarmHr;
      $("#kAl").textContent = alarms;
      $("#kOk").textContent = PTS.length - 1;
      push("bad", `<b>${cur.id}</b> ⚠ ${t().alarmHr}`);
      renderPts();
    } else if (!high && inAlarm) {
      inAlarm = false;
      $("#alarm").classList.remove("on");
      $("#kOk").textContent = PTS.length;
      push("ok", `<b>${cur.id}</b> ${t().norm}`);
      renderPts();
    }
    if (tachy > 0) tachy--;
  };
  window.fyLoop(tick, { el: document.querySelector(".app-main"), interval: reduced ? 2000 : 900, reduced: "run" });

  $("#btnEvent").addEventListener("click", () => { tachy = 14; });

  /* Franja HL7: el conteo de mensajes es el dato (corre bajo reduced-motion);
     el pulso de los carriles es solo ilustración CSS */
  const hlEls = [$("#hlLis"), $("#hlHis"), $("#hlFar")];
  const hlN = [1284, 2417, 903];
  const hlPaint = () => hlEls.forEach((el, i) => { el.textContent = hlN[i]; });
  hlPaint();
  window.fyLoop(() => {
    for (let i = 0; i < hlN.length; i++) hlN[i]++;
    hlPaint();
  }, { el: $(".hl7-strip"), interval: 2500, reduced: "run" });

  /* EKG canvas: classic PQRST loop, speeds up in tachycardia */
  const cv = $("#cv"), ctx = cv.getContext("2d");
  let x = 0;
  const yAt = (px, period, mid) => {
    const p = px % period;
    if (p < 6) return mid - 4 * Math.sin(p / 6 * Math.PI);            // P
    if (p < 10) return mid;
    if (p < 13) return mid + (p - 10) * 3;                             // Q
    if (p < 17) return mid + 9 - (p - 13) * 14;                        // R up
    if (p < 21) return mid - 47 + (p - 17) * 14;                       // R down
    if (p < 24) return mid + 9 - (p - 21) * 3;                         // S back
    if (p < 40) return mid - 5 * Math.sin((p - 24) / 16 * Math.PI);    // T
    return mid;
  };
  const sizeEkg = (h) => {
    const w = cv.clientWidth;
    if (cv.width !== w * 2) { cv.width = w * 2; cv.height = h * 2; ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, w, h); }
    return w;
  };
  // la taquicardia acelera con lerp por frame: el ritmo sube, no salta en escalón
  let ekSpeed = 2, ekPeriod = 78;
  const drawEkg = () => {
    const h = 120, w = sizeEkg(h);
    ekSpeed += ((tachy > 0 ? 3.4 : 2) - ekSpeed) * 0.06;
    ekPeriod += ((tachy > 0 ? 46 : 78) - ekPeriod) * 0.06;
    const mid = h / 2 + 8;
    // fade trail: clear a moving column
    ctx.clearRect(x, 0, 14, h);
    ctx.strokeStyle = "#34C08B"; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, yAt(x, ekPeriod, mid));
    const adv = ekSpeed * 2, steps = Math.ceil(adv);
    for (let i = 1; i <= steps; i++) {
      const px = x + (adv * i) / steps;
      ctx.lineTo(px, yAt(px, ekPeriod, mid));
    }
    ctx.stroke();
    x += adv;
    if (x > w) { x = 0; ctx.clearRect(0, 0, w, h); }
  };
  const drawEkgStatic = () => {
    // reduced-motion: trazo PQRST completo, estático — nunca un monitor en blanco
    const h = 120, w = sizeEkg(h), mid = h / 2 + 8;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#34C08B"; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, yAt(0, 78, mid));
    for (let i = 1; i <= w; i++) ctx.lineTo(i, yAt(i, 78, mid));
    ctx.stroke();
  };
  window.fyLoop(drawEkg, { el: cv, raf: true, reduced: "once", onceTick: drawEkgStatic });

  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    renderPts(); renderTl();
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  applyLang();
  push("ok", `<b>${cur.id}</b> ${t().opened}`);
})();
