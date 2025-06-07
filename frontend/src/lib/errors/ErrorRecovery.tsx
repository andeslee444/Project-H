import React from 'react'
import { AppError, isAppError, NetworkError, AuthenticationError } from './AppError'
import { getErrorLogger } from './ErrorLoggingService'

/**
 * Error recovery strategy types
 */
export type RecoveryStrategy = 
  | 'retry'
  | 'retry_with_backoff'
  | 'redirect'
  | 'fallback_ui'
  | 'reload_page'
  | 'clear_cache'
  | 'retry_with_auth'
  | 'show_offline_ui'

/**
 * Recovery configuration
 */
export interface RecoveryConfig {
  strategy: RecoveryStrategy
  maxRetries?: number
  backoffDelay?: number
  redirectUrl?: string
  fallbackComponent?: React.ComponentType<any>
  onRecoveryAttempt?: (attempt: number, error: AppError) => void
  onRecoverySuccess?: () => void
  onRecoveryFailure?: (error: AppError) => void
}

/**
 * Error recovery hook
 */
export function useErrorRecovery() {
  const [recoveryAttempts, setRecoveryAttempts] = React.useState<Map<string, number>>(new Map())
  const [isRecovering, setIsRecovering] = React.useState(false)

  const attemptRecovery = React.useCallback(async (
    error: AppError | Error,
    config: RecoveryConfig
  ): Promise<boolean> => {
    const appError = isAppError(error) ? error : new AppError(error.message)
    const errorKey = appError.getCode()
    const currentAttempts = recoveryAttempts.get(errorKey) || 0

    // Check if we've exceeded max retries
    if (config.maxRetries && currentAttempts >= config.maxRetries) {
      config.onRecoveryFailure?.(appError)
      return false
    }

    setIsRecovering(true)
    setRecoveryAttempts(prev => new Map(prev).set(errorKey, currentAttempts + 1))

    config.onRecoveryAttempt?.(currentAttempts + 1, appError)

    try {
      const success = await executeRecoveryStrategy(appError, config, currentAttempts + 1)
      
      if (success) {
        // Reset attempts on success
        setRecoveryAttempts(prev => {
          const newMap = new Map(prev)
          newMap.delete(errorKey)
          return newMap
        })
        config.onRecoverySuccess?.()
        getErrorLogger().addBreadcrumb('user_action', `Recovery successful for ${errorKey}`)
      }

      return success
    } catch (recoveryError) {
      const recoveryAppError = isAppError(recoveryError) 
        ? recoveryError 
        : new AppError(`Recovery failed: ${recoveryError}`)
      
      getErrorLogger().logError(recoveryAppError, 'error', { 
        originalError: appError,
        recoveryStrategy: config.strategy,
        attempt: currentAttempts + 1
      })
      
      return false
    } finally {
      setIsRecovering(false)
    }
  }, [recoveryAttempts])

  const resetRecoveryAttempts = React.useCallback((errorCode?: string) => {
    if (errorCode) {
      setRecoveryAttempts(prev => {
        const newMap = new Map(prev)
        newMap.delete(errorCode)
        return newMap
      })
    } else {
      setRecoveryAttempts(new Map())
    }
  }, [])

  return {
    attemptRecovery,
    resetRecoveryAttempts,
    isRecovering,
    recoveryAttempts: Object.fromEntries(recoveryAttempts)
  }
}

/**
 * Execute recovery strategy
 */
async function executeRecoveryStrategy(
  error: AppError,
  config: RecoveryConfig,
  attempt: number
): Promise<boolean> {
  switch (config.strategy) {
    case 'retry':
      // Simple retry - just resolve true to trigger a re-render
      return true

    case 'retry_with_backoff':
      // Wait with exponential backoff before retry
      const delay = (config.backoffDelay || 1000) * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      return true

    case 'redirect':
      // Redirect to specified URL
      if (config.redirectUrl) {
        window.location.href = config.redirectUrl
        return true
      }
      return false

    case 'reload_page':
      // Reload the entire page
      window.location.reload()
      return true

    case 'clear_cache':
      // Clear various caches and storage
      try {
        // Clear localStorage
        localStorage.clear()
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        // Clear cache if available
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(name => caches.delete(name)))
        }
        
        // Reload page after clearing cache
        window.location.reload()
        return true
      } catch {
        return false
      }

    case 'retry_with_auth':
      // Attempt to refresh authentication
      try {
        // This would integrate with your auth system
        // For now, redirect to login
        window.location.href = '/auth/login'
        return true
      } catch {
        return false
      }

    case 'show_offline_ui':
      // Switch to offline mode
      // This would be handled by the component using this hook
      return true

    case 'fallback_ui':
      // Show fallback UI
      // This would be handled by the component using this hook
      return true

    default:
      return false
  }
}

/**
 * Component for automatic error recovery
 */
interface ErrorRecoveryProviderProps {
  children: React.ReactNode
  recoveryConfigs: Record<string, RecoveryConfig>
  onError?: (error: AppError) => void
}

export function ErrorRecoveryProvider({ 
  children, 
  recoveryConfigs, 
  onError 
}: ErrorRecoveryProviderProps) {
  const { attemptRecovery } = useErrorRecovery()

  const handleError = React.useCallback((error: AppError) => {
    onError?.(error)

    const errorCode = error.getCode()
    const config = recoveryConfigs[errorCode] || recoveryConfigs['default']

    if (config) {
      attemptRecovery(error, config)
    }
  }, [attemptRecovery, recoveryConfigs, onError])

  return (
    <ErrorRecoveryContext.Provider value={{ handleError }}>
      {children}
    </ErrorRecoveryContext.Provider>
  )
}

/**
 * Context for error recovery
 */
