(() => {
  "use strict";
  const root = document.documentElement;
  const KEY = "fy-theme";
  const apply = (t) => {
    root.dataset.theme = t;
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    });
  };
  const saved = (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })();
  apply(saved === "light" ? "light" : "dark");
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (err) {}
  });
})();
