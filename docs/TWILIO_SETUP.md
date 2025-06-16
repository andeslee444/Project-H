# Twilio SMS Setup for Project H

## Current Configuration

Your Twilio integration is configured to use the phone number: **+1 (425) 533-6828**

## What Has Been Updated

1. **Frontend Environment Variables** ✅
   - Updated `/frontend/.env.local`
   - Changed `VITE_TWILIO_PHONE_NUMBER` from `+18338205947` to `+14255336828`

2. **Frontend Code** ✅
   - Updated hardcoded references in `TestTwilioButton.tsx`
   - Changed display from "(833) 820-5947" to "(425) 533-6828"

## What Still Needs to Be Done

### 1. Update Supabase Edge Function Environment Variables

The SMS functionality uses a Supabase Edge Function that needs the Twilio credentials. You need to:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qjsktpjgfwtgpnmsonrq
2. Navigate to **Settings** → **Edge Functions**
3. Update these environment variables:
   - `TWILIO_PHONE_NUMBER` = `+14255336828`
   - `TWILIO_ACCOUNT_SID` = (your Twilio Account SID)
   - `TWILIO_AUTH_TOKEN` = (your Twilio Auth Token)

### 2. Deploy the Edge Function (if needed)

If the Edge Function hasn't been deployed yet:

```bash
cd /Users/andeslee/Documents/Cursor-Projects/Project-H
npx supabase functions deploy send-sms
```

## Testing SMS Functionality

### Option 1: Use the Test Component
1. Navigate to any page that includes the `TestTwilioButton` component
2. Enter a phone number
3. Click "Send Test SMS"

### Option 2: Test from Waitlist Page
1. Go to the Waitlist page
2. Select patients
3. Click "Notify Selected"
4. Compose your message
5. Send the notification

## Troubleshooting

### SMS Not Sending?

1. **Check Mock Mode**: 
   - Look for "Mock Mode Active" warning
   - Ensure `VITE_USE_MOCK_SMS=false` in `.env.local`

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Functions → Logs
   - Look for errors in the `send-sms` function

3. **Verify Twilio Credentials**:
   - Ensure all environment variables are set in Supabase
   - Verify phone number format includes country code: `+14255336828`

4. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any error messages when sending SMS

## Two-Way SMS (Receiving Messages)

To receive messages at 425-533-6828, you'll need to:

1. **Configure Twilio Webhook**:
   - Log into Twilio Console
   - Find your phone number (425-533-6828)
   - Set the webhook URL to your Supabase Edge Function:
     ```
     https://qjsktpjgfwtgpnmsonrq.supabase.co/functions/v1/receive-sms
     ```

2. **Create a Receive SMS Function** (if not already created):
   - This would handle incoming messages
   - Store them in your database
   - Potentially trigger notifications

## Security Notes

- Never commit Twilio credentials to git
- Always use environment variables for sensitive data
- The Edge Function handles the actual SMS sending to keep credentials secure
- Frontend only sends the message content and recipient info