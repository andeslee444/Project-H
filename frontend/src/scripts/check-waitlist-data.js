import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkWaitlistData() {
  console.log('Checking waitlist data...\n');

  try {
    // Check waitlists
    const { data: waitlists, error: waitlistError } = await supabase
      .from('waitlists')
      .select('*');
    
    console.log('Waitlists:', waitlists);
    if (waitlistError) console.error('Waitlist error:', waitlistError);

    // Check waitlist entries with patient data
    const { data: entries, error: entriesError } = await supabase
      .from('waitlist_entries')
      .select(`
        *,
        patient:patients(*),
        waitlist:waitlists(*),
        provider:providers(*)
      `)
      .order('priority_score', { ascending: false });
    
    console.log('\nWaitlist entries count:', entries?.length || 0);
    console.log('First few entries:', entries?.slice(0, 3));
    if (entriesError) console.error('Entries error:', entriesError);

    // Check if we have patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5);
    
    console.log('\nPatients count:', patients?.length || 0);
    console.log('First patient:', patients?.[0]);
    if (patientsError) console.error('Patients error:', patientsError);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkWaitlistData();