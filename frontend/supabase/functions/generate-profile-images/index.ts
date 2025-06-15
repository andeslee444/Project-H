import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, person } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    let prompt = '';
    
    if (type === 'provider') {
      // Generate doctor/healthcare provider images
      const { firstName, lastName, title, specialties } = person;
      const gender = ['Sarah', 'Emily', 'Lisa', 'Maria', 'Jennifer'].includes(firstName) ? 'female' : 'male';
      const ethnicity = lastName === 'Chen' ? 'Asian' : 
                       lastName === 'Rodriguez' || lastName === 'Martinez' || lastName === 'Garcia' ? 'Hispanic' : 
                       'diverse';
      
      prompt = `Professional headshot portrait of a ${gender} ${title || 'healthcare provider'}, 
                ${ethnicity} appearance, wearing professional medical attire (white coat or professional clothing), 
                warm and approachable expression, modern medical office background with soft lighting, 
                high quality professional photography, confident and trustworthy demeanor`;
    } else if (type === 'patient') {
      // Generate patient profile pictures
      const { firstName, age, gender } = person;
      const ageGroup = age < 30 ? 'young adult' : age < 50 ? 'middle-aged' : 'senior';
      
      prompt = `Friendly portrait photo of a ${gender || 'person'} ${ageGroup}, 
                casual everyday clothing, natural expression, soft indoor lighting, 
                blurred background, high quality photography, approachable and genuine appearance`;
    }

    // Call OpenAI DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload to Supabase Storage
    const fileName = `${type}s/${person.id || crypto.randomUUID()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, uint8Array, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl,
        prompt: prompt 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});