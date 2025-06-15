#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== GitHub Pages Pre-build Script ===');
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GITHUB_PAGES:', process.env.GITHUB_PAGES);
console.log('VITE_DEMO_MODE:', process.env.VITE_DEMO_MODE);

// Ensure demo mode is enabled for GitHub Pages
if (process.env.GITHUB_PAGES === 'true') {
  console.log('✓ GitHub Pages build detected - Demo mode will be enabled');
  
  const buildConfig = {
    isGitHubPages: true,
    demoMode: true,
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  };
  
  const configPath = path.join(__dirname, '../src/build-config.json');
  
  // Ensure the src directory exists
  const srcDir = path.dirname(configPath);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, JSON.stringify(buildConfig, null, 2));
  console.log('✓ Build config written to:', configPath);
} else {
  console.log('ℹ Regular build - using standard configuration');
}

console.log('=== Pre-build complete ===');