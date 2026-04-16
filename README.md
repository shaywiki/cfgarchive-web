# cfg.archive

A permanent public archive of [cfgfactory.com](https://cfgfactory.com), preserved before its shutdown on **13 March 2026**.

CFGFactory hosted community-created content for Call of Duty 4, GTA IV, and other games — configs, weapon skins, custom models, maps, mods, cinema clips, and gallery images. At shutdown the site contained **13,804 entries** across 13 games, with approximately **94,791 files** across three content containers.

---

## Live site

**[cfgarchive.net](https://cfgarchive.net)**

---

## What's archived

| Container | Contents | Entries |
|---|---|---|
| `cfgdownloads` | Config files, weapon skins, maps, mods, custom models | 13,804 |
| `cfggallery` | Gallery images and screenshots | ~3,300 |
| `cfgdemos` | Demo files | 409 |

### Games covered

| Code | Game | Entries |
|---|---|---|
| COD4 | Call of Duty 4: Modern Warfare | 7,740 |
| GTA4 | Grand Theft Auto IV | 5,025 |
| COD2 | Call of Duty 2 | 345 |
| MW2 | Modern Warfare 2 | 239 |
| WAW | World at War | 195 |
| BO2 | Black Ops 2 | 82 |
| MW3 | Modern Warfare 3 | 62 |
| BF2 | Battlefield 2 | 42 |
| BO | Black Ops | 36 |
| CSS | Counter-Strike Source | 21 |
| CSGO | CS:GO | 10 |
| FS | Farming Simulator | 4 |
| CF | Crossfire | 3 |

---

## Repository structure

```
cfgarchive-web/
├── index.html          ← main SPA (single-file, no build step)
├── README.md
└── .github/
    ├── CLAUDE.md       ← Claude Code project context
    └── ISSUE_TEMPLATE/
        └── report.md   ← issue template for site reports
```

The site is a single self-contained HTML file with no dependencies, no framework, and no build step. It fetches `index.json` from Cloudflare R2 at runtime.

---

## Infrastructure

### Features

- Browse 13,804 entries across 13 games — filter by category, tag, sort, and search
- **Gallery** — 5-column screenshot grid with lightbox, sourced from `cfggallery` R2 bucket
- **Demos** — inline expandable demo list with weapon/map details, sourced from `cfgdemos` R2 bucket
- Download counter tracks per-entry downloads since archive launch (separate from CFGFactory stats)
- Mobile responsive — sidebar overlay, hamburger toggle, 2-column grid at ≤640px

### Storage — Cloudflare R2

All archive files are served from Cloudflare R2 with zero egress cost.

| Bucket | Domain | Purpose |
|---|---|---|
| `cfgdownloads` | `files.cfgarchive.net` | Download files + thumbnails, organised folder structure |
| `cfggallery` | `gallery.cfgarchive.net` | Gallery screenshots (~3,300 images) |
| `cfgdemos` | `demos.cfgarchive.net` | Demo files (409 demos) |

**Blob URL pattern** (uses `r2_folder` / `r2_file` / `image_count` from index.json):
```
https://files.cfgarchive.net/cfgdownloads/{r2_folder}/{folderName}_image_0.jpg  ← thumbnail
https://files.cfgarchive.net/cfgdownloads/{r2_folder}/{r2_file}                 ← download file
```

Metadata JSON files are served via a private Worker proxy at `meta.cfgarchive.net`.

### Frontend — Cloudflare Pages

Deployed via Cloudflare Pages connected to this repository.

- Every merge to `main` → auto-deploys to production
- No build step — Cloudflare serves `index.html` directly

### Download counter — Cloudflare Workers + KV

A Cloudflare Worker at `dl.cfgarchive.net` increments a per-entry counter in Workers KV on each download button click. Downloads link directly to R2 — a fire-and-forget POST records the count without adding any redirect latency. Archive download counts are displayed in the admin panel separately from the original CFGFactory stats.

---

## Data files

### `index.json`

Built from the scraped metadata and uploaded to R2. Contains all 13,804 entries. Never modified after upload — this is the permanent historical record.

```json
{
  "generated_at": "2026-03-13T...",
  "total": 13804,
  "entries": [
    {
      "id": "a1b2c3",
      "title": "envize phaz 2k12",
      "author": "phaz",
      "game_code": "COD4",
      "category": "Configs",
      "tags": ["promod", "aim", "sensitivity"],
      "downloads": 12400,
      "unique_downloads": 9800,
      "rating": 9.1,
      "votes": 342,
      "upload_date": "2012-03-14",
      "r2_folder": "cod4/configs/cod4.configs.envize_phaz_2k12.phaz",
      "r2_file": "phaz_2k12.cfg",
      "image_count": 2,
      "file_size": "18 KB"
    }
  ]
}
```

### Override JSONs

Stored in the private `cfgmeta` R2 bucket, served via `meta.cfgarchive.net`. Written by the admin panel. Original `index.json` fields are never modified — overrides sit on top by entry ID.

| File | Purpose |
|---|---|
| `categories-v2.json` | `{ "a1b2c3": "Movie Configs" }` |
| `tags-v2.json` | `{ "a1b2c3": ["promod", "competitive"] }` |
| `games-v2.json` | `{ "a1b2c3": "COD4" }` |
| `titles-v2.json` | `{ "a1b2c3": "Envize Phaz 2k12" }` |
| `authors-v2.json` | `{ "a1b2c3": "phaz" }` |
| `uploaders-v2.json` | `{ "a1b2c3": "phaz" }` |
| `image-count-overrides.json` | `{ "a1b2c3": 3 }` — when images added via admin |
| `stats-v2.json` | `{ "a1b2c3": { "rating": 7.8, "votes": 24, "downloads": 12400, "unique_downloads": 9800 } }` — re-scraped stats for all games |

---

## Reporting issues

Use the **Report an issue** button on any entry page, or [open an issue](https://github.com/shaywiki/cfgarchive-web/issues/new?template=report.md) directly.

---

## Stats from CFGFactory

Download counts, ratings, and vote totals were re-scraped from cfgfactory.com after the archive launched and stored in `stats-v2.json`. These override the values in `index.json` and reflect the live site numbers as of 21 March 2026. The site displays these labelled as "CFGFactory stats — snapshot 13 Mar 2026" alongside separate archive download counts tracked since launch.

---

## Acknowledgements

CFGFactory was a central hub for the COD4 and GTA modding community for over a decade. This archive exists to preserve that work permanently. All content belongs to its original creators.

---

## Licence

The archive frontend code in this repository is MIT licensed. The archived content (configs, images, models, etc.) belongs to its respective original authors.
