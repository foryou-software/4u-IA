/* 4UFlow — SCADA line: live dual-series chart, threshold alarms, equipment tiles. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // GL del canvas no lee variables CSS: un solo read del token por cambio de tema
  let accCol = "#1F5CB0";
  const syncAcc = () => { accCol = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || "#1F5CB0"; };
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); syncAcc(); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "PISO DE PLANTA · LÍNEA 3", pause: "Pausar", play: "Reanudar",
      thr: "Umbral presión", gaT: "PRESIÓN ACTUAL", alarmT: "Presión sobre umbral — alerta enviada a mantenimiento",
      chT: "PRESIÓN Y TEMPERATURA · EN VIVO (60s)", eqT: "EQUIPOS DE LA LÍNEA",
      kEvt: "EVENTOS / SEG", kLat: "SENSOR → PANTALLA", kUp: "PIPELINE UPTIME", kAl: "ALARMAS HOY",
      feedT: "ACTIVIDAD", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      alarm: "alarma de presión", norm: "presión normalizada", eq: ["Compresor K-301", "Bomba P-112", "Válvula V-88", "Motor M-45", "Sensor T-9", "PLC L3"] },
    en: { nav: "← System overview", sub: "PLANT FLOOR · LINE 3", pause: "Pause", play: "Resume",
      thr: "Pressure threshold", gaT: "CURRENT PRESSURE", alarmT: "Pressure above threshold — maintenance alerted",
      chT: "PRESSURE & TEMPERATURE · LIVE (60s)", eqT: "LINE EQUIPMENT",
      kEvt: "EVENTS / SEC", kLat: "SENSOR → SCREEN", kUp: "PIPELINE UPTIME", kAl: "ALARMS TODAY",
      feedT: "ACTIVITY", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      alarm: "pressure alarm", norm: "pressure back to normal", eq: ["Compressor K-301", "Pump P-112", "Valve V-88", "Motor M-45", "Sensor T-9", "PLC L3"] }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];
  const icoPause = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5.5v13M15 5.5v13"/></svg>`;
  const icoPlay = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>`;
  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    $("#btnPlay").innerHTML = running ? `${icoPause} <span>${t().pause}</span>` : `${icoPlay} <span>${t().play}</span>`;
    renderEq();
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  const feed = $("#feed");
  const push = (cls, txt) => {
    const el = document.createElement("div");
    el.className = `feed-item ${cls}`;
    const n = new Date();
    el.innerHTML = `<time>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</time><span>${txt}</span>`;
    feed.prepend(el);
    while (feed.children.length > 8) feed.lastChild.remove();
  };

  /* Series buffers */
  const N = 120;
  const press = new Array(N).fill(74), temp = new Array(N).fill(58);
  let running = true, thr = 82, alarms = 0, inAlarm = false, phase = 0;

  /* Replay: al pausar aparece el scrubber; al reanudar el chart vuelve al vivo */
  const scrub = $("#scrub");
  const setRunning = (v) => {
    running = v;
    $("#btnPlay").classList.toggle("on", v);
    scrub.hidden = v;
    if (!v) scrub.value = String(N - 1);
    applyLang();
  };
  $("#btnPlay").addEventListener("click", () => setRunning(!running));
  scrub.addEventListener("input", () => draw(+scrub.value));
  $("#rngThr").addEventListener("input", (e) => {
    thr = +e.target.value; $("#thrVal").textContent = thr + " psi";
    if (!running) draw(+scrub.value);
  });

  /* Equipment tiles */
  const eqState = [1, 1, 1, 1, 1, 1];
  const renderEq = () => {
    $("#eq").innerHTML = t().eq.map((name, i) => `
      <div class="kpi ${eqState[i] ? "" : "alert"}">
        <b style="font-size:.95rem">${eqState[i] ? "●" : "○"} ${eqState[i] ? "OK" : "FALLA"}</b>
        <span>${name}</span>
      </div>`).join("");
  };

  /* Live chart */
  const cv = $("#cv"), ctx = cv.getContext("2d");
  const draw = (end = N - 1) => {
    const w = cv.clientWidth, h2 = 150;
    if (cv.width !== w * 2) { cv.width = w * 2; cv.height = h2 * 2; }
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h2);
    const y = (v) => h2 - 14 - ((v - 40) / 70) * (h2 - 30);
    // threshold line
    ctx.strokeStyle = "#E2A649"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y(thr)); ctx.lineTo(w, y(thr)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#E2A649"; ctx.font = "9px JetBrains Mono";
    ctx.fillText(thr + " psi", w - 44, y(thr) - 4);
    const plot = (arr, width, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = accCol; ctx.lineWidth = width;
      ctx.beginPath();
      for (let i = 0; i <= end; i++) { const x = (i / (N - 1)) * w; i ? ctx.lineTo(x, y(arr[i])) : ctx.moveTo(x, y(arr[i])); }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    plot(temp, 1.4, 0.55);
    plot(press, 2, 1);
    // dot at the last visible sample
    ctx.fillStyle = press[end] > thr ? "#E2687A" : "#34C08B";
    ctx.beginPath(); ctx.arc(Math.min((end / (N - 1)) * w, w - 2), y(press[end]), 3, 0, 7); ctx.fill();
  };

  const needle = $("#pNeedle"), pNow = $("#pNow");
  let tickN = 0, total = 0;
  const step = () => {
    if (running) {
      phase += 0.11;
      const spikes = Math.random() < 0.015 ? 14 : 0;
      press.push(74 + Math.sin(phase) * 5 + Math.random() * 3 + spikes); press.shift();
      temp.push(58 + Math.cos(phase * 0.6) * 4 + Math.random() * 2); temp.shift();
      total++;
      const cur = press[N - 1];
      if (cur > thr && !inAlarm) {
        inAlarm = true; alarms++;
        $("#alarm").classList.add("on");
        $("#kAl").textContent = alarms;
        eqState[2] = 0; renderEq();               // valve flags a fault during the excursion
        push("bad", `⚠ ${t().alarm} · ${cur.toFixed(1)} psi`);
        feed.firstElementChild.dataset.at = total; // marca la muestra para el salto del replay
      } else if (cur <= thr - 2 && inAlarm) {
        inAlarm = false;
        $("#alarm").classList.remove("on");
        eqState[2] = 1; renderEq();
        push("ok", t().norm);
      }
      // KPI y aguja a 1 Hz: el tick de 120ms era puro ruido visual
      if (tickN % 8 === 0) {
        $("#kEvt").textContent = (48 + Math.random() * 9).toFixed(1) + "k";
        const deg = -90 + Math.max(0, Math.min(1, (cur - 40) / 70)) * 180;
        needle.style.transform = `rotate(${deg.toFixed(1)}deg)`;
        pNow.textContent = cur.toFixed(1) + " psi";
      }
      tickN++;
    }
    draw(running ? N - 1 : +scrub.value);
  };

  // clic en una alarma del feed: pausa y salta a la ventana del incidente
  feed.addEventListener("click", (e) => {
    const it = e.target.closest(".feed-item");
    if (!it || !it.dataset.at) return;
    if (running) setRunning(false);
    const pos = N - 1 - (total - +it.dataset.at);
    const end = Math.max(0, Math.min(N - 1, pos + 20));
    scrub.value = String(end);
    draw(end);
  });

  applyLang();
  renderEq();
  window.fyLoop(step, { el: cv, interval: 120, reduced: "once" });
})();
