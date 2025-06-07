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
  return environment === 'development' || environment === 'github-pages'
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