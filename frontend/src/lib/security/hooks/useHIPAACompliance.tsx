/**
 * React Hooks for HIPAA Compliance
 * 
 * Provides React hooks for integrating HIPAA compliance features
 * into React components and workflows.
 */

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { 
  initializeHIPAASecurity, 
  getSecurityStatus, 
  validatePatientDataWorkflow,
  emergencyDataAccess,
  type HIPAAComplianceManager,
  type DataEncryptionService,
  type AuditTrailManager,
  type InputSanitizationService
} from '../index';

// Security Context Type
interface SecurityContextType {
  compliance: HIPAAComplianceManager | null;
  encryption: DataEncryptionService | null;
  audit: AuditTrailManager | null;
  sanitization: InputSanitizationService | null;
  isInitialized: boolean;
  initializationError: string | null;
}

// Create Security Context
const SecurityContext = createContext<SecurityContextType>({
  compliance: null,
  encryption: null,
  audit: null,
  sanitization: null,
  isInitialized: false,
  initializationError: null
});

// Security Provider Component
export function SecurityProvider({ 
  children, 
  config 
}: { 
  children: ReactNode;
  config?: Parameters<typeof initializeHIPAASecurity>[0];
}) {
  const [securityServices, setSecurityServices] = useState<SecurityContextType>({
    compliance: null,
    encryption: null,
    audit: null,
    sanitization: null,
    isInitialized: false,
    initializationError: null
  });

  useEffect(() => {
    initializeHIPAASecurity(config)
      .then((services) => {
        setSecurityServices({
          compliance: services.compliance,
          encryption: services.encryption,
          audit: services.audit,
          sanitization: services.sanitization,
          isInitialized: true,
          initializationError: null
        });
      })
      .catch((error) => {
        setSecurityServices(prev => ({
          ...prev,
          initializationError: error.message
        }));
      });
  }, []);

  return (
    <SecurityContext.Provider value={securityServices}>
      {children}
    </SecurityContext.Provider>
  );
}

/**
 * Hook to access HIPAA compliance services
 */
export function useHIPAACompliance() {
  const context = useContext(SecurityContext);
  
  if (!context.isInitialized && !context.initializationError) {
    throw new Error('HIPAA security services are still initializing');
  }
  
  if (context.initializationError) {
    throw new Error(`HIPAA security initialization failed: ${context.initializationError}`);
  }

  return context;
}

/**
 * Hook for secure data access validation
 */
export function useSecureDataAccess() {
  const { compliance, audit } = useHIPAACompliance();
  
  const validateAccess = useCallback(async (
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    context?: Record<string, any>
  ) => {
    if (!compliance || !audit) {
      throw new Error('Security services not available');
    }

    return await compliance.validateDataAccess(
      userId,
      resourceType,
      resourceId,
      action,
      context
    );
  }, [compliance, audit]);

  const logAccess = useCallback(async (
    userId: string,
    userRole: string,
    patientId: string,
    action: string,
    dataFields?: string[],
    justification?: string
  ) => {
    if (!audit) {
      throw new Error('Audit service not available');
    }

    return await audit.logPatientAccess(
      userId,
      userRole,
      patientId,
      action,
      dataFields,
      justification
    );
  }, [audit]);

  return {
    validateAccess,
    logAccess
  };
}

/**
 * Hook for data encryption/decryption
 */
export function useDataEncryption() {
  const { encryption } = useHIPAACompliance();
  
  const encryptSensitiveData = useCallback(async (
    data: any,
    fieldClassifications: Record<string, any>
  ) => {
    if (!encryption) {
      throw new Error('Encryption service not available');
    }

    // Use the PatientDataEncryption service
    const { patientDataEncryption } = await import('../hipaa/DataEncryption');
    return await patientDataEncryption.encryptPatientData(data);
  }, [encryption]);

  const decryptSensitiveData = useCallback(async (encryptedData: any) => {
    if (!encryption) {
      throw new Error('Encryption service not available');
    }

    const { patientDataEncryption } = await import('../hipaa/DataEncryption');
    return await patientDataEncryption.decryptPatientData(encryptedData);
  }, [encryption]);

  return {
    encryptSensitiveData,
    decryptSensitiveData
  };
}

/**
 * Hook for input sanitization
 */
