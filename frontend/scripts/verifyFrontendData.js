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

async function verifyFrontendData() {
  console.log('Verifying provider data for frontend display...\n');

  // Get sample providers
  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching providers:', error);
    return;
  }

  console.log(`Total providers fetched: ${providers.length}\n`);

  providers.forEach((provider, index) => {
    console.log(`Provider ${index + 1}:`);
    console.log('=======================');
    console.log(`Name: ${provider.first_name} ${provider.last_name}, ${provider.title}`);
    console.log(`Email: ${provider.email}`);
    console.log(`Phone: ${provider.phone}`);
    
    // Parse location if it's a string
    const location = typeof provider.location === 'string' 
      ? JSON.parse(provider.location) 
      : provider.location;
    
    console.log(`\nAddress:`);
    console.log(`  ${location.address}`);
    console.log(`  ${location.city}, ${location.state} ${location.zip}`);
    
    console.log(`\nInsurance Accepted (${provider.insurance_accepted.length} total):`);
    provider.insurance_accepted.forEach(ins => console.log(`  - ${ins}`));
    
    console.log(`\nSpecialties (${provider.specialties.length} total):`);
    provider.specialties.forEach(spec => console.log(`  - ${spec}`));
    
    console.log(`\nAvailability:`);
    console.log(`  Virtual: ${provider.virtual_available ? '✓' : '✗'}`);
    console.log(`  In-Person: ${provider.in_person_available ? '✓' : '✗'}`);
    
    console.log(`\nRating: ${provider.rating.toFixed(1)} (${provider.review_count} reviews)`);
    console.log(`Photo URL: ${provider.photo}`);
    console.log('\n' + '='.repeat(50) + '\n');
  });

  // Check unique values
  const { data: allProviders } = await supabase
    .from('providers')
    .select('specialties, insurance_accepted, title');

  // Count unique specialties
  const allSpecialties = new Set();
  allProviders.forEach(p => {
    p.specialties?.forEach(s => allSpecialties.add(s));
  });

  // Count unique insurance
  const allInsurance = new Set();
  allProviders.forEach(p => {
    p.insurance_accepted?.forEach(i => allInsurance.add(i));
  });

  // Count by title
  const titleCounts = {};
  allProviders.forEach(p => {
    titleCounts[p.title] = (titleCounts[p.title] || 0) + 1;
  });

  console.log('Summary Statistics:');
  console.log('==================');
  console.log(`Total Providers: ${allProviders.length}`);
  console.log(`\nProvider Types:`);
  Object.entries(titleCounts).forEach(([title, count]) => {
    console.log(`  ${title}: ${count}`);
  });
  
  console.log(`\nUnique Specialties: ${allSpecialties.size}`);
  console.log(Array.from(allSpecialties).sort().join(', '));
  
  console.log(`\nUnique Insurance Providers: ${allInsurance.size}`);
  console.log(Array.from(allInsurance).sort().join(', '));
}

verifyFrontendData().catch(console.error);