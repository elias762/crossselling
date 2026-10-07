import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`        → normales Web-Deployment (dist/)
// `npm run build:single` → eine einzige HTML-Datei (offline, Doppelklick genügt)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  base: './',
  build: {
    outDir: mode === 'single' ? 'offline' : 'dist',
    emptyOutDir: true,
  },
}))
