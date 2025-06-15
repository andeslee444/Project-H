const fs = require('fs');
const path = require('path');

// Frontend directory path
const frontendDir = '/Users/andeslee/Documents/Cursor-Projects/Project-H/frontend';

// Files to remove
const filesToRemove = [
  // SQL files
  'FIX_DATABASE_NOW.sql',
  'FIX_RLS_POLICIES_HIPAA_COMPLIANT.sql',
  'DISCOVER_REAL_SCHEMA.sql',
  'SIMPLE_FIX_JUST_MAKE_IT_WORK.sql',
  'REAL_FIX_BASED_ON_ACTUAL_SCHEMA.sql',
  'fix-rls-policies.sql',
  'update-patient-phones.sql',
  
  // HTML files
  'update-patient-phones.html',
  'waitlist-preview.html',
  'debug-supabase.html',
  
  // JS files
  'debug-integration-test.js',
  'debug-test.js',
  'debug-supabase-hang.js',
  'run-seed-now.js',
  'execute-rls-fixes.js',
  'update-all-patient-phones.js',
  
  // Temporary documentation
  'SUMMARY_FIXES_COMPLETE.md',
  'SUPABASE_RLS_FIX_INSTRUCTIONS.md',
  'cleanup-temp-files.sh',
  
  // Public test file
  'public/test-supabase.html'
];

console.log('Starting cleanup of temporary files...\n');

// Remove each file
filesToRemove.forEach(file => {
  const filePath = path.join(frontendDir, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ Removed: ${file}`);
    } else {
      console.log(`- Skipped (not found): ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error removing ${file}: ${error.message}`);
  }
});

// Remove test-*.html files
console.log('\nRemoving test-*.html files...');
try {
  const files = fs.readdirSync(frontendDir);
  files.forEach(file => {
    if (file.startsWith('test-') && file.endsWith('.html')) {
      const filePath = path.join(frontendDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`✓ Removed: ${file}`);
      } catch (error) {
        console.error(`✗ Error removing ${file}: ${error.message}`);
      }
    }
  });
} catch (error) {
  console.error(`Error reading directory: ${error.message}`);
}

console.log('\nCleanup complete!');

// Clean up this script itself
console.log('\nRemoving cleanup script...');
try {
  fs.unlinkSync(__filename);
  console.log('✓ Cleanup script removed');
} catch (error) {
  console.error(`✗ Error removing cleanup script: ${error.message}`);
}