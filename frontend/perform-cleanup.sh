#!/bin/bash

# Frontend cleanup script based on CLEANUP_RECOMMENDATIONS.md
# This script removes temporary test and debug files

echo "Starting cleanup of temporary files in frontend directory..."

# Navigate to frontend directory
cd /Users/andeslee/Documents/Cursor-Projects/Project-H/frontend/

# Remove temporary SQL files
echo "Removing temporary SQL files..."
rm -f FIX_DATABASE_NOW.sql FIX_RLS_POLICIES_HIPAA_COMPLIANT.sql DISCOVER_REAL_SCHEMA.sql SIMPLE_FIX_JUST_MAKE_IT_WORK.sql REAL_FIX_BASED_ON_ACTUAL_SCHEMA.sql fix-rls-policies.sql update-patient-phones.sql

# Remove test HTML files
echo "Removing test HTML files..."
rm -f test-*.html update-patient-phones.html waitlist-preview.html debug-supabase.html

# Remove debug JS files
echo "Removing debug JS files..."
rm -f debug-integration-test.js debug-test.js debug-supabase-hang.js run-seed-now.js execute-rls-fixes.js update-all-patient-phones.js

# Remove temporary docs
echo "Removing temporary documentation..."
rm -f SUMMARY_FIXES_COMPLETE.md SUPABASE_RLS_FIX_INSTRUCTIONS.md cleanup-temp-files.sh

# Remove public test file
echo "Removing public test file..."
rm -f public/test-supabase.html

echo "Cleanup complete! The frontend directory is now clean."