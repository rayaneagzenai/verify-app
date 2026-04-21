const express = require('express');
const path = require('path');
const readline = require('readline');
const os = require('os');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let API_KEY = process.env.ANTHROPIC_API_KEY || '';

app.post('/api/verify', async (req, res) => {
  const { claim, lang } = req.body;
  if (!claim) return res.status(400).json({ error: 'No claim provided' });
  if (!API_KEY) return res.status(500).json({ error: 'No API key set.' });

  const isFrench = lang === 'fr';

  try {
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `You are Verify, a strict fact-checking engine. Search the web and fact-check the claim using ONLY these approved sources: Reuters, WHO, CDC, NHS, PubMed, Mayo Clinic, World Bank, OECD, Eurostat, US Census Bureau, Our World in Data, SEC, Bloomberg, Financial Times, BBC News, New York Times, The Guardian, United Nations, European Union.

${isFrench ? 'IMPORTANT: Respond entirely in French. The summary, whatIsTrue, whatIsFalse, and source excerpts must all be in French.' : 'Respond in English.'}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text:
{"claim":"...","category":"health|science|history|politics|economics|technology|other","verdict":"TRUE|FALSE|PARTIALLY_FALSE|UNVERIFIED|NOT_IN_SOURCES","confidence":"High|Medium|Low","summary":"2 sentences","whatIsTrue":"only if PARTIALLY_FALSE else empty","whatIsFalse":"only if PARTIALLY_FALSE else empty","sources":[{"name":"...","type":"primary|fact-check|research|reporting","title":"...","url":"https://...","date":"...","excerpt":"1 sentence","quote":"short quote or empty"}]}

Rules: search 2-3 times, only cite approved sources, verdict=NOT_IN_SOURCES if not covered, never fabricate quotes.`,
        messages: [{ role: 'user', content: `Fact-check: "${claim}"` }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });

    let raw = '';
    for (const block of data.content) {
      if (block.type === 'text') raw = block.text;
    }

    raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse result' });

    res.json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function start() {
  if (API_KEY) {
    launch();
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\n🔑 Enter your Anthropic API key: ', (key) => {
      API_KEY = key.trim();
      rl.close();
      launch();
    });
  }
}

function launch() {
  const ip = getLocalIP();
  app.listen(3000, '0.0.0.0', () => {
    console.log('\n✅ Verify is running!\n');
    console.log('💻 On this Mac:    http://localhost:3000');
    console.log(`📱 On your iPhone: http://${ip}:3000`);
    console.log('\n(Make sure your iPhone is on the same WiFi)\n');
  });
}

start();
