import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 1000, // Aumentar límite a 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ethers: ['ethers'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  }
})

