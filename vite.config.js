import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tailwindcss(),react()],
    base: '/convoice', // Ersetze mit deinem Repository-Namen
    build: {
        outDir: 'dist'
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
        },
    },
})