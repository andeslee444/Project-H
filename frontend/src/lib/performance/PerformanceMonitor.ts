/**
 * Performance Monitor for Mental Health Practice System
 * 
 * Provides comprehensive performance monitoring, metrics collection,
 * and optimization recommendations for healthcare applications.
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'navigation' | 'render' | 'network' | 'memory' | 'security' | 'custom';
  threshold?: {
    warning: number;
    critical: number;
  };
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  reportId: string;
  generatedAt: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  summary: {
    totalMetrics: number;
    criticalIssues: number;
    warnings: number;
    averagePageLoad: number;
    averageRenderTime: number;
    errorRate: number;
  };
  metrics: PerformanceMetric[];
  recommendations: PerformanceRecommendation[];
  trends: {
    pageLoadTrend: 'improving' | 'stable' | 'degrading';
    memoryTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'improving' | 'stable' | 'degrading';
  };
}

export interface PerformanceRecommendation {
  id: string;
  type: 'optimization' | 'caching' | 'bundling' | 'memory' | 'network' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  implementation: string;
  estimatedGain: string;
  affectedComponents?: string[];
}

export interface PerformanceThresholds {
  pageLoad: { warning: number; critical: number };
  renderTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  bundleSize: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
}

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  pageLoad: { warning: 2000, critical: 4000 }, // milliseconds
  renderTime: { warning: 100, critical: 300 }, // milliseconds
  memoryUsage: { warning: 50, critical: 100 }, // MB
  bundleSize: { warning: 1024, critical: 2048 }, // KB
  errorRate: { warning: 0.01, critical: 0.05 } // percentage
};

/**
 * Core Performance Monitor Class
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds;
  private observer?: PerformanceObserver;
  private memoryInterval?: NodeJS.Timeout;
  private isEnabled: boolean = true;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_PERFORMANCE_THRESHOLDS, ...thresholds };
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor navigation timing
    this.collectNavigationMetrics();

    // Monitor paint metrics
    this.observePaintMetrics();

    // Monitor resource loading
    this.observeResourceMetrics();

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Monitor user interactions
    this.observeUserInteractions();

    console.log('📊 Performance monitoring initialized');
  }

  /**
   * Collect navigation timing metrics
   */
  private collectNavigationMetrics(): void {
    if (!window.performance?.getEntriesByType) return;

    const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    navigationEntries.forEach(entry => {
      // DNS lookup time
      this.addMetric({
        id: `dns-${Date.now()}`,
        name: 'DNS Lookup Time',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        unit: 'ms',
        category: 'network',
        threshold: { warning: 50, critical: 200 }
      });

      // TCP connection time
      this.addMetric({
        id: `tcp-${Date.now()}`,
        name: 'TCP Connection Time',
        value: entry.connectEnd - entry.connectStart,
        unit: 'ms',
        category: 'network',
        threshold: { warning: 100, critical: 500 }
      });

      // Server response time
      this.addMetric({
        id: `server-${Date.now()}`,
        name: 'Server Response Time',
        value: entry.responseStart - entry.requestStart,
        unit: 'ms',
        category: 'network',
        threshold: { warning: 200, critical: 1000 }
      });

      // DOM content loaded
      this.addMetric({
        id: `dom-content-${Date.now()}`,
        name: 'DOM Content Loaded',
        value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        unit: 'ms',
        category: 'render',
        threshold: this.thresholds.renderTime
      });

      // Total page load time
      this.addMetric({
        id: `page-load-${Date.now()}`,
        name: 'Total Page Load Time',
        value: entry.loadEventEnd - entry.loadEventStart,
        unit: 'ms',
        category: 'navigation',
        threshold: this.thresholds.pageLoad
      });
    });
  }

  /**
   * Observe paint metrics (FCP, LCP)
   */
  private observePaintMetrics(): void {
    if (!window.PerformanceObserver) return;

    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.addMetric({
              id: `fcp-${Date.now()}`,
              name: 'First Contentful Paint',
              value: entry.startTime,
              unit: 'ms',
              category: 'render',
              threshold: { warning: 1000, critical: 2500 },
              metadata: { entryType: entry.entryType }
            });
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            this.addMetric({
              id: `lcp-${Date.now()}`,
              name: 'Largest Contentful Paint',
              value: entry.startTime,
              unit: 'ms',
              category: 'render',
              threshold: { warning: 2500, critical: 4000 },
              metadata: { entryType: entry.entryType, element: (entry as any).element }
            });
          }
        });
      });

      paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observer = paintObserver;
    } catch (error) {
      console.warn('Paint metrics observation not supported:', error);
    }
  }

  /**
   * Observe resource loading metrics
   */
  private observeResourceMetrics(): void {
    if (!window.PerformanceObserver) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track large resource loads
          if (resourceEntry.transferSize > 100000) { // 100KB+
            this.addMetric({
              id: `large-resource-${Date.now()}`,
              name: 'Large Resource Load',
              value: resourceEntry.duration,
              unit: 'ms',
              category: 'network',
              threshold: { warning: 1000, critical: 3000 },
              metadata: {
                url: resourceEntry.name,
                size: resourceEntry.transferSize,
                type: this.getResourceType(resourceEntry.name)
              }
            });
          }

          // Track slow resources
          if (resourceEntry.duration > 1000) {
            this.addMetric({
              id: `slow-resource-${Date.now()}`,
              name: 'Slow Resource',
              value: resourceEntry.duration,
              unit: 'ms',
              category: 'network',
              threshold: { warning: 1000, critical: 3000 },
              metadata: {
                url: resourceEntry.name,
                type: this.getResourceType(resourceEntry.name)
              }
            });
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource metrics observation not supported:', error);
    }
  }

  /**
   * Monitor memory usage
   */
  private startMemoryMonitoring(): void {
    if (!(window.performance as any)?.memory) return;

    this.memoryInterval = setInterval(() => {
      const memory = (window.performance as any).memory;
      
      this.addMetric({
        id: `memory-used-${Date.now()}`,
        name: 'Memory Used',
        value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        unit: 'MB',
        category: 'memory',
        threshold: this.thresholds.memoryUsage,
        metadata: {
          totalHeapSize: memory.totalJSHeapSize / 1024 / 1024,
          heapSizeLimit: memory.jsHeapSizeLimit / 1024 / 1024
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Monitor user interactions (CLS, FID)
   */
  private observeUserInteractions(): void {
    if (!window.PerformanceObserver) return;

    try {
      // Layout shift observer
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          const layoutShiftEntry = entry as any;
          
          if (!layoutShiftEntry.hadRecentInput) {
            this.addMetric({
              id: `cls-${Date.now()}`,
              name: 'Cumulative Layout Shift',
              value: layoutShiftEntry.value,
              unit: 'score',
              category: 'render',
              threshold: { warning: 0.1, critical: 0.25 },
              metadata: {
                sources: layoutShiftEntry.sources,
                lastInputTime: layoutShiftEntry.lastInputTime
              }
            });
          }
        });
      });

      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Layout shift observation not supported:', error);
    }
  }

  /**
   * Add a custom metric
   */
  public addMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);

    // Check thresholds and log warnings
    this.checkThreshold(fullMetric);

    // Limit metrics array size (keep last 1000 metrics)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Check metric against thresholds
   */
  private checkThreshold(metric: PerformanceMetric): void {
    if (!metric.threshold) return;

    if (metric.value >= metric.threshold.critical) {
      console.error(`🚨 Critical performance issue: ${metric.name} = ${metric.value}${metric.unit}`);
    } else if (metric.value >= metric.threshold.warning) {
      console.warn(`⚠️ Performance warning: ${metric.name} = ${metric.value}${metric.unit}`);
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(js|ts|jsx|tsx)(\?|$)/)) return 'script';
    if (url.match(/\.(css|scss|sass)(\?|$)/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)(\?|$)/)) return 'font';
    if (url.match(/\.(json|xml)(\?|$)/)) return 'data';
    return 'other';
  }

  /**
   * Get metrics by category
   */
  public getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  /**
   * Get metrics by time range
   */
  public getMetricsByTimeRange(start: Date, end: Date): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.timestamp >= start && metric.timestamp <= end
    );
  }

  /**
   * Generate performance report
   */
  public generateReport(timeframe?: { start: Date; end: Date }): PerformanceReport {
    const now = new Date();
    const start = timeframe?.start || new Date(now.getTime() - 60 * 60 * 1000); // Last hour
    const end = timeframe?.end || now;

    const relevantMetrics = this.getMetricsByTimeRange(start, end);
    
    const criticalIssues = relevantMetrics.filter(metric => 
      metric.threshold && metric.value >= metric.threshold.critical
    ).length;

    const warnings = relevantMetrics.filter(metric => 
      metric.threshold && 
      metric.value >= metric.threshold.warning && 
      metric.value < (metric.threshold.critical || Infinity)
    ).length;

    const pageLoadMetrics = relevantMetrics.filter(m => m.name === 'Total Page Load Time');
    const renderMetrics = relevantMetrics.filter(m => m.category === 'render');
    const errorMetrics = relevantMetrics.filter(m => m.name.includes('Error'));

    const averagePageLoad = pageLoadMetrics.length > 0
      ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
      : 0;

    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : 0;

    const errorRate = relevantMetrics.length > 0 
      ? errorMetrics.length / relevantMetrics.length 
      : 0;

    return {
      reportId: `perf-report-${Date.now()}`,
      generatedAt: now,
      timeframe: { start, end },
      summary: {
        totalMetrics: relevantMetrics.length,
        criticalIssues,
        warnings,
        averagePageLoad,
        averageRenderTime,
        errorRate
      },
      metrics: relevantMetrics,
      recommendations: this.generateRecommendations(relevantMetrics),
      trends: this.analyzeTrends(relevantMetrics)
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetric[]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // Check for slow page loads
    const slowPageLoads = metrics.filter(m => 
      m.name === 'Total Page Load Time' && m.value > this.thresholds.pageLoad.warning
    );

    if (slowPageLoads.length > 0) {
      recommendations.push({
        id: 'slow-page-load',
        type: 'optimization',
        priority: 'high',
        title: 'Optimize Page Load Performance',
        description: 'Page load times are exceeding recommended thresholds',
        impact: 'Slower page loads negatively impact user experience and patient care efficiency',
        implementation: 'Implement code splitting, lazy loading, and resource optimization',
        estimatedGain: '30-50% improvement in load times',
        affectedComponents: ['PatientDashboard', 'AppointmentScheduler']
      });
    }

    // Check for memory leaks
    const memoryMetrics = metrics.filter(m => m.category === 'memory');
    const highMemoryUsage = memoryMetrics.filter(m => 
      m.value > this.thresholds.memoryUsage.warning
    );

    if (highMemoryUsage.length > 0) {
      recommendations.push({
        id: 'memory-optimization',
        type: 'memory',
        priority: 'medium',
        title: 'Optimize Memory Usage',
        description: 'Memory usage is higher than recommended',
        impact: 'High memory usage can cause browser slowdowns and crashes',
        implementation: 'Review component lifecycle, implement proper cleanup, use React.memo',
        estimatedGain: '20-30% reduction in memory usage',
        affectedComponents: ['PatientRecords', 'MoodTracker']
      });
    }

    // Check for large resources
    const largeResources = metrics.filter(m => 
      m.name === 'Large Resource Load'
    );

    if (largeResources.length > 0) {
      recommendations.push({
        id: 'resource-optimization',
        type: 'bundling',
        priority: 'medium',
        title: 'Optimize Resource Loading',
        description: 'Large resources are impacting load performance',
        impact: 'Large downloads slow initial page load',
        implementation: 'Implement image optimization, bundle splitting, and compression',
        estimatedGain: '15-25% reduction in bundle size'
      });
    }

    // Check for layout shifts
    const layoutShifts = metrics.filter(m => 
      m.name === 'Cumulative Layout Shift' && m.value > 0.1
    );

    if (layoutShifts.length > 0) {
      recommendations.push({
        id: 'layout-stability',
        type: 'optimization',
        priority: 'medium',
        title: 'Improve Layout Stability',
        description: 'Cumulative Layout Shift scores indicate unstable layouts',
        impact: 'Layout shifts create poor user experience and accessibility issues',
        implementation: 'Reserve space for dynamic content, use aspect-ratio CSS, optimize font loading',
        estimatedGain: 'Improved visual stability and user experience'
      });
    }

    return recommendations;
  }

  /**
   * Analyze performance trends
   */
  private analyzeTrends(metrics: PerformanceMetric[]): PerformanceReport['trends'] {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;

    const recentMetrics = metrics.filter(m => m.timestamp.getTime() > oneHourAgo);
    const olderMetrics = metrics.filter(m => 
      m.timestamp.getTime() <= oneHourAgo && m.timestamp.getTime() > twoHoursAgo
    );

    const getAveragePageLoad = (metricSet: PerformanceMetric[]) => {
      const pageLoadMetrics = metricSet.filter(m => m.name === 'Total Page Load Time');
      return pageLoadMetrics.length > 0 
        ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
        : 0;
    };

    const getAverageMemory = (metricSet: PerformanceMetric[]) => {
      const memoryMetrics = metricSet.filter(m => m.category === 'memory');
      return memoryMetrics.length > 0 
        ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
        : 0;
    };

    const getErrorRate = (metricSet: PerformanceMetric[]) => {
      const errorMetrics = metricSet.filter(m => m.name.includes('Error'));
      return metricSet.length > 0 ? errorMetrics.length / metricSet.length : 0;
    };

    const recentPageLoad = getAveragePageLoad(recentMetrics);
    const olderPageLoad = getAveragePageLoad(olderMetrics);
    
    const recentMemory = getAverageMemory(recentMetrics);
    const olderMemory = getAverageMemory(olderMetrics);
    
    const recentErrors = getErrorRate(recentMetrics);
    const olderErrors = getErrorRate(olderMetrics);

    const getTrend = (recent: number, older: number): 'improving' | 'stable' | 'degrading' => {
      if (older === 0) return 'stable';
      const change = (recent - older) / older;
      if (change < -0.05) return 'improving';
      if (change > 0.05) return 'degrading';
      return 'stable';
    };

    return {
      pageLoadTrend: getTrend(recentPageLoad, olderPageLoad),
      memoryTrend: getTrend(recentMemory, olderMemory),
      errorTrend: getTrend(recentErrors, olderErrors)
    };
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    console.log('📊 Performance metrics cleared');
  }

  /**
   * Enable/disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`📊 Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Cleanup monitoring
   */
  public cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }

    this.metrics = [];
    console.log('📊 Performance monitoring cleaned up');
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();