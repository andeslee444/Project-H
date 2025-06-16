// Quick script to set up a test admin user
// Run this in the browser console

async function setupTestAdmin() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Try to sign in as admin first
  console.log('Attempting to sign in as admin@example.com...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'admin123'
  });
  
  if (signInData?.user) {
    console.log('✅ Successfully logged in as admin@example.com');
    console.log('User:', signInData.user);
    
    // Reload the page to update auth state
    setTimeout(() => {
      window.location.href = '/patients';
    }, 1000);
    
    return signInData.user;
  } else if (signInError) {
    console.error('Sign in error:', signInError);
    
    if (signInError.message.includes('Invalid login credentials')) {
      console.log('Admin user exists but password is different');
      console.log('Try resetting the password through the Supabase dashboard');
    }
  }
}

// Run the setup
setupTestAdmin();