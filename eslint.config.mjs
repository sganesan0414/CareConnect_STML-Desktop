import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Flat config. Three scopes: Node (main / preload / shared / build config) and
// the browser + React renderer.
export default [
  {
    ignores: ['out/**', 'release/**', 'dist/**', 'node_modules/**'],
  },

  js.configs.recommended,

  // Main process, preload, shared code and build config — Node environment.
  {
    files: ['src/main/**/*.js', 'src/preload/**/*.js', 'src/shared/**/*.js', '*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // React renderer — browser environment.
  {
    files: ['src/renderer/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // New JSX transform: React need not be in scope; prop-types not used.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Plain-language copy uses apostrophes freely; escaping hurts readability.
      'react/no-unescaped-entities': 'off',
    },
  },
];
