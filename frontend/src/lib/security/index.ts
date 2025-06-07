/**
 * HIPAA Security Framework - Main Export
 * 
 * This module provides a comprehensive security framework for healthcare applications
 * that need to comply with HIPAA requirements. It includes:
 * 
 * - Data classification and encryption
 * - Audit trails and compliance monitoring
 * - Input sanitization and validation
 * - Security headers configuration
 * - Rate limiting and CSRF protection
 * 
 * Usage:
 * ```typescript
 * import { initializeHIPAASecurity, hipaaCompliance } from '@/lib/security';
 * 
 * // Initialize security framework
 * await initializeHIPAASecurity();
 * 
 * // Use throughout your application
 * const result = await hipaaCompliance.validateDataAccess(userId, 'patient', patientId, 'read');
 * ```
 */

// Core HIPAA compliance framework
export {
  HIPAAComplianceManager,
  hipaaCompliance,
  DataClassification,
  AccessLevel,
  AuditEventType,
  PHIDataTypes,
  DEFAULT_HIPAA_CONFIG,
  type HIPAAConfig,
  type PHIData,
  type UserRole,
  type AuditLogEntry,
  type ComplianceViolation,
  type ComplianceReport
} from './hipaa/HIPAACompliance';

// Data encryption services
export {
  DataEncryptionService,
  DefaultKeyManager,
  PatientDataEncryption,
  dataEncryption,
  patientDataEncryption,
  keyManager,
  type EncryptionConfig,
  type EncryptedData,
  type KeyManager,
  DEFAULT_ENCRYPTION_CONFIG
} from './hipaa/DataEncryption';

// Audit trail system
export {
  AuditTrailManager,
  HealthcareAuditEventType,
  auditTrail,
  auditStore,
  RiskAssessor,
  ViolationDetector,
  InMemoryAuditStore,
  type HealthcareAuditLogEntry,
  type AuditContext,
  type AuditStatistics,
  type AuditStore
} from './hipaa/AuditTrail';

// Input sanitization and validation
export {
  InputSanitizationService,
  HealthcareDataValidator,
  inputSanitization,
  healthcareValidator,
  SanitizationContext,
  HealthcarePatterns,
  HealthcareValidationRules,
  type ValidationRule,
  type SanitizationResult
} from './hipaa/InputSanitization';

// Security headers configuration
export {
  SecurityHeadersManager,
  HIPAASecurityHeaders,
  securityHeaders,
  hipaaSecurityHeaders,
  configureSecureFetch,
  injectSecurityMetaTags,
  type SecurityHeadersConfig,
  type ContentSecurityPolicyConfig,
  type HSTSConfig,
  type FrameOptionsConfig,
  DEFAULT_HIPAA_SECURITY_CONFIG
} from './hipaa/SecurityHeaders';

// Rate limiting and CSRF protection
export {
  RateLimitingService,
  CSRFProtectionService,
  SecurityMiddleware,
  rateLimiter,
  csrfProtection,
  securityMiddleware,
  secureFetch,
  enableGlobalSecurity,
  type RateLimitConfig,
  type CSRFConfig,
  DEFAULT_HEALTHCARE_RATE_LIMIT_CONFIG,
  DEFAULT_CSRF_CONFIG
} from './hipaa/RateLimitingCSRF';

/**
 * Initialize the complete HIPAA security framework
 * 
 * This function sets up all security components and should be called
 * during application initialization.
 */
