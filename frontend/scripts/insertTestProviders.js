import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read the formatted provider data
const providersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../Real_data/providers_formatted.json'), 'utf8')
);

async function insertTestProviders() {
  console.log('Inserting test providers from Excel data...\n');

  // Select first 3 providers to test
  const testProviders = providersData.slice(0, 3).map(provider => {
    // Generate availability based on days
    const availability = {};
    const dayMapping = {
      'M': 'monday',
      'Tu': 'tuesday',
      'W': 'wednesday',
      'Th': 'thursday',
      'F': 'friday'
    };
    
    // Default schedule if accepting patients
    if (provider.accepting_new_patients) {
      availability.monday = { start: "9:00", end: "17:00" };
      availability.wednesday = { start: "9:00", end: "17:00" };
      availability.friday = { start: "9:00", end: "17:00" };
    }

    // Generate UUID for provider
    const uuid = crypto.randomUUID();

    return {
      provider_id: uuid,
      practice_id: '11111111-1111-1111-1111-111111111111',
      first_name: provider.first_name,
      last_name: provider.last_name,
      title: provider.title === 'MD' ? 'Psychiatrist, MD' : 
             provider.title === 'LSW' ? 'Licensed Social Worker, LSW' : 
             'Advanced Practice Nurse, APN',
      email: provider.email,
      phone: provider.phone || '(555) 000-0000',
      specialties: provider.specialties,
      modalities: ['Cognitive Behavioral Therapy (CBT)', 'Psychotherapy'],
      languages: provider.languages,
      insurance_accepted: provider.insurance_accepted,
      location: provider.location,
      virtual_available: true,
      in_person_available: true,
      bio: provider.bio,
      rating: provider.rating,
      review_count: provider.review_count,
      weekly_slots: provider.weekly_slots,
      availability: availability,
      experience: Math.floor(Math.random() * 15) + 5,
      telehealth: true,
      photo: `https://ui-avatars.com/api/?name=${provider.first_name}+${provider.last_name}&background=random&size=400`,
      patients_seen: Math.floor(Math.random() * 500) + 100
    };
  });

  console.log('Inserting providers:', testProviders.map(p => `${p.first_name} ${p.last_name}`).join(', '));

  for (const provider of testProviders) {
    const { data, error } = await supabase
      .from('providers')
      .insert(provider)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting ${provider.first_name} ${provider.last_name}:`, error.message);
    } else {
      console.log(`✓ Successfully inserted ${provider.first_name} ${provider.last_name}`);
    }
  }

  // Verify insertion
  console.log('\nVerifying insertion...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('providers')
    .select('first_name, last_name, title, specialties')
    .or('first_name.eq.Greg,first_name.eq.Jazmin,first_name.eq.Kenisha')
    .order('created_at', { ascending: false });

  if (!verifyError && verifyData) {
    console.log(`\nFound ${verifyData.length} test providers:`);
    verifyData.forEach(p => {
      console.log(`- ${p.first_name} ${p.last_name} (${p.title})`);
      console.log(`  Specialties: ${p.specialties.join(', ')}`);
    });
  }
}

insertTestProviders();