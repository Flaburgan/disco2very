// Plain (non-module) stylesheet imports like "styles/globals.scss" have no
// declaration in Next's global.d.ts, which only covers "*.module.scss".
// TypeScript 6 requires even side-effect imports to resolve (TS2882).
declare module "*.scss";