export async function initializeHIPAASecurity(config?: {
  organizationName?: string;
  facilityId?: string;
  enableGlobalFetch?: boolean;
  enableSecurityHeaders?: boolean;
  enableAuditLogging?: boolean;
  customCSPDomains?: string[];
}): Promise<{
  compliance: any;
  encryption: any;
  audit: any;
  sanitization: any;
  headers: any;
  security: any;
  status: string;
}> {
  try {
    console.log('🔒 Initializing HIPAA Security Framework...');

    // Import all services
    const { hipaaCompliance } = await import('./hipaa/HIPAACompliance');
    const { dataEncryption } = await import('./hipaa/DataEncryption');
    const { auditTrail } = await import('./hipaa/AuditTrail');
    const { inputSanitization } = await import('./hipaa/InputSanitization');
    const { hipaaSecurityHeaders } = await import('./hipaa/SecurityHeaders');
    const { securityMiddleware, enableGlobalSecurity } = await import('./hipaa/RateLimitingCSRF');

    // Configure custom domains for CSP if provided
    if (config?.customCSPDomains) {
      hipaaSecurityHeaders.updateConfig({
        csp: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'", ...config.customCSPDomains],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          workerSrc: ["'self'"],
          childSrc: ["'self'"],
          manifestSrc: ["'self'"],
          upgradeInsecureRequests: true
        }
      });
    }

    // Enable global security features if requested
    if (config?.enableGlobalFetch !== false) {
      enableGlobalSecurity();
      console.log('✅ Global secure fetch enabled');
    }

    if (config?.enableSecurityHeaders !== false && typeof document !== 'undefined') {
      const { injectSecurityMetaTags } = await import('./hipaa/SecurityHeaders');
      injectSecurityMetaTags();
      console.log('✅ Security headers injected');
    }

    // Log initialization
    if (config?.enableAuditLogging !== false) {
      const { AuditEventType } = await import('./hipaa/HIPAACompliance');
      await auditTrail.logEvent({
        userId: 'system',
        userRole: 'system',
        eventType: AuditEventType.CONFIGURATION_CHANGE,
        resourceType: 'security_framework',
        action: 'initialize',
        outcome: 'success',
        details: {
          organizationName: config?.organizationName,
          facilityId: config?.facilityId,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Security initialization logged');
    }

    console.log('🎉 HIPAA Security Framework initialized successfully');

    return {
      compliance: hipaaCompliance,
      encryption: dataEncryption,
      audit: auditTrail,
      sanitization: inputSanitization,
      headers: hipaaSecurityHeaders,
      security: securityMiddleware,
      status: 'initialized'
    };
  } catch (error) {
    console.error('❌ Failed to initialize HIPAA Security Framework:', error);
    throw new Error(`Security framework initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get overall security status and compliance report
 */
export async function getSecurityStatus(): Promise<{
  compliance: {
    score: number;
    violations: number;
    recommendations: string[];
  };
  encryption: {
    algorithm: string;
    keyManagement: string;
  };
  audit: {
    eventsLogged: number;
    violationsDetected: number;
  };
  headers: {
    score: number;
    isHIPAACompliant: boolean;
  };
  rateLimiting: {
    activeBuckets: number;
    blockedIPs: number;
  };
  overall: {
    status: 'secure' | 'warning' | 'critical';
    score: number;
  };
}> {
  try {
    // Import services dynamically to avoid circular dependencies
    const { hipaaCompliance } = await import('./hipaa/HIPAACompliance');
    const { auditTrail } = await import('./hipaa/AuditTrail');
    const { hipaaSecurityHeaders } = await import('./hipaa/SecurityHeaders');
    const { rateLimiter } = await import('./hipaa/RateLimitingCSRF');

    // Generate compliance report
    const complianceReport = await hipaaCompliance.generateComplianceReport(
      new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      new Date()
    );

    // Get headers compliance
    const headersReport = hipaaSecurityHeaders.validateHIPAACompliance();

    // Get rate limiting stats
    const rateLimitStats = rateLimiter.getStatistics();

    // Calculate overall score
    const scores = [
      headersReport.score,
      Math.max(0, 100 - complianceReport.violations.length * 10), // Compliance score
      Math.max(0, 100 - rateLimitStats.suspiciousActivityDetected * 20) // Security score
    ];
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Determine overall status
    let overallStatus: 'secure' | 'warning' | 'critical' = 'secure';
    if (overallScore < 50) overallStatus = 'critical';
    else if (overallScore < 80) overallStatus = 'warning';

    return {
      compliance: {
        score: Math.max(0, 100 - complianceReport.violations.length * 10),
        violations: complianceReport.violations.length,
        recommendations: complianceReport.recommendations
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keyManagement: 'PBKDF2 with secure key derivation'
      },
      audit: {
        eventsLogged: complianceReport.summary.totalEvents,
        violationsDetected: complianceReport.summary.violations
      },
      headers: {
        score: headersReport.score,
        isHIPAACompliant: headersReport.isHIPAACompliant
      },
      rateLimiting: {
        activeBuckets: rateLimitStats.totalBuckets,
        blockedIPs: rateLimitStats.blockedKeys
      },
      overall: {
        status: overallStatus,
        score: Math.round(overallScore)
      }
    };
  } catch (error) {
    console.error('Failed to get security status:', error);
    return {
      compliance: { score: 0, violations: 1, recommendations: ['Fix security status reporting'] },
      encryption: { algorithm: 'unknown', keyManagement: 'unknown' },
      audit: { eventsLogged: 0, violationsDetected: 1 },
      headers: { score: 0, isHIPAACompliant: false },
      rateLimiting: { activeBuckets: 0, blockedIPs: 0 },
      overall: { status: 'critical', score: 0 }
    };
  }
}

/**
 * Validate a complete patient data workflow for HIPAA compliance
 */
export async function validatePatientDataWorkflow(
  patientData: any,
  userId: string,
  userRole: string,
  action: string
): Promise<{
  isCompliant: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
  auditLogId?: string;
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedData: any = null;
  let auditLogId: string | undefined;

  try {
    console.log('🔍 Debug: Starting workflow validation for:', { userId, userRole, action });
    
    // 1. Validate data access permissions
    const { hipaaCompliance } = await import('./hipaa/HIPAACompliance');
    const accessResult = await hipaaCompliance.validateDataAccess(
      userId,
      'patient',
      patientData.patientId || 'unknown',
      action
    );

    console.log('🔍 Debug: Access validation result:', accessResult);

    if (!accessResult.allowed) {
      errors.push(`Access denied: ${accessResult.reason}`);
      console.log('❌ Debug: Access denied, returning early');
      return { isCompliant: false, errors, warnings };
    }

    // 2. Sanitize and validate input data
    const { inputSanitization } = await import('./hipaa/InputSanitization');
    const sanitizationResult = inputSanitization.sanitizeHealthcareForm(patientData);
    
    console.log('🔍 Debug: Sanitization result:', { 
      hasErrors: sanitizationResult.hasErrors,
      resultKeys: Object.keys(sanitizationResult.results || {}),
      sanitizedDataKeys: Object.keys(sanitizationResult.sanitizedData || {})
    });
    
    if (sanitizationResult.hasErrors) {
      Object.values(sanitizationResult.results).forEach(result => {
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      });
      console.log('❌ Debug: Sanitization errors found:', errors);
    }

    sanitizedData = sanitizationResult.sanitizedData;

    // 3. Log the data access
    const { auditTrail } = await import('./hipaa/AuditTrail');
    const auditEntry = await auditTrail.logPatientAccess(
      userId,
      userRole,
      patientData.patientId || 'unknown',
      action,
      Object.keys(patientData),
      `Workflow validation for ${action}`
    );

    auditLogId = (auditEntry as any).eventId;

    // 4. Additional validation for specific actions
    if (action === 'create' || action === 'update') {
      const { healthcareValidator } = await import('./hipaa/InputSanitization');
      const validationResult = healthcareValidator.validatePatient(sanitizedData);
      
      if (!validationResult.success) {
        validationResult.error.issues.forEach(issue => {
          errors.push(`Validation error: ${issue.path.join('.')} - ${issue.message}`);
        });
      }
    }

    const isCompliant = errors.length === 0;

    console.log('🔍 Debug: Final validation result:', {
      isCompliant,
      errorCount: errors.length,
      warningCount: warnings.length,
      hasAuditId: !!auditLogId,
      hasSanitizedData: !!sanitizedData
    });

    return {
      isCompliant,
      errors,
      warnings,
      sanitizedData: isCompliant ? sanitizedData : undefined,
      auditLogId
    };
  } catch (error) {
    errors.push(`Workflow validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return { isCompliant: false, errors, warnings };
  }
}

/**
 * Emergency access function for critical situations
 * 
 * This function bypasses some security restrictions but logs everything
 * for compliance review.
 */
export async function emergencyDataAccess(
  userId: string,
  userRole: string,
  patientId: string,
  justification: string,
  approvedBy?: string
): Promise<{
  granted: boolean;
  auditLogId: string;
  restrictions: string[];
}> {
  const restrictions: string[] = [
    'Emergency access is time-limited (1 hour)',
    'All actions are being monitored',
    'This access must be reviewed by compliance team',
    'Additional documentation may be required'
  ];

  try {
    const { auditTrail } = await import('./hipaa/AuditTrail');
    
    // Log emergency access
    const { AuditEventType } = await import('./hipaa/HIPAACompliance');
    const auditEntry = await auditTrail.logEvent({
      userId,
      userRole,
      eventType: AuditEventType.EMERGENCY_ACCESS,
      resourceType: 'patient',
      resourceId: patientId,
      action: 'emergency_access_granted',
      outcome: 'success',
      context: {
        patientId,
        emergencyAccess: true,
        businessJustification: justification,
        approvedBy: approvedBy || 'system'
      },
      requiresReview: true,
      riskScore: 90 // High risk score for manual review
    });

    return {
      granted: true,
      auditLogId: auditEntry.eventId,
      restrictions
    };
  } catch (error) {
    console.error('Emergency access logging failed:', error);
    
    return {
      granted: false,
      auditLogId: 'failed',
      restrictions: ['Emergency access denied due to logging failure']
    };
  }
}

// Export default initialization function
export default initializeHIPAASecurity;