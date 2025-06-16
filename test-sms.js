// Test SMS functionality with the new Twilio number
const SUPABASE_URL = 'https://qjsktpjgfwtgpnmsonrq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g';

async function testSMS(phoneNumber) {
  console.log(`Testing SMS to ${phoneNumber}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        action: 'send_single',
        data: {
          to: phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`,
          message: 'Hi {name}, this is a test from Project H. Your appointment slot is now available! The new Twilio number (425-533-6828) is working correctly.',
          patientName: 'Test Patient'
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\nThe SMS was sent from: +1 (425) 533-6828');
    } else {
      console.error('❌ Failed to send SMS:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  }
}

// Usage instructions
console.log('SMS Test Script for Project H');
console.log('=============================');
console.log('To test SMS, run: node test-sms.js <phone-number>');
console.log('Example: node test-sms.js 4255551234');
console.log('\nNote: Phone number can be with or without +1 prefix');

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (phoneNumber) {
  testSMS(phoneNumber).then(() => {
    console.log('\nTest complete!');
  });
} else {
  console.log('\n⚠️  Please provide a phone number as an argument');
}