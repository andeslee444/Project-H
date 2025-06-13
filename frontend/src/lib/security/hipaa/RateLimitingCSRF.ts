/**
 * HIPAA Rate Limiting and CSRF Protection
 * 
 * Implements client-side rate limiting and CSRF protection mechanisms
 * to prevent abuse and ensure secure API communications for healthcare data.
 * 
 * Features:
 * - Token bucket rate limiting
 * - CSRF token management
 * - Request throttling
 * - Suspicious activity detection
 * - Automatic backoff strategies
 */

import { auditTrail } from './AuditTrail';
import { AuditEventType } from './HIPAACompliance';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (request: any) => string;
  onLimitReached?: (key: string) => void;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  backoffMultiplier: number;
  maxBackoffMs: number;
}

// CSRF configuration
export interface CSRFConfig {
  tokenHeader: string;
  tokenLength: number;
  renewalInterval: number; // Token renewal interval in milliseconds
  secureCookie: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  httpOnly: boolean;
  autoRenew: boolean;
}

// Rate limit bucket
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per second
}

// Request metadata
interface RequestMetadata {
  timestamp: number;
  endpoint: string;
  method: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

// Suspicious activity patterns
interface SuspiciousPattern {
  name: string;
  description: string;
  detector: (requests: RequestMetadata[]) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'throttle' | 'block';
}

// Default configurations for healthcare applications
export const DEFAULT_HEALTHCARE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // Conservative limit for healthcare APIs
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  backoffStrategy: 'exponential',
  backoffMultiplier: 2,
  maxBackoffMs: 300000 // 5 minutes max backoff
};

export const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  tokenHeader: 'X-CSRF-Token',
  tokenLength: 32,
  renewalInterval: 1800000, // 30 minutes
  secureCookie: true,
  sameSite: 'strict',
  httpOnly: false, // Must be false for JavaScript access
  autoRenew: true
};

/**
 * Rate Limiting Service
 */
