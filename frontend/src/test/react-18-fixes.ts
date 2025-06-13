// React 18 test fixes
import { act as reactAct } from '@testing-library/react';

// Override the global act to handle React 18 properly
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Fix for "Should not already be working" error
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOMTestUtils.act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Export a fixed act that works with React 18
export const act = (callback: () => void | Promise<void>) => {
  return reactAct(async () => {
    await callback();
  });
};