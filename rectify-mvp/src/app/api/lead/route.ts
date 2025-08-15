import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

type Lead = {
  id: string;
  name: string | null;
  email: string;
  message: string | null;
  createdAt: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const lead: Lead = {
      id: randomUUID(),
      name: name || null,
      email,
      message: message || null,
      createdAt: new Date().toISOString(),
    };

    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, 'leads.json');

    let leads: Lead[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        leads = parsed as Lead[];
      }
    } catch {
      leads = [];
    }

    leads.push(lead);
    await fs.writeFile(filePath, JSON.stringify(leads, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to store lead', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}