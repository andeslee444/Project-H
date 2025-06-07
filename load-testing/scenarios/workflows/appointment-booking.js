import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { CONFIG, validateHealthcareSLA, HEALTHCARE_SLAS } from '../../utils/config.js';
import { TestUserSession } from '../../utils/auth.js';
import { generateTestUser, generateTestAppointment } from '../../utils/test-data.js';

/**
 * Appointment Booking Workflow Load Test
 * 
 * Purpose: Test appointment booking system under realistic load
 * - Patient search and booking flows
 * - Provider availability management
 * - Appointment slot optimization
 * - Conflict resolution and waitlist integration
 * - Real-time availability updates
 */

// Custom metrics
const appointmentSearchRate = new Rate('appointment_search_success');
const appointmentBookingRate = new Rate('appointment_booking_success');
const appointmentModificationRate = new Rate('appointment_modification_success');
const availabilityCheckRate = new Rate('availability_check_success');
const conflictResolutionRate = new Rate('conflict_resolution_success');

const searchResponseTime = new Trend('search_response_time');
const bookingResponseTime = new Trend('booking_response_time');
const availabilityResponseTime = new Trend('availability_response_time');

const bookingConflicts = new Counter('booking_conflicts');
const waitlistAdditions = new Counter('waitlist_additions');
const appointmentCancellations = new Counter('appointment_cancellations');
const hipaaAuditEntries = new Counter('hipaa_audit_entries');

export let options = {
  scenarios: {
    patient_booking_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 8 },   // Gradual patient arrival
        { duration: '3m', target: 20 },  // Peak booking period
        { duration: '1m', target: 8 },   // Wind down
        { duration: '1m', target: 0 }    // End
      ],
      exec: 'patientBookingFlow'
    },
    provider_schedule_management: {
      executor: 'constant-vus',
      vus: 3,
      duration: '6m',
      exec: 'providerScheduleFlow'
    },
    appointment_modifications: {
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1m',
      preAllocatedVUs: 5,
      maxVUs: 15,
      stages: [
        { duration: '2m', target: 5 },   // Moderate modifications
        { duration: '2m', target: 10 },  // Peak modification period
        { duration: '2m', target: 2 }    // Wind down
      ],
      exec: 'appointmentModificationFlow'
    },
    real_time_availability: {
      executor: 'constant-arrival-rate',
      rate: 15,
      timeUnit: '1m',
      duration: '6m',
      preAllocatedVUs: 5,
      exec: 'realTimeAvailabilityFlow'
    },
    waitlist_integration: {
      executor: 'constant-vus',
      vus: 2,
      duration: '6m',
      exec: 'waitlistIntegrationFlow'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.03'],
    checks: ['rate>0.95'],
    
    // Appointment-specific thresholds
    appointment_search_success: ['rate>0.98'],
    appointment_booking_success: ['rate>0.95'],
    appointment_modification_success: ['rate>0.97'],
    availability_check_success: ['rate>0.99'],
    conflict_resolution_success: ['rate>0.90'],
    
    // Performance thresholds (Healthcare-critical)
    search_response_time: ['p(95)<1000'],
    booking_response_time: ['p(95)<2000'],
    availability_response_time: ['p(95)<500'],
    
    // Business metrics
    booking_conflicts: ['count<10'],
    waitlist_additions: ['count>0'],
    hipaa_audit_entries: ['count>0']
  }
};

// Global test data
let testData = {
  patients: [],
  providers: [],
  authenticatedSessions: {
    patients: [],
    providers: []
  }
};

