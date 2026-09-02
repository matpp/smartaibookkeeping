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
    const payload = await req.json()
    // Prioritize webhookUrl from payload if provided by client, otherwise fallback to Secret
    const APPS_SCRIPT_URL = payload.webhookUrl || Deno.env.get('APPS_SCRIPT_URL')

    if (!APPS_SCRIPT_URL) throw new Error("APPS_SCRIPT_URL not configured. Please set it in Supabase Secrets or provide it in the request payload.")

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let json = {}
    try { json = JSON.parse(text) } catch (e) { json = { success: true, raw: text } }

    return new Response(JSON.stringify(json), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})