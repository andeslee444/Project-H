import { useEffect } from 'react';
import { useAuth } from './useAuth';

// Demo user profiles with proper roles
const DEMO_USERS = {
  'admin@example.com': {
    id: 'demo-admin-001',
    email: 'admin@example.com',
    role: 'admin',
    first_name: 'Demo',
    last_name: 'Administrator',
    user_metadata: { role: 'admin' }
  },
  'provider@example.com': {
    id: 'demo-provider-001',
    email: 'provider@example.com',
    role: 'provider',
    first_name: 'Dr. Sarah',
    last_name: 'Johnson',
    user_metadata: { role: 'provider' }
  },
  'patient@example.com': {
    id: 'demo-patient-001',
    email: 'patient@example.com',
    role: 'patient',
    first_name: 'Demo',
    last_name: 'Patient',
    user_metadata: { role: 'patient' }
  }
};

export function useDemoAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    // Check if we're in demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get('demo') === 'true';
    const demoEmail = urlParams.get('demoUser');
    
    if (isDemoMode && demoEmail && DEMO_USERS[demoEmail]) {
      // Set the demo user in the auth context
      const demoUser = DEMO_USERS[demoEmail];
      
      // Store in localStorage for persistence
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('isDemoMode', 'true');
      
      // Force a re-render with the demo user
      window.dispatchEvent(new Event('demo-login'));
    }
  }, []);
  
  return auth;
}

// Helper to check if we're in demo mode
export function isDemoMode() {
  return localStorage.getItem('isDemoMode') === 'true';
}

// Helper to get demo user
export function getDemoUser() {
  const demoUserStr = localStorage.getItem('demoUser');
  return demoUserStr ? JSON.parse(demoUserStr) : null;
}

// Helper to clear demo mode
export function clearDemoMode() {
  localStorage.removeItem('demoUser');
  localStorage.removeItem('isDemoMode');
}