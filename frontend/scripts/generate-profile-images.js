import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNDI2ODIsImV4cCI6MjA0ODkxODY4Mn0.1iQJdxU0qkNdCep9EOQNA5s3jlqVVHRRBVJiAJXfGjo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Professional placeholder image services
const providerImageUrls = {
  // Female providers
  'Sarah Chen': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&q=80', // Asian female doctor
  'Emily Williams': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80', // Female doctor with stethoscope
  'Emily Johnson': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80', // Female medical professional
  'Lisa Martinez': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&q=80', // Hispanic female healthcare
  'Maria Garcia': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&q=80', // Female therapist
  'Jennifer Davis': 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&q=80', // Professional female
  
  // Male providers
  'Michael Rodriguez': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80', // Hispanic male doctor
  'David Thompson': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&q=80', // Male healthcare professional
  'James Wilson': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&q=80', // Male doctor with coat
  'Robert Johnson': 'https://images.unsplash.com/photo-1637059824899-a441006a6875?w=400&h=400&fit=crop&q=80', // Male psychologist
  'Christopher Brown': 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&h=400&fit=crop&q=80' // Male counselor
};

// Patient placeholder images (diverse mix)
const patientImageUrls = [
  // Young adults
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&q=80',
  
  // Middle-aged
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80',
  
  // Seniors
  'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=400&h=400&fit=crop&q=80'
];

async function updateProviderPhotos() {
  try {
    console.log('Fetching providers...');
    const { data: providers, error } = await supabase
      .from('providers')
      .select('provider_id, first_name, last_name');
    
    if (error) throw error;
    
    console.log(`Found ${providers.length} providers`);
    
    for (const provider of providers) {
      const fullName = `${provider.first_name} ${provider.last_name}`;
      const photoUrl = providerImageUrls[fullName] || providerImageUrls['David Thompson']; // fallback
      
      const { error: updateError } = await supabase
        .from('providers')
        .update({ photo: photoUrl })
        .eq('provider_id', provider.provider_id);
      
      if (updateError) {
        console.error(`Error updating ${fullName}:`, updateError);
      } else {
        console.log(`✓ Updated photo for ${fullName}`);
      }
    }
  } catch (error) {
    console.error('Error updating provider photos:', error);
  }
}

async function updatePatientPhotos() {
  try {
    console.log('\nFetching patients...');
    const { data: patients, error } = await supabase
      .from('patients')
      .select('patient_id, first_name, last_name');
    
    if (error) throw error;
    
    console.log(`Found ${patients.length} patients`);
    
    // First add the photo column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo TEXT;'
    });
    
    if (alterError && !alterError.message.includes('already exists')) {
      console.error('Error adding photo column:', alterError);
    }
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const photoUrl = patientImageUrls[i % patientImageUrls.length];
      
      const { error: updateError } = await supabase
        .from('patients')
        .update({ photo: photoUrl })
        .eq('patient_id', patient.patient_id);
      
      if (updateError) {
        console.error(`Error updating ${patient.first_name} ${patient.last_name}:`, updateError);
      } else {
        console.log(`✓ Updated photo for ${patient.first_name} ${patient.last_name}`);
      }
    }
  } catch (error) {
    console.error('Error updating patient photos:', error);
  }
}

// Run both updates
async function main() {
  console.log('Starting profile image updates...\n');
  await updateProviderPhotos();
  await updatePatientPhotos();
  console.log('\nProfile image updates complete!');
}

main().catch(console.error);