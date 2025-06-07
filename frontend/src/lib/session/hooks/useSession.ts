/**
 * React Hooks for Session Management
 * 
 * Provides React integration for secure session management
 * in healthcare applications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionManager, SessionData, SessionEvent } from '../SessionManager';

/**
 * Hook for session state management
 */
export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        await sessionManager.initialize();
        const currentSession = sessionManager.getCurrentSession();
        setSession(currentSession);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Listen for session events
    const handleSessionEvent = (event: SessionEvent) => {
      switch (event.type) {
        case 'created':
        case 'renewed':
          setSession(sessionManager.getCurrentSession());
          break;
        case 'expired':
        case 'terminated':
          setSession(null);
          break;
      }
    };

    sessionManager.addEventListener(handleSessionEvent);

    return () => {
      sessionManager.removeEventListener(handleSessionEvent);
    };
  }, []);

  const login = useCallback(async (userData: {
    userId: string;
    email: string;
    role: SessionData['role'];
    permissions: string[];
    refreshToken?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSession = await sessionManager.createSession(userData);
      setSession(newSession);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await sessionManager.terminateSession();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      await sessionManager.refreshSession();
      setSession(sessionManager.getCurrentSession());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session refresh failed');
      setSession(null);
    }
  }, []);

  return {
    session,
    isLoading,
    error,
    isAuthenticated: sessionManager.isAuthenticated(),
    login,
    logout,
    refresh
  };
}

/**
 * Hook for session monitoring and warnings
 */
export function useSessionMonitoring() {
  const [timeToExpiry, setTimeToExpiry] = useState<number | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [warnings, setWarnings] = useState<Array<{
    id: string;
    message: string;
    type: 'warning' | 'critical';
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Update expiry time every minute
    const updateExpiry = () => {
      const time = sessionManager.getTimeToExpiry();
      setTimeToExpiry(time);
      
      // Check for approaching expiry
      if (time && time < 5 * 60 * 1000) { // 5 minutes
        const warningId = `expiry-${Date.now()}`;
        setWarnings(prev => [...prev, {
          id: warningId,
          message: `Session expires in ${Math.ceil(time / 60000)} minutes`,
          type: time < 2 * 60 * 1000 ? 'critical' : 'warning',
          timestamp: new Date()
        }]);
      }
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 60000); // Every minute

    // Listen for session events
    const handleSessionEvent = (event: SessionEvent) => {
      switch (event.type) {
        case 'warning':
          setWarnings(prev => [...prev, {
            id: `warning-${Date.now()}`,
            message: event.data?.minutesRemaining 
              ? `Session expires in ${event.data.minutesRemaining} minutes`
              : 'Session expiring soon',
            type: 'warning',
            timestamp: event.timestamp
          }]);
          break;
        case 'expired':
          setWarnings(prev => [...prev, {
            id: `expired-${Date.now()}`,
            message: 'Session has expired. Please log in again.',
            type: 'critical',
            timestamp: event.timestamp
          }]);
          break;
        case 'activity':
          setIsIdle(false);
          break;
      }
    };

    sessionManager.addEventListener(handleSessionEvent);

    return () => {
      clearInterval(interval);
      sessionManager.removeEventListener(handleSessionEvent);
    };
  }, []);

  const dismissWarning = useCallback((warningId: string) => {
    setWarnings(prev => prev.filter(w => w.id !== warningId));
  }, []);

  const clearAllWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  return {
    timeToExpiry,
    isIdle,
    warnings,
    dismissWarning,
    clearAllWarnings
  };
}

/**
 * Hook for permission and role checking
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<SessionData['role'] | null>(null);

  useEffect(() => {
    const updatePermissions = () => {
      const session = sessionManager.getCurrentSession();
      setPermissions(session?.permissions || []);
      setRole(session?.role || null);
    };

    updatePermissions();

    const handleSessionEvent = (event: SessionEvent) => {
      if (event.type === 'created' || event.type === 'renewed') {
        updatePermissions();
      } else if (event.type === 'expired' || event.type === 'terminated') {
        setPermissions([]);
        setRole(null);
      }
    };

    sessionManager.addEventListener(handleSessionEvent);

    return () => {
      sessionManager.removeEventListener(handleSessionEvent);
    };
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return sessionManager.hasPermission(permission);
  }, []);

  const hasRole = useCallback((roleToCheck: SessionData['role']) => {
    return sessionManager.hasRole(roleToCheck);
  }, []);

  const hasAnyPermission = useCallback((permissionList: string[]) => {
    return permissionList.some(permission => sessionManager.hasPermission(permission));
  }, []);

  const hasAllPermissions = useCallback((permissionList: string[]) => {
    return permissionList.every(permission => sessionManager.hasPermission(permission));
  }, []);

  return {
    permissions,
    role,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  };
}

/**
 * Hook for activity tracking
 */
