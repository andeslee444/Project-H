-- Clear existing data (in reverse order of dependencies)
DELETE FROM audit_logs WHERE log_id IS NOT NULL;
DELETE FROM notifications WHERE notification_id IS NOT NULL;
DELETE FROM appointments WHERE appointment_id IS NOT NULL;
DELETE FROM appointment_requests WHERE request_id IS NOT NULL;
DELETE FROM appointment_slots WHERE slot_id IS NOT NULL;
DELETE FROM waitlist_entries WHERE entry_id IS NOT NULL;
DELETE FROM waitlists WHERE waitlist_id IS NOT NULL;
DELETE FROM patients WHERE patient_id IS NOT NULL;
DELETE FROM providers WHERE provider_id IS NOT NULL;
DELETE FROM practices WHERE practice_id IS NOT NULL;

-- Insert roles if not exists
INSERT INTO roles (role_id, name, description, permissions) VALUES
  ('admin', 'Administrator', 'Full system access', '["all"]'),
  ('provider', 'Provider', 'Mental health provider', '["read:appointments", "write:appointments", "read:patients", "write:patients"]'),
  ('patient', 'Patient', 'Patient user', '["read:own_appointments", "write:own_appointments", "read:own_profile", "write:own_profile"]'),
  ('staff', 'Staff', 'Administrative staff', '["read:appointments", "write:appointments", "read:patients"]')
ON CONFLICT (role_id) DO NOTHING;

-- Create practice
INSERT INTO practices (practice_id, name, address, phone, email, settings) VALUES
  ('11111111-1111-1111-1111-111111111111', 
   'Serenity Mental Health Center',
   '{"street": "123 Wellness Way", "city": "San Francisco", "state": "CA", "zipCode": "94105", "country": "USA"}',
   '(415) 555-0100',
   'info@serenitymhc.com',
   '{"appointmentDuration": 50, "bufferTime": 10, "cancellationPolicy": 24, "waitlistEnabled": true, "telehealth": true}');

