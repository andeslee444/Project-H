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
    const { action, data } = await req.json()

    // Get Twilio credentials from environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured')
    }

    // Create Twilio client
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    switch (action) {
      case 'send_single': {
        const { to, message, patientName } = data
        const personalizedMessage = message.replace('{name}', patientName || 'Patient')

        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'To': to,
            'From': twilioPhoneNumber,
            'Body': personalizedMessage,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to send SMS')
        }

        return new Response(
          JSON.stringify({ success: true, messageId: result.sid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'send_blast': {
        const { recipients } = data
        const results = []

        for (const recipient of recipients) {
          try {
            const personalizedMessage = recipient.message.replace(
              '{name}', 
              recipient.patientName || 'Patient'
            )

            const response = await fetch(twilioUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${twilioAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                'To': recipient.to,
                'From': twilioPhoneNumber,
                'Body': personalizedMessage,
              }),
            })

            const result = await response.json()
            results.push({
              to: recipient.to,
              success: response.ok,
              messageId: result.sid,
              error: !response.ok ? result.message : undefined
            })
          } catch (error) {
            results.push({
              to: recipient.to,
              success: false,
              error: error.message
            })
          }
        }

        const sent = results.filter(r => r.success).length
        const failed = results.filter(r => !r.success).length

        return new Response(
          JSON.stringify({ 
            success: failed === 0, 
            sent, 
            failed, 
            results 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'queue_waterfall': {
        const { recipients, intervalMinutes } = data
        
        // For waterfall, we need to use Supabase to store the queue
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Create a job in the database
        const { data: job, error } = await supabase
          .from('sms_queue')
          .insert({
            recipients: recipients,
            interval_minutes: intervalMinutes,
            status: 'pending',
            current_index: 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Send the first message immediately
        if (recipients.length > 0) {
          const firstRecipient = recipients[0]
          const personalizedMessage = firstRecipient.message.replace(
            '{name}', 
            firstRecipient.patientName || 'Patient'
          )

          await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'To': firstRecipient.to,
              'From': twilioPhoneNumber,
              'Body': personalizedMessage,
            }),
          })

          // Update job progress
          await supabase
            .from('sms_queue')
            .update({ current_index: 1 })
            .eq('id', job.id)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            jobId: job.id,
            message: `Waterfall SMS queued for ${recipients.length} recipients`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})