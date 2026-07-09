# Ubuntu Touch build

[![OpenStore](https://open-store.io/badges/en_US.png)](https://open-store.io/app/disco2very.flaburgan)

[Ubuntu Touch](https://www.ubuntu-touch.io/) is a GNU/Linux operating system for mobile phone and desktop pc running the Lomiri interface (shell) based on Qt.

**You don't need to build disCO2very yourself to run it on your phone**, it is available on the [official OpenStore](https://open-store.io/app/disco2very.flaburgan), or you can also download the `.click` file as an artifact of the CI here on github.

## Build

disCO2very is built for this platform using the official [clickable](https://clickable-ut.dev) tool.

If you want to build and run disCO2very on your Ubuntu Touch phone, start by installing clickable, plug your UT phone to your computer, go in the settings to enable developer mode, then build the app with `npm run build:ut` from the repository root, and finally naviguate to this folder (`/packaging/ubuntu-touch`) and run `clickable`.

### Technical details

The application path is referenced in the `disco2very.desktop` file, to `www/index.html`. The `www` folder is produced by `npm run build:ut` (`vite build --mode ubuntu-touch`), which differs from the regular web build (`out/`): the webapp-container loads the app over `file://`, where Chromium blocks `<script type="module">` for CORS reasons, so this build inlines all the JS and CSS into a single self-contained `index.html` (see `vite-plugin-singlefile` in `vite.config.ts`). Only the images and other public files remain as separate files next to it.
