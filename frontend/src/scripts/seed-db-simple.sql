-- Simple seed script without users table dependencies
-- This avoids the RLS policy issues

-- Create practice if it doesn't exist
INSERT INTO practices (practice_id, name, specialties, address, contact_info, settings)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Serenity Mental Health Center',
  ARRAY['Anxiety Disorders', 'Depression', 'PTSD', 'Bipolar Disorder', 'ADHD', 'Substance Abuse'],
  '123 Wellness Way, San Francisco, CA 94105',
  '{"phone": "(415) 555-0100", "email": "info@serenitymhc.com", "website": "www.serenitymhc.com"}',
  '{"operating_hours": {"monday": {"open": "8:00", "close": "20:00"}, "tuesday": {"open": "8:00", "close": "20:00"}, "wednesday": {"open": "8:00", "close": "20:00"}, "thursday": {"open": "8:00", "close": "20:00"}, "friday": {"open": "8:00", "close": "18:00"}, "saturday": {"open": "9:00", "close": "14:00"}}, "appointment_duration": 50, "buffer_time": 10}'
) ON CONFLICT (practice_id) DO NOTHING;

-- Create providers
INSERT INTO providers (practice_id, first_name, last_name, email, specialties, modalities, availability, experience, telehealth) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah', 'Chen', 'sarah.chen@serenitymhc.com',
   ARRAY['Anxiety Disorders', 'Depression', 'PTSD', 'Stress Management'],
   ARRAY['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'EMDR'],
   '{"monday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "tuesday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "wednesday": {"start": "10:00", "end": "18:00", "breaks": [{"start": "13:00", "end": "14:00"}]}, "thursday": {"start": "9:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "friday": {"start": "9:00", "end": "15:00", "breaks": [{"start": "12:00", "end": "12:30"}]}}',
   10, true),
  ('11111111-1111-1111-1111-111111111111', 'Michael', 'Rodriguez', 'michael.rodriguez@serenitymhc.com',
   ARRAY['Bipolar Disorder', 'Depression', 'Mood Disorders'],
   ARRAY['Dialectical Behavior Therapy (DBT)', 'Medication Management', 'Psychodynamic Therapy'],
   '{"monday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "14:00", "end": "15:00"}]}, "tuesday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "14:00", "end": "15:00"}]}, "wednesday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "14:00", "end": "15:00"}]}, "thursday": {"start": "11:00", "end": "19:00", "breaks": [{"start": "14:00", "end": "15:00"}]}}',
   15, true),
  ('11111111-1111-1111-1111-111111111111', 'Emily', 'Johnson', 'emily.johnson@serenitymhc.com',
   ARRAY['ADHD', 'Autism Spectrum', 'Learning Disabilities'],
   ARRAY['Behavioral Therapy', 'Play Therapy', 'Parent Training'],
   '{"monday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "tuesday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "thursday": {"start": "8:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "friday": {"start": "8:00", "end": "14:00", "breaks": [{"start": "11:30", "end": "12:00"}]}}',
   8, true);

-- Create patients
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, insurance_info, health_history, preferences) VALUES
  ('John', 'Smith', 'john.smith@email.com', '(415) 555-0101', '1985-03-15', 'male',
   '{"provider": "Blue Cross Blue Shield", "policy_number": "BC123456", "group_number": "GRP789"}',
   '{"conditions": ["Generalized Anxiety Disorder", "Insomnia"], "medications": ["Sertraline 50mg"], "previous_therapy": true}',
   '{"communication": "email", "appointment_reminders": true, "preferred_times": ["Morning", "Early Afternoon"], "telehealth_preference": "flexible", "primaryCondition": "Anxiety"}'),
  ('Emily', 'Davis', 'emily.davis@email.com', '(415) 555-0102', '1990-07-22', 'female',
   '{"provider": "Aetna", "policy_number": "AET789012", "group_number": "GRP456"}',
   '{"conditions": ["Major Depressive Disorder", "Social Anxiety"], "medications": [], "previous_therapy": false}',
   '{"communication": "phone", "appointment_reminders": true, "preferred_times": ["Evening"], "telehealth_preference": "in-person", "primaryCondition": "Depression"}'),
  ('Michael', 'Brown', 'michael.brown@email.com', '(415) 555-0103', '1978-11-08', 'male',
   '{"provider": "United Healthcare", "policy_number": "UH345678", "group_number": "GRP123"}',
   '{"conditions": ["ADHD", "Anxiety"], "medications": ["Adderall XR 20mg"], "previous_therapy": true}',
   '{"communication": "text", "appointment_reminders": true, "preferred_times": ["Afternoon"], "telehealth_preference": "telehealth", "primaryCondition": "ADHD"}'),
  ('Sarah', 'Wilson', 'sarah.wilson@email.com', '(415) 555-0104', '1995-02-28', 'female',
   '{"provider": "Cigna", "policy_number": "CIG901234", "group_number": "GRP567"}',
   '{"conditions": ["PTSD", "Depression"], "medications": ["Fluoxetine 20mg"], "previous_therapy": true}',
   '{"communication": "email", "appointment_reminders": true, "preferred_times": ["Morning", "Weekend"], "telehealth_preference": "flexible", "primaryCondition": "PTSD"}'),
  ('David', 'Martinez', 'david.martinez@email.com', '(415) 555-0105', '1982-09-12', 'male',
   '{"provider": "Kaiser Permanente", "policy_number": "KP567890", "group_number": "GRP890"}',
   '{"conditions": ["Bipolar Disorder Type II"], "medications": ["Lamotrigine 100mg", "Quetiapine 50mg"], "previous_therapy": true}',
   '{"communication": "phone", "appointment_reminders": true, "preferred_times": ["Afternoon", "Evening"], "telehealth_preference": "in-person", "primaryCondition": "Bipolar Disorder"}');

-- Create a waitlist
INSERT INTO waitlists (practice_id, name, description, max_size, settings)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'General Waitlist',
  'Main waitlist for new patient appointments',
  100,
  '{"auto_notify": true, "priority_algorithm": "weighted", "notification_window": 48}'
) ON CONFLICT (practice_id, name) DO NOTHING;

-- Add patients to waitlist (using the IDs from the inserted patients)
INSERT INTO waitlist_entries (waitlist_id, patient_id, priority_score, status, preferences, notes)
SELECT 
  w.waitlist_id,
  p.patient_id,
  CASE 
    WHEN p.email LIKE 'john%' THEN 95
    WHEN p.email LIKE 'emily%' THEN 88
    WHEN p.email LIKE 'michael%' THEN 82
    WHEN p.email LIKE 'sarah%' THEN 90
    WHEN p.email LIKE 'david%' THEN 85
    ELSE 50 + floor(random() * 40)::int
  END as priority_score,
  'waiting',
  '{"urgency": "high", "flexibility": "moderate"}',
  CASE 
    WHEN p.email LIKE 'john%' THEN 'Urgent - experiencing increased anxiety'
    WHEN p.email LIKE 'sarah%' THEN 'Prefers morning appointments'
    ELSE NULL
  END
FROM patients p
CROSS JOIN waitlists w
WHERE w.name = 'General Waitlist'
  AND p.email IN ('john.smith@email.com', 'emily.davis@email.com', 'michael.brown@email.com', 'sarah.wilson@email.com', 'david.martinez@email.com')
ON CONFLICT (waitlist_id, patient_id) DO NOTHING;