import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': 'http://localhost:8080', // za local development
      },
    },
    define: {
      __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8080'),
    },
  }
})
