// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import linguilint from 'eslint-plugin-lingui';

export default tseslint.config(
  // Local checkout of the upstream ADEME data, not part of the project.
  { ignores: ['impactco2/'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  linguilint.configs['flat/recommended']
);