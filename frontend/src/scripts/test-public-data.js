import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicData() {
  console.log('Testing public data access...\n');

  try {
    // Test 1: List tables
    console.log('1. Checking tables exist...');
    const { data: tables, error: tablesError } = await supabase
      .from('practices')
      .select('count')
      .single();

    if (tablesError) {
      console.error('Error accessing tables:', tablesError);
    } else {
      console.log('✓ Tables are accessible');
    }

    // Test 2: Check if data exists using a simpler query
    console.log('\n2. Checking for data in tables...');
    
    // Check providers table
    const { count: providerCount, error: providerCountError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
    
    if (providerCountError) {
      console.error('Error counting providers:', providerCountError);
    } else {
      console.log(`✓ Providers table has ${providerCount} records`);
    }

    // Check patients table  
    const { count: patientCount, error: patientCountError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (patientCountError) {
      console.error('Error counting patients:', patientCountError);
    } else {
      console.log(`✓ Patients table has ${patientCount} records`);
    }

    // Test 3: Create a simple test provider
    console.log('\n3. Testing data insertion...');
    const testProvider = {
      practice_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Test',
      last_name: 'Provider',
      email: `test.provider${Date.now()}@example.com`,
      specialties: ['Test Specialty'],
      modalities: ['Test Modality'],
      availability: {},
      experience: 5,
      telehealth: true
    };

    const { data: newProvider, error: insertError } = await supabase
      .from('providers')
      .insert(testProvider)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting provider:', insertError);
      console.log('\nThis might be due to RLS policies. Checking auth status...');
      
      // Check current auth status
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user ? user.email : 'Not authenticated');
    } else {
      console.log('✓ Successfully inserted test provider:', newProvider.email);
      
      // Clean up
      await supabase
        .from('providers')
        .delete()
        .eq('provider_id', newProvider.provider_id);
    }

    console.log('\n✅ Public data test completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testPublicData();