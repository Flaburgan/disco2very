// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import linguilint from 'eslint-plugin-lingui';
import react from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // Local checkout of the upstream ADEME data, not part of the project.
  { ignores: ['impactco2/'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  linguilint.configs['flat/recommended'],
  {
    files: ['**/*.tsx'],
    extends: [react.configs.recommended],
  },
  reactHooks.configs.flat['recommended-latest'],
  {
    // Playwright fixtures have a callback named "use" that is not a React hook.
    files: ['tests/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  }
);