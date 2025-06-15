#!/usr/bin/env python3
import os
import glob

# Frontend directory path
frontend_dir = '/Users/andeslee/Documents/Cursor-Projects/Project-H/frontend'

# Change to frontend directory
os.chdir(frontend_dir)

# Files to remove
files_to_remove = [
    # SQL files
    'FIX_DATABASE_NOW.sql',
    'FIX_RLS_POLICIES_HIPAA_COMPLIANT.sql',
    'DISCOVER_REAL_SCHEMA.sql',
    'SIMPLE_FIX_JUST_MAKE_IT_WORK.sql',
    'REAL_FIX_BASED_ON_ACTUAL_SCHEMA.sql',
    'fix-rls-policies.sql',
    'update-patient-phones.sql',
    
    # HTML files
    'update-patient-phones.html',
    'waitlist-preview.html',
    'debug-supabase.html',
    
    # JS files
    'debug-integration-test.js',
    'debug-test.js',
    'debug-supabase-hang.js',
    'run-seed-now.js',
    'execute-rls-fixes.js',
    'update-all-patient-phones.js',
    
    # Temporary documentation
    'SUMMARY_FIXES_COMPLETE.md',
    'SUPABASE_RLS_FIX_INSTRUCTIONS.md',
    'cleanup-temp-files.sh',
    
    # Public test file
    'public/test-supabase.html',
    
    # Cleanup scripts that were created
    'perform-cleanup.sh',
    'cleanup.js'
]

print('Starting cleanup of temporary files...\n')

# Remove each file
for file in files_to_remove:
    file_path = os.path.join(frontend_dir, file)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f'✓ Removed: {file}')
        else:
            print(f'- Skipped (not found): {file}')
    except Exception as e:
        print(f'✗ Error removing {file}: {e}')

# Remove test-*.html files
print('\nRemoving test-*.html files...')
test_files = glob.glob('test-*.html')
for file in test_files:
    try:
        os.remove(file)
        print(f'✓ Removed: {file}')
    except Exception as e:
        print(f'✗ Error removing {file}: {e}')

print('\nCleanup complete!')

# Clean up this script itself
print('\nRemoving cleanup script...')
try:
    os.remove(__file__)
    print('✓ Cleanup script removed')
except Exception as e:
    print(f'✗ Error removing cleanup script: {e}')