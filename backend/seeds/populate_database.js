const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Mental health specialties and conditions
const SPECIALTIES = [
  'Anxiety Disorders',
  'Depression',
  'ADHD',
  'Bipolar Disorder',
  'PTSD',
  'OCD',
  'Eating Disorders',
  'Substance Abuse',
  'Couples Therapy',
  'Family Therapy',
  'Child Psychology',
  'Adolescent Psychology',
  'Grief Counseling',
  'Stress Management',
  'Anger Management',
  'Trauma Therapy',
  'Sleep Disorders',
  'Personality Disorders',
  'Phobias',
  'Autism Spectrum'
];

const MODALITIES = [
  'Cognitive Behavioral Therapy (CBT)',
  'Dialectical Behavior Therapy (DBT)',
  'EMDR',
  'Psychodynamic Therapy',
  'Humanistic Therapy',
  'Solution-Focused Therapy',
  'Art Therapy',
  'Play Therapy',
  'Group Therapy',
  'Mindfulness-Based Therapy',
  'Acceptance and Commitment Therapy (ACT)',
  'Narrative Therapy'
];

const CONDITIONS = [
  'Generalized Anxiety',
  'Social Anxiety',
  'Panic Disorder',
  'Major Depression',
  'Persistent Depressive Disorder',
  'ADHD - Inattentive',
  'ADHD - Hyperactive',
  'ADHD - Combined',
  'Bipolar I',
  'Bipolar II',
  'PTSD',
  'Complex PTSD',
  'OCD',
  'Anorexia',
  'Bulimia',
  'Binge Eating Disorder',
  'Alcohol Use Disorder',
  'Substance Use Disorder',
  'Adjustment Disorder',
  'Borderline Personality Disorder'
];

const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield',
  'Aetna',
  'United Healthcare',
  'Cigna',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Wellpoint',
  'Centene',
  'Molina Healthcare'
];

const PROVIDER_TITLES = [
  'MD', 'PhD', 'PsyD', 'LCSW', 'LMFT', 'LPC', 'LCPC', 'LPCC'
];

// Helper function to generate availability schedule
function generateAvailability() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const availability = {};
  
  days.forEach(day => {
    // 70% chance provider works on this day
    if (Math.random() > 0.3) {
      const startHour = faker.number.int({ min: 7, max: 10 });
      const endHour = faker.number.int({ min: 16, max: 20 });
      
      availability[day] = {
        start: `${startHour}:00`,
        end: `${endHour}:00`,
        breaks: []
      };
      
      // 50% chance of lunch break
      if (Math.random() > 0.5) {
        const lunchStart = faker.number.int({ min: 11, max: 13 });
        availability[day].breaks.push({
          start: `${lunchStart}:00`,
          end: `${lunchStart + 1}:00`
        });
      }
    }
  });
  
  // 30% chance of Saturday hours
  if (Math.random() > 0.7) {
    availability.saturday = {
      start: '9:00',
      end: '14:00',
      breaks: []
    };
  }
  
  return availability;
}

// Helper function to generate preferences
function generatePatientPreferences() {
  return {
    preferredDays: faker.helpers.arrayElements(
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      faker.number.int({ min: 2, max: 4 })
    ),
    preferredTimes: faker.helpers.arrayElements(
      ['morning', 'afternoon', 'evening'],
      faker.number.int({ min: 1, max: 2 })
    ),
    modality: faker.helpers.arrayElement(['in-person', 'virtual', 'either']),
    sessionLength: faker.helpers.arrayElement([30, 45, 60, 90]),
    gender: faker.helpers.arrayElement(['male', 'female', 'no preference']),
    ageRange: faker.helpers.arrayElement(['any', '25-40', '40-60', '60+'])
  };
}

