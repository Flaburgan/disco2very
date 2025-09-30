# disCO<sub>2</sub>very

A free software game designed to explore the orders of magnitude of CO<sub>2</sub> footprints in our daily lives and raise awareness about climate change.

*This application is based on the work of Thomas James Watson (thank you! ❤️) for [wikitrivia](https://wikitrivia.tomjwatson.com). Original source code available on [github](https://github.com/tom-james-watson/wikitrivia-scraper).*

## About

This project uses open data provided by ADEME (*Agence de l'Environnement et de la Maîtrise de l'Énergie*, the French state agency working on climate change). The raw data is available on the [ADEME website](https://www.ademe.fr/), either through a [user-friendly website](https://impactco2.fr), or via [an API](https://impactco2.fr/api-doc). To enable offline gameplay and reduce redundant API calls (since the data doesn't change frequently), the information is stored within the app and manually updated regularly. The last update was performed on **2025-03-05**.

⚠️ **Note:** Since the data is provided by ADEME, the CO<sub>2</sub> values are based on France's characteristics. A key difference compared to other countries is France’s low-carbon electricity sources. In contrast, countries relying on other electricity sources such as coal-fired power plants will have significantly higher CO<sub>2</sub> footprints for electricity-related activities.

## Contributions

Contributions to the project are very welcome! By contributing, you agree that your work will be licensed under the AGPL licence (see the `LICENSE` file for details).

## Technical informations

This project is using the [Next.js](https://nextjs.org/) framework, itself based on React.
NodeJS 18.17.0 or higher is required to build and run the project.

### Prerequisites

```bash
npm install
npm run i18n-compile
```

### Development

```bash
npm run dev
```

Then visit http://localhost:3000/ to preview the website.

### Translations

disCO<sub>2</sub>very uses [Lingui](https://lingui.dev/) to manage translations. If you add or modify any text in the app, you must run:

```bash
npm run i18n-extract
```
This will modify the english keys in `locales/en/messages.po`. Look for entries starting with `#~`: these are now outdated and should be removed.
Then open the other languages files like `locales/fr/messages.po` and look for empty strings `""` to add the missing translations.

Once done, run:
```bash
npm run i18n-compile
```

### Static build

To build a static version of the website to the `out` folder, that you can then deploy anywhere (it's plain HTML + JS, no server needed) run:

```bash
npm run build
```

### Update data

The data used is hardcoded in the code to allow to play offline. That's why it's important to regularly pull the latest data from the ImpactCO2 github repository.
1. For the data, use the ADEME [API documentation page](https://impactco2.fr/doc/api) to execute queries.
   - Start with the `/thematiques` route, click on `Try it out` and then compare the categories with `data/ademe/0-categories.json` and complete the file if needed
   - Then use the `/thematiques/ecv/{id}` route, execute it with the `detail` parameter set to `1` for each category number and each language, and copy paste the response to the corresponding file in `data/ademe/{language}/{thegoodfile}.json`
   - `git diff` your changes to check the `id`s used in `footprintDetail`, it has to have a matching ID in `data/ademe/footprintDetailCategories.json`. If you are missing it here, you have to investigate in the ImpactCO2 website to find what the new category is, as they are not providing them in the API
2. For the icons,
   - Download all the SVG icons from [the github repository](https://github.com/incubateur-ademe/impactco2/tree/develop/public/icons) `public/icons` folder and save them in `public/images/ademe`
   - Execute the `./clean-ademe-image.sh` script, as not all the ADEME images are used in disCO2very, so no need to bundle them