export function useActivityTracking(options: {
  trackClicks?: boolean;
  trackKeyboard?: boolean;
  trackMouse?: boolean;
  trackScroll?: boolean;
  debounceMs?: number;
} = {}) {
  const {
    trackClicks = true,
    trackKeyboard = true,
    trackMouse = false,
    trackScroll = false,
    debounceMs = 1000
  } = options;

  const lastActivityRef = useRef<number>(0);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current >= debounceMs) {
      sessionManager.recordActivity();
      lastActivityRef.current = now;
    }
  }, [debounceMs]);

  useEffect(() => {
    const events: { type: string; handler: () => void }[] = [];

    if (trackClicks) {
      events.push({ type: 'click', handler: recordActivity });
    }
    if (trackKeyboard) {
      events.push({ type: 'keydown', handler: recordActivity });
    }
    if (trackMouse) {
      events.push({ type: 'mousemove', handler: recordActivity });
    }
    if (trackScroll) {
      events.push({ type: 'scroll', handler: recordActivity });
    }

    events.forEach(({ type, handler }) => {
      document.addEventListener(type, handler, { passive: true });
    });

    return () => {
      events.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler);
      });
    };
  }, [trackClicks, trackKeyboard, trackMouse, trackScroll, recordActivity]);

  return {
    recordActivity
  };
}

/**
 * Hook for session security monitoring
 */
export function useSessionSecurity() {
  const [securityEvents, setSecurityEvents] = useState<Array<{
    id: string;
    type: 'suspicious_activity' | 'multiple_sessions' | 'location_change' | 'device_change';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    data?: Record<string, any>;
  }>>([]);

  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    // Monitor for security events
    const checkSecurity = () => {
      const session = sessionManager.getCurrentSession();
      if (!session) return;

      // Check for multiple rapid sessions (simplified)
      const now = Date.now();
      const sessionAge = now - session.createdAt.getTime();
      
      if (sessionAge < 60000) { // Less than 1 minute old
        // Could indicate rapid session creation
        const eventId = `rapid-session-${now}`;
        setSecurityEvents(prev => {
          if (!prev.find(e => e.id === eventId)) {
            return [...prev, {
              id: eventId,
              type: 'suspicious_activity',
              message: 'Rapid session creation detected',
              severity: 'medium',
              timestamp: new Date(),
              data: { sessionAge }
            }];
          }
          return prev;
        });
      }

      // Check if session is secure
      const metadata = sessionManager.getSessionMetadata();
      setIsSecure(metadata.isAuthenticated);
    };

    const interval = setInterval(checkSecurity, 30000); // Check every 30 seconds
    checkSecurity(); // Initial check

    const handleSessionEvent = (event: SessionEvent) => {
      if (event.type === 'terminated' && event.data?.reason) {
        const eventId = `termination-${event.timestamp.getTime()}`;
        const eventData = event.data;
        setSecurityEvents(prev => [...prev, {
          id: eventId,
          type: 'suspicious_activity',
          message: `Session terminated: ${eventData.reason}`,
          severity: 'high',
          timestamp: event.timestamp,
          data: eventData
        }]);
      }
    };

    sessionManager.addEventListener(handleSessionEvent);

    return () => {
      clearInterval(interval);
      sessionManager.removeEventListener(handleSessionEvent);
    };
  }, []);

  const acknowledgeSecurityEvent = useCallback((eventId: string) => {
    setSecurityEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const clearSecurityEvents = useCallback(() => {
    setSecurityEvents([]);
  }, []);

  return {
    securityEvents,
    isSecure,
    acknowledgeSecurityEvent,
    clearSecurityEvents
  };
}

/**
 * Hook for healthcare-specific session features
 */
export function useHealthcareSession() {
  const { session } = useSession();
  const { hasPermission, hasRole } = usePermissions();

  const canAccessPatientData = useCallback((patientId?: string) => {
    if (!session || !hasPermission('read:patient_data')) return false;
    
    // Additional checks for specific patient access
    if (patientId && hasRole('patient')) {
      return session.userId === patientId; // Patients can only access their own data
    }
    
    return hasRole('provider') || hasRole('admin');
  }, [session, hasPermission, hasRole]);

  const canModifyPatientData = useCallback((patientId?: string) => {
    if (!session || !hasPermission('write:patient_data')) return false;
    
    if (patientId && hasRole('patient')) {
      return session.userId === patientId; // Patients can only modify their own data
    }
    
    return hasRole('provider') || hasRole('admin');
  }, [session, hasPermission, hasRole]);

  const canAccessEmergencyFeatures = useCallback(() => {
    return hasPermission('access:emergency') || hasRole('provider') || hasRole('admin');
  }, [hasPermission, hasRole]);

  const canScheduleAppointments = useCallback(() => {
    return hasPermission('schedule:appointments') || 
           hasRole('provider') || 
           hasRole('admin') || 
           hasRole('patient'); // Patients can schedule their own appointments
  }, [hasPermission, hasRole]);

  const canViewReports = useCallback(() => {
    return hasPermission('view:reports') || hasRole('provider') || hasRole('admin');
  }, [hasPermission, hasRole]);

  const getPatientAccessLevel = useCallback(() => {
    if (hasRole('admin')) return 'full';
    if (hasRole('provider')) return 'clinical';
    if (hasRole('patient')) return 'self';
    return 'none';
  }, [hasRole]);

  return {
    canAccessPatientData,
    canModifyPatientData,
    canAccessEmergencyFeatures,
    canScheduleAppointments,
    canViewReports,
    getPatientAccessLevel,
    isProvider: hasRole('provider'),
    isPatient: hasRole('patient'),
    isAdmin: hasRole('admin')
  };
}