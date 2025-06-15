import { createClient } from '@supabase/supabase-js';

// Direct test without environment variables
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirect() {
  console.log('Testing direct Supabase connection...\n');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Simple query
    console.log('\n1. Testing provider_availability table...');
    const { data, error, status, statusText } = await supabase
      .from('provider_availability')
      .select('id')
      .limit(1);
    
    console.log('Response:', { 
      status, 
      statusText,
      error, 
      hasData: !!data,
      dataLength: data?.length 
    });
    
    // Test 2: Count query
    console.log('\n2. Testing count query...');
    const { count, error: countError } = await supabase
      .from('provider_availability')
      .select('*', { count: 'exact', head: true });
    
    console.log('Count result:', { count, error: countError });
    
    // Test 3: Test with specific provider
    console.log('\n3. Testing with specific date...');
    const testDate = '2025-06-16'; // Monday
    const { data: slots, error: slotsError } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('date', testDate)
      .limit(5);
    
    console.log('Slots query:', {
      date: testDate,
      error: slotsError,
      slotsFound: slots?.length || 0
    });
    
    if (slots && slots.length > 0) {
      console.log('First slot:', {
        id: slots[0].id,
        date: slots[0].date,
        time: `${slots[0].start_time} - ${slots[0].end_time}`
      });
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testDirect();