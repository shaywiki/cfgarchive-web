# cfgarchive-web — Claude Code project memory

## What this project is
A permanent public archive of cfgfactory.com, preserved before shutdown on 13 March 2026.
Frontend SPA hosted on Cloudflare Pages, files served from Cloudflare R2.
GitHub: https://github.com/shaywiki/cfgarchive-web
Live: https://cfgarchive.net (main branch)
Dev preview: https://dev.cfgarchive-web.pages.dev (dev branch)

## Related repos (both cloned locally — always accessible)
- **cfgarchive-web** (public) — this repo. Frontend SPA only.
- **cfgarchive-private** (private) — `C:/Users/sam/Documents/Sam's Vault/02 - Active Projects/cfgarchive-private`
  - `admin.html` — admin SPA
  - `.github/TODO.md` — **live task tracker** (update this when tasks complete)
  - `CFGArchive Project Summary.md` — **full project context** (update "Last updated" + Outstanding Tasks each session)
  - Deploys to `admin.cfgarchive.net` via separate Cloudflare Pages project
  - Protected by Cloudflare Access (Zero Trust) — Google/GitHub SSO

## ⚠ End-of-session rule
At the end of every working session, update both:
1. `cfgarchive-private/.github/TODO.md` — tick completed tasks, add new ones
2. `cfgarchive-private/CFGArchive Project Summary.md` — update "Last updated" date + Outstanding Tasks table

Do this proactively without being asked. If tasks were completed, update immediately.

## Repo structure
- `index.html` — single-file SPA, all CSS and JS inline, no build step
- `README.md` — full project documentation
- `.github/ISSUE_TEMPLATE/report.md` — issue template for user reports
- `admin.html` and `.github/TODO.md` are gitignored — they live in cfgarchive-private

## Branch strategy
- `main` — production, never push directly, merge via PR only
- `dev` — active development branch
- Feature branches: `feat/real-data`, `feat/tag-system`, `feat/category-remap`, `feat/domain`

## Key constants in index.html (current — R2 is live)
```js
const R2   = 'https://files.cfgarchive.net';  // public blobs
const META = 'https://meta.cfgarchive.net';   // Worker proxy → private cfgmeta bucket
const GITHUB = 'https://github.com/shaywiki/cfgarchive-web';
```

## R2 blob URL patterns (use r2_folder/r2_file/image_count from index.json — never guess)
- Thumbnail:  `${R2}/cfgdownloads/${e.r2_folder}/${folderName}_image_0.jpg`
- Images:     `${R2}/cfgdownloads/${e.r2_folder}/${folderName}_image_${i}.jpg` (0..image_count-1)
- File:       `${R2}/cfgdownloads/${e.r2_folder}/${e.r2_file}`
- Index:      `${META}/index.json` (via Worker, not R2 directly)

## Folder naming convention (safe() function — JS must match Python exactly)
`safe(game_code).safe(category).safe(title).safe(author)/`
e.g. `cod4.configs.envize_phaz_2k12.phaz/`

safe() rule: lowercase, strip non-word chars, collapse whitespace/hyphens/underscores → single `_`, strip leading/trailing `_`, max 40 chars.

## Data architecture
- `index.json` — master scraped data in cfgmeta (private). Fields include r2_folder, r2_file, image_count.
- `categories-v2.json` — category overrides by entry ID
- `tags-v2.json` — curated tag overrides by entry ID
- `tag-freq.json` — tag frequency table for tag bar ordering
- Original `entry.tags` and `entry.category` always preserved (`_raw_category`)

## Design system
- Dark green gaming aesthetic
- Fonts: DM Sans + DM Mono (Google Fonts)
- Per-game accent colours via `body[data-game="X"]` CSS vars
- `html { zoom: 1.2 }` baseline — renders correctly at 100% browser zoom
- No framework, no build step, pure HTML/CSS/JS

## Azure infrastructure (scraper — decommissioning)
- VM: VM-SPOTINSTANCE-CFG-01, RG: RG-SPOTINSTANCE-CFG-01
- Storage: cfgfactoryarchive (Azure Blob)
- Scraper disk: cfgfactory-data (512GB, mount /opt/cfgfactory) — detached, preserved
- VM-UPLOAD-TEMP: Standard_D2s_v3 — DELETE THIS, still billing

## Outstanding tasks (see cfgarchive-private/.github/TODO.md for full list)
1. Run organisation.py + rebuild_index.py on VM → new index.json
2. Upload new index.json to cfgmeta
3. Sync cfggallery + cfgdemos to R2
4. Merge dev → main (go live)
5. Delete VM-UPLOAD-TEMP (billing!)
6. Download counter Worker (future)
