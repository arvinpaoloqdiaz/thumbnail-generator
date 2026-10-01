# Thumbnail Studio 

A developer-first showcase generator for Websites and APIs.

## Features
- **Webpage Mode**: Capture full-length, high-quality screenshots of any live website. 
- **Bento Mode Layout**: Automatically split and arrange a long page screenshot into a beautiful, modern Bento grid.
- **Multiple Aspect Ratios**: Export for any platform with 16:9, 4:3, 1:1 (Square), and Portrait (9:16) presets.
- **API Endpoint Mode**: Showcase JSON responses in beautifully themed terminal windows (One Dark, Dracula, Nord, etc.).
- **Local Rendering**: Powered by Next.js and Playwright for reliable, secure, local screenshot capturing without external API dependencies or watermarks.

## Tech Stack
- **Next.js (React)** for the frontend UI.
- **Tailwind CSS** for styling and theming.
- **Playwright** via Next.js API Routes for taking headless browser screenshots.
- **HTML Canvas API** for compositing the final images with gradients, padding, and text overlays.

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
When you generate a full-page screenshot using the URL input, the Studio's Canvas engine will slice the long vertical image into multiple staggered "cards" or "bento boxes" inside the final frame, rather than just showing a single tiny column. This is completely dynamic based on your selected aspect ratio.
