import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Очистка DOM после каждого теста
afterEach(() => {
  cleanup()
})

// Глобальные моки (если нужны). Например, для ResizeObserver, которого нет в jsdom.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