export function setup() {
  console.log('Setting up appointment booking test data...');
  
  // Generate test users
  for (let i = 0; i < 25; i++) {
    testData.patients.push(generateTestUser('patient'));
  }
  
  for (let i = 0; i < 5; i++) {
    testData.providers.push(generateTestUser('provider'));
  }
  
  // Pre-authenticate some sessions for performance
  console.log('Pre-authenticating test sessions...');
  for (let i = 0; i < 10; i++) {
    try {
      const patientSession = new TestUserSession('patient');
      const patient = testData.patients[i];
      
      // Register patient
      const regResponse = http.post(
        `${CONFIG.API_BASE_URL}/auth/register`,
        JSON.stringify(patient),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (regResponse.status === 201) {
        // Login patient
        const loginResponse = http.post(
          `${CONFIG.API_BASE_URL}/auth/login`,
          JSON.stringify({
            email: patient.email,
            password: patient.password,
            userType: 'patient'
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (loginResponse.status === 200) {
          patientSession.token = loginResponse.json('data.token');
          patientSession.user = loginResponse.json('data.user');
          testData.authenticatedSessions.patients.push(patientSession);
        }
      }
      
      sleep(0.5);
    } catch (error) {
      console.warn(`Failed to pre-authenticate patient ${i}: ${error.message}`);
    }
  }
  
  // Pre-authenticate providers
  for (let i = 0; i < 3; i++) {
    try {
      const providerSession = new TestUserSession('provider');
      const provider = testData.providers[i];
      
      // Register provider
      const regResponse = http.post(
        `${CONFIG.API_BASE_URL}/auth/register`,
        JSON.stringify(provider),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (regResponse.status === 201) {
        // Login provider
        const loginResponse = http.post(
          `${CONFIG.API_BASE_URL}/auth/login`,
          JSON.stringify({
            email: provider.email,
            password: provider.password,
            userType: 'provider'
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (loginResponse.status === 200) {
          providerSession.token = loginResponse.json('data.token');
          providerSession.user = loginResponse.json('data.user');
          testData.authenticatedSessions.providers.push(providerSession);
        }
      }
      
      sleep(0.5);
    } catch (error) {
      console.warn(`Failed to pre-authenticate provider ${i}: ${error.message}`);
    }
  }
  
  console.log(`Pre-authenticated ${testData.authenticatedSessions.patients.length} patients and ${testData.authenticatedSessions.providers.length} providers`);
  
  return testData;
}

/**
 * Patient Booking Flow
 */
export function patientBookingFlow(data) {
  let patientSession;
  const startTime = Date.now();
  
  try {
    // Get a patient session
    patientSession = getPatientSession(data);
    if (!patientSession) return;
    
    // 1. Search for available providers
    const searchResults = searchProviders(patientSession);
    sleep(1);
    
    if (!searchResults || !searchResults.providers || searchResults.providers.length === 0) {
      console.warn('No providers found in search');
      return;
    }
    
    // 2. Check provider availability
    const selectedProvider = searchResults.providers[Math.floor(Math.random() * searchResults.providers.length)];
    const availabilityResults = checkProviderAvailability(patientSession, selectedProvider.id);
    sleep(1);
    
    if (!availabilityResults || !availabilityResults.slots || availabilityResults.slots.length === 0) {
      console.warn('No available slots found');
      
      // 3a. Join waitlist if no availability
      joinWaitlistFlow(patientSession, selectedProvider.id);
      return;
    }
    
    // 3b. Book available appointment
    const selectedSlot = availabilityResults.slots[Math.floor(Math.random() * availabilityResults.slots.length)];
    const bookingResult = bookAppointment(patientSession, selectedSlot);
    sleep(1);
    
    if (bookingResult && bookingResult.success) {
      // 4. Confirm appointment details
      confirmAppointmentDetails(patientSession, bookingResult.appointmentId);
      sleep(1);
      
      // 5. Optional: Modify appointment (20% chance)
      if (Math.random() > 0.8) {
        modifyAppointment(patientSession, bookingResult.appointmentId);
        sleep(1);
      }
    }
    
  } catch (error) {
    console.error(`Patient booking flow error: ${error.message}`);
    appointmentBookingRate.add(false);
  } finally {
    if (patientSession) {
      // Don't cleanup pre-authenticated sessions
      const isPreAuth = data.authenticatedSessions.patients.includes(patientSession);
      if (!isPreAuth && patientSession.token) {
        patientSession.cleanup();
      }
    }
  }
  
  sleep(Math.random() * 2 + 1); // Variable thinking time
}

/**
 * Provider Schedule Flow
 */
export function providerScheduleFlow(data) {
  let providerSession;
  
  try {
    // Get a provider session
    providerSession = getProviderSession(data);
    if (!providerSession) return;
    
    // 1. Check current schedule
    checkCurrentSchedule(providerSession);
    sleep(2);
    
    // 2. Update availability
    updateProviderAvailability(providerSession);
    sleep(1);
    
    // 3. Review appointment requests
    reviewAppointmentRequests(providerSession);
    sleep(2);
    
    // 4. Manage appointment conflicts
    manageAppointmentConflicts(providerSession);
    sleep(1);
    
    // 5. Update blocked time slots
    updateBlockedTimeSlots(providerSession);
    sleep(1);
    
  } catch (error) {
    console.error(`Provider schedule flow error: ${error.message}`);
  }
  
  sleep(3);
}

/**
 * Appointment Modification Flow
 */
export function appointmentModificationFlow(data) {
  let patientSession;
  
  try {
    // Get a patient session with existing appointment
    patientSession = getPatientSession(data);
    if (!patientSession) return;
    
    // Create a test appointment first
    const testAppointment = createTestAppointment(patientSession);
    if (!testAppointment) return;
    
    sleep(1);
    
    // Randomly choose modification type
    const modificationType = Math.random();
    
    if (modificationType < 0.4) {
      // 40% - Reschedule appointment
      rescheduleAppointment(patientSession, testAppointment.id);
    } else if (modificationType < 0.7) {
      // 30% - Cancel appointment
      cancelAppointment(patientSession, testAppointment.id);
    } else {
      // 30% - Update appointment details
      updateAppointmentDetails(patientSession, testAppointment.id);
    }
    
  } catch (error) {
    console.error(`Appointment modification flow error: ${error.message}`);
    appointmentModificationRate.add(false);
  }
  
  sleep(1);
}

/**
 * Real-time Availability Flow
 */
export function realTimeAvailabilityFlow(data) {
  try {
    // Simulate checking availability without authentication (public endpoint)
    const searchParams = {
      date: new Date().toISOString().split('T')[0],
      specialty: ['Clinical Psychology', 'Psychiatry', 'Family Therapy'][Math.floor(Math.random() * 3)]
    };
    
    const availabilityResponse = http.get(
      `${CONFIG.API_BASE_URL}/slots/available?${new URLSearchParams(searchParams)}`,
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { 
          name: 'real_time_availability_check',
          specialty: searchParams.specialty
        }
      }
    );
    
    const success = check(availabilityResponse, {
      'Real-time Availability - Status is 200': (r) => r.status === 200,
      'Real-time Availability - Response time < 500ms': (r) => r.timings.duration < 500,
      'Real-time Availability - Has slot data': (r) => {
        try {
          const data = r.json('data');
          return Array.isArray(data) || data.slots !== undefined;
        } catch (e) {
          return false;
        }
      }
    });
    
    availabilityCheckRate.add(success);
    availabilityResponseTime.add(availabilityResponse.timings.duration);
    
    if (success) {
      validateHealthcareSLA(availabilityResponse, 'CRITICAL');
    }
    
  } catch (error) {
    console.error(`Real-time availability flow error: ${error.message}`);
    availabilityCheckRate.add(false);
  }
}

/**
 * Waitlist Integration Flow
 */
export function waitlistIntegrationFlow(data) {
  let patientSession;
  
  try {
    patientSession = getPatientSession(data);
    if (!patientSession) return;
    
    // 1. Check current waitlist position
    checkWaitlistPosition(patientSession);
    sleep(1);
    
    // 2. Update waitlist preferences
    updateWaitlistPreferences(patientSession);
    sleep(1);
    
    // 3. Simulate waitlist matching notification
    simulateWaitlistMatch(patientSession);
    sleep(2);
    
  } catch (error) {
    console.error(`Waitlist integration flow error: ${error.message}`);
  }
  
  sleep(2);
}

// Helper functions

function getPatientSession(data) {
  if (data.authenticatedSessions.patients.length > 0) {
    const session = data.authenticatedSessions.patients[Math.floor(Math.random() * data.authenticatedSessions.patients.length)];
    session.refreshIfNeeded();
    return session;
  }
  
  // Fallback: create new session
  try {
    const session = new TestUserSession('patient');
    const patient = data.patients[Math.floor(Math.random() * data.patients.length)];
    
    const loginResponse = http.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      JSON.stringify({
        email: patient.email,
        password: patient.password,
        userType: 'patient'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (loginResponse.status === 200) {
      session.token = loginResponse.json('data.token');
      session.user = loginResponse.json('data.user');
      return session;
    }
  } catch (error) {
    console.error(`Failed to create patient session: ${error.message}`);
  }
  
  return null;
}

function getProviderSession(data) {
  if (data.authenticatedSessions.providers.length > 0) {
    const session = data.authenticatedSessions.providers[Math.floor(Math.random() * data.authenticatedSessions.providers.length)];
    session.refreshIfNeeded();
    return session;
  }
  
  return null;
}

function searchProviders(session) {
  const searchParams = {
    specialty: 'Clinical Psychology',
    location: 'Any',
    availableWithin: '7' // days
  };
  
  const searchResponse = http.get(
    `${CONFIG.API_BASE_URL}/providers/search?${new URLSearchParams(searchParams)}`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'search_providers' }
    }
  );
  
  const success = check(searchResponse, {
    'Provider Search - Status is 200': (r) => r.status === 200,
    'Provider Search - Response time < 1s': (r) => r.timings.duration < 1000,
    'Provider Search - Has results': (r) => {
      try {
        const data = r.json('data');
        return Array.isArray(data) && data.length > 0;
      } catch (e) {
        return false;
      }
    }
  });
  
  appointmentSearchRate.add(success);
  searchResponseTime.add(searchResponse.timings.duration);
  
  if (success) {
    return searchResponse.json('data');
  }
  
  return null;
}

function checkProviderAvailability(session, providerId) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks ahead
  
  const availabilityResponse = http.get(
    `${CONFIG.API_BASE_URL}/providers/${providerId}/availability?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'check_provider_availability', providerId: providerId }
    }
  );
  
  const success = check(availabilityResponse, {
    'Provider Availability - Status is 200': (r) => r.status === 200,
    'Provider Availability - Response time < 800ms': (r) => r.timings.duration < 800,
    'Provider Availability - Has slots': (r) => {
      try {
        const data = r.json('data');
        return data.slots !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  availabilityCheckRate.add(success);
  availabilityResponseTime.add(availabilityResponse.timings.duration);
  
  if (success) {
    return availabilityResponse.json('data');
  }
  
  return null;
}

function bookAppointment(session, slot) {
  const appointmentData = {
    slotId: slot.id,
    providerId: slot.providerId,
    startTime: slot.startTime,
    endTime: slot.endTime,
    type: 'Initial Consultation',
    notes: 'Load testing appointment',
    modality: 'In-Person'
  };
  
  const bookingResponse = http.post(
    `${CONFIG.API_BASE_URL}/appointments`,
    JSON.stringify(appointmentData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'book_appointment', providerId: slot.providerId }
    }
  );
  
  const success = check(bookingResponse, {
    'Appointment Booking - Status is 201': (r) => r.status === 201,
    'Appointment Booking - Response time < 2s': (r) => r.timings.duration < 2000,
    'Appointment Booking - Appointment ID returned': (r) => r.json('data.id') !== null,
    'Appointment Booking - HIPAA audit logged': (r) => {
      hipaaAuditEntries.add(1);
      return true;
    }
  });
  
  appointmentBookingRate.add(success);
  bookingResponseTime.add(bookingResponse.timings.duration);
  
  if (success) {
    validateHealthcareSLA(bookingResponse, 'STANDARD');
    return {
      success: true,
      appointmentId: bookingResponse.json('data.id'),
      appointment: bookingResponse.json('data')
    };
  } else if (bookingResponse.status === 409) {
    // Booking conflict
    bookingConflicts.add(1);
    console.warn('Booking conflict detected');
  }
  
  return { success: false };
}

function joinWaitlistFlow(session, providerId) {
  const waitlistData = {
    providerId: providerId,
    priority: Math.floor(Math.random() * 10) + 1,
    urgency: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredTimes: ['Morning', 'Afternoon'],
    maxWaitTime: 14 // days
  };
  
  const waitlistResponse = http.post(
    `${CONFIG.API_BASE_URL}/waitlists/1/entries`,
    JSON.stringify(waitlistData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'join_waitlist', providerId: providerId }
    }
  );
  
  const success = check(waitlistResponse, {
    'Waitlist Join - Status is 201': (r) => r.status === 201,
    'Waitlist Join - Entry ID returned': (r) => r.json('data.id') !== null
  });
  
  if (success) {
    waitlistAdditions.add(1);
    hipaaAuditEntries.add(1);
  }
  
  return success;
}

function confirmAppointmentDetails(session, appointmentId) {
  const confirmResponse = http.get(
    `${CONFIG.API_BASE_URL}/appointments/${appointmentId}`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'confirm_appointment_details', appointmentId: appointmentId }
    }
  );
  
  check(confirmResponse, {
    'Appointment Confirmation - Status is 200': (r) => r.status === 200,
    'Appointment Confirmation - Response time < 1s': (r) => r.timings.duration < 1000,
    'Appointment Confirmation - Complete details': (r) => {
      try {
        const data = r.json('data');
        return data.id && data.startTime && data.endTime && data.provider;
      } catch (e) {
        return false;
      }
    }
  });
}

function modifyAppointment(session, appointmentId) {
  const modificationData = {
    notes: 'Updated notes from load testing',
    reminderPreferences: {
      email: true,
      sms: false,
      hoursBefore: 24
    }
  };
  
  const modifyResponse = http.put(
    `${CONFIG.API_BASE_URL}/appointments/${appointmentId}`,
    JSON.stringify(modificationData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'modify_appointment', appointmentId: appointmentId }
    }
  );
  
  const success = check(modifyResponse, {
    'Appointment Modification - Status is 200': (r) => r.status === 200,
    'Appointment Modification - Response time < 1.5s': (r) => r.timings.duration < 1500
  });
  
  appointmentModificationRate.add(success);
  
  if (success) {
    hipaaAuditEntries.add(1);
  }
}

function createTestAppointment(session) {
  // Create a simple appointment for modification testing
  const appointmentData = generateTestAppointment(session.user.id, 'provider_1');
  
  const createResponse = http.post(
    `${CONFIG.API_BASE_URL}/appointments`,
    JSON.stringify(appointmentData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'create_test_appointment_for_modification' }
    }
  );
  
  if (createResponse.status === 201) {
    return createResponse.json('data');
  }
  
  return null;
}

function rescheduleAppointment(session, appointmentId) {
  const rescheduleData = {
    newStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    reason: 'Load testing reschedule'
  };
  
  const rescheduleResponse = http.post(
    `${CONFIG.API_BASE_URL}/appointments/${appointmentId}/reschedule`,
    JSON.stringify(rescheduleData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'reschedule_appointment', appointmentId: appointmentId }
    }
  );
  
  const success = check(rescheduleResponse, {
    'Appointment Reschedule - Response received': (r) => r.status !== undefined,
    'Appointment Reschedule - Response time < 2s': (r) => r.timings.duration < 2000
  });
  
  appointmentModificationRate.add(success);
  
  if (success && rescheduleResponse.status === 200) {
    hipaaAuditEntries.add(1);
  }
}

function cancelAppointment(session, appointmentId) {
  const cancelResponse = http.delete(
    `${CONFIG.API_BASE_URL}/appointments/${appointmentId}`,
    null,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'cancel_appointment', appointmentId: appointmentId }
    }
  );
  
  const success = check(cancelResponse, {
    'Appointment Cancellation - Response received': (r) => r.status !== undefined,
    'Appointment Cancellation - Response time < 1s': (r) => r.timings.duration < 1000
  });
  
  appointmentModificationRate.add(success);
  
  if (success && cancelResponse.status === 200) {
    appointmentCancellations.add(1);
    hipaaAuditEntries.add(1);
  }
}

function updateAppointmentDetails(session, appointmentId) {
  const updateData = {
    type: 'Follow-up Session',
    notes: 'Updated appointment type - load testing'
  };
  
  const updateResponse = http.put(
    `${CONFIG.API_BASE_URL}/appointments/${appointmentId}`,
    JSON.stringify(updateData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_appointment_details', appointmentId: appointmentId }
    }
  );
  
  const success = check(updateResponse, {
    'Appointment Update - Response received': (r) => r.status !== undefined
  });
  
  appointmentModificationRate.add(success);
  
  if (success && updateResponse.status === 200) {
    hipaaAuditEntries.add(1);
  }
}

// Provider-specific functions

function checkCurrentSchedule(session) {
  const scheduleResponse = http.get(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/schedule?date=${new Date().toISOString().split('T')[0]}`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'check_current_schedule', providerId: session.user.id }
    }
  );
  
  check(scheduleResponse, {
    'Provider Schedule Check - Status is 200': (r) => r.status === 200,
    'Provider Schedule Check - Response time < 1s': (r) => r.timings.duration < 1000
  });
}

function updateProviderAvailability(session) {
  const availabilityData = {
    date: new Date().toISOString().split('T')[0],
    timeSlots: [
      { startTime: '09:00', endTime: '10:00', available: true },
      { startTime: '10:00', endTime: '11:00', available: true },
      { startTime: '14:00', endTime: '15:00', available: false }
    ]
  };
  
  const updateResponse = http.put(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/availability`,
    JSON.stringify(availabilityData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_provider_availability', providerId: session.user.id }
    }
  );
  
  check(updateResponse, {
    'Provider Availability Update - Response received': (r) => r.status !== undefined
  });
}

function reviewAppointmentRequests(session) {
  const requestsResponse = http.get(
    `${CONFIG.API_BASE_URL}/appointment-requests?providerId=${session.user.id}&status=pending`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'review_appointment_requests', providerId: session.user.id }
    }
  );
  
  check(requestsResponse, {
    'Appointment Requests Review - Status is 200': (r) => r.status === 200
  });
}

function manageAppointmentConflicts(session) {
  const conflictsResponse = http.get(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/conflicts`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'manage_appointment_conflicts', providerId: session.user.id }
    }
  );
  
  const success = check(conflictsResponse, {
    'Conflict Management - Response received': (r) => r.status !== undefined
  });
  
  conflictResolutionRate.add(success);
}

function updateBlockedTimeSlots(session) {
  const blockedSlotsData = {
    date: new Date().toISOString().split('T')[0],
    blockedSlots: [
      { startTime: '12:00', endTime: '13:00', reason: 'Lunch break' }
    ]
  };
  
  const updateResponse = http.post(
    `${CONFIG.API_BASE_URL}/providers/${session.user.id}/blocked-slots`,
    JSON.stringify(blockedSlotsData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_blocked_time_slots', providerId: session.user.id }
    }
  );
  
  check(updateResponse, {
    'Blocked Slots Update - Response received': (r) => r.status !== undefined
  });
}

// Waitlist functions

function checkWaitlistPosition(session) {
  const positionResponse = http.get(
    `${CONFIG.API_BASE_URL}/patients/${session.user.id}/waitlist-position`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'check_waitlist_position', patientId: session.user.id }
    }
  );
  
  check(positionResponse, {
    'Waitlist Position Check - Response received': (r) => r.status !== undefined
  });
}

