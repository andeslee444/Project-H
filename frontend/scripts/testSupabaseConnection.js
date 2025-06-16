import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('providers')
      .select('provider_id, first_name, last_name')
      .limit(5);

    if (error) {
      console.error('Connection error:', error);
      return;
    }

    console.log('✓ Connection successful!');
    console.log(`Found ${data.length} providers:`);
    data.forEach(p => {
      console.log(`- ${p.first_name} ${p.last_name}`);
    });

    // Test REST API directly
    console.log('\nTesting REST API directly...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/providers?select=*&limit=3`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const restData = await response.json();
      console.log('✓ REST API successful!');
      console.log(`REST API returned ${restData.length} providers`);
    } else {
      console.error('REST API error:', response.status, response.statusText);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();