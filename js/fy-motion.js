/* FOURYOU — fy-motion.js
   Gobernanza única de loops: viewport (IntersectionObserver) + document.hidden
   + prefers-reduced-motion. Todo loop del sitio (JS o CSS) pasa por aquí. */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loops = new Set();

  const evalLoop = (L) => {
    const should = !document.hidden && L.inView && (L.reducedMode === "run" || !reduced);
    if (should === L.running) return;
    L.running = should;
    if (should) {
      if (L.interval) L.timer = setInterval(L.tick, L.interval);
      else if (L.raf) {
        const step = () => {
          if (!L.running) return;
          L.tick();
          L.rafId = requestAnimationFrame(step);
        };
        L.rafId = requestAnimationFrame(step);
      }
      if (L.onstate) L.onstate(true);
    } else {
      clearInterval(L.timer);
      cancelAnimationFrame(L.rafId);
      if (L.onstate) L.onstate(false);
    }
  };

  /* fyLoop(tick, opts) → { stop() }
     opts.el        elemento observado; sin él, el loop solo depende de document.hidden
     opts.interval  ms → setInterval | opts.raf: true → requestAnimationFrame
     opts.reduced   "off" (default) | "once" (un render estático) | "run" (es dato, sigue)
     opts.onceTick  render estático alternativo para reduced "once"
     opts.onstate   hook (running) — p. ej. play()/pause(); tick puede ser null */
  window.fyLoop = (tick, opts = {}) => {
    const mode = opts.reduced || "off";
    if (reduced && mode === "once") {
      (opts.onceTick || tick)();
      return { stop() {} };
    }
    const L = {
      tick, interval: opts.interval || 0, raf: !!opts.raf, reducedMode: mode,
      inView: !opts.el, running: false, timer: 0, rafId: 0, onstate: opts.onstate,
    };
    loops.add(L);
    if (opts.el) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => { L.inView = e.isIntersecting; evalLoop(L); });
      }, { threshold: 0.05 }).observe(opts.el);
    } else {
      evalLoop(L);
    }
    return { stop() { L.inView = false; evalLoop(L); loops.delete(L); } };
  };

  document.addEventListener("visibilitychange", () => loops.forEach(evalLoop));

  /* Loops CSS (micro-UIs del bento, stage de fichas, consola): pausa por clase */
  const pausables = document.querySelectorAll("[data-fy-pause], .bcard .preview, #stage, .console");
  if (pausables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("fy-paused", !e.isIntersecting));
    }, { threshold: 0.05 });
    pausables.forEach((el) => io.observe(el));
    document.addEventListener("visibilitychange", () => {
      pausables.forEach((el) => el.classList.toggle("fy-hidden", document.hidden));
    });
  }
})();
