import React from 'react'
import { Button } from '@components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Shield, 
  FileX, 
  Clock, 
  Server, 
  Bug,
  Home,
  ArrowLeft,
  MessageCircle
} from 'lucide-react'
import { AppError, isAppError } from './AppError'

/**
 * Props for error state components
 */
interface ErrorStateProps {
  error?: Error | AppError | string
  title?: string
  message?: string
  onRetry?: () => void
  onGoBack?: () => void
  onGoHome?: () => void
  retryLabel?: string
  showRetry?: boolean
  showGoBack?: boolean
  showGoHome?: boolean
  className?: string
}

/**
 * Generic error state component
 */
export function ErrorState({
  error,
  title = "Something went wrong",
  message,
  onRetry,
  onGoBack,
  onGoHome,
  retryLabel = "Try again",
  showRetry = true,
  showGoBack = false,
  showGoHome = false,
  className = ""
}: ErrorStateProps) {
  const appError = error && typeof error !== 'string' && isAppError(error) ? error : null
  const displayMessage = message || appError?.getUserMessage() || (typeof error === 'string' ? error : "An unexpected error occurred")

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{displayMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryLabel}
            </Button>
          )}
          {showGoBack && onGoBack && (
            <Button onClick={onGoBack} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
          {showGoHome && onGoHome && (
            <Button onClick={onGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Network error state
 */
export function NetworkErrorState({ onRetry, ...props }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-lg">Connection Problem</CardTitle>
          <CardDescription>
            Please check your internet connection and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Authorization error state
 */
export function AuthorizationErrorState({ onGoHome, ...props }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-lg">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to view this content.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={onGoHome} className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Not found error state
 */
export function NotFoundErrorState({ onGoHome, ...props }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FileX className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-lg">Not Found</CardTitle>
          <CardDescription>
            The page or resource you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={onGoHome} className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Server error state
 */
export function ServerErrorState({ onRetry, ...props }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Server className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-lg">Server Error</CardTitle>
          <CardDescription>
            Something went wrong on our end. We're working to fix it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Rate limit error state
 */
export function RateLimitErrorState({ 
  retryAfter = 60,
  onRetry,
  ...props 
}: ErrorStateProps & { retryAfter?: number }) {
  const [countdown, setCountdown] = React.useState(retryAfter)

  React.useEffect(() => {
    if (countdown <= 0) return

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-lg">Too Many Requests</CardTitle>
          <CardDescription>
            Please wait {countdown > 0 ? `${countdown} seconds` : ''} before trying again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onRetry} 
            disabled={countdown > 0}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {countdown > 0 ? `Try Again (${countdown}s)` : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Loading error state (for when data fails to load)
 */
export function LoadingErrorState({ onRetry, ...props }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Failed to Load</AlertTitle>
      <AlertDescription className="mt-2">
        Unable to load the requested data. Please try again.
      </AlertDescription>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm" 
          className="mt-3"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </Alert>
  )
}

/**
 * Form submission error state
 */
export function FormErrorState({ 
  error, 
  onRetry,
  onDismiss 
}: ErrorStateProps & { onDismiss?: () => void }) {
  const appError = error && typeof error !== 'string' && isAppError(error) ? error : null
  const message = appError?.getUserMessage() || (typeof error === 'string' ? error : "Form submission failed")

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Submission Failed</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
      </AlertDescription>
      <div className="mt-3 flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button onClick={onDismiss} variant="ghost" size="sm">
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  )
}

/**
 * Inline error message for form fields
 */
export function InlineErrorMessage({ 
  error, 
  className = "" 
}: { 
  error?: string | string[]
  className?: string 
}) {
  if (!error) return null

  const errorMessages = Array.isArray(error) ? error : [error]

  return (
    <div className={`mt-1 text-sm text-destructive ${className}`}>
      {errorMessages.map((message, index) => (
        <div key={index} className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{message}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Error state for empty/no data scenarios
 */
export function EmptyErrorState({
  title = "No Data Available",
  message = "There's nothing to show right now.",
  icon: Icon = FileX,
  onAction,
  actionLabel = "Refresh",
  ...props
}: ErrorStateProps & { 
  icon?: React.ComponentType<{ className?: string }>
  onAction?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
      {onAction && (
        <Button onClick={onAction} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

/**
 * Error state with user feedback option
 */
export function ErrorStateWithFeedback({
  error,
  onRetry,
  onFeedback,
  ...props
}: ErrorStateProps & { onFeedback?: (feedback: string) => void }) {
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [feedback, setFeedback] = React.useState('')

  const handleSubmitFeedback = () => {
    if (feedback.trim() && onFeedback) {
      onFeedback(feedback.trim())
      setShowFeedback(false)
      setFeedback('')
    }
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Bug className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">Oops! Something went wrong</CardTitle>
          <CardDescription>
            We've encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {!showFeedback ? (
            <Button 
              onClick={() => setShowFeedback(true)}
              variant="outline" 
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Feedback
            </Button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what happened..."
                className="w-full p-2 border rounded-md text-sm resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitFeedback}
                  size="sm"
                  disabled={!feedback.trim()}
                >
                  Send
                </Button>
                <Button 
                  onClick={() => setShowFeedback(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}