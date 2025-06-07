-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create provider_specialties junction table
CREATE TABLE IF NOT EXISTS provider_specialties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  years_experience INTEGER,
  certification_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, specialty_id)
);

-- Create indexes for better performance
CREATE INDEX idx_provider_specialties_provider ON provider_specialties(provider_id);
CREATE INDEX idx_provider_specialties_specialty ON provider_specialties(specialty_id);
CREATE INDEX idx_specialties_name ON specialties(name);
CREATE INDEX idx_specialties_category ON specialties(category);

-- Insert all specialties
INSERT INTO specialties (name, category) VALUES
  ('Adjustment Disorders', 'Mental Health Conditions'),
  ('ADD/ADHD', 'Neurodevelopmental'),
  ('Anxiety/Panic', 'Anxiety Disorders'),
  ('Anger Mgmt', 'Behavioral'),
  ('Autism', 'Neurodevelopmental'),
  ('Bariatric/Spinal Stimulator Clearance', 'Medical Clearance'),
  ('Behavior Modification', 'Behavioral'),
  ('Bipolar/Manic Depressive', 'Mood Disorders'),
  ('Brief Solution focused', 'Therapy Approaches'),
  ('Chemical Dependency Assessment', 'Substance Use'),
  ('Christian Counseling', 'Faith-Based'),
  ('Cognitive Behavioral Therapy', 'Therapy Approaches'),
  ('Compulsive Gambling', 'Addiction'),
  ('Co-Occurring (substance abuse) disorders', 'Substance Use'),
  ('Cultural/Ethnic Issues', 'Cultural'),
  ('Depression', 'Mood Disorders'),
  ('Developmental Disabilities', 'Developmental'),
  ('Dialectical Behavioral Therapy', 'Therapy Approaches'),
  ('Disability Assessment/Treatment', 'Assessment'),
  ('Dissociative/Identity Disorders', 'Mental Health Conditions'),
  ('Divorce', 'Life Transitions'),
  ('Eating Disorders', 'Eating & Body Image'),
  ('(EMDR) Eye Movement Desensitisation Reprocessing', 'Therapy Approaches'),
  ('End of life issues', 'Life Transitions'),
  ('EX-RP Therapy', 'Therapy Approaches'),
  ('Faith-based therapy', 'Faith-Based'),
  ('Grief/Bereavement', 'Life Transitions'),
  ('Gay/Lesbian/Bisexual Issues', 'LGBTQ+'),
  ('Men''s Issues', 'Gender-Specific'),
  ('OCD', 'Anxiety Disorders'),
  ('Pain Management', 'Medical'),
  ('Personality Disorders', 'Mental Health Conditions'),
  ('PTSD/Trauma', 'Trauma'),
  ('Postpartum Issues', 'Perinatal'),
  ('Reactive Attachment Disorder', 'Attachment'),
  ('Schizophrenia', 'Psychotic Disorders'),
  ('Sexual Disorders', 'Sexual Health'),
  ('Sleep Disorders', 'Sleep'),
  ('Stress Management', 'Stress & Coping'),
  ('Transgender Issues', 'LGBTQ+'),
  ('Women''s Issues', 'Gender-Specific'),
  ('Relatives', 'Family & Relationships'),
  ('Spinal Stimulator Clearance', 'Medical Clearance'),
  ('Domestic Violence', 'Trauma'),
  ('Problematic Sexual Behaviors', 'Sexual Health'),
  ('Pregnant Women', 'Perinatal')
ON CONFLICT (name) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE
  ON specialties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_specialties_updated_at BEFORE UPDATE
  ON provider_specialties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for Supabase
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_specialties ENABLE ROW LEVEL SECURITY;

-- Everyone can view specialties
CREATE POLICY "Specialties are viewable by everyone" ON specialties
  FOR SELECT USING (true);

-- Only admins can modify specialties
CREATE POLICY "Only admins can insert specialties" ON specialties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can update specialties" ON specialties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can delete specialties" ON specialties
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Provider specialties policies
-- Everyone can view provider specialties
CREATE POLICY "Provider specialties are viewable by everyone" ON provider_specialties
  FOR SELECT USING (true);

-- Providers can manage their own specialties, admins can manage all
CREATE POLICY "Providers can insert their own specialties" ON provider_specialties
  FOR INSERT WITH CHECK (
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Providers can update their own specialties" ON provider_specialties
  FOR UPDATE USING (
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Providers can delete their own specialties" ON provider_specialties
  FOR DELETE USING (
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );