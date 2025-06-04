import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/Project-H/' : '/',
  server: {
    host: 'localhost',
    port: 5173,
    open: false,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
