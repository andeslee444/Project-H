/**
 * Secure Session Management for Healthcare Applications
 * 
 * Implements secure session management with HIPAA compliance,
 * automatic timeout, and healthcare-specific security features.
 */

import { performanceMonitor } from '../performance/PerformanceMonitor';

export interface SessionData {
  userId: string;
  email: string;
  role: 'patient' | 'provider' | 'admin' | 'support';
  permissions: string[];
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId: string;
  refreshToken?: string;
  metadata?: Record<string, any>;
}

export interface SessionConfig {
  maxAge: number; // milliseconds
  idleTimeout: number; // milliseconds
  refreshThreshold: number; // milliseconds before expiry to refresh
  maxConcurrentSessions: number;
  requireSecureContext: boolean;
  enableActivityTracking: boolean;
  enableDeviceFingerprinting: boolean;
  cookieOptions: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    domain?: string;
    path: string;
  };
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
  idleTimeout: 30 * 60 * 1000, // 30 minutes
  refreshThreshold: 5 * 60 * 1000, // 5 minutes
  maxConcurrentSessions: 3,
  requireSecureContext: true,
  enableActivityTracking: true,
  enableDeviceFingerprinting: true,
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    path: '/'
  }
};

export interface SessionEvent {
  type: 'created' | 'renewed' | 'expired' | 'terminated' | 'activity' | 'warning';
  sessionId: string;
  userId?: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export type SessionEventHandler = (event: SessionEvent) => void;

/**
 * Secure session management system
 */
export class SessionManager {
  private config: SessionConfig;
  private currentSession: SessionData | null = null;
  private refreshTimer?: NodeJS.Timeout;
  private warningTimer?: NodeJS.Timeout;
  private activityTimer?: NodeJS.Timeout;
  private eventHandlers: Set<SessionEventHandler> = new Set();
  private isInitialized = false;
  private encryptionKey?: CryptoKey;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.initializeActivityTracking();
  }

  /**
   * Initialize the session manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check for secure context in production
      if (this.config.requireSecureContext && !this.isSecureContext()) {
        throw new Error('SessionManager requires a secure context (HTTPS)');
      }

      // Initialize encryption
      await this.initializeEncryption();

      // Restore existing session if available
      await this.restoreSession();

      this.isInitialized = true;
      console.log('🔐 Session manager initialized');
    } catch (error) {
      console.error('Failed to initialize session manager:', error);
      throw error;
    }
  }

  /**
   * Check if running in secure context
   */
  private isSecureContext(): boolean {
    if (typeof window === 'undefined') return true; // Server-side
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  /**
   * Initialize encryption for session data
   */
  private async initializeEncryption(): Promise<void> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      console.warn('Web Crypto API not available, session data will not be encrypted');
      return;
    }

