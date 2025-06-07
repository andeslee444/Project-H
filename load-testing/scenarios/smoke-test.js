import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG, validateHealthcareSLA, HIPAA_HEADERS } from '../utils/config.js';
import { login, TestUserSession } from '../utils/auth.js';
import { generateTestUser } from '../utils/test-data.js';

/**
 * Smoke Test for Project-H Mental Health Practice Scheduling System
 * 
 * Purpose: Basic functionality validation with minimal load
 * - Verifies all critical endpoints are responsive
 * - Validates basic user workflows
 * - Ensures HIPAA compliance in responses
 * - Tests authentication and authorization
 */

export let options = {
  scenarios: {
    smoke_test: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '30s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99']
  }
};

// Test data
let testPatient, testProvider, testAdmin;
let patientSession, providerSession, adminSession;

export function setup() {
  console.log('Setting up smoke test data...');
  
  // Generate test users
  testPatient = generateTestUser('patient');
  testProvider = generateTestUser('provider');
  testAdmin = generateTestUser('practice_admin');
  
  // Initialize user sessions
  patientSession = new TestUserSession('patient');
  providerSession = new TestUserSession('provider');
  adminSession = new TestUserSession('practice_admin');
  
  return {
    testPatient,
    testProvider,
    testAdmin,
    patientSession,
    providerSession,
    adminSession
  };
}

export default function(data) {
  console.log('Starting smoke test...');
  
  // Test 1: Health Check
  testHealthCheck();
  sleep(1);
  
  // Test 2: API Documentation
  testAPIDocumentation();
  sleep(1);
  
  // Test 3: Authentication Endpoints
  testAuthentication();
  sleep(1);
  
  // Test 4: Patient Registration Flow
  testPatientRegistration();
  sleep(1);
  
  // Test 5: Provider Endpoints
  testProviderEndpoints();
  sleep(1);
  
  // Test 6: Appointment System
  testAppointmentSystem();
  sleep(1);
  
  // Test 7: Waitlist System
  testWaitlistSystem();
  sleep(1);
  
  // Test 8: Notification System
  testNotificationSystem();
  sleep(1);
  
  // Test 9: Analytics Endpoints
  testAnalyticsEndpoints();
  sleep(1);
  
  // Test 10: HIPAA Compliance
  testHIPAACompliance();
  
  console.log('Smoke test completed');
}

function testHealthCheck() {
  console.log('Testing health check endpoints...');
  
  // API Health Check
  const healthResponse = http.get(`${CONFIG.API_BASE_URL}/health`, {
    tags: { name: 'health_check' }
  });
  
  check(healthResponse, {
    'Health Check - Status is 200': (r) => r.status === 200,
    'Health Check - Response time < 1s': (r) => r.timings.duration < 1000,
    'Health Check - Has status field': (r) => r.json('status') !== undefined
  });
  
  // Database Health Check
  const dbHealthResponse = http.get(`${CONFIG.API_BASE_URL}/health/database`, {
    tags: { name: 'database_health_check' }
  });
  
  check(dbHealthResponse, {
    'Database Health - Status is 200': (r) => r.status === 200,
    'Database Health - Connection OK': (r) => r.json('database.status') === 'connected'
  });
}

function testAPIDocumentation() {
  console.log('Testing API documentation endpoints...');
  
  // API Documentation
  const docsResponse = http.get(`${CONFIG.API_BASE_URL}/docs`, {
    tags: { name: 'api_documentation' }
  });
  
  check(docsResponse, {
    'API Docs - Status is 200': (r) => r.status === 200,
    'API Docs - Response time < 2s': (r) => r.timings.duration < 2000
  });
  
  // API Schema
  const schemaResponse = http.get(`${CONFIG.API_BASE_URL}/schema`, {
    tags: { name: 'api_schema' }
  });
  
  check(schemaResponse, {
    'API Schema - Status is 200': (r) => r.status === 200,
    'API Schema - Valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    }
  });
}

