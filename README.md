# Start Button — Episode Generator

> **A local AI-powered production tool for weekly gaming discussion shows.**
> Generate episode rundowns, producer packets, topic suggestions, and icebreaker questions — all running on your own machine, powered by GitHub's free AI inference.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Requirements](#requirements)
3. [Getting a GitHub Account](#getting-a-github-account)
4. [Creating a GitHub Token](#creating-a-github-token)
5. [Installation](#installation)
6. [First Run](#first-run)
7. [Using the App](#using-the-app)
8. [Customising the Templates](#customising-the-templates)
9. [Configuring the News Feeds](#configuring-the-news-feeds)
10. [Troubleshooting](#troubleshooting)
11. [Security Notes](#security-notes)
12. [File Reference](#file-reference)

---

## What It Does

Start Button is a local web app that runs entirely on your computer. You fill in your episode's theme, tone, and three topics. The app:

- **Scans real gaming news** from IGN, Eurogamer, GameSpot, Polygon, PC Gamer, and VGC and suggests discussion topics matched to your direction
- **Reads your source links** — paste article URLs into the notes fields and the app fetches the full text before writing, so the AI works from real facts rather than memory
- **Generates a full episode rundown** in the show's established format: opening monologue, icebreaker, three segments each with host framing, panel questions, conversation starters, and transition lines, plus an outro
- **Generates a producer packet** as a downloadable PowerPoint deck: cover with release chips, timeline, comparison cards, stats slides, sentiment map, clip sources grid, and closing stats
- **Suggests icebreaker questions** once the episode is ready, with three options and a regenerate button
- **Previews everything** in a slide-in panel on the right side of the screen, with download, new tab, and print-to-PDF options

Nothing is stored in the cloud. Your GitHub token never leaves your machine except in the API calls you make.

---

## Requirements

### You will need

| Requirement | Minimum version | Why |
|---|---|---|
| Python | 3.8 or later | Runs the local server |
| A web browser | Chrome, Firefox, Safari, or Edge | Displays the app |
| A GitHub account | Free | Required to get a GitHub Models token |
| An internet connection | Any | For GitHub Models API calls and news feed fetching |

### You do NOT need

- Node.js (the PowerPoint library loads from a CDN)
- Any Python packages (the server uses only the standard library)
- Docker or any containerisation
- A paid GitHub subscription

### Checking your Python version

Open a terminal and run:

```
python3 --version
```

If you see `Python 3.8` or higher, you're good. If you see `command not found` or a version below 3.8, see [Installing Python](#installing-python) below.

### Installing Python

**macOS:** Python 3 ships with recent versions of macOS. If you need to install or upgrade, the easiest method is the official installer from [python.org/downloads](https://www.python.org/downloads/). Alternatively, if you use Homebrew: `brew install python3`

**Windows:** Download the installer from [python.org/downloads](https://www.python.org/downloads/). During installation, tick **"Add Python to PATH"** — this is important.

**Linux:** Use your package manager. On Ubuntu/Debian: `sudo apt install python3`

---

## Getting a GitHub Account

If you already have a GitHub account, skip to [Creating a GitHub Token](#creating-a-github-token).

1. Go to [github.com](https://github.com)
2. Click **Sign up** in the top right
3. Enter your email address and follow the prompts to choose a username and password
4. Verify your email address when GitHub sends you a confirmation

A free GitHub account is all you need. You do not need to pay for anything.

---

## Creating a GitHub Token

The app uses **GitHub Models** — GitHub's free AI inference service — to generate your episode content. To use it, you need a Personal Access Token (PAT). This is a long string of characters that acts as your password for API calls.

### Which type of token to create

GitHub offers two token types. Use a **Fine-grained personal access token** — it is more secure because you can limit exactly what it can do.

### Step-by-step

1. Sign in to [github.com](https://github.com)

2. Click your **profile photo** in the top-right corner, then click **Settings**

3. In the left sidebar, scroll down and click **Developer settings** (it's near the bottom)

4. In the left sidebar, click **Personal access tokens**, then click **Fine-grained tokens**

5. Click **Generate new token**

6. Fill in the form:
   - **Token name:** Something descriptive, e.g. `start-button-generator`
   - **Expiration:** Choose how long you want the token to be valid. 90 days is a reasonable starting point; you can always generate a new one when it expires
   - **Resource owner:** Leave this as your personal account
   - **Repository access:** Select **"No repositories"** — the app doesn't need any repository access

7. Under **Permissions**, expand **Account permissions** and find **Models**. Set it to **Read-only**. You do not need to enable any other permissions.

8. Click **Generate token** at the bottom of the page

9. **Copy the token immediately.** GitHub will only show it once. It starts with `github_pat_` followed by a long string of characters. Save it somewhere safe — a password manager is ideal.

### What the token looks like

```
github_pat_11ABCDEFG0abcdefghijklmnopqrstuvwxyz1234567890ABCDE
```

### Token safety rules

- Never paste your token into a chat, email, or commit
- Never put it directly in any code file
- If you accidentally expose a token, go to [github.com/settings/tokens](https://github.com/settings/tokens) immediately, find it, and click **Delete**. Then generate a new one.
- Treat it the same way you would treat a password

### Rate limits

GitHub Models is free but has per-day rate limits. For a weekly show prep workflow the limits are generous — you're unlikely to hit them. If you do, the app will show a clear error message. Rate limits reset at midnight UTC.

---

## Installation

### Step 1 — Download the app

Download `start-button-generator.zip` and unzip it. You'll get a folder called `start-button-generator` containing:

```
start-button-generator/
├── server.py                    ← the local server (this is what you run)
├── index.html                   ← the app UI
├── templates/
│   ├── episode-template.html    ← rundown CSS and page structure
│   └── packet-template.js       ← producer packet slide builder
├── samples-episode-format.html  ← example output: episode rundown
├── samples-producer-packet.pptx ← example output: producer packet deck
└── README.md                    ← this file
```

Move the folder wherever you like. The Desktop or your Documents folder both work well.

### Step 2 — Set your GitHub token as an environment variable

This is the recommended approach. Setting the token as an environment variable means it is never stored in any file — it only exists in your current terminal session.

**macOS / Linux**

Open Terminal and run:

```bash
export GITHUB_TOKEN=github_pat_your_actual_token_here
```

Replace `github_pat_your_actual_token_here` with your real token. This command sets the variable for the current terminal session. You'll need to run it again each time you open a new terminal window.

To make it permanent (so you don't have to run it every time), add it to your shell profile. Open `~/.zshrc` (macOS) or `~/.bashrc` (Linux) in any text editor and add this line at the bottom:

```bash
export GITHUB_TOKEN=github_pat_your_actual_token_here
```

Save the file and run `source ~/.zshrc` (or `source ~/.bashrc`) to apply it immediately.

**Windows (PowerShell)**

```powershell
$env:GITHUB_TOKEN="github_pat_your_actual_token_here"
```

This sets it for the current PowerShell session. To make it permanent, search for **"Edit the system environment variables"** in the Start menu, click **Environment Variables**, and add a new User variable called `GITHUB_TOKEN` with your token as the value.

**If you don't want to use an environment variable**

The app has a token field in the Engine panel. You can paste your token there instead — it is only held in your browser's memory and sent to the local server; it is never written to disk. You'll need to paste it each time you start the app.

### Step 3 — Navigate to the folder in your terminal

**macOS / Linux**

```bash
cd ~/Desktop/start-button-generator
```

Adjust the path to wherever you put the folder.

**Windows (PowerShell)**

```powershell
cd $HOME\Desktop\start-button-generator
```

### Step 4 — Start the server

```bash
python3 server.py
```

On Windows you may need to use `python` instead of `python3`:

```
python server.py
```

You should see output like this:

```
  ┌─────────────────────────────────────────────┐
  │   START BUTTON · Episode Generator          │
  └─────────────────────────────────────────────┘
   Serving at:  http://localhost:8787
   Token:       found in GITHUB_TOKEN env var ✓
   Stop with:   Ctrl+C
```

If the Token line says `NOT set` instead of `found in GITHUB_TOKEN env var ✓`, you can either set the environment variable (see Step 2) or paste the token into the app's Engine panel.

---

## First Run

1. Start the server (see Step 4 above)
2. Open your browser and go to `http://localhost:8787`
3. You should see the Start Button producer console
4. Look at `samples-episode-format.html` and `samples-producer-packet.pptx` to see what the outputs look like before your first generation
5. When you're ready, fill in your first episode and press **▶ Start**

To stop the server, go back to the terminal and press `Ctrl + C`.

---

## Using the App

### Topic Scout

At the top of the page. Type a direction — "optimistic stories this week", "anything about Nintendo", "indie surprises", "what's controversial right now" — and click **📡 Scan**. Leave it blank to get the most discussable stories of the week.

The server fetches real headlines from six outlets and the AI suggests 6–8 topics matched to your direction. Each suggestion shows a discussion angle and links to the source articles.

Click **→ 1**, **→ 2**, or **→ 3** on any suggestion to drop it into that segment slot. The title and angle fill in automatically. Click the button again to deselect and clear.

### This Week's Episode

Fill in the episode theme, air date, and pick a tone. The icebreaker field is optional — leave it blank and the AI will write one, or type your own.

### Three Topics

Each topic has a title and an optional notes field. The notes field is where the AI gets its direction — use it to specify what angle you want, what facts to include, what the panel should dig into. You can also paste article URLs here; the app will fetch them before generating.

### Engine

Select your AI model. `openai/gpt-4o` is the default and produces the best results. `openai/gpt-4o-mini` is faster and uses less of your rate limit. Other models are available for experimentation.

### ▶ Start

Generates the full episode rundown. If you've pasted any article URLs into the notes fields, the app fetches those first. The preview slides in from the right when ready.

### ⭐ Question of the Day

Appears at the top of the preview panel after generation. Gives you three icebreaker options tailored to your episode's theme and topics. Click one to swap it into the rundown live. Hit **↻ Regenerate** for three fresh options — it avoids repeating questions you've already seen.

### Preview panel

The preview slides in from the right. Controls:

- **⤢** — expand the panel to 60% of the screen for a bigger read
- **✕** — close the panel (the console returns to full width)
- **‹ Preview** tab on the right edge — reopens the panel without regenerating
- **Esc** — closes the panel

Footer buttons: **⬇ Download (.html)** saves a standalone rundown file, **New tab** opens it in a fresh browser tab, **Print / PDF** triggers the browser's print dialog (use "Save as PDF" to export with dark backgrounds preserved).

### 🎬 Producer Packet (.pptx)

Generates the on-set reference deck and downloads it as a PowerPoint file. The deck includes a cover slide with release chips, visual slides per segment (timeline, comparison cards, stats + talking points, sentiment map, history table), a clip sources grid, and a closing stats slide.

---

## Customising the Templates

Both output formats are in the `templates/` folder and are designed to be edited.

### Episode rundown — `templates/episode-template.html`

The CSS custom properties at the top of the `<style>` block control the look:

```css
:root {
  --bg:         #0E101B;   /* page background */
  --surface:    #191B29;   /* card backgrounds */
  --blue:       #6E79DE;   /* primary accent */
  --gold:       #D58048;   /* warm accent (highlighted segment, icebreaker) */
  --green:      #A6D959;   /* "Out Now" tags, positive */
  --ink:        #E2E4F3;   /* primary text */
}
```

Change any of these values and every future rundown will use the new palette.

### Producer packet — `templates/packet-template.js`

The `THEME` object at the top controls the entire deck. Colours are plain hex without the `#` symbol (PowerPoint's format):

```javascript
var THEME = {
  bg:       "0E101B",   // slide background
  gold:     "D58048",   // accent colour
  green:    "A6D959",   // positive colour
  blue:     "6E79DE",   // info colour
  font:     "Arial",    // body font
  headFont: "Cambria",  // heading font
};
```

---

## Configuring the News Feeds

The news sources are listed near the top of `server.py`:

```python
NEWS_FEEDS = [
    ("IGN",        "https://feeds.feedburner.com/ign/games-all"),
    ("Eurogamer",  "https://www.eurogamer.net/feed"),
    ("GameSpot",   "https://www.gamespot.com/feeds/game-news/"),
    ("Polygon",    "https://www.polygon.com/rss/index.xml"),
    ("PC Gamer",   "https://www.pcgamer.com/rss/"),
    ("VGC",        "https://www.videogameschronicle.com/feed/"),
]
HEADLINES_PER_FEED = 12
```

Add, remove, or swap any feed by providing the display name and RSS/Atom URL. `HEADLINES_PER_FEED` controls how many recent items are pulled from each source per scan.

---

## Troubleshooting

**"This site can't be reached" in the browser**
The server isn't running. Go to your terminal and run `python3 server.py`. The message `Serving at: http://localhost:8787` means it's ready.

**"No GitHub token" error in the app**
The `GITHUB_TOKEN` environment variable isn't set. Either set it in your terminal before starting the server, or paste your token into the GitHub token field in the Engine panel.

**"GitHub Models API error 401" or "403"**
Your token was rejected. Most likely causes: the token has expired, or it doesn't have the Models (Read-only) permission. Go to [github.com/settings/tokens](https://github.com/settings/tokens), delete the old token, and generate a new one.

**"GitHub Models API error 429"**
You've hit the daily rate limit. Wait until midnight UTC, or switch to `openai/gpt-4o-mini` which has a separate (lighter) limit.

**Topic Scout shows "Couldn't fetch any news feeds"**
Your internet connection may be down, or the outlets are temporarily unreachable. Try again in a few minutes.

**The producer packet fonts look wrong**
The deck uses Arial and Cambria. On Linux, install Microsoft core fonts: `sudo apt install ttf-mscorefonts-installer`

**I accidentally shared my token**
Revoke it immediately at [github.com/settings/tokens](https://github.com/settings/tokens). Then generate a new one. Treat any exposed token as fully compromised.

**Port 8787 is already in use**
Change `PORT = 8787` near the top of `server.py` to any unused port (e.g. `8788`), then open `http://localhost:8788`.

---

## Security Notes

- Your token never touches a third-party server — it goes from your environment (or the in-app field) to the local Python server, and from there directly to GitHub's API
- The local server only binds to `127.0.0.1` — it is not accessible from other computers on your network
- No data is logged or stored anywhere
- News feed fetching is read-only — the app reads public RSS feeds and does not submit anything
- The app has no auto-update mechanism — replace files manually when you download a new version

---

## File Reference

| File | Purpose |
|---|---|
| `server.py` | Local Python server — serves the UI, proxies API calls, fetches news feeds and source articles |
| `index.html` | The producer console UI |
| `templates/episode-template.html` | CSS and page shell for episode rundown exports |
| `templates/packet-template.js` | PowerPoint deck builder |
| `samples-episode-format.html` | Example episode rundown output |
| `samples-producer-packet.pptx` | Example producer packet deck |

---

---

## License

Copyright 2026 Timetravelin Entertainment

Licensed under the [Apache License, Version 2.0](LICENSE). You may use, copy, modify,
and distribute this software freely under the terms of that license. See the `LICENSE`
file in this folder for the full text.


*Start Button · Weekly Discussion Show Production Tool · For local use only*
