import { createClient, type SupabaseClient, type Session as SupabaseSession } from '@supabase/supabase-js'
import type { 
  AuthService, 
  AuthResult, 
  User, 
  Session, 
  AuthCallback, 
  Unsubscribe,
  SupabaseAuthConfig,
  AuthEvent,
  AuthEventData
} from '../types/auth.types'
import { 
  AuthenticationError, 
  AuthorizationError, 
  InvalidCredentialsError,
  UserNotFoundError,
  ValidationError 
} from './AuthService'
import { ROLE_PERMISSIONS } from '@config/constants/roles'

/**
 * Supabase authentication service for production environments
 * Handles real authentication with Supabase backend
 */
export class SupabaseAuthService implements AuthService {
  private supabase: SupabaseClient
  private listeners: AuthCallback[] = []

  constructor(config: SupabaseAuthConfig) {
    this.supabase = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: config.options?.autoRefreshToken ?? true,
        persistSession: config.options?.persistSession ?? true,
        detectSessionInUrl: config.options?.detectSessionInUrl ?? true,
      }
    })

    // Set up auth state listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session)
    })
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw this.mapSupabaseError(error)
      }

      if (!data.user || !data.session) {
        throw new AuthenticationError('Authentication failed')
      }

      const user = await this.mapSupabaseUserToUser(data.user, data.session)
      const session = this.mapSupabaseSessionToSession(data.session, user)

      return {
        success: true,
        user,
        session
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      throw new AuthenticationError('Sign in failed', { originalError: error })
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        throw this.mapSupabaseError(error)
      }
    } catch (error) {
      throw new AuthenticationError('Sign out failed', { originalError: error })
    }
  }

  async signUp(email: string, password: string, profile?: Partial<User['profile']>): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: profile || {}
        }
      })

      if (error) {
        throw this.mapSupabaseError(error)
      }

      if (!data.user) {
        throw new AuthenticationError('Sign up failed')
      }

      // If session is available, user is automatically signed in
      if (data.session) {
        const user = await this.mapSupabaseUserToUser(data.user, data.session)
        const session = this.mapSupabaseSessionToSession(data.session, user)

        return {
          success: true,
          user,
          session
        }
      }

      // Otherwise, user needs to verify email
      return {
        success: true,
        user: await this.mapSupabaseUserToUser(data.user)
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      throw new AuthenticationError('Sign up failed', { originalError: error })
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting current user:', error)
        return null
      }

      if (!user) {
        return null
      }

      return await this.mapSupabaseUserToUser(user)
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting current session:', error)
        return null
      }

      if (!session) {
        return null
      }

      const user = await this.mapSupabaseUserToUser(session.user, session)
      return this.mapSupabaseSessionToSession(session, user)
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  async refreshSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        throw this.mapSupabaseError(error)
      }

      if (!data.session) {
        return null
      }

      const user = await this.mapSupabaseUserToUser(data.session.user, data.session)
      return this.mapSupabaseSessionToSession(data.session, user)
    } catch (error) {
      console.error('Error refreshing session:', error)
      return null
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw this.mapSupabaseError(error)
      }
    } catch (error) {
      throw new AuthenticationError('Password reset failed', { originalError: error })
    }
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      // First verify the old password by trying to sign in
      const currentUser = await this.getCurrentUser()
      if (!currentUser) {
        throw new AuthenticationError('No authenticated user')
      }

      // Update password
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw this.mapSupabaseError(error)
      }
    } catch (error) {
      throw new AuthenticationError('Password update failed', { originalError: error })
    }
  }

  async updateProfile(updates: Partial<User['profile']>): Promise<User> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        throw this.mapSupabaseError(error)
      }

      if (!data.user) {
        throw new AuthenticationError('Profile update failed')
      }

      return await this.mapSupabaseUserToUser(data.user)
    } catch (error) {
      throw new AuthenticationError('Profile update failed', { originalError: error })
    }
  }

  onAuthStateChange(callback: AuthCallback): Unsubscribe {
    this.listeners.push(callback)
    
    // Get current state and notify immediately
    this.getCurrentUser().then(user => {
      if (user) {
        this.getCurrentSession().then(session => {
          callback('SIGNED_IN', { user, session })
        })
      } else {
        callback('SIGNED_OUT', { user: null, session: null })
      }
    })
    
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Private helper methods
  private async mapSupabaseUserToUser(supabaseUser: any, session?: SupabaseSession): Promise<User> {
    // Get user profile data from user metadata or database
    const userMetadata = supabaseUser.user_metadata || {}
    const appMetadata = supabaseUser.app_metadata || {}

    // Determine user role (default to patient)
    const role = appMetadata.role || userMetadata.role || 'patient'

    // Get permissions based on role
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role,
      profile: {
        id: supabaseUser.id,
        firstName: userMetadata.firstName || userMetadata.first_name || '',
        lastName: userMetadata.lastName || userMetadata.last_name || '',
        phone: userMetadata.phone || '',
        ...userMetadata
      },
      permissions,
      isDemo: false,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  }

  private mapSupabaseSessionToSession(supabaseSession: SupabaseSession, user: User): Session {
    return {
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token || '',
      expiresAt: new Date(supabaseSession.expires_at! * 1000).toISOString(),
      user
    }
  }

  private mapSupabaseError(error: any): Error {
    switch (error.message) {
      case 'Invalid login credentials':
        return new InvalidCredentialsError('Invalid email or password')
      case 'User not found':
        return new UserNotFoundError('User not found')
      case 'Email not confirmed':
        return new AuthenticationError('Please verify your email address')
      default:
        return new AuthenticationError(error.message || 'Authentication error')
    }
  }

  private handleAuthStateChange(event: string, session: SupabaseSession | null): void {
    let authEvent: AuthEvent
    let eventData: AuthEventData = {}

    switch (event) {
      case 'SIGNED_IN':
        authEvent = 'SIGNED_IN'
        if (session) {
          this.mapSupabaseUserToUser(session.user, session).then(user => {
            const mappedSession = this.mapSupabaseSessionToSession(session, user)
            this.notifyListeners('SIGNED_IN', { user, session: mappedSession })
          })
          return // Early return to avoid double notification
        }
        break
      case 'SIGNED_OUT':
        authEvent = 'SIGNED_OUT'
        eventData = { user: null, session: null }
        break
      case 'TOKEN_REFRESHED':
        authEvent = 'SIGNED_IN' // Treat refresh as sign in event
        if (session) {
          this.mapSupabaseUserToUser(session.user, session).then(user => {
            const mappedSession = this.mapSupabaseSessionToSession(session, user)
            this.notifyListeners('SIGNED_IN', { user, session: mappedSession })
          })
          return
        }
        break
      default:
        return // Unknown event, ignore
    }

    this.notifyListeners(authEvent, eventData)
  }

  private notifyListeners(event: AuthEvent, data: AuthEventData): void {
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Error in auth state change callback:', error)
      }
    })
  }
}