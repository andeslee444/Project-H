/**
 * HIPAA Input Sanitization Framework
 * 
 * Provides comprehensive input validation and sanitization for healthcare data
 * to prevent injection attacks, data corruption, and ensure data integrity.
 * 
 * Features:
 * - XSS prevention
 * - SQL injection prevention
 * - Healthcare-specific validation patterns
 * - PHI data format validation
 * - Input normalization
 * - Context-aware sanitization
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';

// Sanitization Context Types
export enum SanitizationContext {
  HTML = 'html',
  PLAIN_TEXT = 'plain_text',
  MEDICAL_TEXT = 'medical_text',
  SQL_QUERY = 'sql_query',
  JSON_DATA = 'json_data',
  FILE_PATH = 'file_path',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  PATIENT_NAME = 'patient_name',
  MEDICAL_RECORD = 'medical_record',
  DIAGNOSIS_CODE = 'diagnosis_code',
  MEDICATION = 'medication'
}

// Input Validation Rules
export interface ValidationRule {
  name: string;
  pattern?: RegExp;
  validator?: (value: string) => boolean;
  sanitizer?: (value: string) => string;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  errorMessage: string;
}

// Sanitization Result
export interface SanitizationResult {
  sanitizedValue: string;
  originalValue: string;
  isModified: boolean;
  warnings: string[];
  errors: string[];
  context: SanitizationContext;
  timestamp: Date;
}

// Healthcare-specific validation patterns
export const HealthcarePatterns = {
  // Patient identifiers
  PATIENT_ID: /^[A-Z0-9]{8,12}$/,
  MEDICAL_RECORD_NUMBER: /^[A-Z0-9]{6,15}$/,
  
  // Personal information
  NAME: /^[A-Za-z\s\-'\.]{1,50}$/,
  PHONE: /^\+?[\d\s\-\(\)\.]{10,15}$/,
  EMAIL: /^[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@[A-Za-z0-9]+([.-][A-Za-z0-9]+)*\.[A-Za-z]{2,}$/,
  
  // Medical codes
  ICD10_CODE: /^[A-Z]\d{2}(\.\d{1,3})?$/,
  CPT_CODE: /^\d{5}$/,
  LOINC_CODE: /^\d{4,5}-\d$/,
  
  // Dates and times
  DATE_ISO: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  DATETIME_ISO: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{3})?Z?$/,
  
  // Insurance and billing
  INSURANCE_ID: /^[A-Z0-9]{9,15}$/,
  INSURANCE_GROUP: /^[A-Z0-9\-]{5,20}$/,
  
  // Medications
  NDC_CODE: /^\d{4,5}-\d{3,4}-\d{1,2}$/,
  
  // Address components
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  STATE_CODE: /^[A-Z]{2}$/,
  
  // Clinical values
  VITALS_NUMERIC: /^\d{1,3}(\.\d{1,2})?$/,
  
  // General safety patterns
  NO_HTML_TAGS: /^[^<>]*$/,
  NO_SQL_INJECTION: /^[^';\"\\]*$/,
  NO_SCRIPT_TAGS: /^(?!.*<script).*$/i,
  ALPHANUMERIC_SAFE: /^[A-Za-z0-9\s\-_\.]{0,255}$/
};

// Predefined validation rules for healthcare data
export const HealthcareValidationRules: Record<string, ValidationRule> = {
  patientName: {
    name: 'Patient Name',
    pattern: HealthcarePatterns.NAME,
    maxLength: 50,
    minLength: 1,
    required: true,
    sanitizer: (value) => value.trim().replace(/\s+/g, ' '),
    errorMessage: 'Invalid patient name format'
  },
  
  patientId: {
    name: 'Patient ID',
    pattern: HealthcarePatterns.PATIENT_ID,
    maxLength: 12,
    minLength: 8,
    required: true,
    sanitizer: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    errorMessage: 'Invalid patient ID format'
  },
  
  medicalRecordNumber: {
    name: 'Medical Record Number',
    pattern: HealthcarePatterns.MEDICAL_RECORD_NUMBER,
    maxLength: 15,
    minLength: 6,
    required: true,
    sanitizer: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    errorMessage: 'Invalid medical record number format'
  },
  
  email: {
    name: 'Email Address',
    pattern: HealthcarePatterns.EMAIL,
    maxLength: 100,
    required: false,
    sanitizer: (value) => value.toLowerCase().trim(),
    errorMessage: 'Invalid email address format'
  },
  
  phone: {
    name: 'Phone Number',
    pattern: HealthcarePatterns.PHONE,
    maxLength: 15,
    sanitizer: (value) => value.replace(/[^\d\+\-\(\)\s\.]/g, ''),
    errorMessage: 'Invalid phone number format'
  },
  
  icd10Code: {
    name: 'ICD-10 Code',
    pattern: HealthcarePatterns.ICD10_CODE,
    maxLength: 8,
    sanitizer: (value) => value.toUpperCase().replace(/[^A-Z0-9\.]/g, ''),
    errorMessage: 'Invalid ICD-10 code format'
  },
  
  cptCode: {
    name: 'CPT Code',
    pattern: HealthcarePatterns.CPT_CODE,
    maxLength: 5,
    sanitizer: (value) => value.replace(/[^\d]/g, ''),
    errorMessage: 'Invalid CPT code format'
  },
  
  medicationText: {
    name: 'Medication Text',
    maxLength: 1000,
    sanitizer: (value) => DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }),
    validator: (value) => !/<script/i.test(value),
    errorMessage: 'Invalid medication text'
  },
  
  clinicalNotes: {
    name: 'Clinical Notes',
    maxLength: 10000,
    sanitizer: (value) => DOMPurify.sanitize(value, { 
      ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'p'],
      ALLOWED_ATTR: []
    }),
    validator: (value) => !/<script/i.test(value),
    errorMessage: 'Invalid clinical notes format'
  },
  
  zipCode: {
    name: 'ZIP Code',
    pattern: HealthcarePatterns.ZIP_CODE,
    maxLength: 10,
    sanitizer: (value) => value.replace(/[^\d\-]/g, ''),
    errorMessage: 'Invalid ZIP code format'
  },
  
  insuranceId: {
    name: 'Insurance ID',
    pattern: HealthcarePatterns.INSURANCE_ID,
    maxLength: 15,
    sanitizer: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    errorMessage: 'Invalid insurance ID format'
  }
};

/**
 * Main Input Sanitization Service
 */
