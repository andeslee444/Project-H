/**
 * Input Sanitization Tests
 * 
 * Comprehensive tests for healthcare input sanitization and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  InputSanitizationService,
  HealthcareDataValidator,
  SanitizationContext,
  HealthcarePatterns,
  HealthcareValidationRules,
  type SanitizationResult
} from '../hipaa/InputSanitization';

// Mock DOMPurify import
vi.mock('dompurify', () => ({
  default: {
    sanitize: (input: string, options?: any) => {
      let result = input;
      
      // Remove script tags and their content
      result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      
      // Remove javascript: protocol
      result = result.replace(/javascript:/gi, '');
      
      // Remove event handlers (onload, onerror, etc.)
      result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
      result = result.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
      
      // Remove dangerous tags
      result = result.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
      result = result.replace(/<svg[^>]*>.*?<\/svg>/gi, '');
      result = result.replace(/<body[^>]*>/gi, '');
      
      // Handle specific options
      if (options?.ALLOWED_TAGS?.length === 0) {
        // Strip all HTML tags
        result = result.replace(/<[^>]*>/g, '');
      } else if (options?.ALLOWED_TAGS) {
        // Process each tag
        const allowedTags = options.ALLOWED_TAGS.map((t: string) => t.toLowerCase());
        
        // First pass: mark allowed tags
        result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
          const cleanTagName = tagName.toLowerCase();
          if (allowedTags.includes(cleanTagName)) {
            // Keep the tag but remove any event handlers
            const cleaned = match.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
                                 .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
            // Mark as safe by adding a temporary marker
            return cleaned.replace('<', '___SAFE_TAG_OPEN___')
                          .replace('>', '___SAFE_TAG_CLOSE___');
          }
          return '';
        });
        
        // Second pass: restore safe tags
        result = result.replace(/___SAFE_TAG_OPEN___/g, '<')
                       .replace(/___SAFE_TAG_CLOSE___/g, '>');
      }
      
      // Clean up any remaining dangerous content
      result = result.replace(/<img[^>]*>/gi, (match) => {
        if (!options?.ALLOWED_TAGS?.includes('img')) return '';
        return match.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
                   .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
      });
      
      return result;
    }
  }
}));

describe('InputSanitizationService', () => {
  let sanitizationService: InputSanitizationService;

  beforeEach(() => {
    sanitizationService = new InputSanitizationService();
  });

  describe('Basic Sanitization', () => {
    it('should sanitize XSS attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload="alert(1)">',
        '<body onload="alert(1)">'
      ];

      maliciousInputs.forEach(input => {
        const result = sanitizationService.sanitize(input, SanitizationContext.HTML);
        
        expect(result.sanitizedValue).not.toContain('<script');
        expect(result.sanitizedValue).not.toContain('javascript:');
        expect(result.sanitizedValue).not.toContain('onerror');
        expect(result.sanitizedValue).not.toContain('onload');
        expect(result.isModified).toBe(true);
      });
    });

    it('should preserve safe HTML in medical context', () => {
      const medicalText = 'Patient has <b>diabetes</b> and requires <i>insulin</i> treatment.';
      
      const result = sanitizationService.sanitize(medicalText, SanitizationContext.MEDICAL_TEXT);
      
      expect(result.sanitizedValue).toContain('<b>diabetes</b>');
      expect(result.sanitizedValue).toContain('<i>insulin</i>');
      expect(result.errors).toHaveLength(0);
    });

    it('should strip all HTML for plain text context', () => {
      const htmlInput = 'Patient <b>John Doe</b> has <script>alert("xss")</script> condition.';
      
      const result = sanitizationService.sanitize(htmlInput, SanitizationContext.PLAIN_TEXT);
      
      expect(result.sanitizedValue).toBe('Patient John Doe has  condition.');
      expect(result.sanitizedValue).not.toContain('<');
      expect(result.sanitizedValue).not.toContain('>');
    });

    it('should sanitize SQL injection patterns', () => {
      const sqlInjectionInputs = [
        "'; DROP TABLE patients; --",
        "' OR '1'='1",
        "'; UPDATE patients SET password='hacked' WHERE id=1; --",
        "admin'--",
        "' UNION SELECT * FROM users --"
      ];

      sqlInjectionInputs.forEach(input => {
        const result = sanitizationService.sanitize(input, SanitizationContext.SQL_QUERY);
        
        expect(result.sanitizedValue).not.toContain("'");
        expect(result.sanitizedValue).not.toContain('"');
        expect(result.sanitizedValue).not.toContain('\\');
        expect(result.isModified).toBe(true);
      });
    });

    it('should handle path traversal attempts', () => {
      const pathTraversalInputs = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config',
        './../../sensitive/file.txt',
        '....//....//etc/passwd'
      ];

      pathTraversalInputs.forEach(input => {
        const result = sanitizationService.sanitize(input, SanitizationContext.FILE_PATH);
        
        expect(result.sanitizedValue).not.toContain('../');
        expect(result.sanitizedValue).not.toContain('..\\');
        expect(result.sanitizedValue).not.toContain(':');
        expect(result.isModified).toBe(true);
      });
    });
  });

  describe('Healthcare-Specific Sanitization', () => {
    it('should sanitize patient names properly', () => {
      const testCases = [
        {
          input: "John<script>alert('xss')</script>Doe",
          expected: "JohnDoe"
        },
        {
          input: "Mary-Jane O'Connor",
          expected: "Mary-Jane O'Connor"
        },
        {
          input: "José María García-Rodríguez",
          expected: 'José María García-Rodríguez'
        },
        {
          input: "Patient123Name@#$",
          expected: 'PatientName'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sanitizationService.sanitize(input, SanitizationContext.PATIENT_NAME, 'patientName');
        expect(result.sanitizedValue).toBe(expected);
      });
    });

    it('should sanitize medical record numbers', () => {
      const testCases = [
        {
          input: "mrn123<script>",
          expected: 'MRN123'
        },
        {
          input: "med-rec-456",
          expected: 'MEDREC456'
        },
        {
          input: "MR789@#$%",
          expected: 'MR789'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sanitizationService.sanitize(input, SanitizationContext.MEDICAL_RECORD, 'medicalRecordNumber');
        expect(result.sanitizedValue).toBe(expected);
      });
    });

    it('should sanitize diagnosis codes', () => {
      const testCases = [
        {
          input: "E11.9<script>",
          expected: 'E11.9'
        },
        {
          input: "icd-10: F32.1",
          expected: 'F32.1'
        },
        {
          input: "Z23@#$",
          expected: 'Z23'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sanitizationService.sanitize(input, SanitizationContext.DIAGNOSIS_CODE, 'icd10Code');
        expect(result.sanitizedValue).toBe(expected);
      });
    });

    it('should sanitize medication information', () => {
      const medicationText = 'Patient prescribed <b>Metformin</b> 500mg <script>alert("xss")</script> twice daily';
      
      const result = sanitizationService.sanitize(medicationText, SanitizationContext.MEDICATION);
      
      expect(result.sanitizedValue).not.toContain('<script');
      expect(result.sanitizedValue).not.toContain('alert');
      expect(result.sanitizedValue).toContain('Metformin');
      expect(result.sanitizedValue).toContain('500mg');
    });
  });

  describe('Form Data Sanitization', () => {
    it('should sanitize complete healthcare form', () => {
      const formData = {
        firstName: 'John<script>alert("xss")</script>',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        patientId: 'PAT12345678',
        notes: 'Patient has <b>diabetes</b> and <script>alert("hack")</script>',
        ssn: '123-45-6789',
        address: '123 Main St',
        zipCode: '12345'
      };

      const result = sanitizationService.sanitizeHealthcareForm(formData);

      expect(result.hasErrors).toBe(false);
      expect(result.sanitizedData.firstName).not.toContain('<script');
      expect(result.sanitizedData.patientId).not.toContain('<script');
      expect(result.sanitizedData.notes).not.toContain('<script');
      expect(result.sanitizedData.notes).toContain('<b>diabetes</b>'); // Safe HTML preserved
      expect(result.sanitizedData.email).toBe('john.doe@example.com');
    });

    it('should detect form validation errors', () => {
      const invalidFormData = {
        firstName: '', // Required but empty
        lastName: 'ValidLastName',
        email: 'invalid-email-format', // Invalid email
        phone: '123', // Too short
        patientId: 'INVALID@#$', // Invalid format
        zipCode: 'abcde' // Invalid zip
      };

      const result = sanitizationService.sanitizeHealthcareForm(invalidFormData);

      expect(result.hasErrors).toBe(true);
      
      // Check for specific validation errors
      const allErrors = Object.values(result.results)
        .flatMap(r => r.errors);
      
      expect(allErrors.some(error => error.includes('required'))).toBe(true);
      expect(allErrors.some(error => error.includes('email'))).toBe(true);
    });

    it('should handle nested form data', () => {
      const nestedFormData = {
        patient: {
          name: 'John<script>',
          contact: 'john@example.com'
        },
        // This would need flattening in real implementation
        'patient.name': 'John<script>',
        'patient.contact': 'john@example.com'
      };

      // Test flattened version
      const flatData = {
        'patient.name': nestedFormData['patient.name'],
        'patient.contact': nestedFormData['patient.contact']
      };

      const result = sanitizationService.sanitizeHealthcareForm(flatData);
      
      expect(result.sanitizedData['patient.name']).not.toContain('<script');
      expect(result.sanitizedData['patient.contact']).toBe('john@example.com');
    });
  });

  describe('Patient Data Validation', () => {
    it('should validate complete patient data', () => {
      const validPatientData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '555-123-4567',
        dateOfBirth: '1985-03-15',
        address: '123 Oak Street',
        zipCode: '12345',
        patientId: 'PAT98765432'
      };

      const result = sanitizationService.validatePatientData(validPatientData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData.firstName).toBe('Alice');
      expect(result.sanitizedData.email).toBe('alice.johnson@email.com');
    });

    it('should detect missing required fields', () => {
      const incompletePatientData = {
        firstName: '', // Required but empty
        lastName: 'Smith',
        email: 'smith@example.com'
        // Missing dateOfBirth (required)
      };

      const result = sanitizationService.validatePatientData(incompletePatientData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('firstName is required');
      expect(result.errors).toContain('dateOfBirth is required');
    });

    it('should sanitize while validating', () => {
      const patientDataWithThreats = {
        firstName: 'John<script>alert("xss")</script>',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: '1990-01-01',
        notes: 'Patient has <b>condition</b> <script>hack()</script>'
      };

      const result = sanitizationService.validatePatientData(patientDataWithThreats);

      expect(result.sanitizedData.firstName).not.toContain('<script');
      expect(result.sanitizedData.notes).not.toContain('<script');
      expect(result.sanitizedData.notes).toContain('<b>condition</b>');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Threat Detection', () => {
    it('should detect XSS threats', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("test")',
        '<svg onload="alert(1)">',
        '<iframe src="javascript:void(0)"></iframe>'
      ];

      xssInputs.forEach(input => {
        const threats = sanitizationService.detectThreats(input);
        
        expect(threats.hasThreats).toBe(true);
        expect(threats.threats.some(t => t.type === 'XSS')).toBe(true);
        expect(threats.threats.some(t => t.severity === 'high')).toBe(true);
      });
    });

    it('should detect SQL injection threats', () => {
      const sqlInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT password FROM users --",
        "1'; UPDATE patients SET data='hacked' WHERE id=1; --"
      ];

      sqlInputs.forEach(input => {
        const threats = sanitizationService.detectThreats(input);
        
        expect(threats.hasThreats).toBe(true);
        expect(threats.threats.some(t => t.type === 'SQL_INJECTION')).toBe(true);
        expect(threats.threats.some(t => t.severity === 'high')).toBe(true);
      });
    });

    it('should detect path traversal threats', () => {
      const pathInputs = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        './../../config/database.yml',
        '....//....//sensitive.txt'
      ];

      pathInputs.forEach(input => {
        const threats = sanitizationService.detectThreats(input);
        
        expect(threats.hasThreats).toBe(true);
        expect(threats.threats.some(t => t.type === 'PATH_TRAVERSAL')).toBe(true);
      });
    });

    it('should detect command injection threats', () => {
      const commandInputs = [
        '; rm -rf /',
        '| cat /etc/passwd',
        '`whoami`',
        '$(cat /etc/hosts)',
        '&& format c:',
        '|| del *.*'
      ];

      commandInputs.forEach(input => {
        const threats = sanitizationService.detectThreats(input);
        
        expect(threats.hasThreats).toBe(true);
        expect(threats.threats.some(t => t.type === 'COMMAND_INJECTION')).toBe(true);
      });
    });

    it('should not flag safe medical content', () => {
      const safeMedicalInputs = [
        'Patient has Type 2 Diabetes',
        'Prescribed Metformin 500mg twice daily',
        'Blood pressure: 120/80 mmHg',
        'Patient complains of chest pain',
        'Scheduled for follow-up in 2 weeks'
      ];

      safeMedicalInputs.forEach(input => {
        const threats = sanitizationService.detectThreats(input);
        expect(threats.hasThreats).toBe(false);
      });
    });
  });

  describe('Validation Rules', () => {
    it('should add and use custom validation rules', () => {
      const customRule = {
        name: 'Custom Test Rule',
        pattern: /^TEST-\d{4}$/,
        maxLength: 9,
        minLength: 9,
        required: true,
        errorMessage: 'Must be in format TEST-1234'
      };

      sanitizationService.addValidationRule('customTest', customRule);

      const validInput = 'TEST-1234';
      const invalidInput = 'INVALID';

      const validResult = sanitizationService.sanitize(
        validInput, 
        SanitizationContext.PLAIN_TEXT, 
        'customTest'
      );
      
      const invalidResult = sanitizationService.sanitize(
        invalidInput, 
        SanitizationContext.PLAIN_TEXT, 
        'customTest'
      );

      expect(validResult.errors).toHaveLength(0);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      // Check that we get an appropriate error (either minLength or pattern)
      expect(
        invalidResult.errors.some(err => 
          err.includes('must be at least') || err.includes('Must be in format TEST-1234')
        )
      ).toBe(true);
    });

    it('should apply healthcare validation rules', () => {
      const testCases = [
        {
          value: 'John Doe',
          rule: 'patientName',
          shouldPass: true
        },
        {
          value: 'John123@#$',
          rule: 'patientName',
          shouldPass: false
        },
        {
          value: 'john.doe@example.com',
          rule: 'email',
          shouldPass: true
        },
        {
          value: 'invalid-email',
          rule: 'email',
          shouldPass: false
        },
        {
          value: '555-123-4567',
          rule: 'phone',
          shouldPass: true
        },
        {
          value: '123',
          rule: 'phone',
          shouldPass: false
        }
      ];

      testCases.forEach(({ value, rule, shouldPass }) => {
        const result = sanitizationService.sanitize(
          value,
          SanitizationContext.PLAIN_TEXT,
          rule
        );

        if (shouldPass) {
          expect(result.errors).toHaveLength(0);
        } else {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk sanitization', () => {
      const inputs = [
        { value: 'Clean input', context: SanitizationContext.PLAIN_TEXT },
        { value: '<script>alert("xss")</script>', context: SanitizationContext.HTML },
        { value: 'John Doe', context: SanitizationContext.PATIENT_NAME, ruleName: 'patientName' },
        { value: "'; DROP TABLE patients; --", context: SanitizationContext.SQL_QUERY }
      ];

      const results = sanitizationService.bulkSanitize(inputs);

      expect(results).toHaveLength(4);
      
      // Clean input should pass through
      expect(results[0].sanitizedValue).toBe('Clean input');
      expect(results[0].isModified).toBe(false);
      
      // XSS should be sanitized
      expect(results[1].sanitizedValue).not.toContain('<script');
      expect(results[1].isModified).toBe(true);
      
      // Patient name should be validated
      expect(results[2].errors).toHaveLength(0);
      
      // SQL injection should be sanitized
      expect(results[3].sanitizedValue).not.toContain("'");
      expect(results[3].isModified).toBe(true);
    });

    it('should handle bulk sanitization performance', () => {
      const inputs = Array.from({ length: 100 }, (_, i) => ({
        value: `Test input ${i} with <script>alert("${i}")</script>`,
        context: SanitizationContext.HTML
      }));

      const startTime = Date.now();
      const results = sanitizationService.bulkSanitize(inputs);
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      
      // All should be sanitized
      results.forEach(result => {
        expect(result.sanitizedValue).not.toContain('<script');
      });
    });
  });
});

describe('HealthcareDataValidator', () => {
  describe('Patient Data Validation', () => {
    it('should validate correct patient data', () => {
      const validPatient = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '555-123-4567',
        dateOfBirth: '1985-03-15',
        address: {
          street: '123 Oak Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        insuranceId: 'INS123456789',
        medicalRecordNumber: 'MRN987654'
      };

      const result = HealthcareDataValidator.validatePatient(validPatient);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('Alice');
        expect(result.data.email).toBe('alice.johnson@email.com');
      }
    });

    it('should detect invalid patient data', () => {
      const invalidPatient = {
        firstName: '', // Empty required field
        lastName: 'Johnson',
        email: 'invalid-email', // Invalid format
        phone: '123', // Too short
        dateOfBirth: 'invalid-date', // Invalid format
        address: {
          street: '123 Oak Street',
          city: 'Anytown',
          state: 'INVALID', // Not 2-letter state code
          zipCode: 'abcde' // Invalid zip format
        }
      };

      const result = HealthcareDataValidator.validatePatient(invalidPatient);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        
        const errorPaths = result.error.issues.map(issue => issue.path.join('.'));
        expect(errorPaths).toContain('firstName');
        expect(errorPaths).toContain('email');
        expect(errorPaths).toContain('phone');
        expect(errorPaths).toContain('dateOfBirth');
      }
    });

    it('should validate optional fields correctly', () => {
      const minimalPatient = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01'
      };

      const result = HealthcareDataValidator.validatePatient(minimalPatient);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
      }
    });
  });

  describe('Appointment Data Validation', () => {
    it('should validate correct appointment data', () => {
      const validAppointment = {
        patientId: 'PAT123456789',
        providerId: '550e8400-e29b-41d4-a716-446655440000',
        appointmentDate: '2024-12-25T10:00:00Z',
        duration: 60,
        type: 'consultation' as const,
        status: 'scheduled' as const,
        notes: 'Regular checkup appointment'
      };

      const result = HealthcareDataValidator.validateAppointment(validAppointment);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.patientId).toBe('PAT123456789');
        expect(result.data.duration).toBe(60);
      }
    });

    it('should detect invalid appointment data', () => {
      const invalidAppointment = {
        patientId: 'INVALID', // Invalid format
        providerId: 'not-a-uuid', // Invalid UUID
        appointmentDate: 'invalid-date', // Invalid ISO date
        duration: 5, // Too short (minimum 15 minutes)
        type: 'invalid-type', // Invalid appointment type
        status: 'invalid-status' // Invalid status
      };

      const result = HealthcareDataValidator.validateAppointment(invalidAppointment);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should validate appointment duration limits', () => {
      const shortAppointment = {
        patientId: 'PAT123456789',
        providerId: '550e8400-e29b-41d4-a716-446655440000',
        appointmentDate: '2024-12-25T10:00:00Z',
        duration: 10, // Too short
        type: 'consultation' as const,
        status: 'scheduled' as const
      };

      const longAppointment = {
        ...shortAppointment,
        duration: 500 // Too long (> 8 hours)
      };

      const validAppointment = {
        ...shortAppointment,
        duration: 60 // Valid duration
      };

      expect(HealthcareDataValidator.validateAppointment(shortAppointment).success).toBe(false);
      expect(HealthcareDataValidator.validateAppointment(longAppointment).success).toBe(false);
      expect(HealthcareDataValidator.validateAppointment(validAppointment).success).toBe(true);
    });
  });

  describe('Medical Record Validation', () => {
    it('should validate complete medical record', () => {
      const validRecord = {
        patientId: 'PAT123456789',
        providerId: '550e8400-e29b-41d4-a716-446655440000',
        visitDate: '2024-01-15T14:30:00Z',
        chiefComplaint: 'Patient reports persistent headaches',
        diagnosis: [
          {
            code: 'G44.1',
            description: 'Vascular headache, not elsewhere classified'
          }
        ],
        procedures: [
          {
            code: '99213',
            description: 'Office or other outpatient visit'
          }
        ],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'Every 6 hours as needed',
            ndcCode: '12345-678-90'
          }
        ],
        vitals: {
          bloodPressure: {
            systolic: 120,
            diastolic: 80
          },
          heartRate: 72,
          temperature: 98.6,
          weight: 150,
          height: 68
        },
        notes: 'Patient appears well. Recommended follow-up in 2 weeks.'
      };

      const result = HealthcareDataValidator.validateMedicalRecord(validRecord);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chiefComplaint).toBe('Patient reports persistent headaches');
        expect(result.data.diagnosis).toHaveLength(1);
        expect(result.data.medications).toHaveLength(1);
      }
    });

    it('should validate medical codes', () => {
      const recordWithInvalidCodes = {
        patientId: 'PAT123456789',
        providerId: '550e8400-e29b-41d4-a716-446655440000',
        visitDate: '2024-01-15T14:30:00Z',
        chiefComplaint: 'Test complaint',
        diagnosis: [
          {
            code: 'INVALID', // Invalid ICD-10 code
            description: 'Invalid diagnosis'
          }
        ],
        procedures: [
          {
            code: '999999', // Invalid CPT code (should be 5 digits)
            description: 'Invalid procedure'
          }
        ]
      };

      const result = HealthcareDataValidator.validateMedicalRecord(recordWithInvalidCodes);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => issue.message);
        expect(errorMessages.some(msg => msg.includes('diagnosis') || msg.includes('Invalid'))).toBe(true);
      }
    });

    it('should validate vital signs ranges', () => {
      const recordWithInvalidVitals = {
        patientId: 'PAT123456789',
        providerId: '550e8400-e29b-41d4-a716-446655440000',
        visitDate: '2024-01-15T14:30:00Z',
        chiefComplaint: 'Test complaint',
        diagnosis: [{ code: 'Z00.0', description: 'General examination' }],
        vitals: {
          bloodPressure: {
            systolic: 300, // Too high
            diastolic: 20 // Too low
          },
          heartRate: 300, // Too high
          temperature: 120, // Too high
          weight: 1000, // Too high
          height: 120 // Too high
        }
      };

      const result = HealthcareDataValidator.validateMedicalRecord(recordWithInvalidVitals);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Healthcare Patterns', () => {
  describe('Patient Identifiers', () => {
    it('should validate patient ID patterns', () => {
      const validIds = ['PAT123456', 'PATIENT789', 'P1234567890'];
      const invalidIds = ['pat123', 'PATIENT@123', '123', 'VERYLONGPATIENTID123'];

      validIds.forEach(id => {
        expect(HealthcarePatterns.PATIENT_ID.test(id)).toBe(true);
      });

      invalidIds.forEach(id => {
        expect(HealthcarePatterns.PATIENT_ID.test(id)).toBe(false);
      });
    });

    it('should validate medical record number patterns', () => {
      const validMRNs = ['MRN123456', 'MR7890123', 'RECORD98765'];
      const invalidMRNs = ['mrn123', 'MRN@123', '123', 'SHORT'];

      validMRNs.forEach(mrn => {
        expect(HealthcarePatterns.MEDICAL_RECORD_NUMBER.test(mrn)).toBe(true);
      });

      invalidMRNs.forEach(mrn => {
        expect(HealthcarePatterns.MEDICAL_RECORD_NUMBER.test(mrn)).toBe(false);
      });
    });
  });

  describe('Medical Codes', () => {
    it('should validate ICD-10 codes', () => {
      const validCodes = ['A01.1', 'Z23', 'M79.3', 'F32.9', 'K59.00'];
      const invalidCodes = ['A1.1', '123.45', 'ABC.123', 'Z', 'F32.9999'];

      validCodes.forEach(code => {
        expect(HealthcarePatterns.ICD10_CODE.test(code)).toBe(true);
      });

      invalidCodes.forEach(code => {
        expect(HealthcarePatterns.ICD10_CODE.test(code)).toBe(false);
      });
    });

    it('should validate CPT codes', () => {
      const validCodes = ['99213', '12345', '99999'];
      const invalidCodes = ['9921', '123456', 'abcde', '9921a'];

      validCodes.forEach(code => {
        expect(HealthcarePatterns.CPT_CODE.test(code)).toBe(true);
      });

      invalidCodes.forEach(code => {
        expect(HealthcarePatterns.CPT_CODE.test(code)).toBe(false);
      });
    });

    it('should validate NDC codes', () => {
      const validCodes = ['12345-678-90', '1234-5678-1', '12345-123-1'];
      const invalidCodes = ['123-45-67', '12345-678-901', 'abcd-efgh-ij'];

      validCodes.forEach(code => {
        expect(HealthcarePatterns.NDC_CODE.test(code)).toBe(true);
      });

      invalidCodes.forEach(code => {
        expect(HealthcarePatterns.NDC_CODE.test(code)).toBe(false);
      });
    });
  });

  describe('Contact Information', () => {
    it('should validate phone numbers', () => {
      const validPhones = [
        '555-123-4567',
        '(555) 123-4567',
        '+1-555-123-4567',
        '555.123.4567',
        '15551234567'
      ];
      
      const invalidPhones = ['123', 'abc-def-ghij', '555-123'];

      validPhones.forEach(phone => {
        expect(HealthcarePatterns.PHONE.test(phone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(HealthcarePatterns.PHONE.test(phone)).toBe(false);
      });
    });

    it('should validate email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@hospital.org',
        'patient123@clinic.net'
      ];
      
      const invalidEmails = ['invalid-email', '@example.com', 'user@', 'user..double@example.com'];

      validEmails.forEach(email => {
        expect(HealthcarePatterns.EMAIL.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(HealthcarePatterns.EMAIL.test(email)).toBe(false);
      });
    });
  });

  describe('Date and Time Patterns', () => {
    it('should validate ISO date format', () => {
      const validDates = ['2024-01-15', '1990-12-31', '2000-02-29'];
      const invalidDates = ['24-01-15', '2024/01/15', '2024-13-01', '2024-01-32', '2024-00-15', '2024-01-00'];

      validDates.forEach(date => {
        expect(HealthcarePatterns.DATE_ISO.test(date)).toBe(true);
      });

      invalidDates.forEach(date => {
        expect(HealthcarePatterns.DATE_ISO.test(date)).toBe(false);
      });
    });

    it('should validate ISO datetime format', () => {
      const validDatetimes = [
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00.123Z',
        '2024-01-15T10:30:00'
      ];
      
      const invalidDatetimes = [
        '2024-01-15 10:30:00',
        '2024/01/15T10:30:00Z',
        '2024-01-15T25:30:00Z',
        '2024-01-15T10:60:00Z',
        '2024-01-15T10:30:60Z'
      ];

      validDatetimes.forEach(datetime => {
        expect(HealthcarePatterns.DATETIME_ISO.test(datetime)).toBe(true);
      });

      invalidDatetimes.forEach(datetime => {
        expect(HealthcarePatterns.DATETIME_ISO.test(datetime)).toBe(false);
      });
    });
  });
});