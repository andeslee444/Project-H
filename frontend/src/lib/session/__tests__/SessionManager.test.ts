/**
 * Session Manager Tests
 * 
 * Comprehensive tests for the secure session management system
 */

import { describe, it, expect, beforeEach, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { SessionManager, DEFAULT_SESSION_CONFIG } from '../SessionManager';

// Mock browser APIs
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

let uuidCounter = 0;
const mockCrypto = {
  randomUUID: vi.fn(() => `mock-uuid-${++uuidCounter}`),
  getRandomValues: vi.fn((array: any) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    generateKey: vi.fn(() => Promise.resolve('mock-key')),
    encrypt: vi.fn((algorithm: any, key: any, data: ArrayBuffer) => Promise.resolve(data)),
    decrypt: vi.fn((algorithm: any, key: any, data: ArrayBuffer) => Promise.resolve(data))
  }
};

const mockDocument = {
  cookie: '',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  hidden: false,
  visibilityState: 'visible' as DocumentVisibilityState
};

const mockWindow = {
  isSecureContext: true,
  location: { protocol: 'https:' },
  crypto: mockCrypto,
  navigator: {
    userAgent: 'test-user-agent',
    language: 'en-US',
    platform: 'test-platform'
  },
  screen: {
    width: 1920,
    height: 1080
  }
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  configurable: true
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  configurable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockWindow.navigator,
  configurable: true
});

Object.defineProperty(global, 'screen', {
  value: mockWindow.screen,
  configurable: true
});

Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  },
  writable: true,
  configurable: true
});

// Mock btoa/atob for encryption
global.btoa = vi.fn((str: string) => Buffer.from(str, 'binary').toString('base64'));
global.atob = vi.fn((str: string) => Buffer.from(str, 'base64').toString('binary'));

// Mock performance monitor
vi.mock('../performance/PerformanceMonitor', () => ({
  performanceMonitor: {
    trackTiming: vi.fn(),
    addMetric: vi.fn()
  }
}));

