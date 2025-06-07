/**
 * Performance Optimizer for Healthcare Applications
 * 
 * Provides automated performance optimizations specifically
 * tailored for mental health practice management systems.
 */

import { performanceMonitor } from './PerformanceMonitor';

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableMemoization: boolean;
  enableVirtualization: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableServiceWorker: boolean;
  enablePrefetching: boolean;
  maxBundleSize: number; // KB
  maxImageSize: number; // KB
  enableResourceHints: boolean;
}

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  enableLazyLoading: true,
  enableMemoization: true,
  enableVirtualization: true,
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enableServiceWorker: true,
  enablePrefetching: true,
  maxBundleSize: 1024, // 1MB
  maxImageSize: 500, // 500KB
  enableResourceHints: true
};

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private config: OptimizationConfig;
  private intersectionObserver?: IntersectionObserver;
  private preloadedRoutes = new Set<string>();
  private imageCache = new Map<string, string>();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
    this.initializeOptimizations();
  }

  /**
   * Initialize performance optimizations
   */
  private initializeOptimizations(): void {
    if (typeof window === 'undefined') return;

    if (this.config.enableLazyLoading) {
      this.setupLazyLoading();
    }

    if (this.config.enableImageOptimization) {
      this.setupImageOptimization();
    }

    if (this.config.enablePrefetching) {
      this.setupPrefetching();
    }

    if (this.config.enableResourceHints) {
      this.setupResourceHints();
    }

    console.log('⚡ Performance optimizations initialized');
  }

  /**
   * Setup lazy loading for images and components
   */
  private setupLazyLoading(): void {
    if (!window.IntersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          
          // Lazy load images
          if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.intersectionObserver?.unobserve(img);
            }
          }

          // Lazy load components
          if (target.dataset.lazyComponent) {
            const event = new CustomEvent('lazyComponentLoad', {
              detail: { componentName: target.dataset.lazyComponent }
            });
            target.dispatchEvent(event);
            this.intersectionObserver?.unobserve(target);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.1
    });

    // Observe existing images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.intersectionObserver?.observe(img);
    });
  }

  /**
   * Setup image optimization
   */
  private setupImageOptimization(): void {
    // Monitor image loading performance
    if (window.PerformanceObserver) {
      const imageObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            performanceMonitor.addMetric({
              id: `image-load-${Date.now()}`,
              name: 'Image Load Time',
              value: resourceEntry.duration,
              unit: 'ms',
              category: 'network',
              threshold: { warning: 500, critical: 2000 },
              metadata: {
                url: resourceEntry.name,
                size: resourceEntry.transferSize,
                cached: resourceEntry.transferSize === 0
              }
            });

            // Warn about large images
            if (resourceEntry.transferSize > this.config.maxImageSize * 1024) {
              console.warn(`🖼️ Large image detected: ${resourceEntry.name} (${Math.round(resourceEntry.transferSize / 1024)}KB)`);
            }
          }
        });
      });

      imageObserver.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Setup route prefetching for healthcare workflows
   */
  private setupPrefetching(): void {
    // Prefetch critical healthcare routes on idle
    const criticalRoutes = [
      '/patients',
      '/appointments',
      '/dashboard',
      '/calendar',
      '/emergency'
    ];

    const prefetchRoute = (route: string) => {
      if (this.preloadedRoutes.has(route)) return;

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
      
      this.preloadedRoutes.add(route);
      
      performanceMonitor.addMetric({
        id: `route-prefetch-${Date.now()}`,
        name: 'Route Prefetch',
        value: 1,
        unit: 'count',
        category: 'custom',
        metadata: { route }
      });
    };

    // Use requestIdleCallback if available
    const scheduleWork = (window as any).requestIdleCallback || setTimeout;
    
    criticalRoutes.forEach((route, index) => {
      scheduleWork(() => prefetchRoute(route), { timeout: 1000 * (index + 1) });
    });
  }

  /**
   * Setup resource hints for better loading performance
   */
  private setupResourceHints(): void {
    const criticalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.practice-management.com' // Healthcare API
    ];

    criticalDomains.forEach(domain => {
      // DNS prefetch
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = `//${domain}`;
      document.head.appendChild(dnsLink);

      // Preconnect for critical domains
      if (domain.includes('api.')) {
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = `https://${domain}`;
        document.head.appendChild(preconnectLink);
      }
    });
  }

  /**
   * Optimize component for healthcare data display
   */
  public optimizeHealthcareComponent<T>(
    Component: React.ComponentType<T>,
    options: {
      enableMemo?: boolean;
      enableVirtualization?: boolean;
      dataSize?: 'small' | 'medium' | 'large';
      updateFrequency?: 'low' | 'medium' | 'high';
    } = {}
  ): React.ComponentType<T> {
    const {
      enableMemo = this.config.enableMemoization,
      enableVirtualization = this.config.enableVirtualization,
      dataSize = 'medium',
      updateFrequency = 'medium'
    } = options;

    let OptimizedComponent = Component;

    // Apply memoization based on update frequency
    if (enableMemo && updateFrequency !== 'high') {
      OptimizedComponent = React.memo(OptimizedComponent) as React.ComponentType<T>;
    }

    // Add performance monitoring
    const MonitoredComponent = (props: T) => {
      const startTime = performance.now();
      
      React.useEffect(() => {
        const renderTime = performance.now() - startTime;
        
        performanceMonitor.addMetric({
          id: `component-render-${Date.now()}`,
          name: 'Component Render',
          value: renderTime,
          unit: 'ms',
          category: 'render',
          threshold: { 
            warning: dataSize === 'large' ? 200 : dataSize === 'medium' ? 100 : 50,
            critical: dataSize === 'large' ? 500 : dataSize === 'medium' ? 300 : 150
          },
          metadata: {
            componentName: Component.displayName || Component.name,
            dataSize,
            updateFrequency
          }
        });
      });

      return React.createElement(OptimizedComponent, props);
    };

    MonitoredComponent.displayName = `Optimized(${Component.displayName || Component.name})`;
    return MonitoredComponent;
  }

  /**
   * Optimize API calls for healthcare endpoints
   */
  public optimizeAPICall<T>(
    apiCall: (...args: any[]) => Promise<T>,
    options: {
      cacheKey?: string;
      cacheTTL?: number; // milliseconds
      retryAttempts?: number;
      timeout?: number;
      priority?: 'low' | 'normal' | 'high' | 'critical';
    } = {}
  ): (...args: any[]) => Promise<T> {
    const {
      cacheKey,
      cacheTTL = 5 * 60 * 1000, // 5 minutes default
      retryAttempts = 3,
      timeout = 10000, // 10 seconds
      priority = 'normal'
    } = options;

    const cache = new Map<string, { data: T; timestamp: number }>();

    return async (...args: any[]): Promise<T> => {
      const startTime = performance.now();
      const key = cacheKey || JSON.stringify(args);

      // Check cache first
      if (cache.has(key)) {
        const cached = cache.get(key)!;
        if (Date.now() - cached.timestamp < cacheTTL) {
          performanceMonitor.addMetric({
            id: `api-cache-hit-${Date.now()}`,
            name: 'API Cache Hit',
            value: performance.now() - startTime,
            unit: 'ms',
            category: 'network',
            metadata: { cacheKey: key, priority }
          });
          return cached.data;
        } else {
          cache.delete(key);
        }
      }

      // Implement timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API call timeout')), timeout);
      });

      let lastError: Error | null = null;

      // Retry logic
      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          const result = await Promise.race([apiCall(...args), timeoutPromise]);
          const duration = performance.now() - startTime;

          // Cache successful result
          cache.set(key, { data: result, timestamp: Date.now() });

          performanceMonitor.addMetric({
            id: `api-success-${Date.now()}`,
            name: 'API Call Success',
            value: duration,
            unit: 'ms',
            category: 'network',
            threshold: {
              warning: priority === 'critical' ? 500 : priority === 'high' ? 1000 : 2000,
              critical: priority === 'critical' ? 1000 : priority === 'high' ? 3000 : 5000
            },
            metadata: {
              attempt,
              priority,
              cached: false,
              cacheKey: key
            }
          });

          return result;
        } catch (error) {
          lastError = error as Error;
          
          performanceMonitor.addMetric({
            id: `api-error-${Date.now()}`,
            name: 'API Call Error',
            value: performance.now() - startTime,
            unit: 'ms',
            category: 'network',
            metadata: {
              attempt,
              priority,
              error: lastError.message,
              willRetry: attempt < retryAttempts
            }
          });

          if (attempt < retryAttempts) {
            // Exponential backoff for retries
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      throw lastError || new Error('API call failed after retries');
    };
  }

  /**
   * Setup performance budget monitoring
   */
  public setupPerformanceBudget(budget: {
    maxPageLoadTime: number;
    maxBundleSize: number;
    maxMemoryUsage: number;
    maxAPIResponseTime: number;
  }): void {
    const checkBudget = () => {
      const report = performanceMonitor.generateReport();
      const violations: string[] = [];

      if (report.summary.averagePageLoad > budget.maxPageLoadTime) {
        violations.push(`Page load time (${Math.round(report.summary.averagePageLoad)}ms) exceeds budget (${budget.maxPageLoadTime}ms)`);
      }

      if (report.summary.averageRenderTime > budget.maxAPIResponseTime) {
        violations.push(`API response time (${Math.round(report.summary.averageRenderTime)}ms) exceeds budget (${budget.maxAPIResponseTime}ms)`);
      }

      const memoryMetrics = report.metrics.filter(m => m.category === 'memory');
      const avgMemory = memoryMetrics.length > 0 
        ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length 
        : 0;

      if (avgMemory > budget.maxMemoryUsage) {
        violations.push(`Memory usage (${Math.round(avgMemory)}MB) exceeds budget (${budget.maxMemoryUsage}MB)`);
      }

      if (violations.length > 0) {
        console.warn('💰 Performance budget violations detected:', violations);
        
        performanceMonitor.addMetric({
          id: `budget-violation-${Date.now()}`,
          name: 'Performance Budget Violation',
          value: violations.length,
          unit: 'count',
          category: 'custom',
          threshold: { warning: 1, critical: 3 },
          metadata: { violations }
        });
      }
    };

    // Check budget every 5 minutes
    setInterval(checkBudget, 5 * 60 * 1000);
    
    // Initial check
    setTimeout(checkBudget, 10000); // After 10 seconds to allow initial load
  }

  /**
   * Register lazy-loadable image
   */
  public registerLazyImage(element: HTMLImageElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
  }

  /**
   * Preload critical resources for healthcare workflows
   */
  public preloadCriticalResources(): void {
    const criticalResources = [
      '/api/patients/dashboard-summary',
      '/api/appointments/today',
      '/api/emergency-contacts',
      '/api/user/preferences'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'fetch';
      link.href = resource;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(): Array<{
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    implementation: string;
  }> {
    const report = performanceMonitor.generateReport();
    const recommendations = [];

    // Check for slow page loads
    if (report.summary.averagePageLoad > 3000) {
      recommendations.push({
        type: 'code-splitting',
        description: 'Implement route-based code splitting to reduce initial bundle size',
        impact: 'high' as const,
        implementation: 'Use React.lazy() and Suspense for route components'
      });
    }

    // Check for memory issues
    const memoryMetrics = report.metrics.filter(m => m.category === 'memory');
    const avgMemory = memoryMetrics.length > 0 
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length 
      : 0;

    if (avgMemory > 100) {
      recommendations.push({
        type: 'memory-optimization',
        description: 'Optimize memory usage by implementing proper cleanup in useEffect',
        impact: 'medium' as const,
        implementation: 'Review component lifecycle and remove event listeners properly'
      });
    }

    // Check for slow API calls
    const apiMetrics = report.metrics.filter(m => 
      m.category === 'network' && m.name.includes('API')
    );
    const slowAPIs = apiMetrics.filter(m => m.value > 2000);

    if (slowAPIs.length > 0) {
      recommendations.push({
        type: 'api-optimization',
        description: 'Implement API response caching and request optimization',
        impact: 'high' as const,
        implementation: 'Add React Query or SWR for caching and background updates'
      });
    }

    return recommendations;
  }

  /**
   * Cleanup optimizer
   */
  public cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    this.imageCache.clear();
    this.preloadedRoutes.clear();
    
    console.log('⚡ Performance optimizer cleaned up');
  }
}

// Global performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer();