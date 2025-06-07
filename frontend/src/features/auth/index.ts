// Export all authentication functionality from a single entry point

// Components
export { ProtectedRoute, withProtectedRoute, useAccessControl } from './components/ProtectedRoute'

// Hooks
export { 
  useAuth, 
  usePermissions, 
  useRoles, 
  useAuthState, 
  useDemoMode,
  type UseAuthReturn 
} from './hooks/useAuth'

// Providers
export { AuthProvider, AuthContext } from './providers/AuthProvider'

// Services
export { 
  AuthServiceFactory,
  AuthServiceError,
  AuthenticationError,
  AuthorizationError,
  SessionExpiredError,
  InvalidCredentialsError,
  UserNotFoundError,
  ValidationError
} from './services/AuthService'
export { DemoAuthService } from './services/DemoAuthService'
export { SupabaseAuthService } from './services/SupabaseAuthService'
export { MockAuthService } from './services/MockAuthService'

// Types
export type {
  User,
  UserProfile,
  Session,
  AuthResult,
  AuthError,
  AuthState,
  AuthEvent,
  AuthEventData,
  AuthCallback,
  Unsubscribe,
  AuthService,
  AuthConfig,
  SupabaseAuthConfig,
  DemoAuthConfig,
  DemoCredential,
  Permission
} from './types/auth.types'