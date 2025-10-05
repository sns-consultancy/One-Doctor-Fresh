import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
 // read .env.local if present
const VITE_API_BASE = process.env.VITE_API_BASE
return {
plugins: [react()],
build: { outDir: 'dist' },
server: {
port: 5174,
proxy: {
        '/api': {
          target: VITE_API_BASE || 'https://one-doctor-service-fresh-ztxv.onrender.com',
         changeOrigin: true,
         secure: false,
        },
     },
    },
  }
})



