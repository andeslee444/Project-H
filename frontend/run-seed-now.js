import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log(`
=================================================================
IMPORTANT: This script will seed your database with test data.

If this fails due to RLS policies, you need to:
1. Go to: https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq/auth/policies
2. DISABLE Row Level Security on these tables:
   - practices
   - providers  
   - patients
   - waitlists
   - waitlist_entries
   
OR run the SQL commands in your Supabase SQL Editor first.
=================================================================
`);

async function runSeed() {
  console.log('Starting seed process...\n');

  try {
    // Step 1: Create practice
    console.log('1. Creating practice...');
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .upsert({
        practice_id: '11111111-1111-1111-1111-111111111111',
        name: 'Serenity Mental Health Center',
        address: {
          street: '123 Wellness Way',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        },
        phone: '(415) 555-0100',
        email: 'info@serenitymhc.com'
      })
      .select()
      .single();

    if (practiceError) {
      console.error('❌ Practice error:', practiceError.message);
      if (practiceError.message.includes('policies')) {
        console.log('\n⚠️  RLS policies are blocking the operation. Please disable RLS on the tables first.');
        return;
      }
    } else {
      console.log('✅ Practice created/updated');
    }

    // Step 2: Create providers
    console.log('\n2. Creating providers...');
    const providers = [
      { first_name: 'Sarah', last_name: 'Chen', email: 'sarah.chen@serenitymhc.com' },
      { first_name: 'Michael', last_name: 'Rodriguez', email: 'michael.rodriguez@serenitymhc.com' },
      { first_name: 'Emily', last_name: 'Johnson', email: 'emily.johnson@serenitymhc.com' },
      { first_name: 'David', last_name: 'Williams', email: 'david.williams@serenitymhc.com' },
      { first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.anderson@serenitymhc.com' }
    ];

    for (const provider of providers) {
      const { error } = await supabase
        .from('providers')
        .upsert({
          ...provider,
          practice_id: '11111111-1111-1111-1111-111111111111'
        });
      
      if (error) {
        console.error(`❌ Provider ${provider.first_name} ${provider.last_name}:`, error.message);
      } else {
        console.log(`✅ Provider created: ${provider.first_name} ${provider.last_name}`);
      }
    }

    // Step 3: Create patients
    console.log('\n3. Creating patients...');
    const patients = [
      { first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com', phone: '(415) 555-0101', date_of_birth: '1985-03-15' },
      { first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@email.com', phone: '(415) 555-0102', date_of_birth: '1990-07-22' },
      { first_name: 'Michael', last_name: 'Brown', email: 'michael.brown@email.com', phone: '(415) 555-0103', date_of_birth: '1978-11-08' },
      { first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@email.com', phone: '(415) 555-0104', date_of_birth: '1995-02-28' },
      { first_name: 'David', last_name: 'Martinez', email: 'david.martinez@email.com', phone: '(415) 555-0105', date_of_birth: '1982-09-12' },
      { first_name: 'Jessica', last_name: 'Anderson', email: 'jessica.anderson@email.com', phone: '(415) 555-0106', date_of_birth: '1988-05-20' },
      { first_name: 'Christopher', last_name: 'Taylor', email: 'chris.taylor@email.com', phone: '(415) 555-0107', date_of_birth: '1992-10-30' },
      { first_name: 'Amanda', last_name: 'Thomas', email: 'amanda.thomas@email.com', phone: '(415) 555-0108', date_of_birth: '1986-12-15' }
    ];

    const createdPatients = [];
    for (const patient of patients) {
      const { data, error } = await supabase
        .from('patients')
        .upsert(patient)
        .select();
      
      if (error) {
        console.error(`❌ Patient ${patient.first_name} ${patient.last_name}:`, error.message);
      } else {
        console.log(`✅ Patient created: ${patient.first_name} ${patient.last_name}`);
        if (data && data[0]) createdPatients.push(data[0]);
      }
    }

    // Step 4: Create waitlist
    console.log('\n4. Creating waitlist...');
    const { data: waitlist, error: waitlistError } = await supabase
      .from('waitlists')
      .upsert({
        practice_id: '11111111-1111-1111-1111-111111111111',
        name: 'General Waitlist',
        description: 'Main waitlist for new patient appointments'
      })
      .select()
      .single();

    if (waitlistError) {
      console.error('❌ Waitlist error:', waitlistError.message);
    } else {
      console.log('✅ Waitlist created/updated');
    }

    // Step 5: Add patients to waitlist
    if (waitlist && createdPatients.length > 0) {
      console.log('\n5. Adding patients to waitlist...');
      
      for (let i = 0; i < createdPatients.length; i++) {
        const patient = createdPatients[i];
        const { error } = await supabase
          .from('waitlist_entries')
          .upsert({
            waitlist_id: waitlist.waitlist_id,
            patient_id: patient.patient_id,
            status: 'waiting',
            priority_score: 70 + Math.floor(Math.random() * 30),
            notes: i === 0 ? 'Urgent - experiencing increased anxiety' : 
                   i === 3 ? 'Prefers morning appointments' : 
                   'New patient consultation'
          });
        
        if (error) {
          console.error(`❌ Waitlist entry for ${patient.first_name}:`, error.message);
        } else {
          console.log(`✅ Added ${patient.first_name} ${patient.last_name} to waitlist`);
        }
      }
    }

    // Verify the data
    console.log('\n6. Verifying data...');
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    const { count: providerCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });
    
    const { count: waitlistCount } = await supabase
      .from('waitlist_entries')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   Patients: ${patientCount || 0}`);
    console.log(`   Providers: ${providerCount || 0}`);
    console.log(`   Waitlist entries: ${waitlistCount || 0}`);

    if (waitlistCount > 0) {
      console.log('\n🎉 SUCCESS! Your database has been seeded.');
      console.log('🌐 Go to http://localhost:3000/waitlist to see the data in your app!');
    } else {
      console.log('\n⚠️  No waitlist entries were created. Please check the errors above.');
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the seed
runSeed();