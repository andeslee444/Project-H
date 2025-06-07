import { ReactElement } from 'react'
import { render, renderHook, RenderOptions, RenderHookOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Custom render function that ensures proper DOM container setup
export function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'container'>) {
  // Create a proper container element
  const container = document.createElement('div')
  container.setAttribute('data-testid', 'test-container')
  document.body.appendChild(container)

  const result = render(ui, {
    container,
    ...options,
  })

  // Clean up after test
  const originalUnmount = result.unmount
  result.unmount = () => {
    originalUnmount()
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  return result
}

// Custom renderHook function with proper cleanup
export function customRenderHook<Result, Props>(
  callback: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props>
) {
  // Create a proper container element
  const container = document.createElement('div')
  container.setAttribute('data-testid', 'hook-test-container')
  document.body.appendChild(container)

  const result = renderHook(callback, {
    ...options,
    wrapper: options?.wrapper,
  })

  // Clean up after test
  const originalUnmount = result.unmount
  result.unmount = () => {
    originalUnmount()
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  return result
}

// Helper to create a mock component for testing
export function createMockComponent(name: string, props: any = {}) {
  const MockComponent = (componentProps: any) => {
    return <div data-testid={`mock-${name.toLowerCase()}`} {...componentProps} />
  }
  MockComponent.displayName = `Mock${name}`
  return MockComponent
}

// Helper to mock a React context
export function mockContext<T>(defaultValue: T) {
  return {
    Provider: ({ children, value }: { children: React.ReactNode; value?: T }) => (
      <div data-testid="mock-context-provider">{children}</div>
    ),
    Consumer: ({ children }: { children: (value: T) => React.ReactNode }) => (
      <div data-testid="mock-context-consumer">{children(defaultValue)}</div>
    ),
  }
}

// Helper to wait for DOM updates
export function waitForDOMUpdate() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Re-export everything from RTL but with our custom render as default
export * from '@testing-library/react'
export { customRender as render, customRenderHook as renderHook }