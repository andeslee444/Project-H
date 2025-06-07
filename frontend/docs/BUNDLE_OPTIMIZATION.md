# Bundle Size Optimization Guide

## Overview

This guide outlines the bundle optimization strategies implemented for the Mental Health Practice Scheduling System to ensure optimal performance and fast load times.

## Current Bundle Analysis

### Initial State
- Total bundle size: ~2.5MB (uncompressed)
- Main chunk: ~800KB
- Vendor chunks: ~1.7MB
- First Contentful Paint: ~2.8s
- Time to Interactive: ~4.2s

### Target Goals
- Total bundle size: < 1MB (compressed)
- Main chunk: < 250KB
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance Score: > 90

## Optimization Strategies

### 1. Code Splitting

#### Route-based Splitting
```javascript
// Lazy load route components
const Patients = lazy(() => import('./pages/Patients'));
const Providers = lazy(() => import('./pages/Providers'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Waitlist = lazy(() => import('./pages/Waitlist'));
```

#### Feature-based Splitting
```javascript
// Split heavy features
const MoodTracker = lazy(() => import('./features/MoodTracker'));
const AnalyticsDashboard = lazy(() => import('./features/Analytics'));
const ReportGenerator = lazy(() => import('./features/Reports'));
```

### 2. External CDN Strategy

#### Development vs Production
```html
<!-- Production: Use CDN for major libraries -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Development: Use local bundles -->
```

#### CDN Configuration
```javascript
// vite.config.ts
build: {
  rollupOptions: {
    external: process.env.USE_CDN === 'true' 
      ? ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
      : [],
    output: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-router-dom': 'ReactRouterDOM',
        '@supabase/supabase-js': 'supabase'
      }
    }
  }
}
```

### 3. Tree Shaking

#### Import Optimization
```javascript
// ❌ Bad - imports entire library
import * as Icons from 'lucide-react';

// ✅ Good - imports only what's needed
import { Calendar, User, Bell } from 'lucide-react';
```

#### Barrel Export Optimization
```javascript
// components/index.ts
// Use explicit exports instead of re-exporting everything
export { Button } from './Button';
export { Card } from './Card';
export { Dialog } from './Dialog';
```

### 4. Image Optimization

#### Next-gen Formats
```javascript
// Use WebP with fallbacks
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

#### Lazy Loading
```javascript
// Lazy load images below the fold
<img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy" />
```

### 5. Compression

#### Gzip/Brotli
- Enable gzip compression: ~60-70% size reduction
- Enable Brotli compression: ~70-80% size reduction
- Configure server to serve compressed files

#### Build Configuration
```javascript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

plugins: [
  viteCompression({
    algorithm: 'gzip',
    threshold: 10240, // 10kb
  }),
  viteCompression({
    algorithm: 'brotliCompress',
    ext: '.br',
  })
]
```

### 6. Bundle Analysis

#### Analyze Command
```bash
# Generate bundle analysis
npm run build:analyze

# View report at dist/stats.html
```

#### Key Metrics to Monitor
- Individual chunk sizes
- Duplicate dependencies
- Unused code
- Large dependencies

### 7. Performance Budgets

#### Webpack Bundle Analyzer Integration
```json
{
  "bundlesize": [
    {
      "path": "./dist/js/main-*.js",
      "maxSize": "250kb"
    },
    {
      "path": "./dist/js/vendor-*.js",
      "maxSize": "500kb"
    },
    {
      "path": "./dist/css/main-*.css",
      "maxSize": "50kb"
    }
  ]
}
```

## Implementation Checklist

- [x] Configure code splitting in Vite
- [x] Set up manual chunks for vendor libraries
- [x] Implement lazy loading for routes
- [x] Configure CDN fallbacks
- [x] Enable compression plugins
- [x] Set up bundle analyzer
- [ ] Implement service worker for caching
- [ ] Configure HTTP/2 push for critical resources
- [ ] Set up performance monitoring

## Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Production build with CDN
USE_CDN=true npm run build

# Analyze bundle
ANALYZE=true npm run build

# Preview production build
npm run preview
```

## Monitoring Performance

### Key Metrics
1. **Bundle Size**: Monitor via CI/CD
2. **Load Time**: Track with Real User Monitoring
3. **Core Web Vitals**: 
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

### Tools
- Lighthouse CI
- Web Vitals Chrome Extension
- Bundle size GitHub Action
- Sentry Performance Monitoring

## CDN Setup

### Recommended CDN Providers
1. **Cloudflare**: Free tier, global network
2. **AWS CloudFront**: Integration with S3
3. **Vercel Edge Network**: Automatic with Vercel deployment

### Configuration Example
```nginx
# Nginx configuration for serving compressed files
location ~* \.(js|css|html)$ {
    gzip_static on;
    brotli_static on;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## Troubleshooting

### Common Issues

#### Large Bundle Size
- Check for duplicate dependencies
- Ensure tree shaking is working
- Look for large imports (moment.js → date-fns)

#### Slow Initial Load
- Implement critical CSS inlining
- Use resource hints (preload, prefetch)
- Enable HTTP/2 server push

#### Memory Issues
- Implement virtual scrolling for large lists
- Use React.memo strategically
- Clean up event listeners and timers

## Future Optimizations

1. **Module Federation**: Share dependencies across micro-frontends
2. **Web Workers**: Offload heavy computations
3. **WASM Integration**: For performance-critical operations
4. **Edge Computing**: Deploy static assets to edge locations
5. **Progressive Enhancement**: Support low-bandwidth users