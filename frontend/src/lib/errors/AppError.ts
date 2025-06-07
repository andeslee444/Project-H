/**
 * Base application error class
 * All custom errors should extend this class
 */
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  
  constructor(
    message: string, 
    public readonly context?: Record<string, any>,
    public readonly userMessage?: string
  ) {
    super(message)
    this.name = this.constructor.name
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
    
    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return this.userMessage || this.message
  }

  /**
   * Get error details for logging
   */
  getLogDetails(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack
    }
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.getUserMessage(),
      statusCode: this.statusCode
    }
  }
}

/**
 * Validation Error
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400

  constructor(
    message: string,
    public readonly field?: string,
    public readonly validationErrors?: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(
      message,
      { field, validationErrors, ...context },
      'Please check your input and try again'
    )
  }
}

/**
 * Authentication Error
 * Used for authentication failures
 */
export class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_ERROR'
  readonly statusCode = 401

  constructor(
    message: string = 'Authentication required',
    context?: Record<string, any>
  ) {
    super(
      message,
      context,
      'Please log in to continue'
    )
  }
}

/**
 * Authorization Error
 * Used for permission/access control failures
 */
export class AuthorizationError extends AppError {
  readonly code = 'AUTHORIZATION_ERROR'
  readonly statusCode = 403

  constructor(
    message: string = 'Access denied',
    public readonly requiredPermissions?: string[],
    context?: Record<string, any>
  ) {
    super(
      message,
      { requiredPermissions, ...context },
      'You do not have permission to perform this action'
    )
  }
}

/**
 * Not Found Error
 * Used when requested resources don't exist
 */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404

  constructor(
    message: string = 'Resource not found',
    public readonly resourceType?: string,
    public readonly resourceId?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      { resourceType, resourceId, ...context },
      'The requested item could not be found'
    )
  }
}

/**
 * Conflict Error
 * Used for resource conflicts (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  readonly code = 'CONFLICT'
  readonly statusCode = 409

  constructor(
    message: string = 'Resource conflict',
    public readonly conflictType?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      { conflictType, ...context },
      'This action conflicts with existing data'
    )
  }
}

/**
 * Rate Limit Error
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMIT'
  readonly statusCode = 429

  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(
      message,
      { retryAfter, ...context },
      'Too many requests. Please try again later'
    )
  }
}

/**
 * Network Error
 * Used for network/connection failures
 */
export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR'
  readonly statusCode = 500

  constructor(
    message: string = 'Network error',
    context?: Record<string, any>
  ) {
    super(
      message,
      context,
      'Network connection failed. Please check your internet connection'
    )
  }
}

/**
 * Server Error
 * Used for internal server errors
 */
export class ServerError extends AppError {
  readonly code = 'SERVER_ERROR'
  readonly statusCode = 500

  constructor(
    message: string = 'Internal server error',
    context?: Record<string, any>
  ) {
    super(
      message,
      context,
      'Something went wrong on our end. Please try again later'
    )
  }
}

/**
 * Database Error
 * Used for database operation failures
 */
export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR'
  readonly statusCode = 500

  constructor(
    message: string = 'Database error',
    public readonly operation?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      { operation, ...context },
      'A database error occurred. Please try again'
    )
  }
}

/**
 * External Service Error
 * Used for third-party service failures
 */
export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR'
  readonly statusCode = 502

  constructor(
    message: string = 'External service error',
    public readonly serviceName?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      { serviceName, ...context },
      'An external service is currently unavailable. Please try again later'
    )
  }
}

/**
 * Business Logic Error
 * Used for domain-specific business rule violations
 */
export class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR'
  readonly statusCode = 422

  constructor(
    message: string,
    public readonly businessRule?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      { businessRule, ...context },
      message // Business logic errors are usually user-friendly
    )
  }
}

/**
 * Configuration Error
 * Used for configuration/setup issues
 */
export class ConfigurationError extends AppError {
  readonly code = 'CONFIGURATION_ERROR'
  readonly statusCode = 500

  constructor(
    message: string = 'Configuration error',
    public readonly configKey?: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      { configKey, ...context },
      'A configuration error occurred. Please contact support'
    )
  }
}

/**
 * Error factory for creating appropriate error instances
 */
export class ErrorFactory {
  static fromHttpStatus(
    status: number, 
    message?: string, 
    context?: Record<string, any>
  ): AppError {
    switch (status) {
      case 400:
        return new ValidationError(message || 'Bad request', undefined, undefined, context)
      case 401:
        return new AuthenticationError(message, context)
      case 403:
        return new AuthorizationError(message, undefined, context)
      case 404:
        return new NotFoundError(message, undefined, undefined, context)
      case 409:
        return new ConflictError(message, undefined, context)
      case 422:
        return new BusinessLogicError(message || 'Business logic error', undefined, context)
      case 429:
        return new RateLimitError(message, undefined, context)
      case 502:
      case 503:
      case 504:
        return new ExternalServiceError(message, undefined, context)
      default:
        return new ServerError(message || 'Internal server error', context)
    }
  }

  static fromError(error: Error, context?: Record<string, any>): AppError {
    // If it's already an AppError, return as-is
    if (error instanceof AppError) {
      return error
    }

    // Handle specific error types
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error.message, { originalError: error, ...context })
    }

    if (error.message.includes('validation')) {
      return new ValidationError(error.message, undefined, undefined, { originalError: error, ...context })
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return new AuthenticationError(error.message, { originalError: error, ...context })
    }

    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return new AuthorizationError(error.message, undefined, { originalError: error, ...context })
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return new NotFoundError(error.message, undefined, undefined, { originalError: error, ...context })
    }

    // Default to server error
    return new ServerError(error.message, { originalError: error, ...context })
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

/**
 * Extract user-friendly message from any error
 */
export function getUserErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.getUserMessage()
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

/**
 * Error reporter for logging and monitoring
 */
export interface ErrorReporter {
  report(error: AppError, additionalContext?: Record<string, any>): void
}

export class ConsoleErrorReporter implements ErrorReporter {
  report(error: AppError, additionalContext?: Record<string, any>): void {
    console.error('AppError:', {
      ...error.getLogDetails(),
      additionalContext
    })
  }
}

// Global error reporter instance
let errorReporter: ErrorReporter = new ConsoleErrorReporter()

export function setErrorReporter(reporter: ErrorReporter): void {
  errorReporter = reporter
}

export function reportError(error: AppError, additionalContext?: Record<string, any>): void {
  errorReporter.report(error, additionalContext)
}