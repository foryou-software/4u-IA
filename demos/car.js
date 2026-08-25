/* 4UCar — showroom + financing: 3D tilt cards, live monthly quote, reserve flow. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + Math.round(n).toLocaleString("es-MX");
  const fine = matchMedia("(pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "SHOWROOM · GRUPO DEMO",
      qT: "COTIZADOR", qPick: "Selecciona una unidad del showroom.", qDown: "Enganche", qTerm: "Plazo",
      qBank: "Banco", qMo: "MENSUALIDAD ESTIMADA", qApart: "Apartar unidad",
      kStock: "UNIDADES EN PISO", kQuotes: "COTIZACIONES HOY", kApart: "APARTADAS", kConv: "CONVERSIÓN",
      feedT: "ACTIVIDAD", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      mOk: "Unidad apartada", mOkN: "Un asesor confirmará tu cita de entrega. El apartado es válido por 48 horas.", mBack: "Volver",
      all: "Todos", types: { suv: "SUV", sedan: "Sedán", pickup: "Pickup" },
      quoted: "cotizó", reserved: "apartada · folio" },
    en: { nav: "← System overview", sub: "SHOWROOM · DEMO GROUP",
      qT: "FINANCING", qPick: "Pick a unit from the showroom.", qDown: "Down payment", qTerm: "Term",
      qBank: "Bank", qMo: "ESTIMATED MONTHLY", qApart: "Reserve unit",
      kStock: "UNITS ON FLOOR", kQuotes: "QUOTES TODAY", kApart: "RESERVED", kConv: "CONVERSION",
      feedT: "ACTIVITY", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      mOk: "Unit reserved", mOkN: "An advisor will confirm your delivery appointment. The hold is valid for 48 hours.", mBack: "Back",
      all: "All", types: { suv: "SUV", sedan: "Sedan", pickup: "Pickup" },
      quoted: "quoted", reserved: "reserved · folio" }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];

  /* Inventory */
  const CARS = [
    ["Volt SUV Pro", "suv", 2026, 589900, "M18 40 h8 l8 -12 h26 l10 12 h14 M28 40 a6 6 0 1 0 12 0 M74 40 a6 6 0 1 0 12 0"],
    ["Aster Sedán GT", "sedan", 2026, 469900, "M14 40 h10 l10 -10 h30 l14 10 h10 M26 40 a6 6 0 1 0 12 0 M78 40 a6 6 0 1 0 12 0"],
    ["Terra Pickup 4x4", "pickup", 2025, 689900, "M14 40 h6 v-12 h30 l8 -8 h18 v20 h10 M26 40 a6 6 0 1 0 12 0 M78 40 a6 6 0 1 0 12 0"],
    ["Volt SUV Lite", "suv", 2025, 489900, "M18 40 h8 l8 -12 h26 l10 12 h14 M28 40 a6 6 0 1 0 12 0 M74 40 a6 6 0 1 0 12 0"],
    ["Aster Sedán SE", "sedan", 2025, 389900, "M14 40 h10 l10 -10 h30 l14 10 h10 M26 40 a6 6 0 1 0 12 0 M78 40 a6 6 0 1 0 12 0"],
    ["Terra Pickup Work", "pickup", 2026, 599900, "M14 40 h6 v-12 h30 l8 -8 h18 v20 h10 M26 40 a6 6 0 1 0 12 0 M78 40 a6 6 0 1 0 12 0"]
  ].map(([name, type, yr, price, path], i) => ({ id: "VIN-" + (7300 + i), name, type, yr, price, path, reserved: false }));

  let typeFilter = "", sel = null, quotes = 0, reservedN = 0;

  const grid = $("#carGrid");
  let tiltCard = null;
  const render = () => {
    // la entrada del showroom solo ocurre la primera vez; re-renders no la re-disparan
    if (grid.innerHTML) grid.classList.add("no-entry");
    tiltCard = null;
    grid.innerHTML = CARS
      .filter((c) => !typeFilter || c.type === typeFilter)
      .map((c) => `
      <div class="car-card ${sel === c ? "sel" : ""}" data-id="${c.id}" ${c.reserved ? 'style="opacity:.45;pointer-events:none"' : ""}>
        <div class="car-body"><svg viewBox="0 0 104 52"><path d="${c.path}"/></svg></div>
        <h3>${c.name}</h3>
        <span class="mono">${c.yr} · ${t().types[c.type]} · ${c.id}</span>
        <span class="price">${money(c.price)}</span>
      </div>`).join("");
    $("#typeChips").innerHTML =
      [`<button class="ctl ${!typeFilter ? "on" : ""}" data-type="">${t().all}</button>`]
      .concat(Object.entries(t().types).map(([k, v]) =>
        `<button class="ctl ${typeFilter === k ? "on" : ""}" data-type="${k}">${v}</button>`)).join("");
    kpis();
  };
  $("#typeChips").addEventListener("click", (e) => {
    if (e.target.dataset.type === undefined) return;
    typeFilter = e.target.dataset.type; render();
  });

  /* 3D tilt (fine pointers only): rAF-throttled, solo la card bajo el cursor */
  if (fine && !reduced) {
    let tiltEvt = null, tiltQueued = false;
    const untilt = () => {
      if (!tiltCard) return;
      tiltCard.classList.remove("tilting");
      tiltCard.style.transform = "";
      tiltCard = null;
    };
    const tiltFrame = () => {
      tiltQueued = false;
      const card = tiltEvt.target.closest(".car-card");
      if (card !== tiltCard) untilt();
      if (!card) return;
      tiltCard = card;
      card.classList.add("tilting");
      const r = card.getBoundingClientRect();
      const rx = ((tiltEvt.clientY - r.top) / r.height - 0.5) * -7;
      const ry = ((tiltEvt.clientX - r.left) / r.width - 0.5) * 9;
      card.style.transform = `perspective(700px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) translateY(-3px)`;
    };
    grid.addEventListener("pointermove", (e) => {
      tiltEvt = e;
      if (!tiltQueued) { tiltQueued = true; requestAnimationFrame(tiltFrame); }
    });
    // al salir, .tilting cae y el reposo regresa con la transición spring de la card
    grid.addEventListener("pointerleave", untilt);
  }

  /* Selection → quote */
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".car-card");
    if (!card) return;
    sel = CARS.find((c) => c.id === card.dataset.id);
    render();
    $("#qCar").textContent = `${sel.name} · ${money(sel.price)}`;
    $("#qBody").hidden = false;
    quotes++; kpis();
    push("ok", `<b>${sel.id}</b> ${t().quoted} · ${sel.name}`);
    quote();
  });

  const RATES = [0.129, 0.138, 0.152];
  const payment = (price, down, nMo, rate) => {
    const m = rate / 12, P = price * (1 - down);
    return P * m / (1 - Math.pow(1 + m, -nMo));
  };
  /* Aguja de mensualidad: bounds deterministas con los extremos reales del cotizador */
  const rngDown = $("#rngDown"), rngTerm = $("#rngTerm");
  const prices = CARS.map((c) => c.price);
  const PAY_MIN = payment(Math.min(...prices), +rngDown.max / 100, +rngTerm.max, RATES[0]);
  const PAY_MAX = payment(Math.max(...prices), +rngDown.min / 100, +rngTerm.min, RATES[RATES.length - 1]);
  const qNeedle = $("#qNeedle");
  const quote = () => {
    if (!sel) return;
    const down = +rngDown.value / 100;
    const nMo = +rngTerm.value;
    const pay = payment(sel.price, down, nMo, RATES[$("#selBank").selectedIndex]);
    $("#vDown").textContent = Math.round(down * 100) + "% · " + money(sel.price * down);
    $("#vTerm").textContent = nMo + " m";
    $("#qNum").textContent = money(pay) + " /mes";
    const f = Math.max(0, Math.min(1, (pay - PAY_MIN) / (PAY_MAX - PAY_MIN)));
    qNeedle.style.transform = `rotate(${(-80 + f * 160).toFixed(1)}deg)`;
  };
  ["rngDown", "rngTerm"].forEach((id) => $("#" + id).addEventListener("input", quote));
  $("#selBank").addEventListener("change", quote);

  /* Reserve */
  const modal = $("#modalBg");
  let mLast = null;
  const closeModal = () => {
    modal.classList.remove("open");
    if (mLast) { mLast.focus(); mLast = null; }
  };
  $("#btnApart").addEventListener("click", () => {
    if (!sel) return;
    sel.reserved = true; reservedN++;
    const folio = "AP-" + String(4200 + reservedN);
    $("#mFolio").textContent = folio;
    mLast = document.activeElement;
    modal.classList.add("open");
    $("#mClose").focus();
    push("ok", `<b>${sel.id}</b> ${t().reserved} <b>${folio}</b>`);
    sel = null;
    $("#qBody").hidden = true;
    $("#qCar").textContent = t().qPick;
    render();
  });
  modal.addEventListener("click", (e) => {
    if (e.target.id === "mClose" || e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

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
    $("#kStock").textContent = CARS.filter((c) => !c.reserved).length;
    $("#kQuotes").textContent = quotes;
    $("#kApart").textContent = reservedN;
    $("#kConv").textContent = quotes ? Math.round(reservedN / quotes * 100) + "%" : "—";
  };

  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    if (!sel) $("#qCar").textContent = t().qPick;
    render();
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  applyLang();
})();
