# News Globe

A 3D interactive globe that visualizes global news stories as markers on Earth's surface. Built as a Mica card class using Three.js for WebGL rendering.

## Overview

The RSS Globe card fetches news from major RSS feeds (BBC, CNN, Reuters, Al Jazeera, TechCrunch, The Guardian), maps each story to a geographic position, and renders them as colored markers on a rotating 3D globe. Click any marker to read the headline and source.

## Features

- **3D Globe** — Earth texture with auto-rotation and starfield background
- **Live RSS Feeds** — Fetches and parses 6 major news sources
- **Geo-Mapped Markers** — News stories positioned by region (country/city keyword matching)
- **Click Interaction** — Raycaster-based selection opens an overlay card with headline, source, date, and article link
- **Auto-Refresh** — Feeds refresh hourly

## Getting Started

1. Open the project in Mica
2. Create a new RSS Globe card from the toolbar
3. Click markers on the globe to read news stories

## Project Structure

```
newsglobe/
├── canvas/
│   ├── rss-globe.rss-globe      # Card instance (state file)
│   ├── agent.qwen                # AI agent config
│   └── newsglobe.gitrepo         # Git repo reference
├── .mica/
│   └── card-classes/             # Card class definitions
└── README.md                     # This file
```

## Tech Stack

- **Three.js 0.160.0** — 3D rendering (UMD via jsdelivr CDN)
- **Browser APIs** — DOMParser for XML, `mica.fetch` for CORS-proxied RSS requests
- **Mica Card Framework** — Canvas-based card lifecycle management
