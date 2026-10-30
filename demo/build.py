"""Builds demo/index.html: the real configurator CSS + JS with example products and a mock cart."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
css = (ROOT / "assets/pangea-configurator.css").read_text(encoding="utf-8")
presets_js = (ROOT / "assets/pangea-keycap-presets.js").read_text(encoding="utf-8")
js = (ROOT / "assets/pangea-configurator.js").read_text(encoding="utf-8")

_id = [880000]
def vid():
    _id[0] += 1
    return _id[0]

cases = [("Translucent", "#e6e9ec"), ("Smokey", "#2a2b2f"), ("Nerve", "#c6d61b"), ("Orange", "#f07c10"),
         ("Pink", "#ef93b8"), ("Atomic Purple", "#4b26c9"), ("Teal", "#0fa3a3")]
frames = [("Silver Anodized", "#c4c6c9"), ("Black Anodized", "#2e2f32"), ("White Coated", "#ecebe6")]
kit_variants = [{"id": vid(), "title": n + " / " + f, "options": [n, f], "price": 24900, "available": True}
                for n, _ in cases for f, _ in frames]

def sw(name, t, note, housing, stem, price, premade):
    return {"type": "switch", "name": name, "switch_type": t, "note": note, "housing": housing, "stem": stem,
            "premade": premade, "variant": {"id": vid(), "price": price, "available": True}}

# switches: Delta Keyco's MX-compatible in-stock range; cheapest per category are the quick picks.
# Delta sells packs of 10, so a set of 70 costs 7 packs.
delta = json.load(open(ROOT / "demo/data/delta-switches.json"))
order = {"linear": 0, "tactile": 1, "silent": 2, "silent-tactile": 3, "clicky": 4}
delta.sort(key=lambda d: (not d["premade"], order.get(d["type"], 9), d["price10"]))
switches = [sw(d["name"], d["type"], "", d["housing"], d["stem"], round(d["price10"] * 7 * 100), d["premade"]) for d in delta]

def kc(name, base):
    # KAP Vella: one colour per set, white legends
    return {"type": "keycap", "name": name, "custom": False, "alpha": base, "mod": base, "accent": base, "legend": "#f6f6f1",
            "variants": [{"id": vid(), "title": "ANSI", "price": 3900, "available": True},
                         {"id": vid(), "title": "ISO FR", "price": 3900, "available": True}], "img": {}}

keycaps = [kc("Rally Red", "#a8262a"), kc("Harbor Blue", "#226a88"),
           kc("Phantom Black", "#2b2b2b"), kc("Clover Green", "#1d5e39"),
           {"type": "keycap", "name": "Custom", "custom": True, "alpha": "#dcdcd6", "mod": "#cfcfc8", "accent": "#cfcfc8", "variants": [], "img": {}}]

config = {
    "title": "Pangea Mini IM", "kitLabel": "Pangea Mini IM",
    "switchNote": "Switches come as a set of 70, lubed and installed.",
    "currency": "EUR", "locale": "en-IE", "root": "/", "syncUrl": False, "demo": True, "showPresets": True, "grain": 35,
    "shareBase": "https://your-store.com/products/pangea-mini-im",
    "customKeycapImage": None,
    "kit": {"title": "Pangea Mini IM", "variants": kit_variants},
    "assembly": {"id": vid(), "title": "Assembly", "price": 4500, "available": True},
    "blocks": [{"type": "stock_kit", "preset": pid, "variant": {"id": vid(), "price": pr, "available": True}} for pid, pr in [("gmk-wob3", 15900), ("gmk-dolch", 16900), ("swg-prepress", 11900), ("swg-beige", 10900)]] + [{"type": "case_color", "name": n, "hex": h, "translucent": True, "img": {}} for n, h in cases]
              + [{"type": "frame", "name": n, "hex": h} for n, h in frames] + switches + keycaps,
}

# id -> product title, so the mock cart can show readable lines
names = {v["id"]: "Pangea Mini IM, " + v["title"] for v in kit_variants}
names.update({s["variant"]["id"]: s["name"] + " x70" for s in switches})
for k in keycaps:
    for v in k["variants"]:
        names[v["id"]] = "KAP Vella " + k["name"] + ", " + v["title"]
names[config["assembly"]["id"]] = "Assembly"
prices = {v["id"]: v["price"] for v in kit_variants}
prices.update({s["variant"]["id"]: s["variant"]["price"] for s in switches})
for k in keycaps:
    prices.update({v["id"]: v["price"] for v in k["variants"]})
prices[config["assembly"]["id"]] = 4500

# optional: python3 demo/build.py RENDER_DIR [OUT] embeds layer renders (body-front-teal.webp, ...) into the page
import sys, base64, mimetypes
out = ROOT / "demo/index.html"
if len(sys.argv) > 1:
    files = {}
    for f in sorted(pathlib.Path(sys.argv[1]).iterdir()):
        if f.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg"):
            files[f.stem] = "data:" + mimetypes.guess_type(f.name)[0] + ";base64," + base64.b64encode(f.read_bytes()).decode()
    config["renders"] = {"files": files}
    if len(sys.argv) > 2:
        out = pathlib.Path(sys.argv[2])

html = (ROOT / "demo/template.html").read_text(encoding="utf-8")
html = (html.replace("/*__CSS__*/", css)
            .replace("/*__JS__*/", presets_js + "\n" + js)
            .replace("__CONFIG__", json.dumps(config, ensure_ascii=False).replace("</", "<\\/"))
            .replace("__NAMES__", json.dumps({str(k): v for k, v in names.items()}, ensure_ascii=False))
            .replace("__PRICES__", json.dumps({str(k): v for k, v in prices.items()})))
out.write_text(html, encoding="utf-8")
print("wrote", out, len(html), "bytes")
