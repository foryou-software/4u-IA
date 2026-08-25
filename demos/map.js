/* 4UMap — GIS platform: state layers, field assets, coverage, live measuring, territories. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "PLATAFORMA SIG · ACTIVOS EN CAMPO", measure: "Medir distancia",
      offline: "El mapa requiere conexión a internet.", layersT: "CAPAS",
      lyStates: "Estados de México", lyAssets: "Activos de campo", lyCover: "Cobertura de señal",
      kAssets: "ACTIVOS VISIBLES", kOnline: "EN LÍNEA", kDist: "ÚLTIMA MEDICIÓN", kAlerts: "SIN SEÑAL",
      feedT: "ACTIVIDAD", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      mOn: "clic en dos puntos del mapa para medir", mDone: "medición", layer: "capa", on: "activada", off: "desactivada",
      terr: "Territorio", tOn: "clic para trazar vértices · cierra en el primer punto", tDone: "territorio", tOff: "territorio descartado",
      types: { torre: "Torre", pozo: "Pozo", planta: "Planta", subest: "Subestación" }, state: "Estado · México", offAsset: "sin señal desde hace 3h" },
    en: { nav: "← System overview", sub: "GIS PLATFORM · FIELD ASSETS", measure: "Measure distance",
      offline: "The map needs an internet connection.", layersT: "LAYERS",
      lyStates: "Mexico states", lyAssets: "Field assets", lyCover: "Signal coverage",
      kAssets: "VISIBLE ASSETS", kOnline: "ONLINE", kDist: "LAST MEASURE", kAlerts: "NO SIGNAL",
      feedT: "ACTIVITY", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      mOn: "click two points on the map to measure", mDone: "measured", layer: "layer", on: "enabled", off: "disabled",
      terr: "Territory", tOn: "click to add vertices · close on the first vertex", tDone: "territory", tOff: "territory cleared",
      types: { torre: "Tower", pozo: "Well", planta: "Plant", subest: "Substation" }, state: "State · Mexico", offAsset: "no signal for 3h" }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];
  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
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

  /* Assets: torres/pozos/plantas con estado */
  const ASSETS = [
    ["A-01", "torre", -100.32, 25.7, 1], ["A-02", "torre", -99.6, 25.2, 1], ["A-03", "pozo", -102.3, 22.1, 1],
    ["A-04", "pozo", -101.7, 21.4, 0], ["A-05", "planta", -100.39, 20.6, 1], ["A-06", "planta", -103.35, 20.68, 1],
    ["A-07", "subest", -99.13, 19.44, 1], ["A-08", "subest", -98.2, 19.05, 0], ["A-09", "torre", -96.15, 19.2, 1],
    ["A-10", "pozo", -104.6, 24.0, 1], ["A-11", "torre", -110.9, 29.1, 1], ["A-12", "planta", -89.62, 20.98, 1]
  ].map(([id, type, lng, lat, ok]) => ({ id, type, lng, lat, ok }));

  const hasMap = typeof maplibregl !== "undefined";
  if (!hasMap) { $("#mapFallback").hidden = false; return; }
  const map = new maplibregl.Map({
    container: "map",
    style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
    center: [-100.8, 22.6], zoom: 4.7, minZoom: 4, attributionControl: { compact: true }
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
  // Fallback only if the map never becomes ready (MapLibre fires non-fatal errors freely)
    const failT = setTimeout(() => { $("#mapFallback").hidden = false; }, 9000);
    map.once("load", () => { clearTimeout(failT); $("#mapFallback").hidden = true; });

  // GL no lee variables CSS: un solo read del token al cargar
  const BRAND = getComputedStyle(document.documentElement).getPropertyValue("--brand-400").trim() || "#3F7BD1";
  const EMPTY_LINE = { type: "Feature", geometry: { type: "LineString", coordinates: [] } };
  const EMPTY_POLY = { type: "Feature", geometry: { type: "Polygon", coordinates: [] } };

  const markers = [];
  let popT = 0;
  map.on("load", async () => {
    try {
      const mx = await (await fetch("../assets/mx.json")).json();
      map.addSource("mx", { type: "geojson", data: mx });
      map.addLayer({ id: "mx-fill", type: "fill", source: "mx", paint: { "fill-color": "#1F5CB0", "fill-opacity": 0.05 } });
      map.addLayer({ id: "mx-line", type: "line", source: "mx", paint: { "line-color": "#1F5CB0", "line-opacity": 0.55, "line-width": 1.2 } });
      map.on("click", "mx-fill", (e) => {
        if (measuring || drawing || !layerOn.lyStates) return;
        const name = e.features[0]?.properties?.name;
        if (name) new maplibregl.Popup({ closeButton: false }).setLngLat(e.lngLat)
          .setHTML(`<p class="pop-t">${name}</p><p class="pop-m">${t().state}</p>`).addTo(map);
      });
    } catch (_) {}

    // coverage circles: siempre montadas, el toggle solo anima fill-opacity (sin teleport)
    const circle = (c, r, n = 40) => [...Array(n + 1)].map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.92];
    });
    map.addSource("cover", { type: "geojson", data: {
      type: "FeatureCollection",
      features: ASSETS.filter((a) => a.type === "torre").map((a) => ({
        type: "Feature", geometry: { type: "Polygon", coordinates: [circle([a.lng, a.lat], 0.9)] } }))
    } });
    map.addLayer({ id: "cover", type: "fill", source: "cover", paint: { "fill-color": "#34C08B", "fill-opacity": 0 } });

    // measuring + territory geometry lives in GL sources from the start
    map.addSource("mline", { type: "geojson", data: EMPTY_LINE });
    map.addLayer({ id: "mline", type: "line", source: "mline", paint: { "line-color": "#E2A649", "line-width": 2, "line-dasharray": [2, 2] } });
    map.addSource("terr-poly", { type: "geojson", data: EMPTY_POLY });
    map.addLayer({ id: "terr-fill", type: "fill", source: "terr-poly", paint: { "fill-color": BRAND, "fill-opacity": 0 } });
    map.addSource("terr-line", { type: "geojson", data: EMPTY_LINE });
    map.addLayer({ id: "terr-outline", type: "line", source: "terr-line", paint: { "line-color": BRAND, "line-width": 1.5 } });

    // asset markers — cierre del popup cancelable al re-entrar (mismo patrón que fleet)
    ASSETS.forEach((a) => {
      const el = document.createElement("div");
      el.className = "veh-marker" + (a.ok ? "" : " alerting");
      const mk = new maplibregl.Marker({ element: el }).setLngLat([a.lng, a.lat]).addTo(map);
      el.addEventListener("mouseenter", () => {
        clearTimeout(popT);
        if (window._fyPop) window._fyPop.remove();
        window._fyPop = new maplibregl.Popup({ closeButton: false, offset: 12 }).setLngLat([a.lng, a.lat])
          .setHTML(`<p class="pop-t">${a.id} · ${t().types[a.type]}</p><p class="pop-m">${a.ok ? "● online" : "○ " + t().offAsset}</p>`).addTo(map);
      });
      el.addEventListener("mouseleave", () => {
        clearTimeout(popT);
        popT = setTimeout(() => window._fyPop && window._fyPop.remove(), 900);
      });
      markers.push({ a, mk, el });
    });
    kpis();
  });

  const kpis = () => {
    $("#kAssets").textContent = ASSETS.length;
    $("#kOnline").textContent = ASSETS.filter((a) => a.ok).length;
    $("#kAlerts").textContent = ASSETS.filter((a) => !a.ok).length;
  };

  /* Layer switches: fades, never teleports (salida más rápida que la entrada) */
  const layerOn = { lyStates: true, lyAssets: true, lyCover: false };
  const glFade = (id, prop, val, on) => {
    if (!map.getLayer(id)) return;
    map.setPaintProperty(id, prop + "-transition", { duration: reduced ? 0 : on ? 250 : 150 });
    map.setPaintProperty(id, prop, val);
  };
  const wire = (id, apply) => {
    const b = $("#" + id);
    b.addEventListener("click", () => {
      const on = !b.classList.contains("on");
      b.classList.toggle("on", on);
      layerOn[id] = on;
      apply(on);
      push(on ? "ok" : "warn", `${t()[id]} · ${on ? t().on : t().off}`);
    });
  };
  wire("lyStates", (on) => { glFade("mx-fill", "fill-opacity", on ? 0.05 : 0, on); glFade("mx-line", "line-opacity", on ? 0.55 : 0, on); });
  wire("lyAssets", (on) => markers.forEach(({ el }) => el.classList.toggle("ly-off", !on)));
  wire("lyCover", (on) => glFade("cover", "fill-opacity", on ? 0.08 : 0, on));

  const km = (a, b) => {
    const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };
  const sqEl = (cls) => { const el = document.createElement("div"); el.className = cls; return el; };

  /* Medición viva: A queda marcado al primer clic; línea + chip siguen al cursor.
     Medir es DATO: bajo reduced-motion se comporta idéntico. */
  let measuring = false, ptA = null, mkA = null, midMk = null;
  const chip = document.createElement("div");
  chip.className = "measure-chip floating";
  chip.hidden = true;
  document.body.appendChild(chip);
  const setMLine = (a, b) => map.getSource("mline") &&
    map.getSource("mline").setData({ type: "Feature", geometry: { type: "LineString", coordinates: [[a.lng, a.lat], [b.lng, b.lat]] } });
  const clearMeasure = () => {
    chip.hidden = true;
    if (mkA) { mkA.remove(); mkA = null; }
    if (midMk) { midMk.remove(); midMk = null; }
    if (map.getSource("mline")) map.getSource("mline").setData(EMPTY_LINE);
  };
  const stopMeasure = () => {
    measuring = false; ptA = null; chip.hidden = true;
    $("#btnMeasure").classList.remove("on");
    map.getCanvas().style.cursor = "";
  };
  $("#btnMeasure").addEventListener("click", () => {
    if (drawing) cancelTerr();
    clearMeasure();
    measuring = true; ptA = null;
    $("#btnMeasure").classList.add("on");
    map.getCanvas().style.cursor = "crosshair";
    push("ok", t().mOn);
  });

  // rAF-throttle: guarda el último evento y procesa una vez por frame
  let mmEvt = null, mmQueued = false;
  const mmFrame = () => {
    mmQueued = false;
    if (!measuring || !ptA || !mmEvt) return;
    setMLine(ptA, mmEvt.lngLat);
    chip.textContent = km(ptA, mmEvt.lngLat).toFixed(1) + " km";
    chip.hidden = false;
    const oe = mmEvt.originalEvent;
    chip.style.transform = `translate(${oe.clientX + 14}px, ${oe.clientY + 12}px)`;
  };
  map.on("mousemove", (e) => {
    if (!measuring || !ptA) return;
    mmEvt = e;
    if (!mmQueued) { mmQueued = true; requestAnimationFrame(mmFrame); }
  });

  map.on("click", (e) => {
    if (drawing) { terrClick(e); return; }
    if (!measuring) return;
    if (!ptA) {
      ptA = e.lngLat;
      mkA = new maplibregl.Marker({ element: sqEl("measure-pt") }).setLngLat(ptA).addTo(map);
      return;
    }
    const d = km(ptA, e.lngLat).toFixed(1) + " km";
    setMLine(ptA, e.lngLat);
    const pin = sqEl("measure-chip");
    pin.textContent = d;
    midMk = new maplibregl.Marker({ element: pin })
      .setLngLat([(ptA.lng + e.lngLat.lng) / 2, (ptA.lat + e.lngLat.lat) / 2]).addTo(map);
    $("#kDist").textContent = d;
    push("ok", `⟋ ${t().mDone}: <b>${d}</b>`);
    stopMeasure();
  });

  /* Territorio: polígono a clics, área shoelace determinista en km².
     Un solo territorio a la vez; redibujar reemplaza. */
  let drawing = false, verts = [], vtxMks = [], areaMk = null;
  const setTerrLine = (coords) => map.getSource("terr-line") &&
    map.getSource("terr-line").setData({ type: "Feature", geometry: { type: "LineString", coordinates: coords } });
  const clearTerr = () => {
    verts = [];
    vtxMks.forEach((m) => m.remove());
    vtxMks = [];
    if (areaMk) { areaMk.remove(); areaMk = null; }
    setTerrLine([]);
    if (map.getLayer("terr-fill")) {
      map.setPaintProperty("terr-fill", "fill-opacity-transition", { duration: 0 });
      map.setPaintProperty("terr-fill", "fill-opacity", 0);
      map.getSource("terr-poly").setData(EMPTY_POLY);
    }
  };
  const exitTerrMode = () => {
    drawing = false;
    $("#btnTerr").classList.remove("on");
    map.getCanvas().style.cursor = "";
    map.doubleClickZoom.enable();
  };
  const cancelTerr = () => { clearTerr(); exitTerrMode(); };
  $("#btnTerr").addEventListener("click", () => {
    if (drawing) { cancelTerr(); push("warn", t().tOff); return; }
    if (measuring) { clearMeasure(); stopMeasure(); }
    clearTerr();
    drawing = true;
    $("#btnTerr").classList.add("on");
    map.getCanvas().style.cursor = "crosshair";
    map.doubleClickZoom.disable();
    push("ok", t().tOn);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (drawing) { cancelTerr(); push("warn", t().tOff); }
    else if (measuring) { clearMeasure(); stopMeasure(); }
  });
  const terrClick = (e) => {
    if (verts.length >= 3) {
      const p0 = map.project(verts[0]);
      if (Math.hypot(p0.x - e.point.x, p0.y - e.point.y) < 12) { closeTerr(); return; }
    }
    if (verts.length) {
      // el segundo clic de un doble clic no agrega un vértice duplicado
      const pl = map.project(verts[verts.length - 1]);
      if (Math.hypot(pl.x - e.point.x, pl.y - e.point.y) < 4) return;
    }
    verts.push([e.lngLat.lng, e.lngLat.lat]);
    vtxMks.push(new maplibregl.Marker({ element: sqEl("terr-vtx") }).setLngLat(verts[verts.length - 1]).addTo(map));
    setTerrLine(verts);
  };
  map.on("dblclick", (e) => {
    if (!drawing || verts.length < 3) return;
    e.preventDefault();
    closeTerr();
  });
  const closeTerr = () => {
    const ring = verts.concat([verts[0]]);
    setTerrLine(ring);
    if (map.getSource("terr-poly")) {
      map.getSource("terr-poly").setData({ type: "Feature", geometry: { type: "Polygon", coordinates: [ring] } });
      map.setPaintProperty("terr-fill", "fill-opacity-transition", { duration: reduced ? 0 : 300 });
      map.setPaintProperty("terr-fill", "fill-opacity", 0.12);
    }
    // shoelace en grados → km²: 1° ≈ 111.32 km, longitud corregida por cos(lat media)
    let s = 0, latSum = 0;
    for (let i = 0; i < verts.length; i++) {
      const [x1, y1] = verts[i], [x2, y2] = verts[(i + 1) % verts.length];
      s += x1 * y2 - x2 * y1;
      latSum += y1;
    }
    const midLat = latSum / verts.length;
    const area = Math.abs(s / 2) * 111.32 * 111.32 * Math.cos(midLat * Math.PI / 180);
    const label = area.toFixed(1) + " km²";
    const pin = sqEl("measure-chip");
    pin.textContent = label;
    areaMk = new maplibregl.Marker({ element: pin })
      .setLngLat([verts.reduce((a, v) => a + v[0], 0) / verts.length, midLat]).addTo(map);
    push("ok", `▰ ${t().tDone}: <b>${label}</b>`);
    exitTerrMode();
  };

  applyLang();
})();
