# FOURYOU · DESIGN-SYSTEM v18

Sistema del sitio fouryou.ai (línea empresarial). Regla madre: **todo pixel
iluminado deriva de `#104084` (matiz 215°)**. No existe segundo matiz
decorativo; el verde/ámbar/rojo son exclusivamente semánticos y solo viven
dentro de ventanas de producto.

## Tokens (`css/tokens.css`)
- **Rampa:** 900 `#082349` · 700 `#104084` (ancla) · 500 `#1F5CB0` · 400 `#3F7BD1` · 300 `#6FA3E8` · 200 `#A9C7F2`. Constante en ambos temas.
- **Semánticos:** ok `#34C08B` (estado en-vivo/éxito), warn `#E2A649` y danger `#E2687A` — solo dentro de `--window`.
- **Temas:** dark default (`#05070A` / `#0B0F16`), light real (`#F6F8FB` / blanco). Acento: `--brand-300` dark / `--brand-500` light. Persistencia `fy-theme` + pre-paint en `js/theme.js`.
- **Ventanas ("product truth"):** superficie `--window` con su propia escala de texto/borde (`#D9E4F3`/`#66788F` en dark).
- **Geometría:** radios 14/10/7 (+chip 5, nodo 3). Nunca píldora, nunca 0. Círculos solo en anillos de radar/sonar.
- **Motion:** enter `cubic-bezier(.16,1,.3,1)`, fade `cubic-bezier(.65,0,.35,1)`; 150/250/400/380 ms; salidas 240 ms (< entrada). Loops solo transform/opacity, escala ≥ .92. Gobernanza `FY.loop` (viewport + visibilitychange → `.fy-paused`/`html.fy-hidden`). Reduced-motion: estados finales, nunca ventana vacía.
- **Tipos:** Instrument Sans (display, −0.03em) · Inter (cuerpo) · JetBrains Mono (telemetría, tabular). Mono = dato vivo; display = claim.

## Marca `<4U/>` (ley)
Lockup tipográfico `<4U/>` (`.fy-mark`): brackets `<` en mutado y `/>` en
acento (peso 600, .8em), «4U» en display 700 −.04em. En nav/footer vive
dentro de un **núcleo cuadrado-redondeado** (`.fy-core.nsm`, 56×34 rx 9);
en el hero, núcleo 104×64 rx 16 con 3 ondas (4.2 s → 2.6 s en hover/pulso),
sheen especular y tilt ±12° (persp. 620). Hover de marca: los brackets se
separan ±2px y toman acento. Marca de agua `<4U/>` gigante (36vw, stroke
azul .055) con disolución radial y paralaje ligado al scroll. Favicon: tile
claro `#F4F7FB` rx 24 con «4U» en trazo `#082349` — el mismo tile de la nav.

## Piezas
- **Consola** (`site.js`): guiones ley deploy/legacy, 16–42 ms/char, pausas 500/260 ms, reposo 5.2 s, caret azul; al aterrizar `▲` → pulso `--pulse` consola→estado→actividad (120 ms) + ondas `lit` 1.5 s.
- **Instrumentos**: estado del pipeline como etapas conectadas (entrada escalonada 70 ms) + actividad git 12×5 determinista con celdas `hot` y línea de commit rotando cada 3.4 s.
- **15 escenas** (`scenes.js` + `css/site.css`): cada ventana con strings del brief, loop 2.6–9 s, pausada fuera de viewport; API de interacción única por sistema para la ficha (`demo.js`); íconos propios por sistema (`FY.ICONS`, 24×24, stroke 1.6 square).
- **Ficha** (`demo.html?s=<slug>`): stage = misma ventana escalada 40vh + 1 interacción; KPIs vidrio ×3, features 01–04, stack por capas, tarjetas quiere/ILUSTRATIVO, mailto real. View Transitions `stage-<slug>` cross-document (opt-in desde `theme.js`, solo fuera de iframes), off bajo reduced-motion.
- **i18n** (`i18n.js`): ES inline default / EN / PT-BR nativo (nota fiscal eletrônica, SEFAZ), `fy-lang`, crossfade 120 ms, paridad 1:1 auto-verificada (`tools/verify.js`, reporte consola).

## Changelog
- **v18.1** — iteración del dueño: la marca pasa del Token 4 SVG al lockup tipográfico `<4U/>` con tile de app (favicon a juego); marca de agua con paralaje y barra de progreso de scroll; cascada de entrada del hero; pipeline como etapas conectadas + feed de commits; íconos propios por sistema; animaciones scroll-driven (`animation-timeline: view()`) como mejora progresiva.
- **v18** — reconstrucción total post-descarte: se elimina el acento brass/dorado (prohibido por el dueño), un solo matiz 215°; 15 ventanas re-escritas como software vivo con strings reales; fichas operables con View Transitions; trilingüe con paridad verificada; gobernanza única de loops.
- v17 (fouryou.io) — origen de la disciplina visual y los guiones de consola.
