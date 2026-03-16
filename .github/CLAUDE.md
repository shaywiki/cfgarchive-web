# cfgarchive-web — Claude Code project memory

## What this project is
A permanent public archive of cfgfactory.com, preserved before shutdown on 13 March 2026.
Frontend SPA hosted on Cloudflare Pages, files served from Cloudflare R2.
GitHub: https://github.com/shaywiki/cfgarchive-web
Live: https://cfgarchive-web.pages.dev (main branch)
Domain: cfgarchive.net (purchased, not yet wired)

## Repo structure
- `index.html` — single-file SPA, all CSS and JS inline, no build step
- `README.md` — full project documentation
- `.github/ISSUE_TEMPLATE/report.md` — issue template for user reports
- `admin.html` and `.github/TODO.md` are gitignored — they live in cfgarchive-private

## Related repos
- **cfgarchive-private** (private) — `https://github.com/shaywiki/cfgarchive-private`
  - `admin.html` — admin SPA (category review, tag editor, reports, image replace, stats)
  - `.github/TODO.md` — project task tracker
  - Deploys to `admin.cfgarchive.net` via separate Cloudflare Pages project
  - Protected by Cloudflare Access (Zero Trust) — Google/GitHub SSO

## Branch strategy (Option 3 — feature branches)
- `main` — production, never push directly, merge via PR only
- `dev` — active development branch
- `feat/real-data` — wire index.json from R2
- `feat/tag-system` — tag v2 + admin page
- `feat/category-remap` — after manual CSV review is done
- `feat/domain` — cfgarchive.net setup

## Key constants in index.html (swap when R2 is live)
```js
const R2     = 'https://pub-XXXX.r2.dev';        // R2 public bucket URL
const WORKER = 'https://cfg-archive.workers.dev'; // download counter Worker
const GITHUB = 'https://github.com/shaywiki/cfgarchive-web';
```

## R2 blob URL patterns
- Thumbnail: `${R2}/cfgdownloads/${game}/${cat}/${folder}/${id}.jpg`
- File:      `${R2}/cfgdownloads/${game}/${cat}/${folder}/${id}.cfg` (or .zip/.rar)
- Gallery:   `${R2}/cfggallery/${game}/gallery.${game}.${title}.${uploader}/${id}.jpg`
- Index:     `${R2}/cfgdownloads/index.json`
- Tags v2:   `${R2}/cfgdownloads/tags-v2.json`

## Folder naming convention (mirrors scraper output)
`safe(game_code).safe(category).safe(title).safe(author)/`
e.g. `cod4.configs.envize_phaz_2k12.phaz/`

## Design system
- Dark green gaming aesthetic
- Fonts: DM Sans + DM Mono (Google Fonts)
- Per-game accent colours via `body[data-game="X"]` CSS vars
- `html { zoom: 1.2 }` baseline — renders correctly at 100% browser zoom
- No framework, no build step, pure HTML/CSS/JS

## Data architecture
- `index.json` — original scraped data, NEVER modified after upload
- `tags-v2.json` — curated tag overrides, written by admin page
- `tag-freq.json` — tag frequency table for sorting tags by popularity
- Original `entry.tags` always preserved and shown as read-only "archived tags"

## Azure infrastructure (scraper, not needed for frontend)
- VM: VM-SPOTINSTANCE-CFG-01, RG: RG-SPOTINSTANCE-CFG-01
- Storage: cfgfactoryarchive (Azure Blob)
- Scraper disk: cfgfactory-data (512GB, mount /opt/cfgfactory)

## Outstanding tasks (see cfgarchive-private/.github/TODO.md for full list)
1. Complete category CSV manual review
2. Run tag frequency analysis on VM
3. Migrate Azure blobs to Cloudflare R2
4. Wire index.json into SPA
5. Set up Cloudflare Worker for download counter
6. Add cfgarchive.net custom domain
7. Deploy cfgarchive-private to admin.cfgarchive.net + Cloudflare Access rule
