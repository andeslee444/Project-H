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

async function executeSQLFile(filename) {
  console.log(`Executing ${filename}...`);
  
  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    
    // Split by semicolons but be careful with strings
    const statements = sqlContent
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 50) + '...');
      
      // Execute via Supabase's rpc if available, or log for manual execution
      console.log('Note: Complex SQL operations like DROP POLICY need to be run in Supabase SQL Editor');
    }
    
    console.log('\n✅ SQL script prepared. Please run these commands in Supabase SQL Editor.');
    console.log('Go to: https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq/editor');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get filename from command line argument
const filename = process.argv[2];
if (!filename) {
  console.error('Please provide a SQL filename as argument');
  process.exit(1);
}

executeSQLFile(filename);