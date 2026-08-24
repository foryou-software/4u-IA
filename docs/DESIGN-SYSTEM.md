# FOURYOU Design System — v18

Fuente de verdad del sitio fouryou.ai. Hereda la disciplina de v17 (sitio estático) y la eleva; toda decisión nueva queda registrada en el changelog.

## 1. Identidad

- **Token 4 `<4/>`** — firma del estudio. Chevrones en color de texto (stroke 9), **4** en acento (stroke 7), slash en tono medio (stroke 6), todo `stroke-linecap: square`. Nunca mezclado con wordmarks de producto en la misma pieza.
- Ritual de hover del emblema (hero): brackets ±6px, re-trazo del 4 (~2.1s en secuencia), barrido del slash, sheen especular, ondas `border-radius: 26%` aceleradas de 4.2s a 2.6s, tilt 3D ±12°. Reduced-motion: núcleo sin transform, ondas ocultas.
- Tagline **"Technology Built For You."** — no se traduce en ningún idioma.
- Prefijo de familia `4U` siempre vía `<em class="fu">4U</em>`; en v18 `.fu` usa **brass** (`--acc2`), ya no azul.

## 2. Color

### Rampa azul 215° (estructura — sin cambios)
`--brand-900 #082349 · 700 #104084 (ancla) · 500 #1F5CB0 · 400 #3F7BD1 · 300 #6FA3E8 · 200 #A9C7F2`

### Rampa brass 38–42° (novedad v18 — decisión D3)
Derivada del dorado real del ecosistema (símbolo de 4U Swap: `#8A6A10 → #D4A017 → #EFC85C`):

`--brass-900 #4A3A0C · 700 #8A6A10 · 500 #D4A017 (ancla) · 300 #E3B341 · 200 #F3D77C`

- Acento activo `--acc2`: `#E3B341` en dark (contraste 9.6:1 sobre `#05070A`), `#8A6A10` en light (5.1:1 sobre `#F6F8FB`). Ambos AA para texto normal.
- CTA brass (`.btn2`) en light: gradiente `--brass-900 → --brass-700` con texto `#FFFDF4` — ≥4.9:1 en todo el recorrido del gradiente (AA).
- **Uso quirúrgico**: prefijo `.fu`, CTA primario (`.btn2`), kickers de cluster/Sage, momento firma (pulso del hero). Brass nunca como color de superficie ni de fondo de sección.

### Semánticos (sin cambios)
`--ok #34C08B` solo éxito/online/en-ruta · `--warn #E2A649` solo advertencia · `--err #E2687A` **solo incidentes, jamás decorativo**.

### Temas
Dark por defecto; light real completo. `html[data-theme]` + `localStorage("fy-theme")` + script pre-paint anti-flash. Ventanas de producto (`--window*`) tematizadas en ambos temas, consola del hero incluida (patrón heredado de v17).

## 3. Tipografía

- **Instrument Sans** 500/600/700 — display, tracking −0.03em. Claims de marketing.
- **Inter** 400/500/600 — body.
- **JetBrains Mono** 400/500 — telemetría viva, labels, código, eyebrows.
- Regla ratificada: **mono/tabular = telemetría; display = claims**. H1 `clamp(2.6rem, 6vw, 4.8rem)`; `.grad` con barrido de luz único al entrar.

## 4. Geometría

Radios **14 / 10 / 7 px** (`--r-lg/md/sm`). Nunca pill, nunca 0. Nodos como cuadrados redondeados (2–5px); anillos de radar/sonar son la única excepción circular (semántica). Espaciado en escala de 8 (`--s1…--s16`). Contenedor 1200px.

## 5. Motion

- Física tokenizada: `--ease-out-brand` (entradas/hover/reveals), `--ease-smooth` (color/opacidad); `--dur-fast 150 / base 250 / slow 400 / overlay 380`. **Salidas siempre más cortas que su entrada.** Escala mínima 0.92. Loops solo transform/opacity.
- Gobernanza única (`js/fy-motion.js`): todo loop JS o CSS pasa por `fyLoop` o por las clases `.fy-paused`/`.fy-hidden` (viewport + pestaña oculta + reduced-motion). Loops de dato: `reduced:"run"`; decorativos: `"off"`; con fotograma final: `"once"`.
- Reveals `.rv` bidireccionales con stagger `--d` (máx 0.3s). View Transitions bento→ficha (`view-transition-name: stage-<slug>`), desactivadas bajo reduced-motion.
- Generadores **deterministas** (mulberry32 con semilla). Nunca actividad fabricada sin etiqueta.

