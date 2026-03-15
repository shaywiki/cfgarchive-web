# cfg.archive

A permanent public archive of [cfgfactory.com](https://cfgfactory.com), preserved before its shutdown on **13 March 2026**.

CFGFactory hosted community-created content for Call of Duty 4, GTA IV, and other games — configs, weapon skins, custom models, maps, mods, cinema clips, and gallery images. At shutdown the site contained **13,804 entries** across 13 games, with approximately **94,791 files** across three content containers.

This repository contains the frontend for browsing and downloading the archive.

---

## Live site

| Environment | URL | Branch |
|---|---|---|
| Production | `https://cfgarchive.net` | `main` |
| Preview | `https://dev.cfgarchive-web.pages.dev` | `dev` |

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
├── todo.html           ← internal project tracker
├── README.md
└── .github/
    └── ISSUE_TEMPLATE/
        └── report.md   ← issue template for site reports
```

The site is a single self-contained HTML file with no dependencies, no framework, and no build step. It fetches `index.json` from Cloudflare R2 at runtime.

---

## Infrastructure

### Storage — Cloudflare R2

All archive files are served from Cloudflare R2 with zero egress cost.

| Bucket | Purpose |
|---|---|
| `cfgdownloads` | Download files + thumbnails, organised folder structure |
| `cfggallery` | Gallery images |
| `cfgdemos` | Demo files |

**Blob URL pattern:**
```
https://<r2-public-domain>/cfgdownloads/<game>/<category>/<folder>/<id>.jpg   ← thumbnail
https://<r2-public-domain>/cfgdownloads/<game>/<category>/<folder>/<id>.cfg   ← file
```

**Folder naming convention** (mirrors scraper output):
```
<game_code>.<category>.<title>.<author>/
  e.g. cod4.configs.envize_phaz_2k12.phaz/
```

### Frontend — Cloudflare Pages

Deployed via Cloudflare Pages connected to this repository.

- Every push to `dev` → auto-deploys to preview URL (~20 seconds)
- Every merge to `main` → auto-deploys to production
- No build step — Cloudflare serves `index.html` directly

### Download counter — Cloudflare Workers + KV

File downloads are routed through a Cloudflare Worker which increments a per-entry counter in Workers KV and 302-redirects to the R2 blob. This allows tracking of archive downloads separately from the original CFGFactory stats, which are preserved as a snapshot in `index.json`.

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
      "category": "Game configs",
      "tags": ["promod", "aim", "sensitivity"],
      "downloads": 12400,
      "unique_downloads": 9800,
      "rating": 9.1,
      "votes": 342,
      "upload_date": "2012-03-14",
      "has_file": true,
      "has_image": true,
      "local_images": ["images/a1b2c3_0.jpg"],
      "file_size": "18 KB"
    }
  ]
}
```

### `tags-v2.json`

Curated tag overrides, stored in R2. Written by the admin page. The original `tags` field in `index.json` is never modified — `tags-v2.json` sits on top and takes precedence where an entry ID is present.

```json
{
  "a1b2c3": ["promod", "competitive", "assault-rifle"],
  "d4e5f6": ["promod", "smg"]
}
```

### `tag-freq.json`

Tag frequency table built at index generation time. Used by the SPA to sort tags by popularity (most common first).

```json
{
  "promod": 1840,
  "cod4": 3200,
  "ak-47": 420
}
```

---

## Scraping

The archive was scraped in March 2026 using two Python scripts, now in the separate [`cfgfactory-scraper`](https://github.com/YOUR_USERNAME/cfgfactory-scraper) repository.

| Script | Purpose |
|---|---|
| `cfgfactory_scraper.py` | Downloads scraper — all 13 games, 6 phases |
| `gallery_scraper.py` | Gallery scraper — images and metadata |

Scraper infrastructure ran on an Azure spot VM (`Standard_B2ats_v2`, ~$0.009/hr) with a 512GB persistent data disk. Data was migrated to Cloudflare R2 via `rclone`.

---

## Development

### Running locally

No build step needed — open `index.html` directly in a browser, or use a local server:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Note: the SPA fetches `index.json` from R2. For local development with real data, either point `R2` at the live bucket or serve a local copy of `index.json`.

### Contributing changes

```bash
git clone https://github.com/YOUR_USERNAME/cfgarchive-web
cd cfgarchive-web
git checkout -b dev

# Make changes
git add .
git commit -m "feat: description of change"
git push origin dev
# Preview deploys automatically to dev.cfgarchive-web.pages.dev
```

Open a pull request from `dev` → `main` to deploy to production. Direct pushes to `main` are blocked.

### Reporting issues

Use the **Report an issue** button on the site, or [open an issue](https://github.com/YOUR_USERNAME/cfgarchive-web/issues/new?template=report.md) directly. Issues are triaged, fixed on `dev`, and merged to `main`.

---

## Stats preserved from CFGFactory

All download counts, ratings, and vote totals in `index.json` are the exact values recorded on shutdown day (13 March 2026) and are never modified. The site displays these clearly labelled as "CFGFactory stats — snapshot 13 Mar 2026" alongside separate archive download counts tracked since the site launched.

---

## Acknowledgements

CFGFactory was a central hub for the COD4 and GTA modding community for over a decade. This archive exists to preserve that work permanently. All content belongs to its original creators.

---

## Licence

The archive frontend code in this repository is MIT licensed. The archived content (configs, images, models, etc.) belongs to its respective original authors.