describe('SessionManager', () => {
  let sessionManager: SessionManager | null = null;

  beforeAll(() => {
    // Setup fake timers once before all tests
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing timers
    vi.clearAllTimers();
    // Reset UUID counter
    uuidCounter = 0;
    sessionManager = new SessionManager();
  });

  afterEach(() => {
    if (sessionManager) {
      sessionManager.cleanup();
      sessionManager = null;
    }
    vi.runOnlyPendingTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(sessionManager).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        maxAge: 4 * 60 * 60 * 1000, // 4 hours
        idleTimeout: 15 * 60 * 1000, // 15 minutes
        enableActivityTracking: false
      };

      const customManager = new SessionManager(customConfig);
      expect(customManager).toBeDefined();
      customManager.cleanup();
    });

    it('should throw error in non-secure context when required', async () => {
      // Save original values
      const originalSecureContext = window.isSecureContext;
      const originalProtocol = window.location.protocol;
      
      // Set insecure context
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true,
        configurable: true
      });
      Object.defineProperty(window.location, 'protocol', {
        value: 'http:',
        writable: true,
        configurable: true
      });

      const secureManager = new SessionManager({ requireSecureContext: true });
      
      await expect(secureManager.initialize()).rejects.toThrow('secure context');
      
      secureManager.cleanup();
      
      // Restore original values
      Object.defineProperty(window, 'isSecureContext', {
        value: originalSecureContext,
        writable: true,
        configurable: true
      });
      Object.defineProperty(window.location, 'protocol', {
        value: originalProtocol,
        writable: true,
        configurable: true
      });
    });

    it('should initialize encryption successfully', async () => {
      await sessionManager.initialize();
      expect(mockCrypto.subtle.generateKey).toHaveBeenCalled();
    });

    it('should restore existing session on initialization', async () => {
      const mockSessionData = {
        userId: 'test-user',
        email: 'test@example.com',
        role: 'patient',
        permissions: ['read:own_data'],
        sessionId: 'test-session',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        lastActivity: new Date().toISOString()
      };

      // Mock the encrypted data format (IV + encrypted data)
      const mockIv = new Uint8Array(12);
      const mockEncrypted = new TextEncoder().encode(JSON.stringify(mockSessionData));
      const combined = new Uint8Array(mockIv.length + mockEncrypted.length);
      combined.set(mockIv);
      combined.set(mockEncrypted, mockIv.length);
      
      const encodedData = btoa(String.fromCharCode(...combined));
      mockLocalStorage.getItem.mockReturnValue(encodedData);
      
      // Mock decrypt to return the JSON string
      mockCrypto.subtle.decrypt.mockImplementationOnce(() => 
        Promise.resolve(new TextEncoder().encode(JSON.stringify(mockSessionData)).buffer)
      );

      await sessionManager.initialize();

      const session = sessionManager.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.userId).toBe('test-user');
    });
  });

  describe('Session Creation', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should create a new session', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data', 'write:own_data']
      };

      const session = await sessionManager.createSession(userData);

      expect(session).toBeDefined();
      expect(session.userId).toBe(userData.userId);
      expect(session.email).toBe(userData.email);
      expect(session.role).toBe(userData.role);
      expect(session.permissions).toEqual(userData.permissions);
      expect(session.sessionId).toBeDefined();
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    it('should store session data', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'provider' as const,
        permissions: ['read:patient_data']
      };

      await sessionManager.createSession(userData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'healthcare_session',
        expect.any(String)
      );
    });

    it('should terminate existing session before creating new one', async () => {
      const userData1 = {
        userId: 'user-1',
        email: 'user1@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      const userData2 = {
        userId: 'user-2',
        email: 'user2@example.com',
        role: 'provider' as const,
        permissions: ['read:patient_data']
      };

      await sessionManager.createSession(userData1);
      const session1 = sessionManager.getCurrentSession();

      await sessionManager.createSession(userData2);
      const session2 = sessionManager.getCurrentSession();

      expect(session2?.userId).toBe('user-2');
      expect(session2?.sessionId).not.toBe(session1?.sessionId);
    });

    it('should set up session timers', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      // Verify timers are set up (indirectly through session state)
      expect(sessionManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Session Validation', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should validate current session', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      expect(sessionManager.isAuthenticated()).toBe(true);
    });

    it('should detect expired session', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      // Fast-forward time beyond session expiry
      vi.advanceTimersByTime(DEFAULT_SESSION_CONFIG.maxAge + 1000);

      expect(sessionManager.isAuthenticated()).toBe(false);
    });

    it('should detect idle timeout', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      // Fast-forward time beyond idle timeout
      vi.advanceTimersByTime(DEFAULT_SESSION_CONFIG.idleTimeout + 1000);

      expect(sessionManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Activity Tracking', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should record user activity', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      const initialActivity = sessionManager.getCurrentSession()?.lastActivity;

      // Simulate some time passing
      vi.advanceTimersByTime(5000);

      sessionManager.recordActivity();
      const newActivity = sessionManager.getCurrentSession()?.lastActivity;

      expect(newActivity?.getTime()).toBeGreaterThan(initialActivity!.getTime());
    });

    it('should reset idle timer on activity', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      // Advance time close to idle timeout
      vi.advanceTimersByTime(DEFAULT_SESSION_CONFIG.idleTimeout - 5000);

      // Record activity to reset timer
      sessionManager.recordActivity();

      // Advance time by another small amount (should still be valid)
      vi.advanceTimersByTime(10000);

      expect(sessionManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Session Refresh', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should refresh session successfully', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      const originalExpiry = sessionManager.getCurrentSession()?.expiresAt;

      // Advance time slightly to ensure new expiry is different
      vi.advanceTimersByTime(1000);
      
      await sessionManager.refreshSession();
      const newExpiry = sessionManager.getCurrentSession()?.expiresAt;

      expect(newExpiry?.getTime()).toBeGreaterThan(originalExpiry!.getTime());
    });

    it('should update last activity on refresh', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      const originalActivity = sessionManager.getCurrentSession()?.lastActivity;

      // Advance time
      vi.advanceTimersByTime(5000);

      await sessionManager.refreshSession();
      const newActivity = sessionManager.getCurrentSession()?.lastActivity;

      expect(newActivity?.getTime()).toBeGreaterThan(originalActivity!.getTime());
    });
  });

  describe('Session Termination', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should terminate session', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      expect(sessionManager.isAuthenticated()).toBe(true);

      await sessionManager.terminateSession();
      expect(sessionManager.isAuthenticated()).toBe(false);
      expect(sessionManager.getCurrentSession()).toBeNull();
    });

    it('should clear stored session data on termination', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      await sessionManager.terminateSession();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('healthcare_session');
    });
  });

  describe('Permission and Role Checking', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should check permissions correctly', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'provider' as const,
        permissions: ['read:patient_data', 'write:patient_data']
      };

      await sessionManager.createSession(userData);

      expect(sessionManager.hasPermission('read:patient_data')).toBe(true);
      expect(sessionManager.hasPermission('write:patient_data')).toBe(true);
      expect(sessionManager.hasPermission('admin:all')).toBe(false);
    });

    it('should check roles correctly', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'admin' as const,
        permissions: ['admin:all']
      };

      await sessionManager.createSession(userData);

      expect(sessionManager.hasRole('admin')).toBe(true);
      expect(sessionManager.hasRole('provider')).toBe(false);
      expect(sessionManager.hasRole('patient')).toBe(false);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should emit session events', async () => {
      const eventHandler = vi.fn();
      sessionManager.addEventListener(eventHandler);

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'created',
          sessionId: expect.any(String),
          userId: 'user-123'
        })
      );
    });

    it('should remove event listeners', async () => {
      const eventHandler = vi.fn();
      sessionManager.addEventListener(eventHandler);
      sessionManager.removeEventListener(eventHandler);

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it('should handle event handler errors gracefully', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      sessionManager.addEventListener(errorHandler);

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);

      expect(consoleSpy).toHaveBeenCalledWith('Session event handler error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Session Metadata', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should provide session metadata', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      const metadata = sessionManager.getSessionMetadata();

      expect(metadata).toMatchObject({
        sessionId: expect.any(String),
        userId: 'user-123',
        role: 'patient',
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
        lastActivity: expect.any(Date),
        timeToExpiry: expect.any(Number),
        isAuthenticated: true
      });
    });

    it('should return empty metadata when no session', async () => {
      // Ensure no session exists
      await sessionManager.terminateSession();
      
      const metadata = sessionManager.getSessionMetadata();
      expect(metadata).toEqual({});
    });

    it('should calculate time to expiry correctly', async () => {
      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      const timeToExpiry = sessionManager.getTimeToExpiry();

      expect(timeToExpiry).toBeGreaterThan(0);
      expect(timeToExpiry).toBeLessThanOrEqual(DEFAULT_SESSION_CONFIG.maxAge);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization without crypto API', async () => {
      const originalCrypto = global.window.crypto;
      delete (global.window as any).crypto;

      const manager = new SessionManager();
      await expect(manager.initialize()).resolves.not.toThrow();

      manager.cleanup();
      global.window.crypto = originalCrypto;
    });

    it('should handle localStorage errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await sessionManager.initialize();

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      // Should not throw despite storage error
      await expect(sessionManager.createSession(userData)).resolves.toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should handle invalid stored session data', async () => {
      // Mock invalid JSON that will cause parse error
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      // Mock decrypt to return invalid data
      mockCrypto.subtle.decrypt.mockImplementationOnce(() => 
        Promise.resolve(new TextEncoder().encode('invalid-json'))
      );

      await sessionManager.initialize();

      expect(sessionManager.getCurrentSession()).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('healthcare_session');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', async () => {
      await sessionManager.initialize();

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await sessionManager.createSession(userData);
      sessionManager.cleanup();

      expect(sessionManager.getCurrentSession()).toBeNull();
      expect(sessionManager.isAuthenticated()).toBe(false);
    });
  });
});