# CV Interactivo · Misión Espacial 🚀

CV interactivo de scroll narrativo con estética pixel art: un viaje en 4 actos
(base terrestre → lanzamiento → luna → espacio profundo). Todo el contenido
vive en `public/cv-data.json`; el motor renderiza lo que haya ahí.

**Stack:** Vanilla JS (ES modules) + Canvas 2D + Vite. Cero dependencias en
runtime. Los sprites se generan proceduralmente (no hay imágenes externas).

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build estático en dist/
npm run preview   # sirve dist/ localmente
```

Despliegue: `.github/workflows/deploy.yml` publica `dist/` en GitHub Pages en
cada push a `main` (activa Pages → Source: GitHub Actions en el repo). El build
usa rutas relativas (`base: './'`), así que `dist/` también funciona en
Netlify o cualquier nginx.

## Editar el contenido — `public/cv-data.json`

Regla general: **cualquier texto visible es un objeto bilingüe**
`{ "es": "...", "en": "..." }`. El motor resuelve el idioma activo (toggle
ES/EN del HUD; por defecto español, con detección del idioma del navegador).
Los textos de interfaz del motor (HUD, countdown, etiquetas) están en
`src/data/ui-strings.json` con el mismo formato.

### Esquema

| Sección | Campos |
|---|---|
| `meta` | `title`*, `description`* (SEO/título de pestaña), `defaultLang` (`"es"`) |
| `profile` | `name` (string), `tagline`*, `summary`* |
| `education[]` | `id`, `type` (`degree`\|`exchange`), `degree`*, `institution`*, `specialization`*?, `location`*, `startYear`, `endYear`, `description`*? |
| `experience[]` | `id`, `company` (string), `role`*, `location`*, `startDate` (`"YYYY-MM"`), `endDate` (`"YYYY-MM"` o `"present"`), `highlights[]`* |
| `skills.categories[]` | `id`, `name`*, `items[]`* |
| `certifications[]` | `id`, `name`*, `issuer` (string), `year` |
| `hobbies[]` | `id`, `name`*, `icon` (clave de sprite), `iconHint` (documentación) |
| `contact` | `email`, `location`*, `linkedin`, `github` — **el teléfono nunca se muestra**, aunque exista el campo |

`*` = objeto bilingüe `{es, en}`. `?` = opcional.

Notas:

- `experience[]` debe ir en orden cronológico (más antiguo primero): la
  etapa inferior del cohete es el primer trabajo y se desacopla la primera.
- `hobbies[].icon` admite: `running`, `bike`, `smarthome`, `raspberry`,
  `vibecoding`, `llm`, `homelab`. Una clave desconocida usa un asteroide
  genérico (añade sprites nuevos en `src/sprites/sheets/hobbies.js`).
- Los colores de acento se asignan por índice desde `ACCENTS`
  (`src/sprites/palette.js`) y se comparten entre tarjetas DOM y canvas
  (franjas de las etapas del cohete, banderas...).
- Añadir/quitar entradas no requiere tocar código: el layout (posición de
  tarjetas, umbrales de separación de etapas, edificios de la base) se
  recalcula desde los datos (`computeLayout` en `src/engine/acts.js`).

## Estructura del proyecto

```
public/cv-data.json      contenido del CV (se puede editar sin rebuild)
src/data/ui-strings.json textos de interfaz del motor (bilingües)
src/engine/              scroll, renderer canvas, i18n, partículas, audio, registro de actos
src/acts/                una escena por acto (dibujo canvas)
src/sprites/             paleta, utilidades pixel, fuente 3x5, hojas de sprites
src/ui/                  boot screen, HUD, tarjetas DOM semánticas
src/styles/              CSS (base, HUD, tarjetas, modo motion-reduced)
```

Accesibilidad: todo el contenido es HTML semántico real (el canvas es solo
decoración, `aria-hidden`). Con `prefers-reduced-motion` se sirve una versión
estática estilizada con flujo normal de documento.

## Cómo añadir un 5º acto (p. ej. side projects)

Sin refactor — el motor deriva todo del registro de actos:

1. **Datos**: añade la sección a `cv-data.json` (p. ej. `"projects": [...]`)
   con campos bilingües.
2. **Escena**: crea `src/acts/act5-projects.js` exportando `{ id, init(app),
   draw(ctx, v) }` (mira `act4-deep-space.js` como plantilla; `v` trae
   `w, h, t, p` — progreso 0..1 del acto — y `parts` para partículas).
3. **Registro**: en `src/engine/acts.js` añade
   `{ id: 'projects', lengthVh: 350, scene: act5, fadeBoundary: true }` en la
   posición deseada del array `ACTS`, y las posiciones de sus tarjetas en
   `computeLayout`.
4. **Tarjetas**: añade un builder `projects(app)` en `src/ui/cards.js`.
5. **Textos UI**: añade `acts.projects.title/subtitle` y `hud.acts.projects`
   en `src/data/ui-strings.json`.

El HUD, el altímetro, el mapa de scroll y los fundidos entre actos recogen el
nuevo acto automáticamente.

## Extras

- **Sonido retro** (bleeps WebAudio): toggle en el HUD, apagado por defecto.
- **Código Konami** (↑↑↓↓←→←→BA): avistamiento OVNI en el espacio profundo.
- **Boot screen** "MISSION BOOT SEQUENCE" (clic para saltar).
