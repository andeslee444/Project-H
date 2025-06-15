export type Environment = 'development' | 'production' | 'github-pages' | 'test'

export const detectEnvironment = (): Environment => {
  // Test environment (for unit tests)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return 'test'
  }
  
  // GitHub Pages detection (for demo deployment)
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return 'github-pages'
  }
  
  // Development environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return 'development'
  }
  
  // Default to production
  return 'production'
}

export const isDemo = (environment: Environment): boolean => {
  // Only use demo mode for GitHub Pages deployment
  // In development, use real Supabase unless VITE_DEMO_MODE is explicitly set
  if (environment === 'github-pages') {
    return true
  }
  
  // Check for explicit demo mode flag in development
  if (environment === 'development' && import.meta.env.VITE_DEMO_MODE === 'true') {
    return true
  }
  
  return false
}

export const isProduction = (environment: Environment): boolean => {
  return environment === 'production'
}

export const isDevelopment = (environment: Environment): boolean => {
  return environment === 'development'
}

export const isTest = (environment: Environment): boolean => {
  return environment === 'test'
}