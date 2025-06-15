#!/usr/bin/env node

/**
 * Test Data Setup Script for Project-H Load Testing
 * 
 * Creates synthetic, HIPAA-compliant test data for load testing scenarios
 * Generates users, appointments, and other test fixtures
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_CONFIG = {
  outputDir: './data',
  users: {
    patients: 500,
    providers: 25,
    admins: 10
  },
  appointments: 1000,
  waitlistEntries: 200,
  notifications: 500
};

// Healthcare-specific test data
const HEALTHCARE_DATA = {
  specialties: [
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
  ],
  
  modalities: [
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
  ],
  
  appointmentTypes: [
    'Initial Consultation',
    'Follow-up Session',
    'Therapy Session',
    'Assessment',
    'Group Session',
    'Crisis Intervention',
    'Medication Management',
    'Family Session'
  ],
  
  urgencyLevels: ['Low', 'Medium', 'High', 'Urgent'],
  
  communicationMethods: ['Email', 'Phone', 'SMS', 'Portal'],
  
  insuranceProviders: [
    'Test Health Insurance',
    'Sample Coverage Plan',
    'Mock Insurance Co',
    'Synthetic Benefits',
    'Load Test Insurance',
    'Performance Test Coverage'
  ]
};

// Synthetic names (no real names to ensure HIPAA compliance)
const SYNTHETIC_NAMES = {
  firstNames: [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
    'Sage', 'River', 'Phoenix', 'Blake', 'Cameron', 'Emerson', 'Harper', 'Skyler',
    'Drew', 'Finley', 'Hayden', 'Kendall', 'Logan', 'Marley', 'Parker', 'Reese'
  ],
  
  lastNames: [
    'TestPatient', 'LoadTest', 'SyntheticUser', 'TestCase', 'MockData',
    'ValidationTest', 'SystemTest', 'PerformanceTest', 'IntegrationTest', 'SampleUser',
    'BenchmarkUser', 'StressTest', 'SimulationUser', 'TestScenario', 'MockPatient'
  ]
};

class TestDataGenerator {
  constructor() {
    this.generatedData = {
      patients: [],
      providers: [],
      admins: [],
      appointments: [],
      waitlistEntries: [],
      notifications: [],
      practices: [],
      schedules: []
    };
    
    this.idCounters = {
      user: 1,
      appointment: 1,
      waitlist: 1,
      notification: 1,
      practice: 1
    };
  }

  async generate() {
    console.log('Generating HIPAA-compliant test data...');
    
    try {
      await this.setupDirectories();
      
      this.generatePractices();
      this.generateUsers();
      this.generateAppointments();
      this.generateWaitlistEntries();
      this.generateNotifications();
      this.generateSchedules();
      
      await this.saveData();
      await this.generateCredentialsFile();
      
      console.log('Test data generation completed successfully');
      console.log(`Generated data saved to: ${DATA_CONFIG.outputDir}`);
      
      this.printSummary();
      
    } catch (error) {
      console.error('Failed to generate test data:', error.message);
      throw error;
    }
  }

  async setupDirectories() {
    const dirs = [
      DATA_CONFIG.outputDir,
      path.join(DATA_CONFIG.outputDir, 'users'),
      path.join(DATA_CONFIG.outputDir, 'appointments'),
      path.join(DATA_CONFIG.outputDir, 'credentials')
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
    }
  }

  generatePractices() {
    console.log('Generating test practices...');
    
    const practice = {
      id: `practice_${this.idCounters.practice++}`,
      name: 'Mental Health Solutions Test Practice',
      address: {
        street: '123 Test Medical Center Dr',
        city: 'Testville',
        state: 'TS',
        zipCode: '12345'
      },
      phone: '555-123-4567',
      email: 'admin@testhealthpractice.local',
      website: 'https://test-practice.local',
      specialties: HEALTHCARE_DATA.specialties,
      isTestPractice: true,
      hipaaCompliant: true,
      createdAt: new Date().toISOString()
    };
    
    this.generatedData.practices.push(practice);
  }

  generateUsers() {
    console.log('Generating test users...');
    
    // Generate patients
    for (let i = 0; i < DATA_CONFIG.users.patients; i++) {
      this.generatedData.patients.push(this.generatePatient());
    }
    
    // Generate providers
    for (let i = 0; i < DATA_CONFIG.users.providers; i++) {
      this.generatedData.providers.push(this.generateProvider());
    }
    
    // Generate admins
    for (let i = 0; i < DATA_CONFIG.users.admins; i++) {
      this.generatedData.admins.push(this.generateAdmin());
    }
  }

  generatePatient() {
    const firstName = this.randomElement(SYNTHETIC_NAMES.firstNames);
    const lastName = this.randomElement(SYNTHETIC_NAMES.lastNames);
    const userId = `patient_${this.idCounters.user++}`;
    
    return {
      id: userId,
      userType: 'patient',
      firstName,
      lastName,
      email: this.generateSyntheticEmail(firstName, lastName, 'patient'),
      password: 'TestPassword123!',
      phone: this.generateSyntheticPhone(),
      dateOfBirth: this.generateSyntheticDOB(),
      gender: this.randomElement(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
      address: this.generateSyntheticAddress(),
      emergencyContact: {
        name: `${this.randomElement(SYNTHETIC_NAMES.firstNames)} ${this.randomElement(SYNTHETIC_NAMES.lastNames)}`,
        phone: this.generateSyntheticPhone(),
        relationship: this.randomElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
      },
      insurance: {
        provider: this.randomElement(HEALTHCARE_DATA.insuranceProviders),
        policyNumber: `TEST-${this.randomNumber(100000, 999999)}`,
        groupNumber: `GRP-${this.randomNumber(1000, 9999)}`
      },
      preferences: {
        preferredDay: this.randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        preferredTime: this.randomElement(['Morning', 'Afternoon', 'Evening']),
        communicationMethod: this.randomElement(HEALTHCARE_DATA.communicationMethods)
      },
      isTestUser: true,
      hipaaConsent: true,
      createdAt: new Date().toISOString()
    };
  }

  generateProvider() {
    const firstName = this.randomElement(SYNTHETIC_NAMES.firstNames);
    const lastName = this.randomElement(SYNTHETIC_NAMES.lastNames);
    const userId = `provider_${this.idCounters.user++}`;
    
    return {
      id: userId,
      userType: 'provider',
      firstName,
      lastName,
      email: this.generateSyntheticEmail(firstName, lastName, 'provider'),
      password: 'TestPassword123!',
      phone: this.generateSyntheticPhone(),
      title: this.randomElement(['Dr.', 'LCSW', 'LMFT', 'LPC', 'PhD']),
      license: {
        number: `LIC-${this.randomNumber(10000, 99999)}`,
        state: 'TS',
        expirationDate: '2025-12-31'
      },
      specialties: this.randomElements(HEALTHCARE_DATA.specialties, 1, 3),
      modalities: this.randomElements(HEALTHCARE_DATA.modalities, 2, 4),
      credentials: [
        'Licensed Mental Health Professional',
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
        individualSession: this.randomNumber(100, 200),
        groupSession: this.randomNumber(60, 120),
        familySession: this.randomNumber(120, 250)
      },
      practiceId: 'practice_1',
      isTestUser: true,
      createdAt: new Date().toISOString()
    };
  }

  generateAdmin() {
    const firstName = this.randomElement(SYNTHETIC_NAMES.firstNames);
    const lastName = this.randomElement(SYNTHETIC_NAMES.lastNames);
    const userId = `admin_${this.idCounters.user++}`;
    
    return {
      id: userId,
      userType: 'practice_admin',
      firstName,
      lastName,
      email: this.generateSyntheticEmail(firstName, lastName, 'admin'),
      password: 'TestPassword123!',
      phone: this.generateSyntheticPhone(),
      role: 'practice_admin',
      permissions: [
        'manage_providers',
        'manage_schedules',
        'view_analytics',
        'manage_waitlists',
        'export_reports',
        'manage_users'
      ],
      practiceId: 'practice_1',
      isTestUser: true,
      createdAt: new Date().toISOString()
    };
  }

  generateAppointments() {
    console.log('Generating test appointments...');
    
    for (let i = 0; i < DATA_CONFIG.appointments; i++) {
      const patientId = this.randomElement(this.generatedData.patients).id;
      const providerId = this.randomElement(this.generatedData.providers).id;
      
      this.generatedData.appointments.push(this.generateAppointment(patientId, providerId));
    }
  }

  generateAppointment(patientId, providerId) {
    const appointmentId = `appointment_${this.idCounters.appointment++}`;
    const startTime = this.generateFutureDateTime();
    const endTime = new Date(startTime.getTime() + this.randomNumber(45, 90) * 60 * 1000);
    
    return {
      id: appointmentId,
      patientId,
      providerId,
      practiceId: 'practice_1',
      type: this.randomElement(HEALTHCARE_DATA.appointmentTypes),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: this.randomElement(['scheduled', 'confirmed', 'cancelled', 'completed']),
      modality: this.randomElement(HEALTHCARE_DATA.modalities),
      location: this.randomElement(['Office', 'Telehealth']),
      notes: 'Load testing appointment - synthetic data',
      isRecurring: Math.random() > 0.8,
      recurringPattern: Math.random() > 0.7 ? this.randomElement(['Weekly', 'Bi-weekly', 'Monthly']) : null,
      createdAt: new Date().toISOString(),
      isTestAppointment: true
    };
  }

  generateWaitlistEntries() {
    console.log('Generating waitlist entries...');
    
    for (let i = 0; i < DATA_CONFIG.waitlistEntries; i++) {
      const patientId = this.randomElement(this.generatedData.patients).id;
      
      this.generatedData.waitlistEntries.push(this.generateWaitlistEntry(patientId));
    }
  }

  generateWaitlistEntry(patientId) {
    const entryId = `waitlist_${this.idCounters.waitlist++}`;
    
    return {
      id: entryId,
      patientId,
      practiceId: 'practice_1',
      priority: this.randomNumber(1, 10),
      urgency: this.randomElement(HEALTHCARE_DATA.urgencyLevels),
      preferredProviders: this.randomElements(
        this.generatedData.providers.map(p => p.id), 
        0, 
        3
      ),
      preferredSpecialties: this.randomElements(HEALTHCARE_DATA.specialties, 1, 2),
      preferredTimeSlots: this.randomElements(['Morning', 'Afternoon', 'Evening'], 1, 2),
      preferredDays: this.randomElements(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 1, 3),
      maxWaitTime: this.randomNumber(7, 30),
      notes: 'Load testing waitlist entry - synthetic data',
      addedAt: new Date().toISOString(),
      estimatedWaitTime: this.randomNumber(3, 21),
      isTestEntry: true
    };
  }

  generateNotifications() {
    console.log('Generating test notifications...');
    
    for (let i = 0; i < DATA_CONFIG.notifications; i++) {
      const userType = this.randomElement(['patient', 'provider', 'practice_admin']);
      const users = this.generatedData[userType + 's'] || this.generatedData.patients;
      const userId = this.randomElement(users).id;
      
      this.generatedData.notifications.push(this.generateNotification(userId, userType));
    }
  }

  generateNotification(userId, userType) {
    const notificationId = `notification_${this.idCounters.notification++}`;
    
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
    
    const type = this.randomElement(notificationTypes[userType] || notificationTypes.patient);
    
    return {
      id: notificationId,
      userId,
      userType,
      type,
      title: `Test Notification - ${type}`,
      message: `This is a synthetic notification for load testing purposes. Type: ${type}`,
      priority: this.randomElement(['low', 'medium', 'high']),
      isRead: Math.random() > 0.7,
      channel: this.randomElement(HEALTHCARE_DATA.communicationMethods.map(m => m.toLowerCase())),
      createdAt: new Date().toISOString(),
      scheduledFor: this.generateFutureDateTime(24).toISOString(),
      isTestNotification: true
    };
  }

  generateSchedules() {
    console.log('Generating provider schedules...');
    
    for (const provider of this.generatedData.providers) {
      const schedule = this.generateProviderSchedule(provider.id);
      this.generatedData.schedules.push(schedule);
    }
  }

  generateProviderSchedule(providerId) {
    const schedule = {
      providerId,
      practiceId: 'practice_1',
      availability: []
    };
    
    // Generate 2 weeks of availability
    for (let day = 0; day < 14; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      
      if (date.getDay() >= 1 && date.getDay() <= 5) { // Monday to Friday
        schedule.availability.push({
          date: date.toISOString().split('T')[0],
          timeSlots: this.generateDayTimeSlots()
        });
      }
    }
    
    return schedule;
  }

  generateDayTimeSlots() {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Skip lunch hour (12-1 PM)
      if (hour === 12) continue;
      
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // 70% chance of being available
        slotType: 'regular'
      });
    }
    
    return slots;
  }

  // Utility methods
  randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomElements(array, min, max) {
    const count = this.randomNumber(min, max);
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateSyntheticEmail(firstName, lastName, domain) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}.${random}@${domain}.loadtest.local`;
  }

  generateSyntheticPhone() {
    return `555-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`;
  }

  generateSyntheticDOB() {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - this.randomNumber(18, 80);
    const month = this.randomNumber(1, 12);
    const day = this.randomNumber(1, 28);
    
    return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  generateSyntheticAddress() {
    const streetNumbers = this.randomNumber(100, 9999);
    const streetNames = ['Test St', 'Sample Ave', 'Mock Blvd', 'Load Dr', 'Performance Way'];
    const cities = ['Testville', 'Sampletown', 'Mocksburg', 'Loadcity', 'Testopolis'];
    
    return {
      street: `${streetNumbers} ${this.randomElement(streetNames)}`,
      city: this.randomElement(cities),
      state: 'TS',
      zipCode: `${this.randomNumber(10000, 99999)}`
    };
  }

  generateFutureDateTime(maxDaysAhead = 30) {
    const daysAhead = this.randomNumber(1, maxDaysAhead);
    const hoursAhead = this.randomNumber(9, 17); // Business hours
    const minutesAhead = this.randomElement([0, 15, 30, 45]); // 15-minute intervals
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    futureDate.setHours(hoursAhead, minutesAhead, 0, 0);
    
    return futureDate;
  }

  async saveData() {
    console.log('Saving generated data...');
    
    const dataFiles = [
      { name: 'patients.json', data: this.generatedData.patients },
      { name: 'providers.json', data: this.generatedData.providers },
      { name: 'admins.json', data: this.generatedData.admins },
      { name: 'appointments.json', data: this.generatedData.appointments },
      { name: 'waitlist-entries.json', data: this.generatedData.waitlistEntries },
      { name: 'notifications.json', data: this.generatedData.notifications },
      { name: 'practices.json', data: this.generatedData.practices },
      { name: 'schedules.json', data: this.generatedData.schedules },
      { name: 'all-data.json', data: this.generatedData }
    ];
    
    for (const file of dataFiles) {
      const filePath = path.join(DATA_CONFIG.outputDir, file.name);
      await fs.promises.writeFile(
        filePath, 
        JSON.stringify(file.data, null, 2), 
        'utf8'
      );
    }
  }

  async generateCredentialsFile() {
    console.log('Generating credentials file...');
    
    const credentials = {
      patients: this.generatedData.patients.slice(0, 10).map(p => ({
        email: p.email,
        password: p.password,
        userType: p.userType,
        id: p.id
      })),
      providers: this.generatedData.providers.slice(0, 5).map(p => ({
        email: p.email,
        password: p.password,
        userType: p.userType,
        id: p.id
      })),
      admins: this.generatedData.admins.slice(0, 3).map(a => ({
        email: a.email,
        password: a.password,
        userType: a.userType,
        id: a.id
      }))
    };
    
    await fs.promises.writeFile(
      path.join(DATA_CONFIG.outputDir, 'credentials', 'test-credentials.json'),
      JSON.stringify(credentials, null, 2),
      'utf8'
    );
    
    // Generate environment file for easy access
    const envContent = `# Test Credentials for Load Testing
# Generated: ${new Date().toISOString()}

# Sample Patient
TEST_PATIENT_EMAIL=${credentials.patients[0].email}
TEST_PATIENT_PASSWORD=${credentials.patients[0].password}

# Sample Provider  
TEST_PROVIDER_EMAIL=${credentials.providers[0].email}
TEST_PROVIDER_PASSWORD=${credentials.providers[0].password}

# Sample Admin
TEST_ADMIN_EMAIL=${credentials.admins[0].email}
TEST_ADMIN_PASSWORD=${credentials.admins[0].password}

# Practice ID
TEST_PRACTICE_ID=practice_1
`;
    
    await fs.promises.writeFile(
      path.join(DATA_CONFIG.outputDir, 'credentials', 'test.env'),
      envContent,
      'utf8'
    );
  }

  printSummary() {
    console.log('\n📊 Test Data Generation Summary:');
    console.log('================================');
    console.log(`👥 Patients: ${this.generatedData.patients.length}`);
    console.log(`👨‍⚕️ Providers: ${this.generatedData.providers.length}`);
    console.log(`👨‍💼 Admins: ${this.generatedData.admins.length}`);
    console.log(`📅 Appointments: ${this.generatedData.appointments.length}`);
    console.log(`📋 Waitlist Entries: ${this.generatedData.waitlistEntries.length}`);
    console.log(`🔔 Notifications: ${this.generatedData.notifications.length}`);
    console.log(`🏥 Practices: ${this.generatedData.practices.length}`);
    console.log(`📆 Provider Schedules: ${this.generatedData.schedules.length}`);
    console.log('\n✅ All data is HIPAA-compliant and synthetic');
    console.log('🔐 Test credentials saved for easy access');
    console.log('\n📁 Files generated:');
    console.log(`   - ${DATA_CONFIG.outputDir}/all-data.json`);
    console.log(`   - ${DATA_CONFIG.outputDir}/credentials/test-credentials.json`);
    console.log(`   - ${DATA_CONFIG.outputDir}/credentials/test.env`);
  }
}

// Main execution
async function main() {
  try {
    const generator = new TestDataGenerator();
    await generator.generate();
    console.log('\n🎉 Test data setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Test data setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestDataGenerator;