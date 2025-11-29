// @ts-ignore
import react from '@vitejs/plugin-react'
// @ts-ignore
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
// @ts-ignore
import { fileURLToPath, URL } from 'url'

// @ts-ignore
export default defineConfig({
  plugins: [react(), tailwindcss(), RubyPlugin()],
  resolve: {
    alias: {
      // @ts-ignore
      '@': fileURLToPath(new URL('./app/frontend', import.meta.url)),
    },
  },
  // @ts-ignore
  test: {
    globals: true, // Позволяет использовать describe, it, expect без импорта
    environment: 'jsdom', // Эмулируем браузер (DOM)
    setupFiles: 'test/setup.js', // Файл предварительной настройки
    css: true, // Обрабатывать CSS (полезно, если классы влияют на логику)
  },
})
