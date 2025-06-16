// Helper script to authenticate with real Supabase
// This bypasses the demo mode logic in the login component

import { supabase } from '../lib/supabase.js';

export async function authenticateWithSupabase(email, password) {
  try {
    console.log('Attempting Supabase authentication for:', email);
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    }
    
    if (data?.user) {
      console.log('✅ Successfully authenticated:', data.user.email);
      console.log('User metadata:', data.user.user_metadata);
      
      // Clear any demo mode flags
      localStorage.removeItem('isDemoMode');
      localStorage.removeItem('demoUser');
      
      // Store auth token (Supabase handles this automatically)
      console.log('Session established, redirecting...');
      
      return { 
        success: true, 
        user: data.user,
        session: data.session 
      };
    }
    
    return { success: false, error: 'No user data returned' };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

// Function to create a new user if needed
export async function createSupabaseUser(email, password, metadata = {}) {
  try {
    console.log('Creating new Supabase user:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
    
    if (data?.user) {
      console.log('✅ User created successfully:', data.user.email);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: 'No user data returned' };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

// Function to check current auth status
export async function checkAuthStatus() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false, error: error.message };
    }
    
    if (user) {
      console.log('Currently authenticated as:', user.email);
      return { authenticated: true, user };
    }
    
    console.log('Not authenticated');
    return { authenticated: false };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { authenticated: false, error: err.message };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.supabaseAuthHelper = {
    authenticate: authenticateWithSupabase,
    createUser: createSupabaseUser,
    checkStatus: checkAuthStatus
  };
}