const ErrorRecoveryContext = React.createContext<{
  handleError: (error: AppError) => void
} | null>(null)

/**
 * Hook to use error recovery context
 */
export function useErrorRecoveryContext() {
  const context = React.useContext(ErrorRecoveryContext)
  if (!context) {
    throw new Error('useErrorRecoveryContext must be used within ErrorRecoveryProvider')
  }
  return context
}

/**
 * HOC for automatic error recovery
 */
export function withErrorRecovery<P extends object>(
  Component: React.ComponentType<P>,
  recoveryConfig: RecoveryConfig
) {
  return function ComponentWithErrorRecovery(props: P) {
    const { attemptRecovery } = useErrorRecovery()
    const [error, setError] = React.useState<AppError | null>(null)
    const [isRecovered, setIsRecovered] = React.useState(false)

    const handleError = React.useCallback((error: Error | AppError) => {
      const appError = isAppError(error) ? error : new AppError(error.message)
      setError(appError)
      
      attemptRecovery(appError, {
        ...recoveryConfig,
        onRecoverySuccess: () => {
          setIsRecovered(true)
          setError(null)
          recoveryConfig.onRecoverySuccess?.()
        },
        onRecoveryFailure: (error) => {
          setError(error)
          recoveryConfig.onRecoveryFailure?.(error)
        }
      })
    }, [attemptRecovery])

    // Set up error boundary for this component
    React.useEffect(() => {
      const handleGlobalError = (event: ErrorEvent) => {
        handleError(new Error(event.message))
      }

      const handlePromiseRejection = (event: PromiseRejectionEvent) => {
        handleError(new Error(`Unhandled promise rejection: ${event.reason}`))
      }

      window.addEventListener('error', handleGlobalError)
      window.addEventListener('unhandledrejection', handlePromiseRejection)

      return () => {
        window.removeEventListener('error', handleGlobalError)
        window.removeEventListener('unhandledrejection', handlePromiseRejection)
      }
    }, [handleError])

    if (error && recoveryConfig.strategy === 'fallback_ui' && recoveryConfig.fallbackComponent) {
      const FallbackComponent = recoveryConfig.fallbackComponent
      return <FallbackComponent error={error} onRetry={() => handleError(error)} />
    }

    return <Component {...props} />
  }
}

/**
 * Smart retry component with automatic recovery
 */
interface SmartRetryProps {
  children: React.ReactNode
  onError: (error: Error) => Promise<void> | void
  maxRetries?: number
  backoffDelay?: number
  fallback?: React.ComponentType<{ error: Error; onRetry: () => void }>
}

export function SmartRetry({
  children,
  onError,
  maxRetries = 3,
  backoffDelay = 1000,
  fallback: FallbackComponent
}: SmartRetryProps) {
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = React.useCallback(async () => {
    if (retryCount >= maxRetries) {
      return
    }

    setIsRetrying(true)
    
    try {
      // Wait with exponential backoff
      const delay = backoffDelay * Math.pow(2, retryCount)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      if (error) {
        await onError(error)
      }
      
      setError(null)
      setRetryCount(0)
    } catch (retryError) {
      setRetryCount(prev => prev + 1)
      if (retryCount + 1 >= maxRetries) {
        setError(retryError instanceof Error ? retryError : new Error('Max retries exceeded'))
      }
    } finally {
      setIsRetrying(false)
    }
  }, [error, retryCount, maxRetries, backoffDelay, onError])

  // Automatically retry on error
  React.useEffect(() => {
    if (error && retryCount < maxRetries && !isRetrying) {
      const timer = setTimeout(handleRetry, 100)
      return () => clearTimeout(timer)
    }
  }, [error, retryCount, maxRetries, isRetrying, handleRetry])

  if (error && retryCount >= maxRetries) {
    if (FallbackComponent) {
      return <FallbackComponent error={error} onRetry={handleRetry} />
    }
    throw error // Re-throw to be caught by error boundary
  }

  return <>{children}</>
}

/**
 * Default recovery configurations for common error types
 */
export const DEFAULT_RECOVERY_CONFIGS: Record<string, RecoveryConfig> = {
  NETWORK_ERROR: {
    strategy: 'retry_with_backoff',
    maxRetries: 3,
    backoffDelay: 1000
  },
  AUTHENTICATION_ERROR: {
    strategy: 'retry_with_auth',
    maxRetries: 1,
    redirectUrl: '/auth/login'
  },
  AUTHORIZATION_ERROR: {
    strategy: 'redirect',
    redirectUrl: '/dashboard'
  },
  NOT_FOUND: {
    strategy: 'redirect',
    redirectUrl: '/dashboard'
  },
  SERVER_ERROR: {
    strategy: 'retry_with_backoff',
    maxRetries: 2,
    backoffDelay: 2000
  },
  RATE_LIMIT: {
    strategy: 'retry_with_backoff',
    maxRetries: 3,
    backoffDelay: 5000
  },
  default: {
    strategy: 'retry',
    maxRetries: 1
  }
}

/**
 * Hook for handling specific error types with recovery
 */
export function useErrorHandler(
  customConfigs: Partial<Record<string, RecoveryConfig>> = {}
) {
  const { attemptRecovery } = useErrorRecovery()
  const configs = { ...DEFAULT_RECOVERY_CONFIGS, ...customConfigs }

  const handleError = React.useCallback(async (error: Error | AppError) => {
    const appError = isAppError(error) ? error : new AppError(error.message)
    const errorCode = appError.getCode()
    const config = configs[errorCode] || configs.default

    if (config) {
      return await attemptRecovery(appError, config)
    }

    return false
  }, [attemptRecovery, configs])

  return { handleError }
}