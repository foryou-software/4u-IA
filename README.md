# fouryou.ai

Sitio oficial de **FOURYOU Software** — ingeniería de software a la medida. Technology Built For You.

## Qué es

One-page estático trilingüe (ES · EN · PT-BR) con el catálogo de 15 sistemas 4U organizado por clusters comerciales (Seguimiento y campo · Contaduría y finanzas · Operación y comercio), construido sobre el design system v18 (`docs/DESIGN-SYSTEM.md`).

- **Cero build, cero dependencias**: HTML + CSS + JS vanilla. Abrir `index.html` con doble clic funciona.
- Dark/light con persistencia y sin flash; `prefers-reduced-motion` respetado con estados finales.
- i18n con español inline + diccionarios EN/PT (`js/i18n.js`); paridad verificada por herramienta.
- Gobernanza de animaciones (`js/fy-motion.js`): todo loop se pausa fuera de viewport y con la pestaña oculta.

## Estructura

```
index.html          one-page (hero con consola de deploy, catálogo, capacidades, seguridad, método, FAQ, contacto)
css/                tokens.css (fuente de verdad de color/tipografía/física) · base.css · site.css
js/                 i18n.js · theme.js · fy-motion.js · site.js
docs/               DESIGN-SYSTEM.md v18 (con changelog v17→v18)
tools/verify.js     compuerta local: paridad i18n + términos prohibidos + higiene
favicon.svg         Token 4 <4/>
CNAME               dominio fouryou.ai (GitHub Pages)
```

## Verificación

```
node tools/verify.js
```

## Publicación

Hosting estático (GitHub Pages sirve tal cual: rama `main`, raíz `/`; el `CNAME` ya apunta a fouryou.ai). Los mapas de fases futuras usarán MapLibre GL por CDN; todo lo demás funciona offline.

## Roadmap (brief de rediseño, fases 2–5)

4UTrack (ficha + demo con selector México · Europa · Brasil) → shell de fichas con 15 sistemas → refactor de los 11 demos → 404, legales, robots, sitemap y og-images.
