# ai-summarizer

A lightweight AI-powered text summarizer web app built with JavaScript and CSS. ai-summarizer helps you turn long articles, notes, or web content into concise summaries using a configurable AI backend.

## Features
- Summarize arbitrary text quickly.
- Adjustable summary length (short / medium / long).
- Clean, responsive UI (built with plain CSS).
- Pluggable AI backend (e.g., OpenAI or any compatible API).
- Export or copy summaries.

> Languages: JavaScript (frontend / backend) and CSS (styling)

## Demo
Add a screenshot or link to a deployed demo here.

## Getting started

### Prerequisites
- Node.js 16+ and npm (or yarn)
- An API key for your AI provider (if using OpenAI or similar)

### Quick install
1. Clone the repo
   git clone https://github.com/Bhargav214/ai-summarizer.git
2. Install dependencies
   cd ai-summarizer
   npm install
3. Create environment variables
   - Copy `.env.example` to `.env` and set your API key (example variable: `OPENAI_API_KEY`)
4. Run locally
   npm run dev
5. Open your browser at `http://localhost:3000`

### Example .env.example
OPENAI_API_KEY=your_api_key_here
PORT=3000

## Usage

- In the web UI: paste or type text, choose summary length, and click "Summarize".
- Programmatic API (example):
  POST /api/summarize
  Headers: Content-Type: application/json
  Body:
  {
    "text": "Long text to summarize...",
    "length": "short" // or "medium", "long"
  }

Example client call (browser):
```javascript
async function summarize(text, length = 'short') {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, length })
  });
  const data = await res.json();
  return data.summary;
}
```

## Architecture / Project structure (typical)
- /src — frontend and client-side JS
- /server or /api — server routes that call the AI backend
- /public — static assets
- /styles — CSS files

Adjust these paths if your project structure differs.

## Configuration
- Set your AI provider key in `.env` (example variable: `OPENAI_API_KEY`).
- If using a different AI provider, update the server integration in `/server` or `/api` to match the provider's API.

## Development
- Start development server: npm run dev
- Build for production: npm run build
- Start production server: npm start

Add linting, formatting, and tests as needed:
- lint: npm run lint
- test: npm test

## Contributing
Contributions are welcome! Suggested workflow:
1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit changes and open a pull request
4. Ensure code is linted and tested

Please include README updates if you add features or change configuration.

## Troubleshooting
- 401 Unauthorized from AI provider: check your API key and environment variable.
- Slow or failed summaries: check provider rate limits and network connectivity.
- UI issues: check browser console for errors and inspect network requests.

## Roadmap / Ideas
- URL/article scraping & summarization
- Multi-language support
- Summarization tuning (keywords, tone)
- Export to PDF/Markdown
- Rate-limit handling and caching

## License
MIT — see LICENSE for details.

## Acknowledgements
Built with JavaScript and CSS. Inspired by many open-source summarization UIs and AI APIs.
