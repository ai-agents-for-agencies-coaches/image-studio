---
name: image-studio
description: Render high-quality static images (ad creatives, posters, social posts, OG images, blog headers) by writing modern HTML/CSS and screenshotting with headless Chromium. Use whenever the user asks for a Canva-style static graphic, ad image, social post, carousel slide, OG image, hero image, or marketing poster — anything that isn't AI-generated photography. Output rivals Canva because the browser renders the design with full CSS, Tailwind, Google Fonts, gradients, blend modes, SVG, and effects. Triggers: "create an ad image", "make a social post", "design a poster", "OG image", "hero image", "static creative", "carousel slide", "blog header image", "build a graphic".
---

# image-studio

Produce **high-quality static images** by writing modern HTML/CSS, then rendering with headless Chromium at 2x DPI. This is the Canva-replacement workflow.

## When to use this

- Meta/Facebook/Instagram ad creatives (1080x1080, 1080x1350, 1080x1920)
- Marketing posters, hero images, billboards
- Carousel slides (consistent template, varied text)
- OG / Twitter card images (1200x630)
- Blog headers, in-article graphics
- Anything where you'd reach for Canva

## When NOT to use this

- AI-generated photorealistic images → use `gpt-image-1` / DALL-E (see `meta-ad-creative-generator`)
- Diagrams, flowcharts, whiteboard sketches → use `excalidraw`
- Video → use `remotion-video-production` or `animation-studio`
- Quick text-only PNGs → PIL via `meta-ad-creative-generator` is fine

## Workflow

1. **Copy the closest template** from `templates/` into your project's output directory.
2. **Edit the HTML**: swap headline, subhead, CTA, brand colors, fonts, imagery. Rework the layout if needed — these are starting points, not constraints.
3. **Render** (run `npm install` in the skill directory once before first use):
   ```bash
   node ~/.claude/skills/image-studio/render.js \
     --input design.html \
     --output out.png \
     --width 1080 --height 1080 --scale 2
   ```
   Adjust the path to wherever this skill is installed.
4. **Review the PNG**. Iterate on the HTML — CSS lets you do *anything*.

## Reverse-template workflow (primary use case)

When the user shares a winning ad image and asks to "match this", "build a template from this", or "make ads like this", treat it as **template extraction**, not literal reproduction. The deliverable is a reusable HTML template with swappable variables — not a one-off clone.

Steps:

1. **Fetch the source image** with `fetch()` in `ctx_execute` (javascript) — save to `/tmp/`.
2. **Read** the saved file to see it visually.
3. **Sample exact colors** with PIL: pick clean pixel locations (avoid text overlaps) and read RGB → hex.
   ```python
   from PIL import Image
   im = Image.open('/tmp/ref.jpg').convert('RGB')
   p = im.getpixel((x, y))
   print('#%02X%02X%02X' % p)
   ```
4. **Detect structural seams** by scanning columns for color transitions (e.g., where a yellow band starts, where a navy tab sits) — gives precise CSS positions.
5. **Crop the photo portion** out of the source (everything above the design overlay) and save it so the template can use it as a CSS background.
6. **Write the template** at `templates/ad-<vertical>-<hook-type>.html`. Document variables in a top comment.
7. **Render and compare** the template output against the original to validate the match.
8. **Save the template** — that's the deliverable. Future ads use the same template with new photos, headlines, prices, cities.

What to extract as variables:
- Photo / hero image
- Headline text (inside the tab, banner, or hero block)
- Subhead lines
- Price / offer / focal number
- City / location string (if present)
- Brand mark / logo (if present)

Keep brand-color values in `:root` CSS vars so palette swaps are one-line edits.

## Design quality rules

This skill is wasted if the output looks generic. Apply these every time:

- **Real typography**: Google Fonts (Inter, Manrope, Plus Jakarta Sans, Space Grotesk, Fraunces, DM Serif Display). Mix one display font + one body font. Never default to system fonts.
- **Layered backgrounds**: gradients + grain + subtle radial highlights, not flat color blocks. Use `mix-blend-mode`, SVG noise filters, or layered radial-gradients.
- **Hierarchy**: one dominant element (headline OR image), supporting elements smaller and quieter. No three things competing for attention.
- **Negative space**: don't fill every pixel. 15-25% padding from edges is the floor.
- **Color**: 1 brand color + 1 accent + neutrals. Stop using pure black (#000) — use `#0a0a0a` or near-black warm/cool tones.
- **Texture / depth**: drop-shadows with realistic offsets, frosted glass (`backdrop-filter: blur()`), subtle borders (`rgba(255,255,255,0.1)`).
- **Real images**: if photography is needed, place actual `<img>` tags (local file paths or `https://images.unsplash.com/...?w=...&q=80`) — don't render placeholder boxes.

## Renderer flags

| Flag | Default | Purpose |
|------|---------|---------|
| `--input` | required | Path to HTML file |
| `--output` | required | Output PNG/JPEG path |
| `--width` | 1080 | Viewport width in CSS px |
| `--height` | 1080 | Viewport height in CSS px |
| `--scale` | 2 | Device pixel ratio (2 = retina, 3 = ultra) |
| `--full-page` | false | Capture full scroll height (for long content) |
| `--selector` | none | Capture only the element matching this CSS selector |
| `--format` | png | `png` or `jpeg` |
| `--quality` | 100 | JPEG quality (1-100) |

## Common dimensions

| Format | W x H | Scale |
|--------|-------|-------|
| FB/IG square ad | 1080x1080 | 2 |
| FB/IG portrait ad | 1080x1350 | 2 |
| FB/IG story/reel | 1080x1920 | 2 |
| OG / Twitter card | 1200x630 | 2 |
| LinkedIn post | 1200x1200 | 2 |
| YouTube thumbnail | 1280x720 | 2 |
| Email hero | 1200x600 | 2 |
| Print poster (small) | 2480x3508 | 1 (A4 @300dpi) |

## Templates

See `templates/` for starter HTML files. Each is annotated with editable variables and intentional design choices. Don't treat them as fixed — they're scaffolds.

- `ad-square-1080.html` — bold headline + CTA, gradient backdrop
- `ad-portrait-1080x1350.html` — image-led ad with overlay copy
- `story-1080x1920.html` — vertical, full-bleed, story-format
- `og-1200x630.html` — clean OG card with brand mark
- `poster-hero.html` — magazine-style hero / poster

## Examples

See `examples/` for fully-rendered references (HTML + PNG output). Study these before designing — they show the quality bar.

## Tips

- Use `font-display: swap;` in `@font-face` declarations to avoid invisible text during render.
- For frosted glass: `backdrop-filter: blur(20px); background: rgba(255,255,255,0.08);` over a complex background.
- For SVG noise: include an inline `<svg>` with `<feTurbulence baseFrequency="0.9"/>` filter, set `opacity: 0.08; mix-blend-mode: overlay;` on a positioned overlay div.
- For real product photos: download to a local path first, then reference. Avoid hotlinking — sometimes blocks at render time.
- When rendering carousels, write one base template and loop through slide variants in a small shell or node script that calls the renderer N times.
