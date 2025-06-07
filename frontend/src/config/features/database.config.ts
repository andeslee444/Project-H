import type { DatabaseConfig, Environment } from '../index'

export function getDatabaseConfig(environment: Environment): DatabaseConfig {
  switch (environment) {
    case 'development':
      return {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'
      }
    
    case 'github-pages':
    case 'production':
      return {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      }
    
    case 'test':
      return {
        supabaseUrl: 'http://localhost:54321',
        supabaseAnonKey: 'test-key'
      }
    
    default:
      throw new Error(`Unsupported environment: ${environment}`)
  }
}