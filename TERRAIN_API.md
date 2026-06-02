# Terrain API on climaiq.tech

## What it is

`POST https://climaiq.tech/api/terrain/sample` proxies to the wildfire
platform's `/ingest/batch` endpoint via a Cloudflare Tunnel. The Vercel rewrite
lives in `vercel.json`; the backend lives on the operator's machine at
`localhost:8003` exposed via `cloudflared tunnel`.

This is **Path A** from the terrain pipeline plan
(`docs/terrain/TERRAIN_PIPELINE_WALKTHROUGH.md`).

## Request shape

The Vercel rewrite forwards the request body to `/ingest/batch` unchanged.
Send a full `BatchConfig`:

```bash
curl -X POST https://climaiq.tech/api/terrain/sample \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "terrain_usgs_3dep",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "spatial_bounds": {
      "center_lat": 40.4881,
      "center_lon": -121.5050,
      "layers": ["elevation"]
    }
  }'
```

Response:

```json
{
  "request_id": "batch_001",
  "status": "completed",
  "records_processed": 1,
  "data_quality_score": 1.0,
  "processing_time_seconds": 0.0
}
```

The records themselves flow through Kafka topic `wildfire-terrain` — the HTTP
response only carries metadata. Future Path A iterations can switch to a
dedicated read-only API (`services/terrain-api/`) that returns records inline
without the Kafka publish hop.

## Today's tunnel: EPHEMERAL TryCloudflare

The current `vercel.json` destination is a TryCloudflare URL
(`https://*.trycloudflare.com`) that **rotates each time** the operator
restarts `cloudflared tunnel --url http://localhost:8003`. After every
restart:

1. Note the new `*.trycloudflare.com` URL from the cloudflared output.
2. Update `vercel.json`'s rewrite destination.
3. Push to climaiq.tech repo (Vercel auto-deploys).

To start the tunnel:

```powershell
cd C:\dev\wildfire
.\scripts\start-terrain-tunnel.ps1 -Ephemeral
```

## Upgrading to a persistent tunnel at api.climaiq.tech

Once the rewrite + UI integration are validated against the ephemeral URL,
upgrade to a named tunnel that survives restarts:

1. Browser-auth Cloudflare:
   ```powershell
   cloudflared tunnel login
   ```
2. Run the persistent mode of the launcher:
   ```powershell
   .\scripts\start-terrain-tunnel.ps1 -Persistent
   ```
   This creates the `wildfire-terrain` named tunnel + attempts to add a DNS
   CNAME for `api.climaiq.tech`. Because climaiq.tech is on **Vercel DNS**
   (not Cloudflare DNS), step 3 will print a CNAME target you add manually in
   Vercel.
3. In Vercel dashboard → climaiq.tech → DNS, add:
   ```
   Type:  CNAME
   Name:  api
   Value: <TUNNEL_ID>.cfargotunnel.com
   ```
   (`cloudflared tunnel list` shows the tunnel ID.)
4. Update `vercel.json`:
   ```json
   { "source": "/api/terrain/sample",
     "destination": "https://api.climaiq.tech/ingest/batch" }
   ```
5. Push to deploy. From here on, the rewrite destination is stable and the
   operator only needs to keep `cloudflared tunnel run wildfire-terrain`
   alive on their machine — no Vercel changes needed.

## Operator preconditions

`POST /api/terrain/sample` returns useful data only when:

- Docker Desktop is running on the operator's machine
- `wildfire-data-ingestion` container is healthy
  (`curl http://localhost:8003/health` returns `terrain: true`)
- `wildfire-minio` has the elevation tiles
  (`docker volume inspect wildfire_minio_data` → non-empty)
- `cloudflared` tunnel is running

If the operator's machine is offline, the public endpoint returns a Cloudflare
521 error. Phase B (deploy backend to Render / Fly / a VM) removes this
dependency; tracked in
`docs/terrain/TERRAIN_PIPELINE_WALKTHROUGH.md` Path B.

## Sanity check after each restart

```powershell
# Local backend
curl http://localhost:8003/health

# Tunnel
curl https://<your-trycloudflare-url>.trycloudflare.com/health

# Through Vercel (after deploy)
curl https://climaiq.tech/api/terrain/sample -X POST `
  -H "Content-Type: application/json" `
  -d '{"source_id":"terrain_usgs_3dep","start_date":"2026-01-01","end_date":"2026-12-31","spatial_bounds":{"center_lat":40.4881,"center_lon":-121.5050,"layers":["elevation"]}}'
```

All three should return HTTP 200 with the same JSON shape.