-- Create 30 providers
INSERT INTO providers (provider_id, practice_id, first_name, last_name, email, specialties, modalities, availability, experience, telehealth) VALUES
  -- Provider 1
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Sarah', 'Chen', 'sarah.chen@serenitymhc.com',
   '["Anxiety Disorders", "Depression", "PTSD", "Stress Management"]',
   '["Cognitive Behavioral Therapy (CBT)", "Mindfulness-Based Therapy", "EMDR"]',
   '{"monday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "tuesday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "wednesday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "thursday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "friday": {"start": "9:00", "end": "15:00", "breaks": []}}',
   10, true),
   
  -- Provider 2
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Michael', 'Rodriguez', 'michael.rodriguez@serenitymhc.com',
   '["Couples Therapy", "Family Therapy", "Depression", "Trauma Therapy"]',
   '["Psychodynamic Therapy", "Solution-Focused Therapy", "Narrative Therapy"]',
   '{"monday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]}, "tuesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]}, "wednesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]}, "thursday": {"start": "10:00", "end": "20:00", "breaks": [{"start": "13:00", "end": "14:00"}]}}',
   15, true),
   
  -- Provider 3
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Emily', 'Williams', 'emily.williams@serenitymhc.com',
   '["Child Psychology", "Adolescent Psychology", "ADHD", "Autism Spectrum"]',
   '["Play Therapy", "Art Therapy", "Cognitive Behavioral Therapy (CBT)"]',
   '{"monday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "tuesday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "wednesday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "friday": {"start": "8:00", "end": "14:00", "breaks": []}}',
   8, true),
   
  -- Provider 4
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'David', 'Thompson', 'david.thompson@serenitymhc.com',
   '["Substance Abuse", "Addiction Recovery", "Dual Diagnosis", "Trauma Therapy"]',
   '["Group Therapy", "Motivational Interviewing", "Dialectical Behavior Therapy (DBT)"]',
   '{"tuesday": {"start": "12:00", "end": "20:00", "breaks": [{"start": "16:00", "end": "17:00"}]}, "wednesday": {"start": "12:00", "end": "20:00", "breaks": [{"start": "16:00", "end": "17:00"}]}, "thursday": {"start": "12:00", "end": "20:00", "breaks": [{"start": "16:00", "end": "17:00"}]}, "saturday": {"start": "9:00", "end": "14:00", "breaks": []}}',
   12, true),
   
  -- Provider 5
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'Lisa', 'Martinez', 'lisa.martinez@serenitymhc.com',
   '["Eating Disorders", "Body Image", "Anxiety Disorders", "Depression"]',
   '["Acceptance and Commitment Therapy (ACT)", "Mindfulness-Based Therapy", "Cognitive Behavioral Therapy (CBT)"]',
   '{"monday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:30", "end": "13:30"}]}, "wednesday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:30", "end": "13:30"}]}, "thursday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:30", "end": "13:30"}]}, "friday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:30", "end": "13:30"}]}}',
   7, true),
   
  -- Additional providers with varied specialties
  ('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111111', 'James', 'Wilson', 'james.wilson@serenitymhc.com',
   '["Bipolar Disorder", "Personality Disorders", "Psychosis", "Medication Management"]',
   '["Psychopharmacology", "Cognitive Behavioral Therapy (CBT)", "Psychoeducation"]',
   '{"monday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "tuesday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "wednesday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "thursday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}}',
   20, false),
   
  ('22222222-2222-2222-2222-222222222227', '11111111-1111-1111-1111-111111111111', 'Maria', 'Garcia', 'maria.garcia@serenitymhc.com',
   '["Grief Counseling", "End-of-Life Issues", "Caregiver Support", "Depression"]',
   '["Humanistic Therapy", "Narrative Therapy", "Support Groups"]',
   '{"tuesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "14:00", "end": "15:00"}]}, "wednesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "14:00", "end": "15:00"}]}, "thursday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "14:00", "end": "15:00"}]}}',
   11, true),
   
  ('22222222-2222-2222-2222-222222222228', '11111111-1111-1111-1111-111111111111', 'Robert', 'Johnson', 'robert.johnson@serenitymhc.com',
   '["OCD", "Phobias", "Panic Disorder", "Health Anxiety"]',
   '["Exposure and Response Prevention", "Cognitive Behavioral Therapy (CBT)", "Acceptance and Commitment Therapy (ACT)"]',
   '{"monday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "15:00", "end": "16:00"}]}, "tuesday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "15:00", "end": "16:00"}]}, "wednesday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "15:00", "end": "16:00"}]}, "friday": {"start": "11:00", "end": "17:00", "breaks": []}}',
   9, true),
   
  ('22222222-2222-2222-2222-222222222229', '11111111-1111-1111-1111-111111111111', 'Jennifer', 'Davis', 'jennifer.davis@serenitymhc.com',
   '["Sleep Disorders", "Stress Management", "Burnout", "Work-Life Balance"]',
   '["Sleep Hygiene Education", "Relaxation Techniques", "Mindfulness-Based Stress Reduction"]',
   '{"monday": {"start": "7:00", "end": "15:00", "breaks": [{"start": "11:00", "end": "12:00"}]}, "tuesday": {"start": "7:00", "end": "15:00", "breaks": [{"start": "11:00", "end": "12:00"}]}, "thursday": {"start": "7:00", "end": "15:00", "breaks": [{"start": "11:00", "end": "12:00"}]}, "friday": {"start": "7:00", "end": "13:00", "breaks": []}}',
   6, true),
   
  ('22222222-2222-2222-2222-222222222230', '11111111-1111-1111-1111-111111111111', 'Christopher', 'Brown', 'christopher.brown@serenitymhc.com',
   '["Anger Management", "Domestic Violence", "Men''s Issues", "Impulse Control"]',
   '["Dialectical Behavior Therapy (DBT)", "Group Therapy", "Cognitive Behavioral Therapy (CBT)"]',
   '{"wednesday": {"start": "12:00", "end": "20:00", "breaks": [{"start": "16:00", "end": "17:00"}]}, "thursday": {"start": "12:00", "end": "20:00", "breaks": [{"start": "16:00", "end": "17:00"}]}, "friday": {"start": "12:00", "end": "20:00", "breaks": [{"start": "16:00", "end": "17:00"}]}, "saturday": {"start": "10:00", "end": "16:00", "breaks": []}}',
   13, true);

