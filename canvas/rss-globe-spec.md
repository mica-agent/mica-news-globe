---
card-class:
  name: rss-globe
  badge: GLB
  default_title: RSS Globe
  handler: ~
  sidecar: ~
  dependencies:
    umd_scripts:
      - {url: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js", format: UMD, version: "0.160.0"}
    styles: []
  subtasks:
    - {name: "3D globe rendering with texture", tier: 1, mechanism: "card.js + Three.js UMD — sphere geometry with earth texture, auto-rotation", verify: "render_capture"}
    - {name: "RSS feed fetching and XML parsing", tier: 1, mechanism: "card.js + mica.fetch + DOMParser — fetch RSS feeds, parse XML to structured items", verify: "render_capture"}
    - {name: "News markers on globe", tier: 1, mechanism: "card.js + Three.js — small 3D marker objects positioned on sphere surface by lat/lng", verify: "render_capture"}
    - {name: "Click interaction and card popup", tier: 1, mechanism: "card.js + raycaster — detect marker clicks, show headline card overlay", verify: "render_capture"}
    - {name: "News location extraction", tier: 1, mechanism: "bespoke — keyword-based region mapping from feed titles/descriptions to approximate lat/lng", verify: "render_capture"}
    - {name: "Hourly feed refresh", tier: 1, mechanism: "card.js + setInterval with mica.files.write for state persistence", verify: "render_capture"}
  out_of_scope:
    - "LLM-based news summarization"
    - "User authentication or accounts"
    - "Offline caching / service worker"
    - "Video or rich media in news cards"
---

# RSS Globe

## Overview
A 3D rotating globe that displays news stories from multiple RSS feeds as markers on the Earth's surface. Each marker represents a news story, positioned by its geographic region. Clicking a marker opens a card overlay showing the headline and source. The globe rotates slowly on its own axis, giving a continuous world-view of global news activity.

## Architecture

### 3D Globe (Tier 1 — Three.js)
- Uses **Three.js 0.160.0** (UMD bundle from jsdelivr CDN)
- Earth sphere with texture mapping (equirectangular earth texture from Three.js examples repo, CORS-enabled via jsdelivr)
- Auto-rotation via `requestAnimationFrame` loop (~0.2°/s — subtle, cinematic)
- Fixed camera orbiting slightly to show different hemispheres over time
- Stars background via `THREE.Points` geometry

### RSS Feed Parsing (Tier 1 — Browser APIs)
- Fetches RSS feeds from major news sources using `mica.fetch` (server proxy for CORS)
- Parses XML using browser's native `DOMParser`
- Extracts: title, link, description, pubDate, source name
- Caches results in the card instance file via `mica.files.write`
- Refreshes hourly via `setInterval`

### News Location Mapping (Tier 1 — Bespoke)
- RSS feeds contain location hints in titles, descriptions, and categories
- Maps keywords to approximate lat/lng coordinates:
  - Country/region names → lat/lng from a built-in mapping table
  - City names → common coordinates (major cities)
  - Default: position near the source country's capital
- Location mapping table is a static array in card.js (~50 entries)

### Markers on Globe (Tier 1 — Three.js)
- Small 3D marker objects (icosahedron or cylinder) positioned on the sphere surface
- Marker color encodes news category (red=breaking, blue=tech, green=science, yellow=business)
- Markers glow/pulse to indicate recency
- Markers fade out after 24 hours

### Click Interaction (Tier 1 — Three.js + DOM)
- `THREE.Raycaster` detects clicks on marker objects
- On click: show an HTML overlay card with:
  - Headline (large, bold)
  - Source name + publication date
  - Short description/excerpt
  - "Open article" button linking to the source URL
  - "Close" button to dismiss
- Overlay is a positioned `<div>` on top of the Three.js canvas

### Data Flow
```
RSS Feeds → Fetch (mica.fetch) → DOMParser → Extract items → 
Keyword Match → lat/lng → Sphere Position → 3D Markers → 
Click (Raycaster) → Overlay Card
```

### RSS Feeds (Curated List)
- BBC World: `https://feeds.bbci.co.uk/news/rss.xml`
- CNN: `https://rss.cnn.com/rss/cnn_topstories.rss`
- Reuters: `https://feeds.reuters.com/reuters/worldNews`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`
- TechCrunch: `https://techcrunch.com/feed/`
- The Guardian: `https://feeds.theguardian.com/theguardian/world/rss`

### Earth Texture
- **Verified:** `https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg` (200, image/jpeg, 512KB, CORS `*`)
- 2K equirectangular projection from Three.js examples repo — CORS-friendly, stable CDN

### Dependencies Summary
| Subproblem | Kind | Decision | Reason |
|---|---|---|---|
| 3D rendering | library | Three.js 0.160.0 via `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js` (UMD, 200) | Industry-standard WebGL renderer; UMD bundle exposes `THREE` global; verified 200 |
| Globe texture | asset | NASA Blue Marble via Three.js examples (`cdn.jsdelivr.net/gh/mrdoob/three.js@r160/.../earth_atmos_2048.jpg`, 200, CORS `*`) | CORS-enabled, stable CDN mirror of Three.js repo |
| RSS feed fetching | service | Multiple RSS feed URLs (BBC, CNN, Reuters, etc.) | Public RSS feeds; proxied through Mica's `mica.fetch` for CORS |
| Location mapping | bespoke | ~50 entry keyword→lat/lng table | Simple mapping, no library needed |
| XML parsing | bespoke | Browser `DOMParser` | Built-in browser API, no dependency |
| Starfield | bespoke | ~500 random points on sphere | Simple `Points` geometry, ~20 lines |
| Auto-rotation | bespoke | `requestAnimationFrame` loop | Built-in browser API, ~10 lines |
