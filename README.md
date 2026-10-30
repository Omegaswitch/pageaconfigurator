# Pangea Mini IM configurator: Shopify setup

Three files go into your theme (Online Store → Themes → ⋯ → Edit code):

| File | Where |
|---|---|
| `sections/pangea-configurator.liquid` | Sections → Add a new section → paste |
| `assets/pangea-configurator.js` | Assets → Add a new asset |
| `assets/pangea-configurator.css` | Assets → Add a new asset |
| `assets/pangea-keycap-presets.js` | Assets → Add a new asset (famous-set previews) |

Works with any Online Store 2.0 theme (Dawn, Impact, etc.). No app needed. The section loads Bricolage Grotesque, Inter Tight (keycap legends) and Space Mono from Google Fonts; untick that in the section settings to use your theme fonts.

## 1. Products

| Product | Variants | Notes |
|---|---|---|
| **Pangea Mini IM** | Two options: **Body** (`Translucent`, `Smokey`, `Nerve`, `Orange`, `Pink`, `Atomic Purple`, `Teal`) × **Frame** (`Silver Anodized`, `Black Anodized`, `White Coated`) = 21 variants | The variant price is the kit price, so a frame can cost more. |
| **One product per switch** | One variant (set of 70) | Can stay hidden from collections. |
| **One product per keycap colorway** (Red, Blue, Black, Green) | `ANSI` and `ISO FR` | The configurator picks the variant that matches the chosen layout. |
| **Assembly & testing** (optional) | One | Added to every build automatically. |
| **Custom keycaps** (optional) | One | E.g. a fitting/service fee. Leave it out and custom keycaps show "Quoted after review". |

Keep the part products **Active** and on the **Online Store** sales channel, or Shopify refuses to add them to the cart. To keep them out of search and collections, simply don't put them in any collection (or use a "hidden" tag if your theme supports it).

## 2. Template

1. Online Store → Themes → Customize → product templates → **Create template** `configurator` (based on Default product).
2. Remove the theme's own "Product information" section from it and add **Pangea configurator**.
3. On the kit product, set Theme template → `configurator`.

Or put the section on a page (like aiglatsonstudio.com/pages/…) and pick the kit product in its settings.

## 3. Blocks (in the theme editor)

- **Case color** (shown as Body): name must match the kit's Body option exactly; pick the swatch color and leave "Translucent case" ticked for the IM shells.
- **Frame and weight**: name must match the kit's Frame option; pick its color.

Customers pick in order: Body, then Frame, then everything else unlocks.
- **Switch**: pick the product, choose type and housing/stem colors (shown on the plate before keycaps are picked). Tick **Show as a quick pick** for your 4 premade options; all others appear under **Custom**. The demo uses Delta Keyco's MX-compatible range, with the cheapest switch in each category as the quick pick (linear: Keygeek Y3X, tactile: Cherry MX2A Brown, silent linear: Gateron Milky Pink Pro, silent tactile: Gateron Milky Purple Pro), priced as 7 packs of 10.
- **Keycaps**: one block per colorway, plus one block with **This is the Custom option** ticked. The drawing uses KAP Vella-style legends (big alphas, icon + word modifiers, unit marks on wide keys). For Vella, set alpha, modifier and accent to the same color: Rally Red `#a8262a`, Harbor Blue `#226a88`, Phantom Black `#2b2b2b`, Clover Green `#1d5e39`, legends `#f6f6f1`.

## Preview: drawn or photos

By default the board is drawn live (SVG), traced from the Pangea Mini IM line drawings (WK frame only, no HHKB blockers). It builds up as the customer picks: line drawing, then the empty body, then frame and plate, switches, and keycaps last. Colors come from the blocks you set, and the drawing follows every layout choice (ANSI / ISO FR, 6.25U / 7U WK bottom row, split / full shift) exactly.

If you have renders, add them as transparent PNG/WebP layers of the same size: case front/back on each **Case color** block, keycap layers on each **Keycaps** block (one for ANSI, one for ISO FR). When a case photo is set, photos replace the drawing. The custom keycap placeholder image is set on the section.

## Custom keycaps

Picking **Custom** under Keycaps opens a list of your **in-stock kits** (no free-text box). Add one **In-stock keycap kit** block per kit you actually stock: the set ID from `pangea-keycap-presets.js` (so the board can draw it) plus its product, which is added to the cart. Sets not added as in-stock kits stay preview only and can't be ordered.

## Famous keycap sets (preview only)

"Preview with famous sets" under Keycaps lets customers see the board in 20 GMK sets and 13 SWG sets. Each preview uses its set's own legend style (GMK word or symbol modifiers, Cyrillic for Taiga and Varanye, kana for Ramune) and colours. Sets that come with an alt mods kit (GMK Varanye, SWG Ferrofluid, SWG Nightshift) show a Base mods / Alt mods toggle under the preview; they open on alt mods. Previews are never added to the cart; the customer's real keycap choice stays in the order. Turn it off with **Show 'Preview with famous sets'** in the section settings. The colour data lives in `pangea-keycap-presets.js`.

