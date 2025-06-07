// Main configuration entry point
export interface AppConfig {
  auth: AuthConfig
  database: DatabaseConfig
  features: FeatureFlags
  demo: DemoConfig
  environment: Environment
}

export interface AuthConfig {
  mode: 'demo' | 'production' | 'mock'
  supabase?: SupabaseConfig
  demo?: DemoConfig
}

export interface DatabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
}

export interface FeatureFlags {
  enableDemo: boolean
  enableAnalytics: boolean
  enableNotifications: boolean
  enableWaitlistMatching: boolean
}

export interface DemoConfig {
  credentials: DemoCredentials[]
  practiceData: PracticeData
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export interface DemoCredentials {
  email: string
  password: string
  role: UserRole
  profile: UserProfile
  permissions: Permission[]
}

export type Permission = string

export interface PracticeData {
  name: string
  address: Address
  phone: string
  // ... other practice data
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  // ... other profile fields
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
}

export type UserRole = 'patient' | 'provider' | 'admin' | 'super_admin'

import { detectEnvironment, type Environment } from './environments'
import { getAuthConfig } from './features/auth.config'
import { getDatabaseConfig } from './features/database.config'
import { getFeatureFlags } from './features/feature-flags.config'
import { getDemoConfig } from './features/demo.config'

export const getConfig = (): AppConfig => {
  const environment = detectEnvironment()
  
  return {
    auth: getAuthConfig(environment),
    database: getDatabaseConfig(environment),
    features: getFeatureFlags(environment),
    demo: getDemoConfig(environment),
    environment
  }
}

// Export individual config getters
export { detectEnvironment } from './environments'
export { getAuthConfig } from './features/auth.config'
export { getDatabaseConfig } from './features/database.config'
export { getFeatureFlags } from './features/feature-flags.config'
export { getDemoConfig } from './features/demo.config'

// Export types
export type { Environment } from './environments'