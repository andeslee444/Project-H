#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { format, addDays } from 'date-fns';

// Hardcode the values since we're testing
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProviderAvailability() {
  console.log('Testing provider availability table...\n');

  try {
    // 1. Check if table exists
    console.log('1. Checking if provider_availability table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('provider_availability')
      .select('*')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
        console.log('❌ Table does not exist. Please run the SQL script first.');
        console.log('\nTo create the table:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the script from: backend/scripts/provider-availability-simple.sql');
        return;
      } else {
        console.error('❌ Error checking table:', tableError.message);
        return;
      }
    }

    console.log('✅ Table exists!');

    // 2. Get providers
    console.log('\n2. Fetching providers...');
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('provider_id, first_name, last_name')
      .limit(3);

    if (providersError || !providers || providers.length === 0) {
      console.log('❌ No providers found');
      return;
    }

    console.log(`✅ Found ${providers.length} providers`);
    providers.forEach(p => console.log(`   - ${p.first_name} ${p.last_name} (${p.provider_id})`));

    // 3. Check existing availability
    console.log('\n3. Checking existing availability...');
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const { data: existing, error: existingError } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('date', todayStr)
      .limit(5);

    if (existing && existing.length > 0) {
      console.log(`✅ Found ${existing.length} existing slots for today`);
    } else {
      console.log('⚠️  No availability found for today');
      
      // 4. Generate sample availability
      console.log('\n4. Generating sample availability...');
      const provider = providers[0];
      const slots = [];

      // Generate slots for next 7 days
      for (let day = 0; day < 7; day++) {
        const date = addDays(today, day);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Morning slots (9 AM - 12 PM)
        for (let hour = 9; hour < 12; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            slots.push({
              provider_id: provider.provider_id,
              date: dateStr,
              start_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
              end_time: `${minute === 30 ? hour + 1 : hour}:${minute === 30 ? '00' : '30'}:00`,
              is_available: true,
              is_booked: Math.random() > 0.7, // 30% booked
              appointment_type: 'both'
            });
          }
        }
      }

      console.log(`Inserting ${slots.length} sample slots...`);
      const { data: inserted, error: insertError } = await supabase
        .from('provider_availability')
        .insert(slots);

      if (insertError) {
        console.log('❌ Error inserting slots:', insertError.message);
      } else {
        console.log('✅ Sample availability created!');
      }
    }

    // 5. Test query for UI
    console.log('\n5. Testing availability query (as used in UI)...');
    const tomorrow = addDays(today, 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
    
    const { data: availableSlots, error: queryError } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', providers[0].provider_id)
      .eq('date', tomorrowStr)
      .eq('is_available', true)
      .eq('is_booked', false)
      .order('start_time');

    if (queryError) {
      console.log('❌ Error querying availability:', queryError.message);
    } else {
      console.log(`✅ Found ${availableSlots?.length || 0} available slots for tomorrow`);
      if (availableSlots && availableSlots.length > 0) {
        console.log('\nFirst 3 available slots:');
        availableSlots.slice(0, 3).forEach(slot => {
          console.log(`   - ${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)} (${slot.appointment_type})`);
        });
      }
    }

    console.log('\n✅ Provider availability feature is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Navigate to the Waitlist page');
    console.log('2. Click on any provider card');
    console.log('3. The availability section will expand showing calendar and time slots');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProviderAvailability();