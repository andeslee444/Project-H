import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '..', '..', 'Real_data', 'Provider Specialties - Copy.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Excel file sheets:');
console.log('==================');
workbook.SheetNames.forEach((sheet, index) => {
  console.log(`${index + 1}. ${sheet}`);
});

// Check each sheet's structure
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n\nSheet: ${sheetName}`);
  console.log('='.repeat(50));
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  if (data.length > 0) {
    console.log(`Rows: ${data.length}`);
    console.log('Columns:', Object.keys(data[0]).slice(0, 10));
    console.log('\nFirst few rows:');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, JSON.stringify(row).slice(0, 200) + '...');
    });
  } else {
    console.log('No data in this sheet');
  }
});