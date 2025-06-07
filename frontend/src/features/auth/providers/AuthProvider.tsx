import React, { createContext, useCallback, useEffect, useMemo, useReducer } from 'react'
import type { 
  User, 
  Session, 
  AuthService, 
  AuthEvent, 
  AuthEventData,
  AuthConfig 
} from '../types/auth.types'
import { UseAuthReturn } from '../hooks/useAuth'
import { AuthServiceFactory } from '../services/AuthService'
import { getConfig } from '@config/index'

// Auth state management
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
}

type AuthAction = 
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; session?: Session } }
  | { type: 'AUTH_SIGNED_OUT' }
  | { type: 'AUTH_ERROR'; payload: Error }
  | { type: 'SESSION_UPDATED'; payload: Session }
  | { type: 'USER_UPDATED'; payload: User }

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  error: null
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session || state.session,
        isLoading: false,
        error: null
      }
    
    case 'AUTH_SIGNED_OUT':
      return {
        ...state,
        user: null,
        session: null,
        isLoading: false,
        error: null
      }
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }
    
    case 'SESSION_UPDATED':
      return {
        ...state,
        session: action.payload,
        user: action.payload.user
      }
    
    case 'USER_UPDATED':
      return {
        ...state,
        user: action.payload,
        session: state.session ? {
          ...state.session,
          user: action.payload
        } : null
      }
    
    default:
      return state
  }
}

// Context
export const AuthContext = createContext<UseAuthReturn | null>(null)

// Provider props
interface AuthProviderProps {
  children: React.ReactNode
  config?: AuthConfig
}

/**
 * AuthProvider component that manages authentication state and provides auth context
 */
export function AuthProvider({ children, config }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  // Get configuration
  const appConfig = useMemo(() => config || getConfig(), [config])
  
  // Create auth service
  const authService = useMemo(() => {
    const authConfig = 'auth' in appConfig ? appConfig.auth : appConfig
    return AuthServiceFactory.getInstance(authConfig)
  }, [appConfig])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        dispatch({ type: 'AUTH_LOADING' })
        
        const [user, session] = await Promise.all([
          authService.getCurrentUser(),
          authService.getCurrentSession()
        ])

        if (mounted) {
          if (user) {
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: session ? { user, session } : { user }
            })
          } else {
            dispatch({ type: 'AUTH_SIGNED_OUT' })
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Auth initialization error:', error)
          dispatch({ type: 'AUTH_ERROR', payload: error as Error })
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [authService])

  // Set up auth state change listener
  useEffect(() => {
    const handleAuthStateChange = (event: AuthEvent, data: AuthEventData) => {
      switch (event) {
        case 'SIGNED_IN':
          if (data.user && data.session) {
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { user: data.user, session: data.session } 
            })
          }
          break
        
        case 'SIGNED_OUT':
          dispatch({ type: 'AUTH_SIGNED_OUT' })
          break
        
        case 'SESSION_EXPIRED':
          dispatch({ type: 'AUTH_SIGNED_OUT' })
          break
        
        case 'USER_UPDATED':
          if (data.user) {
            dispatch({ type: 'USER_UPDATED', payload: data.user })
          }
          break
      }
    }

    const unsubscribe = authService.onAuthStateChange(handleAuthStateChange)
    
    return unsubscribe
  }, [authService])

  // Auth actions
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' })
      
      const result = await authService.signIn(email, password)
      
      if (result.success && result.user) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: result.session ? { user: result.user, session: result.session } : { user: result.user }
        })
      } else {
        throw new Error('Sign in failed')
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error as Error })
      throw error
    }
  }, [authService])

  const signOut = useCallback(async () => {
    try {
      await authService.signOut()
      dispatch({ type: 'AUTH_SIGNED_OUT' })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error as Error })
      throw error
    }
  }, [authService])

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    profile?: Partial<User['profile']>
  ) => {
    if (!authService.signUp) {
      throw new Error('Sign up not supported in current auth mode')
    }

    try {
      dispatch({ type: 'AUTH_LOADING' })
      
      const result = await authService.signUp(email, password, profile)
      
      if (result.success && result.user) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: result.session ? { user: result.user, session: result.session } : { user: result.user }
        })
      } else {
        throw new Error('Sign up failed')
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error as Error })
      throw error
    }
  }, [authService])

  const updateProfile = useCallback(async (updates: Partial<User['profile']>) => {
    if (!authService.updateProfile) {
      throw new Error('Profile update not supported in current auth mode')
    }

    try {
      const updatedUser = await authService.updateProfile(updates)
      dispatch({ type: 'USER_UPDATED', payload: updatedUser })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error as Error })
      throw error
    }
  }, [authService])

  const resetPassword = useCallback(async (email: string) => {
    if (!authService.resetPassword) {
      throw new Error('Password reset not supported in current auth mode')
    }

    try {
      await authService.resetPassword(email)
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error as Error })
      throw error
    }
  }, [authService])

  // Utility functions
  const hasPermission = useCallback((permission: string): boolean => {
    return state.user?.permissions.includes(permission as any) || false
  }, [state.user])

  const hasRole = useCallback((role: string): boolean => {
    return state.user?.role === role
  }, [state.user])

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false
  }, [state.user])

  const hasAllPermissions = useCallback((permissions: readonly string[]): boolean => {
    if (!state.user) return false
    return permissions.every(permission => state.user!.permissions.includes(permission as any))
  }, [state.user])

  // Context value
  const contextValue: UseAuthReturn = useMemo(() => ({
    // State
    user: state.user,
    session: state.session,
    isAuthenticated: !!state.user,
    isLoading: state.isLoading,
    isDemo: ('auth' in appConfig ? appConfig.auth.mode : appConfig.mode) === 'demo',
    
    // Actions
    signIn,
    signOut,
    signUp: authService.signUp ? signUp : undefined,
    updateProfile,
    resetPassword,
    
    // Utilities
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    
    // Service
    authService
  }), [
    state,
    appConfig,
    signIn,
    signOut,
    signUp,
    updateProfile,
    resetPassword,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    authService
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}