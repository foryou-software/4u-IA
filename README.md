# fouryou.ai

Sitio oficial de **FOURYOU Software** — ingeniería de software a la medida. Technology Built For You.

## Qué es

Sitio estático trilingüe (ES · EN · PT-BR) de la línea empresarial: catálogo de 15 sistemas 4U organizado por clusters (01 Seguimiento y campo · 02 Contaduría y finanzas · 03 Operación y comercio), cada uno con su **ventana de software vivo** en el índice y su **ficha operable** en `demo.html?s=<slug>` (una interacción real por sistema). Design system v18 en `docs/DESIGN-SYSTEM.md`.

- **Cero build, cero dependencias**: HTML + CSS + JS vanilla. Abrir `index.html` con doble clic funciona.
- Marca tipográfica `<4U/>` con tile de app, marca de agua con paralaje y momento firma «el pulso» (la consola teclea el guion real de deploy y hace latir los instrumentos).
- Dark/light con persistencia y sin flash; `prefers-reduced-motion` con estados finales por escena.
- i18n con diccionarios ES/EN/PT y registro trilingüe de los 15 sistemas (`js/i18n.js`); paridad 1:1 auto-verificada en consola (`tools/verify.js`).
- Gobernanza de loops (`js/fy-motion.js`): toda animación se pausa fuera de viewport y con la pestaña oculta.

## Estructura

```
index.html          one-page (hero con consola + instrumentos, catálogo por clusters, capacidades, seguridad, método, FAQ, contacto)
demo.html           ficha viva parametrizada (?s=track … ?s=date) con escena operable y View Transitions
404.html            página de error de marca
privacidad.html     aviso de privacidad · terminos.html — términos
css/                tokens.css · base.css · site.css · demo.css
js/                 i18n.js (diccionarios + registro de 15) · theme.js · fy-motion.js · scenes.js (15 escenas + íconos) · site.js · demo.js
docs/               DESIGN-SYSTEM.md v18
tools/verify.js     paridad i18n 1:1 — reporte automático en la consola del navegador
favicon.svg         tile 4U
CNAME · robots.txt  dominio fouryou.ai (GitHub Pages) · indexación
```

## Verificación

Abrir el sitio y revisar la consola del navegador: `FOURYOU i18n · paridad ✓ 1:1 verificada` (diccionarios y registro de los 15 sistemas en los tres idiomas).

## Publicación

Hosting estático (GitHub Pages sirve tal cual: rama `main`, raíz `/`; el `CNAME` ya apunta a fouryou.ai). Todo funciona offline; las fuentes llegan por Google Fonts con fallback de sistema.
