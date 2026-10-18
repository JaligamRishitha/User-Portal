import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // exceljs is only loaded via dynamic import(), so pre-bundle it at startup
  // instead of letting Vite discover it mid-session (which invalidates the dep URL)
  optimizeDeps: {
    include: ['exceljs']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
