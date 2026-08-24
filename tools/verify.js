#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["tools", "node_modules", ".git", "uploads", "assets"]);
const TERMS = ["Pet" + "ro", "Ma" + "ven", "resto sin" + " cambios"];

const walk = (dir, out = []) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p, out);
    } else if (/\.(html|css|js|md|json|txt|xml|svg)$/i.test(name)) {
      out.push(p);
    }
  }
  return out;
};

let failures = 0;
const fail = (msg) => { failures++; console.error("  ✗ " + msg); };
const ok = (msg) => console.log("  ✓ " + msg);

console.log("\nFOURYOU verify — " + ROOT + "\n");

console.log("[1] Paridad i18n (index)");
const indexPath = path.join(ROOT, "index.html");
const i18nPath = path.join(ROOT, "js", "i18n.js");
if (!fs.existsSync(indexPath) || !fs.existsSync(i18nPath)) {
  fail("faltan index.html o js/i18n.js");
} else {
  const html = fs.readFileSync(indexPath, "utf8");
  const js = fs.readFileSync(i18nPath, "utf8");
  const domKeys = new Set();
  const attrRe = /data-i18n(?:-html|-aria)?="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(html))) domKeys.add(m[1]);
  domKeys.add("meta.title");
  domKeys.add("meta.desc");

  const sliceKeys = (src, marker) => {
    const start = src.indexOf(marker);
    if (start < 0) return null;
    const end = src.indexOf("};", start);
    const body = src.slice(start, end);
    const keys = new Set();
    const re = /"([A-Za-z0-9.]+)"\s*:/g;
    let k;
    while ((k = re.exec(body))) keys.add(k[1]);
    return keys;
  };
  const en = sliceKeys(js, "const EN = {");
  const pt = sliceKeys(js, "const PT = {");
  if (!en || !pt) {
    fail("no se pudieron extraer los diccionarios EN/PT");
  } else {
    console.log(`  · dom ${domKeys.size} · en ${en.size} · pt ${pt.size}`);
    const missEn = [...domKeys].filter((k) => !en.has(k));
    const missPt = [...domKeys].filter((k) => !pt.has(k));
    const orphEn = [...en].filter((k) => !domKeys.has(k));
    const orphPt = [...pt].filter((k) => !domKeys.has(k));
    if (missEn.length) fail("claves DOM sin EN: " + missEn.join(", "));
    else ok("EN cubre todas las claves del DOM");
    if (missPt.length) fail("claves DOM sin PT: " + missPt.join(", "));
    else ok("PT cubre todas las claves del DOM");
    if (en.size !== pt.size) fail(`conteo EN (${en.size}) ≠ PT (${pt.size})`);
    else ok(`conteo EN = PT = ${en.size}`);
    if (orphEn.length) fail("claves EN sin uso en DOM: " + orphEn.join(", "));
    if (orphPt.length) fail("claves PT sin uso en DOM: " + orphPt.join(", "));
    if (!orphEn.length && !orphPt.length) ok("sin claves huérfanas");
  }
}

console.log("\n[2] Términos prohibidos");
const files = walk(ROOT);
let hits = 0;
for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  for (const term of TERMS) {
    let idx = txt.indexOf(term);
    while (idx >= 0) {
      hits++;
      fail(`"${term}" en ${path.relative(ROOT, f)} @${idx}`);
      idx = txt.indexOf(term, idx + 1);
    }
  }
}
if (!hits) ok(`cero apariciones en ${files.length} archivos`);

console.log("\n[3] Higiene básica");
for (const f of files.filter((x) => x.endsWith(".html"))) {
  const txt = fs.readFileSync(f, "utf8");
  const rel = path.relative(ROOT, f);
  if (!/lang="/.test(txt)) fail(`${rel}: falta <html lang>`);
  if (/http:\/\//.test(txt.replace(/http:\/\/www\.w3\.org/g, ""))) fail(`${rel}: recurso http:// inseguro`);
}
ok("HTML con lang y sin recursos http://");

console.log("");
if (failures) {
  console.error(`RESULTADO: ${failures} problema(s).\n`);
  process.exit(1);
} else {
  console.log("RESULTADO: todo en orden.\n");
}
