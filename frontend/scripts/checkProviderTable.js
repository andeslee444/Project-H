import { createClient } from '@supabase/supabase-js';

// Read from environment or use the values from .env
const SUPABASE_URL = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProviderTable() {
  try {
    console.log('Checking provider table structure...\n');

    // Get one provider to see the columns
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching provider:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Current provider table columns:');
      console.log(Object.keys(data[0]));
      console.log('\nSample provider data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('No providers found in table');
    }

    // Get table information using Supabase's API
    const tableInfoUrl = `${SUPABASE_URL}/rest/v1/providers?limit=0`;
    const response = await fetch(tableInfoUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (response.ok) {
      const count = response.headers.get('content-range');
      console.log('\nTotal providers in database:', count ? count.split('/')[1] : 'unknown');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProviderTable();