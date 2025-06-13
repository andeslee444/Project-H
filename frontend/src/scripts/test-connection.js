import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  try {
    // Test 1: Fetch providers
    console.log('1. Fetching providers...');
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('*')
      .limit(5);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
    } else {
      console.log(`✓ Found ${providers.length} providers`);
      providers.forEach(p => {
        console.log(`  - ${p.first_name} ${p.last_name}: ${p.specialties?.join(', ') || 'No specialties'}`);
      });
    }

    // Test 2: Fetch patients
    console.log('\n2. Fetching patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5);

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
    } else {
      console.log(`✓ Found ${patients.length} patients`);
      patients.forEach(p => {
        console.log(`  - ${p.first_name} ${p.last_name}: ${p.email}`);
      });
    }

    // Test 3: Fetch practices
    console.log('\n3. Fetching practices...');
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('*');

    if (practicesError) {
      console.error('Error fetching practices:', practicesError);
    } else {
      console.log(`✓ Found ${practices.length} practices`);
      practices.forEach(p => {
        console.log(`  - ${p.name}: ${p.email}`);
      });
    }

    // Test 4: Fetch waitlists
    console.log('\n4. Fetching waitlists...');
    const { data: waitlists, error: waitlistsError } = await supabase
      .from('waitlists')
      .select('*');

    if (waitlistsError) {
      console.error('Error fetching waitlists:', waitlistsError);
    } else {
      console.log(`✓ Found ${waitlists.length} waitlists`);
      waitlists.forEach(w => {
        console.log(`  - ${w.name}: ${w.description}`);
      });
    }

    // Test 5: Test authentication
    console.log('\n5. Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'provider@demo.com',
      password: 'provider123'
    });

    if (authError) {
      console.error('Auth error:', authError);
      
      // Try to create the demo account
      console.log('\nAttempting to create demo provider account...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'provider@demo.com',
        password: 'provider123',
        options: {
          data: {
            role: 'provider',
            name: 'Demo Provider'
          }
        }
      });

      if (signUpError) {
        console.error('Error creating account:', signUpError);
      } else {
        console.log('✓ Demo provider account created successfully');
      }
    } else {
      console.log('✓ Authentication successful');
      console.log(`  - User ID: ${authData.user?.id}`);
      console.log(`  - Email: ${authData.user?.email}`);
      
      // Sign out
      await supabase.auth.signOut();
    }

    console.log('\n✅ Connection test completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testConnection();