export class InputSanitizationService {
  private customRules: Map<string, ValidationRule> = new Map();

  constructor() {
    // Initialize with healthcare validation rules
    Object.entries(HealthcareValidationRules).forEach(([key, rule]) => {
      this.customRules.set(key, rule);
    });
  }

  /**
   * Sanitize input based on context
   */
  sanitize(
    input: string,
    context: SanitizationContext,
    ruleName?: string
  ): SanitizationResult {
    const result: SanitizationResult = {
      sanitizedValue: input,
      originalValue: input,
      isModified: false,
      warnings: [],
      errors: [],
      context,
      timestamp: new Date()
    };

    try {
      // Apply context-specific sanitization
      result.sanitizedValue = this.applySanitizationByContext(input, context);
      
      // Apply rule-specific validation if provided
      if (ruleName) {
        const ruleResult = this.applyValidationRule(result.sanitizedValue, ruleName);
        result.sanitizedValue = ruleResult.sanitizedValue;
        result.warnings.push(...ruleResult.warnings);
        result.errors.push(...ruleResult.errors);
      }

      // Check if value was modified
      result.isModified = result.sanitizedValue !== result.originalValue;

      // Add warnings for modifications
      if (result.isModified) {
        result.warnings.push('Input was modified during sanitization');
      }

    } catch (error) {
      result.errors.push(`Sanitization failed: ${error.message}`);
      result.sanitizedValue = ''; // Safe fallback
    }

    return result;
  }

