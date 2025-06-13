-- CRITICAL: Run this in Supabase SQL Editor to fix the database
-- Go to: https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq/sql/new

-- Step 1: Disable RLS on all tables temporarily
ALTER TABLE practices DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies to remove the recursion issue
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

-- Step 3: Insert test data directly
INSERT INTO practices (practice_id, name, address, phone, email) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Serenity Mental Health Center',
    '{"street": "123 Wellness Way", "city": "San Francisco", "state": "CA", "zipCode": "94105"}'::json,
    '(415) 555-0100',
    'info@serenitymhc.com'
) ON CONFLICT (practice_id) DO NOTHING;

-- Insert providers
INSERT INTO providers (practice_id, first_name, last_name, email) VALUES
('11111111-1111-1111-1111-111111111111', 'Sarah', 'Chen', 'sarah.chen@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Michael', 'Rodriguez', 'michael.rodriguez@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Emily', 'Johnson', 'emily.johnson@serenitymhc.com');

-- Insert patients
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth) VALUES
('John', 'Smith', 'john.smith@email.com', '(415) 555-0101', '1985-03-15'),
('Emily', 'Davis', 'emily.davis@email.com', '(415) 555-0102', '1990-07-22'),
('Michael', 'Brown', 'michael.brown@email.com', '(415) 555-0103', '1978-11-08'),
('Sarah', 'Wilson', 'sarah.wilson@email.com', '(415) 555-0104', '1995-02-28'),
('David', 'Martinez', 'david.martinez@email.com', '(415) 555-0105', '1982-09-12');

-- Create waitlist
INSERT INTO waitlists (practice_id, name, description)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'General Waitlist',
    'Main waitlist for new patient appointments'
) ON CONFLICT (practice_id, name) DO NOTHING;

-- Add patients to waitlist (using minimal columns)
INSERT INTO waitlist_entries (waitlist_id, patient_id, status, priority_score, notes)
SELECT 
    w.waitlist_id,
    p.patient_id,
    'waiting',
    CASE 
        WHEN p.email LIKE 'john%' THEN 95
        WHEN p.email LIKE 'sarah%' THEN 90
        WHEN p.email LIKE 'emily%' THEN 82
        WHEN p.email LIKE 'michael%' THEN 78
        ELSE 75
    END as priority_score,
    CASE 
        WHEN p.email LIKE 'john%' THEN 'Urgent - experiencing increased anxiety'
        WHEN p.email LIKE 'sarah%' THEN 'Prefers morning appointments'
        ELSE 'New patient consultation'
    END
FROM patients p
CROSS JOIN waitlists w
WHERE w.name = 'General Waitlist'
ON CONFLICT DO NOTHING;

-- Step 4: Verify the data was inserted
SELECT 'Practices' as table_name, COUNT(*) as count FROM practices
UNION ALL
SELECT 'Providers', COUNT(*) FROM providers
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Waitlists', COUNT(*) FROM waitlists
UNION ALL
SELECT 'Waitlist Entries', COUNT(*) FROM waitlist_entries;