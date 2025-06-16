# Deploy SMS Edge Function to Supabase

## Prerequisites
1. Access to Supabase Dashboard
2. Twilio Account with:
   - Account SID
   - Auth Token
   - Phone Number (for sending SMS)

## Steps to Deploy

### 1. Deploy Edge Function via Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq
2. Navigate to **Functions** (in the sidebar)
3. Click **Create a new function**
4. Name: `send-sms`
5. Copy the entire content from `/supabase/functions/send-sms/index.ts`
6. Click **Deploy**

### 2. Configure Environment Variables

In the Supabase Dashboard:
1. Go to **Settings** → **Edge Functions**
2. Add these secrets:
   - `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1XXXXXXXXXX)

### 3. Test the Function

1. In the Project-H app, go to the Waitlist page
2. Select a patient (make sure their phone number is 833-820-5947)
3. Click "Notify Selected"
4. Choose either "Waterfall" or "Blast" mode
5. Customize the message if needed
6. Click "Send"

The SMS should be sent to 833-820-5947.

## Alternative: Deploy via CLI

If you have Docker Desktop installed:

```bash
# Start Docker Desktop first

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qjsktpjgfwtgpnmsonrq

# Deploy the function
supabase functions deploy send-sms

# Set secrets
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Troubleshooting

If SMS is not sending:
1. Check the browser console for errors
2. Check Supabase Function logs in the dashboard
3. Verify Twilio credentials are correct
4. Ensure the phone number format is correct (+1XXXXXXXXXX)