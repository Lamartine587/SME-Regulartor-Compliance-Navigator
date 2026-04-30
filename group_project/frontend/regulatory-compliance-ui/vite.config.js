import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This allows ngrok to bypass the "Blocked request" security check
    allowedHosts: [
      'warner-nonexhortatory-marybeth.ngrok-free.dev', 
      '.ngrok-free.dev' // Use this to allow any ngrok tunnel
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})