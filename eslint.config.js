import { configApp } from '@adonisjs/eslint-config'
import pluginVue from 'eslint-plugin-vue'

export default [
  ...configApp(),
  // Vue-specific configuration
  ...pluginVue.configs['flat/recommended'],

  // Override for Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      // Customize Vue rules as needed
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      // Use the correct rule for component tag order
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
    },
  },

  // TypeScript in Vue files
  {
    files: ['**/*.vue'],
    rules: {
      // Allow any type in Vue files for flexibility
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
