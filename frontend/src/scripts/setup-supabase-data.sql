-- Setup script for Mental Health Practice Scheduling System
-- This ensures all required data is in Supabase

-- First, let's check and update the providers table structure
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS insurance_accepted TEXT[],
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS virtual_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS in_person_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{"English"}',
ADD COLUMN IF NOT EXISTS modalities TEXT[],
ADD COLUMN IF NOT EXISTS photo TEXT;

-- Update patients table structure
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS address JSONB;

-- Insert sample providers if none exist
INSERT INTO providers (
  provider_id,
  practice_id,
  first_name,
  last_name,
  email,
  title,
  specialties,
  insurance_accepted,
  location,
  phone,
  bio,
  virtual_available,
  in_person_available,
  rating,
  review_count,
  languages,
  modalities
) VALUES 
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  (SELECT practice_id FROM practices LIMIT 1),
  'Sarah',
  'Chen',
  'sarah.chen@serenitymhc.com',
  'Clinical Psychologist, PhD',
  ARRAY['Anxiety', 'Depression', 'ADHD', 'Trauma'],
  ARRAY['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna'],
  'Manhattan, NY',
  '(212) 555-0101',
  'Dr. Chen specializes in evidence-based treatments for anxiety and mood disorders. She has over 15 years of experience helping patients develop coping strategies and achieve lasting mental wellness.',
  true,
  true,
  4.9,
  127,
  ARRAY['English', 'Mandarin'],
  ARRAY['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'EMDR']
),
(
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  (SELECT practice_id FROM practices LIMIT 1),
  'Michael',
  'Rodriguez',
  'michael.rodriguez@serenitymhc.com',
  'Licensed Clinical Social Worker, LCSW',
  ARRAY['Couples Therapy', 'Family Therapy', 'Relationships', 'Depression'],
  ARRAY['Aetna', 'Cigna', 'Oscar', 'Empire BCBS'],
  'Brooklyn, NY',
  '(718) 555-0102',
  'Michael specializes in relationship dynamics and communication strategies. He helps couples and families navigate challenges and build stronger connections.',
  true,
  false,
  4.8,
  89,
  ARRAY['English', 'Spanish'],
  ARRAY['Dialectical Behavior Therapy (DBT)', 'Psychodynamic Therapy', 'Solution-Focused Therapy']
),
(
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  (SELECT practice_id FROM practices LIMIT 1),
  'Emily',
  'Williams',
  'emily.williams@serenitymhc.com',
  'Psychiatrist, MD',
  ARRAY['Medication Management', 'Bipolar Disorder', 'OCD', 'PTSD'],
  ARRAY['Most Major Insurance Accepted'],
  'Upper East Side, NY',
  '(212) 555-0103',
  'Dr. Williams is a board-certified psychiatrist with expertise in psychopharmacology and integrated treatment approaches for complex mental health conditions.',
  true,
  true,
  4.9,
  156,
  ARRAY['English'],
  ARRAY['Medication Management', 'Psychopharmacology', 'Integrated Treatment']
),
(
  'd4e5f6a7-b8c9-0123-defa-456789012345',
  (SELECT practice_id FROM practices LIMIT 1),
  'James',
  'Taylor',
  'james.taylor@serenitymhc.com',
  'Licensed Mental Health Counselor, LMHC',
  ARRAY['Substance Abuse', 'Addiction', 'Co-occurring Disorders', 'Trauma'],
  ARRAY['United Healthcare', 'Oxford', 'Medicaid'],
  'Queens, NY',
  '(718) 555-0104',
  'James specializes in addiction recovery and dual diagnosis treatment, helping patients overcome substance use while addressing underlying mental health concerns.',
  true,
  true,
  4.7,
  98,
  ARRAY['English'],
  ARRAY['Motivational Interviewing', '12-Step Facilitation', 'Trauma-Informed Care']
),
(
  'e5f6a7b8-c9d0-1234-efab-567890123456',
  (SELECT practice_id FROM practices LIMIT 1),
  'Lisa',
  'Johnson',
  'lisa.johnson@serenitymhc.com',
  'Clinical Psychologist, PsyD',
  ARRAY['Child & Adolescent', 'ADHD', 'Autism', 'Behavioral Issues'],
  ARRAY['Blue Cross Blue Shield', 'United Healthcare', 'Aetna'],
  'Westchester, NY',
  '(914) 555-0105',
  'Dr. Johnson specializes in working with children and adolescents, helping young people and their families navigate developmental challenges and mental health concerns.',
  true,
  true,
  4.8,
  112,
  ARRAY['English'],
  ARRAY['Play Therapy', 'Parent-Child Interaction Therapy', 'Applied Behavior Analysis']
)
ON CONFLICT (email) DO UPDATE SET
  specialties = EXCLUDED.specialties,
  insurance_accepted = EXCLUDED.insurance_accepted,
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  phone = EXCLUDED.phone,
  modalities = EXCLUDED.modalities;

