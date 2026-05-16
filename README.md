# image-studio

**Canva-quality static images for [Claude Code](https://claude.com/claude-code) — no Canva, no design tool, no AI image model.**

You describe the graphic; Claude writes modern HTML/CSS and renders it to a pixel-perfect PNG with headless Chromium. Full CSS, Tailwind, Google Fonts, gradients, blend modes, SVG, frosted glass — everything a browser can paint.

Built for ad creatives, social posts, carousels, OG images, posters, and blog headers.

---

## What it's best at: the reverse-template workflow

The killer use case isn't designing from a blank page — it's **cloning a winning ad into a reusable template.**

1. You share a screenshot or URL of an ad that's working.
2. Claude fetches it, samples the exact colors from the pixels, measures the layout, and extracts the photo region.
3. Claude writes a **parametric HTML template** with variables for the swappable parts — photo, headline, price, city, brand colors.
4. You get a template you can re-render forever with new inputs.

> "We can now share winning images and get templates out of them."

`templates/ad-roofing-financing.html` is a real example, reverse-engineered from a live roofing ad (yellow band + navy tab + big payment number). Swap five variables, render, ship.

---

## Install

### As a Claude Code skill (recommended)

Clone into your project's (or user-level) skills directory:

```bash
git clone https://github.com/ai-agents-for-agencies-coaches/image-studio.git \
  ~/.claude/skills/image-studio

cd ~/.claude/skills/image-studio
npm install          # installs Playwright + Chromium
```

Claude will auto-discover the skill via `SKILL.md`. Just ask: *"make me a 1080x1080 Facebook ad for…"* or *"build a template from this ad: <url>"*.

### Standalone CLI

```bash
git clone https://github.com/ai-agents-for-agencies-coaches/image-studio.git
cd image-studio
npm install
```

---

## Usage

```bash
node render.js \
  --input templates/aesthetic-editorial.html \
  --output out.png \
  --width 1080 --height 1080 --scale 2
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--input` | required | Path to the HTML file |
| `--output` | required | Output PNG/JPEG path |
| `--width` | 1080 | Viewport width (CSS px) |
| `--height` | 1080 | Viewport height (CSS px) |
| `--scale` | 2 | Device pixel ratio (2 = retina) |
| `--full-page` | false | Capture full scroll height |
| `--selector` | none | Capture only the element matching this CSS selector |
| `--format` | png | `png` or `jpeg` |
| `--quality` | 100 | JPEG quality (1–100) |

### Common dimensions

| Format | W × H | Scale |
|--------|-------|-------|
| FB/IG square ad | 1080×1080 | 2 |
| FB/IG portrait ad | 1080×1350 | 2 |
| FB/IG story / reel | 1080×1920 | 2 |
| OG / Twitter card | 1200×630 | 2 |
| LinkedIn post | 1200×1200 | 2 |
| YouTube thumbnail | 1280×720 | 2 |

---

## Templates

Starter HTML in `templates/` — scaffolds, not constraints. Edit freely.

**Format starters**
- `ad-square-1080.html` — bold headline + CTA
- `ad-portrait-1080x1350.html` — image-led ad with overlay copy
- `story-1080x1920.html` — vertical full-bleed story
- `og-1200x630.html` — clean OG / share card
- `poster-hero.html` — magazine-style hero

**Distinct aesthetic families** (so output never looks like one house style)
- `aesthetic-editorial.html` — cream + ink + rust, Fraunces serif
- `aesthetic-brutalist.html` — white/black/red, heavy borders, mono type
- `aesthetic-direct-response.html` — yellow/black retail flyer, sunburst
- `aesthetic-photo-luxury.html` — full-bleed photo, whisper serif
- `aesthetic-swiss.html` — grid, single accent, Inter

**Reverse-engineered example**
- `ad-roofing-financing.html` — real ad turned into a 5-variable template (ships with a bundled sample photo in `assets/`)

See `examples/` for rendered references — study these for the quality bar before designing.

---

## How it works

`render.js` launches headless Chromium via Playwright, loads your HTML from a `file://` URL, waits for `document.fonts.ready` (so web fonts never render blank), and screenshots at the requested resolution and DPI. That's it — the browser is the design engine.

## Requirements

- Node.js 18+
- ~300MB for the Chromium download (`npm install` handles it)

## License

MIT — see [LICENSE](LICENSE).
