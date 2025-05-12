// client/vite.config.js - Update to ensure proper HMR for Three.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['three', 'gsap', 'framer-motion']
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'animations': ['gsap', 'framer-motion']
        }
      }
    },
    target: 'esnext'
  }
})