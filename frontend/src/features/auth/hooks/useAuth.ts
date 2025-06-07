import { useContext } from 'react'
import { AuthContext } from '../providers/AuthProvider'
import type { User, Session, AuthService } from '../types/auth.types'

export interface UseAuthReturn {
  // Auth state
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  isDemo: boolean
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: ((email: string, password: string, profile?: Partial<User['profile']>) => Promise<void>) | undefined
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  
  // Utility functions
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllPermissions: (permissions: readonly string[]) => boolean
  
  // Service access (for advanced use cases)
  authService: AuthService
}

/**
 * Primary authentication hook
 * Provides access to current auth state and auth actions
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Hook for checking user permissions
 * Useful for conditional rendering based on permissions
 */
export function usePermissions(requiredPermissions: readonly string[] = []) {
  const { user, hasAllPermissions } = useAuth()
  
  return {
    hasPermissions: hasAllPermissions(requiredPermissions),
    userPermissions: user?.permissions || [],
    checkPermission: (permission: string) => user?.permissions.includes(permission) || false
  }
}

/**
 * Hook for checking user roles
 * Useful for conditional rendering based on roles
 */
export function useRoles(requiredRoles: string[] = []) {
  const { user, hasAnyRole } = useAuth()
  
  return {
    hasRequiredRole: hasAnyRole(requiredRoles),
    userRole: user?.role || null,
    checkRole: (role: string) => user?.role === role
  }
}

/**
 * Hook for auth state only (no actions)
 * Useful for components that only need to read auth state
 */
export function useAuthState() {
  const { user, session, isAuthenticated, isLoading, isDemo } = useAuth()
  
  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isDemo
  }
}

/**
 * Hook for demo mode detection
 * Useful for showing demo-specific UI elements
 */
export function useDemoMode() {
  const { isDemo, user } = useAuth()
  
  return {
    isDemo,
    isDemoUser: user?.isDemo || false,
    showDemoIndicator: isDemo
  }
}