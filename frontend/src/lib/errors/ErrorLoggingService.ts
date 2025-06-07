import { AppError, isAppError, ErrorFactory } from './AppError'

/**
 * Error log entry structure
 */
export interface ErrorLogEntry {
  id: string
  timestamp: Date
  error: AppError
  level: 'error' | 'warn' | 'info'
  context: {
    userId?: string
    sessionId?: string
    userAgent?: string
    url?: string
    referrer?: string
    viewportSize?: string
    connectionType?: string
    browserMemory?: number
    timestamp?: string
    buildVersion?: string
    environment?: string
  }
  stack?: string
  breadcrumbs: ErrorBreadcrumb[]
  metadata: Record<string, any>
}

/**
 * Breadcrumb for tracing user actions leading to error
 */
export interface ErrorBreadcrumb {
  timestamp: Date
  type: 'navigation' | 'user_action' | 'api_call' | 'state_change' | 'ui_event'
  category?: string
  message: string
  data?: Record<string, any>
  level: 'info' | 'warn' | 'error'
}

/**
 * Error reporting configuration
 */
export interface ErrorReportingConfig {
  maxBreadcrumbs: number
  maxLogEntries: number
  enableLocalStorage: boolean
  enableRemoteLogging: boolean
  remoteEndpoint?: string
  apiKey?: string
  enableUserFeedback: boolean
  ignoredErrors: Array<string | RegExp>
  samplingRate: number
  environment: 'development' | 'staging' | 'production'
  buildVersion?: string
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ErrorReportingConfig = {
  maxBreadcrumbs: 50,
  maxLogEntries: 100,
  enableLocalStorage: true,
  enableRemoteLogging: false,
  enableUserFeedback: true,
  ignoredErrors: [
    /ResizeObserver loop limit exceeded/,
    /Script error/,
    /Non-Error promise rejection captured/
  ],
  samplingRate: 1.0,
  environment: 'development'
}

/**
 * Enhanced error logging service
 */
export class ErrorLoggingService {
  private config: ErrorReportingConfig
  private breadcrumbs: ErrorBreadcrumb[] = []
  private logEntries: ErrorLogEntry[] = []
  private sessionId: string
  private isInitialized = false

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  /**
   * Initialize the service
   */
  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    this.isInitialized = true

    // Load persisted data
    if (this.config.enableLocalStorage) {
      this.loadPersistedData()
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers()

    // Set up performance monitoring
    this.setupPerformanceMonitoring()

    // Clean up old data
    this.cleanupOldData()
  }

  /**
   * Log an error
   */
  public logError(
    error: Error | AppError | string,
    level: 'error' | 'warn' | 'info' = 'error',
    additionalContext: Record<string, any> = {}
  ): string {
    // Convert to AppError if needed
    const appError = this.normalizeError(error)

    // Check if error should be ignored
    if (this.shouldIgnoreError(appError)) {
      return ''
    }

    // Apply sampling
    if (Math.random() > this.config.samplingRate) {
      return ''
    }

    // Create log entry
    const logEntry = this.createLogEntry(appError, level, additionalContext)

    // Store log entry
    this.storeLogEntry(logEntry)

    // Report to remote service if configured
    if (this.config.enableRemoteLogging) {
      this.reportToRemoteService(logEntry)
    }

    // Persist to local storage if configured
    if (this.config.enableLocalStorage) {
      this.persistLogEntry(logEntry)
    }

    return logEntry.id
  }

