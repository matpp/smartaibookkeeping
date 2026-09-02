import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, imageBase64, imageMimeType } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured in Supabase Secrets")
    }

    const parts: any[] = []
    
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      parts.push({
        inline_data: {
          mime_type: imageMimeType || "image/jpeg",
          data: cleanBase64
        }
      })
    }
    
    parts.push({ text: prompt })

    // Using the current recommended model identifier: gemini-3.6-flash
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    })

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      throw new Error(data.error?.message || `Gemini API error: ${geminiRes.statusText}`)
    }

    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})