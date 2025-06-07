/**
 * Session Hooks Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '../../../test/utils/render';
import { 
  useSession,
  useSessionMonitoring,
  usePermissions,
  useActivityTracking,
  useSessionSecurity,
  useHealthcareSession
} from '../hooks/useSession';

// Mock the SessionManager
const mockSessionManager = {
  initialize: vi.fn(),
  getCurrentSession: vi.fn(),
  createSession: vi.fn(),
  terminateSession: vi.fn(),
  refreshSession: vi.fn(),
  isAuthenticated: vi.fn(),
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  recordActivity: vi.fn(),
  getTimeToExpiry: vi.fn(),
  getSessionMetadata: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

vi.mock('../SessionManager', () => ({
  sessionManager: mockSessionManager,
  SessionData: vi.fn(),
  SessionEvent: vi.fn()
}));

describe('Session Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useSession', () => {
    it('should initialize with loading state', () => {
      mockSessionManager.initialize.mockResolvedValue(undefined);
      mockSessionManager.getCurrentSession.mockReturnValue(null);

      const { result } = renderHook(() => useSession());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.session).toBeNull();
    });

    it('should load existing session on initialization', async () => {
      const mockSession = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient',
        permissions: ['read:own_data'],
        sessionId: 'session-123',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        lastActivity: new Date()
      };

      mockSessionManager.initialize.mockResolvedValue(undefined);
      mockSessionManager.getCurrentSession.mockReturnValue(mockSession);
      mockSessionManager.isAuthenticated.mockReturnValue(true);

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await Promise.resolve(); // Wait for initialization
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login successfully', async () => {
      const mockSession = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'provider',
        permissions: ['read:patient_data'],
        sessionId: 'session-123',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        lastActivity: new Date()
      };

      mockSessionManager.initialize.mockResolvedValue(undefined);
      mockSessionManager.createSession.mockResolvedValue(mockSession);
      mockSessionManager.getCurrentSession.mockReturnValue(null).mockReturnValueOnce(mockSession);

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await Promise.resolve(); // Wait for initialization
      });

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'provider' as const,
        permissions: ['read:patient_data']
      };

      await act(async () => {
        await result.current.login(userData);
      });

      expect(mockSessionManager.createSession).toHaveBeenCalledWith(userData);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should handle login errors', async () => {
      mockSessionManager.initialize.mockResolvedValue(undefined);
      mockSessionManager.createSession.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await Promise.resolve(); // Wait for initialization
      });

      const userData = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient' as const,
        permissions: ['read:own_data']
      };

      await act(async () => {
        try {
          await result.current.login(userData);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Login failed');
    });

    it('should handle logout', async () => {
      mockSessionManager.initialize.mockResolvedValue(undefined);
      mockSessionManager.terminateSession.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSessionManager.terminateSession).toHaveBeenCalled();
    });

    it('should handle session refresh', async () => {
      mockSessionManager.initialize.mockResolvedValue(undefined);
      mockSessionManager.refreshSession.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockSessionManager.refreshSession).toHaveBeenCalled();
    });

    it('should listen for session events', async () => {
      mockSessionManager.initialize.mockResolvedValue(undefined);
      let eventHandler: Function;
      mockSessionManager.addEventListener.mockImplementation((handler) => {
        eventHandler = handler;
      });

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await Promise.resolve(); // Wait for initialization
      });

      // Simulate session created event
      const mockSession = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'patient',
        permissions: ['read:own_data']
      };

      mockSessionManager.getCurrentSession.mockReturnValue(mockSession);

      act(() => {
        eventHandler!({ type: 'created', sessionId: 'session-123', timestamp: new Date() });
      });

      expect(result.current.session).toEqual(mockSession);
    });
  });

  describe('useSessionMonitoring', () => {
    it('should track time to expiry', () => {
      mockSessionManager.getTimeToExpiry.mockReturnValue(5 * 60 * 1000); // 5 minutes

      const { result } = renderHook(() => useSessionMonitoring());

      expect(result.current.timeToExpiry).toBe(5 * 60 * 1000);
    });

    it('should generate warnings for approaching expiry', () => {
      mockSessionManager.getTimeToExpiry.mockReturnValue(4 * 60 * 1000); // 4 minutes

      const { result } = renderHook(() => useSessionMonitoring());

      // Fast forward time to trigger warning check
      act(() => {
        vi.advanceTimersByTime(60000); // 1 minute
      });

      expect(result.current.warnings.length).toBeGreaterThan(0);
      expect(result.current.warnings[0]).toBeDefined();
      expect(result.current.warnings[0]!.type).toBe('warning');
    });

    it('should generate critical warnings for imminent expiry', () => {
      mockSessionManager.getTimeToExpiry.mockReturnValue(1 * 60 * 1000); // 1 minute

      const { result } = renderHook(() => useSessionMonitoring());

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.warnings.length).toBeGreaterThan(0);
      expect(result.current.warnings[0]).toBeDefined();
      expect(result.current.warnings[0]!.type).toBe('critical');
    });

    it('should handle warning dismissal', () => {
      mockSessionManager.getTimeToExpiry.mockReturnValue(4 * 60 * 1000);

      const { result } = renderHook(() => useSessionMonitoring());

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.warnings[0]).toBeDefined();
      const warningId = result.current.warnings[0]!.id;

      act(() => {
        result.current.dismissWarning(warningId);
      });

      expect(result.current.warnings.find(w => w.id === warningId)).toBeUndefined();
    });

    it('should clear all warnings', () => {
      mockSessionManager.getTimeToExpiry.mockReturnValue(4 * 60 * 1000);

      const { result } = renderHook(() => useSessionMonitoring());

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.warnings.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearAllWarnings();
      });

      expect(result.current.warnings).toEqual([]);
    });
  });

  describe('usePermissions', () => {
    it('should track user permissions and role', () => {
      const mockSession = {
        userId: 'user-123',
        role: 'provider',
        permissions: ['read:patient_data', 'write:patient_data']
      };

      mockSessionManager.getCurrentSession.mockReturnValue(mockSession);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual(['read:patient_data', 'write:patient_data']);
      expect(result.current.role).toBe('provider');
    });

    it('should check individual permissions', () => {
      mockSessionManager.hasPermission.mockImplementation((permission) => {
        return permission === 'read:patient_data';
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('read:patient_data')).toBe(true);
      expect(result.current.hasPermission('admin:all')).toBe(false);
    });

    it('should check roles', () => {
      mockSessionManager.hasRole.mockImplementation((role) => {
        return role === 'provider';
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasRole('provider')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(false);
    });

    it('should check multiple permissions', () => {
      mockSessionManager.hasPermission.mockImplementation((permission) => {
        return ['read:patient_data', 'write:patient_data'].includes(permission);
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPermission(['read:patient_data', 'admin:all'])).toBe(true);
      expect(result.current.hasAllPermissions(['read:patient_data', 'write:patient_data'])).toBe(true);
      expect(result.current.hasAllPermissions(['read:patient_data', 'admin:all'])).toBe(false);
    });
  });

  describe('useActivityTracking', () => {
    it('should record activity with debouncing', () => {
      const { result } = renderHook(() => useActivityTracking({ debounceMs: 1000 }));

      act(() => {
        result.current.recordActivity();
        result.current.recordActivity(); // Should be debounced
      });

      expect(mockSessionManager.recordActivity).toHaveBeenCalledTimes(1);

      // Advance time past debounce period
      act(() => {
        vi.advanceTimersByTime(1000);
        result.current.recordActivity();
      });

      expect(mockSessionManager.recordActivity).toHaveBeenCalledTimes(2);
    });

    it('should track different event types', () => {
      const { result } = renderHook(() => useActivityTracking({
        trackClicks: true,
        trackKeyboard: true,
        trackMouse: false,
        trackScroll: false
      }));

      // Should set up event listeners for clicks and keyboard but not mouse/scroll
      expect(result.current.recordActivity).toBeDefined();
    });
  });

  describe('useSessionSecurity', () => {
    it('should track security events', () => {
      const { result } = renderHook(() => useSessionSecurity());

      expect(result.current.securityEvents).toEqual([]);
      expect(result.current.isSecure).toBe(true);
    });

    it('should handle security event acknowledgment', () => {
      const { result } = renderHook(() => useSessionSecurity());

      // Simulate a security event being added
      act(() => {
        // This would normally be triggered by the session manager
        vi.advanceTimersByTime(30000); // Trigger security check
      });

      act(() => {
        result.current.clearSecurityEvents();
      });

      expect(result.current.securityEvents).toEqual([]);
    });
  });

  describe('useHealthcareSession', () => {
    beforeEach(() => {
      const mockSession = {
        userId: 'provider-123',
        role: 'provider',
        permissions: ['read:patient_data', 'write:patient_data']
      };

      mockSessionManager.getCurrentSession.mockReturnValue(mockSession);
      mockSessionManager.hasPermission.mockImplementation((permission) => {
        return mockSession.permissions.includes(permission);
      });
      mockSessionManager.hasRole.mockImplementation((role) => {
        return mockSession.role === role;
      });
    });

    it('should check patient data access permissions', () => {
      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.canAccessPatientData()).toBe(true);
      expect(result.current.canAccessPatientData('patient-123')).toBe(true);
    });

    it('should restrict patient access to own data', () => {
      const mockPatientSession = {
        userId: 'patient-123',
        role: 'patient',
        permissions: ['read:own_data']
      };

      mockSessionManager.getCurrentSession.mockReturnValue(mockPatientSession);
      mockSessionManager.hasRole.mockImplementation((role) => role === 'patient');
      mockSessionManager.hasPermission.mockImplementation((permission) => 
        permission === 'read:patient_data'
      );

      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.canAccessPatientData('patient-123')).toBe(true);
      expect(result.current.canAccessPatientData('patient-456')).toBe(false);
    });

    it('should check emergency access permissions', () => {
      mockSessionManager.hasPermission.mockImplementation((permission) => 
        permission === 'access:emergency'
      );

      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.canAccessEmergencyFeatures()).toBe(true);
    });

    it('should determine patient access level', () => {
      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.getPatientAccessLevel()).toBe('clinical');
    });

    it('should identify user roles', () => {
      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.isProvider).toBe(true);
      expect(result.current.isPatient).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should check appointment scheduling permissions', () => {
      mockSessionManager.hasPermission.mockImplementation((permission) => 
        permission === 'schedule:appointments'
      );

      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.canScheduleAppointments()).toBe(true);
    });

    it('should check report viewing permissions', () => {
      mockSessionManager.hasPermission.mockImplementation((permission) => 
        permission === 'view:reports'
      );

      const { result } = renderHook(() => useHealthcareSession());

      expect(result.current.canViewReports()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle session manager errors', async () => {
      mockSessionManager.initialize.mockRejectedValue(new Error('Initialization failed'));

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.error).toBe('Initialization failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle missing session manager gracefully', () => {
      const originalError = console.error;
      console.error = vi.fn();

      mockSessionManager.getCurrentSession.mockReturnValue(null);
      mockSessionManager.isAuthenticated.mockReturnValue(false);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual([]);
      expect(result.current.role).toBeNull();

      console.error = originalError;
    });
  });
});