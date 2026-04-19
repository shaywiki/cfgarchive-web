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
const R2         = 'https://files.cfgarchive.net';    // public R2 — blobs
const META       = 'https://meta.cfgarchive.net';     // Worker proxy → private cfgmeta bucket
const DLC        = 'https://dl.cfgarchive.net';       // download counter Worker (Workers KV)
const GALLERY_R2 = 'https://gallery.cfgarchive.net';  // gallery screenshots
const DEMOS_R2   = 'https://demos.cfgarchive.net';    // demo files
const GITHUB     = 'https://github.com/shaywiki/cfgarchive-web';
```

`countDl(id)` — fire-and-forget `POST /count/:id` called via `onclick` on the download button. Does not block navigation. Counter is admin-only display; no count shown on the public site.

## Data loading
Fetches 9 files in parallel from `meta.cfgarchive.net` on load:

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
| `hidden.json` | Entry IDs hidden from public site — `{ id: true }` |

Lazy-fetched on demand:
- `demos-index.json` — on Demos tab click (COD4, COD2)
- `gallery-index.json` + `hidden-gallery.json` — on Gallery section open (fetched in parallel)

`tag-freq.json` is **not** fetched — tag bar counts are computed live from the current view.

## Service worker
`sw.js` at repo root. Registered before `loadData()`. Cache name `cfgarchive-v1` — bump to invalidate on deploy.
- Installs by pre-caching all 9 boot JSONs from `meta.cfgarchive.net`
- Cache-first strategy for all `meta.cfgarchive.net` requests (lazy-loaded files cached on first access)
- Old caches deleted on activate; `skipWaiting()` + `clients.claim()` for immediate take-over

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

**Archive entry image fallback:** `IMG_EXTS = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.gif', '.GIF']` — tried in order via `onerror`.

**Gallery tile / lightbox fallback:** `galImgErr` / `lbImgErr` — strips extension from src, tries `.jpg` then `.png` regardless of starting extension. Tracks tried extensions in `data-gft` attribute to avoid retrying.

## HTML escaping
All scraped data fields rendered via `innerHTML` must be escaped with `esc()` — defined in the helpers block alongside `safe` and `fmtN`:

```js
const esc = s => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
```

Apply to: `e.title`, `byline(e)`, `e.author`, `e.uploader`, `e.description`, `e.game_code`, `e._raw_category`, `e.file_size`, tag values (`t`) in both text and `onclick` attributes. Numeric/date/ID fields (`e.rating`, `e.votes`, `e.upload_date`, `e.id`) do not need escaping.

## Design system
- Dark gaming aesthetic, DM Sans + DM Mono fonts
- Per-game accent colours via `body[data-game="X"]` CSS custom properties
- No framework, no build step

## Gallery section
`gallery-index.json` lazy-fetched from cfgmeta on first Gallery section open. `curMode = 'gallery'` sentinel separates gallery render path from archive path.

- 5-column 16:9 tile grid, game filter pills (COD4 default), hover overlay (title + author)
- IntersectionObserver lazy loading, pagination 25/50/100 (default 50)
- Lightbox: full image, info bar (game pill + title + author + `★ rating · N votes` + download button), prev/next, ESC/←/→ keyboard nav
- Votes/rating read from gallery entry's own `rating`/`votes` fields (not from archive DATA — gallery IDs are numeric and don't match archive entry IDs)
- Image URL: `${GALLERY_R2}/{local_images[0]}`

## Demos section
`demos-index.json` lazy-fetched on first Demos sidebar click. Demos is a sidebar section under a "Media" heading (alongside Gallery) — **not** a category tab. `curMode = 'demos'` sentinel.

- **Toolbar**: game pills (All/COD4/COD2, default All) + separator + category pills (All/Clips/LAN/Match/PCW/Other) + optional reset button — populated into `#demos-pills-slot` div inside `#grid-toolbar`. Sort chips and page-size chips hidden in demos mode; Tiles/Cards toggle also hidden.
- **Table columns**: Title, Author, Game, Cat, Maps, Weapons, Size, DL — all 8 clickable to sort with ▴/▾ indicator. State: `demoSortCol` / `demoSortDir`. Independent of the global `sortBy`.
- **Row expand**: weapons pills, maps pills, stats (downloads/unique/rating/votes), upload date, download button. "CFGFactory stats" label and snapshot date not shown.
- **State vars**: `demosCurGame`, `demosCat`, `demoSortCol`, `demoSortDir`, `curDemoId`
- Download URL: `${DEMOS_R2}/cfgfactory/{cat}/{filename}`

## Context-aware search
`onSearch()` routes by `curMode` — archive Fuse, demo Fuse (`demoFuse`), or gallery Fuse (`galFuse`) depending on active view. `setSearchPlaceholder(mode)` clears the search input and sets the placeholder text ("Search demos…" / "Search screenshots…" / "Search configs…"). Called in `setGallery()`, `setDemos()`, `setGame()`, `setCat()`.

## Tile grid (all games)
All games support a 5-column 16:9 tile layout. A Tiles/Cards toggle chip in the grid toolbar switches between layouts; `cardStyle` state (`'tile'` | `'card'`) is persisted to `localStorage` as `cfgarchive_cardstyle` (default: `'tile'`).

- CSS: `.gal-tile.arc-tile` — image in `.gal-tile-img` (16:9), `.gal-tile-label` below with title/author/downloads/rating/ctag chips
- ctag chips call `openEntry(id)` directly — not `toggleTag()` — so Back button always restores the pre-entry browse state
- `cardStyle === 'tile'` gates the tile render path in `render()`

## Outstanding tasks
See `cfgarchive-private/.github/TODO.md` for the live task tracker.
