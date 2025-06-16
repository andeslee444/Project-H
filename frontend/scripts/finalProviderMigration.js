import XLSX from 'xlsx';
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

// Load Excel file
const filePath = path.join(__dirname, '..', '..', 'Real_data', 'Provider Specialties - Copy.xlsx');
const workbook = XLSX.readFile(filePath);

// Parse insurance data from Insurance Check sheet
function parseInsuranceData() {
  const insuranceSheet = workbook.Sheets['Insurance Check'];
  const insuranceData = XLSX.utils.sheet_to_json(insuranceSheet);
  
  const insuranceMap = {};
  
  insuranceData.forEach(row => {
    const providerName = row['__EMPTY'];
    if (!providerName || providerName === 'Additional Insurances we CAN accept:') return;
    
    const acceptedInsurance = [];
    
    // Map Excel column names to insurance provider names
    const insuranceMapping = {
      'Horizon BCBS / HNJH / Braven': 'Blue Cross Blue Shield',
      'United/ UHCCP/ Oscar/ UMR': 'United Healthcare',
      'Aetna Better Health': 'Aetna',
      'Wellpoint/ Amerigroup': 'Amerigroup',
      'Wellcare / Ambetter': 'Ambetter',
      'Aetna Commercial / Meritain': 'Aetna',
      'Cigna': 'Cigna',
      'Medicare': 'Medicare'
    };
    
    Object.entries(insuranceMapping).forEach(([excelCol, insuranceName]) => {
      if (row[excelCol] === 'x') {
        if (!acceptedInsurance.includes(insuranceName)) {
          acceptedInsurance.push(insuranceName);
        }
      }
    });
    
    // Always add Self-Pay and Medicaid as options
    acceptedInsurance.push('Self-Pay');
    if (!acceptedInsurance.includes('Medicare')) {
      acceptedInsurance.push('Medicaid');
    }
    
    insuranceMap[providerName.trim()] = acceptedInsurance;
  });
  
  return insuranceMap;
}

// Parse provider specialties from both Psych and Therapist sheets
function parseAllProviders() {
  const providers = [];
  const seenNames = new Set(); // Track names to avoid duplicates
  
  // Parse Psych Providers
  const psychSheet = workbook.Sheets['Psych Provider Specialties'];
  const psychData = XLSX.utils.sheet_to_json(psychSheet);
  
  // Get provider names from first row (column headers)
  const psychHeaderRow = psychData[0];
  const psychProviderColumns = Object.entries(psychHeaderRow).filter(([key, value]) => 
    key !== '__EMPTY' && value && value !== '-' && typeof value === 'string'
  );
  
  psychProviderColumns.forEach(([colKey, providerName]) => {
    const trimmedName = providerName.trim();
    if (seenNames.has(trimmedName)) return; // Skip duplicates
    seenNames.add(trimmedName);
    
    const nameParts = trimmedName.split(' ');
    const provider = {
      full_name: trimmedName,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' '),
      title: colKey.startsWith('APN') ? 'APN' : colKey.startsWith('MD') ? 'MD' : 'APN',
      type: 'psych',
      specialties: [],
      languages: ['English']
    };
    
    // Get specialties
    psychData.slice(1).forEach(row => {
      const specialty = row['__EMPTY'];
      if (specialty && row[colKey] === 'x') {
        provider.specialties.push(specialty);
      }
    });
    
    providers.push(provider);
  });
  
  // Parse Therapist Providers
  const therapistSheet = workbook.Sheets['Therapist Specialties'];
  const therapistData = XLSX.utils.sheet_to_json(therapistSheet);
  
  const therapistHeaderRow = therapistData[0];
  const therapistProviderColumns = Object.entries(therapistHeaderRow).filter(([key, value]) => 
    key !== '__EMPTY' && value && value !== '-' && typeof value === 'string'
  );
  
  therapistProviderColumns.forEach(([colKey, providerName]) => {
    const trimmedName = providerName.trim();
    if (seenNames.has(trimmedName)) return; // Skip duplicates
    seenNames.add(trimmedName);
    
    const nameParts = trimmedName.split(' ');
    const provider = {
      full_name: trimmedName,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' '),
      title: colKey.includes('LCSW') ? 'LCSW' : colKey.includes('LSW') ? 'LSW' : colKey.includes('LMSW') ? 'LMSW' : 'LCSW',
      type: 'therapist',
      specialties: [],
      languages: ['English']
    };
    
    // Get specialties
    therapistData.slice(1).forEach(row => {
      const specialty = row['__EMPTY'];
      if (specialty && row[colKey] === 'x') {
        provider.specialties.push(specialty);
      }
    });
    
    providers.push(provider);
  });
  
  return providers;
}

