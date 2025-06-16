import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, '../../Real_data/Provider Specialties - Copy.xlsx');
const workbook = XLSX.readFile(filePath);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
console.log('\nColumns:', Object.keys(data[0] || {}));
console.log('\nFirst 5 rows:');
console.log(JSON.stringify(data.slice(0, 5), null, 2));

// Analyze the data structure
console.log('\n=== Data Analysis ===');
if (data.length > 0) {
  const columns = Object.keys(data[0]);
  columns.forEach(col => {
    const values = data.map(row => row[col]);
    const uniqueValues = [...new Set(values)];
    console.log(`\n${col}:`);
    console.log(`  - Total values: ${values.length}`);
    console.log(`  - Unique values: ${uniqueValues.length}`);
    if (uniqueValues.length <= 10) {
      console.log(`  - Values: ${uniqueValues.join(', ')}`);
    } else {
      console.log(`  - Sample values: ${uniqueValues.slice(0, 5).join(', ')}...`);
    }
  });
}

// Save as JSON for easier processing
const outputPath = path.join(__dirname, '../../Real_data/providers_data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`\nData saved to: ${outputPath}`);