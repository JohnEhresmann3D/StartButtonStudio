#!/usr/bin/env python3
# Copyright 2026 Timetravelin Entertainment
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""
Start Button — Episode Generator (local server)

Runs a tiny local web server that:
  1. Serves the generator UI (index.html)
  2. Proxies generation requests to the GitHub Models API

SECURITY: Your GitHub token is NEVER stored in this code.
Provide it one of two ways:
  a) Environment variable (recommended):
       macOS/Linux:  export GITHUB_TOKEN=ghp_yournewtoken
       Windows (PS): $env:GITHUB_TOKEN="ghp_yournewtoken"
  b) Paste it into the token field in the UI — it is sent only to
     this local server on your machine, then forwarded to GitHub.

Run:
    python3 server.py
Then open:
    http://localhost:8787

Requires Python 3.8+. No packages to install — standard library only.
"""

import json
import os
import sys
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8787
GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions"
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Gaming news sources scanned by the Topic Scout. Add/remove freely.
NEWS_FEEDS = [
    ("IGN",        "https://feeds.feedburner.com/ign/games-all"),
    ("Eurogamer",  "https://www.eurogamer.net/feed"),
    ("GameSpot",   "https://www.gamespot.com/feeds/game-news/"),
    ("Polygon",    "https://www.polygon.com/rss/index.xml"),
    ("PC Gamer",   "https://www.pcgamer.com/rss/"),
    ("VGC",        "https://www.videogameschronicle.com/feed/"),
]
HEADLINES_PER_FEED = 12


def fetch_page(url):
    """Fetch a web page and return readable text (scripts/tags stripped)."""
    import re
    req = urllib.request.Request(url, headers={
        "User-Agent": ("Mozilla/5.0 (compatible; start-button-generator/1.0; "
                       "local research tool)"),
        "Accept": "text/html,application/xhtml+xml",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = resp.read(800_000).decode("utf-8", errors="ignore")
    title_m = re.search(r"<title[^>]*>(.*?)</title>", raw, re.I | re.S)
    title = _strip_html(title_m.group(1)) if title_m else url
    raw = re.sub(r"<(script|style|nav|header|footer|aside)[\s\S]*?</\1>", " ", raw, flags=re.I)
    text = _strip_html(raw)
    return {"url": url, "title": title[:200], "text": text[:4500]}


def _strip_html(text):
    import re
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def fetch_headlines():
    """Pull recent items from each RSS/Atom feed. Tolerates individual
    feed failures — returns whatever could be fetched."""
    import xml.etree.ElementTree as ET
    items, errors = [], []
    for source, url in NEWS_FEEDS:
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "start-button-generator/1.0 (local topic scout)",
                "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
            })
            with urllib.request.urlopen(req, timeout=12) as resp:
                root = ET.fromstring(resp.read())
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            entries = root.findall(".//item") or root.findall(".//atom:entry", ns)
            for e in entries[:HEADLINES_PER_FEED]:
                title = e.findtext("title") or e.findtext("atom:title", namespaces=ns) or ""
                link = e.findtext("link") or ""
                if not link:
                    link_el = e.find("atom:link", ns)
                    if link_el is not None:
                        link = link_el.get("href", "")
                desc = (e.findtext("description")
                        or e.findtext("atom:summary", namespaces=ns) or "")
                date = (e.findtext("pubDate")
                        or e.findtext("atom:updated", namespaces=ns) or "")
                if title.strip():
                    items.append({
                        "source": source,
                        "title": _strip_html(title)[:200],
                        "summary": _strip_html(desc)[:280],
                        "link": link.strip(),
                        "date": date.strip(),
                    })
        except Exception as e:  # noqa: BLE001 — keep scouting other feeds
            errors.append(f"{source}: {e}")
    return items, errors


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    # Quieter logs
    def log_message(self, fmt, *args):
        sys.stderr.write("[start-button] %s\n" % (fmt % args))

    def _send_json(self, status, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/status":
            self._send_json(200, {
                "ok": True,
                "token_in_env": bool(os.environ.get("GITHUB_TOKEN")),
            })
            return
        if self.path in ("/", ""):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        if self.path not in ("/api/generate", "/api/suggest", "/api/research"):
            self._send_json(404, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        # Research only touches news sites — no token needed.
        if self.path == "/api/research":
            self._handle_research(payload)
            return

        # Token resolution: env var first, then header from the local UI.
        token = os.environ.get("GITHUB_TOKEN", "").strip() \
            or self.headers.get("X-GitHub-Token", "").strip()

        if not token:
            self._send_json(401, {
                "error": ("No GitHub token. Set the GITHUB_TOKEN environment "
                          "variable before starting the server, or paste a "
                          "token into the token field in the app.")
            })
            return

        if self.path == "/api/suggest":
            self._handle_suggest(payload, token)
        else:
            self._handle_generate(payload, token)

    def _handle_research(self, payload):
        """Fetch the host's source links so the model can write from
        real article text rather than memory."""
        urls = payload.get("urls") or []
        urls = [u for u in urls if isinstance(u, str)
                and u.startswith(("http://", "https://"))][:8]
        pages, errors = [], []
        for u in urls:
            try:
                pages.append(fetch_page(u))
            except Exception as e:  # noqa: BLE001 — keep researching the rest
                errors.append(f"{u}: {e}")
        self._send_json(200, {"pages": pages, "errors": errors})

    def _call_model(self, token, model, messages, json_mode=True,
                    temperature=0.8, max_tokens=4096):
        """Call GitHub Models. Returns (content, None) or (None, (status, errobj))."""
        body = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        req = urllib.request.Request(
            GITHUB_MODELS_URL,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "start-button-generator/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                detail = e.read().decode("utf-8")
            except Exception:
                detail = ""
            hint = ""
            if e.code in (401, 403):
                hint = (" — your token was rejected. Make sure it's a valid, "
                        "non-revoked token. For fine-grained tokens, enable "
                        "the 'Models' (read) permission.")
            return None, (e.code, {
                "error": f"GitHub Models API error {e.code}{hint}",
                "detail": detail[:2000],
            })
        except urllib.error.URLError as e:
            return None, (502, {"error": f"Could not reach GitHub Models: {e.reason}"})

        try:
            return data["choices"][0]["message"]["content"], None
        except (KeyError, IndexError):
            return None, (502, {"error": "Unexpected response from GitHub Models",
                                "detail": json.dumps(data)[:2000]})

    def _handle_generate(self, payload, token):
        messages = payload.get("messages")
        if not isinstance(messages, list) or not messages:
            self._send_json(400, {"error": "Missing messages"})
            return
        content, err = self._call_model(
            token,
            payload.get("model") or "openai/gpt-4o",
            messages,
            json_mode=payload.get("json_mode", True),
            temperature=payload.get("temperature", 0.8),
            max_tokens=payload.get("max_tokens", 4096),
        )
        if err:
            self._send_json(err[0], err[1])
            return
        self._send_json(200, {"content": content})

    def _handle_suggest(self, payload, token):
        """Topic Scout: fetch fresh headlines, then ask the model to suggest
        show topics matching the user's brief."""
        brief = (payload.get("brief") or "").strip()
        headlines, feed_errors = fetch_headlines()

        if not headlines:
            self._send_json(502, {
                "error": ("Couldn't fetch any news feeds — check your internet "
                          "connection. " + ("Details: " + "; ".join(feed_errors[:3])
                                            if feed_errors else "")),
            })
            return

        headline_text = "\n".join(
            f"[{i}] ({h['source']}) {h['title']}"
            + (f" — {h['summary']}" if h["summary"] else "")
            for i, h in enumerate(headlines)
        )

        system = (
            "You are the story scout for a weekly three-topic panel discussion "
            "show about video games, hosted by lifelong gamers. Given fresh "
            "headlines from gaming news outlets and the host's direction, pick "
            "the stories that would make the best DISCUSSION topics — things a "
            "panel can debate, relate to, and riff on, not just announcements.\n\n"
            "Respond with ONLY a single valid JSON object, no markdown fences:\n"
            "{\n"
            '  "suggestions": [\n'
            "    {\n"
            '      "title": "punchy segment title, like an episode rundown heading",\n'
            '      "angle": "2-3 sentences: the discussion angle — what the panel should dig into and why audiences will care",\n'
            '      "why": "one sentence on why this fits the host\'s direction",\n'
            '      "headline_ids": [list of the [n] indices of headlines this draws on]\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Give 6-8 suggestions, ordered best-first. Prefer combining related "
            "headlines into one bigger conversation when it makes the topic "
            "stronger. Only use the headlines provided — do not invent news."
        )
        user = (
            ("Host's direction: " + brief if brief
             else "Host's direction: surprise me — pick the most discussable stories this week.")
            + "\n\nFresh headlines:\n" + headline_text
        )

        content, err = self._call_model(
            token,
            payload.get("model") or "openai/gpt-4o",
            [{"role": "system", "content": system},
             {"role": "user", "content": user}],
            temperature=0.7,
        )
        if err:
            self._send_json(err[0], err[1])
            return

        self._send_json(200, {
            "content": content,
            "headlines": headlines,
            "feed_errors": feed_errors,
        })


def main():
    token_set = bool(os.environ.get("GITHUB_TOKEN"))
    print()
    print("  ┌─────────────────────────────────────────────┐")
    print("  │   START BUTTON · Episode Generator          │")
    print("  └─────────────────────────────────────────────┘")
    print(f"   Serving at:  http://localhost:{PORT}")
    print(f"   Token:       {'found in GITHUB_TOKEN env var ✓' if token_set else 'NOT set — paste one in the app, or set GITHUB_TOKEN'}")
    print("   Stop with:   Ctrl+C")
    print()
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped.")
