-- Migration: Add user accounts for all providers
-- This creates auth users and links them to provider records

-- First, ensure we have the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth users for each provider if they don't exist
DO $$
DECLARE
    provider_record RECORD;
    new_user_id UUID;
BEGIN
    -- Loop through all providers
    FOR provider_record IN 
        SELECT * FROM providers 
        WHERE email IS NOT NULL
    LOOP
        -- Check if user already exists
        IF NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = provider_record.email
        ) THEN
            -- Create a new auth user
            -- Note: In production, you'd use proper password hashing
            -- For demo purposes, we're using a simple pattern
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                raw_user_meta_data
            ) VALUES (
                gen_random_uuid(),
                provider_record.email,
                crypt('provider123', gen_salt('bf')), -- Demo password
                NOW(),
                NOW(),
                NOW(),
                jsonb_build_object(
                    'role', 'provider',
                    'provider_id', provider_record.id,
                    'first_name', provider_record.first_name,
                    'last_name', provider_record.last_name
                )
            ) RETURNING id INTO new_user_id;
            
            -- Update provider record with user_id
            UPDATE providers 
            SET user_id = new_user_id 
            WHERE id = provider_record.id;
            
            -- Create a user profile record
            INSERT INTO public.users (
                id,
                email,
                role,
                first_name,
                last_name,
                created_at,
                updated_at
            ) VALUES (
                new_user_id,
                provider_record.email,
                'provider',
                provider_record.first_name,
                provider_record.last_name,
                NOW(),
                NOW()
            ) ON CONFLICT (id) DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- Create RLS policies for provider_specialties table
ALTER TABLE provider_specialties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Providers can view their own specialties" ON provider_specialties;
DROP POLICY IF EXISTS "Providers can insert their own specialties" ON provider_specialties;
DROP POLICY IF EXISTS "Providers can update their own specialties" ON provider_specialties;
DROP POLICY IF EXISTS "Providers can delete their own specialties" ON provider_specialties;
DROP POLICY IF EXISTS "Admins can view all specialties" ON provider_specialties;
DROP POLICY IF EXISTS "Admins can manage all specialties" ON provider_specialties;

-- Providers can view their own specialties
CREATE POLICY "Providers can view their own specialties" ON provider_specialties
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = provider_specialties.provider_id
            AND p.user_id = auth.uid()
        )
    );

-- Providers can insert their own specialties
CREATE POLICY "Providers can insert their own specialties" ON provider_specialties
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = provider_id
            AND p.user_id = auth.uid()
        )
    );

-- Providers can update their own specialties
CREATE POLICY "Providers can update their own specialties" ON provider_specialties
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = provider_specialties.provider_id
            AND p.user_id = auth.uid()
        )
    );

-- Providers can delete their own specialties
CREATE POLICY "Providers can delete their own specialties" ON provider_specialties
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = provider_specialties.provider_id
            AND p.user_id = auth.uid()
        )
    );

-- Admins can view all specialties
CREATE POLICY "Admins can view all specialties" ON provider_specialties
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage all specialties
CREATE POLICY "Admins can manage all specialties" ON provider_specialties
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- Also ensure providers table has proper RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Providers can view all providers" ON providers;
DROP POLICY IF EXISTS "Providers can update their own record" ON providers;
DROP POLICY IF EXISTS "Admins can manage all providers" ON providers;

-- All authenticated users can view providers (for listing)
CREATE POLICY "Authenticated users can view providers" ON providers
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Providers can update their own record
CREATE POLICY "Providers can update their own record" ON providers
    FOR UPDATE
    USING (user_id = auth.uid());

-- Admins can manage all providers
CREATE POLICY "Admins can manage all providers" ON providers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- Insert sample provider credentials info into a reference table
CREATE TABLE IF NOT EXISTS provider_credentials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_name VARCHAR(255),
    email VARCHAR(255),
    demo_password VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert credential references (for documentation purposes)
INSERT INTO provider_credentials (provider_name, email, demo_password) VALUES
('Dr. Sarah Johnson', 'sjohnson@example.com', 'provider123'),
('Dr. Michael Chen', 'mchen@example.com', 'provider123'),
('LCSW Emily Rodriguez', 'erodriguez@example.com', 'provider123'),
('PhD David Thompson', 'dthompson@example.com', 'provider123'),
('LMFT Lisa Martinez', 'lmartinez@example.com', 'provider123'),
('PsyD James Wilson', 'jwilson@example.com', 'provider123');

-- Create a function to get provider specialties with proper access control
CREATE OR REPLACE FUNCTION get_provider_specialties_with_access(provider_id_param UUID)
RETURNS TABLE (
    id UUID,
    specialty_id UUID,
    specialty_name VARCHAR(255),
    category VARCHAR(100),
    years_experience INTEGER,
    certification_info TEXT,
    can_edit BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id,
        ps.specialty_id,
        s.name AS specialty_name,
        s.category,
        ps.years_experience,
        ps.certification_info,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM providers p 
                WHERE p.id = provider_id_param 
                AND p.user_id = auth.uid()
            ) THEN TRUE
            WHEN EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role IN ('admin', 'super_admin')
            ) THEN TRUE
            ELSE FALSE
        END AS can_edit
    FROM provider_specialties ps
    JOIN specialties s ON ps.specialty_id = s.id
    WHERE ps.provider_id = provider_id_param
    AND (
        -- Provider can see their own
        EXISTS (
            SELECT 1 FROM providers p 
            WHERE p.id = provider_id_param 
            AND p.user_id = auth.uid()
        )
        -- Admins can see all
        OR EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('admin', 'super_admin')
        )
        -- Other authenticated users can view (but not edit)
        OR auth.uid() IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON providers TO authenticated;
GRANT SELECT ON specialties TO authenticated;
GRANT SELECT ON provider_specialties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON provider_specialties TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_specialties_with_access TO authenticated;

COMMENT ON TABLE provider_credentials IS 'Reference table for demo provider login credentials';
COMMENT ON COLUMN provider_credentials.demo_password IS 'Demo password for testing - in production, passwords are hashed in auth.users';