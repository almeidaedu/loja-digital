import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // `describe`/`it`/`expect` vêm de `import { ... } from 'vitest'`. Sem
    // globais o ESLint não precisa de exceção e fica explícito de onde vem cada
    // coisa.
    globals: false,
    // Os componentes importam `./X.css`. Processar CSS de verdade no teste só
    // custa tempo — nenhuma asserção olha estilo computado.
    css: false,
    restoreMocks: true,
  },
})
