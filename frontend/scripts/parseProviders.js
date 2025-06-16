import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../Real_data/providers_data.json'), 'utf8'));

// The first row contains provider names
const headerRow = rawData[0];

// Extract provider information from column headers
const providers = [];
const columnMapping = {};

// Process each column header to identify providers
Object.entries(headerRow).forEach(([colKey, providerName]) => {
  if (colKey === '__EMPTY') return; // Skip the first column (specialties column)
  
  if (providerName && providerName !== '-' && typeof providerName === 'string' && !providerName.includes('x')) {
    const provider = {
      name: providerName.trim(),
      columnKey: colKey,
      specialties: [],
      languages: [],
      ethnicity: null,
      location: null,
      phone: null,
      licenseNumber: null,
      npiNumber: null,
      acceptingNewPatients: !colKey.includes('NOT ACCEPTING NEW PATIENTS'),
      availability: [],
      notes: []
    };
    
    providers.push(provider);
    columnMapping[colKey] = providers.length - 1;
  }
});

console.log(`Found ${providers.length} providers`);

// Process each row (specialty or other information)
rawData.slice(1).forEach((row, rowIndex) => {
  const rowType = row['__EMPTY'];
  
  if (!rowType) return;
  
  // Check if this is a specialty row
  const specialties = [
    'Adjustment Disorders', 'ADD/ADHD', 'Anxiety/Panic', 'Anger Mgmt', 'Autism Assessment',
    'Bipolar', 'Counseling', 'Depression', 'Developmental Delays', 'Domestic Violence',
    'Eating Disorders', 'Family Therapy', 'Grief Counseling', 'Individual Therapy',
    'Marriage Counseling', 'OCD', 'ODD', 'Psychosis', 'Schizophrenia', 'Self-Harm',
    'Sexual Abuse', 'Sleep Issues', 'Substance Abuse', 'Suicide ideation', 'Trauma/PTSD'
  ];
  
  if (specialties.includes(rowType)) {
    // This is a specialty row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined) {
        if (value === 'x') {
          providers[columnMapping[colKey]].specialties.push(rowType);
        }
      }
    });
  } else if (rowType === 'Languages') {
    // Language row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].languages.push(value);
      }
    });
  } else if (rowType === 'Ethnicity') {
    // Ethnicity row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].ethnicity = value;
      }
    });
  } else if (rowType === 'Location') {
    // Location row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].location = value;
      }
    });
  } else if (rowType === 'Phone Number') {
    // Phone row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].phone = value;
      }
    });
  } else if (rowType === 'License #') {
    // License row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].licenseNumber = value;
      }
    });
  } else if (rowType === 'NPI Number') {
    // NPI row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].npiNumber = value;
      }
    });
  } else if (rowType === 'Days Available') {
    // Days Available row
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x') {
        providers[columnMapping[colKey]].availability.push(value);
      }
    });
  } else {
    // Other rows might contain additional notes
    Object.entries(row).forEach(([colKey, value]) => {
      if (colKey !== '__EMPTY' && columnMapping[colKey] !== undefined && value && value !== 'x' && value !== '') {
        if (typeof value === 'string' && value.length > 5 && !value.match(/^\d+$/)) {
          providers[columnMapping[colKey]].notes.push(`${rowType}: ${value}`);
        }
      }
    });
  }
});

// Clean up and format provider data
const formattedProviders = providers.map((provider, index) => {
  // Split name into first and last
  const nameParts = provider.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || nameParts[0];
  
  // Determine title based on column header
  let title = 'APN'; // Default
  if (provider.columnKey === 'MD') {
    title = 'MD';
  } else if (provider.columnKey === 'LSW') {
    title = 'LSW';
  }
  
  return {
    provider_id: `provider_${index + 1}`,
    first_name: firstName,
    last_name: lastName,
    title: title,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@mindcare.com`,
    phone: provider.phone || '(555) 000-0000',
    specialties: provider.specialties,
    languages: provider.languages.length > 0 ? provider.languages : ['English'],
    ethnicity: provider.ethnicity,
    license_number: provider.licenseNumber,
    npi_number: provider.npiNumber,
    location: provider.location || 'New Jersey',
    accepting_new_patients: provider.acceptingNewPatients,
    availability_days: provider.availability,
    insurance_accepted: ['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna', 'Medicare', 'Medicaid'],
    virtual_available: true,
    in_person_available: true,
    bio: `${title} specializing in ${provider.specialties.slice(0, 3).join(', ')}${provider.specialties.length > 3 ? ' and more' : ''}.`,
    rating: 4.5 + Math.random() * 0.5,
    review_count: Math.floor(Math.random() * 100) + 20,
    waitlist_count: Math.floor(Math.random() * 10),
    weekly_slots: provider.acceptingNewPatients ? Math.floor(Math.random() * 20) + 5 : 0,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    notes: provider.notes.join('; ')
  };
});

// Save the formatted data
const outputPath = path.join(__dirname, '../../Real_data/providers_formatted.json');
fs.writeFileSync(outputPath, JSON.stringify(formattedProviders, null, 2));

console.log(`\nFormatted ${formattedProviders.length} providers`);
console.log(`Data saved to: ${outputPath}`);

// Display sample provider
console.log('\nSample provider:');
console.log(JSON.stringify(formattedProviders[0], null, 2));