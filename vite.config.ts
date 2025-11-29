// @ts-ignore
import react from '@vitejs/plugin-react'
// @ts-ignore
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
// @ts-ignore
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [react(), tailwindcss(), RubyPlugin()],
  resolve: {
    alias: {
      // @ts-ignore
      '@': fileURLToPath(new URL('./app/frontend', import.meta.url)),
    },
  },
})
