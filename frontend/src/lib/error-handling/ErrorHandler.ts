/**
 * Centralized Error Handling Service
 * 
 * Provides standardized error handling patterns for the healthcare application
 * with HIPAA-compliant logging and user-friendly error messages
 */

import { auditTrail } from '@/lib/security/hipaa/AuditTrail';
import { AuditEventType } from '@/lib/security/hipaa/HIPAACompliance';
import { performanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { toast } from '@/components/ui/use-toast';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_INTEGRITY = 'data_integrity',
  SYSTEM = 'system',
  BUSINESS_LOGIC = 'business_logic',
  HIPAA_COMPLIANCE = 'hipaa_compliance'
}

// Standard error codes
export enum ErrorCode {
  // Network errors (1xxx)
  NETWORK_ERROR = 1000,
  TIMEOUT = 1001,
  CONNECTION_LOST = 1002,
  
  // Authentication errors (2xxx)
  UNAUTHENTICATED = 2000,
  INVALID_CREDENTIALS = 2001,
  SESSION_EXPIRED = 2002,
  
  // Authorization errors (3xxx)
  UNAUTHORIZED = 3000,
  INSUFFICIENT_PERMISSIONS = 3001,
  RESOURCE_ACCESS_DENIED = 3002,
  
  // Validation errors (4xxx)
  VALIDATION_ERROR = 4000,
  INVALID_INPUT = 4001,
  MISSING_REQUIRED_FIELD = 4002,
  
  // Data errors (5xxx)
  DATA_NOT_FOUND = 5000,
  DATA_INTEGRITY_ERROR = 5001,
  DUPLICATE_ENTRY = 5002,
  
  // System errors (6xxx)
  INTERNAL_ERROR = 6000,
  SERVICE_UNAVAILABLE = 6001,
  CONFIGURATION_ERROR = 6002,
  
  // HIPAA compliance errors (7xxx)
  HIPAA_VIOLATION = 7000,
  PHI_ACCESS_DENIED = 7001,
  AUDIT_FAILURE = 7002
}

