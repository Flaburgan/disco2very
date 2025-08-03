// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import linguilint from 'eslint-plugin-lingui';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  linguilint.configs['flat/recommended']
);