## 6. Momento firma v18 — «el pulso»

Único gasto de audacia del sitio. La consola del hero teclea el guion real de deploy; cuando aterriza la línea `▲`, una onda brass (`--glow-brass`) barre consola → statusboard → heatmap con delays de 120ms, y las ondas del emblema toman borde brass por 1.5s. Implementación: clase `fy-pulse`, solo transform/opacity, apagado bajo reduced-motion. Nada más en el sitio compite con él.

## 7. Iconografía

- Set propio, cero librerías. Retícula 24px, stroke **1.75**, `stroke-linecap: square` (eco del logo), esquinas con radios de marca, `currentColor`, acento brass opcional en un solo trazo.
- 15 íconos de producto + ~20 de UI. Los 35 dibujados por la misma mano.
- Del emblema se derivan `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` y og-images 1200×630 por idioma.

## 8. i18n

- Default **es-MX**; selector ES · EN · PT en header y footer; persiste en `localStorage("fy-lang")`, actualiza `<html lang>`, crossfade 120ms.
- Patrón: ES inline en el DOM (`data-i18n` / `data-i18n-html` / `data-i18n-aria`); el motor captura el ES al iniciar; diccionarios EN/PT en `js/i18n.js`.
- Paridad 1:1 obligatoria; reporte automático en consola + `node tools/verify.js`. pt-BR y EN de negocio nativo, no traducción literal.

## 9. Jerarquía comercial (v18)

15 productos en 3 clusters, en este orden en nav, bento y listados:

1. **Seguimiento y campo**: 4UTrack (estrella, nuevo) · 4UFleet · 4UMap
2. **Contaduría y finanzas**: 4ULedger · 4UTax · 4UBank (+ Sage 300 como capacidad transversal)
3. **Operación y comercio**: 4UShop · 4UFlow · 4UGov · 4UCar · 4UCare · 4UVault · 4UTurn · 4UDev · 4UDate

Retícula del bento: Track span completo (escaparate), Fleet wide; los clusters cierran exactos (3+3+9).

## 10. Honestidad

- Hechos reales (8+ años, industrias, Sage 300, rescates legacy) — nunca métricas fabricadas presentadas como reales.
- Todo demo lleva «demo conceptual · datos simulados» en los tres idiomas; los widgets del hero llevan nota «ilustrativo».
- Sin teatro de insignias. Sin analytics de terceros, sin trackers.

## Changelog v17 → v18

1. **Brass introducido** (D3): rampa derivada del dorado del ecosistema, ajustada a AA en ambos temas. `.fu` migra de azul a brass; CTA primario pasa a brass.
2. **Idioma por defecto: español (es-MX)** (antes inglés) + tercer idioma pt-BR con paridad verificada por herramienta.
3. **Nueva jerarquía comercial**: clusters 01 Seguimiento / 02 Finanzas / 03 Operación; el catálogo crece a 15 con **4UTrack** como producto estrella.
4. **Momento firma «el pulso»**: la consola, el statusboard y el emblema comparten un latido al aterrizar cada deploy. Los beams del hero pasan a estáticos (se retiró un accesorio a cambio de la firma).
5. **Consola**: guion actualizado a "3 of 15 apps"; 2 pestañas (deploy/legacy) ratificadas; widgets LIVE STATUS → «estado del pipeline» con valores que espejean el guion (nada inventado nuevo) + heatmap determinista 7×5.
6. **Copy corregido**: el lead del catálogo ya no dice "doce clases de sistema"; ahora declara quince y la cuenta cierra.
7. **Assets de publicación creados desde cero**: favicon, og-images por idioma, 404, legales, robots, sitemap (v17 no tenía ninguno).
8. **Accesibilidad elevada**: `data-i18n-aria` para labels, focus visible en todo interactivo, reduced-motion con estados finales explícitos en cada micro-UI del bento.
9. **Se hereda sin cambios**: rampa azul, tipografías y roles, radios 14/10/7, física de motion, gobernanza `fy-motion.js`, View Transitions, reglas verde/rojo, generadores deterministas.
