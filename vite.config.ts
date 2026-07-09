import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";
import { viteSingleFile } from "vite-plugin-singlefile";

// The Ubuntu Touch webapp-container loads the app over file://, where
// Chromium refuses to fetch <script type="module"> (CORS on an opaque
// origin). `vite build --mode ubuntu-touch` therefore inlines all JS and
// CSS into a single index.html, straight into the click package sources.
export default defineConfig(({ mode }) => {
  const ubuntuTouch = mode === "ubuntu-touch";

  return {
    plugins: [
      // plugin-react is pinned to v5: v6 replaced Babel with oxc and the
      // Lingui macros below require a Babel transform.
      react({
        babel: {
          // Transforms the Lingui macros (t, Trans, msg) into runtime calls.
          plugins: ["@lingui/babel-plugin-lingui-macro"],
        },
      }),
      // Compiles the imported locales/*/messages.po catalogs on the fly.
      lingui(),
      ...(ubuntuTouch ? [viteSingleFile()] : []),
    ],
    // Relative asset URLs: the Ubuntu Touch click package loads the app from
    // the local filesystem, not from a server root.
    base: "./",
    build: {
      // The Playwright webServer and the CI artifact expect out/.
      outDir: ubuntuTouch ? "packaging/ubuntu-touch/www" : "out",
      // Oldest supported browser: QtWebEngine on Ubuntu Touch (Chromium 87).
      target: "chrome87",
    },
  };
});
