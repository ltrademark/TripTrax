import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  server: {
    host: true, // Listen on all addresses
    watch: {
      usePolling: true, // Better for WSL environments
      interval: 100 // Polling interval in ms
    },
    hmr: {
      overlay: true, // Show errors in browser overlay
      port: 24678 // Dedicated WebSocket port
    }
  },
  plugins: [
    vue(),
    svgLoader()
  ]
})
