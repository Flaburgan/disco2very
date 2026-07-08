# AGENTS.md

## What this is

disCO2very: a free software (AGPL) card game about CO2 footprint orders of magnitude. Player places item cards on a timeline sorted by CO2 footprint. Fork of wikitrivia. Data comes from ADEME (impactco2.fr), hardcoded locally for offline play, updated manually (procedure in `README.md`).

## Stack

- Vite + React 19 + TypeScript single-page app, static build (`npm run build` -> `out/`, no server needed).
- Browser floor: Chrome 87 (Ubuntu Touch QtWebEngine). Enforced by `build.target` in `vite.config.ts` (syntax) and `lib: ES2021` in `tsconfig.json` (APIs) - do not raise either.
- SCSS modules in `styles/` (one file per component).
- Drag and drop: custom pointer-event implementation in `lib/use-card-drag.ts` (auto-move animation in `lib/auto-move.ts`).
- i18n: Lingui (macros via Babel in `@vitejs/plugin-react`, pinned to v5 which still supports Babel). Locales `en` (source), `fr`, `es`, `de`. Catalogs in `locales/{locale}/messages.po`, compiled on the fly by `@lingui/vite-plugin`.
- Optional backend: plain PHP in `server/` (telemetry, newsletter, stats), deployed at `https://www.disco2very.org/server/`. App works without it.
- Packaging for Ubuntu Touch in `packaging/ubuntu-touch/`.

## Layout

- `index.html` (static meta tags, English) + `main.tsx` (entry, renders `components/app.tsx`).
- `components/` - all UI. Key flow: `app.tsx` (locale detection, localizes the meta tags) -> `game.tsx` (state, restart, records game via `lib/server.ts`) -> `board.tsx` (drag handling via `lib/use-card-drag.ts`, placement checked by `checkCorrect`) -> `next-item-list` / `played-item-list` / `item-card` / `draggable-item-card`. Other: `categories-selector`, `explanation-dialog`, `game-over`, `hearts`, `score`, `chart-bar`, `instructions`, `email-registration`, `real-cards-game`.
- `lib/` - core logic:
  - `ademe-api.ts`: imports all JSON data per locale, builds item lists, `getCategories`, `getItemsFromCategories`, coefficients. Central data hub.
  - `items.ts`: gameplay helpers (`checkCorrect`, `displayCO2`, `round2`, `getDefaultItems`).
  - `create-state.ts`: initial `GameState`.
  - `server.ts`: telemetry POST (`SERVER_URL`).
  - `use-card-drag.ts` / `auto-move.ts`: drag-and-drop and card animations.
  - `locales.ts`: locale list, shared with `lingui.config.ts` (never import `lingui.config.ts` from app code: it pulls the PO parser into the bundle).
  - `cx.ts`: class-name joining helper (replaces the `classnames` package).
- `data/ademe/` - hardcoded ADEME data: `0-categories.json`, per-locale dirs `en|fr|es|de/{n}-{category}.json`, `footprintDetailCategories.json`, plus `categories/*.ts` compute helpers.
- `types/` - `Item`/`PlayedItem`, `GameState` (deck, lives, next, played, badlyPlaced), `AdemeECV`, `Locale`.
- `server/` - PHP: `telemetry.php`, `newsletter.php`, `stats.php`, `db.php`, `allowed-origins.php`.
- `clean-ademe-image.sh` - prunes unused ADEME SVG icons after a data update.

## Commands (ask user to run them)

- Setup: `npm install`.
- Dev: `npm run dev` (localhost:5173). Build: `npm run build` (`tsc --noEmit` + `vite build`).
- Lint: `npm run lint` (eslint, max-warnings=0, includes lingui plugin). Format: `npm run format` (prettier).
- i18n: any text change requires `npm run i18n-extract`, remove `#~` obsolete entries in `locales/en/messages.po`, fill `""` in other locales. No compile step: catalogs compile at build time.
- e2e tests: `npm run build && npm run test-e2e` (Playwright in `tests/e2e/`, serves `out/` via `vite preview`).

## Conventions / constraints

- All user-facing strings via Lingui macros (`t`, `<Trans>`); eslint enforces it.
- Privacy-first, everything local: no external requests except the project's own `server/` PHP endpoints. No GAFAM services.
- Data is static imports, no runtime API calls to ADEME.
- CO2 values are France-based (low-carbon electricity).
- New component = `components/x.tsx` + `styles/x.module.scss`.
- e2e selectors match CSS-module classes with `[class*="_name_"]` patterns: a class name referenced by a test must stay unique across all `.module.scss` files (rename on collision, e.g. board uses `top-panel`/`bottom-panel`).

## Data update procedure

See `README.md` section "Update data": fetch from impactco2.fr API per category and language into `data/ademe/{locale}/`, check `footprintDetailCategories.json` ids, update icons + run `clean-ademe-image.sh`, bump the update date in `README.md`.
