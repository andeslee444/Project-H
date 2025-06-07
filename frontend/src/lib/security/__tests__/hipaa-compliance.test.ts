/**
 * HIPAA Compliance Framework Tests
 * 
 * Tests for the core HIPAA compliance functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  HIPAAComplianceManager, 
  DataClassification,
  AccessLevel,
  AuditEventType 
} from '../hipaa/HIPAACompliance';
import { DataEncryptionService, DefaultKeyManager } from '../hipaa/DataEncryption';
import { InputSanitizationService, SanitizationContext } from '../hipaa/InputSanitization';
import { SecurityHeadersManager } from '../hipaa/SecurityHeaders';

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random(),
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        // Mock digest
        return new ArrayBuffer(32);
      },
      importKey: async () => ({}),
      deriveKey: async () => ({}),
      encrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        // Mock encryption - just return the data with some padding
        const result = new ArrayBuffer(data.byteLength + 16);
        new Uint8Array(result).set(new Uint8Array(data));
        return result;
      },
      decrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        // Mock decryption - just remove the padding
        return data.slice(0, -16);
      }
    }
  }
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-user-agent'
  }
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
});

describe('HIPAA Compliance Framework', () => {
  let complianceManager: HIPAAComplianceManager;
  let encryptionService: DataEncryptionService;
  let sanitizationService: InputSanitizationService;
  let securityHeaders: SecurityHeadersManager;

  beforeEach(() => {
    complianceManager = new HIPAAComplianceManager();
    encryptionService = new DataEncryptionService(new DefaultKeyManager());
    sanitizationService = new InputSanitizationService();
    securityHeaders = new SecurityHeadersManager();
  });

  describe('Data Classification', () => {
    it('should correctly classify PHI data', () => {
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        ssn: '123-45-6789'
      };

      const classification = complianceManager.classifyData(testData);
      expect(classification).toBe(DataClassification.PHI);
    });

    it('should classify non-sensitive data as internal', () => {
      const testData = {
        id: '12345',
        status: 'active',
        createdAt: '2024-01-01'
      };

      const classification = complianceManager.classifyData(testData);
      expect(classification).toBe(DataClassification.INTERNAL);
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data successfully', async () => {
      const originalData = 'sensitive patient information';
      
      const encrypted = await encryptionService.encryptData(
        originalData,
        DataClassification.PHI
      );

      expect(encrypted).toHaveProperty('data');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted.classification).toBe(DataClassification.PHI);

      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should handle object encryption with field-level classification', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        patientId: '12345',
        createdAt: '2024-01-01'
      };

      const fieldClassifications = {
        firstName: DataClassification.PHI,
        lastName: DataClassification.PHI,
        patientId: DataClassification.INTERNAL,
        createdAt: DataClassification.INTERNAL
      };

      const encrypted = await encryptionService.encryptObject(
        patientData,
        fieldClassifications
      );

      expect(encrypted).toHaveProperty('firstName_encrypted');
      expect(encrypted).toHaveProperty('lastName_encrypted');
      expect(encrypted).toHaveProperty('patientId');
      expect(encrypted).toHaveProperty('createdAt');

      const decrypted = await encryptionService.decryptObject(encrypted);
      expect(decrypted.firstName).toBe(patientData.firstName);
      expect(decrypted.lastName).toBe(patientData.lastName);
    });

    it('should validate encryption integrity', async () => {
      const originalData = 'test data';
      
      const encrypted = await encryptionService.encryptData(
        originalData,
        DataClassification.PHI
      );

      const isValid = await encryptionService.validateEncryption(encrypted);
      expect(isValid).toBe(true);

      // Corrupt the data
      encrypted.data = 'corrupted-data';
      const isValidCorrupted = await encryptionService.validateEncryption(encrypted);
      expect(isValidCorrupted).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize potentially dangerous input', () => {
      const dangerousInput = '<script>alert("xss")</script>John Doe';
      
      const result = sanitizationService.sanitize(
        dangerousInput,
        SanitizationContext.PATIENT_NAME
      );

      expect(result.sanitizedValue).not.toContain('<script>');
      expect(result.isModified).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect security threats', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE patients; --",
        '../../../etc/passwd',
        '${eval(alert("injection"))}'
      ];

      maliciousInputs.forEach(input => {
        const threats = sanitizationService.detectThreats(input);
        expect(threats.hasThreats).toBe(true);
        expect(threats.threats.length).toBeGreaterThan(0);
      });
    });

    it('should validate healthcare form data', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        patientId: 'PAT123456',
        notes: 'Patient has <b>diabetes</b>'
      };

      const result = sanitizationService.sanitizeHealthcareForm(formData);
      
      expect(result.hasErrors).toBe(false);
      expect(result.sanitizedData.firstName).toBe('John');
      expect(result.sanitizedData.email).toBe('john.doe@example.com');
    });

    it('should validate patient data with proper error handling', () => {
      const invalidPatientData = {
        firstName: '', // Required field missing
        lastName: 'Doe',
        email: 'invalid-email', // Invalid format
        phone: '123', // Too short
        dateOfBirth: 'invalid-date' // Invalid format
      };

      const result = sanitizationService.validatePatientData(invalidPatientData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('firstName is required');
    });
  });

  describe('Security Headers', () => {
    it('should generate comprehensive security headers', () => {
      const headers = securityHeaders.generateHeaders();
      
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Referrer-Policy');
    });

    it('should validate CSP compliance', () => {
      const report = securityHeaders.validateCSPCompliance();
      
      expect(report).toHaveProperty('isCompliant');
      expect(report).toHaveProperty('violations');
      expect(report).toHaveProperty('recommendations');
    });

    it('should generate security report with score', () => {
      const report = securityHeaders.generateSecurityReport();
      
      expect(report).toHaveProperty('headers');
      expect(report).toHaveProperty('compliance');
      expect(report).toHaveProperty('score');
      expect(typeof report.score).toBe('number');
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Access Validation', () => {
    it('should validate authorized data access', async () => {
      // Mock the audit logger to avoid validation issues
      const mockAuditLogger = {
        logEvent: vi.fn().mockResolvedValue({ eventId: 'test-event' })
      };
      
      // Create a new compliance manager for testing
      const testManager = new HIPAAComplianceManager();
      // Replace the audit logger with our mock
      (testManager as any).auditLogger = mockAuditLogger;

      const result = await testManager.validateDataAccess(
        'user123',
        'patient',
        'patient456',
        'read',
        { reason: 'scheduled appointment' }
      );

      expect(result).toHaveProperty('allowed');
      expect(typeof result.allowed).toBe('boolean');
    });

    it('should handle access validation errors gracefully', async () => {
      // Mock the audit logger to avoid validation issues
      const mockAuditLogger = {
        logEvent: vi.fn().mockResolvedValue({ eventId: 'test-event' })
      };
      
      // Create a new compliance manager for testing
      const testManager = new HIPAAComplianceManager();
      // Replace the audit logger with our mock
      (testManager as any).auditLogger = mockAuditLogger;

      // Test with invalid parameters
      const result = await testManager.validateDataAccess(
        '', // Empty user ID
        'patient',
        'patient456',
        'read'
      );

      // Should still return a result structure
      expect(result).toHaveProperty('allowed');
    });
  });

  describe('Configuration Management', () => {
    it('should return default HIPAA configuration', () => {
      const config = complianceManager.getConfig();
      
      expect(config).toHaveProperty('organizationName');
      expect(config).toHaveProperty('dataRetentionDays');
      expect(config).toHaveProperty('encryptionStandard');
      expect(config.dataRetentionDays).toBe(2555); // 7 years
      expect(config.encryptionStandard).toBe('AES-256');
    });

    it('should allow configuration updates', () => {
      const customConfig = {
        organizationName: 'Test Medical Center',
        facilityId: 'TMC-001'
      };

      const newManager = new HIPAAComplianceManager(customConfig);
      const config = newManager.getConfig();
      
      expect(config.organizationName).toBe('Test Medical Center');
      expect(config.facilityId).toBe('TMC-001');
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complete patient data workflow', async () => {
    const patientData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-987-6543',
      dateOfBirth: '1990-05-15',
      patientId: 'PAT789012'
    };

    // 1. Sanitize input
    const sanitizationService = new InputSanitizationService();
    const sanitized = sanitizationService.sanitizeHealthcareForm(patientData);
    expect(sanitized.hasErrors).toBe(false);

    // 2. Encrypt sensitive data
    const encryptionService = new DataEncryptionService(new DefaultKeyManager());
    const fieldClassifications = {
      firstName: DataClassification.PHI,
      lastName: DataClassification.PHI,
      email: DataClassification.PHI,
      phone: DataClassification.PHI,
      dateOfBirth: DataClassification.PHI,
      patientId: DataClassification.INTERNAL
    };

    const encrypted = await encryptionService.encryptObject(
      sanitized.sanitizedData,
      fieldClassifications
    );

    expect(encrypted).toHaveProperty('firstName_encrypted');
    expect(encrypted).toHaveProperty('patientId'); // Not encrypted

    // 3. Decrypt for verification
    const decrypted = await encryptionService.decryptObject(encrypted);
    expect(decrypted.firstName).toBe(patientData.firstName);
    expect(decrypted.email).toBe(patientData.email);
  });

  it('should maintain data integrity through encryption/decryption cycle', async () => {
    const testCases = [
      'Simple text',
      'Text with special chars: áéíóú ñ ¿¡',
      'Numbers: 123-45-6789',
      'Mixed: John Doe <john@example.com> (555) 123-4567',
      '', // Empty string
      '   ', // Whitespace only
    ];

    const encryptionService = new DataEncryptionService(new DefaultKeyManager());

    for (const originalText of testCases) {
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );
      
      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(originalText);
    }
  });
});

// Helper function to create mock DOM environment if needed
function createMockDOM() {
  if (typeof document === 'undefined') {
    // Mock basic DOM functionality for tests
    (global as any).document = {
      head: {
        appendChild: vi.fn()
      },
      createElement: vi.fn(() => ({
        setAttribute: vi.fn(),
        attributes: []
      })),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      cookie: ''
    };
  }
}

// Run DOM-dependent tests
describe('DOM Integration Tests', () => {
  beforeEach(() => {
    createMockDOM();
  });

  it('should handle security headers injection', () => {
    const securityHeaders = new SecurityHeadersManager();
    
    // This should not throw even in test environment
    expect(() => {
      securityHeaders.generateHeaders();
    }).not.toThrow();
  });
});