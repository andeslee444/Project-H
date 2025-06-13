// Debug script to test Supabase connection and identify hang point
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

console.log('1. Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('2. Supabase client created');

// Test different types of queries
async function runTests() {
  console.log('\n=== STARTING DEBUG TESTS ===\n');
  
  // Test 1: Simple select
  console.log('Test 1: Simple select from waitlist_entries...');
  console.time('Test1');
  try {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .limit(1);
    console.timeEnd('Test1');
    console.log('Test 1 Result:', { data, error });
  } catch (err) {
    console.timeEnd('Test1');
    console.error('Test 1 Caught error:', err);
  }
  
  // Test 2: Count query
  console.log('\nTest 2: Count query...');
  console.time('Test2');
  try {
    const { count, error } = await supabase
      .from('waitlist_entries')
      .select('*', { count: 'exact', head: true });
    console.timeEnd('Test2');
    console.log('Test 2 Result:', { count, error });
  } catch (err) {
    console.timeEnd('Test2');
    console.error('Test 2 Caught error:', err);
  }
  
  // Test 3: Auth check
  console.log('\nTest 3: Auth session check...');
  console.time('Test3');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.timeEnd('Test3');
    console.log('Test 3 Result:', { hasSession: !!data?.session, error });
  } catch (err) {
    console.timeEnd('Test3');
    console.error('Test 3 Caught error:', err);
  }
  
  // Test 4: Direct API call
  console.log('\nTest 4: Direct REST API call...');
  console.time('Test4');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/waitlist_entries?limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });
    console.timeEnd('Test4');
    console.log('Test 4 Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    const text = await response.text();
    console.log('Test 4 Body:', text);
  } catch (err) {
    console.timeEnd('Test4');
    console.error('Test 4 Caught error:', err);
  }
  
  // Test 5: Check if it's a Promise issue
  console.log('\nTest 5: Promise with timeout...');
  console.time('Test5');
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
    );
    
    const queryPromise = supabase
      .from('waitlist_entries')
      .select('*')
      .limit(1);
      
    const result = await Promise.race([queryPromise, timeoutPromise]);
    console.timeEnd('Test5');
    console.log('Test 5 Result:', result);
  } catch (err) {
    console.timeEnd('Test5');
    console.error('Test 5 Caught error:', err.message);
  }
  
  console.log('\n=== TESTS COMPLETE ===\n');
}

// Run tests with a timeout
setTimeout(() => {
  console.error('\n!!! SCRIPT TIMEOUT: Tests did not complete within 10 seconds !!!');
  process.exit(1);
}, 10000);

runTests().then(() => {
  console.log('All tests completed');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});