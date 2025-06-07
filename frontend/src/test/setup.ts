import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Setup globals before all tests
beforeAll(() => {
  // Mock performance API if not available
  if (!global.performance) {
    global.performance = {
      now: () => Date.now(),
      measure: vi.fn(),
      mark: vi.fn(),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      timing: {
        navigationStart: Date.now() - 1000,
        domContentLoadedEventEnd: Date.now() - 500,
        loadEventEnd: Date.now() - 100
      } as any,
      navigation: {
        type: 0
      } as any
    } as any;
  }

  // Mock PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => [])
  }));

  // Mock secure context for SessionManager
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    writable: true,
    configurable: true
  });

  // Mock location for HTTPS
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      protocol: 'https:',
      hostname: 'localhost',
      href: 'https://localhost:5173'
    },
    writable: true,
    configurable: true
  });

  // Mock crypto API for session management
  if (!global.crypto) {
    global.crypto = {
      subtle: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        generateKey: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        deriveBits: vi.fn(),
        deriveKey: vi.fn(),
        digest: vi.fn(),
        sign: vi.fn(),
        verify: vi.fn()
      } as any,
      getRandomValues: (arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
    } as any;
  }
});

// Cleanup after each test case
afterEach(() => {
  cleanup()
  // Clear all timer mocks after each test
  vi.clearAllTimers()
})

// Mock handlers for MSW
export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token*', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'patient'
      }
    })
  }),

  // Mock Supabase data endpoints
  http.get('*/rest/v1/patients*', () => {
    return HttpResponse.json([
      {
        id: 'mock-patient-1',
        first_name: 'Test',
        last_name: 'Patient',
        email: 'patient@test.com'
      }
    ])
  }),

  // Mock Supabase RPC calls
  http.post('*/rest/v1/rpc/*', () => {
    return HttpResponse.json({ success: true })
  })
]

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Close server after all tests
afterAll(() => {
  server.close()
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
})

// Global test configuration
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock document.createElement for testing
const originalCreateElement = document.createElement;
document.createElement = function(tagName: string) {
  const element = originalCreateElement.call(this, tagName);
  // Ensure all elements have basic properties
  if (!element.style) {
    Object.defineProperty(element, 'style', {
      value: {},
      writable: true,
      configurable: true
    });
  }
  return element;
}

// Mock HTMLElement methods that might be missing
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || function() {};
  HTMLElement.prototype.focus = HTMLElement.prototype.focus || function() {};
  HTMLElement.prototype.blur = HTMLElement.prototype.blur || function() {};
  HTMLElement.prototype.click = HTMLElement.prototype.click || function() {};
}

// Mock Range API
if (typeof Range === 'undefined') {
  global.Range = class Range {
    createContextualFragment() {
      const div = document.createElement('div');
      return div;
    }
    selectNode() {}
    selectNodeContents() {}
    setStart() {}
    setEnd() {}
    collapse() {}
    getBoundingClientRect() {
      return {
        x: 0, y: 0, width: 0, height: 0,
        top: 0, right: 0, bottom: 0, left: 0,
        toJSON: () => ({})
      };
    }
  } as any;
}

// Mock Selection API
if (typeof Selection === 'undefined') {
  global.Selection = class Selection {
    rangeCount = 0;
    type = 'None';
    getRangeAt() { return new Range(); }
    removeAllRanges() {}
    addRange() {}
  } as any;
}

// Ensure getSelection exists
if (!global.getSelection) {
  global.getSelection = () => new Selection() as any;
}