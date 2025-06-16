import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

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

// Load the parsed providers data
const providersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'Real_data', 'providers_formatted.json'), 'utf-8')
);

// Transform provider data for Supabase
function transformProviderForSupabase(provider, index) {
  // Generate deterministic UUID based on provider name
  const uuid = `${(index + 1).toString().padStart(8, '0')}-${provider.first_name.toLowerCase()}-${provider.last_name.toLowerCase()}-provider-${Date.now()}`.slice(0, 36);
  
  // Map specialties to match frontend expectations
  const specialtyMapping = {
    'ADD/ADHD': 'ADHD',
    'Anxiety/Panic': 'Anxiety',
    'Anger Mgmt': 'Anger Management',
    'BPD': 'Borderline Personality Disorder',
    'Couple/Marital Issues': 'Couples Therapy',
    'Men Issues': "Men's Issues",
    'Women Issues': "Women's Issues",
    'Complex Trauma': 'Trauma',
    'Suicidal ideation': 'Crisis Intervention'
  };

  const mappedSpecialties = provider.specialties
    .map(spec => specialtyMapping[spec] || spec)
    .filter((spec, index, self) => self.indexOf(spec) === index);

  // Generate modalities based on specialties
  const modalities = ['Individual Therapy'];
  if (mappedSpecialties.includes('Couples Therapy')) {
    modalities.push('Couples Therapy');
  }
  if (mappedSpecialties.includes('Family')) {
    modalities.push('Family Therapy');
  }
  if (mappedSpecialties.some(s => s.includes('Group'))) {
    modalities.push('Group Therapy');
  }

  // Generate realistic availability
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const availability = {};
  days.forEach(day => {
    if (Math.random() > 0.2) { // 80% chance of being available
      const startHour = 8 + Math.floor(Math.random() * 3);
      const endHour = 17 + Math.floor(Math.random() * 3);
      availability[day] = {
        available: true,
        slots: [
          { start: `${startHour}:00`, end: `${endHour}:00` }
        ]
      };
    } else {
      availability[day] = { available: false, slots: [] };
    }
  });

  return {
    provider_id: uuid,
    practice_id: '11111111-1111-1111-1111-111111111111',
    first_name: provider.first_name,
    last_name: provider.last_name,
    title: provider.title,
    email: `${provider.first_name.toLowerCase()}.${provider.last_name.toLowerCase()}@mindcare.com`,
    phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
    specialties: mappedSpecialties,
    modalities: modalities,
    languages: provider.languages.length > 0 ? provider.languages : ['English'],
    insurance_accepted: [
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'United Healthcare',
      'Medicare',
      'Medicaid',
      'Self-Pay'
    ],
    location: {
      address: '123 Health Center Drive',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      coordinates: {
        lat: 41.8781 + (Math.random() - 0.5) * 0.1,
        lng: -87.6298 + (Math.random() - 0.5) * 0.1
      }
    },
    virtual_available: provider.virtual_available,
    in_person_available: provider.in_person_available,
    bio: `${provider.first_name} ${provider.last_name} is a dedicated ${provider.title} specializing in ${mappedSpecialties.slice(0, 3).join(', ')}. With extensive experience in mental health care, they provide compassionate and evidence-based treatment to help patients achieve their wellness goals.`,
    rating: 4.5 + Math.random() * 0.5,
    review_count: Math.floor(Math.random() * 50) + 10,
    weekly_slots: Math.floor(Math.random() * 20) + 15,
    availability: availability,
    experience: Math.floor(Math.random() * 15) + 5,
    telehealth: provider.virtual_available,
    photo: `https://ui-avatars.com/api/?name=${provider.first_name}+${provider.last_name}&background=random&size=400`,
    patients_seen: Math.floor(Math.random() * 500) + 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function migrateProviders() {
  console.log('Starting full provider migration...');
  console.log(`Found ${providersData.length} providers in Excel data\n`);

  // First, let's backup current providers count
  const { count: currentCount } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Current providers in database: ${currentCount}`);
  
  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will DELETE all existing providers and replace with Excel data.');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Delete all existing providers
  console.log('Deleting existing providers...');
  const { error: deleteError } = await supabase
    .from('providers')
    .delete()
    .neq('provider_id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible condition)

  if (deleteError) {
    console.error('Error deleting providers:', deleteError);
    return;
  }

  console.log('Existing providers deleted.\n');

  // Insert new providers
  console.log('Inserting new providers from Excel data...');
  
  const providers = providersData.map((provider, index) => 
    transformProviderForSupabase(provider, index)
  );

  // Insert in batches of 10
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < providers.length; i += batchSize) {
    const batch = providers.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('providers')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} providers)`);
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total providers processed: ${providersData.length}`);
  console.log(`Successfully inserted: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  // Verify final count
  const { count: finalCount } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });

  console.log(`\nFinal provider count in database: ${finalCount}`);

  // Show sample of inserted providers
  const { data: sample } = await supabase
    .from('providers')
    .select('first_name, last_name, title, specialties')
    .limit(5);

  console.log('\nSample of inserted providers:');
  sample?.forEach(p => {
    console.log(`- ${p.first_name} ${p.last_name}, ${p.title}`);
    console.log(`  Specialties: ${p.specialties.slice(0, 3).join(', ')}`);
  });
}

// Run the migration
migrateProviders().catch(console.error);