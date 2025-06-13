import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedMinimal() {
  console.log('Starting minimal seed...\n');

  try {
    // Step 1: Create a simple practice
    console.log('Creating practice...');
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .insert({
        practice_id: '11111111-1111-1111-1111-111111111111',
        name: 'Serenity Mental Health Center',
        specialties: ['Anxiety', 'Depression', 'PTSD'],
        address: '123 Main St, San Francisco, CA',
        settings: {}
      })
      .select()
      .single();

    if (practiceError && !practiceError.message.includes('duplicate')) {
      console.error('Practice error:', practiceError);
      // Try without practice_id to let DB generate it
      const { data: practice2, error: practiceError2 } = await supabase
        .from('practices')
        .insert({
          name: 'Serenity Mental Health Center',
          specialties: ['Anxiety', 'Depression', 'PTSD'],
          address: '123 Main St, San Francisco, CA'
        })
        .select()
        .single();
      
      if (practiceError2) {
        console.error('Practice error 2:', practiceError2);
      } else {
        console.log('✓ Practice created with ID:', practice2?.practice_id);
      }
    } else {
      console.log('✓ Practice created/exists');
    }

    // Step 2: Create minimal providers
    console.log('\nCreating providers...');
    const providers = [
      {
        practice_id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Sarah',
        last_name: 'Chen',
        email: 'sarah.chen@example.com',
        specialties: ['Anxiety', 'Depression'],
        availability: {},
        experience: 10,
        telehealth: true
      },
      {
        practice_id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Michael',
        last_name: 'Rodriguez',
        email: 'michael.rodriguez@example.com',
        specialties: ['PTSD', 'Trauma'],
        availability: {},
        experience: 15,
        telehealth: true
      }
    ];

    for (const provider of providers) {
      const { data, error } = await supabase
        .from('providers')
        .insert(provider)
        .select();
      
      if (error) {
        console.error(`Provider error (${provider.email}):`, error.message);
      } else {
        console.log(`✓ Provider created: ${provider.first_name} ${provider.last_name}`);
      }
    }

    // Step 3: Create minimal patients
    console.log('\nCreating patients...');
    const patients = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        phone: '555-0101',
        date_of_birth: '1985-03-15',
        insurance_info: {},
        health_history: {},
        preferences: {}
      },
      {
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@example.com',
        phone: '555-0102',
        date_of_birth: '1990-07-22',
        insurance_info: {},
        health_history: {},
        preferences: {}
      }
    ];

    const createdPatients = [];
    for (const patient of patients) {
      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select();
      
      if (error) {
        console.error(`Patient error (${patient.email}):`, error.message);
      } else {
        console.log(`✓ Patient created: ${patient.first_name} ${patient.last_name}`);
        if (data && data[0]) createdPatients.push(data[0]);
      }
    }

    // Step 4: Create waitlist
    console.log('\nCreating waitlist...');
    const { data: waitlist, error: waitlistError } = await supabase
      .from('waitlists')
      .insert({
        practice_id: '11111111-1111-1111-1111-111111111111',
        name: 'General Waitlist',
        description: 'Main waitlist',
        max_size: 100,
        settings: {}
      })
      .select()
      .single();

    let waitlistId = waitlist?.waitlist_id;
    
    if (waitlistError) {
      console.error('Waitlist error:', waitlistError.message);
      // Try to get existing waitlist
      const { data: existing } = await supabase
        .from('waitlists')
        .select('waitlist_id')
        .eq('name', 'General Waitlist')
        .single();
      
      if (existing) {
        waitlistId = existing.waitlist_id;
        console.log('✓ Using existing waitlist');
      }
    } else {
      console.log('✓ Waitlist created');
    }

    // Step 5: Add patients to waitlist
    if (waitlistId && createdPatients.length > 0) {
      console.log('\nAdding patients to waitlist...');
      
      for (const patient of createdPatients) {
        const { error } = await supabase
          .from('waitlist_entries')
          .insert({
            waitlist_id: waitlistId,
            patient_id: patient.patient_id,
            priority_score: 80 + Math.floor(Math.random() * 20),
            status: 'waiting',
            preferences: {},
            notes: 'Test patient'
          });
        
        if (error) {
          console.error(`Waitlist entry error:`, error.message);
        } else {
          console.log(`✓ Added ${patient.first_name} to waitlist`);
        }
      }
    }

    console.log('\n✅ Minimal seed completed!');
    
    // Verify data
    console.log('\nVerifying data...');
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    const { count: providerCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
    
    const { count: waitlistCount } = await supabase
      .from('waitlist_entries')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total patients: ${patientCount || 0}`);
    console.log(`Total providers: ${providerCount || 0}`);
    console.log(`Total waitlist entries: ${waitlistCount || 0}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the seed
seedMinimal();