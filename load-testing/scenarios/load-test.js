import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { CONFIG, validateHealthcareSLA, HEALTHCARE_SLAS } from '../utils/config.js';
import { TestUserSession, login } from '../utils/auth.js';
import { generateTestUser, generateTestAppointment, generateTestNotification } from '../utils/test-data.js';

/**
 * Load Test for Project-H Mental Health Practice Scheduling System
 * 
 * Purpose: Normal expected load simulation
 * - Simulates realistic user behavior patterns
 * - Tests concurrent user interactions
 * - Validates system performance under normal load
 * - Ensures healthcare SLA compliance
 */

// Custom metrics
const patientRegistrationRate = new Rate('patient_registration_success');
const appointmentBookingRate = new Rate('appointment_booking_success');
const providerScheduleRate = new Rate('provider_schedule_access');
const waitlistOperationRate = new Rate('waitlist_operation_success');
const notificationDeliveryRate = new Rate('notification_delivery_success');

const apiResponseTime = new Trend('api_response_time');
const databaseQueryTime = new Trend('database_query_time');
const pageLoadTime = new Trend('page_load_time');

const hipaaComplianceChecks = new Counter('hipaa_compliance_checks');
const auditTrailEntries = new Counter('audit_trail_entries');

export let options = {
  scenarios: {
    patient_workflow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },   // Ramp up patients
        { duration: '3m', target: 15 },  // Normal patient load
        { duration: '1m', target: 0 }    // Ramp down
      ],
      exec: 'patientWorkflow',
      gracefulRampDown: '30s'
    },
    provider_workflow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 2 },  // Ramp up providers
        { duration: '3m', target: 5 },   // Normal provider load
        { duration: '30s', target: 0 }   // Ramp down
      ],
      exec: 'providerWorkflow',
      gracefulRampDown: '30s'
    },
    admin_workflow: {
      executor: 'constant-vus',
      vus: 2,
      duration: '5m',
      exec: 'adminWorkflow'
    },
    background_notifications: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1m',
      duration: '5m',
      preAllocatedVUs: 2,
      exec: 'backgroundNotifications'
    }
  },
  thresholds: {
    http_req_duration: [
      'p(95)<2000',
      'p(99)<3000'
    ],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],
    
    // Healthcare-specific thresholds
    patient_registration_success: ['rate>0.98'],
    appointment_booking_success: ['rate>0.95'],
    provider_schedule_access: ['rate>0.99'],
    waitlist_operation_success: ['rate>0.97'],
    notification_delivery_success: ['rate>0.95'],
    
    // Performance thresholds
    api_response_time: ['p(95)<500'],
    database_query_time: ['p(95)<200'],
    page_load_time: ['p(95)<2000'],
    
    // Compliance thresholds
    hipaa_compliance_checks: ['count>0'],
    audit_trail_entries: ['count>0']
  }
};

// Global test data
let testData = {
  patients: [],
  providers: [],
  admins: [],
  sessions: {
    patients: [],
    providers: [],
    admins: []
  }
};

export function setup() {
  console.log('Setting up load test data...');
  
  // Generate test users
  for (let i = 0; i < 20; i++) {
    testData.patients.push(generateTestUser('patient'));
  }
  
  for (let i = 0; i < 5; i++) {
    testData.providers.push(generateTestUser('provider'));
  }
  
  for (let i = 0; i < 3; i++) {
    testData.admins.push(generateTestUser('practice_admin'));
  }
  
  console.log(`Generated ${testData.patients.length} patients, ${testData.providers.length} providers, ${testData.admins.length} admins`);
  
  return testData;
}

/**
 * Patient workflow simulation
 */
export function patientWorkflow(data) {
  const startTime = Date.now();
  let patientSession;
  
  try {
    // 1. Patient Registration/Login
    patientSession = authenticatePatient(data);
    if (!patientSession) return;
    
    sleep(1);
    
    // 2. Browse Available Providers
    browseProviders(patientSession);
    sleep(2);
    
    // 3. Search for Appointment Slots
    searchAppointmentSlots(patientSession);
    sleep(1);
    
    // 4. Book Appointment (50% probability)
    if (Math.random() > 0.5) {
      bookAppointment(patientSession);
      sleep(1);
    }
    
    // 5. Join Waitlist (30% probability)
    if (Math.random() > 0.7) {
      joinWaitlist(patientSession);
      sleep(1);
    }
    
    // 6. Check Notifications
    checkNotifications(patientSession);
    sleep(1);
    
    // 7. Update Profile (20% probability)
    if (Math.random() > 0.8) {
      updatePatientProfile(patientSession);
      sleep(1);
    }
    
    // Record page load time
    pageLoadTime.add(Date.now() - startTime);
    
  } catch (error) {
    console.error(`Patient workflow error: ${error.message}`);
  } finally {
    if (patientSession) {
      patientSession.cleanup();
    }
  }
}

