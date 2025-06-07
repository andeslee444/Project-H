/**
 * Bundle Optimization Utilities
 * 
 * Helper functions for dynamic imports and lazy loading
 */

/**
 * Preload a component for faster subsequent loading
 */
export function preloadComponent(
  componentLoader: () => Promise<any>
): void {
  // Trigger the import but don't wait for it
  componentLoader().catch(() => {
    // Silently fail - component will be loaded on demand if preload fails
  });
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  componentLoaders: Array<() => Promise<any>>
): void {
  componentLoaders.forEach(preloadComponent);
}

/**
 * Conditionally load a component based on user permissions
 */
export async function loadProtectedComponent(
  componentPath: string,
  userRole: string,
  allowedRoles: string[]
): Promise<any> {
  if (!allowedRoles.includes(userRole)) {
    throw new Error('Unauthorized access to component');
  }

  // Dynamic import based on path
  switch (componentPath) {
    case 'Analytics':
      return import('@/features/Analytics');
    case 'Reports':
      return import('@/features/Reports');
    case 'AdminPanel':
      return import('@/features/AdminPanel');
    default:
      throw new Error(`Unknown component: ${componentPath}`);
  }
}

/**
 * Load component with retry logic
 */
export async function loadComponentWithRetry(
  loader: () => Promise<any>,
  retries = 3,
  delay = 1000
): Promise<any> {
  try {
    return await loader();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return loadComponentWithRetry(loader, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Resource hints for better performance
 */
export function addResourceHints(): void {
  // Preconnect to API domain
  addLinkTag('preconnect', process.env.VITE_SUPABASE_URL || '');
  
  // DNS prefetch for external domains
  addLinkTag('dns-prefetch', 'https://fonts.googleapis.com');
  addLinkTag('dns-prefetch', 'https://unpkg.com');
  
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
}

function addLinkTag(rel: string, href: string): void {
  if (!href) return;
  
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  
  if (rel === 'preconnect') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Intersection Observer for lazy loading
 */
export function createLazyLoader(
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onIntersect(entry);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  });
}

/**
 * Image lazy loading with placeholder
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  placeholder?: string
): void {
  const src = img.dataset.src;
  if (!src) return;
  
  // Set placeholder if provided
  if (placeholder && !img.src) {
    img.src = placeholder;
  }
  
  // Create observer
  const observer = createLazyLoader((entry) => {
    const target = entry.target as HTMLImageElement;
    target.src = src;
    target.removeAttribute('data-src');
    observer.unobserve(target);
    
    // Add loaded class for animation
    target.addEventListener('load', () => {
      target.classList.add('loaded');
    });
  });
  
  observer.observe(img);
}

/**
 * Measure bundle load performance
 */
export function measureBundlePerformance(): void {
  if (!window.performance || !window.PerformanceObserver) return;
  
  // Measure resource timing
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach(entry => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Log slow resources
        if (resourceEntry.duration > 1000) {
          console.warn('Slow resource:', {
            name: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize,
            type: resourceEntry.initiatorType
          });
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  // Measure navigation timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.log('Page load metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
        transferSize: navigation.transferSize,
        decodedBodySize: navigation.decodedBodySize
      });
    }, 0);
  });
}

/**
 * Critical CSS extraction helper
 */
export function extractCriticalCSS(
  selectors: string[]
): string {
  const criticalStyles: string[] = [];
  const styleSheets = Array.from(document.styleSheets);
  
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      
      rules.forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          const matches = selectors.some(selector => 
            rule.selectorText.includes(selector)
          );
          
          if (matches) {
            criticalStyles.push(rule.cssText);
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheets will throw
    }
  });
  
  return criticalStyles.join('\n');
}

/**
 * Progressive enhancement for low-end devices
 */
export function detectLowEndDevice(): boolean {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for low memory
  const memory = (navigator as any).deviceMemory;
  const isLowMemory = memory && memory < 4;
  
  // Check for slow connection
  const connection = (navigator as any).connection;
  const isSlow = connection && (
    connection.saveData ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g'
  );
  
  // Check CPU cores
  const cores = navigator.hardwareConcurrency;
  const isLowCPU = cores && cores < 4;
  
  return !!(prefersReducedMotion || isLowMemory || isSlow || isLowCPU);
}