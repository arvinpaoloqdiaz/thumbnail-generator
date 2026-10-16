# Thumbnail Studio

A developer-first showcase generator for websites and APIs. Compose stunning promotional thumbnails using live webpage screenshots or API response mockups, with full control over layout, theming, and export settings — all locally, with no external APIs or watermarks.

## Features

### Modes
- **Web Mode**: Capture a full-page screenshot of any live URL (via Playwright + Chromium) or upload a local image, then arrange it in a Bento grid layout on your canvas.
- **API Mode**: Showcase an API endpoint as a styled terminal/code window with syntax-highlighted JSON, HTTP method, URL, and status badge (auto-colored green/red based on status code).

### Canvas & Layout
- **Bento Grid**: The screenshot is sliced into multiple staggered cards arranged in a rotatable grid. The center card always shows the top of the page; surrounding cards cycle through the remaining page slices.
- **Alignment**: Position the bento grid left, center, or right to create asymmetric compositions.
- **Bento Controls**: Scale, gap between cards, global rotation, X/Y offset, border radius, and edge vignette (black or white).
- **Card Aspect Ratio**: Independently control the aspect ratio of each bento card or API window (16:9, 4:3, 3:2, 1:1, 2:3, 9:16).

### Canvas Size Presets
| Preset | Resolution |
|---|---|
| 16:9 Landscape | 1920 × 1080 |
| OG Image (Social) | 1200 × 630 |
| 4:3 Standard | 1600 × 1200 |
| 1:1 Square | 1080 × 1080 |
| 9:16 Portrait | 1080 × 1920 |

### Theme & Background
- **Color Themes**: Green, Ocean, Sunset, White, Dark, Pink, or a fully custom hex color.
- **Background Patterns**: Dots, Grid, Crosshatch, Diagonal Lines, Hexagons, Waves, Triangles — with adjustable opacity and color.

### Subject Overlay
- Upload a secondary image (logo, product shot, device mockup, etc.) to layer on top of the canvas.
- **9-point position grid**: center, left, right, top, bottom, top-left, top-right, bottom-left, bottom-right.
- Fine-tune with scale, rotation (−180° to 180°), X/Y offset, opacity, and drop shadow toggle.

### Branding Watermark
- Optionally overlay a "crafted by Weddsite" watermark using preloaded Google Fonts (Inter + Great Vibes).
- Controls: color, opacity, 9-point position, scale, rotation, and X/Y offset.

### Presets System
- **Save / Load / Delete** named presets — all settings (mode, theme, layout, subject, branding, API data, etc.) are serialized to JSON files in `public/presets/`.
- `default.json` ships with the repository as a starting point and is always tracked by Git. User-created presets are git-ignored automatically.
- Presets are managed via a local REST API (`/api/presets`) using the filesystem — no database required.

### Export
- Download the canvas as **PNG**, **JPEG**, or **WebP**.

## Tech Stack
- **Next.js (App Router)** — frontend UI and API routes.
- **Tailwind CSS** — styling.
- **Playwright (Chromium)** — headless browser screenshot capture via `/api/screenshot`.
- **HTML Canvas API** — all compositing: backgrounds, patterns, bento grid, subject overlay, branding watermark.
- **Node.js `fs`** — preset persistence via the local filesystem (no database).

## Getting Started

1. **Install Dependencies**
```bash
npm install
npx playwright install chromium
```

2. **Run the Development Server**
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the studio.

## How the Bento Layout Works

When a webpage screenshot is loaded, the Canvas engine slices the tall vertical image into equal-height segments (controlled by the **View Height** slider). These slices are mapped onto a 5×5 staggered card grid:

- **Column 0, Row 0** (center card) always shows the **top of the page** (slice 0).
- All other cards cycle through the **remaining slices** in order.
- Odd-numbered columns are offset vertically by half a card height for the classic bento stagger.
- The entire grid can be **rotated**, **scaled**, **shifted**, and **aligned** left/center/right.

The result is a dynamic mosaic that fills any canvas aspect ratio with meaningful content from the source webpage.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── screenshot/route.ts   # Playwright screenshot endpoint
│   │   └── presets/route.ts      # CRUD endpoints for preset files
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ThumbnailStudio.tsx        # Main studio UI
└── lib/
    └── canvasUtils.ts             # Canvas drawing primitives (background, pattern, bento, API mockup)
public/
└── presets/
    └── default.json               # Default preset (tracked by Git)
```
