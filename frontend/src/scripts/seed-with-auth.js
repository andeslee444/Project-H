import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedWithAuth() {
  console.log('Starting authenticated seed process...\n');

  try {
    // First, let's sign in as an admin user
    console.log('Attempting to sign in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@serenitymhc.com',
      password: 'admin123456'
    });

    if (authError) {
      console.log('Auth error:', authError.message);
      console.log('Creating a new admin user...');
      
      // Try to create an admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@serenitymhc.com',
        password: 'admin123456',
        options: {
          data: {
            role: 'admin',
            name: 'System Admin'
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
      } else {
        console.log('Admin user created successfully');
      }
    } else {
      console.log('✅ Signed in successfully');
    }

    // Now let's create data with proper structure
    console.log('\nCreating practice...');
    const practiceData = {
      name: 'Serenity Mental Health Center',
      address: '123 Wellness Way, San Francisco, CA 94105',
      phone: '(415) 555-0100',
      email: 'info@serenitymhc.com',
      website: 'www.serenitymhc.com'
    };

    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .insert(practiceData)
      .select()
      .single();

    if (practiceError) {
      console.error('Practice error:', practiceError.message);
      
      // Try to get existing practice
      const { data: existingPractice } = await supabase
        .from('practices')
        .select('*')
        .eq('name', 'Serenity Mental Health Center')
        .single();
      
      if (existingPractice) {
        console.log('Using existing practice:', existingPractice.practice_id);
        practice = existingPractice;
      }
    } else {
      console.log('✅ Practice created:', practice.practice_id);
    }

    if (practice) {
      // Create providers
      console.log('\nCreating providers...');
      const providers = [
        {
          practice_id: practice.practice_id,
          first_name: 'Sarah',
          last_name: 'Chen',
          email: 'sarah.chen@serenitymhc.com',
          phone: '(415) 555-1001',
          title: 'MD',
          specialization: 'Anxiety, Depression, PTSD'
        },
        {
          practice_id: practice.practice_id,
          first_name: 'Michael',
          last_name: 'Rodriguez',
          email: 'michael.rodriguez@serenitymhc.com',
          phone: '(415) 555-1002',
          title: 'PhD',
          specialization: 'Bipolar Disorder, Mood Disorders'
        },
        {
          practice_id: practice.practice_id,
          first_name: 'Emily',
          last_name: 'Johnson',
          email: 'emily.johnson@serenitymhc.com',
          phone: '(415) 555-1003',
          title: 'LCSW',
          specialization: 'ADHD, Autism Spectrum'
        }
      ];

      for (const provider of providers) {
        const { error } = await supabase
          .from('providers')
          .insert(provider);
        
        if (error && !error.message.includes('duplicate')) {
          console.error(`Provider error (${provider.email}):`, error.message);
        } else {
          console.log(`✅ Provider created: ${provider.first_name} ${provider.last_name}`);
        }
      }

      // Create patients
      console.log('\nCreating patients...');
      const patients = [
        {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@email.com',
          phone: '(415) 555-0101',
          date_of_birth: '1985-03-15'
        },
        {
          first_name: 'Emily',
          last_name: 'Davis',
          email: 'emily.davis@email.com',
          phone: '(415) 555-0102',
          date_of_birth: '1990-07-22'
        },
        {
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael.brown@email.com',
          phone: '(415) 555-0103',
          date_of_birth: '1978-11-08'
        },
        {
          first_name: 'Sarah',
          last_name: 'Wilson',
          email: 'sarah.wilson@email.com',
          phone: '(415) 555-0104',
          date_of_birth: '1995-02-28'
        },
        {
          first_name: 'David',
          last_name: 'Martinez',
          email: 'david.martinez@email.com',
          phone: '(415) 555-0105',
          date_of_birth: '1982-09-12'
        }
      ];

      const createdPatients = [];
      for (const patient of patients) {
        const { data, error } = await supabase
          .from('patients')
          .insert(patient)
          .select()
          .single();
        
        if (error && !error.message.includes('duplicate')) {
          console.error(`Patient error (${patient.email}):`, error.message);
        } else if (data) {
          console.log(`✅ Patient created: ${patient.first_name} ${patient.last_name}`);
          createdPatients.push(data);
        }
      }

      // Create waitlist
      console.log('\nCreating waitlist...');
      const { data: waitlist, error: waitlistError } = await supabase
        .from('waitlists')
        .insert({
          practice_id: practice.practice_id,
          name: 'General Waitlist',
          description: 'Main waitlist for new patient appointments'
        })
        .select()
        .single();

      let waitlistId = waitlist?.waitlist_id;
      
      if (waitlistError && waitlistError.message.includes('duplicate')) {
        // Get existing waitlist
        const { data: existingWaitlist } = await supabase
          .from('waitlists')
          .select('*')
          .eq('practice_id', practice.practice_id)
          .eq('name', 'General Waitlist')
          .single();
        
        if (existingWaitlist) {
          waitlistId = existingWaitlist.waitlist_id;
          console.log('Using existing waitlist');
        }
      } else if (waitlist) {
        console.log('✅ Waitlist created');
      }

      // Add patients to waitlist
      if (waitlistId && createdPatients.length > 0) {
        console.log('\nAdding patients to waitlist...');
        
        for (let i = 0; i < createdPatients.length; i++) {
          const patient = createdPatients[i];
          const { error } = await supabase
            .from('waitlist_entries')
            .insert({
              waitlist_id: waitlistId,
              patient_id: patient.patient_id,
              reason_for_visit: ['Anxiety', 'Depression', 'ADHD', 'PTSD', 'Bipolar'][i],
              urgency_level: ['high', 'medium', 'low', 'high', 'medium'][i],
              preferred_days: ['Monday,Tuesday', 'Wednesday,Thursday', 'Friday', 'Monday,Friday', 'Tuesday,Thursday'][i],
              preferred_times: ['Morning', 'Evening', 'Afternoon', 'Morning', 'Afternoon'][i],
              insurance_verified: true,
              notes: i === 0 ? 'Urgent - experiencing increased anxiety' : 
                     i === 3 ? 'Prefers morning appointments' : null
            });
          
          if (error && !error.message.includes('duplicate')) {
            console.error(`Waitlist entry error:`, error.message);
          } else {
            console.log(`✅ Added ${patient.first_name} to waitlist`);
          }
        }
      }
    }

    console.log('\n✅ Seed process completed!');
    
    // Verify the data
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
seedWithAuth();