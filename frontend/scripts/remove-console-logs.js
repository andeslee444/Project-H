#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to remove console.log statements from a file
function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Pattern to match console.log statements (handles multi-line)
  const consoleLogPattern = /console\.(log|warn|error|info|debug)\s*\([^)]*\);?/g;
  
  // Remove console statements
  content = content.replace(consoleLogPattern, '');
  
  // Clean up empty lines left behind
  content = content.replace(/^\s*\n/gm, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  const srcPath = path.join(__dirname, '..', 'src');
  const pattern = path.join(srcPath, '**/*.{js,jsx,ts,tsx}');
  
  const files = glob.sync(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/setupTests.*',
      '**/test/**',
      '**/stories/**',
    ]
  });
  
  console.log(`Found ${files.length} files to process...`);
  
  let modifiedCount = 0;
  files.forEach(file => {
    if (removeConsoleLogs(file)) {
      modifiedCount++;
      console.log(`✓ Cleaned: ${path.relative(srcPath, file)}`);
    }
  });
  
  console.log(`\nComplete! Modified ${modifiedCount} files.`);
}

// Check if glob is installed
try {
  require.resolve('glob');
  main();
} catch (e) {
  console.error('Please install glob first: npm install --save-dev glob');
  process.exit(1);
}