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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProviders() {
  // Count total providers
  const { count, error: countError } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting providers:', countError);
    return;
  }

  console.log(`\nTotal providers in database: ${count}`);

  // Get sample of providers
  const { data: providers, error } = await supabase
    .from('providers')
    .select('provider_id, first_name, last_name, email, specialties')
    .limit(10)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching providers:', error);
    return;
  }

  console.log('\nSample of current providers:');
  providers.forEach(p => {
    console.log(`- ${p.first_name} ${p.last_name} (${p.email})`);
    console.log(`  ID: ${p.provider_id}`);
    console.log(`  Specialties: ${p.specialties?.join(', ') || 'None'}`);
    console.log('');
  });

  // Check for test providers from Excel
  const { data: testProviders, error: testError } = await supabase
    .from('providers')
    .select('first_name, last_name')
    .in('first_name', ['Greg', 'Jazmin', 'Kenisha']);

  if (!testError && testProviders.length > 0) {
    console.log('Found test providers from Excel migration:');
    testProviders.forEach(p => console.log(`- ${p.first_name} ${p.last_name}`));
  }
}

checkProviders();