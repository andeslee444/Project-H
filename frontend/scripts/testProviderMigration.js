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

async function testProviderData() {
  console.log('Testing provider data migration...\n');

  // First, check current providers
  const { data: currentProviders, error: fetchError } = await supabase
    .from('providers')
    .select('provider_id, first_name, last_name, title')
    .order('created_at', { ascending: false })
    .limit(5);

  if (fetchError) {
    console.error('Error fetching providers:', fetchError);
    return;
  }

  console.log('Current providers (last 5):');
  currentProviders.forEach(p => {
    console.log(`- ${p.first_name} ${p.last_name} (${p.title})`);
  });

  // Test one provider from our migration
  console.log('\n\nTesting provider search for "Greg Yip"...');
  const { data: searchResult, error: searchError } = await supabase
    .from('providers')
    .select('*')
    .eq('first_name', 'Greg')
    .eq('last_name', 'Yip')
    .single();

  if (searchError) {
    console.log('Provider not found. Would need to run migration.');
  } else {
    console.log('Found provider:', {
      name: `${searchResult.first_name} ${searchResult.last_name}`,
      title: searchResult.title,
      specialties: searchResult.specialties,
      languages: searchResult.languages
    });
  }

  // Test specialty search
  console.log('\n\nTesting providers with ADHD specialty...');
  const { data: adhdProviders, error: adhdError } = await supabase
    .from('providers')
    .select('first_name, last_name, specialties')
    .contains('specialties', ['ADHD'])
    .limit(5);

  if (!adhdError && adhdProviders) {
    console.log(`Found ${adhdProviders.length} providers with ADHD specialty`);
    adhdProviders.forEach(p => {
      console.log(`- ${p.first_name} ${p.last_name}`);
    });
  }
}

testProviderData();