    try {
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        false, // not extractable
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Failed to initialize session encryption:', error);
    }
  }

  /**
   * Create a new session
   */
  public async createSession(userData: {
    userId: string;
    email: string;
    role: SessionData['role'];
    permissions: string[];
    refreshToken?: string;
  }): Promise<SessionData> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Terminate existing session
    if (this.currentSession) {
      await this.terminateSession();
    }

    const now = new Date();
    const sessionId = await this.generateSessionId();

    const ipAddress = await this.getCurrentIPAddress();
    const userAgent = navigator?.userAgent;
    
    const session: SessionData = {
      ...userData,
      sessionId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.maxAge),
      lastActivity: now,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent })
    };

    // Store session
    this.currentSession = session;
    await this.storeSession(session);

    // Set up timers
    this.setupSessionTimers(session);

    // Track session creation
    this.emitEvent({
      type: 'created',
      sessionId: session.sessionId,
      userId: session.userId,
      timestamp: now,
      data: {
        role: session.role,
        permissions: session.permissions.length
      }
    });

    // Performance monitoring
    performanceMonitor.addMetric({
      id: `session-created-${Date.now()}`,
      name: 'Session Created',
      value: 1,
      unit: 'count',
      category: 'security',
      metadata: {
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId
      }
    });

    console.log(`🔐 Session created for user ${session.userId}`);
    return session;
  }

  /**
   * Generate secure session ID
   */
  private async generateSessionId(): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    // Fallback for environments without crypto.randomUUID
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Server-side fallback
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get current IP address (simplified)
   */
  private async getCurrentIPAddress(): Promise<string | undefined> {
    if (typeof window === 'undefined') return undefined;

    try {
      // In a real implementation, you might use a service or extract from headers
      return '127.0.0.1'; // Placeholder
    } catch (error) {
      console.warn('Failed to get IP address:', error);
      return undefined;
    }
  }

  /**
   * Store session data securely
   */
  private async storeSession(session: SessionData): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const sessionData = JSON.stringify({
        ...session,
        // Remove sensitive data from localStorage
        refreshToken: undefined
      });

      if (this.encryptionKey) {
        const encrypted = await this.encryptData(sessionData);
        localStorage.setItem('healthcare_session', encrypted);
      } else {
        localStorage.setItem('healthcare_session', sessionData);
      }

      // Store refresh token in secure httpOnly cookie (would be handled by backend)
      if (session.refreshToken) {
        this.setSecureCookie('refresh_token', session.refreshToken);
      }
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Restore session from storage
   */
  private async restoreSession(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const storedSession = localStorage.getItem('healthcare_session');
      if (!storedSession) return;

      let sessionData: string;
      if (this.encryptionKey) {
        sessionData = await this.decryptData(storedSession);
      } else {
        sessionData = storedSession;
      }

      const session = JSON.parse(sessionData) as SessionData;
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.expiresAt = new Date(session.expiresAt);
      session.lastActivity = new Date(session.lastActivity);

      // Check if session is still valid
      if (this.isSessionValid(session)) {
        this.currentSession = session;
        this.setupSessionTimers(session);
        
        console.log(`🔐 Session restored for user ${session.userId}`);
      } else {
        await this.clearStoredSession();
        console.log('🔐 Stored session was invalid and cleared');
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      await this.clearStoredSession();
    }
  }

  /**
   * Encrypt session data
   */
  private async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not available');

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt session data
   */
  private async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not available');

    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Set secure cookie
   */
  private setSecureCookie(name: string, value: string): void {
    if (typeof document === 'undefined') return;

    const { secure, sameSite, domain, path } = this.config.cookieOptions;
    let cookieString = `${name}=${value}; path=${path}; samesite=${sameSite}`;
    
    if (secure) cookieString += '; secure';
    if (domain) cookieString += `; domain=${domain}`;
    
    // Set expiration
    const expires = new Date(Date.now() + this.config.maxAge);
    cookieString += `; expires=${expires.toUTCString()}`;

    document.cookie = cookieString;
  }

  /**
   * Check if session is valid
   */
  private isSessionValid(session: SessionData): boolean {
    const now = new Date();
    
    // Check expiration
    if (now > session.expiresAt) {
      return false;
    }

    // Check idle timeout
    const idleTime = now.getTime() - session.lastActivity.getTime();
    if (idleTime > this.config.idleTimeout) {
      return false;
    }

    return true;
  }

  /**
   * Setup session timers
   */
  private setupSessionTimers(session: SessionData): void {
    this.clearTimers();

    // Refresh timer
    const timeToRefresh = session.expiresAt.getTime() - Date.now() - this.config.refreshThreshold;
    if (timeToRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshSession();
      }, timeToRefresh);
    }

    // Warning timer (5 minutes before expiry)
    const timeToWarning = session.expiresAt.getTime() - Date.now() - (5 * 60 * 1000);
    if (timeToWarning > 0) {
      this.warningTimer = setTimeout(() => {
        this.emitEvent({
          type: 'warning',
          sessionId: session.sessionId,
          userId: session.userId,
          timestamp: new Date(),
          data: { minutesRemaining: 5 }
        });
      }, timeToWarning);
    }

    // Idle timeout timer
    this.resetIdleTimer();
  }

  /**
   * Reset idle timer
   */
  private resetIdleTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.activityTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.config.idleTimeout);
  }

  /**
   * Handle idle timeout
   */
  private async handleIdleTimeout(): Promise<void> {
    if (this.currentSession) {
      // Store session info before termination
      const sessionId = this.currentSession.sessionId;
      const userId = this.currentSession.userId;
      
      await this.terminateSession();
      
      this.emitEvent({
        type: 'expired',
        sessionId,
        userId,
        timestamp: new Date(),
        data: { reason: 'idle_timeout' }
      });
    }
  }

  /**
   * Initialize activity tracking
   */
  private initializeActivityTracking(): void {
    if (!this.config.enableActivityTracking || typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      this.recordActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.recordActivity();
      }
    });
  }

  /**
   * Record user activity
   */
  public recordActivity(): void {
    if (!this.currentSession) return;

    const now = new Date();
    this.currentSession.lastActivity = now;
    
    // Update stored session
    this.storeSession(this.currentSession);
    
    // Reset idle timer
    this.resetIdleTimer();

    // Emit activity event
    this.emitEvent({
      type: 'activity',
      sessionId: this.currentSession.sessionId,
      userId: this.currentSession.userId,
      timestamp: now
    });
  }

  /**
   * Refresh session
   */
  public async refreshSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // In a real implementation, this would call the backend to refresh the token
      const refreshedSession = {
        ...this.currentSession,
        expiresAt: new Date(Date.now() + this.config.maxAge),
        lastActivity: new Date()
      };

      this.currentSession = refreshedSession;
      await this.storeSession(refreshedSession);
      this.setupSessionTimers(refreshedSession);

      this.emitEvent({
        type: 'renewed',
        sessionId: refreshedSession.sessionId,
        userId: refreshedSession.userId,
        timestamp: new Date()
      });

      console.log('🔐 Session refreshed');
    } catch (error) {
      console.error('Failed to refresh session:', error);
      await this.terminateSession();
    }
  }

  /**
   * Terminate session
   */
  public async terminateSession(): Promise<void> {
    if (!this.currentSession) return;

    const sessionId = this.currentSession.sessionId;
    const userId = this.currentSession.userId;

    // Clear timers
    this.clearTimers();

    // Clear stored data
    await this.clearStoredSession();

    // Emit termination event
    this.emitEvent({
      type: 'terminated',
      sessionId,
      userId,
      timestamp: new Date()
    });

    this.currentSession = null;
    console.log('🔐 Session terminated');
  }

  /**
   * Clear stored session data
   */
  private async clearStoredSession(): Promise<void> {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('healthcare_session');
    
    // Clear cookies
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.activityTimer) clearTimeout(this.activityTimer);
  }

  /**
   * Get current session
   */
  public getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentSession !== null && this.isSessionValid(this.currentSession);
  }

  /**
   * Check if user has specific permission
   */
  public hasPermission(permission: string): boolean {
    return this.currentSession?.permissions.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: SessionData['role']): boolean {
    return this.currentSession?.role === role;
  }

  /**
   * Get time until session expires
   */
  public getTimeToExpiry(): number | null {
    if (!this.currentSession) return null;
    return this.currentSession.expiresAt.getTime() - Date.now();
  }

  /**
   * Get session metadata
   */
  public getSessionMetadata(): Record<string, any> {
    if (!this.currentSession) return {};

    return {
      sessionId: this.currentSession.sessionId,
      userId: this.currentSession.userId,
      role: this.currentSession.role,
      createdAt: this.currentSession.createdAt,
      expiresAt: this.currentSession.expiresAt,
      lastActivity: this.currentSession.lastActivity,
      timeToExpiry: this.getTimeToExpiry(),
      isAuthenticated: this.isAuthenticated()
    };
  }

  /**
   * Add event handler
   */
  public addEventListener(handler: SessionEventHandler): void {
    this.eventHandlers.add(handler);
  }

  /**
   * Remove event handler
   */
  public removeEventListener(handler: SessionEventHandler): void {
    this.eventHandlers.delete(handler);
  }

  /**
   * Emit session event
   */
  private emitEvent(event: SessionEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Session event handler error:', error);
      }
    });
  }

  /**
   * Generate device fingerprint (simplified)
   */
  private generateDeviceFingerprint(): string {
    if (!this.config.enableDeviceFingerprinting || typeof window === 'undefined') {
      return 'unknown';
    }

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform
    ];

    return btoa(components.join('|'));
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.clearTimers();
    this.eventHandlers.clear();
    this.currentSession = null;
    this.isInitialized = false;
    console.log('🔐 Session manager cleaned up');
  }
}

// Global session manager instance
export const sessionManager = new SessionManager();