function updateWaitlistPreferences(session) {
  const preferencesData = {
    urgency: 'High',
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
    maxWaitTime: 7
  };
  
  const updateResponse = http.put(
    `${CONFIG.API_BASE_URL}/patients/${session.user.id}/waitlist-preferences`,
    JSON.stringify(preferencesData),
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'update_waitlist_preferences', patientId: session.user.id }
    }
  );
  
  check(updateResponse, {
    'Waitlist Preferences Update - Response received': (r) => r.status !== undefined
  });
}

function simulateWaitlistMatch(session) {
  const matchResponse = http.get(
    `${CONFIG.API_BASE_URL}/patients/${session.user.id}/waitlist-matches`,
    {
      headers: session.getAuthHeaders(),
      tags: { name: 'simulate_waitlist_match', patientId: session.user.id }
    }
  );
  
  check(matchResponse, {
    'Waitlist Match Simulation - Response received': (r) => r.status !== undefined
  });
}

export function teardown(data) {
  console.log('Cleaning up appointment booking test...');
  
  // Cleanup authenticated sessions
  data.authenticatedSessions.patients.forEach(session => {
    if (session && session.token) {
      session.cleanup();
    }
  });
  
  data.authenticatedSessions.providers.forEach(session => {
    if (session && session.token) {
      session.cleanup();
    }
  });
  
  console.log('Appointment booking test cleanup completed');
  console.log('Total booking conflicts:', bookingConflicts.value || 0);
  console.log('Total waitlist additions:', waitlistAdditions.value || 0);
  console.log('Total appointment cancellations:', appointmentCancellations.value || 0);
  console.log('Total HIPAA audit entries:', hipaaAuditEntries.value || 0);
}