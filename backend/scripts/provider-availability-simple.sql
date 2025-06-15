-- Run this script in Supabase SQL Editor to create the provider availability table

-- Create provider_availability table
CREATE TABLE IF NOT EXISTS provider_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_booked BOOLEAN DEFAULT false,
    patient_id UUID,
    appointment_type VARCHAR(50), -- 'in-person', 'virtual', 'both'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_date ON provider_availability(provider_id, date);
CREATE INDEX IF NOT EXISTS idx_provider_availability_date_time ON provider_availability(date, start_time);
CREATE INDEX IF NOT EXISTS idx_provider_availability_is_available ON provider_availability(is_available, is_booked);

-- Add foreign key constraints if providers and patients tables exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') THEN
        ALTER TABLE provider_availability 
        ADD CONSTRAINT fk_provider_availability_provider 
        FOREIGN KEY (provider_id) REFERENCES providers(provider_id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        ALTER TABLE provider_availability 
        ADD CONSTRAINT fk_provider_availability_patient 
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Grant permissions for authenticated users
GRANT ALL ON provider_availability TO authenticated;
GRANT ALL ON provider_availability TO service_role;

-- Enable RLS
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON provider_availability
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON provider_availability
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON provider_availability
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a simple function to check table creation
CREATE OR REPLACE FUNCTION check_provider_availability_table()
RETURNS TEXT AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_availability') THEN
        RETURN 'Table provider_availability created successfully!';
    ELSE
        RETURN 'Table provider_availability was not created.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the check
SELECT check_provider_availability_table();