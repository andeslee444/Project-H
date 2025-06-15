import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAvailability() {
  console.log('=== Debugging Provider Availability ===\n');

  try {
    // 1. Get a provider
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('provider_id, first_name, last_name')
      .limit(1);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
      return;
    }

    const provider = providers[0];
    console.log('Testing with provider:', provider);

    // 2. Test availability query for today
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    console.log('\nFetching availability for date:', todayStr);

    const { data, error } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', provider.provider_id)
      .eq('date', todayStr)
      .eq('is_available', true)
      .eq('is_booked', false)
      .order('start_time');

    console.log('Query result:', { 
      error, 
      dataLength: data?.length,
      firstSlot: data?.[0]
    });

    // 3. Try next Monday
    const nextMonday = new Date();
    const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
    const mondayStr = format(nextMonday, 'yyyy-MM-dd');
    
    console.log('\nFetching availability for next Monday:', mondayStr);

    const { data: mondayData, error: mondayError } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', provider.provider_id)
      .eq('date', mondayStr)
      .eq('is_available', true)
      .eq('is_booked', false)
      .order('start_time');

    console.log('Monday query result:', { 
      error: mondayError, 
      dataLength: mondayData?.length,
      slots: mondayData?.slice(0, 3).map(s => ({
        time: `${s.start_time} - ${s.end_time}`,
        type: s.appointment_type
      }))
    });

    // 4. Check total availability count
    const { count } = await supabase
      .from('provider_availability')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', provider.provider_id)
      .gte('date', todayStr);

    console.log(`\nTotal future slots for provider: ${count}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugAvailability();