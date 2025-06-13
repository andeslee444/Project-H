-- Fix RLS policies by dropping problematic ones and creating simple, working policies

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public read access" ON practices;
DROP POLICY IF EXISTS "Public read access" ON providers;
DROP POLICY IF EXISTS "Public read access" ON patients;
DROP POLICY IF EXISTS "Public read access" ON waitlists;
DROP POLICY IF EXISTS "Public read access" ON waitlist_entries;
DROP POLICY IF EXISTS "Public read access" ON appointments;
DROP POLICY IF EXISTS "Public read access" ON appointment_slots;

-- Drop any user-related policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

-- Create simple public read policies for demo purposes
CREATE POLICY "Enable read for all" ON practices FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON providers FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON patients FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON waitlists FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON waitlist_entries FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON appointment_slots FOR SELECT USING (true);

-- Create simple insert policies for demo purposes
CREATE POLICY "Enable insert for all" ON practices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all" ON providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all" ON waitlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all" ON waitlist_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all" ON appointment_slots FOR INSERT WITH CHECK (true);

-- Enable update policies
CREATE POLICY "Enable update for all" ON practices FOR UPDATE USING (true);
CREATE POLICY "Enable update for all" ON providers FOR UPDATE USING (true);
CREATE POLICY "Enable update for all" ON patients FOR UPDATE USING (true);
CREATE POLICY "Enable update for all" ON waitlists FOR UPDATE USING (true);
CREATE POLICY "Enable update for all" ON waitlist_entries FOR UPDATE USING (true);
CREATE POLICY "Enable update for all" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Enable update for all" ON appointment_slots FOR UPDATE USING (true);