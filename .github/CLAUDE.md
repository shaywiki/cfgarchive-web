# cfgarchive-web — Claude Code project context

## What this project is
A permanent public archive of cfgfactory.com, preserved before shutdown on 13 March 2026.
Single-file SPA hosted on Cloudflare Pages. Files and metadata served from Cloudflare R2 via Worker proxy.

- **Live:** https://cfgarchive.net (main branch)
- **Dev preview:** https://dev.cfgarchive-web.pages.dev (dev branch)
- **GitHub:** https://github.com/shaywiki/cfgarchive-web

## Related repo
**cfgarchive-private** — `C:/Users/sam/Documents/Sam's Vault/02 - Active Projects/cfgarchive-private`
- Admin SPA (`index.html`) → `admin.cfgarchive.net`
- Live task tracker: `.github/TODO.md`
- Full architecture: `docs/architecture.md`

## Branch strategy
- `main` — production (`cfgarchive.net`), never push directly
- `dev` — active development, push freely, confirm with user before pushing

## Repo structure
```
index.html   ← entire site — all CSS and JS inline, no build step, no framework
README.md
.github/
  CLAUDE.md
  ISSUE_TEMPLATE/report.md
```

## Key constants
```js
const R2     = 'https://files.cfgarchive.net';  // public R2 — blobs
const META   = 'https://meta.cfgarchive.net';   // Worker proxy → private cfgmeta bucket
const GITHUB = 'https://github.com/shaywiki/cfgarchive-web';
```

## Data loading
Fetches 8 files in parallel from `meta.cfgarchive.net` on load:

| File | Purpose |
|---|---|
| `index.json` | All 13,804 entries (~14MB) — base data |
| `categories-v2.json` | Category overrides by entry ID |
| `tags-v2.json` | Tag overrides by entry ID |
| `games-v2.json` | Game code overrides by entry ID |
| `titles-v2.json` | Title overrides by entry ID |
| `authors-v2.json` | Author overrides by entry ID |
| `uploaders-v2.json` | Uploader overrides by entry ID |
| `stats-v2.json` | Re-scraped rating, votes, downloads, unique_downloads for all entries |

`tag-freq.json` is **not** fetched — tag bar counts are computed live from the current view.

Merge pattern: `override[e.id] ?? e.field` — original fields always preserved as `_raw_category`.

## R2 URL construction
Always use `r2_folder` / `r2_file` / `image_count` from index.json — never construct paths from title/author.

```js
const base  = `${R2}/cfgdownloads/${e.r2_folder}`;
const fn    = e.r2_folder.split('/').pop();
const thumb = `${base}/${fn}_image_0.jpg`;            // thumbnail
const imgs  = Array.from({length: e.image_count}, (_, i) => `${base}/${fn}_image_${i}.jpg`);
const dl    = `${base}/${e.r2_file}`;                 // download file
```

Image fallback chain: `.jpg → .JPG → .jpeg → .JPEG → .png → .PNG → .gif → .GIF` (IMG_EXTS array).

## Design system
- Dark gaming aesthetic, DM Sans + DM Mono fonts
- Per-game accent colours via `body[data-game="X"]` CSS custom properties
- `html { zoom: 1.2 }` baseline
- No framework, no build step

## Outstanding tasks
See `cfgarchive-private/.github/TODO.md` for the live task tracker.
