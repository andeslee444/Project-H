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

-- Create indexes for performance
CREATE INDEX idx_provider_availability_provider_date ON provider_availability(provider_id, date);
CREATE INDEX idx_provider_availability_date_time ON provider_availability(date, start_time);
CREATE INDEX idx_provider_availability_is_available ON provider_availability(is_available, is_booked);

-- Create function to generate 30-minute time slots for providers
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

-- Sample data generation for existing providers
-- Generate availability for the next 30 days for each provider
DO $$
DECLARE
    provider RECORD;
    current_date DATE;
    end_date DATE;
BEGIN
    current_date := CURRENT_DATE;
    end_date := CURRENT_DATE + INTERVAL '30 days';
    
    FOR provider IN SELECT provider_id FROM providers LIMIT 5 LOOP
        WHILE current_date <= end_date LOOP
            -- Skip weekends
            IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
                -- Morning slots (9 AM - 12 PM)
                PERFORM generate_provider_time_slots(
                    provider.provider_id,
                    current_date,
                    '09:00:00'::TIME,
                    '12:00:00'::TIME,
                    'both'
                );
                
                -- Afternoon slots (2 PM - 5 PM)
                PERFORM generate_provider_time_slots(
                    provider.provider_id,
                    current_date,
                    '14:00:00'::TIME,
                    '17:00:00'::TIME,
                    'both'
                );
            END IF;
            
            current_date := current_date + INTERVAL '1 day';
        END LOOP;
        
        -- Reset for next provider
        current_date := CURRENT_DATE;
    END LOOP;
END $$;

-- Create a view for easily getting available slots
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