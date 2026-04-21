# Verify — Fact Checker App

A clean, fast, mobile-first fact-checking app. Type a claim, get a verdict in seconds using only approved trusted sources.

## Approved Sources
WHO · CDC · NHS · PubMed · Mayo Clinic · Reuters · BBC News · New York Times · The Guardian · Bloomberg · Financial Times · United Nations · European Union · World Bank · OECD · Eurostat · Our World in Data · SEC

## Setup (2 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set your Anthropic API key
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Start the app
```bash
node server.js
```

### 4. Open in browser
```
http://localhost:3000
```

That's it. The app runs locally, calls the Anthropic API through the server, and searches the web in real time.

## How it works
1. You type a claim in the app
2. The server sends it to Claude with web search enabled
3. Claude searches approved sources (Reuters, WHO, BBC, etc.)
4. Returns a verdict: **True / False / Partially False / Unverified / Not in sources**
5. Sources and excerpts are shown in the result

## Requirements
- Node.js 18+
- An Anthropic API key (claude.ai account or API access)
