import type { 
  AuthService, 
  AuthResult, 
  User, 
  Session, 
  AuthCallback, 
  Unsubscribe,
  AuthEvent,
  AuthEventData
} from '../types/auth.types'
import { InvalidCredentialsError, AuthenticationError } from './AuthService'
import { USER_ROLES, PERMISSIONS } from '@config/constants/roles'

/**
 * Mock authentication service for unit testing
 * Provides predictable authentication behavior for tests
 */
export class MockAuthService implements AuthService {
  private currentUser: User | null = null
  private currentSession: Session | null = null
  private listeners: AuthCallback[] = []
  private shouldFailSignIn = false
  private shouldFailSignOut = false

  // Test configuration methods
  setShouldFailSignIn(fail: boolean): void {
    this.shouldFailSignIn = fail
  }

  setShouldFailSignOut(fail: boolean): void {
    this.shouldFailSignOut = fail
  }

  setMockUser(user: User | null): void {
    this.currentUser = user
    if (user) {
      this.currentSession = this.createMockSession(user)
    } else {
      this.currentSession = null
    }
  }

  // AuthService implementation
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (this.shouldFailSignIn) {
      throw new InvalidCredentialsError('Mock authentication failure')
    }

    // Accept any credentials in mock mode
    const user = this.createMockUser(email)
    const session = this.createMockSession(user)

    this.setCurrentUser(user)
    this.setCurrentSession(session)

    this.notifyListeners('SIGNED_IN', { user, session })

    return {
      success: true,
      user,
      session
    }
  }

  async signOut(): Promise<void> {
    if (this.shouldFailSignOut) {
      throw new AuthenticationError('Mock sign out failure')
    }

    this.setCurrentUser(null)
    this.setCurrentSession(null)

    this.notifyListeners('SIGNED_OUT', { user: null, session: null })
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser
  }

  async getCurrentSession(): Promise<Session | null> {
    return this.currentSession
  }

  async refreshSession(): Promise<Session | null> {
    if (!this.currentUser) {
      return null
    }

    const newSession = this.createMockSession(this.currentUser)
    this.setCurrentSession(newSession)

    return newSession
  }

  async updateProfile(updates: Partial<User['profile']>): Promise<User> {
    if (!this.currentUser) {
      throw new AuthenticationError('No authenticated user')
    }

    const updatedUser: User = {
      ...this.currentUser,
      profile: {
        ...this.currentUser.profile,
        ...updates
      }
    }

    this.setCurrentUser(updatedUser)
    this.notifyListeners('USER_UPDATED', { user: updatedUser })

    return updatedUser
  }

  async resetPassword(email: string): Promise<void> {
    // Mock implementation - just resolve
    return Promise.resolve()
  }

  onAuthStateChange(callback: AuthCallback): Unsubscribe {
    this.listeners.push(callback)
    
    // Immediately call with current state
    if (this.currentUser && this.currentSession) {
      callback('SIGNED_IN', { user: this.currentUser, session: this.currentSession })
    } else {
      callback('SIGNED_OUT', { user: null, session: null })
    }
    
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Private helper methods
  private createMockUser(email: string): User {
    // Determine role based on email
    let role: typeof USER_ROLES[keyof typeof USER_ROLES] = USER_ROLES.PATIENT
    let permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][] = [PERMISSIONS.READ_OWN_PROFILE]

    if (email.includes('provider')) {
      role = USER_ROLES.PROVIDER
      permissions = [PERMISSIONS.READ_PATIENTS, PERMISSIONS.MANAGE_SCHEDULE]
    } else if (email.includes('admin')) {
      role = USER_ROLES.ADMIN
      permissions = [PERMISSIONS.MANAGE_PROVIDERS, PERMISSIONS.VIEW_ANALYTICS]
    }

    return {
      id: `mock-user-${Date.now()}`,
      email,
      role,
      profile: {
        id: `mock-profile-${Date.now()}`,
        firstName: 'Mock',
        lastName: 'User'
      },
      permissions,
      isDemo: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  }

  private createMockSession(user: User): Session {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

    return {
      accessToken: `mock-token-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      expiresAt: expiresAt.toISOString(),
      user
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUser = user
  }

  private setCurrentSession(session: Session | null): void {
    this.currentSession = session
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