/* 4UTax — functional e-invoicing demo: build → validate → stamp → cancel. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* Theme + lang boilerplate */
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("fy-theme", t); themeBtn.setAttribute("aria-pressed", String(t === "light")); };
  setTheme(localStorage.getItem("fy-theme") || "dark");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const T = {
    es: { nav: "← Ficha del sistema", sub: "EMISIÓN Y TIMBRADO · CFDI", pac: "PAC-1 en línea",
      fTitle: "NUEVA FACTURA", tab0: "Órdenes de compra",
      ocId: "OC", ocProv: "PROVEEDOR", ocAmt: "MONTO", ocArea: "ETAPA ACTUAL",
      ocApr: "✓ Aprobar etapa", ocRej: "✕ Rechazar", ocInv: "Facturar esta OC →",
      areas: ["Solicitud", "Piso / Área", "Contaduría", "Dirección"],
      stPend: "EN FLUJO", stApr: "APROBADA", stRej: "RECHAZADA",
      ocApproved: "etapa aprobada", ocRejected: "OC rechazada", ocReady: "OC lista para facturar", ocBy: "por", tab1: "Emitir", tab2: "Comprobantes", tab3: "Reportes", qPh: "Buscar por UUID o RFC…", repD: "EMISIÓN POR DÍA · ÚLTIMOS 7", repR: "TOP RECEPTORES DEL MES", xml: "XML", fRfc: "RFC receptor", fUso: "Uso CFDI", fAdd: "Agregar concepto",
      tSub: "Subtotal", tTot: "Total", fStamp: "Timbrar factura", tblT: "COMPROBANTES EMITIDOS",
      thRfc: "RECEPTOR", thTot: "TOTAL", thHr: "HORA", thEdo: "ESTADO", chkT: "VALIDANDO Y TIMBRANDO",
      kStamped: "TIMBRADAS HOY", kOk: "ÉXITO 1er INTENTO", kAvg: "TIEMPO PROMEDIO", kCanc: "CANCELADAS",
      feedT: "ACTIVIDAD", ribbon: "DEMO CONCEPTUAL · DATOS SIMULADOS",
      mCancel: "Cancelar comprobante", m02: "02 — Comprobante emitido con errores",
      m03: "03 — No se llevó a cabo la operación", mBack: "Volver",
      desc: "Descripción", qty: "Cant.", price: "P. unitario",
      vRfc: "RFC inválido — usa 12 o 13 caracteres", vRows: "Agrega al menos un concepto con importe",
      c1: "Esquema CFDI 4.0 válido", c2: "Reglas de negocio y catálogos", c3: "Enviado a PAC-1", c4: "Timbre fiscal recibido",
      stamped: "timbrada", cancelled: "cancelada", vig: "VIGENTE", canc: "CANCELADO", cancelBtn: "Cancelar",
      stampT: "TIMBRADO", fSample: "Datos de ejemplo" },
    en: { nav: "← System overview", sub: "ISSUING & STAMPING · E-INVOICE", pac: "PAC-1 online",
      fTitle: "NEW INVOICE", tab0: "Purchase orders",
      ocId: "PO", ocProv: "SUPPLIER", ocAmt: "AMOUNT", ocArea: "CURRENT STAGE",
      ocApr: "✓ Approve stage", ocRej: "✕ Reject", ocInv: "Invoice this PO →",
      areas: ["Request", "Floor / Area", "Accounting", "Management"],
      stPend: "IN FLOW", stApr: "APPROVED", stRej: "REJECTED",
      ocApproved: "stage approved", ocRejected: "PO rejected", ocReady: "PO ready to invoice", ocBy: "by", tab1: "Issue", tab2: "Invoices", tab3: "Reports", qPh: "Search by UUID or tax ID…", repD: "ISSUED PER DAY · LAST 7", repR: "TOP RECEIVERS THIS MONTH", xml: "XML", fRfc: "Receiver tax ID", fUso: "CFDI use", fAdd: "Add line item",
      tSub: "Subtotal", tTot: "Total", fStamp: "Stamp invoice", tblT: "ISSUED INVOICES",
      thRfc: "RECEIVER", thTot: "TOTAL", thHr: "TIME", thEdo: "STATUS", chkT: "VALIDATING & STAMPING",
      kStamped: "STAMPED TODAY", kOk: "FIRST-TRY SUCCESS", kAvg: "AVG TIME", kCanc: "CANCELLED",
      feedT: "ACTIVITY", ribbon: "CONCEPT DEMO · SIMULATED DATA",
      mCancel: "Cancel invoice", m02: "02 — Issued with errors", m03: "03 — Operation did not happen", mBack: "Back",
      desc: "Description", qty: "Qty", price: "Unit price",
      vRfc: "Invalid tax ID — must be 12 or 13 characters", vRows: "Add at least one line with an amount",
      c1: "CFDI 4.0 schema valid", c2: "Business rules & catalogs", c3: "Sent to PAC-1", c4: "Fiscal stamp received",
      stamped: "stamped", cancelled: "cancelled", vig: "ACTIVE", canc: "CANCELLED", cancelBtn: "Cancel",
      stampT: "STAMPED", fSample: "Sample data" }
  };
  let lang = localStorage.getItem("fy-lang") === "en" ? "en" : "es";
  const t = () => T[lang];
  const applyLang = () => {
    const q = document.getElementById("q");
    if (q) q.placeholder = t().qPh;
    if (typeof renderOcs === "function") try { renderOcs(); } catch (_) {}
    document.querySelectorAll("[data-t]").forEach((el) => { if (t()[el.dataset.t]) el.textContent = t()[el.dataset.t]; });
    document.documentElement.lang = lang;
    document.querySelectorAll("#langToggle [data-lang-opt]").forEach((s) => s.classList.toggle("on", s.dataset.langOpt === lang));
    renderRows();   // placeholders per language
  };
  $("#langToggle").addEventListener("click", () => { lang = lang === "es" ? "en" : "es"; localStorage.setItem("fy-lang", lang); applyLang(); });

  /* ---------- Line items ---------- */
  let rows = [{ d: "Servicio de consultoría", q: 1, p: 12500 }];
  const rowsEl = $("#rows");
  const renderRows = () => {
    rowsEl.innerHTML = rows.map((r, i) => `
      <div class="crow">
        <input value="${r.d}" placeholder="${t().desc}" data-i="${i}" data-f="d">
        <input type="number" min="1" value="${r.q}" placeholder="${t().qty}" data-i="${i}" data-f="q" inputmode="numeric">
        <input type="number" min="0" step="0.01" value="${r.p}" placeholder="${t().price}" data-i="${i}" data-f="p" inputmode="decimal">
        <button class="del" data-del="${i}" type="button" aria-label="Eliminar">✕</button>
      </div>`).join("");
    totals();
  };
  rowsEl.addEventListener("input", (e) => {
    const i = e.target.dataset.i, f = e.target.dataset.f;
    if (i === undefined) return;
    rows[i][f] = f === "d" ? e.target.value : parseFloat(e.target.value) || 0;
    totals();
  });
  rowsEl.addEventListener("click", (e) => {
    const d = e.target.dataset.del;
    if (d !== undefined) { rows.splice(+d, 1); renderRows(); }
  });
  $("#btnRow").addEventListener("click", () => { rows.push({ d: "", q: 1, p: 0 }); renderRows(); });
  $("#btnSample").addEventListener("click", () => {
    $("#fRfc").value = "XAXX010101000";
    rows = [{ d: "Servicio de consultoría · Comercial Ruiz SA", q: 1, p: 8400 }];
    renderRows();
  });

  const totals = () => {
    const sub = rows.reduce((s, r) => s + (r.q || 0) * (r.p || 0), 0);
    $("#tSub").textContent = money(sub);
    $("#tIva").textContent = money(sub * 0.16);
    $("#tTot").textContent = money(sub * 1.16);
    return sub;
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
  let nStamped = 0, nCanc = 0, sumMs = 0;
  const kpis = () => {
    $("#kStamped").textContent = nStamped;
    $("#kCanc").textContent = nCanc;
    $("#kOk").textContent = "100%";
    $("#kAvg").textContent = nStamped ? (sumMs / nStamped / 1000).toFixed(1) + "s" : "—";
  };

  /* ---------- Stamping ---------- */
  const uuid = () => "xxxxxxxx-xxxx-4xxx".replace(/x/g, () => "0123456789ABCDEF"[Math.random() * 16 | 0]);
  const chkCard = $("#checkCard"), chk = $("#chk");
  let busy = false;

  $("#btnStamp").addEventListener("click", () => {
    if (busy) return;
    const rfc = $("#fRfc").value.trim().toUpperCase();
    const sub = totals();
    if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc)) { push("bad", t().vRfc); return; }
    if (sub <= 0) { push("bad", t().vRows); return; }

    busy = true;
    $("#tp1 .stamp")?.remove();
    const steps = ["c1", "c2", "c3", "c4"];
    chkCard.hidden = false;
    chk.innerHTML = steps.map((k) => `<div class="tl-item" data-k="${k}"><svg class="tick" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3,8.5 6.5,12 13,4.5"/></svg><b>${t()[k]}</b><span>…</span></div>`).join("");
    const t0 = performance.now();
    const stepDelay = reduced ? 0 : 420;
    steps.forEach((k, i) => {
      setTimeout(() => {
        const item = chk.querySelector(`[data-k="${k}"]`);
        item.classList.add("done");
        item.querySelector("span").textContent = "✓";
        if (i === steps.length - 1) {
          const ms = performance.now() - t0 + 300;
          const id = uuid();
          const now = new Date();
          const tot = money(sub * 1.16);
          const tr = document.createElement("tr");
          tr.dataset.uuid = id;
          tr.dataset.rfc = rfc; tr.dataset.total = (sub * 1.16).toFixed(2);
          tr.innerHTML = `<td class="mono">${id}</td><td class="mono">${rfc}</td><td>${tot}</td>` +
            `<td class="mono">${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}</td>` +
            `<td><span class="badge ok" data-state>${t().vig}</span></td>` +
            `<td><button class="ctl" data-xml type="button">↓ ${t().xml}</button></td>` +
            `<td><button class="ctl danger" data-cancel type="button">${t().cancelBtn}</button></td>`;
          $("#cfdiBody").prepend(tr);
          nStamped++; sumMs += ms; kpis();
          push("ok", `<b>${id.slice(0, 8)}…</b> ${t().stamped} · ${tot}`);
          const stamp = document.createElement("div");
          stamp.className = "stamp mono";
          stamp.innerHTML = `<span data-t="stampT">${t().stampT}</span> · <span>${id.slice(0, 8)}</span>`;
          $("#tp1 .canvas-card").appendChild(stamp);
          rows = [{ d: "", q: 1, p: 0 }];
          renderRows();
          setTimeout(() => { chkCard.hidden = true; busy = false; }, reduced ? 0 : 1400);
        }
      }, stepDelay * (i + 1));
    });
  });

  /* ---------- Cancellation ---------- */
  const modal = $("#modalBg");
  let cancelRow = null, mLast = null;
  const closeCancel = () => {
    modal.classList.remove("open");
    if (mLast) { mLast.focus(); mLast = null; }
  };
  document.addEventListener("click", (e) => {
    if (e.target.dataset.cancel !== undefined) {
      cancelRow = e.target.closest("tr");
      $("#mUuid").textContent = cancelRow.dataset.uuid;
      mLast = document.activeElement;
      modal.classList.add("open");
      $("#mClose").focus();
    }
  });
  modal.addEventListener("click", (e) => {
    const motivo = e.target.dataset.motivo;
    if (motivo && cancelRow) {
      const b = cancelRow.querySelector("[data-state]");
      b.textContent = t().canc; b.className = "badge bad";
      cancelRow.querySelector("[data-cancel]").remove();
      nCanc++; kpis();
      push("warn", `<b>${cancelRow.dataset.uuid.slice(0, 8)}…</b> ${t().cancelled} · ${motivo}`);
      closeCancel();
      cancelRow = null;
    }
    if (e.target.id === "mClose" || e.target === modal) closeCancel();
  });

  /* ---------- Tabs ---------- */
  const panels = { tb0: "tp0", tb1: "tp1", tb2: "tp2", tb3: "tp3" };
  Object.entries(panels).forEach(([tb, tp]) => {
    $("#" + tb).addEventListener("click", () => {
      Object.entries(panels).forEach(([b, p]) => {
        $("#" + b).classList.toggle("on", b === tb);
        $("#" + p).hidden = p !== tp;
      });
      if (tp === "tp3") drawReports();
    });
  });

  /* ---------- Search filter ---------- */
  $("#q").addEventListener("input", (e) => {
    const q = e.target.value.trim().toUpperCase();
    document.querySelectorAll("#cfdiBody tr").forEach((tr) => {
      tr.style.display = !q || tr.dataset.uuid.includes(q) || tr.dataset.rfc.includes(q) ? "" : "none";
    });
  });

  /* ---------- Real XML download (client-side blob) ---------- */
  document.addEventListener("click", (e) => {
    if (e.target.dataset.xml === undefined) return;
    const tr = e.target.closest("tr");
    const xmlDoc = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<cfdi:Comprobante Version="4.0" UUID="${tr.dataset.uuid}" Total="${tr.dataset.total}"\n` +
      `  Receptor="${tr.dataset.rfc}" Fecha="${new Date().toISOString()}"\n` +
      `  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"><!-- demo conceptual · FOURYOU --></cfdi:Comprobante>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([xmlDoc], { type: "application/xml" }));
    a.download = tr.dataset.uuid + ".xml";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ---------- Reports tab ---------- */
  const dayCounts = [3, 5, 2, 7, 4, 6, 0];   // seeded history; today (idx 6) grows live
  const bumpToday = () => { dayCounts[6] = nStamped; };
  const drawReports = () => {
    bumpToday();
    const cv = $("#cvDays"), ctx = cv.getContext("2d");
    cv.width = cv.clientWidth * 2; cv.height = 220; ctx.scale(2, 2);
    const w = cv.clientWidth, max = Math.max(...dayCounts, 1);
    const bw = (w - 40) / 7;
    const acc = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || "#1F5CB0";
    ctx.clearRect(0, 0, w, 110);
    dayCounts.forEach((v, i) => {
      const bh = (v / max) * 78;
      ctx.fillStyle = i === 6 ? acc : acc + "66";
      ctx.beginPath();
      ctx.roundRect(20 + i * bw + 4, 92 - bh, bw - 8, bh, 3);
      ctx.fill();
      ctx.fillStyle = "#8896AC"; ctx.font = "9px JetBrains Mono";
      ctx.fillText(String(v), 20 + i * bw + bw / 2 - 3, 102);
    });
    // top receptores desde las filas reales
    const tally = {};
    document.querySelectorAll("#cfdiBody tr").forEach((tr) => {
      tally[tr.dataset.rfc] = (tally[tr.dataset.rfc] || 0) + parseFloat(tr.dataset.total);
    });
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxT = top[0]?.[1] || 1;
    $("#topRfc").innerHTML = top.length
      ? top.map(([rfc, tot]) => `
        <div class="rule"><span class="mono">${rfc}</span>
          <span style="flex:1;height:4px;border-radius:2px;background:var(--border);position:relative;overflow:hidden">
            <u style="position:absolute;inset:0;width:${(tot / maxT * 100).toFixed(0)}%;background:var(--grad)"></u></span>
          <b class="mono">${money(tot)}</b></div>`).join("")
      : `<p class="demo-note">—</p>`;
  };

  /* ---------- Purchase orders: cross-area approval workflow ---------- */
  const OCS = [
    { id: "OC-2201", prov: "Aceros del Norte SA", rfc: "AND920315KL8", amt: 48200, stage: 1, hist: [["Solicitud", "R. Gómez"]], state: "pend" },
    { id: "OC-2202", prov: "Suministros Delta", rfc: "SDE010712QX3", amt: 12750, stage: 2, hist: [["Solicitud", "L. Prado"], ["Piso / Área", "M. Arce"]], state: "pend" },
    { id: "OC-2203", prov: "Ferretera Central", rfc: "FCE880420TT1", amt: 6890, stage: 3, hist: [["Solicitud", "A. Vidal"], ["Piso / Área", "M. Arce"], ["Contaduría", "S. Nieto"]], state: "pend" },
    { id: "OC-2204", prov: "Papelera Kimex", rfc: "PKI950903MN2", amt: 3120, stage: 4, hist: [["Solicitud", "L. Prado"], ["Piso / Área", "M. Arce"], ["Contaduría", "S. Nieto"], ["Dirección", "E. Peña"]], state: "apr" }
  ];
  let curOc = null;
  const ocBadge = (o) => o.state === "apr" ? `<span class="badge ok oc-badge">${t().stApr}</span>`
    : o.state === "rej" ? `<span class="badge bad oc-badge">${t().stRej}</span>`
    : `<span class="badge warn oc-badge">${t().stPend}</span>`;
  const renderOcs = () => {
    $("#ocBody").innerHTML = OCS.map((o) => `
      <tr data-oc="${o.id}">
        <td class="mono">${o.id}</td><td>${o.prov}</td><td>${money(o.amt)}</td>
        <td class="mono">${o.state === "pend" ? t().areas[Math.min(3, o.stage)] : "—"}</td>
        <td>${ocBadge(o)}</td>
      </tr>`).join("");
  };
  const ocDrawer = $("#ocDrawer");
  let ocLast = null;
  const openOc = (o) => {
    curOc = o;
    $("#ocTitle").textContent = `${o.id} · ${o.prov}`;
    $("#ocMeta").textContent = `${o.rfc} · ${money(o.amt)} + IVA`;
    $("#ocSteps").innerHTML = t().areas.map((a, i) => {
      const st = o.state === "rej" && i === o.stage ? "rej" : i < o.stage ? "done" : i === o.stage && o.state === "pend" ? "on" : "";
      return `<div class="os ${st}"><span class="osd">${i < o.stage ? "✓" : o.state === "rej" && i === o.stage ? "✕" : i + 1}</span><span class="osl">${a}</span></div>`;
    }).join("");
    $("#ocHist").innerHTML = o.hist.map(([a, who]) =>
      `<div class="tl-item done"><b>${a}</b><span>${t().ocBy} ${who}</span></div>`).join("");
    const live = o.state === "pend";
    $("#ocApprove").hidden = !live;
    $("#ocReject").hidden = !live;
    $("#ocInvoice").hidden = !(o.state === "apr");
    if (!ocDrawer.classList.contains("open")) {
      ocLast = document.activeElement;
      ocDrawer.classList.add("open");
      ocDrawer.setAttribute("aria-hidden", "false");
      $("#ocClose").focus();
    }
  };
  const closeOc = () => {
    ocDrawer.classList.remove("open");
    ocDrawer.setAttribute("aria-hidden", "true");
    if (ocLast) { ocLast.focus(); ocLast = null; }
  };
  $("#ocBody").addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (tr) openOc(OCS.find((o) => o.id === tr.dataset.oc));
  });
  const ANALYSTS = ["M. Arce", "S. Nieto", "E. Peña"];
  $("#ocApprove").addEventListener("click", () => {
    if (!curOc || curOc.state !== "pend") return;
    curOc.hist.push([t().areas[curOc.stage], ANALYSTS[Math.min(2, curOc.stage - 1)]]);
    curOc.stage++;
    if (curOc.stage > 3) { curOc.state = "apr"; push("ok", `<b>${curOc.id}</b> ${t().ocReady}`); }
    else push("ok", `<b>${curOc.id}</b> ${t().ocApproved} · ${t().areas[curOc.stage - 1]}`);
    renderOcs(); openOc(curOc);
  });
  $("#ocReject").addEventListener("click", () => {
    if (!curOc) return;
    curOc.state = "rej";
    push("bad", `<b>${curOc.id}</b> ${t().ocRejected} · ${t().areas[curOc.stage]}`);
    renderOcs(); openOc(curOc);
  });
  /* Approved PO prefills the invoice: the loop closes in front of the client */
  $("#ocInvoice").addEventListener("click", () => {
    if (!curOc) return;
    $("#fRfc").value = curOc.rfc;
    rows = [{ d: `${curOc.id} · ${curOc.prov}`, q: 1, p: curOc.amt }];
    renderRows();
    closeOc();
    $("#tb1").click();
  });
  $("#ocClose").addEventListener("click", closeOc);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.classList.contains("open")) closeCancel();
    else if (ocDrawer.classList.contains("open")) closeOc();
  });
  renderOcs();

  applyLang();
  kpis();
})();