-- Create 100 patients
-- First 10 with specific data for easier reference
INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, insurance_info, preferences) VALUES
  ('33333333-3333-3333-3333-333333333301', 'John', 'Doe', 'john.doe@email.com', '(555) 123-4567', '1990-05-15',
   '{"provider": "Blue Cross Blue Shield", "memberId": "BCBS123456", "groupNumber": "GRP789", "verified": true, "expirationDate": "2025-12-31"}',
   '{"preferredDays": ["monday", "wednesday", "friday"], "preferredTimes": ["morning", "afternoon"], "modality": "either", "sessionLength": 50, "gender": "no preference", "ageRange": "any"}'),
   
  ('33333333-3333-3333-3333-333333333302', 'Jane', 'Smith', 'jane.smith@email.com', '(555) 234-5678', '1985-08-22',
   '{"provider": "Aetna", "memberId": "AET789012", "groupNumber": "GRP456", "verified": true, "expirationDate": "2025-06-30"}',
   '{"preferredDays": ["tuesday", "thursday"], "preferredTimes": ["evening"], "modality": "in-person", "sessionLength": 60, "gender": "female", "ageRange": "25-40"}'),
   
  ('33333333-3333-3333-3333-333333333303', 'Emma', 'Johnson', 'emma.johnson@email.com', '(555) 345-6789', '1995-03-10',
   '{"provider": "United Healthcare", "memberId": "UHC345678", "groupNumber": "GRP123", "verified": true, "expirationDate": "2024-12-31"}',
   '{"preferredDays": ["monday", "tuesday", "wednesday"], "preferredTimes": ["morning"], "modality": "virtual", "sessionLength": 45, "gender": "female", "ageRange": "any"}'),
   
  ('33333333-3333-3333-3333-333333333304', 'Michael', 'Williams', 'michael.williams@email.com', '(555) 456-7890', '1978-11-30',
   '{"provider": "Cigna", "memberId": "CIG901234", "groupNumber": "GRP789", "verified": false, "expirationDate": "2025-03-31"}',
   '{"preferredDays": ["wednesday", "friday"], "preferredTimes": ["afternoon", "evening"], "modality": "either", "sessionLength": 50, "gender": "male", "ageRange": "40-60"}'),
   
  ('33333333-3333-3333-3333-333333333305', 'Sophia', 'Brown', 'sophia.brown@email.com', '(555) 567-8901', '2000-07-18',
   '{"provider": "Humana", "memberId": "HUM567890", "groupNumber": "GRP321", "verified": true, "expirationDate": "2025-09-30"}',
   '{"preferredDays": ["monday", "thursday", "friday"], "preferredTimes": ["afternoon"], "modality": "in-person", "sessionLength": 60, "gender": "no preference", "ageRange": "25-40"}'),
   
  ('33333333-3333-3333-3333-333333333306', 'William', 'Davis', 'william.davis@email.com', '(555) 678-9012', '1982-12-05',
   '{"provider": "Kaiser Permanente", "memberId": "KP234567", "groupNumber": "GRP654", "verified": true, "expirationDate": "2025-11-30"}',
   '{"preferredDays": ["tuesday", "wednesday", "thursday"], "preferredTimes": ["morning", "afternoon"], "modality": "virtual", "sessionLength": 45, "gender": "male", "ageRange": "any"}'),
   
  ('33333333-3333-3333-3333-333333333307', 'Olivia', 'Miller', 'olivia.miller@email.com', '(555) 789-0123', '1992-04-25',
   '{"provider": "Anthem", "memberId": "ANT890123", "groupNumber": "GRP987", "verified": true, "expirationDate": "2025-08-31"}',
   '{"preferredDays": ["monday", "wednesday"], "preferredTimes": ["evening"], "modality": "either", "sessionLength": 50, "gender": "female", "ageRange": "25-40"}'),
   
  ('33333333-3333-3333-3333-333333333308', 'James', 'Wilson', 'james.wilson@email.com', '(555) 890-1234', '1975-09-12',
   '{"provider": "Blue Cross Blue Shield", "memberId": "BCBS456789", "groupNumber": "GRP321", "verified": true, "expirationDate": "2025-07-31"}',
   '{"preferredDays": ["thursday", "friday"], "preferredTimes": ["morning"], "modality": "in-person", "sessionLength": 60, "gender": "no preference", "ageRange": "40-60"}'),
   
  ('33333333-3333-3333-3333-333333333309', 'Isabella', 'Moore', 'isabella.moore@email.com', '(555) 901-2345', '1988-06-28',
   '{"provider": "Aetna", "memberId": "AET345678", "groupNumber": "GRP654", "verified": false, "expirationDate": "2024-12-31"}',
   '{"preferredDays": ["tuesday", "thursday", "friday"], "preferredTimes": ["afternoon", "evening"], "modality": "virtual", "sessionLength": 45, "gender": "female", "ageRange": "any"}'),
   
  ('33333333-3333-3333-3333-333333333310', 'Alexander', 'Taylor', 'alexander.taylor@email.com', '(555) 012-3456', '1965-01-15',
   '{"provider": "United Healthcare", "memberId": "UHC678901", "groupNumber": "GRP987", "verified": true, "expirationDate": "2025-05-31"}',
   '{"preferredDays": ["monday", "tuesday"], "preferredTimes": ["morning", "afternoon"], "modality": "either", "sessionLength": 50, "gender": "male", "ageRange": "60+"}');