// Application error class
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly details?: Record<string, any>;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly id: string;

  constructor(
    message: string,
    code: ErrorCode,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.id = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Error handler configuration
interface ErrorHandlerConfig {
  logToConsole: boolean;
  logToAudit: boolean;
  logToMonitoring: boolean;
  showUserNotification: boolean;
  sanitizePII: boolean;
}

const defaultConfig: ErrorHandlerConfig = {
  logToConsole: process.env.NODE_ENV === 'development',
  logToAudit: true,
  logToMonitoring: true,
  showUserNotification: true,
  sanitizePII: true
};

// Main error handler class
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Handle an error with appropriate logging and user notification
   */
  async handleError(error: Error | AppError, context?: Record<string, any>): Promise<void> {
    const appError = this.normalizeError(error);
    
    // Add to error queue
    this.addToQueue(appError);

    // Log to console if enabled
    if (this.config.logToConsole) {
      console.error(`[${appError.severity.toUpperCase()}] ${appError.category}:`, appError);
    }

    // Log to monitoring system
    if (this.config.logToMonitoring) {
      await this.logToMonitoring(appError, context);
    }

    // Log to audit trail
    if (this.config.logToAudit && this.shouldAuditError(appError)) {
      await this.logToAudit(appError, context);
    }

    // Show user notification
    if (this.config.showUserNotification && appError.isOperational) {
      this.showUserNotification(appError);
    }

    // Throw non-operational errors
    if (!appError.isOperational) {
      throw appError;
    }
  }

  /**
   * Handle API errors with standardized response
   */
  handleApiError(error: any): AppError {
    // Handle different API error formats
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        return new AppError(
          'Authentication required',
          ErrorCode.UNAUTHENTICATED,
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.HIGH
        );
      }
      
      if (status === 403) {
        return new AppError(
          'Access denied',
          ErrorCode.UNAUTHORIZED,
          ErrorCategory.AUTHORIZATION,
          ErrorSeverity.HIGH
        );
      }
      
      if (status === 404) {
        return new AppError(
          'Resource not found',
          ErrorCode.DATA_NOT_FOUND,
          ErrorCategory.DATA_INTEGRITY,
          ErrorSeverity.LOW
        );
      }
      
      if (status >= 500) {
        return new AppError(
          'Server error occurred',
          ErrorCode.INTERNAL_ERROR,
          ErrorCategory.SYSTEM,
          ErrorSeverity.CRITICAL
        );
      }
      
      // Generic API error
      return new AppError(
        data?.message || 'An error occurred',
        ErrorCode.NETWORK_ERROR,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        { status, data }
      );
    }
    
    if (error.request) {
      // Request made but no response
      return new AppError(
        'Network connection failed',
        ErrorCode.CONNECTION_LOST,
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      );
    }
    
    // Something else happened
    return new AppError(
      error.message || 'Unknown error occurred',
      ErrorCode.INTERNAL_ERROR,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH
    );
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AppError): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.NETWORK_ERROR]: 'Network connection issue. Please check your connection and try again.',
      [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorCode.CONNECTION_LOST]: 'Connection lost. Please check your internet connection.',
      [ErrorCode.UNAUTHENTICATED]: 'Please log in to continue.',
      [ErrorCode.INVALID_CREDENTIALS]: 'Invalid username or password.',
      [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorCode.UNAUTHORIZED]: 'You do not have permission to perform this action.',
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation.',
      [ErrorCode.RESOURCE_ACCESS_DENIED]: 'Access to this resource is denied.',
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
      [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
      [ErrorCode.DATA_NOT_FOUND]: 'The requested data was not found.',
      [ErrorCode.DATA_INTEGRITY_ERROR]: 'Data integrity issue detected.',
      [ErrorCode.DUPLICATE_ENTRY]: 'This entry already exists.',
      [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCode.CONFIGURATION_ERROR]: 'System configuration error.',
      [ErrorCode.HIPAA_VIOLATION]: 'This action violates HIPAA compliance requirements.',
      [ErrorCode.PHI_ACCESS_DENIED]: 'Access to patient health information denied.',
      [ErrorCode.AUDIT_FAILURE]: 'Failed to log audit information.'
    };

    return messages[error.code] || error.message;
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Private methods
  private normalizeError(error: Error | AppError): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Try to determine error category from error properties
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return new AppError(
        error.message,
        ErrorCode.NETWORK_ERROR,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM
      );
    }
    
    if (message.includes('unauthorized') || message.includes('permission')) {
      return new AppError(
        error.message,
        ErrorCode.UNAUTHORIZED,
        ErrorCategory.AUTHORIZATION,
        ErrorSeverity.HIGH
      );
    }
    
    // Default to system error
    return new AppError(
      error.message,
      ErrorCode.INTERNAL_ERROR,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH,
      { originalError: error.stack }
    );
  }

  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Maintain queue size limit
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private async logToMonitoring(error: AppError, context?: Record<string, any>): Promise<void> {
    try {
      performanceMonitor.addMetric({
        id: error.id,
        name: `Error: ${error.category}`,
        value: 1,
        unit: 'count',
        category: 'error',
        threshold: { warning: 5, critical: 10 },
        metadata: {
          errorCode: error.code,
          errorMessage: this.config.sanitizePII ? this.sanitizeMessage(error.message) : error.message,
          severity: error.severity,
          timestamp: error.timestamp.toISOString(),
          ...context
        }
      });
    } catch (monitoringError) {
      console.error('Failed to log to monitoring:', monitoringError);
    }
  }

  private async logToAudit(error: AppError, context?: Record<string, any>): Promise<void> {
    try {
      await auditTrail.logEvent({
        userId: context?.userId || 'system',
        userRole: context?.userRole || 'system',
        eventType: this.mapErrorToAuditType(error),
        resourceType: context?.resourceType || 'system',
        resourceId: context?.resourceId || error.id,
        action: context?.action || 'error_occurred',
        outcome: 'failure',
        details: {
          errorCode: error.code,
          errorCategory: error.category,
          severity: error.severity,
          ...error.details
        }
      });
    } catch (auditError) {
      console.error('Failed to log to audit trail:', auditError);
    }
  }

  private showUserNotification(error: AppError): void {
    const userMessage = this.getUserMessage(error);
    
    toast({
      title: this.getErrorTitle(error),
      description: userMessage,
      variant: this.getSeverityVariant(error.severity),
      duration: error.severity === ErrorSeverity.CRITICAL ? 10000 : 5000
    });
  }

  private shouldAuditError(error: AppError): boolean {
    // Always audit high severity and HIPAA-related errors
    return error.severity === ErrorSeverity.HIGH ||
           error.severity === ErrorSeverity.CRITICAL ||
           error.category === ErrorCategory.HIPAA_COMPLIANCE ||
           error.category === ErrorCategory.AUTHORIZATION;
  }

  private mapErrorToAuditType(error: AppError): AuditEventType {
    switch (error.category) {
      case ErrorCategory.AUTHENTICATION:
        return AuditEventType.LOGIN_FAILURE;
      case ErrorCategory.AUTHORIZATION:
        return AuditEventType.UNAUTHORIZED_ACCESS;
      case ErrorCategory.HIPAA_COMPLIANCE:
        return AuditEventType.COMPLIANCE_VIOLATION;
      default:
        return AuditEventType.SYSTEM_ERROR;
    }
  }

  private sanitizeMessage(message: string): string {
    return message
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[ID]')
      .replace(/patient\s+\w+/gi, 'patient [NAME]');
  }

  private getErrorTitle(error: AppError): string {
    const titles: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Connection Error',
      [ErrorCategory.VALIDATION]: 'Validation Error',
      [ErrorCategory.AUTHENTICATION]: 'Authentication Required',
      [ErrorCategory.AUTHORIZATION]: 'Access Denied',
      [ErrorCategory.DATA_INTEGRITY]: 'Data Error',
      [ErrorCategory.SYSTEM]: 'System Error',
      [ErrorCategory.BUSINESS_LOGIC]: 'Operation Failed',
      [ErrorCategory.HIPAA_COMPLIANCE]: 'Compliance Error'
    };

    return titles[error.category] || 'Error';
  }

  private getSeverityVariant(severity: ErrorSeverity): 'default' | 'destructive' {
    return severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL
      ? 'destructive'
      : 'default';
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Convenience functions
export function handleError(error: Error | AppError, context?: Record<string, any>): Promise<void> {
  return errorHandler.handleError(error, context);
}

export function handleApiError(error: any): AppError {
  return errorHandler.handleApiError(error);
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError,
    handleApiError,
    AppError,
    ErrorCode,
    ErrorCategory,
    ErrorSeverity
  };
}