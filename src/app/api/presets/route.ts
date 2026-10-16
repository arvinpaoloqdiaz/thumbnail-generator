import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PRESETS_DIR = path.join(process.cwd(), 'public', 'presets');

function ensureDir() {
  if (!fs.existsSync(PRESETS_DIR)) fs.mkdirSync(PRESETS_DIR, { recursive: true });
}

// GET /api/presets — list all preset names
export async function GET() {
  ensureDir();
  const files = fs.readdirSync(PRESETS_DIR).filter(f => f.endsWith('.json'));
  const presets = files.map(f => {
    try {
      const raw = fs.readFileSync(path.join(PRESETS_DIR, f), 'utf-8');
      const data = JSON.parse(raw);
      return { name: data.name || f.replace('.json', ''), file: f, createdAt: data.createdAt };
    } catch {
      return { name: f.replace('.json', ''), file: f, createdAt: null };
    }
  });
  return NextResponse.json(presets);
}

// POST /api/presets — save a new preset (fails if name already taken)
export async function POST(req: NextRequest) {
  ensureDir();
  const body = await req.json();
  const { name, settings } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const safeName = name.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  if (!safeName) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });

  const filePath = path.join(PRESETS_DIR, `${safeName}.json`);

  if (fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'A preset with that name already exists. Use PUT to overwrite.' }, { status: 409 });
  }

  const preset = { name: safeName, createdAt: new Date().toISOString(), settings };
  fs.writeFileSync(filePath, JSON.stringify(preset, null, 2), 'utf-8');

  return NextResponse.json({ success: true, name: safeName });
}
