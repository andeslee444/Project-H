import type { 
  AuthService, 
  AuthResult, 
  User, 
  Session, 
  AuthCallback, 
  Unsubscribe,
  DemoAuthConfig,
  AuthEvent,
  AuthEventData
} from '../types/auth.types'
import { InvalidCredentialsError, AuthenticationError } from './AuthService'
import { DEMO_CREDENTIALS } from '@config/features/demo.config'

/**
 * Demo authentication service for development and showcase environments
 * Provides realistic authentication flow without requiring backend services
 */
export class DemoAuthService implements AuthService {
  private currentUser: User | null = null
  private currentSession: Session | null = null
  private listeners: AuthCallback[] = []
  private config: DemoAuthConfig

  constructor(config?: DemoAuthConfig) {
    this.config = config || {
      credentials: DEMO_CREDENTIALS as any,
      practiceData: {},
      options: {
        simulateNetworkDelay: true,
        delayMs: 500
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    await this.simulateNetworkDelay()

    const credential = this.config.credentials.find(
      cred => cred.email === email && cred.password === password
    )

    if (!credential) {
      throw new InvalidCredentialsError('Invalid demo credentials')
    }

    const user = this.createUserFromCredential(credential)
    const session = this.createDemoSession(user)

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
    await this.simulateNetworkDelay()

    const user = this.currentUser
    const session = this.currentSession

    this.setCurrentUser(null)
    this.setCurrentSession(null)

    this.notifyListeners('SIGNED_OUT', { user: null, session: null })
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser
  }

  async getCurrentSession(): Promise<Session | null> {
    // Check if session is expired
    if (this.currentSession && this.isSessionExpired(this.currentSession)) {
      this.handleSessionExpired()
      return null
    }
    
    return this.currentSession
  }

  async refreshSession(): Promise<Session | null> {
    if (!this.currentUser) {
      return null
    }

    await this.simulateNetworkDelay()

    const newSession = this.createDemoSession(this.currentUser)
    this.setCurrentSession(newSession)

    return newSession
  }

  async updateProfile(updates: Partial<User['profile']>): Promise<User> {
    if (!this.currentUser) {
      throw new AuthenticationError('No authenticated user')
    }

    await this.simulateNetworkDelay()

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
    await this.simulateNetworkDelay()

    const credential = this.config.credentials.find(cred => cred.email === email)
    if (!credential) {
      // Don't reveal whether email exists for security
      return
    }

    // In demo mode, just simulate the process
    console.log(`Demo: Password reset email sent to ${email}`)
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
  private createUserFromCredential(credential: typeof DEMO_CREDENTIALS[number]): User {
    return {
      id: credential.profile.id,
      email: credential.email,
      role: credential.role,
      profile: credential.profile,
      permissions: credential.permissions as any,
      isDemo: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  }

  private createDemoSession(user: User): Session {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    return {
      accessToken: `demo-token-${user.id}-${Date.now()}`,
      refreshToken: `demo-refresh-${user.id}-${Date.now()}`,
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

  private async simulateNetworkDelay(): Promise<void> {
    if (this.config.options?.simulateNetworkDelay) {
      const delay = this.config.options.delayMs || 500
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  private isSessionExpired(session: Session): boolean {
    return new Date(session.expiresAt) <= new Date()
  }

  private handleSessionExpired(): void {
    const user = this.currentUser
    const session = this.currentSession

    this.setCurrentUser(null)
    this.setCurrentSession(null)

    this.notifyListeners('SESSION_EXPIRED', { user: null, session: null })
  }
}