import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g'

console.log('DEBUG: Creating Supabase client WITHOUT security middleware');

// Use the original fetch that was stored before any modifications
const originalFetch = window.originalFetch || window.fetch;
console.log('DEBUG: Using fetch:', originalFetch === window.fetch ? 'current fetch' : 'original fetch');

// Create Supabase client with original fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: originalFetch.bind(window)
  }
})

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('DEBUG: Supabase auth session check (no security):', { 
    hasSession: !!data?.session,
    error 
  });
});