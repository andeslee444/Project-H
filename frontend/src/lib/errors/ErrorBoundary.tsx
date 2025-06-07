import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFactory, isAppError, reportError, AppError } from './AppError'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

// Simple Alert components for error handling
const Alert = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <div className={`p-4 rounded-md border ${variant === 'destructive' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} ${className || ''}`}>
    {children}
  </div>
)

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-medium text-sm mb-1">{children}</h3>
)

const AlertDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
)

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'section' | 'component'
  name?: string | undefined
}

export interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  resetError: () => void
  level: 'page' | 'section' | 'component'
  name?: string | undefined
}

/**
 * General purpose Error Boundary component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static override getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Convert to AppError if needed
    const appError = isAppError(error) ? error : ErrorFactory.fromError(error, {
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
      boundaryName: this.props.name,
      errorId: this.state.errorId
    })

    // Report the error
    reportError(appError, {
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          level={this.props.level || 'component'}
          name={this.props.name}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  level, 
  name 
}: ErrorFallbackProps) {
  const appError = isAppError(error) ? error : ErrorFactory.fromError(error)
  const userMessage = appError.getUserMessage()
  
  const handleReload = () => {
    window.location.reload()
  }

  const handleHome = () => {
    window.location.href = '/'
  }

  const handleRetry = () => {
    resetError()
  }

  const showDetailedActions = level === 'page'
  const showMinimalActions = level === 'component'

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {level === 'page' ? 'Page Error' : 
             level === 'section' ? 'Section Error' : 
             'Component Error'}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {userMessage}
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleRetry}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          {showDetailedActions && (
            <>
              <Button 
                onClick={handleReload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              
              <Button 
                onClick={handleHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Developer Details
            </summary>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
              {errorInfo && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Component Stack</summary>
                  <pre className="text-xs mt-1 overflow-auto whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Minimal error fallback for small components
 */
export function MinimalErrorFallback({ 
  error, 
  resetError 
}: Pick<ErrorFallbackProps, 'error' | 'resetError'>) {
  const appError = isAppError(error) ? error : ErrorFactory.fromError(error)
  
  return (
    <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span>Error loading component</span>
      </div>
      <Button 
        onClick={resetError}
        variant="ghost"
        size="sm"
        className="mt-2 h-7 px-2 text-xs"
      >
        Retry
      </Button>
    </div>
  )
}

/**
 * Page-level error boundary wrapper
 */
export function PageErrorBoundary({ 
  children, 
  onError 
}: { 
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary
      level="page"
      name="PageBoundary"
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Section-level error boundary wrapper
 */
export function SectionErrorBoundary({ 
  children, 
  name,
  onError 
}: { 
  children: ReactNode
  name?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary
      level="section"
      name={name}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Component-level error boundary wrapper
 */
export function ComponentErrorBoundary({ 
  children, 
  name,
  fallback
}: { 
  children: ReactNode
  name?: string
  fallback?: React.ComponentType<ErrorFallbackProps>
}) {
  return (
    <ErrorBoundary
      level="component"
      name={name}
      fallback={fallback || MinimalErrorFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    level?: 'page' | 'section' | 'component'
    name?: string
    fallback?: React.ComponentType<ErrorFallbackProps>
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  } = {}
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary
      level={options.level || 'component'}
      name={options.name || Component.displayName || Component.name}
      fallback={options.fallback}
      onError={options.onError}
    >
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error | string) => {
    const errorInstance = typeof error === 'string' ? new Error(error) : error
    const appError = isAppError(errorInstance) ? errorInstance : ErrorFactory.fromError(errorInstance)
    
    reportError(appError)
    setError(errorInstance)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to be caught by error boundary
  if (error) {
    throw error
  }

  return { handleError, clearError }
}