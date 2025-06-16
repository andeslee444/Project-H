import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration - you'll need to update these
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Initialize Supabase client only if not generating SQL
let supabase;
if (!process.argv.includes('--sql') && SUPABASE_URL !== 'your-supabase-url') {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Read the formatted provider data
const providersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../Real_data/providers_formatted.json'), 'utf8')
);

console.log(`Loaded ${providersData.length} providers from file`);

// Transform data to match Supabase schema
const transformProviderForSupabase = (provider) => {
  // Map specialties from our Excel to match the frontend expectations
  const specialtyMapping = {
    'Adjustment Disorders': 'Adjustment Disorders',
    'ADD/ADHD': 'ADHD',
    'Anxiety/Panic': 'Anxiety',
    'Anger Mgmt': 'Anger Management',
    'Autism Assessment': 'Autism',
    'Bipolar': 'Bipolar Disorder',
    'Counseling': 'General Counseling',
    'Depression': 'Depression',
    'Developmental Delays': 'Developmental Disorders',
    'Domestic Violence': 'Trauma',
    'Eating Disorders': 'Eating Disorders',
    'Family Therapy': 'Family Therapy',
    'Grief Counseling': 'Grief Counseling',
    'Individual Therapy': 'Individual Therapy',
    'Marriage Counseling': 'Couples Therapy',
    'OCD': 'OCD',
    'ODD': 'Behavioral Issues',
    'Psychosis': 'Psychosis',
    'Schizophrenia': 'Schizophrenia',
    'Self-Harm': 'Self-Harm',
    'Sexual Abuse': 'Sexual Trauma',
    'Sleep Issues': 'Sleep Disorders',
    'Substance Abuse': 'Substance Abuse',
    'Suicide ideation': 'Crisis Intervention',
    'Trauma/PTSD': 'PTSD'
  };

  // Map and clean specialties
  const mappedSpecialties = provider.specialties
    .map(spec => specialtyMapping[spec] || spec)
    .filter((spec, index, self) => self.indexOf(spec) === index); // Remove duplicates

  // Determine modalities based on specialties and notes
  const modalities = [];
  if (mappedSpecialties.includes('ADHD') || mappedSpecialties.includes('Anxiety')) {
    modalities.push('Cognitive Behavioral Therapy (CBT)');
  }
  if (mappedSpecialties.includes('PTSD') || mappedSpecialties.includes('Trauma')) {
    modalities.push('EMDR');
  }
  if (mappedSpecialties.includes('Behavioral Issues')) {
    modalities.push('Dialectical Behavior Therapy (DBT)');
  }
  if (provider.notes.includes('family')) {
    modalities.push('Family Systems Therapy');
  }
  if (modalities.length === 0) {
    modalities.push('Psychotherapy', 'Counseling');
  }

  // Generate availability object based on availability_days
  const availability = {};
  const dayMapping = {
    'M': 'monday',
    'Tu': 'tuesday', 
    'T': 'tuesday',
    'W': 'wednesday',
    'Th': 'thursday',
    'F': 'friday',
    'Sa': 'saturday',
    'Su': 'sunday'
  };
  
  provider.availability_days.forEach(day => {
    const mappedDay = dayMapping[day];
    if (mappedDay) {
      availability[mappedDay] = {
        start: "9:00",
        end: "17:00"
      };
    }
  });

  // If no availability specified, give them a default schedule
  if (Object.keys(availability).length === 0 && provider.accepting_new_patients) {
    availability.monday = { start: "9:00", end: "17:00" };
    availability.wednesday = { start: "9:00", end: "17:00" };
    availability.friday = { start: "9:00", end: "17:00" };
  }

  return {
    provider_id: provider.provider_id,
    practice_id: '11111111-1111-1111-1111-111111111111', // Default practice ID
    first_name: provider.first_name,
    last_name: provider.last_name,
    title: provider.title === 'MD' ? 'Psychiatrist, MD' : 
           provider.title === 'LSW' ? 'Licensed Social Worker, LSW' : 
           'Advanced Practice Nurse, APN',
    email: provider.email,
    phone: provider.phone || '(555) 000-0000',
    specialties: mappedSpecialties,
    modalities: modalities,
    languages: provider.languages,
    insurance_accepted: provider.insurance_accepted,
    location: provider.location,
    virtual_available: provider.virtual_available,
    in_person_available: provider.in_person_available,
    bio: provider.bio,
    rating: provider.rating,
    review_count: provider.review_count,
    weekly_slots: provider.weekly_slots,
    availability: availability,
    experience: Math.floor(Math.random() * 15) + 5, // 5-20 years experience
    telehealth: provider.virtual_available,
    photo: `https://ui-avatars.com/api/?name=${provider.first_name}+${provider.last_name}&background=random&size=400`,
    patients_seen: Math.floor(Math.random() * 500) + 100,
    created_at: provider.created_at,
    updated_at: provider.updated_at
  };
};

