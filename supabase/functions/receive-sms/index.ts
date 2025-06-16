import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log request method and headers for debugging
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Parse Twilio webhook data (form-encoded)
    const formData = await req.formData()
    
    // Extract SMS data from Twilio
    const messageData = {
      messageSid: formData.get('MessageSid'),
      accountSid: formData.get('AccountSid'),
      from: formData.get('From'),
      to: formData.get('To'),
      body: formData.get('Body'),
      numMedia: formData.get('NumMedia'),
      fromCity: formData.get('FromCity'),
      fromState: formData.get('FromState'),
      fromZip: formData.get('FromZip'),
      fromCountry: formData.get('FromCountry'),
      smsStatus: formData.get('SmsStatus'),
    }

    console.log('Received SMS:', messageData)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store the incoming message in the database
    const { data: storedMessage, error: storeError } = await supabase
      .from('sms_messages')
      .insert({
        message_sid: messageData.messageSid,
        from_number: messageData.from,
        to_number: messageData.to,
        body: messageData.body,
        direction: 'inbound',
        status: messageData.smsStatus || 'received',
        metadata: {
          fromCity: messageData.fromCity,
          fromState: messageData.fromState,
          fromZip: messageData.fromZip,
          fromCountry: messageData.fromCountry,
          numMedia: messageData.numMedia,
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (storeError) {
      console.error('Error storing message:', storeError)
      throw storeError
    }

    console.log('Message stored:', storedMessage)

    // Try to match the phone number to a patient
    const cleanedPhone = messageData.from?.replace(/\D/g, '').slice(-10) // Get last 10 digits
    const phoneVariants = [
      cleanedPhone,
      `(${cleanedPhone.slice(0, 3)}) ${cleanedPhone.slice(3, 6)}-${cleanedPhone.slice(6)}`,
      `${cleanedPhone.slice(0, 3)}-${cleanedPhone.slice(3, 6)}-${cleanedPhone.slice(6)}`,
      `+1${cleanedPhone}`,
      `1${cleanedPhone}`
    ]

    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .in('phone', phoneVariants)
      .single()

    if (patient) {
      console.log('Matched to patient:', patient.patient_id)
      
      // Update the message with patient association
      await supabase
        .from('sms_messages')
        .update({ patient_id: patient.patient_id })
        .eq('id', storedMessage.id)

      // Check for opt-out keywords
      const lowerBody = messageData.body?.toLowerCase() || ''
      if (lowerBody === 'stop' || lowerBody === 'unsubscribe' || lowerBody === 'cancel') {
        // Update patient's SMS preferences
        await supabase
          .from('patients')
          .update({ 
            sms_opt_in: false,
            sms_opt_out_date: new Date().toISOString()
          })
          .eq('patient_id', patient.patient_id)

        console.log('Patient opted out of SMS')
      }

      // Check for appointment confirmation keywords
      if (lowerBody === 'yes' || lowerBody === 'confirm' || lowerBody === '1') {
        // Look for recent appointment notifications
        const { data: recentNotification } = await supabase
          .from('sms_messages')
          .select('*')
          .eq('to_number', messageData.from)
          .eq('direction', 'outbound')
          .like('body', '%appointment%')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (recentNotification) {
          console.log('Appointment confirmation received')
          // You could update an appointment status here
        }
      }
    }

    // Create a notification for staff
    if (patient) {
      await supabase
        .from('notifications')
        .insert({
          type: 'sms_received',
          title: 'New SMS from Patient',
          message: `${patient.first_name} ${patient.last_name}: ${messageData.body}`,
          metadata: {
            patient_id: patient.patient_id,
            message_id: storedMessage.id,
            from_number: messageData.from
          },
          created_at: new Date().toISOString()
        })
    }

    // Return TwiML response (empty response acknowledges receipt)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/xml' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing incoming SMS:', error)
    
    // Return TwiML response even on error (to acknowledge to Twilio)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/xml' 
        },
        status: 200 // Always return 200 to Twilio
      }
    )
  }
})