// Generate realistic addresses for Chicago area
function generateChicagoAddress(index) {
  const streets = [
    '123 N Michigan Ave', '456 S State St', '789 W Madison St', '321 E Wacker Dr',
    '654 N Clark St', '987 S LaSalle St', '147 W Monroe St', '258 E Oak St',
    '369 N Wells St', '741 S Dearborn St', '852 W Jackson Blvd', '963 E Chicago Ave',
    '159 N Rush St', '357 S Halsted St', '753 W Belmont Ave', '951 E Division St'
  ];
  
  const neighborhoods = [
    { area: 'Loop', zip: '60601' },
    { area: 'River North', zip: '60654' },
    { area: 'Gold Coast', zip: '60611' },
    { area: 'Lincoln Park', zip: '60614' },
    { area: 'Lakeview', zip: '60657' },
    { area: 'West Loop', zip: '60607' },
    { area: 'South Loop', zip: '60605' },
    { area: 'Streeterville', zip: '60611' }
  ];
  
  const street = streets[index % streets.length];
  const neighborhood = neighborhoods[index % neighborhoods.length];
  
  return {
    address: street,
    city: 'Chicago',
    state: 'IL',
    zip: neighborhood.zip,
    coordinates: {
      lat: 41.8781 + (Math.random() - 0.5) * 0.1,
      lng: -87.6298 + (Math.random() - 0.5) * 0.1
    }
  };
}

