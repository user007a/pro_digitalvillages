# -*- coding: utf-8 -*-
"""
Extract structured info + full-page screenshots from all HTML prototypes.
Outputs:
  build/data.json            -> structured per-page data
  build/screenshots/<rel>.png -> one full-page screenshot per HTML file
"""
import os, re, json, glob
from bs4 import BeautifulSoup
from PIL import Image

ROOT = r"D:/dev/pro_digitalvillages"
HTML_DIR = os.path.join(ROOT, "html")
OUT_DIR = os.path.join(ROOT, "build")
SHOT_DIR = os.path.join(OUT_DIR, "screenshots")
os.makedirs(SHOT_DIR, exist_ok=True)

DEVICE_VIEWPORT = {
    "admin":     (1440, 960),
    "dashboard": (1920, 1080),
    "villager":  (414, 896),
    "cadre":     (414, 896),
    "shared":    (1440, 960),
}
SHOT_MAXW = {"admin": 1100, "dashboard": 1500, "villager": 460, "cadre": 460, "shared": 1100}

def device_of(rel):
    top = rel.split("/")[1] if rel.startswith("html/") else rel.split("/")[0]
    if "admin" in rel: return "admin"
    if "dashboard" in rel: return "dashboard"
    if "villager" in rel: return "villager"
    if "cadre" in rel: return "cadre"
    if "shared" in rel: return "shared"
    return "admin"

def find_label(el, soup):
    parent = el.parent
    for _ in range(6):
        if parent is None: break
        if parent.name == "label":
            t = parent.get_text(strip=True)
            if t: return t
        cls = parent.get("class") or []
        if any(("form-group" in c) or ("form-item" in c) for c in cls):
            lab = parent.find(["label"])
            if lab and lab.get_text(strip=True): return lab.get_text(strip=True)
            lab2 = parent.find(class_=re.compile("label"))
            if lab2 and lab2.get_text(strip=True): return lab2.get_text(strip=True)
        parent = parent.parent
    if el.get("id"):
        lab = soup.find("label", attrs={"for": el.get("id")})
        if lab and lab.get_text(strip=True): return lab.get_text(strip=True)
    for attr in ("aria-label", "title", "placeholder", "name"):
        v = el.get(attr)
        if v and str(v).strip(): return str(v).strip()
    return ""

def extract_fields(soup):
    fields = []
    seen = set()
    tags = soup.find_all(["input", "select", "textarea"])
    for el in tags:
        t = el.name
        if t == "input":
            itype = (el.get("type") or "text").lower()
            if itype in ("hidden", "submit", "button", "reset", "file", "checkbox", "radio"):
                continue
        label = find_label(el, soup)
        if not label:
            continue
        ftype = t
        if t == "input":
            ftype = (el.get("type") or "text").lower()
        opts = []
        if t == "select":
            for o in el.find_all("option"):
                txt = o.get_text(strip=True)
                if txt and txt not in ("请选择",):
                    opts.append(txt)
        placeholder = el.get("placeholder") or ""
        required = el.has_attr("required")
        readonly = el.has_attr("readonly") or el.has_attr("disabled")
        key = (label, ftype)
        if key in seen: 
            continue
        seen.add(key)
        fields.append({
            "label": label, "type": ftype, "placeholder": placeholder,
            "required": required, "readonly": readonly, "options": opts,
        })
    return fields

def extract_tables(soup):
    tables = []
    for tb in soup.find_all("table"):
        header = []
        first_row = tb.find("tr")
        if first_row:
            cells = first_row.find_all(["th", "td"])
            header = [c.get_text(strip=True) for c in cells]
        rows = len(tb.find_all("tr")) - (1 if header else 0)
        if header:
            tables.append({"header": header, "rows": max(rows, 0)})
    return tables

def extract_sections(soup):
    secs = []
    for el in soup.find_all(class_=re.compile("panel-title|nav-title|section-title|card-title|page-title|module-title|title")):
        t = el.get_text(strip=True)
        if t and t not in secs:
            secs.append(t)
    for el in soup.find_all(["h1", "h2", "h3"]):
        t = el.get_text(strip=True)
        if t and t not in secs:
            secs.append(t)
    return secs[:40]

def extract_buttons(soup):
    btns = []
    for el in soup.find_all(["button"]):
        t = el.get_text(strip=True)
        if t and t not in btns:
            btns.append(t)
    for el in soup.find_all(class_=re.compile("btn")):
        t = el.get_text(strip=True)
        if t and t not in btns:
            btns.append(t)
    return btns[:20]

def main():
    # 1) structured extraction (no browser needed)
    files = []
    for f in glob.glob(os.path.join(HTML_DIR, "**", "*.html"), recursive=True):
        rel = os.path.relpath(f, ROOT).replace("\\", "/")
        files.append(rel)
    data = {}
    for rel in sorted(files):
        with open(os.path.join(ROOT, rel), encoding="utf-8", errors="ignore") as fh:
            html = fh.read()
        soup = BeautifulSoup(html, "html.parser")
        title_tag = soup.title.get_text(strip=True) if soup.title else ""
        main_title = ""
        for sel in [".nav-title", ".page-title", "h1"]:
            node = soup.select_one(sel)
            if node:
                main_title = node.get_text(strip=True)
                break
        dev = device_of(rel)
        data[rel] = {
            "title_tag": title_tag,
            "main_title": main_title,
            "device": dev,
            "fields": extract_fields(soup),
            "tables": extract_tables(soup),
            "sections": extract_sections(soup),
            "buttons": extract_buttons(soup),
        }
    with open(os.path.join(OUT_DIR, "data.json"), "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
    print("STRUCTURED_OK files=%d" % len(data))

if __name__ == "__main__":
    main()
