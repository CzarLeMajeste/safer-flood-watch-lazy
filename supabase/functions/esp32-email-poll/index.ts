import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate ESP32 via API key
    const authHeader = req.headers.get('authorization');
    const expectedKey = Deno.env.get('ESP32_API_KEY');
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET - Fetch pending email alerts and emergency contacts
    if (req.method === 'GET') {
      console.log('ESP32 polling for pending email alerts...');
      
      const { data: messages, error: messagesError } = await supabase
        .from('email_queue')
        .select('id, email_body, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching pending emails:', messagesError);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('email, name')
        .eq('is_active', true);

      if (contactsError) {
        console.error('Error fetching emergency contacts:', contactsError);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const recipients = contacts?.filter(c => c.email).map(c => c.email) || [];
      console.log(`Found ${messages?.length || 0} pending email alerts, ${recipients.length} recipients`);
      
      return new Response(JSON.stringify({ 
        messages: messages || [],
        recipients: recipients
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH - Update email status to 'sent'
    if (req.method === 'PATCH') {
      const { id } = await req.json();

      if (!id || typeof id !== 'number') {
        return new Response(JSON.stringify({ error: 'Missing or invalid message id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Updating email ${id} status to 'sent'...`);

      const { data, error } = await supabase
        .from('email_queue')
        .update({ status: 'sent' })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating email status:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Email ${id} marked as sent`);
      return new Response(JSON.stringify({ success: true, updated: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
