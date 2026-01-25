// Vite configuration for the frontend build and dev server.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
})
