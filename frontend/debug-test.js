import { describe, it, expect, beforeEach } from 'vitest';
import { 
  validatePatientDataWorkflow,
  initializeHIPAASecurity
} from './src/lib/security/index.ts';

describe('Debug Integration Test', () => {
  let securityServices;

  beforeEach(async () => {
    securityServices = await initializeHIPAASecurity({
      organizationName: 'Debug Test Hospital',
      facilityId: 'DEBUG-001',
      enableGlobalFetch: false,
      enableSecurityHeaders: false,
      enableAuditLogging: true
    });
  });

  it('should debug patient workflow validation', async () => {
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

    console.log('🔍 Debug - Validation result:', {
      isCompliant: result.isCompliant,
      errorCount: result.errors?.length || 0,
      warningCount: result.warnings?.length || 0,
      hasAuditId: !!result.auditLogId,
      hasSanitizedData: !!result.sanitizedData
    });

    if (result.errors?.length > 0) {
      console.log('❌ Debug - Errors:', result.errors);
    }

    if (result.warnings?.length > 0) {
      console.log('⚠️ Debug - Warnings:', result.warnings);
    }

    // This will fail but show us what's happening
    expect(result.isCompliant).toBe(true);
  });
});