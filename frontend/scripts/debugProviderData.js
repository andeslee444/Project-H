import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugProviderData() {
  // Get a sample provider to check location structure
  const { data: sampleProvider, error } = await supabase
    .from('providers')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching provider:', error);
    return;
  }

  console.log('Sample provider location data:');
  console.log('==============================');
  console.log('Location field:', sampleProvider.location);
  console.log('Type of location:', typeof sampleProvider.location);
  
  if (sampleProvider.location) {
    console.log('\nLocation properties:');
    Object.entries(sampleProvider.location).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  // Check for duplicate emails
  const { data: allProviders } = await supabase
    .from('providers')
    .select('first_name, last_name, email')
    .order('email');

  const emailCounts = {};
  allProviders?.forEach(p => {
    emailCounts[p.email] = (emailCounts[p.email] || 0) + 1;
  });

  const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log('\nDuplicate emails found:');
    duplicates.forEach(([email, count]) => {
      console.log(`  ${email}: ${count} occurrences`);
    });
  }
}

debugProviderData().catch(console.error);