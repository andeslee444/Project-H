import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePatientPhones() {
  try {
    console.log('Updating all patient phone numbers to (833) 820-5947...');
    
    // Update all patients to have the test phone number
    const { data, error } = await supabase
      .from('patients')
      .update({ phone: '(833) 820-5947' })
      .neq('patient_id', '00000000-0000-0000-0000-000000000000'); // Update all except dummy ID
    
    if (error) {
      console.error('Error updating patient phones:', error);
      return;
    }
    
    console.log('Successfully updated patient phone numbers');
    
    // Verify the update
    const { data: patients, error: verifyError } = await supabase
      .from('patients')
      .select('patient_id, first_name, last_name, phone')
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log('\nFirst 5 patients after update:');
    patients.forEach(patient => {
      console.log(`- ${patient.first_name} ${patient.last_name}: ${patient.phone}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the update
updatePatientPhones();