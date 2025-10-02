import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy under a subpath (e.g. example.com/app), set base: '/app/'
export default defineConfig({
  plugins: [react()],
  base: '/',                   // change if deploying under a subfolder
  server: { host: true, port: 5173, strictPort: false },
  preview: { host: true, port: 4173 }
})


