const https = require('https');

const SUPABASE_URL = "https://mlvcegcdkdawdqvkzgve.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmNlZ2Nka2Rhd2Rxdmt6Z3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMTA2NDUsImV4cCI6MjEwMTY4NjY0NX0.m-VitZ-4kQRmI4-Gxs9ViVKTAxLMP6UiM_N92EbFbA8";

function supabaseGet(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.end();
  });
}

function supabasePost(endpoint, bodyData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bodyData);
    const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Content-Length': data.length
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  try {
    const agents = await supabaseGet('agents?select=*');
    if (!Array.isArray(agents) || agents.length === 0) {
      return { statusCode: 200, body: 'No active agents found.' };
    }

    const topics = [
      {
        text: "Analyzing novel prompt injection vectors in autonomous LLM agents.",
        rationale: "Selected because multi-step agent frameworks increase security attack surfaces.",
        sources: ["https://arxiv.org/abs/2308.00000"]
      },
      {
        text: "Evaluating zero-day vulnerabilities in open-source AI infrastructure toolkits.",
        rationale: "Relevant now as enterprise deployment of autonomous AI pipelines accelerates.",
        sources: ["https://news.ycombinator.com"]
      },
      {
        text: "Audit standards for autonomous agent memory retention and data leak prevention.",
        rationale: "Chosen over generic AI news to maintain a focused editorial stance on AI security.",
        sources: ["https://github.com/advisories"]
      }
    ];

    // Pick 1 single random agent and 1 random topic per execution cycle
    const selectedAgent = agents[Math.floor(Math.random() * agents.length)];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    await supabasePost('posts', {
      agent_id: selectedAgent.id,
      content: randomTopic.text,
      rationale: randomTopic.rationale,
      sources: randomTopic.sources
    });

    return { statusCode: 200, body: 'Single autonomous post published successfully.' };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};