-- Update existing waitlist entries to ensure they have proper data
UPDATE waitlist_entries 
SET notes = CASE 
  WHEN notes IS NULL OR notes = '' THEN 
    CASE floor(random() * 5)::int
      WHEN 0 THEN 'Anxiety and stress management'
      WHEN 1 THEN 'Depression and mood management'
      WHEN 2 THEN 'ADHD evaluation and treatment'
      WHEN 3 THEN 'Couples therapy for relationship issues'
      WHEN 4 THEN 'Trauma and PTSD treatment'
    END
  ELSE notes
END
WHERE notes IS NULL OR notes = '';

-- Update patient preferences to include conditions
UPDATE patients 
SET preferences = jsonb_set(
  COALESCE(preferences, '{}'::jsonb),
  '{primaryCondition}',
  CASE 
    WHEN preferences->>'primaryCondition' IS NULL THEN
      CASE floor(random() * 5)::int
        WHEN 0 THEN '"Anxiety disorders"'::jsonb
        WHEN 1 THEN '"Depression"'::jsonb
        WHEN 2 THEN '"ADHD"'::jsonb
        WHEN 3 THEN '"Relationship issues"'::jsonb
        WHEN 4 THEN '"PTSD/Trauma"'::jsonb
      END
    ELSE preferences->'primaryCondition'
  END
)
WHERE preferences->>'primaryCondition' IS NULL;

-- Ensure all patients have insurance info
UPDATE patients 
SET insurance_info = jsonb_set(
  COALESCE(insurance_info, '{}'::jsonb),
  '{provider}',
  CASE 
    WHEN insurance_info->>'provider' IS NULL THEN
      CASE floor(random() * 5)::int
        WHEN 0 THEN '"Blue Cross Blue Shield"'::jsonb
        WHEN 1 THEN '"Aetna"'::jsonb
        WHEN 2 THEN '"United Healthcare"'::jsonb
        WHEN 3 THEN '"Cigna"'::jsonb
        WHEN 4 THEN '"Oxford"'::jsonb
      END
    ELSE insurance_info->'provider'
  END
)
WHERE insurance_info->>'provider' IS NULL;

-- Add location to patients
UPDATE patients 
SET location = CASE 
  WHEN location IS NULL THEN 
    CASE floor(random() * 5)::int
      WHEN 0 THEN 'Manhattan, NY'
      WHEN 1 THEN 'Brooklyn, NY'
      WHEN 2 THEN 'Queens, NY'
      WHEN 3 THEN 'Bronx, NY'
      WHEN 4 THEN 'Staten Island, NY'
    END
  ELSE location
END
WHERE location IS NULL;

-- Update priority scores for some entries to create "hand raised" patients
UPDATE waitlist_entries 
SET priority_score = 85 + (random() * 15)
WHERE entry_id IN (
  SELECT entry_id 
  FROM waitlist_entries 
  ORDER BY random() 
  LIMIT (SELECT COUNT(*) * 0.3 FROM waitlist_entries)
);

-- Create a view for easier querying of waitlist with patient and provider info
CREATE OR REPLACE VIEW waitlist_overview AS
SELECT 
  we.entry_id,
  we.waitlist_id,
  we.patient_id,
  we.provider_id,
  we.priority_score,
  we.status,
  we.notes,
  we.created_at,
  we.updated_at,
  p.first_name || ' ' || p.last_name AS patient_name,
  p.email AS patient_email,
  p.phone AS patient_phone,
  p.insurance_info->>'provider' AS patient_insurance,
  p.preferences->>'primaryCondition' AS patient_condition,
  p.location AS patient_location,
  pr.first_name || ' ' || pr.last_name AS provider_name,
  pr.specialties AS provider_specialties,
  pr.insurance_accepted AS provider_insurance_accepted,
  pr.location AS provider_location,
  w.name AS waitlist_name
FROM waitlist_entries we
LEFT JOIN patients p ON we.patient_id = p.patient_id
LEFT JOIN providers pr ON we.provider_id = pr.provider_id
LEFT JOIN waitlists w ON we.waitlist_id = w.waitlist_id;

-- Grant permissions
GRANT SELECT ON waitlist_overview TO authenticated;
GRANT ALL ON providers TO authenticated;
GRANT ALL ON patients TO authenticated;
GRANT ALL ON waitlist_entries TO authenticated;

-- Add RLS policies if not exists
DO $$ 
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'providers' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for authenticated users to access data
CREATE POLICY "Allow authenticated users to view providers" ON providers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view patients" ON patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view waitlist entries" ON waitlist_entries
  FOR SELECT TO authenticated USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_specialties ON providers USING GIN (specialties);
CREATE INDEX IF NOT EXISTS idx_providers_insurance ON providers USING GIN (insurance_accepted);
CREATE INDEX IF NOT EXISTS idx_patients_insurance ON patients ((insurance_info->>'provider'));
CREATE INDEX IF NOT EXISTS idx_patients_condition ON patients ((preferences->>'primaryCondition'));
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist_entries (priority_score DESC);