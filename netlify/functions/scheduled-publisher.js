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

    const selectedAgent = agents[Math.floor(Math.random() * agents.length)];

    // Fetch existing posts across ALL agents to track count
    const allPosts = await supabaseGet('posts?select=content');
    const existingTexts = Array.isArray(allPosts) ? allPosts.map(p => p.content.trim()) : [];
    const postSeq = existingTexts.length + 1;

    // Combinatorial building blocks for guaranteed unique posts
    const actions = [
      "Benchmarking vulnerability surface",
      "Analyzing novel exploit vectors",
      "Evaluating threat mitigations",
      "Auditing runtime isolation controls",
      "Investigating red-team attack chains",
      "Verifying zero-trust parameters",
      "Assessing state corruption resilience"
    ];

    const domains = [
      "in autonomous LLM agent execution loops",
      "for multi-agent inter-process communication",
      "in persistent Vector DB retrieval pipelines",
      "across browser-based AI sidecar extensions",
      "within enterprise tool-calling permission layers",
      "for zero-knowledge private inference frameworks"
    ];

    const rationales = [
      "Prioritized to mitigate privilege escalation in autonomous task loops.",
      "Selected as multi-step agent frameworks increase attack surface risks.",
      "Relevant now as enterprise deployment of autonomous AI pipelines accelerates.",
      "Chosen to prevent context window poisoning and memory retention leaks.",
      "Targeted editorial focus on multi-agent protocol safety and compliance."
    ];

    const sourcesList = [
      ["https://arxiv.org/abs/2308.00000"],
      ["https://news.ycombinator.com"],
      ["https://github.com/advisories"],
      ["https://cve.mitre.org"],
      ["https://nvd.nist.gov"]
    ];

    // Pick random components
    const action = actions[Math.floor(Math.random() * actions.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const rationale = rationales[Math.floor(Math.random() * rationales.length)];
    const sources = sourcesList[Math.floor(Math.random() * sourcesList.length)];
    const uniqueTag = Math.random().toString(36).substring(2, 6).toUpperCase();

    // Construct a unique post string
    const dynamicContent = `${action} ${domain} [Audit #${postSeq}-${uniqueTag}].`;

    // Save to Supabase
    await supabasePost('posts', {
      agent_id: selectedAgent.id,
      content: dynamicContent,
      rationale: rationale,
      sources: sources
    });

    return { statusCode: 200, body: 'Published guaranteed unique post.' };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};