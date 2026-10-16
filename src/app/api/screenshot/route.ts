import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: Request) {
  try {
    const { url, fullPage = true } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();
    
    // Go to the URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Optional: wait for some fonts or animations
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage });

    await browser.close();

    // Return image as base64 or binary
    return new NextResponse(new Uint8Array(screenshot), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 's-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
