# disCO<sub>2</sub>very

A free software game designed to explore the orders of magnitude of CO<sub>2</sub> footprints in our daily lives and raise awareness about climate change.

*This application is based on the work of Thomas James Watson (thank you! ❤️) for [wikitrivia](https://wikitrivia.tomjwatson.com). Original source code available on [github](https://github.com/tom-james-watson/wikitrivia-scraper).*

## About

This project uses open data provided by ADEME (*Agence de l'Environnement et de la Maîtrise de l'Énergie*, the French state agency working on climate change). The raw data is available on the [ADEME website](https://www.ademe.fr/), either through a [user-friendly website](https://impactco2.fr), or via [an API](https://impactco2.fr/api-doc). To enable offline gameplay and reduce redundant API calls (since the data doesn't change frequently), the information is stored within the app and manually updated regularly. The last update was performed on **2026-07-09**.

⚠️ **Note:** Since the data is provided by ADEME, the CO<sub>2</sub> values are based on France's characteristics. A key difference compared to other countries is France’s low-carbon electricity sources. In contrast, countries relying on other electricity sources such as coal-fired power plants will have significantly higher CO<sub>2</sub> footprints for electricity-related activities.

## Contributions

Contributions to the project are very welcome! By contributing, you agree that your work will be licensed under the AGPL license (see the `LICENSE` file for details).

## Technical informations

This project is a [React](https://react.dev/) single-page application built with [Vite](https://vite.dev/).
NodeJS 24 or higher is required to build and run the project.

### Prerequisites

```bash
npm install
```

### Development

```bash
npm run dev
```

Then visit http://localhost:5173/ to preview the website.

### Static build

To build a static version of the website to the `out` folder, that you can then deploy anywhere (it's plain HTML + JS, no server needed) run:

```bash
npm run build
```

### Translations

disCO<sub>2</sub>very uses [Lingui](https://lingui.dev/) to manage translations. If you add or modify any text in the app, you must run:

```bash
npm run i18n-extract
```
This will modify the english keys in `locales/en/messages.po`. Look for entries starting with `#~`: these are now outdated and should be removed.
Then open the other languages files like `locales/fr/messages.po` and look for empty strings `""` to add the missing translations.

The `.po` catalogs are compiled automatically when the app is built or served, there is no separate compilation step.

### Adding a new language

Say you want to add Portuguese (`pt`). Two kinds of text need translating: the UI strings (buttons, instructions... managed by Lingui) and the game data (item names, explanations... coming from ADEME).

1. Declare the locale: Add `"pt"` to the `Locale` union in `types/i18n.ts`, to the `I18nString` interface below it, and to the `locales` list in `lib/locales.ts`. From here, `npm run build` fails with type errors on every place that must be completed.
2. UI strings: Run `npm run i18n-extract`: it creates `locales/pt/messages.po`. Fill every empty `msgstr ""` with the Portuguese translation, then register the catalog in `components/app.tsx` (add the `messages.po` import and a `pt` entry to `messagesByLocale`).
3. Game data: ADEME translates its data in French, English and Spanish only, so like German, Portuguese is maintained by hand in this repository:
   - Copy `data/ademe/locales/de.json` to `pt.json` and translate its three sections: `names` (the item names), `hypothesis` (the explanation texts) and `ecv` (the footprint detail labels).
   - Add `"pt"` to the `handMaintainedLocales` list in `scripts/update-ademe-data.mjs`: every future data update will then report the entries missing in `pt.json`. Running `npm run update-ademe` while you translate gives you a live todo-list.
   - Register the file in `lib/ademe-api.ts` (a `pt` entry in `localeImports`).
   - Translate the category names in `data/ademe/0-categories.json` (a `pt` field next to `en`/`fr`/`es`/`de`).

   If a future locale *is* translated upstream by ADEME, skip the hand-maintained file and add it to the extraction list in `scripts/update-ademe-data.mjs` instead.
4. Verify: `npm run build` must pass without type errors, then `npm run test-e2e`.

The app picks the language from the browser (`navigator.language`), so testing locally is easiest by changing the preferred language in the browser settings.

### Update data

The data used is hardcoded in the code to allow to play offline. That's why it's important to regularly pull the latest data from the ImpactCO2 github repository.
1. For the data, run the extraction script against a local checkout of the [impactco2 repository](https://github.com/incubateur-ademe/impactco2):
   ```bash
   git -C impactco2 pull   # or clone it first
   npm run update-ademe    # accepts a path: npm run update-ademe -- /path/to/impactco2
   npm run format          # the upstream files use another code style
   ```
   The script refreshes `data/ademe/categories/*.ts` (the footprint numbers) and `data/ademe/locales/{fr,en,es}.json` (names, hypothesis texts, footprint detail labels). Watch its output: it warns about entries missing in the upstream translations (marked `MISSING_TRANSLATIONS` in the files) and lists what needs translating in the hand-maintained locales like `de.json`.
   - `git diff` the result: if a new category appeared, complete `data/ademe/0-categories.json` (id, translated names, sources — compare with impactco2's `src/data/categories.tsx`) and the category list in `scripts/update-ademe-data.mjs`.
   - New transport variants only enter the game once they have a journey length in `data/transport-distances.json`.
2. For the icons,
   - Download all the SVG icons from [the github repository](https://github.com/incubateur-ademe/impactco2/tree/develop/public/icons) `public/icons` folder and save them in `public/images/ademe`
   - Execute the `./clean-ademe-image.sh` script, as not all the ADEME images are used in disCO2very, so no need to bundle them
3. Run `npm run build && npm run test-e2e`, and play a quick game to check the values look sane.
4. Finish by updating the date above in this file, to inform people of the last time the data has been updated
