# AGENTS.md

## What this is

disCO2very: a free software (AGPL) card game about CO2 footprint orders of magnitude. Player places item cards on a timeline sorted by CO2 footprint. Fork of wikitrivia. Data comes from ADEME (impactco2.fr), hardcoded locally for offline play, updated manually (procedure in `README.md`).

## Stack

- Next.js 14 (pages router) + React 18 + TypeScript, static export (`npm run build` -> `out/`, no server needed).
- SCSS modules in `styles/` (one file per component).
- Drag and drop: `react-beautiful-dnd` + `tween-functions` (auto-move in `lib/useAutoMoveSensor.ts`).
- i18n: Lingui, locales `en` (source), `fr`, `es`, `de`. Catalogs in `locales/{locale}/messages.po`.
- Optional backend: plain PHP in `server/` (telemetry, newsletter, stats), deployed at `https://www.disco2very.org/server/`. App works without it.
- Packaging for Ubuntu Touch in `packaging/ubuntu-touch/`.

## Layout

- `pages/` - `_app.tsx`, `index.tsx` only.
- `components/` - all UI. Key flow: `app.tsx` -> `game.tsx` (state, restart, records game via `lib/server.ts`) -> `board.tsx` (drag-and-drop logic, `onDragEnd` -> `checkCorrect`) -> `next-item-list` / `played-item-list` / `item-card` / `draggable-item-card`. Other: `categories-selector`, `explanation-dialog`, `game-over`, `hearts`, `score`, `chart-bar`, `instructions`, `email-registration`, `real-cards-game`.
- `lib/` - core logic:
  - `ademe-api.ts`: imports all JSON data per locale, builds item lists, `getCategories`, `getItemsFromCategories`, coefficients. Central data hub.
  - `items.ts`: gameplay helpers (`checkCorrect`, `displayCO2`, `round2`, `getDefaultItems`).
  - `create-state.ts`: initial `GameState`.
  - `server.ts`: telemetry POST (`SERVER_URL`).
- `data/ademe/` - hardcoded ADEME data: `0-categories.json`, per-locale dirs `en|fr|es|de/{n}-{category}.json`, `footprintDetailCategories.json`, plus `categories/*.ts` compute helpers.
- `types/` - `Item`/`PlayedItem`, `GameState` (deck, lives, next, played, badlyPlaced), `AdemeECV`, `Locale`.
- `server/` - PHP: `telemetry.php`, `newsletter.php`, `stats.php`, `db.php`, `allowed-origins.php`.
- `clean-ademe-image.sh` - prunes unused ADEME SVG icons after a data update.

## Commands (ask user to run them)

- Setup: `npm install && npm run i18n-compile` (compile is mandatory before dev/build).
- Dev: `npm run dev` (localhost:3000). Build: `npm run build`.
- Lint: `npm run lint` (eslint, max-warnings=0, includes lingui plugin). Format: `npm run format` (prettier).
- i18n: any text change requires `npm run i18n-extract`, remove `#~` obsolete entries in `locales/en/messages.po`, fill `""` in other locales, then `npm run i18n-compile`.
- No test suite.

## Conventions / constraints

- All user-facing strings via Lingui macros (`t`, `<Trans>`); eslint enforces it.
- Privacy-first, everything local: no external requests except the project's own `server/` PHP endpoints. No GAFAM services.
- Data is static imports, no runtime API calls to ADEME.
- CO2 values are France-based (low-carbon electricity).
- New component = `components/x.tsx` + `styles/x.module.scss`.

## Data update procedure

See `README.md` section "Update data": fetch from impactco2.fr API per category and language into `data/ademe/{locale}/`, check `footprintDetailCategories.json` ids, update icons + run `clean-ademe-image.sh`, bump the update date in `README.md`.