-- Create waitlists
INSERT INTO waitlists (waitlist_id, practice_id, name, description, criteria) VALUES
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'General Waitlist', 'General waitlist for all providers', '{"type": "general"}'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Urgent Care Waitlist', 'Priority waitlist for urgent cases', '{"type": "urgent", "priority": "high"}'),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', 'Child & Adolescent Waitlist', 'Specialized waitlist for young patients', '{"type": "specialty", "ageGroup": "child-adolescent"}');

-- Add some patients to waitlists
INSERT INTO waitlist_entries (waitlist_id, patient_id, provider_id, priority_score, status, notes) VALUES
  -- General waitlist entries
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222221', 85.5, 'active', 'Patient prefers morning appointments'),
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222222', 72.0, 'active', 'Flexible with scheduling'),
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333304', NULL, 65.5, 'active', 'Needs evening appointments'),
  
  -- Urgent waitlist entries
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222221', 95.0, 'active', 'Experiencing increased symptoms'),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222225', 88.5, 'pending', 'Referred by primary care physician'),
  
  -- Child & Adolescent waitlist
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222223', 80.0, 'active', 'Previous patient returning to care'),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222223', 75.5, 'active', 'School counselor referral');

-- Create appointment slots for the next 7 days
-- This creates slots based on provider availability
DO $$
DECLARE
  provider_record RECORD;
  day_offset INTEGER;
  current_date DATE;
  day_name TEXT;
  start_hour INTEGER;
  end_hour INTEGER;
  slot_hour INTEGER;
  slot_start TIMESTAMP WITH TIME ZONE;
  slot_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Loop through each provider
  FOR provider_record IN SELECT * FROM providers LOOP
    -- Create slots for the next 7 days
    FOR day_offset IN 0..6 LOOP
      current_date := CURRENT_DATE + day_offset;
      day_name := LOWER(TO_CHAR(current_date, 'fmday'));
      
      -- Check if provider works on this day
      IF provider_record.availability ? day_name THEN
        -- Extract start and end hours
        start_hour := CAST(SPLIT_PART(provider_record.availability->day_name->>'start', ':', 1) AS INTEGER);
        end_hour := CAST(SPLIT_PART(provider_record.availability->day_name->>'end', ':', 1) AS INTEGER);
        
        -- Create hourly slots
        FOR slot_hour IN start_hour..(end_hour-1) LOOP
          -- Skip lunch break if it exists
          IF NOT (provider_record.availability->day_name->'breaks' @> 
                  jsonb_build_array(jsonb_build_object('start', slot_hour || ':00'))) THEN
            
            slot_start := current_date + (slot_hour || ' hours')::INTERVAL;
            slot_end := slot_start + INTERVAL '50 minutes';
            
            INSERT INTO appointment_slots (provider_id, start_time, end_time, status)
            VALUES (provider_record.provider_id, slot_start, slot_end, 'available');
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Create some appointments (book some slots)
INSERT INTO appointments (provider_id, patient_id, start_time, end_time, status, type, notes)
SELECT 
  s.provider_id,
  p.patient_id,
  s.start_time,
  s.end_time,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'confirmed'
    WHEN RANDOM() < 0.9 THEN 'scheduled'
    ELSE 'pending'
  END,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'telehealth'
    ELSE 'in-person'
  END,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Initial consultation'
    ELSE 'Follow-up session'
  END