export function useInputSanitization() {
  const { sanitization } = useHIPAACompliance();
  
  const sanitizeForm = useCallback((formData: Record<string, any>) => {
    if (!sanitization) {
      throw new Error('Sanitization service not available');
    }

    return sanitization.sanitizeHealthcareForm(formData);
  }, [sanitization]);

  const validatePatientData = useCallback((patientData: any) => {
    if (!sanitization) {
      throw new Error('Sanitization service not available');
    }

    return sanitization.validatePatientData(patientData);
  }, [sanitization]);

  const sanitizeInput = useCallback((input: string, context: any, ruleName?: string) => {
    if (!sanitization) {
      throw new Error('Sanitization service not available');
    }

    return sanitization.sanitize(input, context, ruleName);
  }, [sanitization]);

  return {
    sanitizeForm,
    validatePatientData,
    sanitizeInput
  };
}

/**
 * Hook for patient data workflow validation
 */
export function usePatientDataWorkflow() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateWorkflow = useCallback(async (
    patientData: any,
    userId: string,
    userRole: string,
    action: string
  ) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validatePatientDataWorkflow(
        patientData,
        userId,
        userRole,
        action
      );
      
      setIsValidating(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setValidationError(errorMessage);
      setIsValidating(false);
      throw error;
    }
  }, []);

  return {
    validateWorkflow,
    isValidating,
    validationError,
    clearError: () => setValidationError(null)
  };
}

/**
 * Hook for emergency access management
 */
export function useEmergencyAccess() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const requestEmergencyAccess = useCallback(async (
    userId: string,
    userRole: string,
    patientId: string,
    justification: string,
    approvedBy?: string
  ) => {
    setIsProcessing(true);
    setAccessError(null);

    try {
      const result = await emergencyDataAccess(
        userId,
        userRole,
        patientId,
        justification,
        approvedBy
      );
      
      setIsProcessing(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Emergency access failed';
      setAccessError(errorMessage);
      setIsProcessing(false);
      throw error;
    }
  }, []);

  return {
    requestEmergencyAccess,
    isProcessing,
    accessError,
    clearError: () => setAccessError(null)
  };
}

/**
 * Hook for security status monitoring
 */
export function useSecurityStatus() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const securityStatus = await getSecurityStatus();
      setStatus(securityStatus);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get security status';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    isLoading,
    error,
    refreshStatus,
    clearError: () => setError(null)
  };
}

/**
 * Hook for audit trail querying
 */
export function useAuditTrail() {
  const { audit } = useHIPAACompliance();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPatientAuditTrail = useCallback(async (
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    if (!audit) {
      throw new Error('Audit service not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const trail = await audit.getPatientAuditTrail(patientId, startDate, endDate);
      setIsLoading(false);
      return trail;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get audit trail';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [audit]);

  const getUserAuditTrail = useCallback(async (
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    if (!audit) {
      throw new Error('Audit service not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const trail = await audit.getUserAuditTrail(userId, startDate, endDate);
      setIsLoading(false);
      return trail;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get audit trail';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [audit]);

  const generateComplianceReport = useCallback(async (
    startDate: Date,
    endDate: Date,
    includeDetails: boolean = false
  ) => {
    if (!audit) {
      throw new Error('Audit service not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const report = await audit.generateComplianceReport(startDate, endDate, includeDetails);
      setIsLoading(false);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [audit]);

  return {
    getPatientAuditTrail,
    getUserAuditTrail,
    generateComplianceReport,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Hook to validate component props for HIPAA compliance
 */
export function useHIPAAValidation<T extends Record<string, any>>(
  props: T,
  sensitiveFields: (keyof T)[]
): {
  validatedProps: T;
  hasViolations: boolean;
  violations: string[];
} {
  const { sanitization } = useHIPAACompliance();
  const [validatedProps, setValidatedProps] = useState<T>(props);
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    if (!sanitization) return;

    const newViolations: string[] = [];
    const newProps = { ...props };

    // Check each sensitive field
    sensitiveFields.forEach(field => {
      const value = props[field];
      if (typeof value === 'string') {
        const threats = sanitization.detectThreats(value);
        if (threats.hasThreats) {
          threats.threats.forEach(threat => {
            newViolations.push(`${String(field)}: ${threat.description}`);
          });
        }

        // Sanitize the value
        const sanitized = sanitization.sanitize(
          value,
          'plain_text' as any // Use appropriate context
        );
        newProps[field] = sanitized.sanitizedValue as T[keyof T];
      }
    });

    setValidatedProps(newProps);
    setViolations(newViolations);
  }, [props, sensitiveFields, sanitization]);

  return {
    validatedProps,
    hasViolations: violations.length > 0,
    violations
  };
}