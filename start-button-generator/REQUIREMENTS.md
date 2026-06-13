# Start Button — Requirements

This document lists everything the app needs to run, and where to get each thing.

---

## System Requirements

| Requirement | Minimum | Recommended | Notes |
|---|---|---|---|
| **Python** | 3.8 | 3.11 or later | Standard library only — no pip packages needed |
| **Operating system** | Windows 10, macOS 10.15, Ubuntu 20.04 | Any current version | Any OS that runs Python 3.8+ |
| **Web browser** | Chrome 90, Firefox 88, Safari 14, Edge 90 | Latest version | Required for the UI |
| **Screen resolution** | 1280 × 800 | 1440 × 900 or wider | The flyout preview panel needs width to show well |
| **Internet connection** | Required | Broadband | For GitHub Models API and news feed fetching |
| **Disk space** | ~1 MB | — | The app itself is tiny |
| **RAM** | 512 MB free | 1 GB free | The server is lightweight; the browser does the heavy lifting |

---

## External Services

### GitHub account (required)

- **Cost:** Free
- **Sign up:** [github.com](https://github.com)
- **Why:** The app uses GitHub Models for AI generation. You need a GitHub account to create the token that authorises your API calls.

### GitHub Models API (required)

- **Cost:** Free, within daily rate limits
- **Rate limits:** Reset at midnight UTC. Sufficient for weekly show prep.
- **Models available in the app:**

| Model string | Speed | Quality | Best for |
|---|---|---|---|
| `openai/gpt-4o` | Medium | Highest | Default — full episodes and packets |
| `openai/gpt-4o-mini` | Fast | Good | Quick drafts, icebreaker generation |
| `openai/gpt-4.1` | Medium | High | Alternative to gpt-4o |
| `meta/llama-3.3-70b-instruct` | Fast | Good | Open-source alternative |
| `mistral-ai/mistral-large-2411` | Medium | Good | European-hosted alternative |

---

## Python

No packages need to be installed. The server uses only Python's standard library:

| Module | Purpose |
|---|---|
| `http.server` | Serves the UI and handles API proxy requests |
| `json` | Parsing and generating JSON |
| `urllib.request` | Making HTTP requests to GitHub Models and news feeds |
| `urllib.error` | Handling HTTP errors |
| `xml.etree.ElementTree` | Parsing RSS and Atom news feeds |
| `os` | Reading environment variables |
| `sys` | Writing to stderr |
| `re` | Stripping HTML from fetched article text |

### Verifying your Python installation

```bash
python3 --version
# Expected: Python 3.8.x or higher
```

### Installing Python if needed

| OS | Method |
|---|---|
| macOS | Official installer at python.org/downloads, or `brew install python3` |
| Windows | Official installer at python.org/downloads — tick "Add Python to PATH" |
| Ubuntu / Debian | `sudo apt install python3` |
| Fedora / RHEL | `sudo dnf install python3` |
| Arch | `sudo pacman -S python` |

---

## Browser (client-side dependencies)

The browser loads two external resources when you open the app. Both are free and require no account.

### PptxGenJS (PowerPoint generation)

- **Version:** 3.12.0
- **Source:** `https://cdnjs.cloudflare.com/ajax/libs/PptxGenJS/3.12.0/pptxgen.bundle.js`
- **Why:** Builds the `.pptx` producer packet directly in the browser without any server-side tooling
- **Required for:** The 🎬 Producer Packet button only — the episode rundown works without it
- **Internet required:** Yes, on first use per browser session (the browser may cache it after that)

### Google Fonts

- **Fonts loaded:** Chakra Petch (700, 600, 500), IBM Plex Sans (400, 500, 600, italic), IBM Plex Mono (400, 500)
- **Source:** `https://fonts.googleapis.com`
- **Why:** The app's UI typography
- **Required for:** Visual polish only — the app functions with fallback system fonts if Google Fonts is unreachable
- **Internet required:** Yes, each session (or you can download and self-host the fonts)

### Episode rundown template fonts

The exported rundown HTML loads two additional fonts for the document itself:

- **Playfair Display** (700, 900) — headings
- **Lora** (400, 600, italic 400) — body copy

These are also loaded from Google Fonts at preview/download time.

---

## GitHub Token

### Type

Fine-grained Personal Access Token (PAT). Classic tokens also work but grant broader access than needed.

### Required permission

| Permission | Level |
|---|---|
| Models | Read-only |

No repository access is needed. No organisation access is needed.

### How to create one

1. Sign in to [github.com](https://github.com)
2. Go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
3. Click **Generate new token**
4. Set a name and expiration date
5. Set Repository access to **No repositories**
6. Under Account permissions, set **Models** to **Read-only**
7. Click **Generate token** and copy it immediately

Full step-by-step with screenshots in [README.md § Creating a GitHub Token](README.md#creating-a-github-token).

### How the token is used

The token is passed as a `Bearer` token in the `Authorization` header of HTTPS requests to:

```
https://models.github.ai/inference/chat/completions
```

It is never written to disk, never logged, and never sent to any server other than GitHub's.

### Token storage options

| Method | Security | Convenience |
|---|---|---|
| `GITHUB_TOKEN` environment variable | ✅ Best — never in any file | Requires one terminal command per session (or a profile entry) |
| `~/.zshrc` / `~/.bashrc` / Windows user env vars | ✅ Good — stored in user profile only | Set once, available always |
| In-app token field | ⚠️ Memory only — cleared on page reload | Convenient but must be re-entered each session |
| Hardcoded in server.py | ❌ Never do this | — |

---

## Network Access

The app makes outbound connections to the following hosts:

| Host | Purpose | Required |
|---|---|---|
| `models.github.ai` | GitHub Models API (episode generation, packet, QOTD, topic suggestions) | Yes |
| `feeds.feedburner.com` | IGN RSS feed | No (Topic Scout only) |
| `www.eurogamer.net` | Eurogamer RSS feed | No (Topic Scout only) |
| `www.gamespot.com` | GameSpot RSS feed | No (Topic Scout only) |
| `www.polygon.com` | Polygon RSS feed | No (Topic Scout only) |
| `www.pcgamer.com` | PC Gamer RSS feed | No (Topic Scout only) |
| `www.videogameschronicle.com` | VGC RSS feed | No (Topic Scout only) |
| `cdnjs.cloudflare.com` | PptxGenJS library | No (Producer Packet only) |
| `fonts.googleapis.com` | Google Fonts | No (visual only) |
| Any URL pasted into topic notes | Source article fetching | No (research step only) |

All connections are outbound HTTPS (port 443) except the local server itself (port 8787, loopback only).

The local server binds exclusively to `127.0.0.1:8787` and is not reachable from outside your machine.

---

## Optional: Self-hosting Fonts and PptxGenJS

If you need the app to work fully offline (after the initial token auth), you can download and self-host the external resources.

### Fonts

Download the font files from Google Fonts and place them in a `fonts/` subfolder. Then replace the `<link>` tags in `index.html` and `templates/episode-template.html` with `@font-face` declarations pointing to the local files.

### PptxGenJS

Download `pptxgen.bundle.js` from [github.com/gitbrent/PptxGenJS/releases](https://github.com/gitbrent/PptxGenJS/releases) and place it in the project folder. Then change the `<script src="https://cdnjs...">` tag in `index.html` to `<script src="pptxgen.bundle.js">`.

---

## Firewall / Proxy Considerations

If you're running this in a corporate environment with a web proxy:

- The Python server makes direct HTTPS requests — if your environment requires a proxy, set the `HTTPS_PROXY` environment variable before starting the server: `export HTTPS_PROXY=http://your-proxy:8080`
- The browser's connections to Google Fonts and cdnjs go through your normal browser proxy settings
- The local server (`127.0.0.1:8787`) should not go through any proxy — ensure your browser is configured to bypass the proxy for `localhost`

---

## Version History of This Requirements Document

| Date | Changes |
|---|---|
| June 2026 | Initial release |

---

*Start Button · Requirements Document · For local use only*
