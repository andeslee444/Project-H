/**
 * Session Provider Component
 * 
 * Provides session context and monitoring for the entire application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Progress } from '../../../components/ui/progress';
import { useSession, useSessionMonitoring, useSessionSecurity } from '../hooks/useSession';
import { SessionData } from '../SessionManager';

interface SessionContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: any) => Promise<SessionData>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: React.ReactNode;
  enableWarnings?: boolean;
  enableSecurityMonitoring?: boolean;
  autoRefresh?: boolean;
}

export function SessionProvider({ 
  children, 
  enableWarnings = true,
  enableSecurityMonitoring = true,
  autoRefresh = true 
}: SessionProviderProps) {
  const { 
    session, 
    isLoading, 
    error, 
    isAuthenticated, 
    login, 
    logout, 
    refresh 
  } = useSession();

  const { 
    timeToExpiry, 
    warnings, 
    dismissWarning, 
    clearAllWarnings 
  } = useSessionMonitoring();

  const { 
    securityEvents, 
    acknowledgeSecurityEvent, 
    clearSecurityEvents 
  } = useSessionSecurity();

  const [showExpiryDialog, setShowExpiryDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  // Auto-refresh session when enabled
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return;

    const interval = setInterval(() => {
      if (timeToExpiry && timeToExpiry < 10 * 60 * 1000) { // 10 minutes
        refresh();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, timeToExpiry, refresh]);

  // Show expiry dialog when session is about to expire
  useEffect(() => {
    if (enableWarnings && timeToExpiry && timeToExpiry < 5 * 60 * 1000) { // 5 minutes
      setShowExpiryDialog(true);
    }
  }, [enableWarnings, timeToExpiry]);

  // Show security dialog for high severity events
  useEffect(() => {
    if (enableSecurityMonitoring && securityEvents.some(e => e.severity === 'high')) {
      setShowSecurityDialog(true);
    }
  }, [enableSecurityMonitoring, securityEvents]);

  const handleExtendSession = async () => {
    try {
      await refresh();
      setShowExpiryDialog(false);
      clearAllWarnings();
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const handleLogoutFromDialog = async () => {
    try {
      await logout();
      setShowExpiryDialog(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleAcknowledgeSecurity = () => {
    clearSecurityEvents();
    setShowSecurityDialog(false);
  };

  const contextValue: SessionContextType = {
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}

      {/* Session Warning Notifications */}
      {enableWarnings && warnings.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2" role="alert">
          {warnings.map((warning) => (
            <Alert 
              key={warning.id} 
              className={`${warning.type === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'} max-w-sm`}
            >
              <AlertTitle className={warning.type === 'critical' ? 'text-red-700' : 'text-yellow-700'}>
                {warning.type === 'critical' ? 'Critical: ' : 'Warning: '}Session Alert
              </AlertTitle>
              <AlertDescription className={warning.type === 'critical' ? 'text-red-600' : 'text-yellow-600'}>
                {warning.message}
              </AlertDescription>
              <Button
                size="sm"
                variant="outline"
                onClick={() => dismissWarning(warning.id)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </Alert>
          ))}
        </div>
      )}

      {/* Security Event Notifications */}
      {enableSecurityMonitoring && securityEvents.length > 0 && (
        <div className="fixed top-4 left-4 z-50 space-y-2">
          {securityEvents.filter(e => e.severity !== 'high').map((event) => (
            <Alert key={event.id} className="border-orange-500 bg-orange-50 max-w-sm">
              <AlertTitle className="text-orange-700">
                Security Notice
              </AlertTitle>
              <AlertDescription className="text-orange-600">
                {event.message}
              </AlertDescription>
              <Button
                size="sm"
                variant="outline"
                onClick={() => acknowledgeSecurityEvent(event.id)}
                className="mt-2"
              >
                Acknowledge
              </Button>
            </Alert>
          ))}
        </div>
      )}

      {/* Session Expiry Dialog */}
      <Dialog open={showExpiryDialog} onOpenChange={setShowExpiryDialog}>
        <DialogContent className="sm:max-w-md" aria-labelledby="session-expiry-title">
          <DialogHeader>
            <DialogTitle id="session-expiry-title">Session Expiring Soon</DialogTitle>
            <DialogDescription>
              Your session will expire in {timeToExpiry ? Math.ceil(timeToExpiry / 60000) : 0} minutes.
              Would you like to extend your session?
            </DialogDescription>
          </DialogHeader>
          
          {timeToExpiry && (
            <div className="py-4">
              <div className="mb-2 text-sm text-gray-600">
                Time remaining: {Math.ceil(timeToExpiry / 60000)} minutes
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, (timeToExpiry / (5 * 60 * 1000)) * 100))} 
                className="h-2"
              />
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLogoutFromDialog}
            >
              Logout Now
            </Button>
            <Button
              onClick={handleExtendSession}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Extend Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Event Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="sm:max-w-md" aria-labelledby="security-alert-title">
          <DialogHeader>
            <DialogTitle id="security-alert-title" className="text-red-600">
              Security Alert
            </DialogTitle>
            <DialogDescription>
              Suspicious activity has been detected on your account. Please review the security events below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3 max-h-60 overflow-y-auto">
            {securityEvents.filter(e => e.severity === 'high').map((event) => (
              <div key={event.id} className="p-3 border border-red-200 rounded bg-red-50">
                <div className="font-medium text-red-800">{event.message}</div>
                <div className="text-xs text-red-600 mt-1">
                  {event.timestamp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={handleAcknowledgeSecurity}
              variant="outline"
            >
              I Understand
            </Button>
            <Button
              onClick={handleLogoutFromDialog}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout for Security
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Managing your session...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className="border-red-500 bg-red-50 max-w-sm">
            <AlertTitle className="text-red-700">Session Error</AlertTitle>
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </SessionContext.Provider>
  );
}

/**
 * Session Status Component
 * Shows current session information
 */
interface SessionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SessionStatus({ className = '', showDetails = false }: SessionStatusProps) {
  const { session, isAuthenticated } = useSessionContext();
  const { timeToExpiry } = useSessionMonitoring();

  if (!isAuthenticated || !session) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Not authenticated
      </div>
    );
  }

  const formatTimeRemaining = (ms: number | null) => {
    if (!ms) return 'Unknown';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-700">
          {session.email} ({session.role})
        </span>
      </div>
      
      {showDetails && (
        <div className="mt-1 space-y-1 text-xs text-gray-500">
          <div>Session expires in: {formatTimeRemaining(timeToExpiry)}</div>
          <div>Last activity: {session.lastActivity.toLocaleTimeString()}</div>
          <div>Session ID: {session.sessionId.slice(0, 8)}...</div>
        </div>
      )}
    </div>
  );
}

/**
 * Protected Route Component
 * Only renders children if user has required permissions
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: SessionData['role'];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRole,
  fallback = <div>Access denied</div>
}: ProtectedRouteProps) {
  const { session, isAuthenticated } = useSessionContext();

  if (!isAuthenticated || !session) {
    return <>{fallback}</>;
  }

  // Check required role
  if (requiredRole && session.role !== requiredRole) {
    return <>{fallback}</>;
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every(permission =>
      session.permissions.includes(permission)
    );
    
    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}