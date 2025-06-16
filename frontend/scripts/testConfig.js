// Test configuration detection
console.log('Testing configuration detection...\n');

// Check environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_DEMO_MODE:', process.env.VITE_DEMO_MODE);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Can't directly import config due to ES modules, but we can check the logic
const isLocalhost = true; // We know we're on localhost
const isDemoMode = process.env.VITE_DEMO_MODE === 'true';

console.log('\nDetection results:');
console.log('Is localhost:', isLocalhost);
console.log('Is demo mode explicitly set:', isDemoMode);
console.log('Expected auth mode:', isDemoMode ? 'demo' : 'production');