  /**
   * Sanitize healthcare form data
   */
  sanitizeHealthcareForm(formData: Record<string, any>): {
    sanitizedData: Record<string, any>;
    results: Record<string, SanitizationResult>;
    hasErrors: boolean;
  } {
    const sanitizedData: Record<string, any> = {};
    const results: Record<string, SanitizationResult> = {};
    let hasErrors = false;

    for (const [field, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const context = this.determineContextForField(field);
        const ruleName = this.determineRuleForField(field);
        
        const result = this.sanitize(value, context, ruleName);
        
        sanitizedData[field] = result.sanitizedValue;
        results[field] = result;
        
        if (result.errors.length > 0) {
          hasErrors = true;
        }
      } else {
        sanitizedData[field] = value; // Non-string values pass through
      }
    }

    return { sanitizedData, results, hasErrors };
  }

  /**
   * Validate patient data specifically
   */
  validatePatientData(patientData: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedData: any;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedData: any = {};

    // Define required fields for patient data
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth'];
    
    for (const field of requiredFields) {
      if (!patientData[field] || patientData[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    }

    // Sanitize all fields
    for (const [field, value] of Object.entries(patientData)) {
      if (typeof value === 'string') {
        const context = this.determineContextForField(field);
        const ruleName = this.determineRuleForField(field);
        
        const result = this.sanitize(value, context, ruleName);
        
        sanitizedData[field] = result.sanitizedValue;
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } else {
        sanitizedData[field] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData
    };
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(name: string, rule: ValidationRule): void {
    this.customRules.set(name, rule);
  }

  /**
   * Bulk sanitize multiple inputs
   */
  bulkSanitize(
    inputs: Array<{ value: string; context: SanitizationContext; ruleName?: string }>
  ): SanitizationResult[] {
    return inputs.map(input => 
      this.sanitize(input.value, input.context, input.ruleName)
    );
  }

  /**
   * Check if input contains potential threats
   */
  detectThreats(input: string): {
    hasThreats: boolean;
    threats: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  } {
    const threats: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> = [];

    // XSS detection
    if (/<script|javascript:|on\w+=/i.test(input)) {
      threats.push({
        type: 'XSS',
        description: 'Potential cross-site scripting attack',
        severity: 'high'
      });
    }

    // SQL injection detection
    if (/('|(--)|;|(\||(\*|\%)))/i.test(input)) {
      threats.push({
        type: 'SQL_INJECTION',
        description: 'Potential SQL injection attack',
        severity: 'high'
      });
    }

    // Path traversal detection
    if (/\.\.[\/\\]/i.test(input)) {
      threats.push({
        type: 'PATH_TRAVERSAL',
        description: 'Potential path traversal attack',
        severity: 'medium'
      });
    }

    // Command injection detection
    if (/[;&|`$(){}[\]]/i.test(input)) {
      threats.push({
        type: 'COMMAND_INJECTION',
        description: 'Potential command injection',
        severity: 'high'
      });
    }

    // LDAP injection detection
    if (/[()&|!]/i.test(input)) {
      threats.push({
        type: 'LDAP_INJECTION',
        description: 'Potential LDAP injection',
        severity: 'medium'
      });
    }

    return {
      hasThreats: threats.length > 0,
      threats
    };
  }

  // Private helper methods
  private applySanitizationByContext(input: string, context: SanitizationContext): string {
    switch (context) {
      case SanitizationContext.HTML:
        return DOMPurify.sanitize(input, {
          ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'p', 'strong', 'em'],
          ALLOWED_ATTR: []
        });

      case SanitizationContext.PLAIN_TEXT:
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

      case SanitizationContext.MEDICAL_TEXT:
        return DOMPurify.sanitize(input, {
          ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'p'],
          ALLOWED_ATTR: []
        });

      case SanitizationContext.SQL_QUERY:
        return input.replace(/[';\"\\]/g, '');

      case SanitizationContext.JSON_DATA:
        return input.replace(/[<>\"'&]/g, (match) => {
          const entityMap: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
          };
          return entityMap[match];
        });

      case SanitizationContext.FILE_PATH:
        return input.replace(/[<>:\"|?*]/g, '').replace(/\.\./g, '');

      case SanitizationContext.EMAIL:
        return input.toLowerCase().trim().replace(/[^\w@.-]/g, '');

      case SanitizationContext.PHONE:
        return input.replace(/[^\d\+\-\(\)\s\.]/g, '');

      case SanitizationContext.URL:
        return encodeURIComponent(input);

      case SanitizationContext.PATIENT_NAME:
        return input.trim().replace(/[^A-Za-z\s\-'\.]/g, '').replace(/\s+/g, ' ');

      case SanitizationContext.MEDICAL_RECORD:
        return input.toUpperCase().replace(/[^A-Z0-9\-]/g, '');

      case SanitizationContext.DIAGNOSIS_CODE:
        return input.toUpperCase().replace(/[^A-Z0-9\.]/g, '');

      case SanitizationContext.MEDICATION:
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).replace(/[<>]/g, '');

      default:
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }
  }

  private applyValidationRule(input: string, ruleName: string): {
    sanitizedValue: string;
    warnings: string[];
    errors: string[];
  } {
    const rule = this.customRules.get(ruleName);
    const warnings: string[] = [];
    const errors: string[] = [];
    let sanitizedValue = input;

    if (!rule) {
      errors.push(`Validation rule '${ruleName}' not found`);
      return { sanitizedValue, warnings, errors };
    }

    // Apply sanitizer if available
    if (rule.sanitizer) {
      sanitizedValue = rule.sanitizer(sanitizedValue);
    }

    // Check required
    if (rule.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
      errors.push(`${rule.name} is required`);
    }

    // Check length constraints
    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      errors.push(`${rule.name} exceeds maximum length of ${rule.maxLength} characters`);
    }

    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      errors.push(`${rule.name} must be at least ${rule.minLength} characters`);
    }

    // Check pattern
    if (rule.pattern && sanitizedValue && !rule.pattern.test(sanitizedValue)) {
      errors.push(rule.errorMessage);
    }

    // Check custom validator
    if (rule.validator && sanitizedValue && !rule.validator(sanitizedValue)) {
      errors.push(rule.errorMessage);
    }

    return { sanitizedValue, warnings, errors };
  }

  private determineContextForField(fieldName: string): SanitizationContext {
    const fieldLower = fieldName.toLowerCase();

    if (fieldLower.includes('name')) return SanitizationContext.PATIENT_NAME;
    if (fieldLower.includes('email')) return SanitizationContext.EMAIL;
    if (fieldLower.includes('phone')) return SanitizationContext.PHONE;
    if (fieldLower.includes('note') || fieldLower.includes('comment')) return SanitizationContext.MEDICAL_TEXT;
    if (fieldLower.includes('code')) return SanitizationContext.DIAGNOSIS_CODE;
    if (fieldLower.includes('medication')) return SanitizationContext.MEDICATION;
    if (fieldLower.includes('url')) return SanitizationContext.URL;

    return SanitizationContext.PLAIN_TEXT;
  }

  private determineRuleForField(fieldName: string): string | undefined {
    const fieldLower = fieldName.toLowerCase();

    if (fieldLower.includes('firstname') || fieldLower.includes('lastname')) return 'patientName';
    if (fieldLower.includes('patientid')) return 'patientId';
    if (fieldLower.includes('email')) return 'email';
    if (fieldLower.includes('phone')) return 'phone';
    if (fieldLower.includes('zip')) return 'zipCode';
    if (fieldLower.includes('insurance')) return 'insuranceId';
    if (fieldLower.includes('icd')) return 'icd10Code';
    if (fieldLower.includes('cpt')) return 'cptCode';
    if (fieldLower.includes('medication')) return 'medicationText';
    if (fieldLower.includes('notes')) return 'clinicalNotes';
    if (fieldLower.includes('mrn') || fieldLower.includes('medicalrecord')) return 'medicalRecordNumber';

    return undefined;
  }
}

/**
 * Healthcare Data Validator using Zod schemas
 */
export class HealthcareDataValidator {
  // Patient data schema
  static readonly PatientSchema = z.object({
    patientId: z.string().regex(HealthcarePatterns.PATIENT_ID).optional(),
    firstName: z.string().regex(HealthcarePatterns.NAME).min(1).max(50),
    lastName: z.string().regex(HealthcarePatterns.NAME).min(1).max(50),
    email: z.string().email().max(100).optional(),
    phone: z.string().regex(HealthcarePatterns.PHONE).optional(),
    dateOfBirth: z.string().regex(HealthcarePatterns.DATE_ISO),
    address: z.object({
      street: z.string().max(100),
      city: z.string().max(50),
      state: z.string().regex(HealthcarePatterns.STATE_CODE),
      zipCode: z.string().regex(HealthcarePatterns.ZIP_CODE)
    }).optional(),
    insuranceId: z.string().regex(HealthcarePatterns.INSURANCE_ID).optional(),
    medicalRecordNumber: z.string().regex(HealthcarePatterns.MEDICAL_RECORD_NUMBER).optional()
  });

  // Appointment data schema
  static readonly AppointmentSchema = z.object({
    appointmentId: z.string().uuid().optional(),
    patientId: z.string().regex(HealthcarePatterns.PATIENT_ID),
    providerId: z.string().uuid(),
    appointmentDate: z.string().regex(HealthcarePatterns.DATETIME_ISO),
    duration: z.number().min(15).max(480), // 15 minutes to 8 hours
    type: z.enum(['consultation', 'followup', 'emergency', 'procedure', 'therapy']),
    status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']),
    notes: z.string().max(1000).optional()
  });

  // Medical record schema
  static readonly MedicalRecordSchema = z.object({
    recordId: z.string().uuid().optional(),
    patientId: z.string().regex(HealthcarePatterns.PATIENT_ID),
    providerId: z.string().uuid(),
    visitDate: z.string().regex(HealthcarePatterns.DATETIME_ISO),
    chiefComplaint: z.string().max(500),
    diagnosis: z.array(z.object({
      code: z.string().regex(HealthcarePatterns.ICD10_CODE),
      description: z.string().max(200)
    })),
    procedures: z.array(z.object({
      code: z.string().regex(HealthcarePatterns.CPT_CODE),
      description: z.string().max(200)
    })).optional(),
    medications: z.array(z.object({
      name: z.string().max(100),
      dosage: z.string().max(50),
      frequency: z.string().max(50),
      ndcCode: z.string().regex(HealthcarePatterns.NDC_CODE).optional()
    })).optional(),
    vitals: z.object({
      bloodPressure: z.object({
        systolic: z.number().min(70).max(250),
        diastolic: z.number().min(40).max(150)
      }).optional(),
      heartRate: z.number().min(40).max(200).optional(),
      temperature: z.number().min(95).max(110).optional(),
      weight: z.number().min(50).max(500).optional(),
      height: z.number().min(36).max(96).optional()
    }).optional(),
    notes: z.string().max(5000).optional()
  });

  static validatePatient(data: any): z.SafeParseReturnType<any, any> {
    return this.PatientSchema.safeParse(data);
  }

  static validateAppointment(data: any): z.SafeParseReturnType<any, any> {
    return this.AppointmentSchema.safeParse(data);
  }

  static validateMedicalRecord(data: any): z.SafeParseReturnType<any, any> {
    return this.MedicalRecordSchema.safeParse(data);
  }
}

// Export the main sanitization service
export const inputSanitization = new InputSanitizationService();
export const healthcareValidator = HealthcareDataValidator;