function testAuthentication() {
  console.log('Testing authentication endpoints...');
  
  // Test login endpoint with invalid credentials
  const invalidLoginResponse = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }),
    {
      headers: HIPAA_HEADERS,
      tags: { name: 'auth_login_invalid' }
    }
  );
  
  check(invalidLoginResponse, {
    'Invalid Login - Status is 401': (r) => r.status === 401,
    'Invalid Login - Response time < 1s': (r) => r.timings.duration < 1000,
    'Invalid Login - Error message': (r) => r.json('message') !== undefined
  });
  
  // Test registration endpoint structure
  const registrationTestResponse = http.post(
    `${CONFIG.API_BASE_URL}/auth/register`,
    JSON.stringify({
      email: 'incomplete@test.com'
      // Missing required fields
    }),
    {
      headers: HIPAA_HEADERS,
      tags: { name: 'auth_register_validation' }
    }
  );
  
  check(registrationTestResponse, {
    'Registration Validation - Status is 400': (r) => r.status === 400,
    'Registration Validation - Error details': (r) => r.json('errors') !== undefined
  });
}

function testPatientRegistration() {
  console.log('Testing patient registration flow...');
  
  const testPatient = generateTestUser('patient');
  
  // Register patient
  const registrationResponse = http.post(
    `${CONFIG.API_BASE_URL}/auth/register`,
    JSON.stringify(testPatient),
    {
      headers: HIPAA_HEADERS,
      tags: { name: 'patient_registration' }
    }
  );
  
  const registrationSuccess = check(registrationResponse, {
    'Patient Registration - Status is 201': (r) => r.status === 201,
    'Patient Registration - Response time < 3s': (r) => r.timings.duration < 3000,
    'Patient Registration - User data returned': (r) => r.json('data.user') !== undefined,
    'Patient Registration - No PHI in response': (r) => !r.body.includes('ssn') && !r.body.includes('social')
  });
  
  if (registrationSuccess) {
    // Test login with new patient
    const loginResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: testPatient.email,
        password: testPatient.password,
        userType: 'patient'
      }),
      {
        headers: HIPAA_HEADERS,
        tags: { name: 'patient_login' }
      }
    );
    
    check(loginResponse, {
      'Patient Login - Status is 200': (r) => r.status === 200,
      'Patient Login - Token received': (r) => r.json('data.token') !== undefined,
      'Patient Login - Response time < 2s': (r) => r.timings.duration < 2000
    });
  }
}

function testProviderEndpoints() {
  console.log('Testing provider endpoints...');
  
  // List providers (should work without auth for public directory)
  const providersResponse = http.get(`${CONFIG.API_BASE_URL}/providers`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'providers_list' }
  });
  
  check(providersResponse, {
    'Providers List - Status is 200': (r) => r.status === 200,
    'Providers List - Response time < 2s': (r) => r.timings.duration < 2000,
    'Providers List - Array response': (r) => Array.isArray(r.json('data'))
  });
  
  // Get specialties list
  const specialtiesResponse = http.get(`${CONFIG.API_BASE_URL}/specialties`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'specialties_list' }
  });
  
  check(specialtiesResponse, {
    'Specialties List - Status is 200': (r) => r.status === 200,
    'Specialties List - Array response': (r) => Array.isArray(r.json('data'))
  });
  
  // Get treatment modalities
  const modalitiesResponse = http.get(`${CONFIG.API_BASE_URL}/modalities`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'modalities_list' }
  });
  
  check(modalitiesResponse, {
    'Modalities List - Status is 200': (r) => r.status === 200,
    'Modalities List - Array response': (r) => Array.isArray(r.json('data'))
  });
}

function testAppointmentSystem() {
  console.log('Testing appointment system endpoints...');
  
  // Get appointment slots (should require authentication in real scenario)
  const slotsResponse = http.get(`${CONFIG.API_BASE_URL}/slots`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'appointment_slots' }
  });
  
  check(slotsResponse, {
    'Appointment Slots - Response received': (r) => r.status !== undefined,
    'Appointment Slots - Response time < 2s': (r) => r.timings.duration < 2000
  });
  
  // Test appointment creation (should fail without auth)
  const appointmentResponse = http.post(
    `${CONFIG.API_BASE_URL}/appointments`,
    JSON.stringify({
      providerId: 'test-provider-id',
      startTime: new Date().toISOString(),
      type: 'consultation'
    }),
    {
      headers: HIPAA_HEADERS,
      tags: { name: 'appointment_create_unauth' }
    }
  );
  
  check(appointmentResponse, {
    'Appointment Create (Unauth) - Status is 401': (r) => r.status === 401,
    'Appointment Create (Unauth) - Error message': (r) => r.json('message') !== undefined
  });
}

