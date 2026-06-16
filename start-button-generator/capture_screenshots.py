"""One-shot Playwright capture for README screenshots.

Run while `python server.py` is up on http://localhost:8787.
Outputs to ./screenshots/.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "screenshots"
OUT.mkdir(exist_ok=True)

URL = "http://localhost:8787"
SAMPLE = (Path(__file__).parent / "samples-episode-format.html").resolve().as_uri()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
        page = ctx.new_page()

        # 1. Empty producer console
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / "01-console-empty.png"), full_page=True)

        # 2. Filled producer console
        page.fill("#scoutBrief", "optimistic stories this week")
        page.fill("#theme", "This Is Our Year")
        page.fill("#icebreaker", "What's the game that made you fall in love with gaming?")
        page.fill("#t1", "007 First Light — can a new Bond game land?")
        page.fill("#t1n", "Look at the IO Interactive pedigree, what we know from the reveal, and whether the tone fits modern Bond.")
        page.fill("#t2", "GTA VI on the horizon")
        page.fill("#t2n", "Hype management, leaks vs. confirmed details, what Rockstar has shown vs. held back.")
        page.fill("#t3", "Navigating the sea of negative sentiment")
        page.fill("#t3n", "Why gamer discourse feels louder and angrier — and how creators are responding.")
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUT / "02-console-filled.png"), full_page=True)

        # 3. Sample episode rundown
        page.goto(SAMPLE, wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / "03-episode-rundown.png"), full_page=True)

        browser.close()

    for f in sorted(OUT.glob("*.png")):
        print(f"  {f.name}  ({f.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
