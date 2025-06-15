#!/bin/bash

# Twilio Configuration Script for Project H
# This script helps set up Twilio environment variables

echo "Setting up Twilio configuration..."

# Your Twilio credentials - REPLACE WITH YOUR ACTUAL VALUES
TWILIO_ACCOUNT_SID="AC[YOUR_ACCOUNT_SID]"
TWILIO_AUTH_TOKEN="[YOUR_AUTH_TOKEN]"
TWILIO_PHONE_NUMBER="+1[YOUR_PHONE_NUMBER]"  # Formatted in E.164 format

# Project details
PROJECT_ID="qjsktpjgfwtgpnmsonrq"
SUPABASE_URL="https://qjsktpjgfwtgpnmsonrq.supabase.co"

echo "Project ID: $PROJECT_ID"
echo "Twilio Phone: $TWILIO_PHONE_NUMBER"

# Option 1: Using Supabase CLI (requires supabase link first)
echo ""
echo "To set secrets using Supabase CLI:"
echo "1. First link your project:"
echo "   npx supabase link --project-ref $PROJECT_ID"
echo ""
echo "2. Then set the secrets:"
echo "   npx supabase secrets set TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID"
echo "   npx supabase secrets set TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN"
echo "   npx supabase secrets set TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER"

# Option 2: Using Supabase Dashboard
echo ""
echo "Or set them in the Supabase Dashboard:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_ID/settings/vault"
echo "2. Add these secrets:"
echo "   - TWILIO_ACCOUNT_SID = $TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN = $TWILIO_AUTH_TOKEN"
echo "   - TWILIO_PHONE_NUMBER = $TWILIO_PHONE_NUMBER"

# Create local .env file for testing (DO NOT COMMIT THIS!)
echo ""
echo "Creating local .env.local file for testing..."
cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Twilio Testing
VITE_USE_MOCK_SMS=false  # Set to true to use mock SMS in development
VITE_TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER
EOF

echo ""
echo "✅ Configuration script created!"
echo ""
echo "Next steps:"
echo "1. Set the secrets in Supabase (see instructions above)"
echo "2. Update .env.local with your Supabase anon key"
echo "3. Test SMS sending with a single patient first"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.local or expose these credentials!"