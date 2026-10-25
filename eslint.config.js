import js from '@eslint/js';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'blob-report/',
      'test-results/',
      'reports/',
      '.auth/',
      '.runtime/',
    ],
  },

  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
  },

  // Playwright rules for specs and fixtures (fixtures legitimately use expect for setup checks).
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.js', 'src/fixtures/**/*.js'],
    settings: { playwright: { globalAliases: { test: ['setup'] } } },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-conditional-in-test': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-wait-for-timeout': 'error',
    },
  },

  // Must stay last: turns off stylistic rules that Prettier owns.
  prettier,
];
