-- Discover the actual database schema
-- Run this in Supabase SQL Editor to see what columns actually exist

-- Check column names for each table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('practices', 'providers', 'patients', 'waitlists', 'waitlist_entries', 'users', 'appointments')
ORDER BY table_name, ordinal_position;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('practices', 'providers', 'patients', 'waitlists', 'waitlist_entries', 'users', 'appointments');

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;