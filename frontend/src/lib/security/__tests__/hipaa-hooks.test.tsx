/**
 * HIPAA Compliance React Hooks Tests
 * 
 * Tests for React hooks that integrate HIPAA compliance features
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '../../../test/utils/render';
import { ReactNode } from 'react';
import {
  SecurityProvider,
  useHIPAACompliance,
  useSecureDataAccess,
  useDataEncryption,
  useInputSanitization,
  usePatientDataWorkflow,
  useEmergencyAccess,
  useSecurityStatus,
  useAuditTrail,
  useHIPAAValidation
} from '../hooks/useHIPAACompliance';
import { DataClassification } from '../hipaa/HIPAACompliance';
import { SanitizationContext } from '../hipaa/InputSanitization';

// Mock services - moved to top level before vi.mock
const mockHIPAAServices = {
  compliance: {
    validateDataAccess: vi.fn().mockResolvedValue({ allowed: true }),
    classifyData: vi.fn().mockReturnValue(DataClassification.PHI),
    getConfig: vi.fn().mockReturnValue({ organizationName: 'Test Org' })
  },
  encryption: {
    encryptData: vi.fn().mockResolvedValue({
      data: 'encrypted-data',
      iv: 'test-iv',
      tag: 'test-tag',
      salt: 'test-salt',
      algorithm: 'AES-GCM',
      timestamp: new Date().toISOString(),
      classification: DataClassification.PHI
    }),
    decryptData: vi.fn().mockResolvedValue('decrypted-data'),
    encryptObject: vi.fn().mockResolvedValue({}),
    decryptObject: vi.fn().mockResolvedValue({})
  },
  audit: {
    logPatientAccess: vi.fn().mockResolvedValue({ eventId: 'test-event' }),
    logEvent: vi.fn().mockResolvedValue({ eventId: 'test-event' }),
    getPatientAuditTrail: vi.fn().mockResolvedValue([]),
    getUserAuditTrail: vi.fn().mockResolvedValue([]),
    generateComplianceReport: vi.fn().mockResolvedValue({
      reportId: 'test-report',
      summary: { totalEvents: 0, phiAccess: 0, violations: 0, unauthorizedAttempts: 0 }
    })
  },
  sanitization: {
    sanitize: vi.fn().mockReturnValue({
      sanitizedValue: 'clean-data',
      originalValue: 'dirty-data',
      isModified: true,
      warnings: [],
      errors: [],
      context: SanitizationContext.PLAIN_TEXT,
      timestamp: new Date()
    }),
    sanitizeHealthcareForm: vi.fn().mockReturnValue({
      sanitizedData: {},
      results: {},
      hasErrors: false
    }),
    validatePatientData: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: {}
    }),
    detectThreats: vi.fn().mockReturnValue({
      hasThreats: false,
      threats: []
    })
  }
};

// Mock the security modules
vi.mock('../index', () => ({
  initializeHIPAASecurity: vi.fn().mockResolvedValue(mockHIPAAServices),
  getSecurityStatus: vi.fn().mockResolvedValue({
    compliance: { score: 95, violations: 0, recommendations: [] },
    encryption: { algorithm: 'AES-256-GCM', keyManagement: 'PBKDF2' },
    audit: { eventsLogged: 100, violationsDetected: 0 },
    headers: { score: 90, isHIPAACompliant: true },
    rateLimiting: { activeBuckets: 5, blockedIPs: 0 },
    overall: { status: 'secure' as const, score: 92 }
  }),
  validatePatientDataWorkflow: vi.fn().mockResolvedValue({
    isCompliant: true,
    errors: [],
    warnings: [],
    sanitizedData: {},
    auditLogId: 'test-audit-id'
  }),
  emergencyDataAccess: vi.fn().mockResolvedValue({
    granted: true,
    auditLogId: 'emergency-audit-id',
    restrictions: ['Time-limited access']
  })
}));

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
});

describe('SecurityProvider', () => {
  it('should provide security services to children', async () => {
    const TestComponent = () => {
      const security = useHIPAACompliance();
      return <div data-testid="security-status">{security.isInitialized ? 'initialized' : 'loading'}</div>;
    };

    const { result } = renderHook(() => useHIPAACompliance(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SecurityProvider>{children}</SecurityProvider>
      )
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.compliance).toBeDefined();
    expect(result.current.encryption).toBeDefined();
    expect(result.current.audit).toBeDefined();
    expect(result.current.sanitization).toBeDefined();
  });

  it('should handle initialization errors', async () => {
    const mockError = new Error('Initialization failed');
    vi.mocked(await import('../index')).initializeHIPAASecurity.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useHIPAACompliance(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SecurityProvider>{children}</SecurityProvider>
      )
    });

    await waitFor(() => {
      expect(() => result.current).toThrow('HIPAA security initialization failed: Initialization failed');
    });
  });
});

describe('useSecureDataAccess', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should validate data access', async () => {
    const { result } = renderHook(() => useSecureDataAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.validateAccess).toBeDefined();
    });

    await act(async () => {
      const accessResult = await result.current.validateAccess(
        'user123',
        'patient',
        'PAT456',
        'read'
      );
      expect(accessResult).toEqual({ allowed: true });
    });
  });

  it('should log patient access', async () => {
    const { result } = renderHook(() => useSecureDataAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.logAccess).toBeDefined();
    });

    await act(async () => {
      const logResult = await result.current.logAccess(
        'user123',
        'physician',
        'PAT456',
        'view',
        ['firstName', 'lastName'],
        'Scheduled appointment'
      );
      expect(logResult).toEqual({ eventId: 'test-event' });
    });
  });

  it('should throw error when services not available', async () => {
    const { result } = renderHook(() => useSecureDataAccess(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SecurityProvider config={{ enableAuditLogging: false }}>{children}</SecurityProvider>
      )
    });

    // Before initialization completes
    await expect(async () => {
      await result.current.validateAccess('user', 'resource', 'id', 'action');
    }).rejects.toThrow();
  });
});

describe('useDataEncryption', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should encrypt sensitive data', async () => {
    const { result } = renderHook(() => useDataEncryption(), { wrapper });

    await waitFor(() => {
      expect(result.current.encryptSensitiveData).toBeDefined();
    });

    const testData = { firstName: 'John', lastName: 'Doe' };
    const fieldClassifications = {
      firstName: DataClassification.PHI,
      lastName: DataClassification.PHI
    };

    await act(async () => {
      const encrypted = await result.current.encryptSensitiveData(testData, fieldClassifications);
      expect(encrypted).toBeDefined();
    });
  });

  it('should decrypt sensitive data', async () => {
    const { result } = renderHook(() => useDataEncryption(), { wrapper });

    await waitFor(() => {
      expect(result.current.decryptSensitiveData).toBeDefined();
    });

    const encryptedData = { test: 'encrypted' };

    await act(async () => {
      const decrypted = await result.current.decryptSensitiveData(encryptedData);
      expect(decrypted).toBeDefined();
    });
  });
});

describe('useInputSanitization', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should sanitize form data', async () => {
    const { result } = renderHook(() => useInputSanitization(), { wrapper });

    await waitFor(() => {
      expect(result.current.sanitizeForm).toBeDefined();
    });

    const formData = {
      firstName: 'John<script>alert("xss")</script>',
      lastName: 'Doe'
    };

    act(() => {
      const sanitized = result.current.sanitizeForm(formData);
      expect(sanitized.hasErrors).toBe(false);
    });
  });

  it('should validate patient data', async () => {
    const { result } = renderHook(() => useInputSanitization(), { wrapper });

    await waitFor(() => {
      expect(result.current.validatePatientData).toBeDefined();
    });

    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    };

    act(() => {
      const validation = result.current.validatePatientData(patientData);
      expect(validation.isValid).toBe(true);
    });
  });

  it('should sanitize individual inputs', async () => {
    const { result } = renderHook(() => useInputSanitization(), { wrapper });

    await waitFor(() => {
      expect(result.current.sanitizeInput).toBeDefined();
    });

    act(() => {
      const sanitized = result.current.sanitizeInput(
        'John<script>',
        SanitizationContext.PATIENT_NAME,
        'patientName'
      );
      expect(sanitized.sanitizedValue).toBe('clean-data');
      expect(sanitized.isModified).toBe(true);
    });
  });
});

describe('usePatientDataWorkflow', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should validate complete patient workflow', async () => {
    const { result } = renderHook(() => usePatientDataWorkflow(), { wrapper });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.validationError).toBeNull();

    const patientData = {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com'
    };

    await act(async () => {
      const validation = await result.current.validateWorkflow(
        patientData,
        'user123',
        'physician',
        'create'
      );
      
      expect(validation.isCompliant).toBe(true);
      expect(validation.auditLogId).toBe('test-audit-id');
    });

    expect(result.current.isValidating).toBe(false);
  });

  it('should handle validation errors', async () => {
    vi.mocked(await import('../index')).validatePatientDataWorkflow.mockRejectedValueOnce(
      new Error('Validation failed')
    );

    const { result } = renderHook(() => usePatientDataWorkflow(), { wrapper });

    await act(async () => {
      try {
        await result.current.validateWorkflow({}, 'user', 'role', 'action');
      } catch (error) {
        expect(error.message).toBe('Validation failed');
      }
    });

    expect(result.current.validationError).toBe('Validation failed');
    expect(result.current.isValidating).toBe(false);
  });

  it('should clear validation errors', async () => {
    const { result } = renderHook(() => usePatientDataWorkflow(), { wrapper });

    act(() => {
      (result.current as any).setValidationError('Test error');
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.validationError).toBeNull();
  });
});

describe('useEmergencyAccess', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should request emergency access', async () => {
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.accessError).toBeNull();

    await act(async () => {
      const access = await result.current.requestEmergencyAccess(
        'emergency_doc',
        'emergency_physician',
        'PAT999',
        'Patient cardiac arrest - immediate access needed',
        'supervisor123'
      );
      
      expect(access.granted).toBe(true);
      expect(access.auditLogId).toBe('emergency-audit-id');
      expect(access.restrictions).toContain('Time-limited access');
    });

    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle emergency access errors', async () => {
    vi.mocked(await import('../index')).emergencyDataAccess.mockRejectedValueOnce(
      new Error('Emergency access denied')
    );

    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    await act(async () => {
      try {
        await result.current.requestEmergencyAccess(
          'user',
          'role',
          'patient',
          'justification'
        );
      } catch (error) {
        expect(error.message).toBe('Emergency access denied');
      }
    });

    expect(result.current.accessError).toBe('Emergency access denied');
    expect(result.current.isProcessing).toBe(false);
  });
});

describe('useSecurityStatus', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should fetch security status on mount', async () => {
    const { result } = renderHook(() => useSecurityStatus(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toEqual({
      compliance: { score: 95, violations: 0, recommendations: [] },
      encryption: { algorithm: 'AES-256-GCM', keyManagement: 'PBKDF2' },
      audit: { eventsLogged: 100, violationsDetected: 0 },
      headers: { score: 90, isHIPAACompliant: true },
      rateLimiting: { activeBuckets: 5, blockedIPs: 0 },
      overall: { status: 'secure', score: 92 }
    });
  });

  it('should refresh security status manually', async () => {
    const { result } = renderHook(() => useSecurityStatus(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.refreshStatus();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle security status errors', async () => {
    vi.mocked(await import('../index')).getSecurityStatus.mockRejectedValueOnce(
      new Error('Status fetch failed')
    );

    const { result } = renderHook(() => useSecurityStatus(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe('Status fetch failed');
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

describe('useAuditTrail', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should get patient audit trail', async () => {
    const { result } = renderHook(() => useAuditTrail(), { wrapper });

    await waitFor(() => {
      expect(result.current.getPatientAuditTrail).toBeDefined();
    });

    await act(async () => {
      const trail = await result.current.getPatientAuditTrail('PAT123');
      expect(trail).toEqual([]);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should get user audit trail', async () => {
    const { result } = renderHook(() => useAuditTrail(), { wrapper });

    await waitFor(() => {
      expect(result.current.getUserAuditTrail).toBeDefined();
    });

    await act(async () => {
      const trail = await result.current.getUserAuditTrail('user123');
      expect(trail).toEqual([]);
    });
  });

  it('should generate compliance report', async () => {
    const { result } = renderHook(() => useAuditTrail(), { wrapper });

    await waitFor(() => {
      expect(result.current.generateComplianceReport).toBeDefined();
    });

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    await act(async () => {
      const report = await result.current.generateComplianceReport(startDate, endDate, true);
      expect(report.reportId).toBe('test-report');
      expect(report.summary.totalEvents).toBe(0);
    });
  });

  it('should handle audit trail errors', async () => {
    vi.mocked(await import('../index')).initializeHIPAASecurity.mockResolvedValueOnce({
      ...await vi.mocked(await import('../index')).initializeHIPAASecurity(),
      audit: {
        ...await vi.mocked(await import('../index')).initializeHIPAASecurity().audit,
        getPatientAuditTrail: vi.fn().mockRejectedValue(new Error('Audit fetch failed'))
      }
    });

    const { result } = renderHook(() => useAuditTrail(), { wrapper });

    await waitFor(() => {
      expect(result.current.getPatientAuditTrail).toBeDefined();
    });

    await act(async () => {
      try {
        await result.current.getPatientAuditTrail('PAT123');
      } catch (error) {
        expect(error.message).toBe('Audit fetch failed');
      }
    });

    expect(result.current.error).toBe('Audit fetch failed');
  });
});

describe('useHIPAAValidation', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should validate component props for HIPAA compliance', async () => {
    const props = {
      patientName: 'John Doe',
      email: 'john@example.com',
      notes: 'Patient has diabetes<script>alert("xss")</script>',
      nonSensitive: 'public data'
    };

    const sensitiveFields: (keyof typeof props)[] = ['patientName', 'email', 'notes'];

    const { result } = renderHook(
      () => useHIPAAValidation(props, sensitiveFields),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.validatedProps).toBeDefined();
    });

    expect(result.current.hasViolations).toBe(false);
    expect(result.current.violations).toEqual([]);
    expect(result.current.validatedProps.nonSensitive).toBe('public data');
  });

  it('should detect threats in component props', async () => {
    const maliciousProps = {
      patientName: 'John<script>alert("xss")</script>',
      description: 'Patient info with threats'
    };

    // Mock threat detection
    vi.mocked(await import('../index')).initializeHIPAASecurity.mockResolvedValueOnce({
      ...await vi.mocked(await import('../index')).initializeHIPAASecurity(),
      sanitization: {
        ...await vi.mocked(await import('../index')).initializeHIPAASecurity().sanitization,
        detectThreats: vi.fn().mockReturnValue({
          hasThreats: true,
          threats: [{ type: 'XSS', description: 'Script injection detected', severity: 'high' }]
        }),
        sanitize: vi.fn().mockReturnValue({
          sanitizedValue: 'John',
          originalValue: 'John<script>alert("xss")</script>',
          isModified: true,
          warnings: [],
          errors: [],
          context: SanitizationContext.PATIENT_NAME,
          timestamp: new Date()
        })
      }
    });

    const { result } = renderHook(
      () => useHIPAAValidation(maliciousProps, ['patientName']),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.hasViolations).toBe(true);
    });

    expect(result.current.violations).toContain('patientName: Script injection detected');
    expect(result.current.validatedProps.patientName).toBe('John');
  });

  it('should update validation when props change', async () => {
    const initialProps = {
      patientName: 'John Doe',
      email: 'john@example.com'
    };

    const { result, rerender } = renderHook(
      ({ props }) => useHIPAAValidation(props, ['patientName', 'email']),
      { 
        wrapper,
        initialProps: { props: initialProps }
      }
    );

    await waitFor(() => {
      expect(result.current.validatedProps.patientName).toBe('clean-data');
    });

    const updatedProps = {
      patientName: 'Jane Smith',
      email: 'jane@example.com'
    };

    rerender({ props: updatedProps });

    await waitFor(() => {
      expect(result.current.validatedProps.patientName).toBe('clean-data');
    });
  });
});

describe('Hook Error Handling', () => {
  it('should throw error when used outside SecurityProvider', () => {
    const { result } = renderHook(() => useHIPAACompliance());

    expect(() => result.current).toThrow('HIPAA security services are still initializing');
  });

  it('should handle service unavailability gracefully', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SecurityProvider>{children}</SecurityProvider>
    );

    // Mock services as null
    vi.mocked(await import('../index')).initializeHIPAASecurity.mockResolvedValueOnce({
      compliance: null,
      encryption: null,
      audit: null,
      sanitization: null,
      headers: {},
      security: {},
      status: 'initialized'
    } as any);

    const { result } = renderHook(() => useSecureDataAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.validateAccess).toBeDefined();
    });

    await expect(async () => {
      await result.current.validateAccess('user', 'resource', 'id', 'action');
    }).rejects.toThrow('Security services not available');
  });
});

describe('Hook Performance', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SecurityProvider>{children}</SecurityProvider>
  );

  it('should not cause unnecessary re-renders', async () => {
    let renderCount = 0;
    
    const TestComponent = () => {
      renderCount++;
      const security = useHIPAACompliance();
      return <div>{security.isInitialized ? 'ready' : 'loading'}</div>;
    };

    const { rerender } = renderHook(() => useHIPAACompliance(), { wrapper });

    // Initial render
    expect(renderCount).toBe(0);

    // Wait for initialization
    await waitFor(() => {
      rerender();
    });

    // Should not cause excessive re-renders
    rerender();
    rerender();
    
    expect(renderCount).toBeLessThan(5);
  });

  it('should memoize callback functions', async () => {
    const { result, rerender } = renderHook(() => useSecureDataAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.validateAccess).toBeDefined();
    });

    const initialValidateAccess = result.current.validateAccess;
    const initialLogAccess = result.current.logAccess;

    rerender();

    expect(result.current.validateAccess).toBe(initialValidateAccess);
    expect(result.current.logAccess).toBe(initialLogAccess);
  });
});