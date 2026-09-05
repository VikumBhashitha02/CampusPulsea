import { baseConfig } from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export const nestConfig = [
  ...baseConfig,
  {
    rules: {
      // NestJS uses decorators and DI patterns that trigger false positives
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
