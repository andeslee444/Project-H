/**
 * Patient Workflow Integration Tests
 * 
 * End-to-end integration tests for patient data workflows with HIPAA compliance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  validatePatientDataWorkflow,
  initializeHIPAASecurity,
  emergencyDataAccess
} from '../../index';
import { DataClassification } from '../../hipaa/HIPAACompliance';

// Mock crypto and other globals
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'integration-test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => new ArrayBuffer(32),
      importKey: async () => ({ type: 'secret', id: Math.random() }),
      deriveKey: async () => ({ type: 'secret', id: Math.random() }),
      encrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        const result = new ArrayBuffer(data.byteLength + 16);
        new Uint8Array(result).set(new Uint8Array(data));
        return result;
      },
      decrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        return data.slice(0, -16);
      }
    }
  }
});

Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'integration-test-agent' }
});

Object.defineProperty(global, 'sessionStorage', {
  value: {
    items: new Map(),
    getItem: vi.fn((key: string) => sessionStorage.items.get(key) || null),
    setItem: vi.fn((key: string, value: string) => sessionStorage.items.set(key, value)),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
});

describe('Patient Workflow Integration Tests', () => {
  let securityServices: any;

  beforeEach(async () => {
    // Initialize the security framework
    securityServices = await initializeHIPAASecurity({
      organizationName: 'Integration Test Hospital',
      facilityId: 'INT-TEST-001',
      enableGlobalFetch: false,
      enableSecurityHeaders: false,
      enableAuditLogging: true
    });

    expect(securityServices.status).toBe('initialized');
  });

  describe('Patient Creation Workflow', () => {
    it('should validate and process new patient registration', async () => {
      const newPatientData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '555-0123',
        dateOfBirth: '1985-03-15',
        address: '123 Oak Street, Anytown, ST 12345',
        ssn: '123-45-6789',
        emergencyContact: 'Bob Johnson - 555-0124',
        insuranceId: 'INS987654321',
        medicalRecordNumber: 'MRN456789'
      };

      const result = await validatePatientDataWorkflow(
        newPatientData,
        'registration_clerk_001',
        'registration_clerk',
        'create'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData).toBeDefined();
      expect(result.auditLogId).toBeDefined();

      // Verify sensitive data is handled properly
      expect(result.sanitizedData.firstName).toBe('Alice');
      expect(result.sanitizedData.lastName).toBe('Johnson');
      expect(result.sanitizedData.email).toBe('alice.johnson@email.com');
    });

    it('should reject invalid patient data', async () => {
      const invalidPatientData = {
        firstName: '', // Required field missing
        lastName: 'Johnson',
        email: 'invalid-email-format', // Invalid email
        phone: '123', // Too short
        dateOfBirth: 'invalid-date', // Invalid date format
        ssn: 'invalid-ssn' // Invalid SSN format
      };

      const result = await validatePatientDataWorkflow(
        invalidPatientData,
        'registration_clerk_001',
        'registration_clerk',
        'create'
      );

      expect(result.isCompliant).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.sanitizedData).toBeUndefined();
    });

    it('should detect and sanitize malicious input', async () => {
      const maliciousPatientData = {
        firstName: 'Alice<script>alert("xss")</script>',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '555-0123',
        dateOfBirth: '1985-03-15',
        notes: 'Patient history: <script>steal_data()</script> diabetes',
        address: '123 Main St<iframe src="evil.com"></iframe>'
      };

      const result = await validatePatientDataWorkflow(
        maliciousPatientData,
        'registration_clerk_001',
        'registration_clerk',
        'create'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      
      // Verify malicious content is sanitized
      expect(result.sanitizedData.firstName).not.toContain('<script>');
      expect(result.sanitizedData.notes).not.toContain('<script>');
      expect(result.sanitizedData.address).not.toContain('<iframe>');
    });
  });

  describe('Patient Access Workflow', () => {
    it('should validate physician access to patient records', async () => {
      const patientData = {
        patientId: 'PAT123456',
        firstName: 'John',
        lastName: 'Doe',
        medicalHistory: 'Type 2 Diabetes, Hypertension',
        currentMedications: 'Metformin 500mg BID, Lisinopril 10mg daily',
        allergies: 'Penicillin'
      };

      const result = await validatePatientDataWorkflow(
        patientData,
        'physician_001',
        'physician',
        'read'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.auditLogId).toBeDefined();

      // Verify audit trail was created
      const auditEvents = await securityServices.audit.getPatientAuditTrail('PAT123456');
      expect(auditEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('should validate nurse access with proper permissions', async () => {
      const patientData = {
        patientId: 'PAT789012',
        vitals: {
          bloodPressure: '120/80',
          heartRate: '72',
          temperature: '98.6'
        },
        nursingNotes: 'Patient comfortable, no complaints'
      };

      const result = await validatePatientDataWorkflow(
        patientData,
        'nurse_001',
        'registered_nurse',
        'update'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.sanitizedData).toBeDefined();
    });

    it('should track access patterns for compliance', async () => {
      const patientId = 'PAT456789';
      
      // Simulate multiple access events
      const accessEvents = [
        { action: 'read', user: 'physician_001', role: 'physician' },
        { action: 'update', user: 'nurse_001', role: 'registered_nurse' },
        { action: 'read', user: 'physician_002', role: 'physician' }
      ];

      for (const event of accessEvents) {
        await validatePatientDataWorkflow(
          { patientId, testData: 'sample' },
          event.user,
          event.role,
          event.action
        );
      }

      // Generate compliance report
      const report = await securityServices.audit.generateComplianceReport(
        new Date(Date.now() - 60000), // Last minute
        new Date(),
        true // Include details
      );

      expect(report.summary.totalEvents).toBeGreaterThanOrEqual(3);
      expect(report.summary.phiAccess).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Emergency Access Workflow', () => {
    it('should grant emergency access with proper justification', async () => {
      const emergencyResult = await emergencyDataAccess(
        'emergency_physician_001',
        'emergency_physician',
        'PAT999999',
        'Patient cardiac arrest - immediate access to medical history required for treatment',
        'charge_nurse_001'
      );

      expect(emergencyResult.granted).toBe(true);
      expect(emergencyResult.auditLogId).toBeDefined();
      expect(emergencyResult.restrictions).toContain('Emergency access is time-limited');

      // Verify emergency access is properly audited
      const auditEvents = await securityServices.audit.getPatientAuditTrail('PAT999999');
      const emergencyEvent = auditEvents.find(event => 
        event.context?.emergencyAccess === true
      );
      
      expect(emergencyEvent).toBeDefined();
      expect(emergencyEvent?.requiresReview).toBe(true);
    });

    it('should handle emergency access for critical situations', async () => {
      const criticalPatientData = {
        patientId: 'PAT888888',
        allergies: 'Penicillin, Sulfa drugs',
        bloodType: 'A+',
        emergencyContacts: 'Jane Doe - 555-9999',
        criticalMedications: 'Warfarin 5mg daily'
      };

      // First establish emergency access
      const emergencyAccess = await emergencyDataAccess(
        'trauma_surgeon_001',
        'trauma_surgeon',
        'PAT888888',
        'Multi-vehicle accident - critical patient needs immediate surgery',
        'emergency_supervisor_001'
      );

      expect(emergencyAccess.granted).toBe(true);

      // Then validate data access under emergency conditions
      const dataAccess = await validatePatientDataWorkflow(
        criticalPatientData,
        'trauma_surgeon_001',
        'trauma_surgeon',
        'read'
      );

      expect(dataAccess.isCompliant).toBe(true);
      expect(dataAccess.auditLogId).toBeDefined();
    });
  });

  describe('Data Modification Workflow', () => {
    it('should validate medical record updates', async () => {
      const medicalRecordUpdate = {
        patientId: 'PAT555555',
        visitDate: '2024-01-15',
        chiefComplaint: 'Chest pain',
        diagnosis: 'Acute myocardial infarction',
        treatmentPlan: 'Admit to CCU, start heparin protocol',
        medications: [
          { name: 'Aspirin', dosage: '81mg', frequency: 'daily' },
          { name: 'Metoprolol', dosage: '25mg', frequency: 'BID' }
        ],
        vitals: {
          bloodPressure: '150/95',
          heartRate: '88',
          temperature: '98.4'
        },
        providerNotes: 'Patient stable post-intervention'
      };

      const result = await validatePatientDataWorkflow(
        medicalRecordUpdate,
        'cardiologist_001',
        'cardiologist',
        'update'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.diagnosis).toBe('Acute myocardial infarction');
      expect(result.sanitizedData.medications).toHaveLength(2);
    });

    it('should validate prescription updates with proper authorization', async () => {
      const prescriptionData = {
        patientId: 'PAT777777',
        prescriptions: [
          {
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: 'once daily',
            quantity: '30 tablets',
            refills: '5',
            prescriberId: 'physician_001'
          }
        ],
        prescriptionDate: '2024-01-15',
        pharmacyInstructions: 'Take with food'
      };

      const result = await validatePatientDataWorkflow(
        prescriptionData,
        'physician_001',
        'physician',
        'create'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.sanitizedData.prescriptions).toHaveLength(1);
    });
  });

  describe('Data Export and Reporting Workflow', () => {
    it('should validate authorized data export', async () => {
      const exportRequest = {
        patientIds: ['PAT001', 'PAT002', 'PAT003'],
        dataFields: ['firstName', 'lastName', 'dateOfBirth', 'diagnosis'],
        exportFormat: 'CSV',
        purpose: 'Quality improvement study',
        requestedBy: 'research_coordinator_001',
        approvedBy: 'medical_director_001',
        exportDate: '2024-01-15'
      };

      const result = await validatePatientDataWorkflow(
        exportRequest,
        'research_coordinator_001',
        'research_coordinator',
        'export'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.auditLogId).toBeDefined();

      // Verify high-risk activity is flagged for review
      const auditEvents = await securityServices.audit.searchAuditLogs({
        userId: 'research_coordinator_001',
        riskScore: { min: 70, max: 100 }
      });

      expect(auditEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate compliance reports for auditing', async () => {
      // Create various test activities
      const testActivities = [
        { user: 'physician_001', role: 'physician', action: 'read', patientId: 'PAT001' },
        { user: 'nurse_001', role: 'registered_nurse', action: 'update', patientId: 'PAT002' },
        { user: 'admin_001', role: 'system_admin', action: 'export', patientId: 'PAT003' }
      ];

      for (const activity of testActivities) {
        await validatePatientDataWorkflow(
          { patientId: activity.patientId, testData: 'compliance-test' },
          activity.user,
          activity.role,
          activity.action
        );
      }

      // Generate comprehensive compliance report
      const report = await securityServices.audit.generateComplianceReport(
        new Date(Date.now() - 300000), // Last 5 minutes
        new Date(),
        true
      );

      expect(report.summary.totalEvents).toBeGreaterThanOrEqual(3);
      expect(report.statistics.uniqueUsers).toBeGreaterThanOrEqual(3);
      expect(report.statistics.eventsByType).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Cross-Workflow Integration', () => {
    it('should handle complete patient lifecycle', async () => {
      const patientId = 'PAT_LIFECYCLE_TEST';
      
      // 1. Patient Registration
      const registrationData = {
        firstName: 'Integration',
        lastName: 'TestPatient',
        email: 'integration.test@example.com',
        phone: '555-TEST',
        dateOfBirth: '1990-01-01'
      };

      const registration = await validatePatientDataWorkflow(
        registrationData,
        'registration_001',
        'registration_clerk',
        'create'
      );
      expect(registration.isCompliant).toBe(true);

      // 2. Initial Medical Assessment
      const assessmentData = {
        patientId,
        chiefComplaint: 'Annual physical exam',
        vitals: { bloodPressure: '120/80', heartRate: '70' },
        assessment: 'Healthy adult'
      };

      const assessment = await validatePatientDataWorkflow(
        assessmentData,
        'physician_001',
        'physician',
        'create'
      );
      expect(assessment.isCompliant).toBe(true);

      // 3. Follow-up Visit
      const followupData = {
        patientId,
        visitType: 'follow-up',
        notes: 'Patient doing well, continue current medications'
      };

      const followup = await validatePatientDataWorkflow(
        followupData,
        'physician_001',
        'physician',
        'update'
      );
      expect(followup.isCompliant).toBe(true);

      // 4. Verify Complete Audit Trail
      const auditTrail = await securityServices.audit.getPatientAuditTrail(patientId);
      expect(auditTrail.length).toBeGreaterThanOrEqual(3);

      // 5. Generate Patient-Specific Report
      const patientReport = await securityServices.audit.generateComplianceReport(
        new Date(Date.now() - 600000), // Last 10 minutes
        new Date(),
        true
      );

      expect(patientReport.summary.totalEvents).toBeGreaterThanOrEqual(3);
    });

    it('should maintain data integrity across workflows', async () => {
      const patientData = {
        patientId: 'PAT_INTEGRITY_TEST',
        sensitiveData: {
          ssn: '123-45-6789',
          medicalHistory: 'Diabetes, Hypertension',
          currentMedications: 'Metformin, Lisinopril'
        },
        publicData: {
          patientId: 'PAT_INTEGRITY_TEST',
          appointmentStatus: 'scheduled'
        }
      };

      // Test data workflow
      const result = await validatePatientDataWorkflow(
        patientData,
        'physician_001',
        'physician',
        'read'
      );

      expect(result.isCompliant).toBe(true);
      expect(result.sanitizedData).toBeDefined();

      // Verify data classification is preserved
      const compliance = securityServices.compliance;
      const ssnClassification = compliance.classifyData(patientData.sensitiveData.ssn);
      const statusClassification = compliance.classifyData(patientData.publicData.appointmentStatus);

      expect(ssnClassification).toBe(DataClassification.PHI);
      expect(statusClassification).toBe(DataClassification.INTERNAL);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle workflow failures gracefully', async () => {
      const invalidData = {
        // Intentionally malformed data
        patientId: null,
        invalidField: '<script>malicious()</script>',
        corruptedData: { deeply: { nested: { invalid: 'data' } } }
      };

      const result = await validatePatientDataWorkflow(
        invalidData,
        'test_user',
        'test_role',
        'invalid_action'
      );

      expect(result.isCompliant).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.auditLogId).toBeDefined(); // Should still audit the attempt
    });

    it('should detect and report security violations', async () => {
      const suspiciousData = {
        patientId: 'PAT_SECURITY_TEST',
        maliciousInput: "'; DROP TABLE patients; --",
        xssAttempt: '<script>alert("security breach")</script>',
        pathTraversal: '../../../etc/passwd'
      };

      const result = await validatePatientDataWorkflow(
        suspiciousData,
        'suspicious_user',
        'unknown_role',
        'read'
      );

      // Should detect threats
      const threats = securityServices.sanitization.detectThreats(suspiciousData.maliciousInput);
      expect(threats.hasThreats).toBe(true);
      expect(threats.threats.some((t: any) => t.type === 'SQL_INJECTION')).toBe(true);
    });
  });
});