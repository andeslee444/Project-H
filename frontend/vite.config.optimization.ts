/**
 * Vite Configuration with Bundle Optimization
 * 
 * Implements advanced optimization strategies for production builds
 * with CDN support and code splitting
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// CDN URLs for external libraries
const CDN_URLS = {
  react: 'https://unpkg.com/react@18/umd/react.production.min.js',
  'react-dom': 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'react-router-dom': 'https://unpkg.com/react-router-dom@6/dist/react-router-dom.production.min.js',
  '@supabase/supabase-js': 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js',
  'framer-motion': 'https://unpkg.com/framer-motion@11/dist/framer-motion.min.js'
};

export default defineConfig({
  plugins: [
    react({
      // Use the new JSX runtime for smaller bundle size
      jsxRuntime: 'automatic'
    }),
    
    // Compress assets with gzip and brotli
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10kb
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    
    // Optimize images
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
    }),
    
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  
  base: process.env.GITHUB_PAGES === 'true' ? '/Project-H/' : '/',
  
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@config': path.resolve(__dirname, './src/config'),
      '@ui': path.resolve(__dirname, './src/shared/components/ui'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    strictPort: true
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Enable source maps for production debugging
    sourcemap: process.env.SOURCE_MAP === 'true',
    
    // Set chunk size warnings
    chunkSizeWarningLimit: 500, // 500kb warning
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy
        manualChunks: {
          // React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI component libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          
          // Utility libraries
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns', 'zod'],
          
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Animation libraries
          'animation-vendor': ['framer-motion'],
          
          // HIPAA compliance and security
          'security': [
            './src/lib/security/hipaa/HIPAACompliance.ts',
            './src/lib/security/hipaa/AuditTrail.ts',
            './src/lib/security/hipaa/DataEncryption.ts',
            './src/lib/security/hipaa/InputSanitization.ts'
          ],
          
          // Performance monitoring
          'performance': [
            './src/lib/performance/PerformanceMonitor.ts',
            './src/lib/performance/OptimizationEngine.ts'
          ]
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'js/[name]-[hash].js',
        
        // Entry file naming
        entryFileNames: 'js/[name]-[hash].js',
      },
      
      // External dependencies for CDN
      external: process.env.USE_CDN === 'true' 
        ? Object.keys(CDN_URLS)
        : [],
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4kb
    
    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true,
    },
    
    // Report compressed size
    reportCompressedSize: true,
  },
  
  // Optimization options
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Preview server configuration
  preview: {
    port: 5000,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  // Environment variable prefix
  envPrefix: 'VITE_',
})