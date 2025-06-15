import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../config';

// Get configuration
const config = getConfig();
const isDemoMode = config.auth.mode === 'demo';

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

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
    
    const { count: availabilityCount, error: availabilityError } = await supabase
      .from('provider_availability')
      .select('*', { count: 'exact', head: true });
    
    console.log('DEBUG: Table check results:', {
      patients: { count: patientsCount, error: patientsError },
      waitlist_entries: { count: waitlistEntriesCount, error: waitlistEntriesError },
      provider_availability: { count: availabilityCount, error: availabilityError }
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