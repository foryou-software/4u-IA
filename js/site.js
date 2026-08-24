(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nav = $("#nav");
  const onScrollNav = () => nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  const menuBtn = $("#menuBtn");
  const panel = $("#mobilePanel");
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        panel.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  const rvIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting));
  }, { threshold: 0.12 });
  $$(".rv").forEach((el) => rvIO.observe(el));

  const counters = $$("[data-count]");
  if (counters.length) {
    const seen = new WeakSet();
    const cIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || seen.has(en.target)) return;
        seen.add(en.target);
        const el = en.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        if (reduced) { el.textContent = target + suffix; return; }
        const t0 = performance.now();
        const dur = 900;
        const step = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cIO.observe(el));
  }

  const ticker = $("#tickerTrack");
  if (ticker) ticker.innerHTML += ticker.innerHTML;

  if (matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", (e) => {
      const s = e.target.closest(".spot");
      if (!s) return;
      const r = s.getBoundingClientRect();
      s.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      s.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    }, { passive: true });
  }

  const emblem = $("#emblem");
  const emblemCore = $("#emblemCore");
  if (emblem && !reduced && matchMedia("(pointer: fine)").matches) {
    const MAX = 12;
    emblem.addEventListener("pointerenter", () => emblem.classList.add("hover"));
    emblem.addEventListener("pointermove", (e) => {
      const r = emblem.getBoundingClientRect();
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAX;
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -2 * MAX;
      emblemCore.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      emblemCore.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    });
    emblem.addEventListener("pointerleave", () => {
      emblem.classList.remove("hover");
      emblemCore.style.setProperty("--rx", "0deg");
      emblemCore.style.setProperty("--ry", "0deg");
    });
  }

  const heroGrid = $(".hero-grid");
  if (heroGrid && !reduced) {
    let raf = 0;
    const recede = () => {
      raf = 0;
      const y = scrollY;
      heroGrid.style.setProperty("--hero-shift", Math.min(y * 0.12, 90).toFixed(1) + "px");
      heroGrid.style.setProperty("--hero-fade", Math.max(1 - y / 700, 0).toFixed(3));
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(recede); }, { passive: true });
  }

  const SCRIPTS = {
    deploy: [
      { t: "$ fouryou deploy --prod", c: "cmd" },
      { t: "› affected: 3 of 15 apps", c: "dim" },
      { t: "✓ build 12.4s · cache 87%", c: "ok" },
      { t: "✓ 348 tests · coverage 94%", c: "ok" },
      { t: "✓ e2e · playwright 96/96", c: "ok" },
      { t: "✓ security scan · 0 findings", c: "ok" },
      { t: "▲ deployed · 42 ms · zero downtime", c: "cmd" }
    ],
    legacy: [
      { t: "$ fouryou analyze ./legacy-erp", c: "cmd" },
      { t: "› language: VB.NET · 214k LOC", c: "dim" },
      { t: "✓ dependency map built", c: "ok" },
      { t: "✓ 37 modules documented", c: "ok" },
      { t: "✓ risk hotspots: 4 flagged", c: "ok" },
      { t: "✓ test harness generated", c: "ok" },
      { t: "▲ modernization plan ready", c: "cmd" }
    ]
  };

  const conBody = $("#conBody");
  const heroOps = $("#heroOps");
  const consoleEl = $("#console");
  let pulseTimer = 0;
  const firePulse = () => {
    if (reduced || !heroOps) return;
    clearTimeout(pulseTimer);
    heroOps.classList.remove("fy-pulse");
    if (emblem) emblem.classList.remove("pulse");
    void heroOps.offsetWidth;
    heroOps.classList.add("fy-pulse");
    if (emblem) emblem.classList.add("pulse");
    pulseTimer = setTimeout(() => {
      heroOps.classList.remove("fy-pulse");
      if (emblem) emblem.classList.remove("pulse");
    }, 1500);
  };

  if (conBody) {
    let active = "deploy";
    let session = 0;
    const rng = mulberry32(215);

    const renderStatic = () => {
      conBody.innerHTML = "";
      SCRIPTS[active].forEach((l) => {
        const s = document.createElement("span");
        s.className = "cl " + l.c;
        s.textContent = l.t;
        conBody.appendChild(s);
      });
    };

    const M = { line: 0, char: 0, waitUntil: 0, lineEl: null, done: false };
    const resetMachine = () => {
      M.line = 0; M.char = 0; M.waitUntil = 0; M.lineEl = null; M.done = false;
      conBody.innerHTML = "";
      const caret = document.createElement("span");
      caret.className = "caret";
      conBody.appendChild(caret);
    };

    const tick = () => {
      const now = performance.now();
      if (now < M.waitUntil) return;
      const script = SCRIPTS[active];
      if (M.done) {
        resetMachine();
        return;
      }
      const caret = conBody.querySelector(".caret");
      if (M.line >= script.length) {
        M.done = true;
        M.waitUntil = now + 5200;
        return;
      }
      const L = script[M.line];
      if (!M.lineEl) {
        M.lineEl = document.createElement("span");
        M.lineEl.className = "cl " + L.c;
        conBody.insertBefore(M.lineEl, caret);
      }
      M.lineEl.textContent = L.t.slice(0, ++M.char);
      if (M.char >= L.t.length) {
        if (L.t.startsWith("▲")) firePulse();
        M.line++; M.char = 0; M.lineEl = null;
        M.waitUntil = now + (M.line === 1 ? 500 : 260);
      } else {
        M.waitUntil = now + 16 + rng() * 26;
      }
    };

    if (reduced) {
      renderStatic();
    } else {
      resetMachine();
      fyLoop(tick, { el: consoleEl, interval: 24, reduced: "off" });
    }

    $$("[data-contab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.contab === active) return;
        active = btn.dataset.contab;
        session++;
        $$("[data-contab]").forEach((b) => {
          const on = b.dataset.contab === active;
          b.classList.toggle("active", on);
          b.setAttribute("aria-selected", String(on));
        });
        if (reduced) renderStatic();
        else resetMachine();
      });
    });
  }

  const heatmap = $("#heatmap");
  if (heatmap) {
    const rng = mulberry32(20260824);
    for (let i = 0; i < 35; i++) {
      const cell = document.createElement("i");
      const v = Math.pow(rng(), 1.4);
      cell.style.setProperty("--v", v.toFixed(2));
      heatmap.appendChild(cell);
    }
  }

  const sbCache = $("#sbCache");
  const sbDeploy = $("#sbDeploy");
  if (sbCache && sbDeploy) {
    const rng = mulberry32(384);
    fyLoop(() => {
      sbCache.textContent = (86 + Math.round(rng() * 3)) + "%";
      sbDeploy.textContent = (38 + Math.round(rng() * 8)) + " ms";
    }, { el: $("#statusboard"), interval: 2400, reduced: "once", onceTick: () => {} });
  }

  const mobileCta = $("#mobileCta");
  const hero = $("#hero");
  const contact = $("#contacto");
  if (mobileCta && hero && contact) {
    let heroOut = false, contactIn = false;
    const update = () => mobileCta.classList.toggle("show", heroOut && !contactIn);
    new IntersectionObserver((es) => { es.forEach((e) => { heroOut = !e.isIntersecting; }); update(); }, { threshold: 0.05 }).observe(hero);
    new IntersectionObserver((es) => { es.forEach((e) => { contactIn = e.isIntersecting; }); update(); }, { threshold: 0.15 }).observe(contact);
  }

  const form = $("#contactForm");
  if (form) {
    const err = $("#formErr");
    const SUBJ = {
      es: "Contacto desde fouryou.ai",
      en: "Contact from fouryou.ai",
      pt: "Contato via fouryou.ai"
    };
    const BODY = {
      es: (d) => `Nombre: ${d.name}\nEmpresa: ${d.company}\nCorreo: ${d.email}\n\n${d.detail}`,
      en: (d) => `Name: ${d.name}\nCompany: ${d.company}\nEmail: ${d.email}\n\n${d.detail}`,
      pt: (d) => `Nome: ${d.name}\nEmpresa: ${d.company}\nE-mail: ${d.email}\n\n${d.detail}`
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {};
      let bad = false;
      ["name", "company", "email", "detail"].forEach((n) => {
        const input = form.elements[n];
        const v = input.value.trim();
        const invalid = !v || (n === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
        input.closest(".field").classList.toggle("invalid", invalid);
        if (invalid) bad = true;
        data[n] = v;
      });
      err.hidden = !bad;
      if (bad) return;
      const lang = window.FY_LANG || "es";
      const url = `mailto:eddy.penaloza@fouryou.io?subject=${encodeURIComponent(SUBJ[lang])}&body=${encodeURIComponent(BODY[lang](data))}`;
      location.href = url;
    });
  }
})();
