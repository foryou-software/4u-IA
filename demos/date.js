/* 4UDate — functional scheduler: book, confirm, no-show, reminders, two branches. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "AGENDA · SEMANA EN CURSO",
      branch: "Sucursal", bC: "Centro", bN: "Norte", rem: "Enviar recordatorios",
      kOcc: "OCUPACIÓN", kConf: "CONFIRMADAS", kToday: "CITAS EN SEMANA", kNoShow: "INASISTENCIAS",
      feedT: "ACTIVIDAD", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      mNew: "Nueva cita", mEdit: "Gestionar cita", mName: "Nombre del paciente", mSvc: "Servicio",
      s1: "Consulta general", s2: "Laboratorio", s3: "Seguimiento",
      mBookB: "Reservar", mConfB: "✓ Confirmar asistencia", mNSB: "Marcar inasistencia",
      mDelB: "Cancelar cita", mBack: "Volver",
      days: ["LUN", "MAR", "MIÉ", "JUE", "VIE"],
      booked: "cita reservada", lgB: "Reservada", lgC: "Confirmada", lgN: "Inasistencia", svcF: "Servicio", allS: "Todos", confirmed: "confirmó asistencia", noshow: "no asistió", cancelled: "cita cancelada",
      remSent: "recordatorios enviados", remConf: "confirmó por recordatorio", needName: "Escribe el nombre del paciente" },
    en: { nav: "← System overview", sub: "SCHEDULE · CURRENT WEEK",
      branch: "Branch", bC: "Downtown", bN: "North", rem: "Send reminders",
      kOcc: "OCCUPANCY", kConf: "CONFIRMED", kToday: "APPTS THIS WEEK", kNoShow: "NO-SHOWS",
      feedT: "ACTIVITY", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      mNew: "New appointment", mEdit: "Manage appointment", mName: "Patient name", mSvc: "Service",
      s1: "General consult", s2: "Lab work", s3: "Follow-up",
      mBookB: "Book", mConfB: "✓ Confirm attendance", mNSB: "Mark no-show",
      mDelB: "Cancel appointment", mBack: "Back",
      days: ["MON", "TUE", "WED", "THU", "FRI"],
      booked: "appointment booked", lgB: "Booked", lgC: "Confirmed", lgN: "No-show", svcF: "Service", allS: "All", confirmed: "confirmed attendance", noshow: "did not attend", cancelled: "appointment cancelled",
      remSent: "reminders sent", remConf: "confirmed via reminder", needName: "Type the patient's name" }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];

  /* ---------- Data: two branches, 5 days × 8 slots ---------- */
  const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const seed = (pairs) => {
    const m = new Map();
    pairs.forEach(([d, h, name, svc, st]) => m.set(`${d}-${h}`, { name, svc, st }));   // st: booked|confirmed|noshow
    return m;
  };
  const BRANCHES = [
    seed([[0, 1, "María L.", 0, "confirmed"], [0, 3, "J. Ortega", 1, "booked"], [1, 2, "R. Peña", 0, "booked"],
          [2, 0, "Ana S.", 2, "confirmed"], [2, 5, "C. Villa", 0, "noshow"], [3, 4, "L. Mena", 1, "booked"],
          [4, 1, "P. Ríos", 2, "booked"]]),
    seed([[0, 2, "E. Cano", 0, "booked"], [1, 5, "D. Luna", 1, "confirmed"], [3, 1, "S. Ávila", 0, "booked"],
          [4, 6, "M. Ponce", 2, "booked"]])
  ];
  let branch = 0, svcFilter = "";
  const data = () => BRANCHES[branch];

  /* ---------- Calendar render ---------- */
  const cal = $("#cal");
  const stateCls = { booked: "busy", confirmed: "busy confirmed", noshow: "busy noshow" };
  /* Cells touched by the last action get a one-shot flash after re-render */
  let flashKeys = [];
  const flashCells = () => {
    if (reduced) { flashKeys = []; return; }
    flashKeys.forEach((key) => {
      const el = cal.querySelector(`[data-key="${key}"]`);
      if (!el) return;
      el.classList.add("flash");
      el.addEventListener("animationend", () => el.classList.remove("flash"), { once: true });
    });
    flashKeys = [];
  };
  /* Occupancy bars live outside the innerHTML rebuild so their scaleX transition runs */
  const occRow = [document.createElement("div")];
  for (let d = 0; d < 5; d++) {
    const c = document.createElement("div");
    c.className = "occ";
    c.innerHTML = `<u style="--w:0"></u>`;
    occRow.push(c);
  }
  const render = () => {
    const todayIdx = Math.min(4, Math.max(0, new Date().getDay() - 1));
    let h = `<div></div>` + t().days.map((d, i) => `<div class="hd ${i === todayIdx ? "today" : ""}">${d}</div>`).join("");
    HOURS.forEach((hr, r) => {
      h += `<div class="hr">${hr}</div>`;
      for (let d = 0; d < 5; d++) {
        const key = `${d}-${r}`;
        const ap = data().get(key);
        const dim = svcFilter !== "" && ap && String(ap.svc) !== svcFilter;
        h += ap
          ? `<div class="slot ${stateCls[ap.st]}" data-key="${key}" data-svc="${ap.svc}" style="${dim ? "opacity:.25" : ""}"><b>${ap.name}</b><span class="mono">${t()["s" + (ap.svc + 1)]}</span></div>`
          : `<div class="slot" data-key="${key}"></div>`;
      }
    });
    cal.innerHTML = h;
    // occupancy bar per day: reattach the persistent row, then mutate --w on the live nodes
    occRow.forEach((el) => cal.appendChild(el));
    void cal.offsetWidth;
    for (let d = 0; d < 5; d++) {
      const n = [...data().keys()].filter((k) => k.startsWith(d + "-")).length;
      occRow[d + 1].firstElementChild.style.setProperty("--w", (n / HOURS.length).toFixed(2));
    }
    // legend under the grid
    let lg = document.getElementById("calLegend");
    if (!lg) {
      lg = document.createElement("p");
      lg.id = "calLegend"; lg.className = "legend";
      cal.after(lg);
    }
    lg.innerHTML =
      `<span><i style="background:var(--acc)"></i>${t().lgB}</span>` +
      `<span><i style="background:var(--ok)"></i>${t().lgC}</span>` +
      `<span><i style="background:#E2687A"></i>${t().lgN}</span>`;
    kpis();
    flashCells();
  };

  /* ---------- Feed + KPIs ---------- */
  const feed = $("#feed");
  const push = (cls, txt) => {
    const el = document.createElement("div");
    el.className = `feed-item ${cls}`;
    const n = new Date();
    el.innerHTML = `<time>${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}</time><span>${txt}</span>`;
    feed.prepend(el);
    while (feed.children.length > 8) feed.lastChild.remove();
  };
  const kpis = () => {
    const aps = [...data().values()];
    const total = 5 * HOURS.length;
    $("#kOcc").textContent = Math.round(aps.length / total * 100) + "%";
    $("#kConf").textContent = aps.filter((a) => a.st === "confirmed").length;
    $("#kToday").textContent = aps.length;
    $("#kNoShow").textContent = aps.filter((a) => a.st === "noshow").length;
  };

  /* ---------- Modal: book / manage ---------- */
  const modal = $("#modalBg");
  let curKey = null;
  cal.addEventListener("click", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot) return;
    curKey = slot.dataset.key;
    const ap = data().get(curKey);
    const [d, r] = curKey.split("-").map(Number);
    $("#mSlot").textContent = `${t().days[d]} · ${HOURS[r]}`;
    $("#mTitle").textContent = ap ? t().mEdit : t().mNew;
    $("#mNewBody").hidden = !!ap;
    $("#mEditBody").hidden = !ap;
    if (!ap) { $("#mName").value = ""; }
    modal.classList.add("open");
    if (!ap) $("#mName").focus();
  });
  $("#mBook").addEventListener("click", () => {
    const name = $("#mName").value.trim();
    if (!name) { push("bad", t().needName); return; }
    data().set(curKey, { name, svc: $("#mSvc").selectedIndex, st: "booked" });
    flashKeys.push(curKey);
    push("ok", `<b>${name}</b> — ${t().booked}`);
    modal.classList.remove("open");
    render();
  });
  const act = (st, key, cls) => () => {
    const ap = data().get(curKey);
    if (!ap) return;
    if (st) { ap.st = st; flashKeys.push(curKey); } else { data().delete(curKey); }
    push(cls, `<b>${ap.name}</b> — ${t()[key]}`);
    modal.classList.remove("open");
    render();
  };
  $("#mConfirm").addEventListener("click", act("confirmed", "confirmed", "ok"));
  $("#mNoShow").addEventListener("click", act("noshow", "noshow", "bad"));
  $("#mDel").addEventListener("click", act(null, "cancelled", "warn"));
  modal.addEventListener("click", (e) => {
    if (e.target.id === "mClose" || e.target === modal) modal.classList.remove("open");
  });

  /* ---------- Branch switch + reminders ---------- */
  $("#selBranch").addEventListener("change", (e) => { branch = +e.target.value; render(); });
  $("#selSvc").addEventListener("change", (e) => { svcFilter = e.target.value; render(); });
  $("#btnRem").addEventListener("click", () => {
    const pending = [...data().entries()].filter(([, a]) => a.st === "booked");
    push("ok", `✉ ${pending.length} ${t().remSent}`);
    // some patients confirm on their own after the reminder
    pending.slice(0, 2).forEach(([key, a], i) => {
      setTimeout(() => {
        a.st = "confirmed";
        flashKeys.push(key);
        push("ok", `<b>${a.name}</b> — ${t().remConf}`);
        render();
      }, reduced ? 0 : 1200 + i * 1600);
    });
  });

  /* ---------- Lang ---------- */
  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    render();
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  applyLang();
})();
