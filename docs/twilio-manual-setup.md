# Twilio Manual Setup Guide

## Your Credentials
- **Account SID**: `AC[YOUR_ACCOUNT_SID]`
- **API Key Secret**: `[YOUR_API_KEY_SECRET]`
- **Phone Number**: `+1[YOUR_PHONE_NUMBER]`

## Setting Up in Supabase Dashboard

### Option 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project: 
   https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq/settings/vault

2. Click "New secret" and add these three secrets:
   - **Name**: `TWILIO_ACCOUNT_SID`
     **Value**: `[YOUR_ACCOUNT_SID]`
   
   - **Name**: `TWILIO_AUTH_TOKEN`
     **Value**: `[YOUR_AUTH_TOKEN]`
   
   - **Name**: `TWILIO_PHONE_NUMBER`
     **Value**: `[YOUR_PHONE_NUMBER]`

3. Save each secret

### Option 2: Via Supabase CLI

```bash
# First, link your project
cd /Users/andeslee/Documents/Cursor-Projects/Project-H
npx supabase link --project-ref qjsktpjgfwtgpnmsonrq

# Then set the secrets
npx supabase secrets set TWILIO_ACCOUNT_SID=[YOUR_ACCOUNT_SID]
npx supabase secrets set TWILIO_AUTH_TOKEN=[YOUR_AUTH_TOKEN]
npx supabase secrets set TWILIO_PHONE_NUMBER=[YOUR_PHONE_NUMBER]
```

## Testing Your Setup

### 1. Quick Test Mode (Recommended First)
Keep mock mode on while testing the UI:
```env
VITE_USE_MOCK_SMS=true
```

### 2. Real SMS Test
When ready to test real SMS:

1. Create/update `.env.local`:
```env
VITE_USE_MOCK_SMS=false
```

2. Run the app:
```bash
npm run dev
```

3. Test with ONE patient first:
   - Select a single patient
   - Use your own phone number for testing
   - Send a test message

## Important Notes

### About Toll-Free Numbers
- Toll-free numbers start with 8XX
- Great for business messaging
- Higher deliverability rates
- Professional appearance

### SMS Best Practices
1. **Test First**: Always test with your own number
2. **Message Content**: Keep messages under 160 characters
3. **Personalization**: Use {name} to personalize
4. **Compliance**: Include opt-out instructions for production

### Sample Messages
```
Hi {name}, an appointment slot just opened up with Dr. Smith tomorrow at 2pm. Reply YES to confirm or call [YOUR_NUMBER].

Hi {name}, you're next in line for an appointment. Visit [link] to book or call [YOUR_NUMBER].
```

## Troubleshooting

### "Twilio credentials not configured" Error
- Make sure you've added all 3 secrets in Supabase
- Secrets may take 1-2 minutes to propagate

### "Failed to send SMS" Error
- Check phone number format (+1 prefix required)
- Verify Twilio account is active and has credits
- Check Supabase Edge Function logs

### View Edge Function Logs
1. Go to: https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq/functions/send-sms/logs
2. Check for any error messages

## Cost Monitoring
- US SMS: ~$0.0079 per message
- Toll-free SMS: ~$0.0075 per message
- Monitor usage at: https://console.twilio.com

## Ready to Go! 🚀
Once you've added the secrets to Supabase, your SMS system is fully operational!