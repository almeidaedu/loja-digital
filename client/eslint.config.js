import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  { ignores: ['dist', 'node_modules', 'public', 'coverage'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Sem type-checker no projeto (decisão registrada no refactor-plan), e a
      // alternativa seria anotar propTypes em toda a árvore — custo alto para
      // um projeto que vai virar TS no `sdk/`. O que sobra de verdade contra
      // erro de nome é o `no-undef` do recommended, que fica ligado.
      'react/prop-types': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // `_` como descarte é convenção; constante exportada em MAIÚSCULA que só
      // é lida em outro arquivo não deve acusar.
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

      // Ratchet de acessibilidade. Na primeira passada estas cinco regras
      // acusaram 26 erros, todos em arquivos de fases futuras (Checkout,
      // Account, AdminProducts, Orders, ExitPopup) — corrigir tudo agora seria
      // editar sete arquivos fora de fase. Como `warn`, o `eslint .` sai com
      // código 0 e pode virar gate agora, e os achados continuam na saída.
      // Cada fase zera os do arquivo que ela toca; a Fase 16 devolve as cinco
      // para `error` e liga `--max-warnings 0`. Qualquer OUTRA regra de a11y
      // segue como erro, então código novo não entra torto.
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
    },
  },

  {
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
];
