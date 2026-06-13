# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
python server.py          # starts server at http://localhost:8787
# Windows alternative:
python3 server.py
```

Set the GitHub token before starting (required for AI features):
```bash
export GITHUB_TOKEN=your_token_here   # bash/zsh
$env:GITHUB_TOKEN="your_token_here"  # PowerShell
```

There is no build step, no package manager, and no test suite. The app runs directly from source.

## Architecture

**Two-file core:**

- `server.py` — Python 3.8+ stdlib-only HTTP server. Serves static files and proxies three POST endpoints: `/api/generate` (GitHub Models), `/api/suggest` (RSS fetch + AI topic suggestions), `/api/research` (article text extraction). Binds to `127.0.0.1:8787` only.
- `index.html` — Entire frontend: UI, client-side JavaScript, and all AI prompt strings. No framework, no bundler.

**Supporting files:**
- `templates/episode-template.html` — CSS/layout injected into episode HTML exports
- `templates/packet-template.js` — PptxGenJS template; loaded by the browser at packet-generation time. Contains a `THEME` object for deck colors/fonts.

## Key Concepts

**AI generation flow:**
1. Client extracts URLs from topic notes → calls `/api/research` to fetch article text
2. Client builds a structured prompt (in `index.html`) → calls `/api/generate` → GitHub Models returns JSON
3. Client renders JSON into episode HTML (`renderEpisode()`) or triggers PPTX download via PptxGenJS

**Prompts live in `index.html`** as multi-line JS strings — `buildEpisodePrompt()`, `buildPacketPrompt()`, `buildQotdPrompt()`. These encode the show's house format and expected JSON schemas. Editing them is the primary way to change output style.

**No external Python packages.** All HTTP, XML, and JSON handling uses Python stdlib. PptxGenJS (CDN) and Google Fonts are the only external browser dependencies.

## Customization Points

| What to change | Where |
|---|---|
| AI model (default, options) | `index.html` model `<select>` element |
| News feed sources | `server.py` `NEWS_FEEDS` list (~line 50) |
| Server port | `server.py` `PORT` constant |
| Episode output styling | `templates/episode-template.html` CSS vars |
| PowerPoint theme (colors, fonts) | `templates/packet-template.js` `THEME` object |
| Generation prompts / JSON schemas | `index.html` `build*Prompt()` functions |

## API Endpoints

| Endpoint | Body | Purpose |
|---|---|---|
| `POST /api/generate` | `{model, messages, json_mode, temperature, max_tokens}` | Proxy to GitHub Models |
| `POST /api/suggest` | `{brief, model}` | Fetch 6 RSS feeds + AI topic suggestions |
| `POST /api/research` | `{urls: [...]}` | Fetch and strip article text (max 8 URLs) |
| `GET /api/status` | — | Check if `GITHUB_TOKEN` is set |
