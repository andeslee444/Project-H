import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE'; // You'll need to add this

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

// Helper functions
function getRandomElements(arr, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateAvailability() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const availability = {};
  
  days.forEach(day => {
    if (Math.random() > 0.3) { // 70% chance provider works on this day
      const startHour = Math.floor(Math.random() * 3) + 8; // 8-10 AM
      const endHour = Math.floor(Math.random() * 4) + 16; // 4-8 PM
      
      availability[day] = {
        start: `${startHour}:00`,
        end: `${endHour}:00`,
        slots: []
      };
      
      // Generate available slots
      for (let hour = startHour; hour < endHour; hour++) {
        if (hour !== 12) { // Skip lunch hour
          availability[day].slots.push(`${hour}:00`);
        }
      }
    }
  });
  
  return availability;
}

function generatePhoneNumber() {
  const area = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${prefix}-${line}`;
}

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('waitlist_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('providers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Create providers (30)
    console.log('Creating 30 providers...');
    const providers = [];
    const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Maria', 'John', 
                       'Patricia', 'William', 'Elizabeth', 'Charles', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas',
                       'Karen', 'Christopher', 'Nancy', 'Daniel', 'Betty', 'Matthew', 'Helen', 'Anthony', 'Sandra', 'Mark'];
    const lastNames = ['Chen', 'Rodriguez', 'Williams', 'Johnson', 'Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
                      'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez',
                      'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright'];
    const titles = ['MD', 'PhD', 'PsyD', 'LCSW', 'LMFT', 'LPC'];

    for (let i = 0; i < 30; i++) {
      const provider = {
        first_name: firstNames[i],
        last_name: lastNames[i],
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@serenitymhc.com`,
        phone: generatePhoneNumber(),
        title: titles[Math.floor(Math.random() * titles.length)],
        specialties: getRandomElements(SPECIALTIES, 2, 5),
        availability: generateAvailability(),
        years_experience: Math.floor(Math.random() * 20) + 5,
        accepting_new: Math.random() > 0.3,
        telehealth_available: Math.random() > 0.2,
        bio: `Dr. ${firstNames[i]} ${lastNames[i]} is a dedicated mental health professional with extensive experience in helping patients overcome their challenges.`,
        image_url: `https://i.pravatar.cc/300?img=${i + 1}`
      };
      providers.push(provider);
    }

    const { data: insertedProviders, error: providersError } = await supabase
      .from('providers')
      .insert(providers)
      .select();

    if (providersError) {
      console.error('Error inserting providers:', providersError);
      return;
    }
    console.log(`Created ${insertedProviders.length} providers`);

    // Create patients (100)
    console.log('Creating 100 patients...');
    const patients = [];
    const patientFirstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
                              'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
    const patientLastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
                             'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

    for (let i = 0; i < 100; i++) {
      const firstName = patientFirstNames[i % patientFirstNames.length] + (i >= 20 ? i : '');
      const lastName = patientLastNames[i % patientLastNames.length];
      
      const patient = {
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: generatePhoneNumber(),
        date_of_birth: new Date(1950 + Math.floor(Math.random() * 55), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        insurance_provider: INSURANCE_PROVIDERS[Math.floor(Math.random() * INSURANCE_PROVIDERS.length)],
        insurance_id: `INS${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        primary_condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
        secondary_conditions: getRandomElements(CONDITIONS, 0, 2),
        emergency_contact_name: `Emergency Contact ${i}`,
        emergency_contact_phone: generatePhoneNumber(),
        preferred_communication: ['email', 'phone', 'sms'][Math.floor(Math.random() * 3)],
        notes: Math.random() > 0.5 ? `Patient prefers ${['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)]} appointments` : null
      };
      patients.push(patient);
    }

    const { data: insertedPatients, error: patientsError } = await supabase
      .from('patients')
      .insert(patients)
      .select();

    if (patientsError) {
      console.error('Error inserting patients:', patientsError);
      return;
    }
    console.log(`Created ${insertedPatients.length} patients`);

    // Create waitlist entries (40 patients)
    console.log('Creating waitlist entries...');
    const waitlistEntries = [];
    const selectedPatients = insertedPatients.slice(0, 40);
    
    for (const patient of selectedPatients) {
      const entry = {
        patient_id: patient.id,
        provider_id: Math.random() > 0.5 ? insertedProviders[Math.floor(Math.random() * insertedProviders.length)].id : null,
        priority: Math.floor(Math.random() * 10) + 1,
        status: ['active', 'pending', 'contacted'][Math.floor(Math.random() * 3)],
        reason_for_visit: patient.primary_condition,
        preferred_days: getRandomElements(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 2, 4),
        preferred_times: getRandomElements(['Morning', 'Afternoon', 'Evening'], 1, 2),
        insurance_verified: Math.random() > 0.2,
        date_added: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        last_contacted: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() : null,
        notes: Math.random() > 0.7 ? 'Urgent - experiencing increased symptoms' : null
      };
      waitlistEntries.push(entry);
    }

    const { data: insertedWaitlist, error: waitlistError } = await supabase
      .from('waitlist_entries')
      .insert(waitlistEntries)
      .select();

    if (waitlistError) {
      console.error('Error inserting waitlist entries:', waitlistError);
      return;
    }
    console.log(`Created ${insertedWaitlist.length} waitlist entries`);

    // Create appointments
    console.log('Creating appointments...');
    const appointments = [];
    const appointmentStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
    const appointmentTypes = ['Initial Consultation', 'Follow-up', 'Therapy Session', 'Medication Review'];
    
    // Create appointments for the next 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + dayOffset);
      
      // Skip weekends
      if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) continue;
      
      // Create 5-10 appointments per day
      const appointmentsPerDay = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < appointmentsPerDay; i++) {
        const provider = insertedProviders[Math.floor(Math.random() * insertedProviders.length)];
        const patient = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
        const hour = Math.floor(Math.random() * 9) + 9; // 9 AM to 6 PM
        
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hour, 0, 0, 0);
        
        const appointment = {
          provider_id: provider.id,
          patient_id: patient.id,
          appointment_date: appointmentDateTime.toISOString(),
          duration: [30, 45, 60][Math.floor(Math.random() * 3)],
          type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
          status: dayOffset < 0 ? 'completed' : appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)],
          is_telehealth: Math.random() > 0.6,
          notes: Math.random() > 0.7 ? 'Patient requested earlier time slot if available' : null,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)).toISOString()
        };
        appointments.push(appointment);
      }
    }

    const { data: insertedAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentsError) {
      console.error('Error inserting appointments:', appointmentsError);
      return;
    }
    console.log(`Created ${insertedAppointments.length} appointments`);

    // Create demo accounts in auth
    console.log('Creating demo auth accounts...');
    
    // Create demo provider account
    const { data: providerAuth, error: providerAuthError } = await supabase.auth.admin.createUser({
      email: 'provider@demo.com',
      password: 'provider123',
      email_confirm: true,
      user_metadata: {
        role: 'provider',
        provider_id: insertedProviders[0].id,
        name: `${insertedProviders[0].first_name} ${insertedProviders[0].last_name}`
      }
    });

    if (providerAuthError) {
      console.error('Error creating provider auth:', providerAuthError);
    } else {
      console.log('Created demo provider account: provider@demo.com / provider123');
    }

    // Create demo patient account
    const { data: patientAuth, error: patientAuthError } = await supabase.auth.admin.createUser({
      email: 'patient@demo.com',
      password: 'patient123',
      email_confirm: true,
      user_metadata: {
        role: 'patient',
        patient_id: insertedPatients[0].id,
        name: `${insertedPatients[0].first_name} ${insertedPatients[0].last_name}`
      }
    });

    if (patientAuthError) {
      console.error('Error creating patient auth:', patientAuthError);
    } else {
      console.log('Created demo patient account: patient@demo.com / patient123');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Providers: ${insertedProviders.length}`);
    console.log(`   - Patients: ${insertedPatients.length}`);
    console.log(`   - Waitlist entries: ${insertedWaitlist.length}`);
    console.log(`   - Appointments: ${insertedAppointments.length}`);
    console.log(`\n🔐 Demo Accounts:`);
    console.log(`   - Provider: provider@demo.com / provider123`);
    console.log(`   - Patient: patient@demo.com / patient123`);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();