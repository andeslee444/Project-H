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

async function verifyProviderData() {
  console.log('Verifying provider data structure...\n');

  // Get a few providers to check structure
  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .limit(3);

  if (error) {
    console.error('Error fetching providers:', error);
    return;
  }

  // Check first provider structure
  const provider = providers[0];
  console.log('Sample Provider Structure:');
  console.log('==========================');
  console.log(`Name: ${provider.first_name} ${provider.last_name}`);
  console.log(`Title: ${provider.title}`);
  console.log(`Email: ${provider.email}`);
  console.log(`Specialties: ${provider.specialties?.join(', ')}`);
  console.log(`Modalities: ${provider.modalities?.join(', ')}`);
  console.log(`Languages: ${provider.languages?.join(', ')}`);
  console.log(`Insurance: ${provider.insurance_accepted?.slice(0, 3).join(', ')}...`);
  console.log(`Virtual Available: ${provider.virtual_available}`);
  console.log(`In-Person Available: ${provider.in_person_available}`);
  console.log(`Rating: ${provider.rating}`);
  console.log(`Photo URL: ${provider.photo}`);
  
  // Check required fields
  console.log('\nRequired Fields Check:');
  console.log('======================');
  const requiredFields = [
    'provider_id', 'practice_id', 'first_name', 'last_name', 
    'email', 'specialties', 'modalities', 'languages',
    'insurance_accepted', 'location', 'availability'
  ];
  
  requiredFields.forEach(field => {
    const hasField = provider[field] !== undefined && provider[field] !== null;
    const isEmpty = Array.isArray(provider[field]) ? provider[field].length === 0 : !provider[field];
    console.log(`${field}: ${hasField ? '✓' : '✗'} ${isEmpty ? '(empty)' : ''}`);
  });

  // Check specialties mapping
  console.log('\nSpecialties Check:');
  console.log('==================');
  const { data: allProviders } = await supabase
    .from('providers')
    .select('first_name, last_name, specialties');

  const allSpecialties = new Set();
  allProviders.forEach(p => {
    p.specialties?.forEach(s => allSpecialties.add(s));
  });

  console.log('Unique specialties in database:');
  Array.from(allSpecialties).sort().forEach(s => console.log(`- ${s}`));

  // Check provider count by title
  console.log('\nProvider Count by Title:');
  console.log('========================');
  const titleCounts = {};
  allProviders.forEach(p => {
    const title = providers.find(pr => pr.first_name === p.first_name)?.title || 'Unknown';
    titleCounts[title] = (titleCounts[title] || 0) + 1;
  });
  
  Object.entries(titleCounts).forEach(([title, count]) => {
    console.log(`${title}: ${count} providers`);
  });

  console.log(`\nTotal providers: ${allProviders.length}`);
}

verifyProviderData().catch(console.error);