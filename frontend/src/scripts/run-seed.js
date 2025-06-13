import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSeed() {
  console.log('Running seed script...\n');

  try {
    // Step 1: Create practice
    const practiceData = {
      practice_id: '11111111-1111-1111-1111-111111111111',
      name: 'Serenity Mental Health Center',
      specialties: ['Anxiety Disorders', 'Depression', 'PTSD', 'Bipolar Disorder', 'ADHD', 'Substance Abuse'],
      address: '123 Wellness Way, San Francisco, CA 94105',
      contact_info: {
        phone: '(415) 555-0100',
        email: 'info@serenitymhc.com',
        website: 'www.serenitymhc.com'
      },
      settings: {
        operating_hours: {
          monday: { open: '8:00', close: '20:00' },
          tuesday: { open: '8:00', close: '20:00' },
          wednesday: { open: '8:00', close: '20:00' },
          thursday: { open: '8:00', close: '20:00' },
          friday: { open: '8:00', close: '18:00' },
          saturday: { open: '9:00', close: '14:00' }
        },
        appointment_duration: 50,
        buffer_time: 10
      }
    };

    const { error: practiceError } = await supabase
      .from('practices')
      .upsert(practiceData);
    
    if (practiceError) {
      console.error('Practice error:', practiceError);
    } else {
      console.log('✓ Practice created/updated');
    }

    // Step 2: Create providers
    const providers = [
      {
        practice_id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Sarah',
        last_name: 'Chen',
        email: 'sarah.chen@serenitymhc.com',
        specialties: ['Anxiety Disorders', 'Depression', 'PTSD', 'Stress Management'],
        modalities: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'EMDR'],
        availability: {
          monday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          tuesday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          wednesday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
          thursday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          friday: { start: '9:00', end: '15:00', breaks: [{ start: '12:00', end: '12:30' }] }
        },
        experience: 10,
        telehealth: true
      },
      {
        practice_id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Michael',
        last_name: 'Rodriguez',
        email: 'michael.rodriguez@serenitymhc.com',
        specialties: ['Bipolar Disorder', 'Depression', 'Mood Disorders'],
        modalities: ['Dialectical Behavior Therapy (DBT)', 'Medication Management', 'Psychodynamic Therapy'],
        availability: {
          monday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] },
          tuesday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] },
          wednesday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] },
          thursday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] }
        },
        experience: 15,
        telehealth: true
      },
      {
        practice_id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Emily',
        last_name: 'Johnson',
        email: 'emily.johnson@serenitymhc.com',
        specialties: ['ADHD', 'Autism Spectrum', 'Learning Disabilities'],
        modalities: ['Behavioral Therapy', 'Play Therapy', 'Parent Training'],
        availability: {
          monday: { start: '8:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
          tuesday: { start: '8:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
          thursday: { start: '8:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
          friday: { start: '8:00', end: '14:00', breaks: [{ start: '11:30', end: '12:00' }] }
        },
        experience: 8,
        telehealth: true
      }
    ];

    for (const provider of providers) {
      const { error } = await supabase
        .from('providers')
        .insert(provider);
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Provider error (${provider.email}):`, error);
      }
    }
    console.log('✓ Providers created');

    // Step 3: Create patients
    const patients = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '(415) 555-0101',
        date_of_birth: '1985-03-15',
        gender: 'male',
        insurance_info: {
          provider: 'Blue Cross Blue Shield',
          policy_number: 'BC123456',
          group_number: 'GRP789'
        },
        health_history: {
          conditions: ['Generalized Anxiety Disorder', 'Insomnia'],
          medications: ['Sertraline 50mg'],
          previous_therapy: true
        },
        preferences: {
          communication: 'email',
          appointment_reminders: true,
          preferred_times: ['Morning', 'Early Afternoon'],
          telehealth_preference: 'flexible',
          primaryCondition: 'Anxiety'
        }
      },
      {
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@email.com',
        phone: '(415) 555-0102',
        date_of_birth: '1990-07-22',
        gender: 'female',
        insurance_info: {
          provider: 'Aetna',
          policy_number: 'AET789012',
          group_number: 'GRP456'
        },
        health_history: {
          conditions: ['Major Depressive Disorder', 'Social Anxiety'],
          medications: [],
          previous_therapy: false
        },
        preferences: {
          communication: 'phone',
          appointment_reminders: true,
          preferred_times: ['Evening'],
          telehealth_preference: 'in-person',
          primaryCondition: 'Depression'
        }
      },
      {
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@email.com',
        phone: '(415) 555-0103',
        date_of_birth: '1978-11-08',
        gender: 'male',
        insurance_info: {
          provider: 'United Healthcare',
          policy_number: 'UH345678',
          group_number: 'GRP123'
        },
        health_history: {
          conditions: ['ADHD', 'Anxiety'],
          medications: ['Adderall XR 20mg'],
          previous_therapy: true
        },
        preferences: {
          communication: 'text',
          appointment_reminders: true,
          preferred_times: ['Afternoon'],
          telehealth_preference: 'telehealth',
          primaryCondition: 'ADHD'
        }
      },
      {
        first_name: 'Sarah',
        last_name: 'Wilson',
        email: 'sarah.wilson@email.com',
        phone: '(415) 555-0104',
        date_of_birth: '1995-02-28',
        gender: 'female',
        insurance_info: {
          provider: 'Cigna',
          policy_number: 'CIG901234',
          group_number: 'GRP567'
        },
        health_history: {
          conditions: ['PTSD', 'Depression'],
          medications: ['Fluoxetine 20mg'],
          previous_therapy: true
        },
        preferences: {
          communication: 'email',
          appointment_reminders: true,
          preferred_times: ['Morning', 'Weekend'],
          telehealth_preference: 'flexible',
          primaryCondition: 'PTSD'
        }
      },
      {
        first_name: 'David',
        last_name: 'Martinez',
        email: 'david.martinez@email.com',
        phone: '(415) 555-0105',
        date_of_birth: '1982-09-12',
        gender: 'male',
        insurance_info: {
          provider: 'Kaiser Permanente',
          policy_number: 'KP567890',
          group_number: 'GRP890'
        },
        health_history: {
          conditions: ['Bipolar Disorder Type II'],
          medications: ['Lamotrigine 100mg', 'Quetiapine 50mg'],
          previous_therapy: true
        },
        preferences: {
          communication: 'phone',
          appointment_reminders: true,
          preferred_times: ['Afternoon', 'Evening'],
          telehealth_preference: 'in-person',
          primaryCondition: 'Bipolar Disorder'
        }
      }
    ];

    const insertedPatients = [];
    for (const patient of patients) {
      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single();
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Patient error (${patient.email}):`, error);
      } else if (data) {
        insertedPatients.push(data);
      }
    }
    console.log('✓ Patients created:', insertedPatients.length);

    // Step 4: Create waitlist
    const waitlistData = {
      practice_id: '11111111-1111-1111-1111-111111111111',
      name: 'General Waitlist',
      description: 'Main waitlist for new patient appointments',
      max_size: 100,
      settings: {
        auto_notify: true,
        priority_algorithm: 'weighted',
        notification_window: 48
      }
    };

    const { data: waitlist, error: waitlistError } = await supabase
      .from('waitlists')
      .insert(waitlistData)
      .select()
      .single();
    
    let waitlistId;
    if (waitlistError && waitlistError.message.includes('duplicate')) {
      // Get existing waitlist
      const { data: existingWaitlist } = await supabase
        .from('waitlists')
        .select('waitlist_id')
        .eq('practice_id', '11111111-1111-1111-1111-111111111111')
        .eq('name', 'General Waitlist')
        .single();
      
      waitlistId = existingWaitlist?.waitlist_id;
    } else if (waitlist) {
      waitlistId = waitlist.waitlist_id;
    }
    
    console.log('✓ Waitlist created/found:', waitlistId);

    // Step 5: Add patients to waitlist
    if (waitlistId && insertedPatients.length > 0) {
      const waitlistEntries = insertedPatients.map((patient, index) => ({
        waitlist_id: waitlistId,
        patient_id: patient.patient_id,
        priority_score: 70 + Math.floor(Math.random() * 30),
        status: 'waiting',
        preferences: {
          urgency: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
          flexibility: 'moderate'
        },
        notes: index === 0 ? 'Urgent - experiencing increased anxiety' : 
               index === 3 ? 'Prefers morning appointments' : null
      }));

      for (const entry of waitlistEntries) {
        const { error } = await supabase
          .from('waitlist_entries')
          .insert(entry);
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Waitlist entry error:', error);
        }
      }
      console.log('✓ Patients added to waitlist');
    }

    console.log('\n✅ Seed script completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the seed
runSeed();