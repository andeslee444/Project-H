import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectConnection() {
  console.log('Testing direct Supabase connection...\n');

  // Test 1: Simple select from waitlist_entries
  console.log('1. Testing waitlist_entries table...');
  const { data: entries, error: entriesError } = await supabase
    .from('waitlist_entries')
    .select('*');
  
  if (entriesError) {
    console.error('❌ waitlist_entries error:', entriesError);
  } else {
    console.log(`✅ waitlist_entries: ${entries?.length || 0} rows`);
    if (entries && entries.length > 0) {
      console.log('First entry:', entries[0]);
    }
  }

  // Test 2: Simple select from patients
  console.log('\n2. Testing patients table...');
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*');
  
  if (patientsError) {
    console.error('❌ patients error:', patientsError);
  } else {
    console.log(`✅ patients: ${patients?.length || 0} rows`);
    if (patients && patients.length > 0) {
      console.log('First patient:', patients[0]);
    }
  }

  // Test 3: Simple select from providers
  console.log('\n3. Testing providers table...');
  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('*');
  
  if (providersError) {
    console.error('❌ providers error:', providersError);
  } else {
    console.log(`✅ providers: ${providers?.length || 0} rows`);
    if (providers && providers.length > 0) {
      console.log('First provider:', providers[0]);
    }
  }

  // Test 4: Complex query with joins
  console.log('\n4. Testing complex query with joins...');
  const { data: complexData, error: complexError } = await supabase
    .from('waitlist_entries')
    .select(`
      *,
      patient:patients(*),
      waitlist:waitlists(*),
      provider:providers(*)
    `);
  
  if (complexError) {
    console.error('❌ Complex query error:', complexError);
  } else {
    console.log(`✅ Complex query: ${complexData?.length || 0} rows`);
    if (complexData && complexData.length > 0) {
      console.log('First complex entry:', JSON.stringify(complexData[0], null, 2));
    }
  }

  // Test 5: Check if RLS is the issue
  console.log('\n5. Testing with count to check RLS...');
  const { count, error: countError } = await supabase
    .from('waitlist_entries')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Count error:', countError);
  } else {
    console.log(`✅ Total waitlist_entries count: ${count || 0}`);
  }
}

// Run the test
testDirectConnection();