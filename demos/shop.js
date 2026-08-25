/* 4UShop — functional POS: inventory, ticket, cash payment, offline-first sync, shift cut. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "PUNTO DE VENTA · CAJA 01",
      scan: "Escanear", online: "Con red", offline: "SIN RED", cut: "Corte de caja",
      prodT: "PRODUCTOS · CLIC PARA AGREGAR", tkT: "TICKET EN CURSO", tSub: "Subtotal", tTot: "Total",
      pay: "Cobrar", kSales: "VENTAS DEL TURNO", kItems: "PIEZAS", kAvg: "TICKET PROMEDIO", kPend: "PENDIENTES DE SYNC",
      feedT: "ACTIVIDAD", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      mPay: "Cobro en efectivo", mTot: "Total", mCash: "Efectivo recibido", mChange: "Cambio",
      mConfirm: "Confirmar venta", mBack: "Volver", stock: "EXIST", out: "AGOTADO", all: "Todo", print: "Imprimir último ticket", dlvT: "PEDIDOS A DOMICILIO",
      dSt: ["Recibido", "Preparando", "En camino", "Entregado"], dNew: "nuevo pedido desde la app", dDone: "entregado",
      via: ["App móvil", "WhatsApp", "Teléfono"],
      sold: "venta", pend: "pendiente de sync (sin red)", synced: "sincronizada al servidor",
      wentOff: "⚠ Conexión perdida — la caja sigue vendiendo", wentOn: "Conexión restablecida — sincronizando",
      cutT: "Corte: ", cutN: " ventas · ", insufficient: "Efectivo insuficiente" },
    en: { nav: "← System overview", sub: "POINT OF SALE · REGISTER 01",
      scan: "Scan", online: "Online", offline: "OFFLINE", cut: "Shift cut",
      prodT: "PRODUCTS · CLICK TO ADD", tkT: "CURRENT TICKET", tSub: "Subtotal", tTot: "Total",
      pay: "Charge", kSales: "SHIFT SALES", kItems: "ITEMS", kAvg: "AVG TICKET", kPend: "PENDING SYNC",
      feedT: "ACTIVITY", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      mPay: "Cash payment", mTot: "Total", mCash: "Cash received", mChange: "Change",
      mConfirm: "Confirm sale", mBack: "Back", stock: "STOCK", out: "SOLD OUT", all: "All", print: "Print last receipt", dlvT: "DELIVERY ORDERS",
      dSt: ["Received", "Preparing", "On the way", "Delivered"], dNew: "new order from the app", dDone: "delivered",
      via: ["Mobile app", "WhatsApp", "Phone"],
      sold: "sale", pend: "pending sync (offline)", synced: "synced to server",
      wentOff: "⚠ Connection lost — register keeps selling", wentOn: "Back online — syncing",
      cutT: "Cut: ", cutN: " sales · ", insufficient: "Not enough cash" }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];
  const applyLang = () => {
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    netBtn();
    renderProducts();
    if (typeof renderDlv === "function") try { renderDlv(); } catch (_) {}
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  /* ---------- Catalog & inventory ---------- */
  const CAT = [
    ["7501001", "Agua 1L", 14], ["7501002", "Café molido 500g", 129], ["7501003", "Leche entera 1L", 26],
    ["7501004", "Pan de caja", 44], ["7501005", "Huevo 12pz", 48], ["7501006", "Arroz 1kg", 32],
    ["7501007", "Aceite 900ml", 52], ["7501008", "Jabón de barra", 18], ["7501009", "Papel higiénico 4r", 39],
    ["7501010", "Refresco 600ml", 19], ["7501011", "Galletas surtidas", 27], ["7501012", "Detergente 1kg", 61]
  ].map(([sku, name, price], i) => ({
    sku, name, price,
    cat: ["Abarrotes", "Bebidas", "Limpieza"][i % 3],
    stock: 8 + ((i * 7) % 9)
  }));
  let catFilter = "", q = "";

  const grid = $("#prodGrid");
  const renderProducts = () => {
    grid.innerHTML = CAT
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => (!catFilter || p.cat === catFilter) && (!q || p.name.toLowerCase().includes(q)))
      .map(({ p, i }) => `
      <button class="prod ${p.stock <= 0 ? "out" : ""}" data-i="${i}" type="button">
        <span class="pv">${p.name[0]}</span>
        <span>
          <b>${p.name}</b>
          <span class="mono">${money(p.price)}</span>
          <span class="stk mono">${p.stock > 0 ? t().stock + " " + p.stock : t().out}</span>
        </span>
      </button>`).join("");
    // category chips
    const cats = [...new Set(CAT.map((p) => p.cat))];
    document.getElementById("cats").innerHTML =
      [`<button class="ctl ${!catFilter ? "on" : ""}" data-cat="" type="button">${t().all}</button>`]
      .concat(cats.map((c) => `<button class="ctl ${catFilter === c ? "on" : ""}" data-cat="${c}" type="button">${c}</button>`))
      .join("");
  };
  document.getElementById("cats").addEventListener("click", (e) => {
    if (e.target.dataset.cat === undefined) return;
    catFilter = e.target.dataset.cat;
    renderProducts();
  });
  document.getElementById("q").addEventListener("input", (e) => {
    q = e.target.value.trim().toLowerCase();
    renderProducts();
  });
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".prod");
    if (b) addToTicket(CAT[+b.dataset.i]);
  });
  /* Scan: laser sweep over the grid, then the hit tile flies into the ticket */
  let scanning = false;
  const flyToTicket = (tile, p) => {
    const from = tile.getBoundingClientRect();
    const to = tkEl.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "fly";
    fly.innerHTML = `<span class="pv">${p.name[0]}</span><b>${p.name}</b>`;
    fly.style.left = from.left + "px";
    fly.style.top = from.top + "px";
    document.body.appendChild(fly);
    void fly.offsetWidth;
    fly.style.transform = `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${to.top + 14 - from.top}px) scale(0.4)`;
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      fly.remove();
      addToTicket(p);
      scanning = false;
    };
    fly.addEventListener("transitionend", land, { once: true });
    setTimeout(land, 450);
  };
  $("#btnScan").addEventListener("click", () => {
    if (scanning) return;
    const avail = CAT.filter((p) => p.stock > 0);
    if (!avail.length) return;
    const p = avail[Math.floor(Math.random() * avail.length)];
    if (reduced) { addToTicket(p); return; }
    scanning = true;
    const laser = document.createElement("div");
    laser.className = "laser";
    grid.appendChild(laser);
    setTimeout(() => {
      laser.remove();
      const tile = grid.querySelector(`.prod[data-i="${CAT.indexOf(p)}"]`);
      if (!tile) { addToTicket(p); scanning = false; return; }
      tile.classList.add("scan-hit");
      flyToTicket(tile, p);
    }, 500);
  });

  /* ---------- Ticket ---------- */
  let ticket = [];   // {sku, name, price, q}
  const tkEl = $("#tkLines");
  const addToTicket = (p) => {
    if (p.stock <= 0) return;
    p.stock--;
    const line = ticket.find((l) => l.sku === p.sku);
    if (line) line.q++; else ticket.push({ sku: p.sku, name: p.name, price: p.price, q: 1 });
    renderTicket(); renderProducts();
  };
  const changeQty = (sku, d) => {
    const line = ticket.find((l) => l.sku === sku);
    const prod = CAT.find((p) => p.sku === sku);
    if (!line) return;
    if (d > 0 && prod.stock <= 0) return;
    line.q += d; prod.stock -= d;
    if (line.q <= 0) ticket = ticket.filter((l) => l !== line);
    renderTicket(); renderProducts();
  };
  const tkTotal = () => ticket.reduce((s, l) => s + l.q * l.price, 0) * 1.16;
  const renderTicket = () => {
    tkEl.innerHTML = ticket.map((l) => `
      <div class="tk-line">
        <span>${l.name}</span>
        <span class="qty">
          <button data-q="-1" data-sku="${l.sku}" type="button">−</button>
          <b class="mono">${l.q}</b>
          <button data-q="1" data-sku="${l.sku}" type="button">+</button>
        </span>
        <b class="mono">${money(l.q * l.price)}</b>
      </div>`).join("");
    const sub = ticket.reduce((s, l) => s + l.q * l.price, 0);
    $("#tSub").textContent = money(sub);
    $("#tIva").textContent = money(sub * 0.16);
    $("#tTot").textContent = money(sub * 1.16);
  };
  tkEl.addEventListener("click", (e) => {
    if (e.target.dataset.q) changeQty(e.target.dataset.sku, +e.target.dataset.q);
  });

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
  let sales = [], pendingSync = [], lastSale = null;
  const kpis = () => {
    $("#kSales").textContent = sales.length;
    $("#kItems").textContent = sales.reduce((s, v) => s + v.items, 0);
    $("#kAvg").textContent = sales.length ? money(sales.reduce((s, v) => s + v.total, 0) / sales.length) : "$0";
    $("#kPend").textContent = pendingSync.length;
  };

  /* ---------- Offline-first ---------- */
  let online = true;
  const netBtn = () => {
    const b = $("#btnNet");
    b.classList.toggle("on", online);
    b.classList.toggle("danger", !online);
    b.innerHTML = online ? `● <span>${t().online}</span>` : `○ <span>${t().offline}</span>`;
  };
  $("#btnNet").addEventListener("click", () => {
    online = !online;
    netBtn();
    if (!online) push("warn", t().wentOff);
    else {
      push("ok", t().wentOn);
      // sync queue drains with visible cadence
      const drain = () => {
        if (!pendingSync.length || !online) return;
        const v = pendingSync.shift();
        push("ok", `<b>${v.id}</b> ${t().synced}`);
        kpis();
        setTimeout(drain, 450);
      };
      setTimeout(drain, 500);
    }
  });

  /* ---------- Payment ---------- */
  const modal = $("#modalBg");
  let mLast = null;
  const closePay = () => {
    modal.classList.remove("open");
    if (mLast) { mLast.focus(); mLast = null; }
  };
  $("#btnPay").addEventListener("click", () => {
    if (!ticket.length) return;
    $("#mTot").textContent = money(tkTotal());
    $("#mCash").value = "";
    $("#mCash").classList.remove("in-err");
    $("#mErr").hidden = true;
    $("#mChange").textContent = "$0.00";
    mLast = document.activeElement;
    modal.classList.add("open");
    $("#mCash").focus();
  });
  $("#mCash").addEventListener("input", () => {
    const cash = parseFloat($("#mCash").value) || 0;
    $("#mChange").textContent = money(Math.max(0, cash - tkTotal()));
    if (cash >= tkTotal()) {
      $("#mErr").hidden = true;
      $("#mCash").classList.remove("in-err");
    }
  });
  $("#mOk").addEventListener("click", () => {
    const total = tkTotal();
    const cash = parseFloat($("#mCash").value) || 0;
    if (cash < total) {
      push("bad", t().insufficient);
      $("#mErr").hidden = false;
      $("#mCash").classList.add("in-err");
      return;
    }
    const id = "V-" + String(1000 + sales.length + 1);
    const items = ticket.reduce((s, l) => s + l.q, 0);
    sales.push({ id, total, items });
    lastSale = { id, total, cash, lines: ticket.map((l) => ({ ...l })), when: new Date() };
    document.getElementById("btnPrint").disabled = false;
    if (online) push("ok", `<b>${id}</b> ${t().sold} · ${money(total)}`);
    else { pendingSync.push({ id }); push("warn", `<b>${id}</b> ${t().pend} · ${money(total)}`); }
    ticket = [];
    renderTicket(); kpis();
    closePay();
  });
  modal.addEventListener("click", (e) => {
    if (e.target.id === "mClose" || e.target === modal) closePay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closePay();
  });

  /* ---------- Shift cut ---------- */
  $("#btnCut").addEventListener("click", () => {
    const tot = sales.reduce((s, v) => s + v.total, 0);
    push("ok", `∑ ${t().cutT}<b>${money(tot)}</b> · ${sales.length}${t().cutN}${sales.reduce((s, v) => s + v.items, 0)} pzs`);
  });

  /* ---------- Print last receipt: real window.print with print CSS ---------- */
  document.getElementById("btnPrint").addEventListener("click", () => {
    if (!lastSale) return;
    const s = lastSale;
    const sub = s.total / 1.16;
    document.getElementById("printArea").innerHTML = `
      <h3>FOURYOU · 4UShop</h3>
      <p class="c">${s.id} · ${s.when.toLocaleString("es-MX")}<br>Caja 01 · demo conceptual</p>
      <table>
        ${s.lines.map((l) => `<tr><td>${l.q} × ${l.name}</td><td>${money(l.q * l.price)}</td></tr>`).join("")}
        <tr class="tot"><td>Subtotal</td><td>${money(sub)}</td></tr>
        <tr><td>IVA 16%</td><td>${money(sub * 0.16)}</td></tr>
        <tr class="tot"><td>TOTAL</td><td>${money(s.total)}</td></tr>
        <tr><td>Efectivo</td><td>${money(s.cash)}</td></tr>
        <tr><td>Cambio</td><td>${money(s.cash - s.total)}</td></tr>
      </table>
      <p class="c">¡Gracias por su compra!</p>`;
    window.print();
  });

  /* ---------- Delivery orders: status pipeline, no map needed ---------- */
  const DLV = [
    { id: "D-301", who: "Sra. Campos", via: 0, st: 1, total: 234 },
    { id: "D-302", who: "Don Beto", via: 1, st: 0, total: 158 },
    { id: "D-303", who: "Fam. Ríos", via: 0, st: 2, total: 412 }
  ];
  let dseq = 303;
  const renderDlv = () => {
    document.getElementById("dlv").innerHTML = DLV.filter((d) => d.st < 3).map((d) => `
      <div class="dlv-item" data-id="${d.id}">
        <span><b>${d.id} · ${d.who}</b><br><span class="mono">${t().via[d.via]} · ${money(d.total)} · ${t().dSt[d.st]}</span></span>
        <button class="adv" data-adv="${d.id}" type="button">${d.st < 2 ? "→ " + t().dSt[d.st + 1] : "✓ " + t().dSt[3]}</button>
        <span class="dlv-bar"><u style="--w:${((d.st + 1) / 4).toFixed(2)}"></u></span>
      </div>`).join("");
  };
  document.getElementById("dlv").addEventListener("click", (e) => {
    const id = e.target.dataset.adv;
    if (!id) return;
    const d = DLV.find((x) => x.id === id);
    d.st++;
    if (d.st >= 3) push("ok", `<b>${d.id}</b> ${t().dDone} · ${money(d.total)}`);
    renderDlv();
  });
  // new orders arrive on their own: the counter feels alive in front of the client
  window.fyLoop(() => {
    if (DLV.filter((d) => d.st < 3).length >= 4) return;
    dseq++;
    const names = ["Lupita M.", "Ing. Salas", "Cafetería La 8", "Sr. Ordaz"];
    const d = { id: "D-" + dseq, who: names[Math.floor(Math.random() * names.length)], via: Math.floor(Math.random() * 3), st: 0, total: Math.round(80 + Math.random() * 420) };
    DLV.push(d);
    push("warn", `<b>${d.id}</b> ${t().dNew} · ${money(d.total)}`);
    renderDlv();
  }, { el: document.querySelector(".app-main"), interval: 12000, reduced: "run" });
  renderDlv();

  applyLang();
  renderTicket();
  kpis();
})();
