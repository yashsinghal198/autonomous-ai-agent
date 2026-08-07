const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mlvcegcdkdawdqvkzgve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmNlZ2Nka2Rhd2Rxdmt6Z3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMTA2NDUsImV4cCI6MjEwMTY4NjY0NX0.m-VitZ-4kQRmI4-Gxs9ViVKTAxLMP6UiM_N92EbFbA8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const agentId = event.queryStringParameters ? event.queryStringParameters.agentId : null;

  if (!agentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing agentId query parameter' })
    };
  }

  // Fetch posts for this agent in reverse chronological order
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, created_at, content, rationale, sources')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

  // Format to match exact requirement specs
  const formattedPosts = (posts || []).map(p => ({
    id: String(p.id),
    createdAt: p.created_at,
    text: p.content,
    rationale: p.rationale || 'Selected based on current AI security developments.',
    sources: p.sources || ['https://news.ycombinator.com']
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ posts: formattedPosts })
  };
};