export class RateLimitingService {
  private config: RateLimitConfig;
  private buckets: Map<string, RateLimitBucket> = new Map();
  private requestHistory: Map<string, RequestMetadata[]> = new Map();
  private suspiciousPatterns: SuspiciousPattern[];
  private blockedKeys: Set<string> = new Set();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_HEALTHCARE_RATE_LIMIT_CONFIG, ...config };
    this.suspiciousPatterns = this.initializeSuspiciousPatterns();
    this.startCleanupInterval();
  }

  /**
   * Check if request is allowed under rate limits
   */
  async checkRateLimit(
    key: string,
    endpoint: string,
    method: string = 'GET',
    userId?: string
  ): Promise<{
    allowed: boolean;
    remainingTokens: number;
    resetTime: number;
    retryAfter?: number;
    reason?: string;
  }> {
    // Check if key is blocked due to suspicious activity
    if (this.blockedKeys.has(key)) {
      await this.logSecurityEvent(key, endpoint, method, userId, 'blocked_request');
      return {
        allowed: false,
        remainingTokens: 0,
        resetTime: Date.now() + this.config.maxBackoffMs,
        retryAfter: this.config.maxBackoffMs,
        reason: 'IP blocked due to suspicious activity'
      };
    }

    const bucket = this.getBucket(key);
    const now = Date.now();

    // Refill bucket based on elapsed time
    this.refillBucket(bucket, now);

    if (bucket.tokens >= 1) {
      // Allow request and consume token
      bucket.tokens -= 1;
      
      // Record successful request
      this.recordRequest(key, {
        timestamp: now,
        endpoint,
        method,
        userId: userId || 'anonymous',
        success: true
      });

      return {
        allowed: true,
        remainingTokens: Math.floor(bucket.tokens),
        resetTime: this.calculateResetTime(bucket)
      };
    } else {
      // Request denied - no tokens available
      const retryAfter = this.calculateRetryAfter(bucket);
      
      // Record failed request
      this.recordRequest(key, {
        timestamp: now,
        endpoint,
        method,
        userId: userId || 'anonymous',
        success: false
      });

      await this.logSecurityEvent(key, endpoint, method, userId, 'rate_limit_exceeded');

      // Check for suspicious patterns
      await this.checkSuspiciousActivity(key);

      if (this.config.onLimitReached) {
        this.config.onLimitReached(key);
      }

      return {
        allowed: false,
        remainingTokens: 0,
        resetTime: this.calculateResetTime(bucket),
        retryAfter,
        reason: 'Rate limit exceeded'
      };
    }
  }

  /**
   * Get current rate limit status without consuming tokens
   */
  getRateLimitStatus(key: string): {
    remainingTokens: number;
    resetTime: number;
    isBlocked: boolean;
  } {
    if (this.blockedKeys.has(key)) {
      return {
        remainingTokens: 0,
        resetTime: Date.now() + this.config.maxBackoffMs,
        isBlocked: true
      };
    }

    const bucket = this.getBucket(key);
    this.refillBucket(bucket, Date.now());

    return {
      remainingTokens: Math.floor(bucket.tokens),
      resetTime: this.calculateResetTime(bucket),
      isBlocked: false
    };
  }

  /**
   * Reset rate limits for a key (admin function)
   */
  resetRateLimit(key: string): void {
    this.buckets.delete(key);
    this.requestHistory.delete(key);
    this.blockedKeys.delete(key);
  }

  /**
   * Block a key temporarily
   */
  blockKey(key: string, durationMs: number = this.config.maxBackoffMs): void {
    this.blockedKeys.add(key);
    
    setTimeout(() => {
      this.blockedKeys.delete(key);
    }, durationMs);
  }

  /**
   * Get request statistics for monitoring
   */
  getStatistics(): {
    totalBuckets: number;
    blockedKeys: number;
    requestCounts: Record<string, number>;
    suspiciousActivityDetected: number;
  } {
    const requestCounts: Record<string, number> = {};
    let suspiciousCount = 0;

    for (const [key, requests] of this.requestHistory) {
      requestCounts[key] = requests.length;
      
      // Check if this key has suspicious activity
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.detector(requests)) {
          suspiciousCount++;
          break;
        }
      }
    }

    return {
      totalBuckets: this.buckets.size,
      blockedKeys: this.blockedKeys.size,
      requestCounts,
      suspiciousActivityDetected: suspiciousCount
    };
  }

  // Private helper methods
  private getBucket(key: string): RateLimitBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
        capacity: this.config.maxRequests,
        refillRate: this.config.maxRequests / (this.config.windowMs / 1000)
      });
    }
    return this.buckets.get(key)!;
  }

  private refillBucket(bucket: RateLimitBucket, now: number): void {
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * bucket.refillRate;
    
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  private calculateResetTime(bucket: RateLimitBucket): number {
    const timeToRefill = (bucket.capacity - bucket.tokens) / bucket.refillRate * 1000;
    return bucket.lastRefill + timeToRefill;
  }

  private calculateRetryAfter(bucket: RateLimitBucket): number {
    const timeToNextToken = (1 / bucket.refillRate) * 1000;
    return Math.ceil(timeToNextToken);
  }

  private recordRequest(key: string, metadata: RequestMetadata): void {
    if (!this.requestHistory.has(key)) {
      this.requestHistory.set(key, []);
    }

    const requests = this.requestHistory.get(key)!;
    requests.push(metadata);

    // Keep only recent requests (last hour)
    const oneHourAgo = Date.now() - 3600000;
    this.requestHistory.set(
      key,
      requests.filter(req => req.timestamp > oneHourAgo)
    );
  }

  private async checkSuspiciousActivity(key: string): Promise<void> {
    const requests = this.requestHistory.get(key) || [];

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.detector(requests)) {
        await this.logSecurityEvent(
          key,
          'suspicious_activity',
          'DETECTION',
          undefined,
          pattern.name,
          {
            pattern: pattern.name,
            description: pattern.description,
            severity: pattern.severity,
            requestCount: requests.length
          }
        );

        // Take action based on pattern severity
        switch (pattern.action) {
          case 'block':
            this.blockKey(key, this.config.maxBackoffMs);
            break;
          case 'throttle':
            // Reduce token capacity for this key
            const bucket = this.getBucket(key);
            bucket.capacity = Math.max(1, bucket.capacity * 0.5);
            bucket.refillRate = bucket.refillRate * 0.5;
            break;
          case 'log':
            // Already logged above
            break;
        }
      }
    }
  }

  private initializeSuspiciousPatterns(): SuspiciousPattern[] {
    return [
      {
        name: 'rapid_fire_requests',
        description: 'Too many requests in short time period',
        detector: (requests) => {
          const lastMinute = Date.now() - 60000;
          const recentRequests = requests.filter(r => r.timestamp > lastMinute);
          return recentRequests.length > 50;
        },
        severity: 'high',
        action: 'throttle'
      },
      {
        name: 'failed_authentication_attempts',
        description: 'Multiple failed authentication attempts',
        detector: (requests) => {
          const lastFiveMinutes = Date.now() - 300000;
          const failedAuth = requests.filter(r => 
            r.timestamp > lastFiveMinutes && 
            !r.success && 
            (r.endpoint.includes('/auth') || r.endpoint.includes('/login'))
          );
          return failedAuth.length > 5;
        },
        severity: 'critical',
        action: 'block'
      },
      {
        name: 'endpoint_scanning',
        description: 'Scanning multiple different endpoints',
        detector: (requests) => {
          const lastTenMinutes = Date.now() - 600000;
          const recentRequests = requests.filter(r => r.timestamp > lastTenMinutes);
          const uniqueEndpoints = new Set(recentRequests.map(r => r.endpoint));
          return uniqueEndpoints.size > 20;
        },
        severity: 'medium',
        action: 'throttle'
      },
      {
        name: 'phi_data_scraping',
        description: 'Potential PHI data scraping attempt',
        detector: (requests) => {
          const lastHour = Date.now() - 3600000;
          const phiRequests = requests.filter(r => 
            r.timestamp > lastHour && 
            (r.endpoint.includes('/patient') || r.endpoint.includes('/medical'))
          );
          return phiRequests.length > 100;
        },
        severity: 'critical',
        action: 'block'
      }
    ];
  }

  private async logSecurityEvent(
    key: string,
    endpoint: string,
    method: string,
    userId?: string,
    eventType: string = 'rate_limit_violation',
    details?: any
  ): Promise<void> {
    try {
      await auditTrail.logEvent({
        userId: userId || 'anonymous',
        userRole: 'unknown',
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        resourceType: 'rate_limiter',
        resourceId: key,
        action: `${method} ${endpoint}`,
        outcome: 'failure',
        details: {
          eventType,
          rateLimitKey: key,
          ...details
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private startCleanupInterval(): void {
    // Clean up old data every 10 minutes
    setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      
      // Clean up request history
      for (const [key, requests] of this.requestHistory) {
        const recentRequests = requests.filter(req => req.timestamp > oneHourAgo);
        if (recentRequests.length === 0) {
          this.requestHistory.delete(key);
        } else {
          this.requestHistory.set(key, recentRequests);
        }
      }

      // Clean up unused buckets
      for (const [key] of this.buckets) {
        if (!this.requestHistory.has(key)) {
          this.buckets.delete(key);
        }
      }
    }, 600000); // 10 minutes
  }
}

/**
 * CSRF Protection Service
 */
export class CSRFProtectionService {
  private config: CSRFConfig;
  private currentToken: string | null = null;
  private tokenExpiry: number = 0;
  private renewalTimer: number | null = null;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...DEFAULT_CSRF_CONFIG, ...config };
    this.initialize();
  }

  /**
   * Get current CSRF token
   */
  async getToken(): Promise<string> {
    if (!this.currentToken || this.isTokenExpired()) {
      await this.renewToken();
    }
    return this.currentToken!;
  }

  /**
   * Validate CSRF token
   */
  validateToken(token: string): boolean {
    return token === this.currentToken && !this.isTokenExpired();
  }

  /**
   * Add CSRF token to request headers
   */
  async addTokenToRequest(headers: Record<string, string> = {}): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      ...headers,
      [this.config.tokenHeader]: token
    };
  }

  /**
   * Create CSRF-protected fetch function
   */
  createProtectedFetch(): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const protectedInit = await this.addCSRFProtection(init || {});
      return fetch(input, protectedInit);
    };
  }

  /**
   * Add CSRF protection to request init
   */
  async addCSRFProtection(init: RequestInit): Promise<RequestInit> {
    // Only add CSRF token to state-changing requests
    const method = init.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const headers = await this.addTokenToRequest(init.headers as Record<string, string>);
      return {
        ...init,
        headers
      };
    }
    return init;
  }

  /**
   * Generate new CSRF token
   */
  private async generateToken(): Promise<string> {
    const array = new Uint8Array(this.config.tokenLength);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Renew CSRF token
   */
  private async renewToken(): Promise<void> {
    try {
      this.currentToken = await this.generateToken();
      this.tokenExpiry = Date.now() + this.config.renewalInterval;

      // Store token in secure cookie if configured
      if (typeof document !== 'undefined') {
        this.storeTokenInCookie();
      }

      // Schedule next renewal
      if (this.config.autoRenew) {
        this.scheduleRenewal();
      }

      // Log token renewal for audit
      await this.logTokenEvent('token_renewed');
    } catch (error) {
      console.error('Failed to renew CSRF token:', error);
      throw new Error('CSRF token renewal failed');
    }
  }

  /**
   * Check if current token is expired
   */
  private isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiry;
  }

  /**
   * Store token in secure cookie
   */
  private storeTokenInCookie(): void {
    if (typeof document === 'undefined') return;

    const cookieOptions = [
      `${this.config.tokenHeader}=${this.currentToken}`,
      `Max-Age=${this.config.renewalInterval / 1000}`,
      `SameSite=${this.config.sameSite}`,
      'Path=/'
    ];

    if (this.config.secureCookie) {
      cookieOptions.push('Secure');
    }

    if (this.config.httpOnly) {
      cookieOptions.push('HttpOnly');
    }

    document.cookie = cookieOptions.join('; ');
  }

  /**
   * Load token from cookie
   */
  private loadTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.config.tokenHeader) {
        return value || null;
      }
    }
    return null;
  }

  /**
   * Schedule automatic token renewal
   */
  private scheduleRenewal(): void {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
    }

    // Renew token 5 minutes before expiry
    const renewalTime = this.config.renewalInterval - 300000;
    this.renewalTimer = window.setTimeout(() => {
      this.renewToken();
    }, renewalTime);
  }

  /**
   * Initialize CSRF protection
   */
  private async initialize(): Promise<void> {
    // Try to load existing token from cookie
    const existingToken = this.loadTokenFromCookie();
    if (existingToken) {
      this.currentToken = existingToken;
      this.tokenExpiry = Date.now() + this.config.renewalInterval;
    }

    // Generate new token if none exists or if expired
    if (!this.currentToken || this.isTokenExpired()) {
      await this.renewToken();
    } else if (this.config.autoRenew) {
      this.scheduleRenewal();
    }
  }

  /**
   * Log CSRF-related events for audit
   */
  private async logTokenEvent(eventType: string): Promise<void> {
    try {
      await auditTrail.logEvent({
        userId: 'system',
        userRole: 'system',
        eventType: AuditEventType.SYSTEM_ERROR,
        resourceType: 'csrf_protection',
        action: eventType,
        outcome: 'success',
        details: {
          tokenHeader: this.config.tokenHeader,
          renewalInterval: this.config.renewalInterval
        }
      });
    } catch (error) {
      console.error('Failed to log CSRF event:', error);
    }
  }
}

