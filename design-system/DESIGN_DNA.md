# ClimaIQ Design DNA — extracted from the live explorer

Source of truth: the real product at `:8077/explorer` (Fuel Intelligence Engine)
and `:8077/explorer/utah` (Utah Coverage — AOI Selection), pulled 2026-10-16.
This seeds the from-scratch redesign of climaiq.tech so the public site speaks the
same visual language as the actual tool.

## The headline finding

The explorer and the current marketing site are two unrelated visual worlds:

| | Current climaiq.tech | The real explorer |
|---|---|---|
| Ground | near-black `#0a0a0f` | dark navy `#0a0e17` |
| Accent | fire-orange gradient `#ff6b35→#ffa726` | **teal/cyan** `#43b3a4` / `#5ec8f2` |
| Type | Inter, large, marketing | **system-ui + mono**, tiny, data-dense |
| Texture | particles.js, glows, counters | frosted-glass panels, status LEDs, tight grid |
| Feel | generic AI-SaaS pitch | scientific instrument / mission control |

**Recommendation:** build the new public site in the explorer's language, not the
marketing page's. It makes the tool ↔ site coherent (click "Open Explorer" and
nothing jars), and the instrument aesthetic is far more distinctive and credible
than fire-orange-on-black. This is essentially the "operational / instrument"
direction — except we're not inventing it, we're adopting the product's own skin.

## Tokens — canonical set (unifying the two explorer routes)

The two routes drifted apart (main uses teal `#43b3a4` + `--ground/--ink/--accent`;
Utah uses cyan `#5ec8f2` + `--bg/--tx/--acc`). The system must UNIFY. Proposed canon:

### Color
```
--ground:   #0a0e17   /* app background, darkest */
--panel:    #0f1524   /* raised surface */
--panel-2:  #0c1220   /* recessed surface */
--panel-3:  #16203a   /* hover / active surface */
--line:     #26314d   /* hairline borders */
--line-2:   #334155   /* stronger dividers */

--ink:      #e6edf7   /* primary text */
--ink-2:    #c7d2e8   /* secondary text */
--muted:    #7d8db0   /* labels, captions */
--faint:    #4a5878   /* disabled / ghost */

--accent:   #43b3a4   /* PRIMARY — teal (from main explorer) */
--accent-ink:#06201c  /* text on accent fills */
--data:     #5ec8f2   /* SECONDARY — cyan, for data highlights/selection (from Utah) */

--good:     #22c55e
--warn:     #eab308   /* Utah variant #e8b34b — pick one */
--bad:      #ef4444
--risk-ramp: linear-gradient(90deg,#ef4444,#eab308,#22c55e)  /* real ramp used in explorer */
```
Decision needed: teal `#43b3a4` as the single brand accent, with cyan `#5ec8f2`
reserved for data/selection — OR flip them. Teal-primary is my recommendation
(warmer, more ownable; cyan is more common).

### Glass / elevation (the explorer's signature texture)
```
--glass:     rgba(12,18,32,.86)
--glass-bd:  rgba(150,170,210,.16)
--glass-blur: saturate(1.15) blur(9px)
--sh-1: 0 4px 16px rgba(0,0,0,.45)
--sh-2: 0 20px 60px rgba(0,0,0,.6)
```

### Radii (tight — technical, NOT the marketing site's 8–32px)
```
--r1:6px  --r2:8px  --r3:10px  --r4:12px
```

### Type
```
--sans: ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif
--mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace
```
- **Mono is dominant** in the explorer (used ~10× more than sans) — all numbers,
  readouts, coordinates, metrics are tabular mono. Keep that: it is the instrument feel.
- Type scale is tiny & dense: 9–12px is the working range; 20–22px only for the
  rare title. For a *public* site we must scale this UP for marketing legibility
  (hero ~clamp(40–72px), body ~16px) while keeping mono numerals and the dense,
  precise feeling in data/stat components. This is the one place the site should
  deliberately diverge from the tool.

### Motion
```
--ease: cubic-bezier(.4,0,.2,1)
```

## Components the system needs (seed set)

From the explorer's real UI plus the public-site job:
1. **Nav bar** — glass, hairline border, mono wordmark
2. **Hero** — leads with the live explorer (embed or framed screenshot), not stat badges
3. **Stat / readout** — mono tabular number + muted label (the explorer's metric style)
4. **Status pill** — good/warn/bad LED dot + mono label
5. **Panel card** — glass surface, tight radius, deep shadow (platform/dashboard cards)
6. **Data table** — dense, mono, hairline rows
7. **Risk ramp / legend** — the red→amber→green gradient bar
8. **CTA button** — teal accent fill, accent-ink text
9. **Footer** — minimal, mono

## Decisions — RESOLVED 2026-10-16
- **Primary accent: teal `#43b3a4`.** Cyan `#5ec8f2` (`--data`) reserved for data
  highlights / selection only.
- **`--warn: #eab308`** (main-explorer value; `#e8b34b` retired).
- **Hero = high-res framed screenshot of the explorer that links through** to
  `/explorer` (and `/explorer/utah`). No live `<iframe>` — a public page must not
  depend on the local Docker/tunnel being up.
