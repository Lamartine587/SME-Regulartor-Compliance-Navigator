import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, './'), 
  server: {
    allowedHosts: [
      'warner-nonexhortatory-marybeth.ngrok-free.dev', 
      '.ngrok-free.dev' 
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