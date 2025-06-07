import type { AuthService, AuthConfig } from '../types/auth.types'
import { DemoAuthService } from './DemoAuthService'
import { SupabaseAuthService } from './SupabaseAuthService'
import { MockAuthService } from './MockAuthService'

/**
 * Factory class for creating appropriate AuthService implementations
 * based on environment configuration
 */
export class AuthServiceFactory {
  private static instance: AuthService | null = null

  /**
   * Create and return the appropriate AuthService implementation
   */
  static create(config: AuthConfig): AuthService {
    switch (config.mode) {
      case 'demo':
        return new DemoAuthService(config.demo)
      
      case 'production':
        if (!config.supabase) {
          throw new Error('Supabase configuration required for production mode')
        }
        return new SupabaseAuthService(config.supabase)
      
      case 'mock':
        return new MockAuthService()
      
      default:
        throw new Error(`Unsupported auth mode: ${config.mode}`)
    }
  }

  /**
   * Get singleton instance of AuthService
   * Creates new instance if none exists
   */
  static getInstance(config: AuthConfig): AuthService {
    if (!this.instance) {
      this.instance = this.create(config)
    }
    return this.instance
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null
  }
}

// Export types and base errors
export abstract class AuthServiceError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
  }
}

export class AuthenticationError extends AuthServiceError {
  readonly code = 'AUTHENTICATION_ERROR'
  readonly statusCode = 401
}

export class AuthorizationError extends AuthServiceError {
  readonly code = 'AUTHORIZATION_ERROR'
  readonly statusCode = 403
}

export class SessionExpiredError extends AuthServiceError {
  readonly code = 'SESSION_EXPIRED'
  readonly statusCode = 401
}

export class InvalidCredentialsError extends AuthServiceError {
  readonly code = 'INVALID_CREDENTIALS'
  readonly statusCode = 401
}

export class UserNotFoundError extends AuthServiceError {
  readonly code = 'USER_NOT_FOUND'
  readonly statusCode = 404
}

export class ValidationError extends AuthServiceError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
}