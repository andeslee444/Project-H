// Debug script to understand integration test failures
import { validatePatientDataWorkflow, initializeHIPAASecurity } from './src/lib/security/index.js';

async function debugTest() {
  console.log('🔍 Starting debug test...');
  
  // Initialize security framework
  const securityServices = await initializeHIPAASecurity({
    organizationName: 'Debug Test Hospital',
    facilityId: 'DEBUG-001',
    enableGlobalFetch: false,
    enableSecurityHeaders: false,
    enableAuditLogging: true
  });

  console.log('✅ Security services initialized:', securityServices.status);

  // Test patient data from the failing test
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

  console.log('🔍 Testing patient data workflow...');
  
  try {
    const result = await validatePatientDataWorkflow(
      newPatientData,
      'registration_clerk_001',
      'registration_clerk',
      'create'
    );

    console.log('📊 Validation result:', {
      isCompliant: result.isCompliant,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      hasAuditId: !!result.auditLogId,
      hasSanitizedData: !!result.sanitizedData
    });

    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors);
    }

    if (result.warnings.length > 0) {
      console.log('⚠️ Warnings:', result.warnings);
    }

  } catch (error) {
    console.error('💥 Workflow validation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugTest().catch(console.error);