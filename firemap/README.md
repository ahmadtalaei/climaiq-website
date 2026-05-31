# /firemap — Historical Fires Explorer

Interactive bbox-drag map showing California historical wildfire perimeters
with year, acres, ignition cause, and seasonality charts.

**Live at:** https://climaiq.tech/firemap

## What this is

A static demo version of the fires-explorer feature from the local
wildfire-intelligence-platform. The local version (at
`http://localhost:8006/fires-explorer`) calls live PostGIS via two API
endpoints; this static version filters a bundled JSON snapshot
client-side so it runs entirely on Vercel without a backend.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Self-contained HTML+CSS+JS page. Loads `data/fires.json` and runs entirely client-side. |
| `data/fires.json` | Snapshot of California historical fires with simplified geometry (94 KB). Generated 2026-05-31 from the local PostgreSQL `historical_fire_perimeters` table via `ST_SimplifyPreserveTopology(geometry, 0.002)`. |
| `README.md` | This file. |

## URL persistence

Drawing a bbox updates the URL to `?bbox=lon_min,lat_min,lon_max,lat_max`
(standard GIS convention — matches WMS/WFS, OSM, Mapbox).

Bookmarkable + shareable + refresh-safe. Examples:

- Camp Fire region (Paradise, CA):
  https://climaiq.tech/firemap?bbox=-121.7,39.5,-121.2,40.0
- Mt. Whitney area:
  https://climaiq.tech/firemap?bbox=-118.5,36.4,-118.1,36.7
- Lake Tahoe basin:
  https://climaiq.tech/firemap?bbox=-120.2,38.9,-119.9,39.2

Each URL auto-restores the bbox on page load via `parseURLBbox()` →
`map.fitBounds()` → `loadBbox()` (same code path as a fresh drag).

## What WORKS in the static demo

- Map + bbox drag (Leaflet + Leaflet.draw)
- Per-fire perimeter rendering, colored by decade
- Sortable fires table with FRAP cause labels (Lightning, Arson, etc.)
- Per-month + per-cause bar charts (Chart.js)
- Per-fire detail panel with all FRAP fields
- URL bookmarking / sharing / restore
- Full responsive layout (collapses to single column under 900px)

## What's INTENTIONALLY DISABLED in the static demo

- **Live weather panel.** The full platform calls NOAA NWS for current
  conditions at the bbox centroid. NWS doesn't allow browser CORS, so a
  browser-only deployment can't make that call. The panel shows a
  placeholder pointing to the platform link.

## Upgrading to live data (when ready)

The production pipeline lives in the wildfire-intelligence-platform
repo. Two paths to upgrade `/firemap` from demo to live:

### Path A — Vercel serverless functions (recommended for a quick win)

Add `/api/fires.py` and `/api/weather.py` as Vercel Python serverless
functions. The fires function would query a managed PostgreSQL (Supabase,
Neon, Railway, AWS RDS) with the `historical_fire_perimeters` schema
populated. The weather function would proxy NOAA NWS server-side (no CORS
issue). Then update the page's `fetch(`/firemap/data/fires.json`)` to
`fetch('/api/fires?...')` and re-enable the weather panel.

### Path B — Deploy the data-clearing-house service publicly

Run the `data-clearing-house` Docker container from
wildfire-intelligence-platform on Fly.io / Railway / Render / a VPS,
behind a public URL like `api.climaiq.tech`. Update CORS settings to
allow `climaiq.tech` origin. Update the page's fetch URLs to point at
the public API.

Path A is cheaper (Vercel free tier) and less infra to maintain.
Path B gives you the full platform contract (`/ingest/batch`, all 15+
endpoints) without rewriting anything.

## Regenerating `data/fires.json`

If the local PostGIS table has new fires you want surfaced in the demo:

```bash
docker exec wildfire-postgres psql -U wildfire_user -d wildfire_db -t -A -c "
SELECT json_build_object(
  'generated_at', now()::text,
  'source', 'CAL FIRE FRAP via wildfire-intelligence-platform local snapshot',
  'note', 'Static demo data; production deployment queries PostgreSQL live.',
  'count', count(*),
  'total_acres', sum(acres)::bigint,
  'fires', json_agg(json_build_object(
    'event_uuid', event_uuid::text,
    'name', name, 'year', year, 'acres', acres::float, 'cause', cause,
    'alarm_date', alarm_date::text, 'contained_date', contained_date::text,
    'unit_id', unit_id, 'agency', agency,
    'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(geometry, 0.002), 5)::json
  ))
) FROM historical_fire_perimeters WHERE acres > 0;
" > path/to/website/firemap/data/fires.json
```

Adjust `ST_SimplifyPreserveTopology` tolerance (currently 0.002° ≈ 200m)
to balance file size vs. perimeter detail. Lower = more accurate + larger
file; higher = coarser shapes + smaller file.

## Deployment

This is a static Vercel site. Push to the repo:

```bash
git add map/ vercel.json
git commit -m "feat(map): add /firemap historical fires explorer"
git push
```

Vercel auto-deploys. The `vercel.json` rewrite for `/firemap → /firemap/index.html`
makes `/firemap` work alongside the existing `/dashboard`, `/platform`, `/videos`
clean URLs.
