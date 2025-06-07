import type { UserRole } from '@config/constants/roles'

export type Permission = string

// Core authentication types
export interface User {
  id: string
  email: string
  role: UserRole
  profile: UserProfile
  permissions: Permission[]
  isDemo?: boolean
  createdAt: string
  lastLoginAt: string
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  address?: Address
  // Additional fields based on role
  [key: string]: any
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  suite?: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: User
}

export interface AuthResult {
  success: boolean
  user: User
  session?: Session
  error?: AuthError
}

export interface AuthError {
  code: string
  message: string
  details?: any
}

// Auth state types
export type AuthState = 
  | { status: 'loading' }
  | { status: 'authenticated'; user: User; session: Session }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: AuthError }

// Auth events
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'SESSION_EXPIRED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'

export interface AuthEventData {
  user?: User | null
  session?: Session | null
  error?: AuthError
}

export type AuthCallback = (event: AuthEvent, data: AuthEventData) => void
export type Unsubscribe = () => void

// Service interface
export interface AuthService {
  // Core authentication
  signIn(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<void>
  signUp?(email: string, password: string, profile?: Partial<UserProfile>): Promise<AuthResult>
  
  // Session management
  getCurrentUser(): Promise<User | null>
  getCurrentSession(): Promise<Session | null>
  refreshSession?(): Promise<Session | null>
  
  // Password management
  resetPassword?(email: string): Promise<void>
  updatePassword?(oldPassword: string, newPassword: string): Promise<void>
  
  // Event handling
  onAuthStateChange(callback: AuthCallback): Unsubscribe
  
  // Profile management
  updateProfile?(updates: Partial<UserProfile>): Promise<User>
}

// Configuration types
export interface AuthConfig {
  mode: 'demo' | 'production' | 'mock'
  supabase?: SupabaseAuthConfig
  demo?: DemoAuthConfig
}

export interface SupabaseAuthConfig {
  url: string
  anonKey: string
  options?: {
    autoRefreshToken?: boolean
    persistSession?: boolean
    detectSessionInUrl?: boolean
  }
}

export interface DemoAuthConfig {
  credentials: DemoCredential[]
  practiceData: any
  options?: {
    simulateNetworkDelay?: boolean
    delayMs?: number
  }
}

export interface DemoCredential {
  email: string
  password: string
  role: UserRole
  profile: UserProfile
  permissions: Permission[]
}