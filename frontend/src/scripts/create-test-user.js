// Script to create a test user in Supabase
// Run this in the browser console or as a node script

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUsers() {
  console.log('Creating test users...');
  
  // Create admin user
  const { data: adminData, error: adminError } = await supabase.auth.signUp({
    email: 'admin@test.com',
    password: 'testpass123',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin'
      }
    }
  });
  
  if (adminError) {
    console.error('Error creating admin:', adminError);
  } else {
    console.log('Admin user created:', adminData.user?.email);
  }
  
  // Create provider user
  const { data: providerData, error: providerError } = await supabase.auth.signUp({
    email: 'provider@test.com',
    password: 'testpass123',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'Provider',
        role: 'provider'
      }
    }
  });
  
  if (providerError) {
    console.error('Error creating provider:', providerError);
  } else {
    console.log('Provider user created:', providerData.user?.email);
  }
  
  console.log('\nYou can now log in with:');
  console.log('Admin: admin@test.com / testpass123');
  console.log('Provider: provider@test.com / testpass123');
}

// Run the function
createTestUsers();