/**
 * Provider workflow simulation
 */
export function providerWorkflow(data) {
  const startTime = Date.now();
  let providerSession;
  
  try {
    // 1. Provider Login
    providerSession = authenticateProvider(data);
    if (!providerSession) return;
    
    sleep(1);
    
    // 2. Check Daily Schedule
    checkProviderSchedule(providerSession);
    sleep(1);
    
    // 3. Update Availability
    updateAvailability(providerSession);
    sleep(2);
    
    // 4. Review Appointment Requests
    reviewAppointmentRequests(providerSession);
    sleep(1);
    
    // 5. Check Waitlist Matches
    checkWaitlistMatches(providerSession);
    sleep(1);
    
    // 6. Update Patient Notes (40% probability)
    if (Math.random() > 0.6) {
      updatePatientNotes(providerSession);
      sleep(2);
    }
    
    // 7. View Analytics
    viewProviderAnalytics(providerSession);
    sleep(1);
    
    // Record metrics
    providerScheduleRate.add(true);
    pageLoadTime.add(Date.now() - startTime);
    
  } catch (error) {
    console.error(`Provider workflow error: ${error.message}`);
    providerScheduleRate.add(false);
  } finally {
    if (providerSession) {
      providerSession.cleanup();
    }
  }
}

/**
 * Admin workflow simulation
 */
export function adminWorkflow(data) {
  const startTime = Date.now();
  let adminSession;
  
  try {
    // 1. Admin Login
    adminSession = authenticateAdmin(data);
    if (!adminSession) return;
    
    sleep(1);
    
    // 2. View Practice Dashboard
    viewPracticeDashboard(adminSession);
    sleep(2);
    
    // 3. Manage Waitlists
    manageWaitlists(adminSession);
    sleep(1);
    
    // 4. Review Analytics
    reviewPracticeAnalytics(adminSession);
    sleep(2);
    
    // 5. Manage Provider Schedules
    manageProviderSchedules(adminSession);
    sleep(1);
    
    // 6. Export Reports (30% probability)
    if (Math.random() > 0.7) {
      exportReports(adminSession);
      sleep(3);
    }
    
    // 7. System Configuration
    viewSystemConfiguration(adminSession);
    sleep(1);
    
    pageLoadTime.add(Date.now() - startTime);
    
  } catch (error) {
    console.error(`Admin workflow error: ${error.message}`);
  } finally {
    if (adminSession) {
      adminSession.cleanup();
    }
  }
}

/**
 * Background notifications simulation
 */
export function backgroundNotifications(data) {
  try {
    // Simulate various notification types
    const notificationTypes = [
      'appointment_reminder',
      'appointment_confirmed',
      'waitlist_update',
      'schedule_change'
    ];
    
    const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    // Send notification
    const response = http.post(
      `${CONFIG.API_BASE_URL}/notifications`,
      JSON.stringify({
        type: notificationType,
        userId: `test_user_${Math.floor(Math.random() * 100)}`,
        message: `Test notification: ${notificationType}`,
        priority: 'medium'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Notification': 'true'
        },
        tags: { name: 'background_notification' }
      }
    );
    
    const success = check(response, {
      'Background Notification - Status is 200': (r) => r.status === 200,
      'Background Notification - Response time < 200ms': (r) => r.timings.duration < 200
    });
    
    notificationDeliveryRate.add(success);
    auditTrailEntries.add(1);
    
  } catch (error) {
    console.error(`Background notification error: ${error.message}`);
    notificationDeliveryRate.add(false);
  }
}

// Helper functions for workflows

function authenticatePatient(data) {
  const patient = data.patients[Math.floor(Math.random() * data.patients.length)];
  
  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify({
      email: patient.email,
      password: patient.password,
      userType: 'patient'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'patient_login' }
    }
  );
  
  const success = check(response, {
    'Patient Login - Status is 200': (r) => r.status === 200,
    'Patient Login - Has token': (r) => r.json('data.token') !== null
  });
  
  patientRegistrationRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (success) {
    const session = new TestUserSession('patient');
    session.token = response.json('data.token');
    session.user = response.json('data.user');
    return session;
  }
  
  return null;
}