// Function to migrate data to Supabase
async function migrateProviders() {
  try {
    console.log('Starting provider migration to Supabase...');
    
    // First, clear existing providers (be careful with this in production!)
    if (process.argv.includes('--clear')) {
      console.log('Clearing existing providers...');
      const { error: deleteError } = await supabase
        .from('providers')
        .delete()
        .neq('provider_id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy
      
      if (deleteError) {
        console.error('Error clearing providers:', deleteError);
        return;
      }
      console.log('Existing providers cleared');
    }

    // Transform all providers
    const transformedProviders = providersData.map(transformProviderForSupabase);

    // Insert providers in batches of 10
    const batchSize = 10;
    for (let i = 0; i < transformedProviders.length; i += batchSize) {
      const batch = transformedProviders.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(transformedProviders.length / batchSize)}...`);
      
      const { data, error } = await supabase
        .from('providers')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch:`, error);
        console.error('Failed batch:', batch);
      } else {
        console.log(`Successfully inserted ${batch.length} providers`);
      }
    }

    console.log('Migration completed!');
    
    // Verify the migration
    const { count, error: countError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting providers:', countError);
    } else {
      console.log(`Total providers in database: ${count}`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Create a SQL script instead if direct insertion isn't working
function generateSQLScript() {
  const transformedProviders = providersData.map(transformProviderForSupabase);
  
  let sql = '-- Provider data migration from Excel file\n';
  sql += '-- Generated on ' + new Date().toISOString() + '\n\n';
  sql += '-- Clear existing providers (optional - uncomment if needed)\n';
  sql += "-- DELETE FROM providers WHERE provider_id != '00000000-0000-0000-0000-000000000000';\n\n";
  sql += '-- Insert new providers\n';
  sql += 'INSERT INTO providers (\n';
  sql += '  provider_id, practice_id, first_name, last_name, title, email, phone,\n';
  sql += '  specialties, modalities, languages, insurance_accepted,\n';
  sql += '  location, virtual_available, in_person_available, bio,\n';
  sql += '  rating, review_count, weekly_slots, availability,\n';
  sql += '  experience, telehealth, photo, patients_seen,\n';
  sql += '  created_at, updated_at\n';
  sql += ') VALUES\n';

  const values = transformedProviders.map((provider, index) => {
    const isLast = index === transformedProviders.length - 1;
    return `(
  '${provider.provider_id}',
  '${provider.practice_id}',
  '${provider.first_name.replace(/'/g, "''")}',
  '${provider.last_name.replace(/'/g, "''")}',
  '${provider.title}',
  '${provider.email}',
  '${provider.phone}',
  '${JSON.stringify(provider.specialties).replace(/'/g, "''")}',
  '${JSON.stringify(provider.modalities).replace(/'/g, "''")}',
  '${JSON.stringify(provider.languages).replace(/'/g, "''")}',
  '${JSON.stringify(provider.insurance_accepted).replace(/'/g, "''")}',
  '${provider.location}',
  ${provider.virtual_available},
  ${provider.in_person_available},
  '${provider.bio.replace(/'/g, "''")}',
  ${provider.rating},
  ${provider.review_count},
  ${provider.weekly_slots},
  '${JSON.stringify(provider.availability).replace(/'/g, "''")}',
  ${provider.experience},
  ${provider.telehealth},
  '${provider.photo}',
  ${provider.patients_seen},
  '${provider.created_at}',
  '${provider.updated_at}'
)${isLast ? ';' : ','}`;
  }).join('\n');

  sql += values;
  
  // Save SQL script
  const sqlPath = path.join(__dirname, '../../Real_data/providers_migration.sql');
  fs.writeFileSync(sqlPath, sql);
  console.log(`SQL script saved to: ${sqlPath}`);
}

// Check command line arguments
if (process.argv.includes('--sql')) {
  generateSQLScript();
} else if (SUPABASE_URL === 'your-supabase-url') {
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  console.log('Or run with --sql flag to generate SQL script instead');
} else {
  migrateProviders();
}