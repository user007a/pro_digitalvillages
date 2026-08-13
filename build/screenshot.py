# -*- coding: utf-8 -*-
"""Render every HTML prototype to a full-page PNG via Playwright (headless chromium)."""
import os, json
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = r"D:/dev/pro_digitalvillages"
OUT_DIR = os.path.join(ROOT, "build")
SHOT_DIR = os.path.join(OUT_DIR, "screenshots")
DATA = os.path.join(OUT_DIR, "data.json")
os.makedirs(SHOT_DIR, exist_ok=True)

VIEWPORT = {
    "admin": (1440, 960),
    "dashboard": (1920, 1080),
    "villager": (430, 932),
    "cadre": (430, 932),
    "shared": (1440, 960),
}
MAXW = {"admin": 1100, "dashboard": 1500, "villager": 470, "cadre": 470, "shared": 1100}

def shot_path(rel):
    name = rel.replace("html/", "").replace("/", "_").replace(".html", ".png")
    return os.path.join(SHOT_DIR, name)

def main():
    with open(DATA, encoding="utf-8") as fh:
        data = json.load(fh)
    items = sorted(data.keys())
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--disable-gpu"])
        contexts = {}
        for dev, (w, h) in VIEWPORT.items():
            contexts[dev] = browser.new_context(viewport={"width": w, "height": h},
                                                device_scale_factor=1)
        done = 0
        for rel in items:
            dev = data[rel]["device"]
            ctx = contexts[dev]
            page = ctx.new_page()
            url = "file://" + os.path.join(ROOT, rel).replace("\\", "/")
            try:
                page.goto(url, wait_until="networkidle", timeout=20000)
            except Exception:
                try:
                    page.goto(url, wait_until="load", timeout=20000)
                except Exception as e:
                    print("GOTO_FAIL", rel, e)
                    page.close(); continue
            page.wait_for_timeout(700)
            try:
                png = page.screenshot(full_page=True, path=None)
            except Exception as e:
                print("SHOT_FAIL", rel, e)
                page.close(); continue
            # resize
            tmp = os.path.join(SHOT_DIR, "_tmp.png")
            with open(tmp, "wb") as f:
                f.write(png)
            maxw = MAXW.get(dev, 1100)
            try:
                im = Image.open(tmp)
                if im.width > maxw:
                    nh = int(im.height * maxw / im.width)
                    im = im.resize((maxw, nh), Image.LANCZOS)
                im.save(shot_path(rel), optimize=True)
            except Exception as e:
                print("RESIZE_FAIL", rel, e)
            os.remove(tmp)
            page.close()
            done += 1
            if done % 20 == 0:
                print("SHOT_PROGRESS", done, "/", len(items))
        for c in contexts.values():
            c.close()
        browser.close()
    print("SHOT_DONE total=%d" % done)

if __name__ == "__main__":
    main()
