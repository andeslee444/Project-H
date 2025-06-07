/**
 * Test data generation utilities
 * Generates HIPAA-compliant synthetic data for load testing
 */

/**
 * Synthetic patient names (no real names used)
 */
const SYNTHETIC_FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Sage', 'River', 'Phoenix', 'Blake', 'Cameron', 'Emerson', 'Harper', 'Skyler'
];

const SYNTHETIC_LAST_NAMES = [
  'TestPatient', 'LoadTest', 'SyntheticUser', 'TestCase', 'MockData',
  'ValidationTest', 'SystemTest', 'PerformanceTest', 'IntegrationTest', 'SampleUser'
];

/**
 * Healthcare specialties for providers
 */
const HEALTHCARE_SPECIALTIES = [
  'Clinical Psychology',
  'Psychiatry',
  'Marriage and Family Therapy',
  'Substance Abuse Counseling',
  'Child and Adolescent Psychology',
  'Geriatric Psychology',
  'Trauma Therapy',
  'Cognitive Behavioral Therapy',
  'Group Therapy',
  'Crisis Intervention'
];

/**
 * Treatment modalities
 */
const TREATMENT_MODALITIES = [
  'Individual Therapy',
  'Group Therapy',
  'Family Therapy',
  'Couples Therapy',
  'Cognitive Behavioral Therapy (CBT)',
  'Dialectical Behavior Therapy (DBT)',
  'Eye Movement Desensitization and Reprocessing (EMDR)',
  'Psychodynamic Therapy',
  'Solution-Focused Brief Therapy',
  'Mindfulness-Based Therapy'
];

/**
 * Insurance providers (synthetic)
 */
const INSURANCE_PROVIDERS = [
  'Test Health Insurance',
  'Sample Coverage Plan',
  'Mock Insurance Co',
  'Synthetic Benefits',
  'Load Test Insurance',
  'Performance Test Coverage'
];

/**
 * Generate a random element from an array
 */
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random number between min and max
 */
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a synthetic email address
 */
