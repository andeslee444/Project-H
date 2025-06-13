// Store original fetch before any modifications
if (!window.originalFetch) {
  window.originalFetch = window.fetch;
}

// Use the Supabase client without rate limiting to avoid timeout issues
import { supabase } from '../lib/supabase-no-rate-limit';

class SupabaseServiceDebug {
  async getWaitlistEntriesSimple() {
    console.log('DEBUG: getWaitlistEntriesSimple called');
    
    try {
      console.log('DEBUG: About to make query...');
      
      // First, let's try a simple query without joins
      console.log('DEBUG: Testing simple query first...');
      console.log('DEBUG: Supabase client exists:', !!supabase);
      console.log('DEBUG: Supabase URL:', supabase.supabaseUrl);
      
      // Try direct REST API call first
      const directUrl = `${supabase.supabaseUrl}/rest/v1/waitlist_entries?limit=1`;
      console.log('DEBUG: Trying direct REST API call to:', directUrl);
      
      try {
        const directResponse = await fetch(directUrl, {
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        });
        console.log('DEBUG: Direct REST API response status:', directResponse.status);
        const directData = await directResponse.json();
        console.log('DEBUG: Direct REST API data:', directData);
      } catch (directError) {
        console.error('DEBUG: Direct REST API error:', directError);
      }
      
      // Skip SDK test since it hangs - we know direct API works
      console.log('DEBUG: Skipping SDK query (it hangs). Using direct REST API for data.');
      
      // Use direct REST API call with embedded resources to get related data
      // This uses PostgREST's resource embedding syntax
      const fullDataUrl = `${supabase.supabaseUrl}/rest/v1/waitlist_entries?select=*,patients(*),providers(*),waitlists(*)&limit=10`;
      const fullDataResponse = await fetch(fullDataUrl, {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log('DEBUG: Direct API response status:', fullDataResponse.status);
      
      if (!fullDataResponse.ok) {
        const errorText = await fullDataResponse.text();
        console.error('Direct API error:', errorText);
        return { data: null, success: false, error: errorText };
      }
      
      const data = await fullDataResponse.json();
      console.log('DEBUG: Direct API returned data:', data);
      
      const error = null;
      
      if (error) {
        console.error('Supabase error:', error);
        return { data: null, success: false, error: error.message };
      }
      
      // Map the embedded data to the expected format
      if (data && data.length > 0) {
        console.log(`DEBUG: Found ${data.length} waitlist entries with embedded data`);
        
        // The API returns embedded data with singular names (patients, providers, waitlists)
        const mappedData = data.map(entry => ({
          ...entry,
          patient: entry.patients || {
            patient_id: entry.patient_id,
            first_name: 'Unknown',
            last_name: 'Patient',
            email: 'no-email@example.com',
            phone: '(000) 000-0000',
            preferences: { primaryCondition: 'Not specified' },
            insurance_info: { provider: 'Not specified' }
          },
          provider: entry.providers,
          waitlist: entry.waitlists
        }));
        
        console.log('DEBUG: First mapped entry:', mappedData[0]);
        return { data: mappedData, success: true };
      }
      
      return { data, success: true };
    } catch (error) {
      console.error('Service error:', error);
      return { data: null, success: false, error: error.message };
    }
  }
}

export const supabaseServiceDebug = new SupabaseServiceDebug();