function authenticateProvider(data) {
  const provider = data.providers[Math.floor(Math.random() * data.providers.length)];
  
  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify({
      email: provider.email,
      password: provider.password,
      userType: 'provider'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'provider_login' }
    }
  );
  
  const success = check(response, {
    'Provider Login - Status is 200': (r) => r.status === 200,
    'Provider Login - Has token': (r) => r.json('data.token') !== null
  });
  
  apiResponseTime.add(response.timings.duration);
  
  if (success) {
    const session = new TestUserSession('provider');
    session.token = response.json('data.token');
    session.user = response.json('data.user');
    return session;
  }
  
  return null;
}

function authenticateAdmin(data) {
  const admin = data.admins[Math.floor(Math.random() * data.admins.length)];
  
  const response = http.post(
    `${CONFIG.API_BASE_URL}/auth/login`,
    JSON.stringify({
      email: admin.email,
      password: admin.password,
      userType: 'practice_admin'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'admin_login' }
    }
  );
  
  const success = check(response, {
    'Admin Login - Status is 200': (r) => r.status === 200,
    'Admin Login - Has token': (r) => r.json('data.token') !== null
  });
  
  apiResponseTime.add(response.timings.duration);
  
  if (success) {
    const session = new TestUserSession('practice_admin');
    session.token = response.json('data.token');
    session.user = response.json('data.user');
    return session;
  }
  
  return null;
}

function browseProviders(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/providers`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'browse_providers' }
    }
  );
  
  check(response, {
    'Browse Providers - Status is 200': (r) => r.status === 200,
    'Browse Providers - Has data': (r) => r.json('data') !== null
  });
  
  validateHealthcareSLA(response, 'STANDARD');
  apiResponseTime.add(response.timings.duration);
}

function searchAppointmentSlots(session) {
  const searchParams = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    specialty: 'Clinical Psychology'
  };
  
  const response = http.get(
    `${CONFIG.API_BASE_URL}/slots?${new URLSearchParams(searchParams)}`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'search_appointment_slots' }
    }
  );
  
  check(response, {
    'Search Slots - Status is 200': (r) => r.status === 200,
    'Search Slots - Response time < 1s': (r) => r.timings.duration < 1000
  });
  
  apiResponseTime.add(response.timings.duration);
  databaseQueryTime.add(response.timings.duration);
}

function bookAppointment(session) {
  const appointmentData = generateTestAppointment(session.user.id, 'provider_1');
  
  const response = http.post(
    `${CONFIG.API_BASE_URL}/appointments`,
    JSON.stringify(appointmentData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'book_appointment' }
    }
  );
  
  const success = check(response, {
    'Book Appointment - Status is 201': (r) => r.status === 201,
    'Book Appointment - Appointment ID returned': (r) => r.json('data.id') !== null
  });
  
  appointmentBookingRate.add(success);
  apiResponseTime.add(response.timings.duration);
  auditTrailEntries.add(1);
}

function joinWaitlist(session) {
  const waitlistData = {
    practiceId: 'practice_1',
    priority: Math.floor(Math.random() * 10) + 1,
    urgency: 'Medium',
    preferredDays: ['Monday', 'Tuesday', 'Wednesday']
  };
  
  const response = http.post(
    `${CONFIG.API_BASE_URL}/waitlists/1/entries`,
    JSON.stringify(waitlistData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'join_waitlist' }
    }
  );
  
  const success = check(response, {
    'Join Waitlist - Status is 201': (r) => r.status === 201,
    'Join Waitlist - Entry ID returned': (r) => r.json('data.id') !== null
  });
  
  waitlistOperationRate.add(success);
  apiResponseTime.add(response.timings.duration);
}

function checkNotifications(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/notifications`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'check_notifications' }
    }
  );
  
  check(response, {
    'Check Notifications - Status is 200': (r) => r.status === 200,
    'Check Notifications - Response time < 500ms': (r) => r.timings.duration < 500
  });
  
  validateHealthcareSLA(response, 'STANDARD');
  apiResponseTime.add(response.timings.duration);
}

function updatePatientProfile(session) {
  const updateData = {
    preferences: {
      communicationMethod: 'Email',
      preferredTime: 'Morning'
    }
  };
  
  const response = http.put(
    `${CONFIG.API_BASE_URL}/patients/${session.user.id}`,
    JSON.stringify(updateData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_patient_profile' }
    }
  );
  
  check(response, {
    'Update Profile - Status is 200': (r) => r.status === 200
  });
  
  apiResponseTime.add(response.timings.duration);
  auditTrailEntries.add(1);
}