## Pre-rendered images (layered renders)

The drawing is the default. For photo-real renders, upload transparent images to Content → Files and paste the folder URL (ending in `/files/`) into **Render folder URL**. The preview stacks four layers on top of each other, bottom to top:

| # | Layer | File name | How many |
|---|---|---|---|
| 1 | Body (the Pangea plastic) | `body-front-{body}` | 7 |
| 2 | Frame and back weight | `frame-front-{frame}` | 3 |
| 3 | Switches in their positions | `switches-{layout}-{row}-{shift}-{switch}` | 8 per switch |
| 4 | Keycaps | `keycaps-{layout}-{row}-{shift}-{set}` | 8 per set |

Names are lowercase with hyphens, exactly like the option names: `body-front-teal.png`, `frame-front-silver-anodized.png`, `switches-ansi-625-split-keygeek-y3x.png`, `keycaps-iso-fr-7-full-rally-red.png`. Layout parts are `ansi` / `iso-fr`, `625` / `7`, `split` / `full` (8 combinations). The `{set}` can be a Vella colorway (`rally-red`), an in-stock custom kit or a famous-set preview by its set ID (`gmk-dolch`, alt mods: `gmk-varanye-alt`). For the Back view, add `body-back-{body}` and `frame-back-{frame}`.

What the customer sees: the body as soon as it's picked, then the frame on top, then the switches, then the keycaps. Switching one option only swaps that one layer (it loads first, then fades in over the old one, so nothing flickers).

Renders fill the preview box edge to edge, and the box takes the shape of your body render, so a floor baked into the body files becomes the background.

Missing files: if the body, frame or keycap render for a combination is missing, the whole preview falls back to the drawing for that combination, so a set you haven't rendered yet still shows correctly. A missing switch render is simply left out (the keycaps cover it anyway).

### Rendering them so they line up

The layers are stacked with plain alpha (no blend modes, no opacity, no filters), so they never come out brighter than the render. For that to look right:

- **One camera, one canvas.** Same camera position, height, focal length and output size (e.g. 2400 × 1440) for every file. Don't crop or trim them.
- **Transparent background.** Blender: Render Properties → Film → Transparent (and *Transparent Glass* for the translucent bodies). Save as PNG, RGBA. WebP works too (pick it in **Render file type**).
- **Same light and colour settings for all layers.** Same lights, exposure and view transform (AgX/Filmic/Standard) for every layer; don't adjust brightness per layer afterwards.
- **One layer per file.** Render each layer with only its own parts visible. Keep the lower layers in the scene so their light and shadows land on the layer you render (e.g. set them to Holdout or turn off their Camera ray visibility), but hide the layers above it entirely. Then a switches-only preview has no keycap shadows on it.
- **No background, floor or shadow catcher** in the layers. The preview window supplies the grey studio background.

### Grain

A fine film grain sits over the whole preview window (drawing and renders), so stacked renders read as one photo. It's grey noise centred on mid-grey in overlay mode, so it adds texture without changing the average brightness. Set the strength with **Preview grain** in the section settings (0 turns it off).

## What lands in the order

One click adds 3 or 4 linked lines in a single request:

- Kit line with: Case color, Switches, Keycaps, Layout, Bottom row, Right shift, Custom keycap notes, and a **Build link** that reopens the exact configuration.
- Switch, keycap and assembly lines with "Part of build: PM-XXXX", the same number as the kit line (hidden `_build` property too).

Every choice is in the page URL (`?body=…&frame=…&switch=…&keycaps=…&layout=…&row=…&shift=…`), so customers can share a build.

## Known limits

- Lines are independent in the cart: a customer could remove the switches line. To lock a build into one line at one price, add a Cart Transform function (Shopify Functions); the `_build` property is already there for it.
- Check that your PCB supports ISO and split right shift before offering them; on many 60% hot-swap PCBs these are fixed.

## Working on this repo

| Path | What it is |
|---|---|
| `sections/`, `assets/` | The Shopify theme files (copy these into the theme) |
| `demo/index.html` | Self-contained preview page (open it in a browser) |
| `demo/template.html`, `demo/build.py` | Demo page source; `python3 demo/build.py` inlines the assets and example data into `demo/index.html` |
| `demo/data/delta-switches.json` | Example switch list (Delta Keyco MX-compatible range, colours read from product photos) |
| `tools/build_presets.py` | Source for the famous keycap sets; `python3 tools/build_presets.py` regenerates `assets/pangea-keycap-presets.js` |

After changing anything in `assets/`, run `python3 demo/build.py` to refresh the demo.
