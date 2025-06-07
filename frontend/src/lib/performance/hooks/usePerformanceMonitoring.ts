/**
 * React Hooks for Performance Monitoring
 * 
 * Provides React integration for performance monitoring
 * in healthcare applications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, PerformanceMetric, PerformanceReport } from '../PerformanceMonitor';

/**
 * Hook for component performance monitoring
 */
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>();
  const mountTime = useRef<Date>();

  useEffect(() => {
    mountTime.current = new Date();
    renderStartTime.current = performance.now();

    // Log component mount
    performanceMonitor.addMetric({
      id: `component-mount-${componentName}-${Date.now()}`,
      name: 'Component Mount',
      value: 0, // Will be updated on unmount
      unit: 'ms',
      category: 'render',
      metadata: {
        component: componentName,
        mountTime: mountTime.current.toISOString()
      }
    });

    return () => {
      if (mountTime.current) {
        const unmountTime = new Date();
        const mountDuration = unmountTime.getTime() - mountTime.current.getTime();

        performanceMonitor.addMetric({
          id: `component-lifecycle-${componentName}-${Date.now()}`,
          name: 'Component Lifecycle',
          value: mountDuration,
          unit: 'ms',
          category: 'render',
          threshold: { warning: 10000, critical: 30000 }, // 10s warning, 30s critical
          metadata: {
            component: componentName,
            mountTime: mountTime.current.toISOString(),
            unmountTime: unmountTime.toISOString()
          }
        });
      }
    };
  }, [componentName]);

  useEffect(() => {
    if (renderStartTime.current !== undefined) {
      const renderTime = performance.now() - renderStartTime.current;
      
      performanceMonitor.addMetric({
        id: `component-render-${componentName}-${Date.now()}`,
        name: 'Component Render Time',
        value: renderTime,
        unit: 'ms',
        category: 'render',
        threshold: { warning: 50, critical: 200 },
        metadata: {
          component: componentName
        }
      });
    }
    
    renderStartTime.current = performance.now();
  });

  const measureAsyncOperation = useCallback((operationName: string) => {
    const startTime = performance.now();
    
    return (data?: any) => {
      const duration = performance.now() - startTime;
      
      performanceMonitor.addMetric({
        id: `async-op-${componentName}-${operationName}-${Date.now()}`,
        name: `Async Operation: ${operationName}`,
        value: duration,
        unit: 'ms',
        category: 'custom',
        threshold: { warning: 1000, critical: 5000 },
        metadata: {
          component: componentName,
          operation: operationName,
          dataSize: data ? JSON.stringify(data).length : 0
        }
      });
    };
  }, [componentName]);

  return {
    measureAsyncOperation
  };
}

/**
 * Hook for monitoring API performance
 */
export function useAPIPerformance() {
  const measureAPICall = useCallback((endpoint: string, method: string = 'GET') => {
    const startTime = performance.now();
    const requestId = `api-${Date.now()}`;
    
    return {
      success: (data?: any) => {
        const duration = performance.now() - startTime;
        
        performanceMonitor.addMetric({
          id: `${requestId}-success`,
          name: 'API Call Success',
          value: duration,
          unit: 'ms',
          category: 'network',
          threshold: { warning: 500, critical: 2000 },
          metadata: {
            endpoint,
            method,
            success: true,
            responseSize: data ? JSON.stringify(data).length : 0
          }
        });
      },
      error: (error?: any) => {
        const duration = performance.now() - startTime;
        
        performanceMonitor.addMetric({
          id: `${requestId}-error`,
          name: 'API Call Error',
          value: duration,
          unit: 'ms',
          category: 'network',
          threshold: { warning: 500, critical: 2000 },
          metadata: {
            endpoint,
            method,
            success: false,
            error: error?.message || 'Unknown error'
          }
        });
      }
    };
  }, []);

  return { measureAPICall };
}

/**
 * Hook for performance reporting
 */
export function usePerformanceReporting() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = useCallback(async (timeframe?: { start: Date; end: Date }) => {
    setIsGenerating(true);
    
    try {
      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newReport = performanceMonitor.generateReport(timeframe);
      setReport(newReport);
      
      return newReport;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
  }, []);

  return {
    report,
    isGenerating,
    generateReport,
    clearReport
  };
}

/**
 * Hook for real-time performance metrics
 */
