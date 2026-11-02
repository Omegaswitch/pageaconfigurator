# Graph Report - pageaconfigurator  (2026-11-02)

## Corpus Check
- 7 files · ~30,507 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .css 1, .liquid 1)

## Summary
- 45 nodes · 60 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c55cf63b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Pangea Mini IM configurator: Shopify setup
- build.py
- pangea-configurator.js
- rgb
- fmt
- alphas
- Configurator

## God Nodes (most connected - your core abstractions)
1. `Pangea Mini IM configurator: Shopify setup` - 11 edges
2. `rgb()` - 4 edges
3. `hex()` - 3 edges
4. `shade()` - 3 edges
5. `lum()` - 3 edges
6. `K()` - 3 edges
7. `alphas()` - 3 edges
8. `layout()` - 3 edges
9. `Configurator()` - 3 edges
10. `fmt()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `lum()` --calls--> `rgb()`  [EXTRACTED]
  assets/pangea-configurator.js → assets/pangea-configurator.js  _Bridges community 3 → community 2_

## Import Cycles
- None detected.

## Communities (8 total, 2 thin omitted)

### Community 0 - "Pangea Mini IM configurator: Shopify setup"
Cohesion: 0.17
Nodes (11): 1. Products, 2. Template, 3. Blocks (in the theme editor), Custom keycaps, Famous keycap sets (preview only), Known limits, Pangea Mini IM configurator: Shopify setup, Pre-rendered images (like the Constance configurator) (+3 more)

### Community 1 - "build.py"
Cohesion: 0.27
Nodes (4): kc(), sw(), vid(), build()

### Community 3 - "rgb"
Cohesion: 0.40
Nodes (6): fromHsl(), hex(), hsl(), rgb(), shade(), tone()

### Community 4 - "fmt"
Cohesion: 0.50
Nodes (4): fmt(), roundPath(), smoothPath(), toward()

### Community 5 - "alphas"
Cohesion: 1.00
Nodes (3): alphas(), K(), layout()

### Community 6 - "Configurator"
Cohesion: 0.67
Nodes (3): Configurator(), mountAll(), slug()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `rgb()` connect `rgb` to `pangea-configurator.js`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._