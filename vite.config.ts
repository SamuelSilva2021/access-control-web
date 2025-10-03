import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // Configurações para debug - desabilita HMR agressivo
  server: {
    hmr: {
      overlay: false, // Remove overlay de erros
    },
  },
  // Desabilita otimizações que podem causar reloads
  optimizeDeps: {
    disabled: false,
  },
})
