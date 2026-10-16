import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PRESETS_DIR = path.join(process.cwd(), 'public', 'presets');

function filePath(name: string) {
  const safe = name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  return path.join(PRESETS_DIR, `${safe}.json`);
}

// GET /api/presets/[name] — load a single preset
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  return NextResponse.json(data);
}

// PUT /api/presets/[name] — overwrite an existing preset (or create if missing)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const body = await req.json();
  const { settings, newName } = body;

  const targetName = (newName || name).replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  if (!targetName) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });

  // If renaming, delete old file
  const oldFp = filePath(name);
  if (newName && newName !== name && fs.existsSync(oldFp)) fs.unlinkSync(oldFp);

  const preset = { name: targetName, createdAt: new Date().toISOString(), settings };
  fs.writeFileSync(filePath(targetName), JSON.stringify(preset, null, 2), 'utf-8');

  return NextResponse.json({ success: true, name: targetName });
}

// DELETE /api/presets/[name]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  fs.unlinkSync(fp);
  return NextResponse.json({ success: true });
}