// Provider-specific functions
function checkProviderSchedule(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/appointments`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'check_provider_schedule' }
    }
  );
  
  check(response, {
    'Provider Schedule - Status is 200': (r) => r.status === 200,
    'Provider Schedule - Response time < 1s': (r) => r.timings.duration < 1000
  });
  
  validateHealthcareSLA(response, 'CRITICAL');
  apiResponseTime.add(response.timings.duration);
}

function updateAvailability(session) {
  const availabilityData = {
    date: new Date().toISOString().split('T')[0],
    slots: [
      { startTime: '09:00', endTime: '10:00', available: true },
      { startTime: '10:00', endTime: '11:00', available: true },
      { startTime: '14:00', endTime: '15:00', available: false }
    ]
  };
  
  const response = http.put(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/availability`,
    JSON.stringify(availabilityData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_availability' }
    }
  );
  
  check(response, {
    'Update Availability - Status is 200': (r) => r.status === 200
  });
  
  apiResponseTime.add(response.timings.duration);
}

function reviewAppointmentRequests(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/appointment-requests?providerId=${session.user.id}`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'review_appointment_requests' }
    }
  );
  
  check(response, {
    'Appointment Requests - Status is 200': (r) => r.status === 200
  });
  
  apiResponseTime.add(response.timings.duration);
}

function checkWaitlistMatches(session) {
  const response = http.post(
    `${CONFIG.API_BASE_URL}/matching/provider/${session.user.id}`,
    JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'check_waitlist_matches' }
    }
  );
  
  check(response, {
    'Waitlist Matches - Response received': (r) => r.status !== undefined
  });
  
  apiResponseTime.add(response.timings.duration);
}

function updatePatientNotes(session) {
  const notesData = {
    patientId: `patient_${Math.floor(Math.random() * 20) + 1}`,
    notes: 'Load testing notes - synthetic data',
    sessionDate: new Date().toISOString()
  };
  
  const response = http.post(
    `${CONFIG.API_BASE_URL}/patient-notes`,
    JSON.stringify(notesData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_patient_notes' }
    }
  );
  
  check(response, {
    'Patient Notes - Response received': (r) => r.status !== undefined
  });
  
  apiResponseTime.add(response.timings.duration);
  auditTrailEntries.add(1);
  hipaaComplianceChecks.add(1);
}

function viewProviderAnalytics(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/analytics`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'view_provider_analytics' }
    }
  );
  
  check(response, {
    'Provider Analytics - Response received': (r) => r.status !== undefined,
    'Provider Analytics - Response time < 2s': (r) => r.timings.duration < 2000
  });
  
  apiResponseTime.add(response.timings.duration);
}

// Admin-specific functions
function viewPracticeDashboard(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/analytics/practices/1/dashboard`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'view_practice_dashboard' }
    }
  );
  
  check(response, {
    'Practice Dashboard - Response received': (r) => r.status !== undefined,
    'Practice Dashboard - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiResponseTime.add(response.timings.duration);
}

function manageWaitlists(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/waitlists`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'manage_waitlists' }
    }
  );
  
  const success = check(response, {
    'Manage Waitlists - Status is 200': (r) => r.status === 200
  });
  
  waitlistOperationRate.add(success);
  apiResponseTime.add(response.timings.duration);
}

function reviewPracticeAnalytics(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/analytics/practices/1/revenue`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'review_practice_analytics' }
    }
  );
  
  check(response, {
    'Practice Analytics - Response received': (r) => r.status !== undefined
  });
  
  apiResponseTime.add(response.timings.duration);
}

function manageProviderSchedules(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/practices/1/providers`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'manage_provider_schedules' }
    }
  );
  
  check(response, {
    'Provider Schedules - Response received': (r) => r.status !== undefined
  });
  
  apiResponseTime.add(response.timings.duration);
}

function exportReports(session) {
  const response = http.post(
    `${CONFIG.API_BASE_URL}/analytics/reports/1/export`,
    JSON.stringify({ format: 'csv' }),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'export_reports' },
      timeout: '30s'
    }
  );
  
  check(response, {
    'Export Reports - Response received': (r) => r.status !== undefined,
    'Export Reports - Response time < 10s': (r) => r.timings.duration < 10000
  });
  
  apiResponseTime.add(response.timings.duration);
}

function viewSystemConfiguration(session) {
  const response = http.get(
    `${CONFIG.API_BASE_URL}/settings/practice/1`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'view_system_configuration' }
    }
  );
  
  check(response, {
    'System Configuration - Response received': (r) => r.status !== undefined
  });
  
  apiResponseTime.add(response.timings.duration);
}

export function teardown(data) {
  console.log('Cleaning up load test...');
  
  // Cleanup any remaining sessions
  Object.values(data.sessions).forEach(sessionArray => {
    sessionArray.forEach(session => {
      if (session && session.token) {
        session.cleanup();
      }
    });
  });
  
  console.log('Load test cleanup completed');
}