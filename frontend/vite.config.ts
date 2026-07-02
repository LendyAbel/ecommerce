import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Separa dependencias grandes en chunks estables: si solo cambia
                // el código de la app, estos vendors siguen cacheados en el navegador.
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router'],
                    mui: [
                        '@mui/material',
                        '@mui/icons-material',
                        '@emotion/react',
                        '@emotion/styled',
                    ],
                    query: ['@tanstack/react-query', '@tanstack/react-form'],
                    motion: ['motion'],
                },
            },
        },
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3001',
        },
    },
});
