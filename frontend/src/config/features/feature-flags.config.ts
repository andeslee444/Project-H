import type { FeatureFlags, Environment } from '../index'

export function getFeatureFlags(environment: Environment): FeatureFlags {
  const baseFlags: FeatureFlags = {
    enableDemo: false,
    enableAnalytics: false,
    enableNotifications: true,
    enableWaitlistMatching: true
  }

  switch (environment) {
    case 'development':
      return {
        ...baseFlags,
        enableDemo: true,
        enableAnalytics: true
      }
    
    case 'github-pages':
      return {
        ...baseFlags,
        enableDemo: true,
        enableAnalytics: false // Disable analytics for public demo
      }
    
    case 'production':
      return {
        ...baseFlags,
        enableDemo: false,
        enableAnalytics: true
      }
    
    case 'test':
      return {
        ...baseFlags,
        enableDemo: true,
        enableAnalytics: false
      }
    
    default:
      return baseFlags
  }
}