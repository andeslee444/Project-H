/**
 * Performance Monitor Tests
 * 
 * Comprehensive tests for the performance monitoring system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Mock browser APIs
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  timing: {
    navigationStart: Date.now() - 1000,
    domContentLoadedEventEnd: Date.now() - 500,
    loadEventEnd: Date.now() - 100
  },
  navigation: {
    type: 0
  },
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock PerformanceObserver with proper implementation
const mockPerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => [])
}));

// Override global objects
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
  configurable: true
});

Object.defineProperty(global, 'window', {
  value: {
    performance: mockPerformance,
    IntersectionObserver: mockIntersectionObserver,
    PerformanceObserver: mockPerformanceObserver
  },
  writable: true,
  configurable: true
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.cleanup();
  });

  describe('Metric Collection', () => {
    it('should add metrics correctly', () => {
      const metric = {
        id: 'test-metric',
        name: 'Test Metric',
        value: 100,
        unit: 'ms',
        category: 'render' as const,
        threshold: { warning: 50, critical: 200 }
      };

      monitor.addMetric(metric);

      const report = monitor.generateReport();
      expect(report.metrics).toHaveLength(1);
      expect(report.metrics[0]).toMatchObject({
        ...metric,
        timestamp: expect.any(Date)
      });
    });

    it('should filter metrics by category', () => {
      monitor.addMetric({
        id: 'render-metric',
        name: 'Render Test',
        value: 50,
        unit: 'ms',
        category: 'render'
      });

      monitor.addMetric({
        id: 'network-metric', 
        name: 'Network Test',
        value: 200,
        unit: 'ms',
        category: 'network'
      });

      const renderMetrics = monitor.getMetricsByCategory('render');
      const networkMetrics = monitor.getMetricsByCategory('network');

      expect(renderMetrics).toHaveLength(1);
      expect(networkMetrics).toHaveLength(1);
      expect(renderMetrics[0].category).toBe('render');
      expect(networkMetrics[0].category).toBe('network');
    });

    it('should filter metrics by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Add metric from 2 hours ago
      monitor.addMetric({
        id: 'old-metric',
        name: 'Old Metric',
        value: 100,
        unit: 'ms',
        category: 'render'
      });

      // Manually set timestamp to 2 hours ago
      const report1 = monitor.generateReport();
      if (report1.metrics.length > 0) {
        report1.metrics[0].timestamp = twoHoursAgo;
      }

      // Add recent metric
      monitor.addMetric({
        id: 'recent-metric',
        name: 'Recent Metric', 
        value: 150,
        unit: 'ms',
        category: 'render'
      });

      const recentMetrics = monitor.getMetricsByTimeRange(oneHourAgo, now);
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0].id).toBe('recent-metric');
    });

    it('should limit metrics array size', () => {
      // Add more than 1000 metrics
      for (let i = 0; i < 1100; i++) {
        monitor.addMetric({
          id: `metric-${i}`,
          name: `Metric ${i}`,
          value: i,
          unit: 'ms',
          category: 'custom'
        });
      }

      const report = monitor.generateReport();
      expect(report.metrics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Report Generation', () => {
    beforeEach(() => {
      // Add test metrics
      monitor.addMetric({
        id: 'page-load-1',
        name: 'Total Page Load Time',
        value: 1500,
        unit: 'ms',
        category: 'navigation',
        threshold: { warning: 2000, critical: 4000 }
      });

      monitor.addMetric({
        id: 'page-load-2',
        name: 'Total Page Load Time',
        value: 2500,
        unit: 'ms',
        category: 'navigation',
        threshold: { warning: 2000, critical: 4000 }
      });

      monitor.addMetric({
        id: 'render-1',
        name: 'Component Render',
        value: 80,
        unit: 'ms',
        category: 'render',
        threshold: { warning: 100, critical: 300 }
      });

      monitor.addMetric({
        id: 'error-1',
        name: 'API Error',
        value: 1,
        unit: 'count',
        category: 'network'
      });
    });

    it('should generate comprehensive report', () => {
      const report = monitor.generateReport();

      expect(report).toMatchObject({
        reportId: expect.any(String),
        generatedAt: expect.any(Date),
        timeframe: {
          start: expect.any(Date),
          end: expect.any(Date)
        },
        summary: {
          totalMetrics: expect.any(Number),
          criticalIssues: expect.any(Number),
          warnings: expect.any(Number),
          averagePageLoad: expect.any(Number),
          averageRenderTime: expect.any(Number),
          errorRate: expect.any(Number)
        },
        metrics: expect.any(Array),
        recommendations: expect.any(Array),
        trends: {
          pageLoadTrend: expect.stringMatching(/improving|stable|degrading/),
          memoryTrend: expect.stringMatching(/improving|stable|degrading/),
          errorTrend: expect.stringMatching(/improving|stable|degrading/)
        }
      });
    });

    it('should calculate correct averages', () => {
      const report = monitor.generateReport();

      // Average page load should be (1500 + 2500) / 2 = 2000
      expect(report.summary.averagePageLoad).toBe(2000);

      // Average render time should be 80 (only one render metric)
      expect(report.summary.averageRenderTime).toBe(80);

      // Error rate should be 1/4 = 0.25
      expect(report.summary.errorRate).toBe(0.25);
    });

    it('should count warnings and critical issues correctly', () => {
      const report = monitor.generateReport();

      // One page load metric (2500ms) exceeds warning threshold (2000ms)
      expect(report.summary.warnings).toBeGreaterThanOrEqual(1);

      // No metrics should exceed critical thresholds
      expect(report.summary.criticalIssues).toBe(0);
    });

    it('should generate appropriate recommendations', () => {
      // Add a slow page load to trigger recommendations
      monitor.addMetric({
        id: 'slow-page',
        name: 'Total Page Load Time',
        value: 5000,
        unit: 'ms',
        category: 'navigation',
        threshold: { warning: 2000, critical: 4000 }
      });

      const report = monitor.generateReport();
      expect(report.recommendations.length).toBeGreaterThan(0);

      const slowPageRec = report.recommendations.find(r => r.id === 'slow-page-load');
      expect(slowPageRec).toBeDefined();
      expect(slowPageRec?.priority).toBe('high');
    });
  });

  describe('Threshold Monitoring', () => {
    it('should detect warning thresholds', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      monitor.addMetric({
        id: 'warning-metric',
        name: 'Warning Test',
        value: 150,
        unit: 'ms',
        category: 'render',
        threshold: { warning: 100, critical: 300 }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance warning: Warning Test = 150ms')
      );

      consoleSpy.mockRestore();
    });

    it('should detect critical thresholds', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      monitor.addMetric({
        id: 'critical-metric',
        name: 'Critical Test',
        value: 350,
        unit: 'ms',
        category: 'render',
        threshold: { warning: 100, critical: 300 }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Critical performance issue: Critical Test = 350ms')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should handle patient data access metrics', () => {
      monitor.addMetric({
        id: 'patient-access',
        name: 'Patient Data Access',
        value: 200,
        unit: 'ms',
        category: 'security',
        metadata: {
          patientId: 'PAT123',
          dataType: 'medical_history',
          accessLevel: 'read'
        }
      });

      const report = monitor.generateReport();
      const patientMetric = report.metrics.find(m => m.id === 'patient-access');
      
      expect(patientMetric).toBeDefined();
      expect(patientMetric?.metadata?.patientId).toBe('PAT123');
      expect(patientMetric?.category).toBe('security');
    });

    it('should track appointment scheduling performance', () => {
      monitor.addMetric({
        id: 'appointment-schedule',
        name: 'Appointment Scheduling',
        value: 500,
        unit: 'ms',
        category: 'custom',
        threshold: { warning: 1000, critical: 3000 },
        metadata: {
          appointmentType: 'therapy_session',
          providerId: 'PROV456',
          schedulingTime: '2024-01-15T10:00:00Z'
        }
      });

      const customMetrics = monitor.getMetricsByCategory('custom');
      expect(customMetrics).toHaveLength(1);
      expect(customMetrics[0].metadata?.appointmentType).toBe('therapy_session');
    });

    it('should monitor mood tracking component performance', () => {
      monitor.addMetric({
        id: 'mood-tracker-render',
        name: 'Mood Tracker Render',
        value: 75,
        unit: 'ms',
        category: 'render',
        threshold: { warning: 100, critical: 300 },
        metadata: {
          component: 'MoodTracker',
          dataPoints: 84, // 12 weeks * 7 days
          interactionType: 'mood_log'
        }
      });

      const renderMetrics = monitor.getMetricsByCategory('render');
      const moodMetric = renderMetrics.find(m => m.metadata?.component === 'MoodTracker');
      
      expect(moodMetric).toBeDefined();
      expect(moodMetric?.value).toBe(75);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing thresholds gracefully', () => {
      expect(() => {
        monitor.addMetric({
          id: 'no-threshold',
          name: 'No Threshold Test',
          value: 100,
          unit: 'ms',
          category: 'render'
          // No threshold property
        });
      }).not.toThrow();
    });

    it('should handle cleanup properly', () => {
      expect(() => {
        monitor.cleanup();
      }).not.toThrow();
    });

    it('should handle disabled monitoring', () => {
      monitor.setEnabled(false);
      
      monitor.addMetric({
        id: 'disabled-metric',
        name: 'Disabled Test',
        value: 100,
        unit: 'ms',
        category: 'render'
      });

      const report = monitor.generateReport();
      // Should not include the metric added while disabled
      expect(report.metrics.find(m => m.id === 'disabled-metric')).toBeUndefined();
    });
  });

  describe('Trend Analysis', () => {
    it('should analyze improving trends', () => {
      const baseTime = Date.now();
      
      // Use vitest fake timers for better control
      vi.setSystemTime(baseTime - 2 * 60 * 60 * 1000); // Start 2 hours ago
      
      // Add older metrics (worse performance) - these get old timestamps
      for (let i = 0; i < 5; i++) {
        monitor.addMetric({
          id: `old-metric-${i}`,
          name: 'Total Page Load Time',
          value: 3000 + i * 100, // 3000-3400ms (avg: 3200ms)
          unit: 'ms',
          category: 'navigation'
        });
      }

      // Advance time to recent (within last hour)
      vi.setSystemTime(baseTime - 30 * 60 * 1000); // 30 minutes ago

      // Add newer metrics (better performance) - these get recent timestamps
      // Need >5% improvement: 3200ms -> <3040ms for 'improving' trend
      for (let i = 0; i < 5; i++) {
        monitor.addMetric({
          id: `new-metric-${i}`,
          name: 'Total Page Load Time',
          value: 2800 + i * 40, // 2800-2960ms (avg: 2880ms) - 10% improvement
          unit: 'ms',
          category: 'navigation'
        });
      }

      // Set current time for report generation
      vi.setSystemTime(baseTime);

      const report = monitor.generateReport();
      expect(report.trends.pageLoadTrend).toBe('improving');
    });

    it('should analyze degrading trends', () => {
      const baseTime = Date.now();
      
      // Use vitest fake timers for better control
      vi.setSystemTime(baseTime - 2 * 60 * 60 * 1000); // Start 2 hours ago
      
      // Add older metrics (better performance) - these get old timestamps
      for (let i = 0; i < 5; i++) {
        monitor.addMetric({
          id: `old-good-metric-${i}`,
          name: 'Total Page Load Time',
          value: 1000 + i * 50, // 1000-1200ms (avg: 1100ms)
          unit: 'ms',
          category: 'navigation'
        });
      }

      // Advance time to recent (within last hour)
      vi.setSystemTime(baseTime - 30 * 60 * 1000); // 30 minutes ago

      // Add newer metrics (worse performance) - these get recent timestamps
      // Need >5% degradation: 1100ms -> >1155ms for 'degrading' trend
      for (let i = 0; i < 5; i++) {
        monitor.addMetric({
          id: `new-bad-metric-${i}`,
          name: 'Total Page Load Time',
          value: 1300 + i * 50, // 1300-1500ms (avg: 1400ms) - 27% degradation
          unit: 'ms',
          category: 'navigation'
        });
      }

      // Set current time for report generation
      vi.setSystemTime(baseTime);

      const report = monitor.generateReport();
      expect(report.trends.pageLoadTrend).toBe('degrading');
    });
  });
});