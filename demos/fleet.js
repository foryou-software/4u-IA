/* ============================================================
   4UFleet — full interactive demo
   Real MapLibre map of México (32 states GeoJSON bundled),
   animated units on real corridors, a live geofence and a
   control-tower event feed. All data simulated client-side.
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
  };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () =>
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  /* ---------- i18n ---------- */
  const T = {
    es: {
      nav: "← Ficha del sistema", sub: "TORRE DE CONTROL · MÉXICO",
      pause: "Pausar", play: "Reanudar", follow: "Seguir", speed: "Velocidad",
      kUnits: "UNIDADES EN VIVO", kSpeed: "VEL. PROMEDIO", kFix: "EDAD DEL FIX", kAlerts: "ALERTAS HOY",
      feedT: "EVENTOS EN VIVO", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      offline: "El mapa requiere conexión a internet (tiles de MapLibre). Los datos simulados siguen corriendo a la derecha.",
      geoIn: "entró a geocerca", geoOut: "salió de geocerca", speeding: "exceso de velocidad",
      resumed: "reanudó marcha", stopped: "parada no programada", unit: "Unidad", driver: "Operador", route: "Ruta", spd: "Velocidad",
      eta: "ETA", aFollow: "Seguir", aMsg: "Mensaje", aInc: "Incidente", msgSent: "mensaje enviado al operador", incident: "incidente reportado por torre"
    },
    en: {
      nav: "← System overview", sub: "CONTROL TOWER · MEXICO",
      pause: "Pause", play: "Resume", follow: "Follow", speed: "Speed",
      kUnits: "UNITS LIVE", kSpeed: "AVG SPEED", kFix: "FIX AGE", kAlerts: "ALERTS TODAY",
      feedT: "LIVE EVENTS", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      offline: "The map needs an internet connection (MapLibre tiles). The simulated data keeps running on the right.",
      geoIn: "entered geofence", geoOut: "left geofence", speeding: "speeding",
      resumed: "resumed trip", stopped: "unscheduled stop", unit: "Unit", driver: "Driver", route: "Route", spd: "Speed",
      eta: "ETA", aFollow: "Follow", aMsg: "Message", aInc: "Incident", msgSent: "message sent to driver", incident: "incident flagged by tower"
    }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const icoPause = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5.5v13M15 5.5v13"/></svg>`;
  const icoPlay = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>`;
  const applyLang = () => {
    const t = T[lang];
    document.querySelectorAll("[data-t]").forEach((el) => {
      if (t[el.dataset.t]) el.textContent = t[el.dataset.t];
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

  /* ---------- Fleet data: corridors between real cities ---------- */
  const CITIES = {
    MTY: [-100.316, 25.686], SAL: [-100.999, 25.423], CDMX: [-99.133, 19.432],
    QRO: [-100.389, 20.588], GDL: [-103.349, 20.659], LEO: [-101.686, 21.121],
    PUE: [-98.206, 19.041], VER: [-96.134, 19.173], MID: [-89.617, 20.967],
    CUN: [-86.851, 21.161], HMO: [-110.955, 29.072], OBR: [-109.93, 27.486],
    TRC: [-103.406, 25.542], DGO: [-104.653, 24.027], SLP: [-100.985, 22.156]
  };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const mid = (a, b, k) => [(a[0] + b[0]) / 2 + k, (a[1] + b[1]) / 2 + k * 0.6];
  const corridor = (a, b, bend = 0.35) => [a, mid(a, b, bend), b];

  const FLEET = [
    { id: "U-101", driver: "R. Castañeda", from: "MTY", to: "SAL", bend: 0.1 },
    { id: "U-102", driver: "L. Ibarra",    from: "CDMX", to: "QRO", bend: 0.25 },
    { id: "U-103", driver: "M. Robles",    from: "GDL", to: "LEO", bend: -0.3 },
    { id: "U-104", driver: "A. Zúñiga",    from: "QRO", to: "SLP", bend: 0.2 },
    { id: "U-105", driver: "P. Fuentes",   from: "PUE", to: "CDMX", bend: -0.15 },
    { id: "U-106", driver: "S. Treviño",   from: "VER", to: "PUE", bend: 0.3 },
    { id: "U-107", driver: "K. Navarro",   from: "MID", to: "CUN", bend: 0.18 },
    { id: "U-108", driver: "D. Escamilla", from: "HMO", to: "OBR", bend: -0.25 },
    { id: "U-109", driver: "J. Perales",   from: "TRC", to: "DGO", bend: 0.22 },
  ];
  // Geofence: circle around Querétaro
  const GEO = { center: CITIES.QRO, r: 0.42, name: "QRO Hub" };
  const inGeo = (p) => Math.hypot(p[0] - GEO.center[0], p[1] - GEO.center[1]) < GEO.r;
  const circleGeoJSON = (c, r, n = 48) => ({
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[...Array(n + 1)].map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.92];
    })] }
  });

  /* ---------- Simulation state ---------- */
  let running = true, simSpeed = 1, alerts = 0;
  const units = FLEET.map((f, i) => ({
    ...f,
    path: corridor(CITIES[f.from], CITIES[f.to], f.bend),
    t: (i * 0.13) % 1, dir: 1,
    kmh: 78 + Math.round(Math.random() * 24),
    wasIn: false, marker: null, el: null
  }));
  const posAt = (u, t) => {
    // quadratic bezier across the corridor
    const [a, m, b] = u.path;
    const p1 = lerp(a, m, t), p2 = lerp(m, b, t);
    return lerp(p1, p2, t);
  };

  /* ---------- Feed + KPIs ---------- */
  const feed = $("#feed");
  const pushFeed = (cls, unitId, keyOrText) => {
    const t = T[lang];
    const item = document.createElement("div");
    item.className = `feed-item ${cls}`;
    const now = new Date();
    item.innerHTML = `<time>${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}</time>` +
      `<span><b>${unitId}</b> ${t[keyOrText] || keyOrText}</span>`;
    feed.prepend(item);
    while (feed.children.length > 9) feed.lastChild.remove();
  };
  const kSpeedEl = $("#kSpeed"), kUnitsEl = $("#kUnits"), kAlertsEl = $("#kAlerts"), kFixEl = $("#kFix");
  const refreshKpis = () => {
    kUnitsEl.textContent = units.length;
    const avg = Math.round(units.reduce((s, u) => s + u.kmh, 0) / units.length);
    kSpeedEl.innerHTML = `${avg}<i style="font-size:.7rem"> km/h</i>`;
    kAlertsEl.textContent = alerts;
  };
  window.fyLoop(() => {
    kFixEl.innerHTML = `${(0.4 + Math.random() * 0.5).toFixed(1)}<i style="font-size:.7rem"> s</i>`;
  }, { el: kFixEl, interval: 900 });

  /* ---------- Map ---------- */
  const hasMap = typeof maplibregl !== "undefined";
  let map = null;
  if (!hasMap) {
    $("#mapFallback").hidden = false;
  } else {
    map = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: { osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors"
        } },
        layers: [{ id: "osm", type: "raster", source: "osm" }]
      },
      center: [-100.2, 21.9],
      zoom: 5.1,
      minZoom: 4,
      attributionControl: { compact: true }
    });
    // Fallback only if the map never becomes ready (MapLibre fires non-fatal errors freely)
    const failT = setTimeout(() => { $("#mapFallback").hidden = false; }, 9000);
    map.once("load", () => { clearTimeout(failT); $("#mapFallback").hidden = true; });   // tiles down → honest fallback
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    map.on("load", async () => {
      // States of México: bundled GeoJSON, styled to the brand
      try {
        const mx = await (await fetch("../assets/mx.json")).json();
        map.addSource("mx", { type: "geojson", data: mx });
        map.addLayer({ id: "mx-fill", type: "fill", source: "mx",
          paint: { "fill-color": "#1F5CB0", "fill-opacity": 0.05 } });
        map.addLayer({ id: "mx-line", type: "line", source: "mx",
          paint: { "line-color": "#1F5CB0", "line-opacity": 0.55, "line-width": 1.2 } });
        map.on("click", "mx-fill", (e) => {
          const name = e.features[0]?.properties?.name;
          if (name) new maplibregl.Popup({ closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(`<p class="pop-t">${name}</p><p class="pop-m">Estado · México</p>`)
            .addTo(map);
        });
      } catch (_) { /* states layer is a bonus; units still run */ }

      // Geofence
      map.addSource("geo", { type: "geojson", data: circleGeoJSON(GEO.center, GEO.r) });
      map.addLayer({ id: "geo-fill", type: "fill", source: "geo",
        paint: { "fill-color": "#34C08B", "fill-opacity": 0.08 } });
      map.addLayer({ id: "geo-line", type: "line", source: "geo",
        paint: { "line-color": "#34C08B", "line-opacity": 0.6, "line-width": 1.5, "line-dasharray": [2, 2] } });

      // Corridors as faint lines
      map.addSource("routes", { type: "geojson", data: {
        type: "FeatureCollection",
        features: units.map((u) => ({ type: "Feature", geometry: {
          type: "LineString",
          coordinates: [...Array(24)].map((_, i) => posAt(u, i / 23))
        } }))
      } });
      map.addLayer({ id: "routes", type: "line", source: "routes",
        paint: { "line-color": "#6FA3E8", "line-opacity": 0.35, "line-width": 1.4, "line-dasharray": [1, 2] } });

      // Unit markers
      units.forEach((u) => {
        const el = document.createElement("div");
        el.className = "veh-marker";
        el.title = u.id;
        u.el = el;
        u.marker = new maplibregl.Marker({ element: el }).setLngLat(posAt(u, u.t)).addTo(map);
        // Hover card with live data + quick actions
        let pop = null;
        const openPop = () => {
          const t = T[lang];
          if (pop) pop.remove();
          pop = new maplibregl.Popup({ closeButton: false, offset: 14, closeOnClick: false })
            .setLngLat(u.marker.getLngLat())
            .setHTML(
              `<p class="pop-t">${u.id} · ${u.from} → ${u.to}</p>` +
              `<p class="pop-m">${t.driver}: <b>${u.driver}</b></p>` +
              `<p class="pop-m">${t.spd}: <b>${u.kmh} km/h</b> · ${t.eta}: <b>${Math.ceil((1 - u.t) * 42 + 8)} min</b></p>` +
              `<p class="pop-acts">` +
              `<button class="ctl" data-act="follow" data-id="${u.id}">◎ ${t.aFollow}</button>` +
              `<button class="ctl" data-act="msg" data-id="${u.id}"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/></svg> ${t.aMsg}</button>` +
              `<button class="ctl danger" data-act="inc" data-id="${u.id}">⚑ ${t.aInc}</button>` +
              `</p>`
            ).addTo(map);
        };
        let closeT = null;
        const scheduleClose = () => { closeT = setTimeout(() => pop && pop.remove(), 1400); };
        el.addEventListener("mouseenter", () => {
          clearTimeout(closeT);
          openPop();
          const pe = pop.getElement();
          pe.addEventListener("mouseenter", () => clearTimeout(closeT));
          pe.addEventListener("mouseleave", scheduleClose);
        });
        el.addEventListener("mouseleave", scheduleClose);
        el.addEventListener("click", (ev) => { ev.stopPropagation(); clearTimeout(closeT); openPop(); });
      });
    });
  }

  let userDragging = false;
  if (map) {
    map.on("dragstart", () => { userDragging = true; sel.value = ""; });
    map.on("dragend", () => { userDragging = false; });
  }

  /* ---------- Follow select ---------- */
  const sel = $("#selFollow");
  units.forEach((u) => {
    const o = document.createElement("option");
    o.value = u.id; o.textContent = u.id;
    sel.appendChild(o);
  });

  /* ---------- Controls ---------- */
  $("#btnPlay").addEventListener("click", () => {
    running = !running;
    $("#btnPlay").classList.toggle("on", running);
    applyLang();
  });
  $("#rngSpeed").addEventListener("input", (e) => { simSpeed = parseFloat(e.target.value); });
  sel.addEventListener("change", () => {
    if (!sel.value || !map) return;
    const u = units.find((x) => x.id === sel.value);
    if (u) map.flyTo({ center: posAt(u, u.t), zoom: 7.5, duration: 500 });
  });

  /* ---------- Main loop ---------- */
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000) * (running ? simSpeed : 0);
    last = now;
    units.forEach((u) => {
      u.t += dt * 0.02 * u.dir * (u.kmh / 85);
      if (u.t >= 1 || u.t <= 0) { u.dir *= -1; u.t = Math.max(0, Math.min(1, u.t)); }
      const p = posAt(u, u.t);
      if (u.marker) u.marker.setLngLat(p);

      // Geofence events
      const nowIn = inGeo(p);
      if (nowIn !== u.wasIn) {
        pushFeed(nowIn ? "ok" : "warn", u.id, nowIn ? "geoIn" : "geoOut");
        if (u.el) {
          u.el.classList.toggle("geofenced", nowIn);
          if (nowIn) {
            u.el.classList.remove("geo-ping");
            void u.el.offsetWidth;
            u.el.classList.add("geo-ping");
            setTimeout(() => { if (u.el) u.el.classList.remove("geo-ping"); }, 1400);
          }
        }
        if (nowIn) { alerts++; refreshKpis(); }
        u.wasIn = nowIn;
      }
    });
    if (sel.value && map && !userDragging) {
      const u = units.find((x) => x.id === sel.value);
      if (u) map.setCenter(posAt(u, u.t));
    }
  };

  /* ---------- Random operational events ---------- */
  window.fyLoop(() => {
    if (!running) return;
    const u = units[Math.floor(Math.random() * units.length)];
    const roll = Math.random();
    if (roll < 0.3) { u.kmh = 96 + Math.round(Math.random() * 14); pushFeed("bad", u.id, "speeding"); alerts++; }
    else if (roll < 0.5) { u.kmh = 0; pushFeed("warn", u.id, "stopped"); }
    else { u.kmh = 78 + Math.round(Math.random() * 24); pushFeed("ok", u.id, "resumed"); }
    refreshKpis();
  }, { el: document.getElementById("map") || document.body, interval: 4200 });

  // Popup quick actions (delegated: popups are re-created per hover)
  document.addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    const u = units.find((x) => x.id === e.target.dataset.id);
    if (!u) return;
    if (act === "follow") { sel.value = u.id; sel.dispatchEvent(new Event("change")); }
    if (act === "msg") pushFeed("ok", u.id, "msgSent");
    if (act === "inc") { alerts++; refreshKpis(); u.el.classList.add("alerting"); pushFeed("bad", u.id, "incident"); setTimeout(() => u.el.classList.remove("alerting"), 4000); }
  });

  applyLang();
  refreshKpis();
  pushFeed("ok", "U-104", "geoIn");
  /* reduced-motion: una sola pasada posiciona las unidades en su ruta, sin loop.
     Al reanudar (pestaña/viewport), el reloj se resetea: nada de dt gigantes ni saltos. */
  window.fyLoop(tick, {
    el: document.getElementById("map") || document.body, raf: true, reduced: "once",
    onstate: (run) => { if (run) last = performance.now(); },
  });
})();
