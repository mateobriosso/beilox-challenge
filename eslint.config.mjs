// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * ESLint flat configuration.
 *
 * Layers:
 *  1. Global ignores for generated output and dependencies.
 *  2. Base JavaScript rules (applies to this config file too).
 *  3. Type-aware TypeScript rules for every `.ts` file, enforcing the project
 *     conventions: no `any`, explicit return types, no floating promises.
 *  4. Playwright rules for spec files, forbidding fixed waits and encouraging
 *     web-first assertions.
 */
export default defineConfig(
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'test-results/**',
    'playwright-report/**',
    'blob-report/**',
    'playwright/.cache/**',
  ]),

  js.configs.recommended,

  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { playwright },
    rules: {
      // Challenge rule: never use `any`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Async correctness: page-object and API calls must always be awaited.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'off',

      // Readability and reusability.
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', modifiers: ['const'], format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'import', format: null },
      ],

      // Challenge rule: no fixed waits anywhere, including page objects and helpers.
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-eval': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-force-option': 'error',
    },
  },

  {
    files: ['tests/**/*.ts'],
    // The plugin is already registered in the `**/*.ts` block above, so spread the
    // recommended rule set instead of extending the bundled config (which would
    // re-register the plugin under a different object and make ESLint fail).
    languageOptions: playwright.configs['flat/recommended'].languageOptions,
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Re-assert challenge rule at error level (recommended only warns).
      'playwright/no-wait-for-timeout': 'error',
      'playwright/expect-expect': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/prefer-to-have-length': 'error',
      'playwright/prefer-to-have-count': 'error',
      'playwright/prefer-to-be': 'error',
      'playwright/prefer-strict-equal': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-raw-locators': 'off',
      'playwright/valid-title': ['error', { ignoreTypeOfTestName: false }],
      'playwright/no-duplicate-hooks': 'error',
      'playwright/no-nested-step': 'error',
      'playwright/prefer-hooks-on-top': 'error',
      'playwright/require-top-level-describe': 'error',
    },
  },

  {
    files: ['**/*.mjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
);
