-- Fix based on actual database schema from documentation
-- This addresses the real issues without making assumptions

-- Step 1: Drop ALL existing policies to fix recursion
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 2: Create simple demo policies (no auth checks for now)
-- These allow public access for demo purposes only

CREATE POLICY "Demo - Allow all reads" ON practices FOR SELECT USING (true);
CREATE POLICY "Demo - Allow all inserts" ON practices FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo - Allow all updates" ON practices FOR UPDATE USING (true);

CREATE POLICY "Demo - Allow all reads" ON providers FOR SELECT USING (true);
CREATE POLICY "Demo - Allow all inserts" ON providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo - Allow all updates" ON providers FOR UPDATE USING (true);

CREATE POLICY "Demo - Allow all reads" ON patients FOR SELECT USING (true);
CREATE POLICY "Demo - Allow all inserts" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo - Allow all updates" ON patients FOR UPDATE USING (true);

CREATE POLICY "Demo - Allow all reads" ON waitlists FOR SELECT USING (true);
CREATE POLICY "Demo - Allow all inserts" ON waitlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo - Allow all updates" ON waitlists FOR UPDATE USING (true);

CREATE POLICY "Demo - Allow all reads" ON waitlist_entries FOR SELECT USING (true);
CREATE POLICY "Demo - Allow all inserts" ON waitlist_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo - Allow all updates" ON waitlist_entries FOR UPDATE USING (true);

-- If these tables exist, add policies for them too
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        EXECUTE 'CREATE POLICY "Demo - Allow all reads" ON appointments FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Demo - Allow all inserts" ON appointments FOR INSERT WITH CHECK (true)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment_slots') THEN
        EXECUTE 'CREATE POLICY "Demo - Allow all reads" ON appointment_slots FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Demo - Allow all inserts" ON appointment_slots FOR INSERT WITH CHECK (true)';
    END IF;
END $$;

-- Step 3: Insert test data using the correct schema from documentation

-- Insert practice (based on schema: practice_id, name, address, phone, email, settings)
INSERT INTO practices (practice_id, name, address, phone, email, settings) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Serenity Mental Health Center',
    '{"street": "123 Wellness Way", "city": "San Francisco", "state": "CA", "zipCode": "94105"}'::jsonb,
    '(415) 555-0100',
    'info@serenitymhc.com',
    '{"operating_hours": {"monday": {"open": "8:00", "close": "20:00"}}}'::jsonb
) ON CONFLICT (practice_id) DO UPDATE SET name = EXCLUDED.name;

-- Insert providers (based on schema: provider_id, practice_id, first_name, last_name, email, specialties, modalities, availability, experience, telehealth)
INSERT INTO providers (practice_id, first_name, last_name, email, specialties, modalities, availability, experience, telehealth) VALUES
('11111111-1111-1111-1111-111111111111', 'Sarah', 'Chen', 'sarah.chen@serenitymhc.com', 
 '["Anxiety Disorders", "Depression", "PTSD"]'::jsonb, 
 '["CBT", "Mindfulness"]'::jsonb,
 '{"monday": {"start": "9:00", "end": "17:00"}}'::jsonb,
 10, true),
('11111111-1111-1111-1111-111111111111', 'Michael', 'Rodriguez', 'michael.rodriguez@serenitymhc.com',
 '["Bipolar Disorder", "Depression"]'::jsonb,
 '["DBT", "Medication Management"]'::jsonb,
 '{"tuesday": {"start": "10:00", "end": "18:00"}}'::jsonb,
 15, true),
('11111111-1111-1111-1111-111111111111', 'Emily', 'Johnson', 'emily.johnson@serenitymhc.com',
 '["ADHD", "Autism Spectrum"]'::jsonb,
 '["Behavioral Therapy", "Play Therapy"]'::jsonb,
 '{"wednesday": {"start": "8:00", "end": "16:00"}}'::jsonb,
 8, true)
ON CONFLICT (email) DO NOTHING;

-- Insert patients (based on schema: patient_id, first_name, last_name, email, phone, date_of_birth, insurance_info, preferences)
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, insurance_info, preferences) VALUES
('John', 'Smith', 'john.smith@email.com', '(415) 555-0101', '1985-03-15',
 '{"provider": "Blue Cross", "policy_number": "BC123"}'::jsonb,
 '{"communication": "email", "appointment_reminders": true}'::jsonb),
('Emily', 'Davis', 'emily.davis@email.com', '(415) 555-0102', '1990-07-22',
 '{"provider": "Aetna", "policy_number": "AET456"}'::jsonb,
 '{"communication": "phone", "appointment_reminders": true}'::jsonb),
('Michael', 'Brown', 'michael.brown@email.com', '(415) 555-0103', '1978-11-08',
 '{"provider": "United", "policy_number": "UH789"}'::jsonb,
 '{"communication": "text", "appointment_reminders": true}'::jsonb),
('Sarah', 'Wilson', 'sarah.wilson@email.com', '(415) 555-0104', '1995-02-28',
 '{"provider": "Cigna", "policy_number": "CIG012"}'::jsonb,
 '{"communication": "email", "appointment_reminders": true}'::jsonb),
('David', 'Martinez', 'david.martinez@email.com', '(415) 555-0105', '1982-09-12',
 '{"provider": "Kaiser", "policy_number": "KP345"}'::jsonb,
 '{"communication": "phone", "appointment_reminders": true}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- Create waitlist (based on schema: waitlist_id, practice_id, name, description, criteria)
INSERT INTO waitlists (practice_id, name, description, criteria)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'General Waitlist',
    'Main waitlist for new patient appointments',
    '{"priority": "urgency", "match_specialties": true}'::jsonb
) ON CONFLICT DO NOTHING;

-- Add patients to waitlist (based on schema: entry_id, waitlist_id, patient_id, provider_id, priority_score, status, notes)
INSERT INTO waitlist_entries (waitlist_id, patient_id, priority_score, status, notes)
SELECT 
    w.waitlist_id,
    p.patient_id,
    CASE 
        WHEN p.email LIKE 'john%' THEN 95
        WHEN p.email LIKE 'sarah%' THEN 90
        WHEN p.email LIKE 'emily%' THEN 82
        WHEN p.email LIKE 'michael%' THEN 78
        ELSE 75
    END as priority_score,
    'waiting',
    CASE 
        WHEN p.email LIKE 'john%' THEN 'Urgent - experiencing increased anxiety'
        WHEN p.email LIKE 'sarah%' THEN 'Prefers morning appointments'
        ELSE 'New patient consultation'
    END
FROM patients p
CROSS JOIN waitlists w
WHERE w.name = 'General Waitlist'
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 'Data seeded successfully!' as status;
SELECT 'Practices:' as table_name, COUNT(*) as count FROM practices
UNION ALL
SELECT 'Providers:', COUNT(*) FROM providers
UNION ALL
SELECT 'Patients:', COUNT(*) FROM patients
UNION ALL
SELECT 'Waitlists:', COUNT(*) FROM waitlists
UNION ALL
SELECT 'Waitlist Entries:', COUNT(*) FROM waitlist_entries
ORDER BY table_name;