import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves the site under /<repo>/ until a custom domain is set (BASE_PATH=/ then).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
