import { createClient } from '@supabase/supabase-js'

// Check if we're in demo/GitHub Pages mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.GITHUB_PAGES === 'true';

const supabaseUrl = isDemoMode 
  ? 'https://demo.supabase.co'
  : 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = isDemoMode
  ? 'demo-key'
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

console.log('DEBUG: Creating Supabase client with:', { supabaseUrl });

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('DEBUG: Supabase auth session check:', { 
    hasSession: !!data?.session,
    error 
  });
});

// Quick table existence check
const checkTables = async () => {
  console.log('DEBUG: Checking if tables exist...');
  
  try {
    // Try a simple count query on each table
    const { count: patientsCount, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    const { count: waitlistEntriesCount, error: waitlistEntriesError } = await supabase
      .from('waitlist_entries')
      .select('*', { count: 'exact', head: true });
    
    console.log('DEBUG: Table check results:', {
      patients: { count: patientsCount, error: patientsError },
      waitlist_entries: { count: waitlistEntriesCount, error: waitlistEntriesError }
    });
    
    if (patientsError?.message?.includes('relation') || waitlistEntriesError?.message?.includes('relation')) {
      console.error('CRITICAL: Tables do not exist in Supabase!');
      console.error('Run the migrations or seed file to create tables.');
    }
  } catch (err) {
    console.error('DEBUG: Error checking tables:', err);
  }
};

// Run the check after a small delay to ensure client is ready
setTimeout(checkTables, 1000);