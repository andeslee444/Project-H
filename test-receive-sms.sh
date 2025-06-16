#!/bin/bash

# Test script to simulate receiving an SMS (like Twilio would send)

EDGE_FUNCTION_URL="https://qjsktpjgfwtgpnmsonrq.supabase.co/functions/v1/receive-sms"

# Test data - simulating a message from a patient
PHONE_FROM="+14255336828"  # This could be any patient's phone
PHONE_TO="+14255336828"    # Your Twilio number
MESSAGE_BODY="Hi, I need to reschedule my appointment tomorrow. Is Thursday available?"

# Send test webhook request
echo "Sending test SMS webhook..."
echo "From: $PHONE_FROM"
echo "Message: $MESSAGE_BODY"
echo ""

curl -X POST "$EDGE_FUNCTION_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=TEST_$(date +%s)" \
  -d "AccountSid=TEST_ACCOUNT" \
  -d "From=$PHONE_FROM" \
  -d "To=$PHONE_TO" \
  -d "Body=$MESSAGE_BODY" \
  -d "FromCity=Seattle" \
  -d "FromState=WA" \
  -d "FromZip=98101" \
  -d "FromCountry=US" \
  -d "SmsStatus=received" \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "Check the logs with: supabase functions logs receive-sms"