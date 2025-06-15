import { createClient } from '@supabase/supabase-js';

// Test Supabase connection
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1MjY2ODIsImV4cCI6MjAzMzEwMjY4Mn0.vRyHjPMI9Ua2TfA8BkZpyj97uLXXGUhhNFk-a6u7kPg';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);
console.log('Key prefix:', supabaseAnonKey.substring(0, 50) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('\n1. Testing basic connection...');
    const { data: test, error: testError } = await supabase
      .from('providers')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Connection test failed:', testError);
    } else {
      console.log('Connection successful!');
    }

    // Test 2: Try to get session
    console.log('\n2. Testing auth session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session:', session ? 'Active' : 'None');
    }

    // Test 3: Try to sign in
    console.log('\n3. Testing sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'provider@example.com',
      password: 'password123' // You'll need to replace with actual password
    });

    if (error) {
      console.error('Sign in error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Sign in successful!', data.user.email);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();