/**
 * Session Management Module
 * 
 * Exports all session management utilities and components
 * for healthcare applications.
 */

// Core session management
export {
  SessionManager,
  type SessionData,
  type SessionConfig,
  sessionManager,
  DEFAULT_SESSION_CONFIG
} from './SessionManager';

export type {
  SessionEvent,
  SessionEventHandler
} from './SessionManager';

// React hooks
export {
  useSession,
  useSessionMonitoring,
  usePermissions,
  useActivityTracking,
  useSessionSecurity,
  useHealthcareSession
} from './hooks/useSession';

// Components
export {
  SessionProvider,
  useSessionContext,
  SessionStatus,
  ProtectedRoute
} from './components/SessionProvider';

/**
 * Healthcare session utilities
 */
export const SessionUtils = {
  /**
   * Validate session for healthcare compliance
   */
  validateHealthcareSession: (session: SessionData | null): {
    isValid: boolean;
    issues: string[];
  } => {
    const issues: string[] = [];
    
    if (!session) {
      return { isValid: false, issues: ['No active session'] };
    }

    // Check session age (HIPAA recommends shorter sessions for healthcare data)
    const sessionAge = Date.now() - session.createdAt.getTime();
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours max for healthcare
    
    if (sessionAge > maxAge) {
      issues.push('Session exceeds maximum age for healthcare applications');
    }

    // Check idle time
    const idleTime = Date.now() - session.lastActivity.getTime();
    const maxIdle = 30 * 60 * 1000; // 30 minutes max idle
    
    if (idleTime > maxIdle) {
      issues.push('Session has been idle too long');
    }

    // Check required permissions for healthcare
    const requiredPermissions = ['read:patient_data'];
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      session.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      issues.push('Session missing required healthcare permissions');
    }

    // Check role validity
    const validRoles = ['patient', 'provider', 'admin', 'support'];
    if (!validRoles.includes(session.role)) {
      issues.push('Invalid user role for healthcare application');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  },

  /**
   * Generate session security report
   */
  generateSecurityReport: (session: SessionData | null): {
    score: number;
    recommendations: string[];
    risks: Array<{ level: 'low' | 'medium' | 'high'; description: string }>;
  } => {
    const recommendations: string[] = [];
    const risks: Array<{ level: 'low' | 'medium' | 'high'; description: string }> = [];
    let score = 100;

    if (!session) {
      return {
        score: 0,
        recommendations: ['Establish secure session'],
        risks: [{ level: 'high', description: 'No active session' }]
      };
    }

    // Check session duration
    const sessionAge = Date.now() - session.createdAt.getTime();
    if (sessionAge > 4 * 60 * 60 * 1000) { // 4 hours
      score -= 10;
      recommendations.push('Consider refreshing long-running sessions');
      risks.push({ level: 'medium', description: 'Extended session duration' });
    }

    // Check last activity
    const idleTime = Date.now() - session.lastActivity.getTime();
    if (idleTime > 15 * 60 * 1000) { // 15 minutes
      score -= 15;
      recommendations.push('Session shows signs of inactivity');
      risks.push({ level: 'medium', description: 'User may have left session unattended' });
    }

    // Check IP address consistency (simplified)
    if (!session.ipAddress) {
      score -= 5;
      recommendations.push('Enable IP address tracking for enhanced security');
      risks.push({ level: 'low', description: 'IP address not tracked' });
    }

    // Check user agent consistency
    if (!session.userAgent) {
      score -= 5;
      recommendations.push('Enable user agent tracking for device consistency');
      risks.push({ level: 'low', description: 'Device fingerprinting not enabled' });
    }

    // Check permission scope
    if (session.permissions.includes('admin:all')) {
      score -= 20;
      recommendations.push('Review administrative privilege usage');
      risks.push({ level: 'high', description: 'Broad administrative permissions active' });
    }

    return {
      score: Math.max(0, score),
      recommendations,
      risks
    };
  },

  /**
   * Format session duration for display
   */
  formatSessionDuration: (session: SessionData | null): string => {
    if (!session) return 'No active session';

    const duration = Date.now() - session.createdAt.getTime();
    const hours = Math.floor(duration / (60 * 60 * 1000));
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Format time until expiry
   */
  formatTimeToExpiry: (timeToExpiry: number | null): string => {
    if (!timeToExpiry || timeToExpiry <= 0) return 'Expired';

    const hours = Math.floor(timeToExpiry / (60 * 60 * 1000));
    const minutes = Math.floor((timeToExpiry % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeToExpiry % (60 * 1000)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Check if session requires immediate attention
   */
  requiresImmediateAttention: (session: SessionData | null): {
    urgent: boolean;
    reason?: string;
  } => {
    if (!session) {
      return { urgent: true, reason: 'No active session' };
    }

    const timeToExpiry = session.expiresAt.getTime() - Date.now();
    if (timeToExpiry < 5 * 60 * 1000) { // 5 minutes
      return { urgent: true, reason: 'Session expiring soon' };
    }

    const idleTime = Date.now() - session.lastActivity.getTime();
    if (idleTime > 25 * 60 * 1000) { // 25 minutes (close to 30min timeout)
      return { urgent: true, reason: 'Extended inactivity detected' };
    }

    return { urgent: false };
  },

  /**
   * Get healthcare-specific session recommendations
   */
  getHealthcareRecommendations: (session: SessionData | null): string[] => {
    const recommendations: string[] = [];

    if (!session) {
      recommendations.push('Establish secure session with proper healthcare permissions');
      return recommendations;
    }

    // Role-specific recommendations
    switch (session.role) {
      case 'patient':
        recommendations.push('Ensure you log out from shared or public devices');
        recommendations.push('Verify you can only access your own health information');
        break;
      case 'provider':
        recommendations.push('Follow HIPAA guidelines for patient data access');
        recommendations.push('Use strong authentication and log out between patients');
        recommendations.push('Ensure compliance with minimum necessary standard');
        break;
      case 'admin':
        recommendations.push('Monitor all user access and maintain audit logs');
        recommendations.push('Regularly review user permissions and access patterns');
        recommendations.push('Implement proper segregation of duties');
        break;
    }

    // General healthcare recommendations
    const sessionAge = Date.now() - session.createdAt.getTime();
    if (sessionAge > 2 * 60 * 60 * 1000) { // 2 hours
      recommendations.push('Consider periodic re-authentication for long sessions');
    }

    if (!session.permissions.includes('audit:logged')) {
      recommendations.push('Ensure all actions are properly audited');
    }

    return recommendations;
  }
};

/**
 * Session configuration presets for different healthcare environments
 */
export const HEALTHCARE_SESSION_PRESETS = {
  // High security for administrative access
  ADMIN: {
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
    idleTimeout: 15 * 60 * 1000, // 15 minutes
    refreshThreshold: 2 * 60 * 1000, // 2 minutes
    maxConcurrentSessions: 1,
    requireSecureContext: true,
    enableActivityTracking: true,
    enableDeviceFingerprinting: true,
    cookieOptions: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict' as const,
      path: '/'
    }
  },

  // Standard for healthcare providers
  PROVIDER: {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    maxConcurrentSessions: 2,
    requireSecureContext: true,
    enableActivityTracking: true,
    enableDeviceFingerprinting: true,
    cookieOptions: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict' as const,
      path: '/'
    }
  },

  // Patient portal access
  PATIENT: {
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
    idleTimeout: 60 * 60 * 1000, // 1 hour
    refreshThreshold: 10 * 60 * 1000, // 10 minutes
    maxConcurrentSessions: 3,
    requireSecureContext: true,
    enableActivityTracking: true,
    enableDeviceFingerprinting: false, // Less strict for patients
    cookieOptions: {
      secure: true,
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/'
    }
  },

  // Development environment
  DEVELOPMENT: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    idleTimeout: 2 * 60 * 60 * 1000, // 2 hours
    refreshThreshold: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 5,
    requireSecureContext: false,
    enableActivityTracking: false,
    enableDeviceFingerprinting: false,
    cookieOptions: {
      secure: false,
      httpOnly: false,
      sameSite: 'lax' as const,
      path: '/'
    }
  }
};

/**
 * Permission sets for healthcare roles
 */
export const HEALTHCARE_PERMISSIONS = {
  PATIENT: [
    'read:own_data',
    'write:own_data',
    'schedule:own_appointments',
    'view:own_records',
    'update:own_profile'
  ],

  PROVIDER: [
    'read:patient_data',
    'write:patient_data',
    'schedule:appointments',
    'view:records',
    'create:notes',
    'access:emergency',
    'view:reports'
  ],

  ADMIN: [
    'admin:all',
    'read:all_data',
    'write:all_data',
    'manage:users',
    'view:audit_logs',
    'configure:system',
    'access:emergency',
    'manage:permissions'
  ],

  SUPPORT: [
    'read:limited_data',
    'assist:patients',
    'schedule:appointments',
    'view:basic_reports',
    'access:help_desk'
  ]
};