exports.seed = async function(knex) {
  // Clear existing data in reverse order of dependencies
  await knex('audit_logs').del();
  await knex('notifications').del();
  await knex('appointments').del();
  await knex('appointment_requests').del();
  await knex('appointment_slots').del();
  await knex('waitlist_entries').del();
  await knex('waitlists').del();
  await knex('users').del();
  await knex('patients').del();
  await knex('providers').del();
  await knex('practices').del();
  await knex('roles').del();

  // Insert roles
  const roles = [
    { role_id: 'admin', name: 'Administrator', description: 'Full system access' },
    { role_id: 'provider', name: 'Provider', description: 'Mental health provider' },
    { role_id: 'patient', name: 'Patient', description: 'Patient user' },
    { role_id: 'staff', name: 'Staff', description: 'Administrative staff' }
  ];
  await knex('roles').insert(roles);

  // Create practice
  const [practice] = await knex('practices').insert({
    name: 'Serenity Mental Health Center',
    address: {
      street: '123 Wellness Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    phone: '(415) 555-0100',
    email: 'info@serenitymhc.com',
    settings: {
      appointmentDuration: 50,
      bufferTime: 10,
      cancellationPolicy: 24,
      waitlistEnabled: true,
      telehealth: true
    }
  }).returning('*');

  // Create providers (30)
  const providers = [];
  const providerUsers = [];
  
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const title = faker.helpers.arrayElement(PROVIDER_TITLES);
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    const [provider] = await knex('providers').insert({
      practice_id: practice.practice_id,
      first_name: firstName,
      last_name: lastName,
      email: email,
      specialties: faker.helpers.arrayElements(SPECIALTIES, faker.number.int({ min: 2, max: 5 })),
      modalities: faker.helpers.arrayElements(MODALITIES, faker.number.int({ min: 2, max: 4 })),
      availability: generateAvailability(),
      experience: faker.number.int({ min: 1, max: 25 }),
      telehealth: Math.random() > 0.2 // 80% offer telehealth
    }).returning('*');
    
    providers.push(provider);
    
    // Create user account for provider
    const hashedPassword = await bcrypt.hash('provider123', 10);
    providerUsers.push({
      email: email,
      password_hash: hashedPassword,
      role: 'provider',
      reference_id: provider.provider_id,
      reference_type: 'provider',
      active: true
    });
  }
  
  await knex('users').insert(providerUsers);

  // Create demo provider account for easy access
  const [demoProvider] = await knex('providers').insert({
    practice_id: practice.practice_id,
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'provider@demo.com',
    specialties: ['Anxiety Disorders', 'Depression', 'PTSD', 'Stress Management'],
    modalities: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'EMDR'],
    availability: {
      monday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      tuesday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      wednesday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      thursday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      friday: { start: '9:00', end: '15:00', breaks: [] }
    },
    experience: 10,
    telehealth: true
  }).returning('*');

  await knex('users').insert({
    email: 'provider@demo.com',
    password_hash: await bcrypt.hash('provider123', 10),
    role: 'provider',
    reference_id: demoProvider.provider_id,
    reference_type: 'provider',
    active: true
  });

  // Create patients (100)
  const patients = [];
  const patientUsers = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const dateOfBirth = faker.date.between({ 
      from: '1950-01-01', 
      to: '2005-12-31' 
    });
    
    const [patient] = await knex('patients').insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: faker.phone.number('(###) ###-####'),
      date_of_birth: dateOfBirth,
      insurance_info: {
        provider: faker.helpers.arrayElement(INSURANCE_PROVIDERS),
        memberId: faker.string.alphanumeric(10).toUpperCase(),
        groupNumber: faker.string.alphanumeric(6).toUpperCase(),
        verified: Math.random() > 0.2, // 80% verified
        expirationDate: faker.date.future({ years: 2 })
      },
      preferences: generatePatientPreferences()
    }).returning('*');
    
    patients.push(patient);
    
    // Create user account for patient
    const hashedPassword = await bcrypt.hash('patient123', 10);
    patientUsers.push({
      email: email,
      password_hash: hashedPassword,
      role: 'patient',
      reference_id: patient.patient_id,
      reference_type: 'patient',
      active: true
    });
  }
  
  await knex('users').insert(patientUsers);

  // Create demo patient account
  const [demoPatient] = await knex('patients').insert({
    first_name: 'John',
    last_name: 'Doe',
    email: 'patient@demo.com',
    phone: '(555) 123-4567',
    date_of_birth: '1990-05-15',
    insurance_info: {
      provider: 'Blue Cross Blue Shield',
      memberId: 'BCBS123456',
      groupNumber: 'GRP789',
      verified: true,
      expirationDate: '2025-12-31'
    },
    preferences: {
      preferredDays: ['monday', 'wednesday', 'friday'],
      preferredTimes: ['morning', 'afternoon'],
      modality: 'either',
      sessionLength: 50,
      gender: 'no preference',
      ageRange: 'any'
    }
  }).returning('*');

  await knex('users').insert({
    email: 'patient@demo.com',
    password_hash: await bcrypt.hash('patient123', 10),
    role: 'patient',
    reference_id: demoPatient.patient_id,
    reference_type: 'patient',
    active: true
  });

  // Create waitlists
  const waitlists = await knex('waitlists').insert([
    {
      practice_id: practice.practice_id,
      name: 'General Waitlist',
      description: 'General waitlist for all providers',
      criteria: { type: 'general' }
    },
    {
      practice_id: practice.practice_id,
      name: 'Urgent Care Waitlist',
      description: 'Priority waitlist for urgent cases',
      criteria: { type: 'urgent', priority: 'high' }
    },
    {
      practice_id: practice.practice_id,
      name: 'Child & Adolescent Waitlist',
      description: 'Specialized waitlist for young patients',
      criteria: { type: 'specialty', ageGroup: 'child-adolescent' }
    }
  ]).returning('*');

  // Add patients to waitlists
  const waitlistEntries = [];
  const selectedPatients = faker.helpers.arrayElements(patients, 40); // 40 patients on waitlists
  
  for (const patient of selectedPatients) {
    const waitlist = faker.helpers.arrayElement(waitlists);
    const provider = Math.random() > 0.5 ? faker.helpers.arrayElement(providers) : null;
    
    waitlistEntries.push({
      waitlist_id: waitlist.waitlist_id,
      patient_id: patient.patient_id,
      provider_id: provider?.provider_id || null,
      priority_score: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
      status: faker.helpers.arrayElement(['active', 'active', 'active', 'pending']), // 75% active
      notes: faker.helpers.arrayElement([
        'Patient experiencing increased symptoms',
        'Prefers morning appointments',
        'Flexible with scheduling',
        'Referred by primary care physician',
        'Previous patient returning to care',
        null
      ])
    });
  }
  
  await knex('waitlist_entries').insert(waitlistEntries);

  // Create appointment slots for the next 30 days
  const appointmentSlots = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  for (const provider of providers) {
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dayName = currentDate.toLocaleLowerCase().substring(0, 3);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentDate.getDay()];
      
      if (provider.availability[dayOfWeek]) {
        const daySchedule = provider.availability[dayOfWeek];
        const [startHour] = daySchedule.start.split(':').map(Number);
        const [endHour] = daySchedule.end.split(':').map(Number);
        
        // Create slots for each hour
        for (let hour = startHour; hour < endHour; hour++) {
          // Skip lunch breaks
          const isBreak = daySchedule.breaks.some(brk => {
            const [breakStart] = brk.start.split(':').map(Number);
            return hour === breakStart;
          });
          
          if (!isBreak) {
            const slotStart = new Date(currentDate);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(hour, 50, 0, 0); // 50-minute sessions
            
            appointmentSlots.push({
              provider_id: provider.provider_id,
              start_time: slotStart,
              end_time: slotEnd,
              status: 'available'
            });
          }
        }
      }
    }
  }
  
  await knex('appointment_slots').insert(appointmentSlots);

  // Create some existing appointments
  const appointments = [];
  const bookedSlots = faker.helpers.arrayElements(appointmentSlots, Math.floor(appointmentSlots.length * 0.6)); // 60% booked
  
  for (const slot of bookedSlots) {
    const patient = faker.helpers.arrayElement(patients);
    const appointmentType = faker.helpers.arrayElement(['initial', 'follow-up', 'follow-up', 'follow-up']); // 75% follow-ups
    
    appointments.push({
      provider_id: slot.provider_id,
      patient_id: patient.patient_id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: faker.helpers.weighted(
        ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        [0.3, 0.3, 0.3, 0.08, 0.02]
      ),
      type: faker.helpers.weighted(['in-person', 'telehealth'], [0.6, 0.4]),
      notes: appointmentType === 'initial' ? 'Initial consultation' : 'Follow-up session'
    });
    
    // Update slot status
    slot.status = 'booked';
  }
  
  await knex('appointments').insert(appointments);
  
  // Update appointment slots status
  for (const slot of bookedSlots) {
    await knex('appointment_slots')
      .where('slot_id', slot.slot_id)
      .update({ status: 'booked' });
  }

  // Create some notifications
  const notifications = [];
  
  // Appointment reminders
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' || apt.status === 'confirmed'
  ).slice(0, 20);
  
  for (const apt of upcomingAppointments) {
    notifications.push({
      recipient_id: apt.patient_id,
      recipient_type: 'patient',
      type: 'appointment_reminder',
      content: {
        title: 'Appointment Reminder',
        message: `You have an appointment scheduled for ${apt.start_time.toLocaleDateString()}`,
        appointment_id: apt.appointment_id
      },
      status: faker.helpers.arrayElement(['sent', 'pending'])
    });
  }
  
  // Waitlist notifications
  const activeWaitlistEntries = waitlistEntries.filter(entry => entry.status === 'active').slice(0, 10);
  
  for (const entry of activeWaitlistEntries) {
    notifications.push({
      recipient_id: entry.patient_id,
      recipient_type: 'patient',
      type: 'waitlist_opening',
      content: {
        title: 'Appointment Opening Available',
        message: 'A new appointment slot has become available. Click to book.',
        waitlist_entry_id: entry.entry_id
      },
      status: 'pending'
    });
  }
  
  await knex('notifications').insert(notifications);

  console.log('Database seeded successfully!');
  console.log('Demo accounts created:');
  console.log('Provider: provider@demo.com / provider123');
  console.log('Patient: patient@demo.com / patient123');
  console.log(`Total providers: ${providers.length + 1}`);
  console.log(`Total patients: ${patients.length + 1}`);
  console.log(`Total appointments: ${appointments.length}`);
  console.log(`Patients on waitlist: ${waitlistEntries.length}`);
};