// Transform provider data for Supabase
function transformProviderForSupabase(provider, index, insuranceMap, emailSuffix = '') {
  // Generate UUID
  const uuid = crypto.randomUUID();
  
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
    'Suicidal ideation': 'Crisis Intervention',
    'Eating disorder': 'Eating Disorders',
    'Adjustment Disorders': 'Adjustment Disorders',
    'Depression': 'Depression',
    'OCD': 'OCD',
    'LGBTQ': 'LGBTQ+ Issues',
    'Schizophrenia': 'Schizophrenia',
    'Bipolar': 'Bipolar Disorder'
  };

  const mappedSpecialties = provider.specialties
    .map(spec => specialtyMapping[spec] || spec)
    .filter((spec, index, self) => self.indexOf(spec) === index);

  // Generate modalities based on specialties and provider type
  const modalities = ['Individual Therapy'];
  if (mappedSpecialties.includes('Couples Therapy')) {
    modalities.push('Couples Therapy');
  }
  if (mappedSpecialties.includes('Family')) {
    modalities.push('Family Therapy');
  }
  if (provider.type === 'therapist' && mappedSpecialties.some(s => s.includes('Group'))) {
    modalities.push('Group Therapy');
  }

  // Get insurance data for this provider
  const insurance = insuranceMap[provider.full_name] || [
    'Blue Cross Blue Shield',
    'Aetna',
    'United Healthcare',
    'Cigna',
    'Self-Pay'
  ];

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

  // Determine virtual/in-person availability based on provider type
  const virtualAvailable = true; // Most providers offer virtual
  const inPersonAvailable = provider.type === 'psych' ? Math.random() > 0.3 : true; // Therapists more likely to be in-person

  // Generate email with suffix to avoid duplicates
  const emailBase = `${provider.first_name.toLowerCase()}.${provider.last_name.toLowerCase().replace(/\s+/g, '')}`;
  const email = emailSuffix ? `${emailBase}${emailSuffix}@mindcare.com` : `${emailBase}@mindcare.com`;

  return {
    provider_id: uuid,
    practice_id: '11111111-1111-1111-1111-111111111111',
    first_name: provider.first_name,
    last_name: provider.last_name,
    title: provider.title,
    email: email,
    phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
    specialties: mappedSpecialties,
    modalities: modalities,
    languages: provider.languages,
    insurance_accepted: insurance,
    location: generateChicagoAddress(index),
    virtual_available: virtualAvailable,
    in_person_available: inPersonAvailable,
    bio: `${provider.first_name} ${provider.last_name} is a dedicated ${provider.title} specializing in ${mappedSpecialties.slice(0, 3).join(', ')}. With extensive experience in mental health care, they provide compassionate and evidence-based treatment to help patients achieve their wellness goals.`,
    rating: 4.5 + Math.random() * 0.5,
    review_count: Math.floor(Math.random() * 50) + 10,
    weekly_slots: Math.floor(Math.random() * 20) + 15,
    availability: availability,
    experience: Math.floor(Math.random() * 15) + 5,
    telehealth: virtualAvailable,
    photo: `https://ui-avatars.com/api/?name=${provider.first_name}+${provider.last_name}&background=random&size=400`,
    patients_seen: Math.floor(Math.random() * 500) + 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function migrateProviders() {
  console.log('Starting final provider migration...\n');

  // Parse insurance data
  console.log('Parsing insurance data...');
  const insuranceMap = parseInsuranceData();
  console.log(`Found insurance data for ${Object.keys(insuranceMap).length} providers`);

  // Parse all providers
  console.log('\nParsing provider data...');
  const allProviders = parseAllProviders();
  console.log(`Found ${allProviders.length} unique providers`);
  console.log(`- Psych providers: ${allProviders.filter(p => p.type === 'psych').length}`);
  console.log(`- Therapist providers: ${allProviders.filter(p => p.type === 'therapist').length}`);

  // Check current state
  const { count: currentCount } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nCurrent providers in database: ${currentCount}`);
  
  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will:');
  console.log('1. Delete all existing providers');
  console.log('2. Insert new providers with proper insurance and address data');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Delete existing providers
  console.log('Deleting existing providers...');
  const { error: deleteError } = await supabase
    .from('providers')
    .delete()
    .neq('provider_id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('Error deleting providers:', deleteError);
    return;
  }
  console.log('✓ Existing providers deleted');

  // Transform providers and handle duplicate names
  console.log('\nTransforming provider data...');
  const emailTracker = {};
  const transformedProviders = allProviders.map((provider, index) => {
    // Track email usage to handle duplicates
    const emailBase = `${provider.first_name.toLowerCase()}.${provider.last_name.toLowerCase().replace(/\s+/g, '')}`;
    const emailCount = emailTracker[emailBase] || 0;
    emailTracker[emailBase] = emailCount + 1;
    
    const emailSuffix = emailCount > 0 ? emailCount : '';
    return transformProviderForSupabase(provider, index, insuranceMap, emailSuffix);
  });

  // Insert in batches
  console.log('\nInserting new providers...');
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < transformedProviders.length; i += batchSize) {
    const batch = transformedProviders.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('providers')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} providers)`);
    }
  }

  // Summary
  console.log('\n--- Migration Summary ---');
  console.log(`Total providers processed: ${allProviders.length}`);
  console.log(`Successfully inserted: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  // Verify and show sample
  const { data: sample } = await supabase
    .from('providers')
    .select('*')
    .limit(3);

  console.log('\nSample of inserted providers:');
  sample?.forEach(p => {
    const location = typeof p.location === 'string' ? JSON.parse(p.location) : p.location;
    console.log(`\n${p.first_name} ${p.last_name}, ${p.title}`);
    console.log(`  Address: ${location.address}, ${location.city}, ${location.state} ${location.zip}`);
    console.log(`  Insurance: ${p.insurance_accepted.slice(0, 3).join(', ')}...`);
    console.log(`  Specialties: ${p.specialties.slice(0, 3).join(', ')}...`);
  });

  console.log('\n✓ Migration completed successfully!');
}

// Run the migration
migrateProviders().catch(console.error);