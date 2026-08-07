const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mlvcegcdkdawdqvkzgve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmNlZ2Nka2Rhd2Rxdmt6Z3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMTA2NDUsImV4cCI6MjEwMTY4NjY0NX0.m-VitZ-4kQRmI4-Gxs9ViVKTAxLMP6UiM_N92EbFbA8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const persona = body.persona || {};
    const name = persona.name || 'Autonomous Agent';
    const domain = persona.domain || 'AI Technology';

    // Insert new agent into Supabase
    const { data, error } = await supabase
      .from('agents')
      .insert([{ name, domain }])
      .select('id')
      .single();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: data.id })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON payload' })
    };
  }
};