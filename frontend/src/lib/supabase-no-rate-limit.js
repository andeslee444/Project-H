// Supabase client without rate limiting
import { createClient } from '@supabase/supabase-js';

// Use environment variables or defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

// Create Supabase client using the ORIGINAL fetch before any security modifications
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // Use the original fetch that was stored in index.html
    fetch: window.originalFetch || window.fetch
  }
});

console.log('Created Supabase client without rate limiting');