  /**
   * Add breadcrumb for error context
   */
  public addBreadcrumb(
    type: ErrorBreadcrumb['type'],
    message: string,
    data?: Record<string, any>,
    level: ErrorBreadcrumb['level'] = 'info',
    category?: string
  ) {
    const breadcrumb: ErrorBreadcrumb = {
      timestamp: new Date(),
      type,
      category,
      message,
      data,
      level
    }

    this.breadcrumbs.push(breadcrumb)

    // Maintain max breadcrumbs limit
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs)
    }
  }

  /**
   * Get recent log entries
   */
  public getLogEntries(limit: number = 50): ErrorLogEntry[] {
    return this.logEntries.slice(-limit)
  }

  /**
   * Get recent breadcrumbs
   */
  public getBreadcrumbs(limit: number = 20): ErrorBreadcrumb[] {
    return this.breadcrumbs.slice(-limit)
  }

  /**
   * Clear all logs
   */
  public clearLogs() {
    this.logEntries = []
    this.breadcrumbs = []
    
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('error_logs')
      localStorage.removeItem('error_breadcrumbs')
    }
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      config: this.config,
      logEntries: this.logEntries,
      breadcrumbs: this.breadcrumbs,
      systemInfo: this.getSystemInfo()
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Normalize error to AppError
   */
  private normalizeError(error: Error | AppError | string): AppError {
    if (typeof error === 'string') {
      return ErrorFactory.fromError(new Error(error))
    }
    
    if (isAppError(error)) {
      return error
    }
    
    return ErrorFactory.fromError(error)
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(error: AppError): boolean {
    const message = error.message
    
    return this.config.ignoredErrors.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(message)
      }
      return message.includes(pattern)
    })
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    error: AppError,
    level: 'error' | 'warn' | 'info',
    additionalContext: Record<string, any>
  ): ErrorLogEntry {
    const id = this.generateLogId()
    const timestamp = new Date()

    return {
      id,
      timestamp,
      error,
      level,
      context: {
        userId: this.getUserId(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        connectionType: this.getConnectionType(),
        browserMemory: this.getBrowserMemory(),
        timestamp: timestamp.toISOString(),
        buildVersion: this.config.buildVersion,
        environment: this.config.environment,
        ...additionalContext
      },
      stack: error.stack,
      breadcrumbs: [...this.breadcrumbs],
      metadata: {
        errorCode: error.code,
        statusCode: error.statusCode,
        userMessage: error.getUserMessage(),
        logDetails: error.getLogDetails()
      }
    }
  }

  /**
   * Store log entry in memory
   */
  private storeLogEntry(logEntry: ErrorLogEntry) {
    this.logEntries.push(logEntry)

    // Maintain max entries limit
    if (this.logEntries.length > this.config.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxLogEntries)
    }
  }

  /**
   * Report to remote logging service
   */
  private async reportToRemoteService(logEntry: ErrorLogEntry) {
    if (!this.config.remoteEndpoint) {
      return
    }

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(logEntry)
      })

      if (!response.ok) {
        console.warn('Failed to report error to remote service:', response.statusText)
      }
    } catch (error) {
      console.warn('Error reporting to remote service:', error)
    }
  }

  /**
   * Persist log entry to local storage
   */
  private persistLogEntry(logEntry: ErrorLogEntry) {
    try {
      const existingLogs = this.getPersistedLogs()
      const updatedLogs = [...existingLogs, logEntry].slice(-this.config.maxLogEntries)
      
      localStorage.setItem('error_logs', JSON.stringify(updatedLogs))
      localStorage.setItem('error_breadcrumbs', JSON.stringify(this.breadcrumbs))
    } catch (error) {
      console.warn('Failed to persist error log:', error)
    }
  }

  /**
   * Load persisted data from local storage
   */
  private loadPersistedData() {
    try {
      const logs = this.getPersistedLogs()
      const breadcrumbs = this.getPersistedBreadcrumbs()
      
      this.logEntries = logs
      this.breadcrumbs = breadcrumbs
    } catch (error) {
      console.warn('Failed to load persisted error data:', error)
    }
  }

  /**
   * Get persisted logs from local storage
   */
  private getPersistedLogs(): ErrorLogEntry[] {
    try {
      const logs = localStorage.getItem('error_logs')
      return logs ? JSON.parse(logs) : []
    } catch {
      return []
    }
  }

  /**
   * Get persisted breadcrumbs from local storage
   */
  private getPersistedBreadcrumbs(): ErrorBreadcrumb[] {
    try {
      const breadcrumbs = localStorage.getItem('error_breadcrumbs')
      return breadcrumbs ? JSON.parse(breadcrumbs) : []
    } catch {
      return []
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'error',
        { type: 'unhandled_promise_rejection', reason: event.reason }
      )
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(
        event.error || new Error(event.message),
        'error',
        {
          type: 'javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    })
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Long task threshold
              this.addBreadcrumb(
                'ui_event',
                `Long task detected: ${entry.duration.toFixed(2)}ms`,
                { duration: entry.duration, startTime: entry.startTime },
                'warn',
                'performance'
              )
            }
          }
        })
        
        observer.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        // PerformanceObserver not supported or failed
      }
    }
  }

  /**
   * Clean up old data
   */
  private cleanupOldData() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    this.logEntries = this.logEntries.filter(entry => entry.timestamp > oneWeekAgo)
    this.breadcrumbs = this.breadcrumbs.filter(breadcrumb => breadcrumb.timestamp > oneWeekAgo)
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get user ID from context
   */
  private getUserId(): string | undefined {
    // This should be implemented based on your auth system
    return undefined
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string | undefined {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType
  }

  /**
   * Get browser memory info
   */
  private getBrowserMemory(): number | undefined {
    const memory = (performance as any).memory
    return memory?.usedJSHeapSize
  }

  /**
   * Get system information
   */
  private getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memory: this.getBrowserMemory(),
      connection: this.getConnectionType()
    }
  }
}

/**
 * Global error logging service instance
 */
let errorLogger: ErrorLoggingService | null = null

/**
 * Initialize error logging service
 */
export function initializeErrorLogging(config: Partial<ErrorReportingConfig> = {}): ErrorLoggingService {
  if (!errorLogger) {
    errorLogger = new ErrorLoggingService(config)
  }
  return errorLogger
}

/**
 * Get error logging service instance
 */
export function getErrorLogger(): ErrorLoggingService {
  if (!errorLogger) {
    throw new Error('Error logging service not initialized. Call initializeErrorLogging() first.')
  }
  return errorLogger
}

/**
 * Convenience functions for logging
 */
export function logError(error: Error | AppError | string, context?: Record<string, any>): string {
  return getErrorLogger().logError(error, 'error', context)
}

export function logWarning(error: Error | AppError | string, context?: Record<string, any>): string {
  return getErrorLogger().logError(error, 'warn', context)
}

export function logInfo(message: string, context?: Record<string, any>): string {
  return getErrorLogger().logError(message, 'info', context)
}

export function addBreadcrumb(
  type: ErrorBreadcrumb['type'],
  message: string,
  data?: Record<string, any>
) {
  getErrorLogger().addBreadcrumb(type, message, data)
}