// Catalogs are imported as .po files, compiled by @lingui/vite-plugin.
declare module "*.po" {
  import type { Messages } from "@lingui/core";
  export const messages: Messages;
}
