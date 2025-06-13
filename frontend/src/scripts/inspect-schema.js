import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA2NjI4MiwiZXhwIjoyMDY0NjQyMjgyfQ.jJvIBNsGwvSMsX84Jt9YpEKHF-CbzogN7vP9gQgWXpo';

// Try with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function inspectSchema() {
  console.log('Inspecting database schema...\n');

  try {
    // List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try a simpler approach - just try to query each table
      console.log('\nTrying direct table queries...\n');
      
      const tablesToCheck = ['practices', 'providers', 'patients', 'waitlists', 'waitlist_entries'];
      
      for (const table of tablesToCheck) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.log(`❌ ${table}: ${error.message}`);
          } else {
            console.log(`✅ ${table}: accessible (${count || 0} rows)`);
          }
        } catch (e) {
          console.log(`❌ ${table}: ${e.message}`);
        }
      }
    } else {
      console.log('Public tables:', tables?.map(t => t.table_name).join(', '));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the inspection
inspectSchema();