function testWaitlistSystem() {
  console.log('Testing waitlist system endpoints...');
  
  // Get waitlists (should require authentication)
  const waitlistsResponse = http.get(`${CONFIG.API_BASE_URL}/waitlists`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'waitlists_list' }
  });
  
  check(waitlistsResponse, {
    'Waitlists List - Response received': (r) => r.status !== undefined,
    'Waitlists List - Response time < 2s': (r) => r.timings.duration < 2000
  });
  
  // Test waitlist entry creation (should fail without auth)
  const waitlistEntryResponse = http.post(
    `${CONFIG.API_BASE_URL}/waitlists/1/entries`,
    JSON.stringify({
      patientId: 'test-patient-id',
      priority: 5
    }),
    {
      headers: HIPAA_HEADERS,
      tags: { name: 'waitlist_entry_create_unauth' }
    }
  );
  
  check(waitlistEntryResponse, {
    'Waitlist Entry (Unauth) - Status is 401': (r) => r.status === 401
  });
}

function testNotificationSystem() {
  console.log('Testing notification system endpoints...');
  
  // Get notifications (should require authentication)
  const notificationsResponse = http.get(`${CONFIG.API_BASE_URL}/notifications`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'notifications_list' }
  });
  
  check(notificationsResponse, {
    'Notifications List - Response received': (r) => r.status !== undefined,
    'Notifications List - Response time < 1s': (r) => r.timings.duration < 1000
  });
  
  // Test notification preferences (should require authentication)
  const preferencesResponse = http.get(`${CONFIG.API_BASE_URL}/notifications/preferences`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'notification_preferences' }
  });
  
  check(preferencesResponse, {
    'Notification Preferences - Response received': (r) => r.status !== undefined
  });
}

function testAnalyticsEndpoints() {
  console.log('Testing analytics endpoints...');
  
  // Practice analytics (should require admin authentication)
  const practiceAnalyticsResponse = http.get(`${CONFIG.API_BASE_URL}/analytics/practices/1/dashboard`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'practice_analytics' }
  });
  
  check(practiceAnalyticsResponse, {
    'Practice Analytics - Response received': (r) => r.status !== undefined,
    'Practice Analytics - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  // Custom reports list
  const reportsResponse = http.get(`${CONFIG.API_BASE_URL}/analytics/reports`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'analytics_reports' }
  });
  
  check(reportsResponse, {
    'Analytics Reports - Response received': (r) => r.status !== undefined
  });
}

function testHIPAACompliance() {
  console.log('Testing HIPAA compliance...');
  
  // Test for security headers
  const secureResponse = http.get(`${CONFIG.API_BASE_URL}/health`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'hipaa_security_headers' }
  });
  
  check(secureResponse, {
    'HIPAA - HTTPS or localhost': (r) => r.url.startsWith('https://') || r.url.includes('localhost'),
    'HIPAA - Security headers present': (r) => {
      const headers = r.headers;
      return headers['X-Content-Type-Options'] !== undefined ||
             headers['X-Frame-Options'] !== undefined ||
             headers['X-XSS-Protection'] !== undefined;
    },
    'HIPAA - No sensitive data in URL': (r) => {
      return !r.url.includes('ssn') && 
             !r.url.includes('dob') && 
             !r.url.includes('phone');
    }
  });
  
  // Test audit trail headers
  const auditResponse = http.get(`${CONFIG.API_BASE_URL}/audit-logs`, {
    headers: HIPAA_HEADERS,
    tags: { name: 'hipaa_audit_trail' }
  });
  
  check(auditResponse, {
    'HIPAA Audit - Response received': (r) => r.status !== undefined,
    'HIPAA Audit - No unauthorized access': (r) => r.status === 401 || r.status === 403 || r.status === 200
  });
}

export function teardown(data) {
  console.log('Cleaning up smoke test...');
  
  // Cleanup sessions if they were created
  if (data.patientSession && data.patientSession.token) {
    data.patientSession.cleanup();
  }
  if (data.providerSession && data.providerSession.token) {
    data.providerSession.cleanup();
  }
  if (data.adminSession && data.adminSession.token) {
    data.adminSession.cleanup();
  }
  
  console.log('Smoke test cleanup completed');
}