/**
 * Combined Rate Limiting and CSRF Protection Middleware
 */
export class SecurityMiddleware {
  private rateLimiter: RateLimitingService;
  private csrfProtection: CSRFProtectionService;

  constructor(
    rateLimitConfig?: Partial<RateLimitConfig>,
    csrfConfig?: Partial<CSRFConfig>
  ) {
    this.rateLimiter = new RateLimitingService(rateLimitConfig);
    this.csrfProtection = new CSRFProtectionService(csrfConfig);
  }

  /**
   * Create a secure fetch function with all protections
   */
  createSecureFetch(keyGenerator?: (url: string, init?: RequestInit) => string): typeof fetch {
    // Store the original fetch function
    const originalFetch = window.fetch.bind(window);
    
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      
      // IMPORTANT: Bypass security for Supabase URLs to prevent blocking database queries
      if (url.includes('supabase.co') || url.includes('supabase.io')) {
        console.log('🔓 Bypassing security for Supabase URL:', url);
        return originalFetch(input, init);
      }
      
      // Generate rate limiting key
      const rateLimitKey = keyGenerator 
        ? keyGenerator(url, init)
        : this.generateDefaultKey(url);

      // Check rate limits
      const rateLimitResult = await this.rateLimiter.checkRateLimit(
        rateLimitKey,
        url,
        method
      );

      if (!rateLimitResult.allowed) {
        const error = new Error(rateLimitResult.reason || 'Rate limit exceeded');
        (error as any).retryAfter = rateLimitResult.retryAfter;
        (error as any).resetTime = rateLimitResult.resetTime;
        throw error;
      }

      // Add CSRF protection
      const protectedInit = await this.csrfProtection.addCSRFProtection(init || {});

      // Add rate limiting headers to response tracking
      const response = await originalFetch(input, protectedInit);
      
      // Record the response for rate limiting analysis
      await this.rateLimiter.checkRateLimit(
        rateLimitKey,
        url,
        method,
        undefined // Could extract userId from headers/context
      );

      return response;
    };
  }

  /**
   * Get security status
   */
  getSecurityStatus(): {
    rateLimiting: any;
    csrf: {
      tokenConfigured: boolean;
      autoRenewalEnabled: boolean;
    };
  } {
    return {
      rateLimiting: this.rateLimiter.getStatistics(),
      csrf: {
        tokenConfigured: true,
        autoRenewalEnabled: this.csrfProtection['config'].autoRenew
      }
    };
  }

  /**
   * Reset security state (admin function)
   */
  resetSecurity(): void {
    // Reset all rate limits
    const stats = this.rateLimiter.getStatistics();
    Object.keys(stats.requestCounts).forEach(key => {
      this.rateLimiter.resetRateLimit(key);
    });
  }

  private generateDefaultKey(url: string): string {
    // Generate key based on IP address (would need to be implemented based on your setup)
    // For now, use a simple session-based key
    return sessionStorage.getItem('security-key') || 'default-key';
  }
}

// Export instances and utilities
export const rateLimiter = new RateLimitingService();
export const csrfProtection = new CSRFProtectionService();
export const securityMiddleware = new SecurityMiddleware();

// Configure global secure fetch
export const secureFetch = securityMiddleware.createSecureFetch();

// Utility to apply security to existing fetch
export function enableGlobalSecurity(): void {
  window.fetch = secureFetch;
}