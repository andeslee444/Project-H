# Twilio SMS Integration Setup Guide

## Current Implementation Status

### ✅ What's Built:
1. **Frontend UI** - Complete patient selection and notification modal
2. **Service Layer** - `twilioService.ts` handles SMS logic
3. **Development Mode** - Simulates SMS sending in dev environment
4. **Supabase Edge Function** - Ready to deploy for production

### 🚧 What Needs Setup:
1. Twilio account configuration
2. Supabase Edge Function deployment
3. Environment variables
4. Database tables for SMS queue

## Architecture Overview

```
Frontend (React) 
    ↓
twilioService.ts
    ↓
Supabase Edge Function  ← Stores credentials securely
    ↓
Twilio API
```

## Step-by-Step Setup

### 1. Set Up Twilio Account

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your credentials:
   - Account SID: `ACxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxx`
   - Phone Number: `+1234567890`

⚠️ **IMPORTANT**: Never put these credentials in frontend code!

### 2. Deploy Supabase Edge Function

```bash
# From project root
cd Project-H

# Deploy the SMS function
supabase functions deploy send-sms

# Set the secrets (environment variables)
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Create Database Tables

Run the migration to create SMS queue tables:

```bash
# Apply the migration
supabase db push
```

Or manually run the SQL in `/supabase/migrations/20240115_create_sms_queue.sql`

### 4. Environment Variables

Add to your `.env.local` file:

```env
# These are already in your .env file
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# Optional: For development testing
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

### 5. Test the Integration

1. **Development Mode** (default):
   - SMS are simulated, no actual sending
   - Check browser console for logs

2. **Production Mode**:
   - Remove the `isDevelopment` check in `twilioService.ts`
   - Or set `import.meta.env.PROD = true`

## How It Works

### Blast Notifications
- All patients receive SMS immediately
- Progress tracked in real-time
- UI shows completion status

### Waterfall Notifications
- Sends one SMS every 5 minutes
- First message sent immediately
- Queue stored in Supabase database
- Can be monitored/stopped

## Security Notes

1. **Credentials are stored in Supabase Edge Function** - Never exposed to frontend
2. **Rate limiting** should be added to prevent abuse
3. **Phone number validation** should be implemented
4. **HIPAA compliance** - Ensure SMS content doesn't contain PHI without proper consent

## Troubleshooting

### Common Issues:

1. **"Failed to send SMS" error**
   - Check Supabase Edge Function logs
   - Verify Twilio credentials are set correctly
   - Ensure phone numbers are in E.164 format (+1234567890)

2. **Edge Function not found**
   - Deploy using `supabase functions deploy send-sms`
   - Check function URL matches your Supabase project

3. **Waterfall not working**
   - Verify `sms_queue` table exists
   - Check Supabase cron jobs for processing queue
   - Monitor `sms_logs` table for errors

## Alternative: Direct Backend Integration

If you prefer using your own backend instead of Supabase:

1. See `/src/api/twilioEndpoint.example.ts` for Express.js example
2. Update `twilioService.ts` to call your backend endpoint
3. Handle authentication and rate limiting in your backend

## Cost Considerations

- Twilio charges ~$0.0075 per SMS in the US
- Waterfall method spreads cost over time
- Consider implementing daily/monthly limits
- Monitor usage in Twilio dashboard

## Next Steps

1. **For Testing**: Current implementation works in dev mode
2. **For Production**: 
   - Set up Twilio account
   - Deploy Supabase Edge Function
   - Update environment variables
   - Test with real phone numbers

The frontend is fully ready - you just need to connect the backend pieces!