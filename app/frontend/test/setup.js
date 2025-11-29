import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Clean up the DOM after each test
afterEach(() => {
  cleanup()
})

// Global mocks (if needed). For example, for ResizeObserver, which is missing in jsdom.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
