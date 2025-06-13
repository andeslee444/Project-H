import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHxy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking table schemas...\n');

  try {
    // Simple test queries to check column names
    console.log('Testing practices table...');
    const { data: practiceTest, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .limit(1);
    
    if (practiceError) {
      console.error('Practice query error:', practiceError);
    } else {
      console.log('Practice columns:', practiceTest.length > 0 ? Object.keys(practiceTest[0]) : 'No data');
    }

    console.log('\nTesting patients table...');
    const { data: patientTest, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .limit(1);
    
    if (patientError) {
      console.error('Patient query error:', patientError);
    } else {
      console.log('Patient columns:', patientTest.length > 0 ? Object.keys(patientTest[0]) : 'No data');
    }

    console.log('\nTesting providers table...');
    const { data: providerTest, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .limit(1);
    
    if (providerError) {
      console.error('Provider query error:', providerError);
    } else {
      console.log('Provider columns:', providerTest.length > 0 ? Object.keys(providerTest[0]) : 'No data');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkSchema();