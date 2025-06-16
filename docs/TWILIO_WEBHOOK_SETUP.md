# Twilio Webhook Setup for Two-Way SMS

This guide will help you configure your Twilio phone number (425-533-6828) to receive SMS messages.

## ✅ What's Already Done

1. **Edge Function Created**: The `receive-sms` function is deployed and ready
2. **Database Tables**: Created `sms_messages` table to store all SMS conversations
3. **Patient Matching**: Incoming messages are automatically matched to patients by phone number
4. **Opt-out Handling**: Automatically processes STOP, UNSUBSCRIBE, and CANCEL messages
5. **Notifications**: Creates notifications for staff when patients send messages

## 🔧 Twilio Configuration Steps

### 1. Log into Twilio Console
Go to: https://console.twilio.com/

### 2. Navigate to Phone Numbers
1. Click **Phone Numbers** → **Manage** → **Active Numbers**
2. Find your number: **(425) 533-6828**
3. Click on the number to configure it

### 3. Configure the Webhook

In the **Messaging Configuration** section:

1. **When a message comes in**:
   - Webhook: `https://qjsktpjgfwtgpnmsonrq.supabase.co/functions/v1/receive-sms`
   - HTTP Method: **POST**

2. **Primary Handler Fails** (optional):
   - You can set a fallback URL if desired

3. Click **Save Configuration**

## 📱 How It Works

When a patient replies to an SMS:

1. **Twilio receives the message** at 425-533-6828
2. **Twilio sends a POST request** to your Edge Function with the message data
3. **The Edge Function**:
   - Stores the message in the database
   - Matches the phone number to a patient
   - Processes special keywords (STOP, YES, etc.)
   - Creates a notification for staff
4. **Returns TwiML response** to acknowledge receipt

## 🔍 Message Processing Features

### Automatic Keyword Detection

- **Opt-out**: STOP, UNSUBSCRIBE, CANCEL
  - Sets `sms_opt_in = false` for the patient
  - Records opt-out timestamp

- **Confirmations**: YES, CONFIRM, 1
  - Can be used to confirm appointments
  - Looks for recent appointment notifications

### Patient Matching

The system tries multiple phone number formats to match patients:
- (425) 533-6828
- 425-533-6828
- +14255336828
- 14255336828
- 4255336828

## 📊 Viewing Messages

### In the Database

Messages are stored in the `sms_messages` table with:
- `direction`: 'inbound' or 'outbound'
- `patient_id`: Linked to the patient (if matched)
- `metadata`: Additional Twilio data (city, state, etc.)

### Query Examples

```sql
-- View all incoming messages
SELECT * FROM sms_messages 
WHERE direction = 'inbound' 
ORDER BY created_at DESC;

-- View messages from a specific patient
SELECT * FROM sms_messages 
WHERE patient_id = 'PATIENT_ID_HERE' 
ORDER BY created_at DESC;

-- View unmatched messages (unknown numbers)
SELECT * FROM sms_messages 
WHERE direction = 'inbound' 
AND patient_id IS NULL 
ORDER BY created_at DESC;
```

## 🧪 Testing

### Send a Test Message

1. From any phone, send a text to **425-533-6828**
2. Check the Supabase logs:
   ```bash
   supabase functions logs receive-sms
   ```
3. Check the database:
   ```sql
   SELECT * FROM sms_messages ORDER BY created_at DESC LIMIT 5;
   ```

### Test with cURL

```bash
# Simulate a Twilio webhook
curl -X POST https://qjsktpjgfwtgpnmsonrq.supabase.co/functions/v1/receive-sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=TEST123&AccountSid=TEST&From=%2B14255551234&To=%2B14255336828&Body=Test+message"
```

## 🚀 Next Steps

### 1. Build a UI for viewing messages
Create a messages dashboard showing:
- Conversation threads by patient
- Unread message indicators
- Quick reply functionality

### 2. Add auto-responses
Modify the Edge Function to send automatic responses:
- Appointment confirmations
- Office hours messages
- FAQ responses

### 3. Implement message routing
Route messages to specific providers or departments based on:
- Patient's assigned provider
- Message content/keywords
- Time of day

## 🔒 Security Considerations

- The Edge Function uses the service role key to write to the database
- Patient data is automatically linked based on phone number
- All messages are logged for HIPAA compliance
- Consider adding Twilio signature validation for extra security

## 📝 Troubleshooting

### Messages not being received?

1. **Check Twilio webhook URL** is exactly:
   ```
   https://qjsktpjgfwtgpnmsonrq.supabase.co/functions/v1/receive-sms
   ```

2. **Check Edge Function logs**:
   ```bash
   supabase functions logs receive-sms --tail
   ```

3. **Verify in Twilio Console**:
   - Go to Monitor → Logs → Messaging
   - Check for webhook errors

4. **Test the Edge Function directly**:
   ```bash
   curl -X POST https://qjsktpjgfwtgpnmsonrq.supabase.co/functions/v1/receive-sms \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "MessageSid=TEST&From=%2B14255551234&To=%2B14255336828&Body=Test"
   ```

### Common Issues

- **401 Unauthorized**: The Edge Function is public, no auth needed
- **500 Error**: Check if database tables exist
- **No patient match**: Phone number format might not match what's in the database