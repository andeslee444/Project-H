/**
 * Comprehensive Error Handling System
 * 
 * This module provides a complete error handling solution including:
 * - Structured error types with metadata
 * - Error boundaries for React components
 * - Error logging and monitoring
 * - User-friendly error states
 * - Automatic error recovery mechanisms
 */

import React from 'react'

// Core error types and utilities
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  NetworkError,
  ServerError,
  DatabaseError,
  ExternalServiceError,
  BusinessLogicError,
  ConfigurationError,
  ErrorFactory,
  isAppError,
  getUserErrorMessage,
  ErrorReporter,
  ConsoleErrorReporter,
  setErrorReporter,
  reportError
} from './AppError'

// Error boundaries
export {
  ErrorBoundary,
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
  MinimalErrorFallback,
  withErrorBoundary,
  useErrorHandler as useErrorBoundaryHandler
} from './ErrorBoundary'

// Error logging service
export {
  ErrorLoggingService,
  initializeErrorLogging,
  getErrorLogger,
  logError,
  logWarning,
  logInfo,
  addBreadcrumb
} from './ErrorLoggingService'

export type {
  ErrorLogEntry,
  ErrorBreadcrumb,
  ErrorReportingConfig
} from './ErrorLoggingService'

// Error state components
export {
  ErrorState,
  NetworkErrorState,
  AuthorizationErrorState,
  NotFoundErrorState,
  ServerErrorState,
  RateLimitErrorState,
  LoadingErrorState,
  FormErrorState,
  InlineErrorMessage,
  EmptyErrorState,
  ErrorStateWithFeedback
} from './ErrorStateComponents'

// Error recovery mechanisms
export {
  useErrorRecovery,
  ErrorRecoveryProvider,
  useErrorRecoveryContext,
  withErrorRecovery,
  SmartRetry,
  DEFAULT_RECOVERY_CONFIGS,
  useErrorHandler
} from './ErrorRecovery'

export type {
  RecoveryStrategy,
  RecoveryConfig
} from './ErrorRecovery'

/**
 * Initialize the complete error handling system
 * Call this once in your app's entry point
 */
export function initializeErrorHandling(config: {
  // Logging configuration
  logging?: {
    maxBreadcrumbs?: number
    maxLogEntries?: number
    enableLocalStorage?: boolean
    enableRemoteLogging?: boolean
    remoteEndpoint?: string
    apiKey?: string
    environment?: 'development' | 'staging' | 'production'
    buildVersion?: string
  }
  // Recovery configuration
  recovery?: {
    enableAutoRecovery?: boolean
    customConfigs?: Record<string, any>
  }
  // Global error handling
  enableGlobalHandlers?: boolean
}) {
  // Initialize error logging
  if (config.logging) {
    initializeErrorLogging(config.logging)
  }

  // Set up global error handlers
  if (config.enableGlobalHandlers !== false) {
    setupGlobalErrorHandlers()
  }

  // Log initialization
  addBreadcrumb('user_action', 'Error handling system initialized', {
    config: {
      logging: !!config.logging,
      recovery: !!config.recovery,
      globalHandlers: config.enableGlobalHandlers !== false
    }
  })
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new NetworkError(`Unhandled Promise Rejection: ${event.reason}`)
    logError(error, { type: 'unhandled_promise_rejection', reason: event.reason })
    
    // Prevent default browser behavior
    event.preventDefault()
  })

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message)
    logError(error, {
      type: 'javascript_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as any
      if (target.tagName) {
        addBreadcrumb(
          'ui_event',
          `Resource failed to load: ${target.tagName}`,
          {
            tagName: target.tagName,
            src: target.src || target.href,
            type: 'resource_error'
          },
          'error'
        )
      }
    }
  }, true) // Use capture phase for resource errors
}

/**
 * Create a comprehensive error handling wrapper for React apps
 */
export function createErrorHandlingWrapper(
  config: Parameters<typeof initializeErrorHandling>[0] = {}
) {
  // Initialize error handling
  initializeErrorHandling(config)

  // Return a wrapper component
  return function ErrorHandlingWrapper({ children }: { children: React.ReactNode }) {
    return (
      <PageErrorBoundary>
        <ErrorRecoveryProvider 
          recoveryConfigs={DEFAULT_RECOVERY_CONFIGS}
          onError={(error) => logError(error)}
        >
          {children}
        </ErrorRecoveryProvider>
      </PageErrorBoundary>
    )
  }
}

/**
 * Utility to handle async operations with error recovery
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number
    backoffDelay?: number
    onError?: (error: Error, attempt: number) => void
    onSuccess?: (result: T) => void
  } = {}
): Promise<T> {
  const { retries = 3, backoffDelay = 1000, onError, onSuccess } = options

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await operation()
      onSuccess?.(result)
      return result
    } catch (error) {
      const appError = error instanceof Error ? error : new Error(String(error))
      onError?.(appError, attempt)

      if (attempt === retries) {
        logError(appError, { attempts: attempt, maxRetries: retries })
        throw appError
      }

      // Wait before retry with exponential backoff
      const delay = backoffDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))

      addBreadcrumb(
        'api_call',
        `Retrying operation (attempt ${attempt + 1}/${retries})`,
        { delay, error: appError.message },
        'warn'
      )
    }
  }

  throw new Error('This should never be reached')
}