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
      '@typescript-eslint/no-explicit-any': 'warn',
      // Use the correct rule for component tag order
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
      // Disable formatting rules that conflict with Prettier
      'vue/html-indent': 'off',
      'vue/html-quotes': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-newline': 0,
    },
  },
]