function generateSyntheticEmail(firstName, lastName, domain = 'loadtest.local') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}.${random}@${domain}`;
}

/**
 * Generate a synthetic phone number (test format)
 */
function generateSyntheticPhone() {
  return `555-${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`;
}

/**
 * Generate synthetic date of birth (18-80 years ago)
 */
function generateSyntheticDOB() {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - randomNumber(18, 80);
  const month = randomNumber(1, 12);
  const day = randomNumber(1, 28); // Safe day range for all months
  
  return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Generate synthetic address
 */
function generateSyntheticAddress() {
  const streetNumbers = randomNumber(100, 9999);
  const streetNames = ['Test St', 'Sample Ave', 'Mock Blvd', 'Load Dr', 'Performance Way'];
  const cities = ['Testville', 'Sampletown', 'Mocksburg', 'Loadcity', 'Testopolis'];
  const states = ['TS', 'SM', 'MK', 'LD', 'PF']; // Synthetic state codes
  
  return {
    street: `${streetNumbers} ${randomElement(streetNames)}`,
    city: randomElement(cities),
    state: randomElement(states),
    zipCode: `${randomNumber(10000, 99999)}`
  };
}

/**
 * Generate a test patient
 */
export function generateTestPatient() {
  const firstName = randomElement(SYNTHETIC_FIRST_NAMES);
  const lastName = randomElement(SYNTHETIC_LAST_NAMES);
  const address = generateSyntheticAddress();
  
  return {
    firstName: firstName,
    lastName: lastName,
    email: generateSyntheticEmail(firstName, lastName),
    phone: generateSyntheticPhone(),
    dateOfBirth: generateSyntheticDOB(),
    gender: randomElement(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
    address: address,
    emergencyContact: {
      name: `${randomElement(SYNTHETIC_FIRST_NAMES)} ${randomElement(SYNTHETIC_LAST_NAMES)}`,
      phone: generateSyntheticPhone(),
      relationship: randomElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
    },
    insurance: {
      provider: randomElement(INSURANCE_PROVIDERS),
      policyNumber: `TEST-${randomNumber(100000, 999999)}`,
      groupNumber: `GRP-${randomNumber(1000, 9999)}`
    },
    medicalHistory: {
      currentMedications: [],
      allergies: [],
      previousTherapy: Math.random() > 0.5,
      diagnosisHistory: []
    },
    preferences: {
      preferredDay: randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      preferredTime: randomElement(['Morning', 'Afternoon', 'Evening']),
      communicationMethod: randomElement(['Email', 'Phone', 'SMS']),
      specialRequests: ''
    }
  };
}

/**
 * Generate a test provider
 */
export function generateTestProvider() {
  const firstName = randomElement(SYNTHETIC_FIRST_NAMES);
  const lastName = randomElement(SYNTHETIC_LAST_NAMES);
  const address = generateSyntheticAddress();
  
  return {
    firstName: firstName,
    lastName: lastName,
    email: generateSyntheticEmail(firstName, lastName, 'provider.loadtest.local'),
    phone: generateSyntheticPhone(),
    title: randomElement(['Dr.', 'LCSW', 'LMFT', 'LPC', 'PhD']),
    license: {
      number: `LIC-${randomNumber(10000, 99999)}`,
      state: address.state,
      expirationDate: '2025-12-31'
    },
    specialties: [
      randomElement(HEALTHCARE_SPECIALTIES),
      ...(Math.random() > 0.5 ? [randomElement(HEALTHCARE_SPECIALTIES)] : [])
    ],
    modalities: [
      randomElement(TREATMENT_MODALITIES),
      randomElement(TREATMENT_MODALITIES)
    ],
    credentials: [
      'Licensed Clinical Social Worker',
      'Certified in Trauma Therapy'
    ],
    availability: {
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      lunchBreak: {
        start: '12:00',
        end: '13:00'
      }
    },
    rates: {
      individualSession: randomNumber(100, 200),
      groupSession: randomNumber(60, 120),
      familySession: randomNumber(120, 250)
    }
  };
}

/**
 * Generate a test practice admin
 */
export function generateTestPracticeAdmin() {
  const firstName = randomElement(SYNTHETIC_FIRST_NAMES);
  const lastName = randomElement(SYNTHETIC_LAST_NAMES);
  
  return {
    firstName: firstName,
    lastName: lastName,
    email: generateSyntheticEmail(firstName, lastName, 'admin.loadtest.local'),
    phone: generateSyntheticPhone(),
    role: 'practice_admin',
    permissions: [
      'manage_providers',
      'manage_schedules',
      'view_analytics',
      'manage_waitlists',
      'export_reports'
    ]
  };
}

/**
 * Generate a test user based on type
 */
export function generateTestUser(userType = 'patient') {
  const baseUser = {
    password: 'TestPassword123!',
    userType: userType,
    isTestUser: true,
    createdAt: new Date().toISOString()
  };

  switch (userType) {
    case 'patient':
      return { ...baseUser, ...generateTestPatient() };
    case 'provider':
      return { ...baseUser, ...generateTestProvider() };
    case 'practice_admin':
      return { ...baseUser, ...generateTestPracticeAdmin() };
    default:
      return { ...baseUser, ...generateTestPatient() };
  }
}

/**
 * Generate test appointment data
 */
export function generateTestAppointment(patientId, providerId) {
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + randomNumber(1, 30)); // 1-30 days from now
  startTime.setHours(randomNumber(9, 16), randomNumber(0, 1) * 30, 0, 0); // 9 AM - 4:30 PM, 30-min intervals
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + randomNumber(45, 90)); // 45-90 minute sessions
  
  return {
    patientId: patientId,
    providerId: providerId,
    type: randomElement(['Initial Consultation', 'Follow-up', 'Therapy Session', 'Assessment']),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'scheduled',
    notes: 'Load testing appointment - synthetic data',
    modality: randomElement(TREATMENT_MODALITIES),
    location: randomElement(['Office', 'Telehealth', 'Home Visit']),
    isRecurring: Math.random() > 0.7,
    recurringPattern: Math.random() > 0.7 ? randomElement(['Weekly', 'Bi-weekly', 'Monthly']) : null
  };
}

/**
 * Generate test waitlist entry
 */
export function generateTestWaitlistEntry(patientId, practiceId) {
  return {
    patientId: patientId,
    practiceId: practiceId,
    priority: randomNumber(1, 10),
    urgency: randomElement(['Low', 'Medium', 'High', 'Urgent']),
    preferredProviders: [],
    preferredTimeSlots: [
      randomElement(['Morning', 'Afternoon', 'Evening'])
    ],
    preferredDays: [
      randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    ],
    maxWaitTime: randomNumber(7, 30), // days
    notes: 'Load testing waitlist entry - synthetic data',
    addedAt: new Date().toISOString(),
    estimatedWaitTime: randomNumber(3, 21) // days
  };
}

/**
 * Generate test notification
 */
export function generateTestNotification(userId, userType) {
  const notificationTypes = {
    patient: [
      'appointment_reminder',
      'appointment_confirmed',
      'appointment_cancelled',
      'waitlist_update',
      'treatment_plan_update'
    ],
    provider: [
      'new_appointment',
      'appointment_cancelled',
      'schedule_change',
      'waitlist_match',
      'patient_message'
    ],
    practice_admin: [
      'new_patient_registration',
      'provider_schedule_update',
      'system_alert',
      'report_ready',
      'compliance_reminder'
    ]
  };
  
  const type = randomElement(notificationTypes[userType] || notificationTypes.patient);
  
  return {
    userId: userId,
    type: type,
    title: `Test Notification - ${type}`,
    message: `This is a synthetic notification for load testing purposes. Type: ${type}`,
    priority: randomElement(['low', 'medium', 'high']),
    isRead: false,
    createdAt: new Date().toISOString(),
    scheduledFor: new Date().toISOString(),
    channel: randomElement(['email', 'sms', 'in_app', 'push'])
  };
}

/**
 * Generate batch test data
 */
export function generateBatchTestData(counts = {}) {
  const defaultCounts = {
    patients: 100,
    providers: 10,
    admins: 5,
    appointments: 200,
    waitlistEntries: 50,
    notifications: 300
  };
  
  const actualCounts = { ...defaultCounts, ...counts };
  const data = {
    patients: [],
    providers: [],
    admins: [],
    appointments: [],
    waitlistEntries: [],
    notifications: []
  };
  
  // Generate patients
  for (let i = 0; i < actualCounts.patients; i++) {
    data.patients.push(generateTestUser('patient'));
  }
  
  // Generate providers
  for (let i = 0; i < actualCounts.providers; i++) {
    data.providers.push(generateTestUser('provider'));
  }
  
  // Generate admins
  for (let i = 0; i < actualCounts.admins; i++) {
    data.admins.push(generateTestUser('practice_admin'));
  }
  
  // Generate appointments (requires patient and provider IDs)
  for (let i = 0; i < actualCounts.appointments; i++) {
    const patientId = `patient_${randomNumber(1, actualCounts.patients)}`;
    const providerId = `provider_${randomNumber(1, actualCounts.providers)}`;
    data.appointments.push(generateTestAppointment(patientId, providerId));
  }
  
  // Generate waitlist entries
  for (let i = 0; i < actualCounts.waitlistEntries; i++) {
    const patientId = `patient_${randomNumber(1, actualCounts.patients)}`;
    const practiceId = `practice_1`;
    data.waitlistEntries.push(generateTestWaitlistEntry(patientId, practiceId));
  }
  
  // Generate notifications
  for (let i = 0; i < actualCounts.notifications; i++) {
    const userType = randomElement(['patient', 'provider', 'practice_admin']);
    const userId = `${userType}_${randomNumber(1, actualCounts[userType + 's'] || actualCounts.patients)}`;
    data.notifications.push(generateTestNotification(userId, userType));
  }
  
  return data;
}

/**
 * Generate realistic session data
 */
export function generateSessionData() {
  return {
    sessionId: `session_${Date.now()}_${randomNumber(1000, 9999)}`,
    startTime: new Date().toISOString(),
    userAgent: 'K6 Load Testing Agent',
    ipAddress: `192.168.1.${randomNumber(1, 254)}`,
    location: randomElement(['Office', 'Home', 'Mobile']),
    device: randomElement(['Desktop', 'Tablet', 'Mobile']),
    browser: randomElement(['Chrome', 'Firefox', 'Safari', 'Edge'])
  };
}