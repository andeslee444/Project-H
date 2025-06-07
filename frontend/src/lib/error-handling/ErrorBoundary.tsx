/**
 * Enhanced Error Boundary for Healthcare Application
 * 
 * Provides comprehensive error handling with:
 * - HIPAA-compliant error logging
 * - User-friendly error messages
 * - Error recovery mechanisms
 * - Integration with monitoring systems
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { auditTrail } from '@/lib/security/hipaa/AuditTrail';
import { AuditEventType } from '@/lib/security/hipaa/HIPAACompliance';
import { performanceMonitor } from '@/lib/performance/PerformanceMonitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    // Log error to monitoring system
    performanceMonitor.addMetric({
      id: errorId || 'unknown',
      name: 'Application Error',
      value: 1,
      unit: 'count',
      category: 'error',
      threshold: { warning: 5, critical: 10 },
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      }
    });

    // Log to audit trail (without exposing sensitive data)
    auditTrail.logEvent({
      userId: 'system',
      userRole: 'system',
      eventType: AuditEventType.SYSTEM_ERROR,
      resourceType: 'application',
      resourceId: errorId || 'unknown',
      action: 'error_boundary_triggered',
      outcome: 'failure',
      details: {
        errorType: error.name,
        errorMessage: this.sanitizeErrorMessage(error.message),
        retryCount: this.state.retryCount
      }
    }).catch(console.error);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      // Reset error boundary if resetKeys changed
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove any potential PII or sensitive data from error messages
    return message
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[ID]')
      .replace(/\/api\/[^\s]+/g, '/api/[ENDPOINT]');
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: 0
    });
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));

      // Auto-reset after 5 seconds if error persists
      this.resetTimeoutId = window.setTimeout(() => {
        if (this.state.hasError) {
          this.resetErrorBoundary();
        }
      }, 5000);
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorId, retryCount } = this.state;
    const { children, fallback, isolate } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Minimal error UI for isolated components
      if (isolate) {
        return (
          <Alert variant="destructive" className="m-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Component Error</AlertTitle>
            <AlertDescription>
              This component encountered an error. Please refresh the page.
            </AlertDescription>
          </Alert>
        );
      }

      // Full error UI for page-level errors
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Your data is safe and our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm font-mono">
                Error ID: {errorId}
              </div>

              <div className="space-y-2">
                {retryCount < 3 && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again ({3 - retryCount} attempts remaining)
                  </Button>
                )}

                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-48">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Convenience hook for error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // Log to monitoring
    performanceMonitor.addMetric({
      id: `ERROR_${Date.now()}`,
      name: 'Handled Error',
      value: 1,
      unit: 'count',
      category: 'error',
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorInfo: errorInfo?.componentStack
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Handled error:', error, errorInfo);
    }
  };
}

// Error boundary with suspense support
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}