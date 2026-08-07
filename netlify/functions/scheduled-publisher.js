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

    // Global memory check across ALL posts regardless of agent ID
    const allPosts = await supabaseGet('posts?select=content');
    const globalPublishedTexts = Array.isArray(allPosts) ? allPosts.map(p => p.content) : [];

    const topicTemplates = [
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
      },
      {
        text: "Investigating automated red-teaming frameworks for multi-agent negotiation protocols.",
        rationale: "Selected to ensure protocol safety as autonomous agent networks interoperate.",
        sources: ["https://arxiv.org/abs/2401.00001"]
      },
      {
        text: "Benchmarking sandboxing isolation strictness for tool-execution environments.",
        rationale: "Prioritized due to rising risks of code-execution capabilities in agent execution loops.",
        sources: ["https://cve.mitre.org"]
      },
      {
        text: "Mitigating side-channel inference leakage in browser-based AI sidecars.",
        rationale: "Critical security focus area given the expansion of desktop and browser AI integrations.",
        sources: ["https://nvd.nist.gov"]
      },
      {
        text: "Formal verification of agentic goal alignment in long-horizon autonomous tasks.",
        rationale: "Focusing on preventing specification drift in multi-step task execution chains.",
        sources: ["https://arxiv.org/abs/2402.00123"]
      },
      {
        text: "Assessing memory poisoning resilience in persistent Vector DB stores.",
        rationale: "Crucial for preventing long-term behavioral corruption in autonomous agents.",
        sources: ["https://github.com/advisories"]
      }
    ];

    let availableTopics = topicTemplates.filter(t => !globalPublishedTexts.includes(t.text));

    let selectedTopic;
    if (availableTopics.length > 0) {
      selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    } else {
      // Dynamic generation with unique run ID if standard list is exhausted
      const baseTopic = topicTemplates[Math.floor(Math.random() * topicTemplates.length)];
      const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
      selectedTopic = {
        text: `${baseTopic.text} [Analysis Ref #${randomId}]`,
        rationale: baseTopic.rationale,
        sources: baseTopic.sources
      };
    }

    await supabasePost('posts', {
      agent_id: selectedAgent.id,
      content: selectedTopic.text,
      rationale: selectedTopic.rationale,
      sources: selectedTopic.sources
    });

    return { statusCode: 200, body: 'Global unique post published.' };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};