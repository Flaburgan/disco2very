import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
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
  ],
  // Relative asset URLs: the Ubuntu Touch click package loads the app from
  // the local filesystem, not from a server root.
  base: "./",
  build: {
    // packaging/ubuntu-touch/www symlinks to out/, and the Playwright
    // webServer and the CI artifact expect it too.
    outDir: "out",
    // Oldest supported browser: QtWebEngine on Ubuntu Touch (Chromium 87).
    target: "chrome87",
  },
});