export function useRealTimeMetrics(category?: PerformanceMetric['category']) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      
      const recentMetrics = performanceMonitor.getMetricsByTimeRange(oneMinuteAgo, now);
      const filteredMetrics = category 
        ? recentMetrics.filter(m => m.category === category)
        : recentMetrics;
      
      setMetrics(filteredMetrics);
      setLastUpdate(now);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [category]);

  const averageValue = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length 
    : 0;

  const criticalIssues = metrics.filter(m => 
    m.threshold && m.value >= m.threshold.critical
  ).length;

  const warnings = metrics.filter(m => 
    m.threshold && 
    m.value >= m.threshold.warning && 
    m.value < (m.threshold.critical || Infinity)
  ).length;

  return {
    metrics,
    lastUpdate,
    summary: {
      total: metrics.length,
      average: averageValue,
      criticalIssues,
      warnings
    }
  };
}

/**
 * Hook for user interaction tracking
 */
export function useUserInteractionTracking() {
  const trackClick = useCallback((elementId: string, elementType: string = 'button') => {
    performanceMonitor.addMetric({
      id: `user-click-${Date.now()}`,
      name: 'User Click',
      value: 1,
      unit: 'count',
      category: 'custom',
      metadata: {
        elementId,
        elementType,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      }
    });
  }, []);

  const trackPageView = useCallback((pageName: string) => {
    const navigationStart = performance.timing?.navigationStart || Date.now();
    const pageLoadTime = Date.now() - navigationStart;

    performanceMonitor.addMetric({
      id: `page-view-${Date.now()}`,
      name: 'Page View',
      value: pageLoadTime,
      unit: 'ms',
      category: 'navigation',
      threshold: { warning: 2000, critical: 5000 },
      metadata: {
        pageName,
        url: window.location.pathname,
        referrer: document.referrer
      }
    });
  }, []);

  const trackFormSubmission = useCallback((formName: string, fieldCount: number, isValid: boolean) => {
    performanceMonitor.addMetric({
      id: `form-submit-${Date.now()}`,
      name: 'Form Submission',
      value: fieldCount,
      unit: 'fields',
      category: 'custom',
      metadata: {
        formName,
        fieldCount,
        isValid,
        timestamp: new Date().toISOString()
      }
    });
  }, []);

  const trackError = useCallback((errorType: string, errorMessage: string, componentName?: string) => {
    performanceMonitor.addMetric({
      id: `user-error-${Date.now()}`,
      name: 'User Error',
      value: 1,
      unit: 'count',
      category: 'custom',
      threshold: { warning: 1, critical: 3 },
      metadata: {
        errorType,
        errorMessage,
        componentName,
        url: window.location.pathname,
        userAgent: navigator.userAgent
      }
    });
  }, []);

  return {
    trackClick,
    trackPageView,
    trackFormSubmission,
    trackError
  };
}

/**
 * Hook for performance optimization suggestions
 */
export function usePerformanceOptimization() {
  const [optimizations, setOptimizations] = useState<Array<{
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    implemented: boolean;
  }>>([]);

  useEffect(() => {
    // Analyze current metrics and suggest optimizations
    const analyzeAndSuggest = () => {
      const report = performanceMonitor.generateReport();
      const suggestions = [];

      // Check for slow renders
      const slowRenders = report.metrics.filter(m => 
        m.category === 'render' && m.value > 100
      );
      
      if (slowRenders.length > 0) {
        suggestions.push({
          type: 'render-optimization',
          description: 'Consider using React.memo() or useMemo() for expensive components',
          impact: 'high' as const,
          implemented: false
        });
      }

      // Check for memory issues
      const memoryIssues = report.metrics.filter(m => 
        m.category === 'memory' && m.value > 50
      );
      
      if (memoryIssues.length > 0) {
        suggestions.push({
          type: 'memory-optimization',
          description: 'Review useEffect cleanup and remove unused event listeners',
          impact: 'medium' as const,
          implemented: false
        });
      }

      // Check for network issues
      const networkIssues = report.metrics.filter(m => 
        m.category === 'network' && m.value > 1000
      );
      
      if (networkIssues.length > 0) {
        suggestions.push({
          type: 'network-optimization',
          description: 'Implement request caching and reduce API payload sizes',
          impact: 'high' as const,
          implemented: false
        });
      }

      setOptimizations(suggestions);
    };

    analyzeAndSuggest();
    const interval = setInterval(analyzeAndSuggest, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const markAsImplemented = useCallback((type: string) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.type === type ? { ...opt, implemented: true } : opt
      )
    );
  }, []);

  return {
    optimizations,
    markAsImplemented
  };
}