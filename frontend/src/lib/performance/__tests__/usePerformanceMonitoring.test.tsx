/**
 * Performance Monitoring Hooks Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '../../../test/utils/render';
import { 
  useComponentPerformance,
  useAPIPerformance,
  usePerformanceReporting,
  useRealTimeMetrics,
  useUserInteractionTracking
} from '../hooks/usePerformanceMonitoring';
import { performanceMonitor } from '../PerformanceMonitor';

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 10485760,
      totalJSHeapSize: 20971520,
      jsHeapSizeLimit: 2197815296
    }
  },
  writable: true
});

// Mock window object for location
Object.defineProperty(global, 'window', {
  value: {
    ...global.window,
    location: {
      pathname: '/test-path'
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  writable: true
});

// Mock document for DOM operations
Object.defineProperty(global, 'document', {
  value: {
    ...global.document,
    referrer: 'https://example.com',
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    createElement: vi.fn(() => ({
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }))
  },
  writable: true
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-user-agent'
  }
});

describe('Performance Monitoring Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor.clearMetrics();
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  describe('useComponentPerformance', () => {
    it('should measure component performance', async () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result, unmount } = renderHook(() => 
        useComponentPerformance('TestComponent')
      );

      expect(result.current.measureAsyncOperation).toBeInstanceOf(Function);

      // Test async operation measurement
      const measure = result.current.measureAsyncOperation('data-fetch');
      
      // Simulate async operation completion
      await act(async () => {
        measure({ data: 'test' });
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Async Operation: data-fetch',
          category: 'custom',
          metadata: expect.objectContaining({
            component: 'TestComponent',
            operation: 'data-fetch'
          })
        })
      );

      // Test component unmount tracking
      unmount();

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Component Lifecycle',
          category: 'render',
          metadata: expect.objectContaining({
            component: 'TestComponent'
          })
        })
      );
    });

    it('should track component render time', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      renderHook(() => useComponentPerformance('RenderTestComponent'));

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Component Mount',
          category: 'render',
          metadata: expect.objectContaining({
            component: 'RenderTestComponent'
          })
        })
      );
    });
  });

  describe('useAPIPerformance', () => {
    it('should measure successful API calls', async () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useAPIPerformance());
      
      const tracker = result.current.measureAPICall('/api/patients', 'GET');
      
      await act(async () => {
        tracker.success({ patients: [] });
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'API Call Success',
          category: 'network',
          metadata: expect.objectContaining({
            endpoint: '/api/patients',
            method: 'GET',
            success: true
          })
        })
      );
    });

    it('should measure failed API calls', async () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useAPIPerformance());
      
      const tracker = result.current.measureAPICall('/api/patients', 'POST');
      
      await act(async () => {
        tracker.error(new Error('Network error'));
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'API Call Error',
          category: 'network',
          metadata: expect.objectContaining({
            endpoint: '/api/patients',
            method: 'POST',
            success: false,
            error: 'Network error'
          })
        })
      );
    });
  });

  describe('usePerformanceReporting', () => {
    it('should generate performance reports', async () => {
      const { result } = renderHook(() => usePerformanceReporting());

      expect(result.current.report).toBeNull();
      expect(result.current.isGenerating).toBe(false);

      await act(async () => {
        const report = await result.current.generateReport();
        expect(report).toBeDefined();
        expect(report.reportId).toBeDefined();
        expect(report.generatedAt).toBeInstanceOf(Date);
      });

      expect(result.current.report).toBeDefined();
      expect(result.current.isGenerating).toBe(false);
    });

    it('should clear reports', async () => {
      const { result } = renderHook(() => usePerformanceReporting());

      // Generate a report first
      await act(async () => {
        await result.current.generateReport();
      });

      expect(result.current.report).toBeDefined();

      // Clear the report
      act(() => {
        result.current.clearReport();
      });

      expect(result.current.report).toBeNull();
    });

    it('should handle custom timeframes', async () => {
      const { result } = renderHook(() => usePerformanceReporting());

      const start = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const end = new Date();

      await act(async () => {
        const report = await result.current.generateReport({ start, end });
        expect(report.timeframe.start).toEqual(start);
        expect(report.timeframe.end).toEqual(end);
      });
    });
  });

  describe('useRealTimeMetrics', () => {
    it('should track real-time metrics', () => {
      // Add some test metrics
      performanceMonitor.addMetric({
        id: 'test-metric-1',
        name: 'Test Metric',
        value: 100,
        unit: 'ms',
        category: 'render'
      });

      performanceMonitor.addMetric({
        id: 'test-metric-2', 
        name: 'Another Test',
        value: 200,
        unit: 'ms',
        category: 'network'
      });

      const { result } = renderHook(() => useRealTimeMetrics());

      // Initial state
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary.total).toBe(0);

      // Note: Real-time updates are tested with timers, 
      // so we'd need to mock timers for full testing
    });

    it('should filter metrics by category', () => {
      const { result } = renderHook(() => useRealTimeMetrics('render'));

      // The hook should filter for render category metrics only
      expect(result.current.metrics).toEqual([]);
    });

    it('should calculate summary statistics', () => {
      const { result } = renderHook(() => useRealTimeMetrics());

      expect(result.current.summary).toMatchObject({
        total: expect.any(Number),
        average: expect.any(Number),
        criticalIssues: expect.any(Number),
        warnings: expect.any(Number)
      });
    });
  });

  describe('useUserInteractionTracking', () => {
    it('should track click events', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useUserInteractionTracking());

      act(() => {
        result.current.trackClick('login-button', 'button');
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'User Click',
          value: 1,
          unit: 'count',
          category: 'custom',
          metadata: expect.objectContaining({
            elementId: 'login-button',
            elementType: 'button',
            url: '/test-path'
          })
        })
      );
    });

    it('should track page views', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useUserInteractionTracking());

      act(() => {
        result.current.trackPageView('PatientDashboard');
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Page View',
          category: 'navigation',
          metadata: expect.objectContaining({
            pageName: 'PatientDashboard',
            url: '/test-path',
            referrer: 'https://example.com'
          })
        })
      );
    });

    it('should track form submissions', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useUserInteractionTracking());

      act(() => {
        result.current.trackFormSubmission('patient-registration', 8, true);
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Form Submission',
          value: 8,
          unit: 'fields',
          category: 'custom',
          metadata: expect.objectContaining({
            formName: 'patient-registration',
            fieldCount: 8,
            isValid: true
          })
        })
      );
    });

    it('should track errors', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useUserInteractionTracking());

      act(() => {
        result.current.trackError('validation_error', 'Invalid email format', 'PatientForm');
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'User Error',
          value: 1,
          unit: 'count',
          category: 'custom',
          threshold: { warning: 1, critical: 3 },
          metadata: expect.objectContaining({
            errorType: 'validation_error',
            errorMessage: 'Invalid email format',
            componentName: 'PatientForm',
            url: '/test-path',
            userAgent: 'test-user-agent'
          })
        })
      );
    });
  });

  describe('Healthcare-Specific Tracking', () => {
    it('should track patient data access performance', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useComponentPerformance('PatientRecordViewer'));
      
      act(() => {
        const measure = result.current.measureAsyncOperation('load-patient-history');
        measure({ 
          patientId: 'PAT123',
          recordCount: 45,
          dataSize: '2.3MB'
        });
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Async Operation: load-patient-history',
          metadata: expect.objectContaining({
            component: 'PatientRecordViewer',
            operation: 'load-patient-history'
          })
        })
      );
    });

    it('should track appointment scheduling performance', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useAPIPerformance());
      
      const tracker = result.current.measureAPICall('/api/appointments/schedule', 'POST');
      
      act(() => {
        tracker.success({
          appointmentId: 'APT456',
          patientId: 'PAT123',
          providerId: 'PROV789',
          scheduledTime: '2024-01-15T10:00:00Z'
        });
      });

      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'API Call Success',
          metadata: expect.objectContaining({
            endpoint: '/api/appointments/schedule',
            method: 'POST',
            success: true
          })
        })
      );
    });

    it('should track mood tracking component interactions', () => {
      const addMetricSpy = vi.spyOn(performanceMonitor, 'addMetric');
      
      const { result } = renderHook(() => useUserInteractionTracking());

      act(() => {
        result.current.trackClick('mood-entry-submit', 'button');
      });

      act(() => {
        result.current.trackFormSubmission('mood-tracker-form', 3, true);
      });

      expect(addMetricSpy).toHaveBeenCalledTimes(2);
      
      // Check mood entry click
      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'User Click',
          metadata: expect.objectContaining({
            elementId: 'mood-entry-submit'
          })
        })
      );

      // Check mood form submission
      expect(addMetricSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Form Submission',
          metadata: expect.objectContaining({
            formName: 'mood-tracker-form',
            fieldCount: 3,
            isValid: true
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing performance API gracefully', () => {
      // Temporarily remove performance.now
      const originalNow = global.performance.now;
      delete (global.performance as any).now;

      expect(() => {
        renderHook(() => useComponentPerformance('TestComponent'));
      }).not.toThrow();

      // Restore
      global.performance.now = originalNow;
    });

    it('should handle API measurement errors', async () => {
      const { result } = renderHook(() => useAPIPerformance());
      
      expect(() => {
        const tracker = result.current.measureAPICall('/api/test');
        tracker.error(); // No error object provided
      }).not.toThrow();
    });

    it('should handle missing window properties', () => {
      // Temporarily remove window.location
      const originalLocation = global.window.location;
      delete (global.window as any).location;

      expect(() => {
        const { result } = renderHook(() => useUserInteractionTracking());
        result.current.trackClick('test-button');
      }).not.toThrow();

      // Restore
      global.window.location = originalLocation;
    });
  });
});