import type { AuthConfig, Environment } from '../index'

export function getAuthConfig(environment: Environment): AuthConfig {
  switch (environment) {
    case 'test':
      return { mode: 'mock' }
    
    case 'development':
      // In development, use production mode (real Supabase) unless demo mode is explicitly enabled
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        return {
          mode: 'demo',
          demo: {
            credentials: [], // Will be populated from demo.config.ts
            practiceData: {} as any // Will be populated from demo.config.ts
          }
        }
      }
      return {
        mode: 'production',
        supabase: {
          url: import.meta.env.VITE_SUPABASE_URL || '',
          anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        }
      }
    
    case 'github-pages':
      return {
        mode: 'demo',
        demo: {
          credentials: [], // Will be populated from demo.config.ts
          practiceData: {} as any // Will be populated from demo.config.ts
        }
      }
    
    case 'production':
      return {
        mode: 'production',
        supabase: {
          url: import.meta.env.VITE_SUPABASE_URL || '',
          anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        }
      }
    
    default:
      throw new Error(`Unsupported environment: ${environment}`)
  }
}