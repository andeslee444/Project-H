/**
 * Accessibility Testing Hooks Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '../../../test/utils/render';
import { 
  useAccessibilityTest,
  useAccessibilityMonitoring,
  useAccessibilityCompliance,
  useKeyboardNavigationTest,
  useScreenReaderTest
} from '../hooks/useAccessibilityTesting';

// Mock the AccessibilityTester
vi.mock('../AccessibilityTester', () => ({
  accessibilityTester: {
    initialize: vi.fn(),
    generateReport: vi.fn(),
    testHealthcarePatterns: vi.fn(),
    cleanup: vi.fn()
  }
}));

// Mock DOM APIs - extend the existing document instead of replacing it
const mockElement = {
  tagName: 'BUTTON',
  hasAttribute: vi.fn(),
  getAttribute: vi.fn(),
  textContent: 'Test Button',
  focus: vi.fn(),
  blur: vi.fn()
};

const originalQuerySelectorAll = document.querySelectorAll;
const originalCreateElement = document.createElement;

// Mock activeElement to prevent "instanceof" errors  
Object.defineProperty(document, 'activeElement', {
  get: () => mockElement,
  configurable: true
});

// Create mockDocument for tests that reference it
const mockDocument = document as any;

vi.spyOn(document, 'querySelectorAll').mockImplementation((selector) => {
  if (selector.includes('button') || selector.includes('focusable')) {
    return [mockElement] as any;
  }
  return originalQuerySelectorAll.call(document, selector);
});

vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'div' && !document.getElementById('test-element')) {
    const element = originalCreateElement.call(document, tagName);
    element.setAttribute = vi.fn();
    element.style = {};
    element.textContent = '';
    return element;
  }
  return originalCreateElement.call(document, tagName);
});

Object.defineProperty(global, 'window', {
  value: {
    location: { pathname: '/test' },
    getComputedStyle: vi.fn(() => ({
      outline: '2px solid blue',
      boxShadow: 'none',
      border: '1px solid black'
    }))
  },
  configurable: true
});

Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    timing: {
      navigationStart: Date.now() - 1000
    }
  }
});

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-agent'
  }
});

describe('Accessibility Testing Hooks', () => {
  beforeAll(() => {
    // Ensure clean timer state
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('useAccessibilityTest', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useAccessibilityTest());

      // Wait for any effects to settle
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.report).toBeNull();
      expect(result.current.isRunning).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.runTest).toBe('function');
    });

    it('should run accessibility test', async () => {
      const { accessibilityTester } = await import('../AccessibilityTester');
      
      const mockReport = {
        reportId: 'test-report',
        url: 'https://test.com',
        timestamp: new Date(),
        testEngine: 'axe-core',
        testEngineVersion: '4.7.0',
        violations: [],
        incomplete: [],
        passes: [],
        inapplicable: [],
        summary: {
          totalTests: 10,
          violationCount: 0,
          incompleteCount: 0,
          passCount: 10,
          inapplicableCount: 0,
          criticalIssues: 0,
          seriousIssues: 0,
          moderateIssues: 0,
          minorIssues: 0
        },
        recommendations: [],
        complianceLevel: 'compliant' as const
      };

      (accessibilityTester.generateReport as any).mockResolvedValue(mockReport);

      const { result } = renderHook(() => useAccessibilityTest());

      await act(async () => {
        await result.current.runTest();
      });

      expect(result.current.report).toEqual(mockReport);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle test errors', async () => {
      const { accessibilityTester } = await import('../AccessibilityTester');
      
      (accessibilityTester.generateReport as any).mockRejectedValue(new Error('Test failed'));

      const { result } = renderHook(() => useAccessibilityTest());

      await act(async () => {
        await result.current.runTest();
      });

      expect(result.current.report).toBeNull();
      expect(result.current.isRunning).toBe(false);
      expect(result.current.error).toBe('Test failed');
    });

    it('should test specific element when ref provided', async () => {
      const { accessibilityTester } = await import('../AccessibilityTester');
      
      const elementRef = { current: mockElement as any };
      const { result } = renderHook(() => useAccessibilityTest(elementRef));

      await act(async () => {
        await result.current.runTest();
      });

      expect(accessibilityTester.generateReport).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('useAccessibilityMonitoring', () => {
    beforeEach(() => {
      // Reset to real timers first
      vi.useRealTimers();
      vi.clearAllTimers();
      // Then set up fake timers
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('should initialize monitoring state', () => {
      const { result } = renderHook(() => useAccessibilityMonitoring());

      expect(result.current.violations).toEqual([]);
      expect(result.current.lastCheck).toBeNull();
      expect(result.current.isMonitoring).toBe(false);
      expect(typeof result.current.startMonitoring).toBe('function');
      expect(typeof result.current.stopMonitoring).toBe('function');
    });

    it('should start monitoring automatically when autoRun is true', async () => {
      const { accessibilityTester } = await import('../AccessibilityTester');
      
      const mockReport = {
        violations: [
          {
            id: 'test-violation',
            rule: 'color-contrast',
            level: 'AA' as const,
            severity: 'violation' as const,
            impact: 'serious' as const,
            description: 'Test violation',
            helpUrl: 'https://help.com',
            tags: ['wcag2aa'],
            timestamp: new Date()
          }
        ]
      };

      (accessibilityTester.generateReport as any).mockResolvedValue(mockReport);

      const onViolation = vi.fn();
      const { result } = renderHook(() => 
        useAccessibilityMonitoring(undefined, { 
          autoRun: true, 
          interval: 1000,
          onViolation 
        })
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isMonitoring).toBe(true);
      
      // Wait for initial check
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.violations).toEqual(mockReport.violations);
      expect(onViolation).toHaveBeenCalledWith(mockReport.violations);
    });

    it('should manually start and stop monitoring', async () => {
      const { result } = renderHook(() => useAccessibilityMonitoring());

      expect(result.current.isMonitoring).toBe(false);

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);

      act(() => {
        result.current.stopMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
    });

    it('should check accessibility on demand', async () => {
      const { accessibilityTester } = await import('../AccessibilityTester');
      
      const mockReport = { violations: [] };
      (accessibilityTester.generateReport as any).mockResolvedValue(mockReport);

      const { result } = renderHook(() => useAccessibilityMonitoring());

      await act(async () => {
        await result.current.checkNow();
      });

      expect(result.current.lastCheck).toBeInstanceOf(Date);
    });
  });

  describe('useAccessibilityCompliance', () => {
    it('should initialize compliance tracking', () => {
      const { result } = renderHook(() => useAccessibilityCompliance());

      expect(result.current.complianceHistory).toEqual([]);
      expect(typeof result.current.recordCompliance).toBe('function');
      expect(typeof result.current.getComplianceTrend).toBe('function');
      expect(typeof result.current.getCurrentCompliance).toBe('function');
    });

    it('should record compliance data', () => {
      const { result } = renderHook(() => useAccessibilityCompliance());

      const mockReport = {
        timestamp: new Date(),
        complianceLevel: 'compliant' as const,
        summary: {
          violationCount: 0,
          criticalIssues: 0
        }
      };

      act(() => {
        result.current.recordCompliance(mockReport as any);
      });

      expect(result.current.complianceHistory).toHaveLength(1);
      expect(result.current.complianceHistory[0]).toMatchObject({
        level: 'compliant',
        violationCount: 0,
        criticalIssues: 0
      });
    });

    it('should calculate compliance trends', () => {
      const { result } = renderHook(() => useAccessibilityCompliance());

      // Add improving trend data
      const reports = [
        { violationCount: 10, criticalIssues: 2 },
        { violationCount: 8, criticalIssues: 1 },
        { violationCount: 6, criticalIssues: 1 },
        { violationCount: 4, criticalIssues: 0 },
        { violationCount: 2, criticalIssues: 0 }
      ];

      reports.forEach((report, index) => {
        act(() => {
          result.current.recordCompliance({
            timestamp: new Date(Date.now() + index * 1000),
            complianceLevel: 'partially-compliant',
            summary: report
          } as any);
        });
      });

      const trend = result.current.getComplianceTrend();
      expect(trend).toBe('improving');
    });

    it('should limit compliance history', () => {
      const { result } = renderHook(() => useAccessibilityCompliance());

      // Add more than 50 records
      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.recordCompliance({
            timestamp: new Date(),
            complianceLevel: 'compliant',
            summary: { violationCount: 0, criticalIssues: 0 }
          } as any);
        });
      }

      expect(result.current.complianceHistory).toHaveLength(50);
    });
  });

  describe('useKeyboardNavigationTest', () => {
    it('should analyze keyboard navigation', () => {
      // Mock focusable elements
      mockElement.hasAttribute.mockImplementation((attr) => attr === 'tabindex');
      mockElement.getAttribute.mockImplementation((attr) => {
        if (attr === 'tabindex') return '0';
        if (attr === 'aria-label') return 'Test button';
        return null;
      });

      const { result } = renderHook(() => useKeyboardNavigationTest());

      expect(result.current.focusableElements).toHaveLength(1);
      expect(result.current.navigationIssues).toEqual([]);
      expect(result.current.currentFocusIndex).toBe(-1);
    });

    it('should detect navigation issues', () => {
      // Mock problematic element
      mockElement.getAttribute.mockImplementation((attr) => {
        if (attr === 'tabindex') return '5'; // Positive tabindex
        return null;
      });
      mockElement.textContent = ''; // No accessible name

      const { result } = renderHook(() => useKeyboardNavigationTest());

      expect(result.current.navigationIssues.length).toBeGreaterThan(0);
      
      const issues = result.current.navigationIssues;
      const tabIndexIssue = issues.find(i => i.issue.includes('tabindex'));
      const accessibleNameIssue = issues.find(i => i.issue.includes('accessible name'));
      
      expect(tabIndexIssue).toBeDefined();
      expect(accessibleNameIssue).toBeDefined();
    });

    it('should simulate tab navigation', () => {
      const { result } = renderHook(() => useKeyboardNavigationTest());

      expect(result.current.currentFocusIndex).toBe(-1);

      act(() => {
        result.current.simulateTabNavigation('forward');
      });

      expect(result.current.currentFocusIndex).toBe(0);
      expect(mockElement.focus).toHaveBeenCalled();
    });

    it('should reset navigation', () => {
      const { result } = renderHook(() => useKeyboardNavigationTest());

      act(() => {
        result.current.simulateTabNavigation('forward');
      });

      expect(result.current.currentFocusIndex).toBe(0);

      act(() => {
        result.current.resetNavigation();
      });

      expect(result.current.currentFocusIndex).toBe(-1);
    });
  });

  describe('useScreenReaderTest', () => {
    it('should track announcements', () => {
      const { result } = renderHook(() => useScreenReaderTest());

      expect(result.current.announcements).toEqual([]);

      act(() => {
        result.current.announce('Test announcement', 'polite');
      });

      expect(result.current.announcements).toHaveLength(1);
      expect(result.current.announcements[0]).toMatchObject({
        message: 'Test announcement',
        priority: 'polite'
      });
    });

    it('should create live regions for announcements', () => {
      const mockLiveRegion = {
        setAttribute: vi.fn(),
        style: {},
        textContent: ''
      };
      
      vi.mocked(document.createElement).mockReturnValueOnce(mockLiveRegion);

      const { result } = renderHook(() => useScreenReaderTest());

      act(() => {
        result.current.announce('Test announcement', 'assertive');
      });

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockLiveRegion.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });

    it('should clear announcements', () => {
      const { result } = renderHook(() => useScreenReaderTest());

      act(() => {
        result.current.announce('Test 1');
        result.current.announce('Test 2');
      });

      expect(result.current.announcements).toHaveLength(2);

      act(() => {
        result.current.clearAnnouncements();
      });

      expect(result.current.announcements).toEqual([]);
    });

    it('should test aria labels', () => {
      const { result } = renderHook(() => useScreenReaderTest());

      const testElement = {
        getAttribute: vi.fn((attr) => {
          if (attr === 'aria-label') return 'Test label';
          return null;
        })
      };

      act(() => {
        result.current.testAriaLabel(testElement as any);
      });

      expect(result.current.announcements).toHaveLength(1);
      expect(result.current.announcements[0].message).toContain('Test label');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM APIs gracefully', () => {
      // Temporarily remove window.getComputedStyle
      const originalGetComputedStyle = (global as any).window.getComputedStyle;
      delete (global as any).window.getComputedStyle;

      expect(() => {
        renderHook(() => useKeyboardNavigationTest());
      }).not.toThrow();

      // Restore
      (global as any).window.getComputedStyle = originalGetComputedStyle;
    });

    it('should handle navigation with empty focusable elements', () => {
      // Override the spy to return empty array
      vi.mocked(document.querySelectorAll).mockReturnValueOnce([] as any);

      const { result } = renderHook(() => useKeyboardNavigationTest());

      expect(() => {
        act(() => {
          result.current.simulateTabNavigation('forward');
        });
      }).not.toThrow();

      expect(result.current.focusableElements).toEqual([]);
    });
  });
});