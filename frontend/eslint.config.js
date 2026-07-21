import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            regex: '^\\.\\./',
                            message:
                                'No se permiten imports relativos al padre ("../"). Usa el alias "@/" para cualquier import fuera de la carpeta actual; "./" solo dentro de la misma carpeta.',
                        },
                        {
                            regex: '^@/features/[^/]+/?$',
                            message:
                                'No importes el barrel de una feature. Importa directamente el módulo (p. ej. "@/features/cart/store/cartStore").',
                        },
                    ],
                },
            ],
        },
    },
]);