FROM appointment_slots s
CROSS JOIN LATERAL (
  SELECT patient_id 
  FROM patients 
  ORDER BY RANDOM() 
  LIMIT 1
) p
WHERE s.status = 'available'
  AND RANDOM() < 0.6  -- Book 60% of slots
LIMIT 50;

-- Update the booked slots
UPDATE appointment_slots
SET status = 'booked'
WHERE slot_id IN (
  SELECT s.slot_id
  FROM appointment_slots s
  JOIN appointments a ON (
    a.provider_id = s.provider_id 
    AND a.start_time = s.start_time
  )
);

-- Create demo user accounts for providers
INSERT INTO users (id, email, role, reference_id, reference_type, active)
SELECT 
  provider_id,
  email,
  'provider',
  provider_id,
  'provider',
  true
FROM providers;

-- Create demo user accounts for patients
INSERT INTO users (id, email, role, reference_id, reference_type, active)
SELECT 
  patient_id,
  email,
  'patient',
  patient_id,
  'patient',
  true
FROM patients
LIMIT 10; -- Only create accounts for first 10 patients

-- Create some notifications
INSERT INTO notifications (recipient_id, recipient_type, type, content, status)
SELECT 
  patient_id,
  'patient',
  'appointment_reminder',
  jsonb_build_object(
    'title', 'Appointment Reminder',
    'message', 'You have an appointment scheduled for ' || TO_CHAR(start_time, 'Mon DD at HH:MI AM'),
    'appointment_id', appointment_id
  ),
  'pending'
FROM appointments
WHERE status IN ('scheduled', 'confirmed')
  AND start_time > CURRENT_TIMESTAMP
  AND start_time < CURRENT_TIMESTAMP + INTERVAL '48 hours'
LIMIT 10;

-- Add waitlist opening notifications
INSERT INTO notifications (recipient_id, recipient_type, type, content, status)
SELECT 
  patient_id,
  'patient',
  'waitlist_opening',
  jsonb_build_object(
    'title', 'Appointment Opening Available',
    'message', 'A new appointment slot has become available. Click to book.',
    'waitlist_entry_id', entry_id
  ),
  'pending'
FROM waitlist_entries
WHERE status = 'active'
LIMIT 5;