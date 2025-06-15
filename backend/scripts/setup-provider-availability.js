const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProviderAvailability() {
  try {
    console.log('Creating provider_availability table...');
    
    // Create the table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create provider_availability table
        CREATE TABLE IF NOT EXISTS provider_availability (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            is_available BOOLEAN DEFAULT true,
            is_booked BOOLEAN DEFAULT false,
            patient_id UUID REFERENCES patients(patient_id) ON DELETE SET NULL,
            appointment_type VARCHAR(50), -- 'in-person', 'virtual'
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.log('Table might already exist or error:', tableError.message);
    } else {
      console.log('Table created successfully');
    }

    // Create indexes
    console.log('Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_date ON provider_availability(provider_id, date);
        CREATE INDEX IF NOT EXISTS idx_provider_availability_date_time ON provider_availability(date, start_time);
        CREATE INDEX IF NOT EXISTS idx_provider_availability_is_available ON provider_availability(is_available, is_booked);
      `
    });

    // Create the function for generating time slots
    console.log('Creating time slot generation function...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION generate_provider_time_slots(
            p_provider_id UUID,
            p_date DATE,
            p_start_time TIME,
            p_end_time TIME,
            p_appointment_type VARCHAR(50) DEFAULT 'both'
        ) RETURNS VOID AS $$
        DECLARE
            current_time TIME;
        BEGIN
            current_time := p_start_time;
            
            WHILE current_time < p_end_time LOOP
                -- Insert for in-person if requested
                IF p_appointment_type IN ('in-person', 'both') THEN
                    INSERT INTO provider_availability (
                        provider_id, 
                        date, 
                        start_time, 
                        end_time, 
                        appointment_type
                    ) VALUES (
                        p_provider_id,
                        p_date,
                        current_time,
                        current_time + INTERVAL '30 minutes',
                        'in-person'
                    ) ON CONFLICT DO NOTHING;
                END IF;
                
                -- Insert for virtual if requested
                IF p_appointment_type IN ('virtual', 'both') THEN
                    INSERT INTO provider_availability (
                        provider_id, 
                        date, 
                        start_time, 
                        end_time, 
                        appointment_type
                    ) VALUES (
                        p_provider_id,
                        p_date,
                        current_time,
                        current_time + INTERVAL '30 minutes',
                        'virtual'
                    ) ON CONFLICT DO NOTHING;
                END IF;
                
                current_time := current_time + INTERVAL '30 minutes';
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // Get first 5 providers
    console.log('Fetching providers...');
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('provider_id')
      .limit(5);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
      return;
    }

    // Generate sample availability data
    console.log('Generating sample availability for providers...');
    const today = new Date();
    
    for (const provider of providers) {
      console.log(`Generating availability for provider ${provider.provider_id}...`);
      
      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        
        // Skip weekends
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          continue;
        }
        
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Morning slots (9 AM - 12 PM)
        await supabase.rpc('generate_provider_time_slots', {
          p_provider_id: provider.provider_id,
          p_date: dateStr,
          p_start_time: '09:00:00',
          p_end_time: '12:00:00',
          p_appointment_type: 'both'
        });
        
        // Afternoon slots (2 PM - 5 PM)
        await supabase.rpc('generate_provider_time_slots', {
          p_provider_id: provider.provider_id,
          p_date: dateStr,
          p_start_time: '14:00:00',
          p_end_time: '17:00:00',
          p_appointment_type: 'both'
        });
      }
    }

    // Create the view
    console.log('Creating available_slots view...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW available_slots AS
        SELECT 
            pa.*,
            p.first_name || ' ' || p.last_name as provider_name,
            p.photo as provider_photo
        FROM provider_availability pa
        JOIN providers p ON p.provider_id = pa.provider_id
        WHERE pa.is_available = true 
            AND pa.is_booked = false
            AND pa.date >= CURRENT_DATE
        ORDER BY pa.date, pa.start_time;
      `
    });

    console.log('Provider availability setup complete!');
    
    // Test by fetching some available slots
    const { data: testSlots, error: testError } = await supabase
      .from('provider_availability')
      .select('*')
      .limit(10);
      
    if (testError) {
      console.error('Error testing availability:', testError);
    } else {
      console.log(`Created ${testSlots?.length || 0} availability slots`);
    }

  } catch (error) {
    console.error('Error setting up provider availability:', error);
  }
}

setupProviderAvailability();