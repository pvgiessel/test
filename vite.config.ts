import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Op GitHub Pages staat de app onder https://<gebruiker>.github.io/test/,
// dus daar is een base-pad '/test/' nodig. Lokaal blijft het gewoon '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/test/' : '/',
})
